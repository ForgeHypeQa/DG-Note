// Writes meeting minutes from a checked transcript (summary, topics, decisions,
// action items, open questions), and translates reports and transcripts.
// Claude (see llm.js). Shown to users only as "ForgeHype Meet".
import * as llm from './llm.js';
export const configured = llm.configured;
const SYSTEM = `You are the minute-taker for ForgeHype Meet. You turn a meeting transcript into clear, professional meeting minutes in English.
Rules:
- Use only what is in the transcript. Never invent facts, names, numbers, dates or decisions.
- Write in plain, short English sentences. No filler, no opinions.
- Names: use the attendee names exactly as given. "Speaker N" is a real person whose name is unknown; keep that label.
- Decisions: only things the group actually agreed or decided.
- Action items: concrete tasks someone will do. Owner must be one attendee name exactly as listed, or "" if nobody was named. Due: the deadline as said ("Today", "Thursday", "next week"), or "".
- Open questions: questions raised and not answered in the meeting.
- If the transcript is too short or has no real content for a section, return an empty list for it.
- Translate anything not in English into English.
Return ONLY a JSON object, no other text, with exactly these keys:
{"title": string (a short, specific meeting title, max 8 words),
 "summary": [string, ...] (3 to 5 bullet points, the meeting "in 30 seconds"),
 "topics": [{"topic": string, "notes": string}, ...] (what was discussed, in order, each notes 1-3 sentences),
 "decisions": [string, ...],
 "actions": [{"owner": string, "task": string, "due": string}, ...],
 "questions": [{"by": string, "question": string}, ...]}`;

function transcriptText(m) {
  const who = m.people.map(p => `- ${p.name}${[p.role, p.dept, p.org].filter(Boolean).length ? ' (' + [p.role, p.dept, p.org].filter(Boolean).join(', ') + ')' : ''}`).join('\n');
  const lines = m.segments.map(s => `[${s.t}] ${s.who}: ${s.text}`).join('\n');
  return `Meeting title: ${m.title || '(none given)'}\nDate: ${m.date || ''}\nLanguages spoken: ${(m.languages || []).join(', ') || 'English'}\nAttendees:\n${who}\n\nTranscript:\n${lines}`;
}

const arr = (x, f) => Array.isArray(x) ? x.map(f).filter(Boolean) : [];
const str = x => (typeof x === 'string' ? x.trim() : '');

export async function writeMinutes(meeting) {
  const out = await llm.askJSON(SYSTEM, transcriptText(meeting), 4000, 'report');
  return {
    title: str(out.title),
    summary: arr(out.summary, str),
    topics: arr(out.topics, t => str(t?.topic) && { topic: str(t.topic), notes: str(t.notes) }),
    decisions: arr(out.decisions, str),
    actions: arr(out.actions, a => str(a?.task) && { owner: str(a.owner), task: str(a.task), due: str(a.due) }),
    questions: arr(out.questions, q => str(q?.question) && { by: str(q.by), question: str(q.question) }),
  };
}

/* ---------- translation ---------- */
const LANGS = { ar: 'Arabic (Modern Standard Arabic, professional tone)', en: 'English' };
const T_SYSTEM = target => `You translate meeting minutes and meeting transcripts into ${LANGS[target] || target}.
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
