'use strict';
const fs=require('fs');
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const budget={maxNodes:50000,maxCounterexamples:10000,maxMs:5000,maxBranchesPerNode:50,maxCompliantLeaves:20};
const rows=[];
function counts(P){return Object.fromEntries(M.PEOPLE.map(p=>[p,P.constraints[p].length]))}
function sum(xs){return xs.reduce((a,b)=>a+b,0)}
function median(xs){const a=xs.slice().sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}
function dominantRuntime(s){
 const buckets={counterexampleSolving:s.freshCounterexampleSearchTimeMs||0,finalNecessity:s.necessityValidationTimeMs||0,mediumValidation:s.mediumValidationTimeMs||0};
 buckets.other=Math.max(0,(s.elapsedMs||0)-sum(Object.values(buckets)));
 const [name,ms]=Object.entries(buckets).sort((a,b)=>b[1]-a[1])[0];
 return{name,ms,buckets};
}

for(let i=1;i<=10;i++){
 const id=`RULESV2-LAZY-DIAG-${String(i).padStart(2,'0')}`;
 const r=M.generateDiagnosticBoardById(id,budget,{n:7,difficulty:'medium',require:{},forbid:[]});
 assert(r.board,`board generation failed for ${id}`);
 const s=r.search,mediumFound=!!r.puzzle,m=r.metrics||{};
 assert.strictEqual(s.freshPartialWitnessRepairSearches,0,`${id} partial witness repair must be zero`);
 if(mediumFound){
   const per=counts(r.puzzle);for(const p of M.PEOPLE)assert(per[p]>=1&&per[p]<=2,`${id} ${p} clue count`);
   assert.strictEqual(r.solutions,1,`${id} uniqueness`);
   assert(r.necessity&&r.necessity.ok,`${id} necessity`);
   assert(r.medium&&r.medium.ok,`${id} Medium gate`);
   assert.strictEqual(r.human.searchCalls,0,`${id} human solver searchCalls`);
 }
 const reuseDen=(s.reusedCounterexampleHits||0)+(s.freshCounterexampleSolverCalls||0);
 const row={
   puzzleId:id,boardGenerationAttempts:r.board.boardGenerationAttempts,factPoolSize:s.factPoolSize,
   clueSearchNodes:s.nodesExplored,sharedCounterexamplePoolSize:s.sharedCounterexamplePoolSize,
   reusedCounterexampleHits:s.reusedCounterexampleHits,freshCounterexampleSolverCalls:s.freshCounterexampleSolverCalls,
   counterexampleReuseRate:reuseDen?s.reusedCounterexampleHits/reuseDen:0,
   freshCounterexampleSearchTimeMs:s.freshCounterexampleSearchTimeMs,
   completeUniqueLeaves:s.completeUniqueLeaves,completeLeavesFailingNecessity:s.completeLeavesFailingNecessity,
   redundantCluesFoundAtFailedLeaves:s.redundantCluesFoundAtFailedLeaves,
   necessityValidations:s.necessityValidations,necessityValidationTimeMs:s.necessityValidationTimeMs,
   averageNecessityValidationTimeMs:s.necessityValidations?s.necessityValidationTimeMs/s.necessityValidations:0,
   compliantIrredundantLeaves:s.compliantUniqueLeavesFound,compliantLeavesFailingMedium:s.leavesFailingMedium,
   mediumPassingLeaves:s.leavesPassingMedium,firstMediumPassingLeafIndex:s.firstPassingLeafIndex,
   retainedValidWitnesses:s.retainedValidWitnesses,witnessStatesMarkedUnknown:s.witnessStatesMarkedUnknown,
   freshPartialWitnessRepairSearches:s.freshPartialWitnessRepairSearches,
   timeMs:s.elapsedMs,budgetReached:s.budgetExceeded,limitReached:s.failureReason,mediumFound,
   runtime:dominantRuntime(s),
   atomicConstraintsPerPerson:mediumFound?counts(r.puzzle):null,totalAtomicConstraints:mediumFound?M.atomicConstraintCount(r.puzzle):null,
   initialCandidates:mediumFound?m.initialCandidates:null,structuralAdvancedDeductions:mediumFound?m.advancedDeductionCount??null:null,
   materialAdvancedDeductions:mediumFound?m.materialAdvancedDeductions??null:null,ownership:mediumFound?m.ownershipCount??null:null,
   intersections:mediumFound?m.intersectionCount??null:null,dependencyDepth:mediumFound?m.dependencyDepth??null:null,
   chainPeople:mediumFound?m.multiPersonChainPeople??null:null,advancedDependentPlacements:mediumFound?m.advancedDependentPlacements??null:null,
   humanSearchCalls:mediumFound?r.human.searchCalls:null
 };
 rows.push(row);console.log('LAZY_DIAG',JSON.stringify(row));
}

const medium=rows.filter(r=>r.mediumFound),times=rows.map(r=>r.timeMs),nodes=rows.map(r=>r.clueSearchNodes);
const reuseHits=sum(rows.map(r=>r.reusedCounterexampleHits)),freshCE=sum(rows.map(r=>r.freshCounterexampleSolverCalls));
const necessityCalls=sum(rows.map(r=>r.necessityValidations),),necessityMs=sum(rows.map(r=>r.necessityValidationTimeMs));
const runtimeTotals={
 counterexampleSolving:sum(rows.map(r=>r.runtime.buckets.counterexampleSolving)),
 finalNecessity:sum(rows.map(r=>r.runtime.buckets.finalNecessity)),
 mediumValidation:sum(rows.map(r=>r.runtime.buckets.mediumValidation)),
 other:sum(rows.map(r=>r.runtime.buckets.other))
};
const runtimeDominant=Object.entries(runtimeTotals).sort((a,b)=>b[1]-a[1])[0][0];
const report={
 generatedAt:'2026-09-11',rulesVersion:2,strategy:'lazy-necessity-shared-counterexample-multi-leaf',budget,
 previousCheckpoint:{boardsProducingMedium:1,averageTimeMs:4592.1,budgetFailures:9,averageFreshWitnessSearches:2519.8},
 summary:{
   boards:10,boardsProducingMedium:medium.length,averageTimeMs:sum(times)/10,medianTimeMs:median(times),maxTimeMs:Math.max(...times),
   averageNodes:sum(nodes)/10,medianNodes:median(nodes),maxNodes:Math.max(...nodes),
   sharedCounterexamples:sum(rows.map(r=>r.sharedCounterexamplePoolSize)),reusedCounterexampleHits:reuseHits,
   freshCounterexampleSolverCalls:freshCE,counterexampleReuseRate:(reuseHits+freshCE)?reuseHits/(reuseHits+freshCE):0,
   averageFreshPartialWitnessRepairSearches:sum(rows.map(r=>r.freshPartialWitnessRepairSearches))/10,
   completeUniqueLeaves:sum(rows.map(r=>r.completeUniqueLeaves)),necessityFailedLeaves:sum(rows.map(r=>r.completeLeavesFailingNecessity)),
   compliantIrredundantLeaves:sum(rows.map(r=>r.compliantIrredundantLeaves)),mediumFailedLeaves:sum(rows.map(r=>r.compliantLeavesFailingMedium)),
   necessityValidations:necessityCalls,totalNecessityValidationTimeMs:necessityMs,
   averageNecessityValidationTimeMs:necessityCalls?necessityMs/necessityCalls:0,
   budgetFailures:rows.filter(r=>r.budgetReached&&!r.mediumFound).length,runtimeTotals,runtimeDominant
 },boards:rows
};
fs.writeFileSync('tests/LAZY_NECESSITY_10_BOARD_REPORT.json',JSON.stringify(report,null,2)+'\n');
console.log('LAZY_SUMMARY',JSON.stringify(report.summary));
