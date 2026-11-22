import React, { useEffect, useState } from 'react';
import {
  Zap,
  Bug,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  RotateCcw,
  Flame,
} from 'lucide-react';

interface ExamTrainerProps {
  completedDrills: string[];
  onCompleteDrill: (drillId: string, xp: number) => void;
}

interface TracingQuestion {
  id: string;
  trap: string;
  code: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const Q1_QUESTIONS: TracingQuestion[] = [
  {
    id: 'q1-1',
    trap: 'Short-Circuit Return Value',
    code: `print(0 or [] or "CS1010A" or 42)`,
    options: ['True', '"CS1010A"', '42', '0'],
    correctIdx: 1,
    explanation:
      'In Python, `or` does NOT convert to `bool`! It returns the FIRST truthy operand (or the last operand if all are falsy). `0` and `[]` are falsy, so `"CS1010A"` is returned immediately.',
  },
  {
    id: 'q1-2',
    trap: 'Mutable Inside Immutable Tuple',
    code: `t = ([1, 2], 3)
t[0].append(4)
print(t)`,
    options: [
      'TypeError (tuples are immutable)',
      '([1, 2, 4], 3)',
      '([1, 2], 3, 4)',
      '([1, 2], 3)',
    ],
    correctIdx: 1,
    explanation:
      'Classic CS1010A Finals trap! You CANNOT reassign `t[0] = ...`, but `t[0]` holds a reference to a mutable list! Mutating that list via `.append(4)` succeeds → `([1, 2, 4], 3)`.',
  },
  {
    id: 'q1-3',
    trap: 'Slicing Out of Bounds',
    code: `s = "python"
print(repr(s[10:20]), len(s[10:20]))`,
    options: [
      'IndexError',
      "'' 0",
      'None 0',
      "'n' 1",
    ],
    correctIdx: 1,
    explanation:
      'Indexing `s[10]` raises `IndexError`, BUT slicing `s[10:20]` NEVER raises an `IndexError` — it gracefully returns an empty string `""` of length `0`!',
  },
  {
    id: 'q1-4',
    trap: 'Negative Step Slicing',
    code: `xs = [10, 20, 30, 40, 50]
print(xs[3:1:-1])`,
    options: [
      '[40, 30]',
      '[40, 30, 20]',
      '[30, 20]',
      '[]',
    ],
    correctIdx: 0,
    explanation:
      'Start at index 3 (`40`), step by `-1`, stop BEFORE index 1 (`20`) → indices 3 and 2 → `[40, 30]`. Remember: stop index is ALWAYS exclusive!',
  },
  {
    id: 'q1-5',
    trap: 'Mutable Default Argument',
    code: `def add_item(x, bag=[]):
    bag.append(x)
    return bag

add_item(1)
print(add_item(2))`,
    options: ['[2]', '[1, 2]', 'None', 'Error'],
    correctIdx: 1,
    explanation:
      'Default argument objects are created ONCE at `def` time, NOT per call! Both calls share the SAME `bag` list → `[1, 2]`. Always write `bag=None` then `if bag is None: bag = []`.',
  },
  {
    id: 'q1-6',
    trap: 'UnboundLocalError Scope Trap',
    code: `x = 10
def f():
    x = x + 1
    return x
print(f())`,
    options: ['11', '10', 'UnboundLocalError', 'NameError'],
    correctIdx: 2,
    explanation:
      'Because `x = ...` appears inside `f()`, Python marks `x` as a LOCAL variable for the entire function body. Evaluating `x + 1` before local `x` is assigned triggers `UnboundLocalError`!',
  },
  {
    id: 'q1-7',
    trap: 'Late-Binding Lambda Closure',
    code: `funcs = [lambda: i for i in range(3)]
print([fn() for fn in funcs])`,
    options: ['[0, 1, 2]', '[2, 2, 2]', '[3, 3, 3]', 'NameError'],
    correctIdx: 1,
    explanation:
      'All 3 lambdas capture the VARIABLE `i` (not its value at creation time!). When the loop ends, `i == 2`, so calling each lambda returns `[2, 2, 2]`. Fix with default arg: `lambda i=i: i`.',
  },
  {
    id: 'q1-8',
    trap: 'Chained Assignment & Mutation',
    code: `a = b = [1, 2]
a = a + [3]
b.append(4)
print(a, b)`,
    options: [
      '[1, 2, 3, 4] [1, 2, 3, 4]',
      '[1, 2, 3] [1, 2, 4]',
      '[1, 2, 3] [1, 2, 3, 4]',
      '[1, 2, 4] [1, 2, 4]',
    ],
    correctIdx: 1,
    explanation:
      'Initially `a` and `b` alias `[1, 2]`. Then `a = a + [3]` creates a NEW list `[1, 2, 3]` and breaks the alias! So `b.append(4)` only mutates `[1, 2]` → `a=[1, 2, 3]`, `b=[1, 2, 4]`.',
  },
  {
    id: 'q1-9',
    trap: 'Dictionary `.get()` vs Assignment',
    code: `d = {'a': 1}
x = d.get('b', 0)
print(x, 'b' in d)`,
    options: [
      '0 True',
      '0 False',
      'None False',
      'KeyError',
    ],
    correctIdx: 1,
    explanation:
      '`d.get(key, default)` returns the default value `0` WITHOUT inserting `key` into `d`! So `x` is `0`, and `\'b\' in d` is still `False`.',
  },
  {
    id: 'q1-10',
    trap: 'Single-Element Tuple & Operator',
    code: `a = (5)
b = (5,)
print(type(a).__name__, type(b).__name__)`,
    options: [
      'tuple tuple',
      'int tuple',
      'int int',
      'SyntaxError',
    ],
    correctIdx: 1,
    explanation:
      'Parentheses around a single value `(5)` are just math grouping (`int`)! A 1-element tuple REQUIRES a trailing comma: `(5,)`.',
  },
];

interface BugHuntCase {
  id: string;
  title: string;
  context: string;
  lines: string[];
  bugLineIdx: number;
  failingInput: string;
  whyWrong: string;
  fixedLine: string;
}

const BUG_CASES: BugHuntCase[] = [
  {
    id: 'bug-1',
    title: 'PE Q2: CSV Top-K Ignoring Ties',
    context:
      'Spec: Return the top `k` students by score (highest first). If students tie with the k-th student, include ALL tied students.',
    lines: [
      'def top_k_students(records, k):',
      "    ranked = sorted(records, key=lambda r: (-r['score'], r['name']))",
      '    if len(ranked) <= k:',
      '        return ranked',
      '    return ranked[:k]',
    ],
    bugLineIdx: 4,
    failingInput: 'records with scores [95, 90, 90, 90] and k = 2',
    whyWrong:
      'Slicing `ranked[:k]` blindly chops off the 3rd and 4th students even though they ALSO scored 90 (tied with the 2nd student)!',
    fixedLine: "cutoff = ranked[k - 1]['score']; return [r for r in ranked if r['score'] >= cutoff]",
  },
  {
    id: 'bug-2',
    title: 'PE Q1: Binary Search Infinite Loop',
    context: 'Spec: Return True if target is in sorted list `arr`, else False.',
    lines: [
      'def bsearch(arr, target):',
      '    low, high = 0, len(arr) - 1',
      '    while low <= high:',
      '        mid = (low + high) // 2',
      '        if arr[mid] == target: return True',
      '        elif arr[mid] < target: low = mid',
      '        else: high = mid - 1',
      '    return False',
    ],
    bugLineIdx: 5,
    failingInput: 'bsearch([10, 20], 25) → low=0, high=1, mid=0 forever!',
    whyWrong:
      'Setting `low = mid` instead of `low = mid + 1` fails to shrink the search interval when `low == 0, high == 1` (`mid` stays `0` infinitely)!',
    fixedLine: 'elif arr[mid] < target: low = mid + 1',
  },
  {
    id: 'bug-3',
    title: 'PE Q3: OOP Shared Inventory Bug',
    context:
      'Spec: Each `Player` starts with their own independent empty backpack list.',
    lines: [
      'class Player:',
      '    def __init__(self, name, items=[]):',
      '        self.name = name',
      '        self.items = items',
      '    def pick_up(self, item):',
      '        self.items.append(item)',
    ],
    bugLineIdx: 1,
    failingInput: 'p1 = Player("A"); p2 = Player("B"); p1.pick_up("key") → p2.items == ["key"]!',
    whyWrong:
      'Every Player constructed without `items` shares the EXACT SAME default list object! Picking up an item on `p1` teleports it into `p2.items`!',
    fixedLine: 'def __init__(self, name, items=None): self.items = [] if items is None else list(items)',
  },
  {
    id: 'bug-4',
    title: 'Recursion: Flattening Nested Lists Mutating Input',
    context:
      'Spec: Return a new flattened list from nested list `xs` WITHOUT mutating `xs`.',
    lines: [
      'def flatten(xs):',
      '    res = []',
      '    for item in xs:',
      '        if isinstance(item, list):',
      '            res.append(flatten(item))',
      '        else:',
      '            res.append(item)',
      '    return res',
    ],
    bugLineIdx: 4,
    failingInput: 'flatten([1, [2, [3]]]) → returns [1, [2, [3]]] instead of [1, 2, 3]!',
    whyWrong:
      '`res.append(flatten(item))` nests the returned sublist inside `res` as a single element! You must unpack it using `res.extend(flatten(item))` (or `res += ...`).',
    fixedLine: 'res.extend(flatten(item))',
  },
];

const HELPSHEET_SECTIONS = [
  {
    id: 'hs-mut',
    title: 'Mutating (Returns None) vs Non-Mutating Methods',
    content: `MUTATES IN-PLACE (returns None!):
  lst.append(x)  | lst.extend(it) | lst.insert(i, x)
  lst.remove(x)  | lst.sort(key=) | lst.reverse()
  *Exception: lst.pop(i) mutates AND returns removed item!

RETURNS NEW OBJECT (original unchanged):
  sorted(it, key=, reverse=) | lst[:] / lst.copy() / copy.deepcopy(lst)
  s.lower() / s.strip() / s.split(sep) / sep.join(lst) / s.replace(a, b)
  d.get(k, default)  # does NOT insert k!`,
  },
  {
    id: 'hs-oog',
    title: 'Order of Growth & Hidden Python Traps',
    content: `O(1): lst[i], len(x), lst.append(x), lst.pop(), x in set/dict
O(n): lst.pop(0), lst.insert(0, x), x in lst, lst[a:b], s += ch in loop
O(n log n): sorted(lst), lst.sort(), Merge Sort

RECURRENCES:
  T(n) = T(n-1) + O(1)      → Θ(n)       (linear rec)
  T(n) = T(n-1) + O(n)      → Θ(n²)      (e.g. lst[1:] slice in rec!)
  T(n) = T(n/2) + O(1)      → Θ(log n)   (binary search)
  T(n) = 2T(n/2) + O(n)     → Θ(n log n) (merge sort)
  T(n) = 2T(n-1) + O(1)     → Θ(2ⁿ)      (naive tree rec, Space Θ(n))`,
  },
  {
    id: 'hs-pe-csv',
    title: 'PE Q2 Golden Template: CSV + Multi-Key Top-K with Ties',
    content: `import csv
def read_csv(fname):
    with open(fname, 'r', encoding='utf-8') as f:
        return list(csv.reader(f))   # header = rows[0], data = rows[1:]

# Multi-key sort: score DESC, then name ASC
ranked = sorted(items, key=lambda r: (-r['score'], r['name']))

# Top-K INCLUDING ties at k-th position:
if len(ranked) <= k:
    ans = ranked
else:
    cutoff = ranked[k - 1]['score']
    ans = [r for r in ranked if r['score'] >= cutoff]`,
  },
  {
    id: 'hs-oop',
    title: 'PE Q3 Golden Template: OOP, super() & Edge Safety',
    content: `class Parent:
    shared_attr = 0             # Class attribute (shared across instances)
    def __init__(self, name, bag=None):
        self.name = name        # Instance attribute
        self.bag = [] if bag is None else list(bag)  # NEVER bag=[]!

class Child(Parent):
    def __init__(self, name, extra):
        super().__init__(name)  # Do NOT pass self to super()!
        self.extra = extra`,
  },
  {
    id: 'hs-dp',
    title: 'Memoization & 2D DP Table Safe Template',
    content: `# Top-down Memoization:
def solve(n, memo=None):
    if memo is None: memo = {}
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = solve(n - 1, memo) + solve(n - 2, memo)
    return memo[n]

# SAFE 2D DP table (NEVER [[0]*cols]*rows!):
dp = [[0] * cols for _ in range(rows)]`,
  },
  {
    id: 'hs-triage',
    title: 'Exam Day Triage & Anti-Mistake Checklist',
    content: `WRITTEN (Midterm / Final):
  • Q1 Tracing: Draw boxes & arrows for nested lists. Track hidden index i if mutating in loop.
  • Concise Code: Draft on rough paper; avoid >2x length bloat.
  • Partial Credit: Write base cases + recurrence even if stuck!

PRACTICAL EXAM (PE):
  • Scan all 3 questions first! Bank reliable CSV (Q2) & OOP (Q3) marks early.
  • Test edge cases: [], [x], 0, negative numbers, ties, missing dict keys.
  • Never submit syntax errors — comment out broken helper if time is up.`,
  },
];

export const ExamTrainer: React.FC<ExamTrainerProps> = ({
  completedDrills,
  onCompleteDrill,
}) => {
  const [tab, setTab] = useState<'q1' | 'bugs' | 'helpsheet'>('q1');

  // Q1 Gauntlet State
  const [qIdx, setQIdx] = useState(0);
  const [qAnswers, setQAnswers] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [timedMode, setTimedMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);

  // Bug Hunt State
  const [bugIdx, setBugIdx] = useState(0);
  const [clickedLine, setClickedLine] = useState<Record<string, number>>({});

  // Helpsheet Builder State
  const [enabledSections, setEnabledSections] = useState<string[]>(
    HELPSHEET_SECTIONS.map((s) => s.id)
  );

  useEffect(() => {
    if (!timedMode || tab !== 'q1') return;
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timedMode, tab, secondsLeft]);

  const q = Q1_QUESTIONS[qIdx];
  const qChoice = qAnswers[q.id];
  const qAnswered = qChoice !== undefined;
  const qCorrect = qChoice === q.correctIdx;

  const bug = BUG_CASES[bugIdx];
  const bugGuess = clickedLine[bug.id];
  const bugSolved = bugGuess === bug.bugLineIdx;

  const handleSelectQ1Option = (optIdx: number) => {
    if (qAnswered) return;
    setQAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
    if (optIdx === q.correctIdx) {
      setStreak((s) => s + 1);
      onCompleteDrill(q.id, 30);
    } else {
      setStreak(0);
    }
  };

  const handleResetGauntlet = () => {
    setQAnswers({});
    setQIdx(0);
    setStreak(0);
    setSecondsLeft(90);
  };

  const toggleSection = (id: string) => {
    setEnabledSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/60">
          <button
            onClick={() => setTab('q1')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'q1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-orange-500" />
            Q1 Python Tracing Gauntlet
          </button>
          <button
            onClick={() => setTab('bugs')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'bugs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bug className="w-4 h-4 text-rose-500" />
            PE Bug &amp; Edge-Case Hunter
          </button>
          <button
            onClick={() => setTab('helpsheet')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'helpsheet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            A4 Helpsheet Builder
          </button>
        </div>
      </div>

      {/* TAB 1: Q1 Tracing Gauntlet */}
      {tab === 'q1' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">
                Midterm &amp; Finals Question 1 Tracing Gauntlet (+30 XP each)
              </h3>
              <p className="text-xs text-slate-500">
                Predict exact Python output — watch for `None`, `Error`, aliasing, and short-circuit return values.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Streak: {streak}
              </div>

              <button
                onClick={() => {
                  setTimedMode((t) => !t);
                  setSecondsLeft(90);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  timedMode
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {timedMode ? `Exam Sprint: ${secondsLeft}s` : 'Enable 90s Sprint'}
              </button>

              <button
                onClick={handleResetGauntlet}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Reset quiz session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Selector Strip */}
          <div className="flex flex-wrap gap-1.5">
            {Q1_QUESTIONS.map((item, i) => {
              const ans = qAnswers[item.id];
              const isRight = ans === item.correctIdx;
              const isWrong = ans !== undefined && ans !== item.correctIdx;
              const saved = completedDrills.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setQIdx(i)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    i === qIdx
                      ? 'bg-slate-900 text-white border-slate-900'
                      : isRight || saved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isWrong
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">
                  Question {qIdx + 1} of {Q1_QUESTIONS.length}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Trap: {q.trap}
                </span>
              </div>
              <pre className="p-5 rounded-2xl bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed overflow-x-auto min-h-[160px] flex items-center">
                <code>{q.code}</code>
              </pre>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2.5">
                  What does Python output?
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    let cls =
                      'bg-slate-50 border-slate-200 hover:border-orange-400 text-slate-800';
                    if (qAnswered) {
                      if (idx === q.correctIdx)
                        cls = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      else if (idx === qChoice)
                        cls = 'bg-rose-50 border-rose-500 text-rose-900';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectQ1Option(idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border font-mono text-xs sm:text-sm transition-all cursor-pointer ${cls}`}
                      >
                        <span className="text-slate-400 mr-2.5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {qAnswered && (
                  <div
                    className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
                      qCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      {qCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      {qCorrect ? 'Nailed it! (+30 XP)' : 'Classic CS1010A trap!'}
                    </div>
                    {q.explanation}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setQIdx((i) => Math.max(0, i - 1))}
                  disabled={qIdx === 0}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setQIdx((i) => Math.min(Q1_QUESTIONS.length - 1, i + 1))}
                  disabled={qIdx === Q1_QUESTIONS.length - 1}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  Next Question →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: PE Bug & Edge-Case Hunter */}
      {tab === 'bugs' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">
                Practical Exam Bug &amp; Edge-Case Hunter (+35 XP each)
              </h3>
              <p className="text-xs text-slate-500">
                Click the exact <strong>buggy line</strong> in each PE function to diagnose why hidden test cases fail!
              </p>
            </div>
            <div className="flex gap-2">
              {BUG_CASES.map((bc, i) => {
                const done = completedDrills.includes(bc.id);
                return (
                  <button
                    key={bc.id}
                    onClick={() => setBugIdx(i)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                      i === bugIdx
                        ? 'bg-slate-900 text-white border-slate-900'
                        : done
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Case {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
            <strong className="block text-sm mb-0.5">{bug.title}</strong>
            {bug.context}
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
              Click the line containing the subtle bug:
            </div>
            <div className="font-mono text-xs sm:text-sm space-y-1">
              {bug.lines.map((line, i) => {
                const isClicked = bugGuess === i;
                const isActualBug = i === bug.bugLineIdx;
                let rowCls =
                  'hover:bg-slate-800/90 text-slate-200 border border-transparent';
                if (isClicked && isActualBug) {
                  rowCls = 'bg-emerald-500/20 text-emerald-200 border border-emerald-400';
                } else if (isClicked && !isActualBug) {
                  rowCls = 'bg-rose-500/20 text-rose-200 border border-rose-400';
                }
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setClickedLine((prev) => ({ ...prev, [bug.id]: i }));
                      if (i === bug.bugLineIdx) onCompleteDrill(bug.id, 35);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center gap-3 cursor-pointer ${rowCls}`}
                  >
                    <span className="text-slate-500 select-none w-4">{i + 1}</span>
                    <span className="whitespace-pre">{line}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {bugGuess !== undefined && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                bugSolved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {bugSolved ? (
                <>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Bug Found on Line {bug.bugLineIdx + 1}! (+35 XP)
                  </div>
                  <div>
                    <strong>Failing Hidden Test Case:</strong>{' '}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      {bug.failingInput}
                    </code>
                  </div>
                  <p>{bug.whyWrong}</p>
                  <div className="pt-1">
                    <strong>Clean PE Fix:</strong>
                    <pre className="mt-1 p-2.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto">
                      {bug.fixedLine}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Line {bugGuess + 1} is fine — look closer at how edge cases or shared state behave, and click another line!
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: Interactive A4 Helpsheet Builder */}
      {tab === 'helpsheet' && (
        <section className="space-y-4">
          <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">
                CS1010A Double-Sided A4 Helpsheet Builder
              </h3>
              <p className="text-xs text-slate-500">
                Toggle the reference blocks you need for your Midterm or Final, then click Print / Save as PDF.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save A4 PDF
            </button>
          </div>

          {/* Section Toggles */}
          <div className="no-print flex flex-wrap gap-2">
            {HELPSHEET_SECTIONS.map((sec) => {
              const active = enabledSections.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  onClick={() => toggleSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-orange-50 border-orange-300 text-orange-900'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {sec.title}
                </button>
              );
            })}
          </div>

          {/* Printable Sheet Preview */}
          <div className="print-only-sheet bg-white rounded-2xl border border-slate-300 shadow-sm p-6">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-4">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                  NUS CS1010A — Programming Methodology A4 Helpsheet
                </h2>
                <p className="text-[11px] text-slate-500">
                  Python 3 Reference • Complexity • Recursion &amp; DP • PE Templates • OOP
                </p>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-600">
                {enabledSections.length} / {HELPSHEET_SECTIONS.length} modules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HELPSHEET_SECTIONS.filter((s) => enabledSections.includes(s.id)).map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-xl border border-slate-300 p-3.5 break-inside-avoid"
                >
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    {sec.title}
                  </h4>
                  <pre className="font-mono text-[11px] leading-snug text-slate-800 whitespace-pre-wrap">
                    {sec.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
