import {angle, angleFromPoint, shape, gridPicture, fraction, stripPicture, ruler, rulerLength, rulerDetail, cup, capacityCases, capacityPair, toggles, svg} from './grade3-core.js';

const random = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = values => values[random(0, values.length - 1)];
function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = random(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
const choice = (kind, prompt, diagram, answer, distractors, solution) =>
  ({kind, prompt, diagram, answer, options: shuffle([answer, ...distractors]), solution});
const number = (kind, prompt, diagram, answer, solution, unit = '') =>
  ({kind, prompt, diagram, answer, solution, unit, integer: true});
const activity = (kind, prompt, solution, interaction) => ({kind, prompt, solution, interaction});
const fields = (kind, prompt, diagram, labels, answer, solution) =>
  ({kind, prompt, diagram, fields: labels, answer, solution});
const pair = (a, b) => `<div class="grade3-pair"><div><strong>甲</strong>${a}</div><div><strong>乙</strong>${b}</div></div>`;
const comparisons = (kind, prompt, diagram, difference, solution) => {
  const options = ['甲比較大', '一樣大', '乙比較大'];
  const answer = options.splice(difference > 0 ? 0 : difference === 0 ? 1 : 2, 1)[0];
  return choice(kind, prompt, diagram, answer, options, solution);
};
const drawTiles = (count, columns, label) => selection => toggles(count, selection, columns, label);
const coloredAngle = (value, length) => angle(value, length, false);
const nonAngle = path => svg(300, 150, `<path d="${path}" fill="none" stroke="#285d48" stroke-width="4"/>`, '線條圖案');

function angles() {
  const degrees = pick([25, 50, 65, 115, 140, 160]);
  const classification = degrees < 90 ? '比直角小' : '比直角大';
  const vertex = `<div class="grade3-point-board">${coloredAngle(45, 82)}
    <button type="button" data-tile="0" style="--x:50%;--y:76.67%" aria-label="甲點" aria-pressed="false">甲</button>
    <button type="button" data-tile="1" style="--x:81.33%;--y:76.67%" aria-label="乙點" aria-pressed="false">乙</button>
    <button type="button" data-tile="2" style="--x:69.33%;--y:38%" aria-label="丙點" aria-pressed="false">丙</button>
  </div>`;
  return [
    choice('認角', '哪一張圖有一個頂點和兩條直直的邊？', '', coloredAngle(degrees, 82),
      [nonAngle('M80 110Q150 20 220 110'), nonAngle('M65 115h70 M157 101l55 -53')], '角的兩條直邊會相接在同一個頂點。'),
    activity('找頂點', '點出角的頂點。', '兩條邊相接的地方就是頂點。', {
      type: 'tiles', draw: () => vertex, single: true, answer: 0
    }),
    choice('比直角', '彩色的開口和虛線直角比起來如何？', angle(degrees), classification,
      ['直角', degrees < 90 ? '比直角大' : '比直角小'], '從相同的頂點和基準邊開始，比一比開口。'),
    activity('調成直角', '拖動端點或用按鈕，把開口調成直角。', '讓兩條邊沿著直角參考線，會看到直角小方框。', {
      type: 'range', label: '調整開口', buttons: ['縮小開口', '放大開口'], min: 15, max: 165, step: 5,
      start: degrees, answer: 90, fromPoint: angleFromPoint, draw: value => angle(value, 82, true, true)
    }),
    comparisons('邊長與開口', '哪個角比較大？', pair(coloredAngle(degrees, 46), coloredAngle(degrees, 94)), 0,
      '兩個角的開口一樣大，邊畫得比較長也不會改變角的大小。')
  ];
}

function areas() {
  const count = random(4, 20), target = random(8, 15);
  const a = random(7, 16), b = a + pick([-2, 0, 2]);
  const type = random(0, 3);
  return [
    number('數方格', '圖形占了幾個小方格？', gridPicture(shape(count, type)), count, '每一小格大小相同。逐格數一次。', '格'),
    activity('拼指定面積', `點亮 ${target} 個小方格。`, `數一數亮起的格子，共要 ${target} 格。`, {
      type: 'tiles', draw: drawTiles(20, 5, '方格'), answer: target
    }),
    comparisons('比較面積', '兩個圖形的面積比起來如何？', pair(gridPicture(shape(a)), gridPicture(shape(b, 1))), a - b,
      `甲有 ${a} 格，乙有 ${b} 格。每格一樣大，可以直接比較格數。`),
    choice('形狀改變', '把甲的方格全部重新排成乙。面積有改變嗎？',
      pair(gridPicture(shape(count)), gridPicture(shape(count, 1))), '面積一樣大', ['面積變大', '面積變小'],
      '換了排法，方格的大小和數量都一樣。'),
    choice('找相同面積', '哪個選項和上方圖形的面積一樣大？', gridPicture(shape(a)),
      gridPicture(shape(a, 1)), [gridPicture(shape(a - 2, 2)), gridPicture(shape(a + 2, 3))], `上方圖形占了 ${a} 格。`)
  ];
}

function fractions() {
  const den = pick([2, 3, 4, 5, 6, 8]), filled = random(1, den - 1);
  const a = random(0, den), b = random(0, den);
  return [
    fields('看圖寫分數', '用分數表示塗色的部分。', stripPicture(den, filled), ['分子', '分母'], [filled, den],
      `平均分成 ${den} 份，塗了 ${filled} 份。分子是 ${filled}，分母是 ${den}。`),
    activity('依分數塗色', `點選長條，塗出 ${fraction(filled, den)}。`, `分母是 ${den}，要塗分子指定的 ${filled} 份。`, {
      type: 'tiles', draw: drawTiles(den, den, '長條的第幾份'), answer: filled
    }),
    number('找分母', '長條平均分成幾份？這個分數的分母是多少？', stripPicture(den, 1), den, '分母表示一個全部平均分成幾份。'),
    comparisons('同分母比較', '哪條長條塗色的部分比較多？', pair(stripPicture(den, a), stripPicture(den, b)), a - b,
      `兩條都平均分成 ${den} 份。比較甲的 ${a} 份和乙的 ${b} 份。`),
    choice('公平分割', '哪條長條分成了一樣大的幾份？', '', stripPicture(den, 1),
      [stripPicture([44, 76, 120], 1), stripPicture([85, 40, 115], 1)], '平均分的每一份都要一樣大。')
  ];
}

function lengths() {
  const length = random(12, 85), start = random(8, 14), a = random(15, 70), b = a + pick([-3, 0, 3]);
  const from = pick([10, 20, 30]), difference = random(12, 60);
  return [
    number('毫米小格', '1 公分有幾毫米？', rulerDetail(), 10, '一公分內有十個小格，每個小格是一毫米。', '毫米'),
    fields('讀尺', '看尺子，物件長幾公分幾毫米？', ruler(length), ['公分', '毫米'],
      [Math.floor(length / 10), length % 10], '先數整公分，再數剩下的小格。'),
    activity('物品對零', '移動物品，讓左端對準尺上的 0 刻度線。', '尺的邊緣留有空白，量長度要從 0 刻度線開始。', {
      type: 'range', label: '移動物品', buttons: ['左移', '右移'], min: -4, max: rulerLength - length, step: 1,
      start, answer: 0, dragHandle: '[data-ruler-object]', fromPoint: x => (x - 32) / 3.1, draw: position => ruler(length, position)
    }),
    choice('比長短', '看刻度，哪個物件比較長？', pair(ruler(a), ruler(b)),
      a > b ? '甲比較長' : a === b ? '一樣長' : '乙比較長',
      (a > b ? ['一樣長', '乙比較長'] : a === b ? ['甲比較長', '乙比較長'] : ['甲比較長', '一樣長']),
      `甲長 ${a} 毫米，乙長 ${b} 毫米。`),
    number('起點不在零', '物件沒有從 0 開始。看兩端的刻度，它長幾毫米？',
      ruler(difference, from), difference, `右端是 ${from + difference} 毫米，左端是 ${from} 毫米，相差 ${difference} 毫米。`, '毫米')
  ];
}

function volumes() {
  const reading = random(0, 4) * 250;
  const large = pick([true, false]);
  const compareCapacity = pick([true, false]);
  const example = pick(capacityCases);
  const answer = compareCapacity || example.bigWater > example.smallWater ? '甲' : '乙';
  return [
    choice('選容量單位', large ? '大水桶的容量通常用哪個單位表示？' : '小藥杯裡的水量通常用哪個單位表示？', '',
      large ? '公升（L）' : '毫升（mL）', [large ? '毫升（mL）' : '公升（L）'], '大水桶常用公升，小藥杯常用毫升。'),
    number('讀量杯刻度', '水面對齊哪一個刻度？', cup(reading), reading, `水面在 ${reading} mL 的刻度。`, 'mL'),
    number('倒杯計數', '每小杯裝 250 mL。倒幾個裝滿的小杯，剛好有 1 L？', pair(cup(250, 250, 250, true, 1000), cup(0)), 4,
      '250、500、750、1000，倒四杯剛好是 1000 mL。', '杯'),
    number('公升與毫升', '1 L 等於多少 mL？', cup(1000), 1000, '四杯 250 mL 加起來是 1000 mL，裝滿 1 L 量杯。', 'mL'),
    choice('容量與水量', compareCapacity ? '哪個容器最多能裝的水比較多？' : '哪個容器現在裝的水比較多？',
      capacityPair(example), answer, [answer === '甲' ? '乙' : '甲'],
      compareCapacity ? '比較標示「最多」的毫升數。' : '比較標示「目前」的毫升數。')
  ];
}

export const grade3Generators = {
  'g3-angle': angles, 'g3-area': areas, 'g3-fractions': fractions, 'g3-millimeter': lengths, 'g3-volume': volumes
};
