'use strict';
const E=require('../engine/easy-6x6-profiles.js');
const profiles=['easy-1','easy-2','easy-3'],TARGET=25;
const REL=['besidePerson','westOfPerson','eastOfPerson','northOfPerson','southOfPerson','notWithPerson','aloneWithPerson','alone','aloneInRooms','onlyOnObject'];
function clueCounts(P,out){for(const p of E.BASE)for(const c of(P.clues[p]||[]))out[c.type]=(out[c.type]||0)+1}
function victimOK(P){const f=P.solution.F,r=P.regionOf[f.r][f.c];return E.PEOPLE.filter(p=>{const x=P.solution[p];return P.regionOf[x.r][x.c]===r}).length===2}
function one(P){const V=E.validate(P),on=E.BASE.flatMap(p=>P.clues[p]||[]).filter(c=>c.type==='onObject').length;return V.ok&&V.solutions===1&&V.human?.ok&&V.human.searchCalls===0&&E.PEOPLE.every(p=>(P.clues[p]||[]).length<=2)&&on<=2&&victimOK(P)&&!(P.globalRules||[]).length}
function median(a){a=[...a].sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:null}
let all={};E.resetSearchCallCount();
for(const profile of profiles){let accepted=[],families={},tries=[],failed=0,onTotal=0,relationalDeductions=0,relationalAccepted=Object.fromEntries(REL.map(x=>[x,0]));for(let i=0;i<TARGET;i++){let P=E.generate(profile,5000);if(!P){failed++;continue}if(!one(P))throw Error(profile+' produced invalid accepted puzzle');accepted.push(P);tries.push(P.generationAttempts);clueCounts(P,families);let types=new Set(E.BASE.flatMap(p=>P.clues[p]||[]).map(c=>c.type));onTotal+=E.BASE.flatMap(p=>P.clues[p]||[]).filter(c=>c.type==='onObject').length;for(const t of REL)if(types.has(t))relationalAccepted[t]++;relationalDeductions+=P.validation.metrics.relationalDeductions}
 const examples=accepted.slice(0,profile==='easy-3'?5:3).map(P=>Object.fromEntries(E.BASE.map(p=>[p,(P.clues[p]||[]).map(c=>c.text)])));
 all[profile]={requested:TARGET,accepted:accepted.length,failed,passRate:accepted.length/TARGET,averageGenerationAttempts:tries.length?tries.reduce((a,b)=>a+b,0)/tries.length:null,medianAttempts:median(tries),maximumAttempts:tries.length?Math.max(...tries):null,averageOnObjectPerPuzzle:accepted.length?onTotal/accepted.length:null,clueFamilies:families,acceptedPuzzlesContainingRelationalFamily:relationalAccepted,actualRelationalDeductions:relationalDeductions,humanSolverSearchCalls:accepted.reduce((n,P)=>n+P.validation.human.searchCalls,0),examples};}
all.totalCountSolutionsCalls=E.getSearchCallCount();console.log(JSON.stringify(all,null,2));if(profiles.some(p=>all[p].accepted!==TARGET))process.exit(1);
