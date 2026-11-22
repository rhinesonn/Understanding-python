import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Link2,
  CheckCircle2,
} from 'lucide-react';

interface MemoryLabProps {
  completedDrills: string[];
  onCompleteDrill: (drillId: string, xp: number) => void;
}

interface VarBinding {
  name: string;
  targetId: string | null; // null means primitive inline display
  primitiveVal?: string;
  frame?: string;
}

interface HeapObj {
  id: string;
  type: 'list' | 'tuple' | 'None';
  label: string;
  cells: { val: string; refId?: string }[];
  x: number;
  y: number;
  highlight?: 'mutated' | 'aliased' | 'new' | 'none';
}

interface MemStep {
  line: number;
  vars: VarBinding[];
  heap: HeapObj[];
  checks: { expr: string; result: string; surprise?: boolean }[];
  explanation: string;
  iterPointerIdx?: number;
}

interface MemScenario {
  id: string;
  title: string;
  trapLabel: string;
  code: string[];
  steps: MemStep[];
  examRule: string;
}

const SCENARIOS: MemScenario[] = [
  {
    id: 'shallow-vs-deep',
    title: 'Alias vs Shallow Copy vs Deep Copy',
    trapLabel: 'Nested List Mutation',
    code: [
      'import copy',
      'a = [[1, 2], [3, 4]]',
      'b = a                 # alias!',
      'c = a.copy()          # shallow copy (same as a[:])',
      'd = copy.deepcopy(a)  # full recursive copy',
      'c[0].append(99)       # WHO changes?!',
    ],
    steps: [
      {
        line: 1,
        vars: [{ name: 'a', targetId: 'L1' }],
        heap: [
          {
            id: 'L1',
            type: 'list',
            label: '0x100 list',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 210,
            y: 45,
            highlight: 'new',
          },
          {
            id: 'L2',
            type: 'list',
            label: '0x101 list',
            cells: [{ val: '1' }, { val: '2' }],
            x: 420,
            y: 30,
          },
          {
            id: 'L3',
            type: 'list',
            label: '0x102 list',
            cells: [{ val: '3' }, { val: '4' }],
            x: 420,
            y: 115,
          },
        ],
        checks: [{ expr: 'a', result: '[[1, 2], [3, 4]]' }],
        explanation:
          'Outer list `0x100` does NOT store `[1, 2]` directly — it stores pointers (references) to inner list objects `0x101` and `0x102`.',
      },
      {
        line: 2,
        vars: [
          { name: 'a', targetId: 'L1' },
          { name: 'b', targetId: 'L1' },
        ],
        heap: [
          {
            id: 'L1',
            type: 'list',
            label: '0x100 list',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 210,
            y: 45,
            highlight: 'aliased',
          },
          {
            id: 'L2',
            type: 'list',
            label: '0x101 list',
            cells: [{ val: '1' }, { val: '2' }],
            x: 420,
            y: 30,
          },
          {
            id: 'L3',
            type: 'list',
            label: '0x102 list',
            cells: [{ val: '3' }, { val: '4' }],
            x: 420,
            y: 115,
          },
        ],
        checks: [
          { expr: 'b is a', result: 'True', surprise: true },
          { expr: 'b == a', result: 'True' },
        ],
        explanation:
          '`b = a` NEVER copies! Both `a` and `b` point to the exact same outer list `0x100`.',
      },
      {
        line: 3,
        vars: [
          { name: 'a', targetId: 'L1' },
          { name: 'b', targetId: 'L1' },
          { name: 'c', targetId: 'L4' },
        ],
        heap: [
          {
            id: 'L1',
            type: 'list',
            label: '0x100 list',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 210,
            y: 30,
          },
          {
            id: 'L4',
            type: 'list',
            label: '0x200 list (shallow)',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 210,
            y: 130,
            highlight: 'new',
          },
          {
            id: 'L2',
            type: 'list',
            label: '0x101 list (SHARED!)',
            cells: [{ val: '1' }, { val: '2' }],
            x: 430,
            y: 30,
            highlight: 'aliased',
          },
          {
            id: 'L3',
            type: 'list',
            label: '0x102 list (SHARED!)',
            cells: [{ val: '3' }, { val: '4' }],
            x: 430,
            y: 125,
            highlight: 'aliased',
          },
        ],
        checks: [
          { expr: 'c is a', result: 'False' },
          { expr: 'c[0] is a[0]', result: 'True  ← TRAP!', surprise: true },
        ],
        explanation:
          'DANGER! `a.copy()` creates a NEW outer list `0x200`, but copies only the pointers to the SAME inner lists `0x101` and `0x102`!',
      },
      {
        line: 4,
        vars: [
          { name: 'a', targetId: 'L1' },
          { name: 'b', targetId: 'L1' },
          { name: 'c', targetId: 'L4' },
          { name: 'd', targetId: 'L5' },
        ],
        heap: [
          {
            id: 'L1',
            type: 'list',
            label: '0x100 list',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 205,
            y: 25,
          },
          {
            id: 'L4',
            type: 'list',
            label: '0x200 shallow',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 205,
            y: 115,
          },
          {
            id: 'L5',
            type: 'list',
            label: '0x300 deep',
            cells: [
              { val: 'ref', refId: 'L6' },
              { val: 'ref', refId: 'L7' },
            ],
            x: 205,
            y: 205,
            highlight: 'new',
          },
          {
            id: 'L2',
            type: 'list',
            label: '0x101 shared',
            cells: [{ val: '1' }, { val: '2' }],
            x: 430,
            y: 25,
          },
          {
            id: 'L3',
            type: 'list',
            label: '0x102 shared',
            cells: [{ val: '3' }, { val: '4' }],
            x: 430,
            y: 105,
          },
          {
            id: 'L6',
            type: 'list',
            label: '0x301 clone',
            cells: [{ val: '1' }, { val: '2' }],
            x: 430,
            y: 185,
            highlight: 'new',
          },
          {
            id: 'L7',
            type: 'list',
            label: '0x302 clone',
            cells: [{ val: '3' }, { val: '4' }],
            x: 430,
            y: 255,
            highlight: 'new',
          },
        ],
        checks: [
          { expr: 'd[0] is a[0]', result: 'False (completely independent)' },
        ],
        explanation:
          '`copy.deepcopy(a)` recursively clones BOTH outer and inner lists (`0x301`, `0x302`). Nothing is shared with `a`!',
      },
      {
        line: 5,
        vars: [
          { name: 'a', targetId: 'L1' },
          { name: 'b', targetId: 'L1' },
          { name: 'c', targetId: 'L4' },
          { name: 'd', targetId: 'L5' },
        ],
        heap: [
          {
            id: 'L1',
            type: 'list',
            label: '0x100 list',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 205,
            y: 25,
          },
          {
            id: 'L4',
            type: 'list',
            label: '0x200 shallow',
            cells: [
              { val: 'ref', refId: 'L2' },
              { val: 'ref', refId: 'L3' },
            ],
            x: 205,
            y: 115,
          },
          {
            id: 'L5',
            type: 'list',
            label: '0x300 deep',
            cells: [
              { val: 'ref', refId: 'L6' },
              { val: 'ref', refId: 'L7' },
            ],
            x: 205,
            y: 205,
          },
          {
            id: 'L2',
            type: 'list',
            label: '0x101 MUTATED!',
            cells: [{ val: '1' }, { val: '2' }, { val: '99' }],
            x: 420,
            y: 25,
            highlight: 'mutated',
          },
          {
            id: 'L3',
            type: 'list',
            label: '0x102 shared',
            cells: [{ val: '3' }, { val: '4' }],
            x: 420,
            y: 105,
          },
          {
            id: 'L6',
            type: 'list',
            label: '0x301 safe',
            cells: [{ val: '1' }, { val: '2' }],
            x: 420,
            y: 185,
          },
          {
            id: 'L7',
            type: 'list',
            label: '0x302 safe',
            cells: [{ val: '3' }, { val: '4' }],
            x: 420,
            y: 255,
          },
        ],
        checks: [
          { expr: 'a', result: '[[1, 2, 99], [3, 4]]', surprise: true },
          { expr: 'b', result: '[[1, 2, 99], [3, 4]]', surprise: true },
          { expr: 'c', result: '[[1, 2, 99], [3, 4]]' },
          { expr: 'd', result: '[[1, 2], [3, 4]]  (safe!)' },
        ],
        explanation:
          'BOOM! Mutating `c[0]` mutates object `0x101`, so `a`, `b`, AND `c` all see `[1, 2, 99]`. Only `d` (deep copy) remains untouched!',
      },
    ],
    examRule:
      'In Q1 tracing, always draw inner lists as separate boxes! `lst[:]`, `list(lst)`, and `lst.copy()` are ALL shallow copies.',
  },
  {
    id: 'list-mult',
    title: 'The `[[0] * 3] * 3` 2D Grid Trap',
    trapLabel: 'Shared Row Aliasing',
    code: [
      'row = [0] * 3',
      'grid = [row] * 3      # SAME as [[0] * 3] * 3 !',
      'grid[0][1] = 9        # Expecting only row 0 to change...',
      '# Fix: grid = [[0] * 3 for _ in range(3)]',
    ],
    steps: [
      {
        line: 0,
        vars: [{ name: 'row', targetId: 'R1' }],
        heap: [
          {
            id: 'R1',
            type: 'list',
            label: '0x401 list',
            cells: [{ val: '0' }, { val: '0' }, { val: '0' }],
            x: 240,
            y: 80,
            highlight: 'new',
          },
        ],
        checks: [{ expr: 'row', result: '[0, 0, 0]' }],
        explanation:
          '`[0] * 3` is fine because `0` is an immutable integer. It creates ONE list object `0x401`.',
      },
      {
        line: 1,
        vars: [
          { name: 'row', targetId: 'R1' },
          { name: 'grid', targetId: 'G1' },
        ],
        heap: [
          {
            id: 'G1',
            type: 'list',
            label: '0x400 grid',
            cells: [
              { val: 'ref', refId: 'R1' },
              { val: 'ref', refId: 'R1' },
              { val: 'ref', refId: 'R1' },
            ],
            x: 200,
            y: 165,
            highlight: 'new',
          },
          {
            id: 'R1',
            type: 'list',
            label: '0x401 SINGLE ROW!',
            cells: [{ val: '0' }, { val: '0' }, { val: '0' }],
            x: 425,
            y: 75,
            highlight: 'aliased',
          },
        ],
        checks: [
          { expr: 'grid[0] is grid[1]', result: 'True  ← DANGER!', surprise: true },
          { expr: 'grid[1] is grid[2]', result: 'True  ← DANGER!', surprise: true },
        ],
        explanation:
          'List multiplication repeats REFERENCES, not copies! All 3 slots in `grid` point to the EXACT SAME list object `0x401`!',
      },
      {
        line: 2,
        vars: [
          { name: 'row', targetId: 'R1' },
          { name: 'grid', targetId: 'G1' },
        ],
        heap: [
          {
            id: 'G1',
            type: 'list',
            label: '0x400 grid',
            cells: [
              { val: 'ref', refId: 'R1' },
              { val: 'ref', refId: 'R1' },
              { val: 'ref', refId: 'R1' },
            ],
            x: 200,
            y: 165,
          },
          {
            id: 'R1',
            type: 'list',
            label: '0x401 MUTATED!',
            cells: [{ val: '0' }, { val: '9' }, { val: '0' }],
            x: 425,
            y: 75,
            highlight: 'mutated',
          },
        ],
        checks: [
          { expr: 'grid', result: '[[0, 9, 0], [0, 9, 0], [0, 9, 0]]', surprise: true },
        ],
        explanation:
          'Every single row changed to `[0, 9, 0]`! In CS1010A DP tables & 2D boards, ALWAYS write `[[0] * cols for _ in range(rows)]`.',
      },
    ],
    examRule:
      'NEVER initialize a 2D list or DP table with `[[0] * n] * m`. Always use a list comprehension: `[[0] * n for _ in range(m)]`.',
  },
  {
    id: 'mutate-iter',
    title: 'Mutating a List While Iterating',
    trapLabel: 'Skipped Element Bug',
    code: [
      'nums = [2, 4, 6, 7]',
      'for x in nums:        # Python tracks hidden index i = 0, 1, 2...',
      '    if x % 2 == 0:',
      '        nums.remove(x) # Shifts elements LEFT!',
      'print(nums)           # Expecting [7]... what actually prints?',
    ],
    steps: [
      {
        line: 1,
        vars: [
          { name: 'nums', targetId: 'N1' },
          { name: 'hidden i', targetId: null, primitiveVal: '0' },
          { name: 'x', targetId: null, primitiveVal: '2' },
        ],
        heap: [
          {
            id: 'N1',
            type: 'list',
            label: '0x500 nums',
            cells: [{ val: '2' }, { val: '4' }, { val: '6' }, { val: '7' }],
            x: 240,
            y: 80,
          },
        ],
        checks: [{ expr: 'x == nums[0]', result: '2 (even → will remove!)' }],
        explanation:
          'Iteration 1: Python reads `nums[0]`, so `x = 2`. Since `2 % 2 == 0`, we enter `nums.remove(2)`.',
        iterPointerIdx: 0,
      },
      {
        line: 3,
        vars: [
          { name: 'nums', targetId: 'N1' },
          { name: 'hidden i', targetId: null, primitiveVal: '0 → 1' },
          { name: 'x', targetId: null, primitiveVal: '2' },
        ],
        heap: [
          {
            id: 'N1',
            type: 'list',
            label: '0x500 shifted left!',
            cells: [{ val: '4' }, { val: '6' }, { val: '7' }],
            x: 240,
            y: 80,
            highlight: 'mutated',
          },
        ],
        checks: [
          { expr: 'nums[0]', result: '4 (shifted into slot 0!)', surprise: true },
          { expr: 'next index i', result: '1 → reads 6, SKIPS 4!', surprise: true },
        ],
        explanation:
          'TRAP! Removing `2` shifted `4` into index `0` and `6` into index `1`. Then the `for` loop increments hidden `i` to `1` — jumping straight over `4`!',
        iterPointerIdx: 1,
      },
      {
        line: 3,
        vars: [
          { name: 'nums', targetId: 'N1' },
          { name: 'hidden i', targetId: null, primitiveVal: '1 → 2' },
          { name: 'x', targetId: null, primitiveVal: '6' },
        ],
        heap: [
          {
            id: 'N1',
            type: 'list',
            label: '0x500 shifted left!',
            cells: [{ val: '4' }, { val: '7' }],
            x: 240,
            y: 80,
            highlight: 'mutated',
          },
        ],
        checks: [
          { expr: 'len(nums)', result: '2' },
          { expr: 'next index i=2', result: '2 >= len(nums) → Loop stops!' },
        ],
        explanation:
          'At `i=1`, `x = 6` is removed, shrinking `nums` to `[4, 7]`. Next `i=2` hits the end of the list, so the loop finishes!',
      },
      {
        line: 4,
        vars: [{ name: 'nums', targetId: 'N1' }],
        heap: [
          {
            id: 'N1',
            type: 'list',
            label: '0x500 final',
            cells: [{ val: '4' }, { val: '7' }],
            x: 240,
            y: 80,
            highlight: 'aliased',
          },
        ],
        checks: [{ expr: 'print(nums)', result: '[4, 7]  ← NOT [7]!', surprise: true }],
        explanation:
          'Final output is `[4, 7]`! Never mutate a list while looping over it directly — iterate over a copy (`for x in nums.copy():`) or build a new list with a comprehension.',
      },
    ],
    examRule:
      'When tracing `for x in lst:` with `.remove()` / `.pop()`, track an explicit hidden index `i = 0, 1, 2...` against the LIVE shifting list!',
  },
  {
    id: 'returns-none',
    title: 'In-Place Methods Return `None`',
    trapLabel: 'None Assignment Trap',
    code: [
      'a = [3, 1, 2]',
      'b = a.sort()       # Mutates a, returns None!',
      'c = a.append(4)    # Mutates a, returns None!',
      'd = sorted(a)      # Returns a NEW list!',
    ],
    steps: [
      {
        line: 0,
        vars: [{ name: 'a', targetId: 'A1' }],
        heap: [
          {
            id: 'A1',
            type: 'list',
            label: '0x600 list',
            cells: [{ val: '3' }, { val: '1' }, { val: '2' }],
            x: 240,
            y: 60,
            highlight: 'new',
          },
        ],
        checks: [{ expr: 'a', result: '[3, 1, 2]' }],
        explanation: '`a` points to a fresh list `[3, 1, 2]`.',
      },
      {
        line: 1,
        vars: [
          { name: 'a', targetId: 'A1' },
          { name: 'b', targetId: null, primitiveVal: 'None' },
        ],
        heap: [
          {
            id: 'A1',
            type: 'list',
            label: '0x600 sorted in-place',
            cells: [{ val: '1' }, { val: '2' }, { val: '3' }],
            x: 240,
            y: 60,
            highlight: 'mutated',
          },
        ],
        checks: [
          { expr: 'a', result: '[1, 2, 3]' },
          { expr: 'b', result: 'None  ← NOT [1, 2, 3]!', surprise: true },
        ],
        explanation:
          '`a.sort()` sorts `0x600` IN-PLACE and returns `None`! Doing `a = a.sort()` wipes out your variable `a` to `None`!',
      },
      {
        line: 2,
        vars: [
          { name: 'a', targetId: 'A1' },
          { name: 'b', targetId: null, primitiveVal: 'None' },
          { name: 'c', targetId: null, primitiveVal: 'None' },
        ],
        heap: [
          {
            id: 'A1',
            type: 'list',
            label: '0x600 mutated',
            cells: [{ val: '1' }, { val: '2' }, { val: '3' }, { val: '4' }],
            x: 240,
            y: 60,
            highlight: 'mutated',
          },
        ],
        checks: [
          { expr: 'b is c', result: 'True (both are None!)', surprise: true },
          { expr: 'a', result: '[1, 2, 3, 4]' },
        ],
        explanation:
          '`a.append(4)` also returns `None`! Only `.pop()` returns the removed element; `.append`, `.extend`, `.insert`, `.remove`, `.sort`, `.reverse` ALL return `None`.',
      },
      {
        line: 3,
        vars: [
          { name: 'a', targetId: 'A1' },
          { name: 'b', targetId: null, primitiveVal: 'None' },
          { name: 'c', targetId: null, primitiveVal: 'None' },
          { name: 'd', targetId: 'D1' },
        ],
        heap: [
          {
            id: 'A1',
            type: 'list',
            label: '0x600 list',
            cells: [{ val: '1' }, { val: '2' }, { val: '3' }, { val: '4' }],
            x: 240,
            y: 50,
          },
          {
            id: 'D1',
            type: 'list',
            label: '0x601 NEW list',
            cells: [{ val: '1' }, { val: '2' }, { val: '3' }, { val: '4' }],
            x: 240,
            y: 155,
            highlight: 'new',
          },
        ],
        checks: [
          { expr: 'd == a', result: 'True (same contents)' },
          { expr: 'd is a', result: 'False (different heap objects!)' },
        ],
        explanation:
          '`sorted(a)` always allocates and returns a brand-new list (`0x601`), leaving `a` untouched.',
      },
    ],
    examRule:
      'In CS1010A exams, `lst = lst.append(x)` or `return lst.reverse()` is a guaranteed `None` bug! Use `sorted(lst)` or `lst[::-1]` if you need a return value.',
  },
  {
    id: 'rebind-vs-mutate',
    title: 'Function Frame: `lst = lst + [4]` vs `lst += [4]`',
    trapLabel: 'Rebinding vs In-Place',
    code: [
      'def f(xs): xs = xs + [4]   # Rebinds LOCAL xs to NEW list',
      'def g(xs): xs += [4]       # Calls xs.extend([4]) IN-PLACE!',
      'a = [1, 2]',
      'f(a)                       # Does a change?',
      'g(a)                       # Does a change?',
    ],
    steps: [
      {
        line: 2,
        vars: [{ name: 'a', targetId: 'X1', frame: 'Global' }],
        heap: [
          {
            id: 'X1',
            type: 'list',
            label: '0x700 list',
            cells: [{ val: '1' }, { val: '2' }],
            x: 240,
            y: 70,
            highlight: 'new',
          },
        ],
        checks: [{ expr: 'a', result: '[1, 2]' }],
        explanation: 'Global variable `a` points to list `0x700`.',
      },
      {
        line: 3,
        vars: [
          { name: 'a', targetId: 'X1', frame: 'Global' },
          { name: 'xs', targetId: 'X2', frame: 'f()' },
        ],
        heap: [
          {
            id: 'X1',
            type: 'list',
            label: '0x700 (unchanged!)',
            cells: [{ val: '1' }, { val: '2' }],
            x: 240,
            y: 45,
          },
          {
            id: 'X2',
            type: 'list',
            label: '0x701 NEW list',
            cells: [{ val: '1' }, { val: '2' }, { val: '4' }],
            x: 240,
            y: 150,
            highlight: 'new',
          },
        ],
        checks: [
          { expr: 'a (after f(a))', result: '[1, 2]  (UNCHANGED!)', surprise: true },
        ],
        explanation:
          'Inside `f(a)`, `xs + [4]` creates a NEW list `0x701`, and `xs = ...` only redirects the LOCAL arrow `xs`. Global `a` still points to `0x700`!',
      },
      {
        line: 4,
        vars: [
          { name: 'a', targetId: 'X1', frame: 'Global' },
          { name: 'xs', targetId: 'X1', frame: 'g()' },
        ],
        heap: [
          {
            id: 'X1',
            type: 'list',
            label: '0x700 MUTATED!',
            cells: [{ val: '1' }, { val: '2' }, { val: '4' }],
            x: 240,
            y: 75,
            highlight: 'mutated',
          },
        ],
        checks: [
          { expr: 'a (after g(a))', result: '[1, 2, 4]  (MUTATED!)', surprise: true },
        ],
        explanation:
          'HUGE PYTHON GOTCHA! For lists, `xs += [4]` is NOT identical to `xs = xs + [4]` — `+=` mutates `0x700` in-place (like `.extend`), so global `a` changes to `[1, 2, 4]`!',
      },
    ],
    examRule:
      'For mutable lists, `+=` mutates in-place (affecting all aliases!), whereas `x = x + ...` allocates a new list and rebinds only the local name. (For immutable tuples, `+=` creates a new tuple.)',
  },
];

export const MemoryLab: React.FC<MemoryLabProps> = ({
  completedDrills,
  onCompleteDrill,
}) => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const scenario = SCENARIOS[scenarioIdx];
  const step = scenario.steps[stepIdx];

  const handleSelectScenario = (idx: number) => {
    setScenarioIdx(idx);
    setStepIdx(0);
  };

  const handleNext = () => {
    const next = Math.min(scenario.steps.length - 1, stepIdx + 1);
    setStepIdx(next);
    if (next === scenario.steps.length - 1) {
      onCompleteDrill(`mem-${scenario.id}`, 20);
    }
  };

  // Compute SVG layout coordinates for variable boxes
  const varPositions = step.vars.map((v, idx) => ({
    ...v,
    x: 22,
    y: 35 + idx * 52,
    w: 112,
    h: 34,
  }));

  const heapMap: Record<string, HeapObj & { w: number; h: number }> = {};
  step.heap.forEach((h) => {
    const cellW = 40;
    const w = Math.max(88, h.cells.length * cellW + 12);
    heapMap[h.id] = { ...h, w, h: 44 };
  });

  const svgHeight = Math.max(
    280,
    ...step.heap.map((h) => h.y + 70),
    varPositions.length * 55 + 50
  );

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SCENARIOS.map((sc, idx) => {
          const active = idx === scenarioIdx;
          const done = completedDrills.includes(`mem-${sc.id}`);
          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(idx)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    active ? 'bg-orange-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Trap {idx + 1}
                </span>
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <div className="text-xs font-bold leading-snug">{sc.title}</div>
            </button>
          );
        })}
      </div>

      {/* Main Split: Code + Box-and-Pointer SVG Diagram */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Code & Live Expression Checks */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300">{scenario.title}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {scenario.trapLabel}
              </span>
            </div>

            <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
              {scenario.code.map((line, i) => {
                const active = i === step.line;
                return (
                  <div
                    key={i}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      active
                        ? 'bg-orange-500/25 text-orange-200 border-l-2 border-orange-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 select-none mr-3">{i + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>

            {/* Stepper Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setStepIdx(0)}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <span className="text-xs font-mono text-slate-400">
                Step {stepIdx + 1} / {scenario.steps.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                  disabled={stepIdx === 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={stepIdx === scenario.steps.length - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs disabled:opacity-35 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Python Console Checks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              Live Python Evaluation at This Step
            </div>
            <div className="space-y-2">
              {step.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-xl border font-mono text-xs flex items-center justify-between gap-2 ${
                    chk.surprise
                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-slate-500">&gt;&gt;&gt; {chk.expr}</span>
                  <span>{chk.result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Rule */}
          <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 text-xs text-amber-950 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Q1 Written Exam Rule
            </div>
            {scenario.examRule}
          </div>
        </div>

        {/* Right: Interactive Box-and-Pointer SVG Canvas */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Box-and-Pointer Memory Model (Stack Frames → Heap Objects)
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> New
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Aliased
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Mutated
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200/80 overflow-x-auto p-2 flex items-center justify-center">
            <svg
              width="600"
              height={svgHeight}
              viewBox={`0 0 600 ${svgHeight}`}
              className="w-full h-auto max-w-[640px]"
            >
              <defs>
                <marker
                  id="arrow-blue"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
                </marker>
                <marker
                  id="arrow-orange"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c" />
                </marker>
              </defs>

              {/* Column headers */}
              <text x="22" y="18" fontSize="10" fontWeight="700" fill="#64748b">
                FRAMES (VARIABLES)
              </text>
              <line x1="162" y1="8" x2="162" y2={svgHeight - 10} stroke="#cbd5e1" strokeDasharray="4 4" />
              <text x="182" y="18" fontSize="10" fontWeight="700" fill="#64748b">
                HEAP MEMORY (OBJECTS &amp; REFERENCES)
              </text>

              {/* Variable -> Heap arrows */}
              {varPositions.map((v) => {
                if (!v.targetId || !heapMap[v.targetId]) return null;
                const target = heapMap[v.targetId];
                const x1 = v.x + v.w;
                const y1 = v.y + v.h / 2;
                const x2 = target.x - 4;
                const y2 = target.y + target.h / 2;
                const cx = (x1 + x2) / 2;
                return (
                  <path
                    key={`var-arrow-${v.name}-${v.frame ?? ''}`}
                    d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    markerEnd="url(#arrow-blue)"
                  />
                );
              })}

              {/* Heap cell -> Child Heap arrows */}
              {step.heap.map((obj) => {
                const parent = heapMap[obj.id];
                return obj.cells.map((cell, cIdx) => {
                  if (!cell.refId || !heapMap[cell.refId]) return null;
                  const child = heapMap[cell.refId];
                  const cellX = parent.x + 6 + cIdx * 40 + 20;
                  const cellY = parent.y + parent.h / 2;
                  const x1 = parent.x + parent.w;
                  const y1 = cellY + (cIdx - (obj.cells.length - 1) / 2) * 8;
                  const x2 = child.x - 4;
                  const y2 = child.y + child.h / 2;
                  const cx = (x1 + x2) / 2;
                  return (
                    <g key={`ref-${obj.id}-${cIdx}`}>
                      <circle cx={cellX} cy={cellY} r={3.5} fill="#ea580c" />
                      <path
                        d={`M ${cellX} ${cellY} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="1.8"
                        markerEnd="url(#arrow-orange)"
                      />
                    </g>
                  );
                });
              })}

              {/* Variable Boxes */}
              {varPositions.map((v) => (
                <g key={`var-${v.name}-${v.frame ?? ''}`}>
                  {v.frame && (
                    <text x={v.x} y={v.y - 4} fontSize="9" fontWeight="700" fill="#94a3b8">
                      {v.frame}
                    </text>
                  )}
                  <rect
                    x={v.x}
                    y={v.y}
                    width={v.w}
                    height={v.h}
                    rx={8}
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <text
                    x={v.x + 10}
                    y={v.y + 21}
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                    fill="#0f172a"
                  >
                    {v.name}
                  </text>
                  {v.targetId ? (
                    <circle cx={v.x + v.w - 12} cy={v.y + v.h / 2} r={4} fill="#2563eb" />
                  ) : (
                    <text
                      x={v.x + v.w - 8}
                      y={v.y + 21}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                      fill="#e11d48"
                    >
                      {v.primitiveVal}
                    </text>
                  )}
                </g>
              ))}

              {/* Heap Object Boxes */}
              {step.heap.map((obj) => {
                const box = heapMap[obj.id];
                let stroke = '#475569';
                let bg = '#ffffff';
                let labelColor = '#64748b';
                if (obj.highlight === 'new') {
                  stroke = '#10b981';
                  bg = '#ecfdf5';
                  labelColor = '#047857';
                } else if (obj.highlight === 'aliased') {
                  stroke = '#f59e0b';
                  bg = '#fffbeb';
                  labelColor = '#b45309';
                } else if (obj.highlight === 'mutated') {
                  stroke = '#e11d48';
                  bg = '#fff1f2';
                  labelColor = '#be123c';
                }

                return (
                  <g key={`heap-${obj.id}`}>
                    <text
                      x={box.x}
                      y={box.y - 5}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                      fill={labelColor}
                    >
                      {obj.label}
                    </text>
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.w}
                      height={box.h}
                      rx={9}
                      fill={bg}
                      stroke={stroke}
                      strokeWidth={obj.highlight && obj.highlight !== 'none' ? 2.2 : 1.5}
                    />
                    {obj.cells.map((cell, cIdx) => {
                      const cx = box.x + 6 + cIdx * 40;
                      const isIterPtr = step.iterPointerIdx === cIdx;
                      return (
                        <g key={cIdx}>
                          <rect
                            x={cx}
                            y={box.y + 6}
                            width={34}
                            height={32}
                            rx={5}
                            fill={isIterPtr ? '#ffedd5' : '#f8fafc'}
                            stroke={isIterPtr ? '#ea580c' : '#cbd5e1'}
                            strokeWidth={isIterPtr ? 2 : 1}
                          />
                          <text
                            x={cx + 17}
                            y={box.y + 54}
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="JetBrains Mono, monospace"
                            fill="#94a3b8"
                          >
                            [{cIdx}]
                          </text>
                          {!cell.refId && (
                            <text
                              x={cx + 17}
                              y={box.y + 26}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="700"
                              fontFamily="JetBrains Mono, monospace"
                              fill="#0f172a"
                            >
                              {cell.val}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Step Explanation Footer */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-orange-400 mr-1.5">What happened:</span>
            {step.explanation}
          </div>
        </div>
      </div>
    </div>
  );
};
