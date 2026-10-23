const express = require('express');
const db = require('../db');
const v = require('../utils/validators');
const storage = require('../services/storage');
const { classify, PRIORITIES } = require('../services/classification');
const { HttpError } = require('../middleware/errors');
const { requireAuth, requireRole } = require('../middleware/auth');
const { reportImages, detectImageType } = require('../middleware/upload');

const router = express.Router();
const NOT_FOUND = 'البلاغ غير موجود';
const TRANSITIONS = { OPEN: ['IN_PROGRESS', 'CLOSED'], IN_PROGRESS: ['CLOSED'], CLOSED: [] };

const BASE_FROM = `FROM report r
  JOIN category c ON c.category_id = r.category_id
  JOIN location l ON l.location_id = r.location_id
  JOIN building b ON b.building_id = l.building_id
  JOIN department d ON d.department_id = r.department_id
  JOIN user u ON u.user_id = r.reporter_id`;

// المبلِّغ يرى بلاغاته، والموظف بلاغات قسمه، والمدير الجميع
function canAccess(user, report) {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'REPORTER') return report.reporter_id === user.id;
  return user.role === 'STAFF' && report.department_id === user.department_id;
}

// شروط الفلترة المشتركة لكل قوائم البلاغات
function reportFilters(q) {
  const conds = [];
  const params = [];
  if (q.status) {
    conds.push('r.status = ?');
    params.push(v.oneOf(q.status, v.STATUSES, 'status', 'الحالة'));
  }
  for (const [key, column] of [['category_id', 'r.category_id'], ['building_id', 'l.building_id'], ['department_id', 'r.department_id']]) {
    if (!q[key]) continue;
    conds.push(`${column} = ?`);
    params.push(v.id(q[key], key, 'الفلتر'));
  }
  const from = v.date(q.from, 'from', 'تاريخ البداية');
  const to = v.date(q.to, 'to', 'تاريخ النهاية');
  if (from) {
    conds.push('r.created_at >= ?');
    params.push(from);
  }
  if (to) {
    conds.push('r.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(to);
  }
  const term = typeof q.q === 'string' ? q.q.trim().slice(0, 100) : '';
  if (term) {
    conds.push('(r.description LIKE ? OR u.full_name LIKE ? OR u.university_id = ? OR r.report_id = ?)');
    params.push(v.like(term), v.like(term), term, /^\d+$/.test(term) ? Number(term) : 0);
  }
  return { conds, params };
}

// قائمة مرقّمة من جهة الخادم بعدد إجمالي وصفحة حالية
async function listReports(conds, params, pg, order = 'r.created_at DESC') {
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const [{ total }] = await db.query(`SELECT COUNT(*) AS total ${BASE_FROM} ${where}`, params);
  const items = await db.query(
    `SELECT r.report_id, r.status, r.priority, r.created_at, r.closed_at, LEFT(r.description, 140) AS summary,
     c.name AS category, b.name AS building, l.floor, l.room_name, d.name AS department, u.full_name AS reporter
     ${BASE_FROM} ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, pg.pageSize, pg.offset]
  );
  return { items, total, page: pg.page, pageSize: pg.pageSize };
}

// إنشاء البلاغ: التصنيف والتوجيه ثم إدراج البلاغ والصور وأول سجل حالة داخل معاملة واحدة
router.post('/', requireRole('REPORTER'), reportImages, async (req, res) => {
  const b = req.body || {};
  const categoryId = v.id(b.category_id, 'category_id', 'التصنيف');
  const priority = v.oneOf(b.priority || 'LOW', PRIORITIES, 'priority', 'الأولوية');
  const description = v.text(b.description, 'description', 'وصف المشكلة', { min: 5, max: 1000 });
  const locationId = v.id(b.location_id, 'location_id', 'الدور أو الغرفة');
  let latitude = v.coord(b.latitude, 'latitude', -90, 90);
  let longitude = v.coord(b.longitude, 'longitude', -180, 180);
  const files = req.files || [];
  if (!files.length) throw new HttpError(400, 'أرفق صورة واحدة على الأقل للمشكلة', 'images');
  const images = files.map((file) => {
    const ext = detectImageType(file.buffer);
    if (!ext) throw new HttpError(400, 'يُسمح بصور JPEG أو PNG فقط', 'images');
    return { buffer: file.buffer, ext };
  });
  const [location] = await db.query('SELECT l.location_id, b.latitude, b.longitude FROM location l JOIN building b ON b.building_id = l.building_id WHERE l.location_id = ?', [locationId]);
  if (!location) throw new HttpError(400, 'الموقع المختار غير موجود', 'location_id');
  if (latitude === null || longitude === null) {
    latitude = location.latitude;
    longitude = location.longitude;
  }
  const saved = [];
  try {
    const reportId = await db.transaction(async (tx) => {
      const route = await classify(tx.query, categoryId, priority);
      const result = await tx.query(
        "INSERT INTO report (reporter_id, category_id, location_id, department_id, description, priority, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)",
        [req.user.id, categoryId, locationId, route.departmentId, description, route.priority, latitude, longitude]
      );
      for (const image of images) {
        const name = await storage.save(image.buffer, image.ext);
        saved.push(name);
        await tx.query('INSERT INTO report_image (report_id, storage_url) VALUES (?, ?)', [result.insertId, name]);
      }
      await tx.query("INSERT INTO status_history (report_id, changed_by, old_status, new_status, note) VALUES (?, ?, NULL, 'OPEN', ?)", [result.insertId, req.user.id, 'تم استلام البلاغ']);
      return result.insertId;
    });
    res.status(201).json({ report_id: reportId, status: 'OPEN' });
  } catch (err) {
    await Promise.all(saved.map((name) => storage.remove(name).catch(() => {})));
    throw err;
  }
});

router.get('/mine', requireRole('REPORTER'), async (req, res) => {
  const { conds, params } = reportFilters(req.query);
  conds.unshift('r.reporter_id = ?');
  params.unshift(req.user.id);
  const data = await listReports(conds, params, v.pagination(req.query));
  const counts = await db.query('SELECT status, COUNT(*) AS n FROM report WHERE reporter_id = ? GROUP BY status', [req.user.id]);
  res.json({ ...data, counts: Object.fromEntries(v.STATUSES.map((s) => [s, (counts.find((c) => c.status === s) || { n: 0 }).n])) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, NOT_FOUND);
  const [r] = await db.query(
    `SELECT r.report_id, r.reporter_id, r.department_id, r.description, r.priority, r.status, r.latitude, r.longitude, r.created_at, r.closed_at,
     c.name AS category, b.name AS building, b.code AS building_code, l.floor, l.room_name, d.name AS department,
     u.full_name AS reporter, u.university_id AS reporter_uid, a.full_name AS assignee
     ${BASE_FROM} LEFT JOIN user a ON a.user_id = r.assigned_to WHERE r.report_id = ?`,
    [id]
  );
  if (!r || !canAccess(req.user, r)) throw new HttpError(404, NOT_FOUND);
  const images = await db.query('SELECT image_id, uploaded_at FROM report_image WHERE report_id = ? ORDER BY image_id', [id]);
  const history = await db.query(
    `SELECT h.old_status, h.new_status, h.note, h.changed_at, u.full_name AS changed_by_name
     FROM status_history h JOIN user u ON u.user_id = h.changed_by WHERE h.report_id = ? ORDER BY h.changed_at, h.history_id`,
    [id]
  );
  delete r.reporter_id;
  res.json({ report: r, images, history });
});

// تغيير الحالة أو إضافة ملاحظة من موظف القسم المسؤول، مع سجل في status_history
router.post('/:id/status', requireRole('STAFF'), async (req, res) => {
  const id = v.id(req.params.id, 'id', 'البلاغ');
  const b = req.body || {};
  const status = v.oneOf(b.status, v.STATUSES, 'status', 'الحالة');
  const note = v.text(b.note, 'note', 'الملاحظة', { max: 1000, required: false });
  if (status === 'CLOSED' && !note) throw new HttpError(400, 'اكتب ملاحظة الحل قبل إغلاق البلاغ', 'note');
  await db.transaction(async (tx) => {
    const [r] = await tx.query('SELECT status, department_id, assigned_to FROM report WHERE report_id = ? FOR UPDATE', [id]);
    if (!r || r.department_id !== req.user.department_id) throw new HttpError(404, NOT_FOUND);
    if (r.status === 'CLOSED') throw new HttpError(409, 'البلاغ مغلق ولا يمكن تعديله');
    const same = status === r.status;
    if (same && !note) throw new HttpError(400, 'اكتب الملاحظة المراد إضافتها إلى سجل البلاغ', 'note');
    if (!same && !TRANSITIONS[r.status].includes(status)) throw new HttpError(409, 'لا يمكن نقل البلاغ إلى هذه الحالة');
    const assignedTo = !same && !r.assigned_to ? req.user.id : r.assigned_to;
    await tx.query("UPDATE report SET status = ?, assigned_to = ?, closed_at = IF(? = 'CLOSED', NOW(), NULL) WHERE report_id = ?", [status, assignedTo, status, id]);
    await tx.query('INSERT INTO status_history (report_id, changed_by, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)', [id, req.user.id, r.status, status, note]);
  });
  res.json({ ok: true, status });
});

module.exports = router;
module.exports.canAccess = canAccess;
module.exports.reportFilters = reportFilters;
module.exports.listReports = listReports;