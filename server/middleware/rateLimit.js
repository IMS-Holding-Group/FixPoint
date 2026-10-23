const crypto = require('crypto');
const config = require('../config');
const db = require('../db');
const { HttpError } = require('./errors');

const WINDOW_MS = 15 * 60 * 1000;
const API_MAX = 600;
const AUTH_MAX = 30;
const LOGIN_MAX_FAILS = 5;
const IP_LOGIN_MAX_FAILS = 20;
const LOGIN_WINDOW_MINUTES = 15;

const stores = new Set();

// ponytail: عداد في ذاكرة عملية واحدة؛ عند التشغيل على أكثر من نسخة يُنقل إلى مخزن مشترك
function limiter(max) {
  const hits = new Map();
  stores.add(hits);
  return (req, res, next) => {
    const now = Date.now();
    let entry = hits.get(req.ip);
    if (!entry || entry.reset < now) {
      entry = { count: 0, reset: now + WINDOW_MS };
      hits.set(req.ip, entry);
    }
    entry.count += 1;
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.set('RateLimit-Reset', String(Math.ceil(entry.reset / 1000)));
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      return next(new HttpError(429, 'عدد الطلبات كبير، حاول بعد قليل'));
    }
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const hits of stores) for (const [ip, entry] of hits) if (entry.reset < now) hits.delete(ip);
}, WINDOW_MS).unref();

// مفتاح المحاولة: hash للمعرّف المدخل مع عنوان IP
const loginKey = (identifier, ip) => crypto.createHmac('sha256', config.sessionSecret).update(`${identifier.toLowerCase()}|${ip}`).digest('hex');
const ipLoginKey = (ip) => crypto.createHmac('sha256', config.sessionSecret).update(`ip|${ip}`).digest('hex');

// محظور إذا تجاوزت المحاولات الفاشلة 5 خلال 15 دقيقة بعد آخر دخول ناجح
async function isLoginBlocked(key) {
  const [row] = await db.query(
    `SELECT COUNT(*) AS fails FROM login_attempt
     WHERE login_key = ? AND succeeded = 0 AND attempted_at > NOW() - INTERVAL ? MINUTE
     AND attempted_at > COALESCE((SELECT MAX(attempted_at) FROM login_attempt WHERE login_key = ? AND succeeded = 1), '1970-01-01')`,
    [key, LOGIN_WINDOW_MINUTES, key]
  );
  return row.fails >= LOGIN_MAX_FAILS;
}

// حد مستقل للعنوان يمنع تجاوز الحماية بتجربة معرفات مختلفة
async function isIpLoginBlocked(key) {
  const [row] = await db.query(
    'SELECT COUNT(*) AS fails FROM login_attempt WHERE login_key = ? AND succeeded = 0 AND attempted_at > NOW() - INTERVAL ? MINUTE',
    [key, LOGIN_WINDOW_MINUTES]
  );
  return row.fails >= IP_LOGIN_MAX_FAILS;
}

async function recordLogin(key, ipKey, succeeded) {
  if (succeeded) {
    await db.query('INSERT INTO login_attempt (login_key, succeeded) VALUES (?, 1)', [key]);
    return;
  }
  await db.query('INSERT INTO login_attempt (login_key, succeeded) VALUES (?, 0), (?, 0)', [key, ipKey]);
}

module.exports = {
  apiLimiter: limiter(API_MAX),
  authLimiter: limiter(AUTH_MAX),
  loginKey,
  ipLoginKey,
  isLoginBlocked,
  isIpLoginBlocked,
  recordLogin
};