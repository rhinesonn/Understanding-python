import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

interface ExamSheetViewProps {
  onBack: () => void;
}

const SHEET_BLOCKS = [
  {
    title: '1. CS1010A Exam Rules & Syllabus Scope (L6, L11, L12)',
    body: `MIDTERM (20%): Up to L6 | 1x A4 sheet | Expr, Rec/OOG, HOF, ADT
PE (20%):      90 min, 3 Qs (Q1 Rec/Iter, Q2 Data/Files, Q3 OOP)
               Open book | GLIDE | NO NumPy/Pandas/Matplotlib/Seaborn!
FINAL (45%*):  2 hrs, 90 marks | 2x A4 double-sided sheets
               (*Progressive: absorbs Midterm to 65% if final% > mid%)
NOT TESTED:    Memoization & Dynamic Programming (L12 Slide 32)`,
  },
  {
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
    title: '6. PE Q2 Template: Pivoting, delta/mavg & Top-K Ties (L11)',
    body: `# Pivot rows into dict-of-lists:
d = {}
for k, v in rows:
    d[k] = d.get(k, []) + [v]   # or if k not in d: d[k] = []; d[k].append(v)

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

export const ExamSheetView: React.FC<ExamSheetViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="no-print flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Topics
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save A4 PDF
        </button>
      </div>

      <div className="print-only-sheet bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-xl font-extrabold text-slate-900">
            NUS CS1010A — Syllabus Exam Helpsheet (Lectures 1–12)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Midterm (1× A4) • Practical Exam (Open Book, Pure Python) • Final Exam (2× double-sided A4 sheets)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHEET_BLOCKS.map((blk) => (
            <div
              key={blk.title}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 break-inside-avoid"
            >
              <h2 className="text-xs font-bold text-slate-900 mb-2">{blk.title}</h2>
              <pre className="font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                {blk.body}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
