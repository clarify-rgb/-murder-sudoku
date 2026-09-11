'use strict';
const fs=require('fs');
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const budget={maxNodes:25000,maxCounterexamples:6000,maxMs:2500,maxBranchesPerNode:40};
const rows=[];
function counts(P){return Object.fromEntries(M.PEOPLE.map(p=>[p,P.constraints[p].length]))}
function median(xs){const a=xs.slice().sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}

for(let i=1;i<=10;i++){
 const id=`RULESV2-NF-DIAG-${String(i).padStart(2,'0')}`;
 const r=M.generateDiagnosticBoardById(id,budget,{n:7,difficulty:'medium',require:{},forbid:[]});
 assert(r.board,`board generation failed for ${id}`);
 const found=!!r.puzzle;
 if(found){
   const per=counts(r.puzzle);
   for(const p of M.PEOPLE)assert(per[p]>=1&&per[p]<=2,`${id} ${p} clue count ${per[p]}`);
   assert.strictEqual(r.solutions,1,`${id} must be unique`);
   assert(r.necessity&&r.necessity.ok,`${id} necessity failed`);
   assert(r.human&&r.human.searchCalls===0,`${id} human solver searchCalls changed`);
 }
 const m=r.metrics||{};
 const row={
   puzzleId:id,
   boardGenerationAttempts:r.board.boardGenerationAttempts,
   factPoolSize:r.search.factPoolSize,
   clueSearchNodes:r.search.nodesExplored,
   counterexamplesEncountered:r.search.counterexamplesEncountered,
   distinctCounterexamples:r.search.distinctCounterexamples,
   completeUniqueLeaves:r.search.completeUniqueLeaves,
   uniqueLeavesRejectedForRedundancy:r.search.uniqueLeavesRejectedForRedundancy,
   witnessRepairSearches:r.search.witnessRepairSearches,
   irredundantFound:found,
   elapsedMs:r.search.elapsedMs,
   budgetExceeded:r.search.budgetExceeded,
   failureReason:r.search.failureReason,
   atomicConstraintsPerPerson:found?counts(r.puzzle):null,
   totalAtomicConstraints:found?M.atomicConstraintCount(r.puzzle):null,
   solutionCount:found?r.solutions:null,
   necessity:found?r.necessity.ok:false,
   humanSearchCalls:found?r.human.searchCalls:null,
   deterministicHumanSolved:found?r.human.ok:false,
   mediumPass:found&&r.medium?r.medium.ok:false,
   mediumReasons:found&&r.medium?r.medium.reasons||[]:['no compliant clue set'],
   initialCandidates:found&&m.initialCandidates?m.initialCandidates:null,
   structuralAdvancedDeductions:found?m.advancedDeductionCount??null:null,
   materialAdvancedDeductions:found?m.materialAdvancedDeductions??null:null,
   dependencyDepth:found?m.dependencyDepth??null:null,
   chainPeople:found?m.multiPersonChainPeople??null:null,
   advancedDependentPlacements:found?m.advancedDependentPlacements??null:null
 };
 rows.push(row);console.log('DIAG',JSON.stringify(row));
}
const nodes=rows.map(r=>r.clueSearchNodes),times=rows.map(r=>r.elapsedMs),found=rows.filter(r=>r.irredundantFound),medium=rows.filter(r=>r.mediumPass);
const report={
 generatedAt:'2026-09-11',rulesVersion:2,strategy:'necessity-first-counterexample-guided',budget,
 summary:{boards:10,compliantIrredundantBoards:found.length,mediumFloorPasses:medium.length,averageNodes:nodes.reduce((a,b)=>a+b,0)/nodes.length,medianNodes:median(nodes),maxNodes:Math.max(...nodes),averageElapsedMs:times.reduce((a,b)=>a+b,0)/times.length,medianElapsedMs:median(times),maxElapsedMs:Math.max(...times),budgetFailures:rows.filter(r=>r.budgetExceeded).length},
 boards:rows
};
fs.writeFileSync('tests/NECESSITY_FIRST_10_BOARD_REPORT.json',JSON.stringify(report,null,2)+'\n');
console.log('SUMMARY',JSON.stringify(report.summary));
