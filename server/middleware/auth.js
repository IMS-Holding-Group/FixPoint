const crypto = require('crypto');
const path = require('path');
const config = require('../config');
const db = require('../db');
const { HttpError } = require('./errors');

const COOKIE = 'fp_sid';
const IDLE_MINUTES = 30;
const MAX_HOURS = 8;
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

const ROLE_HOME = { REPORTER: '/home.html', STAFF: '/queue.html', ADMIN: '/dashboard.html' };

const PUBLIC_PAGES = ['index.html', 'register.html'];

const ROLE_PAGES = {
  'home.html': ['REPORTER'],
  'new-report.html': ['REPORTER'],
  'my-reports.html': ['REPORTER'],
  'report.html': ['REPORTER', 'ADMIN'],
  'profile.html': ['REPORTER', 'STAFF', 'ADMIN'],
  'queue.html': ['STAFF'],
  'staff-report.html': ['STAFF'],
  'closed.html': ['STAFF'],
  'dashboard.html': ['ADMIN'],
  'admin-reports.html': ['ADMIN'],
  'users.html': ['ADMIN'],
  'buildings.html': ['ADMIN'],
  'categories.html': ['ADMIN'],
  'departments.html': ['ADMIN'],
  'print-status.html': ['ADMIN'],
  'print-analysis.html': ['ADMIN']
};

// يُخزَّن في قاعدة البيانات hash لمعرّف الجلسة وليس القيمة الخام
const hashToken = (raw) => crypto.createHmac('sha256', config.sessionSecret).update(raw).digest('hex');

const cookieOptions = () => ({ httpOnly: true, secure: config.isProd, sameSite: 'strict', path: '/' });

async function createSession(res, userId) {
  const raw = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(32).toString('hex');
  await db.query('INSERT INTO session (session_id, user_id, csrf_token, expires_at) VALUES (?, ?, ?, NOW() + INTERVAL ? HOUR)', [hashToken(raw), userId, csrf, MAX_HOURS]);
  res.cookie(COOKIE, raw, { ...cookieOptions(), maxAge: MAX_HOURS * 60 * 60 * 1000 });
}

async function destroySession(req, res) {
  if (req.sessionId) await db.query('DELETE FROM session WHERE session_id = ?', [req.sessionId]);
  res.clearCookie(COOKIE, cookieOptions());
}

// يقرأ الجلسة من الكوكي ويرفضها عند تجاوز 30 دقيقة خمول أو 8 ساعات كحد أقصى
async function loadSession(req, res, next) {
  req.user = null;
  const raw = req.cookies[COOKIE];
  if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return next();
  const sid = hashToken(raw);
  const rows = await db.query(
    `SELECT s.csrf_token, u.user_id, u.role, u.department_id, u.full_name, u.university_id, u.email, d.name AS department_name
     FROM session s JOIN user u ON u.user_id = s.user_id LEFT JOIN department d ON d.department_id = u.department_id
     WHERE s.session_id = ? AND s.expires_at > NOW() AND s.last_seen_at > NOW() - INTERVAL ? MINUTE`,
    [sid, IDLE_MINUTES]
  );
  if (!rows.length) {
    res.clearCookie(COOKIE, cookieOptions());
    return next();
  }
  await db.query('UPDATE session SET last_seen_at = NOW() WHERE session_id = ?', [sid]);
  const u = rows[0];
  req.user = { id: u.user_id, role: u.role, department_id: u.department_id, department_name: u.department_name, full_name: u.full_name, university_id: u.university_id, email: u.email };
  req.sessionId = sid;
  req.csrfToken = u.csrf_token;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return next(new HttpError(401, 'انتهت الجلسة، سجّل الدخول مرة أخرى'));
  next();
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new HttpError(401, 'انتهت الجلسة، سجّل الدخول مرة أخرى'));
  if (!roles.includes(req.user.role)) return next(new HttpError(403, 'غير مصرح لك بهذا الإجراء'));
  next();
};

// يسلّم صفحات HTML بعد التحقق من الجلسة والدور في الخادم
function pageGuard(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next(new HttpError(404, 'غير موجود'));
  const name = req.path === '/' ? 'index.html' : req.path.slice(1);
  res.set('Cache-Control', 'no-store');
  if (PUBLIC_PAGES.includes(name)) {
    if (req.user) return res.redirect(ROLE_HOME[req.user.role]);
    return res.sendFile(path.join(PUBLIC_DIR, name));
  }
  const roles = ROLE_PAGES[name];
  if (!roles) return next(new HttpError(404, 'غير موجود'));
  if (!req.user) return res.redirect('/');
  if (!roles.includes(req.user.role)) return res.redirect(ROLE_HOME[req.user.role]);
  res.sendFile(path.join(PUBLIC_DIR, name));
}

module.exports = { ROLE_HOME, hashToken, createSession, destroySession, loadSession, requireAuth, requireRole, pageGuard };