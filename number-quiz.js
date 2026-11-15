import {shuffle} from './lab-quiz-core.js';
import {svg} from './grade3-core.js';

const range=n=>Array.from({length:n},(_,i)=>i+1);
const factors=n=>range(n).filter(d=>n%d===0);
const pairs=[[12,18],[16,24],[18,30],[20,30],[24,36],[28,42],[30,45],[32,48],[35,50],[18,27]];
const jumps=[[3,4],[3,5],[4,6],[4,7],[5,6],[5,8],[6,8],[6,9],[7,8],[8,10]];
const choice=(kind,prompt,answer,others,solution,diagram='')=>({kind,prompt,answer,options:shuffle([answer,...others]),solution,diagram});
const number=(kind,prompt,answer,solution)=>({kind,prompt,answer,solution,integer:true});
const multi=(kind,prompt,options,correct,solution,diagram='')=>({
  kind,prompt,solution,diagram,interaction:{type:'tiles',answer:true,
    draw:()=>`<div class="grade3-control-buttons" role="group" aria-label="可複選">${options.map((n,i)=>`<button type="button" data-tile="${i}" aria-pressed="false">${n}</button>`).join('')}</div>`,
    validate:set=>set.size===correct.length&&correct.every(n=>set.has(options.indexOf(n)))}
});
function groups(total,size){
  const count=Math.ceil(total/size);
  const art=Array.from({length:count},(_,i)=>{
    const x=4+i%4*77,y=4+Math.floor(i/4)*27,n=Math.min(size,total-i*size);
    return `<rect x="${x}" y="${y}" width="72" height="23" rx="5" fill="${n<size?'#f8dfab':'#e3efe0'}" stroke="#78977f"/>`
      +range(n).map(k=>`<circle cx="${x+8+(k-1)*9}" cy="${y+12}" r="3" fill="#285d48"/>`).join('');
  }).join('');
  return svg(312,Math.ceil(count/4)*27+5,art,`${total} 個圓點，每 ${size} 個一群`);
}
function track(a,b,end){
  const x=n=>20+n/end*320;
  const marks=(step,y,color)=>range(Math.floor(end/step)).map(k=>`<circle cx="${x(k*step)}" cy="${y}" r="4" fill="${color}"/>`).join('');
  return svg(360,90,`<path d="M20 58H340" stroke="#285d48"/>`+marks(a,25,'#286b91')+marks(b,42,'#a66920')+
    range(end+1).filter(k=>(k-1)%5===0||k===end+1).map(k=>`<text x="${x(k-1)}" y="77" text-anchor="middle" font-size="10">${k-1}</text>`).join(''),'兩種跳法的共同數線');
}
const join=values=>values.join('、');
export const numberQuizFactories={
  factors(i){
    const g=3+i%5, size=2+i%6,total=g*size, n=[12,18,20,24,28,30,32,36,42,48][i], all=factors(n);
    const missing=all[1+i%(all.length-2)], remainder=1+i%(size-1);
    const options=[2,3,4,5,6,7], valid=options.filter(d=>n%d===0);
    return [
      choice('看圖找因數',`看圓點的分群圖，哪一對因數相乘等於 ${total}？`,`${g} 和 ${size}`,[`${g+1} 和 ${size}`,`${g} 和 ${size+1}`],`${g} 群，每群 ${size} 個，所以 ${g} × ${size} ＝ ${total}。`,groups(total,size)),
      choice('看餘數判斷',`每 ${size} 個圓點一群。${size} 是 ${total+remainder} 的因數嗎？`,'不是，有剩下圓點',['是，可以剛好分完'],`剩下 ${remainder} 個，不能整除。`,groups(total+remainder,size)),
      multi('選出所有可行分法',`有 ${n} 個圓點。每群放幾個才會剛好分完？請選出所有可行選項。`,options,valid,`${join(valid)} 都能整除 ${n}。`),
      number('補上配對因數',`${g} × □ ＝ ${total}，□ 裡應填幾？`,size,`${total} ÷ ${g} ＝ ${size}。`),
      number('找漏掉的因數',`${n} 的因數已列出 ${join(all.filter(d=>d!==missing))}，還少哪一個？`,missing,`完整的因數有 ${join(all)}。`)
    ];
  },
  'common-factors'(i){
    const [a,b]=pairs[i], fa=factors(a),fb=factors(b),common=fa.filter(n=>b%n===0),greatest=common.at(-1);
    const bag=fa.find(n=>b%n!==0);
    const invalid=range(12).filter(n=>!common.includes(n)).slice(0,2);
    return [
      multi('從兩列找共同數字','請選出兩列都有的因數。',[...new Set([...fa,...fb])].sort((x,y)=>x-y),common,`兩列都有 ${join(common)}。`,`<p>${a} 的因數為 ${join(fa)}</p><p>${b} 的因數為 ${join(fb)}</p>`),
      choice('看兩組分配結果',`${a} 塊餅乾和 ${b} 塊蛋糕各自每 ${bag} 塊裝一袋，哪一種會剩下？`,`蛋糕剩 ${b%bag} 塊`,['餅乾有剩下','兩種都剛好裝完'],`餅乾剛好裝完，蛋糕餘 ${b%bag} 塊。`),
      choice('選可行的分組數',`有 ${a} 顆草莓和 ${b} 顆葡萄。分給幾人，兩種水果都能平分？`,`${greatest} 人`,invalid.map(n=>`${n} 人`),`${a} 和 ${b} 都能被 ${greatest} 整除。`),
      number('找最大公因數',`${a} 和 ${b} 的公因數有 ${join(common)}。最大的是幾？`,greatest,`比較共同因數，最大的是 ${greatest}。`),
      {kind:'把分組結果說清楚',prompt:`${a} 顆草莓和 ${b} 顆葡萄平分給 ${greatest} 人，每人各得到幾顆？`,fields:['草莓（顆）','葡萄（顆）'],answer:[a/greatest,b/greatest],solution:`兩種水果各除以 ${greatest}，每人得到 ${a/greatest} 顆草莓和 ${b/greatest} 顆葡萄。`}
    ];
  },
  'common-multiples'(i){
    const [a,b]=jumps[i], common=range(a*b).find(n=>n%a===0&&n%b===0),end=2*common;
    const options=[a,b,common,common+a,end].sort((x,y)=>x-y);
    return [
      multi('看數線找共同落點',`藍色每次跳 ${a} 格，橘色每次跳 ${b} 格。選出 1～${end} 內所有共同落點。`,options,[common,end],`兩列對齊的位置是 ${common}、${end}。`,track(a,b,end)),
      choice('判斷是不是公倍數',`哪一組算式能說明 ${common} 是 ${a} 和 ${b} 的公倍數？`,`${a} × ${common/a} ＝ ${common}，${b} × ${common/b} ＝ ${common}`,[`${a} × ${b} ＝ ${a*b}`,`${a} ＋ ${b} ＝ ${a+b}`],'同一個數可以分別寫成這兩個數乘上整數。'),
      number('找第一次共同落點',`從 0 出發，每次分別跳 ${a} 格和 ${b} 格。離開 0 後，第一次都踩到哪個數？`,common,`第一個正的共同落點是 ${common}。`),
      number('找下一個共同落點',`每次跳 ${a} 格和每次跳 ${b} 格的人都踩到 ${common}。下一個共同落點在哪裡？`,end,`再經過 ${common} 格，兩人會在 ${end} 再次踩到同一個數。`),
      number('生活週期題',`兩盞燈現在同時亮起。一盞每 ${a} 秒亮一次，另一盞每 ${b} 秒亮一次。幾秒後第一次再同時亮起？`,common,`${a} 和 ${b} 的最小公倍數是 ${common}，所以是 ${common} 秒。`)
    ];
  }
};

export function verifyNumberQuiz(unit,index,questions){
  const [q1,q2,q3,q4,q5]=questions;
  const whole=n=>Number.isSafeInteger(n)&&n>0;
  const tiles=(q,correct)=>q.interaction.validate(new Set(correct))
    && !q.interaction.validate(new Set([...correct,99]))
    && !q.interaction.validate(new Set(correct.slice(1)));
  if(!questions.every(q=>q.options?new Set(q.options).size===q.options.length&&q.options.includes(q.answer):
    Array.isArray(q.answer)?q.answer.every(whole):q.interaction||whole(q.answer)))return false;
  if(unit==='factors'){
    const total=(3+index%5)*(2+index%6),n=[12,18,20,24,28,30,32,36,42,48][index];
    const [a,b]=q1.answer.split(' 和 ').map(Number), missing=q5.answer;
    const listed=q5.prompt.match(/已列出 ([\d、]+)/)[1].split('、').map(Number);
    return a*b===total&&q4.answer===b&&(total+1+index%(b-1))%b!==0
      &&tiles(q3,[2,3,4,5,6,7].flatMap((d,i)=>n%d===0?[i]:[]))
      && factors(n).every(d=>d===missing||listed.includes(d))&&listed.length===factors(n).length-1&&!listed.includes(missing);
  }
  if(unit==='common-factors'){
    const [a,b]=pairs[index], common=range(Math.min(a,b)).filter(d=>a%d===0&&b%d===0);
    const options=[...new Set([...factors(a),...factors(b)])].sort((x,y)=>x-y);
    const bag=factors(a).find(n=>b%n!==0);
    return tiles(q1,common.map(n=>options.indexOf(n)))&&a%bag===0&&b%bag>0&&q2.answer===`蛋糕剩 ${b%bag} 塊`
      &&q3.options.filter(o=>common.includes(parseInt(o,10))).length===1
      &&q4.answer===common.at(-1)&&q5.answer[0]*q4.answer===a&&q5.answer[1]*q4.answer===b;
  }
  const [a,b]=jumps[index], first=q3.answer, next=q4.answer;
  const landings=range(next).filter(n=>n%a===0&&n%b===0);
  const options=[a,b,first,first+a,next].sort((x,y)=>x-y);
  return landings.length===2&&landings[0]===first&&landings[1]===next
    &&new Set(options).size===options.length&&tiles(q1,landings.map(n=>options.indexOf(n)))&&q5.answer===first
    && q2.answer===`${a} × ${first/a} ＝ ${first}，${b} × ${first/b} ＝ ${first}`;
}

export const numberQuizGenerators=Object.fromEntries(Object.entries(numberQuizFactories).map(([unit,make])=>{
  let previous=-1;
  return [unit,()=>{
    const order=shuffle(range(10).map(n=>n-1).filter(i=>i!==previous));
    for(const index of order){
      const questions=make(index);
      if(verifyNumberQuiz(unit,index,questions)){previous=index;return questions;}
    }
    throw new Error('無法產生有效的練習題');
  }];
}));
