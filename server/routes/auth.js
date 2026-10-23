const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const v = require('../utils/validators');
const { HttpError } = require('../middleware/errors');
const { ROLE_HOME, createSession, destroySession, requireAuth } = require('../middleware/auth');
const { loginKey, ipLoginKey, isLoginBlocked, isIpLoginBlocked, recordLogin } = require('../middleware/rateLimit');

const router = express.Router();
const BCRYPT_COST = 12;
const LOGIN_FAILED = 'بيانات الدخول غير صحيحة';
const DUMMY_HASH = bcrypt.hashSync('fixpoint-timing-guard', BCRYPT_COST);

// التسجيل الذاتي ينشئ حساب مبلِّغ فقط
router.post('/register', async (req, res) => {
  const b = req.body || {};
  const fullName = v.text(b.full_name, 'full_name', 'الاسم الكامل', { min: 3, max: 100 });
  const universityId = v.universityId(b.university_id);
  const email = v.email(b.email);
  const password = v.password(b.password);
  const hash = await bcrypt.hash(password, BCRYPT_COST);
  let result;
  try { result = await db.query("INSERT INTO user (university_id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'REPORTER')", [universityId, fullName, email, hash]); } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'الرقم الجامعي أو البريد الإلكتروني مسجل مسبقاً', /email/.test(err.message) ? 'email' : 'university_id');
    throw err;
  }
  await createSession(res, result.insertId);
  res.status(201).json({ redirect: ROLE_HOME.REPORTER });
});

// الدخول بالرقم الجامعي أو البريد في نفس الحقل، برسالة فشل عامة وحد للمحاولات
router.post('/login', async (req, res) => {
  const b = req.body || {};
  const identifier = typeof b.identifier === 'string' ? b.identifier.trim() : '';
  const password = typeof b.password === 'string' ? b.password : '';
  if (!identifier) throw new HttpError(400, 'أدخل الرقم الجامعي أو البريد الإلكتروني', 'identifier');
  if (!password) throw new HttpError(400, 'أدخل كلمة السر', 'password');
  if (identifier.length > 120 || password.length > 128) throw new HttpError(401, LOGIN_FAILED);
  const key = loginKey(identifier, req.ip);
  const ipKey = ipLoginKey(req.ip);
  const blocked = await isLoginBlocked(key) || await isIpLoginBlocked(ipKey);
  const [user] = await db.query('SELECT user_id, role, password_hash FROM user WHERE university_id = ? OR email = ? LIMIT 1', [identifier, identifier.toLowerCase()]);
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  await recordLogin(key, ipKey, Boolean(user && ok));
  if (!user || !ok) {
    if (blocked) throw new HttpError(429, 'تم إيقاف تسجيل الدخول مؤقتاً بسبب محاولات متكررة، حاول بعد 15 دقيقة');
    throw new HttpError(401, LOGIN_FAILED);
  }
  if (req.sessionId) await destroySession(req, res);
  await createSession(res, user.user_id);
  res.json({ redirect: ROLE_HOME[user.role] });
});

router.post('/logout', requireAuth, async (req, res) => {
  await destroySession(req, res);
  res.json({ redirect: '/' });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user, csrf: req.csrfToken, home: ROLE_HOME[req.user.role] }));

// تغيير كلمة السر يتطلب الحالية، ويُنهي الجلسات الأخرى للمستخدم
router.post('/password', requireAuth, async (req, res) => {
  const b = req.body || {};
  const newPassword = v.password(b.new_password, 'new_password');
  const [user] = await db.query('SELECT password_hash FROM user WHERE user_id = ?', [req.user.id]);
  if (typeof b.current_password !== 'string' || !(await bcrypt.compare(b.current_password, user.password_hash))) throw new HttpError(400, 'كلمة السر الحالية غير صحيحة', 'current_password');
  await db.query('UPDATE user SET password_hash = ? WHERE user_id = ?', [await bcrypt.hash(newPassword, BCRYPT_COST), req.user.id]);
  await db.query('DELETE FROM session WHERE user_id = ? AND session_id <> ?', [req.user.id, req.sessionId]);
  res.json({ ok: true });
});

module.exports = router;