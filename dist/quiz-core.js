// Small denominators keep the arithmetic suitable for fifth grade.
export const denominators = Array.from({length:11},(_,i)=>i+2).filter(d=>360%d===0);
export const gcd=(a,b)=>b?gcd(b,a%b):a;
export function reduced(n,d){const g=gcd(n,d);return [n/g,d/g];}
const randomInt=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
const choose=items=>items[randomInt(0,items.length-1)];
export function generateQuestions(){
  const questions=[],used=new Set();
  for(const type of ['angle','angle','ratio','ratio','triple-angle','triple-ratio']){
    let q,key;
    do {
      const d=choose(denominators.filter(d=>!type.startsWith('triple')||d>=3));
      const n=randomInt(1,type.startsWith('triple')?d-2:d-1);
      const b=type.startsWith('triple')?randomInt(1,d-n-1):0;
      q={type,d,n,b,c:d-n-b,angle:n*(360/d)};
      key=`${type.startsWith('triple')?'triple':type}:${reduced(n,d).join('/')}:${b?reduced(b,d).join('/'):''}`;
    }while(used.has(key));
    used.add(key);questions.push(q);
  }
  return questions;
}
export function answerFor(q){return q.type==='angle'?[q.n,q.d]:q.type==='ratio'?[q.angle,1]:q.type==='triple-angle'?[q.c*(360/q.d),1]:[q.c,q.d];}
export function checkAnswer(q,n,d=1){const [a,b]=answerFor(q);return Number.isSafeInteger(n)&&Number.isSafeInteger(d)&&n>=0&&d>0&&n*b===a*d;}
