'use strict';
const fs=require('fs');
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const budget={maxNodes:50000,maxCounterexamples:10000,maxMs:5000,maxBranchesPerNode:50,maxCompliantLeaves:20};
const rows=[];
function counts(P){return Object.fromEntries(M.PEOPLE.map(p=>[p,P.constraints[p].length]))}
function median(xs){const a=xs.slice().sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}
function sum(xs){return xs.reduce((a,b)=>a+b,0)}
function leafDiff(a,b){
 if(!a||!b)return null;
 const out={};
 for(const p of M.PEOPLE){
   const A=(a.constraints[p]||[]).map(x=>JSON.stringify(x));
   const B=(b.constraints[p]||[]).map(x=>JSON.stringify(x));
   const removed=A.filter(x=>!B.includes(x)).map(JSON.parse);
   const added=B.filter(x=>!A.includes(x)).map(JSON.parse);
   if(removed.length||added.length)out[p]={removed,added};
 }
 return out;
}

for(let i=1;i<=10;i++){
 const id=`RULESV2-ML-DIAG-${String(i).padStart(2,'0')}`;
 const r=M.generateDiagnosticBoardById(id,budget,{n:7,difficulty:'medium',require:{},forbid:[]});
 assert(r.board,`board generation failed for ${id}`);
 const s=r.search;
 const mediumFound=!!r.puzzle;
 if(mediumFound){
   const per=counts(r.puzzle);
   for(const p of M.PEOPLE)assert(per[p]>=1&&per[p]<=2,`${id} ${p} clue count ${per[p]}`);
   assert.strictEqual(r.solutions,1,`${id} must be unique`);
   assert(r.necessity&&r.necessity.ok,`${id} necessity failed`);
   assert(r.human&&r.human.searchCalls===0,`${id} human solver searchCalls changed`);
   assert(r.medium&&r.medium.ok,`${id} returned puzzle must pass Medium`);
 }
 const m=r.metrics||{};
 const hits=s.cacheHits||{alternative:0,solutionCount:0,witness:0,falseFacts:0,total:0};
 const misses=s.cacheMisses||{alternative:0,solutionCount:0,witness:0,falseFacts:0,total:0};
 const cacheLookups=(hits.total||0)+(misses.total||0);
 const comparison=(s.firstCompliantLeaf&&s.passingLeaf&&s.firstCompliantLeaf.index<s.passingLeaf.index)?{
   firstLeaf:s.firstCompliantLeaf,
   passingLeaf:s.passingLeaf,
   clueSetDiff:leafDiff(s.firstCompliantLeaf,s.passingLeaf)
 }:null;
 const row={
   puzzleId:id,
   boardGenerationAttempts:r.board.boardGenerationAttempts,
   factPoolSize:s.factPoolSize,
   clueSearchNodes:s.nodesExplored,
   counterexamples:s.counterexamplesEncountered,
   distinctCounterexamples:s.distinctCounterexamples,
   compliantUniqueLeavesFound:s.compliantUniqueLeavesFound,
   leavesRejectedAsRedundant:s.redundantLeavesRejected,
   leavesFailingMedium:s.leavesFailingMedium,
   leavesPassingMedium:s.leavesPassingMedium,
   firstPassingLeafIndex:s.firstPassingLeafIndex,
   distinctClueSetsExplored:s.distinctClueSetsExplored,
   completeUniqueLeaves:s.completeUniqueLeaves,
   timeMs:s.elapsedMs,
   cacheHits:hits,
   cacheMisses:misses,
   cacheHitRate:cacheLookups?hits.total/cacheLookups:0,
   witnessSearchesPerformed:s.witnessSearchesPerformed,
   previousCompatibleWitnessesRetained:s.existingWitnessRetained,
   budgetReached:s.budgetExceeded,
   limitReached:s.failureReason,
   mediumFound,
   atomicConstraintsPerPerson:mediumFound?counts(r.puzzle):null,
   totalAtomicConstraints:mediumFound?M.atomicConstraintCount(r.puzzle):null,
   initialCandidates:mediumFound?m.initialCandidates:null,
   structuralAdvancedDeductions:mediumFound?m.advancedDeductionCount??null:null,
   materialAdvancedDeductions:mediumFound?m.materialAdvancedDeductions??null:null,
   ownership:mediumFound?m.ownershipCount??null:null,
   intersections:mediumFound?m.intersectionCount??null:null,
   relationalDeductions:mediumFound?m.relationalDeductions??null:null,
   dependencyDepth:mediumFound?m.dependencyDepth??null:null,
   chainPeople:mediumFound?m.multiPersonChainPeople??null:null,
   advancedDependentPlacements:mediumFound?m.advancedDependentPlacements??null:null,
   humanSearchCalls:mediumFound?r.human.searchCalls:null,
   comparison
 };
 rows.push(row);console.log('MULTI_LEAF_DIAG',JSON.stringify(row));
}
const times=rows.map(r=>r.timeMs),nodes=rows.map(r=>r.clueSearchNodes),medium=rows.filter(r=>r.mediumFound);
const successfulLeafCounts=medium.map(r=>r.firstPassingLeafIndex);
const witness=rows.map(r=>r.witnessSearchesPerformed);
const comparisons=rows.filter(r=>r.comparison).map(r=>({puzzleId:r.puzzleId,...r.comparison}));
const totalHits=sum(rows.map(r=>r.cacheHits.total||0)),totalMisses=sum(rows.map(r=>r.cacheMisses.total||0));
const report={
 generatedAt:'2026-09-11',
 rulesVersion:2,
 strategy:'necessity-first-counterexample-guided-multi-leaf',
 budget,
 summary:{
   boards:10,
   boardsProducingMedium:medium.length,
   averageTimeMs:sum(times)/times.length,
   medianTimeMs:median(times),
   maxTimeMs:Math.max(...times),
   averageNodes:sum(nodes)/nodes.length,
   medianNodes:median(nodes),
   maxNodes:Math.max(...nodes),
   averageCompliantLeavesBeforeMedium:successfulLeafCounts.length?sum(successfulLeafCounts)/successfulLeafCounts.length:null,
   averageWitnessSearches:sum(witness)/witness.length,
   medianWitnessSearches:median(witness),
   maxWitnessSearches:Math.max(...witness),
   cacheHits:totalHits,
   cacheMisses:totalMisses,
   cacheHitRate:(totalHits+totalMisses)?totalHits/(totalHits+totalMisses):0,
   budgetFailures:rows.filter(r=>r.budgetReached&&!r.mediumFound).length,
   firstLeafTooEasyThenMedium:comparisons.length
 },
 comparisons,
 boards:rows
};
fs.writeFileSync('tests/MULTI_LEAF_MEDIUM_10_BOARD_REPORT.json',JSON.stringify(report,null,2)+'\n');
console.log('MULTI_LEAF_SUMMARY',JSON.stringify(report.summary));
