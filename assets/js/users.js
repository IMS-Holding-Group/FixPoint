FP.page(async () => {
  const dialog = document.getElementById('editDialog');
  const form = dialog.querySelector('form');
  const deptField = document.getElementById('deptField');
  const depts = await FP.api('/api/admin/departments?pageSize=50');
  FP.fillSelect(form.department_id, depts.items, 'اختر القسم', (d) => d.department_id);
  const syncDept = () => { deptField.hidden = form.role.value !== 'STAFF'; };
  form.role.addEventListener('change', syncDept);

  const crud = FP.crud({
    endpoint: '/api/admin/users',
    key: 'user_id',
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    filters: document.getElementById('filters'),
    colspan: 6,
    dialog,
    labels: { add: 'إضافة مستخدم', edit: 'تعديل مستخدم' },
    empty: 'لا يوجد مستخدمون مطابقون',
    columns: [(u) => u.university_id, (u) => u.full_name, (u) => u.email, (u) => FP.ROLE[u.role], (u) => u.department_name || '-'],
    fill: (f, u) => {
      f.university_id.value = u.university_id;
      f.full_name.value = u.full_name;
      f.email.value = u.email;
      f.role.value = u.role;
      f.department_id.value = u.department_id || '';
    },
    onOpen: (u) => {
      syncDept();
      document.getElementById('passwordHint').textContent = u ? 'اتركها فارغة للإبقاء على كلمة السر الحالية' : '8 خانات على الأقل وتتضمن حرفاً ورقماً';
    },
    payload: (f) => {
      const data = FP.formObject(f);
      data.password = f.password.value;
      if (!data.password) delete data.password;
      return data;
    },
    deleteText: (u) => `حذف المستخدم ${u.full_name}؟`
  });
  document.getElementById('addBtn').addEventListener('click', () => crud.open());
});