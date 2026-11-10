// Stand-in for the Soniox API, for testing the app without a key or network.
// Whatever audio you send, it returns the same scripted 4-person meeting.
// Run: npm run mock   (then in another terminal: npm run dev:mock)
import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
const files = new Map(), trs = new Map();
const PORT = process.env.MOCK_PORT || 4010;

const LINES = [
  ['1', 'en', "Hi, I'm Sara Mendes from Nursing.", 1000],
  ['2', 'en', 'Josef Tomas, physio.', 4000],
  ['3', 'ar', 'أنا نورة السليطي من الصيدلة.', 6500, "I'm Noura Al-Sulaiti from pharmacy."],
  ['4', 'en', 'And I am Layla Hassan from administration.', 9500],
  ['1', 'en', 'Mr. Khalid in room 12 fell twice this week, both times at night.', 16000],
  ['2', 'en', "His gait is unsteady. I'd like to start a walker and physiotherapy twice a week.", 21000],
  ['3', 'ar', 'هو ياخذ أملوديبين عشرة ملغ، وممكن يسبب دوخة لما يوقف.', 27000, 'He takes amlodipine 10 mg, which can cause dizziness when he stands up.'],
  ['4', 'en', 'I will book the family meeting for Thursday at eleven.', 33000],
  ['1', 'en', 'We will move night checks to every two hours, starting tonight.', 38000],
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

app.use((req, res, next) => (req.headers.authorization?.startsWith('Bearer ') ? next() : res.status(401).json({ message: 'Missing API key' })));

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

app.listen(PORT, () => console.log(`Mock Soniox on http://localhost:${PORT}/v1`));
