'use strict';
/*
  Standalone validation fixture for the three first 6x6 Easy profiles.
  It deliberately does NOT touch index.html. The fixture mirrors the existing
  engine invariants: one person per row/column, victim shares a room with
  exactly one other person, max two clues, exactly one complete solution,
  and a forced deduction chain with no guessing.

  In the live engine, fixture type `cell` maps to an `onObject` clue whose
  object occurs once at that cell. It is kept as `cell` here to make the
  validation fixture independent of rendering/object decoration.
*/
const N=6;
const people=['A','B','C','D','E','F'];
const victim='F';
const regionOf=Array.from({length:N},(_,r)=>
  Array.from({length:N},(_,c)=>(Math.floor(r/2)*2+Math.floor(c/3)))
);
const solution=Object.fromEntries(people.map((p,i)=>[p,{r:i,c:i}]));

const profiles=[
  {id:'easy-1',minRelational:0,clues:{
    A:[['cell',0,0]],B:[['cell',1,1]],C:[['cell',2,2]],
    D:[['cell',3,3]],E:[['cell',4,4]],F:[['victim']]
  }},
  {id:'easy-2',minRelational:0,clues:{
    A:[['cell',0,0]],B:[['cell',1,1]],C:[['cell',2,2]],D:[['cell',3,3]],
    E:[['row',4],['column',4]],F:[['victim']]
  }},
  {id:'easy-3',minRelational:1,clues:{
    A:[['cell',0,0]],B:[['cell',1,1]],C:[['cell',2,2]],
    D:[['southOfPerson','C'],['westOfPerson','E']],E:[['cell',4,4]],F:[['victim']]
  }}
];

const room=x=>regionOf[x.r][x.c];
function clueSatisfied(x,cl,a,partial=false){
  const t=cl[0];
  if(t==='victim')return true;
  if(t==='cell')return x.r===cl[1]&&x.c===cl[2];
  if(t==='row')return x.r===cl[1];
  if(t==='column')return x.c===cl[1];
  const ref=cl[1];
  if(!a[ref])return partial;
  const y=a[ref];
  if(t==='southOfPerson')return x.r>y.r;
  if(t==='northOfPerson')return x.r<y.r;
  if(t==='westOfPerson')return x.c<y.c;
  if(t==='eastOfPerson')return x.c>y.c;
  return true;
}
function victimRule(a){
  const vr=room(a[victim]);
  return people.filter(p=>room(a[p])===vr).length===2;
}
function fullValid(P,a){
  if(new Set(people.map(p=>a[p].r)).size!==N)return false;
  if(new Set(people.map(p=>a[p].c)).size!==N)return false;
  for(const p of people)for(const cl of P.clues[p]||[])
    if(!clueSatisfied(a[p],cl,a,false))return false;
  return victimRule(a);
}
function countSolutions(P,cap=2,fixed={}){
  let n=0;
  const a={...fixed};
  const ur=new Set(Object.values(fixed).map(x=>x.r));
  const uc=new Set(Object.values(fixed).map(x=>x.c));
  function rec(left){
    if(n>=cap)return;
    if(!left.length){if(fullValid(P,a))n++;return;}
    let best=null,opts=null;
    for(const p of left){
      const q=[];
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){
        if(ur.has(r)||uc.has(c))continue;
        const x={r,c};
        if((P.clues[p]||[]).every(cl=>clueSatisfied(x,cl,a,true)))q.push(x);
      }
      if(opts===null||q.length<opts.length){best=p;opts=q;}
    }
    if(!opts?.length)return;
    for(const x of opts){
      a[best]=x;ur.add(x.r);uc.add(x.c);
      rec(left.filter(p=>p!==best));
      ur.delete(x.r);uc.delete(x.c);delete a[best];
      if(n>=cap)return;
    }
  }
  rec(people.filter(p=>!a[p]));
  return n;
}
function strictHumanSolve(P){
  const remaining=new Set(people.filter(p=>p!==victim));
  const usedR=new Set(),usedC=new Set(),placed={},trace=[];
  while(remaining.size){
    let forced=[];
    for(const p of remaining){
      const opts=[];
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){
        if(usedR.has(r)||usedC.has(c))continue;
        const x={r,c};
        if((P.clues[p]||[]).every(cl=>clueSatisfied(x,cl,placed,true)))opts.push(x);
      }
      if(opts.length===1)forced.push({p,x:opts[0],reason:'direct'});
    }
    if(!forced.length){
      for(const p of remaining){
        const supported=[];
        for(let r=0;r<N;r++)for(let c=0;c<N;c++){
          if(usedR.has(r)||usedC.has(c))continue;
          const x={r,c};
          if(!(P.clues[p]||[]).every(cl=>clueSatisfied(x,cl,placed,true)))continue;
          if(countSolutions(P,1,{...placed,[p]:x})>0)supported.push(x);
        }
        if(supported.length===1)forced.push({p,x:supported[0],reason:'relational/global'});
      }
    }
    if(!forced.length)return {ok:false,reason:'guessing required',trace};
    const z=forced[0],s=solution[z.p];
    if(z.x.r!==s.r||z.x.c!==s.c)return {ok:false,reason:'wrong forced move',trace};
    placed[z.p]=z.x;usedR.add(z.x.r);usedC.add(z.x.c);remaining.delete(z.p);trace.push(z);
  }
  const rr=[0,1,2,3,4,5].filter(r=>!usedR.has(r));
  const cc=[0,1,2,3,4,5].filter(c=>!usedC.has(c));
  placed[victim]={r:rr[0],c:cc[0]};
  trace.push({p:victim,x:placed[victim],reason:'final remaining cell'});
  return {ok:fullValid(P,placed),trace};
}

for(const P of profiles){
  for(const p of people){
    if(p!==victim&&(P.clues[p]||[]).length>2)throw Error(`${P.id}: >2 clues for ${p}`);
  }
  const solutions=countSolutions(P,2);
  const human=strictHumanSolve(P);
  const relational=human.trace.filter(x=>x.reason==='relational/global').length;
  if(solutions!==1||!human.ok||relational<P.minRelational)
    throw Error(`${P.id} failed: solutions=${solutions}, human=${human.ok}, relational=${relational}`);
  console.log(`${P.id}: PASS | 6x6 | solutions=${solutions} | forced=${human.trace.length} | relational/global=${relational}`);
  console.log(human.trace.map((x,i)=>`${i+1}.${x.p}=R${x.x.r+1}C${x.x.c+1}[${x.reason}]`).join(' -> '));
}
