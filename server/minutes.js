// Writes meeting minutes from a checked transcript (summary, topics, decisions,
// action items, open questions), and translates reports and transcripts.
// Claude (see llm.js). Shown to users only as "ForgeHype Meet".
import * as llm from './llm.js';
export const configured = llm.configured;
import { clean, KINDS } from './templates.js';

const RULES = `You are the minute-taker for ForgeHype Meet. You turn a meeting transcript into clear, professional meeting minutes in English.
Rules:
- Use only what is in the transcript. Never invent facts, names, numbers, dates or decisions.
- Write in plain, short English sentences. No filler, no opinions.
- Names: use the attendee names exactly as given. "Speaker N" is a real person whose name is unknown; keep that label.
- Decisions: only things the group actually agreed or decided.
- Action items: concrete tasks someone will do. Owner must be one attendee name exactly as listed, or "" if nobody was named. Due: the deadline as said ("Today", "Thursday", "next week"), or "".
- Open questions: questions raised and not answered in the meeting.
- If the transcript has no real content for a section, return an empty list (or "" for a paragraph).
- Translate anything not in English into English.
- Follow the report template below exactly: its sections, their order and each section's instruction.`;

const SHAPE = {
  summary: '[string, ...]', decisions: '[string, ...]', bullets: '[string, ...]', text: 'string',
  discussion: '[{"topic": string, "notes": string}, ...]',
  actions: '[{"owner": string, "task": string, "due": string}, ...]',
  questions: '[{"by": string, "question": string}, ...]',
};

function systemFor(t) {
  const secs = t.sections.map((x, i) => `s${i + 1}. "${x.title}" (${x.kind})${x.guide ? ': ' + x.guide : ''}`).join('\n');
  const shape = t.sections.map((x, i) => `  "s${i + 1}": ${SHAPE[x.kind]}`).join(',\n');
  return `${RULES}

REPORT TEMPLATE: ${t.name}
Sections, in order:
${secs}
${t.style ? `\nStyle: ${t.style}\n` : ''}${t.example ? `\nREFERENCE REPORT. Copy its structure, wording style and level of detail. Never copy its facts, names or numbers:\n"""\n${t.example}\n"""\n` : ''}
Return ONLY a JSON object, no other text:
{"title": string (a short, specific meeting title, max 8 words),
 "sections": {
${shape}
 }}`;
}

function transcriptText(m) {
  const who = m.people.map(p => `- ${p.name}${[p.role, p.dept, p.org].filter(Boolean).length ? ' (' + [p.role, p.dept, p.org].filter(Boolean).join(', ') + ')' : ''}`).join('\n');
  const lines = m.segments.map(s => `[${s.t}] ${s.who}: ${s.text}`).join('\n');
  return `Meeting title: ${m.title || '(none given)'}\nDate: ${m.date || ''}\nLanguages spoken: ${(m.languages || []).join(', ') || 'English'}\nAttendees:\n${who}\n\nTranscript:\n${lines}`;
}

const arr = (x, f) => Array.isArray(x) ? x.map(f).filter(Boolean) : [];
const str = x => (typeof x === 'string' ? x.trim() : '');
const PARSE = {
  summary: x => arr(x, str), decisions: x => arr(x, str), bullets: x => arr(x, str), text: x => str(x),
  discussion: x => arr(x, t => str(t?.topic) && { topic: str(t.topic), notes: str(t.notes) }),
  actions: x => arr(x, a => str(a?.task) && { owner: str(a.owner), task: str(a.task), due: str(a.due) }),
  questions: x => arr(x, q => str(q?.question) && { by: str(q.by), question: str(q.question) }),
};
// The first section of each main kind fills the report's standard parts (so owners, editing and
// sending keep working); every other section is an extra section. `layout` keeps the template order.
const FIELD = { summary: 'summary', discussion: 'topics', decisions: 'decisions', actions: 'actions', questions: 'questions' };

export async function writeMinutes(meeting, template) {
  const t = clean(template);
  const out = await llm.askJSON(systemFor(t), transcriptText(meeting), 6000, 'report');
  const secs = out.sections || {};
  const res = { title: str(out.title), summary: [], topics: [], decisions: [], actions: [], questions: [], extra: [], layout: [], template: { id: t.id, name: t.name } };
  const used = new Set();
  t.sections.forEach((x, i) => {
    const key = `s${i + 1}`, val = PARSE[x.kind](secs[key]);
    const field = FIELD[x.kind];
    if (field && !used.has(field)) { used.add(field); res[field] = val; res.layout.push({ key, title: x.title, kind: x.kind, field }); }
    else { res.extra.push({ key, title: x.title, kind: x.kind, items: Array.isArray(val) ? val : [], text: typeof val === 'string' ? val : '' }); res.layout.push({ key, title: x.title, kind: x.kind, field: 'extra' }); }
  });
  return res;
}

/* ---------- a template from an example report ---------- */
const FROM_EXAMPLE = `You design meeting-report templates for ForgeHype Meet.
You receive an example meeting report. Describe its structure as a reusable template: the sections in order,
what kind each section is, and a one-sentence instruction for writing it. Also describe its writing style in one or two sentences.
Section kinds: ${KINDS.join(', ')}.
- summary: short bullet overview at the top; discussion: topics with notes; decisions: what was agreed;
  actions: tasks with owner and due date; questions: open questions; bullets: any other list; text: a short paragraph.
- Use the example's own section headings (in English) as titles. Leave out the attendance list, dates and signatures: the app adds those itself.
Return ONLY JSON: {"name": string (max 5 words), "sections": [{"title": string, "kind": string, "guide": string}, ...], "style": string}`;

export async function templateFromExample({ text, pdfBase64 }) {
  const content = pdfBase64
    ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } }, { type: 'text', text: 'Turn this example report into a template.' }]
    : `Example report:\n"""\n${String(text || '').slice(0, 20000)}\n"""`;
  const out = await llm.askJSON(FROM_EXAMPLE, content, 3000, 'report');
  const t = clean({ name: out.name, sections: out.sections, style: out.style });
  return { name: t.name, sections: t.sections, style: t.style };
}

/* ---------- translation ---------- */
export const LANGS = { ar: 'Arabic (Modern Standard Arabic, professional tone)', en: 'English', bn: 'Bangla (Bengali)', fil: 'Filipino (Tagalog)', id: 'Indonesian (Bahasa Indonesia)', ms: 'Malay (Bahasa Melayu)',
  hi: 'Hindi', ur: 'Urdu', ta: 'Tamil', ml: 'Malayalam', ne: 'Nepali', si: 'Sinhala', it: 'Italian', fr: 'French', es: 'Spanish', de: 'German', nl: 'Dutch',
  zh: 'Chinese (Simplified)', ja: 'Japanese', ko: 'Korean', th: 'Thai' };
const T_SYSTEM = target => `You translate meeting minutes and meeting transcripts into ${LANGS[target] || target}.
Every item you return must be written in ${LANGS[target] || target} and in no other language, whatever language the item arrives in. Use that language's own script.
Rules: translate every item faithfully; do not add, drop, merge or explain anything; keep people's names, numbers, dates, medicine names and doses exactly; keep it natural and professional.
You receive JSON {"items":[...]} and must return ONLY JSON {"items":[...]} with exactly the same number of items, in the same order.`;

// Translates a list of short texts. Big lists are split into batches and sent in parallel.
export async function translate(items, target) {
  const batches = []; let cur = [], size = 0;
  for (const t of items) { const n = String(t || '').length; if (cur.length && (size + n > 5000 || cur.length >= 60)) { batches.push(cur); cur = []; size = 0; } cur.push(String(t || '')); size += n; }
  if (cur.length) batches.push(cur);
  const run = async b => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const out = await llm.askJSON(T_SYSTEM(target), JSON.stringify({ items: b }), 8000, 'translate');
      if (Array.isArray(out.items) && out.items.length === b.length) return out.items.map(x => String(x ?? ''));
    }
    throw new Error('translation: wrong number of items');
  };
  const results = [];
  for (let i = 0; i < batches.length; i += 4) results.push(...await Promise.all(batches.slice(i, i + 4).map(b => b.every(x => !x.trim()) ? b : run(b))));
  return results.flat();
}
