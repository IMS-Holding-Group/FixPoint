const readline = require('readline/promises');
const bcrypt = require('bcryptjs');
const db = require('../server/db');
const v = require('../server/utils/validators');

const BCRYPT_COST = 12;

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    if (!input.isTTY || typeof input.setRawMode !== 'function') {
      reject(new Error('إنشاء المدير يتطلب طرفية تفاعلية آمنة'));
      return;
    }
    let value = '';
    const finish = () => {
      input.removeListener('data', onData);
      input.setRawMode(false);
      input.pause();
      output.write('\n');
      resolve(value);
    };
    const onData = (char) => {
      if (char === '\u0003') {
        input.setRawMode(false);
        output.write('\n');
        process.exit(130);
      }
      if (char === '\r' || char === '\n') {
        finish();
        return;
      }
      if (char === '\u007f' || char === '\b') {
        if (value) {
          value = value.slice(0, -1);
          output.write('\b \b');
        }
        return;
      }
      if (char >= ' ') {
        value += char;
        output.write('*');
      }
    };
    output.write(label);
    input.setEncoding('utf8');
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}

async function main() {
  const [{ n }] = await db.query("SELECT COUNT(*) AS n FROM user WHERE role = 'ADMIN'");
  if (n > 0) throw new Error('يوجد حساب مدير بالفعل؛ أنشئ المديرين الإضافيين من لوحة الإدارة');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let answers;
  try {
    answers = {
      fullName: await rl.question('الاسم الكامل: '),
      universityId: await rl.question('اسم المستخدم أو الرقم الجامعي: '),
      email: await rl.question('البريد الإلكتروني: ')
    };
  } finally { rl.close(); }
  const fullName = v.text(answers.fullName, 'full_name', 'الاسم الكامل', { min: 3, max: 100 });
  const universityId = v.universityId(answers.universityId);
  const email = v.email(answers.email);
  const password = v.password(await hiddenPrompt('كلمة السر: '));
  const confirmation = await hiddenPrompt('تأكيد كلمة السر: ');
  if (password !== confirmation) throw new Error('كلمتا السر غير متطابقتين');
  await db.query(
    "INSERT INTO user (university_id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'ADMIN')",
    [universityId, fullName, email, await bcrypt.hash(password, BCRYPT_COST)]
  );
  console.log('تم إنشاء حساب المدير بنجاح.');
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
