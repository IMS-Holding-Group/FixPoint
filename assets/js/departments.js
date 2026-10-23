FP.page(async () => {
  const crud = FP.crud({
    endpoint: '/api/admin/departments',
    key: 'department_id',
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    colspan: 3,
    dialog: document.getElementById('editDialog'),
    labels: { add: 'إضافة قسم', edit: 'تعديل قسم' },
    empty: 'لا توجد أقسام',
    columns: [(d) => d.name, (d) => d.contact_email || '-'],
    fill: (f, d) => {
      f.name.value = d.name;
      f.contact_email.value = d.contact_email || '';
    },
    deleteText: (d) => `حذف ${d.name}؟`
  });
  document.getElementById('addBtn').addEventListener('click', () => crud.open());
});