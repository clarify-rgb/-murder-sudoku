/* Easy 6x6 difficulty profiles for Murder Sudoku v7.1 staging branch. */
export const EASY_6X6_PROFILES=[
{id:"easy-1",label:"Easy 1 — Opening",size:6,maxCluesPerPerson:2,directAnchorCount:5,crossCheckCount:0,minRelationalForcedSteps:0,allowGlobalRules:false,requireUniqueSolution:true,requireStrictForcedChain:true,allowGuessing:false},
{id:"easy-2",label:"Easy 2 — Cross-check",size:6,maxCluesPerPerson:2,directAnchorCount:4,crossCheckCount:1,minRelationalForcedSteps:0,allowGlobalRules:false,requireUniqueSolution:true,requireStrictForcedChain:true,allowGuessing:false},
{id:"easy-3",label:"Easy 3 — Short relational chain",size:6,maxCluesPerPerson:2,directAnchorCount:4,crossCheckCount:0,minRelationalForcedSteps:1,allowGlobalRules:false,requireUniqueSolution:true,requireStrictForcedChain:true,allowGuessing:false}
];
export function easyProfileAccepts(profile,puzzle,validation){
 if(!profile||!puzzle||!validation)return false;
 if(profile.size!==6||puzzle.people.length!==6||!puzzle.people.includes(puzzle.victim))return false;
 if((puzzle.globalRules||[]).length)return false;
 if(validation.solutions!==1||!validation.human?.ok)return false;
 for(const person of puzzle.people){
  const clues=Array.isArray(puzzle.clues[person])?puzzle.clues[person]:(puzzle.clues[person]?[puzzle.clues[person]]:[]);
  if(clues.length>profile.maxCluesPerPerson)return false;
 }
 const trace=validation.human.trace||[];
 const relationalForced=trace.filter(step=>step.reason==="relational/global").length;
 return relationalForced>=profile.minRelationalForcedSteps;
}
