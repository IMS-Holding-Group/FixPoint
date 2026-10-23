(function () {
  const FP = window.FP = window.FP || {};
  const KSA_OFFSET_MS = 3 * 60 * 60 * 1000;

  // أجزاء التاريخ بتوقيت المملكة بنظام 12 ساعة دون صفر أمامي إلا في الدقائق
  FP.dtParts = function (value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const ksa = new Date(date.getTime() + KSA_OFFSET_MS);
    const hour24 = ksa.getUTCHours();
    return {
      year: ksa.getUTCFullYear(),
      month: ksa.getUTCMonth() + 1,
      day: ksa.getUTCDate(),
      hour: hour24 % 12 || 12,
      minute: String(ksa.getUTCMinutes()).padStart(2, '0'),
      suffix: hour24 < 12 ? 'ص' : 'م'
    };
  };

  // عنصر span.dt واحد بعناصر فرعية منفصلة: 2026/1/3م 5:50ص
  FP.dt = function (value, withTime = true) {
    const root = document.createElement('span');
    root.className = 'dt';
    const p = value ? FP.dtParts(value) : null;
    if (!p) {
      root.textContent = '-';
      return root;
    }
    const pieces = [[p.year, 'dt-y'], ['/'], [p.month, 'dt-m'], ['/'], [p.day, 'dt-d'], ['م', 'dt-cal']];
    if (withTime) pieces.push([' '], [p.hour, 'dt-h'], [':'], [p.minute, 'dt-min'], [p.suffix, 'dt-ampm']);
    for (const [text, cls] of pieces) {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      span.textContent = String(text);
      root.append(span);
    }
    return root;
  };

  // تاريخ اليوم بتوقيت المملكة بصيغة حقل التاريخ YYYY-MM-DD
  FP.isoDay = (offsetDays = 0) => new Date(Date.now() + KSA_OFFSET_MS + offsetDays * 86400000).toISOString().slice(0, 10);
})();