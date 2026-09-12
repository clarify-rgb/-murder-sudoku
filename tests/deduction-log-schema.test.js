'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const budget={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const request={n:7,difficulty:'medium',require:{},forbid:[]};
const result=M.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',budget,request);
assert(result.puzzle,'fixed deduction-log fixture must generate');
const a=M.strictSolve(result.puzzle),b=M.strictSolve(result.puzzle),log=a.deductionLog;
assert.deepStrictEqual(log,b.deductionLog,'identical solves must produce identical canonical logs');
assert.deepStrictEqual(Object.keys(log),['schemaVersion','solved','searchCalls','initialDomains','finalPlacements','events']);
assert.strictEqual(log.schemaVersion,1);assert.strictEqual(log.solved,true);assert.strictEqual(log.searchCalls,0);
assert.deepStrictEqual(Object.fromEntries(M.PEOPLE.map(p=>[p,log.initialDomains[p].length])),M.metrics(result.puzzle,a).initialCandidates,'initial snapshot must be post-clue-filter domains');
assert.deepStrictEqual(log.finalPlacements,a.placements);
assert.strictEqual(log.events.length,a.trace.length,'normalization must neither add nor remove events');

for(let i=0;i<log.events.length;i++){
 const e=log.events[i];assert.strictEqual(e.id,`D${String(i+1).padStart(4,'0')}`);assert.strictEqual(e.step,i+1);
 assert(M.CANONICAL_TECHNIQUES.includes(e.technique),`unsupported canonical technique ${e.technique}`);
 for(const key of ['round','subject','affectedPeople','beforeCandidates','removedCandidates','afterCandidates','causedBy','dependsOn','evidence'])assert(key in e,`${e.id} missing ${key}`);
}
assert(!log.events.some(e=>['NAKED_SINGLE','HIDDEN_SINGLE_CELL'].includes(e.technique)),'unsupported techniques must not be fabricated');
for(const e of log.events.filter(e=>e.technique==='FORCED_PLACEMENT')){
 assert.strictEqual(e.dependsOn.length,1,`${e.id} must depend on its causal removal`);
 const cause=log.events.find(x=>x.id===e.dependsOn[0]);assert(cause&&cause.step===e.step-1&&cause.subject===e.subject,'forced-placement dependency must be the immediately causal same-subject removal');
 assert.strictEqual(cause.afterCandidates.length,1);assert.deepStrictEqual(e.afterCandidates,cause.afterCandidates);
}
for(const e of log.events.filter(e=>['ROW_ELIMINATION','COLUMN_ELIMINATION'].includes(e.technique)&&e.dependsOn.length)){
 const cause=log.events.find(x=>x.id===e.dependsOn[0]);assert(cause&&cause.technique==='FORCED_PLACEMENT','row/column dependency must reference a real earlier placement');assert(cause.step<e.step);
}

const roomBoard=M.generateBoardById('MEDIUM-ROOM-LOG-TEST',40),room=roomBoard.roomNames[roomBoard.regionOf[roomBoard.solution.A.r][roomBoard.solution.A.c]];
roomBoard.constraints=Object.fromEntries(M.PEOPLE.map(p=>[p,[]]));roomBoard.globalConstraints=[];roomBoard.constraints.A=[{type:'ALONE_IN_ROOM',room}];
const roomLog=M.strictSolve(roomBoard).deductionLog;
assert(roomLog.events.some(e=>e.evidence.rawReason==='relational-deduction'&&e.technique==='ROOM_DEDUCTION'),'actual room-cardinality propagation must normalize to ROOM_DEDUCTION');

console.log('CANONICAL DEDUCTION-LOG SCHEMA PASS');
