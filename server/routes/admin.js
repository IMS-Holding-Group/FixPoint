const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const v = require('../utils/validators');
const stats = require('../services/stats');
const { PRIORITIES } = require('../services/classification');
const { HttpError } = require('../middleware/errors');
const { requireRole } = require('../middleware/auth');
const { reportFilters, listReports } = require('./reports');

const router = express.Router();

router.use(requireRole('ADMIN'));

async function parseUser(b, isCreate) {
  const role = v.oneOf(b.role, v.ROLES, 'role', 'الدور');
  const data = {
    university_id: v.universityId(b.university_id),
    full_name: v.text(b.full_name, 'full_name', 'الاسم الكامل', { min: 3, max: 100 }),
    email: v.email(b.email),
    role,
    department_id: role === 'STAFF' ? v.id(b.department_id, 'department_id', 'القسم') : null
  };
  if (isCreate || b.password) data.password_hash = await bcrypt.hash(v.password(b.password), 12);
  return data;
}

// تعريف موحد لعمليات الإضافة والتعديل والحذف لكل كيان إداري
const ENTITIES = {
  departments: {
    table: 'department',
    key: 'department_id',
    select: 'SELECT department_id, name, contact_email FROM department',
    search: ['name', 'contact_email'],
    order: 'name',
    parse: async (b) => ({
      name: v.text(b.name, 'name', 'اسم القسم', { min: 2, max: 100 }),
      contact_email: b.contact_email ? v.email(b.contact_email, 'contact_email') : null
    }),
    duplicate: ['اسم القسم مستخدم مسبقاً', 'name'],
    inUse: 'لا يمكن حذف القسم لارتباطه ببلاغات أو تصنيفات أو موظفين'
  },
  buildings: {
    table: 'building',
    key: 'building_id',
    select: 'SELECT building_id, code, name, latitude, longitude FROM building',
    search: ['code', 'name'],
    order: 'code',
    parse: async (b) => {
      const code = v.text(b.code, 'code', 'رمز المبنى', { max: 10 }).toUpperCase();
      if (!/^[A-Z0-9-]+$/.test(code)) throw new HttpError(400, 'رمز المبنى يقبل الحروف الإنجليزية والأرقام والشرطة فقط', 'code');
      return {
        code,
        name: v.text(b.name, 'name', 'اسم المبنى', { min: 2, max: 100 }),
        latitude: v.coord(b.latitude, 'latitude', -90, 90, true),
        longitude: v.coord(b.longitude, 'longitude', -180, 180, true)
      };
    },
    duplicate: ['رمز المبنى مستخدم مسبقاً', 'code'],
    inUse: 'لا يمكن حذف المبنى لارتباطه بمواقع أو بلاغات'
  },
  locations: {
    table: 'location',
    key: 'location_id',
    select: 'SELECT l.location_id, l.building_id, l.floor, l.room_name, b.name AS building_name FROM location l JOIN building b ON b.building_id = l.building_id',
    search: ['l.floor', 'l.room_name'],
    order: 'l.floor, l.room_name',
    filters: { building_id: 'l.building_id' },
    parse: async (b) => ({
      building_id: v.id(b.building_id, 'building_id', 'المبنى'),
      floor: v.text(b.floor, 'floor', 'الدور', { max: 20 }),
      room_name: v.text(b.room_name, 'room_name', 'اسم الغرفة', { max: 60, required: false })
    }),
    duplicate: null,
    inUse: 'لا يمكن حذف الموقع لارتباطه ببلاغات'
  },
  categories: {
    table: 'category',
    key: 'category_id',
    select: 'SELECT c.category_id, c.name, c.department_id, c.default_priority, d.name AS department_name FROM category c JOIN department d ON d.department_id = c.department_id',
    search: ['c.name', 'd.name'],
    order: 'c.name',
    filters: { department_id: 'c.department_id' },
    parse: async (b) => ({
      name: v.text(b.name, 'name', 'اسم التصنيف', { min: 2, max: 80 }),
      department_id: v.id(b.department_id, 'department_id', 'القسم المسؤول'),
      default_priority: v.oneOf(b.default_priority, PRIORITIES, 'default_priority', 'الأولوية الافتراضية')
    }),
    duplicate: ['اسم التصنيف مستخدم مسبقاً', 'name'],
    inUse: 'لا يمكن حذف التصنيف لارتباطه ببلاغات'
  },
  users: {
    table: 'user',
    key: 'user_id',
    select: 'SELECT u.user_id, u.university_id, u.full_name, u.email, u.role, u.department_id, d.name AS department_name FROM user u LEFT JOIN department d ON d.department_id = u.department_id',
    search: ['u.university_id', 'u.full_name', 'u.email'],
    order: "FIELD(u.role, 'ADMIN', 'STAFF', 'REPORTER'), u.full_name",
    filters: { role: 'u.role' },
    parse: parseUser,
    duplicate: ['الرقم الجامعي أو البريد الإلكتروني مستخدم مسبقاً', 'university_id'],
    inUse: 'لا يمكن حذف المستخدم لارتباطه ببلاغات أو بسجل الحالات'
  }
};

function entityOf(req) {
  const entity = ENTITIES[req.params.entity];
  if (!entity) throw new HttpError(404, 'المورد المطلوب غير موجود');
  return entity;
}

// يحوّل أخطاء القيود في MySQL إلى رسائل عربية واضحة
async function guarded(entity, run) {
  try { return await run(); } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' && entity.duplicate) throw new HttpError(409, ...entity.duplicate);
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') throw new HttpError(409, entity.inUse);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') throw new HttpError(400, 'أحد الحقول المرتبطة يشير إلى سجل غير موجود');
    throw err;
  }
}

router.get('/stats', async (req, res) => res.json(await stats.overview()));

router.get('/reports', async (req, res) => {
  const { conds, params } = reportFilters(req.query);
  res.json(await listReports(conds, params, v.pagination(req.query)));
});

// إعادة التوجيه تغيّر القسم وتصفّر المسؤول وتُسجَّل في سجل الحالة بنفس الحالة
router.post('/reports/:id/reassign', async (req, res) => {
  const id = v.id(req.params.id, 'id', 'البلاغ');
  const departmentId = v.id((req.body || {}).department_id, 'department_id', 'القسم');
  await db.transaction(async (tx) => {
    const [r] = await tx.query('SELECT r.status, r.department_id, d.name FROM report r JOIN department d ON d.department_id = r.department_id WHERE r.report_id = ? FOR UPDATE', [id]);
    if (!r) throw new HttpError(404, 'البلاغ غير موجود');
    if (r.status === 'CLOSED') throw new HttpError(409, 'لا يمكن إعادة توجيه بلاغ مغلق');
    if (r.department_id === departmentId) throw new HttpError(400, 'البلاغ موجّه إلى هذا القسم حالياً', 'department_id');
    const [target] = await tx.query('SELECT name FROM department WHERE department_id = ?', [departmentId]);
    if (!target) throw new HttpError(400, 'القسم المختار غير موجود', 'department_id');
    await tx.query('UPDATE report SET department_id = ?, assigned_to = NULL WHERE report_id = ?', [departmentId, id]);
    await tx.query('INSERT INTO status_history (report_id, changed_by, old_status, new_status, note) VALUES (?, ?, ?, ?, ?)', [id, req.user.id, r.status, r.status, `إعادة توجيه من ${r.name} إلى ${target.name}`]);
  });
  res.json({ ok: true });
});

router.get('/:entity', async (req, res) => {
  const entity = entityOf(req);
  const pg = v.pagination(req.query);
  const conds = [];
  const params = [];
  const term = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  if (term) {
    conds.push(`(${entity.search.map((column) => `${column} LIKE ?`).join(' OR ')})`);
    params.push(...entity.search.map(() => v.like(term)));
  }
  for (const [name, column] of Object.entries(entity.filters || {})) {
    if (!req.query[name]) continue;
    conds.push(`${column} = ?`);
    params.push(String(req.query[name]).slice(0, 20));
  }
  const where = conds.length ? ` WHERE ${conds.join(' AND ')}` : '';
  const [{ total }] = await db.query(`SELECT COUNT(*) AS total FROM (${entity.select}${where}) t`, params);
  const items = await db.query(`${entity.select}${where} ORDER BY ${entity.order} LIMIT ? OFFSET ?`, [...params, pg.pageSize, pg.offset]);
  res.json({ items, total, page: pg.page, pageSize: pg.pageSize });
});

router.post('/:entity', async (req, res) => {
  const entity = entityOf(req);
  const data = await entity.parse(req.body || {}, true);
  const result = await guarded(entity, () => db.query('INSERT INTO ?? SET ?', [entity.table, data]));
  res.status(201).json({ id: result.insertId });
});

router.put('/:entity/:id', async (req, res) => {
  const entity = entityOf(req);
  const id = v.id(req.params.id, 'id', 'السجل');
  const body = req.body || {};
  if (entity.table === 'user' && id === req.user.id && body.role !== 'ADMIN') throw new HttpError(400, 'لا يمكنك تغيير دور حسابك الحالي', 'role');
  const data = await entity.parse(body, false);
  const result = await guarded(entity, () => db.query('UPDATE ?? SET ? WHERE ?? = ?', [entity.table, data, entity.key, id]));
  if (!result.affectedRows) throw new HttpError(404, 'السجل غير موجود');
  if (entity.table === 'user' && id !== req.user.id) await db.query('DELETE FROM session WHERE user_id = ?', [id]);
  res.json({ ok: true });
});

router.delete('/:entity/:id', async (req, res) => {
  const entity = entityOf(req);
  const id = v.id(req.params.id, 'id', 'السجل');
  if (entity.table === 'user' && id === req.user.id) throw new HttpError(400, 'لا يمكنك حذف حسابك الحالي');
  const result = await guarded(entity, () => db.query('DELETE FROM ?? WHERE ?? = ?', [entity.table, entity.key, id]));
  if (!result.affectedRows) throw new HttpError(404, 'السجل غير موجود');
  res.json({ ok: true });
});

module.exports = router;