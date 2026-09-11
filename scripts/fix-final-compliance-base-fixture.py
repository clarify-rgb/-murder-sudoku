from pathlib import Path
p=Path('tests/rules-v2-semantics.test.js')
s=p.read_text()
old=r'''// Final compliance: sampled candidate sets are rejected, never pruned.
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
'''
new=r'''// Final compliance: sampled candidate sets are rejected, never pruned.
{
 const E=M.createEngine(6),R=Array.from({length:6},()=>Array(6).fill(0));
 const P={version:2,n:6,difficulty:'medium',people:[...E.PEOPLE],regionOf:R,roomNames:['R1'],objects:[],constraints:{A:[{type:'NORTH_OF_PERSON',other:'B'},{type:'WEST_OF_PERSON',other:'B'}],B:[{type:'NORTH_OF_PERSON',other:'C'},{type:'WEST_OF_PERSON',other:'C'}],C:[{type:'NORTH_OF_PERSON',other:'D'},{type:'WEST_OF_PERSON',other:'D'}],D:[{type:'NORTH_OF_PERSON',other:'E'}],E:[{type:'EAST_OF_PERSON',other:'D'}],F:[{type:'SOUTH_OF_PERSON',other:'E'},{type:'EAST_OF_PERSON',other:'E'}]},globalConstraints:[],solution:{A:{r:0,c:0},B:{r:1,c:1},C:{r:2,c:2},D:{r:3,c:3},E:{r:4,c:4},F:{r:5,c:5}}};
 assert(E.validateStructural(P).ok);assert(E.fullValid(P,P.solution));assert.strictEqual(E.countSolutions(P,2),1);
 // TEST 2 + TEST 5: every atomic constraint is independently necessary; every person has 1-2.
 const okNec=E.validateNecessity(P);assert(okNec.ok);assert.strictEqual(okNec.redundantCount,0);for(const p of E.PEOPLE)assert(P.constraints[p].length>=1&&P.constraints[p].length<=2);
 // TEST 1: duplicate D's necessary edge. Complete sampled candidate remains unique but contains redundancy, so reject the whole set.
 const dup=JSON.parse(JSON.stringify(P));dup.constraints.D.push(JSON.parse(JSON.stringify(dup.constraints.D[0])));const before=JSON.stringify(dup.constraints);const dupPolicy=E.validateSampledCandidatePolicy(dup);assert(!dupPolicy.ok);assert.strictEqual(dupPolicy.reason,'redundant atomic constraint');assert(dupPolicy.necessity.redundantCount>=1);assert.strictEqual(JSON.stringify(dup.constraints),before,'policy must not prune/mutate the sampled candidate');
 // TEST 4: zero personal constraints is rejected before shipping.
 const zero=JSON.parse(JSON.stringify(P));zero.constraints.A=[];const zeroPolicy=E.validateSampledCandidatePolicy(zero);assert(!zeroPolicy.ok);assert.strictEqual(zeroPolicy.reason,'missing atomic constraint');
}
'''
assert old in s
p.write_text(s.replace(old,new,1))
print('installed deterministic necessity-pass compliance fixture')
