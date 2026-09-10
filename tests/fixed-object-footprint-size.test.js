'use strict';
const assert=require('assert');
const E=require('../engine/easy-6x6-profiles.js');

const allOneRoom=Array.from({length:E.N},()=>Array(E.N).fill(0));
const base=objects=>({people:[...E.PEOPLE],victim:'F',profile:'easy-1',regionOf:allOneRoom,roomNames:['R1'],objects,clues:{},globalRules:[],solution:{A:{r:0,c:0},B:{r:1,c:1},C:{r:2,c:2},D:{r:3,c:3},E:{r:4,c:4},F:{r:5,c:5}}});
const obj=(name,size,occurrences,blocking=false)=>({id:name.toLowerCase().replace(/ /g,'-'),name,icon:(blocking?'L':'')+(name.match(/\d+/)?.[0]||'1'),blocking,footprintSize:size,occurrences:occurrences.map(cells=>({cells}))});
function connected(cells){if(!cells.length)return false;const seen=new Set([''+cells[0].r+','+cells[0].c]),stack=[cells[0]];while(stack.length){const a=stack.pop();for(const b of cells){const k=b.r+','+b.c;if(!seen.has(k)&&Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1){seen.add(k);stack.push(b)}}}return seen.size===cells.length}
function sameRoom(P,cells){const rid=P.regionOf[cells[0].r][cells[0].c];return cells.every(x=>P.regionOf[x.r][x.c]===rid)}
function assertIdentity(P,o){assert([1,2,3].includes(o.footprintSize),o.name+' stores footprintSize 1-3');const occ=E.objectOccurrences(P,o.name);assert(occ.length>=1,o.name+' has occurrences');for(const q of occ){assert.strictEqual(q.cells.length,o.footprintSize,o.name+' occurrence matches fixed size');assert(connected(q.cells),o.name+' occurrence is orthogonally connected');assert(sameRoom(P,q.cells),o.name+' occurrence remains in one room')}assert.deepStrictEqual(E.objectCells(P,o.name),occ.flatMap(q=>q.cells),o.name+' actual cells equal flattened physical occurrences')}

// 1. Fixed size 1.
{
  const P=base([obj('Object 1',1,[[{r:0,c:0}],[{r:2,c:2}],[{r:5,c:5}]])]);
  assert(E.validateObjects(P));assertIdentity(P,P.objects[0]);
}
// 2. Fixed size 2, orientation may differ.
{
  const P=base([obj('Object 1',2,[[{r:0,c:0},{r:0,c:1}],[{r:2,c:2},{r:3,c:2}]])]);
  assert(E.validateObjects(P));assertIdentity(P,P.objects[0]);
}
// 3. Fixed size 3, connected shapes/orientations may differ.
{
  const P=base([obj('Object 1',3,[[{r:0,c:0},{r:0,c:1},{r:0,c:2}],[{r:3,c:3},{r:4,c:3},{r:4,c:4}]])]);
  assert(E.validateObjects(P));assertIdentity(P,P.objects[0]);
}
// Mixed sizes for the same identity are invalid, even if every individual occurrence is otherwise valid.
{
  const P=base([obj('Object 1',2,[[{r:0,c:0},{r:0,c:1}],[{r:3,c:3}]])]);
  assert.strictEqual(E.validateObjects(P),false,'same logical identity may not mix footprint sizes');
}
// 4. Different logical identities in one puzzle may use different fixed sizes.
{
  const P=base([
    obj('Object 1',2,[[{r:0,c:0},{r:0,c:1}],[{r:1,c:3},{r:2,c:3}]]),
    obj('Object 2',1,[[{r:0,c:5}],[{r:5,c:0}]]),
    obj('Object 3',3,[[{r:3,c:0},{r:3,c:1},{r:4,c:1}],[{r:4,c:4},{r:4,c:5},{r:5,c:5}]])
  ]);
  assert(E.validateObjects(P));for(const o of P.objects)assertIdentity(P,o);assert.deepStrictEqual(P.objects.map(o=>o.footprintSize),[2,1,3]);
}
// 5. Repeated Locked identities obey the same fixed-size rule.
{
  const P=base([obj('Locked 1',2,[[{r:0,c:0},{r:0,c:1}],[{r:4,c:4},{r:5,c:4}]],true)]);
  assert(E.validateObjects(P));assertIdentity(P,P.objects[0]);for(const x of E.objectCells(P,'Locked 1'))assert(E.blockedCell(P,x));
  const bad=base([obj('Locked 1',2,[[{r:0,c:0},{r:0,c:1}],[{r:4,c:4}]],true)]);assert.strictEqual(E.validateObjects(bad),false,'Locked identity may not mix sizes');
}

function seedHash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){let a=seedHash(seed);return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn()}finally{Math.random=old}}
function generateById(id,profile){return withSeed(id,()=>E.generate(profile,6000))}
function objectSnapshot(P){return P.objects.map(o=>({id:o.id,name:o.name,blocking:!!o.blocking,footprintSize:o.footprintSize,occurrences:E.objectOccurrences(P,o.name),actualCells:E.objectCells(P,o.name)}))}

// 6-7. Accepted generated puzzles retain exact-size, connected, one-room occurrences.
const seenSizes=new Set(),profilesSeen=new Set();let repeatedNormal=false,repeatedLocked=false,mixedIdentitySizes=false,accepted=0;
for(let i=0;i<30;i++){
  const profile=['easy-1','easy-2','easy-3'][i%3],id='FIXED-FOOTPRINT-'+profile+'-'+i,P=generateById(id,profile);
  assert(P,id+' generated');accepted++;profilesSeen.add(profile);assert(E.validateObjects(P),id+' object validation passes');
  const sizes=new Set();
  for(const o of P.objects){assertIdentity(P,o);seenSizes.add(o.footprintSize);sizes.add(o.footprintSize);const n=E.objectOccurrences(P,o.name).length;if(n>1&&o.blocking)repeatedLocked=true;if(n>1&&!o.blocking)repeatedNormal=true}
  if(sizes.size>1)mixedIdentitySizes=true;
  if(i>=5&&seenSizes.size===3&&profilesSeen.size===3&&repeatedNormal&&repeatedLocked&&mixedIdentitySizes)break;
}
assert.deepStrictEqual([...seenSizes].sort(),[1,2,3],'generated puzzles retain natural 1/2/3-cell identity variation');
assert.deepStrictEqual([...profilesSeen].sort(),['easy-1','easy-2','easy-3'],'all Easy profiles were exercised');
assert(repeatedNormal,'generated sample includes a repeated normal logical identity');
assert(repeatedLocked,'generated sample includes a repeated Locked logical identity');
assert(mixedIdentitySizes,'different identities in at least one generated puzzle use different sizes');

// 8. Puzzle-ID reproduction preserves identity, assigned size, occurrences and actual cells.
for(const profile of ['easy-1','easy-2','easy-3']){
  const id='FIXED-SIZE-REPRO-'+profile,a=generateById(id,profile),b=generateById(id,profile);
  assert(a&&b,profile+' reproducibility puzzles generated');
  assert.deepStrictEqual(objectSnapshot(a),objectSnapshot(b),profile+' Puzzle ID reproduces IDs, footprintSize, occurrences and cells');
  assert.deepStrictEqual(a.regionOf,b.regionOf,profile+' Puzzle ID reproduces room geometry');
}

console.log('PASS fixed logical-object footprint size',JSON.stringify({accepted,seenSizes:[...seenSizes].sort(),repeatedNormal,repeatedLocked,mixedIdentitySizes,profiles:[...profilesSeen].sort()}));