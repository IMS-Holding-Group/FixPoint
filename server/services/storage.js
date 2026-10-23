const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'storage', 'uploads');
const NAME_PATTERN = /^[a-f0-9]{32}\.(jpg|png)$/;

// اسم الملف يُقبل فقط بالصيغة المولَّدة داخلياً، فلا يمكن تمرير مسار نسبي مثل ../
function resolve(name) {
  if (typeof name !== 'string' || !NAME_PATTERN.test(name)) throw new Error('اسم ملف غير صالح');
  return path.join(UPLOAD_DIR, name);
}

// يحفظ المحتوى باسم عشوائي ويعيد الاسم المخزَّن في report_image.storage_url
async function save(buffer, ext) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  await fs.writeFile(resolve(name), buffer, { flag: 'wx' });
  return name;
}

async function read(name) { return fs.readFile(resolve(name)); }

async function remove(name) {
  try { await fs.unlink(resolve(name)); } catch (err) { if (err.code !== 'ENOENT') throw err; }
}

module.exports = { save, read, remove };