# Easy 6×6 generation validation

Tested against a v7.1-derived 6×6 engine copy before any live/main change.

Validation gates for every accepted puzzle:
- 6×6 grid
- exactly 6 people including victim
- max 2 clues per person
- no Easy global rules
- stored solution satisfies all clues
- victim room contains exactly 2 people
- strict forced deduction chain completes
- no guessing
- exactly 1 brute-force solution
- generated puzzle matches its requested Easy profile

## 100 generation runs per profile

| Profile | Runs | Generated | Failed runs | Candidate attempts | Rejected candidates |
|---|---:|---:|---:|---:|---|
| Easy 1 — Opening | 100 | 100 | 0 | 100 | 0 |
| Easy 2 — Cross-check | 100 | 100 | 0 | 100 | 0 |
| Easy 3 — Short relational chain | 100 | 100 | 0 | 350 | 250 |

Easy 3 rejected 250 intermediate candidates because the strict human solver reached `No forced next move; guessing would be required`. The generator discarded those candidates and continued until it found a candidate with at least one required relational deduction and a complete forced chain. No global rule is allowed in any Easy profile.

## Raw candidate acceptance sample
A separate 100-candidate pass produced:
- Easy 1: 100/100 accepted.
- Easy 2: 100/100 accepted.
- Easy 3: 24/100 accepted; 76/100 rejected for `No forced next move; guessing would be required`.

The difference is intentional: a generation run may try multiple random candidates, but it returns a puzzle only after all validation gates pass.
