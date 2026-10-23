const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  charset: 'utf8mb4',
  timezone: '+03:00',
  decimalNumbers: true,
  connectionLimit: 10,
  waitForConnections: true
});

pool.pool.on('connection', (conn) => conn.query("SET time_zone = '+03:00'"));

// استعلام بمعاملات منفصلة (Parameterized) يعيد الصفوف أو نتيجة التنفيذ
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// ينفذ مجموعة استعلامات كوحدة واحدة: تُعتمد كلها أو تُلغى كلها
async function transaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work({ query: async (sql, params = []) => (await conn.query(sql, params))[0] });
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally { conn.release(); }
}

module.exports = { pool, query, transaction };