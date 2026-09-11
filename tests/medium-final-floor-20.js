'use strict';
const fs=require('fs');
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

function cellLabel(x){return `R${x.r+1}C${x.c+1}`}
function initialDomains(P){return Object.fromEntries(M.PEOPLE.map(p=>[p,M.ownCandidates(P,p).map(cellLabel)]))}
function structuralKey(e){if(e.reason==='intersecting-square-elimination')return `${e.reason}|${e.round||0}|${e.sourcePerson||''}|${(e.supports||[]).map(cellLabel).sort().join(',')}`;if(['row-ownership','column-ownership','multi-row-ownership','multi-column-ownership'].includes(e.reason))return `${e.reason}|${e.round||0}|${(e.owners||[]).slice().sort().join(',')}|${(e.values||[]).slice().sort((a,b)=>a-b).join(',')}`;return null}
function stats(P){const m=P.validation.metrics;return{puzzleId:P.puzzleId,generationAttempts:P.generationAttempts,selectionAttempts:P.selectionAttempts,solutionCount:P.validation.solutions,searchCalls:P.validation.human.searchCalls,initialCandidateCount:m.initialCandidates,advancedDeductionCount:m.advancedDeductionCount,materialAdvancedDeductions:m.materialAdvancedDeductions,ownershipCount:m.ownershipCount,intersectionCount:m.intersectionCount,relationalDeductionCount:m.relationalDeductions,dependencyDepth:m.dependencyDepth,multiPersonChainPeople:m.multiPersonChainPeople,chainParticipants:m.multiPersonChainParticipants,advancedDependentPlacements:m.advancedDependentPlacements,advancedDependentPlacementPeople:m.advancedDependentPlacementPeople,totalTraceLength:m.totalDeterministicTraceLength,forcedPlacements:m.forcedPlacements,classification:P.validation.mediumClassification,clueFamilies:m.clueFamilies}}
function strength(P){const m=P.validation.metrics;return 10*m.materialAdvancedDeductions+7*m.advancedDependentPlacements+4*m.advancedDeductionCount+3*m.multiPersonChainPeople+2*m.dependencyDepth+m.relationalDeductions}
function humanSteps(P){const m=P.validation.metrics,t=P.validation.human.trace,steps=[],seenAdvanced=new Set;steps.push(`No immediate placements: initial domains are ${M.PEOPLE.map(p=>`${p}:${m.initialCandidates[p]}`).join(', ')}.`);for(const e of t){if(steps.length>=14)break;if(e.reason==='own-clue-filtering')continue;let text=null,key=structuralKey(e);if(key){if(seenAdvanced.has(key))continue;seenAdvanced.add(key);if(e.reason==='intersecting-square-elimination')text=`${e.sourcePerson}'s remaining candidate pattern eliminates ${e.subject}'s ${e.removed.map(cellLabel).join(', ')} by row/column intersection.`;else text=`${(e.owners||[]).join('/')} collectively own ${(e.reason.includes('row')?'rows':'columns')} ${(e.values||[]).map(v=>v+1).join(', ')}, removing ${e.subject}'s candidate(s) there.`}else if(e.reason==='relational-deduction'){text=`${e.subject} is narrowed by ${e.clueType||'a relational clue'}${e.reference?` involving ${e.reference}`:''}.`}else if(e.reason==='forced-placement'){text=`${e.subject} becomes fixed at ${cellLabel(e.cell)} after ${e.sourceReason||'the previous deduction'}.`}else if(e.reason==='row-elimination'||e.reason==='column-elimination'){if(e.sourcePerson)text=`Because ${e.sourcePerson} is fixed, ${e.subject} loses candidate(s) in the same ${e.reason.startsWith('row')?'row':'column'}.`}else if(e.reason==='row-occupancy'||e.reason==='column-occupancy'){text=`Only ${e.subject} can still occupy ${e.reason.startsWith('row')?'row '+(e.row+1):'column '+(e.column+1)}.`}if(text)steps.push(text)}steps.push(`All seven placements follow deterministically; ${m.advancedDeductionCount} structural advanced deductions, ${m.materialAdvancedDeductions} material, ${m.multiPersonChainPeople} chain people, ${m.advancedDependentPlacements} advanced-dependent placements, searchCalls = 0.`);return steps}

M.resetMediumAcceptanceRejectionStats();
const puzzles=[];
for(let i=1;i<=20;i++){
 const id=`MEDIUM-FINAL-${String(i).padStart(3,'0')}`;
 const P=M.generateById(id,5000);
 assert(P,`failed to generate ${id}`);
 const m=P.validation.metrics,a=M.mediumAcceptance(m);
 assert(a.ok,`${id} failed final Medium floor: ${a.reasons.join('; ')}`);
 assert.strictEqual(P.validation.solutions,1);
 assert.strictEqual(P.validation.human.searchCalls,0);
 assert.strictEqual(m.directClueSingles,0);
 assert.strictEqual(m.multiCandidatePeople,7);
 assert(m.advancedDeductionCount>=2);
 assert(m.materialAdvancedDeductions>=1);
 assert(m.multiPersonChainPeople>=4);
 assert(m.advancedDependentPlacements>=4);
 assert(m.dependencyDepth>=2);
 assert.notStrictEqual(P.validation.mediumClassification,'TOO EASY');
 puzzles.push(P);
 console.log('ACCEPTED',id,JSON.stringify(stats(P)));
}
const rejectionStats=M.getMediumAcceptanceRejectionStats();
const ordered=puzzles.slice().sort((a,b)=>strength(a)-strength(b));
const weakest=ordered.slice(0,3),strongest=ordered.slice(-2).reverse();
const classes=Object.fromEntries(['CLEAR MEDIUM','BORDERLINE','TOO EASY'].map(k=>[k,puzzles.filter(P=>P.validation.mediumClassification===k).length]));
assert.strictEqual(classes['TOO EASY'],0);
const reviews=[...weakest.map(P=>({tier:'WEAKEST',P})),...strongest.map(P=>({tier:'STRONGEST',P}))];
const report={generatedAt:'2026-09-11',acceptance:{exactlyOneSolution:true,searchCalls:0,maxCluesPerPerson:2,directSingles:0,allPeopleInitiallyUnresolved:true,minStructuralAdvancedDeductions:2,minMaterialAdvancedDeductions:1,minDependencyDepth:2,minMultiPersonChainPeople:4,minAdvancedDependentPlacements:4},rejectionStats,classificationCounts:classes,puzzles:puzzles.map(P=>stats(P)),humanReview:reviews.map(({tier,P})=>({tier,puzzleId:P.puzzleId,strengthScore:strength(P),classification:P.validation.mediumClassification,stats:stats(P),clues:P.clues,solution:Object.fromEntries(M.PEOPLE.map(p=>[p,cellLabel(P.solution[p])])),initialDomains:initialDomains(P),solveOrder:humanSteps(P)}))};
fs.writeFileSync('tests/MEDIUM_FINAL_FLOOR_20_REPORT.json',JSON.stringify(report,null,2)+'\n');
let md='# Medium 7×7 — final breadth floor, 20 accepted puzzles\n\n';
md+=`Classification: CLEAR MEDIUM ${classes['CLEAR MEDIUM']} · BORDERLINE ${classes['BORDERLINE']} · TOO EASY ${classes['TOO EASY']}\n\n`;
md+=`Rejected previous-floor candidates: chain people < 4 = ${rejectionStats['chain people < 4']} · advanced-dependent placements < 4 = ${rejectionStats['advanced-dependent placements < 4']}\n\n`;
md+='| ID | attempts | select | initial A–G | adv | material | ownership | intersect | relational | depth | chain people | adv→placements | trace | class |\n|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n';
for(const P of puzzles){const r=stats(P);md+=`| ${r.puzzleId} | ${r.generationAttempts} | ${r.selectionAttempts} | ${M.PEOPLE.map(p=>r.initialCandidateCount[p]).join('/')} | ${r.advancedDeductionCount} | ${r.materialAdvancedDeductions} | ${r.ownershipCount} | ${r.intersectionCount} | ${r.relationalDeductionCount} | ${r.dependencyDepth} | ${r.multiPersonChainPeople} | ${r.advancedDependentPlacements} | ${r.totalTraceLength} | ${r.classification} |\n`}
for(const {tier,P} of reviews){md+=`\n## ${tier} — ${P.puzzleId}\n\nClassification: **${P.validation.mediumClassification}** · strength ${strength(P)}\n\nClues:\n`;for(const p of M.PEOPLE)md+=`- ${p}: ${(P.clues[p]||[]).map(c=>c.text).join(' / ')}\n`;md+=`\nSolution: ${M.PEOPLE.map(p=>`${p} ${cellLabel(P.solution[p])}`).join(' · ')}\n\nHuman logical chain:\n\n${humanSteps(P).map((s,i)=>`${i+1}. ${s}`).join('\n')}\n`}
fs.writeFileSync('tests/MEDIUM_FINAL_FLOOR_HUMAN_REVIEW.md',md);
console.log('MEDIUM FINAL FLOOR 20 PASS',JSON.stringify({classificationCounts:classes,rejectionStats,weakest:weakest.map(P=>P.puzzleId),strongest:strongest.map(P=>P.puzzleId)}));
