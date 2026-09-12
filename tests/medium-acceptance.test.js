'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

function base(overrides={}){return{directClueSingles:0,multiCandidatePeople:7,advancedDeductionCount:2,materialAdvancedDeductions:1,dependencyDepth:3,multiPersonChainPeople:4,advancedDependentPlacements:4,...overrides}}
function rejects(overrides,reason){const r=M.mediumAcceptance(base(overrides));assert(!r.ok,`expected rejection for ${reason}`);assert(r.reasons.includes(reason),`missing rejection reason ${reason}`)}

assert(M.mediumAcceptance(base()).ok,'depth >=3 exact general floor must pass');
rejects({directClueSingles:1},'initial direct singles');
rejects({multiCandidatePeople:6},'not all people unresolved');
rejects({advancedDeductionCount:1},'advanced deductions < 2');
rejects({materialAdvancedDeductions:0},'material advanced < 1');
rejects({dependencyDepth:1},'depth < 2');
rejects({multiPersonChainPeople:3},'chain people < 4');
rejects({advancedDependentPlacements:3},'advanced placements < 4');

assert(M.mediumAcceptance(base({dependencyDepth:2,advancedDeductionCount:3,multiPersonChainPeople:5,advancedDependentPlacements:5})).ok,'depth-2 exact strengthened floor must pass');
for(const overrides of [
  {dependencyDepth:2,advancedDeductionCount:2,multiPersonChainPeople:5,advancedDependentPlacements:5},
  {dependencyDepth:2,advancedDeductionCount:3,multiPersonChainPeople:4,advancedDependentPlacements:5},
  {dependencyDepth:2,advancedDeductionCount:3,multiPersonChainPeople:5,advancedDependentPlacements:4}
])rejects(overrides,'depth-2 floor');

assert.strictEqual(M.classifyMedium(base({dependencyDepth:3,materialAdvancedDeductions:2,multiPersonChainPeople:5,advancedDependentPlacements:4})),'CLEAR MEDIUM');
assert.strictEqual(M.classifyMedium(base()),'BORDERLINE');
assert.strictEqual(M.classifyMedium(base({dependencyDepth:2,advancedDeductionCount:4,multiPersonChainPeople:6,advancedDependentPlacements:6})),'CLEAR MEDIUM');

console.log('MEDIUM ACCEPTANCE BOUNDARIES PASS');
