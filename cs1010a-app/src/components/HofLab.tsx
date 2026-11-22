import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Award,
} from 'lucide-react';

interface HofLabProps {
  completedDrills: string[];
  onCompleteDrill: (drillId: string, xp: number) => void;
}

interface ReductionPreset {
  id: string;
  title: string;
  tag: string;
  setupCode: string;
  expression: string;
  steps: {
    expr: string;
    bindings: string[];
    note: string;
  }[];
  takeaway: string;
}

const HOF_PRESETS: ReductionPreset[] = [
  {
    id: 'compose',
    title: 'compose(f, g)(x)',
    tag: 'Function Returning Function',
    setupCode: `def compose(f, g):
    return lambda x: f(g(x))

square = lambda x: x * x
inc    = lambda x: x + 1`,
    expression: 'compose(square, inc)(5)',
    steps: [
      {
        expr: 'compose(square, inc)(5)',
        bindings: ['f → square', 'g → inc'],
        note: 'First evaluate `compose(square, inc)`. Notice we pass the function objects themselves (no parentheses!).',
      },
      {
        expr: '(lambda x: square(inc(x)))(5)',
        bindings: ['closure captures f=square, g=inc'],
        note: '`compose` returns a brand-new anonymous function remembering `f` and `g` in its closure.',
      },
      {
        expr: 'square(inc(5))',
        bindings: ['x → 5'],
        note: 'Now apply that returned function to `5`. Inner argument `inc(5)` evaluates first (applicative order)!',
      },
      {
        expr: 'square(6)',
        bindings: ['inc(5) → 6'],
        note: '`inc(5)` returns `6`, which is passed into `square`.',
      },
      {
        expr: '36',
        bindings: ['square(6) → 36'],
        note: 'Final value is `36`. Note that `compose(inc, square)(5)` would give `26` — order matters!',
      },
    ],
    takeaway:
      'Count your parentheses! `compose(f, g)` returns a FUNCTION, while `compose(f, g)(x)` CALLS that returned function on `x`.',
  },
  {
    id: 'curried',
    title: 'Curried Lambda Trap',
    tag: 'Midterm Favorite',
    setupCode: `# No helper defs — pure nested lambdas!
# Read left-to-right for each argument call.`,
    expression: '(lambda x: lambda y: x(y + 1))(lambda z: z * 2)(4)',
    steps: [
      {
        expr: '(lambda x: lambda y: x(y + 1))(lambda z: z * 2)(4)',
        bindings: ['outer parameter x ← (lambda z: z * 2)'],
        note: 'The leftmost lambda takes `x`. Its argument is the function `lambda z: z * 2`!',
      },
      {
        expr: '(lambda y: (lambda z: z * 2)(y + 1))(4)',
        bindings: ['x = (lambda z: z * 2)', 'next parameter y ← 4'],
        note: 'Substituting `x` leaves a lambda waiting for `y`, which immediately receives `4`.',
      },
      {
        expr: '(lambda z: z * 2)(4 + 1)',
        bindings: ['y = 4'],
        note: 'Substitute `y = 4`. Evaluate argument `4 + 1 = 5` before calling the inner lambda.',
      },
      {
        expr: '(lambda z: z * 2)(5)',
        bindings: ['z ← 5'],
        note: 'Now bind `z = 5` in `z * 2`.',
      },
      {
        expr: '10',
        bindings: ['5 * 2 → 10'],
        note: 'Done! Final result is `10`. Tracing one call-pair at a time makes nested lambdas effortless.',
      },
    ],
    takeaway:
      'Whenever you see `(lambda a: lambda b: ...)(arg1)(arg2)`, peel ONE argument at a time from left to right and substitute.',
  },
  {
    id: 'repeated',
    title: 'repeated(f, n)(x)',
    tag: 'Classic CS1010A HOF',
    setupCode: `def repeated(f, n):
    if n == 0:
        return lambda x: x
    return compose(f, repeated(f, n - 1))`,
    expression: 'repeated(inc, 3)(10)',
    steps: [
      {
        expr: 'repeated(inc, 3)(10)',
        bindings: ['f → inc', 'n → 3'],
        note: 'Expand `repeated(inc, 3)` first before `10` is ever used!',
      },
      {
        expr: 'compose(inc, compose(inc, compose(inc, lambda x: x)))(10)',
        bindings: ['base case n=0 → identity (lambda x: x)'],
        note: 'Notice why base case MUST be `lambda x: x` (identity function), NOT `0` or `1` — because `repeated` must return a function!',
      },
      {
        expr: 'inc(inc(inc((lambda x: x)(10))))',
        bindings: ['x → 10'],
        note: 'Applying the 3-times composed function to `10` nests 3 calls to `inc`.',
      },
      {
        expr: 'inc(inc(inc(10))) → inc(inc(11)) → inc(12)',
        bindings: ['evaluating inside-out'],
        note: 'Each `inc` adds 1 as the calls unwind.',
      },
      {
        expr: '13',
        bindings: ['result → 13'],
        note: 'Final answer: `13`. Bonus: what does `repeated(repeated, 2)(inc)(5)` do? Think carefully!',
      },
    ],
    takeaway:
      'Type discipline saves you on exams: if a HOF returns a function in its recursive case, its base case MUST also return a function (e.g. `lambda x: x`).',
  },
  {
    id: 'accumulate',
    title: 'accumulate(...) Abstraction',
    tag: 'SICP Higher-Order Pattern',
    setupCode: `def accumulate(combiner, base, term, a, next_fn, b):
    if a > b:
        return base
    return combiner(term(a),
                    accumulate(combiner, base, term, next_fn(a), next_fn, b))`,
    expression: 'accumulate(lambda x, y: x + y, 0, lambda k: k*k, 1, lambda k: k+1, 3)',
    steps: [
      {
        expr: 'a=1 ≤ 3 → term(1) + accumulate(..., a=2, b=3)',
        bindings: ['term(1) = 1² = 1', 'next_fn(1) = 2'],
        note: '`term` transforms each index `k` into `k²`, `next_fn` advances `k` by 1, and `combiner` sums them.',
      },
      {
        expr: '1 + (term(2) + accumulate(..., a=3, b=3))',
        bindings: ['term(2) = 2² = 4', 'next_fn(2) = 3'],
        note: 'At a=2, compute 2² = 4 and recurse with a=3.',
      },
      {
        expr: '1 + (4 + (term(3) + accumulate(..., a=4, b=3)))',
        bindings: ['term(3) = 3² = 9', 'next_fn(3) = 4'],
        note: 'At a=3, compute 3² = 9 and recurse with a=4.',
      },
      {
        expr: '1 + (4 + (9 + 0))',
        bindings: ['a=4 > b=3 → base = 0'],
        note: 'Base case returns `base = 0` (identity for addition; for multiplication use `base = 1`).',
      },
      {
        expr: '14',
        bindings: ['1 + 4 + 9 + 0 = 14'],
        note: 'One single HOF computes sums, products, factorials, or custom aggregations just by swapping arguments!',
      },
    ],
    takeaway:
      'When writing `accumulate` in exams, verify the 6 slots: `(combiner, base, term, start, next_step, end)`.',
  },
];

interface StudentRow {
  name: string;
  major: 'BZA' | 'BAIS' | 'CS';
  score: number;
  missions: number;
}

const SAMPLE_DATA: StudentRow[] = [
  { name: 'Wei Ming', major: 'BZA', score: 92, missions: 10 },
  { name: 'Priya', major: 'BAIS', score: 88, missions: 12 },
  { name: 'Aisha', major: 'BZA', score: 88, missions: 11 },
  { name: 'Darren', major: 'BZA', score: 88, missions: 12 },
  { name: 'Chloe', major: 'BAIS', score: 79, missions: 9 },
  { name: 'Hao Ran', major: 'BZA', score: 74, missions: 10 },
  { name: 'Siti', major: 'CS', score: 92, missions: 8 },
  { name: 'Jun Jie', major: 'BAIS', score: 65, missions: 7 },
];

export const HofLab: React.FC<HofLabProps> = ({
  completedDrills,
  onCompleteDrill,
}) => {
  const [presetIdx, setPresetIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  // PE CSV Pipeline state
  const [filterMode, setFilterMode] = useState<'all' | 'bza' | 'score80'>('all');
  const [primarySort, setPrimarySort] = useState<'score_desc' | 'missions_desc' | 'name_asc'>('score_desc');
  const [tieBreaker, setTieBreaker] = useState<'name_asc' | 'missions_desc' | 'none'>('name_asc');
  const [topK, setTopK] = useState<number>(4);
  const [includeTiesAtK, setIncludeTiesAtK] = useState<boolean>(true);

  const preset = HOF_PRESETS[presetIdx];
  const currentStep = preset.steps[stepIdx];

  const handleSelectPreset = (idx: number) => {
    setPresetIdx(idx);
    setStepIdx(0);
  };

  const handleStepForward = () => {
    const next = Math.min(preset.steps.length - 1, stepIdx + 1);
    setStepIdx(next);
    if (next === preset.steps.length - 1) {
      onCompleteDrill(`hof-trace-${preset.id}`, 15);
    }
  };

  const pipelineResult = useMemo(() => {
    const filtered = SAMPLE_DATA.filter((r) => {
      if (filterMode === 'bza') return r.major === 'BZA';
      if (filterMode === 'score80') return r.score >= 80;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (primarySort === 'score_desc') cmp = b.score - a.score;
      else if (primarySort === 'missions_desc') cmp = b.missions - a.missions;
      else cmp = a.name.localeCompare(b.name);

      if (cmp !== 0 || tieBreaker === 'none') return cmp;
      if (tieBreaker === 'name_asc') return a.name.localeCompare(b.name);
      return b.missions - a.missions;
    });

    let cutRows = sorted.slice(0, topK);
    let cutoffScore: number | null = null;
    if (includeTiesAtK && sorted.length > topK && primarySort !== 'name_asc') {
      const kth = sorted[topK - 1];
      cutoffScore = primarySort === 'score_desc' ? kth.score : kth.missions;
      cutRows = sorted.filter((r) =>
        primarySort === 'score_desc' ? r.score >= cutoffScore! : r.missions >= cutoffScore!
      );
    }

    // Build exact Python snippet
    const filterExpr =
      filterMode === 'all'
        ? 'rows'
        : filterMode === 'bza'
        ? "[r for r in rows if r['major'] == 'BZA']"
        : "[r for r in rows if r['score'] >= 80]";

    const keyParts: string[] = [];
    if (primarySort === 'score_desc') keyParts.push("-r['score']");
    else if (primarySort === 'missions_desc') keyParts.push("-r['missions']");
    else keyParts.push("r['name']");

    if (tieBreaker === 'name_asc' && primarySort !== 'name_asc') keyParts.push("r['name']");
    else if (tieBreaker === 'missions_desc' && primarySort !== 'missions_desc') keyParts.push("-r['missions']");

    const keyCode =
      keyParts.length === 1 ? `lambda r: ${keyParts[0]}` : `lambda r: (${keyParts.join(', ')})`;

    const primaryField = primarySort === 'missions_desc' ? 'missions' : 'score';
    const pyCode = includeTiesAtK && primarySort !== 'name_asc'
      ? `filtered = ${filterExpr}
ranked = sorted(filtered, key=${keyCode})
if len(ranked) <= ${topK}:
    top_k = ranked
else:
    cutoff = ranked[${topK - 1}]['${primaryField}']
    top_k = [r for r in ranked if r['${primaryField}'] >= cutoff]`
      : `filtered = ${filterExpr}
ranked = sorted(filtered, key=${keyCode})
top_k = ranked[:${topK}]`;

    return { filteredCount: filtered.length, sorted, cutRows, cutoffScore, pyCode };
  }, [filterMode, primarySort, tieBreaker, topK, includeTiesAtK]);

  return (
    <div className="space-y-6">
      {/* Section A: Interactive HOF Substitution Stepper */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Higher-Order Function Substitution Stepper
            </h3>
            <p className="text-xs text-slate-500">
              Step through CS1010A&apos;s trickiest HOF &amp; lambda expressions (+15 XP per completed trace).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {HOF_PRESETS.map((p, idx) => {
              const solved = completedDrills.includes(`hof-trace-${p.id}`);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    idx === presetIdx
                      ? 'bg-slate-900 text-white border-slate-900'
                      : solved
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {p.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Setup definitions */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Definitions</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                {preset.tag}
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto">
              {preset.setupCode}
            </pre>
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 leading-relaxed">
              <strong>Exam Takeaway:</strong> {preset.takeaway}
            </div>
          </div>

          {/* Interactive Step-by-Step Reduction */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div>
              {/* Progress Dots */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-slate-500">
                  Reduction Step {stepIdx + 1} / {preset.steps.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {preset.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStepIdx(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === stepIdx
                          ? 'w-7 bg-orange-500'
                          : i < stepIdx
                          ? 'w-2.5 bg-emerald-500'
                          : 'w-2.5 bg-slate-300'
                      }`}
                      aria-label={`Go to step ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Expression Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Current Expression
                </div>
                <div className="font-mono text-sm sm:text-base text-amber-300 break-words leading-relaxed">
                  {currentStep.expr}
                </div>
              </div>

              {/* Active Bindings */}
              <div className="mt-3 flex flex-wrap gap-2">
                {currentStep.bindings.map((b, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs text-blue-700 font-semibold"
                  >
                    {b}
                  </span>
                ))}
              </div>

              {/* Explanation */}
              <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                {currentStep.note}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setStepIdx(0)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                  disabled={stepIdx === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <button
                  onClick={handleStepForward}
                  disabled={stepIdx === preset.steps.length - 1}
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Next Reduction
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: PE CSV Multi-Key Sorting & Top-K Tie-Breaking Playground */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Practical Exam (PE) Pipeline: `sorted(..., key=lambda)` &amp; Top-K Ties
            </h3>
            <p className="text-xs text-slate-500">
              CS1010A PE Question 2 almost always asks for multi-key tuple sorting and Top-K selection with tie handling. Experiment live below!
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Award className="w-3.5 h-3.5" /> PE Q2 Must-Know
          </span>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <label className="block p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Filter Rows
            </span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as 'all' | 'bza' | 'score80')}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
            >
              <option value="all">All Students (8)</option>
              <option value="bza">Major == &apos;BZA&apos;</option>
              <option value="score80">Score &gt;= 80</option>
            </select>
          </label>

          <label className="block p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              2. Primary Sort Key
            </span>
            <select
              value={primarySort}
              onChange={(e) =>
                setPrimarySort(e.target.value as 'score_desc' | 'missions_desc' | 'name_asc')
              }
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
            >
              <option value="score_desc">Score Descending (-score)</option>
              <option value="missions_desc">Missions Descending (-missions)</option>
              <option value="name_asc">Name A → Z (name)</option>
            </select>
          </label>

          <label className="block p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              3. Tie-Breaker Key
            </span>
            <select
              value={tieBreaker}
              onChange={(e) =>
                setTieBreaker(e.target.value as 'name_asc' | 'missions_desc' | 'none')
              }
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
            >
              <option value="name_asc">Name A → Z (ascending)</option>
              <option value="missions_desc">Missions Descending</option>
              <option value="none">None (keep original order)</option>
            </select>
          </label>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>4. Top-K Cutoff</span>
              <span className="font-mono text-orange-600 text-xs">K = {topK}</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-orange-500 my-1 cursor-pointer"
            />
            <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTiesAtK}
                onChange={(e) => setIncludeTiesAtK(e.target.checked)}
                className="accent-orange-500"
              />
              Include ties at K-th place
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Generated Idiomatic Python */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" />
                Generated Idiomatic Python (PE Template)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Negative trick for desc + asc!
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto">
              {pipelineResult.pyCode}
            </pre>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Pro Tip:</strong> To sort descending by a number AND ascending by a string in ONE pass, negate the number inside a tuple key: <code>key=lambda r: (-r[&apos;score&apos;], r[&apos;name&apos;])</code>!
            </div>
          </div>

          {/* Live Output Table */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Output `top_k` ({pipelineResult.cutRows.length} rows returned out of {pipelineResult.filteredCount} filtered)
              </span>
              {pipelineResult.cutRows.length > topK && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Tie expanded list beyond K={topK}!
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="text-left px-3 py-2">#</th>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Major</th>
                    <th className="text-right px-3 py-2">Score</th>
                    <th className="text-right px-3 py-2">Missions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pipelineResult.cutRows.map((row, i) => {
                    const isTieExtended = i >= topK;
                    return (
                      <tr
                        key={row.name}
                        className={isTieExtended ? 'bg-amber-50/80' : 'bg-white'}
                      >
                        <td className="px-3 py-2 font-mono text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">
                          {row.name}
                          {isTieExtended && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                              TIE
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">{row.major}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">
                          {row.score}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {row.missions}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
