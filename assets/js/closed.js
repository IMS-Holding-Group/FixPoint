FP.page(async (me) => {
  document.getElementById('deptName').textContent = me.user.department_name || '';
  const form = document.getElementById('filters');
  const meta = await FP.api('/api/meta/form-data');
  FP.fillSelect(form.category_id, meta.categories, 'كل التصنيفات');
  FP.listPage({
    url: '/api/staff/closed',
    form,
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    colspan: 7,
    empty: 'لا توجد بلاغات مغلقة',
    row: (r) => FP.h('tr', null,
      FP.td(FP.reportLink(r.report_id, '/staff-report.html')), FP.td(r.category), FP.td(FP.place(r)), FP.td(FP.priority(r.priority)), FP.td(FP.dt(r.created_at)), FP.td(FP.dt(r.closed_at)),
      FP.td(FP.h('a', { class: 'btn btn-ghost btn-sm', href: `/staff-report.html?id=${r.report_id}` }, FP.icon('eye', 16), 'التفاصيل')))
  });
});