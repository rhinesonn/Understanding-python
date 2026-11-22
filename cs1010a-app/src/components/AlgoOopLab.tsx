import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Layers,
  GitFork,
  ArrowUp,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface AlgoOopLabProps {
  completedDrills: string[];
  onCompleteDrill: (drillId: string, xp: number) => void;
}

type AlgoKind = 'binary' | 'selection' | 'insertion' | 'merge';

interface AlgoStep {
  arr: number[];
  active: number[];
  sorted: number[];
  low?: number;
  mid?: number;
  high?: number;
  foundIdx?: number;
  comparisons: number;
  writes: number;
  note: string;
}

function buildBinarySearchSteps(sortedArr: number[], target: number): AlgoStep[] {
  const steps: AlgoStep[] = [];
  let low = 0;
  let high = sortedArr.length - 1;
  let cmp = 0;

  steps.push({
    arr: [...sortedArr],
    active: [],
    sorted: [],
    low,
    high,
    comparisons: 0,
    writes: 0,
    note: `Search for target = ${target} in sorted array. Initialize low = 0, high = ${high}.`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    cmp++;
    if (sortedArr[mid] === target) {
      steps.push({
        arr: [...sortedArr],
        active: [mid],
        sorted: [mid],
        low,
        mid,
        high,
        foundIdx: mid,
        comparisons: cmp,
        writes: 0,
        note: `mid = (${low} + ${high}) // 2 = ${mid}. arr[${mid}] == ${target} → FOUND in ${cmp} comparisons!`,
      });
      return steps;
    } else if (sortedArr[mid] < target) {
      steps.push({
        arr: [...sortedArr],
        active: [mid],
        sorted: [],
        low,
        mid,
        high,
        comparisons: cmp,
        writes: 0,
        note: `mid = ${mid}: arr[${mid}] = ${sortedArr[mid]} < ${target}. Discard left half → set low = mid + 1 = ${mid + 1}.`,
      });
      low = mid + 1;
    } else {
      steps.push({
        arr: [...sortedArr],
        active: [mid],
        sorted: [],
        low,
        mid,
        high,
        comparisons: cmp,
        writes: 0,
        note: `mid = ${mid}: arr[${mid}] = ${sortedArr[mid]} > ${target}. Discard right half → set high = mid - 1 = ${mid - 1}.`,
      });
      high = mid - 1;
    }
  }

  steps.push({
    arr: [...sortedArr],
    active: [],
    sorted: [],
    low,
    high,
    comparisons: cmp,
    writes: 0,
    note: `low (${low}) > high (${high}) → Search space empty! Return -1 / False (Not Found).`,
  });
  return steps;
}

function buildSelectionSortSteps(initial: number[]): AlgoStep[] {
  const arr = [...initial];
  const steps: AlgoStep[] = [];
  const sorted: number[] = [];
  let cmp = 0;
  let writes = 0;

  steps.push({
    arr: [...arr],
    active: [],
    sorted: [],
    comparisons: 0,
    writes: 0,
    note: 'Selection Sort: repeatedly scan the unsorted suffix to find the minimum element and swap it to the front.',
  });

  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      cmp++;
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
      steps.push({
        arr: [...arr],
        active: [minIdx, j],
        sorted: [...sorted],
        comparisons: cmp,
        writes,
        note: `Pass i=${i}: comparing arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}.`,
      });
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      writes += 2;
      steps.push({
        arr: [...arr],
        active: [i, minIdx],
        sorted: [...sorted, i],
        comparisons: cmp,
        writes,
        note: `Swap minimum ${arr[i]} into index ${i}. Position ${i} is now permanently sorted!`,
      });
    }
    sorted.push(i);
  }
  sorted.push(arr.length - 1);
  steps.push({
    arr: [...arr],
    active: [],
    sorted: [...sorted],
    comparisons: cmp,
    writes,
    note: `Done! Selection Sort ALWAYS performs n(n-1)/2 = ${cmp} comparisons regardless of input order (Best = Worst = Θ(n²)).`,
  });
  return steps;
}

function buildInsertionSortSteps(initial: number[]): AlgoStep[] {
  const arr = [...initial];
  const steps: AlgoStep[] = [];
  let cmp = 0;
  let writes = 0;

  steps.push({
    arr: [...arr],
    active: [0],
    sorted: [0],
    comparisons: 0,
    writes: 0,
    note: 'Insertion Sort: maintain a sorted prefix [0..i-1] and slide arr[i] left into its proper spot.',
  });

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    const prefix = Array.from({ length: i }, (_, k) => k);
    steps.push({
      arr: [...arr],
      active: [i],
      sorted: prefix,
      comparisons: cmp,
      writes,
      note: `Pick key = arr[${i}] = ${key} to insert into sorted prefix [0..${i - 1}].`,
    });

    while (j >= 0 && arr[j] > key) {
      cmp++;
      arr[j + 1] = arr[j];
      writes++;
      steps.push({
        arr: [...arr],
        active: [j, j + 1],
        sorted: prefix,
        comparisons: cmp,
        writes,
        note: `${arr[j]} > ${key}, so shift ${arr[j]} right to index ${j + 1}.`,
      });
      j--;
    }
    if (j >= 0) cmp++;
    arr[j + 1] = key;
    writes++;
    steps.push({
      arr: [...arr],
      active: [j + 1],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      comparisons: cmp,
      writes,
      note: `Place key ${key} at index ${j + 1}. Prefix [0..${i}] is now sorted!`,
    });
  }

  steps.push({
    arr: [...arr],
    active: [],
    sorted: arr.map((_, k) => k),
    comparisons: cmp,
    writes,
    note: `Sorted! On an already-sorted list, Insertion Sort only makes n-1 comparisons → Best Case Θ(n) (and it is Stable!).`,
  });
  return steps;
}

function buildMergeSortSteps(initial: number[]): AlgoStep[] {
  const arr = [...initial];
  const steps: AlgoStep[] = [];
  let cmp = 0;
  let writes = 0;

  steps.push({
    arr: [...arr],
    active: [],
    sorted: [],
    comparisons: 0,
    writes: 0,
    note: 'Merge Sort (Divide & Conquer): recursively split in half, then merge sorted halves in Θ(n) per level × log n levels = Θ(n log n).',
  });

  const mergeSort = (l: number, r: number) => {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSort(l, m);
    mergeSort(m + 1, r);

    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0;
    let j = 0;
    let k = l;

    while (i < left.length && j < right.length) {
      cmp++;
      if (left[i] <= right[j]) {
        arr[k] = left[i++];
      } else {
        arr[k] = right[j++];
      }
      writes++;
      steps.push({
        arr: [...arr],
        active: [k],
        sorted: Array.from({ length: k - l + 1 }, (_, idx) => l + idx),
        comparisons: cmp,
        writes,
        note: `Merging [${l}..${m}] & [${m + 1}..${r}]: wrote ${arr[k]} into index ${k}.`,
      });
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      writes++;
      steps.push({
        arr: [...arr],
        active: [k],
        sorted: Array.from({ length: k - l + 1 }, (_, idx) => l + idx),
        comparisons: cmp,
        writes,
        note: `Copy remaining left element ${arr[k]} into index ${k}.`,
      });
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      writes++;
      steps.push({
        arr: [...arr],
        active: [k],
        sorted: Array.from({ length: k - l + 1 }, (_, idx) => l + idx),
        comparisons: cmp,
        writes,
        note: `Copy remaining right element ${arr[k]} into index ${k}.`,
      });
      k++;
    }
  };

  mergeSort(0, arr.length - 1);
  steps.push({
    arr: [...arr],
    active: [],
    sorted: arr.map((_, idx) => idx),
    comparisons: cmp,
    writes,
    note: `Complete! Merge Sort guarantees Θ(n log n) in ALL cases (Best/Avg/Worst), is Stable, and uses Θ(n) extra space.`,
  });
  return steps;
}

// OOP Interactive Simulator Types
interface OopTrace {
  call: string;
  mroPath: ('BonusAccount' | 'SavingsAccount' | 'Account')[];
  resolvedIn: 'BonusAccount' | 'SavingsAccount' | 'Account';
  superCalls: string[];
  output: string;
  explanation: string;
}

export const AlgoOopLab: React.FC<AlgoOopLabProps> = ({
  completedDrills,
  onCompleteDrill,
}) => {
  const [tab, setTab] = useState<'algo' | 'oop'>('algo');

  // Algo Visualizer State
  const [algo, setAlgo] = useState<AlgoKind>('binary');
  const [rawArr, setRawArr] = useState<number[]>([38, 14, 52, 9, 27, 45, 19, 63]);
  const [target, setTarget] = useState<number>(45);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const sortedForBinary = useMemo(() => [...rawArr].sort((a, b) => a - b), [rawArr]);

  const algoSteps = useMemo(() => {
    if (algo === 'binary') return buildBinarySearchSteps(sortedForBinary, target);
    if (algo === 'selection') return buildSelectionSortSteps(rawArr);
    if (algo === 'insertion') return buildInsertionSortSteps(rawArr);
    return buildMergeSortSteps(rawArr);
  }, [algo, rawArr, sortedForBinary, target]);

  const safeIdx = Math.min(stepIdx, algoSteps.length - 1);
  const step = algoSteps[safeIdx];

  useEffect(() => {
    if (!playing) return;
    if (safeIdx >= algoSteps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 620);
    return () => clearTimeout(t);
  }, [playing, safeIdx, algoSteps.length]);

  const randomizeArray = () => {
    const next = Array.from({ length: 8 }, () => Math.floor(Math.random() * 65) + 8);
    // Ensure distinct values for clear visualization
    const uniq = Array.from(new Set(next));
    while (uniq.length < 8) uniq.push(Math.floor(Math.random() * 70) + 5);
    setRawArr(uniq.slice(0, 8));
    setTarget(uniq[Math.floor(Math.random() * 8)]);
    setStepIdx(0);
    setPlaying(false);
  };

  // OOP Interactive State
  const [classRate, setClassRate] = useState<number>(0.02);
  const [instRateOverride, setInstRateOverride] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(1000);
  const [bonusEarned, setBonusEarned] = useState<number>(0);
  const [oopLog, setOopLog] = useState<OopTrace[]>([
    {
      call: 'acc = BonusAccount("Alex", 1000)',
      mroPath: ['BonusAccount', 'SavingsAccount', 'Account'],
      resolvedIn: 'BonusAccount',
      superCalls: ['BonusAccount.__init__', 'SavingsAccount.__init__', 'Account.__init__'],
      output: '<BonusAccount owner="Alex" balance=1000>',
      explanation:
        '`BonusAccount.__init__` calls `super().__init__(owner, bal)` which chains up to `Account.__init__` to set `self.owner` and `self._balance`.',
    },
  ]);

  const activeTrace = oopLog[oopLog.length - 1];
  const effectiveRate = instRateOverride !== null ? instRateOverride : classRate;

  const triggerOopAction = (action: 'deposit' | 'interest' | 'withdraw' | 'shadow' | 'class_rate' | 'reset') => {
    if (action === 'reset') {
      setClassRate(0.02);
      setInstRateOverride(null);
      setBalance(1000);
      setBonusEarned(0);
      setOopLog([oopLog[0]]);
      return;
    }
    onCompleteDrill(`oop-action-${action}`, 10);

    if (action === 'deposit') {
      const nextBal = balance + 200;
      setBalance(nextBal);
      setOopLog((prev) => [
        ...prev,
        {
          call: 'acc.deposit(200)',
          mroPath: ['BonusAccount', 'SavingsAccount', 'Account'],
          resolvedIn: 'Account',
          superCalls: [],
          output: `Balance is now ${nextBal}`,
          explanation:
            'Not found in `BonusAccount` → not in `SavingsAccount` → FOUND in base class `Account`! Python binds `self` to `acc` and runs `Account.deposit(acc, 200)`.',
        },
      ]);
    } else if (action === 'interest') {
      const interest = Math.round(balance * effectiveRate);
      const bonus = 10;
      const nextBal = balance + interest + bonus;
      setBalance(nextBal);
      setBonusEarned((b) => b + bonus);
      setOopLog((prev) => [
        ...prev,
        {
          call: 'acc.add_interest()',
          mroPath: ['BonusAccount', 'SavingsAccount'],
          resolvedIn: 'BonusAccount',
          superCalls: ['super().add_interest() → SavingsAccount.add_interest'],
          output: `+${interest} interest (rate=${effectiveRate}) + ${bonus} bonus → ${nextBal}`,
          explanation:
            'Found in `BonusAccount.add_interest`, which calls `super().add_interest()` (delegating to `SavingsAccount`), and notice `self.rate` reads ' +
            (instRateOverride !== null
              ? `the SHADOWED instance attribute (${instRateOverride})!`
              : `the class attribute SavingsAccount.rate (${classRate})!`),
        },
      ]);
    } else if (action === 'withdraw') {
      const ok = balance >= 1500;
      const nextBal = ok ? balance - 1500 : balance;
      setBalance(nextBal);
      setOopLog((prev) => [
        ...prev,
        {
          call: 'acc.withdraw(1500)',
          mroPath: ['BonusAccount', 'SavingsAccount', 'Account'],
          resolvedIn: 'Account',
          superCalls: [],
          output: ok ? `Withdrew 1500 → ${nextBal}` : '"Insufficient funds"',
          explanation:
            'Resolved in `Account.withdraw`. Polymorphism lets `BonusAccount` inherit validation logic without duplicating code.',
        },
      ]);
    } else if (action === 'shadow') {
      setInstRateOverride(0.1);
      setOopLog((prev) => [
        ...prev,
        {
          call: 'acc.rate = 0.10  # Instance attribute!',
          mroPath: ['BonusAccount'],
          resolvedIn: 'BonusAccount',
          superCalls: [],
          output: `acc.rate == 0.10, SavingsAccount.rate == ${classRate}`,
          explanation:
            'CLASSIC CS1010A OOP TRAP! Assigning `acc.rate = 0.10` creates a brand-new key `"rate"` inside `acc.__dict__`, SHADOWING `SavingsAccount.rate` without modifying the class attribute for other instances!',
        },
      ]);
    } else if (action === 'class_rate') {
      setClassRate(0.05);
      setOopLog((prev) => [
        ...prev,
        {
          call: 'SavingsAccount.rate = 0.05  # Class attribute!',
          mroPath: ['SavingsAccount'],
          resolvedIn: 'SavingsAccount',
          superCalls: [],
          output:
            instRateOverride !== null
              ? `SavingsAccount.rate is 0.05, BUT acc.rate is STILL ${instRateOverride}!`
              : `Both SavingsAccount.rate and acc.rate are now 0.05!`,
          explanation:
            instRateOverride !== null
              ? 'Because `acc.__dict__` already has its own `"rate": 0.10`, Python finds it BEFORE checking the class! Changing `SavingsAccount.rate` no longer affects `acc`!'
              : 'Since `acc.__dict__` has no `"rate"` key, reading `acc.rate` falls back to `SavingsAccount.rate` (0.05)!',
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Sub-Tabs */}
      <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/60">
        <button
          onClick={() => setTab('algo')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'algo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-orange-500" />
          Binary Search &amp; Sorting Visualizer
        </button>
        <button
          onClick={() => setTab('oop')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            tab === 'oop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitFork className="w-4 h-4 text-blue-600" />
          OOP Inheritance, `super()` &amp; MRO Tracer
        </button>
      </div>

      {tab === 'algo' ? (
        <div className="space-y-6">
          {/* Algorithm Picker + Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['binary', 'Binary Search'],
                  ['selection', 'Selection Sort'],
                  ['insertion', 'Insertion Sort'],
                  ['merge', 'Merge Sort'],
                ] as [AlgoKind, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setAlgo(id);
                    setStepIdx(0);
                    setPlaying(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    algo === id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {algo === 'binary' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mr-2">
                  Target:
                  <select
                    value={target}
                    onChange={(e) => {
                      setTarget(Number(e.target.value));
                      setStepIdx(0);
                      setPlaying(false);
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 font-mono bg-slate-50"
                  >
                    {sortedForBinary.map((v) => (
                      <option key={v} value={v}>
                        {v} (in list)
                      </option>
                    ))}
                    <option value={33}>33 (missing)</option>
                  </select>
                </label>
              )}

              <button
                onClick={randomizeArray}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> New Array
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setStepIdx((i) => Math.max(0, i - 1));
                }}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (safeIdx >= algoSteps.length - 1) setStepIdx(0);
                  setPlaying((p) => !p);
                }}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {playing ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setStepIdx((i) => Math.min(algoSteps.length - 1, i + 1));
                }}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visualizer Stage */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                  Step {safeIdx + 1} / {algoSteps.length}
                </span>
                <span className="text-slate-600">
                  Comparisons: <strong className="text-slate-900">{step.comparisons}</strong>
                </span>
                {algo !== 'binary' && (
                  <span className="text-slate-600">
                    Writes: <strong className="text-slate-900">{step.writes}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-orange-500" /> Active / Mid
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Sorted / Found
                </span>
              </div>
            </div>

            {/* Bars */}
            <div className="h-56 flex items-end justify-center gap-3 sm:gap-5 px-2 pb-10 pt-4 rounded-xl bg-slate-50 border border-slate-200/80">
              {step.arr.map((val, idx) => {
                const isActive = step.active.includes(idx);
                const isSorted = step.sorted.includes(idx);
                const isOutOfRange =
                  algo === 'binary' &&
                  step.low !== undefined &&
                  step.high !== undefined &&
                  (idx < step.low || idx > step.high);

                let barColor = 'bg-blue-500';
                if (step.foundIdx === idx || isSorted) barColor = 'bg-emerald-500';
                else if (isActive) barColor = 'bg-orange-500';
                else if (isOutOfRange) barColor = 'bg-slate-300';

                const pct = Math.max(18, Math.round((val / 75) * 100));

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end h-full w-10 sm:w-14 relative"
                  >
                    <span className="text-xs font-mono font-bold text-slate-800 mb-1">{val}</span>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${barColor}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 mt-1">[{idx}]</span>

                    {/* Binary search pointers */}
                    {algo === 'binary' && (
                      <div className="absolute -bottom-8 flex gap-0.5 text-[10px] font-mono font-bold">
                        {step.low === idx && (
                          <span className="px-1 rounded bg-blue-100 text-blue-800">L</span>
                        )}
                        {step.mid === idx && (
                          <span className="px-1 rounded bg-orange-200 text-orange-900">M</span>
                        )}
                        {step.high === idx && (
                          <span className="px-1 rounded bg-purple-100 text-purple-800">H</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-100 text-xs sm:text-sm font-medium">
              <span className="text-orange-400 font-bold mr-2">Trace:</span>
              {step.note}
            </div>
          </div>

          {/* CS1010A Sorting & Searching Reference Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              CS1010A Searching &amp; Sorting Exam Comparison Table
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="text-left px-3 py-2">Algorithm</th>
                  <th className="text-left px-3 py-2">Best</th>
                  <th className="text-left px-3 py-2">Average</th>
                  <th className="text-left px-3 py-2">Worst</th>
                  <th className="text-left px-3 py-2">Space</th>
                  <th className="text-left px-3 py-2">Stable?</th>
                  <th className="text-left px-3 py-2">Exam Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {[
                  ['Binary Search', 'Θ(1)', 'Θ(log n)', 'Θ(log n)', 'Θ(1) iter', 'N/A', 'Input MUST be sorted!'],
                  ['Selection Sort', 'Θ(n²)', 'Θ(n²)', 'Θ(n²)', 'Θ(1)', 'No*', 'Min swaps (≤ n), always Θ(n²) cmps'],
                  ['Insertion Sort', 'Θ(n)', 'Θ(n²)', 'Θ(n²)', 'Θ(1)', 'Yes', 'Fastest on nearly-sorted lists!'],
                  ['Bubble Sort', 'Θ(n)*', 'Θ(n²)', 'Θ(n²)', 'Θ(1)', 'Yes', '*Only Θ(n) with early-exit flag'],
                  ['Merge Sort', 'Θ(n log n)', 'Θ(n log n)', 'Θ(n log n)', 'Θ(n)', 'Yes', 'Guaranteed Θ(n log n), extra memory'],
                  ['Quick Sort', 'Θ(n log n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(log n)', 'No', 'Worst-case if bad pivot on sorted list'],
                  ['Python Timsort', 'Θ(n)', 'Θ(n log n)', 'Θ(n log n)', 'Θ(n)', 'Yes', 'Used by sorted() and .sort()'],
                ].map((row) => (
                  <tr key={row[0]} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-sans font-bold text-slate-900">{row[0]}</td>
                    <td className="px-3 py-2 text-emerald-700">{row[1]}</td>
                    <td className="px-3 py-2 text-blue-700">{row[2]}</td>
                    <td className="px-3 py-2 text-rose-700">{row[3]}</td>
                    <td className="px-3 py-2 text-slate-600">{row[4]}</td>
                    <td className="px-3 py-2 font-sans font-semibold">{row[5]}</td>
                    <td className="px-3 py-2 font-sans text-slate-500">{row[6]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* OOP Inheritance & MRO Tracer */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Left: Class Hierarchy Code + Interactive Action Buttons */}
          <div className="xl:col-span-6 space-y-4">
            <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 text-slate-100 border border-slate-800">
              <div className="text-xs font-bold text-orange-400 mb-2">
                CS1010A-Style Class Hierarchy (PE Q3 Pattern)
              </div>
              <pre className="font-mono text-xs leading-relaxed overflow-x-auto text-slate-200">{`class Account:
    def __init__(self, owner, bal):
        self.owner = owner
        self._balance = bal
    def deposit(self, amt):
        self._balance += amt
    def withdraw(self, amt):
        if amt > self._balance: return "Insufficient funds"
        self._balance -= amt

class SavingsAccount(Account):
    rate = 0.02                 # Class attribute!
    def add_interest(self):
        self._balance += round(self._balance * self.rate)

class BonusAccount(SavingsAccount):
    def __init__(self, owner, bal):
        super().__init__(owner, bal)
        self.bonus_total = 0
    def add_interest(self):
        super().add_interest()  # Delegates to SavingsAccount!
        self._balance += 10
        self.bonus_total += 10`}</pre>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-800 mb-2.5">
                Invoke Methods &amp; Test Attribute Shadowing (+10 XP each)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'deposit', label: 'acc.deposit(200)', sub: 'Inherited from Account' },
                  { id: 'interest', label: 'acc.add_interest()', sub: 'Uses super() + self.rate' },
                  { id: 'withdraw', label: 'acc.withdraw(1500)', sub: 'Guard condition check' },
                  { id: 'shadow', label: 'acc.rate = 0.10', sub: 'SHADOWS class attr!' },
                  { id: 'class_rate', label: 'SavingsAccount.rate = 0.05', sub: 'Updates class attr' },
                  { id: 'reset', label: 'Reset Instance', sub: 'Back to initial state' },
                ].map((btn) => {
                  const done = completedDrills.includes(`oop-action-${btn.id}`);
                  return (
                    <button
                      key={btn.id}
                      onClick={() =>
                        triggerOopAction(
                          btn.id as 'deposit' | 'interest' | 'withdraw' | 'shadow' | 'class_rate' | 'reset'
                        )
                      }
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        btn.id === 'shadow'
                          ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">{btn.label}</span>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{btn.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live MRO Path Diagram & Live Object __dict__ */}
          <div className="xl:col-span-6 space-y-4">
            {/* MRO Lookup Visualizer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Method Resolution Order (MRO) Lookup Chain
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Child → Parent → Base</span>
              </div>

              <div className="space-y-2.5">
                {(['Account', 'SavingsAccount', 'BonusAccount'] as const).map((clsName, idx) => {
                  const visited = activeTrace.mroPath.includes(clsName);
                  const resolved = activeTrace.resolvedIn === clsName;
                  return (
                    <div key={clsName} className="flex flex-col items-center">
                      <div
                        className={`w-full p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                          resolved
                            ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                            : visited
                            ? 'bg-orange-50 border-orange-300'
                            : 'bg-slate-50 border-slate-200 opacity-65'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-xs font-bold text-slate-900">
                            class {clsName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {clsName === 'Account' && 'methods: __init__, deposit, withdraw'}
                            {clsName === 'SavingsAccount' && `class attr: rate = ${classRate} | add_interest`}
                            {clsName === 'BonusAccount' && 'overrides: __init__, add_interest (calls super)'}
                          </div>
                        </div>
                        {resolved && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                            HANDLED HERE
                          </span>
                        )}
                        {!resolved && visited && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-200 text-orange-900 text-[10px] font-bold">
                            CHECKED / SUPER
                          </span>
                        )}
                      </div>
                      {idx < 2 && <ArrowUp className="w-4 h-4 text-slate-400 my-0.5" />}
                    </div>
                  );
                })}
              </div>

              {/* Live Instance __dict__ */}
              <div className="mt-5 p-4 rounded-xl bg-slate-950 text-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                  <span>LIVE INSTANCE `acc.__dict__`</span>
                  <span className="font-mono text-emerald-400">
                    isinstance(acc, Account) == True
                  </span>
                </div>
                <div className="font-mono text-xs text-amber-300">
                  {'{'}
                  <span className="text-slate-200">&apos;owner&apos;: &apos;Alex&apos;, </span>
                  <span className="text-emerald-300">&apos;_balance&apos;: {balance}, </span>
                  <span className="text-blue-300">&apos;bonus_total&apos;: {bonusEarned}</span>
                  {instRateOverride !== null && (
                    <span className="text-rose-400 font-bold">
                      , &apos;rate&apos;: {instRateOverride}  # SHADOWING!
                    </span>
                  )}
                  {'}'}
                </div>
              </div>
            </div>

            {/* Active Call Explanation + Console History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <Terminal className="w-4 h-4 text-orange-500" />
                Latest Call Trace
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                <div className="font-mono font-bold">&gt;&gt;&gt; {activeTrace.call}</div>
                <div className="font-mono text-emerald-800 font-semibold">→ {activeTrace.output}</div>
                <p className="leading-relaxed pt-1">{activeTrace.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
