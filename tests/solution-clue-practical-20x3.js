'use strict';
const assert=require('assert');
const fs=require('fs');
const E=require('../engine/easy-6x6-profiles.js');

function seededRandom(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const oldRandom=Math.random;
Math.random=seededRandom(0x5A17C0DE);

const report={};
try{
  for(const profile of ['easy-1','easy-2','easy-3']){
    let accepted=0,totalAttempts=0,totalCluesChecked=0,acceptedCluesChecked=0;
    let inconsistenciesFoundBeforeRejection=0,invalidCandidatePuzzlesRejected=0,inconsistenciesRemaining=0;
    let pairsInspected=0;
    while(accepted<20){
      totalAttempts++;
      assert(totalAttempts<10000,profile+' generation stalled');
      const P=E.buildCandidate(profile);
      if(!P)continue;

      const stored=E.validateStoredSolutionAgainstClues(P);
      totalCluesChecked+=stored.checked;
      if(!stored.valid){
        invalidCandidatePuzzlesRejected++;
        inconsistenciesFoundBeforeRejection+=stored.failures.length;
        const v=E.validate(P);
        assert.strictEqual(v.ok,false);
        assert.strictEqual(v.reason,'stored solution clue mismatch');
        continue;
      }

      const V=E.validate(P);
      if(!V.ok)continue;
      P.validation=V;
      accepted++;
      acceptedCluesChecked+=stored.checked;
      inconsistenciesRemaining+=stored.failures.length;

      assert.strictEqual(V.solutions,1,profile+' must be unique');
      const h=E.strictSolve(P);
      assert.strictEqual(h.ok,true,profile+' strictSolve');
      assert.strictEqual(h.searchCalls,0,profile+' human solver search/backtracking');
      assert(P.people.every(p=>(P.clues[p]||[]).length<=2),profile+' max 2 clues/person');
      const cp=E.validateCluePairs(P);
      assert.strictEqual(cp.ok,true,profile+' clue pair coherence');
      pairsInspected+=cp.inspected;
      const again=E.validateStoredSolutionAgainstClues(P);
      assert.strictEqual(again.valid,true,profile+' stored solution/clue consistency');
      assert.strictEqual(E.fullValid(P,P.solution),true,profile+' canonical full placement validation');
    }
    report[profile]={
      success:`${accepted}/20`,
      averageAttempts:Number((totalAttempts/accepted).toFixed(2)),
      totalAttempts,
      totalCluesChecked,
      acceptedCluesChecked,
      cluePairsInspected:pairsInspected,
      inconsistenciesFoundBeforeRejection,
      invalidCandidatePuzzlesRejected,
      inconsistenciesRemainingInAcceptedPuzzles:inconsistenciesRemaining
    };
    assert.strictEqual(inconsistenciesRemaining,0,profile+' accepted puzzle inconsistencies');
  }
} finally { Math.random=oldRandom; }
fs.writeFileSync('tests/SOLUTION_CLUE_CONSISTENCY_REPORT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
console.log('20x3 stored-solution clue audit PASS');
