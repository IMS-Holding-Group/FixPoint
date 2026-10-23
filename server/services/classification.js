const { HttpError } = require('../middleware/errors');

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// الأولوية الأعلى بين قيمتين حسب الترتيب LOW ثم MEDIUM ثم HIGH ثم URGENT
const maxPriority = (a, b) => PRIORITIES[Math.max(PRIORITIES.indexOf(a), PRIORITIES.indexOf(b))];

// القسم المسؤول من قاعدة التصنيف المخزنة في جدول category، والأولوية النهائية هي الأعلى
async function classify(query, categoryId, suggestedPriority) {
  const [category] = await query('SELECT department_id, default_priority FROM category WHERE category_id = ?', [categoryId]);
  if (!category) throw new HttpError(400, 'التصنيف المختار غير موجود', 'category_id');
  return { departmentId: category.department_id, priority: maxPriority(category.default_priority, suggestedPriority) };
}

module.exports = { PRIORITIES, maxPriority, classify };