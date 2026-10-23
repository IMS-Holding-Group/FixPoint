const db = require('../db');
const { formatDuration } = require('../utils/datetime');
const { STATUSES } = require('../utils/validators');

const RANGE = 'r.created_at >= ? AND r.created_at < DATE_ADD(?, INTERVAL 1 DAY)';
const AVG_SECONDS = 'AVG(TIMESTAMPDIFF(SECOND, r.created_at, r.closed_at))';

const byBuilding = (where, params, limit) => db.query(
  `SELECT b.name AS label, COUNT(*) AS value FROM report r
   JOIN location l ON l.location_id = r.location_id JOIN building b ON b.building_id = l.building_id
   ${where} GROUP BY b.building_id, b.name ORDER BY value DESC, b.name ${limit ? 'LIMIT 10' : ''}`,
  params
);

const byCategory = (where, params, limit) => db.query(
  `SELECT c.name AS label, COUNT(*) AS value FROM report r JOIN category c ON c.category_id = r.category_id
   ${where} GROUP BY c.category_id, c.name ORDER BY value DESC, c.name ${limit ? 'LIMIT 10' : ''}`,
  params
);

// متوسط زمن المعالجة لكل تصنيف مع عدد البلاغات المغلقة
async function resolutionByCategory(range, params) {
  const rows = await db.query(
    `SELECT c.name AS category, COUNT(r.report_id) AS closed_count, ${AVG_SECONDS} AS avg_seconds
     FROM category c LEFT JOIN report r ON r.category_id = c.category_id AND r.status = 'CLOSED' AND r.closed_at IS NOT NULL ${range ? `AND ${RANGE}` : ''}
     GROUP BY c.category_id, c.name ORDER BY closed_count DESC, c.name`,
    params
  );
  return rows.map((row) => ({ ...row, avg_text: formatDuration(row.avg_seconds) }));
}

const countsByStatus = (rows) => STATUSES.map((status) => ({ status, n: (rows.find((r) => r.status === status) || { n: 0 }).n }));

// إحصائيات لوحة التحكم على كامل البيانات
async function overview() {
  const statusRows = await db.query('SELECT r.status, COUNT(*) AS n FROM report r GROUP BY r.status');
  const [avg] = await db.query(`SELECT ${AVG_SECONDS} AS s FROM report r WHERE r.status = 'CLOSED' AND r.closed_at IS NOT NULL`);
  return {
    counts: countsByStatus(statusRows),
    avg_seconds: avg.s,
    avg_text: formatDuration(avg.s),
    buildings: await byBuilding('', [], true),
    categories: await byCategory('', [], true),
    by_category: await resolutionByCategory(false, [])
  };
}

// تقرير ملخص الحالات لفترة محددة بتاريخ الإنشاء
async function statusSummary(from, to) {
  const params = [from, to];
  const statusRows = await db.query(`SELECT r.status, COUNT(*) AS n FROM report r WHERE ${RANGE} GROUP BY r.status`, params);
  const departments = await db.query(
    `SELECT d.name AS department, COUNT(*) AS total, SUM(r.status = 'OPEN') AS open_count,
     SUM(r.status = 'IN_PROGRESS') AS progress_count, SUM(r.status = 'CLOSED') AS closed_count
     FROM report r JOIN department d ON d.department_id = r.department_id
     WHERE ${RANGE} GROUP BY d.department_id, d.name ORDER BY total DESC, d.name`,
    params
  );
  const [avg] = await db.query(`SELECT ${AVG_SECONDS} AS s FROM report r WHERE ${RANGE} AND r.status = 'CLOSED' AND r.closed_at IS NOT NULL`, params);
  const byStatus = countsByStatus(statusRows);
  return { total: byStatus.reduce((sum, row) => sum + row.n, 0), by_status: byStatus, by_department: departments, avg_text: formatDuration(avg.s) };
}

// تقرير تحليل المباني وأنواع الأعطال لفترة محددة
async function buildingFault(from, to) {
  const params = [from, to];
  const buildings = await byBuilding(`WHERE ${RANGE}`, params, false);
  const pairs = await db.query(
    `SELECT b.name AS building, c.name AS category, COUNT(*) AS n FROM report r
     JOIN location l ON l.location_id = r.location_id JOIN building b ON b.building_id = l.building_id
     JOIN category c ON c.category_id = r.category_id
     WHERE ${RANGE} GROUP BY b.building_id, b.name, c.category_id, c.name ORDER BY n DESC, b.name LIMIT 10`,
    params
  );
  return {
    total: buildings.reduce((sum, row) => sum + row.value, 0),
    buildings,
    categories: await byCategory(`WHERE ${RANGE}`, params, false),
    pairs,
    by_category: await resolutionByCategory(true, params)
  };
}

module.exports = { overview, statusSummary, buildingFault };