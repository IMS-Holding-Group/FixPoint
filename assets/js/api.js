(function () {
  const FP = window.FP = window.FP || {};
  FP.csrf = '';
  FP.requireSession = false;

  // طلب JSON موحد يضيف رمز CSRF لكل طلب يغيّر البيانات ويحوّل الأخطاء إلى رسائل عربية
  FP.api = async function (url, { method = 'GET', body, form } = {}) {
    const headers = { Accept: 'application/json' };
    if (method !== 'GET') headers['X-CSRF-Token'] = FP.csrf;
    let payload;
    if (form) payload = form;
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    let res;
    try {
      res = await fetch(url, { method, headers, body: payload, credentials: 'same-origin' });
    } catch {
      throw Object.assign(new Error('تعذر الاتصال بالخادم، تحقق من الشبكة وحاول مرة أخرى'), { status: 0 });
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && FP.requireSession) location.href = '/';
    if (!res.ok) throw Object.assign(new Error(data.error || 'حدث خطأ غير متوقع، حاول مرة أخرى'), { status: res.status, field: data.field });
    return data;
  };

  FP.me = async function () {
    const me = await FP.api('/api/auth/me');
    FP.csrf = me.csrf;
    return me;
  };

  FP.logout = async function () {
    try {
      await FP.api('/api/auth/logout', { method: 'POST' });
    } finally { location.href = '/'; }
  };

  // يقبل مسارات داخلية فقط عند التوجيه بعد الدخول
  FP.safePath = (path) => (typeof path === 'string' && /^\/[a-z0-9-]+\.html$/.test(path) ? path : '/');
})();