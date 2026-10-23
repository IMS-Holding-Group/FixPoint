FP.page(async (me) => {
  const id = FP.param('id') || '';
  if (!id) {
    document.getElementById('noReport').hidden = false;
    return;
  }
  if (!/^\d+$/.test(id)) throw new Error('البلاغ غير موجود');
  const form = document.getElementById('statusForm');
  const region = document.getElementById('formAlert');
  const updateBtn = document.getElementById('updateBtn');
  const closeBtn = document.getElementById('closeBtn');
  const OPTIONS = {
    OPEN: [['IN_PROGRESS', 'قيد المعالجة'], ['OPEN', 'مفتوح (إضافة ملاحظة فقط)']],
    IN_PROGRESS: [['IN_PROGRESS', 'قيد المعالجة (إضافة ملاحظة)']]
  };

  async function load() {
    const data = await FP.api(`/api/reports/${id}`);
    const status = data.report.status;
    document.getElementById('title').textContent = `البلاغ رقم ${data.report.report_id}`;
    document.getElementById('updatePanel').hidden = status === 'CLOSED';
    document.getElementById('closedPanel').hidden = status !== 'CLOSED';
    if (OPTIONS[status]) FP.fillSelect(form.status, OPTIONS[status].map(([value, name]) => ({ id: value, name })), null);
    FP.renderDetails(document.getElementById('details'), data, me);
  }

  async function send(status, button) {
    FP.clearErrors(form);
    FP.alert(region, '');
    const note = form.note.value.trim();
    if (status === 'CLOSED' && !note) return FP.fieldError(form, 'note', 'اكتب ملاحظة الحل قبل إغلاق البلاغ');
    FP.busy(button, true);
    try {
      await FP.api(`/api/reports/${id}/status`, { method: 'POST', body: { status, note } });
      form.reset();
      FP.toast(status === 'CLOSED' ? 'تم إغلاق البلاغ' : 'تم تحديث البلاغ');
      await load();
    } catch (err) { FP.showError(form, region, err); } finally { FP.busy(button, false); }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(form.status.value, updateBtn);
  });
  closeBtn.addEventListener('click', () => send('CLOSED', closeBtn));
  await load();
});