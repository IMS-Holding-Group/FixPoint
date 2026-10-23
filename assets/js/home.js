FP.page(async (me) => {
  document.getElementById('greeting').textContent = `مرحباً، ${me.user.full_name}`;
  const tbody = document.getElementById('rows');
  FP.loadingRows(tbody, 5);
  const data = await FP.api('/api/reports/mine?pageSize=5');
  const c = data.counts;
  document.getElementById('kpiOpen').textContent = c.OPEN;
  document.getElementById('kpiProgress').textContent = c.IN_PROGRESS;
  document.getElementById('kpiClosed').textContent = c.CLOSED;
  document.getElementById('kpiTotal').textContent = c.OPEN + c.IN_PROGRESS + c.CLOSED;
  FP.fillTable(tbody, data.items, (r) => FP.h('tr', null, FP.td(FP.reportLink(r.report_id)), FP.td(r.category), FP.td(FP.place(r)), FP.td(FP.status(r.status)), FP.td(FP.dt(r.created_at))), 'لم تقدّم أي بلاغ بعد', 5);
});