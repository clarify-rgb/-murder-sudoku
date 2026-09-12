'use strict';
const assert=require('assert'),{execFileSync}=require('child_process'),Module=require('module'),path=require('path');
const M=require('../engine/medium-7x7.js');

assert.strictEqual(M.CERTIFIED_WITNESS_LOSS_PENALTY,750,'the experiment must use the predetermined weight');
const selected=[{id:'A',factIndex:0},{id:'B',factIndex:1}],candidate={id:'C',factIndex:2};
const entry=violated=>({violated:Uint8Array.from(violated)});

assert.deepStrictEqual(M.certifiedWitnessImpact([entry([1,1,1])],selected,candidate),{
 certifiedWitnesses:0,destroyedWitnesses:0,poolReplacements:0,unrepairedLosses:0
},'an arrangement that violates another selected clue is not a valid private witness; unknown state is never a loss');
assert.deepStrictEqual(M.certifiedWitnessImpact([entry([1,0,0])],selected,candidate),{
 certifiedWitnesses:1,destroyedWitnesses:0,poolReplacements:0,unrepairedLosses:0
},'a certified witness that the candidate satisfies remains live');
assert.deepStrictEqual(M.certifiedWitnessImpact([entry([1,0,1])],selected,candidate),{
 certifiedWitnesses:1,destroyedWitnesses:1,poolReplacements:0,unrepairedLosses:1
},'loss is counted only when the candidate destroys a valid witness and the pool has no replacement');
assert.deepStrictEqual(M.certifiedWitnessImpact([entry([1,0,1]),entry([1,0,0])],selected,candidate),{
 certifiedWitnesses:1,destroyedWitnesses:1,poolReplacements:1,unrepairedLosses:0
},'an existing pool replacement prevents a certified loss');

const APPROVED_HEAD='c607290de7360be49169d10bbc1402ea8c2dd985';
const source=execFileSync('git',['show',`${APPROVED_HEAD}:engine/medium-7x7.js`],{encoding:'utf8'});
const approvedModule=new Module(path.join(__dirname,'approved-harvesting-engine.js'),module);
approvedModule.filename=path.join(__dirname,'approved-harvesting-engine.js');approvedModule.paths=module.paths;approvedModule._compile(source,approvedModule.filename);
const approved=approvedModule.exports,request={n:7,difficulty:'medium',require:{},forbid:[]};
const budget={maxNodes:600,maxCounterexamples:6000,maxMs:600000,maxBranchesPerNode:40,maxCompliantLeaves:20};
for(const id of ['RULESV2-PROFILE-DIAG-03','RULESV2-PROFILE-DIAG-06']){
 const before=approved.generateDiagnosticBoardById(id,budget,request);
 const after=M.generateDiagnosticBoardById(id,{...budget,certifiedWitnessLossPenalty:0},request);
 function behavioral(result){
  const x=JSON.parse(JSON.stringify(result));
  const added=new Set(['certifiedWitnessBranchExtensions','certifiedSelectedCluesOnExtensions','certifiedWitnessesDestroyed','certifiedWitnessPoolReplacements','unrepairedCertifiedWitnessLosses','totalCertifiedWitnessPenaltyApplied','certifiedWitnessLossPenalty']);
  (function strip(v){if(!v||typeof v!=='object')return;for(const k of Object.keys(v)){if(k==='elapsedMs'||k.endsWith('TimeMs')||added.has(k))delete v[k];else strip(v[k])}})(x);
  return x
 }
 assert.deepStrictEqual(behavioral(after),behavioral(before),`${id}: disabling the new score term must reproduce approved fixed-node behavior`);
}

const diagnostic=M.generateDiagnosticBoardById('RULESV2-PROFILE-DIAG-03',{...budget,maxNodes:1200},request).search;
for(const key of ['certifiedWitnessBranchExtensions','certifiedSelectedCluesOnExtensions','certifiedWitnessesDestroyed','certifiedWitnessPoolReplacements','unrepairedCertifiedWitnessLosses','totalCertifiedWitnessPenaltyApplied'])assert(Number.isInteger(diagnostic[key])&&diagnostic[key]>=0,`missing diagnostic ${key}`);
assert.strictEqual(diagnostic.totalCertifiedWitnessPenaltyApplied,diagnostic.unrepairedCertifiedWitnessLosses*750,'applied penalty must be exactly losses × 750');
assert(diagnostic.certifiedWitnessPoolReplacements<=diagnostic.certifiedWitnessesDestroyed,'repairs cannot exceed destructions');
assert(diagnostic.unrepairedCertifiedWitnessLosses<=diagnostic.certifiedWitnessesDestroyed,'losses cannot exceed destructions');
assert.strictEqual(diagnostic.certifiedWitnessPoolReplacements+diagnostic.unrepairedCertifiedWitnessLosses,diagnostic.certifiedWitnessesDestroyed,'every destroyed current witness is repaired or lost');
assert.strictEqual(diagnostic.freshPartialWitnessRepairSearches,0,'partial witness repair must remain pool-only');

console.log('CERTIFIED-WITNESS PENALTY CONTRACT PASS');
