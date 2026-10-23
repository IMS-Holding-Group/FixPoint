(function () {
  const form = document.getElementById('loginForm');
  const region = document.getElementById('formAlert');
  const submit = form.querySelector('[type=submit]');
  FP.passwordToggles(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FP.clearErrors(form);
    FP.alert(region, '');
    const body = { identifier: form.identifier.value.trim(), password: form.password.value };
    if (!body.identifier) return FP.fieldError(form, 'identifier', 'أدخل الرقم الجامعي أو البريد الإلكتروني');
    if (!body.password) return FP.fieldError(form, 'password', 'أدخل كلمة السر');
    FP.busy(submit, true);
    try {
      const data = await FP.api('/api/auth/login', { method: 'POST', body });
      location.href = FP.safePath(data.redirect);
    } catch (err) {
      FP.busy(submit, false);
      FP.showError(form, region, err);
    }
  });
})();