'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');
const current=require('../engine/medium-7x7.js');
const APPROVED_HEAD='69839340cad100501b3e9485fca0a459c7717916';
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const approvedModule=new Module(path.join(__dirname,'approved-pipeline-engine.js'),module);approvedModule.filename=path.join(__dirname,'approved-pipeline-engine.js');approvedModule.paths=module.paths;approvedModule._compile(source,approvedModule.filename);
const approved=approvedModule.exports;
const ids=['RULESV2-PROFILE-DIAG-01','RULESV2-PROFILE-DIAG-03','RULESV2-PROFILE-DIAG-06','RULESV2-PROFILE-DIAG-09'];
const budget={maxNodes:2000,maxCounterexamples:10000,maxMs:600000,maxBranchesPerNode:40,maxCompliantLeaves:100000};
const request={n:7,difficulty:'medium',require:{},forbid:[]};
function legacy(value){const copy=JSON.parse(JSON.stringify(value));(function strip(x){if(!x||typeof x!=='object')return;for(const key of Object.keys(x)){if(key==='deductionLog'||key==='elapsedMs'||key.endsWith('TimeMs'))delete x[key];else strip(x[key])}})(copy);return copy}

const rows=[];
for(const id of ids){
 const before=approved.generateDiagnosticBoardById(id,budget,request),after=current.generateDiagnosticBoardById(id,budget,request);
 assert.deepStrictEqual(legacy(after),legacy(before),`${id}: fixed-node legacy behavior changed`);
 assert.deepStrictEqual(current.buildAtomicFactPool(after.board,request),approved.buildAtomicFactPool(before.board,request),`${id}: fact pool changed`);
 if(after.puzzle){
  assert.deepStrictEqual(after.human.trace,before.human.trace,`${id}: raw trace changed`);assert.deepStrictEqual(after.metrics,before.metrics,`${id}: metrics changed`);
  const shadow=current.deductionLogMetrics(after.human.deductionLog),m=after.metrics;
  for(const key of ['initialCandidates','directClueSingles','multiCandidatePeople','rowColumnEliminations','rowOwnershipDeductions','columnOwnershipDeductions','multiRowOwnershipDeductions','multiColumnOwnershipDeductions','relationalDeductions','intersectingSquareDeductions','forcedPlacements','totalDeterministicTraceLength'])assert.deepStrictEqual(shadow[key],m[key],`${id}: shadow metric ${key}`);
 }
 rows.push({id,nodes:after.search.nodesExplored,medium:!!after.puzzle,classification:after.puzzle?current.classifyMedium(after.metrics):null});
}
const publishedBefore=approved.generateById('RULESV2-PROFILE-DIAG-03',1,request),publishedAfter=current.runGenerationPipeline('RULESV2-PROFILE-DIAG-03',1,request);
assert(publishedBefore&&publishedAfter,'fixed production orchestrator fixture must publish');
assert.deepStrictEqual(legacy(publishedAfter),legacy(publishedBefore),'runGenerationPipeline must preserve all legacy published fields');
assert(publishedAfter.deductionLog&&publishedAfter.validation.human.deductionLog,'published puzzle must expose the canonical log without removing the solve artifact');
console.log('PIPELINE FIXED-NODE + SHADOW-METRIC EQUIVALENCE PASS',JSON.stringify(rows));
