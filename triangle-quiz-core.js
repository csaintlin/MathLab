import {classifySides,makeStrips} from './triangle-core.js';
const int=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
export function sideExample(kind){
 let a,b,c;do{a=int(5,14);b=int(a,17);c=kind==='equal'?a+b:kind==='short'?int(a+b+1,30):int(b,a+b-1);}while(c>30);
 return [a,b,c];
}
export function generateTriangleQuiz(){
 const a=int(4,19)*5,b=int(3,Math.floor((170-a)/5))*5;
 const special=Math.random()<.5?'isosceles':'right',vertex=int(2,15)*10,acute=int(2,15)*5;
 const invalid=Math.random()<.5?'equal':'short';
 return [
 {type:'angle',angles:[a,b,180-a-b],unknown:[2],answer:180-a-b},
 special==='isosceles'?{type:'isosceles',angles:[(180-vertex)/2,(180-vertex)/2,vertex],unknown:[0,1],answer:(180-vertex)/2}:{type:'right',angles:[90,acute,90-acute],unknown:[2],answer:90-acute},
 {type:'sides',sides:sideExample('valid'),answer:true},
 {type:'sides',sides:sideExample(invalid),answer:false},
 {type:'strips',strips:makeStrips()},
 {type:'reason',sides:sideExample(invalid==='equal'?'short':'equal'),answer:'unchecked'}
 ];
}
export function gradeTriangleQuestion(q,answer){
 if(q.type==='strips')return Array.isArray(answer)&&answer.length===3&&new Set(answer).size===3&&answer.every(i=>Number.isInteger(i)&&i>=0&&i<5)&&classifySides(answer.map(i=>q.strips[i])).valid;
 if(['angle','right','isosceles'].includes(q.type))return typeof answer==='number'&&Number.isInteger(answer)&&answer>0&&answer<180&&answer===q.answer;
 return answer===q.answer;
}
