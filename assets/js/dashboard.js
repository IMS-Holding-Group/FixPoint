FP.page(async () => {
  const tbody = document.getElementById('rows');
  FP.loadingRows(tbody, 3);
  const s = await FP.api('/api/admin/stats');
  const count = (status) => s.counts.find((c) => c.status === status).n;
  document.getElementById('kpiOpen').textContent = count('OPEN');
  document.getElementById('kpiProgress').textContent = count('IN_PROGRESS');
  document.getElementById('kpiClosed').textContent = count('CLOSED');
  document.getElementById('kpiAvg').textContent = s.avg_text;
  FP.barChart(document.getElementById('chartBuildings'), s.buildings, 'blue', 'البلاغات حسب المبنى');
  FP.barChart(document.getElementById('chartCategories'), s.categories, 'orange', 'أكثر أنواع الأعطال تكراراً');
  FP.fillTable(tbody, s.by_category, (c) => FP.h('tr', null, FP.td(c.category), FP.h('td', { class: 'num', text: c.closed_count }), FP.td(c.avg_text)), 'لا توجد تصنيفات', 3);
});