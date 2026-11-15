const get = id => document.getElementById(id);
const fields = [get('first'), get('second')];
const options = get('factor-options');
let numbers;
let candidates;
let tried;
let found;

function start(values) {
  numbers = values;
  const sorted = [...numbers].sort((a, b) => a - b);
  const lists = sorted.map(number =>
    Array.from({ length: number }, (_, index) => index + 1)
      .filter(divisor => number % divisor === 0));
  candidates = [...new Set(lists.flat())].sort((a, b) => a - b);
  tried = new Set();
  found = new Set();
  fields.forEach((field, index) => field.value = numbers[index]);
  options.innerHTML = sorted.map((number, row) =>
    `<div class="factor-comparison-row trial-list" role="group" aria-label="${number} 的因數">
      <strong>${number} 的因數</strong>
      ${candidates.map(value => lists[row].includes(value)
        ? `<button type="button" data-factor="${value}" aria-pressed="false">${value}</button>`
        : '<span class="factor-gap" aria-hidden="true">—</span>').join('')}
    </div>`).join('');
  showResult(1);
}

function distribution(number, groups, icon, item, unit) {
  const perGroup = Math.floor(number / groups);
  const remainder = number % groups;
  const contents = perGroup ? `<span aria-hidden="true">${icon.repeat(perGroup)}</span>` : '空盤';
  const plates = Array.from({ length: groups }, (_, index) =>
    `<li class="snack-plate"><strong>第 ${index + 1} 盤</strong>${contents}</li>`).join('');
  const summary = remainder
    ? `每盤 ${perGroup} ${unit}，剩下 ${remainder} ${unit}。`
    : `每盤 ${perGroup} ${unit}，剛好分完。`;
  return `<section class="distribution-panel">
    <h3>${icon} ${number} ${unit}${item}</h3>
    <p>${summary}</p>
    <ol class="snack-plates">${plates}</ol>
    ${remainder ? `<div class="snack-remainder"><strong>餘數 · ${remainder} ${unit}${item}</strong>
      <div aria-hidden="true">${icon.repeat(remainder)}</div></div>` : ''}
  </section>`;
}

function showResult(groups) {
  const dividesBoth = numbers.every(number => number % groups === 0);
  tried.add(groups);
  if (dividesBoth) found.add(groups);
  for (const button of options.querySelectorAll('button')) {
    const value = Number(button.dataset.factor);
    button.classList.toggle('current', value === groups);
    button.classList.toggle('success', found.has(value));
    button.classList.toggle('tested', tried.has(value) && !found.has(value));
    button.setAttribute('aria-pressed', String(value === groups));
  }
  const [first, second] = numbers;
  const leftOver = numbers.find(number => number % groups !== 0);
  get('feedback').textContent = dividesBoth
    ? `兩種點心都剛好分完，${groups} 是 ${first} 和 ${second} 的公因數。`
    : `分成 ${groups} 盤時，${leftOver} 個點心的那一組有剩下，所以 ${groups} 不是公因數。`;
  get('found').innerHTML = [...found].sort((a, b) => a - b)
    .map(number => `<span class="factor-chip">${number}</span>`).join('');
  const largest = get('largest-result');
  largest.hidden = tried.size < candidates.length;
  largest.textContent = largest.hidden ? '' : `已試完所有分法。最大公因數是 ${Math.max(...found)}。`;
  get('distribution-title').textContent = `兩種點心各分成 ${groups} 盤`;
  get('distribution').innerHTML = distribution(first, groups, '🍪', '餅乾', '片')
    + distribution(second, groups, '🍬', '糖果', '顆');
}

options.onclick = event => {
  const button = event.target.closest('button[data-factor]');
  if (button) showResult(Number(button.dataset.factor));
};

get('number-settings').onsubmit = event => {
  event.preventDefault();
  const values = fields.map(field => Number(field.value));
  if (values.some(value => !Number.isInteger(value) || value < 1 || value > 50)) {
    get('feedback').textContent = '請輸入 1～50 的整數。';
    return;
  }
  start(values);
};
get('random').onclick = () => start(fields.map(() => 1 + Math.floor(Math.random() * 50)));
start([12, 18]);
