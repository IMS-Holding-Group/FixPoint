FP.page(async () => {
  const MAX_FILES = 5;
  const MAX_BYTES = 5 * 1024 * 1024;
  const MAX_SIDE = 1600;
  const TYPES = ['image/jpeg', 'image/png'];
  const form = document.getElementById('reportForm');
  const region = document.getElementById('formAlert');
  const submit = form.querySelector('[type=submit]');
  const thumbs = document.getElementById('thumbs');
  const counter = document.getElementById('descCounter');
  const files = [];
  let pickerPromise = null;

  const { categories, buildings, locations } = await FP.api('/api/meta/form-data');
  FP.fillSelect(form.category_id, categories, 'اختر التصنيف');
  FP.fillSelect(form.building_id, buildings, 'اختر المبنى', (b) => b.id, (b) => `${b.name} (${b.code})`);

  const updateCounter = () => { counter.textContent = `${form.description.value.length} / 1000`; };
  form.description.addEventListener('input', updateCounter);

  const setPoint = (p) => {
    form.latitude.value = p.lat.toFixed(6);
    form.longitude.value = p.lng.toFixed(6);
  };

  form.building_id.addEventListener('change', async () => {
    const building = buildings.find((b) => String(b.id) === form.building_id.value);
    const list = building ? locations.filter((l) => l.building_id === building.id) : [];
    FP.fillSelect(form.location_id, list, building ? 'اختر الدور أو الغرفة' : 'اختر المبنى أولاً', (l) => l.id, (l) => (l.room_name ? `${l.floor} - ${l.room_name}` : l.floor));
    form.location_id.disabled = !building;
    if (!building) return;
    const pos = { lat: Number(building.latitude), lng: Number(building.longitude) };
    setPoint(pos);
    pickerPromise = pickerPromise || FP.pickerMap(document.getElementById('map'), document.getElementById('mapMsg'), pos, setPoint);
    const picker = await pickerPromise;
    if (picker) picker.moveTo(pos);
  });

  // ضغط الصورة في المتصفح: أطول ضلع 1600 بكسل وجودة 0.8، ويُبقى الأصل إن كان أصغر
  function compress(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob && blob.size < file.size ? blob : file), file.type, 0.8);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('invalid image'));
      };
      img.src = url;
    });
  }

  function renderThumbs() {
    thumbs.replaceChildren(...files.map((f, i) => FP.h('figure', { class: 'thumb' },
      FP.h('img', { src: f.url, alt: `معاينة الصورة ${i + 1}` }),
      FP.h('figcaption', null, FP.h('button', { type: 'button', class: 'btn btn-danger btn-sm', onclick: () => removeFile(i) }, FP.icon('x', 16), 'حذف')))));
  }

  function removeFile(index) {
    URL.revokeObjectURL(files[index].url);
    files.splice(index, 1);
    renderThumbs();
  }

  form.images.addEventListener('change', async () => {
    const picked = Array.from(form.images.files);
    form.images.value = '';
    FP.clearErrors(form);
    for (const file of picked) {
      if (files.length >= MAX_FILES) {
        FP.fieldError(form, 'images', 'الحد الأقصى 5 صور للبلاغ الواحد');
        break;
      }
      if (!TYPES.includes(file.type)) {
        FP.fieldError(form, 'images', 'يُسمح بصور JPEG أو PNG فقط');
        continue;
      }
      if (file.size > MAX_BYTES) {
        FP.fieldError(form, 'images', 'حجم الصورة يتجاوز 5 ميجابايت');
        continue;
      }
      try {
        const blob = await compress(file);
        files.push({ blob, type: file.type, url: URL.createObjectURL(blob) });
      } catch { FP.fieldError(form, 'images', 'تعذر قراءة الصورة، اختر صورة أخرى'); }
    }
    renderThumbs();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FP.clearErrors(form);
    FP.alert(region, '');
    const checks = [['category_id', 'اختر تصنيف المشكلة'], ['description', 'اكتب وصفاً للمشكلة'], ['building_id', 'اختر المبنى'], ['location_id', 'اختر الدور أو الغرفة']];
    for (const [name, message] of checks) if (!form.elements[name].value.trim()) return FP.fieldError(form, name, message);
    if (form.description.value.trim().length < 5) return FP.fieldError(form, 'description', 'الوصف قصير جداً، أضف تفاصيل أكثر عن المشكلة');
    if (!files.length) return FP.fieldError(form, 'images', 'أرفق صورة واحدة على الأقل للمشكلة');
    const data = new FormData();
    for (const name of ['category_id', 'priority', 'description', 'location_id', 'latitude', 'longitude']) data.append(name, form.elements[name].value.trim());
    files.forEach((f, i) => data.append('images', f.blob, `image-${i + 1}.${f.type === 'image/png' ? 'png' : 'jpg'}`));
    FP.busy(submit, true);
    try {
      const res = await FP.api('/api/reports', { method: 'POST', form: data });
      form.hidden = true;
      document.getElementById('successTitle').textContent = `تم استلام بلاغك رقم ${res.report_id}`;
      document.getElementById('successStatus').replaceChildren('حالة البلاغ: ', FP.status(res.status));
      document.getElementById('successLink').href = `/report.html?id=${res.report_id}`;
      document.getElementById('success').hidden = false;
      window.scrollTo(0, 0);
    } catch (err) { FP.showError(form, region, err); } finally { FP.busy(submit, false); }
  });
});