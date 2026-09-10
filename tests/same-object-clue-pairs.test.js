'use strict';
const assert=require('assert');
const E=require('../engine/easy-6x6-profiles.js');

const R=Array.from({length:6},()=>Array(6).fill(0));
const baseSolution={A:{r:0,c:0},C:{r:1,c:1},D:{r:2,c:2},B:{r:3,c:3},E:{r:4,c:4},F:{r:5,c:5}};
function puzzle(objects,clues){return{profile:'easy-1',people:[...E.PEOPLE],victim:'F',regionOf:R,roomNames:['R1'],solution:JSON.parse(JSON.stringify(baseSolution)),objects,clues:{A:[],B:clues,C:[],D:[],E:[],F:[]},globalRules:[],objective:{type:'locatePerson',person:'F'}}}
function obj(name,occurrences){return{name,icon:'o',blocking:false,occurrences:occurrences.map(cells=>({cells}))}}
function clue(type,object,extra={}){return{type,object,text:`${type} ${object}`,...extra}}
function individualTrue(P,cs){for(const c of cs)assert.strictEqual(E.clueSatisfied(P,'B',c,P.solution),true,`expected canonical ${c.type} true`)}

let passed=0;
{
  const cs=[clue('onlyOnObject','Object 2'),clue('eastOfObject','Object 2')];
  const P=puzzle([obj('Object 2',[[{r:3,c:3}],[{r:2,c:1}]])],cs);
  individualTrue(P,cs);
  const q=E.sameObjectPairCoherence(P,'B',cs);
  assert.strictEqual(q.ok,false); assert.strictEqual(q.issues[0].kind,'occupancy-relation');
  assert.strictEqual(E.cluePairCoherence(P,'B',cs).ok,false); passed++;
}
{
  const cs=[clue('onObject','Object 3'),clue('diagonal','Object 3')];
  const P=puzzle([obj('Object 3',[[{r:3,c:3}],[{r:2,c:2}]])],cs);
  individualTrue(P,cs);
  const q=E.sameObjectPairCoherence(P,'B',cs);
  assert.strictEqual(q.ok,false); assert.strictEqual(q.issues[0].kind,'occupancy-relation'); passed++;
}
{
  const cs=[clue('eastOfObject','Object 1'),clue('southOfObject','Object 1')];
  const P=puzzle([obj('Object 1',[[{r:1,c:1},{r:1,c:2}],[{r:4,c:5}]])],cs);
  individualTrue(P,cs);
  const q=E.sameObjectPairCoherence(P,'B',cs);
  assert.strictEqual(q.ok,true); assert.strictEqual(q.issues.length,0);
  const occ=E.objectOccurrences(P,'Object 1');
  assert.strictEqual(E.objectClueHoldsForOccurrence(P,cs[0],P.solution.B,occ[0]),true);
  assert.strictEqual(E.objectClueHoldsForOccurrence(P,cs[1],P.solution.B,occ[0]),true); passed++;
}
{
  const cs=[clue('eastOfObject','Object 1'),clue('southOfObject','Object 1')];
  const P=puzzle([obj('Object 1',[[{r:4,c:1}],[{r:1,c:4}]])],cs);
  individualTrue(P,cs);
  const occ=E.objectOccurrences(P,'Object 1');
  assert.strictEqual(E.objectClueHoldsForOccurrence(P,cs[0],P.solution.B,occ[0]),true);
  assert.strictEqual(E.objectClueHoldsForOccurrence(P,cs[1],P.solution.B,occ[0]),false);
  assert.strictEqual(E.objectClueHoldsForOccurrence(P,cs[0],P.solution.B,occ[1]),false);
  assert.strictEqual(E.objectClueHoldsForOccurrence(P,cs[1],P.solution.B,occ[1]),true);
  const q=E.sameObjectPairCoherence(P,'B',cs);
  assert.strictEqual(q.ok,false); assert.strictEqual(q.issues[0].kind,'cross-occurrence-only'); passed++;
}
{
  const cs=[clue('eastOfObject','Object 1'),clue('onObject','Object 2')];
  const P=puzzle([obj('Object 1',[[{r:2,c:1}]]),obj('Object 2',[[{r:3,c:3}]])],cs);
  individualTrue(P,cs);
  const q=E.sameObjectPairCoherence(P,'B',cs);
  assert.strictEqual(q.ok,true); assert.strictEqual(q.sameObjectPair,false); assert.strictEqual(q.issues.length,0); passed++;
}
console.log(`Same-object clue-pair regressions ${passed}/5 PASS`);
