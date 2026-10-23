FP.page(async () => {
  const form = document.getElementById('periodForm');
  const region = document.getElementById('formAlert');
  form.from.value = FP.isoDay(-30);
  form.to.value = FP.isoDay(0);

  async function load() {
    FP.clearErrors(form);
    FP.alert(region, '');
    try {
      const d = await FP.api(`/api/admin/print/building-fault?${FP.query(form)}`);
      const empty = 'لا توجد بلاغات في هذه الفترة';
      document.getElementById('period').replaceChildren('الفترة: من ', FP.dt(d.from, false), ' إلى ', FP.dt(d.to, false), ` - إجمالي البلاغات: ${d.total}`);
      document.getElementById('generated').replaceChildren('تاريخ التوليد: ', FP.dt(d.generated_at));
      FP.fillTable(document.getElementById('buildingRows'), d.buildings, (r) => FP.h('tr', null, FP.td(r.label), FP.td(FP.pct(r.value, d.total))), empty, 2);
      FP.fillTable(document.getElementById('categoryRows'), d.categories, (r) => FP.h('tr', null, FP.td(r.label), FP.td(FP.pct(r.value, d.total))), empty, 2);
      FP.fillTable(document.getElementById('pairRows'), d.pairs, (r) => FP.h('tr', null, FP.td(r.building), FP.td(r.category), FP.td(FP.pct(r.n, d.total))), empty, 3);
      FP.fillTable(document.getElementById('resolutionRows'), d.by_category, (r) => FP.h('tr', null, FP.td(r.category), FP.td(String(r.closed_count)), FP.td(r.avg_text)), empty, 3);
    } catch (err) { FP.showError(form, region, err); }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    load();
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  await load();
});