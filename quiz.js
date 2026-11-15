import {generateQuestions,reduced,checkAnswer} from './quiz-core.js';
const $=id=>document.getElementById(id);
const fraction=(n,d)=>`<span class="fraction"><span>${n}</span><span>${d}</span></span>`;
const simple=(n,d)=>fraction(...reduced(n,d));
let questions=[],results=[];
function diagram(q){
 const triple=q.type.startsWith('triple');const sizes=triple?[q.n,q.b,q.c]:[q.n,q.d-q.n];
 const colors=['#87b99b','#f3d68b','#9ec5df'];let start=0;
 const point=(a,r)=>[140+r*Math.sin(a*Math.PI/180),125-r*Math.cos(a*Math.PI/180)];
 const pieces=sizes.map((v,i)=>{const sweep=360*v/q.d,a=point(start,92),b=point(start+sweep,92),label=point(start+sweep/2,63);const path=`M 140 125 L ${a.join(' ')} A 92 92 0 ${sweep>180?1:0} 1 ${b.join(' ')} Z`;start+=sweep;return `<path d="${path}" fill="${colors[i]}" stroke="white" stroke-width="2"/><text x="${label[0]}" y="${label[1]+5}" text-anchor="middle" fill="#234536" font-size="17" font-weight="700">${triple?'ABC'[i]:i===0?'?':''}</text>`;}).join('');
 return `<svg viewBox="0 0 280 250" role="img" aria-label="${triple?'A、B、C 三個扇形合成一個圓':'綠色扇形是本題要求換算的部分'}">${pieces}</svg>`;
}
function prompt(q){
 if(q.type==='angle')return `綠色扇形的圓心角是 <strong>${q.angle}°</strong>，占整圓的幾分之幾？`;
 if(q.type==='ratio')return `綠色扇形占整圓的 <strong>${simple(q.n,q.d)}</strong>，圓心角是多少度？`;
 return `A 扇形的圓心角是 <strong>${q.angle}°</strong>，B 扇形占整圓的 <strong>${simple(q.b,q.d)}</strong>。<br>C 扇形的${q.type==='triple-angle'?'圓心角是多少度':'比例占整圓的幾分之幾'}？`;
}
function explanation(q){
 const a=q.angle,b=q.b*360/q.d,c=q.c*360/q.d;
 if(q.type==='angle')return `${a}° ＝ ${fraction(a,360)} ＝ ${simple(q.n,q.d)} 圓`;
 if(q.type==='ratio')return `${simple(q.n,q.d)} 圓 ＝ ${fraction(a,360)} ＝ ${a}°`;
 return `先求 B 的角度：<br>${simple(q.b,q.d)} 圓 ＝ ${fraction(b,360)} ＝ ${b}°<br>再求 C：360° − ${a}° − ${b}° ＝ ${c}°<br>${c}° ＝ ${fraction(c,360)} ＝ ${simple(q.c,q.d)} 圓`;
}
function newSet(){
 questions=generateQuestions();results=Array(6).fill(null);
 $('questions').innerHTML=questions.map((q,i)=>{
 const ratio=q.type==='angle'||q.type==='triple-ratio';
 const title=q.type==='angle'?'角度 → 比例':q.type==='ratio'?'比例 → 角度':'三扇形推理';
 return `<article class="question" id="question-${i}"><div class="question-top"><span class="question-number">0${i+1}</span><span class="question-kind">${title}</span></div><h2>第 ${i+1} 題${q.type.startsWith('triple')?` · 求 C 的${ratio?'比例':'角度'}`:''}</h2><p class="question-prompt">${prompt(q)}</p><div class="question-visual">${diagram(q)}</div><form data-question="${i}" novalidate><div class="answer-row"><span>${q.type.startsWith('triple')?'C ＝':'答案'}</span><input type="text" pattern="[0-9]*" autocomplete="off" inputmode="numeric" id="answer-${i}-n" aria-label="第 ${i+1} 題${ratio?'分子':'角度'}" required>${ratio?`<b>／</b><input type="text" pattern="[0-9]*" autocomplete="off" inputmode="numeric" id="answer-${i}-d" aria-label="第 ${i+1} 題分母" required><span>圓</span>`:'<span>度</span>'}<button class="check-answer" type="submit">檢查</button></div><p class="feedback" id="feedback-${i}" role="status" aria-live="polite"></p></form><details class="solution"><summary>查看換算解析</summary><div>${explanation(q)}</div></details></article>`;
 }).join('');
 $('questions').querySelectorAll('form').forEach(form=>{form.onsubmit=e=>{e.preventDefault();grade(+form.dataset.question);};form.oninput=()=>{const i=+form.dataset.question;results[i]=null;$(`feedback-${i}`).textContent='';$(`question-${i}`).classList.remove('correct','incorrect');updateScore();};});
 updateScore();
}
function grade(i){const q=questions[i],nEl=$(`answer-${i}-n`),dEl=$(`answer-${i}-d`);const n=Number(nEl.value),d=dEl?Number(dEl.value):1;
 const feedback=$(`feedback-${i}`),card=$(`question-${i}`);card.classList.remove('correct','incorrect');
 if(!/^\d+$/.test(nEl.value.trim())||(dEl&&!/^\d+$/.test(dEl.value.trim()))||!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||n<0||d<=0||n>10000||d>10000){results[i]=null;feedback.textContent='請填入完整的整數答案；分母必須大於 0（數字上限 10000）。';updateScore();return;}
 const ok=checkAnswer(q,n,d);results[i]=ok;card.classList.add(ok?'correct':'incorrect');feedback.textContent=ok?'✓ 答對了！換算得很棒。':'再想一想！可以展開下方解析，看看換算步驟。';updateScore();
}
function updateScore(){const checked=results.filter(v=>v!==null).length,correct=results.filter(v=>v===true).length;$('score').textContent=checked?`已檢查 ${checked} / 6 題 · 答對 ${correct} 題${correct===6?'，全部答對了！':''}`:'準備好了嗎？從第 1 題開始吧！';}
$('check-all').onclick=()=>questions.forEach((_,i)=>grade(i));
$('new-set').onclick=()=>newSet();
newSet();
