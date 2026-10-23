const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const REQUIRED = ['PORT', 'NODE_ENV', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'SESSION_SECRET'];
const NODE_ENVS = ['development', 'production'];

// يتحقق من وجود المتغيرات ويوقف التشغيل برسالة تسرد الأسماء الناقصة دون ذكر أي قيمة
function check(names, allowEmpty = []) {
  const missing = names.filter((name) => {
    const value = process.env[name];
    if (allowEmpty.includes(name)) return value === undefined;
    return !value || !value.trim();
  });
  if (missing.length) {
    console.error(`تعذر التشغيل: المتغيرات التالية ناقصة أو فارغة في ملف .env:\n- ${missing.join('\n- ')}\nانسخ ملف .env.example إلى .env واملأ القيم المطلوبة.`);
    process.exit(1);
  }
}

check(REQUIRED);

if (!NODE_ENVS.includes(process.env.NODE_ENV)) {
  console.error('تعذر التشغيل: قيمة NODE_ENV يجب أن تكون development أو production.');
  process.exit(1);
}

if (process.env.SESSION_SECRET.length < 64) {
  console.error('تعذر التشغيل: قيمة SESSION_SECRET قصيرة، يجب أن تكون 64 خانة على الأقل.');
  process.exit(1);
}

if (!/^[A-Za-z0-9_]+$/.test(process.env.DB_NAME)) {
  console.error('تعذر التشغيل: اسم قاعدة البيانات DB_NAME يقبل الحروف الإنجليزية والأرقام والشرطة السفلية فقط.');
  process.exit(1);
}

const port = Number(process.env.PORT);
const dbPort = Number(process.env.DB_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  console.error('تعذر التشغيل: PORT و DB_PORT يجب أن يكونا رقمين صحيحين بين 1 و 65535.');
  process.exit(1);
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production') {
  if (!allowedOrigins.length || allowedOrigins.some((origin) => {
    try {
      const url = new URL(origin);
      return url.protocol !== 'https:' || url.origin !== origin;
    } catch { return true; }
  })) {
    console.error('تعذر التشغيل: ALLOWED_ORIGINS مطلوب في الإنتاج ويجب أن يحتوي نطاقات HTTPS كاملة دون مسارات.');
    process.exit(1);
  }
}

module.exports = {
  check,
  port,
  isProd: process.env.NODE_ENV === 'production',
  db: {
    host: process.env.DB_HOST,
    port: dbPort,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  dbAdmin: {
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD || ''
  },
  sessionSecret: process.env.SESSION_SECRET,
  mapsKey: (process.env.GOOGLE_MAPS_API_KEY || '').trim(),
  allowedOrigins
};