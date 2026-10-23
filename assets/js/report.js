FP.page(async (me) => {
  if (me.user.role === 'ADMIN') document.getElementById('backLink').href = '/admin-reports.html';
  const id = FP.param('id') || '';
  if (!/^\d+$/.test(id)) throw new Error('البلاغ غير موجود');
  const data = await FP.api(`/api/reports/${id}`);
  document.getElementById('title').textContent = `البلاغ رقم ${data.report.report_id}`;
  FP.renderDetails(document.getElementById('details'), data, me);
});