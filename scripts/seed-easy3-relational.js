const fs=require('fs');
const path='engine/easy-6x6-profiles.js';
let s=fs.readFileSync(path,'utf8');
const start=s.indexOf('function buildCandidate(profileId){');
const end=s.indexOf('\nfunction metrics(P,h){',start);
if(start<0||end<0)throw new Error('buildCandidate block not found');
if(s.slice(start,end).includes('easy3RelationalSeed'))process.exit(0);
const replacement=`function buildCandidate(profileId){if(!PROFILES[profileId])return null;let R=regionGrid(),solution=makeSolution(R);if(!solution)return null;let P={profile:profileId,people:[...PEOPLE],victim:VICTIM,regionOf:R,roomNames:['Library','Study','Gallery','Foyer','Archive','Lounge'],solution,objects:[],clues:{},globalRules:[]};makeObjects(P);let order=shuffle(BASE),onCount=0,easy3RelationalSeed=null;
if(profileId==='easy-3'){
  const personRelational=new Set(['besidePerson','westOfPerson','eastOfPerson','northOfPerson','southOfPerson','notWithPerson','aloneWithPerson']);
  const viable=[];
  for(const p of BASE)for(const c of factPool(P,p))if(personRelational.has(c.type)&&c.person&&c.person!==VICTIM)viable.push({p,c});
  if(viable.length){easy3RelationalSeed=shuffle(viable)[0];P.clues[easy3RelationalSeed.p]=[easy3RelationalSeed.c];order=shuffle(BASE.filter(p=>p!==easy3RelationalSeed.p));order.splice(1+rand(Math.max(1,order.length)),0,easy3RelationalSeed.p)}
}
for(let i=0;i<order.length;i++){let p=order[i],seeded=P.clues[p]||[],pool=shuffle(factPool(P,p)).filter(c=>(c.type!=='onObject'||onCount<2)&&!seeded.some(x=>x.type===c.type&&x.person===c.person&&x.object===c.object)),chosen=null,target=i===0?1:(profileId==='easy-1'?2+rand(3):3+rand(5));
  const tryOne=c=>{let clues=[...seeded,c];if(clues.length>2)return false;let test={...P,clues:{...P.clues,[p]:clues}},n=ownCandidates(test,p).length;if(i===0?n===1:n>=2&&n<=target){chosen=clues;return true}return false};
  if(seeded.length){for(const c of pool){if(tryOne(c))break}}else{for(const c of pool){let test={...P,clues:{...P.clues,[p]:[c]}},n=ownCandidates(test,p).length;if(i===0?n===1:n>=2&&n<=target){chosen=[c];break}}if(!chosen){for(let z=0;z<pool.length&&!chosen;z++)for(let j=z+1;j<pool.length;j++){if(pool[z].type==='onObject'&&pool[j].type==='onObject')continue;let test={...P,clues:{...P.clues,[p]:[pool[z],pool[j]]}},n=ownCandidates(test,p).length;if(i===0?n===1:n>=2&&n<=target){chosen=[pool[z],pool[j]];break}}}}
  if(!chosen)return null;P.clues[p]=chosen;onCount+=chosen.filter(c=>c.type==='onObject').length}
P.clues.F=[{type:'victim',text:'Victim. Was alone with the culprit.'}];let vr=room(P,solution.F);P.culprit=PEOPLE.find(p=>p!=='F'&&room(P,solution[p])===vr);return P}`;
s=s.slice(0,start)+replacement+s.slice(end);
fs.writeFileSync(path,s);
