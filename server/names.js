// Works out who a speaker is from what they said in the introduction round,
// e.g. "Hi, I'm Sara Mendes from Nursing" or "أنا نورة السليطي من الصيدلة".
// 1. Look for a staff-list name in the words (fuzzy, so small mishearings still match).
// 2. Otherwise pull the name out of the sentence pattern.
// 3. Otherwise leave the speaker as "Speaker N" for the user to name.

export function normalize(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')            // Latin accents
    .replace(/[ً-ٰٟـ]/g, '') // Arabic diacritics and tatweel
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
export const similarity = (a, b) => (a || b) ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0;

const stripTitle = n => n.replace(/^(dr\.?|doctor)\s+/i, '');
// Sound-alike squash so Josef ≈ Joseph, Tomas ≈ Thomas, Mohamed ≈ Mohammad, and Arabic "al-" so السليطي ≈ سليطي.
const strip = w => w.replace(/^ال/, '').replace(/^al(?=\p{L}{3})/u, '')
  .replace(/ph/g, 'f').replace(/th/g, 't').replace(/ck/g, 'k').replace(/ou/g, 'u').replace(/ee/g, 'i')
  .replace(/([a-z])\1+/g, '$1').replace(/(?<=\p{L})[aeiouy]+(?=\p{L})/gu, m => m[0]);

// Best score for `name` appearing anywhere in `words` (array of normalized words).
function bestWindow(words, name) {
  const target = normalize(name).split(' ').filter(Boolean);
  if (!target.length) return 0;
  const n = target.length;
  let best = 0;
  for (let i = 0; i + n <= words.length; i++) {
    const win = words.slice(i, i + n);
    const sc = win.reduce((s, w, k) => s + similarity(strip(w), strip(target[k])), 0) / n;
    best = Math.max(best, sc);
  }
  return best;
}

export function matchRoster(text, roster) {
  const words = normalize(text).split(' ').filter(Boolean);
  const scored = roster.map(p => {
    const full = stripTitle(p.name);
    const firstName = full.split(/\s+/)[0];
    const scores = [
      bestWindow(words, full),
      p.ar ? bestWindow(words, p.ar) : 0,
      bestWindow(words, firstName) * 0.86,                            // first name only
      p.ar ? bestWindow(words, p.ar.split(/\s+/)[0]) * 0.86 : 0,
    ];
    return { person: p, score: Math.max(...scores) };
  }).sort((a, b) => b.score - a.score);
  return scored;
}

export function findDepartment(text, departments) {
  const t = ' ' + normalize(text) + ' ';
  let best = null;
  for (const [dept, words] of Object.entries(departments)) {
    for (const w of [dept, ...words]) {
      const nw = normalize(w);
      if (nw && t.includes(' ' + nw + ' ')) {
        if (!best || nw.length > best.len) best = { dept, len: nw.length };
      }
    }
  }
  return best ? best.dept : '';
}

const EN_TRIGGER = /\b(?:my name is|my name's|i am|i'm|im|this is|it's|it is|here is)\s+(?:dr\.?\s+|doctor\s+)?(.+)/i;
const EN_STOP = /^(from|in|with|and|of|at|i|i'm|working|work|the|department|team|unit|here|speaking|nurse|physio)$/i;
const AR_TRIGGER = /(?:انا|أنا|اسمي|معكم|معك|هنا)\s+(?:د\.?\s+|دكتور\s+|دكتوره\s+|الدكتور\s+)?(.+)/;
const AR_STOP = /^(من|في|مع|و|قسم|الصيدلة|التمريض)$/;

function cleanWord(w) { return w.replace(/[.,;:!?،؛"“”()]/g, ''); }

// Pulls a name out of an introduction sentence when nobody in the staff list matched.
export function extractSpokenName(text) {
  const src = String(text || '').replace(/\s+/g, ' ').trim();
  let m = src.match(EN_TRIGGER), stop = EN_STOP;
  if (!m) { m = src.match(AR_TRIGGER); stop = AR_STOP; }
  if (!m) return '';
  const out = [];
  for (const raw of m[1].split(' ')) {
    const w = cleanWord(raw);
    if (!w || stop.test(w)) break;
    out.push(w);
    if (/[.,،;!?]$/.test(raw) || out.length === 3) break;
  }
  return out.map(w => /^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

export const MATCH_MIN = 0.78;

// Returns { name, dept, email, how, score, candidates }.
// how: 'roster' (matched staff list), 'heard' (name taken from the sentence), 'none'.
export function identify(introText, roster, departments) {
  const ranked = matchRoster(introText, roster);
  const spokenDept = findDepartment(introText, departments);
  const top = ranked[0];
  const candidates = ranked.filter(r => r.score >= 0.5).slice(0, 3).map(r => ({ id: r.person.id, name: r.person.name, dept: r.person.dept, email: r.person.email, score: +r.score.toFixed(2) }));
  if (top && top.score >= MATCH_MIN) {
    return { name: top.person.name, dept: spokenDept || top.person.dept, email: top.person.email, how: 'roster', score: +top.score.toFixed(2), candidates };
  }
  const spoken = extractSpokenName(introText);
  if (spoken) return { name: spoken, dept: spokenDept, email: '', how: 'heard', score: 0, candidates };
  return { name: '', dept: spokenDept, email: '', how: 'none', score: 0, candidates };
}
