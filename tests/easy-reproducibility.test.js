'use strict';
// Reproducibility-only diagnostic test. No engine semantics are modified here.
const assert=require('assert');
const E=require('../engine/easy-6x6-profiles.js');
function seedHash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){let a=seedHash(seed);return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn()}finally{Math.random=old}}
function generateById(id,forcedProfile=null){return withSeed(id,()=>{const profile=forcedProfile||['easy-1','easy-2','easy-3'][Math.floor(Math.random()*3)];return{profile,puzzle:E.generate(profile,6000)}})}
function core(x){const P=x.puzzle;return JSON.stringify({profile:x.profile,regionOf:P.regionOf,roomNames:P.roomNames,objects:P.objects,clues:P.clues,solution:P.solution,culprit:P.culprit,generationAttempts:P.generationAttempts})}
for(const profile of ['easy-1','easy-2','easy-3']){
  const id='REPRO-'+profile.toUpperCase();
  const a=generateById(id,profile),b=generateById(id,profile);
  assert(a.puzzle,profile+' generated');assert(b.puzzle,profile+' regenerated');
  assert.strictEqual(core(a),core(b),profile+' same ID reproduces exact puzzle');
  assert.strictEqual(a.puzzle.validation.solutions,1,profile+' unique');
  assert.strictEqual(E.strictSolve(a.puzzle).ok,true,profile+' strictSolve passes');
}
const a=generateById('PUZZLE-A'),b=generateById('PUZZLE-A'),c=generateById('PUZZLE-B');
assert(a.puzzle&&b.puzzle&&c.puzzle,'generic IDs generate');
assert.strictEqual(core(a),core(b),'same generic ID exact reproduction');
assert.notStrictEqual(core(a),core(c),'different ID produces different puzzle');
console.log('PASS reproducibility: same ID reproduces profile, room matrix, objects, clues, solution and attempts; all Easy profiles generate uniquely without guessing.');