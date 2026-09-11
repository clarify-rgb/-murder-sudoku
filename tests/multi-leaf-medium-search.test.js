'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

assert.strictEqual(typeof M.buildAtomicFactPool,'function');
assert.strictEqual(typeof M.searchIrredundantClueSet,'function');
assert.strictEqual(typeof M.generateBoardById,'function');
assert.strictEqual(typeof M.generateDiagnosticBoardById,'function');

const A=M.generateBoardById('RULESV2-ML-BOARD-REPRO',40);
const B=M.generateBoardById('RULESV2-ML-BOARD-REPRO',40);
assert(A&&B,'deterministic board must generate');
assert.deepStrictEqual(A.regionOf,B.regionOf);
assert.deepStrictEqual(A.objects,B.objects);
assert.deepStrictEqual(A.solution,B.solution);

const poolA=M.buildAtomicFactPool(A,{forbid:[]});
const poolB=M.buildAtomicFactPool(B,{forbid:[]});
assert(poolA.length>0);
assert.deepStrictEqual(poolA,poolB,'fact pool must remain deterministic');
for(const p of M.PEOPLE)assert(poolA.some(f=>f.subject===p),`fact pool coverage missing ${p}`);

const before=M.getSearchCallCount();
const h=M.strictSolve({...A,constraints:Object.fromEntries(M.PEOPLE.map(p=>[p,[]]))});
const after=M.getSearchCallCount();
assert.strictEqual(after,before,'human solver must not invoke generator/backtracking search');
assert.strictEqual(h.searchCalls,0);

const sr=M.searchIrredundantClueSet(A,{forbid:[]},{maxNodes:80,maxCounterexamples:80,maxMs:1200,maxBranchesPerNode:20,maxCompliantLeaves:3});
assert(sr&&sr.diagnostics,'search must return diagnostics');
const d=sr.diagnostics;
for(const k of ['compliantUniqueLeavesFound','leavesFailingMedium','leavesPassingMedium','distinctClueSetsExplored','witnessSearchesPerformed'])assert(Number.isInteger(d[k]),`missing diagnostic ${k}`);
assert(d.cacheHits&&d.cacheMisses,'board-local cache diagnostics required');
for(const k of ['alternative','solutionCount','witness','falseFacts','total'])assert(Number.isInteger(d.cacheHits[k])&&Number.isInteger(d.cacheMisses[k]),`missing cache counter ${k}`);
assert(d.compliantUniqueLeavesFound<=3,'compliant leaf cap must be enforced');
if(sr.puzzle){
 assert(d.leavesPassingMedium>=1);
 assert(d.firstPassingLeafIndex>=1&&d.firstPassingLeafIndex<=3);
 assert(sr.puzzle.validation&&sr.puzzle.validation.mediumAcceptance.ok);
 assert.strictEqual(sr.puzzle.validation.human.searchCalls,0);
}

console.log('MULTI-LEAF MEDIUM SEARCH STRUCTURAL REGRESSIONS PASS');
