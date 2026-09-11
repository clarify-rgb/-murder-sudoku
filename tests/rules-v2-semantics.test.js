'use strict';
const assert=require('assert');
const fs=require('fs');
const M=require('../engine/medium-7x7.js');
const E6=M.createEngine(6);
function emptyPuzzle(E, regionOf){const n=E.N,people=E.PEOPLE;const roomCount=Math.max(...regionOf.flat())+1;return{version:2,n,people:[...people],regionOf,roomNames:Array.from({length:roomCount},(_,i)=>`R${i+1}`),objects:[],constraints:Object.fromEntries(people.map(p=>[p,[]])),globalConstraints:[],solution:Object.fromEntries(people.map((p,i)=>[p,{r:i,c:i}]))}}
function all(n,id=0){return Array.from({length:n},()=>Array(n).fill(id))}
function obj(name,size,tags,occs){return{id:name.replace(/ /g,'_'),name,footprintSize:size,tags,occurrences:occs.map((cells,i)=>({id:`${name}_${i}`,cells}))}}

// Blocked cell does not create room wall; blocked corner remains a geometric corner but not playable.
{
 const P=emptyPuzzle(E6,all(6));
 P.objects=[obj('Locked 1',1,['blocking'],[[{r:0,c:0}],[{r:2,c:2}]])];
 assert.strictEqual(E6.roomWall(P,2,1,0,1),false);
 assert.strictEqual(E6.isCornerCell(P,{r:0,c:0}),true);
 assert.strictEqual(E6.baseCandidates(P).some(x=>x.r===0&&x.c===0),false);
}
// Canonical corner: rectangle, irregular notch/L, single-cell room, one-cell-wide corridor.
{
 const rect=all(6,1);for(let r=1;r<=3;r++)for(let c=1;c<=3;c++)rect[r][c]=0;const P=emptyPuzzle(E6,rect);
 const got=E6.cornerCells(P).filter(x=>x.room==='R1').map(x=>`${x.r},${x.c}`).sort();
 assert.deepStrictEqual(got,['1,1','1,3','3,1','3,3']);
}
{
 const R=all(6,1);[[1,1],[1,2],[1,3],[2,1],[3,1]].forEach(([r,c])=>R[r][c]=0);const P=emptyPuzzle(E6,R);
 assert(E6.isCornerCell(P,{r:1,c:1}));
 assert(E6.isCornerCell(P,{r:1,c:3}));
 assert(E6.isCornerCell(P,{r:3,c:1}));
 assert(!E6.isCornerCell(P,{r:2,c:1}),'middle of one-cell-wide stem has top/bottom room continuity and is not a corner');
}
{
 const R=all(6,0);R[2][2]=1;const P=emptyPuzzle(E6,R);assert(E6.isCornerCell(P,{r:2,c:2}));
}
{
 const R=all(6,0);for(let r=1;r<=4;r++)R[r][3]=1;const P=emptyPuzzle(E6,R);assert(E6.isCornerCell(P,{r:1,c:3}));assert(!E6.isCornerCell(P,{r:2,c:3}));assert(E6.isCornerCell(P,{r:4,c:3}));
}
// ON same identity => never BESIDE, for 1/2/3-cell and repeated occurrences.
for(const [size,cells] of [[1,[{r:1,c:1}]],[2,[{r:1,c:1},{r:1,c:2}]],[3,[{r:1,c:1},{r:1,c:2},{r:2,c:2}]]]){
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Object 1',size,['standable'],[cells])];for(const x of cells)assert.strictEqual(E6.besideObject(P,x,'Object 1'),false);
}
{
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Object 1',1,['standable'],[[{r:1,c:1}],[{r:1,c:2}]])];assert.strictEqual(E6.besideObject(P,{r:1,c:1},'Object 1'),false,'on occurrence A cannot be beside occurrence B of same identity');
}
// Across room wall is not beside.
{
 const R=all(6,0);for(let r=0;r<6;r++)for(let c=3;c<6;c++)R[r][c]=1;const P=emptyPuzzle(E6,R);P.objects=[obj('Object 1',1,['standable'],[[{r:2,c:2}]])];assert.strictEqual(E6.besideObject(P,{r:2,c:3},'Object 1'),false);
}
// Fixed footprint size and connected/same-room occurrence validation.
{
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Object 1',2,['standable'],[[{r:0,c:0},{r:0,c:1}],[{r:3,c:3},{r:4,c:3}]])];assert(E6.validateObjects(P));P.objects[0].occurrences[1].cells=[{r:3,c:3}];assert(!E6.validateObjects(P));
}
// Per-occurrence object direction; person direction is plain coordinate comparison.
{
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Object 1',2,['standable'],[[{r:2,c:1},{r:2,c:2}],[{r:4,c:4},{r:5,c:4}]])];assert(E6.directionalToObject(P,'EAST_OF_OBJECT',{r:0,c:3},'Object 1'));assert(E6.directionalToPerson('EAST_OF_PERSON',{r:0,c:5},{r:5,c:1}));
}
// Reflective-only diagonal; actual cells only.
{
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Mirror',3,['reflective'],[[{r:1,c:1},{r:1,c:2},{r:2,c:1}]]),obj('Object 1',1,['standable'],[[{r:3,c:3}]])];assert(E6.constraintTagValid(P,{type:'DIAGONAL_TO_OBJECT',object:'Mirror'}));assert(!E6.constraintTagValid(P,{type:'DIAGONAL_TO_OBJECT',object:'Object 1'}));assert.strictEqual(E6.diagonalToObject(P,{r:0,c:4},'Mirror'),false,'missing bounding-box cell must not create diagonal');
}
// Render data: row/column lines, reflective rays, corner source, room edges.
{
 const R=all(6,0);for(let r=0;r<6;r++)R[r][5]=1;const P=emptyPuzzle(E6,R);P.objects=[obj('Mirror',1,['reflective'],[[{r:2,c:2}]])];P.constraints.A=[{type:'ROW',row:2},{type:'COLUMN',column:4}];const d=E6.deriveRenderData(P);assert.strictEqual(d.line_cells.length,2);assert.strictEqual(d.line_cells[0].cells.length,6);assert.strictEqual(d.diagonal_rays.length,4);assert(d.room_boundary_edges.length>0);assert.deepStrictEqual(d.corner_cells,E6.cornerCells(P));
}
// Tag gating and impossible standable+blocking.
{
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Object 1',1,['standable'],[[{r:1,c:1}]]),obj('Locked 1',1,['blocking'],[[{r:2,c:2}]])];assert(E6.constraintTagValid(P,{type:'ON_OBJECT',object:'Object 1'}));assert(!E6.constraintTagValid(P,{type:'ON_OBJECT',object:'Locked 1'}));assert(!E6.constraintTagValid(P,{type:'DIAGONAL_TO_OBJECT',object:'Object 1'}));P.objects.push(obj('Bad',1,['standable','blocking'],[[{r:3,c:3}]]));assert(!E6.validateObjects(P));
}
// Atomic clue budget and compound rendering.
{
 const P=emptyPuzzle(E6,all(6));P.objects=[obj('Object 1',1,['standable'],[[{r:2,c:2}]])];P.constraints.A=[{type:'IN_ROOM',room:'R1'},{type:'NOT_BESIDE_OBJECT',object:'Object 1'}];assert.strictEqual(E6.atomicConstraintCount(P),2);assert.strictEqual(E6.printPersonConstraints(P,'A').length,1);P.constraints.A.push({type:'ROW',row:0});assert.strictEqual(E6.validateStructural(P).ok,false);
}
// Redundant atomic constraint is rejected independently.
{
 const P=emptyPuzzle(E6,all(6));for(let i=0;i<6;i++){const p=E6.PEOPLE[i];P.solution[p]={r:i,c:i};P.constraints[p]=[{type:'ROW',row:i},{type:'COLUMN',column:i}]}assert(E6.fullValid(P,P.solution));const n=E6.validateNecessity(P);assert.strictEqual(n.ok,false);assert.strictEqual(n.solutionCountWithoutConstraint,1);
}
// No narrative roles in engine source/API; objective metadata is independent and WHERE_PERSON needs >=3 own candidates.
{
 const src=fs.readFileSync('engine/medium-7x7.js','utf8');assert(!/victim|culprit|murderer|suspect/i.test(src));assert(!Object.keys(M).some(k=>/victim|culprit/i.test(k)));
 const P=emptyPuzzle(E6,all(6));P.constraints.A=[{type:'ROW',row:0}];assert(E6.validateObjective(P,{type:'WHERE_PERSON',person:'A'}));P.constraints.A=[{type:'ROW',row:0},{type:'COLUMN',column:0}];assert(!E6.validateObjective(P,{type:'WHERE_PERSON',person:'A'}));
}
// EMPTY_ROOM semantics supported but not generated as a special Medium clue here.
{
 const P=emptyPuzzle(E6,all(6));const R=all(6,0);R[5][5]=1;P.regionOf=R;P.roomNames=['R1','R2'];P.solution=Object.fromEntries(E6.PEOPLE.map((p,i)=>[p,{r:i<5?i:4,c:i}]));assert(E6.constraintSatisfied(P,null,{type:'EMPTY_ROOM',room:'R2'},P.solution));
}
// Request schema and N parameterization.
assert(M.validateRequest({n:7,difficulty:'medium',require:{empty_rooms:1,pairs:1},forbid:['diagonal']}).ok);
assert(!M.validateRequest({n:10,difficulty:'medium'}).ok);assert.strictEqual(M.createEngine(9).N,9);

// Deterministic ownership/intersection remain zero-search under Rules v2.
{
 const E=M, P=emptyPuzzle(E,all(7)), I=(r,c)=>r*7+c, D={};for(const p of E.PEOPLE)D[p]=new Set([[6,6]].map(([r,c])=>I(r,c)));D.A=new Set([I(0,0),I(1,1)]);D.B=new Set([I(0,1),I(1,0)]);D.C=new Set([I(0,3),I(2,3)]);const ev=[];E.resetSearchCallCount();assert(E.applyOwnership(P,D,'row',ev));assert(ev.some(e=>e.reason==='row-ownership'));assert.strictEqual(E.getSearchCallCount(),0);
}
// Puzzle-ID reproducibility including geometry, tags, atomic constraints, solution, objective and render metadata.
{
 const A=M.generateById('RULESV2-REPRO',80,{n:7,difficulty:'medium',require:{},forbid:[]});const B=M.generateById('RULESV2-REPRO',80,{n:7,difficulty:'medium',require:{},forbid:[]});assert(A&&B);const norm=P=>({regionOf:P.regionOf,objects:P.objects,constraints:P.constraints,solution:P.solution,objective:P.objective,metadata:P.metadata,render:P.render,generationAttempts:P.generationAttempts,selectionAttempts:P.selectionAttempts});assert.deepStrictEqual(norm(A),norm(B));assert.strictEqual(A.validation.human.searchCalls,0);assert(A.validation.necessity.ok);
}
console.log('RULES V2 SEMANTIC TESTS PASS');
