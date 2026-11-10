import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identify, extractSpokenName } from '../server/names.js';
import { buildResult } from '../server/build.js';
import { ROSTER, DEPARTMENTS } from '../server/roster.js';

const who = t => identify(t, ROSTER, DEPARTMENTS);

test('matches a staff-list name said in English', () => {
  const r = who("Hi, I'm Sara Mendes from Nursing.");
  assert.equal(r.name, 'Sara Mendes'); assert.equal(r.dept, 'Nursing'); assert.equal(r.how, 'roster');
});

test('matches a misheard name', () => {
  const r = who('Josef Tomas, physio.');
  assert.equal(r.name, 'Joseph Thomas'); assert.equal(r.dept, 'Physiotherapy');
});

test('matches an Arabic introduction', () => {
  const r = who('أنا نورة السليطي من الصيدلة');
  assert.equal(r.name, 'Noura Al-Sulaiti'); assert.equal(r.dept, 'Pharmacy');
});

test('matches a doctor by first name and title', () => {
  const r = who('Good morning, Doctor Ahmed here, geriatrics.');
  assert.equal(r.name, 'Dr. Ahmed Al-Kuwari');
});

test('keeps a name that is not in the staff list', () => {
  const r = who("My name is Layla Hassan from administration.");
  assert.equal(r.how, 'heard'); assert.equal(r.name, 'Layla Hassan'); assert.equal(r.dept, 'Administration');
});

test('Arabic name not in the staff list', () => {
  assert.equal(extractSpokenName('أنا خالد العطية من الإدارة'), 'خالد العطية');
});

test('no introduction gives no name', () => {
  assert.equal(who('Let us start with room twelve.').how, 'none');
});

test('builds segments, translation and speakers from tokens', () => {
  const tk = (text, speaker, s, extra = {}) => ({ text, speaker, start_ms: s, end_ms: s + 300, confidence: 0.95, language: 'en', ...extra });
  const tokens = [
    tk("Hi", '1', 0), tk(" I'm", '1', 300), tk(' Sa', '1', 600), tk('ra', '1', 700), tk(' Mendes', '1', 900), tk(' from', '1', 1200), tk(' Nursing.', '1', 1500),
    tk('أنا', '2', 3000, { language: 'ar' }), tk(' نورة', '2', 3300, { language: 'ar' }), tk(' السليطي', '2', 3600, { language: 'ar' }), tk(' من', '2', 3900, { language: 'ar' }), tk(' الصيدلة.', '2', 4200, { language: 'ar' }),
    { text: "I'm Noura Al-Sulaiti from pharmacy.", translation_status: 'translation', speaker: '2', start_ms: 3000, end_ms: 4500, confidence: 1 },
    tk(' He', '1', 8000), tk(' takes', '1', 8300), tk(' amlo', '1', 8600, { confidence: 0.3 }), tk('dipine.', '1', 8800),
  ];
  const r = buildResult(tokens, { introEndMs: 6000, roster: ROSTER, departments: DEPARTMENTS });
  assert.equal(r.speakers.length, 2);
  assert.equal(r.speakers[0].name, 'Sara Mendes');
  assert.equal(r.speakers[1].name, 'Noura Al-Sulaiti');
  assert.equal(r.segments[1].text, "I'm Noura Al-Sulaiti from pharmacy.");
  assert.match(r.segments[1].orig, /نورة/);
  assert.match(r.segments[2].text, /\{\{\w+\|amlodipine\|\}\}\./);
  assert.equal(r.segments[0].text, "Hi I'm Sara Mendes from Nursing.");
});

import { parseIntro } from '../server/names.js';
const P = t => parseIntro(t, DEPARTMENTS);

test('name only', () => {
  assert.deepEqual(P('Khalid Al-Attiyah.'), { name: 'Khalid Al-Attiyah', role: '', org: '', dept: '' });
});
test('name, title and organisation', () => {
  assert.deepEqual(P('Good morning everyone, my name is Khalid Al-Attiyah, I\'m the finance manager at the Ministry of Public Health.'),
    { name: 'Khalid Al-Attiyah', role: 'Finance Manager', org: 'Ministry of Public Health', dept: '' });
});
test('title with "of" is not an organisation', () => {
  const r = P("I'm Aisha, director of operations at Sidra Medicine.");
  assert.equal(r.role, 'Director of Operations'); assert.equal(r.org, 'Sidra Medicine');
});
test('organisation without at/from', () => {
  assert.equal(P('Omar Farouk, legal counsel, Al Tamimi and Company.').org, 'Al Tamimi and Company');
});
test('name and department', () => {
  assert.deepEqual(P('Hi, Layla from the finance department.'), { name: 'Layla', role: '', org: '', dept: 'Finance' });
});
test('job title is not repeated as a department', () => {
  assert.equal(P("I'm Joseph, senior physiotherapist.").dept, '');
});
test('Arabic: name, title, organisation', () => {
  assert.deepEqual(P('أنا خالد العطية، مدير المالية في وزارة الصحة.'), { name: 'خالد العطية', role: 'مدير المالية', org: 'وزارة الصحة', dept: '' });
});
test('Arabic: title, department, hospital', () => {
  assert.deepEqual(P('اسمي مريم، ممرضة في قسم الطوارئ، مستشفى حمد العام.'), { name: 'مريم', role: 'ممرضة', org: 'مستشفى حمد العام', dept: 'قسم الطوارئ' });
});
test('normal talk is not an introduction', () => {
  assert.equal(P('Let us start with room twelve.').name, '');
  assert.equal(P('Okay, next item is the budget.').name, '');
});
test('"I am late" and similar are not names', () => {
  for (const t of ['Sorry I am late. The pharmacy delivery comes on Sunday.', "I'm not sure about that.", 'This is important for the family.', "I'm going to check the chart.", 'أنا متأخر، آسف.'])
    assert.equal(P(t).name, '', t);
});
test('"I am" with a real name still works', () => {
  assert.equal(P("I'm Fatima, social worker.").name, 'Fatima');
  assert.equal(P('My name is fatima al-marri.').name, 'Fatima Al-Marri');
  assert.equal(P('This is Dr. Priya.').name, 'Dr. Priya');
});
test('no introduction gives no details either', () => {
  const r = identify('Sorry I am late. The pharmacy delivery comes on Sunday.', ROSTER, DEPARTMENTS);
  assert.deepEqual([r.name, r.role, r.dept, r.org, r.how], ['', '', '', '', 'none']);
});

const line = (sp, start, text, ms = 3000, lang = 'en') => text.split(' ').map((w, i, a) => ({ text: (i ? ' ' : '') + w, speaker: sp, start_ms: start + Math.round(i * ms / a.length), end_ms: start + Math.round((i + 1) * ms / a.length), confidence: 0.95, language: lang }));
test('one person split into several voices is joined back', () => {
  const tokens = [
    ...line('1', 0, "Hi, I'm Sara Mendes, head nurse."),
    ...line('2', 4000, "Joseph Thomas, physiotherapy."),
    ...line('1', 9000, 'Mr. Khalid fell twice this week.', 4000),
    ...line('3', 13200, 'both at night', 1500),               // fragment of Sara, 1.5 s
    ...line('2', 16000, 'His gait is unsteady so I suggest a walker.', 5000),
    ...line('4', 22000, 'Great, John. We need the family meeting booked before Thursday.', 6000),   // real but unintroduced, 6 s
  ];
  const r = buildResult(tokens, { roster: ROSTER, departments: DEPARTMENTS });
  assert.deepEqual(r.speakers.map(s => s.name || 'Speaker ' + s.index), ['Sara Mendes', 'Joseph Thomas', 'Speaker 3']);
  assert.ok(r.segments.some(s => s.speaker === '1' && /both at night/.test(s.text)));
  assert.deepEqual(r.languages, ['en']);
});
test('stray foreign words do not count as a language', () => {
  const tokens = [...line('1', 0, "I'm Sara Mendes. " + 'we discussed the plan for the week in detail '.repeat(4), 8000), ...line('2', 9000, 'شكرا', 500, 'ar')];
  assert.deepEqual(buildResult(tokens, { roster: ROSTER, departments: DEPARTMENTS }).languages, ['en']);
});

test('five people who never introduce themselves are all kept', () => {
  const tokens = [];
  let t = 0;
  for (let round = 0; round < 2; round++) for (const sp of ['1', '2', '3', '4', '5']) { tokens.push(...line(sp, t, 'I think we should look at the numbers again before we decide.', 4500)); t += 5000; }
  const r = buildResult(tokens, { roster: ROSTER, departments: DEPARTMENTS });
  assert.deepEqual(r.speakers.map(s => 'Speaker ' + s.index), ['Speaker 1', 'Speaker 2', 'Speaker 3', 'Speaker 4', 'Speaker 5']);
});
test('a word with a question mark is not a name', () => {
  assert.equal(P('Village? हाँ, वैसे जी, अभी my like, native place.').name, '');
  assert.equal(P("Village? I'm like a Banjara kind of person.").name, '');
});
