// Sample people for testing. No database yet: this list stands in for the
// organisation's staff directory. Names here are passed to Soniox as context
// (so it spells them right) and used to match spoken introductions.
export const ROSTER = [
  { id: 'ahmed',  name: 'Dr. Ahmed Al-Kuwari', ar: 'أحمد الكواري',  dept: 'Geriatrics',        email: 'ahmed.alkuwari@carehome.qa' },
  { id: 'sara',   name: 'Sara Mendes',         ar: 'سارة منديز',    dept: 'Nursing',           email: 'sara.mendes@carehome.qa' },
  { id: 'joseph', name: 'Joseph Thomas',       ar: 'جوزيف توماس',   dept: 'Physiotherapy',     email: 'joseph.thomas@carehome.qa' },
  { id: 'noura',  name: 'Noura Al-Sulaiti',    ar: 'نورة السليطي',  dept: 'Pharmacy',          email: 'noura.alsulaiti@carehome.qa' },
  { id: 'priya',  name: 'Dr. Priya Nair',      ar: 'بريا ناير',     dept: 'Family Medicine',   email: 'priya.nair@carehome.qa' },
  { id: 'fatima', name: 'Fatima Al-Marri',     ar: 'فاطمة المري',   dept: 'Social Work',       email: 'fatima.almarri@carehome.qa' },
  { id: 'rami',   name: 'Rami Haddad',         ar: 'رامي حداد',     dept: 'Care Coordination', email: 'rami.haddad@carehome.qa' },
];

// Words people use for each department, in English and Arabic.
export const DEPARTMENTS = {
  'Nursing':           ['nursing', 'nurse', 'nurses', 'تمريض', 'التمريض', 'ممرضة', 'ممرض'],
  'Physiotherapy':     ['physiotherapy', 'physio', 'physical therapy', 'physiotherapist', 'علاج طبيعي', 'العلاج الطبيعي'],
  'Pharmacy':          ['pharmacy', 'pharmacist', 'صيدلية', 'الصيدلية', 'صيدلة', 'الصيدلة', 'صيدلانية', 'صيدلاني'],
  'Geriatrics':        ['geriatrics', 'geriatric', 'geriatrician', 'elderly care', 'طب المسنين', 'كبار السن'],
  'Family Medicine':   ['family medicine', 'family doctor', 'general practice', 'طب الأسرة', 'طب العائلة'],
  'Social Work':       ['social work', 'social worker', 'الخدمة الاجتماعية', 'أخصائية اجتماعية', 'اخصائي اجتماعي'],
  'Care Coordination': ['care coordination', 'care coordinator', 'coordination', 'تنسيق الرعاية'],
  'Administration':    ['administration', 'admin', 'management', 'الإدارة', 'الادارة'],
};

// Extra words that help Soniox in elderly-care meetings.
export const DOMAIN_TERMS = ['amlodipine', 'metformin', 'insulin', 'blood pressure', 'physiotherapy', 'walker', 'dietitian', 'swallowing screen', 'bed-exit alarm'];
