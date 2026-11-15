import {shuffle,random} from './lab-quiz-core.js';
import {aligned,protractor,angleKind,trianglePreset,triangleInfo,triangleGraphic,rectangle,boundary,
  validGrid,gridGraphic,toggles,rounding,numberLine,chartData,chartGraphic,chartY} from './grade4-core.js';

const numeric=(kind,prompt,diagram,answer,solution,unit='')=>({kind,prompt,diagram,answer,solution,unit,integer:true});
const choice=(kind,prompt,diagram,answer,others,solution)=>({kind,prompt,diagram,answer,options:shuffle([answer,...others]),solution});
const task=(kind,prompt,solution,interaction)=>({kind,prompt,solution,interaction});
const dial=(draw,start,answer,min,max,step,buttons,extra={})=>({type:'range',draw,start,answer,min,max,step,buttons,...extra});
const pad=(draw,answer,validate)=>({type:'tiles',draw,answer,validate});
const pair=(a,b)=>`<div class="quiz-compare"><div>甲${a}</div><div>乙${b}</div></div>`;
const correctTool={x:180,y:155,rotation:0};

function angles(s){
  const n=20+s%29*5, other=180-n;
  const classify=([35,90,125][s%3])+ (s%3===1?0:s%10);
  return [
    numeric('讀角度','量角器已經對準。從金色邊的 0° 開始，這個角是多少度？',
      protractor(n,correctTool,126,'right'),n,`從右側的 0° 開始，另一邊對準 ${n}°。`,'度'),
    task('擺量角器','移動並旋轉量角器，讓中心和 0° 線都對齊。','中心十字對頂點，右側 0° 線對金色邊。',{
      type:'position',start:{x:155+s%5*5,y:180+s%3*5,rotation:15+s%4*5},draw:p=>protractor(n,p), validate:aligned,
      bounds:[[115,245],[120,200],[-35,35]],buttons:[['x',-5,'左移'],['x',5,'右移'],['y',-5,'上移'],['y',5,'下移'],['rotation',5,'逆時針'],['rotation',-5,'順時針']]
    }),
    task('畫指定角',`把開口調成 ${n}°。`,'從金色的基準邊轉到指定角度。',
      dial(v=>protractor(v),15,n,15,165,5,['縮小 5°','放大 5°'],{fromPoint:(x,y)=>Math.atan2(155-y,x-180)*180/Math.PI})),
    choice('找讀錯原因',`這個角是 ${n===90?50:n}°，有人讀成 ${n===90?130:other}°。可能哪裡錯了？`,
      protractor(n===90?50:n,correctTool),'從另一側的 0° 開始讀',['把量角器中心對準頂點','讓 0° 線和金色邊重合'],'從和金色邊重合的 0° 開始，沿同一圈刻度讀。'),
    choice('角的分類','這個角屬於哪一類？',protractor(classify,null,106+s%11),angleKind(classify),
      ['銳角','直角','鈍角'].filter(k=>k!==angleKind(classify)),'把開口和直角比較，就能判斷角的類型。')
  ];
}

function triangles(s){
  const side=trianglePreset(['equilateral','isosceles','right'][s%3],s);
  const corner=trianglePreset(['equilateral','right','obtuse'][s%3],s);
  const iso=trianglePreset('isosceles',s);
  const sideAnswer=triangleInfo(side).sides, angleAnswer=triangleInfo(corner).kind;
  const target=['直角三角形','鈍角三角形','銳角三角形'][s%3];
  const examples=['equilateral','right','obtuse','both'];
  const goal=examples.findIndex(k=>triangleInfo(trianglePreset(k,s)).kind===target);
  const order=shuffle(examples.map((_,i)=>i));
  return [
    choice('依邊分類','依邊分類，選出最具體的名稱。',triangleGraphic(side,'edges'),sideAnswer,
      ['正三角形','等腰三角形','一般三角形'].filter(k=>k!==sideAnswer),'三邊等長叫正三角形，也是等腰三角形的特例。'),
    choice('依角分類','依角分類，這是哪種三角形？',triangleGraphic(corner,'angles'),angleAnswer,
      ['銳角三角形','直角三角形','鈍角三角形'].filter(k=>k!==angleAnswer),'看最大的角是否等於、大於或小於 90°。'),
    task('找出等長邊','選出兩條等長的邊。','從頂點連到同一條底邊的兩端，這兩條邊一樣長。',
      pad(set=>toggles(3,set,3,'邊 ' ).replace(/邊 (\d)/g,(_,i)=>'邊 '+'甲乙丙'[Number(i)-1]),true,
        set=>set.size===2&&triangleInfo(iso).equal.every((value,i)=>value===set.has(i)))),
    task('做出目標三角形',`切換形狀，做出${target}。`,'轉動圖形不會改變角的大小。用最大角判斷。',
      dial(i=>triangleGraphic(trianglePreset(examples[order[i]],s),'angles'),(order.indexOf(goal)+1)%4,
        order.indexOf(goal),0,3,1,['上一個形狀','下一個形狀'],
        {validate:i=>triangleInfo(trianglePreset(examples[order[i]],s)).kind===target})),
    choice('兩種分類','這個三角形有兩邊等長，也有一個直角。應該怎麼說？',triangleGraphic(trianglePreset('both',s),'angles'),
      '它同時是等腰三角形和直角三角形',['只能叫等腰三角形','只能叫直角三角形'],'看邊和看角是兩種不同的分類方法。')
  ].map((q,i)=>i===2?{...q,diagram:triangleGraphic(iso)}:q);
}

const equalAreaPairs=[[3,4,2,6],[2,4,1,8],[2,5,1,10],[2,6,1,12],[3,8,4,6],[3,3,1,9],[2,8,4,4],[2,9,3,6],[2,10,4,5],[2,12,4,6]];
function areas(s){
  const count=6+s%19, width=3+s%3;
  const cells=new Set(Array.from({length:count},(_,i)=>Math.floor(i/width)*12+i%width));
  const target=6+s%15;
  const [a,b,c,d]=equalAreaPairs[s%10];
  const rect=(w,h)=>rectangle(w,h);
  const first=rect(a,b);
  const second=rect(c,d);
  const activity=['花圃','菜園','球場','庭院','沙坑','雞舍','泳池','公園','果園','草地'][s%10];
  const perimeter=s%2===0;
  const p=boundary(cells).length;
  return [
    numeric('數面積','綠色圖形占了幾個單位方格？',gridGraphic(cells,false),count,`每格一樣大，共 ${count} 格。`,'格'),
    numeric('數周長','沿橘色外框數一圈，周長有幾個單位邊？',gridGraphic(cells),p,`共用內邊不用算，外框有 ${p} 個單位邊。`,'單位邊'),
    choice('同面積比周長','比較甲和乙的面積與周長。',pair(gridGraphic(first),gridGraphic(second)),
      '面積相同，周長不同',['面積不同，周長相同','面積與周長都相同'],
      `兩個圖形各有 ${first.size} 格，周長分別是 ${boundary(first).length} 和 ${boundary(second).length} 個單位邊。`),
    task('拼指定面積',`拼出面積 ${target} 格的圖形。方格須用邊相連，中間不能留洞。`,'每格算一個單位面積。只要符合條件，各種排法都可以。',
      pad(set=>toggles(72,set,12,'方格'),true,set=>set.size===target&&validGrid(set))),
    choice('辨認面積與周長',perimeter?`要沿著${activity}圍一圈，需要知道什麼？`:`要鋪滿${activity}的地面，需要知道什麼？`,
      gridGraphic(cells,perimeter),perimeter?'周長':'面積',[perimeter?'面積':'周長'],'周長量外圍一圈，面積量內部占的大小。')
  ];
}

function estimates(s){
  const n=431+s%49, m=301+s%98, big=2501+s%423, price=151+s%49;
  const r=rounding(m,100), b=rounding(big,100), t=rounding(n,10);
  const f=rounding(price,100).value;
  return [
    numeric('四捨五入',`${n} 用四捨五入取到十位，約是多少？`,numberLine(n,10),t.value,
      `中點是 ${t.mid}，達到中點就取上界。`),
    choice('數線選點',`${m} 用四捨五入取到百位，要取哪個概數？`,numberLine(m,100),String(r.value),
      [String(r.value===r.low?r.high:r.low)],`中點是 ${r.mid}，所以 ${m} ≈ ${r.value}。`),
    {kind:'方法比較',prompt:`${n} 取到十位，兩種方法各是多少？`,diagram:numberLine(n,10),
      fields:['無條件捨去','無條件進入'],answer:[rounding(n,10,'down').value,rounding(n,10,'up').value],
      solution:'捨去取下界。進入取上界，若原數剛好是整十就保持原數。'},
    numeric('看位數取概數',`${big.toLocaleString('zh-TW')} 用四捨五入取到百位，約是多少？`,'',b.value,
      `看十位，或用相鄰整百的中點 ${b.mid} 判斷。`),
    numeric('生活估算',`一本書 ${price} 元。先把單價四捨五入到百位，再估算買兩本要多少元？`,'',2*f,
      `${price} 元約是 ${f} 元，${f} × 2 ＝ ${2*f} 元。`,'元')
  ];
}

function charts(s){
  const fruit=chartData(s), weather=chartData(s,true), fruitValues=fruit.values, weatherValues=weather.values;
  const i=s%5, j=(i+1)%5;
  const item=(data,k,type)=>dial(value=>chartGraphic(data,data.values.map((n,index)=>index===k?value:n),type),
    0,data.values[k],0,data.max,data.step,['降低一格','升高一格'],{fromPoint:(_,y)=>(190-y)/(190-chartY(data.max,data))*data.max});
  const drops=weatherValues.slice(0,-1).map((n,k)=>n-weatherValues[k+1]);
  const periods=weather.labels.slice(0,-1).map((day,k)=>day+'到'+weather.labels[k+1]);
  const best=drops.indexOf(Math.max(...drops));
  return [
    numeric('長條讀值',`有幾人選${fruit.labels[i]}？`,chartGraphic(fruit),fruitValues[i],'從長條頂端水平對到數值軸。','人'),
    numeric('比較相差',`${fruit.labels[i]}和${fruit.labels[j]}相差幾人？`,chartGraphic(fruit),Math.abs(fruitValues[i]-fruitValues[j]),'用兩根長條對應的大數減小數。','人'),
    task('補長條圖',`把${fruit.labels[i]}的長條調到 ${fruitValues[i]} 人。`,'長條高度對應數值軸。',item(fruit,i,'bar')),
    choice('讀折線趨勢','哪兩天之間氣溫下降最多？',chartGraphic(weather,weatherValues,'line'),periods[best],
      periods.filter((_,k)=>k!==best),'比較相鄰兩個觀測點的下降量。'),
    task('補折線圖',`把${weather.labels[j]}的點調到 ${weatherValues[j]}°C。`,'找對日期，再從縱軸找對高度。',item(weather,j,'line'))
  ];
}

export const grade4Generators={
  'g4-angle':angles,'g4-triangle':triangles,'g4-area':areas,'g4-rounding':estimates,'g4-charts':charts
};
for(const [key,generate] of Object.entries(grade4Generators)){
  let seed=random(0,179), step=0;
  grade4Generators[key]=()=>generate((seed+step++)%180);
}
