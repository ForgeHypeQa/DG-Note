// Demo sign-in. No database: accounts are fixed below and sessions live in memory
// (a server restart signs everyone out). Logins and passwords are stored only as
// salted scrypt hashes, never as plain text.
import { scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';

export const MAX_ONLINE = Number(process.env.MAX_ONLINE || 4);
const IDLE_MS = 3 * 60 * 1000;            // no heartbeat for 3 min = signed out, seat freed
const SESSION_MS = 12 * 60 * 60 * 1000;   // sign in again after 12 h
const COOKIE = 'dg_s';

const GUEST_PW = '4534247a65b99eeb08642c32c78fa457:89aa31c619439bcce9b13eaaca66640980718dc5b75098d5cc96f0e678b516bc';

const USERS = [
  {
    id: 'admin', name: 'ForgeHype Admin', short: 'FH', role: 'admin', enabled: true,
    // ForgeHype email (hashed). Override with ADMIN_LOGIN_HASH / ADMIN_PASSWORD_HASH in the host's settings.
    loginHash: process.env.ADMIN_LOGIN_HASH || '2c86b48f3de0c2f4969d7bef7e45d5c2:ee6d67f64817485324331f312cb2abaa392a7eb8905741f52284b602f02f0239',
    pwHash: process.env.ADMIN_PASSWORD_HASH || '8b22dcd4869cd8632d472eee74a5b858:2b8e35397b6b1eead5f37d17c96d0527e3a0881fccb5b3960c909553aefe67ff',
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

const sessions = new Map(); // token -> { token, userId, createdAt, lastSeen, device }
const pub = u => ({ id: u.id, name: u.name, short: u.short, role: u.role });

function sweep() {
  const now = Date.now();
  for (const [t, s] of sessions) if (now - s.lastSeen > IDLE_MS || now - s.createdAt > SESSION_MS) sessions.delete(t);
}
const online = () => { sweep(); return [...sessions.values()]; };

function device(req) {
  const ua = String(req.headers['user-agent'] || '');
  return /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac OS/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Browser';
}
function readToken(req) {
  const m = String(req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{48})`));
  return m ? m[1] : null;
}
function setCookie(req, res, token, maxAgeSec) {
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`);
}

// Slow down password guessing: 8 wrong tries per minute per account and address.
// (Counted per account so people on the same office Wi-Fi don't block each other.)
const tries = new Map();
const tryKey = (req) => `${req.ip}|${String(req.body?.login || '').trim().toLowerCase().replace(/\s+/g, '')}`;
function blocked(req) { const now = Date.now(); return (tries.get(tryKey(req)) || []).filter(t => now - t < 60000).length >= 8; }
function failed(req) { const k = tryKey(req), now = Date.now(); tries.set(k, [...(tries.get(k) || []).filter(t => now - t < 60000), now]); }

export function current(req) {
  sweep();
  const t = readToken(req), s = t && sessions.get(t);
  if (!s) return null;
  const u = USERS.find(x => x.id === s.userId);
  if (!u || !u.enabled) { sessions.delete(t); return null; }
  s.lastSeen = Date.now();
  return { session: s, user: u };
}

export const requireUser = (req, res, next) => { const c = current(req); if (!c) return res.status(401).json({ error: 'Please sign in again.' }); req.user = c.user; next(); };
export const requireAdmin = (req, res, next) => requireUser(req, res, () => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admins only.' }));

export function mount(app, express) {
  app.post('/api/login', express.json({ limit: '10kb' }), (req, res) => {
    if (blocked(req)) return res.status(429).json({ error: 'Too many wrong tries. Wait a minute and try again.' });
    const u = findUser(req.body?.login);
    // Admin password ignores capital letters (stored as lower case), so phone keyboards don't trip it up.
    const pw = u?.role === 'admin' ? String(req.body?.password || '').toLowerCase() : req.body?.password;
    if (!u || !check(pw, u.pwHash)) { failed(req); return res.status(401).json({ error: 'Email or password is not right.' }); }
    if (!u.enabled) return res.status(403).json({ error: 'This account is switched off. Ask the admin.' });

    // One session per account: signing in again replaces the old one.
    for (const [t, s] of sessions) if (s.userId === u.id) sessions.delete(t);
    const others = online();
    if (others.length >= MAX_ONLINE) {
      if (u.role !== 'admin') return res.status(429).json({ error: `The demo is full: ${MAX_ONLINE} people are signed in. Try again when someone signs out.`, full: true });
      // The admin is never locked out: the guest idle the longest gives up their seat.
      const bump = others.filter(s => s.userId !== 'admin').sort((a, b) => a.lastSeen - b.lastSeen)[0];
      if (bump) sessions.delete(bump.token);
    }
    const token = randomBytes(24).toString('hex');
    sessions.set(token, { token, userId: u.id, createdAt: Date.now(), lastSeen: Date.now(), device: device(req) });
    setCookie(req, res, token, SESSION_MS / 1000);
    res.json({ user: pub(u), online: online().length, max: MAX_ONLINE });
  });

  app.post('/api/logout', (req, res) => {
    const t = readToken(req); if (t) sessions.delete(t);
    setCookie(req, res, '', 0); res.json({ ok: true });
  });

  // Also the heartbeat: the app calls it every 30 s to keep its seat.
  app.get('/api/me', (req, res) => {
    const c = current(req);
    if (!c) return res.status(401).json({ error: 'Not signed in.' });
    res.json({ user: pub(c.user), online: online().length, max: MAX_ONLINE });
  });

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const on = online();
    res.json({
      max: MAX_ONLINE,
      users: USERS.map(u => {
        const s = on.find(x => x.userId === u.id);
        return { ...pub(u), enabled: u.enabled, online: !!s, since: s?.createdAt || null, lastSeen: s?.lastSeen || null, device: s?.device || null };
      }),
    });
  });

  app.post('/api/admin/signout', requireAdmin, express.json(), (req, res) => {
    const id = req.body?.id; if (id === 'admin') return res.status(400).json({ error: 'Use Sign out for your own session.' });
    for (const [t, s] of sessions) if (s.userId === id) sessions.delete(t);
    res.json({ ok: true });
  });

  app.post('/api/admin/enable', requireAdmin, express.json(), (req, res) => {
    const u = USERS.find(x => x.id === req.body?.id && x.role !== 'admin');
    if (!u) return res.status(404).json({ error: 'No such guest.' });
    u.enabled = !!req.body.enabled;
    if (!u.enabled) for (const [t, s] of sessions) if (s.userId === u.id) sessions.delete(t);
    res.json({ ok: true, enabled: u.enabled });
  });
}
