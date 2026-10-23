(function () {
  const FP = window.FP = window.FP || {};
  const LOAD_TIMEOUT_MS = 12000;
  const FAIL_MSG = 'تعذر تحميل الخريطة، سيُعتمد موقع المبنى المختار تلقائياً';
  const MAP_OPTIONS = { zoom: 18, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, clickableIcons: false };
  let loading = null;

  FP.CAMPUS = { lat: 30.9168, lng: 41.0638 };

  // يحمّل Google Maps مرة واحدة بوسم script يُنشأ برمجياً، ويعيد null عند غياب المفتاح أو الفشل
  FP.loadMaps = function () {
    if (loading) return loading;
    loading = new Promise((resolve) => {
      let timer = null;
      const done = (ok) => {
        clearTimeout(timer);
        resolve(ok && window.google && window.google.maps ? window.google.maps : null);
      };
      timer = setTimeout(() => done(false), LOAD_TIMEOUT_MS);
      window.gm_authFailure = () => document.dispatchEvent(new Event('fp:maps-failed'));
      FP.api('/api/config/maps').then(({ key }) => {
        if (!key) return done(false);
        window.fpMapsReady = () => done(true);
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=ar&region=SA&loading=async&callback=fpMapsReady`;
        script.async = true;
        script.onerror = () => done(false);
        document.head.append(script);
      }).catch(() => done(false));
    });
    return loading;
  };

  // خريطة اختيار نقطة العطل: نقرة واحدة تضع العلامة، والعلامة قابلة للسحب
  FP.pickerMap = async function (box, msg, start, onPick, failMsg = FAIL_MSG) {
    const maps = await FP.loadMaps();
    if (!maps) {
      box.hidden = true;
      msg.textContent = failMsg;
      return null;
    }
    box.replaceChildren();
    const map = new maps.Map(box, { ...MAP_OPTIONS, center: start });
    const marker = new maps.Marker({ position: start, map, draggable: true });
    const pick = (latLng) => {
      marker.setPosition(latLng);
      onPick({ lat: latLng.lat(), lng: latLng.lng() });
    };
    map.addListener('click', (e) => pick(e.latLng));
    marker.addListener('dragend', (e) => pick(e.latLng));
    document.addEventListener('fp:maps-failed', () => { msg.textContent = failMsg; });
    return {
      moveTo: (pos) => {
        map.setCenter(pos);
        marker.setPosition(pos);
      }
    };
  };

  // خريطة عرض فقط لموقع البلاغ، مع رابط بديل عند تعذر التحميل
  FP.viewMap = async function (box, msg, lat, lng) {
    if (lat === null || lat === undefined) {
      box.hidden = true;
      msg.textContent = 'لم يُحدد موقع على الخريطة';
      return;
    }
    const pos = { lat: Number(lat), lng: Number(lng) };
    const external = FP.h('a', { href: `https://www.google.com/maps?q=${pos.lat},${pos.lng}`, target: '_blank', rel: 'noopener noreferrer', text: 'فتح الموقع في خرائط Google' });
    const maps = await FP.loadMaps();
    if (!maps) {
      box.hidden = true;
      msg.replaceChildren('تعذر تحميل الخريطة حالياً. ', external);
      return;
    }
    const map = new maps.Map(box, { ...MAP_OPTIONS, center: pos });
    new maps.Marker({ position: pos, map });
    msg.replaceChildren(external);
  };
})();