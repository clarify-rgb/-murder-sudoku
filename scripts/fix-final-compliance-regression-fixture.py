from pathlib import Path
p=Path('tests/rules-v2-semantics.test.js')
s=p.read_text()
old=r'''// TEST 3: a compound printed IN_ROOM + NOT_BESIDE pair with one appended redundant half rejects the whole candidate.
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
new=r'''// TEST 3: compound IN_ROOM + NOT_BESIDE has exactly one redundant half; reject whole sampled candidate without pruning.
{
 const E=M.createEngine(6),R=Array.from({length:6},(_,r)=>Array(6).fill(r));
 const P={version:2,n:6,difficulty:'medium',people:[...E.PEOPLE],regionOf:R,roomNames:['R1','R2','R3','R4','R5','R6'],objects:[{id:'Object_1',name:'Object 1',footprintSize:1,tags:['standable'],occurrences:[{id:'Object_1_1',cells:[{r:0,c:2}]}]}],constraints:{A:[{type:'IN_ROOM',room:'R1'},{type:'NOT_BESIDE_OBJECT',object:'Object 1'}],B:[{type:'ROW',row:1}],C:[{type:'ROW',row:2},{type:'COLUMN',column:2}],D:[{type:'ROW',row:3},{type:'COLUMN',column:3}],E:[{type:'ROW',row:4},{type:'COLUMN',column:4}],F:[{type:'ROW',row:5},{type:'COLUMN',column:5}]},globalConstraints:[],solution:{A:{r:0,c:0},B:{r:1,c:1},C:{r:2,c:2},D:{r:3,c:3},E:{r:4,c:4},F:{r:5,c:5}}};
 assert(E.validateStructural(P).ok);assert(E.fullValid(P,P.solution));assert.strictEqual(E.countSolutions(P,2),1);assert.strictEqual(E.printPersonConstraints(P,'A').length,1);
 const nec=E.validateNecessity(P);assert(!nec.ok);
 const aRed=nec.redundantConstraints.filter(x=>x.subject==='A').map(x=>x.constraint.type);assert(aRed.includes('IN_ROOM'),'IN_ROOM must be redundant because other five rows force A into R1');assert(!aRed.includes('NOT_BESIDE_OBJECT'),'NOT_BESIDE must remain necessary to distinguish A/B columns');
 const before=JSON.stringify(P.constraints.A),policy=E.validateSampledCandidatePolicy(P);assert(!policy.ok);assert.strictEqual(policy.reason,'redundant atomic constraint');assert.strictEqual(JSON.stringify(P.constraints.A),before,'candidate must remain byte-for-byte unpruned at constraint level');assert.strictEqual(P.constraints.A.length,2);
}
'''
assert old in s
p.write_text(s.replace(old,new,1))
print('installed deterministic compound redundancy fixture')
