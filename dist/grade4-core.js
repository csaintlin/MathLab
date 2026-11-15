import {svg, angle, angleFromPoint, toggles} from './grade3-core.js';

export {angle, angleFromPoint, toggles};
export const ink = '#285d48';
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rad = n => n * Math.PI / 180;
const point = (x, y, r, a) => [x + r * Math.cos(rad(a)), y - r * Math.sin(rad(a))];
const line = (a, b, color = ink, width = 2) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${width}"/>`;
const label = (x, y, value, size = 12) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${ink}">${value}</text>`;
const dot = ([x,y], attr = '') => `<circle cx="${x}" cy="${y}" r="6" fill="${ink}" ${attr}/>`;
export const angleKind = n => n === 180 ? '平角' : n === 90 ? '直角' : n < 90 ? '銳角' : '鈍角';
export const aligned = ({x,y,rotation}) => Math.hypot(x-180,y-155) <= 4 && Math.abs(rotation) <= 2;
export function protractor(degrees, tool, length = 126, circle = '', interactive = false) {
  const base = [180,155], end = point(...base,length,degrees);
  const arc = point(...base,35,degrees);
  const angleArt = `<path d="M180 155h35 A35 35 0 0 0 ${arc.join(' ')} Z" fill="#f1d486"/>`
    + line(base, point(...base,126,0), '#99662c', 3) + line(base,end,ink,3) + dot(base);
  const ticks = Array.from({length:37}, (_,i) => {
    const n=i*5;
    return line(point(0,0,108,n),point(0,0,i%2?103:99,n),ink,1)
      + (i%2 ? '' : [[89,n,'right'],[75,180-n,'left']].map(([r,v,key]) => {
        const [x,y] = point(0,0,r,n);
        if (interactive && circle !== key) return '';
        return `<g opacity="${circle && circle !== key ? '.25' : '1'}">${label(x,y+3,v,9)}</g>`;
      }).join(''));
  }).join('');
  const overlay = tool ? `<g transform="translate(${tool.x} ${tool.y}) rotate(${-tool.rotation})">
    <path data-tool d="M-110 0 A110 110 0 0 1 110 0 Z" fill="#acd4e5" fill-opacity=".46" stroke="${ink}"/>
    <g pointer-events="none">${ticks}${line([-9,0],[9,0])}${line([0,-8],[0,8])}</g></g>` : '';
  const rotationSlider = interactive ? `<g data-rotation role="slider" tabindex="0" aria-label="旋轉量角器" aria-valuemin="-35" aria-valuemax="35" aria-valuenow="${tool.rotation}">
    <path d="M ${point(180,155,142,55).join(' ')} A142 142 0 0 0 ${point(180,155,142,125).join(' ')}" fill="none" stroke="#63957f" stroke-width="5"/>
    <path d="M ${point(180,155,142,55).join(' ')} A142 142 0 0 0 ${point(180,155,142,125).join(' ')}" fill="none" stroke="transparent" stroke-width="26"/>
    ${dot(point(180,155,142,90+tool.rotation))}
  </g>` : '';
  const handle = interactive ? dot(end,'data-ray') : '';
  return svg(360,218,overlay+angleArt+`<circle cx="${end[0]}" cy="${end[1]}" r="15" fill="transparent" data-ray/>`+handle+rotationSlider,'角與量角器');

}

export function trianglePreset(kind, variant = 0, large = false) {
  const a=55+variant%7*4, b=42+variant%5*5;
  const coordinates = {
    equilateral: [[-a,32],[a,32],[0,32-a*Math.sqrt(3)]],
    isosceles: [[-a,32],[a,32],[0,-b]],
    right: [[-a,-b],[-a,33],[a,33]],
    both: [[-a,-a/2],[-a,a/2],[0,a/2]],
    obtuse: [[-a,18],[a,18],[-a/2,-13]],
    acute: [[-a,32],[a,32],[a/4,-a]]
  }[kind];
  const turn=rad(variant%12*30);
  const scale=.85;
  const points=coordinates.map(([x,y]) => {
    const u=variant%2 ? -x : x;
    return [180+scale*(u*Math.cos(turn)-y*Math.sin(turn)),110+scale*(u*Math.sin(turn)+y*Math.cos(turn))];
  });
  if(!large)return points;
  const xs=points.map(p=>p[0]), ys=points.map(p=>p[1]);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const fit=Math.min(1.65,290/(maxX-minX),174/(maxY-minY));
  return points.map(([x,y])=>[180+(x-(minX+maxX)/2)*fit,110+(y-(minY+maxY)/2)*fit]);
}
export function triangleInfo(points) {
  const vectors = points.map(([x,y],i) => [points[(i+1)%3][0]-x,points[(i+1)%3][1]-y]);
  const lengths = vectors.map(v => Math.hypot(...v));
  const area2 = Math.abs(vectors[0][0]*vectors[1][1]-vectors[0][1]*vectors[1][0]);
  if (area2<450 || Math.min(...lengths)<22) return null;
  const angles=vectors.map((v,i) => {
    const j=(i+2)%3;
    return Math.acos(clamp(-(v[0]*vectors[j][0]+v[1]*vectors[j][1])/(lengths[i]*lengths[j]),-1,1))*180/Math.PI;
  });
  const equal = lengths.map((v,i) => lengths.some((w,j) => i!==j && Math.abs(v-w)<1e-7));
  const max=Math.max(...angles);
  return {lengths,angles,equal, sides:equal.every(Boolean)?'正三角形':equal.some(Boolean)?'等腰三角形':'一般三角形',
    kind:Math.abs(max-90)<1e-7?'直角三角形':max>90?'鈍角三角形':'銳角三角形'};
}
const triangleEdgeColors=['#285d48','#286b91','#9a4c21'];

export function triangleGraphic(points, mode = '', interactive = false) {
  const info=triangleInfo(points);
  const center=points.reduce(([x,y],p)=>[x+p[0]/3,y+p[1]/3],[0,0]);
  const art=`<polygon points="${points.join(' ')}" fill="#e3efe0"/>` + points.map((p,i) => {
    const q=points[(i+1)%3], name='甲乙丙'[i];
    if(interactive){
      const x=(p[0]+q[0])/2, y=(p[1]+q[1])/2;
      const dx=q[0]-p[0], dy=q[1]-p[1], length=info.lengths[i];
      const side=(center[0]-x)*dy-(center[1]-y)*dx>0?-1:1;
      const color=triangleEdgeColors[i];
      return line(p,q,color,3)
        +(mode==='edges'?`<g class="grade4-edge-label" style="--edge-color:${color}">${label(clamp(x+side*dy/length*13,18,342),clamp(y-side*dx/length*13+3,12,215),Math.round(length),9)}</g>`
          :label(p[0]*.8+center[0]*.2,p[1]*.8+center[1]*.2,`${Number(info.angles[i].toFixed(1))}°`,9))
        +dot(p,`data-vertex="${i}" tabindex="0" aria-label="頂點 ${i+1}，用方向鍵移動"`);
    }
    return line(p,q,mode==='edges' && info.equal[i]?'#a66920':ink,3)
      + label((p[0]+q[0])/2,(p[1]+q[1])/2-6,mode==='edges'?`${name} 約 ${info.lengths[i].toFixed(1)}`:name)
      + dot(p)
      + (mode==='angles'?label(p[0]*.74+180*.26,p[1]*.74+110*.26,`${Number(info.angles[i].toFixed(1))}°`,10):'');
  }).join('');
  return svg(360,220,art,interactive?'三角形，三邊以不同顏色區分':'三角形，三邊分別標示甲、乙、丙');
}

export const gridSize = 12;
export function rectangle(w,h) {
  return new Set(Array.from({length:w*h},(_,i)=>Math.floor(i/w)*gridSize+i%w));
}
export function boundary(cells) {
  return [...cells].flatMap(i => {
    const x=i%gridSize, y=Math.floor(i/gridSize);
    return [
      [i-gridSize,y===0,[x,y],[x+1,y]],
      [i+1,x===gridSize-1,[x+1,y],[x+1,y+1]],
      [i+gridSize,y===gridSize-1,[x+1,y+1],[x,y+1]],
      [i-1,x===0,[x,y+1],[x,y]]
    ].filter(([next,edge])=>edge||!cells.has(next)).map(([, , a,b])=>[a,b]);
  });
}
function reachable(cells) {
  const seen=new Set(), queue=[[...cells][0]];
  while (queue.length) {
    const i=queue.pop();
    if (!cells.has(i)||seen.has(i)) continue;
    seen.add(i);
    queue.push(i-gridSize,i+gridSize);
    if (i%gridSize) queue.push(i-1);
    if (i%gridSize<gridSize-1) queue.push(i+1);
  }
  return seen.size;
}
export function validGrid(cells) {
  if (!cells.size || reachable(cells)!==cells.size) return false;
  const empty=new Set(Array.from({length:144},(_,i)=>i).filter(i=>!cells.has(i)));
  // Join all exterior empty cells with a virtual border via a padded flood fill.
  const queue=[...empty].filter(i=>i<12||i>=132||i%12===0||i%12===11);
  while (queue.length) {
    const i=queue.pop();
    if (!empty.delete(i)) continue;
    queue.push(i-12,i+12);
    if(i%12) queue.push(i-1);
    if(i%12<11) queue.push(i+1);
  }
  return empty.size===0;
}
export function gridGraphic(cells, outline=true, animated=false) {
  const scale=17, p=([x,y])=>[x*scale+14,y*scale+14];
  const blocks=[...cells].map(i=>{const [x,y]=p([i%12,Math.floor(i/12)]);
    return `<rect x="${x}" y="${y}" width="17" height="17" fill="#a9d3b4" stroke="#78977f"/>`;
  }).join('');
  const edges=outline?boundary(cells):[];
  let perimeter=edges.map(([a,b])=>line(p(a),p(b),'#9a571b',3)).join('');
  if(animated) {
    const remaining=new Map(edges.map(([a,b])=>[a.join(),b]));
    while(remaining.size) {
      const first=remaining.keys().next().value;
      let key=first, path='M'+p(first.split(',').map(Number)).join(' ');
      while(remaining.has(key)) {
        const next=remaining.get(key);
        remaining.delete(key);
        path+=' L'+p(next).join(' ');
        key=next.join();
      }
      perimeter+=`<path class="grade4-trace" pathLength="1" d="${path}" fill="none" stroke="#e7ab39" stroke-width="4"/>`;
    }
  }
  return svg(232,232,blocks+perimeter,'同尺度單位方格圖');
}

export const placeNames={10:'十',100:'百',1000:'千'};
export const methodNames={round:'四捨五入',down:'無條件捨去',up:'無條件進入'};
export function rounding(n,u,method='round') {
  const low=Math.floor(n/u)*u, high=low+u, mid=low+u/2;
  const value=n===low||method==='down'?low:method==='up'||n>=mid?high:low;
  return {low,high,mid,value};
}
export function numberLine(n,u) {
  const {low,high,mid}=rounding(n,u);
  const x=35+(n-low)/u*290;
  return svg(360,100,line([35,58],[325,58])+Array.from({length:11},(_,i)=>{
    const x=35+29*i;
    return line([x,54],[x,i%5===0?67:62],ink,1);
  }).join('')+dot([x,58])+label(x,36,n)+label(35,82,low)+label(180,82,mid)+label(325,82,high),'取概數數線');
}

export function chartData(seed, time=false) {
  const step=[1,2,5,10][seed%4], offset=Math.floor(seed/4)%5;
  const pattern=time?[[6,5,8,4,7],[9,4,7,5,6],[5,8,7,9,4]][seed%3]:[8,3,5,7,2];
  const values=pattern.map(v=>(v+offset)*step);
  return {step, max:14*step, values, time,
    title:time?'每日中午的氣溫':'最喜歡的水果',
    unit:time?'°C':'人', labels:time?['週一','週二','週三','週四','週五']:['蘋果','橘子','香蕉','葡萄','芭樂']};
}
export const chartX=i=>73+60*i;
export const chartY=(value,data)=>190-value/data.max*147;
export function chartGraphic(data, values=data.values, type='bar', numbers=false, interactive=false) {
  const grid=Array.from({length:15},(_,i)=>{
    const y=chartY(i*data.step,data);
    return line([43,y],[343,y],i?'#d5e2d7':ink,1)+label(26,y+3,i*data.step,9);
  }).join('');
  const marks=values.map((value,i)=>{
    if(value===null)return '';
    const x=chartX(i),y=chartY(value,data);
    const mark=type==='bar'?`<rect x="${x-15}" y="${y}" width="30" height="${190-y}" fill="#a9d3b4" stroke="${ink}"/>`:dot([x,y]);
    return mark+(numbers?label(x,y-8,value,10):'');
  }).join('');
  const segments=type==='line'?values.map((v,i)=>i&&v!==null&&values[i-1]!==null?
    line([chartX(i-1),chartY(values[i-1],data)],[chartX(i),chartY(v,data)]):'').join(''):'';
  const hits=interactive?data.labels.map((_,i)=>`<rect x="${chartX(i)-28}" y="40" width="56" height="155" fill="transparent" data-chart-index="${i}"/>`).join(''):'';
  return svg(365,232,label(192,19,data.title,14)+label(24,31,data.unit,10)+grid+line([43,43],[43,190])+segments+marks+
    data.labels.map((name,i)=>label(chartX(i),210,name,11)).join('')+label(190,229,`每格 ${data.step} ${data.unit}`,11)+hits,data.title);
}
