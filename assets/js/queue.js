FP.page(async (me) => {
  document.getElementById('deptName').textContent = me.user.department_name || '';
  const form = document.getElementById('filters');
  const meta = await FP.api('/api/meta/form-data');
  FP.fillSelect(form.category_id, meta.categories, 'كل التصنيفات');
  FP.listPage({
    url: '/api/staff/queue',
    form,
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    colspan: 8,
    empty: 'لا توجد بلاغات بانتظار المعالجة',
    row: (r) => FP.h('tr', null,
      FP.td(FP.reportLink(r.report_id, '/staff-report.html')), FP.td(FP.priority(r.priority)), FP.td(FP.status(r.status)), FP.td(r.category), FP.td(FP.place(r)),
      FP.h('td', { class: 'summary-cell', title: r.summary, text: r.summary }), FP.td(FP.dt(r.created_at)),
      FP.td(FP.h('a', { class: 'btn btn-primary btn-sm', href: `/staff-report.html?id=${r.report_id}` }, 'فتح وتحديث')))
  });
});