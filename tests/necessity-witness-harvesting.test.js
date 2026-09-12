'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');
const M=require('../engine/medium-7x7.js');

const APPROVED_HEAD='25e5c1b911472390c8e2982e1d5bee8f58aaad6a';
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const approvedModule=new Module(path.join(__dirname,'approved-performance-engine.js'),module);
approvedModule.filename=path.join(__dirname,'approved-performance-engine.js');approvedModule.paths=module.paths;approvedModule._compile(source,approvedModule.filename);
const approved=approvedModule.exports;
const request={n:7,difficulty:'medium',require:{},forbid:[]};

const fixed=approved.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',{maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20},request);
assert(fixed.puzzle,'approved fixture must produce a Medium puzzle');
const puzzle=JSON.parse(JSON.stringify(fixed.puzzle));

M.resetSearchCallCount();const plain=M.validateNecessity(puzzle),plainCalls=M.getSearchCallBreakdown();
const captured=[];M.resetSearchCallCount();const withCapture=M.validateNecessity(puzzle,{onWitness:w=>captured.push(w)}),captureCalls=M.getSearchCallBreakdown();
assert.deepStrictEqual(withCapture,plain,'capturing already-found arrangements must not change necessity validity');
assert.deepStrictEqual(captureCalls,plainCalls,'capturing must not add solver searches');
assert.strictEqual(captureCalls.findArrangement,0,'necessity capture must not call the arrangement-search entry point');
assert(captured.length>=M.atomicConstraintCount(puzzle),'each necessary clue must expose an already-found non-target arrangement');
for(const {item,arrangement} of captured){
 assert(Object.keys(arrangement).some(p=>arrangement[p].r!==puzzle.solution[p].r||arrangement[p].c!==puzzle.solution[p].c),'captured witness must differ from target');
 assert(!M.constraintSatisfied(puzzle,item.subject,item.constraint,arrangement),'captured witness must violate the removed clue');
 const without=JSON.parse(JSON.stringify(puzzle));
 if(item.global)without.globalConstraints.splice(item.index,1);else without.constraints[item.subject].splice(item.index,1);
 assert(M.fullValid(without,arrangement),'captured witness must satisfy every remaining clue');
}

const result=M.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',{maxNodes:300,maxCounterexamples:1000,maxMs:600000,maxBranchesPerNode:40,maxCompliantLeaves:20},request),d=result.search;
for(const key of ['necessityWitnessesDiscovered','uniqueNecessityWitnessesHarvested','duplicateNecessityWitnessesIgnored','cePoolSizeBeforeNecessityTotal','cePoolSizeAfterNecessityTotal','selectedCluesAtNecessityLeaves','poolCertifiedCluesBeforeNecessity','poolCertifiedCluesAfterNecessity','completeLeavesAllCluesPoolCertifiedBefore','completeLeavesAllCluesPoolCertifiedAfter','privateWitnessNecessityContradictions'])assert(Number.isInteger(d[key])&&d[key]>=0,`missing harvest diagnostic ${key}`);
assert.strictEqual(d.necessityWitnessesDiscovered,d.uniqueNecessityWitnessesHarvested+d.duplicateNecessityWitnessesIgnored,'every discovered necessity witness must be harvested or deduplicated');
assert(d.cePoolSizeAfterNecessityTotal>=d.cePoolSizeBeforeNecessityTotal,'harvesting cannot shrink the board-local CE pool');
assert(d.poolCertifiedCluesAfterNecessity>=d.poolCertifiedCluesBeforeNecessity,'harvesting cannot remove private-witness certification');
assert.strictEqual(d.completeLeavesAllCluesPoolCertifiedAfter,d.compliantUniqueLeavesFound,'all and only authoritative necessity passes must be fully pool-certified after harvesting');
for(const correlation of [d.poolCertificationBeforeCorrelation,d.poolCertificationAfterCorrelation])assert.strictEqual(Object.values(correlation).reduce((n,x)=>n+x.necessityPass+x.necessityFail,0),d.necessityValidations,'every necessity result must have a certification class');
assert.strictEqual(d.poolCertificationAfterCorrelation.all.necessityFail,0,'fully certified leaves cannot be authoritative-redundant');
assert.strictEqual(d.poolCertificationAfterCorrelation.partial.necessityPass+d.poolCertificationAfterCorrelation.none.necessityPass,0,'an authoritative necessity pass must be fully certified after harvesting');
assert.strictEqual(d.privateWitnessNecessityContradictions,0,'known private witness plus authoritative redundancy is impossible');
assert.strictEqual(d.freshPartialWitnessRepairSearches,0,'harvesting must not restore solver-based witness repair');

console.log('NECESSITY-WITNESS HARVESTING CONTRACT PASS');
