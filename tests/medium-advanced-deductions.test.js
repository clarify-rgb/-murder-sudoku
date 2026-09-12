'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');
const I=(r,c)=>r*M.N+c;
function baseP(){return{version:2,n:7,difficulty:'medium',people:[...M.PEOPLE],regionOf:Array.from({length:7},()=>Array(7).fill(0)),roomNames:['R1'],objects:[],constraints:Object.fromEntries(M.PEOPLE.map(p=>[p,[]])),globalConstraints:[],solution:Object.fromEntries(M.PEOPLE.map((p,i)=>[p,{r:i,c:i}]))}}
function D(map){const d={};for(const p of M.PEOPLE)d[p]=new Set((map[p]||[[6,6]]).map(([r,c])=>I(r,c)));return d}
function has(events,reason){return events.some(e=>e.reason===reason)}

M.resetSearchCallCount();
{
 const P=baseP(),d=D({A:[[0,0],[1,1]],B:[[0,1],[1,0]],C:[[0,3],[2,3]],D:[[2,4]],E:[[3,5]],F:[[4,6]],G:[[5,2]]}),events=[];
 assert(M.applyOwnership(P,d,'row',events));
 assert(!d.C.has(I(0,3))&&d.C.has(I(2,3)),'row ownership must remove C from owned row');
 assert(has(events,'row-ownership'),'trace must classify row ownership');
}
{
 const P=baseP(),d=D({A:[[0,2],[1,4]],B:[[2,2],[3,4]],C:[[4,2],[4,5]],D:[[5,0]],E:[[1,1]],F:[[2,3]],G:[[6,6]]}),events=[];
 assert(M.applyOwnership(P,d,'column',events));
 assert(!d.C.has(I(4,2))&&d.C.has(I(4,5)),'column ownership must remove C from owned column');
 assert(has(events,'column-ownership'),'trace must classify column ownership');
}
{
 const P=baseP(),d=D({A:[[0,0],[1,1]],B:[[1,2],[2,3]],C:[[0,4],[2,5]],D:[[1,6],[3,6]],E:[[4,0]],F:[[5,1]],G:[[6,2]]}),events=[];
 assert(M.applyOwnership(P,d,'row',events));
 assert(!d.D.has(I(1,6))&&d.D.has(I(3,6)),'3-person/3-row ownership must exclude other people');
 assert(has(events,'multi-row-ownership'),'trace must classify multi-row ownership');
}
{
 const P=baseP(),d=D({A:[[0,0],[1,1]],B:[[2,1],[3,2]],C:[[4,0],[5,2]],D:[[6,2],[6,4]],E:[[0,5]],F:[[1,6]],G:[[2,3]]}),events=[];
 assert(M.applyOwnership(P,d,'column',events));
 assert(!d.D.has(I(6,2))&&d.D.has(I(6,4)),'3-person/3-column ownership must exclude other people');
 assert(has(events,'multi-column-ownership'),'trace must classify multi-column ownership');
}
{
 const P=baseP(),d=D({A:[[0,0],[1,1]],B:[[0,1],[2,2]],C:[[3,3]],D:[[4,4]],E:[[5,5]],F:[[6,6]],G:[[2,4]]}),events=[];
 assert(M.applyIntersectingSquare(P,d,events));
 assert(!d.B.has(I(0,1))&&d.B.has(I(2,2)),'intersecting-square rule must remove square blocking every A candidate');
 assert(has(events,'intersecting-square-elimination'),'trace must classify intersecting-square elimination');
}
assert.strictEqual(M.getSearchCallCount(),0,'advanced human deductions must not invoke uniqueness search');

// The human-solver guard must detect either backtracking entry point.
{
 const P=baseP();
 M.resetSearchCallCount();
 assert.throws(()=>M.assertNoSearch(()=>M.countSolutions(P,2)),/countSolutions=1, findArrangement=0/);
 let calls=M.getSearchCallBreakdown();assert.deepStrictEqual(calls,{countSolutions:1,findArrangement:0,total:1});
 M.resetSearchCallCount();
 assert.throws(()=>M.assertNoSearch(()=>M.findCounterexample(P)),/countSolutions=0, findArrangement=1/);
 calls=M.getSearchCallBreakdown();assert.deepStrictEqual(calls,{countSolutions:0,findArrangement:1,total:1});
}

// Full propagation must retain explicit classifications and zero search.
{
 const P=baseP(),d=D({A:[[0,0],[1,1]],B:[[0,1],[1,0]],C:[[0,3],[2,3]],D:[[2,4],[3,4]],E:[[3,5],[4,5]],F:[[4,6],[5,6]],G:[[5,2],[6,2]]});
 M.resetSearchCallCount();
 const r=M.propagateDomains(P,d);
 assert(r.events.some(e=>['row-ownership','column-ownership','multi-row-ownership','multi-column-ownership','intersecting-square-elimination'].includes(e.reason)),'propagation must emit advanced deduction classification');
 assert.strictEqual(M.getSearchCallCount(),0,'propagateDomains must remain zero-search');
}
console.log('MEDIUM ADVANCED DEDUCTIONS PASS');
