import {generateTriangleQuiz,gradeTriangleQuestion} from './triangle-quiz-core.js';
import {classifySides} from './triangle-core.js';
const $=id=>document.getElementById(id);
let questions=[],results=[],picked=[],submitted=false;
function angleDiagram(q){
 const [a,b]=q.angles.map(v=>v*Math.PI/180),base=200,x=base*Math.sin(b)*Math.cos(a)/Math.sin(a+b),y=base*Math.sin(b)*Math.sin(a)/Math.sin(a+b);
 const scale=Math.min(1,165/Math.max(y,1),220/(Math.max(base,x)-Math.min(0,x)));const offset=140-(Math.min(0,x)+Math.max(base,x))*scale/2;
 const pts=[[offset,215],[offset+base*scale,215],[offset+x*scale,215-y*scale]];
 const labels=q.angles.map((v,i)=>`${'ABC'[i]}：${q.unknown.includes(i)?'?':v}°`);
 return `<svg viewBox="0 0 280 250" role="img" aria-label="${labels.join('、')}"><path d="M ${pts.map(p=>p.join(' ')).join(' L ')} Z" fill="#e7efdd" stroke="#668a5c" stroke-width="2"/>${pts.slice(0,2).map((p,i)=>`<path d="M ${p[0]} ${p[1]+3} L ${i===0?55:225} 226" stroke="#b6c7ac" fill="none"/>`).join('')}${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#62875b"/><text x="${i===0?55:i===1?225:Math.max(45,Math.min(235,p[0]))}" y="${p[1]+(i===2?-12:22)}" text-anchor="middle" fill="#4f7447">${labels[i]}</text>`).join('')}</svg>`;
}
function prompt(q){
 if(q.type==='angle')return `三角形的 ∠A＝<strong>${q.angles[0]}°</strong>、∠B＝<strong>${q.angles[1]}°</strong>。∠C 是多少度？`;
 if(q.type==='isosceles')return `等腰三角形的頂角 ∠C＝<strong>${q.angles[2]}°</strong>，底角 ∠A、∠B 相等。<strong>一個底角</strong>是多少度？`;
 if(q.type==='right')return `直角三角形的 ∠A＝<strong>90°</strong>，∠B＝<strong>${q.angles[1]}°</strong>。∠C 是多少度？`;
 if(q.type==='sides')return `長度為 <strong>${q.sides.join('、')} cm</strong> 的三條邊，能不能圍成三角形？`;
 if(q.type==='strips')return '從下面五條邊條中，<strong>選出 3 條能圍成三角形的邊條</strong>。每條只能使用一次，可能不只一種答案。';
 return `三條邊長是 <strong>${q.sides.join('、')} cm</strong>。小明的說法有沒有問題？選出正確的說明。`;
}
function explanation(q){
 if(q.type==='angle'||q.type==='right')return `180° − ${q.angles[0]}° − ${q.angles[1]}° ＝ ${q.answer}°。<br>三個內角都大於 0°，合起來是 180°。`;
 if(q.type==='isosceles')return `兩個底角和：180° − ${q.angles[2]}° ＝ ${180-q.angles[2]}°。<br>兩底角相等，所以每個底角是 ${180-q.angles[2]}° ÷ 2 ＝ ${q.answer}°。`;
 if(q.type==='strips')return '先選三條，再把長度從小排到大。若「兩條較短邊的和 ＞ 最長邊」，就能圍成。<br>答案可能不只一組；檢查後會顯示你選擇的組合結果。';
 const {a,b,c,valid,equal}=classifySides(q.sides);
 const comparisons=[[a,b,c],[a,c,b],[b,c,a]].map(([x,y,z])=>`${x} ＋ ${y} ＝ ${x+y} ${x+y>z?'＞':x+y===z?'＝':'＜'} ${z}`).join('<br>');
 return `${comparisons}<br>${valid?'三組兩邊和都大於第三邊，所以可以圍成。':equal?'兩短邊和等於最長邊，只能排成一直線，圍不出三角形。':'兩短邊和小於最長邊，兩端接不到，不能圍成。'}${q.type==='reason'?'<br>小明只檢查了一組成立的不等式，漏掉另外兩組。':''}`;
}
function choices(i,options){return `<fieldset class="choice-list"><legend>選擇你的答案</legend>${options.map(([value,label])=>`<label><input type="radio" name="answer-${i}" value="${value}"><span>${label}</span></label>`).join('')}</fieldset>`;}
function buildSet(){
 questions=generateTriangleQuiz();results=Array(6).fill(null);picked=[];submitted=false;
 $('questions').innerHTML=questions.map((q,i)=>{
 const isAngle=!!q.angles;const title=isAngle?'角度計算':q.type==='sides'?'三邊判斷':q.type==='strips'?'選邊條操作':'找錯與說明';
 let visual=isAngle?`<div class="question-visual">${angleDiagram(q)}</div>`:q.type==='sides'?`<div class="side-numbers">${q.sides.map(v=>`<span>${v} <small>cm</small></span>`).join('')}</div>`:'';
 let inputs;
 if(isAngle)inputs=`<div class="answer-row"><label for="answer-${i}">答案</label><input id="answer-${i}" type="text" pattern="[0-9]*" autocomplete="off" inputmode="numeric" aria-label="第 ${i+1} 題角度"><span>度</span></div>`;
 else if(q.type==='sides')inputs=choices(i,[['yes','可以圍成三角形'],['no','不能圍成三角形']]);
 else if(q.type==='strips')inputs=`<div class="strip-picker">${q.strips.map((v,j)=>`<button class="strip-option" type="button" data-strip="${j}" aria-label="邊條 ${j+1}，${v} 公分" aria-pressed="false"><span>${j+1}</span><span class="strip-track"><span class="strip-wood" style="width:${v/30*100}%"></span></span><small>${v} cm</small></button>`).join('')}</div><p class="strip-status" id="strip-status" role="status">已選 0 / 3 條</p><div class="strip-output" id="strip-output"></div>`;
 else {const [a,b,c]=q.sides;visual=`<blockquote class="thought">小明說：「${b} ＋ ${c} ＞ ${a}，所以這三條邊一定能圍成三角形。」</blockquote>`;const opts=[['unchecked',`不對。還要檢查 ${a} ＋ ${b}；它${a+b===c?'等於':'小於'} ${c}，不能圍成。`],['one','對。只要任選一組兩邊和大於第三邊，就一定可以。'],['sum','不對。三邊長度的總和必須等於 180 cm。']];for(let k=opts.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[opts[k],opts[j]]=[opts[j],opts[k]];}inputs=choices(i,opts);}
 return `<article class="question" id="question-${i}"><div class="question-top"><span class="question-number">0${i+1}</span><span class="question-kind">${title}</span></div><h2>第 ${i+1} 題${q.type==='isosceles'?' · 等腰三角形':q.type==='right'?' · 直角三角形':''}</h2><p class="question-prompt">${prompt(q)}</p>${visual}<form data-question="${i}" novalidate>${inputs}<button class="check-answer" type="submit" hidden>${q.type==='strips'?'檢查並組合':'檢查答案'}</button><p class="feedback" id="feedback-${i}" role="status" aria-live="polite"></p></form><details class="solution" hidden><summary>查看解題說明</summary><div></div></details></article>`;
 }).join('');
 $('questions').querySelectorAll('form').forEach(f=>{const i=+f.dataset.question;f.onsubmit=e=>{e.preventDefault();if(submitted)grade(i);};f.oninput=()=>clearResult(i);});
 document.querySelectorAll('[data-strip]').forEach(b=>b.onclick=()=>{const j=+b.dataset.strip;picked=picked.includes(j)?picked.filter(v=>v!==j):[...picked,j];clearResult(4);$('strip-output').innerHTML='';document.querySelectorAll('[data-strip]').forEach(el=>{const selected=picked.includes(+el.dataset.strip);el.setAttribute('aria-pressed',String(selected));el.disabled=picked.length===3&&!selected;});$('strip-status').textContent=`已選 ${picked.length} / 3 條${picked.length?'：'+picked.map(j=>questions[4].strips[j]+' cm').join('、'):''}`;});
 updateScore();
}
function clearResult(i){results[i]=null;$(`feedback-${i}`).textContent='';$(`question-${i}`).classList.remove('correct','incorrect');updateScore();}
function stripResult(values){const {a,b,c,valid,equal}=classifySides(values);let drawing='';const scale=6,left=140-c*scale/2,right=140+c*scale/2;
 if(valid){const x=(a*a+c*c-b*b)/(2*c),height=Math.sqrt(Math.max(0,a*a-x*x));drawing=`<path d="M ${left} 185 L ${left+x*scale} ${185-height*scale} L ${right} 185 Z" fill="#e4eedb" stroke="#65895d" stroke-width="3"/>`;}else drawing=`<path d="M ${left} 140 L ${left+a*scale} 140" stroke="#448464" stroke-width="6"/><path d="M ${right-b*scale} 140 L ${right} 140" stroke="#c9a04d" stroke-width="6"/><path d="M ${left} 185 L ${right} 185" stroke="#6d97b6" stroke-width="6"/><text x="140" y="95" text-anchor="middle" fill="#9b762e" font-size="12">${equal?'只能排成一直線':`還差 ${c-a-b} cm，接不到`}</text>`;
 return `<svg viewBox="0 0 280 215" role="img" aria-label="${a}、${b}、${c} 公分，${valid?'可以':'不能'}圍成三角形">${drawing}</svg><p>你選的是 ${a}、${b}、${c} cm。<br>${[[a,b,c],[a,c,b],[b,c,a]].map(([x,y,z])=>`${x} ＋ ${y} ＝ ${x+y} ${x+y>z?'＞':x+y===z?'＝':'＜'} ${z} ${x+y>z?'✓':'✗'}`).join('<br>')}<br>${valid?'三組比較都成立，可以圍成！':equal?'剛好相等，只能排成一直線。':'兩條短邊合起來還不夠長，請換一條試試。'}</p>`;
}
function grade(i){if(!submitted)return;const q=questions[i];let answer,missing=false;
 if(q.angles){const raw=$(`answer-${i}`).value;answer=Number(raw);missing=!/^\d+$/.test(raw.trim())||!Number.isInteger(answer)||answer<1||answer>179;}
 else if(q.type==='strips'){answer=picked;missing=picked.length!==3;}
 else {const el=document.querySelector(`[name="answer-${i}"]:checked`);missing=!el;answer=q.type==='sides'?(el?.value==='yes'):el?.value;}
 clearResult(i);
 if(missing){$(`feedback-${i}`).textContent=q.angles?'請填入 1～179 的整數角度。':q.type==='strips'?'請先選好 3 條不同的邊條。':'請先選擇一個答案。';return;}
 const correct=gradeTriangleQuestion(q,answer);results[i]=correct;$(`question-${i}`).classList.add(correct?'correct':'incorrect');$(`feedback-${i}`).textContent=correct?'✓ 答對了！':'再想一想，可以查看下方解題說明。';
 if(q.type==='strips')$('strip-output').innerHTML=stripResult(picked.map(j=>q.strips[j]));updateScore();
}
function updateScore(){const checked=results.filter(v=>v!==null).length,correct=results.filter(v=>v===true).length;$('score').textContent=checked?`已檢查 ${checked} / 6 題 · 答對 ${correct} 題${correct===6?'，全部答對了！':''}`:'準備好了嗎？從第 1 題開始吧！';}
$('new-set').onclick=buildSet;$('check-all').onclick=()=>{
 submitted=true;
 questions.forEach((q,i)=>{
  grade(i);
  const card=$(`question-${i}`),solution=card.querySelector('.solution');
  card.querySelector('.check-answer').hidden=false;
  solution.querySelector('div').innerHTML=explanation(q);
  solution.hidden=false;solution.open=true;
 });
};buildSet();
