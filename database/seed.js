const DEPARTMENTS = [
  ['قسم التكييف والتبريد', 'ac@example.com'],
  ['قسم الكهرباء والإنارة', 'electric@example.com'],
  ['قسم السباكة والمياه', 'plumbing@example.com'],
  ['قسم الأثاث والنجارة', 'furniture@example.com'],
  ['قسم الأجهزة والمعدات', 'devices@example.com'],
  ['قسم الصيانة العامة', 'general@example.com']
];

const CATEGORIES = [
  ['تكييف', 'قسم التكييف والتبريد', 'HIGH'],
  ['إنارة', 'قسم الكهرباء والإنارة', 'MEDIUM'],
  ['أعطال كهربائية خطرة', 'قسم الكهرباء والإنارة', 'URGENT'],
  ['دورات المياه والتسربات', 'قسم السباكة والمياه', 'HIGH'],
  ['أثاث', 'قسم الأثاث والنجارة', 'LOW'],
  ['أجهزة ومعدات', 'قسم الأجهزة والمعدات', 'MEDIUM'],
  ['أخرى', 'قسم الصيانة العامة', 'LOW']
];

const BUILDINGS = [
  ['A', 'المبنى أ', 30.916850, 41.063120, [['الدور الأرضي', 'قاعة 101'], ['الدور الأول', 'قاعة 112'], ['الدور الثاني', 'قاعة 205'], ['الدور الأرضي', 'دورات المياه']]],
  ['B', 'المبنى ب', 30.917420, 41.064580, [['الدور الأرضي', 'قاعة 103'], ['الدور الأول', 'قاعة 118'], ['الدور الثاني', 'مختبر الحاسب'], ['الدور الأرضي', 'دورات المياه'], ['الدور الأول', 'مكاتب أعضاء هيئة التدريس']]],
  ['C', 'المبنى ج', 30.915980, 41.065230, [['الدور الأرضي', 'قاعة 104'], ['الدور الأول', 'قاعة 115'], ['الدور الأرضي', 'دورات المياه']]],
  ['LIB', 'المكتبة المركزية', 30.917830, 41.062470, [['الدور الأرضي', 'قاعة الاطلاع'], ['الدور الأول', 'قسم الدوريات'], ['الدور الأول', 'غرف البحث'], ['الدور الأرضي', 'دورات المياه']]],
  ['LAB', 'المختبرات', 30.915510, 41.063990, [['الدور الأرضي', 'مختبر الفيزياء'], ['الدور الأول', 'مختبر الكيمياء'], ['الدور الثاني', 'مختبر الحاسب'], ['الدور الأرضي', 'دورات المياه']]]
];

// يُدخل البيانات المرجعية فقط، دون حسابات أو كلمات سر أو بلاغات تجريبية
async function seed(q) {
  const [{ n }] = await q('SELECT COUNT(*) AS n FROM department');
  if (n > 0) return false;

  const deptIds = {};
  for (const [name, email] of DEPARTMENTS) deptIds[name] = (await q('INSERT INTO department (name, contact_email) VALUES (?, ?)', [name, email])).insertId;

  for (const [name, dept, priority] of CATEGORIES) {
    await q('INSERT INTO category (department_id, name, default_priority) VALUES (?, ?, ?)', [deptIds[dept], name, priority]);
  }

  for (const [code, name, lat, lng, rooms] of BUILDINGS) {
    const buildingId = (await q('INSERT INTO building (code, name, latitude, longitude) VALUES (?, ?, ?, ?)', [code, name, lat, lng])).insertId;
    for (const [floor, room] of rooms) await q('INSERT INTO location (building_id, floor, room_name) VALUES (?, ?, ?)', [buildingId, floor, room]);
  }
  return true;
}

module.exports = { seed };