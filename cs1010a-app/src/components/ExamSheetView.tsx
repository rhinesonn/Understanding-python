import React from 'react';
import { Printer } from 'lucide-react';

interface ExamSheetViewProps {
  onNavigate: (slug: string) => void;
}

const SHEET_BLOCKS = [
  {
    id: 'sheet-1',
    title: '1. CS1010A Exam Rules & Syllabus Scope (L6, L11, L12)',
    body: `MIDTERM (20%): Up to L6 | 1x A4 sheet | Expr, Rec/OOG, HOF, ADT
PE (20%):      90 min, 3 Qs (Q1 Rec/Iter, Q2 Data/Files, Q3 OOP)
               Open book | GLIDE | NO NumPy/Pandas/Matplotlib/Seaborn!
FINAL (45%*):  2 hrs, 90 marks | 2x A4 double-sided sheets
               (*Progressive: absorbs Midterm to 65% if final% > mid%)
NOT TESTED:    Memoization & Dynamic Programming (L12 Slide 32)`,
  },
  {
    id: 'sheet-2',
    title: '2. Tuple vs. List vs. Dict & Mutation Traps (L6–L8)',
    body: `MUTATES IN-PLACE (returns None!):
  lst.append(x)  | lst.extend(seq) | lst.insert(pos, x)
  lst.remove(x)  | lst.clear()     | lst.reverse() | lst.sort(key=)
  *pop(pos) mutates AND returns item. *del a[i] has NO return value!

ALIASING & +=:
  list += [x] -> mutates in-place (aliases see change!)
  list = list + [x] / tuple += (x,) -> NEW object
  lst.copy() is SHALLOW (s[2] is t[2] == True)
  Safe 2D grid: [[0] * cols for _ in range(rows)]
  Dict: k in d checks KEYS only (O(1)) | d.get(k, default)`,
  },
  {
    id: 'sheet-3',
    title: '3. Order of Growth & Lecture 7 Search/Sort Table',
    body: `1 < log n < n < n log n < n^2 < n^3 < Phi^n < 2^n
  fact_rec: O(n) T, O(n) S   | fact_iter: O(n) T, O(1) S
  fib(n):   O(Phi^n) T, O(n) S | cc(a, k): O(2^a) T, O(a) S
  fast_expt: O(log e) T & S  | tuple concat loop: O(n^2) T
  reverse_rec(tup): O(n^2) T, O(n^2) S | iter: O(n^2) T, O(n) S

SEARCHING & SORTING (L7):
  Linear Search:  O(n)       | Binary Search (no slice!): O(log n)
  Selection Sort: O(n^2) all | In-place: NO* | Stable: YES (<)
  Merge Sort:     O(n log n) | In-place: NO  | Stable: YES (<=)
  lst.sort(key=, reverse=):  In-place: YES | Stable: YES (even reverse)`,
  },
  {
    id: 'sheet-4',
    title: '4. Multiset (MSet) 4 Representations (Lecture 8)',
    body: `Implementation   | adjoin   | multiplicity | intersection
-----------------+----------+--------------+-------------
Unordered List   | O(1)     | O(n)         | O(n^2)
Ordered List (<) | O(n)     | O(log n)     | O(n + m)
BST (<, balanced)| O(log n) | O(log n)     | O(i + j)
Dict (hashable)  | O(1)     | O(1)         | O(i)
*i, j = unique items. Unbalanced BST degrades to O(n)!`,
  },
  {
    id: 'sheet-5',
    title: '5. HOF, Signal Processing & File I/O (L4 & L6)',
    body: `# fold2 unifies sum (base=0, +) & product (base=1, *):
def fold2(op, term, a, nxt, b, base):
    return base if a > b else op(term(a), fold2(op, term, nxt(a), nxt, b, base))

# Signal-Processing pipeline: Enumerate -> Filter -> Map -> Accumulate
# WARNING: built-in map/filter are ONE-TIME iterables -> wrap in tuple()!

# File I/O (EOF is '', blank line is '\\n'):
f = open('data.txt', 'r')
line = f.readline()
while line != '':
    line = f.readline()
f.close()`,
  },
  {
    id: 'sheet-6',
    title: '6. PE Q2 Template: Pivoting, delta/mavg & Top-K Ties (L11)',
    body: `# Pivot rows into dict-of-lists:
d = {}
for k, v in rows:
    if k not in d: d[k] = []
    d[k].append(v)

# delta & mavg & transpose:
delta = [s[i] - s[i-1] for i in range(1, len(s))]
mavg  = [sum(s[i:i+n])/n for i in range(len(s)-n+1)]
cols  = list(zip(*rows))

# Multi-key sort & Top-K INCLUDING ties:
ranked = sorted(rows, key=lambda r: (-r['score'], r['name']))
cutoff = ranked[min(k, len(ranked)) - 1]['score']
ans = [r for r in ranked if r['score'] >= cutoff]`,
  },
  {
    id: 'sheet-7',
    title: '7. Scoping, Default Args & OOP / Diamond MRO (L9)',
    body: `# Scoping: assigning x = ... anywhere makes x LOCAL (UnboundLocalError)!
# Mutating y[0] += 1 does NOT rebind y -> works on outer list!

class Parent:
    def __init__(self, name, items=None):   # NEVER items=[] or cart={}!
        self.name = name
        self.items = [] if items is None else list(items)

class Child(Parent):
    def __init__(self, name, extra):
        super().__init__(name)              # NEVER pass self to super()!
        self.extra = extra

# isinstance(obj, Parent) -> True | type(obj) == Parent -> False
# Diamond MRO: all subclasses' methods run BEFORE shared superclass!`,
  },
  {
    id: 'sheet-8',
    title: '8. Exception Handling Control Flow (Lecture 10)',
    body: `try:
    result = x / y
except ZeroDivisionError:       # specific handlers first
    print("div by zero")
except:                         # wildcard MUST be last!
    print("other error")
else:                           # runs ONLY if try had NO exception
    print("ok:", result)
finally:                        # ALWAYS runs (even before uncaught error!)
    print("cleanup")

class MyError(Exception):
    def __init__(self, val): self.value = val
# raise MyError(4)  ->  except MyError as e: print(e.value)`,
  },
];

export const SHEET_TOC = SHEET_BLOCKS.map((b) => ({ id: b.id, label: b.title }));

export const ExamSheetView: React.FC<ExamSheetViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Exam Guides • Printable A4 Reference
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            CS1010A Exam Helpsheet
          </h1>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save A4 PDF
        </button>
      </div>

      <div className="print-only-sheet bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            NUS CS1010A — Syllabus Exam Reference (Lectures 1–12)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Midterm (1× A4) • Practical Exam (Open Book, Pure Python) • Final Exam (2× double-sided A4 sheets)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHEET_BLOCKS.map((blk) => (
            <div
              key={blk.id}
              id={blk.id}
              className="scroll-mt-20 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 break-inside-avoid"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                {blk.title}
              </h3>
              <pre className="font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {blk.body}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <footer className="no-print pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
        <button
          onClick={() => onNavigate('exam-playbook')}
          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-left transition-all cursor-pointer"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            ← Previous
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
            Playbook: Tracing &amp; Writing Code
          </div>
        </button>
      </footer>
    </div>
  );
};
