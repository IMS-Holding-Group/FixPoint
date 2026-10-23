const multer = require('multer');

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

// الملفات تبقى في الذاكرة حتى يُتحقق من نوعها الحقيقي، ثم تُحفظ عبر طبقة التخزين
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES, fields: 20, fieldSize: 16 * 1024 }
});

// النوع الحقيقي من البايتات الأولى (magic bytes) وليس من الامتداد أو MIME المرسل
function detectImageType(buffer) {
  if (!buffer || buffer.length < 8) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, i) => buffer[i] === byte)) return 'png';
  return null;
}

module.exports = { reportImages: upload.array('images', MAX_FILES), detectImageType };