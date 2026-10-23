<div align="center">

<img src="assets/images/logo.png" alt="شعار FixPoint" width="160">

# FixPoint

**نظام إلكتروني لإدارة بلاغات أعطال مرافق الجامعة**

مشروع تخرج، قسم علوم الحاسب، جامعة الحدود الشمالية

Node.js · Express 5 · MySQL 8 · Vanilla JavaScript

</div>

---

## جدول المحتويات

**الجزء الأول: فهم المشروع**

1. [ما هو المشروع](#1-ما-هو-المشروع)
40. [لقطات الشاشة](#40-لقطات-الشاشة)
2. [لماذا وُجد المشروع](#2-لماذا-وجد-المشروع)
3. [المستخدمون](#3-المستخدمون)
4. [المزايا](#4-المزايا)
5. [كيف يعمل النظام](#5-كيف-يعمل-النظام)
6. [أمثلة واقعية](#6-أمثلة-واقعية)
7. [رحلة المستخدم](#7-رحلة-المستخدم)
8. [الوحدات](#8-الوحدات)
9. [تعدد الكيانات](#9-تعدد-الكيانات)
10. [الصلاحيات](#10-الصلاحيات)
11. [الأتمتة](#11-الأتمتة)
12. [تكامل الوحدات](#12-تكامل-الوحدات)
13. [المصطلحات](#13-المصطلحات)
14. [الأسئلة الشائعة](#14-الأسئلة-الشائعة)

**الجزء الثاني: التفاصيل التقنية**

15. [البنية المعمارية](#15-البنية-المعمارية)
16. [التقنيات المستخدمة](#16-التقنيات-المستخدمة)
17. [هيكل المشروع](#17-هيكل-المشروع)
18. [الواجهة الأمامية](#18-الواجهة-الأمامية)
19. [الخادم](#19-الخادم)
20. [مسار الطلب بمثال حقيقي](#20-مسار-الطلب-بمثال-حقيقي)
21. [قاعدة البيانات](#21-قاعدة-البيانات)
22. [واجهة برمجة التطبيقات API](#22-واجهة-برمجة-التطبيقات-api)
23. [المصادقة والتفويض](#23-المصادقة-والتفويض)
24. [الأمان](#24-الأمان)
25. [الإعدادات](#25-الإعدادات)
26. [التكاملات الخارجية](#26-التكاملات-الخارجية)
27. [المهام المجدولة](#27-المهام-المجدولة)
28. [تخزين الملفات](#28-تخزين-الملفات)
29. [السجلات](#29-السجلات)
30. [التثبيت والتشغيل](#30-التثبيت-والتشغيل)
31. [دليل التطوير](#31-دليل-التطوير)
32. [النشر](#32-النشر)
33. [النسخ الاحتياطي والاستعادة](#33-النسخ-الاحتياطي-والاستعادة)
34. [حل المشكلات](#34-حل-المشكلات)
35. [الاعتماديات وإصداراتها](#35-الاعتماديات-وإصداراتها)
36. [القيود المعروفة](#36-القيود-المعروفة)
37. [الحالة الحالية للنظام](#37-الحالة-الحالية-للنظام)
38. [قرارات معمارية](#38-قرارات-معمارية)
39. [سجل التغييرات](#39-سجل-التغييرات)

**الخلاصة**

- [نظرة شاملة على النظام](#نظرة-شاملة-على-النظام)
- [مرجع سريع](#مرجع-سريع)
- [البدء السريع](#البدء-السريع)
- [لغير التقنيين](#لغير-التقنيين)
- [للمطورين](#للمطورين)

> **اصطلاح هذا الملف:** كل معلومة مأخوذة مباشرة من الكود تُكتب كحقيقة. وما كان استنتاجًا من طريقة عمل الكود وليس منصوصًا عليه يُعلَّم بكلمة **(استنتاج)**.

---

# الجزء الأول: فهم المشروع

## 1. ما هو المشروع

FixPoint نظام ويب يستقبل بلاغات الأعطال في مرافق الجامعة (التكييف، الإنارة، الكهرباء، السباكة، الأثاث، الأجهزة، وغيرها)، ويوجّه كل بلاغ تلقائيًا إلى القسم المسؤول عنه حسب تصنيفه، ثم يتابع حالته حتى الإغلاق، مع لوحة إحصائيات وتقارير قابلة للطباعة للإدارة.

- **النوع:** تطبيق ويب متعدد الصفحات (Multi Page Application)، يعمل على خادم Node.js واحد يقدّم الصفحات والـ API معًا.
- **اللغة:** الواجهة عربية بالكامل باتجاه من اليمين لليسار (RTL).
- **الذكاء الاصطناعي:** لا يستخدم النظام أي نموذج ذكاء اصطناعي. التوجيه قائم على قاعدة ثابتة: كل تصنيف مرتبط بقسم وأولوية افتراضية في جدول `category`.

## 40. لقطات الشاشة

> كل اللقطات مأخوذة من نسخة تطوير محلية كانت تحتوي بيانات تجريبية قبل تقوية تهيئة الإنتاج، دون أي إضافة لتجميل اللقطات. لا تتضمن التهيئة الحالية حسابات أو بلاغات تجريبية، والبريد الظاهر في اللقطات من نطاق `example.com` المخصص للأمثلة.

### صفحات الدخول والتسجيل

<table>
<tr>
<td align="center"><img src="docs/screenshots/login.png" alt="صفحة تسجيل الدخول على شاشة الحاسب: الشعار في جهة وبطاقة الدخول في الجهة الأخرى" width="400"><br><sub>تسجيل الدخول</sub></td>
<td align="center"><img src="docs/screenshots/register.png" alt="صفحة إنشاء حساب مبلِّغ جديد بحقول الاسم والرقم الجامعي والبريد وكلمة السر" width="400"><br><sub>إنشاء حساب مبلِّغ</sub></td>
</tr>
</table>

<table>
<tr>
<td align="center"><img src="docs/screenshots/login-mobile.png" alt="صفحة تسجيل الدخول على شاشة جوال بعرض 390 بكسل" width="300"><br><sub>الدخول على الجوال</sub></td>
<td align="center"><img src="docs/screenshots/not-found.png" alt="صفحة الخطأ 404 عند طلب صفحة غير موجودة" width="400"><br><sub>صفحة غير موجودة (404)</sub></td>
</tr>
</table>

### المبلِّغ

<p align="center"><img src="docs/screenshots/reporter-home.png" alt="الصفحة الرئيسية للمبلِّغ: عدّادات البلاغات حسب الحالة وآخر البلاغات" width="600"><br><sub>الرئيسية: عدد البلاغات حسب الحالة وآخر 5 بلاغات</sub></p>

<table>
<tr>
<td align="center"><img src="docs/screenshots/new-report.png" alt="نموذج بلاغ جديد: التصنيف والأولوية المقترحة والمبنى والدور والوصف والصور" width="400"><br><sub>نموذج بلاغ جديد</sub></td>
<td align="center"><img src="docs/screenshots/my-reports.png" alt="قائمة بلاغاتي مع فلاتر الحالة والتصنيف والتاريخ والبحث" width="400"><br><sub>بلاغاتي مع الفلترة والترقيم</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/screenshots/report-details.png" alt="تفاصيل بلاغ مغلق مع سجل الحالة خطوة بخطوة" width="400"><br><sub>تفاصيل بلاغ وسجل حالته</sub></td>
<td align="center"><img src="docs/screenshots/profile.png" alt="الملف الشخصي: بيانات الحساب ونموذج تغيير كلمة السر" width="400"><br><sub>الملف الشخصي وتغيير كلمة السر</sub></td>
</tr>
</table>

### موظف القسم

<table>
<tr>
<td align="center"><img src="docs/screenshots/staff-queue.png" alt="قائمة عمل موظف قسم التكييف: البلاغات المفتوحة وقيد المعالجة مرتبة بالأولوية" width="400"><br><sub>قائمة العمل مرتبة بالأولوية ثم الأقدم</sub></td>
<td align="center"><img src="docs/screenshots/staff-report.png" alt="صفحة معالجة البلاغ للموظف مع نموذج تغيير الحالة وإضافة ملاحظة" width="400"><br><sub>معالجة البلاغ وتغيير حالته</sub></td>
</tr>
</table>

<p align="center"><img src="docs/screenshots/staff-closed.png" alt="قائمة البلاغات المغلقة لقسم الموظف" width="600"><br><sub>البلاغات المغلقة للقسم</sub></p>

### المدير

<p align="center"><img src="docs/screenshots/dashboard.png" alt="لوحة التحكم: عدّادات الحالات ومتوسط زمن المعالجة ورسوم المباني والتصنيفات" width="600"><br><sub>لوحة التحكم</sub></p>

<table>
<tr>
<td align="center"><img src="docs/screenshots/admin-reports.png" alt="كل البلاغات مع فلاتر الحالة والتصنيف والمبنى والقسم والتاريخ" width="400"><br><sub>كل البلاغات وإعادة التوجيه</sub></td>
<td align="center"><img src="docs/screenshots/users.png" alt="إدارة المستخدمين: جدول بالأدوار والأقسام مع البحث" width="400"><br><sub>إدارة المستخدمين</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/screenshots/buildings.png" alt="إدارة المباني ومواقعها" width="400"><br><sub>المباني والمواقع</sub></td>
<td align="center"><img src="docs/screenshots/categories.png" alt="إدارة التصنيفات مع القسم المسؤول والأولوية الافتراضية" width="400"><br><sub>التصنيفات</sub></td>
</tr>
<tr>
<td align="center"><img src="docs/screenshots/departments.png" alt="إدارة الأقسام وبريد التواصل" width="400"><br><sub>الأقسام</sub></td>
<td align="center"><img src="docs/screenshots/print-status.png" alt="تقرير ملخص الحالات لفترة محددة جاهز للطباعة" width="400"><br><sub>تقرير ملخص الحالات</sub></td>
</tr>
</table>

<p align="center"><img src="docs/screenshots/print-analysis.png" alt="تقرير تحليل المباني وأنواع الأعطال لفترة محددة" width="600"><br><sub>تقرير تحليل المباني والأعطال</sub></p>

## 2. لماذا وُجد المشروع

البلاغ عن عطل في مرفق جامعي يمر عادة عبر قنوات غير منظمة (اتصال، رسالة، ورقة)، فيضيع البلاغ أو يصل للقسم الخطأ، ولا يعرف المبلِّغ ماذا حدث لبلاغه، ولا تملك الإدارة أرقامًا عن الأعطال المتكررة أو سرعة المعالجة **(استنتاج من وظائف النظام)**. يعالج FixPoint ذلك بثلاثة أمور يطبقها الكود فعليًا:

1. **توجيه تلقائي:** القسم المسؤول يُحدَّد من التصنيف في الخادم، دون تدخل يدوي (`server/services/classification.js`).
2. **شفافية الحالة:** كل تغيير حالة أو ملاحظة يُسجَّل في جدول `status_history` ويظهر للمبلِّغ.
3. **بيانات للقرار:** إحصائيات وتقارير محسوبة مباشرة من قاعدة البيانات (`server/services/stats.js`).

## 3. المستخدمون

| المستخدم | الدور في النظام | كيف يحصل على حساب |
|---|---|---|
| المبلِّغ (طالب أو موظف جامعي) | `REPORTER` | يسجّل بنفسه من صفحة `register.html` |
| موظف قسم الصيانة | `STAFF` (مرتبط بقسم واحد) | ينشئه المدير من صفحة المستخدمين |
| مدير النظام | `ADMIN` | يُنشأ المدير الأول بالأمر `npm run admin:create`، ثم ينشئ المديرون الحسابات الإضافية من لوحة الإدارة |

## 4. المزايا

**للمبلِّغ**

- إنشاء بلاغ بتصنيف وأولوية مقترحة ومبنى ودور أو غرفة ووصف (5 إلى 1000 حرف) ومن 1 إلى 5 صور.
- تحديد موقع العطل على خريطة Google عند توفر المفتاح، وإلا يُعتمد موقع المبنى تلقائيًا.
- ضغط الصور في المتصفح قبل الرفع (أطول ضلع 1600 بكسل).
- متابعة بلاغاته بفلترة (الحالة، التصنيف، الفترة، البحث) وترقيم، وعرض سجل الحالة كاملًا.
- تغيير كلمة السر.

**لموظف القسم**

- قائمة عمل بالبلاغات المفتوحة وقيد المعالجة لقسمه فقط، مرتبة بالأولوية ثم الأقدم.
- تغيير الحالة (مفتوح إلى قيد المعالجة أو مغلق، قيد المعالجة إلى مغلق) مع ملاحظة، وإضافة ملاحظة دون تغيير الحالة.
- قائمة البلاغات المغلقة لقسمه.

**للمدير**

- لوحة تحكم: عدد البلاغات حسب الحالة، متوسط زمن المعالجة، أكثر المباني بلاغات، أكثر التصنيفات، ومتوسط زمن المعالجة لكل تصنيف.
- عرض كل البلاغات بفلاتر متعددة، وإعادة توجيه بلاغ غير مغلق إلى قسم آخر.
- إدارة الأقسام والمباني والمواقع والتصنيفات والمستخدمين (إضافة، تعديل، حذف، بحث).
- تقريران قابلان للطباعة لفترة محددة: ملخص الحالات، وتحليل المباني وأنواع الأعطال.

**للنظام**

- نسخة احتياطية يومية تلقائية، وتنظيف دوري للجلسات المنتهية ومحاولات الدخول القديمة.

## 5. كيف يعمل النظام

1. يسجّل المبلِّغ دخوله بالرقم الجامعي أو البريد الإلكتروني.
2. يرسل نموذج البلاغ مع الصور إلى `POST /api/reports`.
3. يتحقق الخادم من المدخلات ومن النوع الحقيقي لكل صورة، ثم يقرأ التصنيف من جدول `category` ليعرف القسم المسؤول والأولوية الافتراضية.
4. الأولوية النهائية = الأعلى بين الأولوية الافتراضية للتصنيف والأولوية التي اقترحها المبلِّغ.
5. يحفظ الخادم البلاغ وصوره وأول سجل حالة ("تم استلام البلاغ") داخل معاملة واحدة بحالة `OPEN`.
6. يظهر البلاغ في قائمة عمل موظفي القسم المسؤول فقط.
7. يغيّر الموظف الحالة ويكتب ملاحظاته، وأول موظف يغيّر الحالة يُسجَّل كمسؤول (`assigned_to`).
8. عند الإغلاق تُشترط ملاحظة الحل ويُحفظ وقت الإغلاق في `closed_at`.
9. يرى المبلِّغ كل خطوة في صفحة تفاصيل البلاغ، ويرى المدير الصورة الكاملة في لوحة التحكم والتقارير.

## 6. أمثلة واقعية

> الأمثلة توضح قواعد الكود باستخدام التصنيفات والمباني المرجعية في `database/seed.js`.

**مثال 1: مكيف لا يبرد**
طالبة تختار تصنيف "تكييف" (أولويته الافتراضية `HIGH`) في "المبنى أ، الدور الأول، قاعة 112"، وتقترح أولوية منخفضة. الخادم يوجّه البلاغ إلى "قسم التكييف والتبريد"، والأولوية النهائية تصبح عالية لأنها الأعلى بين الاثنتين.

**مثال 2: شرارة من مقبس**
بلاغ بتصنيف "أعطال كهربائية خطرة" (أولويته `URGENT`) يذهب إلى "قسم الكهرباء والإنارة" ويظهر في أعلى قائمة عمله مهما كانت الأولوية المقترحة، لأن القائمة مرتبة بالأولوية: عاجلة، عالية، متوسطة، منخفضة.

**مثال 3: تصنيف خاطئ**
بلاغ وصل إلى قسم غير مناسب: المدير يفتحه من "كل البلاغات" ويعيد توجيهه لقسم آخر، فيُصفَّر المسؤول ويُضاف إلى السجل نص "إعادة توجيه من [القسم السابق] إلى [القسم الجديد]".

## 7. رحلة المستخدم

```
المبلِّغ
  register.html أو index.html  -->  home.html  -->  new-report.html  -->  رسالة نجاح برقم البلاغ
                                       |
                                       +--> my-reports.html  -->  report.html?id=N (التفاصيل والسجل)

موظف القسم
  index.html  -->  queue.html  -->  staff-report.html?id=N (تغيير الحالة / ملاحظة)
                       |
                       +--> closed.html

المدير
  index.html  -->  dashboard.html
                     +--> admin-reports.html  -->  report.html?id=N / إعادة التوجيه
                     +--> users.html | buildings.html | categories.html | departments.html
                     +--> print-status.html | print-analysis.html  -->  طباعة

الجميع: profile.html (البيانات وتغيير كلمة السر)، وزر تسجيل الخروج في الشريط العلوي
```

بعد الدخول يوجَّه كل دور إلى صفحته الرئيسية حسب `ROLE_HOME` في `server/middleware/auth.js`: المبلِّغ `/home.html`، الموظف `/queue.html`، المدير `/dashboard.html`.

## 8. الوحدات

| الوحدة | ملفات الخادم | صفحات الواجهة |
|---|---|---|
| المصادقة والحسابات | `routes/auth.js`, `middleware/auth.js`, `middleware/csrf.js`, `middleware/rateLimit.js` | `index.html`, `register.html`, `profile.html` |
| البلاغات | `routes/reports.js`, `services/classification.js`, `middleware/upload.js`, `services/storage.js` | `new-report.html`, `my-reports.html`, `report.html`, `home.html` |
| قائمة عمل القسم | `routes/staff.js` (يستخدم `reportFilters` و`listReports` من `reports.js`) | `queue.html`, `staff-report.html`, `closed.html` |
| الصور | `routes/images.js` | تُعرض داخل صفحات التفاصيل |
| الإدارة | `routes/admin.js` | `admin-reports.html`, `users.html`, `buildings.html`, `categories.html`, `departments.html` |
| الإحصائيات والتقارير | `services/stats.js`, `routes/print.js` | `dashboard.html`, `print-status.html`, `print-analysis.html` |
| البيانات المرجعية للنماذج | `routes/meta.js` | تستخدمها نماذج البلاغ والفلاتر |
| البنية التحتية | `config.js`, `db.js`, `services/backup.js`, `utils/logger.js`, `middleware/security.js`, `middleware/errors.js` | لا يوجد |

## 9. تعدد الكيانات

النظام **ليس** متعدد المستأجرين (Multi-Tenant): قاعدة بيانات واحدة لجامعة واحدة، ولا يوجد عمود يفصل بين جامعات أو فروع. الفصل الوحيد الموجود هو فصل البيانات حسب **القسم** لموظفي الصيانة: كل موظف مرتبط بقسم واحد عبر `user.department_id`، ولا يرى إلا بلاغات ذلك القسم.

## 10. الصلاحيات

| الإجراء | المبلِّغ | الموظف | المدير |
|---|:---:|:---:|:---:|
| إنشاء بلاغ | نعم | لا | لا |
| عرض بلاغ | بلاغاته فقط | بلاغات قسمه فقط | الكل |
| عرض صور البلاغ | بلاغاته فقط | بلاغات قسمه فقط | الكل |
| تغيير الحالة وإضافة ملاحظة | لا | بلاغات قسمه غير المغلقة | لا |
| إعادة التوجيه بين الأقسام | لا | لا | نعم (البلاغات غير المغلقة) |
| لوحة التحكم والتقارير | لا | لا | نعم |
| إدارة الأقسام والمباني والمواقع والتصنيفات والمستخدمين | لا | لا | نعم |
| تغيير كلمة سره | نعم | نعم | نعم |

قواعد يطبقها الخادم:

- الصلاحية تُفحص في الخادم لكل طلب (`requireRole` و`canAccess`) ولكل صفحة HTML (`pageGuard`)، ولا يُعتمد على إخفاء الأزرار.
- البلاغ غير المسموح يعيد 404 بنفس رسالة "البلاغ غير موجود"، فلا يكشف وجوده.
- المدير لا يستطيع حذف حسابه الحالي ولا تغيير دوره بنفسه.
- تعديل المدير لمستخدم آخر يحذف جلسات ذلك المستخدم فورًا.
- المدير لا يغيّر حالة البلاغات (المسار `POST /api/reports/:id/status` مقصور على `STAFF`).

## 11. الأتمتة

| ما يحدث تلقائيًا | أين في الكود |
|---|---|
| تحديد القسم المسؤول والأولوية النهائية عند إنشاء البلاغ | `classify` في `server/services/classification.js` |
| تسجيل أول حالة "تم استلام البلاغ" | `POST /api/reports` في `server/routes/reports.js` |
| تعيين أول موظف يغيّر الحالة كمسؤول عن البلاغ | `POST /api/reports/:id/status` |
| تخزين وقت الإغلاق | نفس المسار، `closed_at = NOW()` عند `CLOSED` |
| حذف الجلسات المنتهية ومحاولات الدخول الأقدم من يوم، كل ساعة | `cleanup` في `server/app.js` |
| نسخة احتياطية يومية والاحتفاظ بآخر 7 | `server/services/backup.js` |
| حذف ملفات الصور إن فشل حفظ البلاغ | كتلة `catch` في `POST /api/reports` |
| إنهاء الجلسات الأخرى عند تغيير كلمة السر | `POST /api/auth/password` |

لا يرسل النظام بريدًا إلكترونيًا أو إشعارات. حقل `department.contact_email` يُخزَّن ويُعرض فقط.

## 12. تكامل الوحدات

```
category (القسم + الأولوية الافتراضية)
    |
    v
classify()  ---> report.department_id + report.priority
    |
    v
report  ---> staff/queue (حسب department_id)  ---> status_history
    |                                                  |
    +---> report_image ---> /api/images/:id            |
    |                                                  v
    +---> stats.js (لوحة التحكم والتقارير) <---- created_at / closed_at
```

- تعديل المدير لربط تصنيف بقسم ينعكس فورًا على البلاغات **الجديدة** فقط، ولا يغيّر البلاغات السابقة.
- الإحصائيات لا تخزن أي أرقام مسبقة، بل تُحسب عند كل طلب من جداول `report` و`category` و`building` و`location` و`department`.
- لا يمكن حذف قسم أو مبنى أو موقع أو تصنيف أو مستخدم مرتبط ببلاغات؛ الخادم يعيد رسالة واضحة (قيود المفاتيح الأجنبية في `database/schema.sql`).

## 13. المصطلحات

| المصطلح | المعنى في هذا المشروع |
|---|---|
| بلاغ | سجل في جدول `report` يصف عطلًا في موقع محدد |
| تصنيف | نوع العطل (جدول `category`)، يحدد القسم والأولوية الافتراضية |
| قسم | جهة الصيانة المسؤولة (جدول `department`) |
| موقع | دور أو غرفة داخل مبنى (جدول `location`) |
| الحالات | `OPEN` مفتوح، `IN_PROGRESS` قيد المعالجة، `CLOSED` مغلق |
| الأولويات | `LOW` منخفضة، `MEDIUM` متوسطة، `HIGH` عالية، `URGENT` عاجلة |
| سجل الحالة | جدول `status_history`، كل تغيير حالة أو ملاحظة أو إعادة توجيه |
| إعادة التوجيه | نقل بلاغ إلى قسم آخر من المدير |
| زمن المعالجة | الفرق بين `created_at` و`closed_at` للبلاغ المغلق |
| الجلسة | سجل في جدول `session` يربط كوكي `fp_sid` بالمستخدم |
| رمز CSRF | قيمة عشوائية لكل جلسة تُرسل في ترويسة `X-CSRF-Token` |
| API | عناوين تحت `/api` تعيد JSON |
| Parameterized Query | استعلام تُمرَّر قيمه منفصلة عن نصه بعلامات `?` لمنع حقن SQL |
| Transaction | مجموعة استعلامات تنجح كلها أو تُلغى كلها |

## 14. الأسئلة الشائعة

**هل يستطيع الموظف رؤية بلاغات قسم آخر؟**
لا. قائمة العمل والتفاصيل والصور مقيدة بـ `department_id` الخاص بالموظف في الخادم.

**هل يمكن إعادة فتح بلاغ مغلق؟**
لا. الانتقالات المسموحة في `TRANSITIONS` داخل `server/routes/reports.js` لا تحتوي أي انتقال من `CLOSED`.

**هل يمكن للمبلِّغ تعديل بلاغه أو حذفه بعد الإرسال؟**
لا يوجد مسار لذلك في الـ API.

**ماذا لو لم يُضبط مفتاح خرائط Google؟**
يعمل النظام كاملًا، ويُستخدم موقع المبنى المختار بدل التحديد على الخريطة، وتظهر في صفحة التفاصيل رسالة "تعذر تحميل الخريطة حالياً" مع رابط لفتح الموقع في خرائط Google.

**هل يوجد استرجاع كلمة السر بالبريد؟**
لا. لا يوجد في الكود مسار "نسيت كلمة المرور". يغيّر المستخدم كلمة سره من الملف الشخصي، ويستطيع المدير تعيين كلمة سر جديدة لأي مستخدم من صفحة المستخدمين.

**ماذا يحدث بعد 5 محاولات دخول فاشلة؟**
يُوقف الدخول لنفس المعرّف من نفس عنوان IP مدة 15 دقيقة. ويوجد حد مستقل يبلغ 20 محاولة فاشلة للعنوان نفسه لمنع تجاوز الحماية بتجربة معرفات مختلفة.

**كم مدة الجلسة؟**
تنتهي بعد 30 دقيقة دون نشاط، أو بعد 8 ساعات كحد أقصى.

---

# الجزء الثاني: التفاصيل التقنية

## 15. البنية المعمارية

بنية ثلاثية الطبقات على خادم واحد (Monolith):

```
+--------------------------------------------------------------+
|                     المتصفح (Browser)                         |
|  public/*.html  +  assets/css/*.css  +  assets/js/*.js         |
|  FP.api() --> fetch + X-CSRF-Token           Google Maps (اختياري)
+------------------------------+-------------------------------+
                               | HTTPS
                               v
+--------------------------------------------------------------+
|                Node.js + Express 5  (server/app.js)           |
|                                                              |
|  httpsRedirect -> headers (CSP...) -> blockHidden             |
|  /assets  (ملفات ثابتة)                                        |
|  /api :  cors -> apiLimiter -> json(20kb) -> loadSession -> csrf
|          routes: auth | meta | reports | staff | images |     |
|                  admin/print | admin                          |
|  الصفحات: loadSession -> pageGuard (حسب الدور) -> public/*.html |
|  errorHandler                                                |
|                                                              |
|  services: classification | stats | storage | backup          |
+-----------+-------------------------+------------------------+
            |                         |
            v                         v
+-----------------------+   +----------------------------------+
|  MySQL 8 (mysql2 pool)|   |  نظام الملفات                     |
|  10 جداول، +03:00     |   |  storage/uploads  (صور البلاغات) |
+-----------------------+   |  backups/  (نسخ SQL يومية)        |
                            |  logs/error.log                   |
                            +----------------------------------+
```

## 16. التقنيات المستخدمة

| الطبقة | التقنية | ملاحظات |
|---|---|---|
| بيئة التشغيل | Node.js | `engines.node: ">=18"` في `package.json` |
| إطار الخادم | Express 5 | |
| قاعدة البيانات | MySQL 8 | عبر `mysql2/promise`، ترميز `utf8mb4_unicode_ci` ومحرك InnoDB |
| تجزئة كلمات السر | bcryptjs | تكلفة 12 |
| رفع الملفات | multer 2 | تخزين في الذاكرة ثم فحص البايتات ثم الحفظ |
| الكوكيز | cookie-parser | |
| متغيرات البيئة | dotenv | يقرأ `.env` من جذر المشروع |
| الواجهة | HTML و CSS و JavaScript بدون إطار عمل | كل الكود تحت كائن عام واحد `window.FP` |
| الرسوم البيانية | SVG يُرسم يدويًا | `assets/js/charts.js`، بدون مكتبة |
| الأيقونات | SVG مضمّنة | `assets/js/icons.js` |
| الخط | IBM Plex Sans Arabic | ملفات محلية في `assets/fonts` (Regular و Medium و Bold) |
| الخرائط | Google Maps JavaScript API | اختيارية، الخدمة الخارجية الوحيدة |

لا تُحمَّل أي مكتبة من CDN، ولا توجد أداة بناء (bundler) ولا TypeScript.

## 17. هيكل المشروع

```
FixPoint/
  server/
    app.js                 نقطة التشغيل وترتيب الطبقات الوسيطة والمسارات والمهام الدورية
    config.js              قراءة .env والتحقق من المتغيرات المطلوبة
    db.js                  مجمع اتصالات MySQL ودالتا query و transaction
    middleware/
      auth.js              الجلسات، requireAuth، requireRole، pageGuard
      csrf.js              فحص X-CSRF-Token وترويسة Origin
      rateLimit.js         apiLimiter وحد محاولات الدخول
      security.js          CSP وترويسات الأمان و CORS وإعادة التوجيه إلى HTTPS
      errors.js            HttpError ومعالج الأخطاء المركزي
      upload.js            multer وفحص نوع الصورة detectImageType
    routes/
      auth.js              /api/auth
      meta.js              /api/meta/form-data و /api/config/maps
      reports.js           /api/reports (ويصدّر canAccess و reportFilters و listReports)
      staff.js             /api/staff
      images.js            /api/images
      admin.js             /api/admin
      print.js             /api/admin/print
    services/
      classification.js    PRIORITIES و maxPriority و classify
      stats.js             overview و statusSummary و buildingFault
      storage.js           save و read و remove لملفات الصور
      backup.js            runBackup و schedule
    utils/
      datetime.js          parts و formatText و fileStamp و formatDuration
      logger.js            error
      validators.js        دوال التحقق من المدخلات
  database/
    schema.sql             تعريف الجداول العشرة
    init.js                تهيئة القاعدة والمستخدم المحدود والجداول والبيانات المرجعية
    seed.js                الأقسام والتصنيفات والمباني والمواقع فقط
    create-admin.js        إنشاء المدير الأول تفاعليًا دون كلمة سر في الكود أو سطر الأوامر
  public/                  صفحات HTML و robots.txt
  assets/
    css/                   base.css و layout.css و components.css و print.css
    js/                    ملفات مشتركة (api, ui, icons, datetime, charts, map) وملف لكل صفحة
    fonts/                 IBM Plex Sans Arabic
    images/logo.png        الشعار وأيقونة التبويب
  docs/screenshots/        لقطات الشاشة في هذا الملف
  storage/uploads/         صور البلاغات (يُنشأ تلقائيًا، خارج المجلد العام)
  logs/                    سجل الأخطاء (يُنشأ تلقائيًا)
  backups/                 النسخ الاحتياطية (يُنشأ تلقائيًا)
  .env.example             قالب متغيرات البيئة بلا قيم سرية
  .htaccess                حجب الملفات الحساسة عند الاستضافة خلف Apache
  package.json
```

## 18. الواجهة الأمامية

- **الصفحات:** 19 ملف HTML في `public/` (منها `not-found.html` و`index.html` و`register.html`). يقدّمها الخادم عبر `pageGuard` بعد فحص الجلسة والدور، وليست مجلدًا ثابتًا مفتوحًا.
- **الملفات المشتركة** في `assets/js`:
  - `api.js`: الدالة `FP.api(url, { method, body, form })` تضيف `X-CSRF-Token` لكل طلب غير GET، وتحوّل الأخطاء إلى رسائل عربية، وتعيد التوجيه للدخول عند 401. و`FP.me()` تجلب المستخدم ورمز CSRF. و`FP.safePath` تقبل مسارات داخلية فقط.
  - `ui.js`: أدوات DOM (`FP.h`)، تسميات الحالات والأولويات والأدوار، الشريط العلوي (`FP.renderNav`)، رسائل الخطأ تحت الحقول، الجداول والترقيم (`FP.listPage`, `FP.pager`)، وأداة إدارة عامة للجداول (`FP.crud`) تستخدمها صفحات الإدارة، وعرض التفاصيل (`FP.renderDetails`).
  - `icons.js`: أيقونات SVG مضمّنة (`FP.icon`, `FP.hydrateIcons`).
  - `datetime.js`: `FP.dt` تعرض التاريخ بصيغة `2026/1/3م 5:50ص` بتوقيت المملكة.
  - `charts.js`: `FP.barChart` رسم أعمدة أفقية بـ SVG.
  - `map.js`: `FP.loadMaps` و`FP.pickerMap` و`FP.viewMap`.
- **الأنماط:** `base.css` (المتغيرات والخط)، `layout.css` (الشريط العلوي الزجاجي والتخطيط)، `components.css` (الأزرار والحقول والجداول والنوافذ)، `print.css` (الطباعة).
- **XSS:** النصوص القادمة من المستخدم تُعرض عبر `textContent`، ولا توجد سكربتات مضمّنة داخل HTML (CSP لا تسمح بها).

## 19. الخادم

ترتيب الطبقات في `server/app.js` (حرفيًا من الكود):

1. `app.disable('x-powered-by')`، و`trust proxy = 1` في الإنتاج.
2. `security.httpsRedirect`, `security.headers`, `security.blockHidden` لكل الطلبات.
3. `/assets` ملفات ثابتة (`dotfiles: 'deny'`، تخزين مؤقت يوم واحد في الإنتاج).
4. `cookieParser()`.
5. على `/api`: `security.cors` ثم `apiLimiter` ثم `express.json({ limit: '20kb' })` ثم `loadSession` ثم `csrf`.
6. المسارات: `/api/auth`, `/api` (meta), `/api/reports`, `/api/staff`, `/api/images`, `/api/admin/print`, `/api/admin`، ثم `apiNotFound`.
7. `/robots.txt`.
8. الصفحات: `loadSession` ثم `pageGuard`.
9. `errorHandler`.

عند التشغيل (`start`): يختبر الاتصال بـ `SELECT 1`، وإن فشل يطبع رسالة عربية ويتوقف. ثم يستمع على `0.0.0.0:PORT`، ويشغّل `cleanup` كل ساعة، و`backup.schedule()`.

**معالجة الأخطاء:** أي خطأ من نوع `HttpError` يعود برسالته وحقله. أي خطأ آخر يُسجَّل في `logs/error.log` ويعود للمستخدم برسالة عامة "حدث خطأ غير متوقع، حاول مرة أخرى لاحقاً". أخطاء multer تتحول إلى رسائل عربية (الحجم، العدد).

## 20. مسار الطلب بمثال حقيقي

**المثال:** موظف قسم التكييف يغلق البلاغ رقم 29 بملاحظة "تم إصلاح العطل".

```
المتصفح (staff-report.js)
  FP.api('/api/reports/29/status', { method: 'POST', body: { status: 'CLOSED', note: 'تم إصلاح العطل' } })
  ترويسات: Content-Type: application/json, X-CSRF-Token: <رمز الجلسة>, كوكي fp_sid
      |
      v
server/app.js
  httpsRedirect -> headers -> blockHidden
  /api: cors -> apiLimiter (600 طلب / 15 دقيقة لكل IP) -> express.json -> loadSession
  /api/auth/login و register: authLimiter (30 طلب / 15 دقيقة لكل IP)
      loadSession: HMAC(fp_sid) -> بحث في session مع شرط الخمول 30 دقيقة -> req.user
  csrf: الطريقة POST -> فحص Origin -> مقارنة X-CSRF-Token بـ session.csrf_token بزمن ثابت
      |
      v
server/routes/reports.js  POST /:id/status
  requireRole('STAFF')
  التحقق: status ضمن OPEN/IN_PROGRESS/CLOSED، note حتى 1000 حرف، والإغلاق يتطلب ملاحظة
  db.transaction:
    SELECT status, department_id, assigned_to FROM report WHERE report_id = 29 FOR UPDATE
    التأكد: department_id = قسم الموظف، والبلاغ ليس مغلقًا، والانتقال مسموح
    UPDATE report SET status='CLOSED', assigned_to=..., closed_at=NOW()
    INSERT INTO status_history (...)
      |
      v
الاستجابة: 200 { "ok": true, "status": "CLOSED" }
  يظهر الإغلاق للمبلِّغ في report.html، ويدخل البلاغ في حساب متوسط زمن المعالجة
```

## 21. قاعدة البيانات

ترميز كل الجداول `utf8mb4_unicode_ci` بمحرك InnoDB. اتصال التطبيق يضبط `time_zone = '+03:00'` لكل اتصال جديد في المجمع (`server/db.js`)، فالأوقات المخزنة في أعمدة `DATETIME` بتوقيت المملكة.

### 21.1 العلاقات

```
department 1 --- * category
department 1 --- * user (موظفو القسم)
department 1 --- * report (القسم المسؤول)
building   1 --- * location
location   1 --- * report
category   1 --- * report
user       1 --- * report (المبلِّغ reporter_id، والمسؤول assigned_to)
report     1 --- * report_image
report     1 --- * status_history
user       1 --- * session
```

### 21.2 الجداول

| الجدول | الغرض | أهم الأعمدة |
|---|---|---|
| `department` | الأقسام | `department_id`, `name` (فريد), `contact_email` |
| `user` | المستخدمون | `user_id`, `department_id`, `university_id` (فريد), `full_name`, `email` (فريد), `password_hash`, `role` |
| `category` | التصنيفات | `category_id`, `department_id`, `name` (فريد), `default_priority` |
| `building` | المباني | `building_id`, `code` (فريد), `name`, `latitude`, `longitude` |
| `location` | الأدوار والغرف | `location_id`, `building_id`, `floor`, `room_name` |
| `report` | البلاغات | `report_id`, `reporter_id`, `category_id`, `location_id`, `department_id`, `assigned_to`, `description`, `priority`, `status`, `latitude`, `longitude`, `created_at`, `closed_at` |
| `report_image` | صور البلاغ | `image_id`, `report_id`, `storage_url`, `uploaded_at` |
| `status_history` | سجل الحالة | `history_id`, `report_id`, `changed_by`, `old_status`, `new_status`, `note`, `changed_at` |
| `session` | الجلسات | `session_id` (HMAC لرمز الكوكي)، `user_id`, `csrf_token`, `created_at`, `last_seen_at`, `expires_at` |
| `login_attempt` | محاولات الدخول | `attempt_id`, `login_key` (HMAC للمعرّف مع IP)، `attempted_at`, `succeeded` |

التعريف الكامل بالأنواع والقيود والفهارس في `database/schema.sql`.

### 21.3 البيانات الأولية (`database/seed.js`)

تُدخل مرة واحدة فقط عندما يكون جدول `department` فارغًا:

- 6 أقسام: التكييف والتبريد، الكهرباء والإنارة، السباكة والمياه، الأثاث والنجارة، الأجهزة والمعدات، الصيانة العامة (بريد كل قسم من نطاق `example.com`).
- 7 تصنيفات بأولوياتها: تكييف `HIGH`، إنارة `MEDIUM`، أعطال كهربائية خطرة `URGENT`، دورات المياه والتسربات `HIGH`، أثاث `LOW`، أجهزة ومعدات `MEDIUM`، أخرى `LOW`.
- 5 مبانٍ (A, B, C, LIB, LAB) بإحداثيات قرب عرعر، و20 موقعًا داخلها.
- لا تنشئ حسابات أو كلمات سر أو بلاغات تجريبية.
- بعد `npm run db:init` يُنشأ المدير الأول بالأمر التفاعلي `npm run admin:create`. تُقرأ كلمة السر من طرفية آمنة مع إخفاء حروفها، ولا تمر عبر سطر الأوامر أو ملف البيئة.

## 22. واجهة برمجة التطبيقات API

**قواعد عامة**

- كل الاستجابات JSON. الخطأ بصيغة `{ "error": "رسالة", "field": "اسم الحقل" }`.
- كل طلب POST أو PUT أو DELETE يتطلب ترويسة `X-CSRF-Token` (من `GET /api/auth/me`)، ما عدا `/api/auth/login` و`/api/auth/register`.
- القوائم تقبل `page` و`pageSize` (الافتراضي 10 والأقصى 50) وتعيد `{ items, total, page, pageSize }`.
- التواريخ في الفلاتر بصيغة `YYYY-MM-DD` (قيد تقني لحقل التاريخ في المتصفح وللتحقق في `validators.date`).
- الحالات المرجعة: 400 مدخل غير صالح، 401 جلسة منتهية، 403 غير مصرح أو CSRF، 404 غير موجود، 409 تعارض، 429 تجاوز الحد، 500 خطأ عام.

### 22.1 المصادقة `/api/auth`

| الطريقة | المسار | الصلاحية | المدخلات | الاستجابة |
|---|---|---|---|---|
| POST | `/api/auth/register` | زائر | `full_name` (3 إلى 100)، `university_id` (حروف إنجليزية وأرقام ونقطة حتى 20)، `email`، `password` (8 إلى 72 وتتضمن حرفًا ورقمًا) | 201 `{ redirect: "/home.html" }` وكوكي الجلسة |
| POST | `/api/auth/login` | زائر | `identifier` (الرقم الجامعي أو البريد)، `password` | `{ redirect }` حسب الدور وكوكي الجلسة |
| POST | `/api/auth/logout` | مسجّل | لا شيء | `{ redirect: "/" }` |
| GET | `/api/auth/me` | مسجّل | لا شيء | `{ user, csrf, home }` |
| POST | `/api/auth/password` | مسجّل | `current_password`, `new_password` | `{ ok: true }` وتُحذف جلسات المستخدم الأخرى |

### 22.2 البيانات المرجعية

| الطريقة | المسار | الصلاحية | الاستجابة |
|---|---|---|---|
| GET | `/api/meta/form-data` | مسجّل | `{ categories, buildings, locations }` |
| GET | `/api/config/maps` | مسجّل | `{ key }` مفتاح الخرائط أو قيمة فارغة |

### 22.3 البلاغات `/api/reports`

| الطريقة | المسار | الصلاحية | المدخلات | الاستجابة |
|---|---|---|---|---|
| POST | `/api/reports` | `REPORTER` | `multipart/form-data`: `category_id`, `priority` (افتراضي `LOW`)، `description` (5 إلى 1000)، `location_id`, `latitude`, `longitude` (اختياريان)، `images` (1 إلى 5، JPEG أو PNG، حتى 5MB لكل صورة) | 201 `{ report_id, status: "OPEN" }` |
| GET | `/api/reports/mine` | `REPORTER` | فلاتر: `status`, `category_id`, `building_id`, `department_id`, `from`, `to`, `q` | القائمة مع `counts` لكل حالة |
| GET | `/api/reports/:id` | حسب `canAccess` | لا شيء | `{ report, images, history }` |
| POST | `/api/reports/:id/status` | `STAFF` من القسم المسؤول | `status`, `note` (إلزامية عند الإغلاق أو عند عدم تغيير الحالة) | `{ ok: true, status }` |

البحث `q` يطابق الوصف واسم المبلِّغ (جزئيًا)، والرقم الجامعي ورقم البلاغ (مطابقة تامة).

### 22.4 قائمة عمل القسم `/api/staff`

| الطريقة | المسار | الصلاحية | الوصف |
|---|---|---|---|
| GET | `/api/staff/queue` | `STAFF` | بلاغات القسم غير المغلقة، مرتبة بالأولوية ثم الأقدم، بنفس فلاتر البلاغات |
| GET | `/api/staff/closed` | `STAFF` | بلاغات القسم المغلقة، الأحدث إغلاقًا أولًا |

### 22.5 الصور

| الطريقة | المسار | الصلاحية | الاستجابة |
|---|---|---|---|
| GET | `/api/images/:id` | مسجّل وله حق الوصول للبلاغ | محتوى الصورة مع `Cache-Control: private, max-age=3600`، أو 404 |

### 22.6 الإدارة `/api/admin` (المدير فقط)

| الطريقة | المسار | المدخلات | الاستجابة |
|---|---|---|---|
| GET | `/api/admin/stats` | لا شيء | `{ counts, avg_seconds, avg_text, buildings, categories, by_category }` |
| GET | `/api/admin/reports` | `status`, `category_id`, `building_id`, `department_id`, `from`, `to`, `q`, `page`, `pageSize` | قائمة كل البلاغات |
| POST | `/api/admin/reports/:id/reassign` | `department_id` | `{ ok: true }` |
| GET | `/api/admin/:entity` | `q` للبحث، وفلتر خاص بالكيان، و`page`, `pageSize` | `{ items, total, page, pageSize }` |
| POST | `/api/admin/:entity` | حقول الكيان | 201 `{ id }` |
| PUT | `/api/admin/:entity/:id` | حقول الكيان | `{ ok: true }` |
| DELETE | `/api/admin/:entity/:id` | لا شيء | `{ ok: true }`، أو 409 إن كان مرتبطًا ببيانات |

الكيانات المسموحة في `ENTITIES` داخل `server/routes/admin.js`:

| `entity` | الحقول | فلتر إضافي |
|---|---|---|
| `departments` | `name`, `contact_email` (اختياري) | لا يوجد |
| `buildings` | `code` (حروف إنجليزية وأرقام وشرطة)، `name`, `latitude`, `longitude` (إلزاميان) | لا يوجد |
| `locations` | `building_id`, `floor`, `room_name` (اختياري) | `building_id` |
| `categories` | `name`, `department_id`, `default_priority` | `department_id` |
| `users` | `university_id`, `full_name`, `email`, `role`, `department_id` (للموظف فقط)، `password` (إلزامية عند الإضافة، اختيارية عند التعديل) | `role` |

### 22.7 التقارير `/api/admin/print` (المدير فقط)

| الطريقة | المسار | المدخلات | الاستجابة |
|---|---|---|---|
| GET | `/api/admin/print/status-summary` | `from`, `to` (إلزاميان) | `{ from, to, generated_at, generated_text, total, by_status, by_department, avg_text }` |
| GET | `/api/admin/print/building-fault` | `from`, `to` (إلزاميان) | `{ from, to, generated_at, generated_text, total, buildings, categories, pairs, by_category }` |

## 23. المصادقة والتفويض

**الجلسة (`server/middleware/auth.js`)**

1. عند الدخول يُولَّد رمز عشوائي 32 بايت يُرسل في كوكي `fp_sid` (`HttpOnly`، `SameSite=Strict`، و`Secure` في الإنتاج).
2. لا يُخزَّن الرمز نفسه، بل `HMAC-SHA256(SESSION_SECRET, الرمز)` في `session.session_id`، مع رمز CSRF عشوائي خاص بالجلسة.
3. في كل طلب: يُحسب الـ HMAC ويُبحث عن جلسة لم تتجاوز 8 ساعات من إنشائها ولا 30 دقيقة من آخر نشاط، ثم يُحدَّث `last_seen_at`.
4. الخروج يحذف الجلسة من قاعدة البيانات ويمسح الكوكي.

**كلمات السر:** bcrypt بتكلفة 12. عند الدخول بمعرّف غير موجود تُقارن كلمة السر مع تجزئة وهمية (`DUMMY_HASH`) ليتساوى زمن الاستجابة، والرسالة واحدة: "بيانات الدخول غير صحيحة".

**التفويض:**

- `requireAuth`: أي مستخدم مسجّل.
- `requireRole(...roles)`: أدوار محددة.
- `canAccess(user, report)`: المدير الكل، المبلِّغ بلاغاته، الموظف بلاغات قسمه.
- `pageGuard`: جدول `ROLE_PAGES` يحدد الأدوار المسموحة لكل صفحة HTML؛ الزائر يُعاد للدخول، والدور غير المسموح يُعاد لصفحته الرئيسية.

## 24. الأمان

| الجانب | التطبيق |
|---|---|
| الأسرار | في `.env` فقط (ضمن `.gitignore`). يتوقف الخادم برسالة تذكر أسماء المتغيرات الناقصة دون قيمها. |
| مستخدم قاعدة البيانات | `npm run db:init` ينشئ مستخدمًا بصلاحيات `SELECT, INSERT, UPDATE, DELETE` فقط على قاعدة المشروع؛ حساب المسؤول للتهيئة فقط. |
| حقن SQL | كل الاستعلامات بمعاملات `?`، وأسماء الجداول عبر `??` من قائمة ثابتة. نص البحث في LIKE تُعطَّل رموزه الخاصة (`validators.like`). |
| XSS | `textContent` في الواجهة، و CSP بلا سكربتات مضمّنة. |
| CSRF | ترويسة `X-CSRF-Token` مقارنة بزمن ثابت (`crypto.timingSafeEqual`)، ورفض أي `Origin` من نطاق غير الموقع وغير `ALLOWED_ORIGINS`، وكوكي `SameSite=Strict`. |
| CSP | `default-src 'self'`، السكربتات من الموقع و`maps.googleapis.com` فقط، `object-src 'none'`، `frame-ancestors 'none'`. |
| ترويسات أخرى | `X-Frame-Options: DENY`، `X-Content-Type-Options: nosniff`، `Referrer-Policy: same-origin`، `Permissions-Policy`، و HSTS في الإنتاج. |
| HTTPS | إعادة توجيه 301 إلى HTTPS في الإنتاج، مع `trust proxy = 1`. |
| حد الطلبات | 600 طلب لكل IP كل 15 دقيقة على `/api`، و30 طلب دخول أو تسجيل، و5 محاولات دخول فاشلة لكل معرّف وعنوان، و20 محاولة فاشلة لكل عنوان خلال 15 دقيقة. |
| رفع الملفات | 5 ملفات و5MB لكل ملف، فحص البايتات الأولى (JPEG/PNG)، اسم عشوائي، تخزين خارج المجلد العام، وعرض بعد التحقق من الصلاحية. |
| تجاوز المسارات | `blockHidden` يرفض أي جزء يبدأ بنقطة أو يحتوي `\`، و`storage.resolve` يقبل أسماء بصيغة `^[a-f0-9]{32}\.(jpg\|png)$` فقط. |
| التحويل المفتوح | `FP.safePath` يقبل مسارات داخلية بصيغة `/name.html` فقط. |
| إخفاء التقنية | `x-powered-by` معطّل، ورسائل خطأ عامة، والتفاصيل في `logs/error.log` فقط. |
| السجلات | `logger.error` يسجّل الطريقة والمسار ونص الخطأ فقط، دون محتوى الطلب أو كلمات السر. |
| ملفات حساسة | `.htaccess` يحجب ملفات البيئة وقواعد البيانات والسجلات والنسخ عند العمل خلف Apache. |
| robots.txt | `Allow: /` دون ذكر أي مسار إداري. |

## 25. الإعدادات

المتغيرات تُقرأ من `.env` في جذر المشروع (قالبها `.env.example`):

| المتغير | إلزامي | الوصف |
|---|:---:|---|
| `PORT` | نعم | منفذ الخادم |
| `NODE_ENV` | نعم | `production` يفعّل الكوكي الآمن و HSTS وإعادة التوجيه إلى HTTPS و`trust proxy` |
| `DB_HOST`, `DB_PORT` | نعم | عنوان MySQL ومنفذه |
| `DB_NAME` | نعم | حروف إنجليزية وأرقام و`_` فقط |
| `DB_USER`, `DB_PASSWORD` | نعم | مستخدم التطبيق محدود الصلاحيات |
| `SESSION_SECRET` | نعم | قيمة عشوائية، والكود يرفض أقل من 64 خانة |
| `DB_ADMIN_USER`, `DB_ADMIN_PASSWORD` | لأمر `db:init` فقط | حساب مسؤول MySQL. إن كان `DB_ADMIN_USER` هو نفسه `DB_USER` لا يُنشأ مستخدم جديد |
| `GOOGLE_MAPS_API_KEY` | لا | مفتاح خرائط Google، وإن تُرك فارغًا تعمل البدائل |
| `ALLOWED_ORIGINS` | لا | نطاقات موثوقة مفصولة بفاصلة لـ CORS وفحص Origin |

في الإنتاج يجب أن يحتوي `ALLOWED_ORIGINS` نطاق HTTPS كاملًا دون مسار، وإلا يرفض الخادم التشغيل.

لتوليد قيمة `SESSION_SECRET`:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 26. التكاملات الخارجية

| الخدمة | الاستخدام | السلوك عند الغياب |
|---|---|---|
| Google Maps JavaScript API | اختيار نقطة العطل عند إنشاء البلاغ، وعرضها في التفاصيل، واختيار موقع المبنى في الإدارة | يُستخدم موقع المبنى، وتظهر رسالة بديلة ورابط خارجي لخرائط Google |

يُحمَّل سكربت الخرائط برمجيًا بعد جلب المفتاح من `GET /api/config/maps` (للمستخدم المسجّل فقط)، بمهلة 12 ثانية. لا توجد خدمات تحليلات أو تتبع أخطاء أو إعلانات أو بريد.

## 27. المهام المجدولة

| المهمة | التكرار | المصدر |
|---|---|---|
| حذف الجلسات المنتهية أو الخاملة أكثر من 30 دقيقة، ومحاولات الدخول الأقدم من يوم | عند التشغيل ثم كل ساعة | `cleanup` في `server/app.js` |
| نسخة احتياطية يومية | فحص عند التشغيل ثم كل ساعة، ونسخة واحدة لكل يوم | `schedule` في `server/services/backup.js` |
| تنظيف عدّاد `apiLimiter` في الذاكرة | كل 15 دقيقة | `server/middleware/rateLimit.js` |

كلها مؤقتات `setInterval` داخل عملية الخادم نفسها، ولا يوجد cron خارجي.

## 28. تخزين الملفات

- الصور تُستقبل في الذاكرة (`multer.memoryStorage`)، ثم تُفحص، ثم تُكتب في `storage/uploads/` باسم `[32 حرفًا ست عشريًا].jpg` أو `.png`.
- قاعدة البيانات تخزن اسم الملف فقط في `report_image.storage_url`.
- العرض عبر `GET /api/images/:id` فقط، بعد التحقق من صلاحية الوصول للبلاغ.
- في المتصفح تُضغط الصورة قبل الرفع: أطول ضلع 1600 بكسل وجودة 0.8، ويُرسل الأصل إن كان أصغر.
- لا يوجد حذف لصور البلاغ لأن البلاغ نفسه لا يُحذف من الواجهة.

## 29. السجلات

- الملف: `logs/error.log` (يُنشأ تلقائيًا).
- السطر: `[2026/1/3م 5:50ص] POST /api/reports <stack>`، والتاريخ بالدالة الموحدة `formatText`.
- تُسجَّل الأخطاء غير المتوقعة فقط (ليست `HttpError`)، وأخطاء النسخ الاحتياطي والتنظيف.
- في غير الإنتاج يُطبع السطر في الطرفية أيضًا.
- لا يوجد تدوير تلقائي لملف السجل.

## 30. التثبيت والتشغيل

### 30.1 المتطلبات

- Node.js 18 أو أحدث (`node -v`).
- MySQL 8 مع حساب مسؤول (مثل `root`).

### 30.2 الخطوات

```
git clone <رابط المستودع>
cd FixPoint
npm install
copy .env.example .env      (على macOS أو Linux: cp .env.example .env)
```

املأ `.env` حسب القسم 25 (كلمة سر قوية لـ `DB_PASSWORD`، وقيمة عشوائية لـ `SESSION_SECRET`، وبيانات `DB_ADMIN_USER` و`DB_ADMIN_PASSWORD`)، ثم:

```
npm run db:init
npm run admin:create
npm start
```

- `npm run db:init` ينشئ القاعدة والمستخدم المحدود والجداول والبيانات المرجعية. آمن عند التكرار: لا يكررها إن وُجد أي قسم.
- `npm run admin:create` ينشئ المدير الأول تفاعليًا، ويرفض العمل إذا كان هناك مدير.
- `npm start` يشغّل الخادم على `http://localhost:PORT`.

## 31. دليل التطوير

- **السكربتات المتوفرة:** `start` و`db:init` و`admin:create` و`test`. لا توجد أداة فحص (lint) ولا أداة بناء في المشروع.
- **إضافة صفحة جديدة:** ملف في `public/` وآخر في `assets/js/`، ثم إضافة الصفحة وأدوارها إلى `ROLE_PAGES` في `server/middleware/auth.js`، وإلا يعيد الخادم 404.
- **إضافة مسار API:** ملف أو دالة في `server/routes/`، مع `requireRole` المناسب، والتحقق بدوال `server/utils/validators.js`، ورمي `HttpError` للأخطاء المتوقعة.
- **إضافة كيان إداري:** تعريف جديد في `ENTITIES` داخل `server/routes/admin.js` (الجدول، المفتاح، الاستعلام، حقول البحث، `parse`).
- **التواريخ:** في الخادم `server/utils/datetime.js`، وفي المتصفح `FP.dt` من `assets/js/datetime.js`.
- **قاعدة البيانات:** أي تعديل على الجداول في `database/schema.sql` (يستخدم `CREATE TABLE IF NOT EXISTS`، فلا يعدّل جداول موجودة؛ التعديل على قاعدة قائمة يحتاج أمر `ALTER` يدويًا).

## 32. النشر

متطلبات بيئة الإنتاج كما يفرضها الكود:

1. `NODE_ENV=production` (يفعّل الكوكي الآمن و HSTS وإعادة التوجيه إلى HTTPS).
2. شهادة HTTPS على النطاق، والخادم خلف وكيل عكسي واحد يرسل `X-Forwarded-Proto` (لأن `trust proxy = 1`).
3. `ALLOWED_ORIGINS=https://<النطاق>`.
4. `SESSION_SECRET` جديد عشوائي خاص بالإنتاج.
5. قاعدة MySQL 8 ومستخدم محدود الصلاحيات، وتنفيذ `npm run db:init` للهيكل والبيانات المرجعية.
6. إنشاء المدير الأول مرة واحدة عبر `npm run admin:create` في طرفية آمنة.
7. مساحة تخزين دائمة لمجلدات `storage/uploads` و`backups` و`logs`.
8. نقطة التشغيل: `server/app.js` (أمر `npm start`).

## 33. النسخ الاحتياطي والاستعادة

**النسخ:** تلقائي يوميًا في `backups/fixpoint-YYYY-MM-DD.sql`، ويُحتفظ بآخر 7 نسخ. الملف يحتوي `DROP TABLE` و`CREATE TABLE` و`INSERT` لبيانات العمل في 8 جداول، ويستبعد `session` و`login_attempt` لأنها بيانات أمنية مؤقتة. يُكتب أولًا إلى ملف `.tmp` بصلاحية `0600` ثم يُعاد تسميته، فلا تبقى نسخة ناقصة.

**الاستعادة (استنتاج من صيغة الملف):**

```
mysql -u <مستخدم بصلاحية CREATE و DROP> -p <اسم القاعدة> < backups/fixpoint-YYYY-MM-DD.sql
```

مستخدم التطبيق المحدود لا يملك صلاحية `DROP` و`CREATE`، فالاستعادة تحتاج حساب المسؤول.

**ما لا يشمله النسخ:** ملفات الصور في `storage/uploads/` تحتاج نسخًا منفصلًا للمجلد.

## 34. حل المشكلات

| العَرَض | السبب | الحل |
|---|---|---|
| "تعذر التشغيل: المتغيرات التالية ناقصة أو فارغة" | متغير مطلوب غير موجود في `.env` | املأ المتغيرات المذكورة في الرسالة |
| "قيمة SESSION_SECRET قصيرة" | أقل من 64 خانة | ولّد قيمة بالأمر في القسم 25 |
| "تعذر الاتصال بقاعدة البيانات" عند `npm start` | MySQL لا يعمل أو بيانات الاتصال خاطئة أو القاعدة غير مهيأة | شغّل MySQL، راجع `DB_*`، ونفّذ `npm run db:init` |
| "تعذر الاتصال بخادم MySQL بحساب المسؤول" | بيانات `DB_ADMIN_*` خاطئة | صحّح حساب المسؤول |
| "انتهت صلاحية الصفحة، أعد تحميلها" | رمز CSRF لا يطابق الجلسة | أعد تحميل الصفحة |
| "طلب غير مسموح" (403) | `Origin` من نطاق غير مسموح | أضف النطاق إلى `ALLOWED_ORIGINS` |
| "تعذر تحميل الخريطة" | `GOOGLE_MAPS_API_KEY` فارغ أو مقيد بنطاق آخر | اضبط المفتاح وقيوده (القسم 26) |
| إعادة توجيه متكررة في الإنتاج | الوكيل لا يرسل `X-Forwarded-Proto: https` | اضبط الوكيل أو شغّل خلف HTTPS فعلي |
| "تم إيقاف تسجيل الدخول مؤقتاً" | 5 محاولات فاشلة | انتظر 15 دقيقة |

## 35. الاعتماديات وإصداراتها

| الحزمة | النطاق في `package.json` | المثبّت في `package-lock.json` |
|---|---|---|
| express | ^5.1.0 | 5.3.0 |
| mysql2 | ^3.14.0 | 3.24.6 |
| dotenv | ^16.4.7 | 16.6.1 |
| bcryptjs | ^2.4.3 | 2.4.3 |
| multer | ^2.0.2 | 2.5.0 |
| cookie-parser | ^1.4.7 | 1.4.7 |

لا توجد اعتماديات تطوير (`devDependencies`).

## 36. القيود المعروفة

**ملاحظة بالتشغيل الفعلي أثناء التوثيق:**

- **تسميات الرسوم البيانية في لوحة التحكم مقصوصة:** في `assets/js/charts.js` يُرسم النص بـ `text-anchor: end` عند `x: width - 4` داخل صفحة RTL، فتظهر أسماء المباني والتصنيفات كحرف واحد مقطوع (ظاهر في لقطة `dashboard.png`).
- **حقول التاريخ الأصلية في المتصفح** (فلاتر الإدارة وصفحات التقارير) تعرض الأرقام والعناصر النائبة حسب لغة المتصفح، وقد تظهر بأرقام عربية هندية في متصفح بلغة عربية.

**من الكود:**

- عدّاد `apiLimiter` في ذاكرة العملية، فلا يعمل بدقة عند تشغيل أكثر من نسخة (موثق بتعليق `ponytail` في الكود).
- النسخة الاحتياطية تُبنى كاملة في الذاكرة قبل الكتابة، مناسبة لحجم بيانات جامعة واحدة (موثق بتعليق `ponytail`).
- الصور والنسخ والسجلات على القرص المحلي؛ على استضافة بنظام ملفات مؤقت تضيع عند إعادة النشر.
- لا يوجد استرجاع كلمة سر، ولا إشعارات بريد، ولا تعديل لبيانات الحساب من الملف الشخصي (كلمة السر فقط).
- لا يمكن للمبلِّغ تعديل البلاغ أو حذفه، ولا يمكن إعادة فتح بلاغ مغلق.
- الاختبارات الآلية الحالية تركز على ضوابط الأمان الأساسية وليست تغطية وظيفية كاملة.
- لا يوجد تدوير لملف `logs/error.log`.

## 37. الحالة الحالية للنظام

- كل الوظائف الموثقة أعلاه موجودة في الكود وتعمل في التشغيل المحلي (لقطات القسم 40 من تشغيل فعلي).
- البيانات التجريبية لا تحتوي صورًا للبلاغات، لذلك لا تظهر صور في لقطات التفاصيل.
- مفتاح Google Maps غير مضبوط في البيئة التي التُقطت منها اللقطات، فتظهر الرسالة البديلة.
- الإصدار في `package.json`: `1.0.0`.

## 38. قرارات معمارية

| القرار | السبب الظاهر من الكود |
|---|---|
| JavaScript بدون إطار عمل في الواجهة | لا أداة بناء ولا اعتماديات للواجهة؛ كل صفحة ملف HTML وملف JS |
| الصفحات تمر عبر `pageGuard` وليست مجلدًا ثابتًا | التحقق من الدور قبل تسليم أي صفحة |
| جلسات في قاعدة البيانات بدل JWT | إمكانية الإبطال الفوري (الخروج، تغيير كلمة السر، تعديل المدير للمستخدم) |
| تخزين HMAC لرمز الجلسة | تسرب جدول `session` لا يكشف رموزًا صالحة |
| حد محاولات الدخول في قاعدة البيانات | يبقى بعد إعادة تشغيل الخادم (استنتاج) |
| التوجيه بقاعدة ثابتة في جدول `category` | قابل للتعديل من المدير دون تغيير الكود |
| الأولوية = الأعلى بين الافتراضية والمقترحة | المبلِّغ يستطيع رفع الأولوية ولا يستطيع خفضها تحت حد التصنيف |
| الإحصائيات بـ `GROUP BY` عند الطلب | لا جداول ملخصات تحتاج مزامنة |
| رسوم SVG يدوية | لا مكتبة رسوم خارجية |
| الخط محلي | CSP تسمح بالخطوط من الموقع فقط (`font-src 'self'`) |

## 39. سجل التغييرات

لا يوجد سجل تغييرات ولا تاريخ إصدارات موثق في المشروع. الإصدار الحالي في `package.json` هو `1.0.0`.

---

# الخلاصة

## نظرة شاملة على النظام

```
  المبلِّغ                 موظف القسم                 المدير
     |                         |                         |
     | بلاغ + صور              | تغيير حالة + ملاحظة      | إحصائيات، تقارير، إدارة
     v                         v                         v
+------------------------------------------------------------------+
|                      FixPoint (Express 5)                         |
|  مصادقة وجلسات | CSRF | صلاحيات | تحقق من المدخلات | حد الطلبات    |
|                                                                  |
|  classify(): التصنيف --> القسم + الأولوية                         |
|  status_history: كل خطوة مسجلة                                    |
|  stats: أرقام لحظية من قاعدة البيانات                              |
+------------------------------------------------------------------+
     |                         |                         |
     v                         v                         v
  MySQL 8               storage/uploads            backups/ + logs/
```

## مرجع سريع

| الجزء | التقنية | الموقع | الوظيفة |
|---|---|---|---|
| نقطة التشغيل | Express 5 | `server/app.js` | ترتيب الطبقات والمسارات والمهام الدورية |
| الإعدادات | dotenv | `server/config.js`, `.env` | قراءة المتغيرات والتحقق منها |
| قاعدة البيانات | mysql2 | `server/db.js`, `database/schema.sql` | الاتصال والمعاملات والجداول |
| التهيئة | Node.js | `database/init.js`, `database/seed.js`, `database/create-admin.js` | إنشاء القاعدة والبيانات المرجعية والمدير الأول |
| المصادقة | bcryptjs, cookie-parser | `server/routes/auth.js`, `server/middleware/auth.js` | الدخول والجلسات والصلاحيات |
| الحماية | Node.js crypto | `server/middleware/csrf.js`, `security.js`, `rateLimit.js` | CSRF و CSP وحد الطلبات |
| البلاغات | Express | `server/routes/reports.js` | الإنشاء والعرض وتغيير الحالة |
| التوجيه | قاعدة ثابتة | `server/services/classification.js` | القسم والأولوية |
| الصور | multer | `server/middleware/upload.js`, `server/services/storage.js` | الفحص والحفظ والعرض |
| الإحصائيات | SQL | `server/services/stats.js` | لوحة التحكم والتقارير |
| الإدارة | Express | `server/routes/admin.js` | إدارة الكيانات وإعادة التوجيه |
| النسخ الاحتياطي | mysql2 | `server/services/backup.js` | نسخة يومية |
| الواجهة | HTML, CSS, JS | `public/`, `assets/` | الصفحات والأنماط والسلوك |
| الخرائط | Google Maps | `assets/js/map.js` | اختيار وعرض الموقع |

## البدء السريع

```
npm install
copy .env.example .env
(املأ .env)
npm run db:init
npm run admin:create
npm start
```

ثم افتح `http://localhost:3000`. استخدم المدير الذي أنشأته لإضافة موظفي الأقسام، أو سجّل حسابًا جديدًا كمبلِّغ.

## لغير التقنيين

- **ما هو؟** موقع ترفع منه بلاغًا عن أي عطل في الجامعة (مكيف، إضاءة، تسريب، كرسي مكسور...) مع صورة.
- **ماذا يحدث بعدها؟** يصل البلاغ تلقائيًا للقسم المختص، وتتابع حالته: مفتوح، ثم قيد المعالجة، ثم مغلق مع ملاحظة الحل.
- **من يرى بلاغي؟** أنت، وموظفو القسم المختص، ومدير النظام فقط.
- **هل أحتاج تطبيقًا؟** لا، يعمل من المتصفح على الحاسب والجوال.

## للمطورين

- ابدأ من `server/app.js` لفهم ترتيب الطبقات، ثم `server/routes/reports.js` لأنه قلب النظام.
- الصلاحيات في مكانين: `requireRole` و`canAccess` للـ API، و`ROLE_PAGES` للصفحات.
- كل استعلام بمعاملات `?`، وكل خطأ متوقع `HttpError(status, message, field)`.
- الواجهة كلها تحت `window.FP`، وكل طلب عبر `FP.api`.
- لا اختبارات آلية حاليًا؛ قائمة التحقق اليدوي: التسجيل والدخول، إنشاء بلاغ بصورة، ظهوره في قائمة القسم الصحيح فقط، تغيير الحالة والإغلاق، منع مبلِّغ من فتح بلاغ غيره، وتطابق أرقام لوحة التحكم مع قاعدة البيانات.