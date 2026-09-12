'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const R=Array.from({length:7},()=>Array(7).fill(0));
const solution={A:{r:0,c:0},C:{r:1,c:1},D:{r:2,c:2},B:{r:3,c:3},E:{r:4,c:4},F:{r:5,c:5},G:{r:6,c:6}};
function obj(name,size,tags,occurrences){return{id:name.replace(/ /g,'_'),name,footprintSize:size,tags,occurrences:occurrences.map((cells,i)=>({id:`${name}_${i}`,cells}))}}
function puzzle(objects,constraints){return{version:2,n:7,difficulty:'medium',people:[...M.PEOPLE],regionOf:R,roomNames:['R1'],solution:JSON.parse(JSON.stringify(solution)),objects,constraints:{A:[],B:constraints,C:[],D:[],E:[],F:[],G:[]},globalConstraints:[]}}
function allTrue(P,cs){for(const c of cs)assert(M.constraintSatisfied(P,'B',c,P.solution),`${c.type} must independently be true`)}

{
 const cs=[{type:'ONLY_PERSON_ON_OBJECT',object:'Object 2'},{type:'EAST_OF_OBJECT',object:'Object 2'}];
 const P=puzzle([obj('Object 2',1,['standable'],[[{r:3,c:3}],[{r:2,c:1}]])],cs);
 allTrue(P,cs);assert.strictEqual(M.sameObjectPairValid(P,'B',cs),false,'occupancy plus spatial relation to the same identity is forbidden');
}
{
 const cs=[{type:'ON_OBJECT',object:'Mirror'},{type:'DIAGONAL_TO_OBJECT',object:'Mirror'}];
 const P=puzzle([obj('Mirror',1,['standable','reflective'],[[{r:3,c:3}],[{r:2,c:2}]])],cs);
 allTrue(P,cs);assert.strictEqual(M.sameObjectPairValid(P,'B',cs),false,'ON plus DIAGONAL to the same identity is forbidden');
}
{
 const cs=[{type:'EAST_OF_OBJECT',object:'Object 1'},{type:'SOUTH_OF_OBJECT',object:'Object 1'}];
 const P=puzzle([obj('Object 1',2,['standable'],[[{r:1,c:1},{r:1,c:2}],[{r:4,c:5},{r:5,c:5}]])],cs);
 allTrue(P,cs);assert.strictEqual(M.sameObjectPairValid(P,'B',cs),true,'both relations hold against the same occurrence');
}
{
 const cs=[{type:'EAST_OF_OBJECT',object:'Object 1'},{type:'SOUTH_OF_OBJECT',object:'Object 1'}];
 const P=puzzle([obj('Object 1',1,['standable'],[[{r:4,c:1}],[{r:1,c:4}]])],cs);
 allTrue(P,cs);assert.strictEqual(M.sameObjectPairValid(P,'B',cs),false,'cross-occurrence-only support is forbidden');
}
{
 const cs=[{type:'EAST_OF_OBJECT',object:'Object 1'},{type:'ON_OBJECT',object:'Object 2'}];
 const P=puzzle([obj('Object 1',1,['standable'],[[{r:2,c:1}]]),obj('Object 2',1,['standable'],[[{r:3,c:3}]])],cs);
 allTrue(P,cs);assert.strictEqual(M.sameObjectPairValid(P,'B',cs),true,'different object identities remain legal');
}

console.log('MEDIUM SAME-OBJECT CLUE-PAIR RULES PASS');
