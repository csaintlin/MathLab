const mode = document.body.dataset.numberLab;
const $ = id => document.getElementById(id);
const board = $('number-board');
const isFactor = mode === 'factors';
const isMultiple = mode === 'common-multiples';
let a = isMultiple ? 4 : 12;
let b = isMultiple ? 6 : 18;
let size = 1;
let tested = new Set();
let found = new Set();
let pairs = new Set();
let steps = [0, 0];
const gcd = (x, y) => y ? gcd(y, x % y) : x;
const lcm = () => a / gcd(a, b) * b;
const limit = () => isFactor ? a : Math.min(a, b);
const chips = values => [...values].sort((x, y) => x - y).map(n => `<span class="factor-chip">${n}</span>`).join('');
function element(className, x, y, w, h, text = '') {
  const el = document.createElement('span');
  el.className = className;
  Object.assign(el.style, {left: `${x}px`, top: `${y}px`});
  if (w) el.style.width = `${w}px`;
  if (h) el.style.height = `${h}px`;
  el.textContent = text;
  board.append(el);
  return el;
}
function read(input, max) {
  const text = input.value.trim();
  if (!/^\d+$/.test(text) || +text < 1 || +text > max) {
    $('input-error').textContent = `請填入 1～${max} 的整數。`;
    input.setAttribute('aria-invalid', 'true');
    return null;
  }
  input.removeAttribute('aria-invalid');
  $('input-error').textContent = '';
  return +text;
}
function clearExploration() {
  tested = new Set(); found = new Set(); pairs = new Set(); steps = [0, 0]; size = 1;
  if ($('size')) $('size').value = size;
  render();
}
function setSize(n) {
  size = Math.max(1, Math.min(limit(), n));
  $('size').value = size;
  render();
}
function drawFactors() {
  // Keep the same numbered dots while moving them into new complete groups.
  board.querySelectorAll(':scope > :not(.dot)').forEach(el => el.remove());
  let dots = [...board.querySelectorAll('.dot')];
  while (dots.length > a) dots.pop().remove();
  while (dots.length < a) dots.push(element('dot', 0, 0));
  const width = Math.max(220, board.clientWidth);
  const columns = Math.min(size, Math.max(1, Math.floor((width - 40) / 22)), 8);
  const groupWidth = Math.max(72, columns * 22 + 22);
  const groupHeight = Math.ceil(size / columns) * 22 + 30;
  const perRow = Math.max(1, Math.floor(width / (groupWidth + 12)));
  const count = Math.floor(a / size);
  for (let group = 0; group < count; group++) {
    const x = group % perRow * (groupWidth + 12);
    const y = Math.floor(group / perRow) * (groupHeight + 16);
    element('group-frame', x, y, groupWidth, groupHeight);
    element('frame-label', x + 9, y + 4, 0, 0, `第 ${group + 1} 群`);
    for (let j = 0; j < size; j++) {
      const dot = dots[group * size + j];
      dot.style.left = `${x + 15 + j % columns * 22}px`;
      dot.style.top = `${y + 28 + Math.floor(j / columns) * 22}px`;
    }
  }
  const rest = a % size;
  let height = Math.ceil(count / perRow) * (groupHeight + 16);
  if (rest) {
    const cols = Math.max(1, Math.floor((width - 40) / 22));
    const restHeight = 45 + Math.ceil(rest / cols) * 22;
    element('remainder-box', 0, height, width - 6, restHeight);
    element('board-label', 12, height + 8, 0, 0, `剩下 ${rest} 個`);
    for (let j = 0; j < rest; j++) {
      const dot = dots[count * size + j];
      dot.style.left = `${15 + j % cols * 22}px`;
      dot.style.top = `${height + 40 + Math.floor(j / cols) * 22}px`;
    }
    height += restHeight + 15;
  }
  board.style.height = `${Math.max(220, height)}px`;
  $('observation').textContent = `總共 ${a} 個，每群 ${size} 個，共有 ${count} 群，${rest ? `剩下 ${rest} 個。${size} 不是 ${a} 的因數。` : `剛好分完！${size} 和 ${count} 都是 ${a} 的因數。`}`;
  $('number-result').innerHTML = `<h2>找到的因數</h2>${chips(found)}<p class="lab-equation">${a} = ${size} × ${count}${rest ? ` ＋ ${rest}` : ''}</p><p>${rest ? '旁邊的圓點不夠再裝滿一群。' : '每群的數量 × 群數 = 總數。'}</p>${tested.size === a ? '<p>✓ 你已試完所有分法，找到所有因數！</p>' : `<p>已試過 ${tested.size}／${a} 種分法</p>`}`;
}
function drawCommonFactors() {
  board.replaceChildren();
  const width = Math.max(220, board.clientWidth);
  const perRow = Math.max(1, Math.floor(width / 140));
  const ca = Math.floor(a / size), cb = Math.floor(b / size);
  const plateHeight = 65 + Math.ceil(ca / 5) * 23 + Math.ceil(cb / 5) * 23;
  for (let group = 0; group < size; group++) {
    const x = group % perRow * (width / perRow), y = Math.floor(group / perRow) * (plateHeight + 12);
    element('group-frame', x, y, width / perRow - 10, plateHeight);
    element('frame-label', x + 10, y + 7, 0, 0, `第 ${group + 1} 人`);
    for (let j = 0; j < ca; j++) element('treat-dot', x + 9 + j % 5 * 23, y + 30 + Math.floor(j / 5) * 23, 0, 0, '🍪');
    for (let j = 0; j < cb; j++) element('treat-dot', x + 9 + j % 5 * 23, y + 40 + Math.ceil(ca / 5) * 23 + Math.floor(j / 5) * 23, 0, 0, '🍬');
  }
  let height = Math.ceil(size / perRow) * (plateHeight + 12);
  element('board-label', 5, height + 5, 0, 0, `剩下 ${a % size} 片餅乾、${b % size} 顆糖果`);
  const leftovers = [...Array(a % size).fill('🍪'), ...Array(b % size).fill('🍬')];
  const cols = Math.max(1, Math.floor(width / 25));
  leftovers.forEach((t, j) => element('treat-dot', j % cols * 25, height + 40 + Math.floor(j / cols) * 25, 0, 0, t));
  board.style.height = `${height + 80 + Math.ceil(leftovers.length / cols) * 25}px`;
  const success = a % size === 0 && b % size === 0;
  $('observation').textContent = `分給 ${size} 人，每人 ${ca} 片餅乾、${cb} 顆糖果。${success ? '兩種都剛好分完！' : '看看旁邊，還有點心沒有分完。'}`;
  const complete = tested.size === limit();
  $('number-result').innerHTML = `<h2>找到的公因數</h2>${chips(found)}<p>${success ? `${size} 是 ${a} 和 ${b} 的公因數。` : `${size} 無法讓兩種點心都剛好分完。`}</p><p class="lab-equation">${a} = ${size} × ${ca} ＋ ${a % size}<br>${b} = ${size} × ${cb} ＋ ${b % size}</p><p>已試過 ${tested.size}／${limit()} 種分法</p>${complete ? `<p>✓ 已找齊！最多可分給 <strong>${Math.max(...found)} 人</strong>，這就是最大公因數。</p>` : '<p>繼續試，找出最多能分給幾個人。</p>'}`;
}
function renderTrials() {
  $('record-help').textContent = '綠色表示剛好分完，灰色表示有剩下，白色表示還沒試。點數字可以再看一次。';
  $('trials').className = 'trial-list';
  $('trials').innerHTML = Array.from({length: limit()}, (_, i) => {
    const n = i + 1;
    const success = tested.has(n) && a % n === 0 && (isFactor || b % n === 0);
    return `<button class="${tested.has(n) ? 'tested' : ''} ${success ? 'success' : ''} ${n === size ? 'current' : ''}" aria-label="${isFactor ? '每群' : '分給'} ${n} ${isFactor ? '個' : '人'}${tested.has(n) ? success ? '，剛好分完' : '，有剩下' : '，尚未試過'}" data-size="${n}">${n}</button>`;
  }).join('');
  $('pairs').innerHTML = [...pairs].map(pair => `<span class="pair-entry">${pair}</span>`).join('');
}
function drawMultiples() {
  const end = lcm() * 2;
  const scale = 28;
  const width = end * scale + 90;
  const common = [];
  for (let n = lcm(); n <= Math.min(steps[0] * a, steps[1] * b); n += lcm()) common.push(n);
  let svg = `<svg width="${width}" height="265" viewBox="0 0 ${width} 265" role="img" aria-label="小兔步長 ${a}，小蛙步長 ${b}，已共同踩到 ${common.join('、') || '尚無正數位置'}">`;
  common.forEach(n => svg += `<rect x="${40 + n * scale - 12}" y="20" width="24" height="210" rx="10" fill="#dcebd8"/>`);
  [65, 175].forEach((y, row) => {
    const stride = row ? b : a;
    svg += `<path d="M40 ${y}H${width - 25}" stroke="#98ad95" stroke-width="2"/>`;
    for (let n = 0; n <= end; n++) svg += `<path d="M${40 + n * scale} ${y - 4}v8" stroke="#98ad95"/><text x="${40 + n * scale}" y="${y + 28}" font-size="12" text-anchor="middle" fill="#52684d">${n}</text>`;
    for (let j = 1; j <= steps[row]; j++) {
      const x = 40 + j * stride * scale, prev = x - stride * scale;
      svg += `<path d="M${prev} ${y - 10}Q${(prev + x) / 2} ${y - 65} ${x} ${y - 10}" fill="none" stroke="${row ? '#c38b36' : '#378269'}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="7" fill="${row ? '#c38b36' : '#378269'}"/>`;
    }
    svg += `<text x="${40 + steps[row] * stride * scale}" y="${y - 18}" text-anchor="middle" font-size="25">${row ? '🐸' : '🐇'}</text>`;
  });
  svg += '</svg>';
  board.innerHTML = `<div class="jump-scroll">${svg}</div>`;
  board.style.height = 'auto';
  $('jump-a').disabled = steps[0] * a >= end;
  $('jump-b').disabled = steps[1] * b >= end;
  $('jump-both').disabled = $('jump-a').disabled && $('jump-b').disabled;
  $('observation').textContent = `🐇 跳了 ${steps[0]} 次，到 ${steps[0] * a}。🐸 跳了 ${steps[1]} 次，到 ${steps[1] * b}。起點 0 用灰色表示，從正數位置找公倍數。`;
  $('number-result').innerHTML = `<h2>已共同踩到的位置</h2>${common.length ? chips(common) : '<p>分別跳幾步，看看腳印會在哪裡對齊。</p>'}${common.length ? `<p>第一個共同踩到的正數是 <strong>${lcm()}</strong>，這就是最小公倍數。</p><p class="lab-equation">${a} × ${lcm() / a} = ${lcm()}<br>${b} × ${lcm() / b} = ${lcm()}</p>` : ''}<p>沿數線向右捲動，可以看更遠的位置。</p>`;
  $('record-help').textContent = '兩個角色可以跳不同次數。只要兩邊都留下腳印，就是共同踩到的位置。這次探索到第二個公倍數。';
  $('trials').innerHTML = [a, b].map((stride, row) => `<p>${row ? '🐸' : '🐇'} 的腳印　${Array.from({length: steps[row]}, (_, i) => (i + 1) * stride).join('、') || '還沒出發'}</p>`).join('');
  $('pairs').innerHTML = '';
}
function render() {
  if (isMultiple) { drawMultiples(); return; }
  tested.add(size);
  if (a % size === 0 && (isFactor || b % size === 0)) {
    found.add(size);
    if (isFactor) {
      found.add(a / size);
      const small = Math.min(size, a / size), large = Math.max(size, a / size);
      pairs.add(`${small} × ${large} = ${a}`);
    }
  }
  if (isFactor) drawFactors(); else drawCommonFactors();
  renderTrials();
  $('minus').disabled = size === 1;
  $('plus').disabled = size === limit();
}
function bindQuantity(id, update, max) {
  const input = $(id);
  input.addEventListener('change', () => {
    const value = read(input, max);
    if (value === null) return;
    update(value); input.value = value; clearExploration();
  });
  input.addEventListener('keydown', event => { if (event.key === 'Enter') input.blur(); });
}
if (isFactor) bindQuantity('total', value => a = value, 50);
else {
  bindQuantity('amount-a', value => a = value, isMultiple ? 12 : 50);
  bindQuantity('amount-b', value => b = value, isMultiple ? 12 : 50);
}
$('random').onclick = () => {
  const random = max => Math.floor(Math.random() * max) + 1;
  if (isFactor) { a = random(50); $('total').value = a; }
  else { a = random(isMultiple ? 12 : 50); b = random(isMultiple ? 12 : 50); $('amount-a').value = a; $('amount-b').value = b; }
  document.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  $('input-error').textContent = ''; clearExploration();
};
$('reset').onclick = clearExploration;
if (isMultiple) {
  function jump(rows) {
    rows.forEach(row => { if (steps[row] * (row ? b : a) < lcm() * 2) steps[row]++; });
    render();
  }
  $('jump-a').onclick = () => jump([0]);
  $('jump-b').onclick = () => jump([1]);
  $('jump-both').onclick = () => jump([0, 1]);
} else {
  $('plus').onclick = () => setSize(size + 1);
  $('minus').onclick = () => setSize(size - 1);
  $('size').oninput = () => { const value = read($('size'), limit()); if (value !== null) setSize(value); };
  $('size').onkeydown = event => { if (event.key === 'Enter') event.target.blur(); };
  $('trials').onclick = event => { const button = event.target.closest('[data-size]'); if (button) setSize(+button.dataset.size); };
}
new ResizeObserver(() => { if (!isMultiple) render(); }).observe(board.parentElement);
render();
