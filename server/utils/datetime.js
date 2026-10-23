const KSA_OFFSET_MS = 3 * 60 * 60 * 1000;

// يحوّل أي قيمة تاريخ إلى أجزاء بتوقيت المملكة بنظام 12 ساعة
function parts(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const ksa = new Date(date.getTime() + KSA_OFFSET_MS);
  const hour24 = ksa.getUTCHours();
  return {
    year: ksa.getUTCFullYear(),
    month: ksa.getUTCMonth() + 1,
    day: ksa.getUTCDate(),
    hour: hour24 % 12 || 12,
    minute: String(ksa.getUTCMinutes()).padStart(2, '0'),
    suffix: hour24 < 12 ? 'ص' : 'م'
  };
}

// الصيغة الموحدة: 2026/1/3م 5:50ص
function formatText(value, withTime = true) {
  const p = parts(value);
  if (!p) return '-';
  const date = `${p.year}/${p.month}/${p.day}م`;
  return withTime ? `${date} ${p.hour}:${p.minute}${p.suffix}` : date;
}

// ختم تاريخ لأسماء ملفات النسخ الاحتياطي بصيغة قابلة للترتيب أبجدياً
function fileStamp(value = new Date()) { return new Date(value.getTime() + KSA_OFFSET_MS).toISOString().slice(0, 10); }

// مدة بالثواني إلى نص عربي: 2 يوم و 5 ساعة و 10 دقيقة
function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '-';
  const total = Math.round(Number(seconds) / 60);
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const minutes = total % 60;
  return `${days} يوم و ${hours} ساعة و ${minutes} دقيقة`;
}

module.exports = { parts, formatText, fileStamp, formatDuration };