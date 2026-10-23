const express = require('express');
const v = require('../utils/validators');
const { requireRole } = require('../middleware/auth');
const { reportFilters, listReports } = require('./reports');

const router = express.Router();
const BY_URGENCY = "FIELD(r.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'), r.created_at";

router.use(requireRole('STAFF'));

// قائمة عمل القسم: البلاغات المفتوحة والجارية مرتبة بالأولوية ثم الأقدم
router.get('/queue', async (req, res) => {
  const { conds, params } = reportFilters(req.query);
  conds.unshift('r.department_id = ?', "r.status <> 'CLOSED'");
  params.unshift(req.user.department_id);
  res.json(await listReports(conds, params, v.pagination(req.query), BY_URGENCY));
});

router.get('/closed', async (req, res) => {
  const { conds, params } = reportFilters(req.query);
  conds.unshift('r.department_id = ?', "r.status = 'CLOSED'");
  params.unshift(req.user.department_id);
  res.json(await listReports(conds, params, v.pagination(req.query), 'r.closed_at DESC'));
});

module.exports = router;