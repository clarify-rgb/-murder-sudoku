from pathlib import Path
p=Path('engine/easy-6x6-profiles.js')
s=p.read_text()
needle="function ownCandidates(P,p){let out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){let x={r,c};if(!blockedCell(P,x)&&clueList(P,p).every(cl=>unaryHolds(P,cl,x)))out.push(x)}return out}\n"
insert=needle+"function baseCandidates(P){let out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){let x={r,c};if(!blockedCell(P,x))out.push(x)}return out}function cluePairCoherence(P,p,clues=clueList(P,p)){if(clues.length!==2)return{ok:true,deadBranches:[]};let base=baseCandidates(P),dead=[];for(let i=0;i<2;i++){let multi=clues[i],other=clues[1-i];if(multi.type!=='aloneInRooms'||!Array.isArray(multi.rooms)||multi.rooms.length<2)continue;let afterOther=base.filter(x=>unaryHolds(P,other,x));for(const rid of multi.rooms)if(!afterOther.some(x=>room(P,x)===rid&&unaryHolds(P,multi,x)))dead.push({person:p,clueType:multi.type,room:rid,otherClueType:other.type})}return{ok:dead.length===0,deadBranches:dead}}function validateCluePairs(P){let inspected=0,dead=[];for(const p of PEOPLE){let cs=clueList(P,p);if(cs.length===2){inspected++;let q=cluePairCoherence(P,p,cs);dead.push(...q.deadBranches)}}return{ok:dead.length===0,inspected,deadBranches:dead}}\n"
if 'function cluePairCoherence(' not in s:
    if needle not in s: raise SystemExit('ownCandidates anchor missing')
    s=s.replace(needle,insert,1)
old="if(P.people.some(p=>clueList(P,p).length>2))return{ok:false,reason:'too many clues'};let on="
new="if(P.people.some(p=>clueList(P,p).length>2))return{ok:false,reason:'too many clues'};let coherence=validateCluePairs(P);if(!coherence.ok)return{ok:false,reason:'dead clue branch',cluePairCoherence:coherence};let on="
if old in s:s=s.replace(old,new,1)
elif "reason:'dead clue branch'" not in s: raise SystemExit('validate anchor missing')
oldexp='validateObjects,blockedCell};'
newexp='validateObjects,blockedCell,baseCandidates,cluePairCoherence,validateCluePairs};'
if oldexp in s:s=s.replace(oldexp,newexp,1)
elif 'validateCluePairs};' not in s: raise SystemExit('export anchor missing')
p.write_text(s)
