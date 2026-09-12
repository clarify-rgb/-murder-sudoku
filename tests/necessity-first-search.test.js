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
 assert.notStrictEqual(f.constraint.type,'EMPTY_ROOM');
 assert(M.constraintTagValid(A,f.constraint));
 assert(M.constraintSatisfied(A,f.subject,f.constraint,A.solution));
 assert(Array.isArray(f.candidateDomain));
 const Q=JSON.parse(JSON.stringify(A));Q.constraints=Object.fromEntries(M.PEOPLE.map(p=>[p,[]]));Q.globalConstraints=[];Q.constraints[f.subject]=[f.constraint];
 const personRelation=['WEST_OF_PERSON','EAST_OF_PERSON','NORTH_OF_PERSON','SOUTH_OF_PERSON','ALONE_WITH'].includes(f.constraint.type);
 const independentlyDerived=personRelation?M.propagateDomains(Q).domains[f.subject].size:M.baseCandidates(A).filter(x=>M.unaryHolds(A,f.constraint,x)).length;
 assert.strictEqual(f.candidateDomain.length,independentlyDerived,'stored fact domain must match independently recomputed semantics');
}

const before=M.getSearchCallCount();
const h=M.strictSolve({...A,constraints:Object.fromEntries(M.PEOPLE.map(p=>[p,[]]))});
const after=M.getSearchCallCount();
assert.strictEqual(after,before,'human solver must not invoke search even on an unsolved board');
assert.strictEqual(h.searchCalls,0);

console.log('NECESSITY-FIRST SEARCH STRUCTURAL REGRESSIONS PASS');
