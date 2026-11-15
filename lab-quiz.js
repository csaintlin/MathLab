import {grade6Generators} from './grade6-quiz.js';
import {numberQuizGenerators} from './number-quiz.js';
import {generators} from './lab-quiz-core.js';
import {grade3Generators} from './grade3-quiz.js';

import {grade4Generators} from './grade4-quiz.js';
import {clamp} from './grade4-core.js';

const questionsElement = document.getElementById('questions');
const score = document.getElementById('score');
const quiz = document.body.dataset.quiz;
const generate = generators[quiz] ?? grade3Generators[quiz] ?? grade4Generators[quiz] ?? numberQuizGenerators[quiz] ?? grade6Generators[quiz];
const grade4 = Boolean(grade4Generators[quiz]);
const selections = new WeakMap();
let questions = [];
let results = [];
let submitted = false;

function diagram(content) {
  return `<div class="question-visual lab-quiz-visual">${content}</div>`;
}

function inputMarkup(q,index) {
  const name = `answer-${index}`;
  if (q.options) return `<fieldset class="choice-list"><legend>選擇你的答案</legend>${q.options.map((option,i)=>
    `<label><input type="radio" name="${name}" value="${i}"><span>${option}</span></label>`).join('')}</fieldset>`;
  if (q.interaction?.type==='position') return diagram(q.interaction.draw(q.interaction.start))
    + `<div class="grade3-control-buttons">${q.interaction.buttons.map(([key,delta,label])=>
      `<button type="button" data-axis="${key}" data-delta="${delta}">${label}</button>`).join('')}</div>`;
  if (q.interaction?.type==='range') return rangeMarkup(q.interaction);
  if (q.interaction?.type==='tiles') return diagram(q.interaction.draw(new Set()));
  if (q.fields) return `<div class="grade3-answer-fields">${q.fields.map(label =>
    `<label>${label} <input type="text" inputmode="numeric" autocomplete="off"></label>`).join('')}</div>`;
  const unit=q.unit ?? '';
  return `<div class="answer-row"><label for="${name}">答案</label><input id="${name}" type="text" inputmode="${(unit==='平方公分'||q.decimal)?'decimal':'numeric'}" autocomplete="off"><span>${unit}</span></div>`;
}

function rangeMarkup(config) {
  if (config.buttons) {
    return `${diagram(config.draw(config.start))}
      <input type="range" hidden min="${config.min}" max="${config.max}" step="${config.step}" value="${config.start}">
      <div class="grade3-control-buttons">${config.buttons.map((label,i)=>
        `<button type="button" data-range-delta="${i===0?-1:1}">${label}</button>`).join('')}</div>`;
  }
  return `${diagram(config.draw(config.start))}<label class="quiz-range">${config.label}<input type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.start}"></label>`;
}

function buildSet() {
  questions=generate();
  results=questions.map(()=>null);
  submitted=false;
  questionsElement.innerHTML=questions.map((q,i)=>`<article class="question">
    <div class="question-top"><span class="question-number">0${i+1}</span><span class="question-kind">${q.kind}</span></div>
    <h2>第 ${i+1} 題</h2><p class="question-prompt">${q.prompt}</p>
    ${q.diagram?diagram(q.diagram):''}
    <form novalidate>${q.view?rangeMarkup(q.view):''}${inputMarkup(q,i)}
      <button class="check-answer" type="submit" hidden>檢查答案</button>
      <p class="feedback" role="status"></p>
    </form>
    ${grade4?`<div class="grade3-control-buttons grade4-quiz-actions"><button type="button" data-check>檢查這題</button><button type="button" data-reset>重做</button><button type="button" data-renew>換一題</button></div>`:''}
    <details class="solution" hidden><summary>查看解題說明</summary><div>${q.solution}</div></details>
  </article>`).join('');
  questions.forEach(bindQuestion);
  updateScore();
}

function bindQuestion(q,index) {
  const card=questionsElement.children[index];
  const form=card.querySelector('form');
  if(grade4){
    card.querySelector('[data-check]').onclick=()=>showResult(index);
    for(const action of ['reset','renew'])card.querySelector('[data-'+action+']').onclick=()=>{
      if(action==='renew'){
        const signature=q=>[q.prompt,q.diagram,q.interaction?.draw(q.interaction.type==='tiles'?new Set():q.interaction.start)].join('|');
        const previous=signature(questions[index]);
        do { questions[index]=generate()[index]; } while(signature(questions[index])===previous);
      }
      const fresh=card.cloneNode(true);
      const replacement=questions[index];
      fresh.querySelector('h2 + p').innerHTML=replacement.prompt;
      const oldVisual=fresh.querySelector(':scope > .question-visual');
      oldVisual?.remove();
      const nextForm=fresh.querySelector('form');
      if(replacement.diagram)nextForm.insertAdjacentHTML('beforebegin',diagram(replacement.diagram));
      nextForm.innerHTML=inputMarkup(replacement,index)+'<p class="feedback" role="status"></p>';
      const solution=fresh.querySelector('.solution');
      solution.hidden=true;solution.open=false;solution.querySelector('div').innerHTML=replacement.solution;
      card.replaceWith(fresh);clearResult(index);bindQuestion(replacement,index);
      fresh.querySelector('[data-'+action+']').focus();
    };
  }
  form.onsubmit=event=>{
    event.preventDefault();
    if (grade4) showResult(index);
    else if (submitted) grade(index);
  };
  const range=form.querySelector('input[type="range"]');
  const config=q.view ?? q.interaction;
  if (range) range.addEventListener('input',()=>{
    form.querySelector('.lab-quiz-visual').innerHTML=config.draw(Number(range.value));
    if (q.interaction) range.dataset.touched='true';
  });
  if (config?.buttons) form.querySelectorAll('[data-range-delta]').forEach(button => {
    button.onclick=()=>{
      range.value=Number(range.value)+Number(button.dataset.rangeDelta)*config.step;
      range.dispatchEvent(new Event('input',{bubbles:true}));
    };
  });
  if(config?.type==='position'){
    const value={...config.start};
    selections.set(form,value);
    const surface=form.querySelector('.lab-quiz-visual');
    const redraw=()=>{surface.innerHTML=config.draw(value);clearResult(index);};
    let drag;
    function point(event){
      return new DOMPoint(event.clientX,event.clientY).matrixTransform(surface.querySelector('svg').getScreenCTM().inverse());
    }
    surface.classList.add('quiz-draggable');
    surface.onpointerdown=event=>{
      if(drag||event.button!==0||!event.target.closest('[data-tool]'))return;
      const p=point(event);
      drag={id:event.pointerId,dx:p.x-value.x,dy:p.y-value.y};
      surface.setPointerCapture(event.pointerId);
    };
    surface.onpointermove=event=>{
      if(drag?.id!==event.pointerId)return;
      const p=point(event);
      value.x=clamp(Math.round(p.x-drag.dx),...config.bounds[0]);
      value.y=clamp(Math.round(p.y-drag.dy),...config.bounds[1]);redraw();
    };
    for(const name of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(name,event=>{
      if(drag?.id===event.pointerId)drag=null;
    });
    form.querySelectorAll('[data-axis]').forEach(button=>button.onclick=()=>{
      const key=button.dataset.axis;
      value[key]=clamp(value[key]+Number(button.dataset.delta),...config.bounds[['x','y','rotation'].indexOf(key)]);
      redraw();
    });
  }
  if (config?.type==='tiles') {
    const selected=new Set();
    selections.set(form,selected);
    form.onclick=event=>{
      const button=event.target.closest('[data-tile]');
      if (!button) return;
      const tile=Number(button.dataset.tile);
      const active=selected.has(tile);
      if (config.single) selected.clear();
      if (active) selected.delete(tile);
      else selected.add(tile);
      form.querySelectorAll('[data-tile]').forEach(item=>
        item.setAttribute('aria-pressed',String(selected.has(Number(item.dataset.tile)))));
      clearResult(index);
    };
  }
  if (config?.fromX || config?.fromPoint) bindDrag(form.querySelector('.lab-quiz-visual'),range,config);
  form.oninput=event=>{
    if (event.target===range && q.view) return;
    clearResult(index);
  };
}

function bindDrag(surface,range,config) {
  let pointer = null;
  let dragOffset = 0;
  surface.classList.add('quiz-draggable');
  function move(event, initial = false) {
    const matrix=surface.querySelector('svg').getScreenCTM();
    if (!matrix) return;
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    const value=config.fromPoint ? config.fromPoint(point.x,point.y) : config.fromX(point.x);
    if (initial && config.dragHandle) dragOffset=value-Number(range.value);
    const snapped=config.min+Math.round((value-dragOffset-config.min)/config.step)*config.step;
    range.value=Math.max(config.min,Math.min(config.max,snapped));
    range.dispatchEvent(new Event('input',{bubbles:true}));
  }
  surface.onpointerdown=event=>{
    if (pointer!==null || event.button!==0 || (config.dragHandle && !event.target.closest(config.dragHandle))) return;
    pointer=event.pointerId;
    surface.setPointerCapture(pointer);
    move(event, true);
  };
  surface.onpointermove=event=>{
    if (event.pointerId===pointer) move(event);
  };
  for (const type of ['pointerup','pointercancel','lostpointercapture']) {
    surface.addEventListener(type,event=>{
      if (event.pointerId===pointer) pointer=null;
    });
  }
}

function clearResult(index) {
  results[index]=null;
  const card=questionsElement.children[index];
  card.classList.remove('correct','incorrect');
  card.querySelector('.feedback').textContent='';
  updateScore();
}

function grade(index) {
  const q=questions[index];
  const card=questionsElement.children[index];
  const form=card.querySelector('form');
  const feedback=card.querySelector('.feedback');
  let answer;
  let expected=q.answer;
  let missing='';
  if (q.options) {
    const selected=form.querySelector('input:checked');
    if (selected) answer=q.options[Number(selected.value)];
    else missing='請先選擇一個答案。';
  } else if (q.interaction?.type==='position') {
    answer=q.interaction.validate(selections.get(form));
    expected=true;
  } else if (q.interaction?.type==='range') {
    const range=form.querySelector('input');
    if (!range.dataset.touched) missing=q.interaction.buttons?'請先拖曳或按按鈕調整。':'請先移動滑桿。';
    answer=Number(range.value);
    expected=q.interaction.answer;
    if(q.interaction.validate){answer=q.interaction.validate(answer);expected=true;}
  } else if (q.interaction?.type==='tiles') {
    const selected=selections.get(form);
    if (!selected.size) missing='請先在圖上點選。';
    answer=q.interaction.validate?q.interaction.validate(selected):q.interaction.single?[...selected][0]:selected.size;
    expected=q.interaction.answer;
  } else if (q.fields) {
    const values=[...form.querySelectorAll('input')].map(input=>input.value.trim().normalize('NFKC'));
    if (values.some(value=>!/^\d+$/.test(value))) missing='請在每一欄填入整數。';
    answer=values.every((value,i)=>Number(value)===expected[i]);
    expected=true;
  } else {
    const raw=form.querySelector('input').value.trim().normalize('NFKC');
    if (!(q.integer ? /^\d+$/ : /^\d+(?:\.\d+)?$/).test(raw)) missing=q.integer?'請填入整數。':'請填入數字。';
    answer=Number(raw);

  }
  clearResult(index);
  if (missing) {
    feedback.textContent=missing;
    return;
  }
  const correct=answer===expected;
  results[index]=correct;
  card.classList.add(correct?'correct':'incorrect');
  feedback.textContent=correct?'✓ 答對了！':grade4?'再試一次。'+q.solution:'再想一想，可以查看下方解題說明。';
  updateScore();
}

function updateScore() {
  const checked=results.filter(value=>value!==null).length;
  const correct=results.filter(value=>value===true).length;
  score.textContent=checked?`已檢查 ${checked} / ${questions.length} 題 · 答對 ${correct} 題${correct===questions.length?'，全部答對了！':''}`:'準備好了嗎？從第 1 題開始吧！';
}
function showResult(index){
  grade(index);
  const solution=questionsElement.children[index].querySelector('.solution');
  solution.hidden=results[index]===null;
  solution.open=!solution.hidden;
}
document.getElementById('new-set').onclick=buildSet;
document.getElementById('check-all').onclick=()=>{
  submitted=true;
  questions.forEach((_,index)=>{
    if(grade4){showResult(index);return;}
    grade(index);
    const card=questionsElement.children[index];
    const solution=card.querySelector('.solution');
    card.querySelector('.check-answer').hidden=false;
    solution.hidden=false;
    solution.open=true;
  });
};
buildSet();
