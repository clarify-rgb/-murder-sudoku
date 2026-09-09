'use strict';
const assert=require('assert');
const E=require('../engine/easy-6x6-profiles.js');

function basePuzzle(objects, dClue=null){
  const regionOf=Array.from({length:6},()=>Array(6).fill(0));
  const solution={A:{r:0,c:1},B:{r:1,c:4},C:{r:2,c:5},D:{r:3,c:0},E:{r:4,c:2},F:{r:5,c:3}};
  const clues={A:[],B:[],C:[],D:dClue?[dClue]:[],E:[],F:[]};
  return {profile:'easy-1',people:[...E.PEOPLE],victim:'F',regionOf,roomNames:['R1'],solution,objects,clues,globalRules:[],objective:{type:'locatePerson',person:'F'}};
}
function locked1(occurrences){return {id:'locked-1',name:'Locked 1',icon:'L1',blocking:true,occurrences:occurrences.map(cells=>({cells}))};}
function object1(occurrences){return {id:'object-1',name:'Object 1',icon:'1',blocking:false,occurrences:occurrences.map(cells=>({cells}))};}
const diagonal={type:'diagonal',object:'Locked 1',text:'D was diagonal to Locked 1.'};

// TEST A: exact observed geometry: neither real occurrence is diagonal.
{
  const P=basePuzzle([locked1([[{r:2,c:0}],[{r:2,c:2}]])],diagonal);
  assert.strictEqual(E.unaryHolds(P,diagonal,P.solution.D),false,'Test A must be false');
  const v=E.validateStoredSolutionAgainstClues(P);
  assert.strictEqual(v.valid,false);
  assert.strictEqual(v.failures.length,1);
  assert.strictEqual(v.failures[0].person,'D');
  assert.strictEqual(E.fullValid(P,P.solution),false,'invalid stored solution must fail fullValid');
}

// TEST B: second occurrence is genuinely diagonal.
{
  const P=basePuzzle([locked1([[{r:2,c:0}],[{r:1,c:2}]])],diagonal);
  assert.strictEqual(E.unaryHolds(P,diagonal,P.solution.D),true,'Test B must be true via second occurrence');
  assert.strictEqual(E.validateStoredSolutionAgainstClues(P).valid,true);
}

// TEST C: any actual cell of one multi-cell occurrence may satisfy diagonal.
{
  const P=basePuzzle([locked1([[{r:1,c:1},{r:1,c:2}]])],diagonal);
  assert.strictEqual(E.unaryHolds(P,diagonal,P.solution.D),true,'Test C must be true via R2C3 footprint cell');
}

// TEST D: disconnected occurrences must not create imaginary diagonal cells.
{
  const P=basePuzzle([locked1([[{r:1,c:0}],[{r:1,c:3}]])],diagonal);
  assert.strictEqual(E.unaryHolds(P,diagonal,P.solution.D),false,'Test D must not invent R2C3 between disconnected occurrences');
}

// Audit repeated-identity object relation semantics.
{
  let P=basePuzzle([object1([[{r:3,c:0}],[{r:0,c:5}]])]);
  assert.strictEqual(E.unaryHolds(P,{type:'onObject',object:'Object 1'},P.solution.D),true,'onObject: any real occurrence');
  P=basePuzzle([object1([[{r:3,c:1}],[{r:0,c:5}]])]);
  assert.strictEqual(E.unaryHolds(P,{type:'besideObject',object:'Object 1'},P.solution.D),true,'besideObject: any real occurrence');
  assert.strictEqual(E.unaryHolds(P,{type:'notBesideObject',object:'Object 1'},P.solution.D),false,'notBesideObject: inverse over all occurrences');
  assert.strictEqual(E.unaryHolds(P,{type:'roomNotBesideObject',room:0,object:'Object 1'},P.solution.D),false,'roomNotBesideObject uses canonical beside semantics');
}

// onlyOnObject is logical-identity-wide, across all occurrences.
{
  const P=basePuzzle([object1([[{r:3,c:0}],[{r:0,c:1}]])],{type:'onlyOnObject',object:'Object 1',text:'D was the only person on Object 1.'});
  assert.strictEqual(E.clueSatisfied(P,'D',P.clues.D[0],P.solution),false,'A occupies another occurrence, so onlyOnObject must fail');
}

// Directional clues must evaluate per physical occurrence, not one joined disconnected extent.
{
  const P=basePuzzle([object1([[{r:3,c:0}],[{r:3,c:4}]])]);
  const x={r:3,c:3};
  assert.strictEqual(E.unaryHolds(P,{type:'westOfObject',object:'Object 1'},x),true,'west: may be west of a real occurrence');
  const y={r:3,c:1};
  assert.strictEqual(E.unaryHolds(P,{type:'eastOfObject',object:'Object 1'},y),true,'east: may be east of a real occurrence');
  const P2=basePuzzle([object1([[{r:0,c:3}],[{r:4,c:3}]])]);
  assert.strictEqual(E.unaryHolds(P2,{type:'northOfObject',object:'Object 1'},{r:3,c:3}),true,'north: per occurrence');
  assert.strictEqual(E.unaryHolds(P2,{type:'southOfObject',object:'Object 1'},{r:1,c:3}),true,'south: per occurrence');
}

console.log('solution/clue consistency regressions PASS');
