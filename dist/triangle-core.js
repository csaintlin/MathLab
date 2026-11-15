export const length=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function measure(points){
 const [a,b,c]=points;const cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 if(Math.min(length(a,b),length(a,c),length(b,c))<0.01||Math.abs(cross)<0.01)return null;
 return points.map((p,i)=>{const q=points[(i+1)%3],r=points[(i+2)%3];const ux=q.x-p.x,uy=q.y-p.y,vx=r.x-p.x,vy=r.y-p.y;return Math.atan2(Math.abs(ux*vy-uy*vx),ux*vx+uy*vy)*180/Math.PI;});
}
export function classifySides(values){const [a,b,c]=[...values].sort((x,y)=>x-y);return {a,b,c,valid:a+b>c,equal:a+b===c,gap:c-a-b};}
export function makeStrips(){
 let values,types;
 do{values=Array.from({length:26},(_,i)=>i+5);for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}values=values.slice(0,5);types=[];for(let i=0;i<3;i++)for(let j=i+1;j<4;j++)for(let k=j+1;k<5;k++)types.push(classifySides([values[i],values[j],values[k]]).valid);}while(!types.includes(true)||!types.includes(false));
 return values;
}
