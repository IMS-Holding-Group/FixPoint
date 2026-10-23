const express = require('express');
const config = require('../config');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// بيانات النماذج: التصنيفات والمباني والمواقع
router.get('/meta/form-data', requireAuth, async (req, res) => {
  const categories = await db.query('SELECT category_id AS id, name, default_priority FROM category ORDER BY name');
  const buildings = await db.query('SELECT building_id AS id, code, name, latitude, longitude FROM building ORDER BY code');
  const locations = await db.query('SELECT location_id AS id, building_id, floor, room_name FROM location ORDER BY building_id, floor, room_name');
  res.json({ categories, buildings, locations });
});

// مفتاح الخرائط للمستخدم المسجل فقط، وقيمة فارغة إن لم يُضبط
router.get('/config/maps', requireAuth, (req, res) => res.json({ key: config.mapsKey }));

module.exports = router;