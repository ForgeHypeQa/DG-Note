// DG-Note server (ForgeHype Meet engine). No database: audio is held in memory only while it is sent
// to the speech engine, and the file and transcription are deleted from the engine once the
// transcript has been fetched. Results are kept in memory for one hour.
import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as engine from './engine.js';
import { buildResult } from './build.js';
import { ROSTER, DEPARTMENTS, DOMAIN_TERMS } from './roster.js';
import * as auth from './auth.js';
import { splitParts, joinParts } from './audio.js';
import * as minutes from './minutes.js';
import * as llm from './llm.js';
import { BUILT_IN } from './templates.js';

const app = express();
const PORT = process.env.PORT || 3000;
const KEEP_MS = 60 * 60 * 1000;
const MAX_WAIT_MS = 45 * 60 * 1000;
const jobs = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

app.set('trust proxy', 1); // Render runs behind a proxy: needed for secure cookies and real client addresses
app.use(express.static(publicDir));
auth.mount(app, express);

app.get('/api/health', (req, res) => res.json({ ok: true, engine: engine.configured(), reports: minutes.configured() }));
app.get('/api/roster', auth.requireUser, (req, res) => res.json({ people: ROSTER, departments: Object.keys(DEPARTMENTS) }));

// Body = the raw audio file (or several parts back to back, with header
// X-Parts: "size1,size2,..."). Query: title, introEndMs, announceEndMs, durationMs.
app.post('/api/solo/jobs', auth.requireUser, express.raw({ type: () => true, limit: '500mb' }), (req, res) => {
  if (!engine.configured()) return res.status(503).json({ error: 'Transcription is not switched on for this server yet. Ask the admin.' });
  const buf = req.body;
  if (!buf || !buf.length) return res.status(400).json({ error: 'No audio received.' });
  const mime = (req.headers['content-type'] || 'audio/webm').split(';')[0];
  const ext = { 'audio/webm': 'webm', 'video/webm': 'webm', 'audio/mp4': 'm4a', 'video/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/x-m4a': 'm4a' }[mime] || 'webm';
  const job = {
    id: randomUUID(), status: 'working', step: 'upload', createdAt: Date.now(),
    title: String(req.query.title || '').slice(0, 120),
    introEndMs: Math.max(0, +req.query.introEndMs || 0),
    announceEndMs: Math.min(60000, Math.max(0, +req.query.announceEndMs || 0)),
    durationMs: Math.max(0, +req.query.durationMs || 0),
    bytes: buf.length,
  };
  let parts;
  try { parts = req.headers['x-parts'] ? splitParts(buf, String(req.headers['x-parts']).split(',').map(Number)) : [buf]; }
  catch (e) { return res.status(400).json({ error: e.message }); }
  job.parts = parts.length;
  jobs.set(job.id, job);
  run(job, parts, mime, ext);
  res.status(202).json({ id: job.id, status: job.status, step: job.step });
});

app.get('/api/solo/jobs/:id', auth.requireUser, (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'This job has expired or the server restarted. Send the recording again.' });
  const { id, status, step, error, result, title } = job;
  res.json({ id, status, step, error, title, result });
});

async function run(job, parts, mime, ext) {
  let fileId, trId;
  try {
    if (parts.length > 1) job.step = 'joining';
    const joined = await joinParts(parts, ext);
    parts = null;
    let buf = joined.buffer;
    if (joined.joined) { mime = joined.mime; ext = joined.ext; job.step = 'upload'; }
    const file = await engine.uploadFile(buf, `dg-note-${job.id}.${ext}`, mime);
    fileId = file.id;
    buf = null; // let the audio go from memory
    job.step = 'queued';
    const tr = await engine.createTranscription({
      file_id: fileId,
      language_hints: ['en', 'ar'],
      enable_speaker_diarization: true,
      enable_language_identification: true,
      translation: { type: 'one_way', target_language: 'en' },
      context: {
        general: [
          { key: 'domain', value: 'Healthcare' },
          { key: 'topic', value: 'Elderly care team meeting' },
          { key: 'setting', value: 'In-person meeting, one phone on the table, each person introduces themselves first' },
        ],
        terms: [...ROSTER.flatMap(p => [p.name, p.ar].filter(Boolean)), ...Object.keys(DEPARTMENTS), ...DOMAIN_TERMS],
      },
      client_reference_id: job.id,
    });
    trId = tr.id;
    const started = Date.now();
    for (;;) {
      await sleep(2000);
      const st = await engine.getTranscription(trId);
      job.step = st.status; // queued | processing | completed | error
      if (st.status === 'completed') { job.durationMs ||= st.audio_duration_ms || 0; break; }
      if (st.status === 'error') throw Object.assign(new Error(st.error_message || 'transcription error'), { userMessage: 'This recording could not be transcribed. Check that it has speech, then try again.' });
      if (Date.now() - started > MAX_WAIT_MS) throw new Error('Transcription took too long. Try again.');
    }
    job.step = 'naming';
    const transcript = await engine.getTranscript(trId);
    job.result = buildResult(transcript.tokens, { introEndMs: job.introEndMs, announceEndMs: job.announceEndMs, durationMs: job.durationMs, roster: ROSTER, departments: DEPARTMENTS });
    job.status = 'done'; job.step = 'done';
  } catch (e) {
    console.error(`[job ${job.id}]`, e.message);   // full detail stays in the server log only
    job.status = 'error'; job.error = friendly(e);
  } finally {
    if (trId) engine.deleteTranscription(trId).catch(e => console.warn('delete transcription:', e.message));
    if (fileId) engine.deleteFile(fileId).catch(e => console.warn('delete file:', e.message));
    setTimeout(() => jobs.delete(job.id), KEEP_MS).unref();
  }
}

// Live text for Listen: the app sends the last few seconds as a small stand-alone clip and gets its
// text back (as spoken, and in English). Nothing is kept. The full recording is still transcribed at the end.
const liveBusy = new Map();
app.post('/api/live/chunk', auth.requireUser, express.raw({ type: () => true, limit: '2mb' }), async (req, res) => {
  if (!engine.configured()) return res.status(503).json({ error: 'Transcription is not switched on for this server yet.' });
  const buf = req.body; if (!buf || !buf.length) return res.status(400).json({ error: 'No audio received.' });
  const uid = req.user.id, n = liveBusy.get(uid) || 0;
  if (n >= 4) return res.status(429).json({ error: 'Live text is catching up.' });
  liveBusy.set(uid, n + 1);
  const mime = (req.headers['content-type'] || 'audio/webm').split(';')[0], ext = /mp4/.test(mime) ? 'm4a' : /ogg/.test(mime) ? 'ogg' : 'webm';
  let fileId, trId;
  try {
    fileId = (await engine.uploadFile(buf, `dg-live-${randomUUID()}.${ext}`, mime)).id;
    trId = (await engine.createTranscription({ file_id: fileId, language_hints: ['en', 'ar'], enable_speaker_diarization: true, enable_language_identification: true, translation: { type: 'one_way', target_language: 'en' } })).id;
    const started = Date.now();
    for (;;) {
      await sleep(700);
      const st = await engine.getTranscription(trId);
      if (st.status === 'completed') break;
      if (st.status === 'error') throw new Error(st.error_message || 'transcription error');
      if (Date.now() - started > 45000) throw new Error('timeout');
    }
    const r = buildResult((await engine.getTranscript(trId)).tokens, { roster: ROSTER, departments: DEPARTMENTS });
    const strip = t => String(t || '').replace(/\{\{[^|]*\|([^|]*)\|\}\}/g, '$1');
    res.json({ text: r.segments.map(g => g.orig || strip(g.text)).join(' ').trim(), en: r.segments.map(g => strip(g.text)).join(' ').trim(), voices: new Set(r.segments.map(g => g.speaker)).size, languages: r.languages || [] });
  } catch (e) { console.warn('[live]', e.message); res.status(502).json({ error: 'This part could not be transcribed.' }); }
  finally {
    liveBusy.set(uid, Math.max(0, (liveBusy.get(uid) || 1) - 1));
    if (trId) engine.deleteTranscription(trId).catch(() => {});
    if (fileId) engine.deleteFile(fileId).catch(() => {});
  }
});

// Meeting minutes from a checked transcript. Body: { title, date, languages, people[], segments[{who,t,text}] }.
// Nothing is stored: the transcript is sent, the minutes come back.
app.post('/api/report', auth.requireUser, express.json({ limit: '3mb' }), async (req, res) => {
  if (!minutes.configured()) return res.status(503).json({ error: 'Meeting reports are not switched on for this server yet. Ask the admin.' });
  const m = req.body || {};
  if (!Array.isArray(m.segments) || !m.segments.length) return res.status(400).json({ error: 'There is no transcript to write a report from.' });
  try { res.json(await minutes.writeMinutes(m, m.template)); }
  catch (e) { console.error('[report]', e.message); res.status(502).json({ error: textError(e, 'The report could not be written. Try again.', req.user) }); }
});

// Report templates: the built-in ones (custom templates are kept on each phone for now).
app.get('/api/templates', auth.requireUser, (req, res) => res.json({ templates: BUILT_IN }));

// Make a template from an example report. Body: { text } or { pdf: base64 }. Nothing is stored.
app.post('/api/templates/from-example', auth.requireUser, express.json({ limit: '15mb' }), async (req, res) => {
  if (!minutes.configured()) return res.status(503).json({ error: 'Meeting reports are not switched on for this server yet. Ask the admin.' });
  const { text, pdf } = req.body || {};
  if (!text && !pdf) return res.status(400).json({ error: 'Paste an example report or choose a PDF.' });
  try { res.json(await minutes.templateFromExample({ text, pdfBase64: pdf })); }
  catch (e) { console.error('[template]', e.message); res.status(502).json({ error: textError(e, 'The template could not be made from this example. Try again.', req.user) }); }
});

// Translation of a report and transcript. Body: { target: 'ar'|'en', items: [string] }
app.post('/api/translate', auth.requireUser, express.json({ limit: '3mb' }), async (req, res) => {
  if (!minutes.configured()) return res.status(503).json({ error: 'Translation is not switched on for this server yet. Ask the admin.' });
  const { target, items } = req.body || {};
  if (!['ar', 'en'].includes(target) || !Array.isArray(items)) return res.status(400).json({ error: 'Nothing to translate.' });
  try { res.json({ items: await minutes.translate(items.slice(0, 3000), target) }); }
  catch (e) { console.error('[translate]', e.message); res.status(502).json({ error: textError(e, 'The translation could not be made. Try again.', req.user) }); }
});
function textError(e, fallback, user) {
  const st = Number(e.status), m = String(e.message || '');
  const msg = /credit balance|billing|insufficient/i.test(m) ? 'The Claude account has no credit for this key. Ask the admin.'
    : st === 401 || st === 403 ? 'Reports and translation are not set up correctly on the server. Ask the admin.'
    : st === 402 ? 'The Claude account has no credit for this key. Ask the admin.'
    : st === 429 || st === 529 ? 'The report writer is busy. Try again in a minute.' : fallback;
  // The admin also sees the exact reason, so problems can be fixed without opening the server logs.
  return user?.role === 'admin' ? `${msg} Details for admin: ${m.slice(0, 300)}` : msg;
}

// Admin: one tiny test call to each Claude model, to check the key, credit and model names.
app.get('/api/admin/claude-check', auth.requireAdmin, async (req, res) => {
  const out = { keySet: minutes.configured(), checks: [] };
  for (const kind of ['report', 'translate']) {
    const model = llm.model(kind);
    try { await llm.askJSON('Reply with JSON {"ok":true} only.', 'ping', 20, kind); out.checks.push({ kind, model, ok: true }); }
    catch (e) { out.checks.push({ kind, model, ok: false, status: e.status || null, error: String(e.message).slice(0, 300) }); }
  }
  res.json(out);
});

// What the user sees when something goes wrong: no engine names, no technical detail.
function friendly(e) {
  if (e.userMessage) return e.userMessage;
  if (e.status === 401 || e.status === 403) return 'Transcription is not set up correctly on the server. Ask the admin. Your recording is safe on this phone.';
  if (e.status === 402 || /balance|credit|budget|payment/i.test(e.message)) return 'The transcription account has reached its limit. Ask the admin. Your recording is safe on this phone.';
  if (e.status === 429) return 'Transcription is busy right now. Try again in a minute. Your recording is safe on this phone.';
  if (/too long|duration/i.test(e.message)) return 'This recording is too long to transcribe in one go (60 minutes maximum for now).';
  if (/join/i.test(e.message)) return e.message;
  return 'Transcription failed. Your recording is safe on this phone. Try again.';
}

app.listen(PORT, () => {
  console.log(`DG-Note running on http://localhost:${PORT}`);
  if (!engine.configured()) console.warn('SONIOX_API_KEY is not set. Copy .env.example to .env and add your key.');
});
