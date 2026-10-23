const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2');
const db = require('../db');
const logger = require('../utils/logger');
const { formatText, fileStamp } = require('../utils/datetime');

const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');
const KEEP = 7;
const TABLES = ['department', 'user', 'category', 'building', 'location', 'report', 'report_image', 'status_history'];
const CHUNK = 200;

// ponytail: يبني النسخة كاملة في الذاكرة، مناسب لحجم بيانات جامعة واحدة؛ للأحجام الكبيرة يُستبدل بكتابة متدفقة
async function runBackup() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `fixpoint-${fileStamp()}.sql`);
  if (await fs.stat(file).catch(() => null)) return;
  const out = [`-- FixPoint backup ${formatText(new Date())}`, 'SET NAMES utf8mb4;', "SET time_zone = '+03:00';", 'SET FOREIGN_KEY_CHECKS = 0;'];
  for (const table of TABLES) {
    const [[create]] = await db.pool.query('SHOW CREATE TABLE ??', [table]);
    out.push(`DROP TABLE IF EXISTS \`${table}\`;`, `${create['Create Table']};`);
    const [rows] = await db.pool.query('SELECT * FROM ??', [table]);
    for (let i = 0; i < rows.length; i += CHUNK) out.push(`${mysql.format('INSERT INTO ?? VALUES ?', [table, rows.slice(i, i + CHUNK).map(Object.values)], false, '+03:00')};`);
  }
  out.push('SET FOREIGN_KEY_CHECKS = 1;');
  await fs.writeFile(`${file}.tmp`, `${out.join('\n')}\n`, { mode: 0o600 });
  await fs.rename(`${file}.tmp`, file);
  await prune();
}

// يحتفظ بآخر 7 نسخ ويحذف الأقدم
async function prune() {
  const files = (await fs.readdir(BACKUP_DIR)).filter((name) => /^fixpoint-\d{4}-\d{2}-\d{2}\.sql$/.test(name)).sort();
  for (const name of files.slice(0, Math.max(0, files.length - KEEP))) await fs.unlink(path.join(BACKUP_DIR, name));
}

// يُفحص كل ساعة، وتُنشأ نسخة واحدة لكل يوم، وأي خطأ يُسجَّل دون إيقاف الخادم
function schedule() {
  const tick = () => runBackup().catch((err) => logger.error(err));
  tick();
  setInterval(tick, 60 * 60 * 1000).unref();
}

module.exports = { runBackup, schedule };