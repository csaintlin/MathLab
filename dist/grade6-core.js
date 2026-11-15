export const gcd=(a,b)=>b?gcd(b,a%b):a;
export const lcm=(a,b)=>a*b/gcd(a,b);
export const fraction=(a,b)=>a%b===0?String(a/b):a/gcd(a,b)+'/'+b/gcd(a,b);
export const circle=(r,angle=360)=>({area:3.14*r*r*angle/360,arc:6.28*r*angle/360,edge:6.28*r*angle/360+(angle===360?0:2*r)});
export const decimal=n=>Number(n.toFixed(2));
export const svg=(art,w=360,h=190)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="數學示意圖">${art}</svg>`;
export const colors=['#a6443a','#286b91'];
export const strip=(n,count,y,color)=>Array.from({length:n},(_,i)=>`<rect x="${20+i*300/n}" y="${y}" width="${300/n}" height="24" fill="${i<count?color:'#fff'}" stroke="#285d48"/>`).join('');
export const label=(x,y,t)=>`<text x="${x}" y="${y}" fill="#285d48" font-size="12" text-anchor="middle">${t}</text>`;
export function wedge(r,angle){
 if(angle===360)return `M0 0 L${r} 0 A${r} ${r} 0 0 1 ${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`;
 const t=angle*Math.PI/180;
 return `M0 0 L${r} 0 A${r} ${r} 0 ${angle>180?1:0} 1 ${r*Math.cos(t)} ${r*Math.sin(t)} Z`;
}
