FP.page(async (me) => {
  const u = me.user;
  const rows = [['الاسم الكامل', u.full_name], ['الرقم الجامعي', u.university_id], ['البريد الإلكتروني', u.email], ['الدور', FP.ROLE[u.role]]];
  if (u.department_name) rows.push(['القسم', u.department_name]);
  document.getElementById('info').replaceChildren(...rows.map(([k, v]) => FP.h('div', null, FP.h('dt', { text: k }), FP.h('dd', { text: v }))));

  const form = document.getElementById('passwordForm');
  const region = document.getElementById('formAlert');
  const submit = form.querySelector('[type=submit]');
  FP.passwordToggles(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FP.clearErrors(form);
    FP.alert(region, '');
    if (!form.current_password.value) return FP.fieldError(form, 'current_password', 'أدخل كلمة السر الحالية');
    if (!form.new_password.value) return FP.fieldError(form, 'new_password', 'أدخل كلمة السر الجديدة');
    if (form.confirm.value !== form.new_password.value) return FP.fieldError(form, 'confirm', 'كلمتا السر غير متطابقتين');
    FP.busy(submit, true);
    try {
      await FP.api('/api/auth/password', { method: 'POST', body: { current_password: form.current_password.value, new_password: form.new_password.value } });
      form.reset();
      FP.alert(region, 'تم تغيير كلمة السر بنجاح', 'success');
    } catch (err) { FP.showError(form, region, err); } finally { FP.busy(submit, false); }
  });
});