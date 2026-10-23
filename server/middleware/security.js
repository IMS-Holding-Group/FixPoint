const config = require('../config');

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com",
  "connect-src 'self' https://maps.googleapis.com",
  "font-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

// إعادة توجيه HTTP إلى HTTPS في بيئة الإنتاج فقط
function httpsRedirect(req, res, next) {
  if (!config.isProd || req.secure) return next();
  const origin = config.allowedOrigins.find((allowed) => new URL(allowed).host === req.get('host')) || config.allowedOrigins[0];
  res.redirect(308, `${origin}${req.originalUrl}`);
}

function headers(req, res, next) {
  res.set({
    'Content-Security-Policy': config.isProd ? `${CSP}; upgrade-insecure-requests` : CSP,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-DNS-Prefetch-Control': 'off',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  if (req.path.startsWith('/api')) res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' });
  if (config.isProd) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

// رفض أي مسار يحتوي جزءاً يبدأ بنقطة (ملفات مخفية أو محاولة الخروج بـ ..)
function blockHidden(req, res, next) {
  let decoded;
  try { decoded = decodeURIComponent(req.path); } catch { return res.status(400).end(); }
  if (decoded.includes('\\') || decoded.split('/').some((part) => part.startsWith('.'))) return res.status(404).end();
  next();
}

// ترويسات CORS للنطاقات الموثوقة الواردة في ALLOWED_ORIGINS فقط
function cors(req, res, next) {
  const origin = req.get('origin');
  if (origin && config.allowedOrigins.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    });
    res.vary('Origin');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
}

module.exports = { httpsRedirect, headers, blockHidden, cors };