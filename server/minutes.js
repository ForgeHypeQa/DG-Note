// Writes meeting minutes from a checked transcript (summary, topics, decisions,
// action items, open questions). Uses Anthropic's Messages API; shown to users
// only as "ForgeHype Meet". Set ANTHROPIC_API_KEY (and optionally REPORT_MODEL).
const URL_ = (process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com').replace(/\/$/, '') + '/v1/messages';
export const MODEL = process.env.REPORT_MODEL || 'claude-sonnet-5-5';
export const configured = () => !!process.env.ANTHROPIC_API_KEY;

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

function parseJSON(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('report: no JSON in reply');
  return JSON.parse(text.slice(a, b + 1));
}
const arr = (x, f) => Array.isArray(x) ? x.map(f).filter(Boolean) : [];
const str = x => (typeof x === 'string' ? x.trim() : '');

export async function writeMinutes(meeting) {
  const body = {
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    messages: [{ role: 'user', content: transcriptText(meeting) }],
  };
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`report engine ${res.status}: ${j?.error?.message || res.statusText}`), { status: res.status });
  const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  const out = parseJSON(text);
  return {
    title: str(out.title),
    summary: arr(out.summary, str),
    topics: arr(out.topics, t => str(t?.topic) && { topic: str(t.topic), notes: str(t.notes) }),
    decisions: arr(out.decisions, str),
    actions: arr(out.actions, a => str(a?.task) && { owner: str(a.owner), task: str(a.task), due: str(a.due) }),
    questions: arr(out.questions, q => str(q?.question) && { by: str(q.by), question: str(q.question) }),
  };
}
