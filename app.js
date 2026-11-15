const $=id=>document.getElementById(id);
let mode='angle', angle=70,numerator=1,denominator=3,distance=0;
let pieceCount=2, extraAngles=[], extraNumerators=[];
const palette=[['#87b99b','#317255','#164e39'],['#f3d68b','#b08a36','#866226'],['#9ec5df','#46799d','#295878'],['#d6b2d6','#996899','#754575']];
function values(){const total=mode==='angle'?360:denominator;const items=[mode==='angle'?angle:numerator,...(mode==='angle'?extraAngles:extraNumerators)];return [...items,total-items.reduce((a,b)=>a+b,0)];}
function distribute(){const total=mode==='angle'?360:denominator;const first=mode==='angle'?angle:numerator;const extras=Array(pieceCount-2).fill(Math.floor((total-first)/(pieceCount-1)));if(mode==='angle')extraAngles=extras;else extraNumerators=extras;}
function editors(){const extras=mode==='angle'?extraAngles:extraNumerators;$('extra-controls').innerHTML=extras.map((v,i)=>`<label class="extra-field">第 ${i+2} 個扇形${mode==='angle'?'的角度':'的分子'}<span><input type="number" min="0" max="${mode==='angle'?360:denominator}" step="1" value="${v}" data-extra="${i}" aria-label="第 ${i+2} 個扇形${mode==='angle'?'角度':'分子'}">${mode==='angle'?'°':`／ ${denominator}`}</span></label>`).join('');$('extra-controls').querySelectorAll('input').forEach(input=>input.oninput=()=>{const val=Number(input.value),i=+input.dataset.extra;const target=mode==='angle'?extraAngles:extraNumerators;const total=mode==='angle'?360:denominator;const sum=(mode==='angle'?angle:numerator)+target.reduce((s,v,j)=>s+(i===j?val:v),0);if(input.value===''||!Number.isInteger(val)||val<0||sum>total){$('error').textContent=`各扇形${mode==='angle'?'角度':'分子'}合計不能超過 ${total}，請填入非負整數。`;return;}target[i]=val;$('error').textContent='';render();});}
const fmt=n=>Number.isInteger(n)?String(n):String(Number(n.toFixed(2)));
const frac=(n,d)=>`<span class="fraction"><span>${n}</span><span>${d}</span></span>`;
const gcd=(a,b)=>b?gcd(b,a%b):a;
function conversion(n,d){
const divisor=gcd(n,d),rn=n/divisor,rd=d/divisor;
const degrees=360*n/d;
// Use an exact division expression when the angle has a recurring decimal.
const degreeDivisor=gcd(360*n,d),degreeN=360*n/degreeDivisor,degreeD=d/degreeDivisor;
let decimalD=degreeD;while(decimalD%2===0)decimalD/=2;while(decimalD%5===0)decimalD/=5;
const degreeText=decimalD===1?String(degrees):`(${degreeN} ÷ ${degreeD})`;
const circle=`${frac(rn,rd)}<span>圓</span>`;
const middle=frac(degreeText,360);
const angleText=`<span>${degreeText}°</span>`;
return mode==='angle'?`${angleText}<span>＝</span>${middle}<span>＝</span>${circle}`:`${circle}<span>＝</span>${middle}<span>＝</span>${angleText}`;
}
const point=(a,r=150)=>[380+r*Math.sin(a*Math.PI/180),235-r*Math.cos(a*Math.PI/180)];
function sector(start,sweep,r=150){if(sweep<=0)return '';if(sweep>=360)return `M 380 ${235-r} A ${r} ${r} 0 1 1 380 ${235+r} A ${r} ${r} 0 1 1 380 ${235-r} Z`;const a=point(start,r),b=point(start+sweep,r);return `M 380 235 L ${a.join(' ')} A ${r} ${r} 0 ${sweep>180?1:0} 1 ${b.join(' ')} Z`;}
function polarShift(a,dist){return [Math.sin(a*Math.PI/180)*dist,-Math.cos(a*Math.PI/180)*dist]}
function group(start,sweep,index,parts){const selected=index===0;const colors=palette[index];const offset=(sweep>0&&sweep<360)?polarShift(start+sweep/2,distance*.85):[0,0];let lines='';for(let i=0;i<parts;i++){const a=i*360/parts;if(a>=start-1e-8&&a<=start+sweep+1e-8){const p=point(a);lines+=`<line x1="380" y1="235" x2="${p[0]}" y2="${p[1]}"/>`;}}const end=point(start+sweep);lines+=`<line x1="380" y1="235" x2="${end[0]}" y2="${end[1]}"/>`;
let annotation='';if($('show-angle').checked&&sweep>0){const mid=point(start+sweep/2,92);if(sweep<360){annotation+=`<path d="${sector(start,sweep,35)}" fill="none" stroke="${selected?'#1c5b43':'#987431'}" stroke-width="1.3"/>`;}if(sweep>=15)annotation+=`<text x="${mid[0]}" y="${mid[1]+6}" text-anchor="middle" fill="${selected?'#164e39':'#866226'}" font-size="${sweep<30?15:22}" font-weight="700" stroke="${selected?'#8cbda0':'#f4d78e'}" stroke-width="4" paint-order="stroke">${fmt(sweep)}°</text>`;}
annotation=annotation.replaceAll(selected?'#164e39':'#866226',colors[2]).replaceAll(selected?'#8cbda0':'#f4d78e',colors[0]).replaceAll(selected?'#1c5b43':'#987431',colors[1]);
return `<g class="piece" id="piece-${index}" style="transform:translate(${offset[0]}px,${offset[1]}px)"><path d="${sector(start,sweep)}" fill="${colors[0]}" stroke="${colors[1]}" stroke-width="1.5"/>${$('show-grid').checked&&sweep>0?`<g stroke="${colors[1]}" stroke-width="${parts===360?.55:1.1}" opacity="${parts===360?.32:.55}">${lines}</g>`:''}${annotation}${sweep>0?`<circle cx="380" cy="235" r="3" fill="${colors[1]}"/>`:''}</g>`;}
function render(){const a=mode==='angle'?angle:360*numerator/denominator;const parts=mode==='angle'?360:denominator;const n=mode==='angle'?angle:numerator;const rest=parts-n;
// Keep the same SVG groups across updates so CSS can animate their movement.
const items=values();let start=0;const markup=items.map((v,i)=>{const sweep=v*360/parts;const html=group(start,sweep,i,parts);start+=sweep;return html;}).join('');const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${markup}</svg>`,'image/svg+xml');const diagram=$('diagram');for(const old of [...diagram.children]){if(![...doc.documentElement.children].some(node=>node.id===old.id))old.remove();}for(const node of [...doc.documentElement.children]){const old=document.getElementById(node.id);if(old){old.setAttribute('style',node.getAttribute('style'));old.innerHTML=node.innerHTML}else diagram.appendChild(document.importNode(node,true));}
diagram.setAttribute('aria-label',`${pieceCount} 個扇形：${items.map(v=>fmt(v*360/parts)+' 度').join('、')}；整圓平分為 ${parts} 份`);
$('division-badge').textContent=`整圓平分為 ${parts} 份`;$('diagram-note').textContent=mode==='angle'?'每一小格是 1°，360 小格合起來就是一個圓。':`每一小格是 1/${parts} 個圓，圓心角是 ${fmt(360/parts)}°。`;
const label=i=>pieceCount===2?(i===0?'取出的部分':'剩下的部分'):`第 ${i+1} 個扇形${i===pieceCount-1?'（剩下）':''}`;
$('legend').innerHTML=items.map((v,i)=>`<span><i style="background:${palette[i][0]}"></i>${label(i)}</span>`).join('');
document.querySelector('.results').innerHTML=items.map((v,i)=>`${i?'<span class="plus">＋</span>':''}<div class="result" style="background:${palette[i][0]}25;color:${palette[i][2]}"><div class="result-label"><i style="background:${palette[i][0]}"></i>${label(i)}</div><div class="result-value">${conversion(v,parts)}</div><div class="result-caption">${mode==='angle'?'圓心角 → 除以 360 → 所占比例':'所占比例 → 換成分母 360 → 圓心角'}</div></div>`).join('')+'<span class="equals">＝</span><div class="whole"><span>一個圓</span><strong>360°</strong><small>全部的 1</small></div>';
document.querySelector('.results').classList.toggle('multiple',pieceCount>2);
$('remainder-hint').textContent=`最後一個扇形：${mode==='angle'?fmt(items.at(-1))+'°':items.at(-1)+'/'+parts+' 圓'}（自動補滿）`;
$('equation').textContent=items.map(v=>mode==='angle'?`${v}° ÷ 360° ＝ ${v}/360`:`${v}/${parts} 個圓 × 360° ＝ ${fmt(v*360/parts)}°`).join('　｜　');
$('separate').querySelector('span').textContent=distance>0?'合回圓形':'分離扇形';$('distance').value=distance;
}
function setMode(next){mode=next;if((mode==='angle'?extraAngles:extraNumerators).length!==pieceCount-2){if(mode==='ratio'&&denominator<pieceCount){denominator=pieceCount;$('denominator').value=denominator;}distribute();}for(const m of ['angle','ratio']){$(`${m}-tab`).setAttribute('aria-selected',String(m===mode));$(`${m}-controls`).hidden=m!==mode;}$('error').textContent='';editors();render();}
$('piece-count').onchange=()=>{pieceCount=+$('piece-count').value;if(mode==='ratio'&&denominator<pieceCount){denominator=pieceCount;$('denominator').value=denominator;}distribute();setMode(mode);};
$('angle-tab').onclick=()=>setMode('angle');$('ratio-tab').onclick=()=>setMode('ratio');
$('angle').addEventListener('input',()=>{const val=$('angle').value;const a=Number(val);if(val===''||!Number.isInteger(a)||a<0||a>360){$('error').textContent='請填入 0 到 360 之間的整數角度。';return;}angle=a;if(a+extraAngles.reduce((s,v)=>s+v,0)>360){distribute();editors();}$('angle-slider').value=a;$('error').textContent='';render();});
$('angle-slider').oninput=e=>{angle=+e.target.value;$('angle').value=angle;if(angle+extraAngles.reduce((s,v)=>s+v,0)>360){distribute();editors();}$('error').textContent='';render()};
function updateRatio(){const n=Number($('numerator').value),d=Number($('denominator').value);if($('numerator').value===''||$('denominator').value===''||!Number.isInteger(n)||!Number.isInteger(d)||d<1||d>360||n<0||n>d){$('error').textContent='分母請填 1～360 的整數；分子請填 0 到分母之間的整數。';return;}numerator=n;denominator=d;if(n+extraNumerators.reduce((s,v)=>s+v,0)>d)distribute();editors();$('numerator').max=d;$('error').textContent='';render();}
$('numerator').oninput=updateRatio;$('denominator').oninput=updateRatio;
document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>{angle=+b.dataset.angle;$('angle').value=angle;$('angle-slider').value=angle;distribute();editors();$('error').textContent='';render()});
document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{[numerator,denominator]=b.dataset.ratio.split('/').map(Number);$('numerator').value=numerator;$('denominator').value=denominator;updateRatio()});
$('separate').onclick=()=>{distance=distance>0?0:80;render()};$('distance').oninput=e=>{distance=+e.target.value;render()};$('show-grid').onchange=render;$('show-angle').onchange=render;
$('reset').onclick=()=>{pieceCount=2;extraAngles=[];extraNumerators=[];$('piece-count').value=2;angle=70;numerator=1;denominator=3;distance=0;$('angle').value=70;$('angle-slider').value=70;$('numerator').value=1;$('numerator').max=3;$('denominator').value=3;$('show-grid').checked=true;$('show-angle').checked=true;setMode('angle')};
render();
