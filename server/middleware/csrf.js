const crypto = require('crypto');
const config = require('../config');
const { HttpError } = require('./errors');

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const EXEMPT = ['/auth/login', '/auth/register'];

function sameOrigin(req, origin) {
  try { return new URL(origin).host === req.get('host'); } catch { return false; }
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// كل طلب يغيّر البيانات يتطلب ترويسة X-CSRF-Token مطابقة لرمز الجلسة
module.exports = function csrf(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !sameOrigin(req, origin) && !config.allowedOrigins.includes(origin)) return next(new HttpError(403, 'طلب غير مسموح'));
  if (EXEMPT.includes(req.path)) return next();
  if (!req.user) return next(new HttpError(401, 'انتهت الجلسة، سجّل الدخول مرة أخرى'));
  if (!safeEqual(req.get('x-csrf-token') || '', req.csrfToken)) return next(new HttpError(403, 'انتهت صلاحية الصفحة، أعد تحميلها وحاول مرة أخرى'));
  next();
};