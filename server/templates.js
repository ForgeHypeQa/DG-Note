// Report templates. A template is the list of sections a report has, in order, with a short
// instruction for each, plus optional style notes and an optional reference report to copy.
// Section kinds:
//   summary     short bullet points ("in 30 seconds"), shown at the top of the report
//   discussion  topics discussed, each with notes
//   decisions   what was agreed
//   actions     tasks with owner and due date
//   questions   questions left open
//   bullets     any other list (custom)
//   text        a short paragraph (custom)
export const KINDS = ['summary', 'discussion', 'decisions', 'actions', 'questions', 'bullets', 'text'];

export const BUILT_IN = [
  {
    id: 'standard', name: 'Standard minutes', builtIn: true,
    description: 'Summary, discussion, decisions, actions and open questions.',
    sections: [
      { title: 'In 30 seconds', kind: 'summary', guide: '3 to 5 bullet points a busy manager can read in 30 seconds.' },
      { title: 'Discussion', kind: 'discussion', guide: 'Each topic in the order discussed, 1 to 3 sentences of notes.' },
      { title: 'Decisions', kind: 'decisions', guide: 'Only what the group actually agreed.' },
      { title: 'Action items', kind: 'actions', guide: 'Concrete tasks with owner and due date as said.' },
      { title: 'Open questions', kind: 'questions', guide: 'Questions raised and not answered.' },
    ],
    style: '', example: '',
  },
  {
    id: 'case-review', name: 'Clinical case review', builtIn: true,
    description: 'For care teams: each resident or patient, the plan, and follow-up.',
    sections: [
      { title: 'In 30 seconds', kind: 'summary', guide: '3 to 5 bullet points: who was reviewed and the main changes.' },
      { title: 'Residents discussed', kind: 'discussion', guide: 'One topic per resident or patient (name and room if said). Notes: the concern, findings (vital signs, medicines, doses exactly as said) and the plan.' },
      { title: 'Clinical decisions', kind: 'decisions', guide: 'Changes to care, medicines and doses, referrals. Keep numbers and doses exactly as said.' },
      { title: 'Action items', kind: 'actions', guide: 'Who does what, by when.' },
      { title: 'Follow-up and review dates', kind: 'bullets', guide: 'Every review, appointment or family meeting mentioned, with its date or time.' },
      { title: 'Open questions', kind: 'questions', guide: 'Questions still to be answered, such as consent or test results.' },
    ],
    style: 'Clinical, factual and brief. Never add clinical advice that was not said in the meeting.', example: '',
  },
  {
    id: 'committee', name: 'Board or committee minutes', builtIn: true,
    description: 'Formal minutes: agenda items, resolutions, actions, next meeting.',
    sections: [
      { title: 'Summary', kind: 'summary', guide: '3 to 5 formal bullet points.' },
      { title: 'Agenda items discussed', kind: 'discussion', guide: 'One topic per agenda item, in order. Notes in formal third person ("The committee discussed…").' },
      { title: 'Resolutions', kind: 'decisions', guide: 'Formal wording: "It was resolved that…". Only what was agreed.' },
      { title: 'Action items', kind: 'actions', guide: 'Owner and due date as said.' },
      { title: 'Next meeting', kind: 'text', guide: 'Date, time and place of the next meeting if mentioned, otherwise "Not set".' },
    ],
    style: 'Formal, third person, past tense. Suitable for government and legal records.', example: '',
  },
  {
    id: 'brief', name: 'Short brief', builtIn: true,
    description: 'Just the summary and the actions.',
    sections: [
      { title: 'Summary', kind: 'summary', guide: '3 bullet points at most.' },
      { title: 'Action items', kind: 'actions', guide: 'Owner and due date as said.' },
    ],
    style: 'As short as possible.', example: '',
  },
];

// Cleans a template sent by the app (custom templates live on the phone for now).
export function clean(t) {
  if (!t || typeof t !== 'object') return BUILT_IN[0];
  if (t.id && BUILT_IN.some(b => b.id === t.id) && !Array.isArray(t.sections)) return BUILT_IN.find(b => b.id === t.id);
  const s = v => String(v || '').trim();
  const sections = (Array.isArray(t.sections) ? t.sections : [])
    .map(x => ({ title: s(x?.title).slice(0, 80), kind: KINDS.includes(x?.kind) ? x.kind : 'bullets', guide: s(x?.guide).slice(0, 600) }))
    .filter(x => x.title).slice(0, 15);
  if (!sections.length) return BUILT_IN[0];
  return { id: s(t.id).slice(0, 60) || 'custom', name: s(t.name).slice(0, 80) || 'Custom template', sections, style: s(t.style).slice(0, 1500), example: s(t.example).slice(0, 8000) };
}
