// DG-Note server. No database: audio is held in memory only while it is sent
// to Soniox, and the file and transcription are deleted from Soniox once the
// transcript has been fetched. Results are kept in memory for one hour.
import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as soniox from './soniox.js';
import { buildResult } from './build.js';
import { ROSTER, DEPARTMENTS, DOMAIN_TERMS } from './roster.js';

const app = express();
const PORT = process.env.PORT || 3000;
const KEEP_MS = 60 * 60 * 1000;
const MAX_WAIT_MS = 45 * 60 * 1000;
const jobs = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

app.use(express.static(publicDir));

app.get('/api/health', (req, res) => res.json({ ok: true, soniox: soniox.configured(), model: soniox.MODEL }));
app.get('/api/roster', (req, res) => res.json({ people: ROSTER, departments: Object.keys(DEPARTMENTS) }));

// Body = the raw audio file. Query: title, introEndMs, durationMs.
app.post('/api/solo/jobs', express.raw({ type: () => true, limit: '500mb' }), (req, res) => {
  if (!soniox.configured()) return res.status(503).json({ error: 'The server has no SONIOX_API_KEY. Add it to .env and restart.' });
  const buf = req.body;
  if (!buf || !buf.length) return res.status(400).json({ error: 'No audio received.' });
  const mime = (req.headers['content-type'] || 'audio/webm').split(';')[0];
  const ext = { 'audio/webm': 'webm', 'video/webm': 'webm', 'audio/mp4': 'm4a', 'video/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/x-m4a': 'm4a' }[mime] || 'webm';
  const job = {
    id: randomUUID(), status: 'working', step: 'upload', createdAt: Date.now(),
    title: String(req.query.title || '').slice(0, 120),
    introEndMs: Math.max(0, +req.query.introEndMs || 0),
    durationMs: Math.max(0, +req.query.durationMs || 0),
    bytes: buf.length,
  };
  jobs.set(job.id, job);
  run(job, buf, mime, `dg-note-${job.id}.${ext}`);
  res.status(202).json({ id: job.id, status: job.status, step: job.step });
});

app.get('/api/solo/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'This job has expired or the server restarted. Send the recording again.' });
  const { id, status, step, error, result, title } = job;
  res.json({ id, status, step, error, title, result });
});

async function run(job, buf, mime, filename) {
  let fileId, trId;
  try {
    const file = await soniox.uploadFile(buf, filename, mime);
    fileId = file.id;
    buf = null; // let the audio go from memory
    job.step = 'queued';
    const tr = await soniox.createTranscription({
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
      const st = await soniox.getTranscription(trId);
      job.step = st.status; // queued | processing | completed | error
      if (st.status === 'completed') { job.durationMs ||= st.audio_duration_ms || 0; break; }
      if (st.status === 'error') throw new Error(st.error_message || 'Soniox could not transcribe this recording.');
      if (Date.now() - started > MAX_WAIT_MS) throw new Error('Transcription took too long. Try again.');
    }
    job.step = 'naming';
    const transcript = await soniox.getTranscript(trId);
    job.result = buildResult(transcript.tokens, { introEndMs: job.introEndMs, durationMs: job.durationMs, roster: ROSTER, departments: DEPARTMENTS });
    job.status = 'done'; job.step = 'done';
  } catch (e) {
    console.error(`[job ${job.id}]`, e.message);
    job.status = 'error'; job.error = e.message;
  } finally {
    if (trId) soniox.deleteTranscription(trId).catch(e => console.warn('delete transcription:', e.message));
    if (fileId) soniox.deleteFile(fileId).catch(e => console.warn('delete file:', e.message));
    setTimeout(() => jobs.delete(job.id), KEEP_MS).unref();
  }
}

app.listen(PORT, () => {
  console.log(`DG-Note running on http://localhost:${PORT}`);
  if (!soniox.configured()) console.warn('SONIOX_API_KEY is not set. Copy .env.example to .env and add your key.');
});
