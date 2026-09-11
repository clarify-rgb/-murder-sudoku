# Medium 7×7 — final breadth floor, 20 accepted puzzles

Classification: CLEAR MEDIUM 14 · BORDERLINE 6 · TOO EASY 0

Rejected previous-floor candidates: chain people < 4 = 2 · advanced-dependent placements < 4 = 6

| ID | attempts | select | initial A–G | adv | material | ownership | intersect | relational | depth | chain people | adv→placements | trace | class |
|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| MEDIUM-FINAL-001 | 1 | 3 | 5/3/6/5/6/4/6 | 3 | 3 | 1 | 2 | 5 | 4 | 7 | 7 | 33 | CLEAR MEDIUM |
| MEDIUM-FINAL-002 | 1 | 11 | 4/4/6/5/4/4/4 | 3 | 3 | 0 | 3 | 6 | 3 | 5 | 5 | 34 | CLEAR MEDIUM |
| MEDIUM-FINAL-003 | 1 | 9 | 4/4/5/4/4/4/2 | 4 | 4 | 1 | 3 | 4 | 4 | 7 | 7 | 30 | CLEAR MEDIUM |
| MEDIUM-FINAL-004 | 1 | 7 | 4/6/3/3/6/4/5 | 3 | 3 | 0 | 3 | 5 | 2 | 5 | 5 | 33 | CLEAR MEDIUM |
| MEDIUM-FINAL-005 | 1 | 5 | 4/4/4/5/5/5/4 | 5 | 5 | 3 | 2 | 6 | 3 | 7 | 5 | 34 | CLEAR MEDIUM |
| MEDIUM-FINAL-006 | 1 | 94 | 5/4/4/5/4/6/5 | 2 | 2 | 0 | 2 | 5 | 2 | 4 | 4 | 33 | BORDERLINE |
| MEDIUM-FINAL-007 | 1 | 9 | 3/4/5/5/3/4/5 | 2 | 2 | 1 | 1 | 4 | 2 | 5 | 4 | 29 | BORDERLINE |
| MEDIUM-FINAL-008 | 1 | 58 | 5/4/5/4/4/3/4 | 2 | 2 | 0 | 2 | 6 | 3 | 5 | 4 | 35 | CLEAR MEDIUM |
| MEDIUM-FINAL-009 | 1 | 1 | 4/5/4/5/4/5/5 | 6 | 6 | 2 | 4 | 2 | 5 | 6 | 6 | 32 | CLEAR MEDIUM |
| MEDIUM-FINAL-010 | 1 | 8 | 7/5/3/5/6/3/5 | 3 | 3 | 1 | 2 | 5 | 2 | 6 | 5 | 33 | CLEAR MEDIUM |
| MEDIUM-FINAL-011 | 1 | 3 | 4/4/5/5/6/2/4 | 2 | 2 | 0 | 2 | 4 | 2 | 5 | 4 | 33 | BORDERLINE |
| MEDIUM-FINAL-012 | 1 | 50 | 4/4/5/4/4/4/4 | 2 | 2 | 0 | 2 | 5 | 2 | 5 | 5 | 31 | BORDERLINE |
| MEDIUM-FINAL-013 | 1 | 150 | 4/6/4/4/4/4/4 | 2 | 2 | 2 | 0 | 7 | 3 | 6 | 4 | 32 | CLEAR MEDIUM |
| MEDIUM-FINAL-014 | 1 | 41 | 4/4/4/4/4/4/5 | 2 | 2 | 0 | 2 | 4 | 2 | 4 | 4 | 32 | BORDERLINE |
| MEDIUM-FINAL-015 | 3 | 34 | 3/4/2/4/5/4/5 | 2 | 2 | 0 | 2 | 2 | 3 | 4 | 4 | 28 | CLEAR MEDIUM |
| MEDIUM-FINAL-016 | 1 | 8 | 6/4/4/4/4/3/4 | 4 | 4 | 1 | 3 | 2 | 3 | 7 | 7 | 33 | CLEAR MEDIUM |
| MEDIUM-FINAL-017 | 1 | 29 | 4/4/5/4/4/5/7 | 3 | 3 | 1 | 2 | 8 | 3 | 5 | 5 | 33 | CLEAR MEDIUM |
| MEDIUM-FINAL-018 | 1 | 189 | 5/4/7/4/4/4/4 | 2 | 2 | 0 | 2 | 5 | 2 | 5 | 5 | 32 | BORDERLINE |
| MEDIUM-FINAL-019 | 1 | 2 | 3/4/2/6/4/4/4 | 4 | 4 | 0 | 4 | 1 | 2 | 4 | 4 | 31 | CLEAR MEDIUM |
| MEDIUM-FINAL-020 | 1 | 252 | 4/5/3/4/2/6/5 | 3 | 3 | 0 | 3 | 4 | 3 | 6 | 6 | 33 | CLEAR MEDIUM |

## WEAKEST — MEDIUM-FINAL-014

Classification: **BORDERLINE** · strength 76

Clues:
- A: A was east of Object 5. / A was alone in either R3 or R7.
- B: B was in R7, but not beside Object 1. / B was east of E.
- C: C was in column 5. / C was not in the same room as A.
- D: D was in R7, but not beside Locked 2. / D was south of F.
- E: E was in a corner of R5. / E was not in the same room as C.
- F: F was in column 7. / F was north of Object 4.
- G: G was beside Object 3. / G was not in the same room as A.

Solution: A R5C4 · B R3C2 · C R7C5 · D R4C3 · E R1C1 · F R2C7 · G R6C6

Human logical chain:

1. No immediate placements: initial domains are A:4, B:4, C:4, D:4, E:4, F:4, G:5.
2. A is narrowed by aloneInRooms.
3. B is narrowed by eastOfPerson involving E.
4. E is narrowed by eastOfPerson involving B.
5. F is narrowed by southOfPerson involving D.
6. Only C can still occupy row 7.
7. C becomes fixed at R7C5 after row-occupancy.
8. Only E can still occupy column 1.
9. E becomes fixed at R1C1 after column-occupancy.
10. Only G can still occupy column 6.
11. A's remaining candidate pattern eliminates B's R3C4 by row/column intersection.
12. B's remaining candidate pattern eliminates D's R3C3, R4C2 by row/column intersection.
13. D becomes fixed at R4C3 after intersecting-square-elimination.
14. Because D is fixed, A loses candidate(s) in the same row.
15. All seven placements follow deterministically; 2 structural advanced deductions, 2 material, 4 chain people, 4 advanced-dependent placements, searchCalls = 0.

## WEAKEST — MEDIUM-FINAL-015

Classification: **CLEAR MEDIUM** · strength 76

Clues:
- A: A was in R7. / A was east of E.
- B: B was in a corner of R5. / B was north of A.
- C: C was the only person on Object 3. / C was north of Object 7.
- D: D was in a corner of R1. / D was west of E.
- E: E was diagonal to Object 6. / E was east of D.
- F: F was in R5, but not beside Locked 1. / F was north of C.
- G: G was in row 5. / G was not in the same room as E.

Solution: A R6C7 · B R4C2 · C R2C4 · D R3C1 · E R7C6 · F R1C3 · G R5C5

Human logical chain:

1. No immediate placements: initial domains are A:3, B:4, C:2, D:4, E:5, F:4, G:5.
2. E is narrowed by onlyOnObject involving C.
3. F is narrowed by northOfPerson involving C.
4. Only A can still occupy row 6.
5. A becomes fixed at R6C7 after row-occupancy.
6. Only E can still occupy column 6.
7. E becomes fixed at R7C6 after column-occupancy.
8. C's remaining candidate pattern eliminates B's R2C1 by row/column intersection.
9. F's remaining candidate pattern eliminates B's R1C1, R1C3 by row/column intersection.
10. B becomes fixed at R4C2 after intersecting-square-elimination.
11. Because A is fixed, G loses candidate(s) in the same column.
12. Because B is fixed, D loses candidate(s) in the same column.
13. Because B is fixed, F loses candidate(s) in the same column.
14. Because E is fixed, D loses candidate(s) in the same row.
15. All seven placements follow deterministically; 2 structural advanced deductions, 2 material, 4 chain people, 4 advanced-dependent placements, searchCalls = 0.

## WEAKEST — MEDIUM-FINAL-006

Classification: **BORDERLINE** · strength 77

Clues:
- A: A was in R2, but not beside Locked 2. / A was west of D.
- B: B was in a corner of R3. / B was south of C.
- C: C was in a corner of R4. / C was not in the same room as G.
- D: D was in R2, but not beside Locked 1. / D was alone with A in R2.
- E: E was in a corner of R6. / E was north of G.
- F: F was in R5, but not beside Object 2. / F was alone in R5.
- G: G was in column 6. / G was north of C.

Solution: A R6C4 · B R7C3 · C R4C7 · D R5C5 · E R1C1 · F R3C2 · G R2C6

Human logical chain:

1. No immediate placements: initial domains are A:5, B:4, C:4, D:5, E:4, F:6, G:5.
2. D is narrowed by westOfPerson involving A.
3. C is narrowed by southOfPerson involving B.
4. G is narrowed by notWithPerson involving C.
5. G is narrowed by aloneWithPerson involving D.
6. G is narrowed by northOfPerson involving E.
7. Only E can still occupy row 1.
8. Only B can still occupy row 7.
9. Only F can still occupy column 2.
10. Only B can still occupy column 3.
11. B becomes fixed at R7C3 after column-occupancy.
12. Only C can still occupy column 7.
13. C becomes fixed at R4C7 after column-occupancy.
14. D's remaining candidate pattern eliminates A's R4C5 by row/column intersection.
15. All seven placements follow deterministically; 2 structural advanced deductions, 2 material, 4 chain people, 4 advanced-dependent placements, searchCalls = 0.

## STRONGEST — MEDIUM-FINAL-009

Classification: **CLEAR MEDIUM** · strength 156

Clues:
- A: A was in a corner of R3. / A was west of F.
- B: B was in R6, but not beside Locked 2. / B was not in the same room as D.
- C: C was in column 3. / C was south of Locked 1.
- D: D was diagonal to Object 4. / D was north of F.
- E: E was in R4, but not beside Object 4. / E was west of F.
- F: F was in row 5. / F was north of B.
- G: G was diagonal to Object 4. / G was east of E.

Solution: A R3C1 · B R7C4 · C R6C3 · D R4C2 · E R1C5 · F R5C7 · G R2C6

Human logical chain:

1. No immediate placements: initial domains are A:4, B:5, C:4, D:5, E:4, F:5, G:5.
2. F is narrowed by westOfPerson involving E.
3. G is narrowed by eastOfPerson involving E.
4. Only E can still occupy row 1.
5. E becomes fixed at R1C5 after row-occupancy.
6. F's remaining candidate pattern eliminates A's R5C4 by row/column intersection.
7. A/D/G collectively own rows 2, 3, 4, removing C's candidate(s) there.
8. Because E is fixed, F loses candidate(s) in the same column.
9. C's remaining candidate pattern eliminates B's R7C3 by row/column intersection.
10. F/G collectively own columns 6, 7, removing D's candidate(s) there.
11. D's remaining candidate pattern eliminates A's R4C4 by row/column intersection.
12. Only D can still occupy row 4.
13. D becomes fixed at R4C2 after row-occupancy.
14. Only B can still occupy column 4.
15. All seven placements follow deterministically; 6 structural advanced deductions, 6 material, 6 chain people, 6 advanced-dependent placements, searchCalls = 0.

## STRONGEST — MEDIUM-FINAL-005

Classification: **CLEAR MEDIUM** · strength 138

Clues:
- A: A was in R1, but not beside Object 1. / A was in R1, but not beside Locked 2.
- B: B was in column 5. / B was west of C.
- C: C was diagonal to Object 2. / C was east of D.
- D: D was in row 5. / D was west of E.
- E: E was in a corner of R2. / E was not in the same room as D.
- F: F was diagonal to Object 4. / F was north of B.
- G: G was in R3, but not beside Locked 1. / G was west of F.

Solution: A R1C3 · B R7C5 · C R2C6 · D R5C1 · E R6C4 · F R3C7 · G R4C2

Human logical chain:

1. No immediate placements: initial domains are A:4, B:4, C:4, D:5, E:5, F:5, G:4.
2. C is narrowed by westOfPerson involving B.
3. D is narrowed by eastOfPerson involving C.
4. D is narrowed by notWithPerson involving E.
5. F is narrowed by northOfPerson involving B.
6. B is narrowed by northOfPerson involving F.
7. F is narrowed by westOfPerson involving G.
8. B's remaining candidate pattern eliminates E's R7C5 by row/column intersection.
9. D's remaining candidate pattern eliminates E's R5C6 by row/column intersection.
10. A/C collectively own rows 1, 2, removing G's candidate(s) there.
11. F/G collectively own rows 3, 4, removing E's candidate(s) there.
12. C/F collectively own columns 6, 7, removing E's candidate(s) there.
13. E becomes fixed at R6C4 after column-ownership.
14. Because E is fixed, A loses candidate(s) in the same column.
15. All seven placements follow deterministically; 5 structural advanced deductions, 5 material, 7 chain people, 5 advanced-dependent placements, searchCalls = 0.
