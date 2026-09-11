from pathlib import Path
import re

path = Path("engine/medium-7x7.js")
text = path.read_text()

if "compliantUniqueLeavesFound" in text and "maxCompliantLeaves" in text:
    print("multi-leaf Medium search already applied")
    raise SystemExit(0)

pattern = re.compile(
    r"  function searchIrredundantClueSet\(P,request=\{forbid:\[\]\},budget=\{\}\)\{.*?\n  \}\n\n  function roomConnected",
    re.S,
)

replacement = r'''  function searchIrredundantClueSet(P,request={forbid:[]},budget={}){
    const cfg={...DEFAULT_CLUE_SEARCH_BUDGET,maxNodes:50000,maxCounterexamples:10000,maxMs:5000,maxBranchesPerNode:50,maxCompliantLeaves:20,...budget};
    const start=Date.now(),base=clone(P);base.constraints=Object.fromEntries(PEOPLE.map(p=>[p,[]]));base.globalConstraints=[];
    const pool=buildAtomicFactPool(base,request);
    const visited=new Set,knownCounterexamples=new Map,completeLeafSignatures=new Set;
    const partialAltCache=new Map,solutionCountCache=new Map,witnessCache=new Map,falseFactsCache=new Map;
    const diag={
      factPoolSize:pool.length,nodesExplored:0,counterexamplesEncountered:0,distinctCounterexamples:0,
      completeUniqueLeaves:0,distinctCompleteLeafSets:0,compliantUniqueLeavesFound:0,
      leavesFailingMedium:0,leavesPassingMedium:0,firstPassingLeafIndex:null,
      uniqueLeavesRejectedForRedundancy:0,redundantLeavesRejected:0,
      witnessRepairSearches:0,witnessSearchesPerformed:0,existingWitnessRetained:0,
      distinctClueSetsExplored:0,irredundantFound:false,mediumFound:false,elapsedMs:0,
      budget:{...cfg},budgetExceeded:false,failureReason:null,
      cacheHits:{alternative:0,solutionCount:0,witness:0,falseFacts:0,total:0},
      cacheMisses:{alternative:0,solutionCount:0,witness:0,falseFacts:0,total:0},
      firstCompliantLeaf:null,passingLeaf:null
    };
    generatorStats.clueSearchBoards++;
    if(PEOPLE.some(p=>!pool.some(x=>x.subject===p))){
      diag.failureReason='fact pool lacks coverage for at least one person';diag.elapsedMs=Date.now()-start;
      return{puzzle:null,diagnostics:diag}
    }
    let stop=false;
    const keyFor=selected=>selected.map(x=>x.id).sort().join(';');
    const hit=k=>{diag.cacheHits[k]++;diag.cacheHits.total++};
    const miss=k=>{diag.cacheMisses[k]++;diag.cacheMisses.total++};
    function overBudget(){
      if(stop)return true;
      if(diag.nodesExplored>=cfg.maxNodes){diag.budgetExceeded=true;diag.failureReason='node budget';stop=true;return true}
      if(diag.counterexamplesEncountered>=cfg.maxCounterexamples){diag.budgetExceeded=true;diag.failureReason='counterexample budget';stop=true;return true}
      if(diag.compliantUniqueLeavesFound>=cfg.maxCompliantLeaves){diag.budgetExceeded=true;diag.failureReason='compliant leaf budget';stop=true;return true}
      if(Date.now()-start>=cfg.maxMs){diag.budgetExceeded=true;diag.failureReason='wall-clock budget';stop=true;return true}
      return false
    }
    function cachedCounterexample(Q,key){
      if(partialAltCache.has(key)){hit('alternative');const v=partialAltCache.get(key);return v?clone(v):null}
      miss('alternative');const alt=findCounterexample(Q);partialAltCache.set(key,alt?clone(alt):null);return alt
    }
    function cachedSolutionCount(Q,key){
      if(solutionCountCache.has(key)){hit('solutionCount');return solutionCountCache.get(key)}
      miss('solutionCount');const n=countSolutions(Q,2);solutionCountCache.set(key,n);return n
    }
    function falseFactIds(alt){
      const sig=arrangementSignature(alt);
      if(falseFactsCache.has(sig)){hit('falseFacts');return falseFactsCache.get(sig)}
      miss('falseFacts');const ids=new Set;
      for(const item of pool)if(!constraintSatisfied(base,item.subject,item.constraint,alt))ids.add(item.id);
      falseFactsCache.set(sig,ids);return ids
    }
    function cachedWitness(selectedWithoutOld,old){
      const k=`${keyFor(selectedWithoutOld)}||${old.id}`;
      if(witnessCache.has(k)){hit('witness');const v=witnessCache.get(k);return v?clone(v):null}
      miss('witness');diag.witnessRepairSearches++;diag.witnessSearchesPerformed++;
      const Q=applySelectedFacts(base,selectedWithoutOld),w=findViolationWitness(Q,old);
      witnessCache.set(k,w?clone(w):null);return w
    }
    function leafSummary(Q,signature,h,m,accept,index){
      return{
        index,signature,
        constraints:Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).map(clone)])),
        atomicConstraintsPerPerson:Object.fromEntries(PEOPLE.map(p=>[p,constraintList(Q,p).length])),
        totalAtomicConstraints:atomicConstraintCount(Q),
        humanSearchCalls:h?.searchCalls??null,
        deterministicHumanSolved:!!h?.ok,
        mediumPass:!!accept?.ok,
        mediumReasons:accept?.reasons||[h?.reason||'deterministic human solve failed'],
        mediumClassification:h?.ok?classifyMedium(m):'TOO EASY',
        initialCandidates:m?.initialCandidates||null,
        structuralAdvancedDeductions:m?.advancedDeductionCount??null,
        materialAdvancedDeductions:m?.materialAdvancedDeductions??null,
        ownershipCount:m?.ownershipCount??null,
        intersectionCount:m?.intersectionCount??null,
        relationalDeductions:m?.relationalDeductions??null,
        dependencyDepth:m?.dependencyDepth??null,
        chainPeople:m?.multiPersonChainPeople??null,
        advancedDependentPlacements:m?.advancedDependentPlacements??null,
        traceLength:m?.totalDeterministicTraceLength??null
      }
    }
    function mediumHeuristicBonus(item,combinedDomain,counts){
      let score=0;
      if(PERSON_RELATIONS.has(item.constraint.type))score+=180;
      if(['ONLY_PERSON_ON_OBJECT','ALONE_IN_ROOM','ALONE_WITH'].includes(item.constraint.type))score+=130;
      if(combinedDomain>=2&&combinedDomain<=3)score+=110;
      else if(combinedDomain>=4&&combinedDomain<=6)score+=60;
      if(item.constraint.other&&counts[item.constraint.other]>0)score+=70;
      if(['ROW','COLUMN'].includes(item.constraint.type))score-=45;
      return score
    }
    function dfs(selected,witnesses){
      if(overBudget())return null;
      const key=keyFor(selected);if(visited.has(key))return null;visited.add(key);diag.nodesExplored++;diag.distinctClueSetsExplored=visited.size;
      const Q=applySelectedFacts(base,selected),alt=cachedCounterexample(Q,key);
      if(!alt){
        diag.completeUniqueLeaves++;
        if(completeLeafSignatures.has(key))return null;
        completeLeafSignatures.add(key);diag.distinctCompleteLeafSets=completeLeafSignatures.size;
        const counts=selectedCounts(selected);if(PEOPLE.some(p=>counts[p]<1||counts[p]>2))return null;
        if(!finalPersonalClueQuality(Q))return null;
        const solutions=cachedSolutionCount(Q,key);if(solutions!==1)return null;
        const necessity=validateNecessity(Q);
        if(!necessity.ok){
          diag.uniqueLeavesRejectedForRedundancy++;diag.redundantLeavesRejected++;
          return null
        }
        diag.compliantUniqueLeavesFound++;diag.irredundantFound=true;
        const human=strictSolve(Q);let m=null,accept;
        if(human.ok){m=metrics(Q,human);accept=mediumAcceptance(m)}
        else accept={ok:false,reasons:[human.reason]};
        const summary=leafSummary(Q,key,human,m,accept,diag.compliantUniqueLeavesFound);
        if(!diag.firstCompliantLeaf)diag.firstCompliantLeaf=clone(summary);
        if(accept.ok){
          diag.leavesPassingMedium++;diag.mediumFound=true;diag.firstPassingLeafIndex=diag.compliantUniqueLeavesFound;diag.passingLeaf=clone(summary);
          Q.selectionAttempts=diag.nodesExplored;
          Q.validation={solutions:1,human,metrics:m,necessity,mediumAcceptance:accept,mediumClassification:classifyMedium(m)};
          return{puzzle:Q,necessity,human,metrics:m,mediumAcceptance:accept}
        }
        diag.leavesFailingMedium++;
        if(diag.compliantUniqueLeavesFound>=cfg.maxCompliantLeaves){
          diag.budgetExceeded=true;diag.failureReason='compliant leaf budget';stop=true
        }
        return null
      }
      diag.counterexamplesEncountered++;
      const sig=arrangementSignature(alt);if(!knownCounterexamples.has(sig)){knownCounterexamples.set(sig,clone(alt));diag.distinctCounterexamples=knownCounterexamples.size}
      if(overBudget())return null;
      const falseIds=falseFactIds(alt),counts=selectedCounts(selected),selectedIds=new Set(selected.map(x=>x.id)),candidates=[];
      for(const item of pool){
        if(selectedIds.has(item.id)||counts[item.subject]>=2||!falseIds.has(item.id))continue;
        if(!extensionLegal(base,selected,item))continue;
        const ownCount=counts[item.subject],currentWitnesses=[...witnesses.values()];
        const preserved=currentWitnesses.filter(w=>constraintSatisfied(base,item.subject,item.constraint,w)).length;
        let hits=0;for(const w of knownCounterexamples.values())if(!constraintSatisfied(base,item.subject,item.constraint,w))hits++;
        const temp=applySelectedFacts(base,[...selected,item]),combinedDomain=ownCandidates(temp,item.subject).length;
        const coverageBonus=ownCount===0?100000:0,directPenalty=combinedDomain===1?1000000:0;
        const domainGain=Math.max(0,baseCandidates(base).length-item.candidateDomainSize);
        const score=coverageBonus+hits*400+preserved*80+domainGain*3-Math.abs(combinedDomain-4)*2-directPenalty+mediumHeuristicBonus(item,combinedDomain,counts);
        candidates.push({item,score})
      }
      candidates.sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
      const branch=candidates.slice(0,cfg.maxBranchesPerNode);
      candidateLoop:for(const {item} of branch){
        if(overBudget())break;
        const next=[...selected,item],nextWitnesses=new Map(witnesses);nextWitnesses.set(item.id,alt);
        for(const old of selected){
          const w=nextWitnesses.get(old.id);
          if(w&&constraintSatisfied(base,item.subject,item.constraint,w)){diag.existingWitnessRetained++;continue}
          const replacement=cachedWitness(next.filter(x=>x.id!==old.id),old);
          if(!replacement)continue candidateLoop;
          nextWitnesses.set(old.id,replacement)
        }
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
    if(!diag.failureReason){
      diag.failureReason=diag.compliantUniqueLeavesFound?'search exhausted; all compliant leaves failed Medium':'search exhausted without compliant irredundant set'
    }
    return{puzzle:null,diagnostics:diag}
  }

  function roomConnected'''
text, n = pattern.subn(replacement, text, count=1)
assert n == 1, f"search replacement count {n}"

diag_pattern = re.compile(
    r"  function generateDiagnosticBoardById\(id,searchBudget=\{\},request=\{n:N,difficulty:'medium',require:\{\},forbid:\[\]\}\)\{[^\n]*\}\n\n  function finalizePuzzle"
)
diag_replacement = r'''  function generateDiagnosticBoardById(id,searchBudget={},request={n:N,difficulty:'medium',require:{},forbid:[]}){
    const vr=validateRequest(request);if(!vr.ok)throw Error(vr.reason);
    if(vr.request.n!==N)return createEngine(vr.request.n).generateDiagnosticBoardById(id,searchBudget,vr.request);
    const P=generateBoardById(id,40);
    if(!P)return{puzzleId:id,board:null,search:{factPoolSize:0,nodesExplored:0,counterexamplesEncountered:0,completeUniqueLeaves:0,compliantUniqueLeavesFound:0,leavesFailingMedium:0,leavesPassingMedium:0,elapsedMs:0,failureReason:'board generation failed'},medium:{ok:false,reasons:['board generation failed']}};
    const sr=searchIrredundantClueSet(P,vr.request,searchBudget);
    if(!sr.puzzle)return{puzzleId:id,board:P,search:sr.diagnostics,medium:{ok:false,reasons:[sr.diagnostics.failureReason||'no Medium-compliant clue set']}};
    const Q=sr.puzzle,solutions=countSolutions(Q,2),necessity=validateNecessity(Q),human=strictSolve(Q);
    let m=null,medium;if(human.ok){m=metrics(Q,human);medium=mediumAcceptance(m)}else medium={ok:false,reasons:[human.reason]};
    return{puzzleId:id,board:P,puzzle:Q,search:sr.diagnostics,solutions,necessity,human,metrics:m,medium}
  }

  function finalizePuzzle'''
text, n = diag_pattern.subn(diag_replacement, text, count=1)
assert n == 1, f"diagnostic replacement count {n}"

path.write_text(text)
print("applied multi-leaf Medium clue search with board-local caches")
