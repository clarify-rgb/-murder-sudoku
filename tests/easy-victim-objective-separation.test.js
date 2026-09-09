'use strict';
const assert=require('assert');
const E=require('../engine/easy-6x6-profiles.js');
function seedHash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){let a=seedHash(seed);return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn()}finally{Math.random=old}}
function core(P){return JSON.stringify({profile:P.profile,victim:P.victim,objective:P.objective,regionOf:P.regionOf,roomNames:P.roomNames,objects:P.objects,clues:P.clues,solution:P.solution,generationAttempts:P.generationAttempts})}
let examples=[];
for(const profile of ['easy-1','easy-2','easy-3']){
  let attempts=[];
  for(let i=0;i<10;i++){
    let id=`SEP-${profile}-${i}`;
    let P=withSeed(id,()=>E.generate(profile,6000));
    assert(P,`${profile} ${i} generated`);
    assert.strictEqual(P.victim,'F');
    assert.deepStrictEqual(P.objective,{type:'locatePerson',person:'F'});
    assert(P.clues.F.length>=1&&P.clues.F.length<=2,'F has 1-2 normal clues');
    assert(!P.clues.F.some(c=>c.type==='victim'||/culprit/i.test(c.text||'')),'no automatic murder clue');
    assert(P.people.every(p=>(P.clues[p]||[]).length<=2),'max 2 clues including F');
    assert.strictEqual(P.validation.solutions,1,'unique without hidden victim-room constraint');
    E.resetSearchCallCount();let h=E.strictSolve(P);assert(h.ok);assert.strictEqual(h.searchCalls,0);
    assert(E.validateObjects(P),'object/locked geometry remains valid');
    let Q=withSeed(id,()=>E.generate(profile,6000));assert.strictEqual(core(P),core(Q),'seed reproduces exact puzzle');
    attempts.push(P.generationAttempts);
    if(examples.length<5)examples.push({id,profile,clues:P.clues.F.map(c=>c.text)});
  }
  console.log(`${profile}: 10/10, attempts ${attempts.join(', ')}, avg ${(attempts.reduce((a,b)=>a+b,0)/10).toFixed(1)}`);
}
console.log('F EXAMPLES '+JSON.stringify(examples));
