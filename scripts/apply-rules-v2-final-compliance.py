from pathlib import Path

engine_path = Path('engine/medium-7x7.js')
s = engine_path.read_text()

old = "const generatorStats={redundantConstraintCandidates:0,redundantConstraintsPruned:0,tagGatingRejected:0,depth2FloorRejected:0,chainBreadthRejected:0,placementBreadthRejected:0};"
new = "const generatorStats={candidatePuzzlesEvaluated:0,redundantConstraintCandidates:0,redundantConstraintsDetected:0,zeroConstraintCandidates:0,tagGatingRejected:0,mediumFloorRejected:0,depth2FloorRejected:0,chainBreadthRejected:0,placementBreadthRejected:0};"
assert old in s
s = s.replace(old,new,1)

old = "function validateStructural(P){if(!P||P.n!==N||P.people?.length!==N||P.regionOf?.length!==N||P.regionOf.some(row=>row.length!==N))return{ok:false,reason:'shape'};const roomIds=new Set(P.regionOf.flat());if([...roomIds].some(r=>!Number.isInteger(r)||r<0)||[...roomIds].some(r=>!roomConnected(P,r)))return{ok:false,reason:'room connectivity'};if(!validateObjects(P))return{ok:false,reason:'object invariants'};for(let r=0;r<N;r++)if(!Array.from({length:N},(_,c)=>({r,c})).some(x=>isPlayable(P,x)))return{ok:false,reason:'row has no playable cell'};for(let c=0;c<N;c++)if(!Array.from({length:N},(_,r)=>({r,c})).some(x=>isPlayable(P,x)))return{ok:false,reason:'column has no playable cell'};for(const p of PEOPLE){if(constraintList(P,p).length>2)return{ok:false,reason:'too many atomic constraints'};if(!sameObjectPairValid(P,p,constraintList(P,p)))return{ok:false,reason:'same-object clue pair quality'};for(const cl of constraintList(P,p)){if(!ATOMIC_TYPES.includes(cl.type)||!constraintTagValid(P,cl))return{ok:false,reason:'invalid constraint/tag'}}}for(const cl of P.globalConstraints||[])if(!ATOMIC_TYPES.includes(cl.type)||cl.type!=='EMPTY_ROOM')return{ok:false,reason:'invalid global constraint'};return{ok:true}}"
new = "function validateStructural(P,{allowEmptyPersonConstraints=false}={}){if(!P||P.n!==N||P.people?.length!==N||P.regionOf?.length!==N||P.regionOf.some(row=>row.length!==N))return{ok:false,reason:'shape'};const roomIds=new Set(P.regionOf.flat());if([...roomIds].some(r=>!Number.isInteger(r)||r<0)||[...roomIds].some(r=>!roomConnected(P,r)))return{ok:false,reason:'room connectivity'};if(!validateObjects(P))return{ok:false,reason:'object invariants'};for(let r=0;r<N;r++)if(!Array.from({length:N},(_,c)=>({r,c})).some(x=>isPlayable(P,x)))return{ok:false,reason:'row has no playable cell'};for(let c=0;c<N;c++)if(!Array.from({length:N},(_,r)=>({r,c})).some(x=>isPlayable(P,x)))return{ok:false,reason:'column has no playable cell'};for(const p of PEOPLE){const n=constraintList(P,p).length;if(!allowEmptyPersonConstraints&&n<1)return{ok:false,reason:'missing atomic constraint',person:p};if(n>2)return{ok:false,reason:'too many atomic constraints',person:p};if(!sameObjectPairValid(P,p,constraintList(P,p)))return{ok:false,reason:'same-object clue pair quality'};for(const cl of constraintList(P,p)){if(!ATOMIC_TYPES.includes(cl.type)||!constraintTagValid(P,cl))return{ok:false,reason:'invalid constraint/tag'}}}for(const cl of P.globalConstraints||[])if(!ATOMIC_TYPES.includes(cl.type)||cl.type!=='EMPTY_ROOM')return{ok:false,reason:'invalid global constraint'};return{ok:true}}"
assert old in s
s = s.replace(old,new,1)

old = "function validateNecessity(P){for(const item of allAtomicConstraints(P)){const Q=removeAtomic(P,item),n=countSolutions(Q,2);if(n<2)return{ok:false,redundant:item,solutionCountWithoutConstraint:n}}return{ok:true}}"
new = "function validateNecessity(P){const redundantConstraints=[];for(const item of allAtomicConstraints(P)){const Q=removeAtomic(P,item),n=countSolutions(Q,2);if(n<2)redundantConstraints.push({...item,solutionCountWithoutConstraint:n})}return redundantConstraints.length?{ok:false,redundant:redundantConstraints[0],redundantConstraints,redundantCount:redundantConstraints.length,solutionCountWithoutConstraint:redundantConstraints[0].solutionCountWithoutConstraint}:{ok:true,redundantConstraints:[],redundantCount:0}}\n  function validateSampledCandidatePolicy(P){const structural=validateStructural(P);if(!structural.ok)return{ok:false,reason:structural.reason,structural};const necessity=validateNecessity(P);if(!necessity.ok)return{ok:false,reason:'redundant atomic constraint',necessity};return{ok:true,necessity}}"
assert old in s
s = s.replace(old,new,1)

old = "function buildBoard(){const R=generateRegionGrid();if(!R)return null;const roomCount=Math.max(...R.flat())+1,P={version:2,n:N,difficulty:'medium',people:[...PEOPLE],regionOf:R,roomNames:Array.from({length:roomCount},(_,i)=>`R${i+1}`),objects:[],constraints:Object.fromEntries(PEOPLE.map(p=>[p,[]])),globalConstraints:[]};P.solution=makeSolution(P);makeObjects(P);const s=validateStructural(P);return s.ok?P:null}\n  function minimizeRedundantConstraints(P){let Q=clone(P),changed=true,pruned=0;while(changed){changed=false;outer:for(const p of shuffle(PEOPLE))for(let i=0;i<constraintList(Q,p).length;i++){const T=clone(Q);T.constraints[p].splice(i,1);if(countSolutions(T,2)===1){Q=T;pruned++;changed=true;break outer}}}if(pruned){generatorStats.redundantConstraintCandidates++;generatorStats.redundantConstraintsPruned+=pruned}return Q}\n  function selectConstraints(P,req,maxSelections=650){const forbid=new Set(req.forbid||[]),options={};for(const p of PEOPLE){options[p]=optionSet(P,p,forbid);if(!options[p].length)return null}for(let pick=1;pick<=maxSelections;pick++){P.constraints=Object.fromEntries(PEOPLE.map(p=>{const pool=options[p],top=pool.slice(0,Math.min(36,pool.length));return[p,choose(top).constraints]}));const structural=validateStructural(P);if(!structural.ok){if(structural.reason==='invalid constraint/tag')generatorStats.tagGatingRejected++;continue}const stored=validateStoredSolutionAgainstClues(P);if(!stored.valid)continue;let h=strictSolve(P);if(!h.ok)continue;let m=metrics(P,h),accept=mediumAcceptance(m);if(!accept.ok){if(accept.reasons.includes('depth-2 floor'))generatorStats.depth2FloorRejected++;if(accept.reasons.includes('chain people < 4'))generatorStats.chainBreadthRejected++;if(accept.reasons.includes('advanced placements < 4'))generatorStats.placementBreadthRejected++;continue}if(countSolutions(P,2)!==1)continue;let Q=minimizeRedundantConstraints(P);if(atomicConstraintCount(Q)!==atomicConstraintCount(P)){h=strictSolve(Q);if(!h.ok)continue;m=metrics(Q,h);accept=mediumAcceptance(m);if(!accept.ok)continue}const nec=validateNecessity(Q);if(!nec.ok)continue;Q.selectionAttempts=pick;Q.validation={solutions:1,human:h,metrics:m,necessity:nec,mediumAcceptance:accept,mediumClassification:classifyMedium(m)};return Q}return null}"
new = "function buildBoard(){const R=generateRegionGrid();if(!R)return null;const roomCount=Math.max(...R.flat())+1,P={version:2,n:N,difficulty:'medium',people:[...PEOPLE],regionOf:R,roomNames:Array.from({length:roomCount},(_,i)=>`R${i+1}`),objects:[],constraints:Object.fromEntries(PEOPLE.map(p=>[p,[]])),globalConstraints:[]};P.solution=makeSolution(P);makeObjects(P);const s=validateStructural(P,{allowEmptyPersonConstraints:true});return s.ok?P:null}\n  function selectConstraints(P,req,maxSelections=650){const forbid=new Set(req.forbid||[]),options={};for(const p of PEOPLE){options[p]=optionSet(P,p,forbid);if(!options[p].length)return null}for(let pick=1;pick<=maxSelections;pick++){generatorStats.candidatePuzzlesEvaluated++;P.constraints=Object.fromEntries(PEOPLE.map(p=>{const pool=options[p],top=pool.slice(0,Math.min(36,pool.length));return[p,choose(top).constraints]}));if(PEOPLE.some(p=>constraintList(P,p).length===0)){generatorStats.zeroConstraintCandidates++;continue}const structural=validateStructural(P);if(!structural.ok){if(structural.reason==='invalid constraint/tag')generatorStats.tagGatingRejected++;continue}const stored=validateStoredSolutionAgainstClues(P);if(!stored.valid)continue;const h=strictSolve(P);if(!h.ok)continue;const m=metrics(P,h),accept=mediumAcceptance(m);if(!accept.ok){generatorStats.mediumFloorRejected++;if(accept.reasons.includes('depth-2 floor'))generatorStats.depth2FloorRejected++;if(accept.reasons.includes('chain people < 4'))generatorStats.chainBreadthRejected++;if(accept.reasons.includes('advanced placements < 4'))generatorStats.placementBreadthRejected++;continue}if(countSolutions(P,2)!==1)continue;const policy=validateSampledCandidatePolicy(P);if(!policy.ok){if(policy.reason==='redundant atomic constraint'){generatorStats.redundantConstraintCandidates++;generatorStats.redundantConstraintsDetected+=policy.necessity.redundantCount}if(policy.reason==='missing atomic constraint')generatorStats.zeroConstraintCandidates++;continue}P.selectionAttempts=pick;P.validation={solutions:1,human:h,metrics:m,necessity:policy.necessity,mediumAcceptance:accept,mediumClassification:classifyMedium(m)};return P}return null}"
assert old in s
s = s.replace(old,new,1)

old = "validateObjects,validateStructural,validateNecessity,deriveMetadata"
new = "validateObjects,validateStructural,validateNecessity,validateSampledCandidatePolicy,deriveMetadata"
assert old in s
s = s.replace(old,new,1)
engine_path.write_text(s)

# Add explicit compliance regressions to the semantic suite.
sem_path = Path('tests/rules-v2-semantics.test.js')
t = sem_path.read_text()
marker = "console.log('RULES V2 SEMANTIC TESTS PASS');"
assert marker in t
addition = r'''
// Final compliance: sampled candidate sets are rejected, never pruned.
{
 const P=M.generateById('RULESV2-COMPLIANCE-BASE',800,{n:7,difficulty:'medium',require:{},forbid:[]});
 assert(P,'need deterministic accepted compliance fixture');
 assert(P.validation.necessity.ok);
 // TEST 2 + TEST 5: every atomic constraint is independently necessary; every person has 1-2.
 const okNec=M.validateNecessity(P);assert(okNec.ok);assert.strictEqual(okNec.redundantCount,0);
 for(const p of M.PEOPLE)assert(P.constraints[p].length>=1&&P.constraints[p].length<=2);
 assert(M.validateStructural(P).ok);
 // TEST 1: duplicate one existing constraint. Whole candidate must be rejected as redundant.
 const dup=JSON.parse(JSON.stringify(P));const target=M.PEOPLE.find(p=>dup.constraints[p].length===1)||M.PEOPLE[0];
 if(dup.constraints[target].length===2)dup.constraints[target]=[dup.constraints[target][0]];
 dup.constraints[target].push(JSON.parse(JSON.stringify(dup.constraints[target][0])));
 const dupPolicy=M.validateSampledCandidatePolicy(dup);assert(!dupPolicy.ok);assert.strictEqual(dupPolicy.reason,'redundant atomic constraint');assert(dupPolicy.necessity.redundantCount>=1);
 // TEST 4: zero personal constraints is rejected before shipping.
 const zero=JSON.parse(JSON.stringify(P));zero.constraints.A=[];const zeroPolicy=M.validateSampledCandidatePolicy(zero);assert(!zeroPolicy.ok);assert.strictEqual(zeroPolicy.reason,'missing atomic constraint');
}
// TEST 3: a compound printed IN_ROOM + NOT_BESIDE pair with one appended redundant half rejects the whole candidate.
{
 let base=null,person=null,extra=null;
 for(let n=0;n<40&&!base;n++){
   const P=M.generateById(`RULESV2-COMPOUND-${n}`,800,{n:7,difficulty:'medium',require:{},forbid:[]});if(!P)continue;
   for(const p of M.PEOPLE){if(P.constraints[p].length!==1||P.constraints[p][0].type!=='IN_ROOM')continue;for(const o of P.objects){const cl={type:'NOT_BESIDE_OBJECT',object:o.name};if(M.constraintTagValid(P,cl)&&M.constraintSatisfied(P,p,cl,P.solution)){base=P;person=p;extra=cl;break}}if(base)break}
 }
 assert(base&&person&&extra,'need deterministic compound fixture');
 const Q=JSON.parse(JSON.stringify(base));Q.constraints[person].push(extra);assert.strictEqual(M.printPersonConstraints(Q,person).length,1,'pair must render as one compound sentence');
 const policy=M.validateSampledCandidatePolicy(Q);assert(!policy.ok);assert.strictEqual(policy.reason,'redundant atomic constraint');
 assert(policy.necessity.redundantConstraints.some(x=>x.subject===person&&x.constraint.type==='NOT_BESIDE_OBJECT'),'redundant compound half must be detected');
 assert.deepStrictEqual(Q.constraints[person].length,2,'candidate must not be pruned/mutated');
}
'''
t = t.replace(marker, addition + "\n" + marker, 1)
sem_path.write_text(t)

# Fresh final-20 report: new IDs, richer policy/cost/constraint distribution metrics.
report_path = Path('tests/rules-v2-medium-20.js')
r = report_path.read_text()
r = r.replace("function stats(P){const m=P.validation.metrics;return{puzzleId:P.puzzleId,generationAttempts:P.generationAttempts,selectionAttempts:P.selectionAttempts,solutionCount:P.validation.solutions,searchCalls:P.validation.human.searchCalls,initialCandidateCount:m.initialCandidates,constraintFamilies:m.constraintFamilies,advancedDeductionCount:m.advancedDeductionCount,materialAdvancedDeductions:m.materialAdvancedDeductions,ownershipCount:m.ownershipCount,intersectionCount:m.intersectionCount,relationalDeductionCount:m.relationalDeductions,dependencyDepth:m.dependencyDepth,chainPeople:m.multiPersonChainPeople,advancedDependentPlacements:m.advancedDependentPlacements,traceLength:m.totalDeterministicTraceLength,totalAtomicConstraints:m.totalAtomicConstraintCount,necessity:P.validation.necessity.ok,classification:P.validation.mediumClassification}}",
"function stats(P){const m=P.validation.metrics,atomicPerPerson=Object.fromEntries(M.PEOPLE.map(p=>[p,P.constraints[p].length]));return{puzzleId:P.puzzleId,generationAttempts:P.generationAttempts,selectionAttempts:P.selectionAttempts,solutionCount:P.validation.solutions,searchCalls:P.validation.human.searchCalls,initialCandidateCount:m.initialCandidates,atomicConstraintsPerPerson:atomicPerPerson,constraintFamilies:m.constraintFamilies,advancedDeductionCount:m.advancedDeductionCount,materialAdvancedDeductions:m.materialAdvancedDeductions,ownershipCount:m.ownershipCount,intersectionCount:m.intersectionCount,relationalDeductionCount:m.relationalDeductions,dependencyDepth:m.dependencyDepth,chainPeople:m.multiPersonChainPeople,advancedDependentPlacements:m.advancedDependentPlacements,traceLength:m.totalDeterministicTraceLength,totalAtomicConstraints:m.totalAtomicConstraintCount,necessity:P.validation.necessity.ok,classification:P.validation.mediumClassification}}")
r = r.replace("const id=`RULESV2-MEDIUM-${String(i).padStart(3,'0')}`;\n const P=M.generateById(id,400", "const id=`RULESV2-FINAL-${String(i).padStart(3,'0')}`;\n const P=M.generateById(id,800")
r = r.replace("assert(P.validation.metrics.totalAtomicConstraintCount<=14);puzzles.push(P);", "assert(P.validation.metrics.totalAtomicConstraintCount>=7&&P.validation.metrics.totalAtomicConstraintCount<=14);for(const p of M.PEOPLE)assert(P.constraints[p].length>=1&&P.constraints[p].length<=2);puzzles.push(P);")
r = r.replace("const report={generatedAt:'2026-09-11',rulesVersion:2,classificationCounts:classes,generatorRejections:M.getGeneratorStats(),generationCost:{averageSelectionAttempts:avg,medianSelectionAttempts:median,maximumSelectionAttempts:max},puzzles:rows,", "const gs=M.getGeneratorStats(),oneCount=rows.reduce((n,r)=>n+Object.values(r.atomicConstraintsPerPerson).filter(x=>x===1).length,0),twoCount=rows.reduce((n,r)=>n+Object.values(r.atomicConstraintsPerPerson).filter(x=>x===2).length,0);assert.strictEqual(oneCount+twoCount,140);assert.strictEqual(rows.some(r=>Object.values(r.atomicConstraintsPerPerson).some(x=>x===0)),false);const report={generatedAt:'2026-09-11',rulesVersion:2,policy:'reject-redundancy-min-one-per-person',classificationCounts:classes,generatorRejections:gs,generationCost:{totalCandidatePuzzlesEvaluated:gs.candidatePuzzlesEvaluated,candidatesRejectedRedundant:gs.redundantConstraintCandidates,individualRedundantConstraintsDetected:gs.redundantConstraintsDetected,candidatesRejectedZeroConstraint:gs.zeroConstraintCandidates,candidatesRejectedMediumFloor:gs.mediumFloorRejected,averageSelectionAttempts:avg,medianSelectionAttempts:median,maximumSelectionAttempts:max},constraintDistribution:{peopleWith1AtomicConstraint:oneCount,peopleWith2AtomicConstraints:twoCount,acceptedPeopleWithZeroConstraints:0},puzzles:rows,")
r = r.replace("console.log('SUMMARY',JSON.stringify({classes,rejections:M.getGeneratorStats(),avg,median,max,weakest:weakest.map(p=>p.puzzleId),strongest:strongest.map(p=>p.puzzleId)}));", "console.log('SUMMARY',JSON.stringify({classes,rejections:gs,constraintDistribution:report.constraintDistribution,avg,median,max,weakest:weakest.map(p=>p.puzzleId),strongest:strongest.map(p=>p.puzzleId)}));")
report_path.write_text(r)

print('applied final Rules v2 compliance policy')
