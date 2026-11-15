import {drawing,tools,green,gold,blue,ink,slider,dragView,button,circle,line,label,explain} from './visual-labs.js';

const radius = 105;
let cut = 58;
let roll = 0;
let tilt = 14;

dragView(drawing, (dx,dy) => {
  roll = (roll + dx * .7) % 360;
  tilt = (tilt + dy * .7) % 360;
  render();
}, event => {
  const matrix = drawing.getScreenCTM();
  if (!matrix) return false;
  const point = new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  return point.x < 300;
});
button(tools,'回到原視角',() => {
  roll = 0;
  tilt = 14;
  render();
});
const input = slider(tools,'切面位置',-100,100,1,cut,value => {
  cut = value;
  render();
});
button(tools,'切到正中央',() => {
  cut = 0;
  input.value = cut;
  render();
});
button(tools,'移到球面',() => {
  cut = 100;
  input.value = cut;
  render();
});

function render() {
  const offset = cut / 100 * radius;
  const crossRadius = Math.sqrt(radius ** 2 - offset ** 2);
  const angle = tilt * Math.PI / 180;
  const y = 173 - offset * Math.cos(angle);
  const projectedRadius = crossRadius * Math.abs(Math.sin(angle));
  const center = cut === 0;
  let html = '<defs><radialGradient id="sphere-light" cx="33%" cy="26%" r="72%"><stop stop-color="#f5fbeb"/><stop offset="1" stop-color="#81b69c"/></radialGradient></defs>';
  html += circle(156,173,radius,'url(#sphere-light)');
  html += `<g transform="rotate(${roll} 156 173)">`;
  html += line(156,173-radius*Math.cos(angle),156,173+radius*Math.cos(angle),'stroke-dasharray="5 5" stroke-opacity=".65"');
  html += `<ellipse cx="156" cy="${y}" rx="${crossRadius}" ry="${projectedRadius}" fill="${gold}" fill-opacity=".78" stroke="${ink}" stroke-width="2"/>`;
  html += line(156-crossRadius,y,156+crossRadius,y,'stroke-dasharray="5 5"');
  html += '</g>';
  html += circle(156,173,5,ink) + label(119,190,'球心',true);
  html += label(156,40,'球與切面') + label(445,40,'正對切面看');
  html += cut === 100 || cut === -100 ? circle(445,173,4,ink) : circle(445,173,crossRadius,center ? green : blue);
  if (center) {
    html += line(340,173,550,173,'stroke-width="3"');
    html += line(445,173,550,173,'style="stroke:#976521;stroke-width:5"');
    html += circle(445,173,5,ink);
    html += label(445,153,'球心',true) + label(503,195,'半徑',true) + label(445,307,'整條線是直徑');
  }
  drawing.innerHTML = html;
  if (center) explain('切過球心，得到最大的圓','從球心連到球面的一段是半徑。穿過球心、兩端都在球面上的整條線段是直徑。','直徑 = 半徑 × 2');
  else if (Math.abs(cut) === 100) explain('切面只碰到一個點','試著把切面移回球的中央，看看切面會怎麼變。');
  else explain('切面是圓形','往球心靠近，右邊的圓會越來越大。試著找到切面最大的地方。');
}
render();
