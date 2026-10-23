FP.page(async () => {
  const dialog = document.getElementById('editDialog');
  const form = dialog.querySelector('form');
  const depts = await FP.api('/api/admin/departments?pageSize=50');
  FP.fillSelect(form.department_id, depts.items, 'اختر القسم', (d) => d.department_id);
  const crud = FP.crud({
    endpoint: '/api/admin/categories',
    key: 'category_id',
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    colspan: 4,
    dialog,
    labels: { add: 'إضافة تصنيف', edit: 'تعديل تصنيف' },
    empty: 'لا توجد تصنيفات',
    columns: [(c) => c.name, (c) => c.department_name, (c) => FP.priority(c.default_priority)],
    fill: (f, c) => {
      f.name.value = c.name;
      f.department_id.value = c.department_id;
      f.default_priority.value = c.default_priority;
    },
    deleteText: (c) => `حذف التصنيف ${c.name}؟`
  });
  document.getElementById('addBtn').addEventListener('click', () => crud.open());
});