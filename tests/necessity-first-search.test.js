'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

assert.strictEqual(typeof M.buildAtomicFactPool,'function');
assert.strictEqual(typeof M.searchIrredundantClueSet,'function');
assert.strictEqual(typeof M.generateBoardById,'function');
assert.strictEqual(typeof M.generateDiagnosticBoardById,'function');

const A=M.generateBoardById('RULESV2-NF-BOARD-REPRO',40);
const B=M.generateBoardById('RULESV2-NF-BOARD-REPRO',40);
assert(A&&B,'deterministic diagnostic board must generate');
assert.deepStrictEqual(A.regionOf,B.regionOf);
assert.deepStrictEqual(A.objects,B.objects);
assert.deepStrictEqual(A.solution,B.solution);

const poolA=M.buildAtomicFactPool(A,{forbid:[]});
const poolB=M.buildAtomicFactPool(B,{forbid:[]});
assert(poolA.length>0);
assert.deepStrictEqual(poolA,poolB,'fact pool must be deterministic for a Puzzle ID');
for(const p of M.PEOPLE)assert(poolA.some(f=>f.subject===p),`fact pool coverage missing ${p}`);
for(const f of poolA){
 assert.strictEqual(f.legal,true);
 assert.strictEqual(f.sameObjectQuality,true);
 assert.notStrictEqual(f.constraint.type,'EMPTY_ROOM');
 assert(M.constraintTagValid(A,f.constraint));
 assert(M.constraintSatisfied(A,f.subject,f.constraint,A.solution));
 assert(Array.isArray(f.candidateDomain));
 assert.strictEqual(f.candidateDomain.length,f.candidateDomainSize);
}

const before=M.getSearchCallCount();
const h=M.strictSolve({...A,constraints:Object.fromEntries(M.PEOPLE.map(p=>[p,[]]))});
const after=M.getSearchCallCount();
assert.strictEqual(after,before,'human solver must not invoke search even on an unsolved board');
assert.strictEqual(h.searchCalls,0);

console.log('NECESSITY-FIRST SEARCH STRUCTURAL REGRESSIONS PASS');
