'use strict';
const fs=require('fs');
const assert=require('assert');
const M=require('../engine/medium-7x7.js');

function cellLabel(x){return `R${x.r+1}C${x.c+1}`}
function domains(P){return Object.fromEntries(M.PEOPLE.map(p=>[p,M.ownCandidates(P,p).map(cellLabel)]))}
function config(P){return{puzzleId:P.puzzleId,profile:P.profile,victim:P.victim,objective:P.objective,people:P.people,regionOf:P.regionOf,roomNames:P.roomNames,objects:P.objects.map(o=>({id:o.id,name:o.name,icon:o.icon,blocking:!!o.blocking,footprintSize:o.footprintSize,occurrences:M.objectOccurrences(P,o.name)})),clues:P.clues,solution:P.solution}}
function stats(P){const m=P.validation.metrics;return{puzzleId:P.puzzleId,generationAttempts:P.generationAttempts,selectionAttempts:P.selectionAttempts,solutionCount:P.validation.solutions,searchCalls:P.validation.human.searchCalls,initialCandidateCount:m.initialCandidates,immediateDirectSingles:m.directClueSingles,rowColumnEliminations:m.rowColumnEliminations,rowColumnOccupancy:m.rowColumnOccupancyDeductions,rowOwnership:m.rowOwnershipDeductions,columnOwnership:m.columnOwnershipDeductions,multiRowOwnership:m.multiRowOwnershipDeductions,multiColumnOwnership:m.multiColumnOwnershipDeductions,relational:m.relationalDeductions,intersectingSquare:m.intersectingSquareDeductions,forcedPlacements:m.forcedPlacements,totalDeterministicTraceLength:m.totalDeterministicTraceLength,dependencyDepth:m.dependencyDepth,clueFamilies:m.clueFamilies}}
function humanSteps(P){const m=P.validation.metrics,t=P.validation.human.trace,steps=[];const init=Object.entries(m.initialCandidates).map(([p,n])=>`${p}:${n}`).join(', ');steps.push(`Own clues leave multiple candidates (${init}); there are ${m.directClueSingles} immediate singles.`);let seen=new Set;for(const e of t){if(steps.length>=10)break;if(e.reason==='own-clue-filtering')continue;let text='';if(e.reason==='relational-deduction'){text=`${e.subject}'s ${e.clueType||'relational'} constraint removes ${e.removed?.length||0} candidate(s)${e.reference?` using ${e.reference}`:''}.`}else if(['row-ownership','multi-row-ownership'].includes(e.reason)){text=`${e.owners.join('/')} collectively own rows ${e.values.map(v=>v+1).join(', ')}, so ${e.subject} loses candidate(s) in those rows.`}else if(['column-ownership','multi-column-ownership'].includes(e.reason)){text=`${e.owners.join('/')} collectively own columns ${e.values.map(v=>v+1).join(', ')}, so ${e.subject} loses candidate(s) in those columns.`}else if(e.reason==='intersecting-square-elimination'){text=`${e.sourcePerson}'s remaining candidate pattern makes ${e.subject}'s ${e.removed.map(cellLabel).join(', ')} impossible by row/column intersection.`}else if(e.reason==='row-elimination'){text=`With ${e.sourcePerson} fixed in row ${e.row+1}, ${e.subject} loses candidate(s) from that row.`}else if(e.reason==='column-elimination'){text=`With ${e.sourcePerson} fixed in column ${e.column+1}, ${e.subject} loses candidate(s) from that column.`}else if(e.reason==='row-occupancy'){text=`Only ${e.subject} can occupy row ${e.row+1}, restricting ${e.subject} to that row.`}else if(e.reason==='column-occupancy'){text=`Only ${e.subject} can occupy column ${e.column+1}, restricting ${e.subject} to that column.`}else if(e.reason==='forced-placement'){text=`${e.subject} is forced to ${cellLabel(e.cell)}.`}if(text){let key=e.reason+'|'+text;if(!seen.has(key)){steps.push(text);seen.add(key)}}}steps.push(`The deterministic chain finishes with all seven people fixed; searchCalls = ${P.validation.human.searchCalls}.`);return steps}

const puzzles=[];
for(let i=1;i<=10;i++){
 const id=`MEDIUM-${String(i).padStart(3,'0')}`;
 const P=M.generateById(id,2500);
 assert(P,`failed to generate ${id}`);
 assert.strictEqual(P.validation.solutions,1);
 assert.strictEqual(P.validation.human.searchCalls,0);
 puzzles.push(P);
 console.log('GENERATED',id,JSON.stringify(stats(P)));
}
const rows=puzzles.map(stats);
const score=P=>{const m=P.validation.metrics;return 4*(m.rowOwnershipDeductions+m.columnOwnershipDeductions+m.multiRowOwnershipDeductions+m.multiColumnOwnershipDeductions+m.intersectingSquareDeductions)+2*m.relationalDeductions+m.dependencyDepth};
const selected=puzzles.slice().sort((a,b)=>score(b)-score(a)).slice(0,3);
const report={generatedAt:'2026-09-10',engine:{N:M.N,people:M.PEOPLE,victim:M.VICTIM},puzzles:puzzles.map(P=>({stats:stats(P),configuration:config(P),initialDomains:domains(P)})),humanReview:selected.map(P=>({puzzleId:P.puzzleId,configuration:config(P),solution:P.solution,initialDomains:domains(P),solveOrder:humanSteps(P)}))};
fs.writeFileSync('tests/MEDIUM_FIRST_10_REPORT.json',JSON.stringify(report,null,2)+'\n');
let md='# Medium 7×7 — first 10 review\n\n';
md+='| ID | attempts | solutions | search | initial A–G | direct | row/col elim | row own | col own | multi-row | multi-col | relational | intersect | forced | trace | depth | clues |\n|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n';
for(const r of rows)md+=`| ${r.puzzleId} | ${r.generationAttempts} | ${r.solutionCount} | ${r.searchCalls} | ${M.PEOPLE.map(p=>r.initialCandidateCount[p]).join('/')} | ${r.immediateDirectSingles} | ${r.rowColumnEliminations} | ${r.rowOwnership} | ${r.columnOwnership} | ${r.multiRowOwnership} | ${r.multiColumnOwnership} | ${r.relational} | ${r.intersectingSquare} | ${r.forcedPlacements} | ${r.totalDeterministicTraceLength} | ${r.dependencyDepth} | ${r.clueFamilies.join(', ')} |\n`;
for(const P of selected){md+=`\n## Human review — ${P.puzzleId}\n\n### Configuration\n\n\`\`\`json\n${JSON.stringify(config(P),null,2)}\n\`\`\`\n\n### Initial domains\n\n\`\`\`json\n${JSON.stringify(domains(P),null,2)}\n\`\`\`\n\n### Solution\n\n${M.PEOPLE.map(p=>`${p} = ${cellLabel(P.solution[p])}`).join(' · ')}\n\n### Human logical solve order\n\n${humanSteps(P).map((s,i)=>`${i+1}. ${s}`).join('\n')}\n`}
fs.writeFileSync('tests/MEDIUM_HUMAN_REVIEW.md',md);
console.log('MEDIUM FIRST 10 PASS',JSON.stringify({ids:puzzles.map(p=>p.puzzleId),selected:selected.map(p=>p.puzzleId)}));
