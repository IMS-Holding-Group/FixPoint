FP.page(async () => {
  const form = document.getElementById('filters');
  const dialog = document.getElementById('reassignDialog');
  const dialogForm = dialog.querySelector('form');
  const dialogAlert = dialog.querySelector('.modal-alert');
  const submit = dialogForm.querySelector('[type=submit]');
  const [meta, depts] = await Promise.all([FP.api('/api/meta/form-data'), FP.api('/api/admin/departments?pageSize=50')]);
  const departments = depts.items;
  FP.fillSelect(form.building_id, meta.buildings, 'كل المباني');
  FP.fillSelect(form.category_id, meta.categories, 'كل التصنيفات');
  FP.fillSelect(form.department_id, departments, 'كل الأقسام', (d) => d.department_id);
  let current = null;

  function openReassign(r) {
    current = r;
    FP.clearErrors(dialogForm);
    FP.alert(dialogAlert, '');
    document.getElementById('reassignInfo').textContent = `البلاغ رقم ${r.report_id} موجّه حالياً إلى ${r.department}`;
    FP.fillSelect(dialogForm.department_id, departments.filter((d) => d.name !== r.department), 'اختر القسم', (d) => d.department_id);
    dialog.showModal();
  }

  const list = FP.listPage({
    url: '/api/admin/reports',
    form,
    tbody: document.getElementById('rows'),
    pager: document.getElementById('pager'),
    region: document.getElementById('listAlert'),
    colspan: 9,
    empty: 'لا توجد بلاغات مطابقة',
    row: (r) => FP.h('tr', null,
      FP.td(FP.reportLink(r.report_id)), FP.td(FP.dt(r.created_at)), FP.td(r.category), FP.td(FP.place(r)), FP.td(r.department), FP.td(r.reporter), FP.td(FP.priority(r.priority)), FP.td(FP.status(r.status)),
      FP.td(FP.h('div', { class: 'actions-cell' },
        FP.h('a', { class: 'btn btn-ghost btn-sm', href: `/report.html?id=${r.report_id}` }, FP.icon('eye', 16), 'عرض'),
        r.status === 'CLOSED' ? null : FP.h('button', { type: 'button', class: 'btn btn-secondary btn-sm', onclick: () => openReassign(r) }, FP.icon('route', 16), 'إعادة توجيه'))))
  });

  dialogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    FP.clearErrors(dialogForm);
    if (!dialogForm.department_id.value) return FP.fieldError(dialogForm, 'department_id', 'اختر القسم الجديد');
    FP.busy(submit, true);
    try {
      await FP.api(`/api/admin/reports/${current.report_id}/reassign`, { method: 'POST', body: { department_id: dialogForm.department_id.value } });
      dialog.close();
      FP.toast('تمت إعادة توجيه البلاغ');
      list.reload();
    } catch (err) { FP.showError(dialogForm, dialogAlert, err); } finally { FP.busy(submit, false); }
  });
  dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
});