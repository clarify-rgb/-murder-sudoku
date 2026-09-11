'use strict';
const fs=require('fs');
const R=JSON.parse(fs.readFileSync('tests/GENERATOR_PROFILING_10_BOARD_REPORT.json','utf8'));
const A=R.aggregate;
function top(obj,n=20){return Object.entries(obj||{}).sort((a,b)=>b[1]-a[1]).slice(0,n)}
function familyTable(obj){return Object.entries(obj||{}).map(([family,v])=>({family,...v})).sort((a,b)=>b.tested-a.tested||a.family.localeCompare(b.family))}
function timingTable(obj,total){return Object.entries(obj||{}).map(([operation,v])=>({operation,ms:v.ms,calls:v.calls,avgMs:v.averageMsPerCall,percentDiagnosticRuntime:v.percentDiagnosticRuntime})).sort((a,b)=>b.ms-a.ms)}
function factTable(obj){return Object.entries(obj||{}).map(([family,v])=>({family,count:v.count,avgDomain:v.averageDomain,minDomain:v.minDomain,maxDomain:v.maxDomain})).sort((a,b)=>a.avgDomain-b.avgDomain||b.count-a.count)}
const failed=A.necessity.failedCounts||[];
const privateTotal=Object.values(A.privateWitness).reduce((x,y)=>x+y,0);
const out={
 checkpointBase:R.checkpointBase,
 productionEngineBlob:R.productionEngineBlob,
 productionEngineByteIdentical:R.productionEngineByteIdentical,
 summary:R.summary,
 earlyUnique:{
   total:A.earlyUnique.total,
   coverageValid:A.earlyUnique.coverageValid,
   coverageInvalid:A.earlyUnique.coverageInvalid,
   coverageInvalidRate:A.earlyUnique.total?A.earlyUnique.coverageInvalid/A.earlyUnique.total:0,
   byClueCount:A.earlyUnique.byClueCount,
   byCoveredPeople:A.earlyUnique.byCoveredPeople,
   topConstraintPatterns:top(A.earlyUnique.patterns,20),
   topUncoveredPatterns:top(A.earlyUnique.uncoveredPatterns,20),
   lastClueTypes:top(A.earlyUnique.lastClueTypes,30),
   causeSignals:A.earlyUnique.causeSignals
 },
 redundancy:{
   failedLeaves:failed.length,
   single:failed.filter(x=>x===1).length,
   multiple:failed.filter(x=>x>=2).length,
   average:R.summary.averageRedundantCluesPerFailedLeaf,
   median:R.summary.medianRedundantCluesPerFailedLeaf,
   max:R.summary.maxRedundantCluesPerFailedLeaf,
   ownedByOneCluePerson:A.necessity.owned1,
   ownedByTwoCluePerson:A.necessity.owned2,
   byFamily:familyTable(A.necessity.byFamily),
   classifications:A.classification
 },
 privateWitness:{...A.privateWitness,total:privateTotal,knownRate:privateTotal?(A.privateWitness.knownPass+A.privateWitness.knownFail)/privateTotal:0},
 runtime:{diagnosticTotalMs:R.boards.reduce((s,b)=>s+b.elapsedMs,0),operations:timingTable(A.timing)},
 factPool:{totalFacts:A.factPool.totalFacts,totalGenerationMs:A.factPool.totalGenerationMs,averageFactsPerBoard:A.factPool.totalFacts/R.summary.boards,byFamily:factTable(A.factPool.byFamily)},
 boardCompact:R.boards.map(b=>({id:b.puzzleId,time:b.elapsedMs,nodes:b.nodes,unique:b.uniqueTerminalLeaves,coverageValid:b.coverageValidUniqueLeaves,coverageInvalid:b.coverageInvalidUniqueLeaves,commonUncoveredPattern:b.commonUncoveredPattern,necessityChecks:b.necessityChecks,necessityPasses:b.necessityPasses,necessityFailures:b.necessityFailures,redundantAtomicCount:b.redundantAtomicCount,mediumFound:b.mediumFound}))
};
fs.writeFileSync('tests/GENERATOR_PROFILING_SUMMARY.json',JSON.stringify(out,null,2)+'\n');
console.log('PROFILE_COMPACT',JSON.stringify(out));
