'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

const budget={maxNodes:25000,maxCounterexamples:6000,maxMs:5000,maxBranchesPerNode:40,maxCompliantLeaves:20};
const r=M.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',budget,{n:7,difficulty:'medium',require:{},forbid:[]});
assert(r.puzzle,'known fixed profiling board must produce an accepted Medium puzzle');
const P=r.puzzle,h=M.strictSolve(P),m=M.metrics(P,h),gate=M.mediumAcceptance(m);

assert.strictEqual(M.countSolutions(P,2),1,'accepted Medium must have exactly one solution');
assert.strictEqual(h.ok,true,'human solver must solve the accepted Medium');
assert.strictEqual(h.searchCalls,0,'human solver must use no search entry point');
assert.deepStrictEqual(h.searchCallBreakdown,{total:0,countSolutions:0,findArrangement:0});
assert.strictEqual(m.directClueSingles,0,'no initial direct singles');
assert.strictEqual(m.multiCandidatePeople,7,'all seven people initially unresolved');
assert(m.advancedDeductionCount>=2,'at least two structural advanced deductions');
assert(m.materialAdvancedDeductions>=1,'at least one material advanced deduction');
assert(m.dependencyDepth>=2,'dependency depth at least two');
assert(m.multiPersonChainPeople>=4,'chain contains at least four people');
assert(m.advancedDependentPlacements>=4,'at least four advanced-dependent placements');
if(m.dependencyDepth===2){
  assert(m.multiPersonChainPeople>=5,'depth-2 chain contains at least five people');
  assert(m.advancedDependentPlacements>=5,'depth-2 puzzle has at least five advanced-dependent placements');
  assert(m.advancedDeductionCount>=3,'depth-2 puzzle has at least three structural advanced deductions');
}
assert(gate.ok,'accepted puzzle must pass the exact current Medium gate');
assert(M.validateNecessity(P).ok,'every atomic clue must be necessary');
for(const p of M.PEOPLE){
  assert(P.constraints[p].length>=1&&P.constraints[p].length<=2,`${p} must have 1-2 atomic constraints`);
  for(const clue of P.constraints[p])assert(M.constraintSatisfied(P,p,clue,P.solution),`${p} displayed clue must be true`);
}
const canonical=M.validate(P);
assert(canonical.ok,'canonical/full validation must pass');
assert.strictEqual(canonical.solutions,1);
assert.strictEqual(canonical.human.searchCalls,0);

console.log('FINAL MEDIUM FLOOR INTEGRATION PASS',JSON.stringify({classification:M.classifyMedium(m),advanced:m.advancedDeductionCount,material:m.materialAdvancedDeductions,depth:m.dependencyDepth,chain:m.multiPersonChainPeople,placements:m.advancedDependentPlacements}));
