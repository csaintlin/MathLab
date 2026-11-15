import {drawing,modes,tools,green,gold,blue,slider,switches,button,line,rect,label,explain} from './visual-labs.js';

let activity = 'array';
let cut = 10;
let subtract = false;
let stacks = [2,4,9];
let source = null;
let preset = 0;
const names = ['甲','乙','丙'];
const presets = [[2,4,9],[8,2,8],[3,6,3]];

switches(modes,[['array','分配律方格板'],['average','平均搬運']],activity,value => {
  activity = value;
  setup();
});

function setup() {
  tools.replaceChildren();
  if (activity === 'array') {
    switches(tools,[[false,'拆成兩塊'],[true,'先補大再扣除']],subtract,value => {
      subtract = value;
      drawArray();
    });
    slider(tools,'移動切線',1,12,1,cut,value => {
      cut = value;
      drawArray();
    });
    drawArray();
  } else {
    for (let index = 0; index < names.length; index++) {
      button(tools,`選 ${names[index]} 柱`,() => moveBlock(index),false);
    }
    button(tools,'重來',() => resetAverage(preset));
    button(tools,'換一組',() => resetAverage((preset + 1) % presets.length));
    drawAverage();
  }
}

function drawArray() {
  const columns = 13;
  const full = subtract ? columns + cut : columns;
  const boundary = subtract ? columns : cut;
  const cell = 21;
  const start = (600 - full * cell) / 2;
  let html = '';
  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < full; column++) {
      const fill = column < boundary ? green : subtract ? '#f6e9cf' : gold;
      html += rect(start + column * cell,92 + row * cell,cell,cell,fill);
      if (subtract && column >= boundary) {
        html += line(start + column * cell,92 + (row+1) * cell,start + (column+1) * cell,92 + row * cell,'stroke-opacity=".35"');
      }
    }
  }
  html += line(start+boundary*cell,73,start+boundary*cell,248,'stroke-width="4"');
  html += label(start + boundary * cell / 2,65,`${boundary} 格`);
  html += label(start + (boundary + full) * cell / 2,65,`${full-boundary} 格`,true);
  html += label(300,283,subtract ? '斜線方格是先補上、再扣掉的部分' : '每一排都沿著同一條線切開',true);
  drawing.innerHTML = html;
  explain(subtract ? '先算整塊，再扣掉多出的方格' : '切開了，總格數一樣',
    '不論切線在哪裡，每一塊都有 6 排。看顏色和斜線，找出算式裡的每一塊。',
    subtract ? `6 × 13 = 6 × ${full} − 6 × ${cut}` : `6 × 13 = 6 × ${cut} + 6 × ${13-cut}`);
}

function resetAverage(index) {
  preset = index;
  stacks = [...presets[index]];
  source = null;
  drawAverage();
}

function moveBlock(index) {
  if (source === null) {
    if (stacks[index] === 0) return;
    source = index;
  } else {
    if (source !== index) {
      stacks[source]--;
      stacks[index]++;
    }
    source = null;
  }
  drawAverage();
}

function drawAverage() {
  const total = stacks.reduce((sum,value) => sum + value,0);
  const equal = stacks.every(value => value === stacks[0]);
  const height = 13;
  let html = '';
  stacks.forEach((count,index) => {
    const x = 145 + 155 * index;
    html += rect(x-45,29,90,241,'#ffffff','rx="8"');
    for (let block = 0; block < count; block++) {
      html += rect(x-39,251-block*height,78,height,source === index && block === count-1 ? gold : index === 1 ? blue : green,'rx="3"');
    }
    html += label(x,295,`${names[index]}柱 · ${count} 塊`,true);
    const control = tools.children[index];
    control.textContent = source === null ? `從 ${names[index]} 柱拿` : source === index ? '取消選取' : `放進 ${names[index]} 柱`;
    control.disabled = source === null && count === 0;
    control.setAttribute('aria-pressed',source === index);
  });
  drawing.innerHTML = html;
  explain(equal ? '三柱一樣高了！' : source === null ? '從哪一柱拿一塊？' : '要把積木放到哪一柱？',
    `共有 ${total} 塊積木。每次只搬一塊，總數會保持一樣。`,equal ? `${total} ÷ 3 = ${stacks[0]} 塊` : '');
}
setup();
