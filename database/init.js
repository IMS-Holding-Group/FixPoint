const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../server/config');
const { seed } = require('./seed');

config.check(['DB_ADMIN_USER', 'DB_ADMIN_PASSWORD'], ['DB_ADMIN_PASSWORD']);

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

// ينفذ بالترتيب: إنشاء القاعدة، المستخدم المحدود، الجداول، ثم البيانات الأولية. آمن عند التكرار
async function main() {
  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.dbAdmin.user,
    password: config.dbAdmin.password,
    multipleStatements: true,
    charset: 'utf8mb4',
    timezone: '+03:00',
    decimalNumbers: true
  });
  try {
    await conn.query("SET time_zone = '+03:00'");
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    if (config.db.user !== config.dbAdmin.user) {
      const hosts = LOCAL_HOSTS.includes(config.db.host) ? LOCAL_HOSTS : ['%'];
      for (const host of hosts) {
        await conn.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [config.db.user, host, config.db.password]);
        await conn.query('ALTER USER ?@? IDENTIFIED BY ?', [config.db.user, host, config.db.password]);
        await conn.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${config.db.name}\`.* TO ?@?`, [config.db.user, host]);
      }
    }
    await conn.query(`USE \`${config.db.name}\``);
    await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    await conn.beginTransaction();
    const created = await seed(async (sql, params = []) => (await conn.query(sql, params))[0]);
    await conn.commit();
    console.log(created ? 'تمت تهيئة قاعدة البيانات وإدخال البيانات الأولية بنجاح.' : 'قاعدة البيانات جاهزة، والبيانات الموجودة لم تُمس.');
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error(`تعذرت تهيئة قاعدة البيانات: ${err.message}`);
    process.exitCode = 1;
  } finally { await conn.end(); }
}

main().catch((err) => {
  console.error(`تعذر الاتصال بخادم MySQL بحساب المسؤول: ${err.message}`);
  process.exitCode = 1;
});