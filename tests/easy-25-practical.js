'use strict';
const E=require('../engine/easy-6x6-profiles.js');
const profiles=['easy-1','easy-2','easy-3'];
const TARGET=25;
function clueCounts(P,out){for(const p of E.BASE)for(const c of (P.clues[p]||[]))out[c.type]=(out[c.type]||0)+1}
function victimOK(P){const f=P.solution.F,r=P.regionOf[f.r][f.c];return E.PEOPLE.filter(p=>{const x=P.solution[p];return P.regionOf[x.r][x.c]===r}).length===2}
function one(P){const V=E.validate(P);const on=E.BASE.flatMap(p=>P.clues[p]||[]).filter(c=>c.type==='onObject').length;return V.ok&&V.solutions===1&&V.human&&V.human.ok&&V.human.searchCalls===0&&E.PEOPLE.every(p=>(P.clues[p]||[]).length<=2)&&on<=2&&victimOK(P)&&!(P.globalRules||[]).length}
let all={};
for(const profile of profiles){let accepted=[],families={},attempts=0,failed=0;for(let i=0;i<TARGET;i++){let P=E.generate(profile,5000);if(!P){failed++;continue}attempts+=P.generationAttempts;if(!one(P))throw Error(profile+' produced invalid accepted puzzle');accepted.push(P);clueCounts(P,families)}
 const examples=accepted.slice(0,3).map(P=>Object.fromEntries(E.BASE.map(p=>[p,(P.clues[p]||[]).map(c=>c.text)])));
 all[profile]={requested:TARGET,accepted:accepted.length,failed,passRate:accepted.length/TARGET,averageGenerationAttempts:accepted.length?attempts/accepted.length:null,clueFamilies:families,examples};
}
console.log(JSON.stringify(all,null,2));
if(profiles.some(p=>all[p].accepted!==TARGET))process.exit(1);
