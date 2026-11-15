import {drawing,modes,tools,green,gold,blue,ink,select,switches,dragView,button,polygon,line,circle,label,explain} from './visual-labs.js';

let shape = 'prism';
let sides = 4;
let yaw = 24;
let tilt = 22;
let highlight = 'faces';
let sidePicker;
let highlightButtons;
const names = {prism:'角柱',pyramid:'角錐',cylinder:'圓柱',cone:'圓錐'};
const shapeNames = ['三角形','四邊形','五邊形','六邊形'];

switches(modes,Object.entries(names),shape,value => {
  shape = value;
  if (isRound() && (highlight === 'edges' || highlight === 'vertices')) {
    highlightButtons[0].click();
  }
  render();
});
sidePicker = select(tools,'底面',[3,4,5,6].map((n,index) => [n,shapeNames[index]]),sides,value => {
  sides = Number(value);
  render();
});
dragView(drawing, (dx,dy) => {
  yaw = (yaw - dx * .65) % 360;
  tilt = Math.max(-90,Math.min(90,tilt + dy * .65));
  render();
});
button(tools,'回到原視角',() => {
  yaw = 24;
  tilt = 22;
  render();
});
highlightButtons = switches(tools,[['faces','看底面與側面'],['edges','看邊'],['vertices','看頂點']],highlight,value => {
  highlight = value;
  render();
});

function isRound() {
  return shape === 'cylinder' || shape === 'cone';
}

function model() {
  const round = isRound();
  const prism = shape === 'prism' || shape === 'cylinder';
  const count = round ? 64 : sides;
  const bottom = [];
  const upper = [];
  const edges = [];
  const faces = [];
  for (let index = 0; index < count; index++) {
    const angle = (index + .5) * Math.PI * 2 / count;
    const x = 93 * Math.cos(angle);
    const z = 93 * Math.sin(angle);
    bottom.push([x,-83,z]);
    if (prism) upper.push([x,83,z]);
  }
  if (!prism) upper.push([0,103,0]);

  faces.push({indices:bottom.map((_,index) => index),type:'base'});
  if (prism) faces.push({indices:bottom.map((_,index) => 2*count-1-index),type:'base'});
  for (let index = 0; index < count; index++) {
    const next = (index+1) % count;
    faces.push({indices:prism ? [next,index,count+index,count+next] : [next,index,count],type:'side',index});
    edges.push([index,next],[index,prism ? count+index : count]);
    if (prism) edges.push([count+index,count+next]);
  }
  return {vertices:[...bottom,...upper],edges,faces,prism,count,round};
}

function projection([x,y,z]) {
  const azimuth = yaw * Math.PI / 180;
  const elevation = tilt * Math.PI / 180;
  const across = Math.cos(azimuth) * x + Math.sin(azimuth) * z;
  const depth = -Math.sin(azimuth) * x + Math.cos(azimuth) * z;
  return [300+across,169-y*Math.cos(elevation)+depth*Math.sin(elevation),y*Math.sin(elevation)+depth*Math.cos(elevation)];
}

function render() {
  const geometry = model();
  const {vertices,edges,faces,prism,count,round} = geometry;
  sidePicker.disabled = round;
  highlightButtons.slice(1).forEach(control => { control.disabled = round; });
  const points = vertices.map(projection);
  const visibleVertices = new Set();
  const visibleEdges = new Set();
  const projectedFaces = faces.map(face => {
    const vertices = face.indices.map(index => points[index]);
    const signedArea = vertices.reduce((sum,[x,y],index) => {
      const [nextX,nextY] = vertices[(index+1)%vertices.length];
      return sum + x*nextY-y*nextX;
    },0);
    const depth = vertices.reduce((sum,point) => sum+point[2],0) / vertices.length;
    return {...face,vertices,depth,visible:signedArea < -0.01};
  }).filter(face => face.visible).sort((first,second) => first.depth-second.depth);

  let html = '';
  const edgeKey = (a,b) => a < b ? `${a},${b}` : `${b},${a}`;
  for (const face of projectedFaces) {
    face.indices.forEach((index,i) => {
      visibleVertices.add(index);
      visibleEdges.add(edgeKey(index,face.indices[(i+1)%face.indices.length]));
    });
    const roundSide = (face.index % 8 < 3) ? (prism ? '#76adbd' : '#81baa6') : blue;
    const fill = highlight !== 'faces' ? '#f4faf3' : face.type === 'base' ? gold : round ? roundSide : green;
    html += polygon(face.vertices.map(point => point.slice(0,2)),fill,round ? fill : ink);
  }

  if (round) {
    const baseCount = prism ? 2 : 1;
    for (let base = 0; base < baseCount; base++) {
      for (let index = 0; index < count; index++) {
        const from = base*count + index;
        const to = base*count + (index+1) % count;
        if (!visibleEdges.has(edgeKey(from,to))) continue;
        const color = index % 8 < 3 ? '#466f66' : '#b18a48';
        html += line(...points[from].slice(0,2),...points[to].slice(0,2),
          `style="stroke:${color};stroke-width:3;stroke-linecap:round"`);
      }
    }
  } else if (highlight === 'edges') {
    for (const [a,b] of edges) {
      const visible = visibleEdges.has(edgeKey(a,b));
      html += line(...points[a].slice(0,2),...points[b].slice(0,2),
        visible ? 'style="stroke:#9a6224;stroke-width:3.5"' : 'stroke-dasharray="5 5" stroke-opacity=".55"');
    }
  } else if (highlight === 'vertices') {
    points.forEach(([x,y],index) => {
      html += circle(x,y,6,visibleVertices.has(index) ? gold : '#fff');
    });
  }

  drawing.innerHTML = html + label(300,322,round ? names[shape] : `${shapeNames[sides-3]}底面的${names[shape]}`,true);
  if (round) {
    explain(names[shape],prism ? '黃色圓形是底面。上下兩個底面全等、互相平行，帶直條紋的側面是曲面。' : '黃色圓形是唯一的底面。曲面上的條紋一路收向尖頂。轉一轉，把底面和尖頂都找出來。');
    return;
  }
  if (highlight === 'vertices') explain('數頂點',prism ? '上下兩個底面各有同樣多的頂點。空心點在模型背面。' : '先數底面的頂點，再加上尖頂。空心點在模型背面。',prism ? `${sides} × 2 = ${vertices.length} 個頂點` : `${sides} + 1 = ${vertices.length} 個頂點`);
  else if (highlight === 'edges') explain('數邊',prism ? '數上底的邊、下底的邊和連接上下底的邊。虛線是被擋住的邊。' : '數底面的邊，再數每個底面頂點連到尖頂的邊。虛線是被擋住的邊。',`${sides} × ${prism ? 3 : 2} = ${edges.length} 條邊`);
  else explain('數底面和側面',prism ? '黃色是兩個全等、互相平行的底面。綠色的長方形側面與底面垂直。轉到另一側，就能看見被擋住的底面。' : '黃色是一個多邊形底面，綠色是三角形側面。底面每多一條邊，就多一個三角形側面。',`${sides} 個側面 + ${prism ? 2 : 1} 個底面 = ${faces.length} 個面`);
}
render();
