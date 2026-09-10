'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

function base(overrides={}){return Object.assign({directClueSingles:0,multiCandidatePeople:7,advancedDeductionCount:2,materialAdvancedDeductions:1,advancedDependentPlacements:1,multiPersonChainPeople:2,dependencyDepth:2},overrides)}
assert(M.mediumAcceptance(base()).ok,'minimum structural Medium should pass');
assert(!M.mediumAcceptance(base({directClueSingles:1})).ok,'direct single must reject');
assert(!M.mediumAcceptance(base({multiCandidatePeople:6})).ok,'all seven people must start unresolved');
assert(!M.mediumAcceptance(base({advancedDeductionCount:1})).ok,'one isolated advanced deduction must reject');
assert(!M.mediumAcceptance(base({materialAdvancedDeductions:0})).ok,'decorative advanced deductions must reject');
assert(!M.mediumAcceptance(base({advancedDependentPlacements:0})).ok,'advanced reasoning must contribute to a later placement');
assert(!M.mediumAcceptance(base({multiPersonChainPeople:1})).ok,'must contain multi-person dependency');
assert(!M.mediumAcceptance(base({dependencyDepth:1})).ok,'dependency depth must exceed shallow cleanup');

const samePattern={trace:[
 {reason:'intersecting-square-elimination',round:1,subject:'B',sourcePerson:'A',supports:[{r:0,c:0},{r:1,c:1}],removed:[{r:2,c:0}]},
 {reason:'intersecting-square-elimination',round:1,subject:'C',sourcePerson:'A',supports:[{r:0,c:0},{r:1,c:1}],removed:[{r:3,c:1}]},
 {reason:'forced-placement',round:1,subject:'B',sourceReason:'intersecting-square-elimination'},
 {reason:'row-elimination',round:2,subject:'D',sourcePerson:'B',removed:[{r:2,c:4}]},
 {reason:'forced-placement',round:2,subject:'D',sourceReason:'row-elimination'}
]};
let a=M.analyzeMediumStructure({},samePattern);
assert.strictEqual(a.advancedDeductionCount,1,'same structural intersection must count once even when it removes from multiple people');
assert.strictEqual(a.intersectionCount,1);
assert.strictEqual(a.materialAdvancedDeductions,1);
assert(a.advancedDependentPlacements>=2,'material chain should carry into later placements');
assert(a.multiPersonChainPeople>=3,'A→B→D should register as a multi-person chain');

const twoPatterns={trace:[
 ...samePattern.trace,
 {reason:'row-ownership',round:3,subject:'E',owners:['F','G'],values:[4,6],removed:[{r:4,c:2}]},
 {reason:'forced-placement',round:3,subject:'E',sourceReason:'row-ownership',owners:['F','G'],values:[4,6]}
]};
a=M.analyzeMediumStructure({},twoPatterns);
assert.strictEqual(a.advancedDeductionCount,2,'distinct advanced patterns must count separately');
assert.strictEqual(a.ownershipCount,1);
assert.strictEqual(a.intersectionCount,1);
assert.strictEqual(a.materialAdvancedDeductions,2);
assert.strictEqual(M.classifyMedium({...base(),...a,directClueSingles:0,multiCandidatePeople:7,dependencyDepth:3}),'CLEAR MEDIUM');
console.log('MEDIUM STRUCTURAL ACCEPTANCE PASS',JSON.stringify(a));
