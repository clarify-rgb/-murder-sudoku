# Medium 7×7 — first 10 review

| ID | attempts | solutions | search | initial A–G | direct | row/col elim | row own | col own | multi-row | multi-col | relational | intersect | forced | trace | depth | clues |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| MEDIUM-001 | 1 | 1 | 0 | 4/4/4/6/6/2/4 | 0 | 4 | 1 | 0 | 0 | 0 | 4 | 5 | 7 | 32 | 3 | besideObject, corner, diagonal, eastOfPerson, northOfPerson, onlyOnObject, roomNotBesideObject, row, southOfPerson, westOfPerson |
| MEDIUM-002 | 1 | 1 | 0 | 5/5/6/3/4/7/4 | 0 | 6 | 0 | 0 | 0 | 0 | 5 | 2 | 7 | 32 | 2 | column, corner, diagonal, eastOfObject, northOfPerson, notWithPerson, onlyOnObject, room, row, southOfPerson, westOfPerson |
| MEDIUM-003 | 1 | 1 | 0 | 4/5/6/3/2/7/3 | 0 | 4 | 0 | 0 | 0 | 0 | 4 | 1 | 7 | 28 | 2 | besideObject, corner, eastOfPerson, northOfPerson, notBesideObject, onlyOnObject, row, southOfPerson, westOfObject, westOfPerson |
| MEDIUM-004 | 1 | 1 | 0 | 5/4/6/5/4/4/6 | 0 | 4 | 0 | 0 | 0 | 0 | 6 | 1 | 7 | 31 | 2 | corner, diagonal, eastOfPerson, northOfPerson, notWithPerson, room, roomNotBesideObject, row, southOfPerson, westOfObject |
| MEDIUM-005 | 1 | 1 | 0 | 4/5/3/4/5/4/4 | 0 | 4 | 0 | 0 | 0 | 0 | 6 | 1 | 7 | 32 | 3 | column, corner, diagonal, eastOfPerson, northOfPerson, roomNotBesideObject, row, westOfPerson |
| MEDIUM-006 | 1 | 1 | 0 | 5/5/5/4/4/4/5 | 0 | 3 | 2 | 0 | 0 | 1 | 7 | 0 | 7 | 30 | 2 | besideObject, column, corner, eastOfPerson, northOfObject, northOfPerson, notWithPerson, onlyOnObject, roomNotBesideObject, westOfPerson |
| MEDIUM-007 | 1 | 1 | 0 | 4/5/4/6/4/4/4 | 0 | 10 | 0 | 2 | 0 | 0 | 3 | 4 | 7 | 36 | 5 | besideObject, corner, diagonal, northOfPerson, notBesideObject, notWithPerson, onlyOnObject, roomNotBesideObject, southOfPerson |
| MEDIUM-008 | 1 | 1 | 0 | 4/3/3/4/4/4/4 | 0 | 2 | 0 | 0 | 0 | 0 | 4 | 3 | 7 | 29 | 2 | aloneWithPerson, besideObject, column, corner, diagonal, eastOfObject, notWithPerson, roomNotBesideObject, row, southOfPerson |
| MEDIUM-009 | 1 | 1 | 0 | 4/3/3/4/5/5/4 | 0 | 4 | 0 | 0 | 0 | 0 | 4 | 1 | 7 | 27 | 2 | alone, besideObject, corner, eastOfObject, eastOfPerson, northOfPerson, onlyOnObject, room, roomNotBesideObject, southOfPerson |
| MEDIUM-010 | 1 | 1 | 0 | 6/7/4/4/5/5/4 | 0 | 4 | 0 | 0 | 0 | 0 | 5 | 1 | 7 | 30 | 2 | besideObject, column, corner, eastOfObject, eastOfPerson, northOfPerson, notBesideObject, roomNotBesideObject, southOfPerson |

## Human review — MEDIUM-001

### Configuration

```json
{
  "puzzleId": "MEDIUM-001",
  "profile": "medium",
  "victim": "G",
  "objective": {
    "type": "locatePerson",
    "person": "G"
  },
  "people": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G"
  ],
  "regionOf": [
    [
      4,
      4,
      4,
      4,
      4,
      4,
      0
    ],
    [
      1,
      4,
      4,
      4,
      4,
      0,
      0
    ],
    [
      1,
      1,
      3,
      3,
      0,
      0,
      0
    ],
    [
      1,
      1,
      3,
      3,
      3,
      3,
      3
    ],
    [
      1,
      1,
      1,
      1,
      6,
      2,
      2
    ],
    [
      5,
      5,
      5,
      6,
      6,
      6,
      2
    ],
    [
      5,
      5,
      5,
      6,
      6,
      2,
      2
    ]
  ],
  "roomNames": [
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "R6",
    "R7"
  ],
  "objects": [
    {
      "id": "object-1",
      "name": "Object 1",
      "icon": "1",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 5,
              "c": 1
            },
            {
              "r": 6,
              "c": 1
            }
          ]
        },
        {
          "cells": [
            {
              "r": 2,
              "c": 3
            },
            {
              "r": 2,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "object-2",
      "name": "Object 2",
      "icon": "2",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 5,
              "c": 3
            },
            {
              "r": 5,
              "c": 4
            }
          ]
        }
      ]
    },
    {
      "id": "object-3",
      "name": "Object 3",
      "icon": "3",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 1,
              "c": 5
            }
          ]
        }
      ]
    },
    {
      "id": "locked-1",
      "name": "Locked 1",
      "icon": "L1",
      "blocking": true,
      "footprintSize": 3,
      "occurrences": [
        {
          "cells": [
            {
              "r": 1,
              "c": 6
            },
            {
              "r": 2,
              "c": 6
            },
            {
              "r": 0,
              "c": 6
            }
          ]
        }
      ]
    },
    {
      "id": "object-4",
      "name": "Object 4",
      "icon": "4",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 3,
              "c": 3
            },
            {
              "r": 3,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "object-5",
      "name": "Object 5",
      "icon": "5",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 4,
              "c": 3
            },
            {
              "r": 4,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "object-6",
      "name": "Object 6",
      "icon": "6",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 6,
              "c": 6
            }
          ]
        }
      ]
    },
    {
      "id": "object-7",
      "name": "Object 7",
      "icon": "7",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 1,
              "c": 0
            }
          ]
        }
      ]
    }
  ],
  "clues": {
    "E": [
      {
        "type": "row",
        "row": 0,
        "text": "E was in row 1."
      },
      {
        "type": "northOfPerson",
        "person": "G",
        "text": "E was north of G."
      }
    ],
    "A": [
      {
        "type": "corner",
        "room": 2,
        "text": "A was in a corner of R3."
      },
      {
        "type": "southOfPerson",
        "person": "G",
        "text": "A was south of G."
      }
    ],
    "G": [
      {
        "type": "roomNotBesideObject",
        "room": 3,
        "object": "Object 4",
        "text": "G was in R4, but not beside Object 4."
      },
      {
        "type": "southOfPerson",
        "person": "E",
        "text": "G was south of E."
      }
    ],
    "C": [
      {
        "type": "onlyOnObject",
        "object": "Object 1",
        "text": "C was the only person on Object 1."
      }
    ],
    "B": [
      {
        "type": "corner",
        "room": 1,
        "text": "B was in a corner of R2."
      },
      {
        "type": "northOfPerson",
        "person": "G",
        "text": "B was north of G."
      }
    ],
    "F": [
      {
        "type": "besideObject",
        "object": "Locked 1",
        "text": "F was beside Locked 1."
      },
      {
        "type": "eastOfPerson",
        "person": "D",
        "text": "F was east of D."
      }
    ],
    "D": [
      {
        "type": "diagonal",
        "object": "Object 3",
        "text": "D was diagonal to Object 3."
      },
      {
        "type": "westOfPerson",
        "person": "G",
        "text": "D was west of G."
      }
    ]
  },
  "solution": {
    "E": {
      "r": 0,
      "c": 4
    },
    "B": {
      "r": 1,
      "c": 0
    },
    "F": {
      "r": 2,
      "c": 5
    },
    "G": {
      "r": 3,
      "c": 3
    },
    "D": {
      "r": 4,
      "c": 2
    },
    "C": {
      "r": 5,
      "c": 1
    },
    "A": {
      "r": 6,
      "c": 6
    }
  }
}
```

### Initial domains

```json
{
  "A": [
    "R5C6",
    "R5C7",
    "R7C6",
    "R7C7"
  ],
  "B": [
    "R2C1",
    "R3C2",
    "R5C1",
    "R5C4"
  ],
  "C": [
    "R3C3",
    "R3C4",
    "R6C2",
    "R7C2"
  ],
  "D": [
    "R1C5",
    "R3C5",
    "R4C4",
    "R5C3",
    "R6C2",
    "R7C1"
  ],
  "E": [
    "R1C1",
    "R1C2",
    "R1C3",
    "R1C4",
    "R1C5",
    "R1C6"
  ],
  "F": [
    "R2C6",
    "R3C6"
  ],
  "G": [
    "R4C3",
    "R4C4",
    "R4C6",
    "R4C7"
  ]
}
```

### Solution

A = R7C7 · B = R2C1 · C = R6C2 · D = R5C3 · E = R1C5 · F = R3C6 · G = R4C4

### Human logical solve order

1. Own clues leave multiple candidates (A:4, B:4, C:4, D:6, E:6, F:2, G:4); there are 0 immediate singles.
2. B's northOfPerson constraint removes 2 candidate(s) using G.
3. D's onlyOnObject constraint removes 1 candidate(s) using C.
4. Only C can occupy row 6, restricting C to that row.
5. C is forced to R6C2.
6. F's remaining candidate pattern makes A's R5C6, R7C6 impossible by row/column intersection.
7. F's remaining candidate pattern makes E's R1C6 impossible by row/column intersection.
8. F's remaining candidate pattern makes G's R4C6 impossible by row/column intersection.
9. G's remaining candidate pattern makes D's R4C4 impossible by row/column intersection.
10. B/F collectively own rows 2, 3, so D loses candidate(s) in those rows.
11. The deterministic chain finishes with all seven people fixed; searchCalls = 0.

## Human review — MEDIUM-007

### Configuration

```json
{
  "puzzleId": "MEDIUM-007",
  "profile": "medium",
  "victim": "G",
  "objective": {
    "type": "locatePerson",
    "person": "G"
  },
  "people": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G"
  ],
  "regionOf": [
    [
      4,
      4,
      4,
      3,
      3,
      3,
      2
    ],
    [
      4,
      0,
      0,
      0,
      3,
      3,
      2
    ],
    [
      4,
      0,
      0,
      5,
      3,
      5,
      2
    ],
    [
      0,
      0,
      0,
      5,
      5,
      5,
      1
    ],
    [
      6,
      6,
      0,
      5,
      5,
      1,
      1
    ],
    [
      6,
      6,
      6,
      6,
      1,
      1,
      1
    ],
    [
      6,
      6,
      6,
      6,
      6,
      1,
      1
    ]
  ],
  "roomNames": [
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "R6",
    "R7"
  ],
  "objects": [
    {
      "id": "object-1",
      "name": "Object 1",
      "icon": "1",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 6,
              "c": 4
            },
            {
              "r": 6,
              "c": 3
            }
          ]
        }
      ]
    },
    {
      "id": "object-2",
      "name": "Object 2",
      "icon": "2",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 0,
              "c": 0
            },
            {
              "r": 1,
              "c": 0
            }
          ]
        },
        {
          "cells": [
            {
              "r": 3,
              "c": 6
            },
            {
              "r": 4,
              "c": 6
            }
          ]
        }
      ]
    },
    {
      "id": "object-3",
      "name": "Object 3",
      "icon": "3",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 6,
              "c": 5
            }
          ]
        }
      ]
    },
    {
      "id": "object-4",
      "name": "Object 4",
      "icon": "4",
      "blocking": false,
      "footprintSize": 3,
      "occurrences": [
        {
          "cells": [
            {
              "r": 4,
              "c": 0
            },
            {
              "r": 5,
              "c": 0
            },
            {
              "r": 4,
              "c": 1
            }
          ]
        }
      ]
    },
    {
      "id": "object-5",
      "name": "Object 5",
      "icon": "5",
      "blocking": false,
      "footprintSize": 3,
      "occurrences": [
        {
          "cells": [
            {
              "r": 0,
              "c": 4
            },
            {
              "r": 0,
              "c": 3
            },
            {
              "r": 1,
              "c": 4
            }
          ]
        }
      ]
    },
    {
      "id": "object-6",
      "name": "Object 6",
      "icon": "6",
      "blocking": false,
      "footprintSize": 3,
      "occurrences": [
        {
          "cells": [
            {
              "r": 2,
              "c": 2
            },
            {
              "r": 1,
              "c": 2
            },
            {
              "r": 1,
              "c": 1
            }
          ]
        }
      ]
    },
    {
      "id": "object-7",
      "name": "Object 7",
      "icon": "7",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 4,
              "c": 3
            }
          ]
        }
      ]
    },
    {
      "id": "object-8",
      "name": "Object 8",
      "icon": "8",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 3,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "object-9",
      "name": "Object 9",
      "icon": "9",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 5,
              "c": 6
            }
          ]
        }
      ]
    }
  ],
  "clues": {
    "D": [
      {
        "type": "diagonal",
        "object": "Object 3",
        "text": "D was diagonal to Object 3."
      },
      {
        "type": "southOfPerson",
        "person": "G",
        "text": "D was south of G."
      }
    ],
    "C": [
      {
        "type": "notBesideObject",
        "object": "Object 2",
        "text": "C was not beside Object 2."
      },
      {
        "type": "roomNotBesideObject",
        "room": 1,
        "object": "Object 3",
        "text": "C was in R2, but not beside Object 3."
      }
    ],
    "G": [
      {
        "type": "corner",
        "room": 3,
        "text": "G was in a corner of R4."
      },
      {
        "type": "notWithPerson",
        "person": "A",
        "text": "G was not in the same room as A."
      }
    ],
    "E": [
      {
        "type": "onlyOnObject",
        "object": "Object 2",
        "text": "E was the only person on Object 2."
      },
      {
        "type": "northOfPerson",
        "person": "B",
        "text": "E was north of B."
      }
    ],
    "F": [
      {
        "type": "besideObject",
        "object": "Object 2",
        "text": "F was beside Object 2."
      },
      {
        "type": "notWithPerson",
        "person": "D",
        "text": "F was not in the same room as D."
      }
    ],
    "A": [
      {
        "type": "corner",
        "room": 0,
        "text": "A was in a corner of R1."
      },
      {
        "type": "notWithPerson",
        "person": "E",
        "text": "A was not in the same room as E."
      }
    ],
    "B": [
      {
        "type": "corner",
        "room": 5,
        "text": "B was in a corner of R6."
      },
      {
        "type": "notWithPerson",
        "person": "E",
        "text": "B was not in the same room as E."
      }
    ]
  },
  "solution": {
    "E": {
      "r": 0,
      "c": 0
    },
    "A": {
      "r": 1,
      "c": 1
    },
    "G": {
      "r": 2,
      "c": 4
    },
    "D": {
      "r": 3,
      "c": 2
    },
    "B": {
      "r": 4,
      "c": 3
    },
    "F": {
      "r": 5,
      "c": 6
    },
    "C": {
      "r": 6,
      "c": 5
    }
  }
}
```

### Initial domains

```json
{
  "A": [
    "R2C2",
    "R2C4",
    "R4C1",
    "R5C3"
  ],
  "B": [
    "R3C4",
    "R3C6",
    "R4C6",
    "R5C4",
    "R5C5"
  ],
  "C": [
    "R4C7",
    "R5C7",
    "R6C5",
    "R7C6"
  ],
  "D": [
    "R2C1",
    "R3C2",
    "R4C3",
    "R5C4",
    "R6C5",
    "R6C7"
  ],
  "E": [
    "R1C1",
    "R2C1",
    "R4C7",
    "R5C7"
  ],
  "F": [
    "R1C2",
    "R3C1",
    "R5C6",
    "R6C7"
  ],
  "G": [
    "R1C4",
    "R1C6",
    "R2C6",
    "R3C5"
  ]
}
```

### Solution

A = R2C2 · B = R5C4 · C = R7C6 · D = R4C3 · E = R1C1 · F = R6C7 · G = R3C5

### Human logical solve order

1. Own clues leave multiple candidates (A:4, B:5, C:4, D:6, E:4, F:4, G:4); there are 0 immediate singles.
2. C's onlyOnObject constraint removes 2 candidate(s) using E.
3. D's onlyOnObject constraint removes 1 candidate(s) using E.
4. E's northOfPerson constraint removes 1 candidate(s) using B.
5. Only C can occupy row 7, restricting C to that row.
6. C is forced to R7C6.
7. E's remaining candidate pattern makes A's R4C1 impossible by row/column intersection.
8. With C fixed in column 6, B loses candidate(s) from that column.
9. With C fixed in column 6, F loses candidate(s) from that column.
10. With C fixed in column 6, G loses candidate(s) from that column.
11. The deterministic chain finishes with all seven people fixed; searchCalls = 0.

## Human review — MEDIUM-006

### Configuration

```json
{
  "puzzleId": "MEDIUM-006",
  "profile": "medium",
  "victim": "G",
  "objective": {
    "type": "locatePerson",
    "person": "G"
  },
  "people": [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G"
  ],
  "regionOf": [
    [
      2,
      2,
      2,
      2,
      1,
      1,
      1
    ],
    [
      2,
      2,
      3,
      2,
      1,
      0,
      0
    ],
    [
      3,
      3,
      3,
      1,
      1,
      0,
      0
    ],
    [
      3,
      3,
      4,
      4,
      0,
      0,
      0
    ],
    [
      3,
      3,
      4,
      4,
      4,
      4,
      4
    ],
    [
      3,
      3,
      5,
      4,
      4,
      5,
      5
    ],
    [
      3,
      5,
      5,
      5,
      5,
      5,
      5
    ]
  ],
  "roomNames": [
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "R6"
  ],
  "objects": [
    {
      "id": "object-1",
      "name": "Object 1",
      "icon": "1",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 6,
              "c": 1
            }
          ]
        }
      ]
    },
    {
      "id": "object-2",
      "name": "Object 2",
      "icon": "2",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 6,
              "c": 3
            },
            {
              "r": 6,
              "c": 2
            }
          ]
        },
        {
          "cells": [
            {
              "r": 0,
              "c": 3
            },
            {
              "r": 0,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "locked-1",
      "name": "Locked 1",
      "icon": "L1",
      "blocking": true,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 3,
              "c": 1
            }
          ]
        }
      ]
    },
    {
      "id": "locked-2",
      "name": "Locked 2",
      "icon": "L2",
      "blocking": true,
      "footprintSize": 3,
      "occurrences": [
        {
          "cells": [
            {
              "r": 4,
              "c": 3
            },
            {
              "r": 5,
              "c": 3
            },
            {
              "r": 4,
              "c": 4
            }
          ]
        },
        {
          "cells": [
            {
              "r": 2,
              "c": 1
            },
            {
              "r": 2,
              "c": 2
            },
            {
              "r": 1,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "locked-3",
      "name": "Locked 3",
      "icon": "L3",
      "blocking": true,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 3,
              "c": 0
            }
          ]
        }
      ]
    },
    {
      "id": "object-3",
      "name": "Object 3",
      "icon": "3",
      "blocking": false,
      "footprintSize": 2,
      "occurrences": [
        {
          "cells": [
            {
              "r": 3,
              "c": 3
            },
            {
              "r": 3,
              "c": 2
            }
          ]
        }
      ]
    },
    {
      "id": "object-4",
      "name": "Object 4",
      "icon": "4",
      "blocking": false,
      "footprintSize": 1,
      "occurrences": [
        {
          "cells": [
            {
              "r": 2,
              "c": 0
            }
          ]
        }
      ]
    }
  ],
  "clues": {
    "D": [
      {
        "type": "onlyOnObject",
        "object": "Object 2",
        "text": "D was the only person on Object 2."
      },
      {
        "type": "northOfPerson",
        "person": "A",
        "text": "D was north of A."
      }
    ],
    "C": [
      {
        "type": "column",
        "column": 1,
        "text": "C was in column 2."
      },
      {
        "type": "notWithPerson",
        "person": "A",
        "text": "C was not in the same room as A."
      }
    ],
    "G": [
      {
        "type": "roomNotBesideObject",
        "room": 4,
        "object": "Object 3",
        "text": "G was in R5, but not beside Object 3."
      },
      {
        "type": "northOfPerson",
        "person": "C",
        "text": "G was north of C."
      }
    ],
    "B": [
      {
        "type": "besideObject",
        "object": "Locked 2",
        "text": "B was beside Locked 2."
      },
      {
        "type": "westOfPerson",
        "person": "F",
        "text": "B was west of F."
      }
    ],
    "A": [
      {
        "type": "besideObject",
        "object": "Locked 2",
        "text": "A was beside Locked 2."
      },
      {
        "type": "westOfPerson",
        "person": "B",
        "text": "A was west of B."
      }
    ],
    "E": [
      {
        "type": "corner",
        "room": 0,
        "text": "E was in a corner of R1."
      },
      {
        "type": "northOfObject",
        "object": "Locked 2",
        "text": "E was north of Locked 2."
      }
    ],
    "F": [
      {
        "type": "corner",
        "room": 0,
        "text": "F was in a corner of R1."
      },
      {
        "type": "eastOfPerson",
        "person": "E",
        "text": "F was east of E."
      }
    ]
  },
  "solution": {
    "D": {
      "r": 0,
      "c": 3
    },
    "E": {
      "r": 1,
      "c": 5
    },
    "A": {
      "r": 2,
      "c": 0
    },
    "F": {
      "r": 3,
      "c": 6
    },
    "B": {
      "r": 4,
      "c": 2
    },
    "G": {
      "r": 5,
      "c": 4
    },
    "C": {
      "r": 6,
      "c": 1
    }
  }
}
```

### Initial domains

```json
{
  "A": [
    "R3C1",
    "R4C4",
    "R5C3",
    "R5C6",
    "R6C5"
  ],
  "B": [
    "R3C1",
    "R4C4",
    "R5C3",
    "R5C6",
    "R6C5"
  ],
  "C": [
    "R1C2",
    "R2C2",
    "R5C2",
    "R6C2",
    "R7C2"
  ],
  "D": [
    "R1C3",
    "R1C4",
    "R7C3",
    "R7C4"
  ],
  "E": [
    "R2C6",
    "R2C7",
    "R4C5",
    "R4C7"
  ],
  "F": [
    "R2C6",
    "R2C7",
    "R4C5",
    "R4C7"
  ],
  "G": [
    "R4C3",
    "R4C4",
    "R5C6",
    "R5C7",
    "R6C5"
  ]
}
```

### Solution

A = R3C1 · B = R5C3 · C = R7C2 · D = R1C4 · E = R2C6 · F = R4C7 · G = R6C5

### Human logical solve order

1. Own clues leave multiple candidates (A:5, B:5, C:5, D:4, E:4, F:4, G:5); there are 0 immediate singles.
2. A's westOfPerson constraint removes 1 candidate(s) using B.
3. B's westOfPerson constraint removes 1 candidate(s) using A.
4. D's northOfPerson constraint removes 2 candidate(s) using A.
5. F's eastOfPerson constraint removes 1 candidate(s) using E.
6. E's eastOfPerson constraint removes 2 candidate(s) using F.
7. C's northOfPerson constraint removes 2 candidate(s) using G.
8. Only A can occupy row 3, restricting A to that row.
9. A is forced to R3C1.
10. Only C can occupy row 7, restricting C to that row.
11. The deterministic chain finishes with all seven people fixed; searchCalls = 0.
