'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');

const APPROVED_HEAD='54ed6336a161dd76eb3d978cc001888daad410fd';
const optimized=require('../engine/medium-7x7.js');
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const pristineModule=new Module(path.join(__dirname,'approved-wide-first-engine.js'),module);
pristineModule.filename=path.join(__dirname,'approved-wide-first-engine.js');
pristineModule.paths=module.paths;
pristineModule._compile(source,pristineModule.filename);
const approved=pristineModule.exports;

const IDS=['RULESV2-PROFILE-DIAG-01','RULESV2-PROFILE-DIAG-03','RULESV2-PROFILE-DIAG-06','RULESV2-PROFILE-DIAG-09'];
const BUDGET={maxNodes:2000,maxCounterexamples:10000,maxMs:600000,maxBranchesPerNode:40,maxCompliantLeaves:100000};
const REQUEST={n:7,difficulty:'medium',require:{},forbid:[]};

function withoutElapsed(value){
 const copy=JSON.parse(JSON.stringify(value));
 const harvestDiagnostics=new Set(['necessityWitnessesDiscovered','uniqueNecessityWitnessesHarvested','duplicateNecessityWitnessesIgnored','cePoolSizeBeforeNecessityTotal','cePoolSizeAfterNecessityTotal','selectedCluesAtNecessityLeaves','poolCertifiedCluesBeforeNecessity','poolCertifiedCluesAfterNecessity','completeLeavesAllCluesPoolCertifiedBefore','completeLeavesAllCluesPoolCertifiedAfter','poolCertificationBeforeCorrelation','poolCertificationAfterCorrelation','necessityCertificationSamples','privateWitnessNecessityContradictions','harvestNecessityWitnesses','certifiedWitnessBranchExtensions','certifiedSelectedCluesOnExtensions','certifiedWitnessesDestroyed','certifiedWitnessPoolReplacements','unrepairedCertifiedWitnessLosses','totalCertifiedWitnessPenaltyApplied','certifiedWitnessLossPenalty']);
 function stripTimings(x){if(!x||typeof x!=='object')return;for(const key of Object.keys(x)){if(key==='elapsedMs'||key.endsWith('TimeMs')||harvestDiagnostics.has(key))delete x[key];else stripTimings(x[key])}}
 stripTimings(copy);
 return copy;
}

const rows=[];
for(const id of IDS){
 const before=approved.generateDiagnosticBoardById(id,BUDGET,REQUEST);
 const after=optimized.generateDiagnosticBoardById(id,{...BUDGET,harvestNecessityWitnesses:false,certifiedWitnessLossPenalty:0},REQUEST);
 assert.deepStrictEqual(withoutElapsed(after),withoutElapsed(before),`${id}: fixed-node search behavior changed`);
 rows.push({id,nodes:after.search.nodesExplored,completeUniqueLeaves:after.search.completeUniqueLeaves,coverageValidUniqueLeaves:after.search.coverageValidUniqueLeaves,finalQualityPasses:after.search.finalPersonalClueQualityPasses,necessityValidations:after.search.necessityValidations,irredundantLeaves:after.search.irredundantLeaves,mediumPasses:after.search.leavesPassingMedium,producedPuzzle:!!after.puzzle});
}
console.log('IMMUTABLE PERFORMANCE FIXED-NODE EQUIVALENCE PASS',JSON.stringify({approvedHead:APPROVED_HEAD,budget:BUDGET,rows}));
