/* Staging profiles for the existing Murder Sudoku v7.1 engine.
   IMPORTANT: not wired into index.html yet. main/live remains unchanged.

   Difficulty is not only grid size. All three are 6x6, but the required
   deduction chain becomes less direct from profile 1 -> 3.
*/

export const EASY_6X6_PROFILES = [
  {
    id: "easy-1",
    label: "Easy 1 — Opening",
    size: 6,
    maxCluesPerPerson: 2,
    directAnchorCount: 5,
    crossCheckCount: 0,
    minRelationalForcedSteps: 0,
    requireUniqueSolution: true,
    requireStrictForcedChain: true,
    allowGuessing: false,
    description: "Tutorial-like opening: five immediately forced non-victim placements; victim is the final row/column intersection."
  },
  {
    id: "easy-2",
    label: "Easy 2 — Cross-check",
    size: 6,
    maxCluesPerPerson: 2,
    directAnchorCount: 4,
    crossCheckCount: 1,
    minRelationalForcedSteps: 0,
    requireUniqueSolution: true,
    requireStrictForcedChain: true,
    allowGuessing: false,
    description: "Four direct anchors plus one person requiring two visible constraints to intersect before the victim becomes forced."
  },
  {
    id: "easy-3",
    label: "Easy 3 — Short chain",
    size: 6,
    maxCluesPerPerson: 2,
    directAnchorCount: 4,
    crossCheckCount: 0,
    minRelationalForcedSteps: 1,
    requireUniqueSolution: true,
    requireStrictForcedChain: true,
    allowGuessing: false,
    description: "Four anchors, then at least one genuinely relational/global forced deduction, then the victim as the final intersection."
  }
];

export function easyProfileAccepts(profile, puzzle, validation) {
  if (!profile || !puzzle || !validation) return false;
  if (puzzle.people.length !== 6) return false;
  if (validation.solutions !== 1) return false;
  if (!validation.human?.ok) return false;

  for (const person of puzzle.people) {
    if (person === puzzle.victim) continue;
    const clues = Array.isArray(puzzle.clues[person])
      ? puzzle.clues[person]
      : (puzzle.clues[person] ? [puzzle.clues[person]] : []);
    if (clues.length > profile.maxCluesPerPerson) return false;
  }

  const trace = validation.human.trace || [];
  const relationalForced = trace.filter(step => step.reason === "relational/global").length;
  if (relationalForced < profile.minRelationalForcedSteps) return false;

  return true;
}
