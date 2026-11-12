// Turns speech-engine tokens into speaker segments, English text and named speakers.
import { identify } from './names.js';

export const UNSURE_BELOW = 0.6; // word confidence under this is shown in orange

// Join sub-word tokens into words, keeping the lowest confidence of the pieces.
function toWords(toks) {
  const words = [];
  for (const t of toks) {
    const txt = t.text || '';
    if (!words.length || /^\s/.test(txt)) words.push({ text: txt.trim(), conf: t.confidence ?? 1 });
    else { const w = words[words.length - 1]; w.text += txt; w.conf = Math.min(w.conf, t.confidence ?? 1); }
  }
  return words.filter(w => w.text);
}

// Marks unclear words as {{id|word|}} so the app can colour them and let the user fix them.
function markWords(words, idPrefix) {
  let n = 0;
  return words.map(w => {
    if (w.conf >= UNSURE_BELOW || !/[\p{L}\p{N}]/u.test(w.text)) return w.text;
    const m = w.text.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
    return `${m[1]}{{${idPrefix}${n++}|${m[2].replace(/[{}|]/g, '')}|}}${m[3]}`;
  }).join(' ').replace(/\s+([.,!?;:،؟])/g, '$1');
}

// The app speaks a recording notice at the start of every Solo meeting. That voice is the phone,
// not a person, so it is removed: everything before announceEndMs (when the app says the notice
// finished), and as a backup anything in the first minute that matches the notice's wording.
export const ANNOUNCEMENT = 'This meeting will be recorded for digital records. Please go around the table and introduce yourselves.';
const norm = w => w.toLowerCase().replace(/[^a-z]/g, '');
export function dropAnnouncement(tokens, announceEndMs = 0) {
  let out = [], dropping = false;
  for (const t of tokens || []) {
    if (t.translation_status === 'translation') { if (!dropping) out.push(t); continue; }
    dropping = announceEndMs > 0 && (t.start_ms ?? 0) < announceEndMs;
    if (!dropping) out.push(t);
  }
  // Wording backup: group original tokens into words, find a run that reads like the notice.
  const A = ANNOUNCEMENT.split(/\s+/).map(norm).filter(Boolean), L = A.length;
  const words = [];
  out.forEach((t, i) => {
    if (t.translation_status === 'translation' || t.is_audio_event) return;
    const txt = t.text || '';
    if (!words.length || /^\s/.test(txt)) words.push({ text: txt, from: i, to: i, start: t.start_ms ?? 0 });
    else { const w = words[words.length - 1]; w.text += txt; w.to = i; }
  });
  for (let i = 0; i < words.length && words[i].start < 60000; i++) {
    let hit = 0, last = -1;
    for (let k = 0; k < L + 4 && i + k < words.length; k++) {
      const w = norm(words[i + k].text); if (!w) continue;
      if (A.slice(Math.max(0, k - 4), k + 5).includes(w)) { hit++; last = i + k; }
    }
    if (hit >= Math.ceil(L * 0.6)) {
      let to = words[last].to;
      while (to + 1 < out.length && !/[\p{L}\p{N}]/u.test(out[to + 1].text || '') && out[to + 1].translation_status !== 'translation') to++;
      out = out.filter((_, j) => j < words[i].from || j > to);
      break;
    }
  }
  return out;
}

export function buildResult(tokens, { introEndMs = 0, announceEndMs = 0, roster, departments, durationMs = 0 } = {}) {
  tokens = dropAnnouncement(tokens, announceEndMs);
  // 1. Split into segments: a new segment when the speaker changes,
  //    or when a translated sentence has finished and original speech resumes.
  const raw = [];
  let cur = null;
  for (const t of tokens || []) {
    if (t.is_audio_event) continue;
    if (t.translation_status === 'translation') { if (cur) { cur.en.push(t.text); cur.hasTr = true; } continue; }
    const sp = t.speaker != null ? String(t.speaker) : '1';
    if (!cur || cur.speaker !== sp || cur.hasTr) {
      cur = { speaker: sp, startMs: t.start_ms ?? 0, endMs: t.end_ms ?? 0, toks: [], en: [], langs: {}, hasTr: false };
      raw.push(cur);
    }
    cur.toks.push(t);
    cur.endMs = Math.max(cur.endMs, t.end_ms ?? 0);
    if (t.language) cur.langs[t.language] = (cur.langs[t.language] || 0) + 1;
  }

  // 2. Merge back-to-back pieces from the same speaker.
  const merged = [];
  for (const s of raw) {
    const last = merged[merged.length - 1];
    if (last && last.speaker === s.speaker && s.startMs - last.endMs < 2500) {
      last.parts.push(s); last.endMs = s.endMs;
    } else merged.push({ speaker: s.speaker, startMs: s.startMs, endMs: s.endMs, parts: [s] });
  }

  const segments = merged.map((m, i) => {
    const parts = m.parts.map(p => {
      const lang = Object.entries(p.langs).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';
      const words = toWords(p.toks);
      const origPlain = words.map(w => w.text).join(' ').replace(/\s+([.,!?;:،؟])/g, '$1');
      const en = p.en.join('').replace(/\s+/g, ' ').trim();
      // English speech: show the original with unclear words marked.
      // Other languages: show the engine's English translation, keep the original underneath.
      if (lang === 'en' || !en) return { text: markWords(words, `s${i}w${p.startMs}_`), orig: lang === 'en' ? '' : origPlain, lang, origPlain };
      return { text: en, orig: origPlain, lang, origPlain };
    });
    return {
      speaker: m.speaker, startMs: m.startMs, endMs: m.endMs,
      text: parts.map(p => p.text).join(' '),
      orig: parts.map(p => p.orig).filter(Boolean).join(' '),
      origPlain: parts.map(p => p.origPlain).join(' '),
      lang: parts[0]?.lang || 'en',
    };
  });

  // 3. Who is who, per voice the engine found.
  let speakers = describeSpeakers(segments, { introEndMs, roster, departments });

  // 4. The engine sometimes splits a tiny extra "voice" off a person (a word or two).
  //    Those fragments are given back to the person speaking next to them. Real speakers are all kept.
  const total = segments.reduce((a, s) => a + (s.endMs - s.startMs), 0);
  const kept = pickRealSpeakers(speakers, total, segments);
  if (kept.size < speakers.length) {
    for (let i = 0; i < segments.length; i++) {
      if (kept.has(segments[i].speaker)) continue;
      let j = i - 1; while (j >= 0 && !kept.has(segments[j].speaker)) j--;
      let k = i + 1; while (k < segments.length && !kept.has(segments[k].speaker)) k++;
      const gapPrev = j >= 0 ? segments[i].startMs - segments[j].endMs : Infinity;
      const gapNext = k < segments.length ? segments[k].startMs - segments[i].endMs : Infinity;
      segments[i].speaker = gapPrev <= gapNext ? segments[j].speaker : segments[k].speaker;
    }
    // join back-to-back turns of the same person
    const joined = [];
    for (const s of segments) {
      const last = joined[joined.length - 1];
      if (last && last.speaker === s.speaker) {
        last.text += ' ' + s.text; last.orig = [last.orig, s.orig].filter(Boolean).join(' ');
        last.origPlain += ' ' + s.origPlain; last.endMs = s.endMs;
      } else joined.push({ ...s });
    }
    segments.length = 0; segments.push(...joined);
    speakers = describeSpeakers(segments, { introEndMs, roster, departments });
  }

  // 5. Languages actually spoken (ignore a stray word or two).
  const words = {};
  for (const s of segments) words[s.lang] = (words[s.lang] || 0) + s.origPlain.split(/\s+/).filter(Boolean).length;
  const allWords = Object.values(words).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(words).filter(([, n]) => n / allWords >= 0.05 || n >= 25).sort((a, b) => b[1] - a[1]).map(([l]) => l);

  const lastEnd = segments.length ? segments[segments.length - 1].endMs : 0;
  return {
    durationMs: Math.max(durationMs || 0, lastEnd),
    languages,
    speakers,
    segments: segments.map(({ origPlain, ...s }) => s),
  };
}

// Each voice's introduction = what they said before "Introductions done"
// (or their first two turns if there was no marker, e.g. an uploaded file).
function describeSpeakers(segments, { introEndMs, roster, departments }) {
  const order = [];
  for (const s of segments) if (!order.includes(s.speaker)) order.push(s.speaker);
  return order.map((label, k) => {
    const mine = segments.filter(s => s.speaker === label);
    let intro = introEndMs > 0 ? mine.filter(s => s.startMs < introEndMs) : [];
    if (!intro.length) intro = mine.slice(0, 2);
    const heard = intro.map(s => s.origPlain).join(' ').slice(0, 220);
    const english = intro.map(s => s.text.replace(/\{\{\w+\|([^|}]*)\|[^}]*\}\}/g, '$1')).join(' ');
    let id = identify(heard, roster, departments);
    // The report is in English: for an Arabic introduction, read the name and title from the engine's English translation.
    if (id.how !== 'roster') { const id2 = identify(english, roster, departments); if (id2.how === 'roster' || (id2.how !== 'none' && (id.how === 'none' || /[؀-ۿ]/.test(id.name)))) id = id2; }
    const talkMs = mine.reduce((a, s) => a + (s.endMs - s.startMs), 0);
    return { label, index: k + 1, heard, talkMs, ...id };   // index = "Speaker N", numbered in order of first speaking
  });
}

// Which voices are real people. The engine is usually right about how many people spoke;
// it only sometimes splits off a tiny extra "voice" (a cough, a word or two). Those are merged back:
// a voice that never introduced itself and spoke under 2.5 s in total, in no more than 2 bits.
// Everyone else is kept, however many there are; the user can join two voices on the "Who spoke" screen.
function pickRealSpeakers(speakers, totalMs, segments) {
  const tinyMs = 2500;   // a cough, "yeah", "mm-hmm": anything longer is treated as a real person (join by hand if not)
  const turns = label => segments.filter(s => s.speaker === label).length;
  let keep = speakers.filter(s => s.how !== 'none' || s.talkMs >= tinyMs || turns(s.label) > 2);
  if (!keep.length) keep = [...speakers].sort((a, b) => b.talkMs - a.talkMs).slice(0, 1);
  return new Set(keep.map(s => s.label));
}
