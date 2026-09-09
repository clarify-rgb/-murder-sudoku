# Easy 6×6 elimination-chain validation

Reworked after mobile testing showed that the previous validator counted direct coordinate assignments as meaningful forced steps.

## New acceptance gates
Every accepted Easy puzzle must have:
- 6×6 grid and exactly 6 people including victim
- max 2 clues per person
- zero global rules
- exactly one brute-force solution
- unchanged victim rule: victim shares a room with exactly one other person
- a complete strict forced chain with no guessing
- at least 4 of the 5 non-victims having multiple legal cells after their own non-relational clues are initially applied
- at most 1 direct-clue single
- Easy 1: at least 3 row/column elimination deductions
- Easy 2: at least 2 row/column elimination deductions
- Easy 3: at least 2 row/column elimination deductions and at least 1 relational deduction

Validator metrics now record `initialCandidates`, `directClueSingles`, `rowColumnForcedDeductions`, `relationalDeductions`, `totalForcedSteps`, and `multiCandidatePeople`.

## 100 generation runs per profile

| Profile | Generated | Failed | Candidate attempts | Avg initial candidates (sorted) | Avg direct singles | Avg row/col deductions | Avg relational | Avg total forced steps |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Easy 1 | 100/100 | 0 | 100 | 1, 2, 2, 2, 2 | 1.00 | 4.00 | 0.00 | 6.00 |
| Easy 2 | 100/100 | 0 | 100 | 1, 3, 3, 3, 3 | 1.00 | 4.00 | 0.00 | 6.00 |
| Easy 3 | 100/100 | 0 | 248 | 1, 2, 2, 2, 2 | 1.00 | 2.96 | 1.04 | 6.00 |

### Discard reasons
Easy 1: no intermediate candidates rejected in this 100-run sample.

Easy 2: no intermediate candidates rejected in this 100-run sample.

Easy 3: 148 intermediate candidates were discarded before 100 valid puzzles were produced:
- 134: `not enough relational deductions`
- 14: `candidate build failed` because random geometry did not provide the required clean relational decoy.

This is intentional: the Easy 3 generator is allowed to throw away technically solvable candidates unless the actual solve trace contains the required relational deduction.

## Mobile branch UI
The branch-only `index.html` now loads this same engine module. Mobile layout uses a fixed 2-column × 3-row People grid with all six people visible, a true square 6×6 board with six equal columns and rows, controls in normal document flow below the board, and iPhone safe-area padding. Horizontal People scrolling and sticky/overlay controls were removed.

The deployed `main/easy-test` copy was deliberately not updated.
