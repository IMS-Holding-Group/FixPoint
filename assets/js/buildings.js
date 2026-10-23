FP.page(async () => {
  const buildingDialog = document.getElementById('buildingDialog');
  const locationDialog = document.getElementById('locationDialog');
  const locationFilters = document.getElementById('locationFilters');
  let pickerPromise = null;
  let locations = null;

  const setPoint = (form, p) => {
    form.latitude.value = p.lat.toFixed(6);
    form.longitude.value = p.lng.toFixed(6);
  };

  // قوائم المباني في فلتر المواقع ونافذة الموقع تتحدث بعد أي تعديل على المباني
  async function refreshBuildingSelects() {
    const data = await FP.api('/api/admin/buildings?pageSize=50');
    const label = (b) => `${b.name} (${b.code})`;
    FP.fillSelect(locationFilters.building_id, data.items, null, (b) => b.building_id, label);
    FP.fillSelect(locationDialog.querySelector('form').building_id, data.items, 'اختر المبنى', (b) => b.building_id, label);
  }

  const buildings = FP.crud({
    endpoint: '/api/admin/buildings',
    key: 'building_id',
    tbody: document.getElementById('buildingRows'),
    pager: document.getElementById('buildingPager'),
    region: document.getElementById('listAlert'),
    colspan: 3,
    dialog: buildingDialog,
    labels: { add: 'إضافة مبنى', edit: 'تعديل مبنى' },
    empty: 'لا توجد مبانٍ',
    columns: [(b) => b.code, (b) => b.name],
    fill: (f, b) => {
      f.code.value = b.code;
      f.name.value = b.name;
    },
    onOpen: async (b, f) => {
      const pos = b ? { lat: Number(b.latitude), lng: Number(b.longitude) } : FP.CAMPUS;
      setPoint(f, pos);
      pickerPromise = pickerPromise || FP.pickerMap(document.getElementById('buildingMap'), document.getElementById('buildingMapMsg'), pos, (p) => setPoint(f, p), 'تعذر تحميل الخريطة، سيُحفظ الموقع الحالي للمبنى أو موقع الجامعة الافتراضي');
      const picker = await pickerPromise;
      if (picker) picker.moveTo(pos);
    },
    onChange: async () => {
      await refreshBuildingSelects();
      if (locations) locations.reload();
    },
    deleteText: (b) => `حذف ${b.name}؟`
  });

  await refreshBuildingSelects();
  locationFilters.building_id.addEventListener('change', () => locations.reload());

  locations = FP.crud({
    endpoint: '/api/admin/locations',
    key: 'location_id',
    tbody: document.getElementById('locationRows'),
    pager: document.getElementById('locationPager'),
    region: document.getElementById('locationAlert'),
    filters: locationFilters,
    colspan: 4,
    dialog: locationDialog,
    labels: { add: 'إضافة موقع', edit: 'تعديل موقع' },
    empty: 'لا توجد مواقع لهذا المبنى',
    columns: [(l) => l.building_name, (l) => l.floor, (l) => l.room_name || '-'],
    fill: (f, l) => {
      f.building_id.value = l.building_id;
      f.floor.value = l.floor;
      f.room_name.value = l.room_name || '';
    },
    onOpen: (l, f) => { if (!l) f.building_id.value = locationFilters.building_id.value; },
    deleteText: (l) => `حذف الموقع ${[l.floor, l.room_name].filter(Boolean).join(' - ')}؟`
  });

  document.getElementById('addBuilding').addEventListener('click', () => buildings.open());
  document.getElementById('addLocation').addEventListener('click', () => locations.open());
});