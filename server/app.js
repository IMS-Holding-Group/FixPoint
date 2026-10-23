const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config');
const db = require('./db');
const logger = require('./utils/logger');
const backup = require('./services/backup');
const csrf = require('./middleware/csrf');
const security = require('./middleware/security');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');
const { loadSession, pageGuard } = require('./middleware/auth');
const { apiNotFound, errorHandler } = require('./middleware/errors');

const ROOT = path.join(__dirname, '..');
const app = express();

app.disable('x-powered-by');
if (config.isProd) app.set('trust proxy', 1);

app.use(security.httpsRedirect, security.headers, security.blockHidden);
app.use('/assets', express.static(path.join(ROOT, 'assets'), { dotfiles: 'deny', index: false, redirect: false, maxAge: config.isProd ? '1d' : 0 }));
app.use(cookieParser());

app.use('/api', security.cors, apiLimiter, express.json({ limit: '20kb' }), loadSession, csrf);
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/meta'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/images', require('./routes/images'));
app.use('/api/admin/print', require('./routes/print'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', apiNotFound);

app.get('/robots.txt', (req, res) => res.sendFile(path.join(ROOT, 'public', 'robots.txt')));
app.use(loadSession, pageGuard);
app.use(errorHandler);

// تنظيف الجلسات المنتهية وسجل محاولات الدخول القديمة كل ساعة
function cleanup() {
  db.query('DELETE FROM session WHERE expires_at < NOW() OR last_seen_at < NOW() - INTERVAL 30 MINUTE')
    .then(() => db.query('DELETE FROM login_attempt WHERE attempted_at < NOW() - INTERVAL 1 DAY'))
    .catch((err) => logger.error(err));
}

async function ensureSchema() {
  const existing = await db.query("SHOW TABLES LIKE 'department'");
  if (existing.length) return;
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    multipleStatements: true,
    charset: 'utf8mb4',
    timezone: '+03:00',
    decimalNumbers: true
  });
  try {
    await conn.query("SET time_zone = '+03:00'");
    await conn.query(fs.readFileSync(path.join(ROOT, 'database', 'schema.sql'), 'utf8'));
    const { seed } = require('../database/seed');
    await conn.beginTransaction();
    await seed(async (sql, params = []) => (await conn.query(sql, params))[0]);
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally { await conn.end(); }
}

async function ensureAdmin() {
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!password) return;
  const [{ n }] = await db.query("SELECT COUNT(*) AS n FROM user WHERE role = 'ADMIN'");
  if (n > 0) return;
  const bcrypt = require('bcryptjs');
  const v = require('./utils/validators');
  await db.query(
    "INSERT INTO user (university_id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'ADMIN')",
    ['admin', 'مدير النظام', 'admin@example.com', await bcrypt.hash(v.password(password), 12)]
  );
}

async function start() {
  try {
    await db.query('SELECT 1');
    await ensureSchema();
    await ensureAdmin();
  } catch (err) {
    logger.error(err);
    console.error('تعذر الاتصال بقاعدة البيانات. تأكد من تشغيل MySQL ومن صحة بيانات الاتصال في ملف .env، ومن تنفيذ الأمر npm run db:init.');
    process.exit(1);
  }
  app.listen(config.port, '0.0.0.0', () => console.log(`FixPoint يعمل على http://localhost:${config.port}`));
  cleanup();
  setInterval(cleanup, 60 * 60 * 1000).unref();
  backup.schedule();
}

start();