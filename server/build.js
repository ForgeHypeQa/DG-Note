// Turns Soniox tokens into speaker segments, English text and named speakers.
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

export function buildResult(tokens, { introEndMs = 0, roster, departments, durationMs = 0 } = {}) {
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
      // Other languages: show Soniox's English translation, keep the original underneath.
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

  // 3. Each speaker's introduction = what they said before "Introductions done"
  //    (or their first two turns if there was no marker, e.g. an uploaded file).
  const order = [];
  for (const s of segments) if (!order.includes(s.speaker)) order.push(s.speaker);
  const speakers = order.map((label, k) => {
    const mine = segments.filter(s => s.speaker === label);
    let intro = introEndMs > 0 ? mine.filter(s => s.startMs < introEndMs) : [];
    if (!intro.length) intro = mine.slice(0, 2);
    const heard = intro.map(s => s.origPlain).join(' ').slice(0, 220);
    const english = intro.map(s => s.text.replace(/\{\{\w+\|([^|}]*)\|[^}]*\}\}/g, '$1')).join(' ');
    let id = identify(heard, roster, departments);
    // The report is in English: for an Arabic introduction, read the name and title from Soniox's English translation.
    if (id.how !== 'roster') { const id2 = identify(english, roster, departments); if (id2.how === 'roster' || (id2.how !== 'none' && (id.how === 'none' || /[\u0600-\u06FF]/.test(id.name)))) id = id2; }
    const talkMs = mine.reduce((a, s) => a + (s.endMs - s.startMs), 0);
    return { label, index: k + 1, heard, talkMs, ...id };
  });

  const languages = [...new Set(segments.map(s => s.lang))];
  const lastEnd = segments.length ? segments[segments.length - 1].endMs : 0;
  return {
    durationMs: Math.max(durationMs || 0, lastEnd),
    languages,
    speakers,
    segments: segments.map(({ origPlain, ...s }) => s),
  };
}
