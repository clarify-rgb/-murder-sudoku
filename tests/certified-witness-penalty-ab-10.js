'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');
const experiment=require('../engine/medium-7x7.js');

const APPROVED_HEAD='c607290de7360be49169d10bbc1402ea8c2dd985';
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const approvedModule=new Module(path.join(__dirname,'approved-harvesting-engine.js'),module);
approvedModule.filename=path.join(__dirname,'approved-harvesting-engine.js');approvedModule.paths=module.paths;approvedModule._compile(source,approvedModule.filename);
const approved=approvedModule.exports;
const IDS=Array.from({length:10},(_,i)=>`RULESV2-PROFILE-DIAG-${String(i+1).padStart(2,'0')}`);
const BUDGET={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const REQUEST={n:7,difficulty:'medium',require:{},forbid:[]};

function run(label,engine){
 const rows=[],start=Date.now();
 for(const id of IDS){
  const t=Date.now(),r=engine.generateDiagnosticBoardById(id,BUDGET,REQUEST),d=r.search;
  assert.strictEqual(d.privateWitnessNecessityContradictions,0,`${id}: private-witness contradiction`);
  assert.strictEqual(d.freshPartialWitnessRepairSearches,0,`${id}: solver-based witness repair occurred`);
  rows.push({id,elapsedMs:Date.now()-t,mediumSuccess:!!r.puzzle,nodes:d.nodesExplored,finalCePoolSize:d.sharedCounterexamplePoolSize,ceReuseHits:d.reusedCounterexampleHits,freshCeSolverCalls:d.freshCounterexampleSolverCalls,coverageValidUniqueLeaves:d.coverageValidUniqueLeaves,finalQualityPasses:d.finalPersonalClueQualityPasses,necessityChecks:d.necessityValidations,irredundantLeaves:d.irredundantLeaves,classification:r.puzzle?engine.classifyMedium(r.metrics):null,selectedCluesAtNecessityLeaves:d.selectedCluesAtNecessityLeaves,certifiedAfter:d.poolCertifiedCluesAfterNecessity,allCertifiedAfter:d.completeLeavesAllCluesPoolCertifiedAfter,afterCorrelation:d.poolCertificationAfterCorrelation,certifiedBranchExtensions:d.certifiedWitnessBranchExtensions||0,certifiedSelectedClues:d.certifiedSelectedCluesOnExtensions||0,witnessesDestroyed:d.certifiedWitnessesDestroyed||0,poolReplacements:d.certifiedWitnessPoolReplacements||0,unrepairedLosses:d.unrepairedCertifiedWitnessLosses||0,totalPenalty:d.totalCertifiedWitnessPenaltyApplied||0,puzzle:r.puzzle||null});
 }
 const wallClockMs=Date.now()-start,sum=k=>rows.reduce((n,r)=>n+(r[k]||0),0),necessityChecks=sum('necessityChecks'),selected=sum('selectedCluesAtNecessityLeaves'),destroyed=sum('witnessesDestroyed'),certifiedSelected=sum('certifiedSelectedClues'),branches=sum('certifiedBranchExtensions'),merge=()=>{
  const out={all:{necessityPass:0,necessityFail:0},partial:{necessityPass:0,necessityFail:0},none:{necessityPass:0,necessityFail:0}};
  for(const row of rows)for(const kind of Object.keys(out))for(const result of Object.keys(out[kind]))out[kind][result]+=row.afterCorrelation[kind][result];return out
 };
 return{label,wallClockMs,nodes:sum('nodes'),mediumSuccesses:sum('mediumSuccess'),distribution:{clear:rows.filter(r=>r.classification==='CLEAR MEDIUM').length,borderline:rows.filter(r=>r.classification==='BORDERLINE').length},coverageValidUniqueLeaves:sum('coverageValidUniqueLeaves'),finalQualityPasses:sum('finalQualityPasses'),necessityChecks,irredundantLeaves:sum('irredundantLeaves'),irredundantLeafRate:necessityChecks?sum('irredundantLeaves')/necessityChecks:null,averageFinalCePoolSize:sum('finalCePoolSize')/rows.length,ceReuseHits:sum('ceReuseHits'),freshCeSolverCalls:sum('freshCeSolverCalls'),privateWitnessCertificationRate:selected?sum('certifiedAfter')/selected:null,leavesAllCluesCertified:sum('allCertifiedAfter'),certificationCorrelation:merge(),certifiedWitnessBranchExtensions:branches,certifiedSelectedCluesOnExtensions:certifiedSelected,witnessesDestroyed:destroyed,witnessDestructionRate:certifiedSelected?destroyed/certifiedSelected:null,poolReplacements:sum('poolReplacements'),poolReplacementRate:destroyed?sum('poolReplacements')/destroyed:null,unrepairedLosses:sum('unrepairedLosses'),unrepairedLossRate:destroyed?sum('unrepairedLosses')/destroyed:null,totalPenalty:sum('totalPenalty'),averagePenaltyPerExploredBranch:branches?sum('totalPenalty')/branches:null,rows};
}

function pristineValidate(row){
 const Q=JSON.parse(JSON.stringify(row.puzzle)),canonical=approved.validate(Q),solutions=approved.countSolutions(Q,2),necessity=approved.validateNecessity(Q),human=approved.strictSolve(Q),metrics=approved.metrics(Q,human),gate=approved.mediumAcceptance(metrics);
 assert(canonical.ok,`${row.id}: pristine validate failed`);assert.strictEqual(solutions,1,`${row.id}: pristine solution count`);assert(necessity.ok,`${row.id}: pristine necessity`);assert(human.ok&&human.searchCalls===0,`${row.id}: pristine human solve`);assert(gate.ok,`${row.id}: pristine Medium gate`);
 for(const person of approved.PEOPLE){assert(Q.constraints[person].length>=1&&Q.constraints[person].length<=2,`${row.id}: ${person} atomic count`);for(const clue of Q.constraints[person])assert(approved.constraintSatisfied(Q,person,clue,Q.solution),`${row.id}: ${person} clue false`)}
 for(const clue of Q.globalConstraints||[])assert(approved.constraintSatisfied(Q,null,clue,Q.solution),`${row.id}: global clue false`);
 return{id:row.id,validate:true,solutions,necessity:true,humanSearchCalls:human.searchCalls,medium:true,classification:approved.classifyMedium(metrics)};
}

const control=run('CONTROL: approved harvesting engine',approved),candidate=run('EXPERIMENT: certified-witness loss penalty 750',experiment);
assert.strictEqual(candidate.totalPenalty,candidate.unrepairedLosses*750,'aggregate penalty must equal losses × 750');
const pristineCrossValidation=candidate.rows.filter(r=>r.puzzle).map(pristineValidate);
const compact=x=>{const {rows,...summary}=x;return{...summary,boards:rows.map(({puzzle,afterCorrelation,...r})=>r)}};
console.log(JSON.stringify({approvedHead:APPROVED_HEAD,engineBlobBefore:execFileSync('git',['rev-parse',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'}).trim(),engineBlobExperiment:execFileSync('git',['hash-object','engine/medium-7x7.js'],{encoding:'utf8'}).trim(),budget:BUDGET,ids:IDS,oldScore:'coverageBonus + hits*500 + domainGain*3 - abs(combinedDomain-4)*2 - directPenalty + mediumHeuristicBonus - wideFirstPenalty',newScore:'oldScore - certifiedWitnessLosses*750',control:compact(control),experiment:compact(candidate),pristineCrossValidation},null,2));
