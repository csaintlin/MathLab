import {drawing,modes,tools,green,gold,select,switches,button,rect,label,explain} from './visual-labs.js';

const examples = [[1,2,1,3],[3,4,1,6],[2,3,1,4],[3,5,1,2]];
let example = 0;
let operation = '+';
let split = false;
let combined = false;

switches(modes,[['+','合起來（加法）'],['−','拿掉一段（減法）']],operation,value => {
  operation = value;
  reset();
});
select(modes,'換一組',examples.map(([a,b,c,d],index) => [index,`${a}/${b} 和 ${c}/${d}`]),example,value => {
  example = Number(value);
  reset();
});
const subdivide = button(tools,'切成一樣大的格子',() => {
  split = !split;
  combined = false;
  render();
},false);
const combine = button(tools,'操作色塊',() => {
  combined = !combined;
  render();
});

function reset() {
  split = false;
  combined = false;
  render();
}

function strip(y, divisions, fills, wholes = 1) {
  const size = 236 / divisions;
  let html = '';
  for (let i = 0; i < divisions * wholes; i++) {
    html += rect(54 + i * size,y,size,38,fills[i] || '#ffffff');
  }
  for (let i = 0; i < wholes; i++) {
    html += rect(54 + i * 236,y,236,38,'none','stroke-width="2"');
  }
  return html;
}

function render() {
  const [a,b,c,d] = examples[example];
  let common = b;
  while (common % d !== 0) common += b;
  const first = a * common / b;
  const second = c * common / d;
  const total = operation === '+' ? first + second : first - second;
  const groups = (length,color) => Array(length).fill(color);
  drawing.innerHTML = label(172,42,split ? `${a}/${b} = ${first}/${common}` : `${a}/${b}`) +
    strip(66,split ? common : b,groups(split ? first : a,green)) +
    label(172,132,split ? `${c}/${d} = ${second}/${common}` : `${c}/${d}`) +
    strip(156,split ? common : d,groups(split ? second : c,gold));

  if (combined) {
    const cells = operation === '+' ? [...groups(first,green),...groups(second,gold)] : groups(total,green);
    drawing.innerHTML += label(172,233,operation === '+' ? '把兩段接起來' : '從綠色末端拿掉黃色那麼長',true) +
      strip(258,common,cells,total > common ? 2 : 1);
    if (operation === '−') {
      drawing.innerHTML += rect(54 + 236 * total / common,258,236 * second / common,38,'none','stroke-dasharray="4 3" stroke-width="2"');
      drawing.innerHTML += label(54 + 236 * (total + second / 2) / common,317,'拿掉',true);
    }
  }

  subdivide.textContent = split ? '回到原來的切法' : '切成一樣大的格子';
  subdivide.setAttribute('aria-pressed',split);
  combine.disabled = !split;
  combine.textContent = combined ? '收起結果' : operation === '+' ? '把兩段接起來' : '拿掉黃色那麼長';
  if (combined) explain('數一數剩下或合起來的格子',`每格都是 1/${common}，現在有 ${total} 格。`,`${first}/${common} ${operation} ${second}/${common} = ${total}/${common}`);
  else if (split) explain('塗色長度沒變',`現在兩條分數條都分成 ${common} 等份，每一格一樣大。試著把色塊${operation === '+' ? '接起來' : '拿掉一段'}。`);
  else explain('兩條分數條一樣長','綠色和黃色的小格現在大小不同。先把兩條都重新切格，再比較或加減。');
}

render();
