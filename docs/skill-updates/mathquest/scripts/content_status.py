#!/usr/bin/env python3
"""Print what MathQuest teaches today: micro-skills and expectations covered, by grade and strand.

Run from the repository root:  python scripts/content_status.py
(Or pass the root: python content_status.py /path/to/mathquest)
"""
import collections
import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
skills = json.loads((root / 'content/microskills.json').read_text())['microskills']
exps = json.loads((root / 'content/curriculum.json').read_text())['expectations']
ladders = json.loads((root / 'content/placement.json').read_text())['ladders']

covered: dict = collections.defaultdict(set)
count: collections.Counter = collections.Counter()
for s in skills:
    head = s['expectation'].split('.')[0]
    grade = 'G9' if head == 'MTH1W' else head  # Grade 9 expectations are coded by course (MTH1W)
    strand = s['expectation'].split('.')[1][0]
    covered[(grade, strand)].add(s['expectation'])
    count[(grade, strand)] += 1

total: collections.Counter = collections.Counter()
for e in exps:
    if e['schema'] == 'course-strand':
        continue
    total[(f"G{e['grade']}", e['strand'])] += 1

grades = sorted({g for g, _ in total}, key=lambda g: int(g[1:]))
print(f"{len(skills)} micro-skills · placement ladders for grades: {', '.join(sorted(ladders))}")
print()
print('grade  strand  micro-skills  expectations with a skill / total')
for g in grades:
    for strand in 'BCDEF':
        n = total[(g, strand)]
        if n:
            print(f"{g:<6} {strand:<7} {count[(g, strand)]:<13} {len(covered[(g, strand)])} / {n}")
