const path = require('path');
const multer = require('multer');
const logger = require('../utils/logger');

const NOT_FOUND_PAGE = path.join(__dirname, '..', '..', 'public', 'not-found.html');

// خطأ متوقع برسالة عربية آمنة للعرض، مع اسم الحقل المسؤول عند الحاجة
class HttpError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: ['حجم الصورة يتجاوز 5 ميجابايت', 'images'],
  LIMIT_FILE_COUNT: ['الحد الأقصى 5 صور للبلاغ الواحد', 'images'],
  LIMIT_UNEXPECTED_FILE: ['الحد الأقصى 5 صور للبلاغ الواحد', 'images']
};

function apiNotFound(req, res, next) { next(new HttpError(404, 'المورد المطلوب غير موجود')); }

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const [message, field] = MULTER_MESSAGES[err.code] || ['تعذر رفع الملفات المرفقة', 'images'];
    err = new HttpError(400, message, field);
  } else if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) { err = new HttpError(400, 'بيانات الطلب غير صالحة'); }
  const known = err instanceof HttpError;
  if (!known) logger.error(err, req);
  if (res.headersSent) return next(err);
  const status = known ? err.status : 500;
  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({ error: known ? err.message : 'حدث خطأ غير متوقع، حاول مرة أخرى لاحقاً', field: known ? err.field : undefined });
  }
  if (status === 404) return res.status(404).sendFile(NOT_FOUND_PAGE);
  res.status(status).type('text/plain; charset=utf-8').send('حدث خطأ غير متوقع، حاول مرة أخرى لاحقاً');
}

module.exports = { HttpError, apiNotFound, errorHandler };