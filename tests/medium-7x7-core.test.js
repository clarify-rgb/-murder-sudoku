'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

function connected(cells){if(!cells.length)return false;const seen=new Set([`${cells[0].r},${cells[0].c}`]),stack=[cells[0]];while(stack.length){const a=stack.pop();for(const b of cells){const k=`${b.r},${b.c}`;if(!seen.has(k)&&Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1){seen.add(k);stack.push(b)}}}return seen.size===cells.length}
function roomConnected(R,rid){const cells=[];for(let r=0;r<M.N;r++)for(let c=0;c<M.N;c++)if(R[r][c]===rid)cells.push({r,c});return connected(cells)}
function assertObjectModel(P){
  const occupied=new Set;
  for(const o of P.objects){
    assert(o.tags.every(t=>M.OBJECT_TAGS.includes(t)),`${o.name} has invalid tag`);
    assert(!(o.tags.includes('standable')&&o.tags.includes('blocking')),`${o.name} cannot be standable and blocking`);
    assert([1,2,3].includes(o.footprintSize));
    const occ=M.objectOccurrences(P,o.name);assert(occ.length>=1);
    for(const q of occ){
      assert.strictEqual(q.cells.length,o.footprintSize,`${o.name} size mismatch`);
      assert(connected(q.cells),`${o.name} disconnected occurrence`);
      assert.strictEqual(new Set(q.cells.map(x=>P.regionOf[x.r][x.c])).size,1,`${o.name} crosses room`);
      for(const x of q.cells){const key=`${x.r},${x.c}`;assert(!occupied.has(key),`object overlap at ${key}`);occupied.add(key)}
    }
  }
  assert(M.validateObjects(P));
  const blocked=new Set((P.blocked||[]).map(x=>`${x.r},${x.c}`));
  const expected=new Set(P.objects.filter(o=>o.tags.includes('blocking')).flatMap(o=>o.occurrences).flatMap(o=>o.cells).map(x=>`${x.r},${x.c}`));
  assert.deepStrictEqual([...blocked].sort(),[...expected].sort(),'stored blocked cells must come from blocking-tagged objects');
}

assert.strictEqual(M.version,2);
assert.strictEqual(M.N,7);
assert.deepStrictEqual(M.PEOPLE,['A','B','C','D','E','F','G']);
assert(M.ATOMIC_TYPES.includes('ALONE_WITH'));
assert(M.ATOMIC_TYPES.includes('DIAGONAL_TO_OBJECT'));

const P=M.generateBoardById('MEDIUM-CORE-BOARD-001',40);
const P2=M.generateBoardById('MEDIUM-CORE-BOARD-001',40);
assert(P&&P2,'deterministic Medium board must generate');
assert.strictEqual(P.n,7);
assert.deepStrictEqual(P.regionOf,P2.regionOf,'room generation must reproduce by ID');
assert.deepStrictEqual(P.objects,P2.objects,'object generation must reproduce by ID');
assert.deepStrictEqual(P.solution,P2.solution,'stored solution must reproduce by ID');
assert.strictEqual(new Set(M.PEOPLE.map(p=>P.solution[p].r)).size,7,'one person per row');
assert.strictEqual(new Set(M.PEOPLE.map(p=>P.solution[p].c)).size,7,'one person per column');
const roomIds=[...new Set(P.regionOf.flat())];
assert(roomIds.length>=5,'board must contain multiple irregular rooms');
for(const rid of roomIds)assert(roomConnected(P.regionOf,rid),`room ${rid} must be connected`);
assertObjectModel(P);
assert(M.validateStructural(P,{allowEmptyPersonConstraints:true}).ok);
assert(M.fullValid(P,P.solution));

const pool=M.buildAtomicFactPool(P,{forbid:[]});
assert(pool.length>0);
for(const fact of pool){
  assert(M.ATOMIC_TYPES.includes(fact.constraint.type));
  assert(M.constraintTagValid(P,fact.constraint));
  assert(M.constraintSatisfied(P,fact.subject,fact.constraint,P.solution));
  const Q={...P,constraints:Object.fromEntries(M.PEOPLE.map(p=>[p,p===fact.subject?[fact.constraint]:[]]))};
  const personRelation=['WEST_OF_PERSON','EAST_OF_PERSON','NORTH_OF_PERSON','SOUTH_OF_PERSON','ALONE_WITH'].includes(fact.constraint.type);
  const independentlyDerived=personRelation?M.propagateDomains(Q).domains[fact.subject].size:M.ownCandidates(Q,fact.subject).length;
  assert.strictEqual(fact.candidateDomain.length,independentlyDerived);
}

console.log('MEDIUM 7x7 RULES-V2 CORE PASS',JSON.stringify({rooms:roomIds.length,objects:P.objects.length,facts:pool.length}));
