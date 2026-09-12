'use strict';
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

assert.strictEqual(M.WIDE_FIRST_PENALTY,200000,'experiment must use the single predetermined penalty');
const P=M.generateBoardById('RULESV2-PROFILE-DIAG-01',40);assert(P);
const broad=M.buildAtomicFactPool(P,{forbid:[]}).find(f=>f.candidateDomainSize>Math.max(9,M.N+1));
assert(broad,'fixed board must expose a wide first clue');
assert(M.extensionLegal(P,[],broad),'wide first clue must remain semantically reachable');

const r=M.searchIrredundantClueSet(P,{forbid:[]},{maxNodes:20,maxCounterexamples:20,maxMs:500,maxBranchesPerNode:10,maxCompliantLeaves:2});
assert.strictEqual(r.diagnostics.budget.wideFirstPenalty,200000);
for(const key of ['wideFirstCluesSelected','branchesContainingWideFirstClue','wideFirstPeopleRescuedBySecondClue','coverageValidUniqueLeaves','finalPersonalClueQualityPasses','finalPersonalClueQualityFailures','necessityValidations','irredundantLeaves','mediumSuccesses'])assert(Number.isInteger(r.diagnostics[key]),`missing diagnostic ${key}`);

console.log('WIDE-FIRST SEARCH-ORDER EXPERIMENT CONTRACT PASS');
