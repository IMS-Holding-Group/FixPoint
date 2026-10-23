const { HttpError } = require('../middleware/errors');

const STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
const ROLES = ['REPORTER', 'STAFF', 'ADMIN'];

const fail = (message, field) => { throw new HttpError(400, message, field); };

// نص مع إزالة المسافات الطرفية والتحقق من الطول
function text(value, field, label, { min = 1, max = 255, required = true } = {}) {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) {
    if (required) fail(`حقل ${label} مطلوب`, field);
    return null;
  }
  if (v.length < min || v.length > max) fail(`حقل ${label} يجب أن يكون بين ${min} و ${max} حرفاً`, field);
  return v;
}

// معرّف رقمي صحيح موجب
function id(value, field, label, required = true) {
  if (value === undefined || value === null || value === '') {
    if (required) fail(`اختر ${label}`, field);
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) fail(`قيمة ${label} غير صالحة`, field);
  return n;
}

function email(value, field = 'email') {
  const v = text(value, field, 'البريد الإلكتروني', { max: 120 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) fail('صيغة البريد الإلكتروني غير صحيحة', field);
  return v;
}

function universityId(value, field = 'university_id') {
  const v = text(value, field, 'الرقم الجامعي', { max: 20 });
  if (!/^[A-Za-z0-9.]{1,20}$/.test(v)) fail('الرقم الجامعي يقبل الحروف الإنجليزية والأرقام والنقطة فقط، حتى 20 خانة', field);
  return v;
}

function password(value, field = 'password') {
  const ok = typeof value === 'string' && value.length >= 8 && value.length <= 72 && /[A-Za-z\u0600-\u06FF]/.test(value) && /\d/.test(value);
  if (!ok) fail('كلمة السر يجب أن تكون 8 خانات على الأقل وتتضمن حرفاً ورقماً', field);
  return value;
}

function oneOf(value, list, field, label) {
  if (!list.includes(value)) fail(`قيمة ${label} غير صالحة`, field);
  return value;
}

function coord(value, field, min, max, required = false) {
  if (value === undefined || value === null || value === '') {
    if (required) fail('حدد الموقع على الخريطة', field);
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) fail('إحداثيات الموقع غير صالحة', field);
  return Math.round(n * 1e6) / 1e6;
}

function date(value, field, label, required = false) {
  if (!value) {
    if (required) fail(`حدد ${label}`, field);
    return null;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) fail(`${label} غير صالح`, field);
  return value;
}

// ترقيم الصفحات من جهة الخادم: الافتراضي 10 والأقصى 50
function pagination(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(q.pageSize, 10) || 10));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

// نص بحث آمن لعبارة LIKE بعد تعطيل الرموز الخاصة
const like = (term) => `%${term.replace(/[\\%_]/g, '\\$&')}%`;

module.exports = { STATUSES, ROLES, text, id, email, universityId, password, oneOf, coord, date, pagination, like };