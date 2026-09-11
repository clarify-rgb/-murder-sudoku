from pathlib import Path
import re

path = Path('engine/medium-7x7.js')
text = path.read_text()

if 'function searchIrredundantClueSet' in text:
    print('necessity-first search already applied')
    raise SystemExit(0)

old_stats = "  const generatorStats={candidatePuzzlesEvaluated:0,redundantConstraintCandidates:0,redundantConstraintsDetected:0,zeroConstraintCandidates:0,tagGatingRejected:0,mediumFloorRejected:0,depth2FloorRejected:0,chainBreadthRejected:0,placementBreadthRejected:0};"
new_stats = "  const generatorStats={candidatePuzzlesEvaluated:0,redundantConstraintCandidates:0,redundantConstraintsDetected:0,zeroConstraintCandidates:0,tagGatingRejected:0,mediumFloorRejected:0,depth2FloorRejected:0,chainBreadthRejected:0,placementBreadthRejected:0,clueSearchBoards:0,clueSearchSucceeded:0,clueSearchBudgetExceeded:0};\n  const DEFAULT_CLUE_SEARCH_BUDGET=Object.freeze({maxNodes:25000,maxCounterexamples:6000,maxMs:2500,maxBranchesPerNode:40});"
assert old_stats in text
text = text.replace(old_stats, new_stats, 1)

room_marker = "\n\n  function roomConnected(P,rid)"
assert room_marker in text
search_helpers = r'''

  function arrangementSignature(A){return PEOPLE.map(p=>`${p}:${A[p].r},${A[p].c}`).join('|')}
  function differsFromStored(P,A){return PEOPLE.some(p=>!same(P.solution[p],A[p]))}
  function findArrangement(P,predicate){
    const propagated=propagateDomains(P);if(propagated.contradiction)return null;
    const domains=Object.fromEntries(PEOPLE.map(p=>[p,[...propagated.domains[p]].map(cell)])),assigned={},usedR=new Set,usedC=new Set;
    let found=null;
    function rec(){
      if(found)return;
      if(Object.keys(assigned).length===N){if(fullValid(P,assigned)&&predicate(assigned)){found=clone(assigned)}return}
      let best=null,bestOpts=null;
      for(const p of PEOPLE)if(!assigned[p]){
        const opts=domains[p].filter(x=>!usedR.has(x.r)&&!usedC.has(x.c));
        if(!best||opts.length<bestOpts.length){best=p;bestOpts=opts}
      }
      if(!bestOpts||!bestOpts.length)return;
      bestOpts=bestOpts.slice().sort((a,b)=>{const ai=same(a,P.solution[best])?1:0,bi=same(b,P.solution[best])?1:0;return ai-bi||a.r-b.r||a.c-b.c});
      for(const x of bestOpts){assigned[best]=x;usedR.add(x.r);usedC.add(x.c);if(partialConsistent(P,assigned))rec();usedR.delete(x.r);usedC.delete(x.c);delete assigned[best];if(found)return}
    }
    rec();return found
  }
  function findCounterexample(P){return findArrangement(P,A=>differsFromStored(P,A))}
  function findViolationWitness(P,item){return findArrangement(P,A=>!constraintSatisfied(P,item.subject,item.constraint,A))}
  function applySelectedFacts(P,selected){const Q=clone(P);Q.constraints=Object.fromEntries(PEOPLE.map(p=>[p,[]]));Q.globalConstraints=[];for(const item of selected)Q.constraints[item.subject].push(clone(item.constraint));return Q}
  function selectedCounts(selected){return Object.fromEntries(PEOPLE.map(p=>[p,selected.filter(x=>x.subject===p).length]))}
  function finalPersonalClueQuality(P){for(const p of PEOPLE){const cs=constraintList(P,p);if(cs.length<1||cs.length>2||!sameObjectPairValid(P,p,cs))return false;const n=ownCandidates(P,p).length;if(n<2||n>Math.max(9,N+1))return false}return true}
  function extensionLegal(P,selected,item){const own=selected.filter(x=>x.subject===item.subject);if(own.length>=2)return false;const cs=[...own.map(x=>x.constraint),item.constraint];if(!sameObjectPairValid(P,item.subject,cs))return false;const Q=applySelectedFacts(P,[...selected,item]);const n=ownCandidates(Q,item.subject).length;if(n<2)return false;if(cs.length===2&&n>Math.max(9,N+1))return false;return true}
  function searchIrredundantClueSet(P,request={forbid:[]},budget={}){
    const cfg={...DEFAULT_CLUE_SEARCH_BUDGET,...budget},start=Date.now(),base=clone(P);base.constraints=Object.fromEntries(PEOPLE.map(p=>[p,[]]));base.globalConstraints=[];
    const pool=buildAtomicFactPool(base,request),poolById=new Map(pool.map(x=>[x.id,x])),visited=new Set,knownCounterexamples=new Map;
    const diag={factPoolSize:pool.length,nodesExplored:0,counterexamplesEncountered:0,distinctCounterexamples:0,completeUniqueLeaves:0,uniqueLeavesRejectedForRedundancy:0,witnessRepairSearches:0,irredundantFound:false,elapsedMs:0,budget:{...cfg},budgetExceeded:false,failureReason:null};
    generatorStats.clueSearchBoards++;
    if(PEOPLE.some(p=>!pool.some(x=>x.subject===p))){diag.failureReason='fact pool lacks coverage for at least one person';diag.elapsedMs=Date.now()-start;return{puzzle:null,diagnostics:diag}}
    let stop=false;
    function overBudget(){if(stop)return true;if(diag.nodesExplored>=cfg.maxNodes){diag.budgetExceeded=true;diag.failureReason='node budget';stop=true;return true}if(diag.counterexamplesEncountered>=cfg.maxCounterexamples){diag.budgetExceeded=true;diag.failureReason='counterexample budget';stop=true;return true}if(Date.now()-start>=cfg.maxMs){diag.budgetExceeded=true;diag.failureReason='wall-clock budget';stop=true;return true}return false}
    function dfs(selected,witnesses){
      if(overBudget())return null;
      const key=selected.map(x=>x.id).sort().join(';');if(visited.has(key))return null;visited.add(key);diag.nodesExplored++;
      const Q=applySelectedFacts(base,selected),alt=findCounterexample(Q);
      if(!alt){
        diag.completeUniqueLeaves++;
        const counts=selectedCounts(selected);if(PEOPLE.some(p=>counts[p]<1||counts[p]>2))return null;if(!finalPersonalClueQuality(Q))return null;
        const solutions=countSolutions(Q,2);if(solutions!==1)return null;
        const necessity=validateNecessity(Q);if(!necessity.ok){diag.uniqueLeavesRejectedForRedundancy++;return null}
        Q.selectionAttempts=diag.nodesExplored;Q.clueSearchDiagnostics=null;diag.irredundantFound=true;return{puzzle:Q,necessity}
      }
      diag.counterexamplesEncountered++;const sig=arrangementSignature(alt);if(!knownCounterexamples.has(sig)){knownCounterexamples.set(sig,alt);diag.distinctCounterexamples=knownCounterexamples.size}
      if(overBudget())return null;
      const counts=selectedCounts(selected),selectedIds=new Set(selected.map(x=>x.id)),candidates=[];
      for(const item of pool){
        if(selectedIds.has(item.id)||counts[item.subject]>=2)continue;
        if(constraintSatisfied(base,item.subject,item.constraint,alt))continue;
        if(!extensionLegal(base,selected,item))continue;
        const ownCount=counts[item.subject],currentWitnesses=[...witnesses.values()],preserved=currentWitnesses.filter(w=>constraintSatisfied(base,item.subject,item.constraint,w)).length;
        let hits=0;for(const w of knownCounterexamples.values())if(!constraintSatisfied(base,item.subject,item.constraint,w))hits++;
        const temp=applySelectedFacts(base,[...selected,item]),combinedDomain=ownCandidates(temp,item.subject).length;
        const coverageBonus=ownCount===0?100000:0,directPenalty=combinedDomain===1?1000000:0,domainGain=Math.max(0,baseCandidates(base).length-item.candidateDomainSize);
        const score=coverageBonus+hits*400+preserved*80+domainGain*4-Math.abs(combinedDomain-5)*3-directPenalty;
        candidates.push({item,score})
      }
      candidates.sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
      const branch=candidates.slice(0,cfg.maxBranchesPerNode);
      candidateLoop:for(const {item} of branch){
        if(overBudget())break;
        const next=[...selected,item],nextWitnesses=new Map(witnesses);nextWitnesses.set(item.id,alt);
        for(const old of selected){const w=nextWitnesses.get(old.id);if(w&&constraintSatisfied(base,item.subject,item.constraint,w))continue;const withoutOld=applySelectedFacts(base,next.filter(x=>x.id!==old.id));diag.witnessRepairSearches++;const replacement=findViolationWitness(withoutOld,old);if(!replacement)continue candidateLoop;nextWitnesses.set(old.id,replacement)}
        const hit=dfs(next,nextWitnesses);if(hit)return hit
      }
      return null
    }
    const result=dfs([],new Map);diag.elapsedMs=Date.now()-start;
    if(diag.budgetExceeded)generatorStats.clueSearchBudgetExceeded++;
    if(result){generatorStats.clueSearchSucceeded++;result.puzzle.clueSearchDiagnostics=clone(diag);return{puzzle:result.puzzle,necessity:result.necessity,diagnostics:diag}}
    if(!diag.failureReason)diag.failureReason='search exhausted without compliant irredundant set';return{puzzle:null,diagnostics:diag}
  }
'''
text = text.replace(room_marker, search_helpers + room_marker, 1)

fact_pattern = re.compile(r"  function factPool\(P,p,forbid=new Set\)\{.*?\n  function advancedDeductionKey", re.S)
fact_replacement = r'''  function factPool(P,p,forbid=new Set){const x=P.solution[p],out=[],add=cl=>{if(forbid.has(cl.type))return;if(constraintTagValid(P,cl)&&constraintSatisfied(P,p,cl,P.solution))out.push(cl);else if(OBJECT_RELATIONS.has(cl.type)&&!constraintTagValid(P,cl))generatorStats.tagGatingRejected++};const rn=roomName(P,x),occ=roomOccupants(P);add({type:'IN_ROOM',room:rn});for(const room of P.roomNames)if(room!==rn)add({type:'NOT_IN_ROOM',room});if(isCornerCell(P,x))add({type:'CORNER',room:rn});if(occ[rn].length===1)add({type:'ALONE_IN_ROOM',room:rn});if(occ[rn].length===2){const other=occ[rn].find(q=>q!==p);add({type:'ALONE_WITH',other})}add({type:'ROW',row:x.r});add({type:'COLUMN',column:x.c});for(const q of PEOPLE)if(q!==p){const y=P.solution[q];if(x.c<y.c)add({type:'WEST_OF_PERSON',other:q});if(x.c>y.c)add({type:'EAST_OF_PERSON',other:q});if(x.r<y.r)add({type:'NORTH_OF_PERSON',other:q});if(x.r>y.r)add({type:'SOUTH_OF_PERSON',other:q})}for(const o of P.objects){if(allowsOn(o)&&onObject(P,x,o.name)){add({type:'ON_OBJECT',object:o.name});if(objectOccupants(P,o.name).length===1)add({type:'ONLY_PERSON_ON_OBJECT',object:o.name})}if(allowsBesideOrDirection(o)){if(besideObject(P,x,o.name))add({type:'BESIDE_OBJECT',object:o.name});else if(!onObject(P,x,o.name))add({type:'NOT_BESIDE_OBJECT',object:o.name});for(const t of ['WEST_OF_OBJECT','EAST_OF_OBJECT','NORTH_OF_OBJECT','SOUTH_OF_OBJECT'])if(directionalToObject(P,t,x,o.name))add({type:t,object:o.name})}if(allowsDiagonal(o)&&diagonalToObject(P,x,o.name))add({type:'DIAGONAL_TO_OBJECT',object:o.name})}const seen=new Set;return out.filter(cl=>{const k=JSON.stringify(cl);if(seen.has(k))return false;seen.add(k);return true})}
  function singleFactDomain(P,p,cl){if(PERSON_RELATIONS.has(cl.type)){const Q=clone(P);Q.constraints=Object.fromEntries(PEOPLE.map(q=>[q,[]]));Q.globalConstraints=[];Q.constraints[p]=[clone(cl)];const r=propagateDomains(Q);return[...r.domains[p]].map(cell)}return baseCandidates(P).filter(x=>unaryHolds(P,cl,x))}
  function buildAtomicFactPool(P,request={forbid:[]}){const forbid=new Set((request.forbid||[]).map(normalizeForbid)),out=[];for(const p of PEOPLE)for(const cl of factPool(P,p,forbid)){const legal=ATOMIC_TYPES.includes(cl.type)&&constraintTagValid(P,cl)&&constraintSatisfied(P,p,cl,P.solution);if(!legal)continue;const domain=singleFactDomain(P,p,cl),id=`${p}|${JSON.stringify(cl)}`;out.push({id,subject:p,constraint:clone(cl),candidateDomain:domain,candidateDomainSize:domain.length,legal:true,sameObjectQuality:true})}return out}

  function advancedDeductionKey'''
text, n = fact_pattern.subn(fact_replacement, text, count=1)
assert n == 1, f'factPool replacement count {n}'

board_pattern = re.compile(r"  function buildBoard\(\)\{.*?\n  function finalizePuzzle", re.S)
board_replacement = r'''  function buildBoard(){const R=generateRegionGrid();if(!R)return null;const roomCount=Math.max(...R.flat())+1,P={version:2,n:N,difficulty:'medium',people:[...PEOPLE],regionOf:R,roomNames:Array.from({length:roomCount},(_,i)=>`R${i+1}`),objects:[],constraints:Object.fromEntries(PEOPLE.map(p=>[p,[]])),globalConstraints:[]};P.solution=makeSolution(P);makeObjects(P);const s=validateStructural(P,{allowEmptyPersonConstraints:true});return s.ok?P:null}
  function selectConstraints(P,req,searchBudget={}){const result=searchIrredundantClueSet(P,req,searchBudget);return result.puzzle}
  function generateBoardById(id,maxBoardAttempts=40){return withSeed(id,()=>{for(let attempt=1;attempt<=maxBoardAttempts;attempt++){const P=buildBoard();if(P){P.boardGenerationAttempts=attempt;return P}}return null})}
  function generateDiagnosticBoardById(id,searchBudget={},request={n:N,difficulty:'medium',require:{},forbid:[]}){const vr=validateRequest(request);if(!vr.ok)throw Error(vr.reason);if(vr.request.n!==N)return createEngine(vr.request.n).generateDiagnosticBoardById(id,searchBudget,vr.request);const P=generateBoardById(id,40);if(!P)return{puzzleId:id,board:null,search:{factPoolSize:0,nodesExplored:0,counterexamplesEncountered:0,completeUniqueLeaves:0,uniqueLeavesRejectedForRedundancy:0,irredundantFound:false,elapsedMs:0,failureReason:'board generation failed'},medium:{ok:false,reasons:['board generation failed']}};const sr=searchIrredundantClueSet(P,vr.request,searchBudget);if(!sr.puzzle)return{puzzleId:id,board:P,search:sr.diagnostics,medium:{ok:false,reasons:['no compliant irredundant clue set']}};const Q=sr.puzzle,solutions=countSolutions(Q,2),necessity=validateNecessity(Q),human=strictSolve(Q);let m=null,medium;if(human.ok){m=metrics(Q,human);medium=mediumAcceptance(m)}else medium={ok:false,reasons:[human.reason]};return{puzzleId:id,board:P,puzzle:Q,search:sr.diagnostics,solutions,necessity,human,metrics:m,medium}}

  function finalizePuzzle'''
text, n = board_pattern.subn(board_replacement, text, count=1)
assert n == 1, f'board/select replacement count {n}'

old_generate = "  function generateById(id,maxGenerationAttempts=1800,request={n:N,difficulty:'medium',require:{},forbid:[]}){const vr=validateRequest(request);if(!vr.ok)throw Error(vr.reason);if(vr.request.n!==N)return createEngine(vr.request.n).generateById(id,maxGenerationAttempts,vr.request);return withSeed(id,()=>{for(let attempt=1;attempt<=maxGenerationAttempts;attempt++){const P=buildBoard();if(!P)continue;const selected=selectConstraints(P,vr.request);if(!selected)continue;const final=finalizePuzzle(selected,vr.request,id,attempt);if(final)return final}return null})}"
new_generate = "  function generateById(id,maxGenerationAttempts=1800,request={n:N,difficulty:'medium',require:{},forbid:[]}){const vr=validateRequest(request);if(!vr.ok)throw Error(vr.reason);if(vr.request.n!==N)return createEngine(vr.request.n).generateById(id,maxGenerationAttempts,vr.request);return withSeed(id,()=>{for(let attempt=1;attempt<=maxGenerationAttempts;attempt++){const P=buildBoard();if(!P)continue;const selected=selectConstraints(P,vr.request);if(!selected)continue;const policy=validateSampledCandidatePolicy(selected);if(!policy.ok)continue;const h=strictSolve(selected);if(!h.ok){generatorStats.mediumFloorRejected++;continue}const m=metrics(selected,h),accept=mediumAcceptance(m);if(!accept.ok){generatorStats.mediumFloorRejected++;if(accept.reasons.includes('depth-2 floor'))generatorStats.depth2FloorRejected++;if(accept.reasons.includes('chain people < 4'))generatorStats.chainBreadthRejected++;if(accept.reasons.includes('advanced placements < 4'))generatorStats.placementBreadthRejected++;continue}if(countSolutions(selected,2)!==1)continue;selected.validation={solutions:1,human:h,metrics:m,necessity:policy.necessity,mediumAcceptance:accept,mediumClassification:classifyMedium(m)};const final=finalizePuzzle(selected,vr.request,id,attempt);if(final)return final}return null})}"
assert old_generate in text
text = text.replace(old_generate, new_generate, 1)

old_export = "validateRequest,generateById,validate,metrics,analyzeMediumStructure,mediumAcceptance,classifyMedium"
new_export = "validateRequest,buildAtomicFactPool,searchIrredundantClueSet,generateBoardById,generateDiagnosticBoardById,generateById,validate,metrics,analyzeMediumStructure,mediumAcceptance,classifyMedium"
assert old_export in text
text = text.replace(old_export, new_export, 1)

path.write_text(text)
print('applied necessity-first counterexample-guided clue search')
