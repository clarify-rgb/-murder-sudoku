# Medium 7×7 — tightened acceptance, 20 accepted puzzles

Classification: CLEAR MEDIUM 11 · BORDERLINE 9 · TOO EASY 0

| ID | attempts | select | initial A–G | adv | material | ownership | intersect | relational | depth | chain people | adv→placements | trace | class |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| MEDIUM-TIGHT-001 | 1 | 5 | 4/5/3/4/5/4/3 | 2 | 2 | 0 | 2 | 2 | 3 | 6 | 5 | 32 | CLEAR MEDIUM |
| MEDIUM-TIGHT-002 | 1 | 5 | 4/3/4/6/5/5/4 | 3 | 3 | 1 | 2 | 2 | 2 | 5 | 5 | 29 | CLEAR MEDIUM |
| MEDIUM-TIGHT-003 | 1 | 165 | 3/4/4/4/4/4/5 | 2 | 2 | 0 | 2 | 3 | 2 | 4 | 4 | 28 | BORDERLINE |
| MEDIUM-TIGHT-004 | 1 | 10 | 4/4/4/4/4/3/4 | 2 | 2 | 0 | 2 | 0 | 3 | 5 | 5 | 32 | CLEAR MEDIUM |
| MEDIUM-TIGHT-005 | 1 | 7 | 3/4/5/5/6/4/3 | 2 | 2 | 1 | 1 | 3 | 2 | 6 | 5 | 31 | BORDERLINE |
| MEDIUM-TIGHT-006 | 1 | 26 | 5/7/6/6/4/4/4 | 2 | 2 | 0 | 2 | 7 | 2 | 6 | 4 | 35 | BORDERLINE |
| MEDIUM-TIGHT-007 | 1 | 47 | 4/5/4/2/6/4/5 | 2 | 2 | 0 | 2 | 5 | 2 | 3 | 2 | 30 | BORDERLINE |
| MEDIUM-TIGHT-008 | 1 | 4 | 3/4/5/4/5/4/4 | 4 | 4 | 0 | 4 | 3 | 3 | 5 | 4 | 33 | CLEAR MEDIUM |
| MEDIUM-TIGHT-009 | 1 | 54 | 4/5/4/4/3/4/5 | 2 | 2 | 0 | 2 | 3 | 3 | 7 | 7 | 30 | CLEAR MEDIUM |
| MEDIUM-TIGHT-010 | 1 | 2 | 4/3/4/4/4/3/3 | 3 | 3 | 1 | 2 | 1 | 4 | 7 | 7 | 31 | CLEAR MEDIUM |
| MEDIUM-TIGHT-011 | 1 | 4 | 4/3/4/4/5/4/5 | 2 | 2 | 0 | 2 | 2 | 3 | 2 | 2 | 29 | BORDERLINE |
| MEDIUM-TIGHT-012 | 1 | 63 | 3/4/4/5/5/5/5 | 3 | 3 | 1 | 2 | 6 | 3 | 6 | 4 | 33 | CLEAR MEDIUM |
| MEDIUM-TIGHT-013 | 1 | 24 | 4/4/4/3/5/4/5 | 2 | 2 | 0 | 2 | 2 | 2 | 3 | 2 | 28 | BORDERLINE |
| MEDIUM-TIGHT-014 | 1 | 46 | 5/4/4/4/5/4/4 | 4 | 4 | 0 | 4 | 3 | 4 | 6 | 6 | 32 | CLEAR MEDIUM |
| MEDIUM-TIGHT-015 | 1 | 276 | 6/5/3/4/5/4/3 | 2 | 2 | 1 | 1 | 7 | 3 | 6 | 5 | 30 | CLEAR MEDIUM |
| MEDIUM-TIGHT-016 | 1 | 16 | 2/4/2/5/4/3/5 | 2 | 2 | 1 | 1 | 1 | 2 | 5 | 5 | 26 | BORDERLINE |
| MEDIUM-TIGHT-017 | 1 | 10 | 5/3/4/4/5/4/4 | 2 | 2 | 0 | 2 | 5 | 2 | 4 | 4 | 33 | BORDERLINE |
| MEDIUM-TIGHT-018 | 1 | 39 | 3/4/6/4/5/4/4 | 4 | 4 | 1 | 3 | 5 | 3 | 4 | 4 | 30 | CLEAR MEDIUM |
| MEDIUM-TIGHT-019 | 1 | 38 | 3/2/3/4/4/7/3 | 2 | 2 | 0 | 2 | 3 | 2 | 3 | 2 | 28 | BORDERLINE |
| MEDIUM-TIGHT-020 | 1 | 13 | 5/5/6/4/4/3/5 | 4 | 4 | 1 | 3 | 6 | 2 | 4 | 4 | 32 | CLEAR MEDIUM |

## WEAKEST — MEDIUM-TIGHT-011

Classification: **BORDERLINE** · strength 56

Clues:
- A: A was in R5, but not beside Object 2. / A was in R5, but not beside Object 3.
- B: B was in a corner of R1. / B was not in the same room as E.
- C: C was in column 5. / C was not beside Object 4.
- D: D was in R3, but not beside Locked 2. / D was east of B.
- E: E was diagonal to Locked 1. / E was not in the same room as F.
- F: F was in R3, but not beside Locked 2. / F was south of D.
- G: G was in R1. / G was west of C.

Solution: A R7C3 · B R4C2 · C R1C5 · D R5C6 · E R3C4 · F R6C7 · G R2C1

Human logical chain:

1. No immediate placements: initial domains are A:4, B:3, C:4, D:4, E:5, F:4, G:5.
2. F is narrowed by southOfPerson involving D.
3. D is narrowed by southOfPerson involving F.
4. Only G can still own row 2.
5. G becomes fixed at R2C1 after row-occupancy.
6. Only E can still own column 4.
7. E becomes fixed at R3C4 after column-occupancy.
8. D's remaining squares eliminate F's R5C7 by row/column intersection.
9. F's remaining squares eliminate D's R5C7 by row/column intersection.
10. The placement of E removes C's candidate(s) in the same row.
11. The placement of G removes B's candidate(s) in the same column.
12. All seven placements follow deterministically; 2 structural advanced deductions, 2 material, 2 advanced-dependent placements, searchCalls = 0.

## WEAKEST — MEDIUM-TIGHT-013

Classification: **BORDERLINE** · strength 57

Clues:
- A: A was diagonal to Object 1. / A was south of G.
- B: B was in R6, but not beside Object 2. / B was south of E.
- C: C was in R5, but not beside Locked 1. / C was west of D.
- D: D was south of Object 5. / D was not in the same room as B.
- E: E was in column 6. / E was north of Object 5.
- F: F was in R5, but not beside Object 5. / F was south of G.
- G: G was in row 2. / G was north of C.

Solution: A R3C4 · B R4C3 · C R5C1 · D R7C5 · E R1C6 · F R6C2 · G R2C7

Human logical chain:

1. No immediate placements: initial domains are A:4, B:4, C:4, D:3, E:5, F:4, G:5.
2. A is narrowed by southOfPerson involving G.
3. D is narrowed by westOfPerson involving C.
4. Only E can still own row 1.
5. E becomes fixed at R1C6 after row-occupancy.
6. Only A can still own row 3.
7. A becomes fixed at R3C4 after row-occupancy.
8. Only B can still own column 3.
9. B becomes fixed at R4C3 after column-occupancy.
10. Only G can still own column 7.
11. G becomes fixed at R2C7 after column-occupancy.
12. All seven placements follow deterministically; 2 structural advanced deductions, 2 material, 2 advanced-dependent placements, searchCalls = 0.

## WEAKEST — MEDIUM-TIGHT-019

Classification: **BORDERLINE** · strength 58

Clues:
- A: A was on Object 1. / A was not in the same room as C.
- B: B was on Object 3. / B was north of A.
- C: C was beside Object 2. / C was south of G.
- D: D was in a corner of R1. / D was west of C.
- E: E was in a corner of R6. / E was west of B.
- F: F was in column 4. / F was east of D.
- G: G was in row 2. / G was in R2.

Solution: A R7C3 · B R5C7 · C R3C5 · D R1C1 · E R4C2 · F R6C4 · G R2C6

Human logical chain:

1. No immediate placements: initial domains are A:3, B:2, C:3, D:4, E:4, F:7, G:3.
2. A is narrowed by northOfPerson involving B.
3. C is narrowed by southOfPerson involving G.
4. D is narrowed by westOfPerson involving C.
5. Only F can still own row 6.
6. F becomes fixed at R6C4 after row-occupancy.
7. Only A can still own row 7.
8. A becomes fixed at R7C3 after row-occupancy.
9. Only G can still own column 6.
10. G becomes fixed at R2C6 after column-occupancy.
11. Only B can still own column 7.
12. All seven placements follow deterministically; 2 structural advanced deductions, 2 material, 2 advanced-dependent placements, searchCalls = 0.

## STRONGEST — MEDIUM-TIGHT-014

Classification: **CLEAR MEDIUM** · strength 127

Clues:
- A: A was in a corner of R6. / A was west of C.
- B: B was in R5, but not beside Object 3. / B was south of A.
- C: C was in row 5. / C was east of D.
- D: D was west of Locked 1. / D was diagonal to Object 2.
- E: E was diagonal to Object 3. / E was south of F.
- F: F was in a corner of R1. / F was not in the same room as C.
- G: G was in row 7. / G was west of F.

Solution: A R1C1 · B R6C7 · C R5C6 · D R2C4 · E R4C5 · F R3C3 · G R7C2

Human logical chain:

1. No immediate placements: initial domains are A:5, B:4, C:4, D:4, E:5, F:4, G:4.
2. E is narrowed by southOfPerson involving F.
3. F is narrowed by southOfPerson involving E.
4. G is narrowed by westOfPerson involving F.
5. Only B can still own row 6.
6. Only F can still own column 3.
7. F becomes fixed at R3C3 after column-occupancy.
8. E's remaining squares eliminate C's R5C5 by row/column intersection.
9. The placement of F removes A's candidate(s) in the same row.
10. C's remaining squares eliminate E's R5C6 by row/column intersection.
11. E becomes fixed at R4C5 after intersecting-square-elimination.
12. All seven placements follow deterministically; 4 structural advanced deductions, 4 material, 6 advanced-dependent placements, searchCalls = 0.

## STRONGEST — MEDIUM-TIGHT-010

Classification: **CLEAR MEDIUM** · strength 121

Clues:
- A: A was in a corner of R7. / A was south of C.
- B: B was diagonal to Object 4. / B was east of Object 5.
- C: C was in a corner of R5. / C was not in the same room as A.
- D: D was in a corner of R4. / D was not in the same room as C.
- E: E was in a corner of R2. / E was south of D.
- F: F was in R5, but not beside Object 5. / F was west of B.
- G: G was beside Locked 1. / G was not in the same room as B.

Solution: A R4C2 · B R5C6 · C R2C4 · D R6C7 · E R7C1 · F R1C3 · G R3C5

Human logical chain:

1. No immediate placements: initial domains are A:4, B:3, C:4, D:4, E:4, F:3, G:3.
2. Only E can still own column 1.
3. B's remaining squares eliminate D's R4C6 by row/column intersection.
4. F's remaining squares eliminate C's R1C4 by row/column intersection.
5. C/F collectively own rows 1, 2, removing G's candidate(s) there.
6. G becomes fixed at R3C5 after row-ownership.
7. The placement of G removes A's candidate(s) in the same column.
8. The placement of G removes D's candidate(s) in the same row.
9. The placement of G removes D's candidate(s) in the same column.
10. D becomes fixed at R6C7 after column-elimination.
11. E is narrowed by southOfPerson involving D.
12. All seven placements follow deterministically; 3 structural advanced deductions, 3 material, 7 advanced-dependent placements, searchCalls = 0.
