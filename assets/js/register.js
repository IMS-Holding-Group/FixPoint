(function () {
  const form = document.getElementById('registerForm');
  const region = document.getElementById('formAlert');
  const submit = form.querySelector('[type=submit]');
  FP.passwordToggles(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FP.clearErrors(form);
    FP.alert(region, '');
    const body = FP.formObject(form);
    body.password = form.password.value;
    const checks = [['full_name', 'اكتب اسمك الكامل'], ['university_id', 'اكتب رقمك الجامعي'], ['email', 'اكتب بريدك الإلكتروني'], ['password', 'اختر كلمة سر']];
    for (const [name, message] of checks) if (!body[name]) return FP.fieldError(form, name, message);
    if (body.password.length < 8 || !/\d/.test(body.password) || !/[A-Za-z\u0600-\u06FF]/.test(body.password)) return FP.fieldError(form, 'password', 'كلمة السر يجب أن تكون 8 خانات على الأقل وتتضمن حرفاً ورقماً');
    if (form.confirm.value !== body.password) return FP.fieldError(form, 'confirm', 'كلمتا السر غير متطابقتين');
    delete body.confirm;
    FP.busy(submit, true);
    try {
      const data = await FP.api('/api/auth/register', { method: 'POST', body });
      location.href = FP.safePath(data.redirect);
    } catch (err) {
      FP.busy(submit, false);
      FP.showError(form, region, err);
    }
  });
})();