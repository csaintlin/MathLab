import {drawing,modes,tools,green,gold,ink,slider,switches,polygon,line,label,explain} from './visual-labs.js';

let shape = 'parallelogram';
let shift = 65;
let stage = 0;
let progress = 0;
let frame;
const next = document.querySelector('#area-next');
const [nextIcon, nextLabel] = next.querySelectorAll('span');
next.addEventListener('click', advance);
document.querySelector('#area-reset').addEventListener('click', () => {
  cancelAnimationFrame(frame);
  stage = 0;
  progress = 0;
  render();
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

switches(modes,[['parallelogram','平行四邊形'],['triangle','三角形'],['trapezoid','梯形']],shape,value => {
  shape = value;
  setup();
});

function setup() {
  cancelAnimationFrame(frame);
  progress = 0;
  stage = 0;
  tools.replaceChildren();
  if (shape === 'parallelogram') {
    slider(tools,'拖動上方的邊',0,120,5,shift,value => {
      cancelAnimationFrame(frame);
      shift = value;
      progress = 0;
      stage = 0;
      render();
    });
  }
  render();
}

function advance() {
  stage++;
  if (stage !== 2 || reducedMotion.matches) {
    progress = stage === 2 ? 1 : 0;
    render();
    return;
  }
  const started = performance.now();
  function animate(time) {
    progress = Math.min(1,(time-started)/650);
    render();
    if (progress < 1) frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);
}

function heightMarker(x,top,bottom) {
  return line(x,top,x,bottom,'stroke-dasharray="5 4"') +
    `<path d="M${x} ${bottom-11} h11 v11" fill="none" stroke="${ink}" stroke-width="2"/>` +
    label(x-22,(top+bottom)/2,'高');
}

function render() {
  const top = 117;
  const bottom = 237;
  const complete = stage === 2 && progress === 1;
  next.disabled = stage === 2 || (shape === 'parallelogram' && shift === 0);
  if (stage === 0) {
    nextIcon.textContent = shape === 'parallelogram' ? '✂' : '⧉';
    nextLabel.textContent = shape === 'parallelogram' ? '沿著高剪開' : '拿一片一樣的';
  } else {
    nextIcon.textContent = complete ? '✓' : '⇢';
    nextLabel.textContent = complete ? '拼好了' : stage === 1 ? '移動並拼起來' : '拼接中…';
  }
  let html;
  if (shape === 'parallelogram') {
    const left = 86;
    const right = 356;
    const cut = left + shift;
    const original = [[left,bottom],[right,bottom],[right+shift,top],[cut,top]];
    const piece = [[left,bottom],[cut,bottom],[cut,top]];
    const remainder = [[cut,bottom],[right,bottom],[right+shift,top],[cut,top]];
    html = stage === 0 ? polygon(original,green) : polygon(remainder,green) +
      polygon(piece.map(([x,y]) => [x + 270 * progress,y - 28 * Math.sin(Math.PI * progress)]),gold);
    html += heightMarker(cut,top,bottom);
    html += label(complete ? cut+135 : left+135,265,'底 9 cm');
    drawing.innerHTML = html + label(300,310,'底固定 9 cm，高固定 4 cm',true);
    if (stage === 2 && !complete) return;
    const perimeter = (2 * (9 + Math.hypot(shift/30,4))).toFixed(1);
    if (complete) explain('拼成長方形，面積一樣','黃色三角形移到另一邊。拼好的長方形長是原來的底，寬是原來的高。','9 × 4 = 36 平方公分');
    else if (stage === 1) explain('沿著高剪下黃色三角形','猜一猜，黃色三角形搬到哪一邊，就會剛好填滿？');
    else explain(shift === 0 ? '拉動滑桿，把長方形拉斜' : '斜邊變了，底和高沒變',
      `原圖的周長約 ${perimeter} cm。拉一拉比較周長，再剪拼驗證面積是否改變。`);
    return;
  }

  const triangle = shape === 'triangle';
  const left = triangle ? 91 : 75;
  const right = triangle ? 331 : 345;
  const upperLeft = triangle ? 181 : 135;
  const upperRight = triangle ? 181 : 285;
  const original = triangle ? [[left,bottom],[right,bottom],[upperLeft,top]]
    : [[left,bottom],[right,bottom],[upperRight,top],[upperLeft,top]];
  const pivot = [(right + upperRight)/2,(top+bottom)/2];
  html = polygon(original,green);
  if (stage > 0) {
    const angle = Math.PI * progress;
    const center = [0,1].map(axis => original.reduce((sum,point) => sum + point[axis],0) / original.length);
    const [cx,cy] = center.map((value,axis) => (value + (axis === 0 ? 245 : 0)) * (1-progress) + (2*pivot[axis]-value) * progress);
    const copy = original.map(([x,y]) => [
      cx + (x-center[0])*Math.cos(angle) - (y-center[1])*Math.sin(angle),
      cy + (x-center[0])*Math.sin(angle) + (y-center[1])*Math.cos(angle)
    ]);
    html += polygon(copy,gold);
  }
  html += heightMarker(upperLeft,top,bottom);
  html += label((left+right)/2,263,triangle ? '底 8 cm' : '下底 9 cm');
  if (!triangle) {
    html += label((upperLeft+upperRight)/2,95,'上底 5 cm');
    if (complete) {
      const reflectedX = x => 2 * pivot[0] - x;
      html += '<g class="area-copy-label">' +
        label(reflectedX((left+right)/2),95,'原下底 9 cm') +
        label(reflectedX((upperLeft+upperRight)/2),263,'原上底 5 cm') +
        '</g>';
    }
  }
  drawing.innerHTML = html + (complete ? label(300,309,triangle ? '拼好的底 8 cm，高 4 cm' : '拼好的底 14 cm，高 4 cm') : label(300,309,'高 4 cm',true));
  if (stage === 2 && !complete) return;
  if (complete) explain('兩片拼成一個平行四邊形',triangle
    ? '拼好的底和高等於原來的底和高。原來的一片剛好是拼好面積的一半。'
    : '上底和下底接起來，成了新圖形的底。高一樣，原來的一片是拼好面積的一半。',
    triangle ? '8 × 4 ÷ 2 = 16 平方公分' : '（5 + 9）× 4 ÷ 2 = 28 平方公分');
  else if (stage === 1) explain('兩片一樣大','黃色是綠色的複製品。轉半圈再移到旁邊，看看能拼成什麼。');
  else explain('先看底和高',triangle ? '高是從頂點垂直落到底邊的距離。' : '高是上底和下底之間的垂直距離。');
}
setup();
