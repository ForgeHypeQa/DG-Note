// One small text-AI connection used for meeting reports and translation.
// Works with OpenRouter (any model, e.g. Qwen or DeepSeek: cheap) or Anthropic directly.
//   OPENROUTER_API_KEY + REPORT_MODEL (default qwen/qwen3-30b-a3b-instruct-2507)
//   or ANTHROPIC_API_KEY + REPORT_MODEL (default claude-sonnet-5-5)
// Users only ever see "ForgeHype Meet".
const OR = () => process.env.OPENROUTER_API_KEY;
const AN = () => process.env.ANTHROPIC_API_KEY;
export const configured = () => !!(OR() || AN());
export const provider = () => (OR() ? 'openrouter' : AN() ? 'anthropic' : 'none');
export const model = () => process.env.REPORT_MODEL || (OR() ? 'qwen/qwen3-30b-a3b-instruct-2507' : 'claude-sonnet-5-5');

async function ask(system, user, maxTokens) {
  if (OR()) {
    const base = (process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const body = {
      model: model(), max_tokens: maxTokens, temperature: 0.2,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
      // Only use providers that do not keep or train on our text.
      provider: { data_collection: 'deny' },
    };
    const res = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${OR()}`, 'x-title': 'ForgeHype Meet' },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.error) throw Object.assign(new Error(`text engine ${res.status}: ${j?.error?.message || res.statusText}`), { status: j?.error?.code || res.status });
    return j.choices?.[0]?.message?.content || '';
  }
  if (AN()) {
    const base = (process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com').replace(/\/$/, '');
    const res = await fetch(base + '/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': AN(), 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: model(), max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(`text engine ${res.status}: ${j?.error?.message || res.statusText}`), { status: res.status });
    return (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  }
  throw Object.assign(new Error('no text engine configured'), { status: 503 });
}

export function parseJSON(text) {
  const t = String(text || '').replace(/^```(?:json)?\s*|\s*```$/g, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('text engine: no JSON in reply');
  return JSON.parse(t.slice(a, b + 1));
}

export async function askJSON(system, user, maxTokens = 4000) {
  try { return parseJSON(await ask(system, user, maxTokens)); }
  catch (e) { if (e.status) throw e; return parseJSON(await ask(system, user + '\n\nReturn valid JSON only.', maxTokens)); }   // one retry on bad JSON
}
