import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResult, dropAnnouncement } from '../server/build.js';
import { ROSTER, DEPARTMENTS } from '../server/roster.js';

// Make word tokens for one speaker: text split into words with a leading space, 300 ms apart.
const say = (speaker, startMs, text) => text.split(' ').map((w, i) => ({ text: (i ? ' ' : (startMs ? ' ' : '')) + w, start_ms: startMs + i * 300, end_ms: startMs + i * 300 + 250, speaker, confidence: 0.95, language: 'en' }));
const NOTICE = 'This meeting will be recorded for digital records. Please go around the table and introduce yourselves.';
const people = [...say(2, 9000, 'Hello my name is Sara Mendes, head nurse.'), ...say(3, 13000, 'I am Joseph Thomas, physiotherapist.')];
const textOf = r => r.segments.map(s => s.text.replace(/\{\{[^|]*\|([^|]*)\|\}\}/g, '$1')).join(' / ');

test('notice is cut by time when the app knows when it ended', () => {
  const r = buildResult([...say(1, 0, NOTICE), ...people], { announceEndMs: 8000, roster: ROSTER, departments: DEPARTMENTS });
  assert.ok(!/recorded for digital/i.test(textOf(r)), textOf(r));
  assert.equal(r.speakers.length, 2);
});

test('notice is cut by its wording when the time is missing, even with misheard words', () => {
  const heard = 'This meeting will be recorded for digital record. Please go round the table and introduce yourself.';
  const r = buildResult([...say(1, 600, heard), ...people], { announceEndMs: 0, roster: ROSTER, departments: DEPARTMENTS });
  assert.ok(!/digital record/i.test(textOf(r)), textOf(r));
  assert.equal(r.speakers.length, 2);
});

test('a person who mentions introductions is kept', () => {
  const toks = [...say(2, 1000, 'Okay everyone please introduce yourselves before we start the agenda today.'), ...people];
  assert.equal(dropAnnouncement(toks, 0).length, toks.length);
});

test('people speaking after the notice are untouched', () => {
  const toks = [...say(1, 0, NOTICE), ...people];
  const kept = dropAnnouncement(toks, 8000);
  assert.equal(kept.length, people.length);
});
