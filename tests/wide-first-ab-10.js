'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path'),{execFileSync}=require('child_process');
const E=require('../engine/medium-7x7.js');
const STEP_A='9b1708d9d6fe26781158feefcb812e4d7c63ad0a';
const temp=path.join(os.tmpdir(),`pristine-medium-${process.pid}.js`);
fs.writeFileSync(temp,execFileSync('git',['show',`${STEP_A}:engine/medium-7x7.js`],{encoding:'utf8'}));
const P=require(temp);
const IDS=Array.from({length:10},(_,i)=>`RULESV2-PROFILE-DIAG-${String(i+1).padStart(2,'0')}`);
const BASE_BUDGET={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const request={n:7,difficulty:'medium',require:{},forbid:[]};

function run(label,wideFirstPenalty){
 const rows=[],start=Date.now();
 for(const id of IDS){
  const t=Date.now(),r=E.generateDiagnosticBoardById(id,{...BASE_BUDGET,wideFirstPenalty},request),d=r.search;
  rows.push({id,elapsedMs:Date.now()-t,board:r.board&&JSON.stringify({regionOf:r.board.regionOf,objects:r.board.objects,solution:r.board.solution}),mediumSuccess:!!r.puzzle,nodes:d.nodesExplored,coverageValidUniqueLeaves:d.coverageValidUniqueLeaves,qualityPasses:d.finalPersonalClueQualityPasses,qualityFailures:d.finalPersonalClueQualityFailures,necessityValidations:d.necessityValidations,irredundantLeaves:d.irredundantLeaves,classification:r.puzzle?E.classifyMedium(r.metrics):null,wideFirstCluesSelected:d.wideFirstCluesSelected,branchesContainingWideFirstClue:d.branchesContainingWideFirstClue,wideFirstPeopleRescuedBySecondClue:d.wideFirstPeopleRescuedBySecondClue,wideFirstRescuedUniqueLeaves:d.wideFirstRescuedUniqueLeaves,wideFirstRescuedPeopleAtUniqueLeaves:d.wideFirstRescuedPeopleAtUniqueLeaves,puzzle:r.puzzle||null});
 }
 const sum=k=>rows.reduce((n,r)=>n+r[k],0),qualityPasses=sum('qualityPasses'),qualityFailures=sum('qualityFailures');
 return{label,wideFirstPenalty,wallClockMs:Date.now()-start,mediumSuccesses:sum('mediumSuccess'),nodes:sum('nodes'),coverageValidUniqueLeaves:sum('coverageValidUniqueLeaves'),finalPersonalClueQualityPasses:qualityPasses,finalPersonalClueQualityFailures:qualityFailures,finalPersonalClueQualityPassRate:qualityPasses+qualityFailures?qualityPasses/(qualityPasses+qualityFailures):null,necessityValidations:sum('necessityValidations'),irredundantLeaves:sum('irredundantLeaves'),distribution:{clear:rows.filter(r=>r.classification==='CLEAR MEDIUM').length,borderline:rows.filter(r=>r.classification==='BORDERLINE').length},wideFirstCluesSelected:sum('wideFirstCluesSelected'),branchesContainingWideFirstClue:sum('branchesContainingWideFirstClue'),wideFirstPeopleRescuedBySecondClue:sum('wideFirstPeopleRescuedBySecondClue'),wideFirstRescuedUniqueLeaves:sum('wideFirstRescuedUniqueLeaves'),wideFirstRescuedPeopleAtUniqueLeaves:sum('wideFirstRescuedPeopleAtUniqueLeaves'),rows};
}

function pristineValidate(row){
 const Q=JSON.parse(JSON.stringify(row.puzzle)),canonical=P.validate(Q),solutions=P.countSolutions(Q,2),necessity=P.validateNecessity(Q),human=P.strictSolve(Q),metrics=P.metrics(Q,human),gate=P.mediumAcceptance(metrics);
 assert(canonical.ok,`${row.id}: pristine validate failed`);assert.strictEqual(solutions,1,`${row.id}: pristine solution count`);assert(necessity.ok,`${row.id}: pristine necessity`);assert(human.ok&&human.searchCalls===0,`${row.id}: pristine human solve`);assert(gate.ok,`${row.id}: pristine Medium gate`);
 for(const person of P.PEOPLE){assert(Q.constraints[person].length>=1&&Q.constraints[person].length<=2,`${row.id}: ${person} atomic count`);for(const clue of Q.constraints[person])assert(P.constraintSatisfied(Q,person,clue,Q.solution),`${row.id}: ${person} clue false`)}
 return{id:row.id,validate:true,solutions,necessity:true,humanSearchCalls:human.searchCalls,medium:true,classification:P.classifyMedium(metrics)};
}

try{
 const control=run('CONTROL',0),experiment=run('EXPERIMENT',E.WIDE_FIRST_PENALTY);
 for(let i=0;i<IDS.length;i++)assert.strictEqual(control.rows[i].board,experiment.rows[i].board,`${IDS[i]} board seed changed between arms`);
 const pristineCrossValidation=experiment.rows.filter(r=>r.puzzle).map(pristineValidate);
 const compact=x=>{const {rows,...summary}=x;return{...summary,boards:rows.map(({board,puzzle,...r})=>r)}};
 console.log(JSON.stringify({stepA:STEP_A,engineBlobBefore:execFileSync('git',['rev-parse',`${STEP_A}:engine/medium-7x7.js`],{encoding:'utf8'}).trim(),engineBlobAfter:execFileSync('git',['hash-object','engine/medium-7x7.js'],{encoding:'utf8'}).trim(),budget:BASE_BUDGET,ids:IDS,control:compact(control),experiment:compact(experiment),pristineCrossValidation},null,2));
}finally{try{fs.unlinkSync(temp)}catch{}}
