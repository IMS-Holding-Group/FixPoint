const express = require('express');
const db = require('../db');
const storage = require('../services/storage');
const { HttpError } = require('../middleware/errors');
const { requireAuth } = require('../middleware/auth');
const { canAccess } = require('./reports');

const router = express.Router();

// تُخدم الصورة بعد التحقق من صلاحية الوصول للبلاغ المرتبط بها
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'الصورة غير موجودة');
  const [image] = await db.query('SELECT i.storage_url, r.reporter_id, r.department_id FROM report_image i JOIN report r ON r.report_id = i.report_id WHERE i.image_id = ?', [id]);
  if (!image || !canAccess(req.user, image)) throw new HttpError(404, 'الصورة غير موجودة');
  let data;
  try { data = await storage.read(image.storage_url); } catch { throw new HttpError(404, 'الصورة غير موجودة'); }
  res.set({
    'Content-Type': image.storage_url.endsWith('.png') ? 'image/png' : 'image/jpeg',
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline',
    'Cache-Control': 'private, max-age=3600'
  });
  res.send(data);
});

module.exports = router;