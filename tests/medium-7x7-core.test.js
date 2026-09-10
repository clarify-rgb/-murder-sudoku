'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');
const E=require('../engine/easy-6x6-profiles.js');

const id=(r,c)=>r*M.N+c;
function connected(cells){if(!cells.length)return false;const seen=new Set([`${cells[0].r},${cells[0].c}`]),stack=[cells[0]];while(stack.length){const a=stack.pop();for(const b of cells){const k=`${b.r},${b.c}`;if(!seen.has(k)&&Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1){seen.add(k);stack.push(b)}}}return seen.size===cells.length}
function roomConnected(R,rid){const cells=[];for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(R[r][c]===rid)cells.push({r,c});return connected(cells)}
function assertObjectModel(P){for(const o of P.objects){const occ=M.objectOccurrences(P,o.name);assert(occ.length>=1);assert([1,2,3].includes(o.footprintSize));for(const q of occ){assert.strictEqual(q.cells.length,o.footprintSize,`${o.name} size mismatch`);assert(connected(q.cells),`${o.name} disconnected occurrence`);const rooms=new Set(q.cells.map(x=>P.regionOf[x.r][x.c]));assert.strictEqual(rooms.size,1,`${o.name} crosses room`)}if(o.blocking)for(const q of occ)for(const x of q.cells)assert(M.blockedCell(P,x),`${o.name} Locked cell not blocking`)}}

assert.strictEqual(M.N,7);
assert.deepStrictEqual(M.PEOPLE,['A','B','C','D','E','F','G']);
assert.strictEqual(M.VICTIM,'G');
assert.deepStrictEqual(M.CLUE_TYPES,E.CLUE_TYPES,'Medium must preserve Easy clue vocabulary');

const R=M.generateRegionGrid();
assert(R&&R.length===7&&R.every(row=>row.length===7),'room grid must be 7x7');
const roomIds=[...new Set(R.flat())];
assert(roomIds.length>=5,'must generate multiple irregular rooms');
for(const rid of roomIds)assert(roomConnected(R,rid),`room ${rid} must be connected`);

let P=M.generateById('MEDIUM-CORE-001',2500);
assert(P,'deterministic Medium puzzle must generate');
assert.strictEqual(P.people.length,7);
assert.strictEqual(P.victim,'G');
assert.deepStrictEqual(P.objective,{type:'locatePerson',person:'G'});
assert((P.clues.G||[]).length>=1&&(P.clues.G||[]).length<=2,'G must receive ordinary clue(s)');
assert(!(P.clues.G||[]).some(c=>c.type==='victim'),'G must not receive a victim pseudo-clue');
assert.strictEqual(P.globalRules.length,0,'no global rules yet');
assert.strictEqual(new Set(M.PEOPLE.map(p=>P.solution[p].r)).size,7,'one person per row');
assert.strictEqual(new Set(M.PEOPLE.map(p=>P.solution[p].c)).size,7,'one person per column');
assert(P.regionOf.length===7&&P.regionOf.every(row=>row.length===7));
assertObjectModel(P);
assert(M.validateStoredSolutionAgainstClues(P).valid,'stored solution must satisfy displayed clues');
assert(M.fullValid(P,P.solution),'stored solution must be fully valid');
assert.strictEqual(P.validation.solutions,1,'unique solution required');
assert.strictEqual(P.validation.human.searchCalls,0,'human solver must use zero search');
assert(M.PEOPLE.every(p=>(P.clues[p]||[]).length<=2),'max 2 clues/person');

// Reproduction must preserve the complete generated puzzle representation.
const P2=M.generateById('MEDIUM-CORE-001',2500);
assert(P2,'same Puzzle ID must regenerate');
function signature(Q){return JSON.stringify({profile:Q.profile,regionOf:Q.regionOf,roomNames:Q.roomNames,objects:Q.objects.map(o=>({id:o.id,name:o.name,blocking:o.blocking,footprintSize:o.footprintSize,occurrences:M.objectOccurrences(Q,o.name)})),clues:Q.clues,solution:Q.solution,objective:Q.objective,generationAttempts:Q.generationAttempts,selectionAttempts:Q.selectionAttempts})}
assert.strictEqual(signature(P),signature(P2),'Puzzle ID must reproduce IDs, footprint size, occurrences and cells exactly');

// Find generated repeated normal and Locked identities without a large benchmark.
let repeatedNormal=false,repeatedLocked=false,mixedSizes=false;
for(let i=2;i<=14&&!(repeatedNormal&&repeatedLocked&&mixedSizes);i++){
  const Q=M.generateById(`MEDIUM-CORE-${String(i).padStart(3,'0')}`,2500);assert(Q);
  assertObjectModel(Q);
  repeatedNormal ||= Q.objects.some(o=>!o.blocking&&M.objectOccurrences(Q,o.name).length>1);
  repeatedLocked ||= Q.objects.some(o=>o.blocking&&M.objectOccurrences(Q,o.name).length>1);
  mixedSizes ||= new Set(Q.objects.map(o=>o.footprintSize)).size>1;
}
assert(repeatedNormal,'repeated normal logical identity must remain supported');
assert(repeatedLocked,'repeated Locked logical identity must remain supported');
assert(mixedSizes,'different logical identities may use different footprint sizes');

console.log('MEDIUM 7x7 CORE PASS',JSON.stringify({rooms:roomIds.length,attempts:P.generationAttempts,selectionAttempts:P.selectionAttempts,initial:P.validation.metrics.initialCandidates,trace:P.validation.metrics.totalDeterministicTraceLength}));
