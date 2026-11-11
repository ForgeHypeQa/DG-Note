// Text AI for meeting reports and translation: Claude (Anthropic) only.
//   ANTHROPIC_API_KEY  required
//   REPORT_MODEL       writes the report      (default claude-sonnet-5-5)
//   TRANSLATE_MODEL    Arabic translation      (default claude-haiku-5-5)
// Users only ever see "ForgeHype Meet".
const KEY = () => process.env.ANTHROPIC_API_KEY;
export const configured = () => !!KEY();

// kind: 'report' (needs judgement: Sonnet) or 'translate' (straight work: Haiku, much cheaper)
export function model(kind = 'report') {
  const set = kind === 'translate' ? process.env.TRANSLATE_MODEL : process.env.REPORT_MODEL;
  if (set && set.startsWith('claude')) return set;   // ignore anything that is not a Claude model name
  return kind === 'translate' ? 'claude-haiku-5-5' : 'claude-sonnet-5-5';
}

async function ask(system, user, maxTokens, kind) {
  if (!KEY()) throw Object.assign(new Error('ANTHROPIC_API_KEY is not set'), { status: 503 });
  const base = (process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com').replace(/\/$/, '');
  const res = await fetch(base + '/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY(), 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model(kind), max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`claude ${res.status}: ${j?.error?.message || res.statusText}`), { status: res.status });
  return (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
}

export function parseJSON(text) {
  const t = String(text || '').replace(/^```(?:json)?\s*|\s*```$/g, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('claude: no JSON in reply');
  return JSON.parse(t.slice(a, b + 1));
}

export async function askJSON(system, user, maxTokens = 4000, kind = 'report') {
  try { return parseJSON(await ask(system, user, maxTokens, kind)); }
  catch (e) { if (e.status) throw e; return parseJSON(await ask(system + '\n\nReturn valid JSON only.', user, maxTokens, kind)); }   // one retry on bad JSON
}
