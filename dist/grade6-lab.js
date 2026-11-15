import {gcd,lcm,fraction,circle,decimal,svg,strip,colors,label,wedge} from './grade6-core.js';
const board=document.querySelector('#g4-board'), controls=document.querySelector('#g4-controls'), result=document.querySelector('#g4-result');
const unit=document.body.dataset.grade4;
const button=(id,text,selected)=>`<button type="button" data-act="${id}" ${selected===undefined?'':`aria-pressed="${selected}"`}>${text}</button>`;
const buttons=(name,items,current)=>`<div class="grade3-control-row grade3-control-buttons" role="group" aria-label="${name}">${items.map(([id,text])=>button(id,text,current===undefined?undefined:current===id)).join('')}</div>`;
const options=(key,values,suffix)=>buttons(key,values.map(v=>[key+':'+v,v+suffix]),key+':'+state[key]);
let state,round=0,frame=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stop=()=>{cancelAnimationFrame(frame);frame=0;};
const modes=(items)=>buttons('探索方式',items,'mode:'+state.mode);
const mode=(id,text)=>['mode:'+id,text];
const radius=()=>options('半徑',[2,3,4,5],' 公分');
const angles=()=>options('角度',[30,45,60,90,120,180,270],'°');
const sector=(r,a)=>{
 const t=a*Math.PI/180;
 return svg(`<g transform="translate(180 94)"><circle r="${r}" fill="#e3efe0" stroke="#285d48"/><path d="${wedge(r,a)}" fill="#f1d486"/><path d="M${r} 0 A${r} ${r} 0 ${a>180?1:0} 1 ${r*Math.cos(t)} ${r*Math.sin(t)}" fill="none" stroke="#a66920" stroke-width="4"/><path d="M${r} 0 L0 0 L${r*Math.cos(t)} ${r*Math.sin(t)}" fill="none" stroke="#286b91" stroke-width="2"/></g>`+label(180,182,a+'°'));
};
const views={
 'g6-ratio':()=>{
  const a=state.a,b=a+1,k=state.倍率,x=state.mode==='single'?state.red:a*k,y=state.mode==='single'?b:b*k;
  const bar=(n,y,c)=>Array.from({length:n},(_,i)=>`<rect x="${15+i*10}" y="${y}" width="9" height="20" fill="${c}"/>`).join('');
  const rows=[1,2,3,4,5].map(j=>[j*a,j*b+(state.changed&&j===3?1:0)]);
  board.innerHTML=state.mode==='table'?(state.reveal?svg('<path d="M35 150V12M35 150H337" fill="none" stroke="#285d48"/>'+
   (!state.changed?`<path d="M35 150L${35+5*a*9} ${150-5*b*4}" stroke="#286b91"/>`:'')+
   rows.map(([u,v])=>`<circle cx="${35+u*9}" cy="${150-v*4}" r="4" fill="#a6443a"/>`+label(35+u*9,163,u)+label(19,154-v*4,v)).join('')+label(28,166,'0')+label(312,180,'紅（格）')+label(42,12,'藍（格）')):
   `<table class="grade4-table"><thead><tr><th>紅（格）</th><th>藍（格）</th></tr></thead><tbody>${rows.map(([u,v])=>`<tr><td>${u}</td><td>${v}</td></tr>`).join('')}</tbody></table>`):
   svg(label(40,22,'紅 '+x+' 格')+bar(x,30,colors[0])+label(40,75,'藍 '+y+' 格')+bar(y,83,colors[1]),340,120);
  controls.innerHTML=modes([mode('together','一起變大'),mode('single','只改一邊'),mode('table','看表格與圖')])+
   (state.mode==='together'?options('倍率',[1,2,3,4,5],' 倍')+button('reveal','顯示比值',state.reveal):
   state.mode==='single'?button('less','紅色減一格')+button('more','紅色加一格')+button('restore','還原'):
   button('reveal',state.reveal?'看表格':'看圖')+button('change',state.changed?'還原成正比':'改變其中一組'));
  result.innerHTML=state.mode==='table'?(state.changed?'第三組的比值不同，紅和藍不成正比。':'每組比值相同，圖上的點落在通過原點的直線上。'):
   `紅：藍 ＝ <strong class="g6-ratio-value">${x}：${y}</strong>`+(state.mode==='single'?`。原來的比值是 <strong class="g6-ratio-value">${fraction(a,b)}</strong>，現在是 <strong class="g6-ratio-value">${fraction(x,y)}</strong>。`:state.reveal?`，比值是 <strong class="g6-ratio-value">${fraction(x,y)}</strong>。`:'。兩邊一起放大，比值會變嗎？');
 },
 'g6-scale':()=>{
  if(state.mode==='map'){
   const scale=state.比例尺, zoom=100000/scale, distance=state.距離;
   const x=km=>180+km*34*zoom;
   board.innerHTML=svg(`<defs><clipPath id="g6-map-viewport"><rect x="0" y="0" width="360" height="178" rx="8"/></clipPath></defs>
    <g clip-path="url(#g6-map-viewport)">
     <rect width="360" height="178" fill="#eef2dc"/>
     <g transform="translate(180 89) scale(${zoom})">
      <path d="M-390 30Q-130 110 32 37T390 59" fill="none" stroke="#a3cedd" stroke-width="17"/>
      <path d="M-390 -80H390M-390 7H390M-390 94H390M-91 -240V245M79 -240V245" fill="none" stroke="#fffaf0" stroke-width="7"/>
      <rect x="-112" y="-72" width="53" height="30" rx="6" fill="#aac994"/>
      <rect x="24" y="15" width="78" height="29" rx="6" fill="#aac994"/>
      <path d="M${-17*distance} 0H${17*distance}" stroke="#89501f" stroke-width="3" stroke-dasharray="4 3"/>
     </g>
     <circle cx="${x(-distance/2)}" cy="89" r="5" fill="#a6443a"/><circle cx="${x(distance/2)}" cy="89" r="5" fill="#286b91"/>
     ${label(x(-distance/2),77,'學校')}${label(x(distance/2),77,'圖書館')}
    </g>
    <path d="M16 195v8h${34*zoom}v-8" fill="none" stroke="#285d48" stroke-width="2"/>`
    +label(16+17*zoom,219,'1 公里')+label(270,204,'比例尺 1：'+scale.toLocaleString('zh-TW')),360,228);
   controls.innerHTML=modes([mode('shape','圖形放大／縮小'),mode('map','比例尺地圖')])
    +'<p>切換比例尺，看學校和圖書館在地圖上的距離怎麼變。</p>'
    +buttons('比例尺',[50000,100000,200000].map(n=>['比例尺:'+n,'1：'+n.toLocaleString('zh-TW')]),'比例尺:'+scale);
   result.textContent=`圖上距離 ${distance*zoom} 公分。學校到圖書館的實際距離一直是 ${distance} 公里。`;
   return;
  }
  const k=state.倍率, w=24*state.a,x=41,y=151;
  const shape=(u,v,fill,stroke)=>`<path d="M${x} ${y}h${u}v-${v}Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const grid=Array.from({length:14},(_,i)=>`<path d="M${x+i*24} 7V151" stroke="#d5e2d7"/>`).join('')+
   Array.from({length:7},(_,i)=>`<path d="M41 ${y-i*24}H353" stroke="#d5e2d7"/>`).join('');
  board.innerHTML=svg(grid+shape(w*k,48*(state.changed?1:k),'#e3efe0','#286b91')+shape(w,48,'none','#a6443a')+
   label(x,170,'中心')+label(200,172,`底邊：${state.a} 格 → ${state.a*k} 格`));
  controls.innerHTML=modes([mode('shape','圖形放大／縮小'),mode('map','比例尺地圖')])+buttons('倍率',[[.5,'縮小成 1/2'],[1,'原來大小'],[2,'放大 2 倍'],[3,'放大 3 倍']].map(([v,t])=>['倍率:'+v,t]),'倍率:'+k)+button('stretch','試試只拉寬',state.changed);
  result.textContent=state.changed?'底邊改變了，高維持原樣，對應邊的倍率不同。':`每條對應邊都是原圖的 ${k===.5?'1/2':k} 倍，對應角一樣大。`;
 },
 'g6-circle-area':()=>{
  const r=14*state.半徑,n=state.片數;
  if(state.mode==='sector')board.innerHTML=sector(r,state.角度);
  else{
   const half=Math.PI/n,width=2*r*Math.sin(half),pieces=Array.from({length:n},(_,i)=>{
    const j=i% (n/2), top=i<n/2;
    const x=180-(n/2-.5)*width/2+(j+(top?0:.5))*width;
    const y=95+(top?-1:1)*r*Math.cos(half)/2;
    return `<path d="${wedge(r,360/n)}" fill="${top?'#a9d3b4':'#f1d486'}" stroke="#285d48" stroke-width=".6" class="grade6-piece" style="--start:translate(180px,95px) rotate(${i*360/n}deg);--end:translate(${x}px,${y}px) rotate(${top?90-180/n:270-180/n}deg);transform:var(--${state.progress?'end':'start'})"/>`;
   }).join('');
   board.innerHTML=svg(state.cut?pieces:`<circle cx="180" cy="95" r="${r}" fill="#a9d3b4" stroke="#285d48"/>`);
  }
  controls.innerHTML=modes([mode('cut','圓面積怎麼來？'),mode('sector','扇形佔多少？')])+radius()+
   (state.mode==='sector'?angles()+button('reveal','看扇形面積',state.reveal):!state.cut?button('slice','切成 8 片'):!state.progress?button('assemble','交錯拼起來')+button('skip-assembly','跳過動畫'):options('片數',[8,16,32],' 片')+button('restore','返回圓形'));
  result.textContent=state.mode==='sector'?`扇形占整圓的 ${fraction(state.角度,360)}。`+(state.reveal?`扇形面積 ＝ 整圓面積 × ${fraction(state.角度,360)}，約 ${decimal(circle(state.半徑,state.角度).area)} 平方公分。`:''):
    state.progress?`已拼排 ${n} 片。切得越細越像長方形，底約 πr、高約 r，面積保持 ${decimal(circle(state.半徑).area)} 平方公分（π 取 3.14）。`:state.cut?`已切成 ${n} 片，試著交錯拼起來。`:'切得越細，拼起來會像什麼？';
 },
 'g6-perimeter':()=>{
  const r=state.半徑,a=state.角度,p=state.progress, rolling=state.mode==='roll';
  const names=['弧線','半徑 A','半徑 B'], palette=['#99621a','#286b91','#744b88'];
  const select=(key,name,values)=>`<label>${name} <select data-parameter="${key}">${values.map(([v,t])=>`<option value="${v}" ${state[key]===v?'selected':''}>${t}</option>`).join('')}</select></label>`;
  const size=select('半徑','半徑',[2,3,4,5].map(n=>[n,n+' 公分']));
  if(!rolling){
   const radius=r*14, t=a*Math.PI/180, ex=radius*Math.cos(t), ey=radius*Math.sin(t);
   const paths=[`M${radius} 0 A${radius} ${radius} 0 ${a>180?1:0} 1 ${ex} ${ey}`,`M0 0H${radius}`,`M0 0L${ex} ${ey}`];
   const edge=paths.map((d,i)=>`<path d="${d}" fill="none" stroke="${palette[i]}" stroke-width="${state.parts.has(i)?6:2}"/>`).join('');
   const hits=paths.map((d,i)=>`<path class="g6-edge-hit" data-act="part:${i}" d="${d}" fill="none" stroke="transparent" stroke-width="14" pointer-events="stroke"/>`).join('');
   const selectedLabels=[t/2,0,t].map((angle,i)=>{
    const distance=i===0?radius+17:radius*.63;
    return label(distance*Math.cos(angle)+(i===1?10:0),distance*Math.sin(angle)+(i===1?-8:i===2?13:0),names[i]);
   }).join('');
   board.innerHTML=svg(`<g transform="translate(180 90)"><circle r="${radius}" fill="#e3efe0"/><path d="${wedge(radius,a)}" fill="#f8ebc5"/>${edge}${hits}<g pointer-events="none">${selectedLabels}</g></g>`+label(180,183,a+'°'));
   if(state.reveal){
    let x=28;
    board.innerHTML+=svg([circle(r,a).arc,r,r].map((value,i)=>{
     const start=x;x+=value*8;
     return `<path d="M${start} 32H${x}" stroke="${palette[i]}" stroke-width="5"/><path d="M${start} 26v12 M${x} 26v12" stroke="#285d48"/>`;
    }).join('')+label(180,58,'弧長 ＋ 半徑 A ＋ 半徑 B'),360,70);
   }
  }else{
   const scale=7.6,x=49+2*Math.PI*r*scale*p,y=143-r*scale,done=p>0&&!frame;
   board.innerHTML=svg(`<path d="M49 143H325" stroke="#285d48"/><path d="M49 143H${x}" stroke="#a66920" stroke-width="5"/><circle cx="${x}" cy="${y}" r="${r*scale}" fill="#e3efe0" stroke="#285d48"/><g transform="rotate(${p*360} ${x} ${y})"><path d="M${x} ${y}v${r*scale}" stroke="#286b91" stroke-width="3"/><circle cx="${x}" cy="143" r="5" fill="#a6443a"/></g>`+label(49,164,'起點')+(done?label(x,164,'終點')+label(180,184,p===1?'地上色帶的長度等於圓周長':'地上色帶是圓周長的一半'):'')+label(182,24,`半徑 ${r} 公分`));
  }
  controls.innerHTML=rolling
   ?'<p>看紅點轉回地面，地上會留下多長的一段？</p>'+select('圈數','滾動圈數',[[1,'一圈'],[.5,'半圈']])+size
     +`<div class="grade3-control-row"><button class="primary" type="button" data-act="${frame?'finish':state.圈數===1?'once':'half'}">${frame?'立即完成':state.圈數===1?'滾動一圈':'滾動半圈'}</button></div>`
   :'<p>點選圖上沿外圍走一圈會經過的線段。</p>'+buttons('選擇外圍',names.map((name,i)=>['part:'+i,name]))
     +`<p>已選 ${state.parts.size} 段</p><button class="primary" type="button" data-act="check">檢查外圍</button>`
     +`<details ${state.sizing?'open':''}><summary>調整大小</summary>${size}${select('角度','圓心角',[30,45,60,90,120,180,270].map(n=>[n,n+'°']))}</details>`;
  if(!rolling)controls.querySelectorAll('[data-act^="part:"]').forEach(b=>b.setAttribute('aria-pressed',state.parts.has(Number(b.dataset.act.slice(5)))));
  result.textContent=rolling?(p&&!frame?`前進約 ${decimal(circle(r).arc*p)} 公分（π 取 3.14）。`:'')
   :state.reveal?`弧長約 ${decimal(circle(r,a).arc)} 公分 ＋ ${r} 公分 ＋ ${r} 公分，扇形周長約 ${decimal(circle(r,a).edge)} 公分。`:'';
 },
 'g6-speed':()=>{
  const a=state.A,b=state.B,t=state.progress,dist=state.mode==='distance',end=dist?20:Math.max(a,b)*state.秒數;
  const d=[a,b].map(v=>Math.min(end,t*v)),duration=dist?20/Math.min(a,b):state.秒數;
  const x=n=>35+n/end*290;
  board.innerHTML=state.reveal?svg('<path d="M35 155V22M35 155H325" fill="none" stroke="#285d48"/>'+[a,b].map((v,i)=>{
   const arrival=Math.min(duration,end/v), px=35+arrival/duration*290,py=155-Math.min(end,arrival*v)/end*125;
   const tx=35+t/duration*290,ty=155-d[i]/end*125;
   return `<path d="M35 155L${px} ${py}H325" fill="none" stroke="${colors[i]}" stroke-width="3" ${i?'stroke-dasharray="5 3"':''}/><circle cx="${tx}" cy="${ty}" r="4" fill="${colors[i]}"/>`+label(63+i*105,13,`${'AB'[i]}：每秒 ${v} 公尺`);
  }).join('')+label(21,31,end)+label(225,180,`時間（秒）0～${decimal(duration)}`)+label(83,32,'距離（公尺）')):
   svg(d.map((n,i)=>{const y=65+i*57;return `<path d="M35 ${y}H325" stroke="#285d48"/><rect x="${x(n)-12}" y="${y-20}" width="24" height="19" rx="5" fill="${colors[i]}"/>`+label(x(n),y-26,'AB'[i]);}).join('')+label(35,149,'0 公尺')+label(315,149,end+' 公尺')+label(180,176,`經過 ${decimal(t)} 秒`));
  controls.innerHTML=modes([mode('time','同樣時間，比誰走得遠'),mode('distance','同樣距離，比誰先到')])+
   options('A',[2,3,4,5],' 公尺／秒')+options('B',[2,3,4,5],' 公尺／秒')+(dist?'':options('秒數',[5,10],' 秒'))+
   button(frame?'pause':'play',frame?'暫停':t===duration?'重播':t?'繼續':dist?'播放':'播放 '+duration+' 秒')+button('finish','立即查看結果')+
   (t>0?button('reveal',state.reveal?'看跑道':'看圖表'):'');
  result.textContent=t===duration?(dist?`A 用 ${decimal(20/a)} 秒，B 用 ${decimal(20/b)} 秒。`:`同樣 ${duration} 秒，A 走 ${d[0]} 公尺，B 走 ${d[1]} 公尺。`):dist?'同走 20 公尺，哪台車先到？':'同樣時間，哪台車走得遠？';
 },
 'g6-gcd':()=>{
  const {a,b,組數:g}=state;
  if(state.mode==='groups'){
   const squares=(n,color)=>Array.from({length:n},()=>`<span class="g6-block" style="background:${color}" aria-hidden="true"></span>`).join('');
   const row=(n,i)=>{
    const name=['紅','藍'][i], size=Math.floor(n/g), rest=n%g;
    return `<section><h3>${n} 個${name}方塊</h3><div class="g6-block-row">${state.reveal?
      Array.from({length:g},(_,j)=>{
        const fewer=rest>0&&j>=rest, count=size+Number(j<rest);
        return `<div class="g6-block-group${fewer?' g6-block-group-short':''}"><small>第 ${j+1} 組</small>
          <div aria-label="${count} 個${name}方塊">${squares(count,colors[i])}
          ${fewer?'<span class="g6-block g6-block-empty" aria-hidden="true"></span>':''}</div>
          ${fewer?'<small>比其他組少 1 個</small>':''}</div>`;
      }).join(''):squares(n,colors[i])}</div>
      ${state.reveal&&rest?`<p class="g6-factor-warning"><strong>${g} 不是 ${n} 的因數</strong></p>`:''}</section>`;
   };
   board.innerHTML=row(a,0)+row(b,1);
   controls.innerHTML=modes([mode('groups','最多能分幾組？'),mode('jumps','第一次一起出現')])
    +options('組數',Array.from(new Set([1,2,3,4,6,gcd(a,b)].filter(n=>n<=Math.min(a,b)))).sort((x,y)=>x-y),' 組')
    +(state.tried.size>=2||gcd(a,b)===1&&state.tried.size?button('conclude','看最大公因數'):'');
   const describe=(n,name)=>{
    const rest=n%g, size=Math.floor(n/g);
    return rest?`${n} 個${name}方塊都分進 ${g} 組了。${rest} 組各有 ${size+1} 個，${g-rest} 組各有 ${size} 個，所以不能平分。`
      :`${n} 個${name}方塊可以平分成 ${g} 組，每組 ${size} 個。`;
   };
   result.textContent=state.complete?`最大公因數是 ${gcd(a,b)}，最多能分成 ${gcd(a,b)} 組。`
    :state.reveal?`${describe(a,'紅')} ${describe(b,'藍')}`:'選擇組數，看看每組能不能一樣多。';
  }else{
   const x=n=>23+n/lcm(a,b)*314,m=lcm(a,b);
   board.innerHTML=svg([a,b].map((v,i)=>{
    const y=55+i*65;
    return `<path d="M23 ${y}H337" stroke="#285d48"/>`+label(60,y-27,`每次跳 ${v} 格`)+Array.from({length:Math.min(Math.floor(m/v),state.progress)+1},(_,j)=>`<circle cx="${x(j*v)}" cy="${y}" r="4" fill="${colors[i]}"/>`+(m/v<20||j===0||j*v===m?label(x(j*v),y+17,j*v):'')).join('');
   }).join(''));
   controls.innerHTML=modes([mode('groups','最多能分幾組？'),mode('jumps','第一次一起出現')])+button('jump','跳下一次')+button(frame?'pause':'auto',frame?'暫停':'自動播放')+button('restart','重來');
   result.textContent=state.progress>=Math.max(m/a,m/b)?`第一次在正整數 ${m} 相遇，最小公倍數是 ${m}。`:'從 0 同時出發，0 不算再次相遇。';
  }
 },
 'g6-fraction':()=>{
  const [a,b,c,d]=state.frac, size=lcm(b,d), total=a*size/b, group=c*size/d;
  const taken=Math.floor(total/group);
  const remain=total-group*taken;
  const grid=total>size?size*2:size;
  const unitWidth=300/grid;
  const segment=(cells,x,caption,color)=>`<rect x="${x}" y="34" width="${cells*unitWidth}" height="25" rx="3" fill="${color}" stroke="#285d48"/>`
    +label(x+cells*unitWidth/2,25,caption);
  const showQuotient=state.reveal;
  const mixed=remain?`${taken} 又 ${fraction(remain,group)}`:String(taken);
  board.innerHTML=svg(label(86,19,`原有 ${a}/${b} 公尺`)+strip(grid,total,26,colors[0])+label(84,75,`每段 ${c}/${d} 公尺`)+strip(grid,group,82,colors[1]),360,117)
   +(showQuotient?svg(Array.from({length:taken},(_,i)=>segment(group,20+i*(group*unitWidth+8),'1 段',colors[1])).join('')
    +(remain?segment(remain,20+taken*(group*unitWidth+8),fraction(remain,group)+' 段','#f1d486'):'')
    +label(145,88,'合起來是 '+mixed+' 段'),360,100):'');
  controls.innerHTML=buttons('選擇題例',fractionCases.map(([a,b,c,d],i)=>['fraction:'+i,`${a}/${b} ÷ ${c}/${d}`]),'fraction:'+fractionCases.indexOf(state.frac))
    +button('reveal',showQuotient?'隱藏答案':'顯示答案',showQuotient);
  result.textContent=showQuotient
    ? `${a}/${b} ÷ ${c}/${d} ＝ ${mixed} 段。`+(remain?`剩下的 ${fraction(remain,size)} 公尺是一段的 ${fraction(remain,group)}。`:'')
    : `${a}/${b} 裡面可以放幾個 ${c}/${d}？`;
 }
};
const fractionCases=[[3,4,1,2],[1,2,1,4],[2,3,1,6],[3,5,1,3]];
const pairs=[[12,18],[8,15],[6,12],[12,12],[16,24],[9,15]];
const defaults={'g6-ratio':'together','g6-scale':'shape','g6-circle-area':'cut','g6-perimeter':'roll','g6-speed':'time','g6-gcd':'groups','g6-fraction':'fraction'};
function reset(selected=state?.mode??defaults[unit]){
 stop();
 const [a,b]=selected==='jumps'&&round===0?[4,6]:pairs[round%pairs.length];
 state={圈數:1,mode:selected,倍率:1,半徑:2+round%4,角度:90,片數:8,距離:2+(round+1)%3,比例尺:100000,
  A:2+round%4,B:3+round%3,秒數:5,組數:1,red:2+round%5,a:unit==='g6-gcd'?a:2+round%3,b,
  frac:fractionCases[round%fractionCases.length],progress:0,parts:new Set(),tried:new Set()};
 render();
}
function render(focus){
 views[unit]();
 if(unit==='g6-perimeter')document.querySelector('#g6-perimeter-modes').innerHTML=modes([mode('roll','圓滾動'),mode('sector','扇形周長')]);
 if(focus)controls.querySelector(`[data-act="${focus}"]`)?.focus({preventScroll:true});
}
function animate(end,interval=1000){
 stop();
 const from=state.progress,start=performance.now();
 if(reduced){state.progress=end;render();return;}
 function step(now){
  const value=Math.min(end,from+(now-start)/interval);
  state.progress=unit==='g6-gcd'?Math.floor(value):value;
  frame=value<end?requestAnimationFrame(step):0;
  if(unit==='g6-gcd'||unit==='g6-perimeter'||unit==='g6-speed'){
   const active=document.activeElement?.dataset.act;
   render(active);
  }
 }
 frame=requestAnimationFrame(step);
}
function handleAction(event){
 const id=event.target.closest('[data-act]')?.dataset.act;
 if(!id)return;
 const [key,value]=id.split(':');
 if(key==='mode'){reset(value);document.querySelector('#g6-perimeter-modes [data-act=\"'+id+'\"]')?.focus();return;}
 if(key==='part'){state.reveal=false;state.parts.has(+value)?state.parts.delete(+value):state.parts.add(+value);}
 else if(key==='fraction'){state.frac=fractionCases[+value];state.progress=0;state.reveal=false;state.complete=false;}
 else if(value!==undefined){stop();state[key]=Number(value);state.reveal=false;state.complete=false;
  if(key!=='片數')state.progress=0;
  if(key==='角度'||key==='半徑')state.parts.clear();
  if(key==='倍率')state.changed=false;
 }
 const duration=state.mode==='distance'?20/Math.min(state.A,state.B):state.秒數;
 const steps=Math.max(lcm(state.a,state.b)/state.a,lcm(state.a,state.b)/state.b);
 if(id==='more'||id==='less')state.red=Math.min(30,Math.max(1,state.red+(id==='more'?1:-1)));
 if(id==='reveal')state.reveal=!state.reveal;
 if(id==='change')state.changed=!state.changed;
 if(id==='stretch'){state.changed=!state.changed;if(state.changed&&state.倍率===1)state.倍率=2;}
 if(id==='restore'){
  state.red=state.a;state.cut=false;state.progress=0;state.changed=false;
 }
 if(id==='slice')state.cut=true;
 if(id==='assemble'||id==='skip-assembly'){
  const pieces=[...board.querySelectorAll('.grade6-piece')];
  state.progress=1;
  render('restore');
  if(id==='assemble'&&!reduced)board.querySelectorAll('.grade6-piece').forEach((piece,i)=>{
   piece.animate([{transform:pieces[i].style.getPropertyValue('--start')},{transform:piece.style.getPropertyValue('--end')}],{duration:750,easing:'ease-in-out'});
  });
  return;
 }
 if(key==='組數'){state.reveal=true;if(state.a%state.組數===0&&state.b%state.組數===0)state.tried.add(state.組數);}
 if(id==='conclude')state.complete=true;
 if(id==='check')state.reveal=state.parts.size===3;
 if(id==='jump'){stop();state.progress=Math.min(steps,state.progress+1);}
 if(id==='restart'){stop();state.progress=0;}
 if(id==='auto'){if(state.progress>=steps)state.progress=0;animate(steps,350);}
 if(id==='pause')stop();
 if(id==='play'){if(state.progress>=duration)state.progress=0;animate(duration);}
 if(id==='half'||id==='once'){state.progress=0;state.end=id==='half'?.5:1;animate(state.end,1700);}
 if(id==='finish'){stop();state.progress=unit==='g6-perimeter'?state.end:duration;}
 render(id==='play'?'pause':id==='pause'?'play':id==='auto'?'pause':id);
 if(id==='check'&&!state.reveal)result.textContent='除了弧線，從圓心連到弧的兩條邊也在外圍。';
}
controls.onclick=handleAction;
if(unit==='g6-perimeter'){
 const modeBar=document.querySelector('#g6-perimeter-modes');
 modeBar.onclick=handleAction;
 board.onclick=handleAction;
 controls.onchange=event=>{
  const key=event.target.dataset.parameter;
  if(!key)return;
  stop();state[key]=Number(event.target.value);state.progress=0;state.reveal=false;state.parts.clear();
  state.sizing=Boolean(event.target.closest('details'));render();
  controls.querySelector('[data-parameter=\"'+key+'\"]')?.focus();
 };
}
document.querySelector('#g4-reset').onclick=()=>reset();
document.querySelector('#g4-new').onclick=()=>{round++;reset();};
window.addEventListener('pagehide',stop);
reset();
