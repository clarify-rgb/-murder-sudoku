'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const A=M.generateBoardById('RULESV2-LAZY-STRUCT-BOARD',40);
const B=M.generateBoardById('RULESV2-LAZY-STRUCT-BOARD',40);
assert(A&&B,'deterministic board must generate');
assert.deepStrictEqual(A.regionOf,B.regionOf,'room generation changed');
assert.deepStrictEqual(A.objects,B.objects,'object generation changed');
assert.deepStrictEqual(A.solution,B.solution,'stored solution changed');

const pool=M.buildAtomicFactPool(A,{forbid:[]});
assert(pool.length>0);
for(const p of M.PEOPLE)assert(pool.some(f=>f.subject===p),`fact pool missing ${p}`);

const r=M.searchIrredundantClueSet(A,{forbid:[]},{maxNodes:4000,maxCounterexamples:1000,maxMs:1500,maxBranchesPerNode:30,maxCompliantLeaves:4});
assert(r&&r.diagnostics,'lazy search diagnostics required');
const d=r.diagnostics;
for(const k of [
 'nodesExplored','sharedCounterexamplePoolSize','reusedCounterexampleHits','freshCounterexampleSolverCalls',
 'completeUniqueLeaves','completeLeavesFailingNecessity','redundantCluesFoundAtFailedLeaves',
 'necessityValidations','necessityValidationTimeMs','compliantUniqueLeavesFound','leavesFailingMedium',
 'leavesPassingMedium','retainedValidWitnesses','witnessStatesMarkedUnknown'
])assert(Number.isFinite(d[k]),`missing lazy diagnostic ${k}`);
const calls=M.getSearchCallBreakdown();
assert.strictEqual(calls.findArrangement,d.freshCounterexampleSolverCalls,'every fresh counterexample diagnostic must correspond to a real arrangement search');
assert.strictEqual(d.counterexamplesEncountered,d.newCounterexamplesSolved+d.reusedCounterexampleHits,'every encountered counterexample must be either a newly found solution or a reused one');
assert.strictEqual(d.necessityValidations,d.completeLeavesFailingNecessity+d.compliantUniqueLeavesFound,'authoritative necessity must run exactly once for every coverage-valid unique leaf');
assert(d.compliantUniqueLeavesFound<=4,'compliant leaf cap must remain enforced');

if(r.puzzle){
 const P=r.puzzle;
 for(const p of M.PEOPLE)assert(P.constraints[p].length>=1&&P.constraints[p].length<=2,`${p} must have 1-2 atomics`);
 assert.strictEqual(M.countSolutions(P,2),1,'accepted candidate must remain unique');
 const necessity=M.validateNecessity(P);assert(necessity.ok,'accepted candidate must remain irredundant');
 const h=M.strictSolve(P);assert(h.ok&&h.searchCalls===0,'accepted candidate must remain deterministic human solve');
 const m=M.metrics(P,h);assert(M.mediumAcceptance(m).ok,'accepted candidate must pass unchanged Medium floor');
}

console.log('LAZY NECESSITY + SHARED COUNTEREXAMPLE STRUCTURAL REGRESSIONS PASS');
