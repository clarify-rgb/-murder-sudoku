'use strict';
const E=require('../engine/easy-6x6-profiles.js');
function seedHash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){let a=seedHash(seed);return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn()}finally{Math.random=old}}
const profiles=['easy-1','easy-2','easy-3'];
const report={profiles:{},totals:{accepted:0,totalTwoCluePairs:0,sameLogicalObjectPairsEncountered:0,rejectedOccupancyRelationPairs:0,rejectedCrossOccurrenceOnlyPairs:0,invalidSameObjectPairsRemaining:0}};
for(const pr of profiles){
  const s={accepted:0,buildAttempts:0,generatedCandidates:0,totalTwoCluePairs:0,sameLogicalObjectPairsEncountered:0,rejectedOccupancyRelationPairs:0,rejectedCrossOccurrenceOnlyPairs:0,invalidSameObjectPairsRemaining:0};
  for(let attempt=1;attempt<=10000&&s.accepted<20;attempt++){
    s.buildAttempts++;
    const P=withSeed(`SAMEOBJ-${pr}-${attempt}`,()=>E.buildCandidate(pr));
    if(!P)continue;
    s.generatedCandidates++;
    const pairAudit=E.validateCluePairs(P);
    s.sameLogicalObjectPairsEncountered+=pairAudit.sameObjectPairs||0;
    const V=E.validate(P);
    if(!V.ok){
      if(V.reason==='misleading same-object clue pair'){
        for(const issue of V.cluePairCoherence.sameObjectIssues||[]){
          if(issue.kind==='occupancy-relation')s.rejectedOccupancyRelationPairs++;
          if(issue.kind==='cross-occurrence-only')s.rejectedCrossOccurrenceOnlyPairs++;
        }
      }
      continue;
    }
    s.accepted++;
    if(V.solutions!==1)throw Error(`${pr} accepted nonunique`);
    if(!V.human?.ok||V.human.searchCalls!==0)throw Error(`${pr} accepted puzzle used search/backtracking`);
    if(E.PEOPLE.some(p=>(P.clues[p]||[]).length>2))throw Error(`${pr} >2 clues/person`);
    const inv=E.validateStoredSolutionAgainstClues(P);if(!inv.valid)throw Error(`${pr} stored solution clue mismatch`);
    const coherence=E.validateCluePairs(P);if(!coherence.ok)throw Error(`${pr} accepted incoherent clue pair`);
    for(const p of E.PEOPLE){
      const cs=P.clues[p]||[];
      if(cs.length!==2)continue;
      s.totalTwoCluePairs++;
      const q=E.sameObjectPairCoherence(P,p,cs);
      if(q.sameObjectPair&&!q.ok)s.invalidSameObjectPairsRemaining+=q.issues.length;
    }
  }
  if(s.accepted!==20)throw Error(`${pr} only generated ${s.accepted}/20 accepted puzzles`);
  if(s.invalidSameObjectPairsRemaining!==0)throw Error(`${pr} has misleading same-object pair in accepted puzzle`);
  report.profiles[pr]=s;
  for(const k of Object.keys(report.totals))report.totals[k]+=s[k]||0;
}
if(report.totals.accepted!==60)throw Error('expected 60 accepted puzzles');
if(report.totals.invalidSameObjectPairsRemaining!==0)throw Error('accepted same-object inconsistencies remain');
console.log(JSON.stringify(report,null,2));
