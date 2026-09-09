'use strict';
const fs=require('fs');
const E=require('../engine/easy-6x6-profiles.js');

function seedHash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededRandom(seed){let a=seedHash(seed);return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn()}finally{Math.random=old}}
function same(a,b){return a&&b&&a.r===b.r&&a.c===b.c}
function directDiagonal(x,c){return !same(x,c)&&Math.abs(x.r-c.r)===Math.abs(x.c-c.c)}
function occurrenceExtents(P,name){return E.objectOccurrences(P,name).map(o=>({
  minR:Math.min(...o.cells.map(c=>c.r)),maxR:Math.max(...o.cells.map(c=>c.r)),
  minC:Math.min(...o.cells.map(c=>c.c)),maxC:Math.max(...o.cells.map(c=>c.c))
}))}
function directDirectional(P,cl,x){const exs=occurrenceExtents(P,cl.object);switch(cl.type){
  case'westOfObject':return exs.some(ex=>x.c<ex.minC);
  case'eastOfObject':return exs.some(ex=>x.c>ex.maxC);
  case'northOfObject':return exs.some(ex=>x.r<ex.minR);
  case'southOfObject':return exs.some(ex=>x.r>ex.maxR);
  default:throw Error('bad directional type');
}}

// Directional repeated-occurrence synthetic audit: no combined virtual extent.
(function directionalSynthetic(){
  const regionOf=Array.from({length:6},()=>Array(6).fill(0));
  const P={regionOf,objects:[{name:'Object 1',occurrences:[{cells:[{r:1,c:1},{r:1,c:2}]},{cells:[{r:4,c:5}]}],blocking:false}],clues:{},people:[...E.PEOPLE]};
  const checks=[
    ['westOfObject',{r:4,c:4},true], // west of occurrence B
    ['eastOfObject',{r:1,c:3},true], // east of occurrence A
    ['northOfObject',{r:3,c:5},true], // north of occurrence B
    ['southOfObject',{r:2,c:1},true], // south of occurrence A
  ];
  for(const [type,x,want] of checks){const cl={type,object:'Object 1'};if(E.unaryHolds(P,cl,x)!==want||directDirectional(P,cl,x)!==want)throw Error('directional occurrence semantics failed '+type)}
  // This point sits inside the aggregate disconnected bounding rectangle. It must not become a virtual relation target;
  // evaluate only against real occurrence extents and require canonical/direct agreement for all four families.
  const gap={r:3,c:3};
  for(const type of ['westOfObject','eastOfObject','northOfObject','southOfObject']){
    const cl={type,object:'Object 1'};if(E.unaryHolds(P,cl,gap)!==directDirectional(P,cl,gap))throw Error('directional canonical/direct mismatch '+type)
  }
})();

const profiles=['easy-1','easy-2','easy-3'];
let totalCandidateBuildAttempts=0,totalCandidatesGenerated=0,acceptedPuzzles=0,acceptedWithAnyDiagonal=0,acceptedWithRepeatedDiagonal=0;
let allDiagonalCluesInspected=0,repeatedDiagonalCluesInspected=0,canonicalFalse=0,directGeometryFalse=0,storedInvariantRejected=0;
let acceptedFalseDiagonal=0;
const repeatedExamples=[];
const failures=[];

for(let i=0;i<5000&&acceptedWithRepeatedDiagonal<100;i++){
  totalCandidateBuildAttempts++;
  const profile=profiles[i%profiles.length];
  const P=withSeed('DIAG-STRESS-'+i,()=>E.buildCandidate(profile));
  if(!P)continue;
  totalCandidatesGenerated++;
  const candidateDiagonal=[];
  for(const p of E.PEOPLE)for(const cl of (P.clues[p]||[]))if(cl.type==='diagonal'){
    allDiagonalCluesInspected++;
    const x=P.solution[p],occ=E.objectOccurrences(P,cl.object),cells=occ.flatMap(o=>o.cells);
    const canonical=E.clueSatisfied(P,p,cl,P.solution);
    const satisfying=cells.filter(c=>directDiagonal(x,c));
    const direct=satisfying.length>0;
    const repeated=occ.length>1;
    if(repeated)repeatedDiagonalCluesInspected++;
    if(!canonical){canonicalFalse++;failures.push({kind:'canonical-false',profile,p,cl,x,occ})}
    if(!direct){directGeometryFalse++;failures.push({kind:'direct-false',profile,p,cl,x,occ})}
    if(canonical!==direct)failures.push({kind:'canonical-direct-divergence',profile,p,cl,x,occ,canonical,direct});
    const row={person:p,solutionCell:x,object:cl.object,occurrences:occ.length,footprints:occ.map(o=>o.cells),allCells:cells,canonical,satisfyingCells:satisfying,repeated};
    candidateDiagonal.push(row);
    if(repeated&&repeatedExamples.length<10)repeatedExamples.push(row);
  }
  const V=E.validate(P);
  if(!V.ok){if(V.reason==='stored solution clue mismatch')storedInvariantRejected++;continue}
  acceptedPuzzles++;
  if(candidateDiagonal.length)acceptedWithAnyDiagonal++;
  const repeated=candidateDiagonal.filter(d=>d.repeated);
  if(repeated.length)acceptedWithRepeatedDiagonal++;
  if(candidateDiagonal.some(d=>!d.canonical||!d.satisfyingCells.length))acceptedFalseDiagonal++;
}

const report={
  totalCandidateBuildAttempts,totalCandidatesGenerated,acceptedPuzzles,acceptedWithAnyDiagonal,acceptedWithRepeatedDiagonal,
  allDiagonalCluesInspected,repeatedDiagonalCluesInspected,canonicalFalse,directGeometryFalse,storedInvariantRejected,acceptedFalseDiagonal,
  stopReason:acceptedWithRepeatedDiagonal>=100?'collected 100 accepted repeated-identity diagonal puzzles':'reached 5000 build attempts',
  creationPath:'factPool uses objectCells(logical identity).some(actualCell => diag(storedSolutionCell, actualCell)); same actual-cell geometry helper as unaryHolds/diagonal, but does not call clueSatisfied directly',
  repeatedExamples
};
fs.writeFileSync('tests/REPEATED_DIAGONAL_STRESS_REPORT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length)throw Error('Diagonal semantic failures: '+JSON.stringify(failures.slice(0,5)));
if(acceptedFalseDiagonal!==0)throw Error('Accepted puzzles contain false diagonal clues');
if(canonicalFalse!==0||directGeometryFalse!==0)throw Error('Candidate creation emitted false diagonal clue');
if(acceptedWithRepeatedDiagonal<100&&totalCandidateBuildAttempts<5000)throw Error('Stress audit terminated early');
