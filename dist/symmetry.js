import {drawing,modes,tools,green,gold,blue,ink,select,switches,slider,button,polygon,line,circle,label,explain} from './visual-labs.js';

function radialShape(arms, profile) {
  return Array.from({length: arms}, (_, arm) => profile.map(([offset, radius]) => {
    const angle = (arm + offset) * 2 * Math.PI / arms;
    return [radius * Math.sin(angle), -radius * Math.cos(angle)];
  })).flat();
}

const shapes = {
  tree:[[0,-5],[3,-2],[1,-2],[4,2],[1,2],[1,5],[-1,5],[-1,2],[-4,2],[-1,-2],[-3,-2]],
  rectangle:[[-4,-3],[4,-3],[4,3],[-4,3]],
  square:[[-4,-4],[4,-4],[4,4],[-4,4]],
  star:radialShape(5,[[0,5],[.5,2.1]]),
  snowflake:radialShape(6,[[-.5,1.3],[-.29,3.65],[-.16,4.15],[-.09,3.3],[-.07,5],[.07,5],[.09,3.3],[.16,4.15],[.29,3.65]]),
  butterfly:[[0,-2],[1,-3],[3,-4.7],[4.8,-4],[5,-2],[4,-.1],[2.5,.7],[4,2],[3.8,3.7],[2,4.2],[.8,2.3],[0,3],[-.8,2.3],[-2,4.2],[-3.8,3.7],[-4,2],[-2.5,.7],[-4,-.1],[-5,-2],[-4.8,-4],[-3,-4.7],[-1,-3]]
};
const axisSteps = {tree:180,rectangle:90,square:45,star:36,snowflake:30,butterfly:180};
let shape = 'tree';
let axis = 0;
let activity = 'fold';
let folded = 0;

switches(modes,[['fold','摺一摺找對稱軸'],['mirror','移動鏡子']],'fold',value => {
  activity = value;
  setup();
});

function setup() {
  tools.replaceChildren();
  drawing.classList.toggle('mirror-board', activity === 'mirror');
  drawing.setAttribute('aria-label',activity === 'fold' ? '摺紙與對稱軸操作圖' : '畫圖與移動鏡子的畫布');
  if (activity === 'mirror') {
    setupMirror();
    return;
  }

  select(tools,'圖形',[['tree','樹'],['rectangle','長方形'],['square','正方形'],
    ['snowflake','六角雪花'],['star','五角星'],['butterfly','蝴蝶']],shape,value => {
    shape = value;
    resetFold();
  });
  const axisSlider = slider(tools,'轉動摺線',0,179,1,axis,value => {
    axis = value;
    resetFold();
  });
  const axisReadout = document.createElement('output');
  tools.append(axisReadout);
  const axisPreset = select(tools,'常用方向', [['','選擇方向'],['0','直線 ↕'],['45','斜線 ↘'],['90','橫線 ↔'],['135','斜線 ↗']], '', value => {
    if (value === '') return;
    axis = Number(value);
    axisSlider.value = axis;
    resetFold();
  });
  const progress = slider(tools,'摺疊程度',0,100,1,folded,value => {
    folded = value;
    drawFold();
  });
  function resetFold() {
    folded = 0;
    progress.value = 0;
    axisReadout.textContent = axis + '°';
    axisPreset.value = String(axis);
    drawFold();
  }
  button(tools,'沿線對摺',() => {
    folded = 100;
    progress.value = 100;
    drawFold();
  });
  axisReadout.textContent = axis + '°';
  axisPreset.value = String(axis);
  drawFold();
}

const toScreen = ([x,y]) => [300 + 26 * x,175 + 26 * y];

function clip(points, distance, sign) {
  const clipped = [];
  points.forEach((point,index) => {
    const next = points[(index + 1) % points.length];
    const a = sign * distance(point);
    const b = sign * distance(next);
    if (a >= 0) clipped.push(point);
    if ((a > 0 && b < 0) || (a < 0 && b > 0)) {
      const portion = a / (a - b);
      clipped.push(point.map((value,coord) => value + portion * (next[coord] - value)));
    }
  });
  return clipped;
}

function drawFold() {
  drawing.setAttribute("role","img");
  const radians = axis * Math.PI / 180;
  const normal = [Math.cos(radians),Math.sin(radians)];
  const distance = ([x,y]) => x * normal[0] + y * normal[1];
  const moving = clip(shapes[shape],distance,1);
  const fixed = clip(shapes[shape],distance,-1);
  const factor = 1 - Math.cos(Math.PI * folded / 100);
  const project = point => toScreen(point.map((value,index) => value - distance(point) * factor * normal[index]));
  const tangent = [-normal[1],normal[0]];
  drawing.innerHTML = polygon(fixed.map(toScreen),green) + polygon(moving.map(project),gold,ink,'fill-opacity=".62"') +
    line(...toScreen(tangent.map(value => value * -6)),...toScreen(tangent.map(value => value * 6)),'stroke-dasharray="6 5"');
  const matches = axis % axisSteps[shape] === 0;
  if (folded < 100) explain('兩半會重合嗎？','綠色留在原地，黃色沿虛線摺過去。換一條線，先猜一猜再對摺。');
  else explain(matches ? '兩半完全重合' : '兩半沒有完全重合',
    matches ? '這條摺線是對稱軸。摺過去時，對稱點、對稱邊和對稱角會一一疊在一起。' : '看看哪裡露出了綠色或黃色。換一條摺線再試一次。');
}

const sample = [[[112,244],[112,97],[214,97]],[[112,161],[189,161]]];
const mirrorDefault = 330;
let mirrorX = mirrorDefault;
let strokes = sample;
let probe = null;
let mirrorMode = 'draw';
let mirrorSlider;
let pointer = null;

function setupMirror() {
  switches(tools,[['draw','✎ 畫圖'],['probe','⊙ 觀察對稱點']],mirrorMode,value => {
    mirrorMode = value;
    if (value === 'draw') probe = null;
    renderMirror();
  });
  mirrorSlider = slider(tools,'鏡子位置',16,584,1,mirrorX,setMirror);
  button(tools,'試試字母 F',() => {
    strokes = sample;
    probe = null;
    setMirror(mirrorDefault);
  });
  button(tools,'清空畫布',() => {
    strokes = [];
    probe = null;
    renderMirror();
  });
  renderMirror();
}

function setMirror(x) {
  mirrorX = Math.max(16,Math.min(584,Math.round(x)));
  mirrorSlider.value = mirrorX;
  renderMirror();
}

function renderMirror() {
  const trace = strokes.map(points => {
    const segments = points.map(([x,y]) => `${x},${y}`).join(' ');
    return points.length === 1
      ? `<circle cx="${points[0][0]}" cy="${points[0][1]}" r="2.5" fill="currentColor"/>`
      : `<polyline points="${segments}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');

  let guide = '';
  if (probe && probe[0] <= mirrorX) {
    const [x,y] = probe;
    const reflectedX = 2 * mirrorX - x;
    const markerY = y > 70 ? y - 15 : y + 17;
    const distance = mirrorX - x;
    guide = line(x,y,reflectedX,y,'stroke-dasharray="4 4"') + circle(x,y,5,ink) +
      circle(reflectedX,y,5,'#b47835');
    if (distance >= 10) guide += `<path d="M${mirrorX} ${y-8}h8v8" fill="none" stroke="${ink}"/>`;
    if (distance >= 48) {
      guide += label((x+mirrorX)/2,markerY,'一樣遠',true) +
        label((reflectedX+mirrorX)/2,markerY,'一樣遠',true);
    }
  }

  drawing.innerHTML = `<defs>
    <clipPath id="mirror-source"><rect width="${mirrorX}" height="350"/></clipPath>
    <clipPath id="mirror-image"><rect x="${mirrorX}" width="${600-mirrorX}" height="350"/></clipPath>
    </defs>
    <rect x="${mirrorX}" width="${600-mirrorX}" height="350" fill="#dcecf2" opacity=".6"/>
    <g clip-path="url(#mirror-source)" color="#28624e">${trace}</g>
    <g clip-path="url(#mirror-image)" color="#ad672c"><g transform="translate(${2*mirrorX} 0) scale(-1 1)">${trace}</g></g>
    ${guide}
    <g class="mirror-handle" data-mirror>
      <rect x="${mirrorX-12}" width="24" height="350" fill="transparent"/>
      <path d="M${mirrorX} 0V350" stroke="#467789" stroke-width="3"/>
      <rect x="${mirrorX-15}" y="12" width="30" height="27" rx="7" fill="#e7f2f7" stroke="#467789"/>
      ${label(mirrorX,26,'↔',true)}
    </g>`;
  const hidden = probe && probe[0] > mirrorX;
  const offscreen = probe && 2 * mirrorX - probe[0] > 600;
  const title = mirrorMode === 'draw' ? '畫圖，再拖動鏡子' : '比較原點和鏡像點';
  const message = mirrorMode === 'draw'
    ? '在左側自由畫線。拖動藍色鏡子時，只有鏡子左側的筆畫會出現在右邊。'
    : hidden ? '鏡子已經越過這個點。把鏡子往右拖，就能再次看到它的倒影。'
    : offscreen ? '這個點的倒影在畫布右邊外。把鏡子往左移一點，讓它回到畫布。'
    : '在鏡子左邊點一下。原點和鏡像點離鏡子一樣遠，兩點的連線也和鏡子垂直。';
  explain(title,message);
}

function boardPoint(event) {
  const transform = drawing.getScreenCTM();
  const {x,y} = new DOMPoint(event.clientX,event.clientY).matrixTransform(transform.inverse());
  return [Math.round(x),Math.round(y)];
}

drawing.addEventListener('pointerdown',event => {
  if (activity !== 'mirror' || pointer || event.button !== 0) return;
  const point = boardPoint(event);
  const isMirror = Boolean(event.target.closest('[data-mirror]'));
  if (!isMirror && point[0] >= mirrorX) return;
  if (!isMirror && mirrorMode === 'probe') {
    probe = point;
    renderMirror();
    return;
  }
  pointer = {id:event.pointerId, isMirror, offset:mirrorX-point[0]};
  drawing.setPointerCapture(pointer.id);
  if (!isMirror) {
    pointer.stroke = [point];
    strokes = [...strokes,pointer.stroke];
    renderMirror();
  }
});

drawing.addEventListener('pointermove',event => {
  if (activity !== 'mirror' || pointer?.id !== event.pointerId) return;
  const [x,y] = boardPoint(event);
  if (pointer.isMirror) setMirror(x+pointer.offset);
  else {
    pointer.stroke.push([Math.max(0,Math.min(mirrorX,x)),Math.max(0,Math.min(350,y))]);
    renderMirror();
  }
});

for (const event of ['pointerup','pointercancel','lostpointercapture']) {
  drawing.addEventListener(event,({pointerId}) => {
    if (pointer?.id === pointerId) pointer = null;
  });
}

setup();
