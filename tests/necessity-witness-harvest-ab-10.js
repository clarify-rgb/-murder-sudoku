'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');
const E=require('../engine/medium-7x7.js');

const APPROVED_HEAD='25e5c1b911472390c8e2982e1d5bee8f58aaad6a';
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const pristineModule=new Module(path.join(__dirname,'approved-performance-engine.js'),module);
pristineModule.filename=path.join(__dirname,'approved-performance-engine.js');pristineModule.paths=module.paths;pristineModule._compile(source,pristineModule.filename);
const P=pristineModule.exports;
const IDS=Array.from({length:10},(_,i)=>`RULESV2-PROFILE-DIAG-${String(i+1).padStart(2,'0')}`);
const BASE_BUDGET={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const REQUEST={n:7,difficulty:'medium',require:{},forbid:[]};

function run(label,harvestNecessityWitnesses){
 const rows=[],start=Date.now();
 for(const id of IDS){
  const t=Date.now(),r=E.generateDiagnosticBoardById(id,{...BASE_BUDGET,harvestNecessityWitnesses},REQUEST),d=r.search;
  assert.strictEqual(d.privateWitnessNecessityContradictions,0,`${id}: private-witness contradiction`);
  assert.strictEqual(d.freshPartialWitnessRepairSearches,0,`${id}: solver-based witness repair occurred`);
  rows.push({id,elapsedMs:Date.now()-t,mediumSuccess:!!r.puzzle,nodes:d.nodesExplored,finalCePoolSize:d.sharedCounterexamplePoolSize,ceReuseHits:d.reusedCounterexampleHits,freshCeSolverCalls:d.freshCounterexampleSolverCalls,coverageValidUniqueLeaves:d.coverageValidUniqueLeaves,finalQualityPasses:d.finalPersonalClueQualityPasses,necessityChecks:d.necessityValidations,irredundantLeaves:d.irredundantLeaves,classification:r.puzzle?E.classifyMedium(r.metrics):null,necessityWitnessesDiscovered:d.necessityWitnessesDiscovered,uniqueWitnessesHarvested:d.uniqueNecessityWitnessesHarvested,duplicateWitnessesIgnored:d.duplicateNecessityWitnessesIgnored,poolBeforeTotal:d.cePoolSizeBeforeNecessityTotal,poolAfterTotal:d.cePoolSizeAfterNecessityTotal,selectedCluesAtNecessityLeaves:d.selectedCluesAtNecessityLeaves,certifiedBefore:d.poolCertifiedCluesBeforeNecessity,certifiedAfter:d.poolCertifiedCluesAfterNecessity,allCertifiedBefore:d.completeLeavesAllCluesPoolCertifiedBefore,allCertifiedAfter:d.completeLeavesAllCluesPoolCertifiedAfter,beforeCorrelation:d.poolCertificationBeforeCorrelation,afterCorrelation:d.poolCertificationAfterCorrelation,puzzle:r.puzzle||null});
 }
 const wallClockMs=Date.now()-start,sum=k=>rows.reduce((n,r)=>n+(r[k]||0),0),necessityChecks=sum('necessityChecks'),selected=sum('selectedCluesAtNecessityLeaves'),merge=key=>{
  const out={all:{necessityPass:0,necessityFail:0},partial:{necessityPass:0,necessityFail:0},none:{necessityPass:0,necessityFail:0}};
  for(const row of rows)for(const kind of Object.keys(out))for(const result of Object.keys(out[kind]))out[kind][result]+=row[key][kind][result];return out
 };
 return{label,harvestNecessityWitnesses,wallClockMs,nodes:sum('nodes'),mediumSuccesses:sum('mediumSuccess'),averageFinalCePoolSize:sum('finalCePoolSize')/rows.length,ceReuseHits:sum('ceReuseHits'),freshCeSolverCalls:sum('freshCeSolverCalls'),coverageValidUniqueLeaves:sum('coverageValidUniqueLeaves'),finalQualityPasses:sum('finalQualityPasses'),necessityChecks,irredundantLeaves:sum('irredundantLeaves'),irredundantLeafRate:necessityChecks?sum('irredundantLeaves')/necessityChecks:null,distribution:{clear:rows.filter(r=>r.classification==='CLEAR MEDIUM').length,borderline:rows.filter(r=>r.classification==='BORDERLINE').length},necessityWitnessesDiscovered:sum('necessityWitnessesDiscovered'),uniqueWitnessesHarvested:sum('uniqueWitnessesHarvested'),duplicateWitnessesIgnored:sum('duplicateWitnessesIgnored'),averageCePoolBeforeNecessity:necessityChecks?sum('poolBeforeTotal')/necessityChecks:null,averageCePoolAfterNecessity:necessityChecks?sum('poolAfterTotal')/necessityChecks:null,privateWitnessCertificationRateBefore:selected?sum('certifiedBefore')/selected:null,privateWitnessCertificationRateAfter:selected?sum('certifiedAfter')/selected:null,leavesAllCluesCertifiedBefore:sum('allCertifiedBefore'),leavesAllCluesCertifiedAfter:sum('allCertifiedAfter'),certificationBeforeCorrelation:merge('beforeCorrelation'),certificationAfterCorrelation:merge('afterCorrelation'),rows};
}

function pristineValidate(row){
 const Q=JSON.parse(JSON.stringify(row.puzzle)),canonical=P.validate(Q),solutions=P.countSolutions(Q,2),necessity=P.validateNecessity(Q),human=P.strictSolve(Q),metrics=P.metrics(Q,human),gate=P.mediumAcceptance(metrics);
 assert(canonical.ok,`${row.id}: pristine validate failed`);assert.strictEqual(solutions,1,`${row.id}: pristine solution count`);assert(necessity.ok,`${row.id}: pristine necessity`);assert(human.ok&&human.searchCalls===0,`${row.id}: pristine human solve`);assert(gate.ok,`${row.id}: pristine Medium gate`);
 for(const person of P.PEOPLE){assert(Q.constraints[person].length>=1&&Q.constraints[person].length<=2,`${row.id}: ${person} atomic count`);for(const clue of Q.constraints[person])assert(P.constraintSatisfied(Q,person,clue,Q.solution),`${row.id}: ${person} clue false`)}
 return{id:row.id,validate:true,solutions,necessity:true,humanSearchCalls:human.searchCalls,medium:true,classification:P.classifyMedium(metrics)};
}

const control=run('CONTROL: approved behavior, harvest disabled',false),experiment=run('EXPERIMENT: necessity-witness harvesting',true);
const pristineCrossValidation=experiment.rows.filter(r=>r.puzzle).map(pristineValidate);
const compact=x=>{const {rows,...summary}=x;return{...summary,boards:rows.map(({puzzle,beforeCorrelation,afterCorrelation,...r})=>r)}};
console.log(JSON.stringify({approvedHead:APPROVED_HEAD,engineBlobBefore:execFileSync('git',['rev-parse',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'}).trim(),engineBlobExperiment:execFileSync('git',['hash-object','engine/medium-7x7.js'],{encoding:'utf8'}).trim(),budget:BASE_BUDGET,ids:IDS,score:'UNCHANGED: coverageBonus + hits*500 + domainGain*3 - abs(combinedDomain-4)*2 - directPenalty + mediumHeuristicBonus - wideFirstPenalty',control:compact(control),experiment:compact(experiment),pristineCrossValidation},null,2));
