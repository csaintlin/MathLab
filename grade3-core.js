const ink = '#285d48';
const green = '#a9d3b4';
const blue = '#80c9df';
const gold = '#f1d486';

export const svg = (width, height, content, label) =>
  `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">${content}</svg>`;
const line = (x1, y1, x2, y2, attrs = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" ${attrs}/>`;
const rect = (x, y, width, height, fill, attrs = '') =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" ${attrs}/>`;
const label = (x, y, text, size = 14) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${ink}">${text}</text>`;

export function angle(degrees, length = 82, reference = true, handle = false) {
  const x = 150, y = 115;
  const point = r => [x + r * Math.cos(degrees * Math.PI / 180), y - r * Math.sin(degrees * Math.PI / 180)];
  const [endX, endY] = point(length);
  const arc = point(34).join(' ');
  return svg(300, 150, `
    <path d="M150 115h34 A34 34 0 0 0 ${arc} Z" fill="${gold}" opacity=".7"/>
    ${reference ? line(x, y, x, 15, 'stroke-dasharray="4 4" opacity=".5"') : ''}
    ${reference ? '<path d="M150 95h20v20" fill="none" stroke="#285d48" stroke-dasharray="4 4" opacity=".55"/>' : ''}
    ${line(x, y, x + 94, y, 'stroke-width="3"')}
    ${line(x, y, endX, endY, 'stroke-width="3"')}
    ${degrees === 90 && reference ? '<path d="M150 103h12v12" fill="none" stroke="#285d48" stroke-width="2"/>' : ''}
    <circle cx="${x}" cy="${y}" r="4" fill="${ink}"/>
    ${handle ? `<circle cx="${endX}" cy="${endY}" r="22" fill="transparent" data-angle-handle/>
      <circle cx="${endX}" cy="${endY}" r="8" fill="${ink}" pointer-events="none"/>` : ''}
  `, '有一個頂點和兩條邊的角');
}

export function angleFromPoint(x, y) {
  const raw = Math.atan2(115 - y, x - 150) * 180 / Math.PI;
  return Math.max(15, Math.min(165, Math.round((y > 115 ? x < 150 ? 180 : 0 : raw) / 5) * 5));
}

export function shape(size, type = 0) {
  return Array.from({length: size}, (_, index) => {
    const width = [5, 4, 6, 3][type];
    const row = Math.floor(index / width);
    const col = index % width;
    return (type === 1 ? col : row) * 8 + (type === 1 ? row : col) + (type === 2 ? row : 0);
  });
}

export function gridPicture(cells, counted = 0) {
  const ordered = [...cells].sort((a, b) => a - b);
  const columns = Math.max(1, ...ordered.map(i => i % 8 + 1));
  const rows = Math.max(1, ...ordered.map(i => Math.floor(i / 8) + 1));
  const x = (160 - columns * 16) / 2, y = (144 - rows * 16) / 2;
  return svg(160, 144, ordered.map((cell, index) => {
    const left = x + cell % 8 * 16, top = y + Math.floor(cell / 8) * 16;
    return rect(left, top, 16, 16, index < counted ? gold : green, `stroke="${ink}"`)
      + (index < counted ? label(left + 8, top + 12, index + 1, 9) : '');
  }).join(''), '由相同大小的方格拼成的圖形');
}

export const fraction = (top, bottom) => `<span class="grade3-fraction" aria-label="${bottom} 分之 ${top}"><span>${top}</span><span>${bottom}</span></span>`;
export function stripPicture(parts, filled = 0, compareWidths = false) {
  const widths = Array.isArray(parts) ? parts : Array(parts).fill(240 / parts);
  let x = 20;
  const blocks = widths.map((width, index) => {
    const block = rect(x, 14, width, 30, index < filled ? green : 'white', `stroke="${ink}"`);
    const guide = compareWidths
      ? line(20, 57 + index * 19, 20 + width, 57 + index * 19, 'stroke-width="4"')
        + label(20 + width + 12, 61 + index * 19, index + 1, 11)
      : '';
    x += width;
    return block + guide;
  });
  return svg(280, compareWidths ? 108 : 58, blocks.join(''), compareWidths ? '三段長度從同一起點排開比較' : '分割長條');
}

export const rulerLength = 100;
export const rulerOrigin = 32;
export const rulerUnit = 3.1;
export const rulerLensRadius = 12;

export function ruler(length, start = 0, object = '鉛筆', showRemainder = false, lens = null, enlarged = false) {
  const x = rulerOrigin, unit = rulerUnit, zero = x;
  const left = x + start * unit, right = left + length * unit;
  let art = rect(zero - 15, 12, rulerLength * unit + 30, 43, '#fffdf6', `rx="4" stroke="${ink}"`);
  if (showRemainder && length % 10) {
    const width = (length % 10) * unit;
    art += rect(right - width, 42, width, 11, gold);
  }
  for (let mm = 0; mm <= rulerLength; mm++) {
    const pos = zero + mm * unit;
    art += line(pos, 53, pos, mm % 10 === 0 ? 31 : mm % 5 === 0 ? 39 : 45, mm === 0 ? 'stroke-width="3"' : '');
    if (mm % 10 === 0) art += label(pos, 25, mm / 10, 11);
  }
  if (lens !== null && !enlarged) {
    const from = Math.max(0, lens - rulerLensRadius);
    const to = Math.min(rulerLength, lens + rulerLensRadius);
    art += rect(x + from * unit, 12, (to - from) * unit, 43, '#80c9df', 'fill-opacity=".18" stroke="#477d94" rx="2"');
    art += line(x + lens * unit, 13, x + lens * unit, 54, 'stroke="#477d94" stroke-dasharray="2 2"');
  }
  art += rect(zero - 15, 12, rulerLength * unit + 30, 43, 'transparent', 'data-ruler-scale');
  const width = length * unit;
  const drawing = object === '迴紋針'
    ? `<path d="M78 8H14Q1 8 1 16Q1 24 14 24H86Q99 24 99 14Q99 5 86 5H28Q18 5 18 11Q18 17 28 17H74" fill="none" stroke="#477d94" stroke-width="3" vector-effect="non-scaling-stroke"/>`
    : object === '橡皮擦'
      ? `<rect x="0" y="4" width="100" height="21" rx="5" fill="#efa9ae" stroke="${ink}"/><path d="M24 4h45v21H24z" fill="#f9e4ab"/>`
      : `<path d="M0 5h82l18 9-18 9H0z" fill="#f1d486" stroke="${ink}"/><path d="M0 5h15v18H0z" fill="#efa9ae"/><path d="M82 5l18 9-18 9z" fill="#ead5ac"/><path d="M94 11l6 3-6 3z" fill="${ink}"/>`;
  art += line(zero, 54, zero, 84, 'stroke-width="2" stroke-dasharray="4 2"')
    + line(left, 55, left, 84, 'stroke-dasharray="3 2"')
    + line(right, enlarged ? 30 : 55, right, 84, 'stroke-dasharray="3 2"')
    + `<g data-ruler-object transform="translate(${left} 55) scale(${width / 100} 1)">
      <rect width="100" height="33" fill="transparent"/>${drawing}</g>`
    + label((left + right) / 2, 101, object, 13);
  if (enlarged) {
    const viewLeft = x + (lens - rulerLensRadius) * unit;
    const viewWidth = 2 * rulerLensRadius * unit;
    return `<svg viewBox="${viewLeft} 11 ${viewWidth} 75" role="img" aria-label="游標前後各 12 毫米的尺面放大圖">${art}</svg>`;
  }
  return svg(395, 109, art, '毫米刻度尺與標出兩端的物件');
}

export function rulerDetail(showMillimeter = false) {
  const ticks = Array.from({length: 11}, (_, i) => {
    const x = 24 + i * 23;
    const top = i % 10 === 0 ? 25 : i === 5 ? 32 : 39;
    return line(x, top, x, 51, 'stroke-width="1.6"');
  }).join('');
  const annotation = showMillimeter
    ? '<path d="M24 58v6h23v-6 M35.5 64v5" fill="none" stroke="#285d48" stroke-width="2"/>'
      + label(35.5, 85, '1 毫米', 12)
    : '';
  return svg(290, showMillimeter ? 92 : 59,
    rect(12, 4, 266, 49, '#fffdf6', `rx="5" stroke="${ink}"`)
      + ticks + label(24, 19, '0', 13) + label(254, 19, '1 公分', 13) + annotation,
    '尺上零到一公分的刻度，十一條刻度線分出十個等長間距');
}

export function cup(amount, capacity = 1000, step = 250, showNumbers = true, referenceCapacity = capacity) {
  const water = 132 * amount / referenceCapacity;
  let marks = '';
  for (let value = 0; value <= capacity; value += step) {
    const y = 150 - 132 * value / referenceCapacity;
    marks += line(93, y, 109, y) + (showNumbers ? label(138, y + 4, value, 13) : '');
  }
  const rim = 150 - 132 * capacity / referenceCapacity;
  return svg(175, 174, `
    ${rect(31, rim, 62, 150 - rim, '#eef5ef')}
    ${rect(31, 150 - water, 62, water, blue, 'class="grade3-water"')}
    <path d="M31 ${rim}V150h62V${rim}" fill="none" stroke="${ink}" stroke-width="2"/>
    ${marks}${label(138, 171, 'mL', 12)}
  `, '有刻度的量杯');
}

export const capacityCases = [
  { big: 1500, bigWater: 500, small: 750, smallWater: 750 },
  { big: 2000, bigWater: 750, small: 1000, smallWater: 1000 },
  { big: 1000, bigWater: 500, small: 750, smallWater: 250 }
];

export function capacityPair({big, bigWater, small, smallWater}) {
  return `<div class="grade3-pair">
    <div><strong>甲</strong>${cup(bigWater, big, 250, false, big)}<p>最多 ${big} mL<br>目前 ${bigWater} mL</p></div>
    <div><strong>乙</strong>${cup(smallWater, small, 250, false, big)}<p>最多 ${small} mL<br>目前 ${smallWater} mL</p></div>
  </div>`;
}

export function toggles(count, selected, columns, name) {
  return `<div class="grade3-tiles" style="--columns:${columns}">${Array.from({length: count}, (_, index) =>
    `<button type="button" data-tile="${index}" aria-label="${name} ${index + 1}" aria-pressed="${selected.has(index)}"></button>`).join('')}</div>`;
}
