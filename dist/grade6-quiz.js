import {gcd,lcm,fraction,circle,decimal,svg,strip,colors,label} from './grade6-core.js';
import {shuffle} from './lab-quiz-core.js';
const n=(kind,prompt,answer,solution,unit='',diagram='')=>({kind,prompt,answer,solution,unit,diagram,integer:Number.isInteger(answer),decimal:!Number.isInteger(answer)});
const c=(kind,prompt,answer,wrong,solution,diagram='')=>({kind,prompt,answer,options:shuffle([answer,...wrong]),solution,diagram});
const f=(kind,prompt,a,b,solution)=>c(kind,prompt,fraction(a,b),[fraction(a+b,b),fraction(a+2*b,b)],solution);
export const grade6Factories={
 'g6-ratio':i=>{
  const a=i+2,b=a+1,k=2+i%4;
  return [
   {kind:'看圖寫比',prompt:'紅格數：藍格數是多少？依圖填寫原數量。',diagram:svg(strip(b,a,20,colors[0])+strip(b,b,60,colors[1]),360,100),fields:['前項','後項'],answer:[a,b],solution:`紅有 ${a} 格，藍有 ${b} 格。`},
   f('算比值',`${a*2}：${b*2} 的比值是多少？`,a,b,'以前項除以後項，再約分。'),
   n('等值比',`${a}：${b} ＝ □：${b*k}，□ 是多少？`,a*k,`前後項都乘以 ${k}。`),
   c('判斷成正比',`（紅，藍）三組資料為（${a}，${b}）、（${2*a}，${2*b}）、（${3*a}，${3*b+i%2}）。哪個說法正確？`,i%2?'不成正比，第三組的比值不同':'成正比，每組比值相同',[i%2?'成正比，每組比值相同':'不成正比，第三組的比值不同'],'比較三組的紅格數除以藍格數。'),
   n('找對應量',`每 ${a} 格紅配 ${b} 格藍，${a*k} 格紅要配幾格藍？`,b*k,`兩種顏色都放大 ${k} 倍。`,'格')];
 },
 'g6-circle-area':i=>{
  const r=i+1,angle=[30,45,60,90,120,180,270,40,72,144][i];
  return [
   n('半徑與圓面積',`半徑 ${r} 公分，圓面積是多少？取 π＝3.14。`,decimal(circle(r).area),`3.14 × ${r} × ${r}。`,'平方公分'),
   n('直徑辨識',`直徑 ${2*r} 公分，圓面積是多少？取 π＝3.14。`,decimal(circle(r).area),`先除以 2 得半徑 ${r} 公分。`,'平方公分'),
   f('扇形占比',`${angle}° 扇形占整圓幾分之幾？`,angle,360,'用圓心角除以 360°。'),
   n('求扇形面積',`半徑 ${r} 公分、圓心角 ${angle}°，扇形面積是多少？取 π＝3.14，四捨五入到小數第二位。`,decimal(circle(r,angle).area),'整圓面積乘以圓心角占整圓的比例。','平方公分'),
   c('面積伸縮',`半徑從 ${r} 公分變為 ${r*(2+i%3)} 公分，面積變為幾倍？`,String((2+i%3)**2),[String(2+i%3),String(2*(2+i%3))].filter(v=>v!==String((2+i%3)**2)).concat('1'),'兩個半徑因數都乘上同一倍率。')];
 },
 'g6-speed':i=>{
  const a=2+i%4,b=a+1,t=3+i;
  const chart=svg('<path d="M35 160V20M35 160H330" fill="none" stroke="#285d48"/>'+[a,b].map((v,j)=>`<path d="M35 160 L310 ${160-120*v/b}" stroke="${colors[j]}" stroke-width="3"/>`+label(319,160-120*v/b,'AB'[j])).join('')+label(180,180,`時間（秒）0 至 ${t}`)+label(82,15,`距離（公尺）至 ${b*t}`));
  return [
   c('同時間比距離',`A 每秒走 ${a} 公尺，B 每秒走 ${b} 公尺。走 ${t} 秒，誰走得較遠？`,'B',['A','一樣遠'],'時間相同，每秒走得越遠，總距離越長。'),
   n('求速率',`${a*t} 公尺走了 ${t} 秒，平均每秒走幾公尺？`,a,'距離除以時間。','公尺／秒'),
   n('求距離',`每秒走 ${a} 公尺，走 ${t} 秒，走了幾公尺？`,a*t,'速率乘以時間。','公尺'),
   n('求時間',`每秒走 ${b} 公尺，走完 ${b*t} 公尺需要幾秒？`,t,'距離除以速率。','秒'),
   c('讀距離時間圖','哪條線對應速率較快的車？','B',['A','一樣快'],'相同時間下，B 走過較長的距離。',chart)];
 },
 'g6-scale':i=>{
  const a=i+2,k=2+i%3;
  const shape=(x,y)=>svg(`<path d="M20 80h${x}v-${y}Z" fill="#a9d3b4" stroke="#285d48"/>`,140,95);
  return [
   n('對應邊',`原邊 ${a} 公分，放大 ${k} 倍後長幾公分？`,a*k,'對應邊一起乘上倍率。','公分'),
   c('找正確放大圖','哪張圖是原圖的 2 倍放大圖？',shape(a*8,a*6),[shape(a*8,a*3),shape(a*4,a*3)],'水平與垂直的對應長度都要乘 2。',shape(a*4,a*3)),
   n('縮圖長度',`原長 ${a*k} 公分，縮小成原來的 1/${k}，長幾公分？`,a,`原長除以 ${k}。`,'公分'),
   n('圖上換實際',`比例尺 1：100000，圖上 ${a} 公分，實際幾公里？`,a,'圖上 1 公分代表實際 100000 公分，也就是 1 公里。','公里'),
   n('實際換圖上',`比例尺 1：50000，實際 ${a} 公里，圖上幾公分？`,2*a,'先將公里換為公分，再除以 50000。','公分')];
 },
 'g6-gcd':i=>{
  const [a,b]=[[12,18],[8,15],[6,12],[12,12],[9,15],[14,21],[16,24],[18,24],[20,25],[24,36]][i];
  const g=gcd(a,b),m=lcm(a,b),options=Array.from({length:Math.min(a,b)},(_,k)=>k+1).filter(k=>a%k===0||b%k===0);
  const correct=options.flatMap((k,j)=>a%k===0&&b%k===0?[j]:[]);
  return [
   {kind:'找公因數',prompt:`選出 ${a} 和 ${b} 的所有公因數（可複選）。`,solution:'能同時整除兩數的才是公因數。',interaction:{type:'tiles',answer:true,
    draw:()=>`<div class="grade3-control-buttons">${options.map((k,j)=>`<button type="button" data-tile="${j}" aria-pressed="false">${k}</button>`).join('')}</div>`,
    validate:set=>set.size===correct.length&&correct.every(j=>set.has(j))}},
   n('求最大公因數',`${a} 和 ${b} 的最大公因數是多少？`,g,'找出能整除兩數的最大整數。'),
   n('找最小公倍數',`每次跳 ${a} 格和每次跳 ${b} 格，從 0 出發後第一次共同踩到哪個正整數？`,m,'找兩種跳法共有的第一個正落點。'),
   n('分組情境',`${a} 顆紅珠和 ${b} 顆藍珠分成相同的包，每包的紅珠數相同、藍珠數也相同，全部分完最多幾包？`,g,'包數必須同時整除兩種珠子的數量。','包'),
   n('週期情境',`兩個鈴同時響過，一個每 ${a} 分鐘響，一個每 ${b} 分鐘響，幾分鐘後第一次再同時響？`,m,'等待時間必須是兩個週期的最小正公倍數。','分鐘')];
 },
 'g6-fraction':i=>{
  const a=2+i,b=a+2,k=2+i%3;
  return [
   n('看圖數整組',`上條是 ${a}/${b}，下條是 1/${b}。上條包含幾個下條？`,a,'兩條都以同樣大的整體為基準，每一小格是一組。','組',svg(strip(b,a,20,colors[0])+strip(b,1,65,colors[1]),360,105)),
   f('求非整數商',`${a}/${b} ÷ ${a+1}/${b}＝？`,a,a+1,'分母相同，可以比較兩段各有幾個同樣大的小格。'),
   f('倒數相乘',`${a}/${b} ÷ 1/${k}＝？`,a*k,b,'除以 1/'+k+' 等於乘以 '+k+'。'),
   n('分段情境',`${a}/${b} 公尺長的緞帶，每段 1/${b} 公尺，可剪幾段？`,a,'每段占一小格。','段'),
   c('除數小於一',`${a}/${b} ÷ 1/${k} 的商與 ${a}/${b} 比較如何？`,'商比較大',['商比較小','一樣大'],'除以小於 1 的正數，相當於乘上一個大於 1 的數。')];
 },
 'g6-perimeter':i=>{
  const r=i+1,angle=[30,45,60,90,120,180,270,40,72,144][i];
  return [
   n('圓周長',`直徑 ${2*r} 公分，圓周長是多少？取 π＝3.14。`,decimal(circle(r).arc),'直徑乘以圓周率。','公分'),
   n('半圈滾動',`半徑 ${r} 公分的圓無滑動滾半圈，走幾公分？取 π＝3.14。`,decimal(circle(r,180).arc),'半圈前進圓周長的一半。','公分'),
   f('圓心角與弧長',`${angle}° 的弧占整圓圓周的幾分之幾？`,angle,360,'弧長比例等於圓心角比例。'),
   n('求弧長',`半徑 ${r} 公分、圓心角 ${angle}°，弧長是多少？取 π＝3.14，四捨五入到小數第二位。`,decimal(circle(r,angle).arc),'整圓圓周長乘以圓心角比例。','公分'),
   n('求扇形周長',`半徑 ${r} 公分、圓心角 ${angle}°，扇形周長是多少？取 π＝3.14，四捨五入到小數第二位。`,decimal(circle(r,angle).edge),'沿外圍一圈要走弧及兩條半徑。','公分')];
 }
};
export const grade6Generators=Object.fromEntries(Object.entries(grade6Factories).map(([key,make])=>{
 let previous=-1;
 return [key,()=>{
  for(const index of shuffle(Array.from({length:10},(_,i)=>i).filter(i=>i!==previous))){
   const questions=make(index);
   if(questions.length===5&&questions.every(q=>q.options?
    new Set(q.options).size===q.options.length&&q.options.includes(q.answer):
    q.interaction||[].concat(q.answer).every(x=>Number.isFinite(x)&&x>0))){
     previous=index;return questions;
   }
  }
  throw new Error('找不到有效的六年級練習題');
 }];
}));
