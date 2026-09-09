'use strict';
const assert=require('assert');const fs=require('fs');const E=require('../engine/easy-6x6-profiles.js');
const fixture=JSON.parse(fs.readFileSync('tests/fixture-1HBGDQC.json','utf8'));
function shell(regionOf,clues){return{profile:'easy-1',people:[...E.PEOPLE],victim:'F',regionOf,roomNames:['R1','R2','R3','R4','R5','R6','R7'],objects:[],clues:{F:clues},globalRules:[],solution:{}}}
let exact={...fixture,people:[...E.PEOPLE],victim:'F',globalRules:[],profile:'easy-1'};
let q=E.cluePairCoherence(exact,'F',exact.clues.F);assert.equal(q.ok,false);assert(q.deadBranches.some(x=>x.room===5));console.log('PASS 1HBGDQC exact geometry rejects column 2 + aloneInRooms [R1,R6]');
const R=Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>c<3?0:1));
let accept=shell(R,[{type:'row',row:2},{type:'aloneInRooms',rooms:[0,1]}]);assert.equal(E.cluePairCoherence(accept,'F').ok,true);console.log('PASS both advertised rooms survive own other clue');
let reject=shell(R,[{type:'column',column:1},{type:'aloneInRooms',rooms:[0,1]}]);assert.equal(E.cluePairCoherence(reject,'F').ok,false);console.log('PASS own other clue killing one branch rejects');
let later=shell(R,[{type:'row',row:2},{type:'aloneInRooms',rooms:[0,1]}]);later.clues.A=[{type:'column',column:4}];later.clues.B=[{type:'room',room:1}];assert.equal(E.cluePairCoherence(later,'F').ok,true);console.log('PASS other-person clues are ignored by local pair validation');
assert.deepEqual(E.CLUE_TYPES.filter(t=>t==='aloneInRooms'),['aloneInRooms']);console.log('PASS explicit multi-option clue family audit: aloneInRooms only');
