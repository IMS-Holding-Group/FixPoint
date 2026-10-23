(function () {
  const FP = window.FP = window.FP || {};

  FP.STATUS = { OPEN: 'مفتوح', IN_PROGRESS: 'قيد المعالجة', CLOSED: 'مغلق' };
  FP.PRIORITY = { LOW: 'منخفضة', MEDIUM: 'متوسطة', HIGH: 'عالية', URGENT: 'عاجلة' };
  FP.ROLE = { REPORTER: 'مبلِّغ', STAFF: 'موظف صيانة', ADMIN: 'مدير النظام' };

  const NAV = {
    REPORTER: [['/home.html', 'الرئيسية', 'home'], ['/new-report.html', 'بلاغ جديد', 'plus'], ['/my-reports.html', 'بلاغاتي', 'list'], ['/profile.html', 'الملف الشخصي', 'user']],
    STAFF: [['/queue.html', 'قائمة العمل', 'inbox'], ['/staff-report.html', 'تفاصيل البلاغ والتحديث', 'file'], ['/closed.html', 'البلاغات المغلقة', 'archive']],
    ADMIN: [['/dashboard.html', 'لوحة التحكم', 'chart'], ['/admin-reports.html', 'كل البلاغات', 'list'], ['/users.html', 'المستخدمون', 'users'], ['/buildings.html', 'المباني والمواقع', 'building'], ['/categories.html', 'التصنيفات وقواعد التوجيه', 'tag'], ['/departments.html', 'الأقسام', 'layers']]
  };

  // ينشئ عنصراً بنصوص آمنة عبر textContent فقط، دون innerHTML
  FP.h = function (tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : String(child));
    }
    return node;
  };

  FP.td = (...children) => FP.h('td', null, ...children);
  FP.param = (name) => new URLSearchParams(location.search).get(name);
  FP.status = (s) => FP.h('span', { class: `status status-${String(s).toLowerCase()}` }, FP.h('span', { class: 'dot', 'aria-hidden': 'true' }), FP.STATUS[s] || s);
  FP.priority = (p) => FP.h('span', { class: `priority priority-${String(p).toLowerCase()}` }, FP.PRIORITY[p] || p);
  FP.place = (r) => [r.building, r.floor, r.room_name].filter(Boolean).join(' - ');
  FP.pct = (n, total) => `${n} (${total ? Math.round((n / total) * 1000) / 10 : 0}%)`;
  FP.reportLink = (id, page = '/report.html') => FP.h('a', { href: `${page}?id=${encodeURIComponent(id)}`, text: `#${id}` });

  FP.renderNav = function (me) {
    const current = location.pathname;
    document.getElementById('topbar').replaceChildren(FP.h('div', { class: 'topbar-inner' },
      FP.h('a', { class: 'brand', href: me.home, 'aria-label': 'FixPoint - الصفحة الرئيسية' }, FP.h('img', { src: '/assets/images/logo.png', alt: 'FixPoint' })),
      FP.h('div', { class: 'topbar-user' },
        FP.h('a', { href: '/profile.html', title: 'الملف الشخصي' }, FP.icon('user', 18), FP.h('span', { class: 'user-name', text: me.user.full_name })),
        FP.h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: FP.logout }, FP.icon('logout', 18), 'تسجيل الخروج'))));
    document.getElementById('mainnav').replaceChildren(FP.h('div', { class: 'mainnav-inner' },
      NAV[me.user.role].map(([href, label, icon]) => FP.h('a', { href, class: current === href ? 'active' : null, 'aria-current': current === href ? 'page' : null }, FP.icon(icon, 18), label))));
  };

  // نقطة بدء كل صفحة محمية: جلب المستخدم ورسم قائمة دوره ثم تنفيذ منطق الصفحة
  FP.page = function (init) {
    FP.requireSession = true;
    FP.me().then((me) => {
      FP.renderNav(me);
      return init(me);
    }).catch((err) => FP.alert(FP.pageAlert(), err.message));
  };

  FP.pageAlert = function () {
    let region = document.getElementById('pageAlert');
    if (!region) {
      region = FP.h('div', { id: 'pageAlert' });
      document.getElementById('main').prepend(region);
    }
    return region;
  };

  FP.alert = function (region, message, type = 'error') {
    if (!message) return region.replaceChildren();
    const icon = { error: 'alert', success: 'check', info: 'info', warn: 'alert' }[type];
    region.replaceChildren(FP.h('div', { class: `alert alert-${type}`, role: type === 'error' ? 'alert' : 'status' }, FP.icon(icon, 20), FP.h('span', { text: message })));
  };

  FP.toast = function (message) {
    const node = FP.h('div', { class: 'toast', role: 'status', text: message });
    document.body.append(node);
    setTimeout(() => node.remove(), 3200);
  };

  FP.busy = function (button, busy) {
    button.disabled = busy;
    button.setAttribute('aria-busy', busy ? 'true' : 'false');
  };

  FP.clearErrors = function (form) {
    form.querySelectorAll('.is-invalid').forEach((node) => {
      node.classList.remove('is-invalid');
      node.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.field-error').forEach((node) => node.replaceChildren());
  };

  // يبرز الحقل المسؤول عن الخطأ ويعرض الرسالة تحته
  FP.fieldError = function (form, name, message) {
    const input = form.elements[name];
    if (!input || !input.classList) return false;
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    const box = input.closest('.field') && input.closest('.field').querySelector('.field-error');
    if (box) box.textContent = message;
    input.focus();
    return true;
  };

  FP.showError = function (form, region, err) {
    FP.clearErrors(form);
    if (err.field && FP.fieldError(form, err.field, err.message)) FP.alert(region, '');
    else FP.alert(region, err.message);
  };

  FP.formObject = function (form) {
    const data = {};
    for (const [key, value] of new FormData(form)) data[key] = typeof value === 'string' ? value.trim() : value;
    return data;
  };

  FP.query = function (form) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) if (String(value).trim()) params.set(key, String(value).trim());
    return params;
  };

  FP.fillSelect = function (select, items, placeholder, value = (i) => i.id, label = (i) => i.name) {
    const current = select.value;
    const first = placeholder === null ? [] : [FP.h('option', { value: '', text: placeholder })];
    select.replaceChildren(...first, ...items.map((item) => FP.h('option', { value: value(item), text: label(item) })));
    if ([...select.options].some((o) => o.value === current)) select.value = current;
  };

  FP.passwordToggles = function (root = document) {
    root.querySelectorAll('.password-toggle').forEach((button) => {
      const input = button.parentElement.querySelector('input');
      button.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.setAttribute('aria-pressed', show ? 'true' : 'false');
        button.setAttribute('aria-label', show ? 'إخفاء كلمة السر' : 'إظهار كلمة السر');
        button.replaceChildren(FP.icon(show ? 'eyeOff' : 'eye', 20));
      });
    });
  };

  FP.loadingRows = (tbody, colspan) => tbody.replaceChildren(...[1, 2, 3].map(() => FP.h('tr', null, FP.h('td', { colspan }, FP.h('div', { class: 'skeleton' })))));

  FP.fillTable = function (tbody, rows, makeRow, emptyText, colspan) {
    if (!rows.length) return tbody.replaceChildren(FP.h('tr', null, FP.h('td', { colspan, class: 'empty-cell' }, FP.h('div', { class: 'empty' }, FP.icon('inbox', 32), FP.h('span', { text: emptyText })))));
    tbody.replaceChildren(...rows.map(makeRow));
  };

  FP.pager = function (container, data, onPage) {
    const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
    container.replaceChildren(
      FP.h('span', { class: 'pager-info', text: `صفحة ${data.page} من ${pages} - إجمالي ${data.total}` }),
      FP.h('div', { class: 'pager-actions' },
        FP.h('button', { type: 'button', class: 'btn btn-ghost btn-sm', disabled: data.page <= 1, onclick: () => onPage(data.page - 1) }, 'السابق'),
        FP.h('button', { type: 'button', class: 'btn btn-ghost btn-sm', disabled: data.page >= pages, onclick: () => onPage(data.page + 1) }, 'التالي')));
  };

  // قائمة مرقّمة من الخادم مع فلاتر نموذج اختيارية
  FP.listPage = function ({ url, form, tbody, pager, colspan, row, empty, region, onData }) {
    let page = 1;
    async function load(p = page) {
      page = p;
      const params = form ? FP.query(form) : new URLSearchParams();
      params.set('page', page);
      FP.loadingRows(tbody, colspan);
      try {
        const data = await FP.api(`${url}?${params}`);
        FP.alert(region, '');
        FP.fillTable(tbody, data.items, row, empty, colspan);
        FP.pager(pager, data, load);
        if (onData) onData(data);
      } catch (err) {
        tbody.replaceChildren();
        FP.alert(region, err.message);
      }
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        load(1);
      });
      form.addEventListener('reset', () => setTimeout(() => load(1)));
    }
    load(1);
    return { reload: () => load() };
  };

  // إضافة وتعديل وحذف موحد لصفحات الإدارة عبر نافذة dialog
  FP.crud = function ({ endpoint, key, tbody, pager, colspan, columns, dialog, region, labels, empty, fill, payload, filters, onOpen, onChange, deleteText }) {
    const form = dialog.querySelector('form');
    const modalAlert = dialog.querySelector('.modal-alert');
    const submit = form.querySelector('[type=submit]');
    let editing = null;
    const actions = (r) => FP.h('td', null, FP.h('div', { class: 'actions-cell' },
      FP.h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => open(r) }, FP.icon('edit', 16), 'تعديل'),
      FP.h('button', { type: 'button', class: 'btn btn-danger btn-sm', onclick: () => remove(r) }, FP.icon('trash', 16), 'حذف')));
    const list = FP.listPage({ url: endpoint, form: filters, tbody, pager, colspan, region, empty, row: (r) => FP.h('tr', null, columns.map((c) => FP.td(c(r))), actions(r)) });
    function open(row = null) {
      editing = row;
      form.reset();
      FP.clearErrors(form);
      FP.alert(modalAlert, '');
      dialog.querySelector('.modal-title').textContent = row ? labels.edit : labels.add;
      if (row && fill) fill(form, row);
      dialog.showModal();
      if (onOpen) onOpen(row, form);
    }
    async function remove(row) {
      if (!window.confirm(deleteText(row))) return;
      try {
        await FP.api(`${endpoint}/${row[key]}`, { method: 'DELETE' });
        FP.alert(region, '');
        FP.toast('تم الحذف');
        list.reload();
        if (onChange) onChange();
      } catch (err) { FP.alert(region, err.message); }
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      FP.clearErrors(form);
      FP.busy(submit, true);
      try {
        await FP.api(editing ? `${endpoint}/${editing[key]}` : endpoint, { method: editing ? 'PUT' : 'POST', body: (payload || FP.formObject)(form, editing) });
        dialog.close();
        FP.toast(editing ? 'تم حفظ التعديلات' : 'تمت الإضافة');
        list.reload();
        if (onChange) onChange();
      } catch (err) { FP.showError(form, modalAlert, err); } finally { FP.busy(submit, false); }
    });
    dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    return { open, reload: list.reload };
  };

  // عرض تفاصيل البلاغ المشترك بين صفحة المبلِّغ والمدير وصفحة الموظف
  FP.renderDetails = function (container, data, me) {
    const r = data.report;
    const rows = [
      ['رقم البلاغ', `#${r.report_id}`], ['الحالة', FP.status(r.status)], ['الأولوية', FP.priority(r.priority)], ['التصنيف', r.category],
      ['القسم المسؤول', r.department], ['الموقع', FP.place(r)], ['تاريخ الإنشاء', FP.dt(r.created_at)], ['تاريخ الإغلاق', FP.dt(r.closed_at)],
      ['المسؤول عن المعالجة', r.assignee || 'لم يُحدد بعد']
    ];
    if (me.user.role !== 'REPORTER') rows.splice(6, 0, ['المبلِّغ', `${r.reporter} (${r.reporter_uid})`]);
    const images = data.images.length
      ? FP.h('div', { class: 'thumbs' }, data.images.map((img, i) => FP.h('a', { class: 'thumb', href: `/api/images/${img.image_id}`, target: '_blank', rel: 'noopener' }, FP.h('img', { src: `/api/images/${img.image_id}`, alt: `صورة ${i + 1} من البلاغ`, loading: 'lazy' }))))
      : FP.h('div', { class: 'empty' }, FP.icon('image', 32), FP.h('span', { text: 'لا توجد صور مرفقة' }));
    const mapBox = FP.h('div', { class: 'map-box' });
    const mapMsg = FP.h('p', { class: 'hint map-msg' });
    const history = FP.h('ol', { class: 'history' }, data.history.map((h) => FP.h('li', null,
      FP.h('div', { class: 'history-head' },
        FP.h('span', { class: 'history-change' }, h.old_status && h.old_status !== h.new_status ? [FP.status(h.old_status), FP.h('span', { 'aria-label': 'إلى', text: '←' }), FP.status(h.new_status)] : FP.status(h.new_status)),
        FP.h('span', { class: 'history-meta' }, h.changed_by_name, ' - ', FP.dt(h.changed_at))),
      h.note ? FP.h('p', { class: 'history-note', text: h.note }) : null)));
    container.replaceChildren(
      FP.h('section', { class: 'panel' }, FP.h('h2', { text: 'بيانات البلاغ' }), FP.h('dl', { class: 'details' }, rows.map(([k, val]) => FP.h('div', null, FP.h('dt', { text: k }), FP.h('dd', null, val)))),
        FP.h('h3', { class: 'mt', text: 'وصف المشكلة' }), FP.h('p', { class: 'description', text: r.description })),
      FP.h('div', { class: 'grid-2' },
        FP.h('section', { class: 'panel' }, FP.h('h2', { text: 'الصور المرفقة' }), images),
        FP.h('section', { class: 'panel' }, FP.h('h2', { text: 'موقع العطل' }), mapBox, mapMsg)),
      FP.h('section', { class: 'panel mt' }, FP.h('h2', { text: 'سجل الحالة' }), history));
    if (FP.viewMap) FP.viewMap(mapBox, mapMsg, r.latitude, r.longitude);
  };

  FP.hydrateIcons();
})();