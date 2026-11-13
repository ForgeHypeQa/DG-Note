// Stand-in for the Soniox API, for testing the app without a key or network.
// Whatever audio you send, it returns the same scripted 4-person meeting.
// Run: npm run mock   (then in another terminal: npm run dev:mock)
import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
const files = new Map(), trs = new Map();
const PORT = process.env.MOCK_PORT || 4010;

const LINES = [
  ['1', 'en', "Hi, I'm Sara Mendes, head nurse.", 1000],
  ['2', 'en', 'Josef Tomas.', 4000],
  ['3', 'ar', 'أنا خالد العطية، مدير المالية في وزارة الصحة.', 6500, "I'm Khalid Al-Attiyah, finance manager at the Ministry of Health."],
  ['4', 'en', 'Good morning, my name is Layla Hassan, legal counsel at Al Tamimi and Company.', 9500],
  ['1', 'en', 'Mr. Khalid in room 12 fell twice this week, both times at night.', 16000],
  ['2', 'en', "His gait is unsteady. I'd like to start a walker and physiotherapy twice a week.", 21000],
  ['3', 'ar', 'هو ياخذ أملوديبين عشرة ملغ، وممكن يسبب دوخة لما يوقف.', 27000, 'He takes amlodipine 10 mg, which can cause dizziness when he stands up.'],
  ['4', 'en', 'I will book the family meeting for Thursday at eleven.', 33000],
  ['1', 'en', 'We will move night checks to every two hours, starting tonight.', 38000],
  ['5', 'en', 'Sorry I am late. The pharmacy delivery comes on Sunday.', 41000],
];
const UNSURE = new Set(['Thursday']);

function tokens() {
  const out = [];
  for (const [speaker, language, text, start, en] of LINES) {
    const words = text.split(' ');
    words.forEach((w, i) => {
      const bare = w.replace(/[.,،]/g, '');
      // split long words into two sub-word tokens, like Soniox does
      const pieces = w.length > 7 ? [w.slice(0, 4), w.slice(4)] : [w];
      pieces.forEach((p, k) => out.push({ text: (i && !k ? ' ' : '') + p, start_ms: start + i * 350 + k * 150, end_ms: start + i * 350 + k * 150 + 300, confidence: UNSURE.has(bare) ? 0.41 : 0.96, speaker, language }));
    });
    if (en) out.push({ text: en, start_ms: start, end_ms: start + words.length * 350, confidence: 1, speaker, language: 'en', translation_status: 'translation' });
  }
  return out;
}

app.use((req, res, next) => (req.headers.authorization?.startsWith('Bearer ') || req.headers['x-api-key'] ? next() : res.status(401).json({ message: 'Missing API key' })));

// Stand-in for Claude: follows the report template in the instructions, 'translates' by prefixing,
// and turns an example report into a template.
function minutesFor(system, text) {
  const names = [...text.matchAll(/^- ([^(\n]+?)(?: \(|$)/gm)].map(m => m[1].trim());
  const n = i => names[i] || '';
  const secs = [...system.matchAll(/^s(\d+)\. "(.+?)" \((\w+)\)/gm)].map(m => ({ key: 's' + m[1], title: m[2], kind: m[3] }));
  console.log('[mock] report for', names.join(', '), '| template sections:', secs.map(x => x.title).join(' / '));
  const fill = {
    summary: ['Mr. Khalid in room 12 fell twice this week, both at night.', 'A walker and twice-weekly physiotherapy will start.', 'Night checks move to every two hours from tonight.'],
    discussion: [{ topic: 'Falls in room 12', notes: 'Two night-time falls this week; gait is unsteady.' }, { topic: 'Medication', notes: 'Amlodipine 10 mg may cause dizziness on standing.' }],
    decisions: ['Start a walker and physiotherapy twice a week.', 'Night checks every two hours from tonight.'],
    actions: [{ owner: n(1), task: 'Walker assessment', due: 'Tomorrow' }, { owner: n(3), task: 'Book the family meeting', due: 'Thursday' }, { owner: '', task: 'Update the medication chart', due: '' }],
    questions: [{ by: n(2), question: 'Could the dose be reduced further?' }],
    bullets: ['Family meeting: Thursday 11:00', 'Medication review: next Monday'],
    text: 'Next meeting: Monday 09:00, Room B.',
  };
  const sections = {}; for (const x of secs) sections[x.key] = fill[x.kind];
  return JSON.stringify({ title: 'Falls and Medication Review', sections });
}
app.post('/v1/messages', express.json({ limit: '20mb' }), (req, res) => {
  const sys = req.body.system || '', user = req.body.messages?.[0]?.content || '';
  const send = t => res.json({ content: [{ type: 'text', text: t }] });
  console.log('[mock] claude model', req.body.model);
  if (/You translate/.test(sys)) {
    const tl = (sys.match(/into ([^.\n]+)\./) || [])[1] || '';   // the language the app asked for
    const items = JSON.parse(user).items;
    return setTimeout(() => send(JSON.stringify({ items: items.map(t => t ? (/^Arabic/.test(tl) ? 'بالعربية: ' : '[' + tl + '] ') + t : '') })), Number(process.env.MOCK_DELAY || 0));   // MOCK_DELAY=ms to test slow translation
  }
  if (/You design meeting-report templates/.test(sys)) {
    console.log('[mock] template from', Array.isArray(user) ? 'pdf' : 'text');
    return send(JSON.stringify({ name: 'Ward round report', style: 'Short clinical notes.', sections: [
      { title: 'Overview', kind: 'summary', guide: 'Two lines.' }, { title: 'Patients', kind: 'discussion', guide: 'One per patient.' },
      { title: 'Plan', kind: 'decisions', guide: 'Agreed changes.' }, { title: 'Tasks', kind: 'actions', guide: 'Owner and time.' },
      { title: 'Next review', kind: 'text', guide: 'Date of next review.' }] }));
  }
  if (/Reply with JSON \{"ok":true\}/.test(sys)) return send('{"ok":true}');
  send(minutesFor(sys, typeof user === 'string' ? user : ''));
});

app.post('/v1/files', express.raw({ type: () => true, limit: '500mb' }), (req, res) => {
  const id = randomUUID(); files.set(id, req.body.length);
  console.log(`[mock] file ${id} ${req.body.length} bytes`);
  res.status(201).json({ id, filename: 'audio', size: req.body.length, created_at: new Date().toISOString() });
});
app.post('/v1/transcriptions', express.json(), (req, res) => {
  if (!files.has(req.body.file_id)) return res.status(400).json({ message: 'Unknown file_id' });
  const id = randomUUID(); trs.set(id, { at: Date.now(), body: req.body });
  console.log('[mock] transcription', id, JSON.stringify({ model: req.body.model, diar: req.body.enable_speaker_diarization, tr: req.body.translation, terms: req.body.context?.terms?.length }));
  res.status(201).json({ id, status: 'queued' });
});
app.get('/v1/transcriptions/:id', (req, res) => {
  const t = trs.get(req.params.id); if (!t) return res.status(404).json({ message: 'Not found' });
  const age = Date.now() - t.at;
  res.json({ id: req.params.id, status: age < 2500 ? 'queued' : age < 5000 ? 'processing' : 'completed', audio_duration_ms: 42000, model: t.body.model });
});
app.get('/v1/transcriptions/:id/transcript', (req, res) => {
  const tk = tokens(); res.json({ id: req.params.id, text: tk.map(t => t.text).join(''), tokens: tk });
});
app.delete('/v1/transcriptions/:id', (req, res) => { trs.delete(req.params.id); console.log('[mock] deleted transcription'); res.status(204).end(); });
app.delete('/v1/files/:id', (req, res) => { files.delete(req.params.id); console.log('[mock] deleted file'); res.status(204).end(); });

app.post('/v1/auth/temporary-api-key', express.json(), (req, res) => res.status(201).json({ api_key: 'snx_temp_mock', expires_at: new Date(Date.now() + 60000).toISOString() }));
const srv = app.listen(PORT, () => console.log(`Mock Soniox on http://localhost:${PORT}/v1`));
// Stand-in for the real-time stream: after the config message it sends the scripted words a few at a
// time, first as provisional and then as final; an empty text frame ends the stream.
const { WebSocketServer } = await import('ws');
new WebSocketServer({ server: srv, path: '/rt', handleProtocols: p => (p.has('soniox-api-key') ? 'soniox-api-key' : false) }).on('connection', ws => {
  const all = tokens(); let i = 0, started = false, bytes = 0, iv;
  const step = n => { const fin = all.slice(i, i + n).map(t => ({ ...t, is_final: true })); i += fin.length;
    const pend = all.slice(i, i + 3).filter(t => t.translation_status !== 'translation').map(t => ({ ...t, is_final: false }));
    if (ws.readyState === 1) ws.send(JSON.stringify({ tokens: [...fin, ...pend], final_audio_proc_ms: fin.at(-1)?.end_ms || 0, total_audio_proc_ms: 0 })); };
  ws.on('message', (data, isBinary) => {
    if (isBinary) { bytes += data.length; return; }
    const txt = data.toString();
    if (!started) { started = true; console.log('[mock rt] config', JSON.parse(txt).model); iv = setInterval(() => { if (bytes > 0 && i < all.length) step(8); }, 300); return; }
    if (txt === '') { clearInterval(iv); step(all.length); ws.send(JSON.stringify({ tokens: [], finished: true })); ws.close(); console.log('[mock rt] finished, audio bytes', bytes); }
  });
  ws.on('close', () => clearInterval(iv));
});
