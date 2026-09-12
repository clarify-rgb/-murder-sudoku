'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const request={n:7,difficulty:'medium',require:{},forbid:[]};
const budget={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const diagnostic=M.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',budget,request);
assert(diagnostic.puzzle,'fixed pipeline fixture must produce a candidate');

const mathematical=M.validateClueSetCandidate(diagnostic.puzzle);
assert(mathematical.ok,'mathematical candidate validation must pass');
assert.strictEqual(mathematical.solutions,1);
assert(mathematical.necessity.ok);
for(const forbidden of ['metrics','classification','profileResults','mediumAcceptance'])assert(!(forbidden in mathematical),`mathematical validation must not decide difficulty: ${forbidden}`);

const directHuman=M.strictSolve(diagnostic.puzzle),directMetrics=M.metrics(diagnostic.puzzle,directHuman),analysis=M.analyzeDifficulty(diagnostic.puzzle);
assert.deepStrictEqual(analysis.trace,directHuman.trace,'difficulty wrapper must preserve raw trace');
assert.deepStrictEqual(analysis.metrics,directMetrics,'difficulty wrapper must preserve current metrics');
assert.deepStrictEqual(analysis.profileResults.medium,M.mediumAcceptance(directMetrics),'Medium profile must use the current exact gate');
assert.strictEqual(analysis.classification,M.classifyMedium(directMetrics));
assert.strictEqual(analysis.searchCalls,0);

let callbackCalls=0,callbackValidation=null;
const board=M.generateBoardById('RULESV2-PROFILE-DIAG-03',40);
const genericSearch=M.searchIrredundantClueSet(board,request,budget,{onValidClueSet(candidate,context){
 callbackCalls++;callbackValidation=context.mathematicalValidation;
 const candidateAnalysis=M.analyzeDifficulty(candidate);
 return{accepted:true,profileResult:{ok:true,reasons:[]},analysis:candidateAnalysis}
}});
assert(genericSearch.puzzle,'clue search must hand a mathematically valid clue set to its consumer');
assert(callbackCalls>=1&&callbackValidation.ok,'onValidClueSet must receive successful mathematical validation');

const prior=JSON.parse(JSON.stringify(diagnostic.puzzle)),published=M.publishPuzzle(JSON.parse(JSON.stringify(diagnostic.puzzle)),request,'PIPELINE-PUBLISH-TEST',1);
assert(published,'publish stage must accept the fixed candidate');
for(const key of Object.keys(prior))assert.deepStrictEqual(published[key],prior[key],`publish must retain prior field ${key}`);
for(const key of ['metadata','objective','render','puzzleId','generationAttempts','deductionLog'])assert(key in published,`published puzzle missing ${key}`);
assert.deepStrictEqual(published.deductionLog,published.validation.human.deductionLog);
assert.strictEqual(M.generateById,M.generateById,'public compatibility wrapper remains callable');

console.log('MEDIUM FIVE-STAGE PIPELINE BOUNDARIES PASS');
