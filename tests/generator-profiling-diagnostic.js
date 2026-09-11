'use strict';
const fs=require('fs');
const path=require('path');
const assert=require('assert');
const {execSync}=require('child_process');

const EXPECTED_ENGINE='59ef95e500ddb39fd43c905fc0f5c60b7bf52e96';
assert.strictEqual(execSync('git hash-object engine/medium-7x7.js',{encoding:'utf8'}).trim(),EXPECTED_ENGINE,'production Medium engine changed before profiling');

const sourcePath=path.resolve('engine/medium-7x7.js');
const tempPath=path.resolve('tests/.profiled-medium-7x7.js');
let src=fs.readFileSync(sourcePath,'utf8');

// Diagnostic-only timing hooks. These exist only in the temporary engine copy.
src=src.replace("'use strict';\n",`'use strict';\nlet __diagActive=null;\nfunction __diagTick(){return Number(process.hrtime.bigint())/1e6}\nfunction __diagAdd(name,ms,count=1){if(!__diagActive)return;const b=__diagActive.timing[name]||(__diagActive.timing[name]={ms:0,calls:0});b.ms+=ms;b.calls+=count}\nfunction __diagTime(name,fn){if(!__diagActive)return fn();const t=__diagTick();try{return fn()}finally{__diagAdd(name,__diagTick()-t)}}\n`,1);

// Isolate the fact-pool propagation cost without changing fact semantics.
const oldSingle=`  function singleFactDomain(P,p,cl){if(PERSON_RELATIONS.has(cl.type)){const Q=clone(P);Q.constraints=Object.fromEntries(PEOPLE.map(q=>[q,[]]));Q.globalConstraints=[];Q.constraints[p]=[clone(cl)];const r=propagateDomains(Q);return[...r.domains[p]].map(cell)}return baseCandidates(P).filter(x=>unaryHolds(P,cl,x))}`;
const newSingle=`  function singleFactDomain(P,p,cl){return __diagTime(PERSON_RELATIONS.has(cl.type)?'rowColumnCandidatePropagationGeneration':'factPoolUnaryDomainCalculation',()=>{if(PERSON_RELATIONS.has(cl.type)){const Q=clone(P);Q.constraints=Object.fromEntries(PEOPLE.map(q=>[q,[]]));Q.globalConstraints=[];Q.constraints[p]=[clone(cl)];const r=propagateDomains(Q);return[...r.domains[p]].map(cell)}return baseCandidates(P).filter(x=>unaryHolds(P,cl,x))})}`;
assert(src.includes(oldSingle),'singleFactDomain source marker changed');
src=src.replace(oldSingle,newSingle,1);

const startMarker='  function searchIrredundantClueSet(P,request={forbid:[]},budget={}){';
const endMarker='\n\n  function roomConnected';
const a=src.indexOf(startMarker),b=src.indexOf(endMarker,a);
assert(a>=0&&b>a,'searchIrredundantClueSet source markers changed');

const profiledSearch=String.raw`  function searchIrredundantClueSet(P,request={forbid:[]},budget={}){
    const cfg={...DEFAULT_CLUE_SEARCH_BUDGET,maxNodes:50000,maxCounterexamples:10000,maxMs:5000,maxBranchesPerNode:50,maxCompliantLeaves:20,...budget};
    const profile={
      timing:{},
      earlyUnique:{total:0,coverageValid:0,coverageInvalid:0,byClueCount:{},byCoveredPeople:{},patterns:{},uncoveredPatterns:{},lastClueTypes:{},events:[],causeSignals:{twoPlusWithZero:0,oneZeroNoTwos:0,implicitDeterminationWithUncovered:0}},
      necessity:{leaves:[],byFamily:{},failedRedundantCounts:[],redundantOwnedByOneClue:0,redundantOwnedByTwoClues:0},
      privateWitness:{knownPass:0,knownFail:0,unknownPass:0,unknownFail:0},
      factPool:{generationMs:0,count:0,byFamily:{}},
      redundancyClassificationSamples:[]
    };
    __diagActive=profile;
    const start=Date.now();
    const bt0=__diagTick(),base=clone(P);__diagAdd('partialPuzzleConstructionCloning',__diagTick()-bt0);base.constraints=Object.fromEntries(PEOPLE.map(p=>[p,[]]));base.globalConstraints=[];
    const f0=__diagTick(),pool=buildAtomicFactPool(base,request);profile.factPool.generationMs=__diagTick()-f0;__diagAdd('factPoolGeneration',profile.factPool.generationMs);pool.forEach((item,i)=>item.factIndex=i);
    profile.factPool.count=pool.length;
    for(const item of pool){const t=item.constraint.type,s=profile.factPool.byFamily[t]||(profile.factPool.byFamily[t]={count:0,domainSum:0,minDomain:Infinity,maxDomain:0});s.count++;s.domainSum+=item.candidateDomainSize;s.minDomain=Math.min(s.minDomain,item.candidateDomainSize);s.maxDomain=Math.max(s.maxDomain,item.candidateDomainSize)}
    const visited=new Set,completeLeafSignatures=new Set,redundantLeafSignatures=new Set;
    const counterexamplePool=[],counterexampleBySignature=new Map;
    const classificationSnapshots=[];
    const diag={
      factPoolSize:pool.length,nodesExplored:0,distinctClueSetsExplored:0,
      counterexamplesEncountered:0,newCounterexamplesSolved:0,sharedCounterexamplePoolSize:0,
      reusedCounterexampleHits:0,freshCounterexampleSolverCalls:0,freshCounterexampleSearchTimeMs:0,
      completeUniqueLeaves:0,completeLeavesFailingNecessity:0,redundantCluesFoundAtFailedLeaves:0,
      redundantLeafSignatures:[],necessityValidations:0,necessityValidationTimeMs:0,
      compliantUniqueLeavesFound:0,leavesFailingMedium:0,leavesPassingMedium:0,
      firstPassingLeafIndex:null,mediumValidationTimeMs:0,
      retainedValidWitnesses:0,witnessStatesMarkedUnknown:0,freshPartialWitnessRepairSearches:0,
      irredundantFound:false,mediumFound:false,elapsedMs:0,budget:{...cfg},budgetExceeded:false,failureReason:null,
      firstCompliantLeaf:null,passingLeaf:null,profile
    };
    generatorStats.clueSearchBoards++;
    if(PEOPLE.some(p=>!pool.some(x=>x.subject===p))){diag.failureReason='fact pool lacks coverage for at least one person';diag.elapsedMs=Date.now()-start;__diagActive=null;return{puzzle:null,diagnostics:diag}}
    let stop=false;
    function keyFor(selected){const t=__diagTick(),v=selected.map(x=>x.id).sort().join(';');__diagAdd('canonicalClueSetSignatureGeneration',__diagTick()-t);return v}
    function overBudget(){
      if(stop)return true;
      if(diag.nodesExplored>=cfg.maxNodes){diag.budgetExceeded=true;diag.failureReason='node budget';stop=true;return true}
      if(diag.newCounterexamplesSolved>=cfg.maxCounterexamples){diag.budgetExceeded=true;diag.failureReason='counterexample budget';stop=true;return true}
      if(diag.compliantUniqueLeavesFound>=cfg.maxCompliantLeaves){diag.budgetExceeded=true;diag.failureReason='compliant leaf budget';stop=true;return true}
      if(Date.now()-start>=cfg.maxMs){diag.budgetExceeded=true;diag.failureReason='wall-clock budget';stop=true;return true}
      return false
    }
    function counterexampleSurvives(entry,selected){const t=__diagTick();for(const item of selected)if(entry.violated[item.factIndex]){__diagAdd('ceFactBitsetIntersectionTesting',__diagTick()-t);return false}__diagAdd('ceFactBitsetIntersectionTesting',__diagTick()-t);return true}
    function addCounterexample(alt){
      const sig=arrangementSignature(alt);if(counterexampleBySignature.has(sig))return counterexampleBySignature.get(sig);
      const t=__diagTick(),violated=new Uint8Array(pool.length);for(let i=0;i<pool.length;i++)if(!constraintSatisfied(base,pool[i].subject,pool[i].constraint,alt))violated[i]=1;__diagAdd('ceFactBitsetConstruction',__diagTick()-t);
      const entry={signature:sig,arrangement:clone(alt),violated};counterexamplePool.push(entry);counterexampleBySignature.set(sig,entry);diag.newCounterexamplesSolved++;diag.sharedCounterexamplePoolSize=counterexamplePool.length;return entry
    }
    function getCounterexample(Q,selected){
      const scanStart=__diagTick(),bitBefore=(profile.timing.ceFactBitsetIntersectionTesting?.ms||0);
      for(const entry of counterexamplePool)if(counterexampleSurvives(entry,selected)){
        const bitAfter=(profile.timing.ceFactBitsetIntersectionTesting?.ms||0);__diagAdd('cePoolScanning',Math.max(0,__diagTick()-scanStart-(bitAfter-bitBefore)));
        diag.reusedCounterexampleHits++;diag.counterexamplesEncountered++;return entry
      }
      const bitAfter=(profile.timing.ceFactBitsetIntersectionTesting?.ms||0);__diagAdd('cePoolScanning',Math.max(0,__diagTick()-scanStart-(bitAfter-bitBefore)));
      diag.freshCounterexampleSolverCalls++;const t0=Date.now(),alt=findCounterexample(Q);diag.freshCounterexampleSearchTimeMs+=Date.now()-t0;if(!alt)return null;diag.counterexamplesEncountered++;return addCounterexample(alt)
    }
    function leafSummary(Q,signature,h,m,accept,index){const t=__diagTick();const v={index,signature,constraints:Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).map(clone)])),atomicConstraintsPerPerson:Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).length])),totalAtomicConstraints:atomicConstraintCount(Q),humanSearchCalls:h?.searchCalls??null,deterministicHumanSolved:!!h?.ok,mediumPass:!!accept?.ok,mediumReasons:accept?.reasons||[h?.reason||'deterministic human solve failed'],mediumClassification:h?.ok?classifyMedium(m):'TOO EASY',initialCandidates:m?.initialCandidates||null,structuralAdvancedDeductions:m?.advancedDeductionCount??null,materialAdvancedDeductions:m?.materialAdvancedDeductions??null,ownershipCount:m?.ownershipCount??null,intersectionCount:m?.intersectionCount??null,dependencyDepth:m?.dependencyDepth??null,chainPeople:m?.multiPersonChainPeople??null,advancedDependentPlacements:m?.advancedDependentPlacements??null,traceLength:m?.totalDeterministicTraceLength??null};__diagAdd('serializationDebugReportOverhead',__diagTick()-t);return v}
    function mediumHeuristicBonus(item,combinedDomain,counts){let score=0;if(PERSON_RELATIONS.has(item.constraint.type))score+=180;if(['ONLY_PERSON_ON_OBJECT','ALONE_IN_ROOM','ALONE_WITH'].includes(item.constraint.type))score+=130;if(combinedDomain>=2&&combinedDomain<=3)score+=110;else if(combinedDomain>=4&&combinedDomain<=6)score+=60;if(item.constraint.other&&counts[item.constraint.other]>0)score+=70;if(['ROW','COLUMN'].includes(item.constraint.type))score-=45;return score}
    function updateWitnessStates(witnesses,selected,newItem,newWitness){const t=__diagTick(),next=new Map(witnesses);next.set(newItem.id,clone(newWitness));for(const old of selected){const w=next.get(old.id);if(!w)continue;if(constraintSatisfied(base,newItem.subject,newItem.constraint,w))diag.retainedValidWitnesses++;else{next.set(old.id,null);diag.witnessStatesMarkedUnknown++}}__diagAdd('selectedClueWitnessStateEvaluation',__diagTick()-t);return next}
    function recordEarlyUnique(selected,counts){
      const t=__diagTick(),eu=profile.earlyUnique,total=selected.length,zeros=PEOPLE.filter(p=>counts[p]===0),ones=PEOPLE.filter(p=>counts[p]===1),twos=PEOPLE.filter(p=>counts[p]===2),covered=N-zeros.length,pat=PEOPLE.map(p=>counts[p]).join('/'),unp=zeros.join(',')||'none',last=selected.length?selected[selected.length-1].constraint.type:'none';
      eu.total++;if(!zeros.length)eu.coverageValid++;else eu.coverageInvalid++;eu.byClueCount[total]=(eu.byClueCount[total]||0)+1;eu.byCoveredPeople[covered]=(eu.byCoveredPeople[covered]||0)+1;eu.patterns[pat]=(eu.patterns[pat]||0)+1;eu.uncoveredPatterns[unp]=(eu.uncoveredPatterns[unp]||0)+1;eu.lastClueTypes[last]=(eu.lastClueTypes[last]||0)+1;if(zeros.length&&twos.length)eu.causeSignals.twoPlusWithZero++;if(zeros.length===1&&twos.length===0)eu.causeSignals.oneZeroNoTwos++;if(zeros.length)eu.causeSignals.implicitDeterminationWithUncovered++;
      if(eu.events.length<200)eu.events.push({node:diag.nodesExplored,depth:selected.length,total,covered,zero:zeros.length,one:ones.length,two:twos.length,counts:Object.fromEntries(PEOPLE.map(p=>[p,counts[p]])),uncovered:zeros,lastClueType:last});__diagAdd('profilingRecordOverhead',__diagTick()-t)
    }
    function privateWitnessMap(selected){
      const t=__diagTick(),out=new Map;for(const item of selected){let known=false;for(const entry of counterexamplePool){if(!entry.violated[item.factIndex])continue;let ok=true;for(const other of selected)if(other.id!==item.id&&entry.violated[other.factIndex]){ok=false;break}if(ok){known=true;break}}out.set(item.id,known)}__diagAdd('privateWitnessAnalysis',__diagTick()-t);return out
    }
    function recordNecessity(Q,selected,necessity,witnessMap){
      const t=__diagTick(),reds=new Map((necessity.redundantConstraints||[]).map(x=>[x.subject+'|'+x.index,x])),counts=Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).length])),leaf={totalAtomics:atomicConstraintCount(Q),constraintsPerPerson:counts,redundantCount:necessity.redundantCount||0,redundant:[]};
      const subjectPos=Object.fromEntries(PEOPLE.map(p=>[p,0]));
      for(const item of selected){const index=subjectPos[item.subject]++,rk=item.subject+'|'+index,red=reds.get(rk),necessary=!red,known=!!witnessMap.get(item.id),fam=item.constraint.type,stat=profile.necessity.byFamily[fam]||(profile.necessity.byFamily[fam]={tested:0,redundant:0});stat.tested++;if(red)stat.redundant++;
        if(known&&necessary)profile.privateWitness.knownPass++;else if(known&&!necessary)profile.privateWitness.knownFail++;else if(!known&&necessary)profile.privateWitness.unknownPass++;else profile.privateWitness.unknownFail++;
        if(red){if(counts[item.subject]===1)profile.necessity.redundantOwnedByOneClue++;else if(counts[item.subject]===2)profile.necessity.redundantOwnedByTwoClues++;leaf.redundant.push({subject:item.subject,personOwnConstraintCount:counts[item.subject],clueType:fam,constraint:clone(item.constraint),solutionCountWithoutConstraint:red.solutionCountWithoutConstraint,remainingSolution:red.solutionCountWithoutConstraint===1?clone(Q.solution):null,knownPrivateWitness:known})}
      }
      profile.necessity.leaves.push(leaf);if(!necessity.ok)profile.necessity.failedRedundantCounts.push(necessity.redundantCount||0);__diagAdd('profilingRecordOverhead',__diagTick()-t)
    }
    function dfs(selected,witnesses){
      if(overBudget())return null;
      const key=keyFor(selected);const dt0=__diagTick(),seen=visited.has(key);if(!seen)visited.add(key);__diagAdd('duplicateSetLookup',__diagTick()-dt0);if(seen)return null;
      visited.add(key);diag.nodesExplored++;diag.distinctClueSetsExplored=visited.size;
      const q0=__diagTick(),Q=applySelectedFacts(base,selected);__diagAdd('partialPuzzleConstructionCloning',__diagTick()-q0);const ce=getCounterexample(Q,selected);
      if(!ce){
        diag.completeUniqueLeaves++;const ct0=__diagTick(),isDup=completeLeafSignatures.has(key);if(!isDup)completeLeafSignatures.add(key);__diagAdd('duplicateSetLookup',__diagTick()-ct0);if(isDup)return null;
        const cv0=__diagTick(),counts=selectedCounts(selected);__diagAdd('coverageFeasibilityChecks',__diagTick()-cv0);recordEarlyUnique(selected,counts);
        const cv1=__diagTick(),coverageBad=PEOPLE.some(p=>counts[p]<1||counts[p]>2);__diagAdd('coverageFeasibilityChecks',__diagTick()-cv1);if(coverageBad)return null;
        const fq0=__diagTick(),quality=finalPersonalClueQuality(Q);__diagAdd('sameObjectPairAndFinalDomainQualityChecks',__diagTick()-fq0);if(!quality)return null;
        const ut0=__diagTick(),uniqueAgain=countSolutions(Q,2)===1;__diagAdd('uniquenessTerminalDetectionOutsideFreshCESolver',__diagTick()-ut0);if(!uniqueAgain)return null;
        const pw=privateWitnessMap(selected);diag.necessityValidations++;const nt0=Date.now(),necessity=validateNecessity(Q);diag.necessityValidationTimeMs+=Date.now()-nt0;recordNecessity(Q,selected,necessity,pw);
        if(!necessity.ok){diag.completeLeavesFailingNecessity++;diag.redundantCluesFoundAtFailedLeaves+=necessity.redundantCount||0;redundantLeafSignatures.add(key);if(diag.redundantLeafSignatures.length<20)diag.redundantLeafSignatures.push({signature:key,redundant:(necessity.redundantConstraints||[]).map(x=>({subject:x.subject,index:x.index,constraint:clone(x.constraint),solutionCountWithoutConstraint:x.solutionCountWithoutConstraint}))});if(classificationSnapshots.length<20)classificationSnapshots.push({Q:clone(Q),necessity:clone(necessity)});return null}
        diag.compliantUniqueLeavesFound++;diag.irredundantFound=true;const mt0=Date.now(),human=strictSolve(Q);let m=null,accept;if(human.ok){m=metrics(Q,human);accept=mediumAcceptance(m)}else accept={ok:false,reasons:[human.reason]};diag.mediumValidationTimeMs+=Date.now()-mt0;const summary=leafSummary(Q,key,human,m,accept,diag.compliantUniqueLeavesFound);if(!diag.firstCompliantLeaf)diag.firstCompliantLeaf=clone(summary);if(accept.ok){diag.leavesPassingMedium++;diag.mediumFound=true;diag.firstPassingLeafIndex=diag.compliantUniqueLeavesFound;diag.passingLeaf=clone(summary);Q.selectionAttempts=diag.nodesExplored;Q.validation={solutions:1,human,metrics:m,necessity,mediumAcceptance:accept,mediumClassification:classifyMedium(m)};return{puzzle:Q,necessity,human,metrics:m,mediumAcceptance:accept}}diag.leavesFailingMedium++;if(diag.compliantUniqueLeavesFound>=cfg.maxCompliantLeaves){diag.budgetExceeded=true;diag.failureReason='compliant leaf budget';stop=true}return null
      }
      if(overBudget())return null;
      const cc0=__diagTick(),counts=selectedCounts(selected);__diagAdd('coverageFeasibilityChecks',__diagTick()-cc0);const si0=__diagTick(),selectedIds=new Set(selected.map(x=>x.id));__diagAdd('selectedClueEvaluation',__diagTick()-si0);
      const scan0=__diagTick(),bit0=(profile.timing.ceFactBitsetIntersectionTesting?.ms||0),surviving=counterexamplePool.filter(entry=>counterexampleSurvives(entry,selected)),bit1=(profile.timing.ceFactBitsetIntersectionTesting?.ms||0);__diagAdd('cePoolScanning',Math.max(0,__diagTick()-scan0-(bit1-bit0)));
      const candOuter0=__diagTick(),nestedBefore=Object.fromEntries(Object.entries(profile.timing).map(([k,v])=>[k,v.ms]));const candidates=[];
      for(const item of pool){
        const ev0=__diagTick();if(selectedIds.has(item.id)||counts[item.subject]>=2||!ce.violated[item.factIndex]){__diagAdd('selectedClueEvaluation',__diagTick()-ev0);continue}__diagAdd('selectedClueEvaluation',__diagTick()-ev0);
        const own=selected.filter(x=>x.subject===item.subject);if(own.length>=2)continue;const cs=[...own.map(x=>x.constraint),item.constraint];const pq0=__diagTick(),pairOK=sameObjectPairValid(base,item.subject,cs);__diagAdd('sameObjectPairQualityChecks',__diagTick()-pq0);if(!pairOK)continue;
        const ep0=__diagTick(),eq=applySelectedFacts(base,[...selected,item]);__diagAdd('partialPuzzleConstructionCloning',__diagTick()-ep0);const ed0=__diagTick(),en=ownCandidates(eq,item.subject).length;__diagAdd('candidateDomainCalculation',__diagTick()-ed0);const cf0=__diagTick();if(en<2||(cs.length===2&&en>Math.max(9,N+1))){__diagAdd('coverageFeasibilityChecks',__diagTick()-cf0);continue}__diagAdd('coverageFeasibilityChecks',__diagTick()-cf0);
        let hits=0;const ht0=__diagTick();for(const entry of surviving)if(entry.violated[item.factIndex])hits++;__diagAdd('ceFactBitsetIntersectionTesting',__diagTick()-ht0);
        const tp0=__diagTick(),temp=applySelectedFacts(base,[...selected,item]);__diagAdd('partialPuzzleConstructionCloning',__diagTick()-tp0);const cd0=__diagTick(),combinedDomain=ownCandidates(temp,item.subject).length;__diagAdd('candidateDomainCalculation',__diagTick()-cd0);
        const sc0=__diagTick(),coverageBonus=counts[item.subject]===0?100000:0,directPenalty=combinedDomain===1?1000000:0,domainGain=Math.max(0,baseCandidates(base).length-item.candidateDomainSize),score=coverageBonus+hits*500+domainGain*3-Math.abs(combinedDomain-4)*2-directPenalty+mediumHeuristicBonus(item,combinedDomain,counts);candidates.push({item,score});__diagAdd('branchScoringSorting',__diagTick()-sc0)
      }
      const nestedAfter=Object.fromEntries(Object.entries(profile.timing).map(([k,v])=>[k,v.ms])),nestedKeys=['selectedClueEvaluation','sameObjectPairQualityChecks','partialPuzzleConstructionCloning','candidateDomainCalculation','coverageFeasibilityChecks','ceFactBitsetIntersectionTesting','branchScoringSorting'];let nested=0;for(const k of nestedKeys)nested+=(nestedAfter[k]||0)-(nestedBefore[k]||0);__diagAdd('branchCandidateCollectionOther',Math.max(0,__diagTick()-candOuter0-nested));
      const sort0=__diagTick();candidates.sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));const branch=candidates.slice(0,cfg.maxBranchesPerNode);__diagAdd('branchScoringSorting',__diagTick()-sort0);
      for(const {item} of branch){if(overBudget())break;const next=[...selected,item],nextWitnesses=updateWitnessStates(witnesses,selected,item,ce.arrangement),hitResult=dfs(next,nextWitnesses);if(hitResult)return hitResult}return null
    }
    const result=dfs([],new Map);diag.elapsedMs=Date.now()-start;
    // Classification is intentionally post-search: it cannot influence the 5-second search budget or traversal.
    function classifyRedundancySample(s){
      const red=s.necessity.redundantConstraints?.[0];if(!red)return null;const Q=s.Q,p=red.subject,cl=red.constraint,without=removeAtomic(Q,red),otherOwn=constraintList(Q,p).filter((_,i)=>i!==red.index),objectTypes=new Set(['ON_OBJECT','ONLY_PERSON_ON_OBJECT','BESIDE_OBJECT','NOT_BESIDE_OBJECT','DIAGONAL_TO_OBJECT','WEST_OF_OBJECT','EAST_OF_OBJECT','NORTH_OF_OBJECT','SOUTH_OF_OBJECT']),roomTypes=new Set(['IN_ROOM','NOT_IN_ROOM','CORNER','ALONE_IN_ROOM']);let source='cannot classify cheaply';
      const purelyUnary=[cl,...otherOwn].every(x=>!PERSON_RELATIONS.has(x.type)&&!['ONLY_PERSON_ON_OBJECT','ALONE_IN_ROOM','ALONE_WITH'].includes(x.type));
      if(purelyUnary&&otherOwn.length){const candidates=baseCandidates(Q).filter(x=>otherOwn.every(o=>unaryHolds(Q,o,x)));if(candidates.length&&candidates.every(x=>unaryHolds(Q,cl,x))){if(cl.object&&otherOwn.some(o=>o.object===cl.object)&&objectTypes.has(cl.type))source='object relation overlap';else if(roomTypes.has(cl.type)&&otherOwn.some(o=>roomTypes.has(o.type)))source='room relation overlap';else source=\"same person's other constraint already implies it\"}}
      if(source==='cannot classify cheaply'){const h=strictSolve(without);if(h.ok){const trace=h.trace||[],rel=trace.some(e=>e.reason==='relational-deduction'&&(e.subject===p||e.reference===p)),rc=trace.some(e=>e.reason==='forced-placement'&&e.subject===p&&['row-elimination','column-elimination','row-occupancy','column-occupancy','row-ownership','column-ownership','multi-row-ownership','multi-column-ownership','intersecting-square-elimination'].includes(e.sourceReason));if(rel)source='relational chain makes it unnecessary';else if(rc)source='row/column uniqueness makes it unnecessary';else if(constraintList(without,p).length===0)source=\"another person's clue(s) indirectly force the same result\"}}
      return{subject:p,clueType:cl.type,constraint:clone(cl),personOwnConstraintCount:constraintList(Q,p).length,source}
    }
    const class0=__diagTick();for(const s of classificationSnapshots)profile.redundancyClassificationSamples.push(classifyRedundancySample(s));__diagAdd('postSearchRedundancyClassification',__diagTick()-class0,classificationSnapshots.length||1);
    for(const s of Object.values(profile.factPool.byFamily)){s.averageDomain=s.count?s.domainSum/s.count:null;if(s.minDomain===Infinity)s.minDomain=null}
    if(diag.budgetExceeded)generatorStats.clueSearchBudgetExceeded++;
    __diagActive=null;
    if(result){generatorStats.clueSearchSucceeded++;result.puzzle.clueSearchDiagnostics=clone(diag);return{puzzle:result.puzzle,necessity:result.necessity,human:result.human,metrics:result.metrics,mediumAcceptance:result.mediumAcceptance,diagnostics:diag}}
    if(!diag.failureReason)diag.failureReason=diag.compliantUniqueLeavesFound?'search exhausted; all compliant leaves failed Medium':'search exhausted without Medium-compliant irredundant set';return{puzzle:null,diagnostics:diag}
  }`;

src=src.slice(0,a)+profiledSearch+src.slice(b);
fs.writeFileSync(tempPath,src);
let M;
try{M=require(tempPath)}catch(e){try{fs.unlinkSync(tempPath)}catch{}throw e}

const budget={maxNodes:50000,maxCounterexamples:10000,maxMs:5000,maxBranchesPerNode:50,maxCompliantLeaves:20};
const boards=[];
for(let i=1;i<=10;i++){
  const id=`RULESV2-PROFILE-DIAG-${String(i).padStart(2,'0')}`;
  const r=M.generateDiagnosticBoardById(id,budget,{n:7,difficulty:'medium',require:{},forbid:[]});
  assert(r.board,`${id}: board generation failed`);
  const d=r.search,p=d.profile;
  assert(p,`${id}: profiling payload missing`);
  boards.push({
    puzzleId:id,boardGenerationAttempts:r.board.boardGenerationAttempts,factPoolSize:d.factPoolSize,nodes:d.nodesExplored,elapsedMs:d.elapsedMs,budgetReached:d.budgetExceeded,limitReached:d.failureReason,
    uniqueTerminalLeaves:d.completeUniqueLeaves,coverageValidUniqueLeaves:p.earlyUnique.coverageValid,coverageInvalidUniqueLeaves:p.earlyUnique.coverageInvalid,commonUncoveredPattern:Object.entries(p.earlyUnique.uncoveredPatterns).sort((a,b)=>b[1]-a[1])[0]||null,
    necessityChecks:d.necessityValidations,necessityPasses:d.compliantUniqueLeavesFound,necessityFailures:d.completeLeavesFailingNecessity,redundantAtomicCount:d.redundantCluesFoundAtFailedLeaves,
    privateWitness:p.privateWitness,timing:p.timing,factPool:p.factPool,earlyUnique:p.earlyUnique,necessity:p.necessity,redundancyClassificationSamples:p.redundancyClassificationSamples,
    mediumFound:!!r.puzzle,medium:r.medium||null,metrics:r.metrics||null,humanSearchCalls:r.human?.searchCalls??null
  });
  console.log('PROFILE_BOARD',JSON.stringify({id,nodes:d.nodesExplored,time:d.elapsedMs,unique:d.completeUniqueLeaves,coverageValid:p.earlyUnique.coverageValid,coverageInvalid:p.earlyUnique.coverageInvalid,necessityChecks:d.necessityValidations,necessityPass:d.compliantUniqueLeavesFound,medium:!!r.puzzle}));
}
try{fs.unlinkSync(tempPath)}catch{}
assert.strictEqual(execSync('git hash-object engine/medium-7x7.js',{encoding:'utf8'}).trim(),EXPECTED_ENGINE,'production Medium engine changed during profiling');

function addMap(dst,src){for(const [k,v] of Object.entries(src||{}))dst[k]=(dst[k]||0)+v}
function median(xs){const a=xs.slice().sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2}
const agg={earlyUnique:{total:0,coverageValid:0,coverageInvalid:0,byClueCount:{},byCoveredPeople:{},patterns:{},uncoveredPatterns:{},lastClueTypes:{},causeSignals:{twoPlusWithZero:0,oneZeroNoTwos:0,implicitDeterminationWithUncovered:0}},necessity:{byFamily:{},failedCounts:[],owned1:0,owned2:0},privateWitness:{knownPass:0,knownFail:0,unknownPass:0,unknownFail:0},timing:{},factPool:{byFamily:{},totalFacts:0,totalGenerationMs:0},classification:{}};
for(const b of boards){const e=b.earlyUnique;agg.earlyUnique.total+=e.total;agg.earlyUnique.coverageValid+=e.coverageValid;agg.earlyUnique.coverageInvalid+=e.coverageInvalid;addMap(agg.earlyUnique.byClueCount,e.byClueCount);addMap(agg.earlyUnique.byCoveredPeople,e.byCoveredPeople);addMap(agg.earlyUnique.patterns,e.patterns);addMap(agg.earlyUnique.uncoveredPatterns,e.uncoveredPatterns);addMap(agg.earlyUnique.lastClueTypes,e.lastClueTypes);for(const k of Object.keys(agg.earlyUnique.causeSignals))agg.earlyUnique.causeSignals[k]+=e.causeSignals[k]||0;
  for(const [fam,s] of Object.entries(b.necessity.byFamily||{})){const x=agg.necessity.byFamily[fam]||(agg.necessity.byFamily[fam]={tested:0,redundant:0});x.tested+=s.tested;x.redundant+=s.redundant}agg.necessity.failedCounts.push(...(b.necessity.failedRedundantCounts||[]));agg.necessity.owned1+=b.necessity.redundantOwnedByOneClue;agg.necessity.owned2+=b.necessity.redundantOwnedByTwoClues;
  for(const k of Object.keys(agg.privateWitness))agg.privateWitness[k]+=b.privateWitness[k]||0;
  for(const [k,s] of Object.entries(b.timing||{})){const x=agg.timing[k]||(agg.timing[k]={ms:0,calls:0});x.ms+=s.ms;x.calls+=s.calls}
  agg.factPool.totalFacts+=b.factPool.count;agg.factPool.totalGenerationMs+=b.factPool.generationMs;for(const [fam,s] of Object.entries(b.factPool.byFamily||{})){const x=agg.factPool.byFamily[fam]||(agg.factPool.byFamily[fam]={count:0,domainSum:0,minDomain:Infinity,maxDomain:0});x.count+=s.count;x.domainSum+=s.domainSum;x.minDomain=Math.min(x.minDomain,s.minDomain??Infinity);x.maxDomain=Math.max(x.maxDomain,s.maxDomain||0)}
  for(const c of b.redundancyClassificationSamples||[]){if(c)agg.classification[c.source]=(agg.classification[c.source]||0)+1}
}
for(const x of Object.values(agg.necessity.byFamily))x.redundancyRate=x.tested?x.redundant/x.tested:0;
for(const x of Object.values(agg.factPool.byFamily)){x.averageDomain=x.count?x.domainSum/x.count:null;if(x.minDomain===Infinity)x.minDomain=null}
const times=boards.map(b=>b.elapsedMs),failed=agg.necessity.failedCounts;
const timingTotal=times.reduce((a,b)=>a+b,0);for(const x of Object.values(agg.timing)){x.averageMsPerCall=x.calls?x.ms/x.calls:0;x.percentDiagnosticRuntime=timingTotal?x.ms/timingTotal:0}
const totalPW=Object.values(agg.privateWitness).reduce((a,b)=>a+b,0);
const report={
  generatedAt:'2026-09-11',checkpointBase:'afa1f68f03ffce5cde6e956c9f484082896f9e73',productionEngineBlob:EXPECTED_ENGINE,productionEngineByteIdentical:true,strategy:'diagnostic profiling only; temporary instrumented engine copy',budget,
  summary:{boards:10,mediumSuccesses:boards.filter(b=>b.mediumFound).length,averageTimeMs:times.reduce((a,b)=>a+b,0)/10,medianTimeMs:median(times),maxTimeMs:Math.max(...times),budgetFailures:boards.filter(b=>b.budgetReached&&!b.mediumFound).length,totalUniqueLeaves:agg.earlyUnique.total,coverageValidUniqueLeaves:agg.earlyUnique.coverageValid,coverageInvalidUniqueLeaves:agg.earlyUnique.coverageInvalid,necessityFailedLeaves:failed.length,averageRedundantCluesPerFailedLeaf:failed.length?failed.reduce((a,b)=>a+b,0)/failed.length:0,medianRedundantCluesPerFailedLeaf:failed.length?median(failed):0,maxRedundantCluesPerFailedLeaf:failed.length?Math.max(...failed):0,singleRedundantLeaves:failed.filter(x=>x===1).length,multipleRedundantLeaves:failed.filter(x=>x>=2).length,privateWitnessKnownRate:totalPW?(agg.privateWitness.knownPass+agg.privateWitness.knownFail)/totalPW:0},
  aggregate:agg,boards
};
fs.writeFileSync('tests/GENERATOR_PROFILING_10_BOARD_REPORT.json',JSON.stringify(report,null,2)+'\n');
console.log('PROFILE_SUMMARY',JSON.stringify(report.summary));
