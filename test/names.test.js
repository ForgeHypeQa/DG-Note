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
