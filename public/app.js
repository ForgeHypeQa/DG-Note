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
 en:{sum:'In 30 seconds',dec:'Decisions',act:'Action items',qs:'Questions',ppl:'People',tx:'Transcript',rec:'Recording'},
 ar:{sum:'في 30 ثانية',dec:'القرارات',act:'المهام',qs:'الأسئلة',ppl:'الحضور',tx:'النص',rec:'التسجيل'},
 hi:{sum:'30 सेकंड में',dec:'निर्णय',act:'कार्य',qs:'प्रश्न',ppl:'उपस्थित लोग',tx:'ट्रांसक्रिप्ट',rec:'रिकॉर्डिंग'},
 bn:{sum:'৩০ সেকেন্ডে',dec:'সিদ্ধান্ত',act:'করণীয়',qs:'প্রশ্ন',ppl:'উপস্থিতি',tx:'ট্রান্সক্রিপ্ট',rec:'রেকর্ডিং'},
};
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
   solo:{phase:'idle',title:'',t:0,paused:false,introEndMs:0,startedAt:0,speakers:[],result:null,blob:null,mid:null,rid:null,step:'',err:'',upPct:0,pending:null},
   group:{phase:'lobby',live:true,joined:false,sim:false,elapsed:23*60+14,paused:false,hands:[],sharing:null,stageOpen:true,chat:[],qs:[],talk:'sara',unChat:0,unQs:0,
     people:['sara','priya','noura','fatima','joseph','rami'],pi:0,rid:null,
     upcoming:[{t:'Medication Safety Review',w:'Tomorrow · 11:00',by:'Noura'},{t:'Monthly Quality & Incidents',w:'Thu 12 Nov · 14:00',by:'Rami'}]},
   reports:seedReports(), rep:{id:null,lang:'en',edit:false,filter:'all',q:'',focus:'sum',play:null,dictating:false,di:0}};
}
const curRep=()=>ST.reports.find(r=>r.id===ST.rep.id);

/* ================= shared pieces ================= */
function capsheet(cap,sheet){return `<div class="capwrap"><div class="cap">${cap}</div></div><div class="sheetwrap"><div class="sheet">${sheet}</div></div>`;}
function drawer(id,title,count,body,defOpen,preview){
  const open=ST.open[id]!==undefined?ST.open[id]:!!defOpen;
  return `<section class="dr ${open?'open':''}" data-dr="${id}"><button class="drh" aria-expanded="${open}"><span class="drt">${title}</span><span class="drc" id="drc-${id}">${count===0||count?count:''}</span><span class="drp" id="drp-${id}">${preview||''}</span>${I('chev','chev')}</button><div class="drb"><div class="dri"><div class="drpad">${body}</div></div></div></section>`;
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
// Flow: record on this phone (saved every 5 s) → end → upload once → ForgeHype Meet transcription
// (speakers + Arabic/English + translation) → names from the introductions → review → report.
const API = location.protocol.startsWith('http') ? '' : 'http://localhost:3000';
let ROSTER = Object.keys(DIR).map(k=>({id:k,name:DIR[k].n,dept:DIR[k].d,email:DIR[k].e}));
let HEALTH = null;
async function loadServer(){
  try{
    HEALTH = await fetch(API+'/api/health').then(r=>r.json());
    const r = await fetch(API+'/api/roster').then(r=>r.json()); if(r.people) ROSTER=r.people;
  }catch(e){ HEALTH={offline:true}; }
  if(ST.tab==='solo'&&ST.solo.phase==='idle') render();
}
const rosterBy=n=>ROSTER.find(p=>p.name.toLowerCase()===String(n).trim().toLowerCase());

/* --- storage on this phone (IndexedDB). No server database. --- */
// Everything is kept on this phone until the database is connected:
//   meetings: one row per recording (title, times, owner, state)
//   chunks:   the audio, saved every 5 s while recording (part = a new piece after the phone stopped recording)
//   reports:  finished transcripts with names, edits, change history and the audio
const DB={db:null,
  open(){return this.db||(this.db=new Promise((res,rej)=>{const q=indexedDB.open('dg-note',2);q.onupgradeneeded=()=>{const d=q.result;
    if(!d.objectStoreNames.contains('meetings'))d.createObjectStore('meetings',{keyPath:'mid'});
    if(!d.objectStoreNames.contains('chunks'))d.createObjectStore('chunks',{keyPath:['mid','i']});
    if(!d.objectStoreNames.contains('reports'))d.createObjectStore('reports',{keyPath:'id'});};
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
const savedTxt=()=>`Saved on this phone · ${(REC.bytes/1048576).toFixed(1)} MB`;
async function recStart(continueMid){
  if(!window.isSecureContext) throw new Error('The microphone only works over https (or on localhost). Open DG-Note from its https address.');
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder) throw new Error('This browser cannot record audio. Use Chrome on Android or Safari on iPhone.');
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true,channelCount:1}});
  const mime=pickMime(), mr=new MediaRecorder(stream,mime?{mimeType:mime,audioBitsPerSecond:64000}:{});
  let mid,part=0,i=0,bytes=0;
  if(continueMid){
    mid=continueMid;const old=await DB.rawChunks(mid);
    part=old.reduce((m,c)=>Math.max(m,(c.part||0)+1),0);i=old.reduce((m,c)=>Math.max(m,c.i+1),0);bytes=old.reduce((n,c)=>n+(c.blob?.size||0),0);
    await DB.patch(mid,{state:'recording',parts:part+1});
  }else{
    mid='m'+Date.now();
    await DB.put('meetings',{mid,owner:ME_USER?.id,title:ST.solo.title,mime:(mr.mimeType||mime||'audio/webm'),startedAt:Date.now(),introEndMs:0,durationSec:0,state:'recording',parts:1});
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
  meter(stream); wake(true);
}
function recStop(){
  REC.stopping=true;
  return new Promise(res=>{const mr=REC.mr;if(!mr||mr.state==='inactive')return res();mr.onstop=()=>setTimeout(res,30);mr.stop();})
   .then(()=>Promise.all(REC.saves)).then(()=>{REC.stream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(REC.raf);try{REC.ctx?.close();}catch(e){}wake(false);});
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
  render();
  sheet(`<div class="bigic">${I('mic')}</div><h3>Recording stopped while DG-Note was in the background</h3><p>Everything up to ${mmss(s.t)} is saved on this phone. Continue to record the rest of the meeting into the same file.</p><div class="stk"><button class="btnk" data-act="solo-continue-now">Continue recording</button><button class="btng" data-act="solo-end-ok">End meeting and send</button></div>`);
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&ME_USER)fetch(API+'/api/me').catch(()=>{});
  if(document.visibilityState==='hidden'){if(recording())REC.hiddenAt=Date.now();return;}
  if(REC.lost||(REC.mr&&REC.mr.state==='inactive'&&!REC.stopping&&(ST.solo.phase==='intro'||ST.solo.phase==='meet'))){REC.lost=true;recLost();return;}
  if(!recording())return;
  wake(true);
  if(REC.hiddenAt&&Date.now()-REC.hiddenAt>3000)toast('Welcome back. Still recording. Keep DG-Note on screen: some phones stop recording in the background.');
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
async function processMeeting(mid,fileBlob){
  const s=ST.solo; Object.assign(s,{phase:'proc',step:'save',err:'',upPct:0,mid,result:null,rid:null}); render(); window.scrollTo(0,0);
  try{
    let parts=fileBlob?[fileBlob]:null;
    if(!parts){const meta=await DB.get('meetings',mid)||{};parts=(await DB.parts(mid,meta.mime)).filter(b=>b.size);if(!parts.length)throw new Error('No audio was saved on this phone for this meeting.');
      await DB.patch(mid,{state:'ended'});}
    s.parts=parts; s.blob=parts[0];
    const blob=parts.length>1?new Blob(parts,{type:parts[0].type}):parts[0];
    if(!HEALTH||HEALTH.offline)await loadServer();
    if(HEALTH?.offline)throw new Error('Cannot reach the DG-Note server. Your recording is safe on this phone. Try again when you are online.');
    if(!HEALTH.engine)throw new Error('Transcription is not switched on for this server yet. Ask the admin. Your recording is safe on this phone.');
    s.step='upload';render();
    const q=new URLSearchParams({title:s.title||'',introEndMs:String(Math.round(s.introEndMs||0)),durationMs:String(Math.round((s.t||0)*1000))});
    const job=await upload(API+'/api/solo/jobs?'+q,blob,p=>{s.upPct=p;const e=$('#upPct');if(e)e.textContent=Math.round(p*100)+'%';},parts.length>1?{'X-Parts':parts.map(b=>b.size).join(',')}:{});
    s.step='queued';render();
    for(;;){
      await new Promise(r=>setTimeout(r,2000));
      const r=await fetch(API+'/api/solo/jobs/'+job.id);const j=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(r.status===401?'Please sign in again. Your recording is safe on this phone.':j.error||('Server error '+r.status));
      if(j.status==='error')throw new Error(j.error||'Transcription failed.');
      if(j.status==='done'){s.result=j.result;break;}
      if(j.step!==s.step){s.step=j.step;if(ST.tab==='solo'&&s.phase==='proc')render();}
    }
    s.speakers=s.result.speakers.map((x,i)=>({...x,c:C[i%C.length],open:false,edited:false}));
    if(!s.speakers.length)throw new Error('No speech was found in the recording.');
    // Save straight away so nothing is lost if the app is closed on the next screen.
    const r=buildRealReport();r.stage='review';ST.reports.unshift(r);s.rid=r.id;await saveReport(r);
    if(mid)await DB.patch(mid,{state:'done',rid:r.id}).catch(()=>{});
    s.phase='review';
    if(ST.tab==='solo')render();else toast('Transcript ready. Open Solo to check the names.');
  }catch(e){s.phase='error';s.err=e.message||String(e);if(ST.tab==='solo')render();else toast('Solo: '+esc(s.err));}
}
async function checkPending(){
  try{const ms=(await DB.all('meetings')||[]).filter(m=>m.state!=='done'&&m.mid!==REC.mid&&(!m.owner||m.owner===ME_USER?.id||ME_USER?.role==='admin'));
    ST.solo.pending=ms.sort((a,b)=>b.startedAt-a.startedAt)[0]||null;
    if(ST.tab==='solo'&&ST.solo.phase==='idle')render();}catch(e){}
}
function audioName(){const s=ST.solo,ext=/mp4|m4a|aac/.test(s.blob?.type||'')?'m4a':/ogg/.test(s.blob?.type||'')?'ogg':/mpeg|mp3/.test(s.blob?.type||'')?'mp3':/wav/.test(s.blob?.type||'')?'wav':'webm';
  return `DG-Note_${(s.title||'Solo').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'')}_${new Date().toISOString().slice(0,10)}.${ext}`;}
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
      <label>Organisation <i>optional</i><input data-f="o" value="${esc(x.org||'')}" placeholder="e.g. Hamad Medical Corporation" autocomplete="off" dir="auto"></label>
      <button class="fsave" data-act="sp-save" data-i="${i}">Save</button>
      <p class="heard" style="font-size:12px">Spoke for about ${durTxt((x.talkMs||0)/1000)}. Same name on two cards joins them in the report.</p>
    </div></div></div><div class="fend"></div></div>`;
}
const rosterDrawer=()=>drawer('solo-names','Names for testing',ROSTER.length,`<p class="note" style="margin-bottom:6px">Sample staff list. Say one of these names in the introduction and it is matched, even if slightly misheard. Other names are kept as spoken.</p>`+ROSTER.map(p=>`<div class="lrow"><div class="grow"><b>${esc(p.name)}</b><small>${esc(p.dept)}${p.ar?' · <span lang="ar">'+esc(p.ar)+'</span>':''}</small></div></div>`).join(''));
function serverNote(){
  if(!HEALTH)return '';
  if(HEALTH.offline)return `<div class="warnbox">Cannot reach the DG-Note server. You can still record. The recording stays on this phone until it can be sent.</div>`;
  if(!HEALTH.engine)return `<div class="warnbox">Transcription is not switched on for this server yet. You can still record; ask the admin to switch it on.</div>`;
  return '';
}
function viewSolo(){
  const s=ST.solo;
  if(s.phase==='idle') return capsheet(
    `<div class="eyebrow">One device on the table</div><h1 class="lt">Solo</h1><p class="sub">For up to 4 people sitting within 1 metre. The app tells the voices apart.</p>${tableHTML()}`,
    `${serverNote()}
     ${s.pending?`<div class="pend"><span class="rico">${I('mic')}</span><div class="grow"><b>${s.pending.state==='recording'?'Meeting was interrupted':'Recording not sent yet'}</b><small>${esc(s.pending.title||'Untitled')} · ${new Date(s.pending.startedAt).toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit'})}</small><small style="display:block">${s.pending.durationSec?mmss(s.pending.durationSec)+' saved on this phone':''}</small><div class="pendb">${s.pending.state==='recording'?'<button class="pillk" data-act="solo-continue">Continue recording</button><button class="pillg" data-act="solo-pending">Send it</button>':'<button class="pillk" data-act="solo-pending">Send it now</button>'}<button class="pillg" data-act="solo-discard">Delete</button></div></div></div>`:''}
     <label class="fld"><span>Meeting title</span><input id="soloTitle" value="${esc(s.title)}" placeholder="Optional" autocomplete="off"></label>
     <button class="cta" data-act="solo-start">${I('mic')}Start meeting</button>
     <p class="fine">First the app announces that the meeting is recorded for digital records.</p>
     <button class="btn2" data-act="solo-file">Test with an audio file</button>
     ${drawer('solo-how','How Solo works','',`<ol class="steps"><li>The app announces the recording, so everyone at the table knows.</li><li>Each person introduces themselves: a name, or name with title, department or organisation. That voice gets that name.</li><li>Talk as usual in English, Arabic or both. The audio is saved on this phone as you go.</li><li>End the meeting. The recording is sent once, transcribed, and each voice is named.</li></ol>`)}
     ${drawer('solo-tips','For clear audio','',`<ul class="ticks"><li>${I('check','s')}<span>Put the phone flat in the middle of the table.</span></li><li>${I('check','s')}<span>Everyone sits within 1 metre of it.</span></li><li>${I('check','s')}<span>Keep the screen on. The app stops the screen from locking.</span></li><li>${I('check','s')}<span>One person at a time where possible.</span></li></ul>`)}
     ${rosterDrawer()}`);
  if(s.phase==='proc'){
    const pi=stepIx(s.step);
    return capsheet(`<div class="eyebrow">Recording saved</div><h1 class="lt">Meeting ended</h1><p class="sub">${esc(s.title||'Untitled meeting')}${s.t?' · '+durTxt(s.t)+' recorded':''}</p>`,
     `<div class="pcard">${STEPS.map(([k,l],i)=>`<div class="pst ${i<pi?'done':i===pi?'run':''}"><span class="pic">${i<pi?I('check','s'):i===pi?'':i+1}</span><span class="grow">${l}</span>${k==='upload'&&i===pi?`<b id="upPct">${Math.round((s.upPct||0)*100)}%</b>`:''}</div>`).join('')}</div>
      <p class="fine">Long meetings take a minute or two. The recording stays on this phone until it is done.</p>`);
  }
  if(s.phase==='error') return capsheet(`<div class="eyebrow">Not sent yet</div><h1 class="lt">Try again</h1><p class="sub">${esc(s.title||'Untitled meeting')}</p>`,
    `<div class="warnbox">${esc(s.err)}</div>
     ${/sign in/i.test(s.err)?`<button class="cta" data-act="sign-in-again">Sign in again</button>`:`<button class="cta" data-act="solo-retry">Try again</button>`}
     <button class="btn2" data-act="solo-save-audio">Save the audio file</button>
     <button class="btn2" data-act="solo-new">Back to Solo</button>`);
  if(s.phase==='review') return capsheet(
    `<div class="eyebrow">Transcript ready</div><h1 class="mt">Who spoke</h1><p class="sub">Names come from the introductions. Tap a card to name someone, or to join two voices that are the same person.</p>${tableHTML()}`,
    `<div class="sech"><h2>Speakers</h2><span>${(n=>n+(n===1?' person':' people'))(s.speakers.filter(x=>!x.mergedInto).length)}</span></div>
     <div class="stack" id="sStack">${s.speakers.map((x,i)=>x.mergedInto?'':cardHTML(i)).join('')}</div>
     <datalist id="rosterNames">${ROSTER.map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist>
     <button class="cta" data-act="solo-open">Open the transcript</button>
     <button class="btn2" data-act="solo-save-audio">Save the audio file</button>
     <button class="btn2" data-act="solo-new">New Solo meeting</button>`);
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
    if(!(key in idx)){idx[key]=people.length;people.push({n,r:x.role||'',d:x.dept||'',o:x.org||'',e:x.email||rosterBy(n)?.email||'',c:x.c,labels:[]});}
    people[idx[key]].labels.push(x0.label);mapP[x0.label]=idx[key];});
  return {people,mapP};
}
// Re-applies speaker names to a saved report (after a rename in the report).
function relabel(r){
  const {people,mapP}=peopleFrom(r.speakers);r.people=people;
  r.tx=r.tx.map((l,i)=>({...l,p:mapP[r.result.segments[i]?.speaker]??l.p}));
}
function saveSoloSpeakers(){const s=ST.solo,r=ST.reports.find(x=>x.id===s.rid);if(r){r.speakers=s.speakers.map(({open,...y})=>y);saveReport(r);}}
function buildRealReport(){
  const s=ST.solo,res=s.result,{people,mapP}=peopleFrom(s.speakers);
  const dms=res.durationMs||(s.t||0)*1000, st=s.startedAt?new Date(s.startedAt):new Date(Date.now()-dms), en=new Date(st.getTime()+dms);
  const old=s.rid&&ST.reports.find(x=>x.id===s.rid);
  const parts=s.parts||(s.blob?[s.blob]:[]);
  const keep=old?{res:old.res,ed:old.ed,hist:old.hist,add:old.add,status:old.status,sentAt:old.sentAt}:blank();
  return {id:s.rid||('R'+Date.now()),owner:ME_USER?.id,mid:s.mid||null,stage:'done',createdAt:old?.createdAt||Date.now(),
    result:res,speakers:s.speakers.map(({open,...x})=>x),startedAt:s.startedAt||null,
    kind:'solo',real:true,title:s.title.trim()||('Solo meeting · '+hm(st)),when:st.toDateString()===new Date().toDateString()?'Today':st.toLocaleDateString([],{weekday:'short',day:'numeric',month:'short'}),
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
    // A transcript that was still waiting for names comes back to the "Who spoke" screen.
    const rv=mine.find(r=>r.stage==='review'&&r.owner===ME_USER?.id);
    if(rv){Object.assign(ST.solo,{phase:'review',rid:rv.id,mid:rv.mid,result:rv.result,title:rv.title.startsWith('Solo meeting · ')?'':rv.title,startedAt:rv.startedAt,
      speakers:rv.speakers.map(x=>({...x,open:false})),parts:rv._blobs,blob:(rv._blobs||[])[0]});}
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
      </button>`:`<div class="empty">No meetings in progress.${g.rid?'<br>The last meeting’s report is under Reports.':''}</div>`}
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
function repStatus(r){ if(r.status==='sent') return '<span class="tagp ok">Sent</span>'; const n=unsure(r); return `<span class="tagp warn">${n?n+' to check':'Review'}</span>`; }
function repListHTML(){
  const f=ST.rep.filter,q=ST.rep.q.trim().toLowerCase();
  const list=ST.reports.filter(r=>(f==='all'||(f==='review'?r.status==='draft':r.kind===f))&&(!q||(r.title+' '+r.people.map(p=>p.n).join(' ')+' '+r.sum.join(' ')+' '+r.dec.join(' ')).toLowerCase().includes(q)));
  return list.length?list.map(r=>`<button class="rrow" data-act="rep-open" data-id="${r.id}"><span class="rico">${I(r.kind==='solo'?'device':'people')}</span><span class="grow"><b>${esc(r.title)}</b><small>${r.when} · ${r.dur} · ${r.kind==='solo'?'Solo':'Group'} · ${r.people.length} people</small></span>${repStatus(r)}</button>`).join(''):'<div class="empty">No reports match.</div>';
}
function viewReports(){
  const r=curRep(); if(r) return repDetail(r);
  const drafts=ST.reports.filter(x=>x.status==='draft').length;
  return capsheet(
    `<div class="eyebrow">Written in English · translate any time</div><h1 class="lt">Reports</h1>
     <label class="search">${I('search')}<input id="repQ" placeholder="Search title, person or decision" value="${esc(ST.rep.q)}" autocomplete="off" aria-label="Search reports"></label>`,
    `<div class="chips">${[['all','All'],['review','Needs review'+(drafts?' · '+drafts:'')],['solo','Solo'],['group','Group']].map(([k,l])=>`<button class="chipf ${ST.rep.filter===k?'on':''}" data-act="rep-filter" data-f="${k}">${l}</button>`).join('')}</div>
     <div id="repList" style="display:flex;flex-direction:column;gap:10px">${repListHTML()}</div>`);
}
function repDetail(r){
  const lang=ST.rep.lang, L=LBL[lang], tr=lang==='en'?null:r.tr[lang], rtl=!!LANG[lang].rtl, ed=ST.rep.edit&&lang==='en'&&r.status==='draft';
  const E=(key,list)=>ed?`data-ek="${key}" data-list="${list}" contenteditable="true"`:'';
  const txt=(key,src,trTxt)=> (tr&&r.ed[key]==null&&trTxt!=null)?esc(trTxt):rt(r,key,src);
  const added=list=>r.add[list].map(a=>`<li>${a.done?`<span>${esc(a.fixed)}<span class="tagfix">Dictated</span></span>`:'<span class="rawd" id="dictLive"></span>'}</li>`).join('');
  const n=unsure(r), who=p=>r.people[p]||{n:'Unknown',c:'#ccc',d:''};
  const cap=`<div class="bar"><button class="back" data-act="rep-back">${I('back')}Reports</button><span class="grow"></span>
      ${Object.keys(r.tr).length?`<button class="pillb" data-act="rep-lang">${I('globe','s')}${LANG[lang].name}</button>`:''}
      ${r.status==='draft'&&lang==='en'?`<button class="pillb ${ed?'on':''}" data-act="rep-edit">${ed?'Done':'Edit'}</button>`:''}</div>
    <div class="kind">${I(r.kind==='solo'?'device':'people','s')}<span>${r.kind==='solo'?'Solo':'Group'} · ${r.people.length} people</span>${repStatus(r)}</div>
    <h1 class="mt">${esc(r.title)}</h1>
    <p class="meta">${r.when} · ${r.time} · ${r.dur}<br>Called by ${esc(r.by)}</p>
    <div class="sumh">${L.sum}</div>
    ${r.real&&!r.sum.length&&!r.add.sum.length?`<p class="sub" style="max-width:none">Transcribed by ForgeHype Meet. The AI summary, decisions and actions are the next build step.</p>`:''}
    <ul class="sum ${rtl?'rtl':''} ${ST.rep.shim?'shim':''}" ${rtl?'lang="ar"':''}>${r.sum.map((s,i)=>`<li><span ${E('s'+i,'sum')}>${txt('s'+i,s,tr&&tr.sum[i])}</span></li>`).join('')}${added('sum')}</ul>
    <div class="sumh">Languages detected</div><p class="langs">${repLangs(r).map(langName).join(' · ')}</p>
    <div class="rchips">${n&&lang==='en'?`<button class="rchip u1" data-act="u-first">${n} unclear word${n>1?'s':''} · tap the orange text</button>`:''}${r.hist.length?`<span class="rchip">${r.hist.length} change${r.hist.length>1?'s':''} · originals kept</span>`:''}</div>`;
  const dec=`<ol class="nlist ${rtl?'rtl':''} ${ST.rep.shim?'shim':''}" ${rtl?'lang="ar"':''}>${r.dec.map((s,i)=>`<li><span ${E('d'+i,'dec')}>${txt('d'+i,s,tr&&tr.dec[i])}</span></li>`).join('')}${added('dec')}</ol>`;
  const act=r.act.map((a,i)=>{const p=who(a.p),t=tr&&tr.act[i];return `<div class="act"><div class="at ${rtl?'rtl':''}" ${rtl?'dir="rtl" lang="ar"':''} ${E('a'+i,'act')}>${txt('a'+i,a.t,t&&t.t)}</div><div class="am"><span class="sp" style="--c:${p.c}">${esc(first(p.n))}</span><span>${esc(t?t.due:a.due)}</span></div></div>`;}).join('');
  const qs=r.qs.map((q,i)=>{const p=who(q.p),t=tr&&tr.qs[i];return `<div class="act"><div class="at" ${rtl&&t?'dir="rtl" lang="ar"':''}>${esc(t||q.t)}</div><div class="am"><span class="sp" style="--c:${p.c}">${esc(first(p.n))}</span><span>Open</span></div></div>`;}).join('');
  const ppl=`<p class="note" style="margin-bottom:8px">${r.real?'Named from the introductions. Anyone who didn’t introduce themselves is listed as Speaker 1, 2… Tap a person to change the name.':r.kind==='solo'?'Named from the voice introductions at the start.':'Named from each person’s login on their own phone.'} ${r.status==='sent'?'Emailed '+esc(r.sentAt)+'.':'The report is emailed to everyone listed.'}</p>`+r.people.map((p,k)=>`<${r.real?`button data-act="rep-person" data-p="${k}"`:'div'} class="prow ${r.real?'tap':''}"><span class="av lg" style="--c:${p.c}">${ini(p.n)}</span><div class="grow"><b dir="auto">${esc(p.n)}</b>${[p.r,p.d,p.o].filter(Boolean).length?`<small dir="auto">${esc([p.r,p.d,p.o].filter(Boolean).join(' · '))}</small>`:''}<small>${p.e?esc(p.e):/^Speaker \d+$/.test(p.n)?'Tap to add a name':'No email on file'}</small></div>${r.real?I('fwd','s'):''}</${r.real?'button':'div'}>`).join('');
  const tx=`<p class="note">${r.real?(onlyEnglish(r)?'':'Anything not said in English is shown in English, with the original underneath. '):'Clean transcript: grammar fixed and filler words removed. '}${lang!=='en'?'Shown in English with the original words underneath.':n?'Orange words were unclear in the audio. Tap one to check it.':'Tap a name to change who said it.'}</p>`+r.tx.map((l,i)=>{const p=who(l.p);return `<div class="txl"><div class="th">${r.real?`<button class="sp" style="--c:${p.c}" data-act="rep-person" data-p="${l.p}" aria-label="Rename ${esc(p.n)}">${esc(first(p.n))}</button>`:`<span class="sp" style="--c:${p.c}">${esc(first(p.n))}</span>`}<span>${l.t}</span></div><div class="tt" ${E('t'+i,'tx')}>${rt(r,'t'+i,l.s)}</div>${l.o?`<div class="to" dir="auto"${/[\u0600-\u06FF]/.test(l.o)?' lang="ar"':''}>${esc(l.o)}</div>`:''}</div>`;}).join('');
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const bars=r.tx.map(l=>Array.from({length:Math.max(4,Math.round(l.s.length/12))},()=>`<i style="--c:${who(l.p).c};height:${20+Math.round(rnd()*80)}%"></i>`).join('')+'<i style="--c:#D5D2D0;height:8%"></i>').join('');
  const rec=r.real?((r.audios||[]).length?(r.audios.length>1?`<p class="note" style="margin-bottom:8px">Recorded in ${r.audios.length} parts because the phone paused the recording. The transcript covers all parts.</p>`:'')+r.audios.map((u,k)=>`${r.audios.length>1?`<b style="display:block;font-size:13px;margin:8px 0 4px">Part ${k+1}</b>`:''}<audio class="aud" controls preload="metadata" src="${u}"></audio>`).join('')+`<button class="btn2" style="margin-top:10px" data-act="rep-dl">Save the audio file${r.audios.length>1?'s':''}</button><button class="btn2" style="margin-top:8px" data-act="rep-txt">Save the transcript (.txt)</button><button class="btn2 danger" style="margin-top:8px" data-act="rep-del">Delete this meeting from the phone</button><p class="fine" style="text-align:start;margin-top:8px">Saved on this phone. The ForgeHype Meet server deletes its copy after transcription.</p>`:'<p class="note">The audio stays on the phone that recorded it.</p>'):`<div style="display:flex;gap:12px;align-items:center"><button class="playb" data-act="rep-play" aria-label="Play recording">${I(ST.rep.play?'pause':'play')}</button><div class="grow"><b style="font-size:15px">${esc(r.title.replace(/[^A-Za-z0-9]+/g,'_'))}.mp3</b><div style="font-size:13px;color:var(--fg2)">${r.dur} · ${r.people.length} speakers · kept for 30 days</div></div></div><div class="wavebars" id="wave">${bars}</div><p class="fine" style="text-align:start;margin-top:8px">Colours show who is speaking. Playback is simulated in this prototype.</p>`;
  const hist=r.hist.slice().reverse().map(h=>`<div class="hrow2"><small>${esc(h.label)} · ${h.when}</small><s>${esc(h.from)}</s><div>${esc(h.to)}</div></div>`).join('');
  const dock=ed&&r.real?`<button class="dbt k" data-act="rep-edit">Done</button>`:ed?`<button class="dbt" data-act="rep-dictate" ${ST.rep.dictating?'disabled':''}>${I('mic','s')}${ST.rep.dictating?'Listening…':'Dictate'}</button><button class="dbt k" data-act="rep-edit">Done</button>`
    :r.status==='sent'?`<span class="sentl">${I('check','s')}${r.real?'Approved':'Sent to '+r.people.filter(p=>p.e).length+' people'}</span><button class="dbt ic" data-act="rep-copy" aria-label="Copy summary">${I('copy','s')}</button>`
    :`<button class="dbt ic" data-act="rep-copy" aria-label="Copy summary">${I('copy','s')}</button><button class="dbt acc" data-act="rep-send">Approve &amp; send</button>`;
  return capsheet(cap,
    `${lang!=='en'?`<p class="note">Translated from English by AI. The English original is kept. <button data-act="rep-en" style="font-weight:700;color:var(--accink)">Show original</button></p>`:''}
     ${ed&&r.real?`<p class="note">Tap any transcript line to change it. Changes are saved in the change history.</p>`:ed?`<p class="note">Tap any text to change it, or use Dictate. Dictated words are cleaned up for grammar and spelling.</p>`:''}
     ${r.dec.length+r.add.dec.length||!r.real?drawer('r-dec',L.dec,r.dec.length+r.add.dec.length,dec,true):''}
     ${r.act.length||!r.real?drawer('r-act',L.act,r.act.length,act):''}
     ${r.qs.length?drawer('r-qs',L.qs,r.qs.length,qs):''}
     ${drawer('r-ppl',L.ppl,r.people.length,ppl)}
     ${drawer('r-tx',L.tx,r.tx.length,tx,!!r.real)}
     ${drawer('r-rec',L.rec,'',rec)}
     ${r.hist.length?drawer('r-hist','Change history',r.hist.length,hist):''}
     <div class="dock">${dock}</div>`);
}
const labelOf=k=>({s:'Summary',d:'Decision',a:'Action',t:'Transcript line'}[k[0]])+' '+(+k.slice(1)+1);
function saveEdit(el){
  const r=curRep(); if(!r||!ST.rep.edit||!el.isContentEditable) return;
  const key=el.dataset.ek, old=r.ed[key]!=null?r.ed[key]:plain(r,srcOf(r,key)), val=el.innerText.replace(/\s+/g,' ').trim();
  if(!val||val===old) return;
  r.ed[key]=val; r.hist.push({label:labelOf(key)+' edited',from:old,to:val,when:hm(new Date())});
}
const DICT=[
 {raw:'we will review this again in next weeks meeting and rami will sending the reminder',fixed:'We will review this again at next week’s meeting, and Rami will send the reminder.'},
 {raw:'please make sure the night team are informed before tonight shift',fixed:'Please make sure the night team is informed before tonight’s shift.'},
];
function stopPlay(){if(ST.rep.play){clearInterval(ST.rep.play);ST.rep.play=null;}}

/* ================= render ================= */
function render(){
  const cr=ST.rep&&ST.rep.id&&ST.reports.find(r=>r.id===ST.rep.id);if(cr&&cr.real)saveReport(cr);
  const app=$('#app'); app.className='app '+(ST.tab==='solo'?'t-dark':'t-mix');
  $$('.tabs button').forEach(b=>{const on=b.dataset.tab===ST.tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  const d=ST.reports.filter(r=>r.status==='draft').length, bd=$('#repBadge'); bd.textContent=d; bd.classList.toggle('on',d>0&&ST.tab!=='reports');
  stopPlay();
  $('#view').innerHTML = ST.tab==='solo'?viewSolo():ST.tab==='group'?viewGroup():viewReports();
  if(ST.tab==='solo') syncSolo();
  if(ST.tab==='group') syncGroup();
  ST.rep.shim=false;
}

/* ================= actions ================= */
const ACT={
 account(){openAccount();},
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
   closeSheet();const s=ST.solo;
   try{await recStart();}catch(e){sheet(`<h3>Cannot use the microphone</h3><p>${esc(e.name==='NotAllowedError'?'Microphone access was blocked. Allow the microphone for this site in the browser settings, then try again.':(e.message||String(e)))}</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);return;}
   Object.assign(s,{phase:'intro',t:0,paused:false,introEndMs:0,startedAt:Date.now(),speakers:[],result:null,blob:null,rid:null,mid:REC.mid,pending:null});
   render();window.scrollTo(0,0);
   try{const u=new SpeechSynthesisUtterance('This meeting will be recorded for digital records. Please go around the table and introduce yourselves.');speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
 },
 'solo-begin'(){const s=ST.solo;s.introEndMs=s.t*1000;DB.patch(REC.mid,{introEndMs:s.introEndMs}).catch(()=>{});s.phase='meet';render();toast('Introductions saved. Talk as usual.');},
 'solo-pause'(){const s=ST.solo;s.paused=!s.paused;try{s.paused?REC.mr.pause():REC.mr.resume();}catch(e){}
   $('#sPause').innerHTML=s.paused?I('play','s')+'Resume':I('pause','s')+'Pause';const r=$('#sRec');r.classList.toggle('paused',s.paused);r.querySelector('b').textContent=s.paused?'PAUSED':'REC';syncSolo();},
 'solo-end'(){sheet(`<h3>End this meeting?</h3><p>Recording stops. The audio is sent once, transcribed, and each voice is named from the introductions.</p><div class="stk"><button class="btnr" data-act="solo-end-ok">End meeting</button><button class="btng" data-act="close">Keep recording</button></div>`);},
 async 'solo-end-ok'(){closeSheet();const s=ST.solo;if(!(s.phase==='intro'||s.phase==='meet'))return;if(s.phase==='intro')s.introEndMs=s.t*1000;s.paused=false;
   const mid=REC.mid;s.phase='proc';s.step='save';render();
   await recStop();await DB.patch(mid,{state:'ended',durationSec:s.t,introEndMs:s.introEndMs}).catch(()=>{});
   processMeeting(mid);},
 'sign-in-again'(){showLogin('Sign in, then send the recording from the Solo tab.');},
 'solo-retry'(){const s=ST.solo;processMeeting(s.mid,s.mid?null:s.blob);},
 'solo-file'(){$('#fileIn').click();},
 'solo-save-audio'(){saveAudio(ST.solo.blob,audioName());},
 async 'solo-continue'(){const s=ST.solo,m=s.pending;if(!m)return;
   try{await recStart(m.mid);}catch(e){sheet(`<h3>Cannot use the microphone</h3><p>${esc(e.message||String(e))}</p><div class="stk"><button class="btnk" data-act="close">OK</button></div>`);return;}
   Object.assign(s,{title:m.title||'',introEndMs:m.introEndMs||0,t:m.durationSec||0,startedAt:m.startedAt,pending:null,paused:false,mid:m.mid,phase:m.introEndMs?'meet':'intro',speakers:[],result:null,rid:null});
   render();window.scrollTo(0,0);toast('Recording again. The new part joins the same meeting.');},
 async 'solo-continue-now'(){closeSheet();const s=ST.solo;
   try{REC.stopping=true;REC.stream?.getTracks().forEach(t=>t.stop());cancelAnimationFrame(REC.raf);try{REC.ctx?.close();}catch(e){}
     await Promise.all(REC.saves);await recStart(REC.mid);}
   catch(e){sheet(`<h3>Cannot use the microphone</h3><p>${esc(e.message||String(e))}</p><div class="stk"><button class="btnk" data-act="solo-end-ok">End meeting and send</button></div>`);return;}
   s.paused=false;render();toast('Recording again. The new part joins the same meeting.');},
 'solo-pending'(){const s=ST.solo,m=s.pending;if(!m)return;Object.assign(s,{title:m.title||'',introEndMs:m.introEndMs||0,t:m.durationSec||0,startedAt:m.startedAt,pending:null});processMeeting(m.mid);},
 async 'solo-discard'(){const s=ST.solo;if(!s.pending)return;await DB.remove(s.pending.mid).catch(()=>{});s.pending=null;render();toast('Recording deleted from this phone');},
 'sp-toggle'(el){const i=+el.dataset.i,x=ST.solo.speakers[i];x.open=!x.open;$('#fc'+i).classList.toggle('open',x.open);el.setAttribute('aria-expanded',x.open);},
 'sp-merge'(el){const s=ST.solo,x=s.speakers[+el.dataset.i],t=s.speakers.find(y=>y.label===el.dataset.into);if(!x||!t)return;
   // anyone already joined to x moves to t as well
   s.speakers.forEach(y=>{if(y.mergedInto===x.label)y.mergedInto=t.label;});x.mergedInto=t.label;x.open=false;t.open=false;
   saveSoloSpeakers();render();toast(`Speaker ${x.index} joined with ${esc(spName(t))}`);},
 'sp-unmerge'(el){const s=ST.solo,x=s.speakers.find(y=>y.label===el.dataset.l);if(!x)return;delete x.mergedInto;saveSoloSpeakers();render();toast(`Speaker ${x.index} is separate again`);},
 'sp-pick'(el){const i=+el.dataset.i,p=ROSTER.find(r=>r.id===el.dataset.id),c=$('#fc'+i);if(!p)return;c.querySelector('[data-f=n]').value=p.name;c.querySelector('[data-f=d]').value=p.dept;},
 'sp-save'(el){const i=+el.dataset.i,s=ST.solo,x=s.speakers[i],c=$('#fc'+i),v=f=>c.querySelector(`[data-f=${f}]`).value.trim(),n=v('n');
   const p=rosterBy(n);x.name=n;x.role=v('r');x.dept=v('d');x.org=v('o');x.email=p?p.email:'';x.edited=true;x.open=false;
   c.outerHTML=cardHTML(i);syncSolo();toast(n?'Name saved for this voice':'Name cleared');
   saveSoloSpeakers();},
 'solo-open'(){const s=ST.solo;const r=buildRealReport();ST.reports=[r,...ST.reports.filter(x=>x.id!==r.id)];saveReport(r);
   Object.assign(s,{phase:'idle',t:0,paused:false,introEndMs:0,speakers:[],result:null,title:'',rid:null,err:'',mid:null,parts:null,blob:null});
   openReport(r.id);ST.open['r-tx']=true;render();},
 'solo-new'(){const s=ST.solo;Object.assign(s,{phase:'idle',t:0,paused:false,introEndMs:0,speakers:[],result:null,title:'',rid:null,err:'',mid:null});render();checkPending();},
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
 'rep-back'(){saveAll();ST.rep.id=null;ST.rep.edit=false;ST.rep.lang='en';render();window.scrollTo(0,0);},
 'rep-filter'(el){ST.rep.filter=el.dataset.f;render();},
 'rep-edit'(){saveAll();ST.rep.edit=!ST.rep.edit;if(ST.rep.edit){ST.open['r-dec']=true;}render();},
 'rep-lang'(){saveAll();sheet(`<h3>Show this report in</h3><p>Reports are written in English. Translate for anyone who needs it.</p><div style="margin-top:10px">${Object.keys(LANG).map(k=>`<button class="lrowb" data-act="rep-setlang" data-l="${k}"><span class="grow">${LANG[k].full}</span>${ST.rep.lang===k?I('check'):''}</button>`).join('')}<button class="lrowb" disabled>60+ more languages in the live app</button></div>`);},
 'rep-setlang'(el){ST.rep.lang=el.dataset.l;ST.rep.edit=false;ST.rep.shim=true;closeSheet();render();if(ST.rep.lang!=='en')toast('Translated to '+LANG[ST.rep.lang].name);},
 'rep-en'(){ST.rep.lang='en';ST.rep.shim=true;render();},
 'u-open'(el){if(ST.rep.edit)return;
   if(!el.dataset.b){sheet(`<h3>Unclear in the audio</h3><p>ForgeHype Meet was not sure about this word. Keep it, or type the right one.</p><div class="stk"><button class="btnk" data-act="u-pick" data-id="${el.dataset.id}" data-v="${esc(el.dataset.a)}" data-o="">Keep “${esc(el.dataset.a)}”</button><label class="fld"><span>Correct word</span><input id="uFix" value="${esc(el.dataset.a)}" autocomplete="off"></label><button class="btng" data-act="u-fix" data-id="${el.dataset.id}" data-o="${esc(el.dataset.a)}">Use this word</button></div>`);return;}
   sheet(`<h3>Unclear in the audio</h3><p>The recording was not clear at this word. Which one is right?</p><div class="stk"><button class="btnk" data-act="u-pick" data-id="${el.dataset.id}" data-v="${esc(el.dataset.a)}" data-o="${esc(el.dataset.b)}">${esc(el.dataset.a)}</button><button class="btng" data-act="u-pick" data-id="${el.dataset.id}" data-v="${esc(el.dataset.b)}" data-o="${esc(el.dataset.a)}">${esc(el.dataset.b)}</button></div><p style="font-size:13px">Your choice is used everywhere in this report and saved in the change history.</p>`);},
 'u-fix'(el){const v=$('#uFix').value.trim();if(!v)return;const r=curRep();r.res[el.dataset.id]=v;r.hist.push({label:'Unclear word corrected',from:el.dataset.o,to:v,when:hm(new Date())});closeSheet();render();},
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
     <p style="font-size:13px;margin:0">Giving two speakers the same name joins them into one person.</p>
     <button class="btnk" data-act="rep-person-ok" data-p="${k}">Save</button><button class="btng" data-act="close">Cancel</button></div>`);
   setTimeout(()=>{const i=$('#ppN');if(i&&unnamed)i.focus();},350);},
 'rep-person-ok'(el){const r=curRep();const p=r.people[+el.dataset.p];if(!p)return;
   const n=$('#ppN').value.trim(),role=$('#ppR').value.trim(),dept=$('#ppD').value.trim(),org=$('#ppO').value.trim(),hit=rosterBy(n);
   for(const l of p.labels){const x=r.speakers.find(y=>y.label===l);if(!x)continue;x.name=n;x.role=role;x.dept=dept||(n&&hit&&!role&&!org?hit.dept:'');x.org=org;x.email=hit?hit.email:'';x.edited=true;}
   const now=n||spName(r.speakers.find(y=>y.label===p.labels[0]));
   if(now!==p.n)r.hist.push({label:'Speaker renamed',from:p.n,to:now,when:hm(new Date())});
   relabel(r);closeSheet();render();toast(now===p.n?'Saved':'Renamed on every line');},
 'rep-del'(){sheet(`<h3>Delete this meeting?</h3><p>The transcript and the recording are removed from this phone. This cannot be undone.</p><div class="stk"><button class="btnr" data-act="rep-del-ok">Delete</button><button class="btng" data-act="close">Keep it</button></div>`);},
 async 'rep-del-ok'(){closeSheet();const r=curRep();if(!r)return;await deleteReport(r);ST.rep.id=null;render();toast('Meeting deleted from this phone');},
 'u-pick'(el){const r=curRep();r.res[el.dataset.id]=el.dataset.v;r.hist.push({label:'Unclear word checked',from:el.dataset.o?el.dataset.v+' / '+el.dataset.o:el.dataset.v+' (unclear)',to:el.dataset.v,when:hm(new Date())});closeSheet();render();},
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
function openReport(id){ST.tab='reports';ST.rep.id=id;ST.rep.lang='en';ST.rep.edit=false;['r-dec','r-act','r-qs','r-ppl','r-tx','r-rec','r-hist'].forEach(k=>delete ST.open[k]);render();window.scrollTo(0,0);}
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
window.addEventListener('appinstalled',()=>{INSTALL_EVT=null;$$('.instbtn').forEach(b=>b.hidden=true);toast('DG-Note is on your home screen');});
const installBtn=(cls='btn2')=>isStandalone()?'':`<button type="button" class="${cls} instbtn" data-act="install">${I('device','s')}Add DG-Note to your home screen</button>`;
async function install(){
  if(INSTALL_EVT){INSTALL_EVT.prompt();const r=await INSTALL_EVT.userChoice.catch(()=>({}));INSTALL_EVT=null;if(r.outcome!=='accepted')toast('You can add it any time from here');return;}
  const ios=isIOS();
  sheet(`<div class="bigic" style="background:none;padding:0"><img src="/icons/icon-192.png" alt="" width="60" height="60" style="border-radius:16px"></div><h3>Add DG-Note to your home screen</h3><p>It opens full screen with its own icon, like any app.</p>
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
  return `<div class="lhero"><span class="fh fh-xl" aria-label="ForgeHype"><span class="f">Forge</span><span class="h">Hype</span></span>
     <div class="eyebrow" style="margin-top:44px">DG-Note</div><h1 class="lt">Sign in</h1><p class="sub">Meeting notes that know who spoke.</p></div>
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
}
async function signOut(){
  if(recording())return toast('End the Solo meeting first');
  try{await fetch(API+'/api/logout',{method:'POST'});}catch(e){}
  fresh();showLogin();
}
async function openAccount(){
  const u=ME_USER;if(!u)return;
  const head=`<div style="display:flex;gap:14px;align-items:center"><span class="av lg" style="--c:${u.role==='admin'?'#FF5D00':'#45D3C5'};width:54px;height:54px;font-size:16px">${esc(u.short)}</span><div><h3>${esc(u.name)}</h3><p style="margin:0">${u.role==='admin'?'Admin · full access':'Guest account'}</p></div></div>`;
  const foot=`<div class="stk">${installBtn('btng')}<button class="btnk" data-act="sign-out">Sign out</button>${u.role==='admin'?'<button class="btng" data-act="restart">Reset the sample data</button>':''}<button class="btng" data-act="close">Close</button></div>`;
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
});
document.addEventListener('change',e=>{
  if(e.target.id!=='fileIn'||!e.target.files[0])return;
  const f=e.target.files[0],s=ST.solo;e.target.value='';
  Object.assign(s,{title:s.title||f.name.replace(/\.[^.]+$/,''),t:0,introEndMs:0,startedAt:0,pending:null});
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
  const s=ST.solo; if((s.phase==='intro'||s.phase==='meet')&&!s.paused&&recording()){s.t++;const e=$('#sTime');if(e&&ST.tab==='solo')e.textContent=mmss(s.t);}
  const g=ST.group; if(g.live&&!g.paused){g.elapsed++;const a=$('#gTime'),b=$('#gLobbyTime');if(a)a.textContent=mmss(g.elapsed);if(b)b.textContent=mmss(g.elapsed);}
},1000);
setInterval(()=>{
  const g=ST.group; if(!g.live||g.paused) return; const all=g.people; g.talk=all[(all.indexOf(g.talk)+1+Math.floor(Math.random()*2))%all.length];
  if(ST.tab==='group'&&$('#gGrid')) $$('.tile').forEach(t=>t.classList.toggle('talk',t.id==='tile-'+g.talk));
},2600);

fresh(); boot();
