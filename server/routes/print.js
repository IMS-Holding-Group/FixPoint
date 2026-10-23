const express = require('express');
const v = require('../utils/validators');
const stats = require('../services/stats');
const { formatText } = require('../utils/datetime');
const { HttpError } = require('../middleware/errors');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('ADMIN'));

function period(q) {
  const from = v.date(q.from, 'from', 'تاريخ البداية', true);
  const to = v.date(q.to, 'to', 'تاريخ النهاية', true);
  if (from > to) throw new HttpError(400, 'تاريخ البداية يجب أن يسبق تاريخ النهاية', 'from');
  return { from, to };
}

const stamp = () => ({ generated_at: new Date(), generated_text: formatText(new Date()) });

router.get('/status-summary', async (req, res) => {
  const p = period(req.query);
  res.json({ ...p, ...stamp(), ...(await stats.statusSummary(p.from, p.to)) });
});

router.get('/building-fault', async (req, res) => {
  const p = period(req.query);
  res.json({ ...p, ...stamp(), ...(await stats.buildingFault(p.from, p.to)) });
});

module.exports = router;