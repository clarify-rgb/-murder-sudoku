from pathlib import Path
import re

path = Path("engine/medium-7x7.js")
text = path.read_text()

if "freshPartialWitnessRepairSearches" in text and "sharedCounterexamplePoolSize" in text:
    print("lazy necessity + shared counterexample search already applied")
    raise SystemExit(0)

pattern = re.compile(
    r"  function searchIrredundantClueSet\(P,request=\{forbid:\[\]\},budget=\{\}\)\{.*?\n  \}\n\n  function roomConnected",
    re.S,
)

replacement = r'''  function searchIrredundantClueSet(P,request={forbid:[]},budget={}){
    const cfg={...DEFAULT_CLUE_SEARCH_BUDGET,maxNodes:50000,maxCounterexamples:10000,maxMs:5000,maxBranchesPerNode:50,maxCompliantLeaves:20,...budget};
    const start=Date.now(),base=clone(P);base.constraints=Object.fromEntries(PEOPLE.map(p=>[p,[]]));base.globalConstraints=[];
    const pool=buildAtomicFactPool(base,request);pool.forEach((item,i)=>item.factIndex=i);
    const visited=new Set,completeLeafSignatures=new Set,redundantLeafSignatures=new Set;
    const counterexamplePool=[],counterexampleBySignature=new Map;
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
      firstCompliantLeaf:null,passingLeaf:null
    };
    generatorStats.clueSearchBoards++;
    if(PEOPLE.some(p=>!pool.some(x=>x.subject===p))){
      diag.failureReason='fact pool lacks coverage for at least one person';diag.elapsedMs=Date.now()-start;
      return{puzzle:null,diagnostics:diag}
    }
    let stop=false;
    const keyFor=selected=>selected.map(x=>x.id).sort().join(';');
    function overBudget(){
      if(stop)return true;
      if(diag.nodesExplored>=cfg.maxNodes){diag.budgetExceeded=true;diag.failureReason='node budget';stop=true;return true}
      if(diag.newCounterexamplesSolved>=cfg.maxCounterexamples){diag.budgetExceeded=true;diag.failureReason='counterexample budget';stop=true;return true}
      if(diag.compliantUniqueLeavesFound>=cfg.maxCompliantLeaves){diag.budgetExceeded=true;diag.failureReason='compliant leaf budget';stop=true;return true}
      if(Date.now()-start>=cfg.maxMs){diag.budgetExceeded=true;diag.failureReason='wall-clock budget';stop=true;return true}
      return false
    }
    function counterexampleSurvives(entry,selected){
      for(const item of selected)if(entry.violated[item.factIndex])return false;
      return true
    }
    function addCounterexample(alt){
      const sig=arrangementSignature(alt);
      if(counterexampleBySignature.has(sig))return counterexampleBySignature.get(sig);
      const violated=new Uint8Array(pool.length);
      for(let i=0;i<pool.length;i++)if(!constraintSatisfied(base,pool[i].subject,pool[i].constraint,alt))violated[i]=1;
      const entry={signature:sig,arrangement:clone(alt),violated};
      counterexamplePool.push(entry);counterexampleBySignature.set(sig,entry);
      diag.newCounterexamplesSolved++;diag.sharedCounterexamplePoolSize=counterexamplePool.length;
      return entry
    }
    function getCounterexample(Q,selected){
      for(const entry of counterexamplePool)if(counterexampleSurvives(entry,selected)){
        diag.reusedCounterexampleHits++;diag.counterexamplesEncountered++;return entry
      }
      diag.freshCounterexampleSolverCalls++;
      const t0=Date.now(),alt=findCounterexample(Q);diag.freshCounterexampleSearchTimeMs+=Date.now()-t0;
      if(!alt)return null;
      diag.counterexamplesEncountered++;return addCounterexample(alt)
    }
    function leafSummary(Q,signature,h,m,accept,index){
      return{
        index,signature,
        constraints:Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).map(clone)])),
        atomicConstraintsPerPerson:Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).length])),
        totalAtomicConstraints:atomicConstraintCount(Q),humanSearchCalls:h?.searchCalls??null,
        deterministicHumanSolved:!!h?.ok,mediumPass:!!accept?.ok,
        mediumReasons:accept?.reasons||[h?.reason||'deterministic human solve failed'],
        mediumClassification:h?.ok?classifyMedium(m):'TOO EASY',initialCandidates:m?.initialCandidates||null,
        structuralAdvancedDeductions:m?.advancedDeductionCount??null,materialAdvancedDeductions:m?.materialAdvancedDeductions??null,
        ownershipCount:m?.ownershipCount??null,intersectionCount:m?.intersectionCount??null,
        dependencyDepth:m?.dependencyDepth??null,chainPeople:m?.multiPersonChainPeople??null,
        advancedDependentPlacements:m?.advancedDependentPlacements??null,traceLength:m?.totalDeterministicTraceLength??null
      }
    }
    function mediumHeuristicBonus(item,combinedDomain,counts){
      let score=0;
      if(PERSON_RELATIONS.has(item.constraint.type))score+=180;
      if(['ONLY_PERSON_ON_OBJECT','ALONE_IN_ROOM','ALONE_WITH'].includes(item.constraint.type))score+=130;
      if(combinedDomain>=2&&combinedDomain<=3)score+=110;else if(combinedDomain>=4&&combinedDomain<=6)score+=60;
      if(item.constraint.other&&counts[item.constraint.other]>0)score+=70;
      if(['ROW','COLUMN'].includes(item.constraint.type))score-=45;
      return score
    }
    function updateWitnessStates(witnesses,selected,newItem,newWitness){
      const next=new Map(witnesses);next.set(newItem.id,clone(newWitness));
      for(const old of selected){
        const w=next.get(old.id);
        if(!w)continue;
        if(constraintSatisfied(base,newItem.subject,newItem.constraint,w))diag.retainedValidWitnesses++;
        else{next.set(old.id,null);diag.witnessStatesMarkedUnknown++}
      }
      return next
    }
    function dfs(selected,witnesses){
      if(overBudget())return null;
      const key=keyFor(selected);if(visited.has(key))return null;
      visited.add(key);diag.nodesExplored++;diag.distinctClueSetsExplored=visited.size;
      const Q=applySelectedFacts(base,selected),ce=getCounterexample(Q,selected);
      if(!ce){
        diag.completeUniqueLeaves++;
        if(completeLeafSignatures.has(key))return null;
        completeLeafSignatures.add(key);
        const counts=selectedCounts(selected);
        if(PEOPLE.some(p=>counts[p]<1||counts[p]>2))return null;
        if(!finalPersonalClueQuality(Q))return null;
        if(countSolutions(Q,2)!==1)return null;
        diag.necessityValidations++;
        const nt0=Date.now(),necessity=validateNecessity(Q);diag.necessityValidationTimeMs+=Date.now()-nt0;
        if(!necessity.ok){
          diag.completeLeavesFailingNecessity++;diag.redundantCluesFoundAtFailedLeaves+=necessity.redundantCount||0;
          redundantLeafSignatures.add(key);
          if(diag.redundantLeafSignatures.length<20)diag.redundantLeafSignatures.push({signature:key,redundant:(necessity.redundantConstraints||[]).map(x=>({subject:x.subject,index:x.index,constraint:clone(x.constraint),solutionCountWithoutConstraint:x.solutionCountWithoutConstraint}))});
          return null
        }
        diag.compliantUniqueLeavesFound++;diag.irredundantFound=true;
        const mt0=Date.now(),human=strictSolve(Q);let m=null,accept;
        if(human.ok){m=metrics(Q,human);accept=mediumAcceptance(m)}else accept={ok:false,reasons:[human.reason]};
        diag.mediumValidationTimeMs+=Date.now()-mt0;
        const summary=leafSummary(Q,key,human,m,accept,diag.compliantUniqueLeavesFound);
        if(!diag.firstCompliantLeaf)diag.firstCompliantLeaf=clone(summary);
        if(accept.ok){
          diag.leavesPassingMedium++;diag.mediumFound=true;diag.firstPassingLeafIndex=diag.compliantUniqueLeavesFound;diag.passingLeaf=clone(summary);
          Q.selectionAttempts=diag.nodesExplored;
          Q.validation={solutions:1,human,metrics:m,necessity,mediumAcceptance:accept,mediumClassification:classifyMedium(m)};
          return{puzzle:Q,necessity,human,metrics:m,mediumAcceptance:accept}
        }
        diag.leavesFailingMedium++;
        if(diag.compliantUniqueLeavesFound>=cfg.maxCompliantLeaves){diag.budgetExceeded=true;diag.failureReason='compliant leaf budget';stop=true}
        return null
      }
      if(overBudget())return null;
      const counts=selectedCounts(selected),selectedIds=new Set(selected.map(x=>x.id));
      const surviving=counterexamplePool.filter(entry=>counterexampleSurvives(entry,selected));
      const candidates=[];
      for(const item of pool){
        if(selectedIds.has(item.id)||counts[item.subject]>=2||!ce.violated[item.factIndex])continue;
        if(!extensionLegal(base,selected,item))continue;
        let hits=0;for(const entry of surviving)if(entry.violated[item.factIndex])hits++;
        const temp=applySelectedFacts(base,[...selected,item]),combinedDomain=ownCandidates(temp,item.subject).length;
        const coverageBonus=counts[item.subject]===0?100000:0,directPenalty=combinedDomain===1?1000000:0;
        const domainGain=Math.max(0,baseCandidates(base).length-item.candidateDomainSize);
        const score=coverageBonus+hits*500+domainGain*3-Math.abs(combinedDomain-4)*2-directPenalty+mediumHeuristicBonus(item,combinedDomain,counts);
        candidates.push({item,score})
      }
      candidates.sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
      const branch=candidates.slice(0,cfg.maxBranchesPerNode);
      for(const {item} of branch){
        if(overBudget())break;
        const next=[...selected,item];
        const nextWitnesses=updateWitnessStates(witnesses,selected,item,ce.arrangement);
        const hitResult=dfs(next,nextWitnesses);if(hitResult)return hitResult
      }
      return null
    }
    const result=dfs([],new Map);diag.elapsedMs=Date.now()-start;
    if(diag.budgetExceeded)generatorStats.clueSearchBudgetExceeded++;
    if(result){
      generatorStats.clueSearchSucceeded++;result.puzzle.clueSearchDiagnostics=clone(diag);
      return{puzzle:result.puzzle,necessity:result.necessity,human:result.human,metrics:result.metrics,mediumAcceptance:result.mediumAcceptance,diagnostics:diag}
    }
    if(!diag.failureReason)diag.failureReason=diag.compliantUniqueLeavesFound?'search exhausted; all compliant leaves failed Medium':'search exhausted without Medium-compliant irredundant set';
    return{puzzle:null,diagnostics:diag}
  }

  function roomConnected'''

text, n = pattern.subn(replacement, text, count=1)
assert n == 1, f"lazy search replacement count {n}"
path.write_text(text)
print("applied lazy necessity + shared board-level counterexample search")
