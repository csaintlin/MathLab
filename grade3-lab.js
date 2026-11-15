import {angle, angleFromPoint, shape, gridPicture, fraction, stripPicture, ruler, rulerLength, rulerOrigin, rulerUnit, cup, capacityCases, capacityPair, toggles} from './grade3-core.js';

const board = document.getElementById('g3-board');
const controls = document.getElementById('g3-controls');
const result = document.getElementById('g3-result');
const lesson = document.body.dataset.grade3;
const button = (action, text, disabled = false) =>
  `<button type="button" data-action="${action}" ${disabled ? 'disabled' : ''}>${text}</button>`;
const modes = (entries, active = state.mode) => entries.map(([key, label]) =>
  `<button type="button" data-action="${key}" aria-pressed="${active === key}">${label}</button>`).join('');
const numberInput = (name, label) => `<label>${label} <input name="${name}" type="text" inputmode="numeric" autocomplete="off"></label>`;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const integer = value => /^\d+$/.test(value.trim().normalize('NFKC')) ? Number(value.trim().normalize('NFKC')) : NaN;
let round = 0;
let state;
let fillAnimation;
let drag;

const configs = {
  angle: {
    initial: () => ({degrees: [45, 60, 120, 135][round % 4], length: 82, reference: true}),
    draw() {
      board.innerHTML = angle(state.degrees, state.length, state.reference, true);
      controls.innerHTML = button('less', '縮小開口', state.degrees === 15) + button('more', '放大開口', state.degrees === 165)
        + button('small', '比直角小') + button('right', '變成直角') + button('large', '比直角大')
        + button('shorter', '邊變短', state.length <= 46) + button('longer', '邊變長', state.length >= 94)
        + modes([['reference', '直角參照']], state.reference ? 'reference' : '');
      const [comparison, name] = state.degrees < 90 ? ['比直角小', '銳角']
        : state.degrees > 90 ? ['比直角大', '鈍角'] : ['直角', ''];
      result.innerHTML = `<strong class="grade3-angle-result">${comparison}</strong>
        ${name ? `<span class="grade3-angle-name">（${name}）</span>` : ''}
        <p>${state.message || '拖動端點，或按按鈕改變兩條邊張開的程度。'}</p>`;
    },
    act(action) {
      if (action === 'reference') { state.reference = !state.reference; return; }
      if (action === 'shorter' || action === 'longer') {
        state.length = clamp(state.length + (action === 'longer' ? 12 : -12), 46, 94);
        state.message = '邊長改變了，開口一樣大。';
        return;
      }
      const next = {small: 45, right: 90, large: 135, less: state.degrees - 5, more: state.degrees + 5}[action];
      setAngle(clamp(next, 15, 165));
    }
  },
  area: {
    initial: () => ({mode: 'build', target: 4 + round % 17, layout: 0, cells: new Set(shape(4 + round % 17)), counted: 0, guess: null}),
    draw() {
      const compare = state.mode === 'compare';
      const targetShape = shape(state.target, 1);
      board.innerHTML = compare
        ? `<div class="grade3-pair"><div><strong>我的圖形</strong>${gridPicture(state.cells, state.counted)}</div><div><strong>範例圖形</strong>${gridPicture(targetShape, state.counted)}</div></div>`
        : toggles(64, state.cells, 8, '方格');
      const total = Math.max(state.cells.size, state.target);
      const actions = compare ? modes([['same', '一樣大'], ['different', '不一樣大']], state.guess)
        + button('count', '再數一格', state.guess === null || state.counted >= total)
        : button('clear', '清空') + button('shape', '換一個形狀');
      controls.innerHTML = `<div class="grade3-control-buttons grade3-control-row" role="group" aria-label="題型">
        ${modes([['build', '拼方格'], ['compare', '一樣大嗎？']])}
      </div><div class="grade3-control-buttons grade3-control-row" role="group" aria-label="操作選項">${actions}</div>`;
      const count = state.cells.size;
      const same = count === state.target;
      result.innerHTML = compare
        ? state.guess === null ? '先看圖猜猜看，兩個圖形的面積一樣大嗎？'
          : state.counted < total ? '按「再數一格」，數數兩個圖形各用了幾格。'
            : `${(state.guess === 'same') === same ? '答對了！' : '數完再比一比。'}我的圖形有 ${count} 格，範例有 ${state.target} 格。兩個圖形的面積${same ? '一樣大' : '不一樣大'}。`
        : `<strong>面積是 ${count} 個小方格的大小</strong><p>點方格放上或拿掉一格。換形狀會重新排列方格，格數保持相同。</p>`;
    },
    act(action) {
      if (action === 'build' || action === 'compare') { state.mode = action; state.counted = 0; state.guess = null; }
      if (action === 'clear') state.cells.clear();
      if (action === 'same' || action === 'different') state.guess = action;
      if (action === 'count') state.counted++;
      if (action === 'shape') {
        // Every board arrangement fits, including a completely filled 8×8 board.
        state.layout = (state.layout + 1) % 4;
        const count = state.cells.size;
        if (count <= 20) {
          state.cells = new Set(shape(count, state.layout));
          return;
        }
        const width = Math.max(Math.ceil(count / 8), [5, 4, 6, 3][state.layout]);
        state.cells = new Set(Array.from({length: count}, (_, i) => {
          const row = Math.floor(i / width), col = i % width;
          return state.layout % 2 ? col * 8 + row : row * 8 + col;
        }));
      }
    },
    tile(index) { state.cells.has(index) ? state.cells.delete(index) : state.cells.add(index); }
  },
  fractions: {
    initial: () => ({mode: 'single', den: [4, 2, 3, 5, 6, 8][round % 6], rows: [new Set([0]), new Set([0, 1])], answer: null}),
    draw() {
      const uneven = state.mode === 'uneven';
      const compare = state.mode === 'compare';
      const divisions = [[44, 76, 120], [80, 80, 80], [110, 48, 82], [64, 112, 64]][round % 4];
      const equal = divisions.every(width => width === divisions[0]);
      board.innerHTML = uneven ? stripPicture(divisions, 1, state.answer !== null)
        : (compare ? '<p>兩條長條原本一樣長。</p>' : '') + [0, ...(compare ? [1] : [])].map(row =>
          `<div class="grade3-strip" data-row="${row}"><strong>${compare ? ['甲', '乙'][row] + ' · ' : ''}1 個全部</strong>
            ${toggles(state.den, state.rows[row], state.den, '第')}${fraction(state.rows[row].size, state.den)}</div>`).join('');
      const choices = uneven ? button('yes', '可以叫三分之一') + button('no', '不能叫三分之一')
        : [2, 3, 4, 5, 6, 8].map(n => `<button type="button" data-action="den-${n}" aria-pressed="${n === state.den}">${n} 等份</button>`).join('');
      controls.innerHTML = `<div class="grade3-control-buttons grade3-control-row" role="group" aria-label="題型">
        ${modes([['single', '切一切'], ['compare', '比較兩條'], ['uneven', '分得平均嗎？']])}
      </div><div class="grade3-control-buttons grade3-control-row" role="group" aria-label="操作選項">${choices}</div>`;
      const [first, second] = state.rows.map(row => row.size);
      const explanation = equal ? '三份一樣大，每份都是三分之一。' : '三份大小不同。平均分成三份，每份才是三分之一。';
      result.textContent = uneven
        ? state.answer === null ? '綠色這一份，可以叫三分之一嗎？'
          : (state.answer === equal ? '答對了！' : '再比比三份的寬度。') + explanation
        : compare ? `兩條一樣長，都平均分成 ${state.den} 份。${first === second ? '塗色一樣多。' : first > second ? '甲塗得比較多。' : '乙塗得比較多。'}`
          : `平均分成 ${state.den} 份，塗了 ${first} 份。`;
    },
    act(action) {
      if (['single', 'compare', 'uneven'].includes(action)) state.mode = action;
      if (action === 'yes' || action === 'no') state.answer = action === 'yes';
      if (action.startsWith('den-') && state.den !== Number(action.slice(4))) {
        state.den = Number(action.slice(4));
        state.rows = [new Set(), new Set()];
      }
    },
    tile(index, element) {
      const row = state.rows[Number(element.closest('[data-row]').dataset.row)];
      row.has(index) ? row.delete(index) : row.add(index);
    }
  },
  millimeter: {
    initial: () => ({length: [34, 12, 47, 85, 63, 29][round % 6], start: 12, lens: null, checked: false}),
    draw() {
      const object = ['鉛筆', '迴紋針', '橡皮擦'][round % 3];
      const aligned = state.start === 0;
      board.innerHTML = ruler(state.length, state.start, object, aligned, state.lens)
        + (state.lens === null ? '' : `<div class="grade3-detail"><strong>尺面放大圖</strong>
            ${ruler(state.length, state.start, object, aligned, state.lens, true)}
            <p>在尺上移動滑鼠，或用手指點按、拖動。每小格是 1 毫米。</p></div>`);
      board.classList.toggle('grade3-lens-open', state.lens !== null);
      controls.innerHTML = button('left', '物品左移', state.start === -4) + button('right', '物品右移', state.start === rulerLength - state.length)
        + modes([['zoom', '🔍 放大鏡']], state.lens === null ? '' : 'zoom')
        + (state.lens === null ? '' : button('lens-left', '放大鏡左移', state.lens === 0)
          + button('lens-right', '放大鏡右移', state.lens === rulerLength))
        + button('measure', '檢查長度');
      result.textContent = state.checked
        ? state.start === 0
          ? `0 對齊物件左端。從 0 量到右端，共 ${Math.floor(state.length / 10)} 公分 ${state.length % 10} 毫米。`
          : '先把物品左端移到 0 刻度線，再讀右端。'
        : state.start === 0 ? '先讀到右端前的整公分，再數黃色標示的毫米小格。'
          : '拖動物品，或按左右按鈕，把物品左端對準 0 刻度線。';
    },
    act(action) {
      if (action === 'zoom') state.lens = state.lens === null ? state.start + state.length : null;
      if (action === 'lens-left' || action === 'lens-right') {
        state.lens = clamp(state.lens + (action === 'lens-right' ? 1 : -1), 0, rulerLength);
      }
      if (action === 'measure') state.checked = true;
      if (action === 'left' || action === 'right') {
        state.start = clamp(state.start + (action === 'right' ? 1 : -1), -4, rulerLength - state.length);
        state.checked = false;
      }
    }
  },
  volume: {
    initial: () => ({mode: 'pour', amount: 0, serving: [250, 200, 500][round % 3], reading: [500, 250, 750, 1000, 0][round % 5], case: capacityCases[round % capacityCases.length], question: 'capacity', feedback: ''}),
    draw() {
      const pouring = state.mode === 'pour';
      board.innerHTML = pouring
        ? `<div class="grade3-pair"><div><strong>${state.serving} mL 小杯</strong>${cup(state.serving, state.serving, state.serving, true, 1000)}</div>
          <div><strong>1 L 量杯</strong>${cup(state.amount, 1000, state.serving)}</div></div>`
        : state.mode === 'read' ? cup(state.reading) : capacityPair(state.case);
      const actions = pouring ? button('add', '倒入 1 杯', state.amount === 1000) + button('subtract', '倒回 1 杯', state.amount === 0) + button('clear', '清空', state.amount === 0)
          : state.mode === 'read' ? `<form id="g3-read">${numberInput('reading', '水位是多少 mL？')}<button>檢查</button></form>`
          : modes([['capacity', '比較容量'], ['water', '比較水量']], state.question)
            + `<p class="grade3-question">${state.question === 'capacity' ? '哪個容器容量較大？' : '哪個容器目前的水較多？'}</p>`
            + button('choose-a', '甲') + button('choose-b', '乙');
      controls.innerHTML = `<div class="grade3-control-buttons grade3-control-row" role="group" aria-label="題型">
        ${modes([['pour', '倒水實驗'], ['read', '讀刻度'], ['compare', '容量與水量']])}
      </div><div class="grade3-control-buttons grade3-control-row" role="group" aria-label="操作選項">${actions}</div>`;
      result.textContent = pouring
        ? state.amount === 0 ? `猜猜看，每杯 ${state.serving} mL，幾杯會裝滿 1 L 量杯？`
          : state.amount === 1000 ? `倒了 ${1000 / state.serving} 杯，每杯 ${state.serving} mL，共 1000 mL，也就是 1 L。換一題看看，小杯越小，杯數會怎麼變？`
            : `已倒 ${state.amount / state.serving} 杯，目前有 ${state.amount} mL。`
        : state.feedback || (state.mode === 'read' ? '找出水面對齊的刻度。' : '先看最多能裝多少，再看看現在裝了多少。');
    },
    act(action) {
      if (['pour', 'read', 'compare'].includes(action)) { state.mode = action; state.feedback = ''; }
      if (action === 'add') { state.amount = clamp(state.amount + state.serving, 0, 1000); fillAnimation = true; }
      if (action === 'subtract') state.amount = clamp(state.amount - state.serving, 0, 1000);
      if (action === 'clear') state.amount = 0;
      if (action === 'capacity' || action === 'water') {
        state.question = action;
        state.feedback = '';
      }
      if (action === 'choose-a' || action === 'choose-b') {
        const capacity = state.question === 'capacity';
        const answer = capacity || state.case.bigWater > state.case.smallWater ? 'choose-a' : 'choose-b';
        const clue = capacity ? '比較標示「最多」的數字。' : '比較標示「目前」的數字。';
        state.feedback = action === answer ? `答對了！${clue}` : `再看一次。${clue}`;
      }
    }
  }
};

const config = configs[lesson];
function setAngle(next) {
  const previous = state.degrees;
  state.degrees = next;
  if (next !== previous) state.message = next > previous ? '開口變大了。' : '開口變小了。';
}

function render(restoreFocus) {
  config.draw();
  if (restoreFocus) {
    const replacement = document.querySelector(restoreFocus);
    if (replacement && !replacement.disabled) replacement.focus({preventScroll: true});
  }
  if (fillAnimation) {
    const measure = board.querySelector('.grade3-pair > :last-child svg');
    measure.classList.add('grade3-filling');
    measure.style.setProperty('--previous-fill', (state.amount - state.serving) / state.amount);
    measure.insertAdjacentHTML('beforeend', '<path class="grade3-stream" d="M62 0v18" stroke="#80c9df" stroke-width="6" opacity="0"/>');
    fillAnimation = false;
  }
}

function reset() {
  drag = null;
  state = config.initial();
  render();
}
document.getElementById('g3-reset').onclick = reset;
document.getElementById('g3-new').onclick = () => {
  if (['volume', 'fractions', 'area'].includes(lesson)) {
    const mode = state.mode;
    round++;
    state = {...config.initial(), mode};
    render();
    return;
  }
  round += 1 + 6 * Math.floor(Math.random() * 9);
  reset();
};
controls.onclick = event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  config.act(control.dataset.action);
  render(`[data-action="${control.dataset.action}"]`);
};
controls.onsubmit = event => {
  event.preventDefault();
  const answer = integer(event.target.elements.reading.value);
  state.feedback = Number.isNaN(answer) ? '請填入整數。'
    : answer === state.reading ? `答對了！水面對齊 ${answer} mL。` : '再看看水面和哪一條刻度線對齊。';
  result.textContent = state.feedback;
};
board.onclick = event => {
  const tile = event.target.closest('[data-tile]');
  if (!tile || !config.tile) return;
  const row = tile.closest('[data-row]')?.dataset.row;
  config.tile(Number(tile.dataset.tile), tile);
  render(`${row === undefined ? '' : `[data-row="${row}"] `}[data-tile="${tile.dataset.tile}"]`);
};

if (lesson === 'angle' || lesson === 'millimeter') {
  board.classList.add('grade3-draggable');
  const point = event => new DOMPoint(event.clientX, event.clientY)
    .matrixTransform(board.querySelector('svg').getScreenCTM().inverse());
  const onScale = event => lesson === 'millimeter' && state.lens !== null
    && event.target.closest('svg') === board.firstElementChild
    && event.target.closest('[data-ruler-scale]');
  const moveLens = event => {
    const next = clamp(Math.round((point(event).x - rulerOrigin) / rulerUnit), 0, rulerLength);
    if (state.lens === next) return;
    state.lens = next;
    render();
  };
  board.onpointerdown = event => {
    if (!drag && event.button === 0 && onScale(event)) {
      drag = {id: event.pointerId, lens: true};
      board.setPointerCapture(event.pointerId);
      moveLens(event);
      return;
    }
    if (drag || event.button !== 0 || event.target.closest('svg') !== board.firstElementChild
        || (lesson === 'angle' && !event.target.closest('[data-angle-handle]'))
        || (lesson === 'millimeter' && !event.target.closest('[data-ruler-object]'))) return;
    drag = {id: event.pointerId, x: point(event).x, start: state.start};
    board.setPointerCapture(event.pointerId);
  };
  board.onpointermove = event => {
    if ((drag?.id === event.pointerId && drag.lens) || (!drag && event.pointerType === 'mouse' && onScale(event))) {
      moveLens(event);
      return;
    }
    if (drag?.id !== event.pointerId) return;
    const {x, y} = point(event);
    if (lesson === 'angle') setAngle(angleFromPoint(x, y));
    else {
      state.start = clamp(drag.start + Math.round((x - drag.x) / rulerUnit), -4, rulerLength - state.length);
      state.checked = false;
    }
    render();
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    board.addEventListener(type, event => { if (drag?.id === event.pointerId) drag = null; });
  }
}
reset();
