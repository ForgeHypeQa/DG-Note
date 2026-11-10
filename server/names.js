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

/* ---------- reading an introduction ----------
   People introduce themselves in any shape:
     "Sara Mendes."                                   name only
     "I'm Joseph, senior physiotherapist."            name + title
     "Rami Haddad, care coordinator at Hamad Medical"  name + title + organisation
     "Hi, Layla from the finance department"           name + department
     «أنا خالد العطية، مدير المالية في وزارة الصحة»    Arabic, name + title + organisation
   parseIntro() picks out whichever of name, title (role), organisation and department were said. */

const GREETING = /^(?:\s*(?:hi|hello|hey|hiya|good\s+(?:morning|afternoon|evening)|morning|salam|salaam|assalamu?\s*alaikum|as-?salamu\s*alaykum|everyone|all|guys|team|مرحبا|مرحباً|السلام عليكم|صباح الخير|مساء الخير|أهلا|اهلا)[\s,!.،]*)+/i;
const EN_TRIGGER = /\b(my\s+name\s+is|my\s+name's|call\s+me|i\s+am|i'm|im|this\s+is|it's|it\s+is|here\s+is)\s+(.+)/i;
// "My name is X" is always a name. "I'm X" / "This is X" only when X looks like a name
// (capital letter, not an everyday word): "I'm late", "I'm not sure", "this is important" are not introductions.
const STRONG = /^(my\s+name\s+is|my\s+name's|call\s+me)$/i;
const AR_TRIGGER = /(?:^|\s)(انا|أنا|اسمي|معكم|معك|هنا)\s+(.+)/;
const AR_NOT_NAME = new Set(['متأخر','متاخر','متأخرة','آسف','اسف','آسفة','موافق','موافقة','شايف','شايفة','أعتقد','اعتقد','أظن','اظن','مش','ما','لا','بس','هنا','جاهز','جاهزة','معكم','معك','أبغى','ابغى','أريد','اريد','رأيي','متفق','متفقة','عندي','كنت','سوف','راح','بخير','الحمد']);
const TITLE_EN = /^(?:dr\.?|doctor|mr\.?|mrs\.?|ms\.?|miss|eng\.?|engineer|prof\.?|professor|sheikh|sheikha)$/i;
const TITLE_AR = /^(?:د\.?|دكتور|دكتورة|الدكتور|الدكتورة|م\.?|المهندس|المهندسة|مهندس|الأستاذ|الأستاذة|أستاذ|أستاذة|الشيخ|الشيخة)$/;

const ROLE_WORDS = ['nurse','doctor','physician','consultant','specialist','resident','surgeon','pharmacist','physiotherapist','physio','therapist','dietitian','dietician','nutritionist','social worker','worker','coordinator','manager','director','head','chief','officer','supervisor','administrator','admin','secretary','assistant','lawyer','counsel','advocate','attorney','paralegal','engineer','analyst','accountant','ceo','cfo','coo','cto','chairman','chairwoman','chair','president','vice president','partner','associate','intern','trainee','advisor','adviser','executive','representative','lead','auditor','inspector','clerk','receptionist','caregiver','carer','midwife','psychologist','psychiatrist','pharmacy technician','technician'];
const ROLE_MOD = ['senior','junior','head','chief','lead','deputy','assistant','associate','general','executive','clinical','charge','staff','principal','managing','acting','registered','legal','medical','nursing','senior staff'];
const ORG_WORDS = /\b(hospital|medical|health|healthcare|clinic|centre|center|corporation|corp|company|co|group|ministry|university|college|school|council|authority|bank|firm|llc|wll|ltd|foundation|institute|association|agency|chambers|partners|holding|holdings|enterprises|services|solutions|consultancy|consulting|hamad|sidra|aspetar|phcc|qatarenergy|ooredoo|qatar\s+airways|qnb|forgehype)\b/i;
const AR_ORG = /(?:^|\s)((?:وزارة|مستشفى|مستشفي|مؤسسة|شركة|مركز|جامعة|مجلس|هيئة|بنك|مصرف|مكتب|عيادة|معهد|جمعية|مجموعة)(?:\s+(?!و\s|في\s|من\s)[^\s،,.]+){1,4})/;
const AR_NOT = '(?!(?:في|من|مع|و|قسم)(?:\\s|$))(?!(?:وزارة|مستشفى|مؤسسة|شركة|مركز|جامعة|مجلس|هيئة|بنك))';
const AR_ROLE = new RegExp(`(?:^|\\s)((?:ال)?(?:مدير|رئيس|نائب|منسق|مشرف|أخصائي|اخصائي|ممرض|طبيب|استشاري|صيدلي|صيدلاني|محامي|مستشار|مهندس|موظف|سكرتير|محاسب|باحث)[ةه]?(?:\\s+${AR_NOT}[^\\s،,.]+){0,2})`);
const AR_DEPT = new RegExp(`(?:^|\\s)قسم\\s+([^\\s،,.]+(?:\\s+${AR_NOT}[^\\s،,.]+)?)`);
const NOT_NAME = new Set(['great','thanks','thank','perfect','awesome','excellent','exactly','absolutely','definitely','true','correct','agreed','fantastic','wonderful','nice','cool','amazing','interesting','oh','um','uh','hmm','yep','nope','wow','sorry','late','not','going','gonna','fine','happy','glad','afraid','agree','done','ready','back','still','very','really','just','sure','here','new','looking','trying','calling','joining','speaking','talking','wondering','thinking','worried','concerned','responsible','in','on','at','with','from','a','an','to','for','one','also','actually','currently','basically','let','lets','let\'s','we','so','okay','ok','yes','no','the','this','that','today','first','next','good','thank','thanks','please','can','could','should','will','what','how','when','our','us','he','she','they','it','there','now','right','alright','well','then','also','and','but','because','if','as','about','regarding','agenda','meeting','item','moving','start','starting','welcome','hi','hello','yeah','sure']);
const EN_STOP = new Set(['from','in','with','and','of','at','i','i\'m','im','working','work','works','the','a','an','department','dept','team','unit','here','speaking','representing','for','on','as','my','our','today','also','just','who','which','role','position','title','is','am','currently']);
const AR_STOP = new Set(['من','في','مع','و','قسم','وأنا','وانا','أعمل','اعمل','بصفتي','كـ']);

const roleRe = (() => {
  const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const mods = ROLE_MOD.map(esc).join('|'), roles = ROLE_WORDS.sort((a, b) => b.length - a.length).map(esc).join('|');
  // optional "finance"/"HR" word before manager-type roles, modifiers, the role, optional "of X"/"for X"
  return new RegExp(`\\b((?:(?!(?:from|at|with|in|of|the|and|i|am|i'm|my|is|a|an)\\b)[A-Za-z&]+\\s+(?=(?:manager|director|coordinator|officer|lead|specialist|supervisor|administrator|analyst|engineer|executive|assistant)\\b))?(?:(?:${mods})\\s+)*(?:${roles})(?:\\s+(?:of|for)\\s+(?:the\\s+)?[A-Za-z&]+(?:\\s+(?!at\\b|from\\b|with\\b|in\\b|and\\b)[A-Za-z&]+)?)?)\\b`, 'i');
})();
const cap = w => w ? w.replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase()) : w;
const isLatin = s => /[A-Za-z]/.test(s) && !/[؀-ۿ]/.test(s);
function cleanWord(w) { return w.replace(/[.,;:!?،؛"“”«»()]/g, ''); }

function nameFrom(text) {
  const src = String(text || '').replace(/\s+/g, ' ').trim().replace(GREETING, '').trim();
  let m = src.match(EN_TRIGGER), ar = false;
  if (m) {
    const w0 = cleanWord(m[2].split(/\s+/)[0] || ''), w1 = TITLE_EN.test(w0) ? cleanWord(m[2].split(/\s+/)[1] || '') : w0;
    if (!STRONG.test(m[1]) && (!/^[A-Z]/.test(w1) || NOT_NAME.has(w1.toLowerCase()))) m = null;   // "I'm late"
  }
  if (!m) { m = src.match(AR_TRIGGER); ar = !!m;
    if (m && m[1] !== 'اسمي') { const w0 = cleanWord(m[2].split(/\s+/)[0] || ''); if (AR_NOT_NAME.has(w0) || TITLE_AR.test(w0) && AR_NOT_NAME.has(cleanWord(m[2].split(/\s+/)[1] || ''))) { m = null; ar = false; } }
  }
  if (m) m = [m[0], m[2]];
  // An "I'm late"-type sentence is not an introduction at all.
  if (!m && /\b(?:i\s+am|i'm|im)\s+(?:sorry|late|not|going|just|here|afraid|fine|sure)\b/i.test(src)) return { name: '', dr: false };
  if (!m && /^(?:أنا|انا)\s/.test(src)) return { name: '', dr: false };
  let rest = m ? m[1] : src, latin = isLatin(rest.split(/\s+/)[0] || '');
  if (!m && !ar && /[؀-ۿ]/.test(rest.split(/\s+/)[0] || '')) ar = true;
  const words = rest.split(' '), out = [];
  let title = '', cleanEnd = false;
  for (let k = 0; k < words.length; k++) {
    const raw = words[k], w = cleanWord(raw);
    if (!w) break;
    if (!out.length && (TITLE_EN.test(w) || TITLE_AR.test(w))) { title = /^(dr|doctor|د|دكتور|دكتورة|الدكتور|الدكتورة)/i.test(w) ? 'Dr.' : ''; continue; }
    const lw = w.toLowerCase();
    if (ar ? AR_STOP.has(w) || AR_ROLE.test(' ' + w) || /^(?:وزارة|مستشفى|مؤسسة|شركة|مركز|جامعة|مجلس|هيئة|بنك)$/.test(w) : EN_STOP.has(lw) || roleRe.test(w) || ORG_WORDS.test(w)) { cleanEnd = true; break; }
    // Without "I'm"/"my name is", only accept a name made of capitalised words (Al-/bin/bint allowed).
    if (!m && !ar && (NOT_NAME.has(lw) || (!/^[A-Z]/.test(w) && !/^(al|el|bin|bint|ibn|abu|van|de|da|del)$/i.test(w)))) break;
    out.push(latin && !ar && /^[a-z]/.test(w) && !/^(al|el|bin|bint|ibn|abu)$/i.test(w) ? cap(w) : w);
    if (/[.,،;!?]$/.test(raw) || k === words.length - 1) { cleanEnd = true; break; }
    if (out.length === 4) break;
  }
  if (!out.length) return { name: '', dr: title === 'Dr.' };
  // "Let us start…" is not an introduction: without "I'm"/"my name is" the name must end cleanly
  // (comma, full stop, end, or words like "from", "here", a job title).
  if (!m && !cleanEnd) return { name: '', dr: false };
  return { name: (title ? title + ' ' : '') + out.join(' '), dr: title === 'Dr.' };
}

function roleFrom(text, name) {
  const t = String(text || '').replace(GREETING, '');
  const afterName = name && t.toLowerCase().includes(name.toLowerCase().replace(/^dr\.\s*/, '')) ? t.slice(t.toLowerCase().indexOf(name.toLowerCase().replace(/^dr\.\s*/, '')) + name.replace(/^dr\.\s*/i, '').length) : t;
  const ar = afterName.match(AR_ROLE);
  if (ar) return ar[1].trim();
  const m = afterName.match(roleRe);
  if (!m) return '';
  let r = m[1].replace(/\s+/g, ' ').trim();
  if (/^(head|chief|lead)$/i.test(r)) return '';        // "head" alone is too vague
  return r.length > 2 && r.toUpperCase() === r ? r : cap(r.toLowerCase()).replace(/\b(Of|For|The|And)\b/g, s => s.toLowerCase()).replace(/\b(Ceo|Cfo|Coo|Cto|Hr|It)\b/g, s => s.toUpperCase());
}

function orgFrom(text, departments, role) {
  let t = String(text || '');
  const ar = t.match(AR_ORG); if (ar) return ar[1].trim();
  if (role) t = t.replace(new RegExp(role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ');   // "director of operations" is a title, not an organisation
  const tidy = phrase => phrase.split(/\s+/).map(w => /^[a-z]/.test(w) && !/^(of|and|for|the|al)$/.test(w) ? cap(w) : w).join(' ');
  for (const preps of ['from|at|with|representing', 'of|for']) {
  const re = new RegExp(`\\b(?:${preps})\\s+((?:the\\s+)?[A-Za-z][A-Za-z&'.-]*(?:\\s+(?!and\\b(?!\\s+(?:company|co|partners|sons|associates)\\b)|i\\b|i'm\\b|in\\b|as\\b|at\\b|from\\b|with\\b|department\\b|team\\b|unit\\b)[A-Za-z][A-Za-z&'.-]*){0,5})`, 'gi');
  let m;
  while ((m = re.exec(t))) {
    let phrase = m[1].replace(/^the\s+/i, '').split(/(?<=[a-z]{3}\.)\s/)[0].replace(/[.,;]+$/, '').trim();   // stop at the end of the sentence
    phrase = phrase.split(/\s+(?=(?:as|where|in)\b|and\b(?!\s+(?:company|co|partners|sons|associates)\b))/i)[0];
    if (!phrase || findDepartment(phrase, departments) && !ORG_WORDS.test(phrase)) continue;   // that's a department
    if (/\b(department|dept|team|unit|division|section)\b/i.test(phrase)) continue;
    if (roleRe.test(phrase) && !ORG_WORDS.test(phrase)) continue;
    const capsWords = phrase.split(/\s+/).filter(w => /^[A-Z]/.test(w)).length;
    if (ORG_WORDS.test(phrase) || capsWords >= 1) return tidy(phrase);
  }
  }
  // A comma-separated part that names an organisation: "…, legal counsel, Al Tamimi and Company."
  for (const seg of t.split(/[,;]/).slice(1)) {
    const p = seg.replace(/[.!]+$/, '').trim();
    if (p && ORG_WORDS.test(p) && !roleRe.test(p) && p.split(/\s+/).length <= 6) return tidy(p);
  }
  return '';
}

function deptFrom(text, departments, role) {
  const t = String(text || '');
  const ar = t.match(AR_DEPT); if (ar) return findDepartment(ar[1], departments) || 'قسم ' + ar[1].trim();
  const ex = t.match(/\b(?:the\s+)?([A-Za-z&]+(?:\s+(?!the\b)[A-Za-z&]+)?)\s+(?:department|dept\.?|team|unit|division|section)\b/i);
  if (ex && !/^(the|our|my|a)$/i.test(ex[1])) { const k = findDepartment(ex[1], departments); if (k) return k; }
  // dictionary words, but not the ones inside the job title ("senior physiotherapist" is a title, not a department)
  const known = findDepartment(role ? t.replace(role, ' ').replace(new RegExp(role, 'i'), ' ') : t, departments);
  if (known) return known;
  let m = t.match(/\b(?:the\s+)?([A-Za-z&]+(?:\s+(?!the\b)[A-Za-z&]+)?)\s+(?:department|dept\.?|team|unit|division|section)\b/i);
  if (m && !/^(the|our|my|a)$/i.test(m[1])) return cap(m[1].replace(/^(the|our|my)\s+/i, '').toLowerCase()).replace(/\b(Hr|It|Icu|Er)\b/g, s => s.toUpperCase());
  m = t.match(/\b(?:department|division)\s+of\s+([A-Za-z&]+(?:\s+[A-Za-z&]+)?)/i);
  if (m) return cap(m[1].toLowerCase());
  return '';
}

export function parseIntro(text, departments = {}) {
  const { name, dr } = nameFrom(text);
  let role = roleFrom(text, name), dept = deptFrom(text, departments, role), org = orgFrom(text, departments, role);
  if (!role && dr) role = 'Doctor';
  if (role && dept && role.toLowerCase().includes(dept.toLowerCase()) && !/\b(of|for)\b/i.test(role) && role.split(' ').length > 1) {/* e.g. "Pharmacy manager": keep both */}
  if (org && dept && org.toLowerCase() === dept.toLowerCase()) org = '';
  return { name, role, org, dept };
}

// Kept for older callers and tests.
export const extractSpokenName = text => nameFrom(text).name;

export const MATCH_MIN = 0.78;

// Returns { name, role, org, dept, email, how, score, candidates }.
// how: 'roster' (matched staff list), 'heard' (name taken from the sentence), 'none'.
export function identify(introText, roster, departments) {
  const ranked = matchRoster(introText, roster);
  const said = parseIntro(introText, departments);
  const top = ranked[0];
  const candidates = ranked.filter(r => r.score >= 0.65).slice(0, 3).map(r => ({ id: r.person.id, name: r.person.name, dept: r.person.dept, email: r.person.email, score: +r.score.toFixed(2) }));
  if (top && top.score >= MATCH_MIN) {
    return { name: top.person.name, role: said.role, org: said.org, dept: said.dept || top.person.dept, email: top.person.email, how: 'roster', score: +top.score.toFixed(2), candidates };
  }
  if (said.name) return { ...said, email: '', how: 'heard', score: 0, candidates };
  // No introduction heard: don't guess a title or department from what they talked about.
  return { name: '', role: '', org: '', dept: '', email: '', how: 'none', score: 0, candidates };
}
