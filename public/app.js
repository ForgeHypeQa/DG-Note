/* ================= utils ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const mmss=s=>pad(Math.floor(s/60))+':'+pad(Math.floor(s%60));
const hm=d=>pad(d.getHours())+':'+pad(d.getMinutes());
const ini=n=>n.replace(/^Dr\.\s*/,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const first=n=>/^Speaker \d+$/.test(n)?n:/^Dr\./.test(n)?n.split(/\s+/).slice(0,2).join(' '):n.split(/\s+/)[0];
const durTxt=s=>s<60?Math.max(1,Math.round(s))+' sec':Math.round(s/60)+' min';
const IC={
 chev:'<path d="M6 9l6 6 6-6"/>', back:'<path d="M15 18l-6-6 6-6"/>', fwd:'<path d="M9 6l6 6-6 6"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
 pause:'<path d="M8 5v14M16 5v14"/>', play:'<path d="M7 5l12 7-12 7z"/>', stop:'<rect x="6" y="6" width="12" height="12" rx="2.5"/>',
 share:'<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M8 20h8M12 16v4"/>',
 chat:'<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',
 people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18 14.8c2 .7 3.2 2.4 3.6 5.2"/>',
 device:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus:'<path d="M12 5v14M5 12h14"/>', send:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h8"/>', up:'<path d="M6 15l6-6 6 6"/>',
 speaker:'<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>', search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-1V4.5a1.5 1.5 0 013 0V11m0-4.5a1.5 1.5 0 013 0V14c0 4-2.5 7-6.5 7-3 0-4.6-1.5-6-4L3.3 13.6a1.5 1.5 0 012.5-1.6L8 14.5"/>',
};
const KIND_NAME={solo:'Solo',group:'Group',listen:'Listen'},KIND_ICON={solo:'device',group:'people',listen:'speaker'};
const I=(n,c='')=>`<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

/* ================= data ================= */
const C=['#DDF45B','#8BEA7A','#FF8F73','#45D3C5','#B9A8FF','#FFD45E','#7CC3FF','#FF9FCB'];
const DIR={
 ahmed:{n:'Dr. Ahmed Al-Kuwari',d:'Geriatrics',e:'ahmed.alkuwari@carehome.qa',c:C[3]},
 sara:{n:'Sara Mendes',d:'Nursing',e:'sara.mendes@carehome.qa',c:C[0]},
 joseph:{n:'Joseph Thomas',d:'Physiotherapy',e:'joseph.thomas@carehome.qa',c:C[1]},
 noura:{n:'Noura Al-Sulaiti',d:'Pharmacy',e:'noura.alsulaiti@carehome.qa',c:C[2]},
 priya:{n:'Dr. Priya Nair',d:'Family Medicine',e:'priya.nair@carehome.qa',c:C[4]},
 fatima:{n:'Fatima Al-Marri',d:'Social Work',e:'fatima.almarri@carehome.qa',c:C[5]},
 rami:{n:'Rami Haddad',d:'Care Coordination',e:'rami.haddad@carehome.qa',c:C[6]},
};
const ME='ahmed';
const person=id=>({...DIR[id]});
const emailFor=n=>{const k=Object.keys(DIR).find(k=>DIR[k].n.toLowerCase()===n.trim().toLowerCase());return k?DIR[k].e:'';};
const LANG={en:{name:'English',full:'English (original)'},ar:{name:'العربية',full:'العربية · Arabic',rtl:true},hi:{name:'हिन्दी',full:'हिन्दी · Hindi'},bn:{name:'বাংলা',full:'বাংলা · Bangla'}};
const LBL={
 orig:{sum:'In 30 seconds',dec:'Decisions',act:'Action items',qs:'Questions',ppl:'People',tx:'Transcript',rec:'Recording'},
 en:{sum:'In 30 seconds',dec:'Decisions',act:'Action items',qs:'Questions',ppl:'People',tx:'Transcript',rec:'Recording'},
 ar:{sum:'في 30 ثانية',dec:'القرارات',act:'المهام',qs:'الأسئلة',ppl:'الحضور',tx:'النص',rec:'التسجيل'},
 hi:{sum:'30 सेकंड में',dec:'निर्णय',act:'कार्य',qs:'प्रश्न',ppl:'उपस्थित लोग',tx:'ट्रांसक्रिप्ट',rec:'रिकॉर्डिंग'},
 bn:{sum:'৩০ সেকেন্ডে',dec:'সিদ্ধান্ত',act:'করণীয়',qs:'প্রশ্ন',ppl:'উপস্থিতি',tx:'ট্রান্সক্রিপ্ট',rec:'রেকর্ডিং'},
};
// Languages a report or live text can be shown in, besides English. [code, short label, name, own name]
const LANG2=[['ar','AR','Arabic','العربية'],['bn','BN','Bangla','বাংলা'],['hi','HI','Hindi','हिन्दी'],['ur','UR','Urdu','اردو'],['ml','ML','Malayalam','മലയാളം'],['ta','TA','Tamil','தமிழ்'],['ne','NE','Nepali','नेपाली'],['si','SI','Sinhala (Sri Lanka)','සිංහල'],
  ['fil','FIL','Filipino','Filipino'],['id','ID','Bahasa Indonesia','Bahasa Indonesia'],['ms','MS','Malay','Bahasa Melayu'],['fr','FR','French','Français'],['es','ES','Spanish','Español'],['it','IT','Italian','Italiano'],['de','DE','German','Deutsch'],['nl','NL','Dutch','Nederlands'],
  ['zh','ZH','Chinese','中文'],['ja','JA','Japanese','日本語'],['ko','KO','Korean','한국어'],['th','TH','Thai','ไทย']];
const langOf=c=>c==='en'?['en','EN','English','English']:(LANG2.find(x=>x[0]===c)||LANG2[0]);
const isRtl=c=>c==='ar'||c==='ur';
const LANG_ALL=[['en','EN','English','English'],...LANG2];
const lsGet=k=>{try{return localStorage.getItem(k+(ME_USER?.id||'x'));}catch(e){return null;}},lsSet=(k,v)=>{try{localStorage.setItem(k+(ME_USER?.id||'x'),v);}catch(e){}};
const lang1=()=>{const c=lsGet('dg-lang1-');return LANG_ALL.some(x=>x[0]===c)?c:'en';};
const lang2Pref=()=>{const c=lsGet('dg-lang2-');return LANG_ALL.some(x=>x[0]===c)?c:'auto';};
// The second language of a report: the user's fixed choice, or else the other language spoken in it.
function secFor(r){const p=lang1(),c=lang2Pref();if(c!=='auto'&&c!==p)return c;
  const spoken=(r?repLangs(r):[]).find(x=>x!==p&&LANG_ALL.some(y=>y[0]===x));return spoken||(p==='en'?'ar':'en');}
function openLangSet(){const p=lang1(),c=lang2Pref(),r=curRep();
  sheet(`<h3>Languages</h3><p>Set this once. Every report opens in your first language, and your second language is one tap away.</p><div class="stk">
    <button class="lrowb two" data-act="lang-list" data-for="p1"><span class="grow"><small>First language</small><b>${langOf(p)[2]}</b></span>${I('fwd','s')}</button>
    <button class="lrowb two" data-act="lang-list" data-for="p2"><span class="grow"><small>Second language</small><b>${c==='auto'||c===p?'Automatic: the other language spoken'+(r&&r.real?' · '+langOf(secFor(r))[2]+' in this report':''):langOf(c)[2]}</b></span>${I('fwd','s')}</button>
    <button class="btnk" data-act="close">Done</button></div>`);}
function openLangs(forWhat,cur){
  const T={lis:['Show the text in','The live text is shown in this language when the toggle is on.'],p1:['First language','Reports open in this language.'],p2:['Second language','One tap switches a report to this language.']}[forWhat];
  const row=(c,n,own,sh)=>`<button class="lrowb" data-act="lang-pick" data-c="${c}" data-for="${forWhat}"><span class="grow">${n} <small>${own===n?'':own}</small></span>${c===cur?I('check','s'):`<small>${sh}</small>`}</button>`;
  sheet(`<h3>${T[0]}</h3><p>${T[1]}</p><div class="helpsc">${forWhat==='p2'?row('auto','Automatic','the other language spoken in the meeting',''):''}${LANG_ALL.filter(x=>forWhat!=='p2'||x[0]!==lang1()).map(([c,sh,n,own])=>row(c,n,own,sh)).join('')}</div><div class="stk"><button class="btng" data-act="${forWhat==='lis'?'close':'lang-set'}">${forWhat==='lis'?'Cancel':'Back'}</button></div>`);
}
/* Unclear words are written {{id|heard|alternative}} */
const TR={
 A:{ar:{sum:['حادثة كادت تقع: أُخذت عبوة ميتفورمين بدلاً من عبوة مشابهة على الرف نفسه. لم يتضرر المقيم.','سجلات ثلاجة الإنسولين مكتملة لهذا الشهر.'],dec:['تخزين العبوات المتشابهة على رفوف منفصلة مع ملصقات حمراء.','الاستمرار في تحقق ممرضة ثانية من كل جرعة إنسولين.'],act:[{t:'إعادة وضع الملصقات على العبوات المتشابهة',due:'اليوم'},{t:'إبلاغ فريق المناوبة الليلية',due:'غداً'}],qs:[]},
    hi:{sum:['चूक होते-होते बची: उसी शेल्फ़ पर रखे मिलते-जुलते पैक की जगह मेटफ़ॉर्मिन का पैक उठा लिया गया। निवासी को कोई नुकसान नहीं हुआ।','इंसुलिन फ्रिज के रिकॉर्ड इस महीने पूरे थे।'],dec:['मिलते-जुलते पैक अलग शेल्फ़ पर लाल लेबल के साथ रखें।','हर इंसुलिन खुराक पर दूसरी नर्स की जाँच जारी रखें।'],act:[{t:'मिलते-जुलते पैक पर नए लेबल लगाएँ',due:'आज'},{t:'रात की टीम को जानकारी दें',due:'कल'}],qs:[]},
    bn:{sum:['অল্পের জন্য ভুল এড়ানো গেছে: একই তাকে রাখা দেখতে একই রকম প্যাকের বদলে মেটফরমিনের প্যাক তোলা হয়েছিল। বাসিন্দার কোনো ক্ষতি হয়নি।','ইনসুলিন ফ্রিজের রেকর্ড এই মাসে সম্পূর্ণ ছিল।'],dec:['দেখতে একই রকম প্যাকগুলো লাল লেবেলসহ আলাদা তাকে রাখা।','প্রতিটি ইনসুলিন ডোজে দ্বিতীয় নার্সের চেক চালু রাখা।'],act:[{t:'দেখতে একই রকম প্যাকগুলোতে নতুন লেবেল লাগানো',due:'আজ'},{t:'রাতের টিমকে জানানো',due:'আগামীকাল'}],qs:[]}},
 B:{ar:{sum:['تم تحديد ثلاثة اجتماعات عائلية للأسبوع القادم.','طلبت العائلات تمديد ساعات الزيارة في عطلة نهاية الأسبوع.'],dec:['تمديد الزيارة في عطلة نهاية الأسبوع حتى الساعة 20:00 لمدة شهر تجريبي.','إرسال تحديث شهري للعائلات عبر واتساب.'],act:[{t:'إبلاغ العائلات بالساعات الجديدة',due:'تم'},{t:'تحديث جدول الاستقبال',due:'تم'}],qs:[]},
    hi:{sum:['अगले सप्ताह के लिए तीन पारिवारिक बैठकें तय हैं।','परिवारों ने सप्ताहांत में मिलने का समय बढ़ाने की माँग की।'],dec:['एक महीने के परीक्षण के लिए सप्ताहांत में मिलने का समय 20:00 बजे तक बढ़ाएँ।','परिवारों को हर महीने व्हाट्सऐप पर अपडेट भेजें।'],act:[{t:'परिवारों को नए समय की जानकारी दें',due:'पूरा हुआ'},{t:'रिसेप्शन का रोस्टर अपडेट करें',due:'पूरा हुआ'}],qs:[]},
    bn:{sum:['আগামী সপ্তাহের জন্য তিনটি পারিবারিক বৈঠক ঠিক করা হয়েছে।','পরিবারগুলো সপ্তাহান্তে দেখা করার সময় বাড়ানোর অনুরোধ করেছে।'],dec:['এক মাসের পরীক্ষামূলকভাবে সপ্তাহান্তে দেখা করার সময় রাত ৮টা পর্যন্ত বাড়ানো।','পরিবারগুলোকে প্রতি মাসে হোয়াটসঅ্যাপে আপডেট পাঠানো।'],act:[{t:'পরিবারগুলোকে নতুন সময় জানানো',due:'সম্পন্ন'},{t:'রিসেপশনের রোস্টার আপডেট করা',due:'সম্পন্ন'}],qs:[]}},
 C:{ar:{sum:['سقط السيد خالد (الغرفة 12) مرتين هذا الأسبوع، وكلتاهما ليلاً.','مشّاية وعلاج طبيعي مرتين أسبوعياً، وفحوصات ليلية كل ساعتين ابتداءً من الليلة.','تم خفض جرعة الأملوديبين من 10 ملغ إلى 5 ملغ بعد قراءة ضغط 112/68 عند الوقوف.'],dec:['البدء باستخدام مشّاية وعلاج طبيعي مرتين أسبوعياً.','فحوصات ليلية كل ساعتين، ابتداءً من الليلة.','خفض الأملوديبين من 10 ملغ إلى 5 ملغ والمراجعة يوم الاثنين القادم.'],act:[{t:'بدء الفحوصات الليلية كل ساعتين للغرفة 12',due:'الليلة'},{t:'تقييم المشّاية',due:'غداً'},{t:'تحديث وصفة الأملوديبين إلى 5 ملغ',due:'اليوم'}],qs:[]},
    hi:{sum:['श्री खालिद (कमरा 12) इस सप्ताह दो बार गिरे, दोनों बार रात में।','वॉकर और सप्ताह में दो बार फिजियोथेरेपी; आज रात से हर 2 घंटे में रात की जाँच।','खड़े होने पर 112/68 का दबाव मिलने के बाद एम्लोडिपिन की खुराक 10 mg से घटाकर 5 mg की गई।'],dec:['वॉकर और सप्ताह में दो बार फिजियोथेरेपी शुरू करें।','आज रात से हर 2 घंटे में रात की जाँच।','एम्लोडिपिन 10 mg से घटाकर 5 mg करें और अगले सोमवार को समीक्षा करें।'],act:[{t:'कमरा 12 के लिए हर 2 घंटे की रात की जाँच शुरू करें',due:'आज रात'},{t:'वॉकर का आकलन',due:'कल'},{t:'एम्लोडिपिन का पर्चा 5 mg में बदलें',due:'आज'}],qs:[]},
    bn:{sum:['জনাব খালিদ (রুম ১২) এই সপ্তাহে দুবার পড়ে গেছেন, দুবারই রাতে।','ওয়াকার এবং সপ্তাহে দুবার ফিজিওথেরাপি; আজ রাত থেকে প্রতি ২ ঘণ্টায় রাতের চেক।','দাঁড়ানো অবস্থায় প্রেশার ১১২/৬৮ পাওয়ায় অ্যামলোডিপিনের ডোজ ১০ মি.গ্রা. থেকে কমিয়ে ৫ মি.গ্রা. করা হয়েছে।'],dec:['ওয়াকার এবং সপ্তাহে দুবার ফিজিওথেরাপি শুরু করা।','আজ রাত থেকে প্রতি ২ ঘণ্টায় রাতের চেক।','অ্যামলোডিপিন ১০ মি.গ্রা. থেকে কমিয়ে ৫ মি.গ্রা. করা এবং আগামী সোমবার পর্যালোচনা।'],act:[{t:'রুম ১২-এর জন্য প্রতি ২ ঘণ্টায় রাতের চেক শুরু করা',due:'আজ রাতে'},{t:'ওয়াকার মূল্যায়ন',due:'আগামীকাল'},{t:'অ্যামলোডিপিনের প্রেসক্রিপশন ৫ মি.গ্রা.-তে আপডেট করা',due:'আজ'}],qs:[]}},
 D:{ar:{sum:['السيد خالد (الغرفة 12): سقطتان ليلاً مرتبطتان بانخفاض الضغط عند الوقوف. تم خفض الأملوديبين من 10 ملغ إلى 5 ملغ.','اجتماع عائلي مع ابنته يوم الخميس الساعة 11:00.','السيدة مريم (الغرفة 7) فقدت 2 كغ خلال شهر. تحويل إلى أخصائي التغذية وفحص للبلع هذا الأسبوع.'],dec:['خفض الأملوديبين إلى 5 ملغ مرة يومياً، ومراجعة الأدوية الأخرى الأسبوع القادم.','مشّاية وعلاج طبيعي مرتين أسبوعياً وفحوصات ليلية كل ساعتين للسيد خالد.','تحويل السيدة مريم إلى أخصائي التغذية وإجراء فحص البلع هذا الأسبوع.'],act:[{t:'تحديث وصفة الأملوديبين وإبلاغ فريق التمريض',due:'اليوم'},{t:'بدء الفحوصات الليلية كل ساعتين، الغرفة 12',due:'الليلة'},{t:'تقييم المشّاية؛ فحص البلع، الغرفة 7',due:'غداً'},{t:'حجز الاجتماع العائلي؛ ترتيب أخصائي نطق',due:'الخميس'}],qs:['هل لدينا موافقة العائلة على جهاز إنذار مغادرة السرير؟','هل يمكن أن تكون أدويتها سبباً في قلة شهيتها؟']},
    hi:{sum:['श्री खालिद (कमरा 12): रात में दो बार गिरना, जो खड़े होने पर कम रक्तचाप से जुड़ा है। एम्लोडिपिन 10 mg से घटाकर 5 mg की गई।','उनकी बेटी के साथ पारिवारिक बैठक गुरुवार को 11:00 बजे।','श्रीमती मरियम (कमरा 7) का वज़न एक महीने में 2 किलो घटा। इस सप्ताह आहार विशेषज्ञ को रेफ़रल और निगलने की जाँच।'],dec:['एम्लोडिपिन घटाकर 5 mg दिन में एक बार; अगले सप्ताह अन्य दवाओं की समीक्षा।','श्री खालिद के लिए वॉकर, सप्ताह में दो बार फिजियोथेरेपी और हर 2 घंटे में रात की जाँच।','इस सप्ताह श्रीमती मरियम के लिए आहार विशेषज्ञ को रेफ़रल और निगलने की जाँच।'],act:[{t:'एम्लोडिपिन का पर्चा बदलें और नर्सिंग टीम को बताएँ',due:'आज'},{t:'कमरा 12 में हर 2 घंटे की रात की जाँच शुरू करें',due:'आज रात'},{t:'वॉकर का आकलन; कमरा 7 में निगलने की जाँच',due:'कल'},{t:'पारिवारिक बैठक तय करें; स्पीच थेरेपिस्ट की व्यवस्था करें',due:'गुरुवार'}],qs:['क्या बेड-एग्ज़िट अलार्म के लिए परिवार की सहमति है?','क्या उनकी दवाओं से भूख कम हो रही हो सकती है?']},
    bn:{sum:['জনাব খালিদ (রুম ১২): রাতে দুবার পড়ে যাওয়া, যা দাঁড়ালে রক্তচাপ কমে যাওয়ার সাথে সম্পর্কিত। অ্যামলোডিপিন ১০ মি.গ্রা. থেকে কমিয়ে ৫ মি.গ্রা. করা হয়েছে।','তাঁর মেয়ের সাথে পারিবারিক বৈঠক বৃহস্পতিবার সকাল ১১:০০টায়।','মিসেস মরিয়ম (রুম ৭)-এর ওজন এক মাসে ২ কেজি কমেছে। এই সপ্তাহে ডায়েটিশিয়ানের কাছে রেফারেল এবং গিলতে পারার পরীক্ষা।'],dec:['অ্যামলোডিপিন কমিয়ে দিনে একবার ৫ মি.গ্রা.; আগামী সপ্তাহে অন্যান্য ওষুধ পর্যালোচনা।','জনাব খালিদের জন্য ওয়াকার, সপ্তাহে দুবার ফিজিওথেরাপি এবং প্রতি ২ ঘণ্টায় রাতের চেক।','এই সপ্তাহে মিসেস মরিয়মের জন্য ডায়েটিশিয়ান রেফারেল এবং গিলতে পারার পরীক্ষা।'],act:[{t:'অ্যামলোডিপিনের প্রেসক্রিপশন আপডেট করা এবং নার্সিং টিমকে জানানো',due:'আজ'},{t:'রুম ১২-এ প্রতি ২ ঘণ্টায় রাতের চেক শুরু করা',due:'আজ রাতে'},{t:'ওয়াকার মূল্যায়ন; রুম ৭-এ গিলতে পারার পরীক্ষা',due:'আগামীকাল'},{t:'পারিবারিক বৈঠক ঠিক করা; স্পিচ থেরাপিস্টের ব্যবস্থা করা',due:'বৃহস্পতিবার'}],qs:['বেড-এক্সিট অ্যালার্মের জন্য কি পরিবারের সম্মতি আছে?','তাঁর ওষুধের কারণে কি ক্ষুধা কমে যেতে পারে?']}},
};
const blank=()=>({res:{},ed:{},hist:[],add:{sum:[],dec:[]}});
function seedReports(){
  return [
   {id:'A',kind:'solo',title:'Medication Safety Huddle',when:'Today',time:'08:30 – 08:44',dur:'14 min',by:'Noura Al-Sulaiti (her phone)',status:'draft',
    people:[person('noura'),person('sara'),person('ahmed')],
    sum:['Near-miss: a {{a1|metformin|metoprolol}} pack was picked instead of a look-alike pack on the same shelf. No harm to the resident.','Insulin fridge logs were complete for the month.'],
    dec:['Store look-alike packs on separate shelves with red labels.','Keep the second-nurse check for every insulin dose.'],
    act:[{p:0,t:'Re-label look-alike packs',due:'Today'},{p:1,t:'Brief the night team',due:'Tomorrow'}],qs:[],
    tx:[{p:0,t:'08:31',s:'Yesterday a {{a1|metformin|metoprolol}} pack was picked instead of the look-alike pack next to it.'},{p:1,t:'08:33',s:'The second nurse caught it before the dose. No harm to the resident.'},{p:2,t:'08:36',s:'Move the look-alike packs to separate shelves and label them in red.'},{p:1,t:'08:40',s:'The night team gave {{a2|10 units|2 units}} of insulin correctly after the double check.'}],
    tr:TR.A,...blank()},
   {id:'B',kind:'group',title:'Family Liaison Planning',when:'Thu 5 Nov',time:'13:00 – 13:50',dur:'50 min',by:'Fatima Al-Marri',status:'sent',sentAt:'Thu 5 Nov, 14:20',
    people:[person('fatima'),person('sara'),person('rami'),person('ahmed')],
    sum:['Three family meetings are scheduled for next week.','Families asked for longer weekend visiting hours.'],
    dec:['Extend weekend visiting to 20:00 for a one-month trial.','Send families a monthly update by WhatsApp.'],
    act:[{p:0,t:'Tell families about the new hours',due:'Done'},{p:2,t:'Update the reception rota',due:'Done'}],qs:[],
    tx:[{p:0,t:'13:04',s:'Three family meetings are booked for next week.',o:'عندنا ثلاث اجتماعات مع العائلات الأسبوع الجاي.'},{p:1,t:'13:12',s:'Families keep asking for longer visiting hours at the weekend.'},{p:3,t:'13:20',s:'Let’s extend weekend visiting to 20:00 for a one-month trial.'},{p:2,t:'13:31',s:'I’ll update the reception rota today.'}],
    tr:TR.B,...blank()},
  ];
}

/* ================= state ================= */
let ST, TM=[];
const T=(fn,ms)=>{const id=setTimeout(fn,ms);TM.push(id);return id;};
function fresh(){
  TM.forEach(clearTimeout);TM=[];
  ST={tab:'solo',open:{},
   solo:{mode:'solo',lkind:'video',lmic:true,live:[],voices:0,ltr:false,ltarget:null,mini:false,lurl:'',phase:'idle',title:'',t:0,paused:false,introEndMs:0,startedAt:0,speakers:[],result:null,blob:null,mid:null,rid:null,step:'',err:'',upPct:0,pending:null},
   group:{phase:'lobby',live:true,joined:false,sim:false,elapsed:23*60+14,paused:false,hands:[],sharing:null,stageOpen:true,chat:[],qs:[],talk:'sara',unChat:0,unQs:0,
     people:['sara','priya','noura','fatima','joseph','rami'],pi:0,rid:null,
     upcoming:[{t:'Medication Safety Review',w:'Tomorrow · 11:00',by:'Noura'},{t:'Monthly Quality & Incidents',w:'Thu 12 Nov · 14:00',by:'Rami'}]},
   reports:seedReports(), rep:{id:null,lang:'orig',edit:false,filter:'all',q:'',focus:'sum',play:null,dictating:false,di:0}};
}
const curRep=()=>ST.reports.find(r=>r.id===ST.rep.id);

/* ================= shared pieces ================= */
function capsheet(cap,sheet){return `<div class="capwrap"><div class="cap">${cap}</div></div><div class="sheetwrap"><div class="sheet">${sheet}</div></div>`;}
/* ---------- Read aloud: the phone's own voice reads a section, or the whole report ---------- */
const RD={on:false,paused:false,sec:null,q:[],i:0,rid:null,view:null,spoke:false};
const READABLE=id=>/^r-(top|dec|act|qs|tx|x-)/.test(id)&&ST.tab==='reports'&&!!curRep()?.real;
const readBtn=(sec,cls)=>{const on=RD.on&&RD.sec===sec&&!RD.paused;return `<button class="rdb ${cls||''} ${RD.on&&RD.sec===sec?'on':''}" data-act="read" data-sec="${sec}" aria-label="${on?'Pause reading':sec==='all'?'Read the whole report aloud':'Read this section aloud'}">${I(on?'pause':'play','s')}</button>`;};
const VPRE={fil:['fil','tl'],id:['id','in'],zh:['zh','cmn','yue'],ms:['ms'],ne:['ne'],si:['si']};
let VOICES=[];
const loadVoices=()=>{try{VOICES=speechSynthesis.getVoices()||[];}catch(e){VOICES=[];}return VOICES;};
try{loadVoices();speechSynthesis.addEventListener('voiceschanged',loadVoices);}catch(e){}
const voiceFor=c=>{const pre=VPRE[c]||[c];return VOICES.find(v=>pre.some(p=>{const l=(v.lang||'').toLowerCase().replace('_','-');return l===p||l.startsWith(p+'-');}));};
// In the as-spoken view each line is read in the language it is written in.
const scriptLang=t=>/[ঀ-৿]/.test(t)?'bn':/[؀-ۿ]/.test(t)?'ar':/[ऀ-ॿ]/.test(t)?'hi':/[஀-௿]/.test(t)?'ta':/[ഀ-ൿ]/.test(t)?'ml':/[඀-෿]/.test(t)?'si':/[฀-๿]/.test(t)?'th':/[぀-ヿ]/.test(t)?'ja':/[가-힯]/.test(t)?'ko':/[一-鿿]/.test(t)?'zh':'en';
function readPieces(sec){
  const clean=el=>(el?el.textContent:'').replace(/\s+/g,' ').trim(),out=[];
  const from=root=>{if(!root)return;root.querySelectorAll('li, .act, p.xtext, .txl').forEach(el=>{
    if(el.matches('.txl')){const t=clean(el.querySelector('.tt'));if(t)out.push(clean(el.querySelector('.sp'))+'. '+t);}
    else if(el.matches('.act')){const t=[...el.children].filter(c=>!c.classList.contains('am')).map(clean).filter(Boolean).join('. '),o=clean(el.querySelector('.am .sp'));if(t)out.push(t+(o?'. '+o:''));}
    else{const t=clean(el);if(t)out.push(t);}});};
  if(sec==='sum'||sec==='all'){const u=$('#view .sum');if(u)u.querySelectorAll('li').forEach(li=>{const t=clean(li);if(t)out.push(t);});}
  if(sec==='all')$$('#view .dr').forEach(d=>{const id=d.dataset.dr;if(READABLE(id)&&id!=='r-tx'){const h=clean(d.querySelector('.drt')),n=out.length;from(d.querySelector('.drpad'));if(out.length>n)out.splice(n,0,h);}});
  else if(sec!=='sum')from($(`#view .dr[data-dr="${sec}"] .drpad`));
  return out;
}
function readSync(){$$('.rdb').forEach(b=>{const mine=RD.on&&RD.sec===b.dataset.sec,playing=mine&&!RD.paused;b.classList.toggle('on',mine);b.innerHTML=I(playing?'pause':'play','s');b.setAttribute('aria-label',playing?'Pause reading':b.dataset.sec==='all'?'Read the whole report aloud':'Read this section aloud');});}
function readStop(){if(!RD.on)return;RD.on=false;RD.paused=false;RD.sec=null;try{speechSynthesis.cancel();}catch(e){}readSync();}
function readNoVoice(code){readStop();const n=langOf(code)[2];sheet(`<h3>${esc(n)} cannot be read aloud here</h3><p>This phone has no voice for ${esc(n)}. Upgrading to a higher plan will support your language.</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);}
function readNext(){
  if(!RD.on||RD.paused)return;
  while(RD.i<RD.q.length){
    const text=RD.q[RD.i],code=RD.view==='orig'?scriptLang(text):RD.view,v=voiceFor(code);
    if(!v&&VOICES.length){if(RD.view!=='orig')return readNoVoice(code);RD.i++;continue;}   // as spoken: skip lines this phone cannot read
    const u=new SpeechSynthesisUtterance(text),tok=RD.tok;if(v){u.voice=v;u.lang=v.lang;}else u.lang=(VPRE[code]||[code])[0];
    u.onend=()=>{if(RD.tok!==tok||!RD.on||RD.paused)return;RD.spoke=true;RD.i++;readNext();};
    u.onerror=e=>{if(RD.tok!==tok||!RD.on||RD.paused||e.error==='canceled'||e.error==='interrupted')return;if(RD.view!=='orig'&&!RD.spoke)return readNoVoice(code);RD.i++;readNext();};
    try{speechSynthesis.speak(u);}catch(e){return readNoVoice(code);}
    return;
  }
  const none=!RD.spoke&&RD.view==='orig'&&RD.q.length;readStop();if(none)readNoVoice(scriptLang(RD.q[0]));
}
async function readToggle(sec){
  if(!('speechSynthesis' in window))return toast('This browser cannot read aloud');
  if(RD.on&&RD.sec===sec){RD.paused=!RD.paused;RD.tok=Math.random();try{speechSynthesis.cancel();}catch(e){}readSync();if(!RD.paused)setTimeout(readNext,120);return;}   // pause keeps the place; play carries on from it
  readStop();const q=readPieces(sec);if(!q.length)return toast('Nothing to read in this section yet');
  if(!loadVoices().length)await new Promise(r=>setTimeout(r,700)),loadVoices();
  Object.assign(RD,{on:true,paused:false,sec,q,i:0,rid:curRep()?.id,lang:ST.rep.lang,view:sec==='r-tx'&&ST.rep.txOrig!==false?'orig':ST.rep.lang,spoke:false,tok:Math.random()});
  $$('.aud').forEach(a=>a.pause());readSync();readNext();
}
function drawer(id,title,count,body,defOpen,preview){
  const open=ST.open[id]!==undefined?ST.open[id]:!!defOpen;
  const rd=READABLE(id);
  return `<section class="dr ${open?'open':''}" data-dr="${id}"><button class="drh" aria-expanded="${open}"><span class="drt">${title}</span><span class="drc" id="drc-${id}">${count===0||count?count:''}</span><span class="drp" id="drp-${id}">${preview||''}</span>${rd?'<span class="rdsp"></span>':''}${I('chev','chev')}</button>${rd?readBtn(id):''}<div class="drb"><div class="dri"><div class="drpad">${body}</div></div></div></section>`;
}
function toast(html){const t=document.createElement('div');t.className='toast';t.innerHTML=html;const box=$('#toasts');while(box.children.length>1)box.firstChild.remove();box.appendChild(t);setTimeout(()=>t.remove(),3200);}
function sheet(html){$('#bsheet').innerHTML='<div class="grab"></div>'+html;$('#bsheet').classList.add('on');$('#scrim').classList.add('on');}
function closeSheet(){$('#bsheet').classList.remove('on');$('#scrim').classList.remove('on');}
function procView(title,sub,steps,pi,openAct,backAct,backLabel){
  const done=pi>=steps.length;
  return capsheet(`<div class="eyebrow">${done?'Report ready':'Recording saved'}</div><h1 class="lt">${done?'All done':'Meeting ended'}</h1><p class="sub">${sub}</p>`,
   `<div class="pcard">${steps.map((s,i)=>`<div class="pst ${i<pi?'done':i===pi?'run':''}"><span class="pic">${i<pi?I('check','s'):i===pi?'':i+1}</span><span>${s}</span></div>`).join('')}</div>
    ${done?`<button class="cta" data-act="${openAct}">Open the report</button><button class="btn2" data-act="${backAct}">${backLabel}</button>`:`<p class="fine">You can leave this screen. The report appears under Reports when it is ready.</p>`}`);
}
function runProc(scope,n,done){scope.pi=0;const step=()=>{scope.pi++;if(scope.pi>=n)done();render();if(scope.pi<n)T(step,900);};T(step,900);}

/* ================= SOLO · real recording ================= */
// Flow: record on this phone (saved every 5 s) → end → upload once → Qalm transcription
// (speakers + Arabic/English + translation) → names from the introductions → review → report.
const API = location.protocol.startsWith('http') ? '' : 'http://localhost:3000';
let ROSTER = Object.keys(DIR).map(k=>({id:k,name:DIR[k].n,dept:DIR[k].d,email:DIR[k].e}));
let HEALTH = null;
async function loadServer(){
  try{
    HEALTH = await fetch(API+'/api/health').then(r=>r.json());
    const r = await fetch(API+'/api/roster').then(r=>r.json()); if(r.people) ROSTER=r.people;
  }catch(e){ HEALTH={offline:true}; }
  if((ST.tab==='solo'||ST.tab==='listen')&&ST.solo.phase==='idle') render();
}
const rosterBy=n=>ROSTER.find(p=>p.name.toLowerCase()===String(n).trim().toLowerCase());

/* --- storage on this phone (IndexedDB). No server database. --- */
// Everything is kept on this phone until the database is connected:
//   meetings: one row per recording (title, times, owner, state)
//   chunks:   the audio, saved every 5 s while recording (part = a new piece after the phone stopped recording)
//   reports:  finished transcripts with names, edits, change history and the audio
const DB={db:null,
  open(){return this.db||(this.db=new Promise((res,rej)=>{const q=indexedDB.open('dg-note',3);q.onupgradeneeded=()=>{const d=q.result;
    if(!d.objectStoreNames.contains('meetings'))d.createObjectStore('meetings',{keyPath:'mid'});
    if(!d.objectStoreNames.contains('chunks'))d.createObjectStore('chunks',{keyPath:['mid','i']});
    if(!d.objectStoreNames.contains('reports'))d.createObjectStore('reports',{keyPath:'id'});
    if(!d.objectStoreNames.contains('templates'))d.createObjectStore('templates',{keyPath:'id'});};
    q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);}));},
  async run(store,mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(store,mode);const q=fn(t.objectStore(store));t.oncomplete=()=>res(q&&'result' in q?q.result:undefined);t.onerror=()=>rej(t.error);});},
  put(store,v){return this.run(store,'readwrite',s=>s.put(v));},
  get(store,k){return this.run(store,'readonly',s=>s.get(k));},
  all(store){return this.run(store,'readonly',s=>s.getAll());},
  async rawChunks(mid){const a=await this.run('chunks','readonly',s=>s.getAll(IDBKeyRange.bound([mid,0],[mid,Infinity])));return (a||[]).sort((x,y)=>x.i-y.i);},
  // returns one Blob per recorded part
  async parts(mid,mime){const by=new Map();for(const c of await this.rawChunks(mid)){const p=c.part||0;if(!by.has(p))by.set(p,[]);by.get(p).push(c.blob);}
    return [...by.keys()].sort((a,b)=>a-b).map(k=>new Blob(by.get(k),{type:mime||'audio/webm'}));},
  del(store,k){return this.run(store,'readwrite',s=>s.delete(k));},
  async remove(mid){await this.run('chunks','readwrite',s=>s.delete(IDBKeyRange.bound([mid,0],[mid,Infinity])));await this.run('meetings','readwrite',s=>s.delete(mid));},
  async patch(mid,v){const m=await this.get('meetings',mid);if(m)await this.put('meetings',{...m,...v});},
};

/* --- recorder --- */
const REC={stream:null,mr:null,mime:'',mid:null,i:0,part:0,bytes:0,saves:[],ctx:null,raf:0,lock:null,hiddenAt:0,stopping:false,lost:false};
function pickMime(){for(const m of ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'])if(window.MediaRecorder&&MediaRecorder.isTypeSupported(m))return m;return '';}
const recording=()=>REC.mr&&REC.mr.state!=='inactive';
// One recording runs at a time. It belongs to Solo (the microphone) or Listen (the computer's sound).
const autoKey=()=>'dg-auto-report-'+(ME_USER?.id||'x');
const autoReport=()=>{try{return localStorage.getItem(autoKey())==='1';}catch(e){return false;}};
const isListen=()=>ST.solo.mode==='listen';
const onRecTab=()=>ST.tab===(isListen()?'listen':'solo');
let FILE_MODE='solo';
const savedTxt=()=>isListen()?`${(REC.bytes/1048576).toFixed(1)} MB`:`Saved on this phone · ${(REC.bytes/1048576).toFixed(1)} MB`;
async function recStart(continueMid,src){
  if(!window.isSecureContext) throw new Error('The microphone only works over https (or on localhost). Open Qalm from its https address.');
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder) throw new Error('This browser cannot record audio. Use Chrome on Android or Safari on iPhone.');
  const stream=src?.stream||await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true,channelCount:1}});
  const mime=pickMime(), mr=new MediaRecorder(stream,mime?{mimeType:mime,audioBitsPerSecond:64000}:{});
  let mid,part=0,i=0,bytes=0;
  if(continueMid){
    mid=continueMid;const old=await DB.rawChunks(mid);
    part=old.reduce((m,c)=>Math.max(m,(c.part||0)+1),0);i=old.reduce((m,c)=>Math.max(m,c.i+1),0);bytes=old.reduce((n,c)=>n+(c.blob?.size||0),0);
    await DB.patch(mid,{state:'recording',parts:part+1});
  }else{
    mid='m'+Date.now();
    await DB.put('meetings',{mid,owner:ME_USER?.id,title:ST.solo.title,mime:(mr.mimeType||mime||'audio/webm'),startedAt:Date.now(),introEndMs:0,durationSec:0,state:'recording',parts:1,mode:ST.solo.mode||'solo',lkind:ST.solo.lkind});
  }
  Object.assign(REC,{stream,mr,mime:(mr.mimeType||mime||'audio/webm'),mid,i,part,bytes,saves:[],stopping:false,lost:false});
  try{navigator.storage?.persist?.();}catch(e){}
  mr.ondataavailable=e=>{ if(!e.data||!e.data.size) return; REC.bytes+=e.data.size;
    REC.saves.push(DB.put('chunks',{mid,i:REC.i++,part,blob:e.data}).catch(()=>toast('Could not save audio on this phone. Is storage full?')));
    DB.patch(mid,{durationSec:ST.solo.t,introEndMs:ST.solo.introEndMs}).catch(()=>{});
    const el=$('#sSaved'); if(el) el.textContent=savedTxt(); };
  // The phone (not us) stopped the recording: usually because the app went to the background.
  mr.onstop=()=>{ if(!REC.stopping){ REC.lost=true; DB.patch(mid,{durationSec:ST.solo.t}).catch(()=>{}); if(document.visibilityState==='visible') recLost(); } };
  stream.getAudioTracks().forEach(t=>t.addEventListener('ended',()=>{ if(!REC.stopping&&REC.mr&&REC.mr.state!=='inactive'){ try{REC.mr.stop();}catch(e){} } }));
  mr.start(5000);
  if(!src)meter(stream); wake(true);
}
function recStop(){
  REC.stopping=true;
  return new Promise(res=>{const mr=REC.mr;if(!mr||mr.state==='inactive')return res();mr.onstop=()=>setTimeout(res,30);mr.stop();})
   .then(()=>Promise.all(REC.saves)).then(()=>{REC.stream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(REC.raf);try{REC.ctx?.close();}catch(e){}wake(false);listenCleanup();});
}
function meter(stream){
  try{const ctx=new (window.AudioContext||window.webkitAudioContext)(),an=ctx.createAnalyser();an.fftSize=512;ctx.createMediaStreamSource(stream).connect(an);REC.ctx=ctx;
    const buf=new Uint8Array(an.fftSize);
    const loop=()=>{an.getByteTimeDomainData(buf);let m=0;for(const v of buf)m=Math.max(m,Math.abs(v-128));const lv=ST.solo.paused?0:Math.min(1,m/50);
      $$('#tbl .tph i').forEach((b,k)=>b.style.height=(5+lv*(14+k*5))+'px');REC.raf=requestAnimationFrame(loop);};loop();}catch(e){}
}
async function wake(on){try{if(on&&'wakeLock' in navigator)REC.lock=await navigator.wakeLock.request('screen');else if(!on&&REC.lock){await REC.lock.release();REC.lock=null;}}catch(e){}}
function recLost(){
  const s=ST.solo;if(!(s.phase==='intro'||s.phase==='meet'))return;
  if(isListen()){ACT['solo-end-ok']();return;}
  render();
  sheet(`<div class="bigic">${I('mic')}</div><h3>Recording stopped while Qalm was in the background</h3><p>Everything up to ${mmss(s.t)} is saved on this phone. Continue to record the rest of the meeting into the same file.</p><div class="stk"><button class="btnk" data-act="solo-continue-now">Continue recording</button><button class="btng" data-act="solo-end-ok">End meeting and send</button></div>`);
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&ME_USER)fetch(API+'/api/me').catch(()=>{});
  if(document.visibilityState==='hidden'){if(recording())REC.hiddenAt=Date.now();return;}
  if(REC.lost||(REC.mr&&REC.mr.state==='inactive'&&!REC.stopping&&(ST.solo.phase==='intro'||ST.solo.phase==='meet'))){REC.lost=true;recLost();return;}
  if(!recording())return;
  wake(true);
  if(REC.hiddenAt&&Date.now()-REC.hiddenAt>3000&&!isListen())toast('Welcome back. Still recording. Keep Qalm on screen: some phones stop recording in the background.');
  REC.hiddenAt=0;
});

/* --- processing --- */
const STEPS=[['save','Saving the recording on this phone'],['upload','Sending it to the server'],['queued','Waiting in the queue'],['processing','Transcribing the conversation'],['naming','Naming speakers from the introductions']];
const stepIx=st=>st==='completed'?4:st==='done'?5:Math.max(0,STEPS.findIndex(x=>x[0]===st));
function upload(url,blob,onp,headers){return new Promise((res,rej)=>{const x=new XMLHttpRequest();x.open('POST',url);x.setRequestHeader('Content-Type',(blob.type||'audio/webm').split(';')[0]);
  for(const [k,v] of Object.entries(headers||{}))x.setRequestHeader(k,v);
  x.upload.onprogress=e=>e.lengthComputable&&onp(e.loaded/e.total);
  x.onload=()=>{let b={};try{b=JSON.parse(x.responseText);}catch(e){}x.status<300?res(b):rej(new Error(x.status===401?'Please sign in again. Your recording is safe on this phone.':b.error||('Upload failed ('+x.status+')')));};
  x.onerror=()=>rej(new Error('Upload failed. Check the connection. Your recording is safe on this phone.'));x.send(blob);});}
async function processMeeting(mid,fileBlob,liveWords){
  const s=ST.solo; Object.assign(s,{phase:'proc',step:'save',err:'',upPct:0,mid,result:null,rid:null}); render(); window.scrollTo(0,0);
  try{
    let parts=fileBlob?[fileBlob]:null;
    if(!parts){const meta=await DB.get('meetings',mid)||{};parts=(await DB.parts(mid,meta.mime)).filter(b=>b.size);if(!parts.length)throw new Error('No audio was saved on this phone for this meeting.');
      await DB.patch(mid,{state:'ended'});}
    s.parts=parts; s.blob=parts[0];
    const blob=parts.length>1?new Blob(parts,{type:parts[0].type}):parts[0];
    if(!HEALTH||HEALTH.offline)await loadServer();
    if(HEALTH?.offline)throw new Error('Cannot reach the Qalm server. Your recording is safe on this phone. Try again when you are online.');
    if(!HEALTH.engine)throw new Error('Transcription is not switched on for this server yet. Ask the admin. Your recording is safe on this phone.');
    // Listen: the words streamed during the recording are the transcript. No second pass is needed.
    let got=false;
    if(liveWords&&liveWords.length){try{s.step='naming';render();s.result=await api('/api/live/result',{tokens:liveWords,durationMs:Math.round((s.t||0)*1000)});got=!!(s.result.segments||[]).length;}catch(e){got=false;}}
    if(!got){
    s.step='upload';render();
    const q=new URLSearchParams({title:s.title||'',introEndMs:String(Math.round(s.introEndMs||0)),announceEndMs:String(Math.round(s.announceEndMs||0)),durationMs:String(Math.round((s.t||0)*1000))});
    const job=await upload(API+'/api/solo/jobs?'+q,blob,p=>{s.upPct=p;const e=$('#upPct');if(e)e.textContent=Math.round(p*100)+'%';},parts.length>1?{'X-Parts':parts.map(b=>b.size).join(',')}:{});
    s.step='queued';render();
    for(;;){
      await new Promise(r=>setTimeout(r,2000));
      const r=await fetch(API+'/api/solo/jobs/'+job.id);const j=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(r.status===401?'Please sign in again. Your recording is safe on this phone.':j.error||('Server error '+r.status));
      if(j.status==='error')throw new Error(j.error||'Transcription failed.');
      if(j.status==='done'){s.result=j.result;break;}
      if(j.step!==s.step){s.step=j.step;if(onRecTab()&&s.phase==='proc')render();}
    }
    }
    s.speakers=s.result.speakers.map((x,i)=>({...x,c:C[i%C.length],open:false,edited:false}));
    if(!s.speakers.length)throw new Error('No speech was found in the recording.');
    if(isListen())markMe();
    // Save straight away so nothing is lost if the app is closed on the next screen.
    const r=buildRealReport();r.stage='review';ST.reports.unshift(r);s.rid=r.id;await saveReport(r);
    if(mid)await DB.patch(mid,{state:'done',rid:r.id}).catch(()=>{});
    s.phase='review';
    // A video has nobody to name: go straight to the notes.
    if(isListen()&&s.lkind==='video'&&ST.tab==='listen'){ACT['solo-open']();return;}
    if(onRecTab())render();else toast(`Transcript ready. Open ${isListen()?'Listen':'Solo'} to check the names.`);
  }catch(e){s.phase='error';s.err=e.message||String(e);if(onRecTab())render();else toast((isListen()?'Listen: ':'Solo: ')+esc(s.err));}
}
async function checkPending(){
  try{const ms=(await DB.all('meetings')||[]).filter(m=>m.state!=='done'&&m.mid!==REC.mid&&(!m.owner||m.owner===ME_USER?.id||ME_USER?.role==='admin'));
    ST.solo.pending=ms.sort((a,b)=>b.startedAt-a.startedAt)[0]||null;
    if((ST.tab==='solo'||ST.tab==='listen')&&ST.solo.phase==='idle')render();}catch(e){}
}
function audioName(){const s=ST.solo,ext=/mp4|m4a|aac/.test(s.blob?.type||'')?'m4a':/ogg/.test(s.blob?.type||'')?'ogg':/mpeg|mp3/.test(s.blob?.type||'')?'mp3':/wav/.test(s.blob?.type||'')?'wav':'webm';
  return `Qalm_${(s.title||'Solo').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'')}_${new Date().toISOString().slice(0,10)}.${ext}`;}
function saveAudio(blob,name){if(!blob)return toast('No audio on this phone');const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}

/* --- views --- */
function tableHTML(){
  const s=ST.solo,rec=s.phase==='intro'||s.phase==='meet';
  return `<div class="tbl ${rec?'rec':''} ${s.paused?'paused':''}" id="tbl"><div class="ring"><span>1 m</span></div><div class="ttop"></div><div class="tph"><i></i><i></i><i></i></div>${[0,1,2,3].map(i=>`<div class="seat s${i}" id="seat${i}" style="--c:${C[i]}"></div>`).join('')}</div>`;
}
const spName=x=>x.name||('Speaker '+x.index);
// Whatever the person said about themselves: title, department, organisation (any of them may be missing).
const spInfo=x=>[x.role,x.dept,x.org].filter(Boolean).join(' · ');
function cardHTML(i){
  const x=ST.solo.speakers[i],nm=spName(x);
  const tag=x.edited?'Edited':x.how==='roster'?'Staff list':x.how==='heard'?'Check name':'Tap to name';
  const sugg=(x.candidates||[]).filter(c=>c.name!==x.name).slice(0,2);
  return `<div class="folder ${x.open?'open':''}" id="fc${i}" style="--c:${x.c}">
    <button class="fhead" data-act="sp-toggle" data-i="${i}" aria-expanded="${!!x.open}">
      <span class="fav">${x.name?ini(x.name):x.index}</span>
      <span class="grow"><b>${esc(nm)}</b><small dir="auto">${esc(spInfo(x)||(x.name?'Name only':'Name not heard yet'))}</small></span>
      <span class="ftag ${!x.edited&&x.how!=='roster'?'chk':''}">${tag}</span>${I('chev','chev s')}
    </button>
    <div class="fbody"><div class="fin"><div class="fpad">
      <p class="heard">Heard: <span dir="auto">“${esc(x.heard||'…')}”</span></p>
      ${(()=>{const others=ST.solo.speakers.filter(y=>y!==x&&!y.mergedInto);const joined=ST.solo.speakers.filter(y=>y.mergedInto===x.label);
        return (joined.length?`<p class="heard"><b>Joined with ${joined.map(y=>'Speaker '+y.index).join(', ')}</b> ${joined.map(y=>`<button class="unjoin" data-act="sp-unmerge" data-l="${esc(y.label)}">Separate ${'Speaker '+y.index}</button>`).join(' ')}</p>`:'')
          +(others.length?`<div class="same"><span>Same person as</span>${others.map(y=>`<button data-act="sp-merge" data-i="${i}" data-into="${esc(y.label)}">${esc(spName(y))}</button>`).join('')}</div>`:'');})()}
      ${sugg.map(c=>`<button class="sugg" data-act="sp-pick" data-i="${i}" data-id="${esc(c.id)}">Use “${esc(c.name)} · ${esc(c.dept)}” from the staff list</button>`).join('')}
      <label>Name<input data-f="n" value="${esc(x.name)}" placeholder="Speaker ${x.index}" list="rosterNames" autocomplete="off" dir="auto"></label>
      <label>Title or role <i>optional</i><input data-f="r" value="${esc(x.role||'')}" placeholder="e.g. Head Nurse, Finance Manager" autocomplete="off" dir="auto"></label>
      <label>Department <i>optional</i><input data-f="d" value="${esc(x.dept||'')}" autocomplete="off" dir="auto"></label>
      <label>Email <i>optional</i><input data-f="e" type="email" inputmode="email" value="${esc(x.email||'')}" placeholder="name@company.com" autocomplete="off" autocapitalize="none" spellcheck="false"></label>
      <label>Phone <i>optional</i><input data-f="ph" type="tel" inputmode="tel" value="${esc(x.phone||'')}" placeholder="+974 …" autocomplete="off"></label>
      <label>Organisation <i>optional</i><input data-f="o" value="${esc(x.org||'')}" placeholder="e.g. Hamad Medical Corporation" autocomplete="off" dir="auto"></label>
      <button class="fsave" data-act="sp-save" data-i="${i}">Save</button>
      <p class="heard" style="font-size:12px">Spoke for about ${durTxt((x.talkMs||0)/1000)}. Same name on two cards joins them in the report.</p>
    </div></div></div><div class="fend"></div></div>`;
}
const rosterDrawer=()=>drawer('solo-names','Names for testing',ROSTER.length,`<p class="note" style="margin-bottom:6px">Sample staff list. Say one of these names in the introduction and it is matched, even if slightly misheard. Other names are kept as spoken.</p>`+ROSTER.map(p=>`<div class="lrow"><div class="grow"><b>${esc(p.name)}</b><small>${esc(p.dept)}${p.ar?' · <span lang="ar">'+esc(p.ar)+'</span>':''}</small></div></div>`).join(''));
function serverNote(){
  if(!HEALTH)return '';
  if(HEALTH.offline)return `<div class="warnbox">Cannot reach the Qalm server. You can still record. The recording stays on this phone until it can be sent.</div>`;
  if(!HEALTH.engine)return `<div class="warnbox">Transcription is not switched on for this server yet. You can still record; ask the admin to switch it on.</div>`;
  return '';
}
function viewSolo(fromListen){
  const s=ST.solo,L=isListen();
  if(!fromListen&&L&&s.phase!=='idle')return capsheet(`<div class="eyebrow">One device on the table</div><h1 class="lt">Solo</h1><p class="sub">Listen is running. Finish it before you start a Solo meeting.</p>`,`<button class="cta" data-tab="listen">Open Listen</button>`);
  if(s.phase==='idle') return capsheet(
    `<div class="eyebrow">One device on the table</div><h1 class="lt">Solo</h1><p class="sub">For up to 4 people sitting within 1 metre. The app tells the voices apart.</p>${tableHTML()}`,
    `${serverNote()}
     ${s.pending?`<div class="pend"><span class="rico">${I('mic')}</span><div class="grow"><b>${s.pending.state==='recording'?'Meeting was interrupted':'Recording not sent yet'}</b><small>${esc(s.pending.title||'Untitled')} · ${new Date(s.pending.startedAt).toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit'})}</small><small style="display:block">${s.pending.durationSec?mmss(s.pending.durationSec)+' saved on this phone':''}</small><div class="pendb">${s.pending.state==='recording'?(s.pending.mode==='listen'?'':'<button class="pillk" data-act="solo-continue">Continue recording</button>')+'<button class="pillg" data-act="solo-pending">Send it</button>':'<button class="pillk" data-act="solo-pending">Send it now</button>'}<button class="pillg" data-act="solo-discard">Delete</button></div></div></div>`:''}
     <label class="fld"><span>Meeting title</span><input id="soloTitle" value="${esc(s.title)}" placeholder="Optional" autocomplete="off"></label>
     <button class="cta" data-act="solo-start">${I('mic')}Start meeting</button>
     <p class="fine">First the app announces that the meeting is recorded for digital records.</p>
     <button class="btn2" data-act="solo-file">Test with an audio file</button>
     ${drawer('solo-how','How Solo works','',`<ol class="steps"><li>The app announces the recording, so everyone at the table knows.</li><li>Each person introduces themselves: a name, or name with title, department or organisation. That voice gets that name.</li><li>Talk as usual in English, Arabic or both. The audio is saved on this phone as you go.</li><li>End the meeting. The recording is sent once, transcribed, and each voice is named.</li></ol>`)}
     ${drawer('solo-tips','For clear audio','',`<ul class="ticks"><li>${I('check','s')}<span>Put the phone flat in the middle of the table.</span></li><li>${I('check','s')}<span>Everyone sits within 1 metre of it.</span></li><li>${I('check','s')}<span>Keep the screen on. The app stops the screen from locking.</span></li><li>${I('check','s')}<span>One person at a time where possible.</span></li></ul>`)}
     ${rosterDrawer()}`);
  if(s.phase==='proc'){
    const pi=stepIx(s.step);
    return capsheet(`<div class="eyebrow">Recording saved</div><h1 class="lt">${L?'Stopped listening':'Meeting ended'}</h1><p class="sub">${esc(s.title||'Untitled meeting')}${s.t?' · '+durTxt(s.t)+' recorded':''}</p>`,
     `<div class="pcard">${STEPS.map(([k,l],i)=>`<div class="pst ${i<pi?'done':i===pi?'run':''}"><span class="pic">${i<pi?I('check','s'):i===pi?'':i+1}</span><span class="grow">${l}</span>${k==='upload'&&i===pi?`<b id="upPct">${Math.round((s.upPct||0)*100)}%</b>`:''}</div>`).join('')}</div>
      <p class="fine">Long meetings take a minute or two. The recording stays on this phone until it is done.</p>`);
  }
  if(s.phase==='error') return capsheet(`<div class="eyebrow">Not sent yet</div><h1 class="lt">Try again</h1><p class="sub">${esc(s.title||'Untitled meeting')}</p>`,
    `<div class="warnbox">${esc(s.err)}</div>
     ${/sign in/i.test(s.err)?`<button class="cta" data-act="sign-in-again">Sign in again</button>`:`<button class="cta" data-act="solo-retry">Try again</button>`}
     <button class="btn2" data-act="solo-save-audio">Save the audio file</button>
     <button class="btn2" data-act="solo-new">Back to ${L?'Listen':'Solo'}</button>`);
  if(s.phase==='review') return capsheet(
    `<div class="eyebrow">Transcript ready</div><h1 class="mt">Who spoke</h1><p class="sub">Check who spoke, then create the report. Tap a card to name someone, add their email, or join two voices that are the same person.</p>${tableHTML()}`,
    `<div class="sech"><h2>Speakers</h2><span>${(n=>n+(n===1?' person':' people'))(s.speakers.filter(x=>!x.mergedInto).length)}</span></div>
     <div class="stack" id="sStack">${s.speakers.map((x,i)=>x.mergedInto?'':cardHTML(i)).join('')}</div>
     <datalist id="rosterNames">${ROSTER.map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist>
     <button class="cta" data-act="solo-open">${autoReport()?'Save names and create report':'Save names and check the transcript'}</button>
     <button class="btn2" data-act="solo-save-audio">Save the audio file</button>
     <button class="btn2" data-act="solo-new">${L?'Listen again':'New Solo meeting'}</button>`);
  // intro + meet
  return capsheet(
    `<div class="bar"><span class="recp ${s.paused?'paused':''}" id="sRec"><i></i><b>${s.paused?'PAUSED':'REC'}</b></span><span class="tm" id="sTime">${mmss(s.t)}</span><span class="grow"></span><span class="chipd">${s.phase==='intro'?'Introductions':'Meeting'}</span></div>
     <h1 class="mt">${esc(s.title||'Untitled meeting')}</h1>${tableHTML()}<p class="now" id="sNow"></p>`,
    `${s.phase==='intro'?`<div class="pcard" style="padding:16px 18px"><b style="font-size:17px">Go around the table</b><p style="color:var(--fg2);margin-top:4px;font-size:15px">Each person introduces themselves, one at a time. A name is enough; title, department or organisation are picked up too.</p>
        <div class="exq">“Hi, I’m Sara Mendes, head nurse.”</div><div class="exq">“Khalid Al-Attiyah, finance manager, Ministry of Public Health.”</div><div class="exq" lang="ar" dir="rtl">«أنا نورة السليطي من الصيدلة.»</div></div>
      <button class="cta" data-act="solo-begin">Introductions done</button>`
     :`<div class="pcard" style="padding:16px 18px"><b style="font-size:17px">Talk as usual</b><p style="color:var(--fg2);margin-top:4px;font-size:15px">English, Arabic or both. Nothing to read during the meeting. The transcript is written when you end it.</p></div>`}
     <p class="fine" id="sSaved">${savedTxt()}</p>
     ${s.phase==='intro'?rosterDrawer():''}
     <div class="dock"><button class="dbt" data-act="solo-pause" id="sPause">${s.paused?I('play','s')+'Resume':I('pause','s')+'Pause'}</button><button class="dbt red" data-act="solo-end">${I('stop','s')}End meeting</button></div>`);
}
/* ================= Listen: calls and videos on this computer ================= */
// The browser hands over the sound of a tab (or the whole computer) as a digital signal, so it is
// not re-recorded through the speaker. The microphone is mixed in as a second source.
const LIS={disp:null,mic:null,ctx:null,node:null,pip:null,flags:[],t:0,quiet:0};
const canListen=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia)&&!/Android|iPhone|iPad/i.test(navigator.userAgent);
// Runs on the audio thread, so it keeps time even when this tab is in the background.
// Every 0.2 s it reports the loudness of the computer sound and of the microphone.
const METER_SRC=`class M extends AudioWorkletProcessor{constructor(){super();this.n=0;this.s=[0,0];this.w=sampleRate*0.2;}
process(inputs){for(let k=0;k<2;k++){const ch=inputs[k]&&inputs[k][0];if(ch)for(let i=0;i<ch.length;i++)this.s[k]+=ch[i]*ch[i];}
this.n+=128;if(this.n>=this.w){this.port.postMessage([Math.sqrt(this.s[0]/this.n),Math.sqrt(this.s[1]/this.n),this.n/sampleRate]);this.n=0;this.s=[0,0];}return true;}}
registerProcessor('fh-meter',M);`;
async function listenCapture(withMic){
  if(!window.isSecureContext)throw new Error('Listen only works over https (or on localhost).');
  if(!canListen()||!window.MediaRecorder)throw new Error('Listen needs Chrome or Edge on a computer.');
  const disp=await navigator.mediaDevices.getDisplayMedia({video:true,audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},systemAudio:'include',selfBrowserSurface:'exclude'});
  if(!disp.getAudioTracks().length){disp.getTracks().forEach(t=>t.stop());throw Object.assign(new Error('No sound was shared.'),{noSound:true});}
  disp.getVideoTracks().forEach(t=>{t.enabled=false;});   // the picture is never recorded or sent
  let mic=null;
  if(withMic){try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});}catch(e){toast('Microphone not available. Listening to the computer sound only.');}}
  const ctx=new (window.AudioContext||window.webkitAudioContext)(),dest=ctx.createMediaStreamDestination();
  try{dest.channelCount=1;dest.channelCountMode='explicit';}catch(e){}
  const sys=ctx.createMediaStreamSource(new MediaStream(disp.getAudioTracks()));sys.connect(dest);
  const mi=mic?ctx.createMediaStreamSource(mic):null;if(mi)mi.connect(dest);
  Object.assign(LIS,{disp,mic,ctx,node:null,flags:[],t:0,quiet:0});
  try{await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([METER_SRC],{type:'application/javascript'})));
    const node=new AudioWorkletNode(ctx,'fh-meter',{numberOfInputs:2,numberOfOutputs:1}),z=ctx.createGain();z.gain.value=0;
    sys.connect(node,0,0);if(mi)mi.connect(node,0,1);node.connect(z);z.connect(ctx.destination);
    node.port.onmessage=e=>listenLevels(e.data[0],e.data[1],e.data[2]);LIS.node=node;}catch(e){}
  // "Stop sharing" in the browser bar ends the session and writes the notes.
  disp.getTracks().forEach(t=>t.addEventListener('ended',()=>{if(isListen()&&ST.solo.phase==='meet'&&!REC.stopping){toast('Sharing stopped. Writing the notes.');ACT['solo-end-ok']();}}));
  if(ctx.state==='suspended')try{await ctx.resume();}catch(e){}
  return dest.stream;
}
// On a phone the lecture plays inside this page, so the page stays open and keeps recording.
function ytId(u){const m=String(u||'').trim().match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([\w-]{11})/);return m?m[1]:null;}
const YT={t:0,state:-1};
window.addEventListener('message',e=>{if(!/youtube/.test(e.origin))return;let d;try{d=JSON.parse(e.data);}catch(x){return;}
  if(d.event==='infoDelivery'&&d.info){if(d.info.currentTime!=null)YT.t=d.info.currentTime;if(d.info.playerState!=null){YT.state=d.info.playerState;const b=$('#ytP');if(b)b.innerHTML=YT.state===1?I('pause','s')+'Pause':I('play','s')+'Play';}}});
function ytCmd(func,args){const f=$('#lisPlayer iframe');if(f)f.contentWindow.postMessage(JSON.stringify({event:'command',func,args:args||[]}),'*');}
function syncPlayer(){
  const box=$('#lisPlayer');if(!box)return;const s=ST.solo,id=!canListen()&&(s.phase==='idle'||(isListen()&&s.phase==='meet'))?ytId(s.lurl):null;
  if(!id){if(box.dataset.id){box.innerHTML='';delete box.dataset.id;}box.hidden=true;return;}
  if(box.dataset.id!==id){box.dataset.id=id;YT.t=0;YT.state=-1;
    box.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}" title="Lecture video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <div class="ytc"><button data-act="yt-b" aria-label="Back 10 seconds">${li(LIc.b10)}10s</button><button data-act="yt-p" id="ytP">${I('play','s')}Play</button><button data-act="yt-f" aria-label="Forward 10 seconds">10s${li(LIc.f10)}</button></div>`;
    const f=box.querySelector('iframe');f.addEventListener('load',()=>{const hi=()=>f.contentWindow&&f.contentWindow.postMessage(JSON.stringify({event:'listening',id:'lis',channel:'widget'}),'*');hi();setTimeout(hi,800);});}
  box.hidden=ST.tab!=='listen';
}
function listenCleanup(){
  try{LIS.pip?.close();}catch(e){}
  [LIS.disp,LIS.mic].forEach(m=>m?.getTracks().forEach(t=>t.stop()));
  try{LIS.ctx?.close();}catch(e){}
  Object.assign(LIS,{disp:null,mic:null,ctx:null,node:null,pip:null});
}
function listenLevels(a,b,dt){
  const s=ST.solo;if(!isListen()||s.phase!=='meet')return;
  LIVE.level=Math.max(a,b);LIVE.peak=Math.max(LIVE.peak,LIVE.level);
  if(!s.paused){
    LIS.t+=dt;const on=b>0.012&&b>a*0.6?1:0,idx=Math.floor(LIS.t*5);while(LIS.flags.length<=idx)LIS.flags.push(on);   // when the microphone was the one talking
    if(a>0.003)LIS.quiet=0;else LIS.quiet+=dt;
    const t=Math.floor(LIS.t);if(t!==s.t){s.t=t;const e=$('#sTime');if(e)e.textContent=mmss(t);if(LIS.pip){const p=LIS.pip.document.getElementById('pT');if(p)p.textContent=mmss(t);}}
  }
  const w=v=>Math.min(100,Math.round(Math.sqrt(s.paused?0:v)*220))+'%';
  for(const d of [document,LIS.pip&&LIS.pip.document]){if(!d)continue;const x=d.getElementById('lSys'),y=d.getElementById('lMic');if(x)x.style.width=w(a);if(y)y.style.width=w(b);}
  const q=$('#lQuiet');if(q)q.hidden=LIS.quiet<10;
}
// The voice that spoke while the microphone was active is the person using this computer.
function markMe(){
  const s=ST.solo,f=s.micFlags;if(!f||!f.length||!s.result||(s.parts||[]).length>1)return;
  const fr={};
  for(const g of s.result.segments){const o=fr[g.speaker]||(fr[g.speaker]={n:0,m:0}),a=Math.floor(g.startMs/200),b=Math.max(a+1,Math.ceil(g.endMs/200));for(let i=a;i<b&&i<f.length;i++){o.n++;o.m+=f[i];}}
  const hot=s.speakers.filter(x=>{const o=fr[x.label];return o&&o.n>=5&&o.m/o.n>=0.6;});
  if(hot.length!==1)return;   // unclear (for example the microphone also hears the loudspeaker): leave it to the user
  hot[0].me=true;if(!hot[0].name)hot[0].name=ME_USER?.name||'Me';
}
async function listenPip(auto){
  if(!('documentPictureInPicture' in window)){if(!auto)toast('Floating controls need Chrome or Edge on a computer');return;}
  if(LIS.pip||!isListen()||ST.solo.phase!=='meet')return;
  let w;try{w=await documentPictureInPicture.requestWindow({width:340,height:84});}catch(e){if(!auto)toast('The floating controls could not open');return;}
  const d=w.document,s=ST.solo,st=d.createElement('style');d.title='Qalm';
  st.textContent=`html,body{margin:0;height:100%;background:#161414;color:#fff;font:600 14px/1 system-ui,Segoe UI,Roboto,sans-serif}
   .p{height:100%;display:flex;align-items:center;gap:10px;padding:0 12px;box-sizing:border-box}
   .dot{width:10px;height:10px;border-radius:50%;background:#FF453A;flex:none;animation:b 1.2s infinite}.dot.pz{background:#FFC46A;animation:none}@keyframes b{50%{opacity:.25}}
   b{font-variant-numeric:tabular-nums;font-size:16px;min-width:48px}
   .bs{flex:1;display:flex;flex-direction:column;gap:5px;min-width:30px}.bs div{height:5px;border-radius:3px;background:#2C2929;overflow:hidden}.bs i{display:block;height:100%;width:0;background:#FF5D00;border-radius:3px;transition:width .15s}.bs div+div i{background:#45D3C5}
   button{font:inherit;border:0;border-radius:999px;padding:10px 14px;background:#2C2929;color:#fff;cursor:pointer}button.r{background:#FF453A}`;
  d.head.appendChild(st);
  d.body.innerHTML=`<div class="p"><span class="dot ${s.paused?'pz':''}" id="pD"></span><b id="pT">${mmss(s.t)}</b><div class="bs" title="Computer sound and microphone"><div><i id="lSys"></i></div><div><i id="lMic"></i></div></div><button id="pP">${s.paused?'Resume':'Pause'}</button><button id="pE" class="r">Stop</button></div>`;
  d.getElementById('pP').onclick=()=>ACT['solo-pause']();
  d.getElementById('pE').onclick=()=>ACT['solo-end-ok']();
  w.addEventListener('pagehide',()=>{LIS.pip=null;});
  LIS.pip=w;
}
/* ---------- Listen screen: text card, quick buttons, record bar ---------- */
const LSEG=14;
const li=d=>`<svg class="i s" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const LIc={link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',file:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01"/>',min:'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',max:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',b10:'<path d="M11 5L6 9l5 4M6 9h7a5 5 0 010 10H9"/>',f10:'<path d="M13 5l5 4-5 4M18 9h-7a5 5 0 000 10h4"/>'};
// Live text: the sound is streamed to the transcription service while it is recorded, and the words
// come straight back. When the recording stops, the same words become the final transcript.
const LIVE={on:false,ws:null,mr:null,fin:[],pend:[],orig:'',en:'',spk:new Set(),off:0,broken:false,ending:false,level:0,peak:0,meterOk:false,ctx:null,raf:0,ka:0,rt:0,tmr:0,ar:new Map(),onFinished:null,onDrop:null};
function liveAnalyse(stream){
  try{const ctx=new (window.AudioContext||window.webkitAudioContext)(),an=ctx.createAnalyser();an.fftSize=1024;ctx.createMediaStreamSource(stream).connect(an);LIVE.ctx=ctx;LIVE.meterOk=true;
    if(ctx.state!=='running')ctx.resume().catch(()=>{});
    const buf=new Float32Array(an.fftSize),loop=()=>{an.getFloatTimeDomainData(buf);let q=0;for(const v of buf)q+=v*v;LIVE.level=Math.sqrt(q/buf.length);LIVE.raf=requestAnimationFrame(loop);};loop();}catch(e){LIVE.meterOk=false;}
}
// A word as spoken goes to "orig"; English words and translated words go to "en".
function liveAdd(t,o){
  const st=t.translation_status,sp=t.speaker!=null?String(t.speaker):'',turn=st!==o._st||sp!==o._sp;o._st=st;o._sp=sp;
  const put=k=>{o[k]+=(turn&&o[k]&&!/\s$/.test(o[k])&&!/^[\s.,!?،؟]/.test(t.text)?' ':'')+t.text;};
  if(st!=='translation'){put('orig');if(o.spk&&sp)o.spk.add(sp);}
  if(st==='translation'||(st!=='original'&&(st==='none'||!t.language||t.language==='en')))put('en');
}
function liveReset(){Object.assign(LIVE,{fin:[],pend:[],orig:'',en:'',spk:new Set(),off:0,broken:false,ending:false,ar:new Map(),onFinished:null,onDrop:null});}
async function liveConnect(){
  if(!LIVE.on||!REC.stream)return;
  let cfg;try{cfg=await api('/api/live/start',{});}catch(e){LIVE.broken=true;return;}
  if(!LIVE.on||LIVE.ending)return;
  let ws;try{ws=new WebSocket(cfg.url,['soniox-api-key',cfg.key]);}catch(e){LIVE.broken=true;return;}
  LIVE.ws=ws;
  ws.onopen=()=>{ws.send(JSON.stringify(cfg.config));
    const mime=pickMime();let mr;try{mr=new MediaRecorder(REC.stream,mime?{mimeType:mime,audioBitsPerSecond:48000}:{});}catch(e){LIVE.broken=true;return;}
    mr.ondataavailable=e=>{if(e.data&&e.data.size&&ws.readyState===1)ws.send(e.data);};
    LIVE.mr=mr;mr.start(250);if(ST.solo.paused)try{mr.pause();}catch(e){}
    clearInterval(LIVE.ka);LIVE.ka=setInterval(()=>{if(ws.readyState===1&&ST.solo.paused)ws.send('{"type":"keepalive"}');},15000);};
  ws.onmessage=e=>{let d;try{d=JSON.parse(e.data);}catch(x){return;}
    if(d.error_code||d.error_type){LIVE.broken=true;console.warn('live text:',d.error_type,d.error_message);return;}
    const pend=[];
    for(const t of d.tokens||[]){if(!t.text||/^<[a-z_]+>$/i.test(t.text))continue;
      if(t.is_final){if(LIVE.off&&t.start_ms!=null){t.start_ms+=LIVE.off;t.end_ms+=LIVE.off;}LIVE.fin.push(t);liveAdd(t,LIVE);}else pend.push(t);}
    LIVE.pend=pend;liveSoon();
    if(d.finished&&LIVE.onFinished)LIVE.onFinished();};
  ws.onclose=()=>{clearInterval(LIVE.ka);if(LIVE.ws!==ws)return;LIVE.ws=null;try{if(LIVE.mr&&LIVE.mr.state!=='inactive')LIVE.mr.stop();}catch(e){}LIVE.mr=null;LIVE.pend=[];
    if(LIVE.onDrop){LIVE.onDrop();return;}
    // The line dropped mid-recording: carry on with a new stream. The final transcript is then made from the saved recording.
    if(LIVE.on&&!LIVE.ending){LIVE.broken=true;LIVE.off=(ST.solo.t||0)*1000;clearTimeout(LIVE.rt);LIVE.rt=setTimeout(liveConnect,2000);}};
}
function liveGo(){if(!HEALTH||!HEALTH.engine||LIVE.on)return;LIVE.on=true;liveConnect();}
// Ends the stream and waits for the last words. Gives back the words for the final transcript,
// or nothing if the stream was not complete (the saved recording is transcribed instead).
function liveFinish(){
  return new Promise(res=>{
    const ws=LIVE.ws,mr=LIVE.mr;LIVE.ending=true;clearTimeout(LIVE.rt);
    if(!ws||ws.readyState!==1||LIVE.broken)return res(null);
    let done=false;const fin=ok=>{if(done)return;done=true;clearTimeout(to);LIVE.onFinished=LIVE.onDrop=null;res(ok&&!LIVE.broken&&LIVE.fin.length?LIVE.fin.slice():null);};
    const to=setTimeout(()=>fin(false),15000);LIVE.onFinished=()=>fin(true);LIVE.onDrop=()=>fin(false);
    const end=()=>setTimeout(()=>{try{ws.send('');}catch(e){fin(false);}},200);
    if(mr&&mr.state!=='inactive'){mr.addEventListener('stop',end,{once:true});try{mr.stop();}catch(e){end();}}else end();
  });
}
function liveEnd(){LIVE.on=false;clearTimeout(LIVE.rt);clearInterval(LIVE.ka);const ws=LIVE.ws;LIVE.ws=null;try{if(LIVE.mr&&LIVE.mr.state!=='inactive')LIVE.mr.stop();}catch(e){}LIVE.mr=null;try{ws&&ws.close();}catch(e){}
  LIVE.pend=[];cancelAnimationFrame(LIVE.raf);try{LIVE.ctx&&LIVE.ctx.close();}catch(e){}LIVE.ctx=null;LIVE.level=0;}
function liveSoon(){if(LIVE.tmr)return;LIVE.tmr=setTimeout(()=>{LIVE.tmr=0;liveRender();},250);}
const liveView=()=>{const s=ST.solo;return !s.ltr?'orig':(s.ltarget||lang1());};
// Text is shown as paragraphs of four sentences.
const SENT=/[^.?!؟।。]+(?:[.?!؟।。]+["”’)]*\s*|$)/g;
function parasOf(text){const ss=(String(text||'').match(SENT)||[]).filter(x=>x.trim()),out=[];for(let i=0;i<ss.length;i+=4)out.push(ss.slice(i,i+4).join('').trim());return out;}
function liveParas(){
  const v=liveView();let ps=parasOf(v==='orig'?LIVE.orig:LIVE.en);
  if(v!=='orig'&&v!=='en')ps=ps.map((p,i)=>{if(i===ps.length-1&&LIVE.on)return p;const k=v+'|'+p,c=LIVE.ar.get(k);
    if(c==null){LIVE.ar.set(k,'');api('/api/translate',{target:v,items:[p]}).then(j=>{LIVE.ar.set(k,(j.items||[])[0]||p);liveSoon();}).catch(()=>LIVE.ar.delete(k));return p;}
    return c||p;});
  return ps;
}
function liveBody(){
  const s=ST.solo,ps=liveParas(),o={orig:'',en:''},rec=s.phase==='meet'&&isListen();LIVE.pend.forEach(t=>liveAdd(t,o));
  const pend=(liveView()==='orig'?o.orig:o.en).trim();
  if(!ps.length&&!pend)return `<div class="lvempty">${rec?`<b>Listening…</b><span>${HEALTH&&HEALTH.engine?(LIVE.broken&&!LIVE.ws?'Live text is not available right now. The recording continues and is transcribed when you stop.':'Words appear here as they are spoken.'):'Recording. The text is written when you stop.'}</span>`:`<b>Press record.</b><span>The words appear here as they are spoken, in paragraphs.</span>`}</div>`;
  return ps.map((t,i)=>`<p dir="auto" class="${i===ps.length-1?'new':''}">${esc(t)}${i===ps.length-1&&pend?` <span class="pend">${esc(pend)}</span>`:''}</p>`).join('')+(!ps.length&&pend?`<p dir="auto" class="new"><span class="pend">${esc(pend)}</span></p>`:'');
}
function liveSide(){const s=ST.solo,v=$('#lvVoices');if(!v)return;const n=LIVE.spk.size;
  v.innerHTML=n?`<span class="lvd">${Array.from({length:Math.min(n,4)},(_,k)=>`<i style="--c:${C[k]}"></i>`).join('')}</span><b>${n}</b><small>${n===1?'voice':'voices'}</small>`:`<small>${isListen()&&s.phase==='meet'?'Listening':'No voices yet'}</small>`;}
function liveRender(){const b=$('#lvText');if(!b)return;const stick=b.scrollHeight-b.scrollTop-b.clientHeight<90;b.innerHTML=liveBody();if(stick)b.scrollTop=b.scrollHeight;liveSide();}
setInterval(()=>{const m=$('#lvMeter');if(!m)return;const s=ST.solo,on=isListen()&&s.phase==='meet'&&!s.paused,n=on?Math.round(Math.min(1,Math.sqrt(LIVE.level)*2.4)*LSEG):0;
  for(let k=0;k<m.children.length;k++)m.children[k].classList.toggle('on',k<n);},90);
const liveAllText=()=>liveParas().join('\n\n');
function viewListen(){
  const s=ST.solo;
  if(s.phase!=='idle'&&!isListen())return capsheet(`<div class="eyebrow">Calls and videos</div><h1 class="lt">Listen</h1><p class="sub">A Solo meeting is in progress. Finish it before you start Listen.</p>`,`<button class="cta" data-tab="solo">Open Solo</button>`);
  if(s.phase!=='idle'&&s.phase!=='meet')return viewSolo(true);
  const rec=s.phase==='meet',ok=canListen(),k=s.lkind||'video',tg=s.ltarget||lang1();
  const chip=(act,html,cls,attr)=>`<button class="lchip ${cls||''}" data-act="${act}" ${attr||''}>${html}</button>`;
  return `<div class="lv ${rec?'rec':''} ${s.mini?'mini':''}">
    <section class="lvcard">
      <header class="lvh"><div class="lvt"><b>${rec?(s.paused?'Paused':'Live transcript'):'Listen'}</b><small>${k==='call'?'Call or meeting':'Video or lecture'}${s.ltr?' · in '+langOf(tg)[2]:''}</small></div>
        <button class="ltog ${s.ltr?'on':''}" role="switch" aria-checked="${!!s.ltr}" data-act="lv-tr" aria-label="Translate to ${langOf(tg)[2]}"><span>${langOf(tg)[1]}</span><i></i></button>
        <button class="lvib" data-act="lv-copy" aria-label="Copy the text">${I('copy','s')}</button>
        <button class="lvib" data-act="lv-mini" aria-label="${s.mini?'Full size':'Make it small'}">${li(s.mini?LIc.max:LIc.min)}</button></header>
      <div class="lvtext" id="lvText">${liveBody()}</div>
    </section>
    <div class="lchips">
      <span class="lchip stat">${li(LIc.clock)}<b class="tm" id="sTime">${mmss(rec?s.t:0)}</b></span>
      <span class="lchip stat"><b id="sSaved">${rec?savedTxt():'0.0 MB'}</b></span>
      ${rec?chip('solo-pause',s.paused?I('play','s')+'Resume':I('pause','s')+'Pause','','id="sPause"'):''}
      ${chip('lv-lang',li(LIc.globe)+'To '+langOf(tg)[2]+' ▾')}
      ${chip('lv-txt',li(LIc.dl)+'TXT')}${chip('lv-doc',li(LIc.dl)+'Word')}
      ${rec||ok?'':chip('lv-link',li(LIc.link)+(ytId(s.lurl)?'Change video':'YouTube link'))}
      ${rec?'':chip('listen-file',li(LIc.file)+'Audio file')}
      ${rec?'':chip('lv-kind',k==='call'?'Call':'Lecture','onk')}
      ${rec||!ok?'':chip('listen-mic',I('mic','s')+(s.lmic?'Mic on':'Mic off'),s.lmic?'onc':'')}
      ${rec&&LIS.disp&&'documentPictureInPicture' in window?chip('listen-pip','Float'):''}
      ${chip('lv-help',li(LIc.help)+'How it works')}
    </div>
    <div class="lvbar"><div class="lmeter" id="lvMeter" aria-hidden="true">${'<i></i>'.repeat(LSEG)}</div>
      <button class="lrec ${rec?'on':''}" data-act="${rec?'solo-end':'listen-start'}" aria-label="${rec?'Stop and write notes':'Start recording'}">${rec?I('stop'):I('mic')}</button>
      <div class="lvoices" id="lvVoices"></div></div>
  </div>`;
}
function soloNow(){
  const s=ST.solo;
  if(s.paused)return 'Paused. Nothing is being recorded.';
  return s.phase==='intro'?'Listening to the introductions…':'Recording. Phone flat, screen on.';
}
function syncSolo(){
  const s=ST.solo;if(!$('#tbl'))return;
  const sp=s.phase==='review'?s.speakers.filter(x=>!x.mergedInto):[];
  [0,1,2,3].forEach(i=>{const e=$('#seat'+i),x=sp[i];e.className='seat s'+i+(x?' on':'');e.textContent=x?(x.name?ini(x.name):x.index):'';if(x)e.style.setProperty('--c',x.c);});
  $('#tbl').classList.toggle('paused',s.paused);
  const n=$('#sNow');if(n)n.innerHTML=soloNow();
}
// Speakers → people in the report. Anyone who didn't introduce themselves is "Speaker 1", "Speaker 2"…
// Two speakers given the same name become one person.
// A voice marked "same person as" another takes that person's identity.
function rootOf(x,speakers){let r=x,n=0;while(r.mergedInto&&n++<10){const t=speakers.find(y=>y.label===r.mergedInto);if(!t)break;r=t;}return r;}
function peopleFrom(speakers){
  const people=[],idx={},mapP={};
  speakers.forEach(x0=>{const x=rootOf(x0,speakers),n=spName(x).trim(),key=n.toLowerCase();
    if(!(key in idx)){idx[key]=people.length;people.push({n,r:x.role||'',d:x.dept||'',o:x.org||'',e:x.email||rosterBy(n)?.email||'',ph:x.phone||'',c:x.c,labels:[]});}
    people[idx[key]].labels.push(x0.label);mapP[x0.label]=idx[key];});
  return {people,mapP};
}
// Re-applies speaker names to a saved report (after a rename in the report).
function relabel(r){
  const {people,mapP}=peopleFrom(r.speakers);r.people=people;
  r.tx=r.tx.map((l,i)=>({...l,p:mapP[r.result.segments[i]?.speaker]??l.p}));
}
function saveSoloSpeakers(){const s=ST.solo,r=ST.reports.find(x=>x.id===s.rid);if(r){r.speakers=s.speakers.map(({open,...y})=>y);saveReport(r);}}
// Arabic version of a report: minutes + transcript translated in one go, kept with the report.
// Lines first said in Arabic are not translated back: the original is used.
/* ================= report templates ================= */
// A template sets the sections, order and style of a report. Built-in ones come from the server;
// your own are kept on this phone (until the database is connected). The default is used for new reports.
let TEMPLATES=[];
const KIND_LABEL={summary:'Summary at the top',discussion:'Discussion topics',decisions:'Decisions',actions:'Action items (owner, due)',questions:'Open questions',bullets:'List',text:'Paragraph'};
const tplKey=()=>'dg-default-tpl-'+(ME_USER?.id||'x');
function getDefaultTplId(){try{return localStorage.getItem(tplKey())||'standard';}catch(e){return 'standard';}}
function setDefaultTplId(id){try{localStorage.setItem(tplKey(),id);}catch(e){}}
async function loadTemplates(){
  try{const r=await fetch(API+'/api/templates');if(r.ok)TEMPLATES=(await r.json()).templates||[];}catch(e){}
  try{ST.myTemplates=(await DB.all('templates')||[]).filter(t=>t.owner===ME_USER?.id).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));}catch(e){ST.myTemplates=[];}
}
const allTemplates=()=>[...(TEMPLATES.length?TEMPLATES:[{id:'standard',name:'Standard minutes',builtIn:true,sections:[],description:'Summary, discussion, decisions, actions and open questions.'}]),...(ST.myTemplates||[])];
const tplById=id=>allTemplates().find(t=>t.id===id)||allTemplates()[0];
const tplPayload=t=>t.builtIn?{id:t.id}:{id:t.id,name:t.name,sections:t.sections,style:t.style||'',example:t.example||''};

function openTemplates(forReport){
  ST.tplFor=forReport||null;
  const def=getDefaultTplId(),r=forReport?ST.reports.find(x=>x.id===forReport):null,cur=r?(r.templateId||def):def;
  const rows=allTemplates().map(t=>`<div class="tplrow ${t.id===cur?'on':''}">
     <button class="tplpick" data-act="${r?'tpl-use':'tpl-open'}" data-id="${esc(t.id)}"><b>${esc(t.name)}</b><small>${esc(t.description||t.sections.map(x=>x.title).join(' · '))}</small>
       <span class="tplbadges">${t.id===def?'<span class="tagp ok">Default</span>':''}${t.builtIn?'':'<span class="tagp mute">Yours</span>'}${r&&t.id===cur?'<span class="tagp warn">Used now</span>':''}</span></button>
     ${r?`<button class="pillg" data-act="tpl-open" data-id="${esc(t.id)}">View</button>`:''}</div>`).join('');
  sheet(`<h3>${r?'Write this report with…':'Report templates'}</h3>
    <p>${r?'Pick a template. The report is written again in its sections and style, from the same transcript.':'A template sets the sections, their order and the writing style. The default is used for every new report.'}</p>
    <div class="tpllist">${rows}</div>
    <div class="stk"><button class="btng" data-act="tpl-new">+ New template</button><button class="btng" data-act="tpl-example">Make one from an example report</button><button class="btng" data-act="close">Close</button></div>`);
}
function openTplEditor(t,isNew){
  ST.tplEdit=JSON.parse(JSON.stringify({id:t.id||'',name:t.name||'',sections:t.sections||[],style:t.style||'',example:t.example||'',builtIn:!!t.builtIn,description:t.description||'',isNew:!!isNew}));
  renderTplEditor();
}
function renderTplEditor(){
  const t=ST.tplEdit,ro=t.builtIn,def=!t.isNew&&getDefaultTplId()===t.id;
  const secs=t.sections.map((x,i)=>`<div class="tsec" data-i="${i}">
     <div class="tsec-h"><span class="tnum">${i+1}</span>${ro?`<b class="grow">${esc(x.title)}</b>`:`<input class="ts-title grow" value="${esc(x.title)}" placeholder="Section heading" aria-label="Section ${i+1} heading">
       <button class="ticon" data-act="tsec-up" data-i="${i}" aria-label="Move up" ${i?'':'disabled'}>↑</button><button class="ticon" data-act="tsec-down" data-i="${i}" aria-label="Move down" ${i<t.sections.length-1?'':'disabled'}>↓</button><button class="ticon" data-act="tsec-del" data-i="${i}" aria-label="Remove section">×</button>`}</div>
     ${ro?`<small>${esc(KIND_LABEL[x.kind]||x.kind)}${x.guide?' · '+esc(x.guide):''}</small>`
       :`<select class="ts-kind" aria-label="Section type">${Object.entries(KIND_LABEL).map(([k,l])=>`<option value="${k}" ${x.kind===k?'selected':''}>${l}</option>`).join('')}</select>
         <textarea class="ts-guide" rows="2" placeholder="How to write this section (optional)">${esc(x.guide||'')}</textarea>`}</div>`).join('');
  sheet(`<h3>${ro?esc(t.name):t.isNew?'New template':'Edit template'}</h3>${ro?`<p>${esc(t.description||'Built-in template.')} Copy it to make your own version.</p>`:''}
    <div class="stk">
      ${ro?'':`<label class="fld"><span>Template name</span><input id="tplName" value="${esc(t.name)}" placeholder="e.g. Ward round report"></label><b style="font-size:14px;margin:6px 0 -4px">Sections, in order</b>`}
      <div class="tsecs">${secs}</div>
      ${ro?'':`<button class="btng" data-act="tsec-add">+ Add section</button>`}
      ${ro?(t.style?`<p style="font-size:14px;margin:0"><b>Style:</b> ${esc(t.style)}</p>`:'')
        :`<label class="fld"><span>Style notes (optional)</span><textarea id="tplStyle" rows="2" placeholder="e.g. Formal, third person, past tense.">${esc(t.style)}</textarea></label>
          <label class="fld"><span>Reference report (optional)</span><textarea id="tplExample" rows="4" placeholder="Paste a report written the way you like. Its structure and style are copied, never its facts.">${esc(t.example)}</textarea></label>`}
      ${ro?`<button class="btnk" data-act="tpl-copy">Copy and edit</button>`:`<button class="btnk" data-act="tpl-save">Save template</button>`}
      ${def?'<p style="font-size:13px;margin:0">This is your default template for new reports.</p>':ro||!t.isNew?`<button class="btng" data-act="tpl-default">Use for new reports</button>`:''}
      ${!ro&&!t.isNew?`<button class="btng" data-act="tpl-del" style="color:#C42B1C">Delete template</button>`:''}
      <button class="btng" data-act="tpl-back">Back</button></div>`);
}
function syncTplEditor(){
  const t=ST.tplEdit;if(!t||t.builtIn)return;const n=$('#tplName');if(n)t.name=n.value;
  $$('.tsec').forEach(el=>{const x=t.sections[+el.dataset.i];if(!x)return;x.title=el.querySelector('.ts-title').value;x.kind=el.querySelector('.ts-kind').value;x.guide=el.querySelector('.ts-guide').value;});
  const st=$('#tplStyle');if(st)t.style=st.value;const ex=$('#tplExample');if(ex)t.example=ex.value;
}
function openTplExample(){
  ST.tplPdf=null;
  sheet(`<h3>Make a template from an example</h3><p>Paste a report you like, or choose it as a PDF. Qalm reads its sections and style and turns them into a template you can edit.</p>
    <div class="stk"><label class="fld"><span>Example report</span><textarea id="exText" rows="7" placeholder="Paste the example report here"></textarea></label>
      <button class="btng" data-act="tpl-file">Choose a PDF or text file</button><p id="exFile" style="font-size:13px;margin:0"></p>
      <button class="btnk" id="exGo" data-act="tpl-make">Make the template</button><button class="btng" data-act="tpl-back">Back</button></div>`);
}
const fileToBase64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=()=>rej(r.error);r.readAsDataURL(f);});

// Second-language version of a report (the language picked in the selector), in two steps so it shows quickly:
//   1. the report itself (summary, discussion, decisions, actions, questions): a few seconds
//   2. the transcript, which can be long: shown as soon as it arrives
// Lines first said in Arabic are not translated back: the original is used. Kept with the report.
async function translateReport(r,target){
  if(ST.rep.translating)return;ST.rep.translating=true;if(curRep()===r)render();
  const v=r.v||0;
  try{
    const out={v,sum:[],dec:[],act:[],qs:[],topics:[],tx:[],txDone:false};
    // step 1: the report
    let items=[],put=[];const add=(txt,set)=>{items.push(txt||'');put.push(set);};
    r.sum.forEach((x,i)=>add(r.ed['s'+i]??plain(r,x),t=>out.sum[i]=t));
    r.dec.forEach((x,i)=>add(r.ed['d'+i]??plain(r,x),t=>out.dec[i]=t));
    r.act.forEach((a,i)=>{out.act[i]={t:'',due:''};add(r.ed['a'+i]??plain(r,a.t),t=>out.act[i].t=t);add(a.due||'',t=>out.act[i].due=t);});
    r.qs.forEach((q,i)=>add(q.t,t=>out.qs[i]=t));
    (r.topics||[]).forEach((x,i)=>{out.topics[i]={topic:'',notes:''};add(x.topic,t=>out.topics[i].topic=t);add(x.notes||'',t=>out.topics[i].notes=t);});
    out.titles={};out.extra={};
    (r.layout||[]).forEach(e=>add(e.title,t=>out.titles[e.key]=t));
    (r.extra||[]).forEach(x=>{const o=out.extra[x.key]={items:[],text:''};(x.items||[]).forEach((it,i)=>add(it,t=>o.items[i]=t));if(x.text)add(x.text,t=>o.text=t);});
    if(items.length){const j=await api('/api/translate',{target,items});j.items.forEach((t,k)=>put[k](t));}
    r.tr[target]=out;if(curRep()===r&&ST.rep.lang===target)render();
    // step 2: the transcript
    items=[];put=[];
    r.tx.forEach((l,i)=>{const isAr=target==='ar'&&l.o&&/[؀-ۿ]/.test(l.o);if(isAr&&r.ed['t'+i]==null){out.tx[i]=l.o;return;}add(r.ed['t'+i]??plain(r,l.s),t=>out.tx[i]=t);});
    if(items.length){const j=await api('/api/translate',{target,items});j.items.forEach((t,k)=>put[k](t));}
    out.txDone=true;r.tr[target]=out;saveReport(r);
  }catch(e){
    if(!r.tr[target]||r.tr[target].v!==v){ST.rep.lang='en';}
    sheet(`<h3>The ${langOf(target)[2]} version could not be made</h3><p>${esc(e.message)}</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);
  }
  ST.rep.translating=false;if(curRep()===r)render();
}
// Writes the meeting report (minutes) from the checked transcript. Uses the names, corrections and edits.
async function makeMinutes(r,tplId){
  if(!r||!r.real||r.minutes==='working')return;
  if(r.stage==='review')r.stage='done';
  const tpl=tplById(tplId||r.templateId||getDefaultTplId());
  r.minutes='working';r.minutesErr='';if(curRep()===r)render();
  try{
    const body={title:r.title.startsWith('Solo meeting · ')?'':r.title,date:r.when+' '+r.time,languages:repLangs(r).map(langName),
      people:r.people.map(p=>({name:p.n,role:p.r,dept:p.d,org:p.o})),
      segments:r.tx.map((l,i)=>({t:l.t,who:r.people[l.p]?.n||'Unknown',text:(r.ed['t'+i]??plain(r,l.s))})),template:tplPayload(tpl)};
    const m=await api('/api/report',body);
    const idx=name=>{const n=String(name||'').trim().toLowerCase();if(!n)return -1;let k=r.people.findIndex(p=>p.n.toLowerCase()===n);
      if(k<0)k=r.people.findIndex(p=>p.n.toLowerCase().split(/\s+/).includes(n.split(/\s+/)[0])&&!/^speaker \d+$/.test(n));return k;};
    for(const k of Object.keys(r.ed))if(/^[sda]\d/.test(k))delete r.ed[k];
    if(r.title.startsWith('Solo meeting · ')&&m.title)r.title=m.title;
    r.v=(r.v||0)+1;
    Object.assign(r,{sum:m.summary,topics:m.topics,dec:m.decisions,act:m.actions.map(a=>({p:idx(a.owner),t:a.task,due:a.due})),qs:m.questions.map(q=>({p:idx(q.by),t:q.question})),
      layout:m.layout||null,extra:m.extra||[],templateId:tpl.id,templateName:tpl.name,minutes:'done',minutesAt:Date.now()});
    ['r-top','r-dec','r-act'].forEach(k=>ST.open[k]=true);(m.extra||[]).forEach(x=>ST.open['r-x-'+x.key]=true);ST.open['r-tx']=false;
    toast('Meeting report ready');
  }catch(e){r.minutes='error';r.minutesErr=e.message;}
  saveReport(r);if(curRep()===r)render();
}
function buildRealReport(){
  const s=ST.solo,res=s.result,{people,mapP}=peopleFrom(s.speakers);
  const dms=res.durationMs||(s.t||0)*1000, st=s.startedAt?new Date(s.startedAt):new Date(Date.now()-dms), en=new Date(st.getTime()+dms);
  const old=s.rid&&ST.reports.find(x=>x.id===s.rid);
  const parts=s.parts||(s.blob?[s.blob]:[]);
  const keep=old?{res:old.res,ed:old.ed,hist:old.hist,add:old.add,status:old.status,sentAt:old.sentAt}:blank();
  if(old&&old.minutes==='done')Object.assign(keep,{minutes:'done',sum:old.sum,topics:old.topics,dec:old.dec,act:old.act,qs:old.qs,layout:old.layout,extra:old.extra,templateName:old.templateName});
  const L=s.mode==='listen',tplId=old?.templateId||(L&&s.lkind==='video'?'learning':undefined);
  return {id:s.rid||('R'+Date.now()),owner:ME_USER?.id,mid:s.mid||null,stage:'done',createdAt:old?.createdAt||Date.now(),
    result:res,speakers:s.speakers.map(({open,...x})=>x),startedAt:s.startedAt||null,
    kind:L?'listen':'solo',lkind:L?s.lkind:undefined,templateId:tplId,real:true,title:s.title.trim()||((L?'Listen · ':'Solo meeting · ')+hm(st)),when:st.toDateString()===new Date().toDateString()?'Today':st.toLocaleDateString([],{weekday:'short',day:'numeric',month:'short'}),
    time:hm(st)+' – '+hm(en),dur:durTxt(dms/1000),by:ME_USER?.name||'This phone',status:'draft',people,sum:[],dec:[],act:[],qs:[],langs:res.languages||[],
    tx:res.segments.map(g=>({p:mapP[g.speaker]??0,t:mmss(g.startMs/1000),s:g.text,o:g.orig||undefined})),
    tr:{},_blobs:parts,audios:parts.map(b=>URL.createObjectURL(b)),audioName:audioName(),...keep};
}

/* --- saving reports on this phone --- */
const _saveT={};
function saveReport(r){
  if(!r||!r.real)return Promise.resolve();
  clearTimeout(_saveT[r.id]);
  return new Promise(res=>{_saveT[r.id]=setTimeout(async()=>{
    try{const {audios,_blobs,...data}=r;await DB.put('reports',{...JSON.parse(JSON.stringify(data)),_blobs:_blobs||[]});}
    catch(e){toast('Could not save on this phone: '+esc(e.message));}
    res();},150);});
}
async function loadSaved(){
  try{
    const mine=(await DB.all('reports')||[]).filter(r=>r.owner===ME_USER?.id||ME_USER?.role==='admin').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    for(const r of mine){r.audios=(r._blobs||[]).map(b=>URL.createObjectURL(b));}
    ST.reports=[...mine,...ST.reports.filter(x=>!x.real)];
    // Solo always opens ready for a new meeting. A transcript still waiting for its names stays in Reports.
  }catch(e){}
}
async function deleteReport(r){
  try{await DB.del('reports',r.id);if(r.mid)await DB.remove(r.mid);}catch(e){}
  ST.reports=ST.reports.filter(x=>x.id!==r.id);
}

/* ================= GROUP ================= */
const gClock=()=>{const d=new Date();d.setHours(9,2,0,0);return hm(new Date(d.getTime()+ST.group.elapsed*1000));};
const gAll=()=>ST.group.joined?[ME,...ST.group.people]:ST.group.people;
function viewGroup(){
  const g=ST.group;
  if(g.phase==='proc'||g.phase==='done') return procView('',`Weekly Elderly Care Case Review · ${durTxt(g.elapsed)} recorded`,
    ['Uploading '+gAll().length+' recordings from the phones','Lining the recordings up by timestamp','Naming each speaker from their login','Building one clean audio file','Transcribing Arabic and English','Writing the report'],g.pi,'g-open','g-lobby','Back to Group');
  if(g.phase==='meeting'&&g.live) return capsheet(
    `<div class="bar"><button class="back" data-act="g-lobby" aria-label="Back to Group">${I('back')}</button><div class="grow"><b class="gt">Weekly Elderly Care Case Review</b><div class="gsub"><span class="recp ${g.paused?'paused':''}" id="gRec"><i></i><b>${g.paused?'PAUSED':'REC'}</b></span><span class="tm" id="gTime">${mmss(g.elapsed)}</span><span>Room B</span></div></div><span class="chipd">Host</span></div>
     <div id="gStage"></div><div class="hands" id="gHands"></div><div class="grid" id="gGrid"></div>`,
    `${drawer('g-chat','Chat','',`<div class="msgs" id="gChat"></div><form class="inrow" data-form="chat"><input id="chatIn" placeholder="Message everyone" autocomplete="off" aria-label="Message"><button aria-label="Send">${I('send')}</button></form>`)}
     ${drawer('g-qs','Questions','',`<div id="gQs"></div><form class="inrow" data-form="q"><input id="qIn" placeholder="Ask a question" autocomplete="off" aria-label="Question"><button aria-label="Ask">${I('plus')}</button></form>`)}
     ${drawer('g-how','How this meeting is recorded','',`<ol class="steps"><li>Each phone records its own owner, so every voice already has a name.</li><li>There is no live transcript in Group. Nothing to read during the meeting.</li><li>When the host ends it, the phones upload, the server joins the recordings by time and writes the report.</li></ol>`)}
     <div class="dock col"><button class="db" data-act="g-hand" id="gHandBtn">${I('hand')}<span>Raise hand</span></button><button class="db" data-act="g-share" id="gShareBtn">${I('share')}<span>Share</span></button><button class="db" data-act="g-pause" id="gPauseBtn">${I('pause')}<span>Pause all</span></button><button class="db red" data-act="g-end">${I('stop')}<span>End</span></button></div>`);
  return capsheet(
    `<div class="eyebrow">Everyone on their own phone</div><h1 class="lt">Group</h1><p class="sub">Join from an invite. Each phone records its owner, and the report is written after the meeting.</p>`,
    `<div class="sech"><h2>Happening now</h2></div>
     ${g.live?`<button class="livec" data-act="g-join">
        <div class="row"><span class="recp ${g.paused?'paused':''}"><i></i><b>${g.paused?'PAUSED':'LIVE'}</b></span><span class="tm" id="gLobbyTime">${mmss(g.elapsed)}</span><span class="grow"></span><span class="inv">${g.joined?'You are in':'You’re invited'}</span></div>
        <h3>Weekly Elderly Care Case Review</h3><p>Conference Room B · You are the host</p>
        <div class="row" style="margin-top:16px"><div class="avs">${gAll().slice(0,6).map(id=>`<span class="av" style="--c:${DIR[id].c}">${ini(DIR[id].n)}</span>`).join('')}</div><span style="font-size:13px;color:#BDB9B8">${gAll().length} joined</span><span class="grow"></span><span class="joinb">${g.joined?'Return':'Join'}</span></div>
      </button>`:`<div class="empty">No meetings in progress.${g.rid?'<br>The last meeting’s report is under Recap.':''}</div>`}
     ${drawer('g-up','Upcoming',g.upcoming.length,g.upcoming.map(u=>`<div class="lrow"><div class="grow"><b>${esc(u.t)}</b><small>${esc(u.w)} · by ${esc(u.by)}</small></div><span class="tagp ${u.by==='you'?'warn':'mute'}">${u.by==='you'?'Host':'Invited'}</span></div>`).join(''),false,esc(g.upcoming[0].t))}
     <button class="btn2" data-act="g-new">${I('plus','s')}New meeting</button>
     ${drawer('g-about','How Group works','',`<ol class="steps"><li>Create a meeting and invite people. They get a link by email and WhatsApp.</li><li>Invited people see the meeting here and tap to join. Others wait for the host.</li><li>Share your screen, chat, ask questions and raise a hand, like any online meeting.</li><li>Only the host can pause or end the recording.</li></ol>`)}`);
}
function syncGroup(){
  const g=ST.group; if(!$('#gGrid')) return;
  $('#gGrid').className='grid'+(g.paused?' paused':'');
  $('#gGrid').innerHTML=gAll().map(id=>{const p=DIR[id];return `<div class="tile ${g.talk===id&&!g.paused?'talk':''} ${g.hands.includes(id)?'hand':''}" id="tile-${id}"><span class="trec"></span><span class="thand" aria-label="Hand raised">✋</span><div class="tav" style="--c:${p.c}">${ini(p.n)}</div><div class="tn">${id===ME?'You':esc(first(p.n))}</div><div class="td">${esc(p.d)}</div></div>`;}).join('');
  $('#gHands').innerHTML=g.hands.length?`<span class="hchip">✋ ${g.hands.map(id=>id===ME?'You':esc(first(DIR[id].n))).join(', ')}</span>`:'';
  const sh=g.sharing;
  $('#gStage').innerHTML=sh?`<div class="stage ${g.stageOpen?'open':''}"><button class="stageh" data-act="g-stage" aria-expanded="${g.stageOpen}"><span class="dot"></span><span class="grow">${sh===ME?'You are sharing':esc(first(DIR[sh].n))+' is sharing'} · ${sh===ME?'Falls_incident_Rm12.docx':'Khalid_BP_log.pdf'}</span>${I('chev','chev s')}</button><div class="stageb">${sh===ME?'<b>Falls incident report · Room 12</b><br>Mon 02:40 · found beside bed, no injury.<br>Thu 03:15 · fell walking to the bathroom, small bruise on the left hip.':bpChart()}</div></div>`:'';
  $('#gHandBtn').classList.toggle('on',g.hands.includes(ME)); $('#gHandBtn').querySelector('span').textContent=g.hands.includes(ME)?'Lower hand':'Raise hand';
  $('#gShareBtn').classList.toggle('on',sh===ME); $('#gShareBtn').querySelector('span').textContent=sh===ME?'Stop share':'Share';
  $('#gPauseBtn').classList.toggle('on',g.paused); $('#gPauseBtn').innerHTML=(g.paused?I('play'):I('pause'))+`<span>${g.paused?'Resume':'Pause all'}</span>`;
  const r=$('#gRec'); if(r){r.classList.toggle('paused',g.paused);r.querySelector('b').textContent=g.paused?'PAUSED':'REC';}
  syncChat(); syncQs();
}
function syncChat(){
  const g=ST.group,box=$('#gChat'); if(!box) return;
  box.innerHTML=g.chat.length?g.chat.map(m=>`<div class="msg ${m.p===ME?'mine':''}">${m.p===ME?'':`<span class="av" style="--c:${DIR[m.p].c}">${ini(DIR[m.p].n)}</span>`}<div class="bub"><span class="who">${m.p===ME?'You':esc(first(DIR[m.p].n))} · ${m.at}</span>${esc(m.t)}</div></div>`).join(''):'<p class="fine" style="text-align:start">No messages yet.</p>';
  box.scrollTop=box.scrollHeight;
  const c=$('#drc-g-chat'),p=$('#drp-g-chat'),l=g.chat[g.chat.length-1];
  c.textContent=g.unChat||''; c.classList.toggle('hot',g.unChat>0);
  p.textContent=l?(l.p===ME?'You':first(DIR[l.p].n))+': '+l.t:'No messages yet';
}
function syncQs(){
  const g=ST.group,box=$('#gQs'); if(!box) return;
  box.innerHTML=g.qs.length?g.qs.map((q,i)=>`<div class="qrow"><button class="vote ${q.voted?'on':''}" data-act="g-vote" data-i="${i}" aria-label="Upvote">${I('up','s')}${q.votes}</button><div class="grow"><small>${q.p===ME?'You':esc(first(DIR[q.p].n))} · ${q.at}</small><div>${esc(q.t)}</div></div></div>`).join(''):'<p class="fine" style="text-align:start">No questions yet.</p>';
  const c=$('#drc-g-qs'),p=$('#drp-g-qs'),l=g.qs[0];
  c.textContent=g.unQs||(g.qs.length||''); c.classList.toggle('hot',g.unQs>0);
  p.textContent=l?l.t:'Nothing asked yet';
}
const gOpen=id=>ST.tab==='group'&&ST.group.phase==='meeting'&&ST.open[id];
function addChat(p,t){const g=ST.group;g.chat.push({p,t,at:gClock()});if(p!==ME&&!gOpen('g-chat'))g.unChat++;syncChat();}
function addQ(p,t){const g=ST.group;g.qs.unshift({p,t,at:gClock(),votes:1,voted:p===ME});if(p!==ME){if(!gOpen('g-qs'))g.unQs++;toast(`<b>${esc(first(DIR[p].n))} asks:</b> ${esc(t)}`);}syncQs();}
function setHand(id,on){const g=ST.group;g.hands=g.hands.filter(x=>x!==id);if(on){g.hands.push(id);if(id!==ME)toast(`✋ ${esc(first(DIR[id].n))} raised a hand`);}syncGroup();}
function gEv(ms,fn){T(function run(){const g=ST.group;if(!g.live)return;if(g.paused){T(run,400);return;}fn();if(ST.tab==='group')syncGroup();},ms);}
function startGroupSim(){
  const g=ST.group; if(g.sim) return; g.sim=true;
  gEv(2500,()=>addChat('sara','The BP log for Mr. Khalid is ready to share.'));
  gEv(5500,()=>setHand('joseph',true));
  gEv(8500,()=>{if(g.sharing!==ME){g.sharing='priya';g.stageOpen=true;toast('Dr. Priya started sharing her screen');}});
  gEv(12500,()=>addQ('joseph','Do we have the family’s consent for the bed-exit alarm?'));
  gEv(15500,()=>{setHand('joseph',false);addChat('rami','The family room is free on Thursday at 11:00.');});
  gEv(20500,()=>addQ('noura','Could her medicines be reducing her appetite?'));
  gEv(26000,()=>setHand('fatima',true));
  gEv(33000,()=>setHand('fatima',false));
}
function bpChart(){
  const sit=[158,154,156,152,150],stand=[128,121,118,116,112],days=['Mon','Tue','Wed','Thu','Fri'];
  const W=320,H=150,l=30,r=12,t=14,b=24,x=i=>l+i*(W-l-r)/4,y=v=>t+(170-v)/70*(H-t-b),path=a=>a.map((v,i)=>(i?'L':'M')+x(i)+' '+y(v)).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block" role="img" aria-label="Blood pressure sitting and standing, Monday to Friday">
   ${[100,120,140,160].map(v=>`<line x1="${l}" x2="${W-r}" y1="${y(v)}" y2="${y(v)}" stroke="#E7E5E4"/><text x="${l-6}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="#6E6A69">${v}</text>`).join('')}
   ${days.map((d,i)=>`<text x="${x(i)}" y="${H-6}" text-anchor="middle" font-size="10" fill="#6E6A69">${d}</text>`).join('')}
   <path d="${path(sit)}" fill="none" stroke="#020102" stroke-width="2.2"/><path d="${path(stand)}" fill="none" stroke="#FF5D00" stroke-width="2.2"/>
   <circle cx="${x(4)}" cy="${y(150)}" r="3.5" fill="#020102"/><circle cx="${x(4)}" cy="${y(112)}" r="3.5" fill="#FF5D00"/>
   <text x="${x(0)+4}" y="${y(158)-6}" font-size="11" font-weight="700" fill="#020102">Sitting 158</text><text x="${x(4)-4}" y="${y(112)+15}" font-size="11" font-weight="700" fill="#C24400" text-anchor="end">Standing 112</text></svg>`;
}
function buildGroupReport(){
  const g=ST.group, ids=gAll(), people=ids.map(person), ix=id=>Math.max(0,ids.indexOf(id));
  const mine=g.qs.filter(q=>q.p===ME).map(q=>({p:ix(ME),t:q.t}));
  return {id:'G'+Date.now(),kind:'group',title:'Weekly Elderly Care Case Review',when:'Today',time:'09:02 – '+gClock(),dur:durTxt(g.elapsed),by:'Dr. Ahmed Al-Kuwari',status:'draft',people,
    sum:['Mr. Khalid (Room 12): two night-time falls linked to low blood pressure on standing. Amlodipine reduced from 10 mg to 5 mg.','Family meeting with his daughter on {{d1|Thursday|Tuesday}} at 11:00.','Mrs. Maryam (Room 7) lost {{d2|2 kg|12 kg}} in a month. Dietitian referral and swallowing screen this week.'],
    dec:['Reduce amlodipine to 5 mg once daily; review other medicines next week.','Walker, physiotherapy twice a week and night checks every 2 hours for Mr. Khalid.','Dietitian referral and swallowing screen for Mrs. Maryam this week.'],
    act:[{p:ix('noura'),t:'Update the amlodipine prescription and inform nursing',due:'Today'},{p:ix('sara'),t:'Start 2-hourly night checks, Room 12',due:'Tonight'},{p:ix('joseph'),t:'Walker assessment; swallowing screen, Room 7',due:'Tomorrow'},{p:ix('rami'),t:'Book the family meeting; arrange a speech therapist',due:'Thursday'}],
    qs:[{p:ix('joseph'),t:'Do we have the family’s consent for the bed-exit alarm?'},{p:ix('noura'),t:'Could her medicines be reducing her appetite?'},...mine],
    tx:[{p:ix('sara'),t:'09:03',s:'First is Mr. Khalid in room 12. He fell twice this week, both times at night.'},
        {p:ix('noura'),t:'09:05',s:'He takes amlodipine 10 mg, which can cause dizziness when he stands up.',o:'هو ياخذ amlodipine عشرة ملغ، وممكن يسبب dizziness لما يوقف.'},
        {p:ix('joseph'),t:'09:09',s:'His gait is unsteady. I’d recommend a walker and two physiotherapy sessions a week.'},
        {p:ix('fatima'),t:'09:12',s:'His daughter is very worried and asked for a family meeting on {{d1|Thursday|Tuesday}}.',o:'بنته قلقة واجد وتطلب اجتماع مع العائلة يوم الخميس.'},
        {p:ix('priya'),t:'09:16',s:'Sitting, it was 158/94 on Monday, but standing this morning it dropped to 112/68.'},
        {p:ix(ME),t:'09:19',s:'That points to postural hypotension. Let’s reduce the amlodipine to 5 mg.'},
        {p:ix('rami'),t:'09:28',s:'I’ll book the family meeting for 11:00 and request a bed-exit alarm.'},
        {p:ix('fatima'),t:'09:41',s:'Mrs. Maryam is eating less and lost {{d2|2 kg|12 kg}} in a month.',o:'السيدة مريم صارت تاكل أقل، ووزنها نزل كيلوين خلال شهر.'},
        {p:ix('priya'),t:'09:48',s:'Let’s refer her to the dietitian and do a swallowing screen this week.'}],
    tr:TR.D,...blank()};
}

/* ================= REPORTS ================= */
// Languages spoken in a report, as names ("English", "Arabic"...).
const langName=c=>{try{return new Intl.DisplayNames(['en'],{type:'language'}).of(c)||c;}catch(e){return ({en:'English',ar:'Arabic'})[c]||c;}};
const repLangs=r=>(r.langs&&r.langs.length?r.langs:(r.tx.some(l=>l.o)?['en','ar']:['en']));
const onlyEnglish=r=>repLangs(r).every(l=>l==='en');
const UREG=/\{\{(\w+)\|([^|}]+)\|([^}]*)\}\}/g;
const plain=(r,src)=>src.replace(UREG,(m,id,a)=>r.res[id]||a);
function rt(r,key,src){
  if(r.ed[key]!=null) return esc(r.ed[key]);
  return esc(src).replace(UREG,(m,id,a,b)=>r.res[id]?esc(r.res[id]):`<span class="u" role="button" tabindex="0" data-act="u-open" data-id="${id}" data-a="${a}" data-b="${b}">${a}</span>`);
}
function srcOf(r,key){const i=+key.slice(1);return {s:r.sum,d:r.dec}[key[0]]?.[i] ?? (key[0]==='a'?r.act[i].t:r.tx[i].s);}
function unsure(r){
  const ids=new Set(); const scan=(key,src)=>{if(r.ed[key]!=null)return;for(const m of src.matchAll(UREG))if(!r.res[m[1]])ids.add(m[1]);};
  r.sum.forEach((s,i)=>scan('s'+i,s)); r.dec.forEach((s,i)=>scan('d'+i,s)); r.act.forEach((a,i)=>scan('a'+i,a.t)); r.tx.forEach((l,i)=>scan('t'+i,l.s));
  return ids.size;
}
// Who is speaking: a bar with the speaker's name while the recording plays, and a strip showing who spoke when.
function spTimeline(r){
  const seg=r.result?.segments||[];if(!seg.length)return '';
  const tot=Math.max(r.result.durationMs||0,seg[seg.length-1].endMs||0)||1;
  return `<div class="nowsp" id="nowSp"><span class="nsidle">Press play to see who is speaking.</span></div>
    <div class="sptl" id="spTl" data-tot="${tot}" ${r.audios.length===1?'data-act="rep-seek" role="button" aria-label="Jump to a point in the recording"':''}>${seg.map((g,i)=>`<i style="left:${(g.startMs/tot*100).toFixed(2)}%;width:${Math.max(.5,(g.endMs-g.startMs)/tot*100).toFixed(2)}%;--c:${r.people[r.tx[i]?.p]?.c||'#888'}"></i>`).join('')}<b id="spCur"></b></div>`;
}
function showSpeaker(r,ms,playing){
  const seg=r.result.segments,box=$('#nowSp');if(!box)return;
  const i=seg.findIndex(g=>ms>=g.startMs-150&&ms<=g.endMs+350),key=i+':'+playing;
  if(box.dataset.k!==key){box.dataset.k=key;const p=i>=0?r.people[r.tx[i]?.p]:null;
    box.innerHTML=p?`<span class="av lg" style="--c:${p.c}">${esc(/^Speaker \d+$/.test(p.n)?p.n.slice(8):ini(p.n))}</span><span class="grow"><b>${esc(p.n)}</b><small>${esc([p.r,p.d||p.o].filter(Boolean).join(' · ')||(playing?'Speaking now':'Paused here'))}</small></span><span class="nsbars ${playing?'on':''}" style="--c:${p.c}"><i></i><i></i><i></i><i></i></span>`
      :`<span class="nsidle">${playing?'Nobody is speaking':'Paused'}</span>`;
    $$('.txl.now').forEach(x=>x.classList.remove('now'));const l=$$('.txl')[i];if(l)l.classList.add('now');}
  const c=$('#spCur'),tl=$('#spTl');if(c&&tl){c.style.left=Math.min(100,ms/(+tl.dataset.tot)*100)+'%';c.classList.add('on');}
}
for(const ev of ['timeupdate','play','pause','seeked'])document.addEventListener(ev,e=>{
  const a=e.target;if(!a.classList||!a.classList.contains('aud'))return;const r=curRep();if(!r||!r.result)return;
  if(ev==='play'){$$('.aud').forEach(x=>{if(x!==a)x.pause();});readStop();}
  let off=0;for(const x of $$('.aud')){if(x===a)break;off+=isFinite(x.duration)?x.duration:0;}
  showSpeaker(r,(off+a.currentTime)*1000,!a.paused&&!a.ended);
},true);
function repStatus(r){ if(r.stage==='review'&&(r.minutes||'none')==='none') return '<span class="tagp warn">Check names</span>'; if(r.status==='sent') return '<span class="tagp ok">Sent</span>'; const n=unsure(r); return `<span class="tagp warn">${n?n+' to check':'Review'}</span>`; }
function repListHTML(){
  const f=ST.rep.filter,q=ST.rep.q.trim().toLowerCase();
  const list=ST.reports.filter(r=>(f==='all'||(f==='review'?r.status==='draft':r.kind===f))&&(!q||(r.title+' '+r.people.map(p=>p.n).join(' ')+' '+r.sum.join(' ')+' '+r.dec.join(' ')).toLowerCase().includes(q)));
  return list.length?list.map(r=>`<button class="rrow" data-act="rep-open" data-id="${r.id}"><span class="rico">${I(KIND_ICON[r.kind]||'people')}</span><span class="grow"><b>${esc(r.title)}</b><small>${r.when} · ${r.dur} · ${KIND_NAME[r.kind]||'Group'} · ${r.people.length} people</small></span>${repStatus(r)}</button>`).join(''):'<div class="empty">No reports match.</div>';
}
function viewReports(){
  const r=curRep(); if(r) return repDetail(r);
  const drafts=ST.reports.filter(x=>x.status==='draft').length;
  return capsheet(
    `<div class="eyebrow">Written in English · translate any time</div><h1 class="lt">Recap</h1>
     <label class="search">${I('search')}<input id="repQ" placeholder="Search title, person or decision" value="${esc(ST.rep.q)}" autocomplete="off" aria-label="Search reports"></label>
     <button class="tplbtn" data-act="tpl-manage">${I('copy','s')}<span>Report templates</span><b>${esc(tplById(getDefaultTplId()).name)}</b>${I('fwd','s')}</button>`,
    `<div class="chips">${[['all','All'],['review','Needs review'+(drafts?' · '+drafts:'')],['solo','Solo'],['listen','Listen'],['group','Group']].map(([k,l])=>`<button class="chipf ${ST.rep.filter===k?'on':''}" data-act="rep-filter" data-f="${k}">${l}</button>`).join('')}</div>
     <div id="repList" style="display:flex;flex-direction:column;gap:10px">${repListHTML()}</div>`);
}
function repDetail(r){
  if(ST.rep.lang==='orig')ST.rep.lang=r.real?lang1():'en';
  const lang=ST.rep.lang, L=LBL[lang]||LBL.en, rtl=isRtl(lang), isL2=lang!=='en', l2=langOf(lang), txo=r.real&&ST.rep.txOrig!==false,
    lsegHTML=`<span class="lseg" role="group" aria-label="Report language">${[lang1(),secFor(r)].map(c=>`<button class="${lang===c?'on':''}" data-act="rep-l" data-l="${c}" aria-label="${langOf(c)[2]}">${langOf(c)[1]}</button>`).join('')}</span><button class="rdb top" data-act="lang-set" aria-label="Language settings" style="margin:0 0 0 8px">${li(LIc.globe)}</button>`, ed=ST.rep.edit&&lang==='en'&&r.status==='draft';
  // Real reports: Arabic comes from a translation made on demand and kept with the report (redone after edits).
  const tr=lang==='en'?null:r.real?(r.tr[lang]&&r.tr[lang].v===(r.v||0)&&(r.tr[lang].txDone||ST.rep.translating)?r.tr[lang]:null):r.tr[lang];
  if(r.real&&isL2&&!tr&&!ST.rep.translating)setTimeout(()=>translateReport(r,lang),0);
  const E=(key,list)=>ed?`data-ek="${key}" data-list="${list}" contenteditable="true"`:'';
  const txt=(key,src,trTxt)=> (tr&&r.ed[key]==null&&trTxt!=null)?esc(trTxt):rt(r,key,src);
  const added=list=>r.add[list].map(a=>`<li>${a.done?`<span>${esc(a.fixed)}<span class="tagfix">Dictated</span></span>`:'<span class="rawd" id="dictLive"></span>'}</li>`).join('');
  const n=unsure(r), who=p=>r.people[p]||{n:'Unassigned',c:'#D5D2D0',d:''};
  const mins=r.real?(r.minutes||'none'):'done';
  // Section headings from the report's template (translated in Arabic), else the standard ones.
  const lay=r.real&&mins==='done'&&Array.isArray(r.layout)?r.layout:null;
  const T=(field,fallback)=>{const e=lay&&lay.find(x=>x.field===field);return e?((tr&&tr.titles&&tr.titles[e.key])||e.title):fallback;};
  if(r.real&&isL2&&!tr)return capsheet(`<div class="bar"><button class="back" data-act="rep-back">${I('back')}Recap</button><span class="grow"></span>${lsegHTML}</div>
      <h1 class="mt">${esc(r.title)}</h1><div class="writing"><span class="gdots"><i></i><i></i><i></i></span>Translating the report into ${l2[2]}…</div>`,
    `<p class="fine">The report comes first, in a few seconds. The transcript follows. Tap EN to go back.</p>`);
  const cap=`<div class="bar"><button class="back" data-act="rep-back">${I('back')}Recap</button><span class="grow"></span>
      ${r.real&&mins==='done'?readBtn('all','top'):''}${r.real?`${lsegHTML}`
        :Object.keys(r.tr).length?`<button class="pillb" data-act="rep-lang">${I('globe','s')}${LANG[lang].name}</button>`:''}
      ${r.status==='draft'&&lang==='en'?`<button class="pillb ${ed?'on':''}" data-act="rep-edit">${ed?'Done':'Edit'}</button>`:''}</div>
    <div class="kind">${I(KIND_ICON[r.kind]||'people','s')}<span>${KIND_NAME[r.kind]||'Group'} · ${r.people.length} people</span>${repStatus(r)}</div>
    <h1 class="mt">${esc(r.title)}</h1>
    <p class="meta">${r.when} · ${r.time} · ${r.dur}<br>Called by ${esc(r.by)}</p>
    ${!lay||lay.some(e=>e.field==='summary')?`<div class="sumh">${esc(T('summary',L.sum))}${r.real&&mins==='done'?readBtn('sum','inl'):''}</div>`:''}
    ${mins==='working'?`<div class="writing"><span class="gdots"><i></i><i></i><i></i></span>Writing the meeting report…</div>`
      :mins!=='done'?`<p class="sub" style="max-width:none">${mins==='error'?esc(r.minutesErr||'The report could not be written.'):'The transcript is ready. Check it below, then create the meeting report.'}</p><button class="cta" style="margin-top:14px" data-act="rep-minutes">${mins==='error'?'Try again':'Create the meeting report'}</button><button class="tplline" data-act="tpl-choose">Template: <b>${esc(tplById(r.templateId||getDefaultTplId()).name)}</b> · change</button>`:''}
    <ul class="sum ${rtl?'rtl':''} ${ST.rep.shim?'shim':''}" ${rtl?'lang="ar"':''}>${r.sum.map((s,i)=>`<li><span ${E('s'+i,'sum')}>${txt('s'+i,s,tr&&tr.sum[i])}</span></li>`).join('')}${added('sum')}</ul>
    <div class="sumh">Languages detected</div><p class="langs">${repLangs(r).map(langName).join(' · ')}</p>
    <div class="rchips">${r.real&&mins==='done'&&r.status==='draft'?`<button class="rchip" data-act="rep-minutes">↻ Write the report again</button><button class="rchip" data-act="tpl-choose">Template: ${esc(r.templateName||tplById(r.templateId||'standard').name)} ▾</button>`:''}${n&&lang==='en'?`<button class="rchip u1" data-act="u-first">${n} unclear word${n>1?'s':''} · tap the orange text</button>`:''}${r.hist.length?`<span class="rchip">${r.hist.length} change${r.hist.length>1?'s':''} · originals kept</span>`:''}</div>`;
  const topics=(r.topics||[]).map((t0,i)=>{const t=tr&&tr.topics&&tr.topics[i]||t0;return `<div class="act" ${rtl?'dir="rtl" lang="ar"':''}><b class="at" style="display:block;font-weight:700">${esc(t.topic)}</b>${t.notes?`<div style="margin-top:4px;font-size:15px;color:var(--fg2)">${esc(t.notes)}</div>`:''}</div>`;}).join('');
  const dec=`<ol class="nlist ${rtl?'rtl':''} ${ST.rep.shim?'shim':''}" ${rtl?'lang="ar"':''}>${r.dec.map((s,i)=>`<li><span ${E('d'+i,'dec')}>${txt('d'+i,s,tr&&tr.dec[i])}</span></li>`).join('')}${added('dec')}</ol>`;
  const act=r.act.map((a,i)=>{const p=who(a.p),t=tr&&tr.act[i];return `<div class="act"><div class="at ${rtl?'rtl':''}" ${rtl?'dir="rtl" lang="ar"':''} ${E('a'+i,'act')}>${txt('a'+i,a.t,t&&t.t)}</div><div class="am"><span class="sp" style="--c:${p.c}">${esc(first(p.n))}</span><span>${esc((t?t.due:a.due)||'No date')}</span></div></div>`;}).join('');
  const qs=r.qs.map((q,i)=>{const p=who(q.p),t=tr&&tr.qs[i];return `<div class="act"><div class="at" ${rtl&&t?'dir="rtl" lang="ar"':''}>${esc(t||q.t)}</div><div class="am"><span class="sp" style="--c:${p.c}">${esc(first(p.n))}</span><span>Open</span></div></div>`;}).join('');
  const ppl=`<p class="note" style="margin-bottom:8px">${r.real?'Named from the introductions. Anyone who didn’t introduce themselves is listed as Speaker 1, 2… Tap a person to change the name.':r.kind==='solo'?'Named from the voice introductions at the start.':'Named from each person’s login on their own phone.'} ${r.status==='sent'?'Emailed '+esc(r.sentAt)+'.':'The report is emailed to everyone listed.'}</p>`+r.people.map((p,k)=>`<${r.real?`button data-act="rep-person" data-p="${k}"`:'div'} class="prow ${r.real?'tap':''}"><span class="av lg" style="--c:${p.c}">${ini(p.n)}</span><div class="grow"><b dir="auto">${esc(p.n)}</b>${[p.r,p.d,p.o].filter(Boolean).length?`<small dir="auto">${esc([p.r,p.d,p.o].filter(Boolean).join(' · '))}</small>`:''}${p.e||p.ph?`<small>${[p.e,p.ph].filter(Boolean).map(esc).join(' · ')}</small>`:''}${r.real&&!p.e?`<span class="addmail" data-act="rep-person" data-p="${k}" data-focus="email">+ Add email</span>`:(!r.real&&!p.e?'<small>No email on file</small>':'')}</div>${r.real?I('fwd','s'):''}</${r.real?'button':'div'}>`).join('');
  const tx=`${r.real?`<div class="txsw"><span class="lseg sm" role="group" aria-label="Transcript text"><button class="${txo?'on':''}" data-act="tx-orig" data-v="1">As spoken</button><button class="${txo?'':'on'}" data-act="tx-orig" data-v="0">${l2[2]}</button></span></div>`:''}<p class="note">${txo?'Exactly as spoken, in the original languages. ':isL2&&r.real?(tr&&!tr.txDone?'Translating the transcript… lines show in English until it is ready. ':`Shown in ${l2[2]}. `):r.real?(onlyEnglish(r)?'':'Shown in English. '):'Clean transcript: grammar fixed and filler words removed. '}${txo||(isL2&&r.real)?'':lang!=='en'?'Shown in English with the original words underneath.':n?'Orange words were unclear in the audio. Tap one to check it.':'Tap a name to change who said it.'}</p>`+r.tx.map((l,i)=>{const p=who(l.p);return `<div class="txl"><div class="th">${r.real?`<button class="sp" style="--c:${p.c}" data-act="rep-person" data-p="${l.p}" aria-label="Rename ${esc(p.n)}">${esc(first(p.n))}</button>`:`<span class="sp" style="--c:${p.c}">${esc(first(p.n))}</span>`}<span>${l.t}</span></div>${(()=>{
      const isAr=l.o&&/[\u0600-\u06FF]/.test(l.o);
      if(txo)return `<div class="tt" dir="auto"${isAr?' lang="ar"':''}>${l.o?esc(l.o):rt(r,'t'+i,l.s)}</div>`;
      if(isL2&&r.real)return `<div class="tt" dir="${rtl?'rtl':'auto'}" lang="${lang}">${esc(lang==='ar'&&isAr&&r.ed['t'+i]==null?l.o:(tr&&tr.tx&&tr.tx[i])||plain(r,l.s))}</div>`;
      return `<div class="tt" ${E('t'+i,'tx')}>${rt(r,'t'+i,l.s)}</div>${l.o&&!r.real?`<div class="to" dir="auto"${isAr?' lang="ar"':''}>${esc(l.o)}</div>`:''}`;})()}</div>`;}).join('');
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const bars=r.tx.map(l=>Array.from({length:Math.max(4,Math.round(l.s.length/12))},()=>`<i style="--c:${who(l.p).c};height:${20+Math.round(rnd()*80)}%"></i>`).join('')+'<i style="--c:#D5D2D0;height:8%"></i>').join('');
  const rec=r.real?((r.audios||[]).length?(r.audios.length>1?`<p class="note" style="margin-bottom:8px">Recorded in ${r.audios.length} parts because the phone paused the recording. The transcript covers all parts.</p>`:'')+spTimeline(r)+r.audios.map((u,k)=>`${r.audios.length>1?`<b style="display:block;font-size:13px;margin:8px 0 4px">Part ${k+1}</b>`:''}<audio class="aud" controls preload="metadata" src="${u}"></audio>`).join('')+`<button class="btn2" style="margin-top:10px" data-act="rep-dl">Save the audio file${r.audios.length>1?'s':''}</button><button class="btn2" style="margin-top:8px" data-act="rep-txt">Save the transcript (.txt)</button><button class="btn2 danger" style="margin-top:8px" data-act="rep-del">Delete this meeting from the phone</button><p class="fine" style="text-align:start;margin-top:8px">Saved on this phone. The Qalm server deletes its copy after transcription.</p>`:'<p class="note">The audio stays on the phone that recorded it.</p>'):`<div style="display:flex;gap:12px;align-items:center"><button class="playb" data-act="rep-play" aria-label="Play recording">${I(ST.rep.play?'pause':'play')}</button><div class="grow"><b style="font-size:15px">${esc(r.title.replace(/[^A-Za-z0-9]+/g,'_'))}.mp3</b><div style="font-size:13px;color:var(--fg2)">${r.dur} · ${r.people.length} speakers · kept for 30 days</div></div></div><div class="wavebars" id="wave">${bars}</div><p class="fine" style="text-align:start;margin-top:8px">Colours show who is speaking. Playback is simulated in this prototype.</p>`;
  const hist=r.hist.slice().reverse().map(h=>`<div class="hrow2"><small>${esc(h.label)} · ${h.when}</small><s>${esc(h.from)}</s><div>${esc(h.to)}</div></div>`).join('');
  const dock=ed&&r.real?`<button class="dbt k" data-act="rep-edit">Done</button>`:ed?`<button class="dbt" data-act="rep-dictate" ${ST.rep.dictating?'disabled':''}>${I('mic','s')}${ST.rep.dictating?'Listening…':'Dictate'}</button><button class="dbt k" data-act="rep-edit">Done</button>`
    :r.status==='sent'?`<span class="sentl">${I('check','s')}${r.real?'Approved':'Sent to '+r.people.filter(p=>p.e).length+' people'}</span><button class="dbt ic" data-act="rep-copy" aria-label="Copy summary">${I('copy','s')}</button>`
    :`<button class="dbt ic" data-act="rep-copy" aria-label="Copy summary">${I('copy','s')}</button><button class="dbt acc" data-act="rep-send">Approve &amp; send</button>`;
  return capsheet(cap,
    `${lang!=='en'&&tr?`<p class="note">Translated from English by AI. The English original is kept. <button data-act="rep-en" style="font-weight:700;color:var(--accink)">Show original</button></p>`:''}
     ${ed&&r.real?`<p class="note">Tap any transcript line to change it. Changes are saved in the change history.</p>`:ed?`<p class="note">Tap any text to change it, or use Dictate. Dictated words are cleaned up for grammar and spelling.</p>`:''}
     ${lay?lay.filter(e=>e.field!=='summary').map(e=>{
        const title=esc((tr&&tr.titles&&tr.titles[e.key])||e.title),none=t=>`<p class="fine" style="text-align:start">${t}</p>`;
        if(e.field==='topics')return drawer('r-top',title,r.topics.length,topics||none('Nothing recorded for this section.'),true);
        if(e.field==='decisions')return drawer('r-dec',title,r.dec.length+r.add.dec.length,r.dec.length+r.add.dec.length?dec:none('No decisions were made in this meeting.'),true);
        if(e.field==='actions')return drawer('r-act',title,r.act.length,act||none('No action items came up.'),true);
        if(e.field==='questions')return drawer('r-qs',title,r.qs.length,qs||none('No open questions.'));
        const x=(r.extra||[]).find(y=>y.key===e.key)||{items:[],text:''},tx2=tr&&tr.extra&&tr.extra[e.key];
        const body=x.kind==='text'?(x.text?`<p class="xtext" ${rtl?'dir="rtl" lang="ar"':''}>${esc((tx2&&tx2.text)||x.text)}</p>`:none('Nothing recorded for this section.'))
          :(x.items.length?`<ul class="sum xlist ${rtl?'rtl':''}" ${rtl?'lang="ar"':''}>${x.items.map((it,i)=>`<li><span>${esc((tx2&&tx2.items[i])||it)}</span></li>`).join('')}</ul>`:none('Nothing recorded for this section.'));
        return drawer('r-x-'+e.key,title,x.kind==='text'?'':x.items.length,body,true);}).join('')
     :`${(r.topics||[]).length?drawer('r-top',lang==='ar'?'النقاش':'Discussion',r.topics.length,topics,true):''}
     ${r.dec.length+r.add.dec.length||!r.real?drawer('r-dec',L.dec,r.dec.length+r.add.dec.length,dec,true):mins==='done'?drawer('r-dec',L.dec,0,'<p class="fine" style="text-align:start">No decisions were made in this meeting.</p>'):''}
     ${r.act.length||!r.real?drawer('r-act',L.act,r.act.length,act,!!r.real):mins==='done'?drawer('r-act',L.act,0,'<p class="fine" style="text-align:start">No action items came up.</p>'):''}
     ${r.qs.length?drawer('r-qs',L.qs,r.qs.length,qs):''}`}
     ${drawer('r-ppl',L.ppl,r.people.length,ppl)}
     ${drawer('r-tx',L.tx,r.tx.length,tx,!!r.real&&mins!=='done')}
     ${drawer('r-rec',L.rec,'',rec)}
     ${r.hist.length?drawer('r-hist','Change history',r.hist.length,hist):''}
     <div class="dock">${dock}</div>`);
}
const labelOf=k=>({s:'Summary',d:'Decision',a:'Action',t:'Transcript line'}[k[0]])+' '+(+k.slice(1)+1);
function saveEdit(el){
  const r=curRep(); if(!r||!ST.rep.edit||!el.isContentEditable) return;
  const key=el.dataset.ek, old=r.ed[key]!=null?r.ed[key]:plain(r,srcOf(r,key)), val=el.innerText.replace(/\s+/g,' ').trim();
  if(!val||val===old) return;
  r.ed[key]=val; r.v=(r.v||0)+1; r.hist.push({label:labelOf(key)+' edited',from:old,to:val,when:hm(new Date())});
}
const DICT=[
 {raw:'we will review this again in next weeks meeting and rami will sending the reminder',fixed:'We will review this again at next week’s meeting, and Rami will send the reminder.'},
 {raw:'please make sure the night team are informed before tonight shift',fixed:'Please make sure the night team is informed before tonight’s shift.'},
];
function stopPlay(){if(ST.rep.play){clearInterval(ST.rep.play);ST.rep.play=null;}}

/* ================= render ================= */
function render(){
  const cr=ST.rep&&ST.rep.id&&ST.reports.find(r=>r.id===ST.rep.id);if(cr&&cr.real)saveReport(cr);
  const app=$('#app'); const lf=ST.tab==='listen'&&(ST.solo.phase==='idle'||(isListen()&&ST.solo.phase==='meet'));
  app.className='app '+(ST.tab==='solo'||ST.tab==='listen'?'t-dark':'t-mix')+(lf?' lis-fixed'+(ST.solo.mini?' lis-mini':''):'');
  $$('.tabs button').forEach(b=>{const on=b.dataset.tab===ST.tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  const d=ST.reports.filter(r=>r.status==='draft').length, bd=$('#repBadge'); bd.textContent=d; bd.classList.toggle('on',d>0&&ST.tab!=='reports');
  stopPlay();
  $('#view').innerHTML = ST.tab==='solo'?viewSolo():ST.tab==='listen'?viewListen():ST.tab==='group'?viewGroup():viewReports();
  if(ST.tab==='solo'||ST.tab==='listen') syncSolo();
  syncPlayer();
  if(RD.on&&(ST.tab!=='reports'||curRep()?.id!==RD.rid||ST.rep.lang!==RD.lang))readStop();
  if(lf){liveSide();const b=$('#lvText');if(b)b.scrollTop=b.scrollHeight;}
  if(ST.tab==='group') syncGroup();
  ST.rep.shim=false;
}

/* ================= actions ================= */
const ACT={
 account(){openAccount();},
 'set-auto'(el){const on=!autoReport();try{localStorage.setItem(autoKey(),on?'1':'0');}catch(e){}el.classList.toggle('on',on);el.setAttribute('aria-checked',on);toast(on?'Reports will be written automatically':'Reports wait until you press Create the meeting report');if(!$('#bsheet.on'))return;render();},
 async 'claude-check'(){const o=$('#ccOut');if(!o)return;o.innerHTML='<p style="font-size:14px">Checking…</p>';
   try{const r=await fetch(API+'/api/admin/claude-check');const j=await r.json();
     o.innerHTML=!j.keySet?'<div class="warnbox">No ANTHROPIC_API_KEY on the server.</div>':j.checks.map(c=>`<div class="${c.ok?'note':'warnbox'}" style="margin-top:6px">${c.kind==='report'?'Report writer':'Translation'} · ${esc(c.model)}: ${c.ok?'working':'not working'}${c.ok?'':'<br><small>'+esc(c.error||'')+'</small>'}</div>`).join('');}
   catch(e){o.innerHTML='<div class="warnbox">'+esc(e.message)+'</div>';}},
 install(){install();},
 'sign-out'(){signOut();},
 async 'adm-out'(el){await api('/api/admin/signout',{id:el.dataset.id});toast(esc(el.dataset.n)+' signed out');openAccount();},
 async 'adm-en'(el){const on=el.dataset.on!=='1';await api('/api/admin/enable',{id:el.dataset.id,enabled:on});toast(esc(el.dataset.n)+(on?' switched on':' switched off'));openAccount();},
 'pw-eye'(){const i=$('#lgPw');i.type=i.type==='password'?'text':'password';},
 async restart(){closeSheet();if(recording())return toast('End the Solo meeting first');fresh();await loadSaved();render();window.scrollTo(0,0);toast('Sample data reset. Your recorded meetings are kept.');},
 close(){closeSheet();},
 /* ---- solo ---- */
 'solo-start'(){sheet(`<div class="bigic">${I('speaker')}</div><h3>The app tells everyone first</h3><div class="quote">“This meeting will be recorded for digital records.”</div><p>The phone says it aloud when recording starts, so it is on the record too. Then each person introduces themselves.</p><div class="stk"><button class="btnk" data-act="solo-go">Everyone agrees · Start recording</button><button class="btng" data-act="close">Cancel</button></div>`);},
 async 'solo-go'(){
   closeSheet();const s=ST.solo;s.mode='solo';
   try{await recStart();}catch(e){sheet(`<h3>Cannot use the microphone</h3><p>${esc(e.name==='NotAllowedError'?'Microphone access was blocked. Allow the microphone for this site in the browser settings, then try again.':(e.message||String(e)))}</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);return;}
   Object.assign(s,{phase:'intro',t:0,paused:false,introEndMs:0,announceEndMs:0,startedAt:Date.now(),speakers:[],result:null,blob:null,rid:null,mid:REC.mid,pending:null});
   render();window.scrollTo(0,0);
   // The notice is spoken while recording; note when it ends so it is cut from the transcript.
   try{const u=new SpeechSynthesisUtterance('This meeting will be recorded for digital records. Please go around the table and introduce yourselves.');
     const t0=s.startedAt,mid=s.mid;u.onend=()=>{if(ST.solo.mid!==mid)return;ST.solo.announceEndMs=Date.now()-t0+400;DB.patch(mid,{announceEndMs:ST.solo.announceEndMs}).catch(()=>{});};
     speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
 },
 'solo-begin'(){const s=ST.solo;s.introEndMs=s.t*1000;DB.patch(REC.mid,{introEndMs:s.introEndMs}).catch(()=>{});s.phase='meet';render();toast('Introductions saved. Talk as usual.');},
 'solo-pause'(){const s=ST.solo;s.paused=!s.paused;try{s.paused?REC.mr.pause():REC.mr.resume();}catch(e){}
   const b=$('#sPause');if(b)b.innerHTML=s.paused?I('play','s')+'Resume':I('pause','s')+'Pause';
   const r=$('#sRec');if(r){r.classList.toggle('paused',s.paused);r.querySelector('b').textContent=s.paused?'PAUSED':'REC';}
   if(LIS.pip){const d=LIS.pip.document;d.getElementById('pP').textContent=s.paused?'Resume':'Pause';d.getElementById('pD').classList.toggle('pz',s.paused);}
   if(isListen()){try{if(LIVE.mr)s.paused?LIVE.mr.pause():LIVE.mr.resume();}catch(e){}render();}
   syncSolo();},
 'solo-end'(){if(isListen())return sheet(`<h3>Stop listening?</h3><p>Recording stops. The audio is sent once and the notes are written.</p><div class="stk"><button class="btnr" data-act="solo-end-ok">Stop and write notes</button><button class="btng" data-act="close">Keep listening</button></div>`);
   sheet(`<h3>End this meeting?</h3><p>Recording stops. The audio is sent once, transcribed, and each voice is named from the introductions.</p><div class="stk"><button class="btnr" data-act="solo-end-ok">End meeting</button><button class="btng" data-act="close">Keep recording</button></div>`);},
 async 'solo-end-ok'(){closeSheet();const s=ST.solo;if(!(s.phase==='intro'||s.phase==='meet'))return;if(s.phase==='intro')s.introEndMs=s.t*1000;s.paused=false;
   const L=isListen();s.micFlags=L?LIS.flags.slice():null;
   const mid=REC.mid;s.phase='proc';s.step='save';render();
   const words=L?await liveFinish():null;if(L)liveEnd();
   await recStop();await DB.patch(mid,{state:'ended',durationSec:s.t,introEndMs:s.introEndMs}).catch(()=>{});
   processMeeting(mid,null,words);},
 'sign-in-again'(){showLogin('Sign in, then send the recording from the Solo tab.');},
 'solo-retry'(){const s=ST.solo;processMeeting(s.mid,s.mid?null:s.blob);},
 'solo-file'(){FILE_MODE='solo';$('#fileIn').click();},
 'listen-file'(){FILE_MODE='listen';$('#fileIn').click();},
 'lv-kind'(){const s=ST.solo;s.lkind=s.lkind==='call'?'video':'call';render();toast(s.lkind==='call'?'Call or meeting: you get minutes':'Video or lecture: you get learning notes');},
 'lv-mini'(){ST.solo.mini=!ST.solo.mini;render();},
 'lv-tr'(){const s=ST.solo;s.ltr=!s.ltr;render();},
 'lv-lang'(){openLangs('lis',ST.solo.ltarget||lang1());},
 async 'lv-copy'(){const t=liveAllText();if(!t)return toast('Nothing to copy yet');try{await navigator.clipboard.writeText(t);toast('Text copied');}catch(e){toast('Could not copy on this browser');}},
 'lv-txt'(){const t=liveAllText();if(!t)return toast('Nothing to save yet');saveAudio(new Blob([t+'\n'],{type:'text/plain;charset=utf-8'}),'Qalm_Listen_'+new Date().toISOString().slice(0,10)+'.txt');},
 'lv-doc'(){const ps=liveParas();if(!ps.length)return toast('Nothing to save yet');
   const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Listen transcript</title></head><body style="font-family:Calibri,Arial;font-size:12pt"><h2>${esc(ST.solo.title||'Listen transcript')}</h2><p style="color:#666">${new Date().toLocaleString()}</p>${ps.map(t=>`<p dir="auto">${esc(t)}</p>`).join('')}</body></html>`;
   saveAudio(new Blob(['﻿'+html],{type:'application/msword'}),'Qalm_Listen_'+new Date().toISOString().slice(0,10)+'.doc');},
 'lv-link'(){sheet(`<h3>Watch a YouTube video here</h3><p>In YouTube tap Share, copy the link and paste it. The video plays at the top of this page while the text is written below it.</p><div class="stk"><label class="fld"><span>Video link</span><input id="lisUrl" value="${esc(ST.solo.lurl||'')}" placeholder="https://youtu.be/…" inputmode="url" autocomplete="off" autocapitalize="none"></label><button class="btnk" data-act="lv-link-ok">Use this video</button>${ytId(ST.solo.lurl)?'<button class="btng" data-act="lv-link-no">Remove the video</button>':''}<button class="btng" data-act="close">Cancel</button></div>`);},
 'lv-link-ok'(){const s=ST.solo;if(!ytId(s.lurl))return toast('That is not a YouTube video link');closeSheet();render();},
 'lv-link-no'(){ST.solo.lurl='';closeSheet();render();},
 'lv-help'(){sheet(`<h3>How Listen works</h3><div class="helpsc"><ol class="steps"><li>Press the round button to start. On a phone, allow the microphone. On a computer, pick the tab that is playing and keep “Also share tab audio” on.</li><li>The bars on the left show the volume being captured. If they stay empty, nothing is being heard.</li><li>The words appear in the card as they are spoken. Grey words are still being worked out. Every four sentences become a paragraph.</li><li>Switch on the EN toggle to see the text in English. The language button next to it opens the list of languages.</li><li>The number on the right is how many different voices were heard.</li><li>Copy, TXT and Word save the text you see.</li><li>Press the button again to stop. The transcript opens for checking, and you can create the notes.</li></ol>
   <p><b>On a phone.</b> Tap “YouTube link” to play the video inside this page. Keep the sound on the loudspeaker and stay on this page, because the phone stops the recording if you leave.</p>
   <p><b>Small view.</b> The corner button shrinks Listen to the bottom third of the screen, with the video filling the rest.</p>
   <p><b>Calls.</b> Tell people they are being recorded before you start.</p></div><div class="stk"><button class="btnk" data-act="close">Got it</button></div>`);},
 'yt-p'(){ytCmd(YT.state===1?'pauseVideo':'playVideo');},
 'yt-b'(){ytCmd('seekTo',[Math.max(0,YT.t-10),true]);},
 'yt-f'(){ytCmd('seekTo',[YT.t+10,true]);},
 'listen-kind'(el){ST.solo.lkind=el.dataset.k;render();},
 'listen-mic'(){ST.solo.lmic=!ST.solo.lmic;render();},
 'listen-pip'(){listenPip();},
 'listen-start'(){const s=ST.solo;if(s.phase!=='idle')return;
   if(s.lkind==='call')sheet(`<div class="bigic">${I('speaker')}</div><h3>Tell everyone on the call first</h3><p>Say that the call is being recorded for notes before you start. Recording people without telling them can be against the law.</p><div class="stk"><button class="btnk" data-act="listen-go">Everyone knows · Start listening</button><button class="btng" data-act="close">Cancel</button></div>`);
   else ACT['listen-go']();},
 async 'listen-go'(){
   closeSheet();const s=ST.solo;if(s.phase!=='idle')return;
   if(!canListen()&&(s.lurl||'').trim()&&!ytId(s.lurl))return toast('That is not a YouTube video link. Paste the link from Share, or leave it empty.');
   s.mode='listen';
   try{if(canListen()){const stream=await listenCapture(s.lmic);await recStart(null,{stream});LIVE.meterOk=!!LIS.node;}else{await recStart();liveAnalyse(REC.stream);}}
   catch(e){listenCleanup();
     if(e.name==='NotAllowedError'&&!e.noSound)return toast('Nothing was shared, so Listen did not start');
     sheet(e.noSound?`<h3>No sound was shared</h3><p>In the browser's share window, pick the <b>tab</b> that is playing and keep <b>Also share tab audio</b> switched on. A single app window cannot share its sound. On Windows, <b>Entire screen</b> with <b>Also share system audio</b> works for any program.</p><div class="stk"><button class="btnk" data-act="listen-go">Try again</button><button class="btng" data-act="close">Cancel</button></div>`
       :`<h3>Listen could not start</h3><p>${esc(e.message||String(e))}</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);return;}
   Object.assign(s,{phase:'meet',t:0,paused:false,introEndMs:0,announceEndMs:0,startedAt:Date.now(),speakers:[],result:null,blob:null,rid:null,mid:REC.mid,pending:null,micFlags:null});liveReset();
   render();window.scrollTo(0,0);liveGo();listenPip(true);
 },
 'solo-save-audio'(){saveAudio(ST.solo.blob,audioName());},
 async 'solo-continue'(){const s=ST.solo,m=s.pending;if(!m)return;
   try{await recStart(m.mid);}catch(e){sheet(`<h3>Cannot use the microphone</h3><p>${esc(e.message||String(e))}</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);return;}
   Object.assign(s,{title:m.title||'',introEndMs:m.introEndMs||0,announceEndMs:m.announceEndMs||0,t:m.durationSec||0,startedAt:m.startedAt,pending:null,paused:false,mid:m.mid,phase:m.introEndMs?'meet':'intro',speakers:[],result:null,rid:null});
   render();window.scrollTo(0,0);toast('Recording again. The new part joins the same meeting.');},
 async 'solo-continue-now'(){closeSheet();const s=ST.solo;
   try{REC.stopping=true;REC.stream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(REC.raf);try{REC.ctx?.close();}catch(e){}
     await Promise.all(REC.saves);await recStart(REC.mid);}
   catch(e){sheet(`<h3>Cannot use the microphone</h3><p>${esc(e.message||String(e))}</p><div class="stk"><button class="btnk" data-act="solo-end-ok">End meeting and send</button></div>`);return;}
   s.paused=false;render();toast('Recording again. The new part joins the same meeting.');},
 'solo-pending'(){const s=ST.solo,m=s.pending;if(!m)return;Object.assign(s,{mode:m.mode||'solo',lkind:m.lkind||'video',micFlags:null,title:m.title||'',introEndMs:m.introEndMs||0,announceEndMs:m.announceEndMs||0,t:m.durationSec||0,startedAt:m.startedAt,pending:null});processMeeting(m.mid);},
 async 'solo-discard'(){const s=ST.solo;if(!s.pending)return;await DB.remove(s.pending.mid).catch(()=>{});s.pending=null;render();toast('Recording deleted from this phone');},
 'sp-toggle'(el){const i=+el.dataset.i,x=ST.solo.speakers[i];x.open=!x.open;$('#fc'+i).classList.toggle('open',x.open);el.setAttribute('aria-expanded',x.open);},
 'sp-merge'(el){const s=ST.solo,x=s.speakers[+el.dataset.i],t=s.speakers.find(y=>y.label===el.dataset.into);if(!x||!t)return;
   // anyone already joined to x moves to t as well
   s.speakers.forEach(y=>{if(y.mergedInto===x.label)y.mergedInto=t.label;});x.mergedInto=t.label;x.open=false;t.open=false;
   saveSoloSpeakers();render();toast(`Speaker ${x.index} joined with ${esc(spName(t))}`);},
 'sp-unmerge'(el){const s=ST.solo,x=s.speakers.find(y=>y.label===el.dataset.l);if(!x)return;delete x.mergedInto;saveSoloSpeakers();render();toast(`Speaker ${x.index} is separate again`);},
 'sp-pick'(el){const i=+el.dataset.i,p=ROSTER.find(r=>r.id===el.dataset.id),c=$('#fc'+i);if(!p)return;c.querySelector('[data-f=n]').value=p.name;c.querySelector('[data-f=d]').value=p.dept;},
 'sp-save'(el){const i=+el.dataset.i,s=ST.solo,x=s.speakers[i],c=$('#fc'+i),v=f=>c.querySelector(`[data-f=${f}]`).value.trim(),n=v('n');
   const p=rosterBy(n);x.name=n;x.role=v('r');x.dept=v('d');x.org=v('o');x.email=v('e')||(p?p.email:'');x.phone=v('ph');x.edited=true;x.open=false;
   c.outerHTML=cardHTML(i);syncSolo();toast(n?'Name saved for this voice':'Name cleared');
   saveSoloSpeakers();},
 'solo-open'(){const s=ST.solo;const r=buildRealReport();ST.reports=[r,...ST.reports.filter(x=>x.id!==r.id)];saveReport(r);
   Object.assign(s,{phase:'idle',t:0,paused:false,introEndMs:0,speakers:[],result:null,title:'',rid:null,err:'',mid:null,parts:null,blob:null});
   openReport(r.id);ST.open['r-tx']=!autoReport();render();window.scrollTo(0,0);if(autoReport())makeMinutes(r);},
 read(el){readToggle(el.dataset.sec);},
 'rep-seek'(el,e){const a=$('.aud'),b=el.getBoundingClientRect();if(!a||!b.width)return;a.currentTime=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width))*(+el.dataset.tot)/1000;a.play().catch(()=>{});},
 'rep-l'(el){saveAll();const l=el.dataset.l;ST.rep.lang=l;if(l!=='en')ST.rep.edit=false;ST.rep.shim=true;render();},
 'lang-set'(){saveAll();openLangSet();},
 'lang-list'(el){const f=el.dataset.for;openLangs(f,f==='p1'?lang1():lang2Pref()===lang1()?'auto':lang2Pref());},
 'tx-orig'(el){ST.rep.txOrig=el.dataset.v==='1';render();},
 'lang-pick'(el){const c=el.dataset.c,f=el.dataset.for;
   if(f==='lis'){closeSheet();const s=ST.solo;s.ltarget=c;s.ltr=true;render();toast('Showing the text in '+langOf(c)[2]);return;}
   const r=curRep();
   if(f==='p1'){lsSet('dg-lang1-',c);if(lang2Pref()===c)lsSet('dg-lang2-','auto');if(r){ST.rep.lang=c;ST.rep.edit=false;}}
   else{lsSet('dg-lang2-',c);if(r){ST.rep.lang=secFor(r);ST.rep.edit=false;}}
   ST.rep.shim=true;render();openLangSet();},
 'tpl-manage'(){openTemplates(null);},
 'tpl-choose'(){const r=curRep();if(r)openTemplates(r.id);},
 'tpl-use'(el){const r=ST.reports.find(x=>x.id===ST.tplFor);closeSheet();if(!r)return;saveAll();makeMinutes(r,el.dataset.id);},
 'tpl-open'(el){const t=allTemplates().find(x=>x.id===el.dataset.id);if(t)openTplEditor(t,false);},
 'tpl-back'(){openTemplates(ST.tplFor);},
 'tpl-new'(){openTplEditor({name:'',sections:[{title:'Summary',kind:'summary',guide:''},{title:'Decisions',kind:'decisions',guide:''},{title:'Action items',kind:'actions',guide:''}]},true);},
 'tpl-copy'(){const t=ST.tplEdit;openTplEditor({...t,id:'',name:t.name+' (my copy)',builtIn:false},true);},
 'tsec-add'(){syncTplEditor();ST.tplEdit.sections.push({title:'',kind:'bullets',guide:''});renderTplEditor();setTimeout(()=>{const a=$$('.ts-title');a[a.length-1]?.focus();},300);},
 'tsec-del'(el){syncTplEditor();ST.tplEdit.sections.splice(+el.dataset.i,1);renderTplEditor();},
 'tsec-up'(el){syncTplEditor();const a=ST.tplEdit.sections,i=+el.dataset.i;if(i>0)[a[i-1],a[i]]=[a[i],a[i-1]];renderTplEditor();},
 'tsec-down'(el){syncTplEditor();const a=ST.tplEdit.sections,i=+el.dataset.i;if(i<a.length-1)[a[i+1],a[i]]=[a[i],a[i+1]];renderTplEditor();},
 async 'tpl-save'(){syncTplEditor();const t=ST.tplEdit;
   t.name=t.name.trim();t.sections=t.sections.map(x=>({title:x.title.trim(),kind:x.kind,guide:x.guide.trim()})).filter(x=>x.title);
   if(!t.name)return toast('Give the template a name');if(!t.sections.length)return toast('Add at least one section with a heading');
   const id=t.isNew?'c'+Date.now():t.id,old=(ST.myTemplates||[]).find(x=>x.id===id);
   await DB.put('templates',{id,owner:ME_USER?.id,name:t.name,sections:t.sections,style:t.style.trim(),example:t.example.trim(),description:t.sections.map(x=>x.title).join(' · '),createdAt:old?.createdAt||Date.now()});
   await loadTemplates();toast('Template saved');openTplEditor(tplById(id),false);},
 'tpl-default'(){const t=ST.tplEdit;if(t.isNew)return toast('Save the template first');setDefaultTplId(t.id);toast(esc(t.name)+' is now used for new reports');renderTplEditor();render();},
 async 'tpl-del'(){const t=ST.tplEdit;await DB.del('templates',t.id).catch(()=>{});if(getDefaultTplId()===t.id)setDefaultTplId('standard');await loadTemplates();toast('Template deleted');openTemplates(ST.tplFor);render();},
 'tpl-example'(){openTplExample();},
 'tpl-file'(){$('#tplFileIn').click();},
 async 'tpl-make'(){
   const text=($('#exText')?.value||'').trim(),pdf=ST.tplPdf;
   if(!text&&!pdf)return toast('Paste an example or choose a file');
   const b=$('#exGo');b.disabled=true;b.textContent='Reading the example…';
   try{const m=await api('/api/templates/from-example',pdf?{pdf:pdf.b64}:{text});
     openTplEditor({name:m.name,sections:m.sections,style:m.style,example:pdf?'':text},true);toast('Template ready. Check it, then save.');}
   catch(e){b.disabled=false;b.textContent='Make the template';sheet(`<h3>The template could not be made</h3><p>${esc(e.message)}</p><div class="stk"><button class="btnk" data-act="tpl-example">Try again</button><button class="btng" data-act="tpl-back">Back</button></div>`);}},
 'rep-minutes'(){const r=curRep();if(!r)return;saveAll();makeMinutes(r);},
 'solo-new'(){const s=ST.solo;if(s.phase==='review')toast('The transcript is in Recap. Check the names there any time.');Object.assign(s,{phase:'idle',t:0,paused:false,introEndMs:0,speakers:[],result:null,title:'',rid:null,err:'',mid:null});render();checkPending();},
 /* ---- group ---- */
 'g-join'(){const g=ST.group;if(!g.live)return;if(!g.joined){g.joined=true;toast('You’re on the invite list. Recording started on your phone.');startGroupSim();}g.phase='meeting';render();window.scrollTo(0,0);},
 'g-lobby'(){ST.group.phase='lobby';render();},
 'g-stage'(){ST.group.stageOpen=!ST.group.stageOpen;syncGroup();},
 'g-hand'(){setHand(ME,!ST.group.hands.includes(ME));},
 'g-share'(){const g=ST.group;g.sharing=g.sharing===ME?null:ME;g.stageOpen=true;syncGroup();if(g.sharing===ME)toast('Everyone can see your screen');},
 'g-pause'(){const g=ST.group;g.paused=!g.paused;syncGroup();toast(g.paused?'Recording paused on every phone':'Recording resumed on every phone');},
 'g-vote'(el){const q=ST.group.qs[+el.dataset.i];q.voted=!q.voted;q.votes+=q.voted?1:-1;syncQs();},
 'g-end'(){sheet(`<h3>End the meeting for everyone?</h3><p>All ${gAll().length} phones stop recording and upload. The server joins the recordings, transcribes them and writes the report for your review.</p><div class="stk"><button class="btnr" data-act="g-end-ok">End for everyone</button><button class="btng" data-act="close">Keep recording</button></div>`);},
 'g-end-ok'(){closeSheet();const g=ST.group;g.live=false;g.phase='proc';render();window.scrollTo(0,0);runProc(g,6,()=>{const r=buildGroupReport();ST.reports.unshift(r);g.rid=r.id;g.phase='done';});},
 'g-open'(){openReport(ST.group.rid);},
 'g-new'(){sheet(`<h3>New meeting</h3><div class="stk"><label class="fld"><span>Title</span><input id="nmTitle" value="Falls Prevention Working Group" autocomplete="off"></label><div><span style="font-size:13px;font-weight:600;color:var(--mut);margin-left:6px">Invite</span><div class="invc">${Object.keys(DIR).filter(k=>k!==ME).map((k,i)=>`<button class="${i<3?'on':''}" data-act="inv-t">${esc(first(DIR[k].n))}</button>`).join('')}</div></div><button class="btnk" data-act="g-create">Create and send invites</button><button class="btng" data-act="close">Cancel</button></div>`);},
 'inv-t'(el){el.classList.toggle('on');},
 'g-create'(){const t=$('#nmTitle').value.trim()||'Untitled meeting',n=$$('.invc .on').length;ST.group.upcoming.unshift({t,w:'Today · 15:00',by:'you'});ST.open['g-up']=true;closeSheet();render();toast(`Invites sent to ${n} people by email and WhatsApp`);},
 /* ---- reports ---- */
 'rep-open'(el){openReport(el.dataset.id);},
 'rep-back'(){saveAll();ST.rep.id=null;ST.rep.edit=false;ST.rep.lang=lang1();render();window.scrollTo(0,0);},
 'rep-filter'(el){ST.rep.filter=el.dataset.f;render();},
 'rep-edit'(){saveAll();ST.rep.edit=!ST.rep.edit;if(ST.rep.edit){ST.open['r-dec']=true;}render();},
 'rep-lang'(){saveAll();sheet(`<h3>Show this report in</h3><p>Reports are written in English. Translate for anyone who needs it.</p><div style="margin-top:10px">${Object.keys(LANG).map(k=>`<button class="lrowb" data-act="rep-setlang" data-l="${k}"><span class="grow">${LANG[k].full}</span>${ST.rep.lang===k?I('check'):''}</button>`).join('')}<button class="lrowb" disabled>60+ more languages in the live app</button></div>`);},
 'rep-setlang'(el){ST.rep.lang=el.dataset.l;ST.rep.edit=false;ST.rep.shim=true;closeSheet();render();if(ST.rep.lang!=='en')toast('Translated to '+LANG[ST.rep.lang].name);},
 'rep-en'(){ST.rep.lang='en';ST.rep.shim=true;render();},
 'u-open'(el){if(ST.rep.edit)return;
   if(!el.dataset.b){sheet(`<h3>Unclear in the audio</h3><p>Qalm was not sure about this word. Keep it, or type the right one.</p><div class="stk"><button class="btnk" data-act="u-pick" data-id="${el.dataset.id}" data-v="${esc(el.dataset.a)}" data-o="">Keep “${esc(el.dataset.a)}”</button><label class="fld"><span>Correct word</span><input id="uFix" value="${esc(el.dataset.a)}" autocomplete="off"></label><button class="btng" data-act="u-fix" data-id="${el.dataset.id}" data-o="${esc(el.dataset.a)}">Use this word</button></div>`);return;}
   sheet(`<h3>Unclear in the audio</h3><p>The recording was not clear at this word. Which one is right?</p><div class="stk"><button class="btnk" data-act="u-pick" data-id="${el.dataset.id}" data-v="${esc(el.dataset.a)}" data-o="${esc(el.dataset.b)}">${esc(el.dataset.a)}</button><button class="btng" data-act="u-pick" data-id="${el.dataset.id}" data-v="${esc(el.dataset.b)}" data-o="${esc(el.dataset.a)}">${esc(el.dataset.b)}</button></div><p style="font-size:13px">Your choice is used everywhere in this report and saved in the change history.</p>`);},
 'u-fix'(el){const v=$('#uFix').value.trim();if(!v)return;const r=curRep();r.res[el.dataset.id]=v;r.v=(r.v||0)+1;r.hist.push({label:'Unclear word corrected',from:el.dataset.o,to:v,when:hm(new Date())});closeSheet();render();},
 'rep-dl'(){const r=curRep();(r?._blobs||[]).forEach((b,k,a)=>setTimeout(()=>saveAudio(b,a.length>1?r.audioName.replace(/(\.\w+)$/,`_part${k+1}$1`):r.audioName),k*600));},
 'rep-txt'(){const r=curRep();if(!r)return;const txt=`${r.title}\n${r.when} · ${r.time} · ${r.dur}\nPeople: ${r.people.map(p=>p.n+([p.r,p.d,p.o].filter(Boolean).length?' ('+[p.r,p.d,p.o].filter(Boolean).join(', ')+')':'')).join('; ')}\n\n`+r.tx.map((l,i)=>`[${l.t}] ${r.people[l.p]?.n||''}: ${r.ed['t'+i]??plain(r,l.s)}${l.o?'\n        ('+l.o+')':''}`).join('\n\n')+'\n';
   const b=new Blob([txt],{type:'text/plain;charset=utf-8'});saveAudio(b,r.audioName.replace(/\.\w+$/,'')+'_transcript.txt');},
 'rep-person'(el){const r=curRep();if(!r?.real)return;const k=+el.dataset.p,p=r.people[k];if(!p)return;
   const sp=r.speakers.find(x=>x.label===p.labels[0])||{};const unnamed=/^Speaker \d+$/.test(p.n);
   const said=p.labels.map(l=>r.speakers.find(x=>x.label===l)?.heard).filter(Boolean)[0];
   sheet(`<h3>${unnamed?'Name '+esc(p.n):'Change '+esc(p.n)}</h3><p>The name changes on every line this person said.${said?`</p><p style="font-size:14px">Heard at the start: <span dir="auto">“${esc(said)}”</span>`:''}</p>
     <div class="stk"><label class="fld"><span>Name</span><input id="ppN" value="${unnamed?'':esc(p.n)}" placeholder="${esc(p.n)}" list="rosterNames2" autocomplete="off" dir="auto"></label>
     <datalist id="rosterNames2">${ROSTER.map(x=>`<option value="${esc(x.name)}">`).join('')}</datalist>
     <label class="fld"><span>Title or role (optional)</span><input id="ppR" value="${esc(sp.role||'')}" autocomplete="off" dir="auto"></label>
     <label class="fld"><span>Department (optional)</span><input id="ppD" value="${esc(sp.dept||'')}" autocomplete="off" dir="auto"></label>
     <label class="fld"><span>Organisation (optional)</span><input id="ppO" value="${esc(sp.org||'')}" autocomplete="off" dir="auto"></label>
     <label class="fld"><span>Email (for sending the report)</span><input id="ppE" type="email" inputmode="email" value="${esc(p.e||'')}" placeholder="name@company.com" autocomplete="off" autocapitalize="none" spellcheck="false"></label>
     <label class="fld"><span>Phone (optional)</span><input id="ppP" type="tel" inputmode="tel" value="${esc(p.ph||'')}" placeholder="+974 …" autocomplete="off"></label>
     <p style="font-size:13px;margin:0">Giving two speakers the same name joins them into one person.</p>
     <button class="btnk" data-act="rep-person-ok" data-p="${k}">Save</button><button class="btng" data-act="close">Cancel</button></div>`);
   setTimeout(()=>{const i=el.dataset.focus==='email'?$('#ppE'):$('#ppN');if(i&&(unnamed||el.dataset.focus))i.focus();},350);},
 'rep-person-ok'(el){const r=curRep();const p=r.people[+el.dataset.p];if(!p)return;
   const n=$('#ppN').value.trim(),role=$('#ppR').value.trim(),dept=$('#ppD').value.trim(),org=$('#ppO').value.trim(),email=$('#ppE').value.trim(),phone=$('#ppP').value.trim(),hit=rosterBy(n);
   if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('That email does not look right');return;}
   for(const l of p.labels){const x=r.speakers.find(y=>y.label===l);if(!x)continue;x.name=n;x.role=role;x.dept=dept||(n&&hit&&!role&&!org?hit.dept:'');x.org=org;x.email=email||(hit?hit.email:'');x.phone=phone;x.edited=true;}
   const now=n||spName(r.speakers.find(y=>y.label===p.labels[0]));
   if(now!==p.n)r.hist.push({label:'Speaker renamed',from:p.n,to:now,when:hm(new Date())});
   r.v=(r.v||0)+1;relabel(r);closeSheet();render();toast(now===p.n?'Saved':'Renamed on every line');},
 'rep-del'(){sheet(`<h3>Delete this meeting?</h3><p>The transcript and the recording are removed from this phone. This cannot be undone.</p><div class="stk"><button class="btnr" data-act="rep-del-ok">Delete</button><button class="btng" data-act="close">Keep it</button></div>`);},
 async 'rep-del-ok'(){closeSheet();const r=curRep();if(!r)return;await deleteReport(r);ST.rep.id=null;render();toast('Meeting deleted from this phone');},
 'u-pick'(el){const r=curRep();r.res[el.dataset.id]=el.dataset.v;r.v=(r.v||0)+1;r.hist.push({label:'Unclear word checked',from:el.dataset.o?el.dataset.v+' / '+el.dataset.o:el.dataset.v+' (unclear)',to:el.dataset.v,when:hm(new Date())});closeSheet();render();},
 'u-first'(){const u=$('.u[data-act]');if(u)u.click();},
 'rep-dictate'(){
   const r=curRep(); if(!r||ST.rep.dictating) return; saveAll();
   const list=ST.rep.focus==='dec'?'dec':'sum', d=DICT[ST.rep.di++%DICT.length], item={raw:d.raw,fixed:d.fixed,done:false};
   r.add[list].push(item); ST.rep.dictating=true; if(list==='dec')ST.open['r-dec']=true; render();
   const words=d.raw.split(' '); let w=0;
   const tick=()=>{const e=$('#dictLive'); w++; if(e)e.textContent=words.slice(0,w).join(' ');
     if(w<words.length){T(tick,130);return;}
     T(()=>{item.done=true;ST.rep.dictating=false;r.hist.push({label:'Dictated into '+(list==='dec'?'Decisions':'Summary')+' · grammar and spelling fixed',from:d.raw,to:d.fixed,when:hm(new Date())});if(curRep()===r)render();toast('Grammar and spelling fixed');},700);};
   T(tick,300);
 },
 'rep-copy'(){const r=curRep();const txt=r.real?r.title+'\n'+r.time+'\n\n'+r.tx.map((l,i)=>(r.people[l.p]?.n||'')+' ('+l.t+'): '+(r.ed['t'+i]??plain(r,l.s))).join('\n'):r.title+'\n'+r.sum.map((s,i)=>'• '+(r.ed['s'+i]??plain(r,s))).concat(r.add.sum.filter(a=>a.done).map(a=>'• '+a.fixed)).join('\n')+'\n\nActions\n'+r.act.map((a,i)=>'• '+(r.people[a.p]?first(r.people[a.p].n):'')+': '+(r.ed['a'+i]??a.t)+' ('+a.due+')').join('\n');
   try{navigator.clipboard.writeText(txt).then(()=>toast('Summary copied. Paste it into WhatsApp.'),()=>toast('Copy is not available here'));}catch(e){toast('Copy is not available here');}},
 'rep-send'(){const r=curRep(),n=unsure(r);if(n){sheet(`<h3>${n} word${n>1?'s are':' is'} still unclear</h3><p>Check the orange text first so the report is right, or send it as it is.</p><div class="stk"><button class="btnk" data-act="send-check">Check now</button><button class="btng" data-act="send-ok">Send anyway</button></div>`);return;}ACT['send-ok']();},
 'send-check'(){closeSheet();ACT['u-first']();},
 'send-ok'(){closeSheet();const r=curRep();r.status='sent';r.sentAt='today, '+hm(new Date());ST.rep.edit=false;render();if(r.real){toast('Approved. Email sending is connected in a later step.');return;}toast(`Emailed to ${r.people.filter(p=>p.e).length} people with the PDF minutes`);},
 'rep-play'(){
   if(ST.rep.play){stopPlay();$('.playb').innerHTML=I('play');return;}
   const bars=$$('#wave i'); let i=bars.findIndex(b=>!b.classList.contains('pl')); if(i<0){bars.forEach(b=>b.classList.remove('pl'));i=0;}
   $('.playb').innerHTML=I('pause');
   ST.rep.play=setInterval(()=>{if(i>=bars.length){stopPlay();const p=$('.playb');if(p)p.innerHTML=I('play');return;}bars[i++].classList.add('pl');},70);
 },
};
function saveAll(){$$('[data-ek]').forEach(saveEdit);}
function openReport(id){ST.tab='reports';ST.rep.id=id;ST.rep.lang=ST.reports.find(x=>x.id===id)?.real?lang1():'en';ST.rep.txOrig=true;ST.rep.edit=false;['r-dec','r-act','r-qs','r-ppl','r-tx','r-rec','r-hist'].forEach(k=>delete ST.open[k]);render();window.scrollTo(0,0);}
const FORM={
 async login(){
   const btn=$('#lgBtn'),err=$('#lgErr');err.hidden=true;btn.disabled=true;btn.textContent='Signing in…';
   try{const j=await api('/api/login',{login:$('#lgLogin').value,password:$('#lgPw').value});fresh();signedIn(j);toast('Welcome, '+esc(j.user.name)+' · '+j.online+' of '+j.max+' signed in');}
   catch(e){err.textContent=e.message==='Failed to fetch'?'Cannot reach the server. Check the connection.':e.message;err.hidden=false;btn.disabled=false;btn.textContent='Sign in';}
 },
 chat(f){const v=$('#chatIn').value.trim();if(!v)return;$('#chatIn').value='';addChat(ME,v);},
 q(f){const v=$('#qIn').value.trim();if(!v)return;$('#qIn').value='';addQ(ME,v);toast('Question posted for everyone');},
};


/* ================= install as an app ================= */
let INSTALL_EVT=null;
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();INSTALL_EVT=e;$$('.instbtn').forEach(b=>b.hidden=false);});
window.addEventListener('appinstalled',()=>{INSTALL_EVT=null;$$('.instbtn').forEach(b=>b.hidden=true);toast('Qalm is on your home screen');});
const installBtn=(cls='btn2')=>isStandalone()?'':`<button type="button" class="${cls} instbtn" data-act="install">${I('device','s')}Add Qalm to your home screen</button>`;
async function install(){
  if(INSTALL_EVT){INSTALL_EVT.prompt();const r=await INSTALL_EVT.userChoice.catch(()=>({}));INSTALL_EVT=null;if(r.outcome!=='accepted')toast('You can add it any time from here');return;}
  const ios=isIOS();
  sheet(`<div class="bigic" style="background:none;padding:0"><img src="/icons/icon-192.png" alt="" width="60" height="60" style="border-radius:16px"></div><h3>Add Qalm to your home screen</h3><p>It opens full screen with its own icon, like any app.</p>
    <ol class="steps" style="margin-top:16px;color:var(--ink)">${ios
      ?`<li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow) at the bottom.</li><li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>`
      :`<li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu at the top right.</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b>, then <b>Install</b>.</li>`}</ol>
    <p style="font-size:13px">Address: <b>${esc(location.host)}</b></p><div class="stk"><button class="btnk" data-act="close">Done</button></div>`);
}

/* ================= sign-in ================= */
let ME_USER=null,HB_FULL=false;
async function api(path,body){const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});const j=await r.json().catch(()=>({}));if(r.status===401&&path!=='/api/login'){showLogin('You were signed out. Please sign in again.');throw new Error(j.error||'Signed out');}if(!r.ok)throw Object.assign(new Error(j.error||('Error '+r.status)),{status:r.status,body:j});return j;}
async function boot(){
  try{const r=await fetch(API+'/api/me');const j=await r.json().catch(()=>({}));
    if(r.ok){signedIn(j);return;}
    if(r.status===423&&j.user){signedIn({user:j.user});toast(esc(j.error));return;}
  }catch(e){}
  showLogin();
}
function loginHTML(msg){
  return `<div class="lhero"><img class="qlogo xl" src="/icons/qalm-logo.png" alt="Qalm by ForgeHype" width="230" height="90">
     <div class="eyebrow" style="margin-top:44px">Qalm</div><h1 class="lt">Sign in</h1><p class="sub">Meeting notes that know who spoke.</p></div>
   <form class="lform" data-form="login" autocomplete="on">
     ${msg?`<div class="warnbox">${esc(msg)}</div>`:''}
     <label class="fld"><span>Email or guest name</span><input id="lgLogin" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="you@forgehype.qa or Guest 1" required></label>
     <label class="fld"><span>Password</span><span class="pwrow"><input id="lgPw" name="password" type="password" autocomplete="current-password" required><button type="button" class="eye" data-act="pw-eye" aria-label="Show password">Show</button></span></label>
     <div class="warnbox" id="lgErr" hidden></div>
     <button class="cta" id="lgBtn">Sign in</button>
     <p class="fine">Demo: up to 4 people can be signed in at the same time.</p>
     ${installBtn()}
   </form>`;
}
function showLogin(msg){
  ME_USER=null;closeSheet();$('#app').hidden=true;const L=$('#loginScreen');L.hidden=false;L.innerHTML=loginHTML(msg);
  setTimeout(()=>{const i=$('#lgLogin');if(i&&matchMedia('(pointer:fine)').matches)i.focus();},50);
}
function signedIn(j){
  ME_USER=j.user;$('#loginScreen').hidden=true;$('#loginScreen').innerHTML='';$('#app').hidden=false;
  $('.me').textContent=j.user.short;$('.me').classList.toggle('adm',j.user.role==='admin');
  render();loadServer();
  loadSaved().then(()=>{render();checkPending();});
  loadTemplates().then(()=>{if(ST.tab==='reports')render();});
}
async function signOut(){
  if(recording())return toast('End the Solo meeting first');
  try{await fetch(API+'/api/logout',{method:'POST'});}catch(e){}
  fresh();showLogin();
}
async function openAccount(){
  const u=ME_USER;if(!u)return;
  const head=`<div style="display:flex;gap:14px;align-items:center"><span class="av lg" style="--c:${u.role==='admin'?'#FF5D00':'#45D3C5'};width:54px;height:54px;font-size:16px">${esc(u.short)}</span><div><h3>${esc(u.name)}</h3><p style="margin:0">${u.role==='admin'?'Admin · full access':'Guest account'}</p></div></div>`;
  const foot=`<div class="stk"><button class="btng" data-act="lang-set">${li(LIc.globe)} Languages: ${langOf(lang1())[2]} and ${lang2Pref()==='auto'?'automatic':langOf(lang2Pref())[2]}</button><button class="lsw ${autoReport()?'on':''}" role="switch" aria-checked="${autoReport()}" data-act="set-auto"><span class="grow"><b>Create the report automatically</b><small>Off: you check the transcript first, then press Create the meeting report.</small></span><i></i></button>${u.role==='admin'?'<button class="btng" data-act="claude-check">Check meeting reports (Claude)</button><div id="ccOut"></div>':''}${installBtn('btng')}<button class="btnk" data-act="sign-out">Sign out</button>${u.role==='admin'?'<button class="btng" data-act="restart">Reset the sample data</button>':''}<button class="btng" data-act="close">Close</button></div>`;
  if(u.role!=='admin'){sheet(head+`<p>Signed in on this device. Your meetings stay on this phone until the database is connected.</p>`+foot);return;}
  sheet(head+`<p id="admLoad">Loading who is online…</p>`+foot);
  try{
    const r=await fetch(API+'/api/admin/users');const j=await r.json();if(!r.ok)throw new Error(j.error);
    const on=j.users.filter(x=>x.online).length,ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'now':m+' min ago';};
    const rows=j.users.map(x=>`<div class="arow"><span class="dot ${x.online?'on':''}"></span><div class="grow"><b>${esc(x.name)}${x.role==='admin'?' <span class="tagp warn">Admin</span>':''}</b><small>${x.online?`${esc(x.device)} · signed in ${new Date(x.since).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · active ${ago(x.lastSeen)}`:x.enabled?'Not signed in':'Switched off'}</small></div>
      ${x.role==='admin'?'':`${x.online?`<button class="pillg" data-act="adm-out" data-id="${x.id}" data-n="${esc(x.name)}">Sign out</button>`:''}<button class="pillg ${x.enabled?'':'off'}" data-act="adm-en" data-id="${x.id}" data-n="${esc(x.name)}" data-on="${x.enabled?1:0}">${x.enabled?'On':'Off'}</button>`}</div>`).join('');
    $('#admLoad').outerHTML=`<div class="sech" style="padding:18px 0 4px"><h2 style="font-size:17px">Online now</h2><span><b>${on}</b> of ${j.max}</span></div><div class="alist">${rows}</div><p style="font-size:13px">Guests sign in with Guest 1 to Guest 6. Switching a guest off signs them out and blocks them. You are never locked out: if the demo is full, the guest idle longest gives up their seat.</p>`;
  }catch(e){const l=$('#admLoad');if(l)l.textContent=e.message;}
}
// heartbeat keeps your seat; 3 minutes without it frees the seat for someone else
setInterval(async()=>{
  if(!ME_USER)return;
  try{const r=await fetch(API+'/api/me');
    if(r.status===401){if(recording()){toast('Signed out on the server. Recording continues on this phone; sign in again after ending.');return;}showLogin('You were signed out. Your meetings are saved on this phone. Please sign in again.');}
    if(r.status===423&&!HB_FULL){HB_FULL=true;toast('The demo is full right now. You are still signed in and nothing is lost.');}else if(r.ok)HB_FULL=false;
  }catch(e){}
},30000);

/* ================= events ================= */
document.addEventListener('click',e=>{
  const tab=e.target.closest('[data-tab]'); if(tab){saveAll();ST.tab=tab.dataset.tab;if(ST.tab!=='reports'){ST.rep.id=null;ST.rep.edit=false;}render();window.scrollTo(0,0);return;}
  const dh=e.target.closest('.drh'); if(dh){const d=dh.parentElement,id=d.dataset.dr,open=!d.classList.contains('open');d.classList.toggle('open',open);dh.setAttribute('aria-expanded',open);ST.open[id]=open;
    if(open&&id==='g-chat'){ST.group.unChat=0;syncChat();} if(open&&id==='g-qs'){ST.group.unQs=0;syncQs();} return;}
  const b=e.target.closest('[data-act]'); if(b&&!b.disabled&&ACT[b.dataset.act]) ACT[b.dataset.act](b,e);
});
$('#scrim').addEventListener('click',closeSheet);
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target.dataset.form;if(FORM[f])FORM[f](e.target);});
document.addEventListener('input',e=>{
  if(e.target.id==='repQ'){ST.rep.q=e.target.value;$('#repList').innerHTML=repListHTML();}
  if(e.target.id==='soloTitle')ST.solo.title=e.target.value;
  if(e.target.id==='lisUrl')ST.solo.lurl=e.target.value;
});
document.addEventListener('change',async e=>{
  if(e.target.id==='tplFileIn'&&e.target.files[0]){
    const f=e.target.files[0];e.target.value='';
    if(f.size>10*1024*1024)return toast('That file is over 10 MB');
    if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){ST.tplPdf={name:f.name,b64:await fileToBase64(f)};const p=$('#exFile');if(p)p.textContent='Chosen: '+f.name;}
    else{const t=await f.text();const ta=$('#exText');if(ta)ta.value=t.slice(0,20000);ST.tplPdf=null;const p=$('#exFile');if(p)p.textContent='Loaded: '+f.name;}
    return;
  }
  if(e.target.id!=='fileIn'||!e.target.files[0])return;
  const f=e.target.files[0],s=ST.solo;e.target.value='';
  Object.assign(s,{mode:FILE_MODE,micFlags:null,title:s.title||f.name.replace(/\.[^.]+$/,''),t:0,introEndMs:0,announceEndMs:0,startedAt:0,pending:null});
  processMeeting(null,f);
});
document.addEventListener('focusin',e=>{const el=e.target.closest&&e.target.closest('[data-ek]');if(el)ST.rep.focus=el.dataset.list;});
document.addEventListener('focusout',e=>{const el=e.target.closest&&e.target.closest('[data-ek]');if(el)saveEdit(el);});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeSheet();
  if(e.key==='Enter'){const ek=e.target.closest&&e.target.closest('[data-ek]');if(ek){e.preventDefault();ek.blur();return;}
    if(e.target.matches&&e.target.matches('[role=button][data-act]')){e.preventDefault();e.target.click();}}
});
/* clocks and "who is speaking" in Group */
setInterval(()=>{
  const s=ST.solo; if((s.phase==='intro'||s.phase==='meet')&&!s.paused&&recording()&&!(isListen()&&LIS.node)){s.t++;const e=$('#sTime');if(e)e.textContent=mmss(s.t);}
  const g=ST.group; if(g.live&&!g.paused){g.elapsed++;const a=$('#gTime'),b=$('#gLobbyTime');if(a)a.textContent=mmss(g.elapsed);if(b)b.textContent=mmss(g.elapsed);}
},1000);
setInterval(()=>{
  const g=ST.group; if(!g.live||g.paused) return; const all=g.people; g.talk=all[(all.indexOf(g.talk)+1+Math.floor(Math.random()*2))%all.length];
  if(ST.tab==='group'&&$('#gGrid')) $$('.tile').forEach(t=>t.classList.toggle('talk',t.id==='tile-'+g.talk));
},2600);

fresh(); boot();
