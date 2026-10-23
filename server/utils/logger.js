const fs = require('fs');
const path = require('path');
const { formatText } = require('./datetime');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'error.log');

fs.mkdirSync(LOG_DIR, { recursive: true });

// يسجل الخطأ مع المسار والطريقة فقط، دون محتوى الطلب أو كلمات السر أو الرموز
function error(err, req) {
  const where = req ? ` ${req.method} ${req.path}` : '';
  const line = `[${formatText(new Date())}]${where} ${err && err.stack ? err.stack : String(err)}\n`;
  fs.appendFile(LOG_FILE, line, () => {});
  if (process.env.NODE_ENV !== 'production') console.error(line.trim());
}

module.exports = { error };