'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

function base(overrides={}){return Object.assign({directClueSingles:0,multiCandidatePeople:7,advancedDeductionCount:2,materialAdvancedDeductions:1,advancedDependentPlacements:4,multiPersonChainPeople:4,dependencyDepth:2},overrides)}
assert(M.mediumAcceptance(base()).ok,'final Medium floor should pass at exact breadth minimum');
assert(!M.mediumAcceptance(base({directClueSingles:1})).ok,'direct single must reject');
assert(!M.mediumAcceptance(base({multiCandidatePeople:6})).ok,'all seven people must start unresolved');
assert(!M.mediumAcceptance(base({advancedDeductionCount:1})).ok,'one isolated advanced deduction must reject');
assert(!M.mediumAcceptance(base({materialAdvancedDeductions:0})).ok,'decorative advanced deductions must reject');
assert(!M.mediumAcceptance(base({advancedDependentPlacements:3})).ok,'fewer than four downstream placements must reject');
assert(!M.mediumAcceptance(base({multiPersonChainPeople:3})).ok,'fewer than four chain people must reject');
assert(!M.mediumAcceptance(base({dependencyDepth:1})).ok,'depth below two must reject');
assert(M.mediumAcceptance(base({dependencyDepth:2,multiPersonChainPeople:6,advancedDependentPlacements:5,advancedDeductionCount:2,materialAdvancedDeductions:2})).ok,'broad depth-2 puzzle must remain valid Medium');

const trace={trace:[
 {reason:'intersecting-square-elimination',round:1,subject:'B',sourcePerson:'A',supports:[{r:0,c:0},{r:1,c:1}],removed:[{r:2,c:0}]},
 {reason:'intersecting-square-elimination',round:1,subject:'C',sourcePerson:'A',supports:[{r:0,c:0},{r:1,c:1}],removed:[{r:3,c:1}]},
 {reason:'forced-placement',round:1,subject:'B',sourceReason:'intersecting-square-elimination'},
 {reason:'row-elimination',round:2,subject:'D',sourcePerson:'B',removed:[{r:2,c:4}]},
 {reason:'forced-placement',round:2,subject:'D',sourceReason:'row-elimination'},
 {reason:'column-elimination',round:2,subject:'E',sourcePerson:'D',removed:[{r:4,c:4}]},
 {reason:'forced-placement',round:2,subject:'E',sourceReason:'column-elimination'},
 {reason:'row-elimination',round:2,subject:'F',sourcePerson:'E',removed:[{r:5,c:2}]},
 {reason:'forced-placement',round:2,subject:'F',sourceReason:'row-elimination'},
 {reason:'row-ownership',round:2,subject:'G',owners:['C','F'],values:[3,5],removed:[{r:3,c:6}]}
]};
const a=M.analyzeMediumStructure({},trace);
assert.strictEqual(a.advancedDeductionCount,2,'two structural advanced deductions expected');
assert(a.multiPersonChainPeople>=4,'synthetic chain should include at least four people');
assert(a.advancedDependentPlacements>=4,'synthetic chain should carry to at least four placements');
assert(M.mediumAcceptance({...base(),...a,directClueSingles:0,multiCandidatePeople:7,dependencyDepth:2}).ok,'broad structural chain should pass');

M.resetMediumAcceptanceRejectionStats();
assert.deepStrictEqual(M.getMediumAcceptanceRejectionStats(),{'chain people < 4':0,'advanced-dependent placements < 4':0});
console.log('MEDIUM FINAL FLOOR PASS',JSON.stringify(a));
