(function () {
  const FP = window.FP = window.FP || {};
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = { blue: '#083680', orange: '#F07820' };

  const svgEl = function (tag, attrs, text) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // رسم أعمدة أفقية بـ SVG: التسمية يميناً والعمود يمتد يساراً والقيمة الرقمية في نهايته
  FP.barChart = function (container, data, color = 'blue', title = '') {
    if (!data.length) {
      container.replaceChildren(FP.h('div', { class: 'empty' }, FP.icon('chart', 32), FP.h('span', { text: 'لا توجد بيانات بعد' })));
      return;
    }
    const width = 640;
    const rowHeight = 38;
    const labelWidth = 190;
    const valueSpace = 44;
    const height = data.length * rowHeight + 8;
    const barMax = width - labelWidth - valueSpace - 12;
    const max = Math.max(1, ...data.map((d) => d.value));
    const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': title });
    data.forEach((d, i) => {
      const y = i * rowHeight + 6;
      const barWidth = Math.max(3, Math.round((d.value / max) * barMax));
      const label = d.label.length > 24 ? `${d.label.slice(0, 23)}…` : d.label;
      const group = svgEl('g', {});
      group.append(svgEl('title', {}, `${d.label}: ${d.value}`));
      group.append(svgEl('text', { x: width - 4, y: y + 19, 'text-anchor': 'end' }, label));
      group.append(svgEl('rect', { x: width - labelWidth - barWidth, y: y + 4, width: barWidth, height: 22, rx: 4, fill: COLORS[color] || COLORS.blue }));
      group.append(svgEl('text', { class: 'chart-value', x: width - labelWidth - barWidth - 8, y: y + 20, 'text-anchor': 'end' }, String(d.value)));
      svg.append(group);
    });
    container.replaceChildren(svg);
  };
})();