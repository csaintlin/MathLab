const get = id => document.getElementById(id);
const cups = [
  { name: '高瘦杯', width: 54, height: 140 },
  { name: '一般杯', width: 70, height: 114 },
  { name: '矮胖杯', width: 88, height: 90 }
];
const measure = { width: 88, height: 140 };
const rounds = [
  [3400, 4400, 5500], [3400, 5500, 4400],
  [4400, 3400, 5500], [4400, 5500, 3400],
  [5500, 3400, 4400], [5500, 4400, 3400]
];
const containers = get('containers');
const records = get('records');
let round = -1;
let amounts;
let prediction;
let poured;
let pending;
let timer;

function drawCup(cup, amount, label, measuring = false) {
  const { width, height } = cup;
  const x = (160 - width) / 2;
  const y = 154 - height;
  const level = amount / width;
  return `<svg viewBox="0 0 160 164" role="img" aria-label="${label}">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5" fill="#eef5ef"/>
    <rect class="water" x="${x + 1}" y="${153 - level}" width="${width - 2}" height="${level}" fill="#80c9df"/>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5" fill="none" stroke="#698b7b" stroke-width="2"/>
    ${measuring ? [0.2, 0.4, 0.6, 0.8].map(mark =>
      `<path d="M ${x + width - 11} ${154 - height * mark} h 10" stroke="#698b7b"/>`).join('') : ''}
  </svg>`;
}

function update() {
  const complete = poured.every(Boolean);
  containers.querySelectorAll('.vessel-card').forEach((card, index) => {
    const guessing = card.querySelector('[data-guess]');
    const pouring = card.querySelector('[data-pour]');
    guessing.setAttribute('aria-pressed', String(prediction === index));
    guessing.textContent = prediction === index ? '✓ 我的猜測' : '猜這一杯';
    guessing.disabled = pending !== null || poured.some(Boolean);
    pouring.disabled = prediction === null || pending !== null || poured[index];
    pouring.textContent = poured[index] ? '✓ 已倒入' : pending === index ? '正在倒水…' : '倒進量杯';
    card.classList.toggle('pouring', pending === index);
    card.classList.toggle('empty', poured[index]);
    card.querySelector('svg').setAttribute('aria-label', poured[index] ? `${cups[index].name}已倒空` : `${cups[index].name}中的水位`);
  });

  const winner = amounts.indexOf(Math.max(...amounts));
  records.innerHTML = cups.map((cup, index) => {
    const highest = complete && winner === index;
    const label = poured[index] ? highest ? '水位最高' : '已倒入' : pending === index ? '正在倒水…' : '等待倒水';
    return `<div class="vessel-card ${highest ? 'highest-cup' : ''}${pending === index ? ' filling' : ''}">
      <h3>${cup.name}的量杯</h3>
      ${drawCup(measure, poured[index] || pending === index ? amounts[index] : 0, label, true)}
      <span class="badge">${label}</span>
    </div>`;
  }).join('');
  get('prediction').textContent = prediction === null
    ? '先點「猜這一杯」，再開始倒水。'
    : `你猜${cups[prediction].name}的水最多。`;
  get('status').textContent = pending === null
    ? `已倒入 ${poured.filter(Boolean).length} 杯，共 3 杯。`
    : `正在把${cups[pending].name}的水倒進量杯。`;
  get('conclusion').textContent = complete
    ? `${cups[winner].name}的量杯水位最高，所以原本是${cups[winner].name}的水最多。${winner === prediction ? '你猜對了！' : '和你原本猜的一樣嗎？'}`
    : '等三杯都倒完，再找出水位最高的量杯。';
}

function start() {
  clearTimeout(timer);
  round = (round + 1 + Math.floor(Math.random() * (round < 0 ? rounds.length : rounds.length - 1))) % rounds.length;
  amounts = rounds[round];
  prediction = null;
  poured = cups.map(() => false);
  pending = null;
  containers.innerHTML = cups.map((cup, index) => `<div class="vessel-card">
    <h3>${cup.name}</h3>
    ${drawCup(cup, amounts[index], cup.name)}
    <div class="cup-actions">
      <button type="button" data-guess="${index}">猜這一杯</button>
      <button type="button" data-pour="${index}">倒進量杯</button>
    </div>
  </div>`).join('');
  update();
}

containers.onclick = event => {
  const guess = event.target.closest('[data-guess]');
  if (guess && !guess.disabled) {
    prediction = Number(guess.dataset.guess);
    update();
  }
  const pour = event.target.closest('[data-pour]');
  if (!pour || pour.disabled) return;
  const index = Number(pour.dataset.pour);
  pending = index;
  update();
  timer = setTimeout(() => {
    poured[index] = true;
    pending = null;
    update();
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850);
};
get('new').onclick = start;
get('again').onclick = () => {
  start();
  get('new').focus();
};
start();
