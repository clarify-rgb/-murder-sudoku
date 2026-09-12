'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path'),{performance}=require('perf_hooks');
const current=require('../engine/medium-7x7.js');
const APPROVED_HEAD='69839340cad100501b3e9485fca0a459c7717916';
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const approvedModule=new Module(path.join(__dirname,'approved-pipeline-engine.js'),module);approvedModule.filename=path.join(__dirname,'approved-pipeline-engine.js');approvedModule.paths=module.paths;approvedModule._compile(source,approvedModule.filename);
const approved=approvedModule.exports;
const ids=Array.from({length:10},(_,i)=>`RULESV2-PROFILE-DIAG-${String(i+1).padStart(2,'0')}`);
const budget={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const request={n:7,difficulty:'medium',require:{},forbid:[]};
const clueSignature=P=>P?JSON.stringify(Object.fromEntries(Object.keys(P.constraints).sort().map(p=>[p,P.constraints[p]]))):null;
function run(label,engine){
 const rows=[],start=performance.now();
 for(const id of ids){const t=performance.now(),r=engine.generateDiagnosticBoardById(id,budget,request),d=r.search;rows.push({id,elapsedMs:performance.now()-t,medium:!!r.puzzle,classification:r.puzzle?engine.classifyMedium(r.metrics):null,nodes:d.nodesExplored,coverageValidUniqueLeaves:d.coverageValidUniqueLeaves,finalQualityPasses:d.finalPersonalClueQualityPasses,necessityChecks:d.necessityValidations,irredundantLeaves:d.irredundantLeaves,finalCePoolSize:d.sharedCounterexamplePoolSize,clueSignature:clueSignature(r.puzzle),solution:r.puzzle?r.puzzle.solution:null,metrics:r.metrics||null,puzzle:r.puzzle||null})}
 return{label,wallClockMs:performance.now()-start,mediumSuccesses:rows.filter(r=>r.medium).length,distribution:{clear:rows.filter(r=>r.classification==='CLEAR MEDIUM').length,borderline:rows.filter(r=>r.classification==='BORDERLINE').length},acceptedBoardIds:rows.filter(r=>r.medium).map(r=>r.id),nodes:rows.reduce((n,r)=>n+r.nodes,0),rows}
}
const before=run('approved',approved),after=run('pipeline-refactor',current);
assert.deepStrictEqual(after.acceptedBoardIds,before.acceptedBoardIds,'accepted board IDs changed');assert.strictEqual(after.mediumSuccesses,before.mediumSuccesses,'Medium yield changed');assert.deepStrictEqual(after.distribution,before.distribution,'classification distribution changed');
for(const a of after.rows.filter(r=>r.medium)){const b=before.rows.find(r=>r.id===a.id);assert.strictEqual(a.clueSignature,b.clueSignature,`${a.id}: clue set changed`);assert.deepStrictEqual(a.solution,b.solution,`${a.id}: solution changed`);assert.deepStrictEqual(a.metrics,b.metrics,`${a.id}: metrics changed`)}

const fixture=JSON.parse(JSON.stringify(before.rows.find(r=>r.medium).puzzle)),initialDomains=current.initialDomainsWithTrace(fixture).domains;
for(let i=0;i<20;i++){approved.strictSolve(fixture);current.strictSolve(fixture)}
const iterations=200,measure=fn=>{const start=performance.now();for(let i=0;i<iterations;i++)fn();return performance.now()-start};
const strictBeforeMs=measure(()=>approved.strictSolve(fixture)),strictAfterMs=measure(()=>current.strictSolve(fixture));
const raw=approved.strictSolve(fixture),logIterations=500,logStart=performance.now();for(let i=0;i<logIterations;i++)current.buildCanonicalDeductionLog(fixture,{...raw,initialDomains});const logMs=performance.now()-logStart;
const compact=run=>({...run,rows:run.rows.map(({puzzle,clueSignature,solution,metrics,...row})=>row)});
console.log(JSON.stringify({approvedHead:APPROVED_HEAD,engineBlobBefore:execFileSync('git',['rev-parse',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'}).trim(),engineBlobAfter:execFileSync('git',['hash-object','engine/medium-7x7.js'],{encoding:'utf8'}).trim(),budget,ids,before:compact(before),after:compact(after),runtimeOverhead:{strictSolveIterations:iterations,strictSolveBeforeMs:strictBeforeMs,strictSolveAfterMs:strictAfterMs,strictSolveAverageBeforeMs:strictBeforeMs/iterations,strictSolveAverageAfterMs:strictAfterMs/iterations,strictSolveOverheadPercent:(strictAfterMs/strictBeforeMs-1)*100,logConstructionIterations:logIterations,logConstructionTotalMs:logMs,logConstructionAverageMs:logMs/logIterations}},null,2));
