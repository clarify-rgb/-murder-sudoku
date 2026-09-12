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

const IDS=Array.from({length:10},(_,i)=>`RULESV2-PROFILE-DIAG-${String(i+1).padStart(2,'0')}`);
const BUDGET={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const REQUEST={n:7,difficulty:'medium',require:{},forbid:[]};

function run(engine,label){
 const rows=[],start=Date.now();
 for(const id of IDS){
  const t=Date.now(),result=engine.generateDiagnosticBoardById(id,BUDGET,REQUEST),d=result.search;
  rows.push({id,elapsedMs:Date.now()-t,mediumSuccess:!!result.puzzle,nodes:d.nodesExplored,completeUniqueLeaves:d.completeUniqueLeaves,coverageValidUniqueLeaves:d.coverageValidUniqueLeaves,finalQualityPasses:d.finalPersonalClueQualityPasses,finalQualityFailures:d.finalPersonalClueQualityFailures,necessityChecks:d.necessityValidations,irredundantLeaves:d.irredundantLeaves,classification:result.puzzle?engine.classifyMedium(result.metrics):null,puzzle:result.puzzle||null});
 }
 const wallClockMs=Date.now()-start,sum=k=>rows.reduce((n,row)=>n+(row[k]||0),0);
 return{label,wallClockMs,nodes:sum('nodes'),nodesPerSecond:sum('nodes')/(wallClockMs/1000),mediumSuccesses:sum('mediumSuccess'),completeUniqueLeaves:sum('completeUniqueLeaves'),coverageValidUniqueLeaves:sum('coverageValidUniqueLeaves'),finalQualityPasses:sum('finalQualityPasses'),finalQualityFailures:sum('finalQualityFailures'),necessityChecks:sum('necessityChecks'),irredundantLeaves:sum('irredundantLeaves'),distribution:{clear:rows.filter(r=>r.classification==='CLEAR MEDIUM').length,borderline:rows.filter(r=>r.classification==='BORDERLINE').length},rows};
}

function pristineValidate(row){
 const puzzle=JSON.parse(JSON.stringify(row.puzzle)),canonical=approved.validate(puzzle),solutions=approved.countSolutions(puzzle,2),necessity=approved.validateNecessity(puzzle),human=approved.strictSolve(puzzle),metrics=approved.metrics(puzzle,human),gate=approved.mediumAcceptance(metrics);
 assert(canonical.ok,`${row.id}: approved-engine validate failed`);
 assert.strictEqual(solutions,1,`${row.id}: approved-engine solution count`);
 assert(necessity.ok,`${row.id}: approved-engine necessity`);
 assert(human.ok&&human.searchCalls===0,`${row.id}: approved-engine strictSolve`);
 assert(gate.ok,`${row.id}: approved-engine Medium gate`);
 for(const person of approved.PEOPLE){
  assert(puzzle.constraints[person].length>=1&&puzzle.constraints[person].length<=2,`${row.id}: ${person} atomic count`);
  for(const clue of puzzle.constraints[person])assert(approved.constraintSatisfied(puzzle,person,clue,puzzle.solution),`${row.id}: ${person} displayed clue false`);
 }
 return{id:row.id,validate:true,solutions,necessity:true,humanSearchCalls:human.searchCalls,medium:true,classification:approved.classifyMedium(metrics)};
}

const current=run(approved,'CURRENT WIDE-FIRST');
const experiment=run(optimized,'OPTIMIZED WIDE-FIRST');
const pristineCrossValidation=experiment.rows.filter(row=>row.puzzle).map(pristineValidate);
const compact=arm=>{const {rows,...summary}=arm;return{...summary,boards:rows.map(({puzzle,...row})=>row)}};
console.log(JSON.stringify({approvedHead:APPROVED_HEAD,engineBlobBefore:execFileSync('git',['rev-parse',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'}).trim(),engineBlobAfter:execFileSync('git',['hash-object','engine/medium-7x7.js'],{encoding:'utf8'}).trim(),budget:BUDGET,ids:IDS,current:compact(current),optimized:compact(experiment),pristineCrossValidation},null,2));
