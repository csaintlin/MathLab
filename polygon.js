const sides = document.querySelector('#sides');
const regular = document.querySelector('#regular');
const pieces = document.querySelector('#pieces');
const vertices = document.querySelector('#vertices');
const instruction = document.querySelector('#instruction');
const result = document.querySelector('#result');
const reselect = document.querySelector('#reselect');
const undo = document.querySelector('#undo');
const colors = ['#a9d3b4', '#f5db96', '#acd4e5', '#edbdac', '#cfbfdf', '#c9dba1'];
const vertexName = index => 'ABCDEFGH'[index];

let points = [];
let start = null;
let cuts = [];

function vertexPosition(index) {
  return (index - start + points.length) % points.length;
}

function selectVertex(index) {
  if (start === null) {
    start = index;
  } else {
    const position = vertexPosition(index);
    if (position < 2 || position === points.length - 1 || cuts.includes(index)) {
      instruction.textContent = cuts.includes(index)
        ? '這條對角線已經畫過了。'
        : '請點另一個不相鄰的頂點。相鄰兩點之間已經有一條邊。';
      return;
    }
    cuts.push(index);
  }
  draw();
}

function draw() {
  const count = points.length;
  const complete = count === 3 || (start !== null && cuts.length === count - 3);
  let triangles = 0;
  let drawing = '<polygon class="outline" points="' + points.join(' ') + '"/>';

  if (start !== null || count === 3) {
    const origin = start ?? 0;
    const boundaries = new Set([1, count - 1, ...cuts.map(vertexPosition)]);
    for (let step = 1; step < count - 1; step++) {
      if (!boundaries.has(step) || !boundaries.has(step + 1)) continue;
      const triangle = [points[origin], points[(origin + step) % count], points[(origin + step + 1) % count]];
      const center = [0, 1].map(axis => triangle.reduce((sum, point) => sum + point[axis], 0) / 3);
      drawing += '<polygon points="' + triangle.join(' ') + '" fill="' + colors[step - 1] + '"/>';
      drawing += '<text x="' + center[0] + '" y="' + center[1] + '">' + (++triangles) + '</text>';
    }
    for (const index of cuts) {
      const [x1, y1] = points[origin];
      const [x2, y2] = points[index];
      drawing += '<line class="cut" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
    }
  }
  pieces.innerHTML = drawing;

  [...vertices.children].forEach((vertex, index) => {
    const state = start === index ? 'start' : cuts.includes(index) ? 'cut' : '';
    vertex.dataset.state = state;
    vertex.setAttribute('aria-label', '頂點 ' + vertexName(index) + (state === 'start' ? '，起點' : state === 'cut' ? '，已連線' : ''));
  });
  undo.disabled = cuts.length === 0;
  reselect.disabled = start === null;
  instruction.textContent = count === 3 ? '整個圖形已經是一個三角形。換成四邊形試試看。'
    : complete ? '切完了！換一個起點，看看三角形的片數會不會變。'
    : start === null ? '點一個頂點，選擇你要從哪裡開始切。'
    : '從 ' + vertexName(start) + ' 出發，點一個不相鄰的頂點畫對角線。';

  result.innerHTML = complete
    ? '<span>' + count + ' 條邊 · ' + triangles + ' 個三角形</span><strong>' + triangles + ' × 180° = ' + triangles * 180 + '°</strong>'
    : '<span>已畫 ' + cuts.length + ' 條對角線</span><strong>已切出 ' + triangles + ' 個三角形</strong><span>再看看剩下的區域還能怎麼切。</span>';
}

function setShape() {
  const count = Number(sides.value);
  const sameSideCount = count === points.length;
  if (!sameSideCount) {
    start = null;
    cuts = [];
  }

  points = Array.from({length: count}, (_, index) => {
    const angle = (index - 0.25) * 2 * Math.PI / count - Math.PI / 2;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return regular.checked ? [250 + 145 * x, 183 + 145 * y]
      : [250 + 175 * x + 33 * y, 183 + 127 * y];
  });

  vertices.innerHTML = count === 3 ? '' : points.map(([x, y], index) =>
    '<g class="target" role="button" tabindex="0" transform="translate(' + x + ' ' + y + ')">' +
    '<circle r="26" fill="transparent"/><circle class="marker" r="17"/><text>' + vertexName(index) + '</text></g>'
  ).join('');
  [...vertices.children].forEach((vertex, index) => {
    vertex.onclick = () => selectVertex(index);
    vertex.onkeydown = event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectVertex(index);
    };
  });
  draw();
}

sides.onchange = setShape;
regular.onchange = setShape;
undo.onclick = () => {
  cuts.pop();
  draw();
  if (undo.disabled) vertices.children[start].focus();
};
reselect.onclick = () => {
  start = null;
  cuts = [];
  draw();
  vertices.firstElementChild.focus();
};
setShape();
