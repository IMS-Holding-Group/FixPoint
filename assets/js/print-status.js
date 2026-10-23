FP.page(async () => {
  const form = document.getElementById('periodForm');
  const region = document.getElementById('formAlert');
  form.from.value = FP.isoDay(-30);
  form.to.value = FP.isoDay(0);

  async function load() {
    FP.clearErrors(form);
    FP.alert(region, '');
    try {
      const d = await FP.api(`/api/admin/print/status-summary?${FP.query(form)}`);
      document.getElementById('period').replaceChildren('الفترة: من ', FP.dt(d.from, false), ' إلى ', FP.dt(d.to, false), ` - إجمالي البلاغات: ${d.total}`);
      document.getElementById('generated').replaceChildren('تاريخ التوليد: ', FP.dt(d.generated_at));
      document.getElementById('avg').textContent = `متوسط زمن المعالجة للبلاغات المغلقة في الفترة: ${d.avg_text}`;
      FP.fillTable(document.getElementById('statusRows'), d.by_status, (r) => FP.h('tr', null, FP.td(FP.status(r.status)), FP.td(FP.pct(r.n, d.total))), 'لا توجد بيانات', 2);
      FP.fillTable(document.getElementById('deptRows'), d.by_department, (r) => FP.h('tr', null,
        FP.td(r.department), FP.td(FP.pct(r.total, d.total)), FP.td(FP.pct(r.open_count, r.total)), FP.td(FP.pct(r.progress_count, r.total)), FP.td(FP.pct(r.closed_count, r.total))), 'لا توجد بلاغات في هذه الفترة', 5);
    } catch (err) { FP.showError(form, region, err); }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    load();
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  await load();
});