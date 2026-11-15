const green = '#a9d3b4', gold = '#f1d486', blue = '#acd4e5', ink = '#38634f';
export const random = (min,max) => min + Math.floor(Math.random() * (max-min+1));
const pick = values => values[random(0,values.length-1)];
export function shuffle(values) {
  const copy = [...values];
  for (let i=copy.length-1;i>0;i--) {
    const j=random(0,i);
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
const svg = (name,content) => `<svg viewBox="0 0 300 150" role="img" aria-label="${name}">${content}</svg>`;
const box = (x,y,w,h,fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${ink}"/>`;
const poly = (points,fill) => `<polygon points="${points}" fill="${fill}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`;
const line = (x,y,x2,y2,color=ink,dash='') => `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash}/>`;
const text = (x,y,value) => `<text x="${x}" y="${y}" text-anchor="middle" fill="${ink}">${value}</text>`;
const dot = (x,y,color=ink,r=4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const dash = 'stroke-dasharray="4 4"';
const visual = (kind,prompt,diagram,answer,options,solution) => ({kind,prompt,diagram,answer,options:shuffle([answer,...options]),solution});
const numeric = (kind,prompt,diagram,answer,solution,unit='') => ({kind,prompt,diagram,answer,solution,unit});
const control = (kind,prompt,solution,interaction) => ({kind,prompt,solution,interaction});
const diagramOption = (name,graphic) => `<span>${name}</span>${graphic}`;
const gcd = (a,b) => b ? gcd(b,a%b) : a;

function strip(y,den,filled,x=36,width=228) {
  return Array.from({length:den},(_,i)=>box(x+i*width/den,y,width/den,24,
    typeof filled==='number' ? (i<filled?green:'#fff') : filled[i] ?? '#fff')).join('');
}
const barPair = (a,b,c,d) => svg(`等長分數條 ${a}/${b} 和 ${c}/${d}`,text(150,25,`${a}/${b}`)+strip(34,b,a)+text(150,89,`${c}/${d}`)+strip(98,d,c));
const stripOption = (den,colors) => svg(`切成 ${den} 格，塗色 ${colors.length} 格`,strip(62,den,colors));

function fractions() {
  const [a,b,c,d] = pick([[1,2,1,3],[3,4,1,6],[2,3,1,4],[3,5,1,3],[3,4,1,8],[2,3,1,6]]);
  const common = b*d/gcd(b,d), first = a*common/b, second = c*common/d;
  const bars = barPair(a,b,c,d);
  const colors = (amount,color) => Array(amount).fill(color);
  const addition = [...colors(first,green),...colors(second,gold)];
  return [
    visual('通分切格','兩條分數條一樣長。最少要把每條切成幾等份，才能對齊原來所有的切線？',bars,`${common} 等份`,[`${common+1} 等份`,`${common-1} 等份`],`${common} 是 ${b} 和 ${d} 的最小公倍數。`),
    numeric('等值分數',`綠色的長度沒變。分母變成 ${common} 時，分子是多少？`,svg('相同長度的塗色',text(150,25,`${a}/${b}`)+strip(35,b,a)+text(150,88,`？/${common}`)+strip(98,common,first)),first,`每小格是 1/${common}，綠色有 ${first} 格。`),
    visual('合併色塊','選出通分後把兩段色塊接起來的圖。',bars,stripOption(common,addition),[stripOption(common,colors(first,green)),stripOption(common,colors(first-second,green))],`${first}/${common} ＋ ${second}/${common} ＝ ${first+second}/${common}。`),
    visual('拿掉色塊','從第一條的塗色長度拿掉第二條的塗色長度，哪張圖是剩下的部分？',bars,stripOption(common,colors(first-second,green)),[stripOption(common,colors(first,green)),stripOption(common,addition)],`${first}/${common} − ${second}/${common} ＝ ${first-second}/${common}。`),
    visual('找出錯誤','要把這兩段加起來，哪個做法有問題？',bars,'直接把不同大小的原始格子當成同一種格子來數。',['先用同樣大小的格子重新切分。','通分前後，保持兩段塗色的長度。'],'要先統一每格的大小，才能合併格數。')
  ];
}

const mirrorAxis = x => line(x,12,x,139,'#527f9b',dash);
const arrow = '0,-5 32,-5 32,-14 54,0 32,14 32,5 0,5';
function symmetry() {
  const axisX = pick([126,150,174]), dx = random(2,4)*15, y = pick([53,73,93]);
  const original = axisX-dx, reflection = axisX+dx;
  const motif = pick([
    '0,-53 13,-21 40,-25 28,0 47,27 16,26 0,53 -16,26 -47,27 -28,0 -40,-25 -13,-21',
    '0,-50 12,-17 48,-15 20,9 29,43 0,23 -29,43 -20,9 -48,-15 -12,-17',
    '0,-23 20,-43 46,-43 54,-23 31,4 41,32 20,48 0,24 -20,48 -41,32 -31,4 -54,-23 -46,-43 -20,-43'
  ]);
  const rotation = pick([0,90]);
  const fold = candidate => svg('圖形與候選摺線',`<g transform="translate(150 75) rotate(${rotation})">${poly(motif,green)}</g><g transform="rotate(${candidate} 150 75)">${mirrorAxis(150)}</g>`);
  const mirrorDiagram = svg('原點、鏡子和候選位置',mirrorAxis(axisX)+dot(original,y)+text(original,y-13,'原點')+
    [reflection,reflection-15,reflection+15].map((x,i)=>dot(x,i===1?y+20:y,gold,6)+text(x,i===1?y+39:y-12,'甲乙丙'[i])).join(''));
  const direction = pick([-1,1]);
  const arrowAt = (x,flip) => `<g transform="translate(${x} 76) scale(${flip} 1)">${poly(arrow,flip===direction?green:gold)}</g>`;
  const arrowLeft = direction===1 ? 54 : 108;
  const correctArrow = 2*150-arrowLeft;
  const arrows = (x,flip) => svg('箭頭及候選倒影',mirrorAxis(150)+arrowAt(arrowLeft,direction)+arrowAt(x,flip));
  const target = pick([105,150,195]);
  const start = target+45;
  const marks = ['甲','乙','丙'];
  const positions = [55,115,175];
  const kept = pick([1,2]);
  const moved = kept===1?85:145;
  return [
    visual('找對稱軸','沿哪一條虛線對摺，兩半會重合？','',diagramOption(rotation===0?'直線':'橫線',fold(rotation)),[diagramOption(rotation===0?'橫線':'直線',fold((rotation+90)%180)),diagramOption('斜線',fold(45))],'沿正確的軸對摺，左右兩側的對應部分會疊在一起。'),
    visual('找鏡像點','原點的鏡像是哪一個點？',mirrorDiagram,'甲',['乙','丙'],'甲與原點同高，而且兩點到鏡子的水平距離相同。'),
    visual('判斷倒影','哪張圖的箭頭是鏡中的正確倒影？','',arrows(correctArrow,-direction),[arrows(correctArrow-16,-direction),arrows(direction===1?190:242,direction)],'鏡像左右翻轉，對應的點離鏡子一樣遠。'),
    control('移動鏡子','拖動鏡線，讓它剛好落在兩個對稱點的中間。','兩點的連線垂直於鏡線，而且鏡線平分這條連線。',{
      type:'range',label:'拖動鏡線',min:45,max:255,step:15,start,answer:target,fromX:x=>x,draw:x=>svg('兩個對稱點與可移動鏡線',line(target-45,77,target+45,77,ink,dash)+dot(target-45,77,green,7)+dot(target+45,77,gold,7)+mirrorAxis(x))
    }),
    visual('鏡子移動','鏡子從右邊的虛線移到左邊的實線，哪幾段筆畫還會出現在鏡中？',svg('三段筆畫與鏡子的原位置、移動後位置',
      positions.map((x,i)=>line(x,46,x,105,ink)+text(x,124,marks[i])).join('')+mirrorAxis(220)+line(moved,12,moved,139,'#527f9b')),

      kept===1?'只有甲':'甲和乙',[kept===1?'甲和乙':'只有甲','甲、乙和丙'],'移動後，只有實線左邊的筆畫會反射。')
  ];
}

const cellSize = (rows,cols) => Math.min(19,240/cols,104/rows);
function grid(rows,cols,cut,remove=false) {
  const size = cellSize(rows,cols);
  const start = (300-cols*size)/2;
  let content = '';
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const x=start+c*size,y=27+r*size;
    content += box(x,y,size,size,c<cut?green:gold);
    if (remove && c>=cut) content += line(x,y+size,x+size,y,'#a97232');
  }
  return svg(`${rows} 排、每排 ${cols} 格，切在第 ${cut} 格之後`,content+line(start+cut*size,21,start+cut*size,34+rows*size));
}
function stacks(values,selected=null) {
  return svg(`甲乙丙三柱分別有 ${values.join('、')} 塊`,values.map((n,i)=>{
    const x=51+80*i;
    return Array.from({length:n},(_,j)=>box(x,116-7*j,38,7,i===selected&&j===n-1?gold:green)).join('')+text(x+19,141,`${'甲乙丙'[i]} ${n}`);
  }).join(''));
}
function arithmetic() {
  const rows=random(3,7),cols=random(9,13),cut=random(3,cols-3),extra=random(2,5);
  const average=random(3,5), values=shuffle([average-2,average-1,average+3]);
  return [
    visual('分配律算式','哪個算式和兩塊方格相符？',grid(rows,cols,cut),`${rows} × ${cut} ＋ ${rows} × ${cols-cut}`,[`${rows} × ${cut} ＋ ${cols-cut}`,`${rows} × ${cut} × ${cols-cut}`],'兩塊都有相同排數，每排的格數分別乘上排數再相加。'),
    control('移動切線',`把每排 ${cols} 格切成左邊 ${cut} 格、右邊 ${cols-cut} 格。`,`在每排第 ${cut} 格後面切開，就能得到指定的兩塊。`,{type:'range',label:'左邊格數',min:1,max:cols-1,step:1,start:1,answer:cut,fromX:x=>cols/2+(x-150)/cellSize(rows,cols),draw:value=>grid(rows,cols,value)}),
    visual('先補大再扣掉',`原本每排有 ${cols} 格，現在在右邊加上 ${extra} 格，變成每排 ${cols+extra} 格。看圖，要去掉哪一部分，才能變回每排 ${cols} 格？`,grid(rows,cols+extra,cols,true),`右邊有斜線的 ${rows} × ${extra} 格`,[`左邊綠色的 ${rows} × ${cols} 格`,`只有右邊第一排的 ${extra} 格`],'每一排補上的格數都要扣掉。'),
    visual('平均後的樣子','哪一組搬運結果三柱一樣高，而且積木總數和原來一樣？',stacks(values),stacks([average,average,average]),[stacks([average+1,average+1,average+1]),stacks([average-1,average,average+1])],'平均分配同時要符合兩個條件：三柱一樣高，而且總數不變。')
  ];
}

function area() {
  const base=random(7,12),height=random(3,7),top=random(3,6),s=pick([22,32,42]);
  const slope = pick([-14,0,14]);
  const parallelogram = (shift,width=125,tall=68) => {
    const x=(300-width-shift)/2, y=112-tall;
    return svg('平行四邊形的底和高',poly(`${x},112 ${x+width},112 ${x+width+shift},${y} ${x+shift},${y}`,green)+
      line(x+shift,y,x+shift,112,ink,dash)+text(150,135,`底 ${Math.round(width/125*base)} cm · 高 ${Math.round(tall/68*height)} cm`));
  };
  const heightFigure = svg('有指定底邊及三條候選線段的平行四邊形',
    `<g transform="rotate(${slope} 150 75)">${poly(`57,112 193,112 ${193+s},40 ${57+s},40`,green)}`+
    line(57,112,193,112,'#a46d2a')+
    line(57+s,40,57+s,112,'#2a677c',dash)+line(57+s,40,57,112,'#8a522d',dash)+line(193+s,40,193,112,'#8a522d',dash)+
    text(54,77,'甲')+text(70+s,83,'乙')+text(204+s/2,83,'丙')+text(139,132,'指定的底')+'</g>');
  const cutFigure = svg('左側剪下金色三角形，右側有待補的空位',
    poly(`${57+s},112 193,112 ${193+s},40 ${57+s},40`,green)+poly(`57,112 ${57+s},112 ${57+s},40`,gold)+
    `<polygon points="193,112 ${193+s},112 ${193+s},40" fill="none" stroke="${ink}" stroke-dasharray="4 4"/>`);
  const tri = svg('兩片三角形拼成平行四邊形',
    poly('67,108 199,108 103,35',green)+poly('103,35 235,35 199,108',gold)+text(150,130,`底 ${base} cm、高 ${height} cm`));
  const shortWidth = 195 * top / (base + top);
  const longWidth = 195 - shortWidth;
  const trap = svg('兩片梯形拼成平行四邊形，上下各由一段長底和一段短底接成',
    poly(`40,103 ${40+longWidth},103 ${65+shortWidth},38 65,38`,green)+
    poly(`${65+shortWidth},38 260,38 235,103 ${40+longWidth},103`,gold)+
    text(65+shortWidth/2,25,`短底 ${top} cm`)+text(260-longWidth/2,25,`長底 ${base} cm`)+
    text(40+longWidth/2,126,`長底 ${base} cm`)+text(235-shortWidth/2,126,`短底 ${top} cm`));
  return [
    visual('找垂直的高','橘色的邊是指定的底，哪一條線段是對應的高？',heightFigure,'乙',['甲','丙'],'高是兩條平行底邊之間的垂直距離。乙和指定底邊垂直。'),
    visual('剪開再拼','黃色三角形應該移到哪裡，才能拼成一個長方形？',cutFigure,'右側虛線的空位',['綠色圖形的正上方','綠色圖形的正下方'],'把剪下的三角形向右平移，斜邊剛好貼齊，填成長方形。'),
    visual('比較底和高','看上面的平行四邊形。下面哪一個圖形的底跟它一樣長，高也跟它一樣？',parallelogram(s),parallelogram(s+23),[parallelogram(s+23,160,68),parallelogram(s+23,125,45)],`找底是 ${base} cm、高是 ${height} cm 的圖。兩個圖形可以斜得不一樣。`),
    numeric('兩片三角形','黃色和綠色是相同的三角形。原來一片的面積是多少？',tri,base*height/2,`兩片拼成底 ${base} cm、高 ${height} cm 的平行四邊形。一片是 ${base} × ${height} ÷ 2 ＝ ${base*height/2}。`,'平方公分'),
    visual('兩片梯形','把兩片梯形拼在一起後，最上面那條長邊是由哪兩段接起來的？',trap,'梯形的長底 ＋ 梯形的短底',['梯形的長底 ＋ 梯形的長底','梯形的長底 ＋ 梯形的高'],`最上面左邊是綠色梯形的短底，右邊是黃色梯形的長底，合起來是 ${top} ＋ ${base} ＝ ${top+base} cm。`)
  ];
}

const solidNames = {prism:'角柱',pyramid:'角錐',cylinder:'圓柱',cone:'圓錐'};
function solidGraphic(type,n,angle=15,marked='') {
  const round=type==='cylinder'||type==='cone';
  const upright=type==='prism'||type==='cylinder';
  const count=round?40:n;
  const points=Array.from({length:count},(_,i)=>{
    const theta=(i/count)*2*Math.PI+angle*Math.PI/180;
    return [150+62*Math.cos(theta),20*Math.sin(theta)];
  });
  const at=(point,y)=>[point[0],point[1]+y];
  const base=points.map(point=>at(point,104)), top=points.map(point=>at(point,48));
  const apex=[150,18];
  const faces=points.map((point,i)=>{
    const j=(i+1)%count;
    return {i,j,depth:(point[1]+points[j][1])/2};
  });
  let graphic='';
  if (!upright) graphic+=poly(base,marked==='base'?gold:green);
  faces.filter(face=>face.depth>0).sort((a,b)=>a.depth-b.depth).forEach(({i,j})=>{
    const corners=upright?[base[i],base[j],top[j],top[i]]:[base[i],base[j],apex];
    graphic+=round? `<polygon points="${corners.join(' ')}" fill="${marked==='side'?gold:blue}" stroke="${marked==='side'?gold:blue}"/>`
      : poly(corners,marked==='side'?gold:i%2?green:'#c3dec8');
  });
  if (upright) graphic+=poly(top,marked==='base'?gold:'#d6e7d0');
  if (round && !upright) graphic+=`<path d="M88 104L150 18l62 86" fill="none" stroke="${ink}" stroke-width="2"/>`;
  if (marked==='vertices') {
    if (!upright) graphic+=dot(...apex,'#a76a2d',5);
    graphic+=base.map(point=>dot(...point,'#a76a2d',5)).join('');
    if (upright) graphic+=top.map(point=>dot(...point,'#a76a2d',5)).join('');
  }
  return svg('立體模型'+(marked?'與高亮標示':''),graphic);
}
function solids() {
  const type=pick(Object.keys(solidNames)),n=random(3,6),angle=pick([15,40,67]);
  const round=pick(['cone','cylinder']),surface=pick(['base','side']);
  const countType=pick(['prism','pyramid']);
  const countMode=pick(['頂點','邊','面']);
  const prism=countType==='prism';
  const totals = prism ? [2*n,3*n,n+2] : [n+1,2*n,n+1];
  const mode=['頂點','邊','面'].indexOf(countMode);
  const increase=(prism?[2,3,1]:[1,2,1])[mode];
  return [
    {...visual('辨認形體','轉一轉模型，這是什麼立體形體？','',solidNames[type],Object.values(solidNames).filter(name=>name!==solidNames[type]),{
      prism:'角柱有兩個全等的多邊形底面，側面是長方形。',pyramid:'角錐有一個多邊形底面，三角形側面都連到尖頂。',cylinder:'圓柱有兩個圓形底面和一個曲面。',cone:'圓錐有一個圓形底面和一個尖頂。'
    }[type]),view:{type:'view',label:'旋轉模型',min:0,max:360,step:5,start:angle,draw:value=>solidGraphic(type,n,value)}},
    visual('辨認底面','哪張圖用黃色標出圓柱的一個底面？','',solidGraphic('cylinder',n,angle,'base'),[solidGraphic('cylinder',n,angle,'side')],'圓柱的底面是兩個全等的圓，圖中標出可見的上底面。'),
    visual('平面或曲面','黃色標示的部分是平面還是曲面？',solidGraphic(surface==='base'?'cylinder':round,n,angle,surface),surface==='base'?'平面':'曲面',[surface==='base'?'曲面':'平面'],'圓形底面是平的；繞著圓柱或圓錐的側面是彎曲的。'),
    numeric('數構成要素',`這個${solidNames[countType]}的底面是 ${n} 邊形。它總共有幾個${countMode}？背面也要算。`,solidGraphic(countType,n,angle,mode===0?'vertices':''),totals[mode],`底面有 ${n} 條邊。這個${solidNames[countType]}的${countMode}共有 ${totals[mode]} 個。`),
    visual('底面多一邊',`同一種${solidNames[countType]}，底面從 ${n} 邊形變成 ${n+1} 邊形後，${countMode}多了幾個？`,`<div class="quiz-compare">${solidGraphic(countType,n,angle)}${solidGraphic(countType,n+1,angle)}</div>`,`多 ${increase} 個`,[1,2,3].filter(i=>i!==increase).map(i=>`多 ${i} 個`),`每增加一條底邊，這種${solidNames[countType]}的${countMode}就增加 ${increase} 個。`)
  ];
}

const sphereCut=(offset,options={})=>{
  const radius=56,y=74-offset;
  const cross=Math.sqrt(radius*radius-offset*offset);
  const outline=`<circle cx="86" cy="74" r="${radius}" fill="#dcebdd" stroke="${ink}" stroke-width="2"/>`;
  return svg('球與切面',outline+`<ellipse cx="86" cy="${y}" rx="${cross}" ry="${cross/4}" fill="${gold}" stroke="${ink}"/>`+
    (options.center?dot(86,74):'')+`<circle cx="222" cy="74" r="${cross}" fill="${gold}" stroke="${ink}" stroke-width="2"/>`);
};
function sphere() {
  const far=pick([32,40,47]), near=pick([12,20,24]);
  const pair=shuffle([far,near]);
  const sign=pick([-1,1]), wantDiameter=pick([true,false]), angle=pick([0,25,50]);
  const center=svg('中央切面與甲乙丙三個候選點',
    `<circle cx="150" cy="75" r="56" fill="${gold}" stroke="${ink}"/>`+
    [[150,75],[150,42],[183,88]].map(([x,y],i)=>dot(x,y)+text(x+13,y+4,'甲乙丙'[i])).join(''));
  const segment = type => svg('球的中央切面及標記的線段',
    `<circle cx="150" cy="75" r="56" fill="#e9f2e4" stroke="${ink}"/><g transform="rotate(${angle} 150 75)">`+
    (type==='diameter'?line(94,75,206,75,'#a56d31'):type==='radius'?line(150,75,206,75,'#a56d31'):line(102,46,198,46,'#a56d31'))+'</g>'+dot(150,75));
  return [
    visual('最大切面','哪個位置能切出最大的圓？','',sphereCut(0),[sphereCut(sign*far),sphereCut(-sign*near)],'切面通過球心時，得到最大的圓。'),
    visual('比較切面','甲和乙的切面離球心不同遠，哪個切面較大？',
      `<div class="quiz-compare"><div>甲${sphereCut(sign*pair[0],{center:true})}</div><div>乙${sphereCut(-sign*pair[1],{center:true})}</div></div>`,
      pair[0]===near?'甲':'乙',[pair[0]===near?'乙':'甲','兩個一樣大'],'切面越靠近球心，得到的圓越大。'),
    visual('找球心','這是球的中央切面。哪一個點是球心？',center,'甲',['乙','丙'],'中央切面圓的中心，就是球心。'),
    visual('半徑與直徑',`哪條橘色線段是球的${wantDiameter?'直徑':'半徑'}？`,'',segment(wantDiameter?'diameter':'radius'),[segment(wantDiameter?'radius':'diameter'),segment('chord')],wantDiameter?'直徑通過球心，兩端都在球面上。':'半徑一端是球心，另一端在球面上。'),
    visual('切面大小變化',`切面從球的${sign===1?'上':'下'}方一路移到另一端，切面的圓會怎麼變？`,sphereCut(sign*far,{center:true}),'先變大，再變小',['先變小，再變大','一路保持一樣大'],'越靠近球心越大，通過球心後，離球心越遠就越小。')
  ];
}

export const generators = {fractions,symmetry,'arithmetic-lab':arithmetic,area,solids,sphere};
