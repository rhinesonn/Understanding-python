import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, HelpCircle } from 'lucide-react';

interface OrderOfGrowthLabProps {
  completedDrills: string[];
  onCompleteDrill: (drillId: string, xp: number) => void;
}

interface ComplexityChallenge {
  id: string;
  title: string;
  trapTag: string;
  code: string;
  options: string[];
  correctIdx: number;
  spaceComplexity: string;
  explanation: string;
}

const CHALLENGES: ComplexityChallenge[] = [
  {
    id: 'oog-1',
    title: 'Recursive List Sum with Slicing',
    trapTag: 'Hidden O(n) Slice Trap',
    code: `def sum_list(lst):
    if not lst:
        return 0
    return lst[0] + sum_list(lst[1:])`,
    options: ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(2ⁿ)'],
    correctIdx: 2,
    spaceComplexity: 'Θ(n²)',
    explanation:
      'NOTORIOUS CS1010A EXAM TRAP! `lst[1:]` creates a brand-new sliced list of length k-1 at every call. Total work = (n-1) + (n-2) + ... + 1 = Θ(n²)! Fix it by passing an index `i` instead of slicing.',
  },
  {
    id: 'oog-2',
    title: 'Halving Loop (Dividing Input)',
    trapTag: 'Logarithmic Loop',
    code: `def count_halves(n):
    c = 0
    while n > 1:
        n = n // 2
        c += 1
    return c`,
    options: ['Θ(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n log n)'],
    correctIdx: 1,
    spaceComplexity: 'Θ(1)',
    explanation:
      'Dividing `n` by a constant factor (2) each iteration terminates after ⌊log₂(n)⌋ steps → Time Θ(log n), Space Θ(1).',
  },
  {
    id: 'oog-3',
    title: 'Dependent Triangular Nested Loop',
    trapTag: 'Arithmetic Series',
    code: `def count_pairs(n):
    total = 0
    for i in range(n):
        for j in range(i):
            total += 1
    return total`,
    options: ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(n³)'],
    correctIdx: 2,
    spaceComplexity: 'Θ(1)',
    explanation:
      'Inner loop runs 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 times. Drop constants and lower-order terms → Θ(n²).',
  },
  {
    id: 'oog-4',
    title: 'Membership Check Inside Loop (`list` vs `set`)',
    trapTag: 'Hidden Linear Scan',
    code: `def remove_dups(lst):
    res = []
    for x in lst:
        if x not in res:   # res is a list!
            res.append(x)
    return res`,
    options: ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(2ⁿ)'],
    correctIdx: 2,
    spaceComplexity: 'Θ(n)',
    explanation:
      '`x not in res` scans a Python list linearly in O(len(res)) time! Worst-case (all unique elements) takes 1 + 2 + ... + n = Θ(n²). Using a `set` or `dict` makes membership O(1) average → Θ(n)!',
  },
  {
    id: 'oog-5',
    title: 'Popping From Front of List',
    trapTag: 'Hidden Shift Cost',
    code: `def drain(lst):
    total = 0
    while lst:
        total += lst.pop(0)
    return total`,
    options: ['Θ(1)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)'],
    correctIdx: 3,
    spaceComplexity: 'Θ(1)',
    explanation:
      '`lst.pop(0)` removes the first element and must shift ALL remaining elements left by 1 → O(k) per pop! Summing over n pops gives Θ(n²). By contrast, `lst.pop()` from the end is O(1).',
  },
  {
    id: 'oog-6',
    title: 'Doubling Branch Recursion',
    trapTag: 'Binary Call Tree',
    code: `def mystery(n):
    if n <= 0:
        return 1
    return mystery(n - 1) + mystery(n - 1)`,
    options: ['Θ(n)', 'Θ(n²)', 'Θ(2ⁿ)', 'Θ(n!)'],
    correctIdx: 2,
    spaceComplexity: 'Θ(n)',
    explanation:
      'Even though both calls compute the SAME `mystery(n - 1)`, Python evaluates them separately! Each level doubles the calls → 2⁰ + 2¹ + ... + 2ⁿ = Θ(2ⁿ) time, Θ(n) stack space. Saving `half = mystery(n - 1)` reduces it to Θ(n)!',
  },
  {
    id: 'oog-7',
    title: 'Outer Halving × Inner Linear',
    trapTag: 'Geometric Series Trap!',
    code: `def halving_scan(n):
    total = 0
    while n > 0:
        for i in range(n):
            total += 1
        n //= 2
    return total`,
    options: ['Θ(log n)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)'],
    correctIdx: 1,
    spaceComplexity: 'Θ(1)',
    explanation:
      'Classic CS1010A Finals trap! Many students guess Θ(n log n), but `n` shrinks each time: n + n/2 + n/4 + n/8 + ... < 2n = Θ(n)! (Only if the inner loop always ran `orig_n` times would it be Θ(n log n).)',
  },
  {
    id: 'oog-8',
    title: 'Sort Then Binary Search Each Query',
    trapTag: 'Divide & Conquer',
    code: `def has_match(a, b):
    # len(a) == len(b) == n
    b_sorted = sorted(b)          # Timsort
    for x in a:
        if binary_search(b_sorted, x):
            return True
    return False`,
    options: ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(log n)'],
    correctIdx: 1,
    spaceComplexity: 'Θ(n)',
    explanation:
      'Sorting takes Θ(n log n). Then `n` iterations each do a Θ(log n) binary search → Θ(n log n). Total = Θ(n log n) + Θ(n log n) = Θ(n log n).',
  },
];

const CURVES = [
  { id: '1', label: 'Θ(1)', color: '#10b981', fn: () => 1 },
  { id: 'logn', label: 'Θ(log₂ n)', color: '#06b6d4', fn: (n: number) => Math.log2(n) },
  { id: 'n', label: 'Θ(n)', color: '#3b82f6', fn: (n: number) => n },
  { id: 'nlogn', label: 'Θ(n log₂ n)', color: '#8b5cf6', fn: (n: number) => n * Math.log2(n) },
  { id: 'n2', label: 'Θ(n²)', color: '#f59e0b', fn: (n: number) => n * n },
  { id: '2n', label: 'Θ(2ⁿ)', color: '#ef4444', fn: (n: number) => Math.pow(2, n) },
];

export const OrderOfGrowthLab: React.FC<OrderOfGrowthLabProps> = ({
  completedDrills,
  onCompleteDrill,
}) => {
  const [nVal, setNVal] = useState(12);
  const [logScale, setLogScale] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);

  const chartPoints = useMemo(() => {
    const svgW = 540;
    const svgH = 240;
    const padL = 42;
    const padR = 20;
    const padT = 18;
    const padB = 30;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const maxVal = logScale ? Math.log10(Math.pow(2, nVal) + 1) : Math.min(Math.pow(2, nVal), nVal * nVal * 1.4);

    return CURVES.map((c) => {
      const pts: string[] = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const xN = 1 + ((nVal - 1) * i) / steps;
        const rawY = c.fn(xN);
        const scaledY = logScale ? Math.log10(rawY + 1) : rawY;
        const clamped = Math.min(scaledY, maxVal);
        const px = padL + (i / steps) * plotW;
        const py = padT + plotH - (clamped / Math.max(maxVal, 1)) * plotH;
        pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      }
      return { ...c, polyline: pts.join(' '), valAtN: c.fn(nVal) };
    });
  }, [nVal, logScale]);

  const currentChallenge = CHALLENGES[activeIdx];
  const chosen = answers[currentChallenge.id];
  const answered = chosen !== undefined;
  const isCorrect = chosen === currentChallenge.correctIdx;

  return (
    <div className="space-y-6">
      {/* Top: Interactive Growth Visualizer */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Order of Growth Curve Comparator
              </h3>
              <p className="text-xs text-slate-500">
                Drag `n` to see how quickly `Θ(2ⁿ)` and `Θ(n²)` explode compared to `Θ(n log n)`.
              </p>
            </div>
            <button
              onClick={() => setLogScale((s) => !s)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Y-Axis: {logScale ? 'Log₁₀ Scale' : 'Linear Scale'}
            </button>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Input size n =</span>
            <input
              type="range"
              min={4}
              max={24}
              value={nVal}
              onChange={(e) => setNVal(Number(e.target.value))}
              className="flex-1 accent-orange-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-sm text-orange-600 w-8 text-right">{nVal}</span>
          </div>

          <div className="rounded-xl bg-slate-950 p-3 overflow-x-auto">
            <svg width="540" height="240" viewBox="0 0 540 240" className="w-full h-auto">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = 18 + (1 - t) * 192;
                return (
                  <line
                    key={t}
                    x1={42}
                    y1={y}
                    x2={520}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                );
              })}
              {/* Axes */}
              <line x1={42} y1={18} x2={42} y2={210} stroke="#475569" strokeWidth={1.5} />
              <line x1={42} y1={210} x2={520} y2={210} stroke="#475569" strokeWidth={1.5} />
              <text x={280} y={232} textAnchor="middle" fill="#94a3b8" fontSize="11">
                Input Size (1 → {nVal})
              </text>
              <text
                x={14}
                y={115}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                transform="rotate(-90 14 115)"
              >
                {logScale ? 'log₁₀(ops)' : 'operations'}
              </text>

              {chartPoints.map((c) => (
                <polyline
                  key={c.id}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  points={c.polyline}
                />
              ))}
            </svg>
          </div>

          {/* Live Operation Readout Pills */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {chartPoints.map((c) => (
              <div
                key={c.id}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  {c.valAtN >= 100000
                    ? c.valAtN.toExponential(1)
                    : c.valAtN >= 10
                    ? Math.round(c.valAtN).toLocaleString()
                    : c.valAtN.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hidden Python Operations Cheat Card */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Hidden Python Operation Costs (Exam Reference)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Never assume a single Python line is O(1)! These built-in operations are the #1 reason students lose complexity marks.
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="text-left px-3 py-2">Python Operation</th>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Why?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {[
                    ['lst[i], lst.append(x), lst.pop()', 'O(1)', 'Direct index / end'],
                    ['lst.pop(0), lst.insert(0, x)', 'O(n)', 'Shifts all items'],
                    ['lst[a:b] (slice of size k)', 'O(k)', 'Copies k refs'],
                    ['x in lst / lst.count(x)', 'O(n)', 'Linear scan'],
                    ['x in set_or_dict', 'O(1)*', 'Hash table lookup'],
                    ['s = s + ch (in loop)', 'O(k)', 'Strings immutable'],
                    ['sorted(lst) / lst.sort()', 'O(n log n)', 'Timsort'],
                    ['len(x)', 'O(1)', 'Stored attribute'],
                  ].map(([op, cost, why]) => (
                    <tr key={op} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-900">{op}</td>
                      <td
                        className={`px-3 py-2 font-bold ${
                          cost.includes('n') ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {cost}
                      </td>
                      <td className="px-3 py-2 font-sans text-slate-500">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Rule of Thumb:</strong> Always identify whether `n` is the <em>value</em> of an integer or the <em>length</em> of a list/string, and check whether each line inside a loop hides an O(n) copy or scan.
          </div>
        </div>
      </section>

      {/* Bottom: CS1010A Complexity Analyzer Quiz */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              CS1010A Complexity Analyzer ({activeIdx + 1} / {CHALLENGES.length})
            </h3>
            <p className="text-xs text-slate-500">
              Analyze the worst-case <strong>Time Complexity</strong> of each snippet (+25 XP per solved snippet).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CHALLENGES.map((ch, i) => {
              const solved = completedDrills.includes(ch.id);
              const active = i === activeIdx;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveIdx(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : solved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">{currentChallenge.title}</span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                {currentChallenge.trapTag}
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
              {currentChallenge.code}
            </pre>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">
                Select Worst-Case Time Complexity:
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {currentChallenge.options.map((opt, idx) => {
                  let cls = 'bg-slate-50 border-slate-200 hover:border-orange-400 text-slate-800';
                  if (answered) {
                    if (idx === currentChallenge.correctIdx) {
                      cls = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                    } else if (idx === chosen) {
                      cls = 'bg-rose-50 border-rose-500 text-rose-900';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [currentChallenge.id]: idx }));
                        if (idx === currentChallenge.correctIdx) {
                          onCompleteDrill(currentChallenge.id, 25);
                        }
                      }}
                      className={`px-4 py-3 rounded-xl border font-mono text-sm transition-all cursor-pointer ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold flex items-center gap-1.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      {isCorrect ? 'Spot on!' : `Answer: ${currentChallenge.options[currentChallenge.correctIdx]}`}
                    </span>
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-white/80">
                      Space: {currentChallenge.spaceComplexity}
                    </span>
                  </div>
                  <p>{currentChallenge.explanation}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveIdx((i) => Math.min(CHALLENGES.length - 1, i + 1))}
                disabled={activeIdx === CHALLENGES.length - 1}
                className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Next Snippet →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
