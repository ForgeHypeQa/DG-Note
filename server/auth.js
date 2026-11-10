// Demo sign-in. No database: accounts are fixed below. Logins and passwords are
// stored only as salted scrypt hashes, never as plain text.
//
// The sign-in cookie is signed (HMAC), so it survives server restarts and Render's
// free-plan sleep: leaving the app does not sign you out. What is limited is SEATS:
// at most MAX_ONLINE different accounts active at the same time. Someone who has not
// had the app open for 3 minutes gives up their seat but stays signed in; when they
// come back they get a seat again if one is free, otherwise they wait (nothing is lost).
import { scryptSync, timingSafeEqual, randomBytes, createHmac, createHash } from 'node:crypto';

export const MAX_ONLINE = Number(process.env.MAX_ONLINE || 4);
const IDLE_MS = 3 * 60 * 1000;               // app closed this long = seat freed (still signed in)
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;  // stay signed in for 7 days
const COOKIE = 'dg_t';
// Signing key: SESSION_SECRET if set, else derived from the Soniox key (stable across restarts).
const SECRET = process.env.SESSION_SECRET
  || (process.env.SONIOX_API_KEY ? createHash('sha256').update('dg-note-session|' + process.env.SONIOX_API_KEY).digest('hex') : randomBytes(32).toString('hex'));

const GUEST_PW = '4534247a65b99eeb08642c32c78fa457:89aa31c619439bcce9b13eaaca66640980718dc5b75098d5cc96f0e678b516bc';

const USERS = [
  {
    id: 'admin', name: 'ForgeHype Admin', short: 'FH', role: 'admin', enabled: true,
    // ForgeHype email (hashed). Override with ADMIN_LOGIN_HASH / ADMIN_PASSWORD_HASH in the host's settings.
    loginHash: process.env.ADMIN_LOGIN_HASH || '2c86b48f3de0c2f4969d7bef7e45d5c2:ee6d67f64817485324331f312cb2abaa392a7eb8905741f52284b602f02f0239',
    pwHash: process.env.ADMIN_PASSWORD_HASH || 'd1155c205c752135ab893abf777f6663:042f16556f0fe7cf4b766f2aafa4301c4a37ef16a14044b51041c2198ea09fdf',
  },
  ...[1, 2, 3, 4, 5, 6].map(n => ({ id: `guest${n}`, name: `Guest ${n}`, short: `G${n}`, role: 'guest', enabled: true, pwHash: GUEST_PW })),
];

function check(secret, stored) {
  const [salt, hex] = String(stored).split(':');
  if (!salt || !hex) return false;
  const a = scryptSync(String(secret), salt, 32), b = Buffer.from(hex, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function findUser(login) {
  const raw = String(login || '').trim().toLowerCase();
  const g = raw.replace(/\s+/g, '').match(/^guest(\d)$/);
  if (g) return USERS.find(u => u.id === `guest${g[1]}`);
  if (raw.includes('@')) { const admin = USERS.find(u => u.id === 'admin'); return check(raw, admin.loginHash) ? admin : null; }
  return null;
}
const pub = u => ({ id: u.id, name: u.name, short: u.short, role: u.role });

/* --- signed token: base64url(json).hmac --- */
const b64 = s => Buffer.from(s).toString('base64url');
const sign = data => createHmac('sha256', SECRET).update(data).digest('base64url');
function makeToken(uid) {
  const data = b64(JSON.stringify({ uid, sid: randomBytes(9).toString('hex'), iat: Date.now(), exp: Date.now() + SESSION_MS }));
  return `${data}.${sign(data)}`;
}
function readToken(req) {
  const m = String(req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+)`));
  if (!m) return null;
  const [data, sig] = m[1].split('.');
  const want = Buffer.from(sign(data)), got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try { const t = JSON.parse(Buffer.from(data, 'base64url').toString()); return t.exp > Date.now() ? t : null; } catch { return null; }
}
function setCookie(req, res, value, maxAgeSec) {
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${req.secure ? '; Secure' : ''}`);
}
function device(req) {
  const ua = String(req.headers['user-agent'] || '');
  return /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Browser';
}

/* --- seats (memory) --- */
const seats = new Map();       // uid -> { since, lastSeen, device }
const revokedBefore = {};      // uid -> time; tokens issued earlier are refused (admin "Sign out")
function activeSeats() {
  const now = Date.now();
  for (const [uid, s] of seats) if (now - s.lastSeen > IDLE_MS) seats.delete(uid);
  return seats;
}
// Gives `user` a seat if they have one or one is free. Returns false when the demo is full.
function takeSeat(user, req) {
  const act = activeSeats(), mine = act.get(user.id);
  if (mine) { mine.lastSeen = Date.now(); return true; }
  if (act.size >= MAX_ONLINE) {
    if (user.role !== 'admin') return false;
    // The admin is never locked out: the guest idle the longest gives up their seat.
    const bump = [...act.entries()].filter(([uid]) => uid !== 'admin').sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
    if (bump) act.delete(bump[0]);
  }
  act.set(user.id, { since: Date.now(), lastSeen: Date.now(), device: device(req) });
  return true;
}

// Wrong-password pause: 8 wrong tries a minute per account and address.
const tries = new Map();
const tryKey = (req) => `${req.ip}|${String(req.body?.login || '').trim().toLowerCase().replace(/\s+/g, '')}`;
function blocked(req) { const now = Date.now(); return (tries.get(tryKey(req)) || []).filter(t => now - t < 60000).length >= 8; }
function failed(req) { const k = tryKey(req), now = Date.now(); tries.set(k, [...(tries.get(k) || []).filter(t => now - t < 60000), now]); }

// Returns { user } | { full: true, user } | null (not signed in)
export function current(req) {
  const t = readToken(req); if (!t) return null;
  const u = USERS.find(x => x.id === t.uid);
  if (!u || !u.enabled || (revokedBefore[u.id] && t.iat < revokedBefore[u.id])) return null;
  return takeSeat(u, req) ? { user: u } : { user: u, full: true };
}
const FULL = { error: `The demo is full right now (${MAX_ONLINE} people). You are still signed in and nothing is lost. Try again in a moment.`, full: true };
export const requireUser = (req, res, next) => {
  const c = current(req);
  if (!c) return res.status(401).json({ error: 'Please sign in again.' });
  if (c.full) return res.status(423).json(FULL);
  req.user = c.user; next();
};
export const requireAdmin = (req, res, next) => requireUser(req, res, () => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' }));

export function mount(app, express) {
  app.post('/api/login', express.json({ limit: '10kb' }), (req, res) => {
    if (blocked(req)) return res.status(429).json({ error: 'Too many wrong tries. Wait a minute and try again.' });
    const u = findUser(req.body?.login);
    if (!u || !check(req.body?.password, u.pwHash)) { failed(req); return res.status(401).json({ error: 'Email or password is not right.' }); }
    if (!u.enabled) return res.status(403).json({ error: 'This account is switched off. Ask the admin.' });
    if (!takeSeat(u, req)) return res.status(429).json({ error: `The demo is full: ${MAX_ONLINE} people are signed in. Try again when someone signs out.`, full: true });
    setCookie(req, res, makeToken(u.id), SESSION_MS / 1000);
    res.json({ user: pub(u), online: activeSeats().size, max: MAX_ONLINE });
  });

  app.post('/api/logout', (req, res) => {
    const t = readToken(req); if (t) seats.delete(t.uid);
    setCookie(req, res, '', 0); res.json({ ok: true });
  });

  // Also the heartbeat: the app calls it every 30 s while open to keep its seat.
  app.get('/api/me', (req, res) => {
    const c = current(req);
    if (!c) return res.status(401).json({ error: 'Not signed in.' });
    if (c.full) return res.status(423).json({ ...FULL, user: pub(c.user) });
    res.json({ user: pub(c.user), online: activeSeats().size, max: MAX_ONLINE });
  });

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const act = activeSeats();
    res.json({
      max: MAX_ONLINE,
      users: USERS.map(u => {
        const s = act.get(u.id);
        return { ...pub(u), enabled: u.enabled, online: !!s, since: s?.since || null, lastSeen: s?.lastSeen || null, device: s?.device || null };
      }),
    });
  });

  app.post('/api/admin/signout', requireAdmin, express.json(), (req, res) => {
    const id = req.body?.id; if (id === 'admin') return res.status(400).json({ error: 'Use Sign out for your own session.' });
    revokedBefore[id] = Date.now(); seats.delete(id);
    res.json({ ok: true });
  });

  app.post('/api/admin/enable', requireAdmin, express.json(), (req, res) => {
    const u = USERS.find(x => x.id === req.body?.id && x.role !== 'admin');
    if (!u) return res.status(404).json({ error: 'No such guest.' });
    u.enabled = !!req.body.enabled;
    if (!u.enabled) seats.delete(u.id);
    res.json({ ok: true, enabled: u.enabled });
  });
}
