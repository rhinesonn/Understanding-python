import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { MicroVisualId } from '../data/topics';

/* 1. Clean Recursion vs Iteration Stepper (Lecture 3) */
const MiniRecursionDemo: React.FC = () => {
  const [mode, setMode] = useState<'rec' | 'iter'>('rec');
  const [step, setStep] = useState(0);

  const recSteps = [
    { expr: 'fact_rec(4)', stack: 1, note: 'Must wait for fact_rec(3) before multiplying by 4.' },
    { expr: '4 * fact_rec(3)', stack: 2, note: 'Deferred multiplication builds up on the call stack.' },
    { expr: '4 * (3 * fact_rec(2))', stack: 3, note: 'Stack depth grows to 3.' },
    { expr: '4 * (3 * (2 * fact_rec(1)))', stack: 4, note: 'Stack depth grows to 4.' },
    { expr: '4 * (3 * (2 * (1 * 1)))', stack: 5, note: 'Base case n == 0 returns 1! Now unwind.' },
    { expr: '4 * (3 * 2)  →  4 * 6  →  24', stack: 1, note: 'Deferred ops resolve → 24. Time O(n), Space O(n).' },
  ];

  const iterSteps = [
    { expr: 'product = 1,  counter = 1', stack: 1, note: 'All state lives in loop variables (product, counter). Nothing deferred!' },
    { expr: 'product = 1,  counter = 2', stack: 1, note: 'product *= 1 → 1. Previous state overwritten in place.' },
    { expr: 'product = 2,  counter = 3', stack: 1, note: 'product *= 2 → 2. Constant O(1) space!' },
    { expr: 'product = 6,  counter = 4', stack: 1, note: 'product *= 3 → 6.' },
    { expr: 'product = 24, counter = 5  →  return 24', stack: 1, note: 'counter > 4 terminates loop → 24. Time O(n), Space O(1).' },
  ];

  const steps = mode === 'rec' ? recSteps : iterSteps;
  const curr = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">Interactive Trace (Lecture 3)</span>
        <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-semibold">
          <button
            onClick={() => { setMode('rec'); setStep(0); }}
            className={`px-3 py-1 rounded-md cursor-pointer ${
              mode === 'rec' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Recursive Process
          </button>
          <button
            onClick={() => { setMode('iter'); setStep(0); }}
            className={`px-3 py-1 rounded-md cursor-pointer ${
              mode === 'iter' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Iterative Process
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-slate-900 px-4 py-3 font-mono text-sm text-amber-300">
        {curr.expr}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
        <p className="leading-relaxed">{curr.note}</p>
        <span className="shrink-0 font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
          Deferred depth: {curr.stack}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setStep(0)}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {step + 1} / {steps.length}
          </span>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step >= steps.length - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* 2. Clean Order-of-Growth Slider (Lecture 3) */
const MiniGrowthSlider: React.FC = () => {
  const [n, setN] = useState(10);

  const rows = [
    { label: 'Θ(1)', val: 1, color: 'bg-emerald-500' },
    { label: 'Θ(log₂ n)', val: Math.log2(n), color: 'bg-cyan-500' },
    { label: 'Θ(n)', val: n, color: 'bg-blue-500' },
    { label: 'Θ(n log₂ n)', val: n * Math.log2(n), color: 'bg-violet-500' },
    { label: 'Θ(n²)', val: n * n, color: 'bg-amber-500' },
    { label: 'Θ(2ⁿ)', val: Math.pow(2, n), color: 'bg-rose-500' },
  ];

  const maxLog = Math.log10(Math.pow(2, n) + 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-600">
          Drag <code className="font-mono">n</code> to compare operations (log-scaled bars)
        </span>
        <div className="flex items-center gap-2.5">
          <input
            type="range"
            min={2}
            max={20}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-28 accent-orange-500 cursor-pointer"
          />
          <span className="font-mono text-sm font-bold text-orange-600 w-10 text-right">
            n={n}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((r) => {
          const pct = Math.max(4, Math.round((Math.log10(r.val + 1) / Math.max(maxLog, 1)) * 100));
          const display =
            r.val >= 10000
              ? r.val.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : r.val >= 10
              ? Math.round(r.val).toString()
              : r.val.toFixed(1);
          return (
            <div key={r.label} className="grid grid-cols-12 items-center gap-2 text-xs">
              <span className="col-span-3 font-mono font-semibold text-slate-700">{r.label}</span>
              <div className="col-span-7 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${r.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="col-span-2 text-right font-mono text-slate-600">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* 3. Clean HOF Substitution Stepper (Lecture 4) */
const MiniHofStepper: React.FC = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { expr: 'compose(square, inc)(5)', note: 'Step 1: Call compose with f = square, g = inc.' },
    { expr: '(lambda x: square(inc(x)))(5)', note: 'Step 2: compose returns a closure remembering f and g.' },
    { expr: 'square(inc(5))', note: 'Step 3: Pass x = 5 into that returned lambda.' },
    { expr: 'square(6)', note: 'Step 4: Evaluate inner argument inc(5) = 6 first.' },
    { expr: '36', note: 'Step 5: square(6) evaluates to 36.' },
  ];
  const curr = steps[step];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Step-by-Step HOF Evaluation</span>
        <span className="text-xs font-mono text-slate-400">
          {step + 1} / {steps.length}
        </span>
      </div>
      <div className="rounded-lg bg-slate-900 px-4 py-3 font-mono text-sm text-amber-300">
        {curr.expr}
      </div>
      <p className="text-xs text-slate-600">{curr.note}</p>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(0)}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* 4. Clean Shallow Copy Box-and-Pointer Diagram (Lecture 7) */
const MiniMemoryDiagram: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '1. a = [[1, 2], [3, 4]]',
      note: 'Outer list 0x100 stores pointers to two inner lists (0x101 and 0x102).',
    },
    {
      title: '2. c = a.copy()  (Shallow Copy!)',
      note: 'c gets a NEW outer box (0x200), but STILL points to the SAME inner list 0x101 (c[0] is a[0] == True)!',
    },
    {
      title: '3. c[0].append(99)',
      note: 'Mutates shared inner box 0x101 → BOTH a and c now see [1, 2, 99]!',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold font-mono text-slate-800">{steps[step].title}</span>
        <span className="text-xs font-mono text-slate-400">{step + 1} / 3</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-2 overflow-x-auto">
        <svg width="540" height="165" viewBox="0 0 540 165" className="w-full h-auto max-w-[540px] mx-auto">
          <defs>
            <marker id="m-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker id="m-arr-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c" />
            </marker>
          </defs>

          <rect x="14" y="28" width="54" height="30" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
          <text x="32" y="47" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace">a</text>
          <line x1="68" y1="43" x2="124" y2="43" stroke="#2563eb" strokeWidth="2" markerEnd="url(#m-arr)" />

          <text x="130" y="21" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#64748b">0x100</text>
          <rect x="130" y="26" width="96" height="34" rx="7" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
          <rect x="136" y="31" width="38" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
          <rect x="182" y="31" width="38" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
          <circle cx="155" cy="43" r="3.5" fill="#ea580c" />
          <circle cx="201" cy="43" r="3.5" fill="#ea580c" />

          <path d="M 155 43 C 235 43, 250 40, 316 40" fill="none" stroke="#ea580c" strokeWidth="1.8" markerEnd="url(#m-arr-o)" />
          <path d="M 201 43 C 255 43, 260 120, 316 120" fill="none" stroke="#ea580c" strokeWidth="1.8" markerEnd="url(#m-arr-o)" />

          {step >= 1 && (
            <>
              <rect x="14" y="106" width="54" height="30" rx="6" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
              <text x="32" y="125" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace">c</text>
              <line x1="68" y1="121" x2="124" y2="121" stroke="#2563eb" strokeWidth="2" markerEnd="url(#m-arr)" />

              <text x="130" y="99" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#059669">0x200 (shallow)</text>
              <rect x="130" y="104" width="96" height="34" rx="7" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.8" />
              <rect x="136" y="109" width="38" height="24" rx="4" fill="#ffffff" stroke="#a7f3d0" />
              <rect x="182" y="109" width="38" height="24" rx="4" fill="#ffffff" stroke="#a7f3d0" />
              <circle cx="155" cy="121" r="3.5" fill="#ea580c" />
              <circle cx="201" cy="121" r="3.5" fill="#ea580c" />

              <path d="M 155 121 C 245 110, 260 48, 316 48" fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#m-arr-o)" />
              <path d="M 201 121 C 255 125, 275 126, 316 126" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeDasharray="4 2" markerEnd="url(#m-arr-o)" />
            </>
          )}

          <text x="324" y="19" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill={step === 2 ? '#e11d48' : step === 1 ? '#d97706' : '#64748b'}>
            {step === 2 ? '0x101 MUTATED!' : step === 1 ? '0x101 SHARED!' : '0x101'}
          </text>
          <rect
            x="324"
            y="24"
            width={step === 2 ? 154 : 106}
            height="36"
            rx="7"
            fill={step === 2 ? '#fff1f2' : step === 1 ? '#fffbeb' : '#ffffff'}
            stroke={step === 2 ? '#e11d48' : step === 1 ? '#f59e0b' : '#475569'}
            strokeWidth={step >= 1 ? 2 : 1.5}
          />
          {(step === 2 ? ['1', '2', '99'] : ['1', '2']).map((v, i) => (
            <g key={v}>
              <rect x={332 + i * 48} y="30" width="40" height="24" rx="4" fill="#ffffff" stroke="#cbd5e1" />
              <text x={352 + i * 48} y="46" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill={v === '99' ? '#e11d48' : '#0f172a'}>
                {v}
              </text>
            </g>
          ))}

          <text x="324" y="100" fontSize="10" fontFamily="JetBrains Mono, monospace" fill="#64748b">0x102</text>
          <rect x="324" y="105" width="106" height="36" rx="7" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
          {['3', '4'].map((v, i) => (
            <g key={v}>
              <rect x={332 + i * 48} y="111" width="40" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" />
              <text x={352 + i * 48} y="127" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill="#0f172a">
                {v}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-xs text-slate-600">{steps[step].note}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(0)}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep((s) => Math.min(2, s + 1))}
            disabled={step === 2}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* 5. Clean Binary Search Pointer Stepper (Lecture 7) */
const MiniBinarySearch: React.FC = () => {
  const arr = [7, 14, 21, 35, 42, 58, 70];
  const [target, setTarget] = useState(58);
  const [stepIdx, setStepIdx] = useState(0);

  const trace: { low: number; mid: number; high: number; note: string; found?: boolean }[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) {
      trace.push({ low: lo, mid, high: hi, found: true, note: `seq[${mid}] == ${target} → return True in ${trace.length + 1} check(s)!` });
      break;
    } else if (arr[mid] < target) {
      trace.push({ low: lo, mid, high: hi, note: `seq[${mid}] = ${arr[mid]} < ${target} → helper(mid + 1=${mid + 1}, high=${hi}).` });
      lo = mid + 1;
    } else {
      trace.push({ low: lo, mid, high: hi, note: `seq[${mid}] = ${arr[mid]} > ${target} → helper(low=${lo}, mid - 1=${mid - 1}).` });
      hi = mid - 1;
    }
  }
  if (trace.length === 0 || !trace[trace.length - 1].found) {
    trace.push({ low: lo, mid: -1, high: hi, note: `low (${lo}) > high (${hi}) → Not found, return False.` });
  }

  const curr = trace[Math.min(stepIdx, trace.length - 1)];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-slate-600">Interactive Non-Slicing Pointer Trace</span>
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
          Target:
          <select
            value={target}
            onChange={(e) => { setTarget(Number(e.target.value)); setStepIdx(0); }}
            className="border border-slate-200 rounded-md px-2 py-1 bg-white font-mono text-xs"
          >
            {arr.map((v) => <option key={v} value={v}>{v}</option>)}
            <option value={30}>30 (missing)</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-1 pb-5">
        {arr.map((v, i) => {
          const out = i < curr.low || i > curr.high;
          const isMid = i === curr.mid;
          return (
            <div key={v} className="relative flex flex-col items-center">
              <div
                className={`w-full py-2.5 text-center rounded-lg border font-mono text-sm font-bold transition-all ${
                  isMid && curr.found
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : isMid
                    ? 'bg-orange-500 text-white border-orange-600'
                    : out
                    ? 'bg-slate-100 text-slate-300 border-slate-200'
                    : 'bg-white text-slate-800 border-slate-300'
                }`}
              >
                {v}
              </div>
              <div className="absolute -bottom-5 flex gap-0.5 text-[10px] font-mono font-bold">
                {curr.low === i && <span className="text-blue-600">L</span>}
                {curr.mid === i && <span className="text-orange-600">M</span>}
                {curr.high === i && <span className="text-purple-600">H</span>}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600">{curr.note}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStepIdx(0)}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {Math.min(stepIdx, trace.length - 1) + 1} / {trace.length}
          </span>
          <button
            onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
            disabled={stepIdx === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStepIdx((s) => Math.min(trace.length - 1, s + 1))}
            disabled={stepIdx >= trace.length - 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* 6. Interactive Multiset 4-Representation Comparator (Lecture 8) */
const MSET_REPS = [
  {
    id: 'unordered',
    label: 'Unordered List',
    example: '[3, 1, 2, 1, 3, 1]',
    adjoin: 'O(1)',
    mult: 'O(n)',
    inter: 'O(n²)',
    constraint: 'Any element type (no ordering or hashability required).',
    how: 'adjoin simply appends; multiplicity scans linearly; intersection matches every pair.',
  },
  {
    id: 'ordered',
    label: 'Ordered List',
    example: '[1, 1, 1, 2, 3, 3]',
    adjoin: 'O(n)',
    mult: 'O(log n)',
    inter: 'O(n + m)',
    constraint: 'Elements must be comparable (<).',
    how: 'adjoin finds slot then shifts list (O(n)); multiplicity uses binary search + local scan; intersection uses 2-pointer merge.',
  },
  {
    id: 'bst',
    label: 'Binary Search Tree',
    example: '[[2, 1], [[1, 3], [], []], [[3, 2], [], []]]',
    adjoin: 'O(log n)*',
    mult: 'O(log n)*',
    inter: 'O(i + j)',
    constraint: 'Comparable elements; *assumes BALANCED tree (unbalanced degrades to O(n)).',
    how: 'Stores [x, count] per node; intersection traverses in-order (left → entry → right) and merges i & j unique keys.',
  },
  {
    id: 'dict',
    label: 'Dictionary',
    example: '{1: 3, 2: 1, 3: 2}',
    adjoin: 'O(1)',
    mult: 'O(1)',
    inter: 'O(i)',
    constraint: 'Elements must be immutable/hashable (no lists as keys).',
    how: 'Maps element → count; adjoin & multiplicity are O(1) hash lookups; intersection scans i unique keys of s1.',
  },
] as const;

const MiniMsetComparison: React.FC = () => {
  const [selected, setSelected] = useState(3);
  const rep = MSET_REPS[selected];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">
          Multiset Representations for {'{1, 1, 1, 2, 3, 3}'} (Lecture 8)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {MSET_REPS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelected(idx)}
            className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              selected === idx
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-slate-900 px-3.5 py-2.5 font-mono text-xs text-amber-300 overflow-x-auto">
        {rep.example}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-white border border-slate-200">
          <div className="text-[10px] font-mono text-slate-400">adjoin_mset</div>
          <div className="font-mono text-sm font-bold text-slate-900">{rep.adjoin}</div>
        </div>
        <div className="p-2 rounded-lg bg-white border border-slate-200">
          <div className="text-[10px] font-mono text-slate-400">multiplicity_of</div>
          <div className="font-mono text-sm font-bold text-slate-900">{rep.mult}</div>
        </div>
        <div className="p-2 rounded-lg bg-white border border-slate-200">
          <div className="text-[10px] font-mono text-slate-400">intersection_of</div>
          <div className="font-mono text-sm font-bold text-slate-900">{rep.inter}</div>
        </div>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p><strong>How it works:</strong> {rep.how}</p>
        <p><strong>Constraint:</strong> {rep.constraint}</p>
      </div>
    </div>
  );
};

/* 7. Lecture 9 Diamond MRO Interactive Explorer (SingingArrogantLecturer) */
const MiniOopDemo: React.FC = () => {
  const [singerInheritsSpeaker, setSingerInheritsSpeaker] = useState(true);
  const [arrogantFirst, setArrogantFirst] = useState(true);

  const header = arrogantFirst
    ? 'class SingingArrogantLecturer(ArrogantLecturer, Singer)'
    : 'class SingingArrogantLecturer(Singer, ArrogantLecturer)';

  const mro = singerInheritsSpeaker
    ? arrogantFirst
      ? ['SAL', 'ArrogantLecturer', 'Lecturer', 'Singer', 'Speaker', 'object']
      : ['SAL', 'Singer', 'ArrogantLecturer', 'Lecturer', 'Speaker', 'object']
    : arrogantFirst
    ? ['SAL', 'ArrogantLecturer', 'Lecturer', 'Speaker', 'Singer', 'object']
    : ['SAL', 'Singer', 'ArrogantLecturer', 'Lecturer', 'Speaker', 'object'];

  let output = '';
  let explanation = '';
  if (singerInheritsSpeaker && arrogantFirst) {
    output = '"tra-la-la -- Python is cool ... How cool is that?"';
    explanation =
      'Diamond MRO! Because Singer inherits from Speaker, Singer MUST appear before Speaker. ArrogantLecturer\'s super().say() calls Singer.say(), which calls Speaker.say()!';
  } else if (singerInheritsSpeaker && !arrogantFirst) {
    output = '"tra-la-la -- Python is cool ... How cool is that?"';
    explanation =
      'Singer runs first ("tra-la-la -- " + super().say()), delegating to ArrogantLecturer.say(), which calls Speaker.say() and appends " ... How cool is that?".';
  } else if (!singerInheritsSpeaker && arrogantFirst) {
    output = '"Python is cool ... How cool is that?"';
    explanation =
      'No diamond: Speaker comes BEFORE Singer in the MRO! Speaker.say() returns directly without calling super(), so Singer.say() is NEVER reached!';
  } else {
    output = '"tra-la-la -- Python is cool ... How cool is that?"';
    explanation =
      'Singer is first in the MRO and calls super().say(), which jumps to ArrogantLecturer.say() → Speaker.say().';
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">
          Interactive Diamond MRO Explorer (Lecture 9)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setArrogantFirst((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-500 font-mono text-xs font-semibold cursor-pointer"
        >
          Swap parents: {arrogantFirst ? '(ArrogantLecturer, Singer)' : '(Singer, ArrogantLecturer)'}
        </button>
        <button
          onClick={() => setSingerInheritsSpeaker((v) => !v)}
          className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold cursor-pointer ${
            singerInheritsSpeaker
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-white border-slate-300 text-slate-700'
          }`}
        >
          Singer base: {singerInheritsSpeaker ? 'class Singer(Speaker) [Diamond]' : 'class Singer(object)'}
        </button>
      </div>

      <div className="rounded-lg bg-slate-900 px-3.5 py-2.5 font-mono text-xs space-y-1.5 overflow-x-auto">
        <div className="text-slate-400">{header}</div>
        <div className="text-cyan-300">MRO: {mro.join(' → ')}</div>
        <div className="text-emerald-300">sal.say("Python is cool") → {output}</div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{explanation}</p>
    </div>
  );
};

/* 8. Lecture 10 try / except / else / finally Flow Visualizer */
const EXCEPTION_CASES = [
  {
    id: 'ok',
    call: 'divide_test(2, 1)',
    ran: ['try', 'else', 'finally'] as string[],
    crashed: false,
    out: 'result is 2.0\nexecuting finally clause',
    note: 'No exception occurred: `except` is skipped, `else` runs, and `finally` runs.',
  },
  {
    id: 'zero',
    call: 'divide_test(2, 0)',
    ran: ['try', 'except', 'finally'] as string[],
    crashed: false,
    out: 'division by zero!\nexecuting finally clause',
    note: '`ZeroDivisionError` is caught by `except`: `else` is SKIPPED, and `finally` runs.',
  },
  {
    id: 'type',
    call: 'divide_test("2", "1")',
    ran: ['try', 'finally', 'raise'] as string[],
    crashed: true,
    out: 'executing finally clause\nTypeError: unsupported operand type(s) for /: \'str\' and \'str\'',
    note: '`TypeError` is NOT caught! Python STILL runs `finally` FIRST, then propagates `TypeError`!',
  },
];

const MiniExceptionFlow: React.FC = () => {
  const [caseIdx, setCaseIdx] = useState(2);
  const c = EXCEPTION_CASES[caseIdx];

  const blocks = [
    { id: 'try', label: 'try: x / y' },
    { id: 'except', label: 'except ZeroDivisionError' },
    { id: 'else', label: 'else: print(result)' },
    { id: 'finally', label: 'finally: print(...)' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">
          Interactive Clause Flow (Lecture 10 `divide_test`)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {EXCEPTION_CASES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCaseIdx(idx)}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold border cursor-pointer ${
                caseIdx === idx
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {item.call}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {blocks.map((b) => {
          const active = c.ran.includes(b.id);
          return (
            <div
              key={b.id}
              className={`px-2.5 py-2 rounded-lg border font-mono text-[11px] font-semibold text-center transition-all ${
                active
                  ? b.id === 'finally'
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
              }`}
            >
              {b.label}
            </div>
          );
        })}
      </div>

      <div
        className={`rounded-lg px-3.5 py-2.5 font-mono text-xs whitespace-pre-wrap ${
          c.crashed ? 'bg-rose-950 text-rose-200' : 'bg-slate-900 text-emerald-300'
        }`}
      >
        {c.out}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{c.note}</p>
    </div>
  );
};

export const MicroVisual: React.FC<{ id: MicroVisualId }> = ({ id }) => {
  switch (id) {
    case 'recursion':
      return <MiniRecursionDemo />;
    case 'growth':
      return <MiniGrowthSlider />;
    case 'hof':
      return <MiniHofStepper />;
    case 'memory':
      return <MiniMemoryDiagram />;
    case 'bsearch':
      return <MiniBinarySearch />;
    case 'mset':
      return <MiniMsetComparison />;
    case 'oop':
      return <MiniOopDemo />;
    case 'exceptions':
      return <MiniExceptionFlow />;
  }
};
