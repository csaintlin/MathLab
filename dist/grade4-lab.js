import {clamp, aligned, protractor, angleKind, trianglePreset, triangleInfo, triangleGraphic,
  rectangle, boundary, validGrid, gridGraphic, toggles, rounding, numberLine, placeNames,
  methodNames, chartData, chartGraphic, chartX, chartY} from './grade4-core.js';

const board=document.getElementById('g4-board');
const controls=document.getElementById('g4-controls');
const result=document.getElementById('g4-result');
const button=(action,label,pressed)=>`<button type="button" data-action="${action}" ${pressed===undefined?'':`aria-pressed="${pressed}"`}>${label}</button>`;
const group=(name,html)=>`<div class="grade3-control-row grade3-control-buttons" role="group" aria-label="${name}">${html}</div>`;
const choice=(name,items,current)=>group(name,items.map(([id,label])=>button(id,label,id===current)).join(''));
const input=(id,label,max=99999)=>`<label>${label} <input type="text" inputmode="numeric" maxlength="${String(max).length}" id="${id}"></label>`;
const read=(id,max,min=0)=>{
  const value=document.getElementById(id).value.trim().normalize('NFKC');
  return /^\d+$/.test(value)&&Number(value)>=min&&Number(value)<=max?Number(value):null;
};
const dirs={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
const moves=Object.entries({left:'左移',right:'右移',up:'上移',down:'下移'});
const directionButtons=(prefix,label)=>group('移動',moves.map(([id,text])=>button(prefix+id,label+text)).join(''));
let round=0, state, drag;
let angleQuestion=45;
let message='';
const triangleKinds={equilateral:'正三角形',isosceles:'等腰三角形',right:'直角三角形',both:'等腰直角',acute:'自由三角形',obtuse:'鈍角三角形'};

const lessons={
  angle:{
    initial:()=>({degrees:angleQuestion, length:126, x:155,y:181,rotation:15,magnet:true,reveal:false,circle:'right'}),
    draw(){
      board.innerHTML=protractor(state.degrees,state,state.length,state.circle,true);
      controls.innerHTML=group('預測',input('guess','估計幾度？（可略過）',180))+directionButtons('move-','量角器')
        +group('對齊',button('magnet','對齊輔助',state.magnet))
        +`<fieldset class="grade4-zero"><legend>從哪一側的 0° 讀？</legend>
          <label><input type="radio" name="zero-side" value="right" ${state.circle==='right'?'checked':''}> 右側</label>
          <label><input type="radio" name="zero-side" value="left" ${state.circle==='left'?'checked':''}> 左側</label></fieldset>`
        +group('調整角與邊長',button('smaller','縮小開口')+button('bigger','放大開口')+button('shorter','邊變短')+button('longer','邊變長'))
        +group('驗證',button('reveal','顯示讀值',state.reveal)+button('check','確認'));
      result.textContent=message||(state.reveal&&aligned(state)
        ? `所選刻度讀到 ${state.circle==='right'?state.degrees:180-state.degrees}°。`
        : '拖量角器對準頂點，拉上方弧形滑桿旋轉，讓 0° 線貼齊金色邊。拖綠點可改變開口與邊長。');
      document.getElementById('guess').value=state.guess??'';
    },
    act(id){
      state.guess=document.getElementById('guess').value;
      if(id.startsWith('move-')){
        const [x,y]=dirs[id.slice(5)];
        state.x=clamp(state.x+x*5,115,245); state.y=clamp(state.y+y*5,122,199);
        this.snap();
      }
      if(id==='left'||id==='right') state.circle=id;
      if(id==='magnet'){state.magnet=!state.magnet; this.snap();}
      if(id==='reveal') state.reveal=!state.reveal;
      if(id==='smaller'||id==='bigger') state.degrees=clamp(state.degrees+(id==='bigger'?5:-5),5,180);
      if(id==='shorter'||id==='longer') state.length=clamp(state.length+(id==='longer'?10:-10),46,145);
      if(id==='check') message=Math.hypot(state.x-180,state.y-155)>4?'先把量角器的中心十字移到角的頂點。'
        : !aligned(state)?'把 0° 線轉到和金色邊重合。'
        : state.circle!=='right'?'金色邊朝右，從右側的 0° 起算。'
        : `量對了！從金色邊的 0° 讀到 ${state.degrees}°，是${angleKind(state.degrees)}。`;
    },
    snap(){
      if(state.magnet&&Math.hypot(state.x-180,state.y-155)<6) {state.x=180;state.y=155;}
    },
    start(target,x,y){
      if(target.closest('[data-rotation]'))return {rotation:true,immediate:true};
      if(target.closest('[data-ray]'))return {};
      return target.closest('[data-tool]')?{tool:true,dx:x-state.x,dy:y-state.y}:null;
    },
    move(x,y){
      state.guess=document.getElementById('guess').value;
      if(drag.tool){
        state.x=clamp(Math.round(x-drag.dx),115,245);
        state.y=clamp(Math.round(y-drag.dy),122,199);
        this.snap();
        return;
      }
      const degrees=Math.atan2(Math.max(0,155-y),x-180)*180/Math.PI;
      if(drag.rotation){state.rotation=clamp(Math.round(degrees-90),-35,35);return;}
      state.degrees=clamp(Math.round(degrees/5)*5,5,180);
      state.length=clamp(Math.round(Math.hypot(x-180,y-155)),46,145);
    }
  },

  triangle:{
    initial:()=>({mode:'edges',points:trianglePreset('isosceles',round,true),vertex:0,target:['直角三角形','鈍角三角形','銳角三角形'][round%3]}),
    draw(){
      const info=triangleInfo(state.points);
      board.innerHTML=triangleGraphic(state.points,state.mode,true);
      controls.innerHTML=choice('觀察方式',[['edges','看邊'],['angles','看角']],state.mode)
        +group('快速範例',Object.entries(triangleKinds).map(([id,label])=>button(id,label)).join(''))
        +group('任務',button('check',`驗證是否為${state.target}`));
      result.textContent=message||(state.mode==='edges'
        ? info.sides+(info.sides==='正三角形'?'，也是等腰三角形的特例。':'，觀察有幾條邊一樣長。')
        : `${info.kind}。同一個三角形也可以按邊分類為${info.sides}。`);
    },
    act(id){
      if(id==='edges'||id==='angles')state.mode=id;
      if(Object.hasOwn(triangleKinds,id))state.points=trianglePreset(id,round,true);
      if(id==='check')message=triangleInfo(state.points).kind===state.target
        ? `做對了！請找出圖上決定分類的角。` : '觀察最大的角，再選範例或移動頂點。';
    },
    start(target){
      const vertex=target.closest('[data-vertex]');
      if(!vertex)return null;
      state.vertex=Number(vertex.dataset.vertex);
      return {};
    },
    move(x,y){
      const next=state.points.map((p,i)=>i===state.vertex?[clamp(Math.round(x),20,340),clamp(Math.round(y),15,205)]:p);
      if(triangleInfo(next))state.points=next;
      else message='三個頂點要圍成有面積的圖形。';
    }
  },
  area:{
    initial:()=>({mode:'free',cells:rectangle(4+round%4,3),outline:true,trace:false,target:12,example:0}),
    examples(){
      if(state.mode==='fixed-area'){
        return {9:[[1,9],[3,3],[3,3,1]],12:[[1,12],[2,6],[3,4]],16:[[2,8],[4,4],[4,4,1]]}[state.target];
      }
      return {9:[],12:[[1,5],[2,4],[3,3]],16:[[1,7],[2,6],[3,5],[4,4]]}[state.target];
    },
    draw(){
      const free=state.mode==='free', examples=free?[]:this.examples();
      const spec=examples[state.example], fixedArea=state.mode==='fixed-area';
      let cells=state.cells;
      if(!free){
        cells=spec?rectangle(spec[0],spec[1]):new Set();
        if(spec?.[2]){cells.delete(0);cells.add(spec[0]);}
      }
      const area=cells.size, perimeter=boundary(cells).length;
      board.innerHTML=`<div class="grade4-grid">${gridGraphic(cells,state.outline,state.trace)}${free?toggles(144,cells,12,'方格'):''}</div>`;
      controls.innerHTML=choice('題型',[['free','自由拼圖'],['fixed-area','固定面積'],['fixed-edge','固定周長']],state.mode)
        +(free?group('長方形範例',button('4x3','3 × 4')+button('6x2','2 × 6')+button('4x4','4 × 4')+button('5x2','2 × 5'))
           :`<p class="grade4-area-step">${fixedArea?'面積固定在幾格？':'周長固定在幾個單位邊？'}</p>`
            +choice('固定數值',(fixedArea?[9,12,16]:[12,16]).map(n=>['target-'+n,`${n} ${fixedArea?'格':'邊'}`]),'target-'+state.target)
            +`<p class="grade4-area-step">換個排法，比一比${fixedArea?'周長':'面積'}</p>`
            +choice('排法',examples.map(([w,h,bent],i)=>['example-'+i,bent?'轉角排法':`${w} × ${h}`]),'example-'+state.example))
        +group('邊界',button('outline','顯示邊界',state.outline)+button('trace','沿外圍走一圈'));
      result.innerHTML=free
        ? `<strong>面積 ${area} 個單位方格<br>周長 ${perimeter} 個單位邊</strong><p>${message||'共用的內邊不計入周長。'}</p>`
        : fixedArea
          ? `<p>面積固定 ${area} 格</p><p>這個排法的周長是 <strong class="grade4-area-value">${perimeter}</strong> 個單位邊</p>`
          : `<p>周長固定 ${perimeter} 個單位邊</p><p>這個排法的面積是 <strong class="grade4-area-value">${area}</strong> 格</p>`;
    },
    act(id){
      state.trace=false;
      if(['free','fixed-area','fixed-edge'].includes(id)){state.mode=id;state.example=0;if(id==='fixed-edge'&&state.target===9)state.target=12;}
      if(id.startsWith('target-')){state.target=Number(id.slice(7));state.example=0;}
      if(id.startsWith('example-'))state.example=Number(id.slice(8));
      if(/^\d+x\d+$/.test(id))state.cells=rectangle(...id.split('x').map(Number));
      if(id==='outline')state.outline=!state.outline;
      if(id==='trace'){state.outline=true;state.trace=true;}
    },
    tile(index, selected=!state.cells.has(index)){
      const next=new Set(state.cells);
      if(selected)next.add(index);else next.delete(index);
      if(!next.size||validGrid(next))state.cells=next;
      else message='方格須用邊相連，中間不要留洞。';
      state.trace=false;
    }
  },
  rounding:{
    initial:()=>({n:round===0?436:11+(425+round*173)%99989,u:10,method:'round',mode:'line',op:'add',verified:false}),
    draw(){
      const {n,u,method}=state,{low,high,mid,value}=rounding(n,u,method);
      board.innerHTML=numberLine(n,u);
      controls.innerHTML=choice('題型',[['line','數線取概數'],['estimate','加減估算']],state.mode)
        +choice('取到哪一位',Object.entries(placeNames).map(([id,label])=>[id,`取到${label}位`]),String(u))
        +choice('方法',Object.entries(methodNames),method)
        +group('移動原數',button('minus','原數 −1')+button('plus','原數 ＋1'))
        +(state.mode==='line'?choice('預測',[['guess-'+low,low],['guess-'+high,high]],'guess-'+state.guess)+group('驗證',button('check','驗證'))
          : choice('運算',[['add','加法'],['subtract','減法']],state.op)
            +group('估算',input('second','第二個數')+button('estimate-check','估算')));
      result.textContent=message||(state.verified
        ? n===low?`${n} 已是整${placeNames[u]}，不必再變。`
        : `${n} ≈ ${value}。中點是 ${mid}。${method==='round'?(n<mid?'原數在中點左邊，取下界。':'原數達到中點，取上界。'):method==='up'?'無條件進入取上界。':'無條件捨去取下界。'}`
        : `先看數線，再用${methodNames[method]}取到${placeNames[u]}位。`);
      if(state.second!==undefined&&state.mode==='estimate')document.getElementById('second').value=state.second;
    },
    act(id){
      if(state.mode==='estimate')state.second=document.getElementById('second').value;
      if(id==='check'){
        const value=rounding(state.n,state.u,state.method).value;
        if(state.guess===undefined)message='請先選一個概數。';
        else if(state.guess!==value)message='再看原數和兩個端點的位置，並確認選用的方法。';
        else state.verified=true;
        return;
      }
      if(id==='estimate-check'){
        const other=read('second',99999), n=state.n;
        if(other===null){message='請輸入 0 到 99,999 的整數。';return;}
        const a=rounding(n,state.u,state.method).value, b=rounding(other,state.u,state.method).value;
        message=state.op==='add'?`估算 ${a} ＋ ${b} ＝ ${a+b}。精確值是 ${n+other}。`
          :`估算 ${a} − ${b} ＝ ${a-b}。精確值是 ${n-other}。`;
        return;
      }
      state.verified=false;
      if(id==='line'||id==='estimate')state.mode=id;
      else if(Object.hasOwn(methodNames,id))state.method=id;
      else if(['10','100','1000'].includes(id) )state.u=Number(id);
      else if(id==='plus'||id==='minus')state.n=clamp(state.n+(id==='plus'?1:-1),11,99999);
      else if(id==='add'||id==='subtract')state.op=id;
      else {state.guess=Number(id.replace('guess-',''));return;}
      state.guess=undefined;
    },
    start(){return state.mode==='line'?{immediate:true}:null;},
    move(x){
      if(drag.low===undefined)drag.low=rounding(state.n,state.u).low;
      state.n=clamp(drag.low+Math.round(clamp((x-35)/290,0,1)*state.u),11,99999);
      state.guess=undefined;state.verified=false;
    }
  },
  charts:{
    initial:()=>({mode:'bar',type:'bar',time:false,selected:2,values:[0,0,0,0,0],complete:false}),
    data(){return chartData(round,state.time);},
    draw(){
      const data=this.data(), full=state.mode==='full', i=state.selected;
      const values=full?state.values:data.values.map((n,k)=>k===i?state.values[i]:n);
      const x=chartX(i), y=chartY(values[i],data);
      const handle=state.complete?'':`<g data-chart-index="${i}">
        <path d="M${x} 43V190" stroke="#a66920" stroke-dasharray="4 4"/>
        <circle cx="${x}" cy="${y}" r="18" fill="transparent"/>
        <circle cx="${x}" cy="${y}" r="7" fill="#f1d486" stroke="#79501f" stroke-width="2"/>
      </g>`;
      board.innerHTML=chartGraphic(data,values,state.type,false,full&&!state.complete).replace('</svg>',handle+'</svg>');
      const goal=full?'依資料表畫出每一項，再按「檢查」。'
        : state.time?`把${data.labels[i]}的資料點拉到 ${data.values[i]} °C。`
        : `有 ${data.values[i]} 人選${data.labels[i]}。把${data.labels[i]}的長條拉到這個高度。`;
      const table=`<table class="grade4-table"><caption>要畫出的資料</caption><tbody>${data.labels.map((name,k)=>`<tr><th scope="row">${name}</th><td>${data.values[k]} ${data.unit}</td></tr>`).join('')}</tbody></table>`;
      controls.innerHTML=choice('練習方式',[['bar','補長條圖'],['line','補折線圖'],['full','自己畫一張']],state.mode)
        +`<p><strong>${goal}</strong></p><p>每格代表 ${data.step} ${data.unit}。</p>`
        +(full?choice('資料',[['fruit','水果喜好'],['weather','每日氣溫']],state.time?'weather':'fruit')+table
          +choice('調整項目',data.labels.map((name,k)=>['item-'+k,name]),'item-'+i):'')
        +(state.complete?this.reading(data).markup
          :group('調整及驗證',button('less','降低一格')+button('more','升高一格')+button('check','檢查')));
      result.textContent=message||(state.complete?'圖畫好了！用完成的圖回答上面的問題。':'拖動黃色把手，或用按鈕調整。');
    },
    reading(data){
      if(!state.time){
        const diff=Math.abs(data.values[2]-data.values[1]);
        return {answer:diff,markup:`<label>香蕉和橘子相差幾人？ <input id="chart-answer" type="text" inputmode="numeric"></label>`+button('read','檢查答案')};
      }
      const drops=data.values.slice(1).map((n,i)=>data.values[i]-n);
      return {answer:drops.indexOf(Math.max(...drops)),markup:'<p>哪兩天之間降溫最多？</p>'
        +group('降溫區間',drops.map((_,i)=>button('read-'+i,`${data.labels[i]}到${data.labels[i+1]}`)).join(''))};
    },
    act(id){
      if(['bar','line','full','fruit','weather'].includes(id)){
        const mode=['fruit','weather'].includes(id)?'full':id;
        const time=id==='line'||id==='weather';
        state={...this.initial(),mode,time,type:time?'line':'bar'};
        return;
      }
      const data=this.data();
      if(id.startsWith('item-'))state.selected=Number(id.at(-1));
      if(id==='less'||id==='more')state.values[state.selected]=clamp(state.values[state.selected]+(id==='more'?data.step:-data.step),0,data.max);
      if(id==='check'){
        state.complete=data.values.every((n,i)=>state.mode!=='full'&&i!==state.selected||state.values[i]===n);
        if(!state.complete)message=state.mode==='full'?'對照資料表，從每個長條頂端或資料點往左讀刻度。':'從黃色把手往左看，對到的刻度和題目一樣嗎？';
      }
      if(id.startsWith('read')){
        const raw=id==='read'?document.getElementById('chart-answer').value.trim().normalize('NFKC'):id.slice(5);
        message=raw&&Number(raw)===this.reading(data).answer?'答對了！':state.time?'找往下的線段，比較兩端相差幾格。':'從兩根長條的頂端往左讀刻度，再用較大的數減較小的數。';
      }
    },
    start(target){
      const column=target.closest('[data-chart-index]');
      if(!column||state.complete)return null;
      state.selected=Number(column.dataset.chartIndex);return {immediate:true};
    },
    move(x,y){
      const data=this.data();
      state.values[state.selected]=clamp(Math.round((190-y)/147*14),0,14)*data.step;
    }
  }
};

const lesson=document.body.dataset.grade4;
const config=lessons[lesson];
function render(focus){
  config.draw();
  if(focus)document.querySelector(focus)?.focus({preventScroll:true});
}
function reset(){
  const mode=state?.mode, time=state?.time;
  state=config.initial();
  if(lesson==='charts'&&mode)config.act(mode==='full'?(time?'weather':'fruit'):mode);
  message='';drag=null;render();
}
controls.onclick=event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  message='';config.act(action);render(`[data-action="${action}"]`);
};
if(lesson==='angle'){
  controls.onchange=event=>{
    if(event.target.name!=='zero-side')return;
    message='';config.act(event.target.value);render();
    controls.querySelector('input:checked').focus({preventScroll:true});
  };
  board.onkeydown=event=>{
    if(!event.target.closest('[data-rotation]'))return;
    const keys={ArrowLeft:1,ArrowUp:1,ArrowRight:-1,ArrowDown:-1};
    if(!Object.hasOwn(keys,event.key))return;
    event.preventDefault();
    state.guess=document.getElementById('guess').value;
    state.rotation=clamp(state.rotation+keys[event.key],-35,35);
    message='';render('[data-rotation]');
  };
}
if(lesson==='triangle'){
  board.onkeydown=event=>{
    const handle=event.target.closest('[data-vertex]');
    const direction=event.key.slice(5).toLowerCase();
    if(!handle||!event.key.startsWith('Arrow')||!Object.hasOwn(dirs,direction))return;
    event.preventDefault();
    state.vertex=Number(handle.dataset.vertex);
    const [x,y]=state.points[state.vertex], [dx,dy]=dirs[direction];
    message='';config.move(x+dx*5,y+dy*5);
    render(`[data-vertex="${state.vertex}"]`);
  };
}
board.onclick=event=>{
  const tile=event.target.closest('[data-tile]');
  if(!tile||!config.tile||event.detail>0)return;
  message='';config.tile(Number(tile.dataset.tile));render(`[data-tile="${tile.dataset.tile}"]`);
};
function coordinates(event){
  const matrix=board.querySelector('svg')?.getScreenCTM();
  return matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):null;
}
board.onpointerdown=event=>{
  if(drag||event.button!==0)return;
  if(config.tile){
    const tile=event.target.closest('[data-tile]');
    if(!tile)return;
    const index=Number(tile.dataset.tile);
    drag={id:event.pointerId,selected:!state.cells.has(index),seen:new Set([index])};
    board.setPointerCapture(event.pointerId);
    message='';config.tile(index,drag.selected);render(`[data-tile="${index}"]`);
    return;
  }
  const p=coordinates(event);
  if(!p||!event.target.closest('svg'))return;
  const data=config.start?.(event.target,p.x,p.y);
  if(!data)return;
  if(lesson==='angle')event.preventDefault();
  drag={id:event.pointerId,...data};
  board.setPointerCapture(event.pointerId);
  if(data.immediate){message='';config.move(p.x,p.y);render();}
};
board.onpointermove=event=>{
  if(drag?.id!==event.pointerId)return;
  message='';
  if(config.tile){
    const tile=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-tile]');
    if(!tile||!board.contains(tile)||drag.seen.has(Number(tile.dataset.tile)))return;
    const index=Number(tile.dataset.tile);drag.seen.add(index);config.tile(index,drag.selected);
  }else{
    const p=coordinates(event);if(!p)return;
    config.move(p.x,p.y);
  }
  render();
};
for(const event of ['pointerup','pointercancel','lostpointercapture']){
  board.addEventListener(event,e=>{if(drag?.id===e.pointerId)drag=null;});
}
document.getElementById('g4-reset').onclick=reset;
document.getElementById('g4-new').onclick=()=>{
  if(lesson==='angle'){
    const choices=Array.from({length:34},(_,i)=>15+i*5).filter(n=>n!==state.degrees&&n!==angleQuestion);
    angleQuestion=choices[Math.floor(Math.random()*choices.length)];
  }
  round++;reset();
};
reset();
