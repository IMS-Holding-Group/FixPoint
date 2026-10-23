FP.page(async () => {
  const form = document.getElementById('filters');
  const meta = await FP.api('/api/meta/form-data');
  FP.fillSelect(form.category_id, meta.categories, 'كل التصنيفات');
  FP.listPage({
    url: '/api/reports/mine',
    form,
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    colspan: 7,
    empty: 'لا توجد بلاغات مطابقة',
    row: (r) => FP.h('tr', null,
      FP.td(FP.reportLink(r.report_id)), FP.td(r.category), FP.td(FP.place(r)), FP.td(FP.priority(r.priority)), FP.td(FP.status(r.status)), FP.td(FP.dt(r.created_at)),
      FP.td(FP.h('a', { class: 'btn btn-ghost btn-sm', href: `/report.html?id=${r.report_id}` }, FP.icon('eye', 16), 'التفاصيل')))
  });
});