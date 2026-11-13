// Speech engine connection (async file transcription). Provider settings come from the environment.
const BASE = (process.env.SONIOX_API_BASE || 'https://api.soniox.com/v1').replace(/\/$/, '');
const KEY = () => process.env.SONIOX_API_KEY || '';
export const MODEL = process.env.SONIOX_MODEL || 'stt-async-v6';
export const configured = () => !!KEY();

async function call(path, opts = {}) {
  const res = await fetch(BASE + path, { ...opts, headers: { Authorization: `Bearer ${KEY()}`, ...(opts.headers || {}) } });
  if (res.status === 204) return null;
  const body = await res.text();
  let json; try { json = body ? JSON.parse(body) : null; } catch { json = null; }
  if (!res.ok) {
    const msg = json?.message || json?.error_message || json?.detail || body.slice(0, 300) || res.statusText;
    throw Object.assign(new Error(`speech engine ${opts.method || 'GET'} ${path} → ${res.status}: ${msg}`), { status: res.status });
  }
  return json;
}

export async function uploadFile(buffer, filename, mime) {
  const fd = new FormData();
  fd.append('file', new Blob([buffer], { type: mime || 'application/octet-stream' }), filename);
  return call('/files', { method: 'POST', body: fd });
}

export function createTranscription(payload) {
  return call('/transcriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: MODEL, ...payload }) });
}

export const getTranscription = id => call(`/transcriptions/${id}`);
export const getTranscript = id => call(`/transcriptions/${id}/transcript`);
export const deleteTranscription = id => call(`/transcriptions/${id}`, { method: 'DELETE' });
export const deleteFile = id => call(`/files/${id}`, { method: 'DELETE' });

// Real-time (streaming) transcription. The browser connects straight to the engine with a short-lived
// key made here, so the real key never leaves the server.
export const RT_MODEL = process.env.SONIOX_RT_MODEL || 'stt-rt-v6';
export const RT_URL = process.env.SONIOX_RT_URL || 'wss://stt-rt.soniox.com/transcribe-websocket';
export const tempKey = (seconds = 120) => call('/auth/temporary-api-key', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usage_type: 'transcribe_websocket', expires_in_seconds: seconds, single_use: true, max_session_duration_seconds: 4 * 3600 }) });
