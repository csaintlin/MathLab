const $=id=>document.getElementById(id);
let perBag=5,bagCount=1;
const cells=Array.from({length:100},(_,i)=>{const cell=document.createElement('div');cell.className='board-cell';cell.dataset.number=i+1;cell.setAttribute('aria-hidden','true');cell.innerHTML=`<span class="cell-number">${i+1}</span>`;$('board').appendChild(cell);return cell;});
function render(message){
 const total=perBag*bagCount;
 document.querySelectorAll('[data-factor]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.factor===perBag)));
 $('bag-count').textContent=bagCount;$('bag-badge').textContent=`每袋 ${perBag} 塊`;$('total-badge').textContent=`共 ${total} 塊`;
 $('bag-description').textContent=`${bagCount} 袋，每袋都有 ${perBag} 塊餅乾。`;
 // Preserve existing bags so adding one bag does not animate every bag again.
 const bags=$('bags');bags.classList.toggle('many',bagCount>=5);
 while(bags.children.length>bagCount)bags.lastElementChild.remove();
 for(let i=0;i<bagCount;i++){
  let bag=bags.children[i];if(!bag){bag=document.createElement('div');bag.className=`bag ${i%2?'odd':''}`;bags.appendChild(bag);}
  bag.setAttribute('role','img');bag.setAttribute('aria-label',`第 ${i+1} 袋，${perBag} 塊餅乾`);
  if(bag.dataset.amount!==String(perBag)){bag.dataset.amount=perBag;bag.innerHTML=`<svg class="bag-paper" viewBox="0 0 150 174" preserveAspectRatio="none" aria-hidden="true"><path d="M20 15 L27 20 L34 15 L41 20 L48 15 L55 20 L62 15 L69 20 L76 15 L83 20 L90 15 L97 20 L104 15 L111 20 L118 15 L130 20 L139 152 Q139 164 126 164 L24 164 Q11 164 11 152 Z"/><path d="M21 29 L130 29 M25 153 L125 153" fill="none" stroke="#d3c09a" stroke-dasharray="3 3"/></svg><span class="bag-label">每袋 ${perBag} 塊</span><div class="bag-cookies" aria-hidden="true">${Array.from({length:perBag},()=>'<span class="bag-cookie cookie"></span>').join('')}</div><span class="bag-number">第 ${i+1} 袋</span>`;}
 }
 const endpoints=[];
 cells.forEach((cell,i)=>{const number=i+1,filled=number<=total,endpoint=filled&&number%perBag===0,group=Math.floor(i/perBag);cell.className=`board-cell${filled?' filled':''}${filled&&group%2?' odd':''}${endpoint?' endpoint':''}`;
  const cookie=cell.querySelector('.cookie');if(filled&&!cookie){const item=document.createElement('span');item.className='cookie';cell.appendChild(item);}else if(!filled&&cookie)cookie.remove();
  if(endpoint)endpoints.push(number);
 });
 $('board').setAttribute('aria-label',`10乘10百格棋盤，每列10格。第1到${total}格有餅乾；第${endpoints.join('、')}格高光，分別是每袋的終點。`);
 $('group-sentence').textContent=`${perBag} 的 ${bagCount} 倍就是 ${total}`;
 $('group-equation').textContent=`${perBag} × ${bagCount} = ${total}`;
 $('skip-count').textContent=endpoints.join(' → ');
 $('factor-value').textContent=perBag;$('times-value').textContent=bagCount;$('product-value').textContent=total;
 $('addition-equation').textContent=Array(bagCount).fill(perBag).join(' ＋ ')+` ＝ ${total}`;
 $('add-bag').disabled=bagCount===10;$('remove-bag').disabled=bagCount===1;
 $('limit-note').textContent=bagCount===10?'已經有 10 袋了，可以減一袋。':bagCount===1?'現在是 1 袋，可以再加一袋。':'最少 1 袋，最多 10 袋。';
 $('change-message').textContent=message||`每袋 ${perBag} 塊，${bagCount} 袋共有 ${total} 塊。`;
}
document.querySelectorAll('[data-factor]').forEach(button=>button.onclick=()=>{perBag=+button.dataset.factor;bagCount=1;$('bags').replaceChildren();render(`每袋改成 ${perBag} 塊，從 1 袋開始，共有 ${perBag} 塊。`);});
$('add-bag').onclick=()=>{if(bagCount>=10)return;const before=perBag*bagCount;bagCount++;render(`加一袋，多 ${perBag} 塊：${before} ＋ ${perBag} ＝ ${perBag*bagCount}。現在有 ${bagCount} 袋。`);};
$('remove-bag').onclick=()=>{if(bagCount<=1)return;const before=perBag*bagCount;bagCount--;render(`減一袋，少 ${perBag} 塊：${before} − ${perBag} ＝ ${perBag*bagCount}。現在有 ${bagCount} 袋。`);};
$('reset').onclick=()=>{perBag=5;bagCount=1;$('bags').replaceChildren();render();};render();
