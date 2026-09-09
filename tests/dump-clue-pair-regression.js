'use strict';
const E=require('../engine/easy-6x6-profiles.js');
function seedHash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){let a=seedHash(seed);return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn()}finally{Math.random=old}}
const id='1HBGDQC';
const result=withSeed(id,()=>{const pr=['easy-1','easy-2','easy-3'][Math.floor(Math.random()*3)];return {pr,p:E.generate(pr,6000)}});
if(!result.p) throw Error('failed to reproduce '+id);
console.log(JSON.stringify({id,profile:result.pr,regionOf:result.p.regionOf,roomNames:result.p.roomNames,objects:result.p.objects,clues:result.p.clues,solution:result.p.solution,generationAttempts:result.p.generationAttempts},null,2));
