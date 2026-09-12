'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');
const M=require('../engine/medium-7x7.js');

const APPROVED_HEAD='591b4a59fe58cfbbc4733e312884c251b92cec93';
assert.strictEqual(M.PRIVATE_WITNESS_LOSS_PENALTY,4000,'experiment must use the single predetermined witness-loss penalty');

const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const approvedModule=new Module(path.join(__dirname,'approved-performance-engine.js'),module);
approvedModule.filename=path.join(__dirname,'approved-performance-engine.js');approvedModule.paths=module.paths;approvedModule._compile(source,approvedModule.filename);
const approved=approvedModule.exports;
const request={n:7,difficulty:'medium',require:{},forbid:[]};
const behaviorKeys=['nodesExplored','distinctClueSetsExplored','counterexamplesEncountered','newCounterexamplesSolved','sharedCounterexamplePoolSize','reusedCounterexampleHits','freshCounterexampleSolverCalls','completeUniqueLeaves','completeLeavesFailingNecessity','redundantCluesFoundAtFailedLeaves','necessityValidations','compliantUniqueLeavesFound','leavesFailingMedium','leavesPassingMedium','coverageValidUniqueLeaves','finalPersonalClueQualityPasses','finalPersonalClueQualityFailures','irredundantLeaves','mediumSuccesses','wideFirstCluesSelected','branchesContainingWideFirstClue','wideFirstPeopleRescuedBySecondClue','wideFirstRescuedUniqueLeaves','wideFirstRescuedPeopleAtUniqueLeaves','firstPassingLeafIndex','irredundantFound','mediumFound','budgetExceeded','failureReason'];

for(const id of ['RULESV2-PROFILE-DIAG-01','RULESV2-PROFILE-DIAG-03']){
 const budget={maxNodes:600,maxCounterexamples:10000,maxMs:600000,maxBranchesPerNode:40,maxCompliantLeaves:100000,privateWitnessLossPenalty:0};
 const before=approved.generateDiagnosticBoardById(id,budget,request),after=M.generateDiagnosticBoardById(id,budget,request);
 assert.deepStrictEqual(after.board,before.board,`${id}: board changed with witness score disabled`);
 assert.deepStrictEqual(after.puzzle?.constraints||null,before.puzzle?.constraints||null,`${id}: clue set changed with witness score disabled`);
 assert.deepStrictEqual(after.puzzle?.solution||null,before.puzzle?.solution||null,`${id}: solution changed with witness score disabled`);
 for(const key of behaviorKeys)assert.deepStrictEqual(after.search[key],before.search[key],`${id}: behavioral diagnostic ${key} changed with witness score disabled`);
}

const result=M.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',{maxNodes:300,maxCounterexamples:1000,maxMs:600000,maxBranchesPerNode:40,maxCompliantLeaves:20},request),d=result.search;
for(const key of ['witnessExtensionSelections','selectedCluesObservedOnExtensions','selectedCluesWithLivePrivateWitnesses','privateWitnessesPreservedOnExtension','privateWitnessesDestroyed','poolWitnessRepairsFound','witnessUnknownSelectedClues','poolCertifiedNecessaryClues','selectedCluesAtCertifiedLeaves','completeLeavesAllCluesPoolCertified','completeLeavesPartiallyPoolCertified','completeLeavesNoCluesPoolCertified','privateWitnessNecessityContradictions'])assert(Number.isInteger(d[key])&&d[key]>=0,`missing witness diagnostic ${key}`);
assert(d.selectedCluesWithLivePrivateWitnesses<=d.selectedCluesObservedOnExtensions,'live witness observations cannot exceed selected clue observations');
assert(d.poolWitnessRepairsFound<=d.privateWitnessesDestroyed,'pool repairs cannot exceed destroyed witnesses');
assert(d.poolCertifiedNecessaryClues<=d.selectedCluesAtCertifiedLeaves,'certified clues cannot exceed clues checked');
const correlationTotal=Object.values(d.poolCertificationCorrelation).reduce((n,x)=>n+x.necessityPass+x.necessityFail,0);
assert.strictEqual(correlationTotal,d.necessityValidations,'every authoritative necessity result must be correlated with its pool certification class');
assert.strictEqual(d.poolCertificationCorrelation.all.necessityFail,0,'an all-certified leaf cannot fail authoritative necessity');
assert.strictEqual(d.privateWitnessNecessityContradictions,0,'a pool-certified clue cannot be authoritative-redundant');
assert.strictEqual(d.freshPartialWitnessRepairSearches,0,'private witness repair must never call the solver');

console.log('PRIVATE-WITNESS SEARCH-ORDER CONTRACT PASS');
