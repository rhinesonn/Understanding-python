import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Sparkles,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';

interface RecursionLabProps {
  completedDrills: string[];
  onCompleteDrill: (drillId: string, xp: number) => void;
}

type Mode = 'fact_rec' | 'fact_iter' | 'fib_tree' | 'fib_memo';

interface TreeNode {
  id: number;
  label: string;
  arg: number;
  parentId: number | null;
  childrenIds: number[];
  depth: number;
  x: number;
  y: number;
}

interface ExecStep {
  stepNum: number;
  activeNodeId: number | null;
  visitedIds: number[];
  completedValues: Record<number, number>;
  cacheHitIds: number[];
  callStack: string[];
  deferredExpr: string;
  memoSnapshot: Record<number, number>;
  explanation: string;
  highlightLine: number;
}

const MODE_INFO: Record<
  Mode,
  {
    name: string;
    badge: string;
    time: string;
    space: string;
    processType: string;
    minN: number;
    maxN: number;
    defaultN: number;
    code: string[];
    examNote: string;
  }
> = {
  fact_rec: {
    name: 'fact_rec(n) — Linear Recursive Process',
    badge: 'Deferred Operations',
    time: 'Θ(n)',
    space: 'Θ(n)',
    processType: 'Recursive Process',
    minN: 1,
    maxN: 6,
    defaultN: 4,
    code: [
      'def fact_rec(n):',
      '    if n == 0:',
      '        return 1',
      '    return n * fact_rec(n - 1)  # deferred multiply!',
    ],
    examNote:
      'Notice how multiplication `n * ...` CANNOT execute until the recursive call returns. This builds a chain of deferred operations of length n → Space Θ(n).',
  },
  fact_iter: {
    name: 'fact_iter(n) — Iterative Process (Accumulator)',
    badge: 'Constant State',
    time: 'Θ(n)',
    space: 'Θ(1) process*',
    processType: 'Iterative Process',
    minN: 1,
    maxN: 6,
    defaultN: 4,
    code: [
      'def fact_iter(n, acc=1):',
      '    if n == 0:',
      '        return acc',
      '    return fact_iter(n - 1, n * acc)  # tail call',
    ],
    examNote:
      'All state is carried in `(n, acc)` with ZERO deferred work! In CS1010A theory this is an Iterative Process (Θ(1) state). *Caveat: Python lacks tail-call optimization, so use a `while` loop for true O(1) call-stack frames in Python.',
  },
  fib_tree: {
    name: 'fib(n) — Naive Tree Recursion',
    badge: 'Redundant Calls',
    time: 'Θ(φⁿ) ≈ O(2ⁿ)',
    space: 'Θ(n)',
    processType: 'Tree Recursive',
    minN: 2,
    maxN: 6,
    defaultN: 5,
    code: [
      'def fib(n):',
      '    if n <= 1:',
      '        return n',
      '    return fib(n - 1) + fib(n - 2)',
    ],
    examNote:
      'Classic CS1010A Midterm/Final question: Time is exponential Θ(φⁿ), NOT space! Space is only the maximum tree depth = Θ(n) because Python evaluates `fib(n-1)` completely before starting `fib(n-2)`.',
  },
  fib_memo: {
    name: 'fib_memo(n) — Top-Down Memoization (DP)',
    badge: 'Cache Hits',
    time: 'Θ(n)',
    space: 'Θ(n)',
    processType: 'Memoized DP',
    minN: 2,
    maxN: 6,
    defaultN: 5,
    code: [
      'def fib_memo(n, memo={}):',
      '    if n in memo: return memo[n]  # O(1) hit!',
      '    if n <= 1: return n',
      '    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)',
      '    return memo[n]',
    ],
    examNote:
      'Each subproblem `fib(0)..fib(n)` is computed at most ONCE! Every repeated call becomes an O(1) dictionary lookup (green nodes), collapsing exponential time to Θ(n).',
  },
};

function generateSimulation(mode: Mode, n: number): {
  nodes: TreeNode[];
  steps: ExecStep[];
  totalCalls: number;
  maxStack: number;
  redundantCalls: number;
} {
  const nodes: TreeNode[] = [];
  const steps: ExecStep[] = [];
  let nextId = 0;

  if (mode === 'fact_rec') {
    const stack: string[] = [];
    const visited: number[] = [];
    const completed: Record<number, number> = {};
    const deferredParts: number[] = [];

    const buildDeferred = (currentArg: number | null, resolvedVal: number | null) => {
      if (deferredParts.length === 0) {
        return resolvedVal !== null ? `${resolvedVal}` : `fact_rec(${currentArg})`;
      }
      const prefix = deferredParts.map((v) => `${v} * (`).join('');
      const suffix = ')'.repeat(deferredParts.length);
      const inner = resolvedVal !== null ? `${resolvedVal}` : `fact_rec(${currentArg})`;
      return `${prefix}${inner}${suffix}`;
    };

    const run = (k: number, parentId: number | null, depth: number): number => {
      const id = nextId++;
      nodes.push({
        id,
        label: `fact(${k})`,
        arg: k,
        parentId,
        childrenIds: [],
        depth,
        x: 0,
        y: 0,
      });
      if (parentId !== null) nodes[parentId].childrenIds.push(id);

      stack.push(`fact_rec(${k})`);
      visited.push(id);
      steps.push({
        stepNum: steps.length + 1,
        activeNodeId: id,
        visitedIds: [...visited],
        completedValues: { ...completed },
        cacheHitIds: [],
        callStack: [...stack],
        deferredExpr: buildDeferred(k, null),
        memoSnapshot: {},
        explanation:
          k === 0
            ? 'Reached base case n == 0! No more recursive calls needed.'
            : `Call fact_rec(${k}). Since ${k} != 0, we must wait for fact_rec(${k - 1}) before multiplying by ${k}.`,
        highlightLine: k === 0 ? 1 : 3,
      });

      if (k === 0) {
        completed[id] = 1;
        steps.push({
          stepNum: steps.length + 1,
          activeNodeId: id,
          visitedIds: [...visited],
          completedValues: { ...completed },
          cacheHitIds: [],
          callStack: [...stack],
          deferredExpr: buildDeferred(null, 1),
          memoSnapshot: {},
          explanation: 'Base case returns 1. Now the call stack begins unwinding deferred multiplications!',
          highlightLine: 2,
        });
        stack.pop();
        return 1;
      }

      deferredParts.push(k);
      const sub = run(k - 1, id, depth + 1);
      deferredParts.pop();
      const res = k * sub;
      completed[id] = res;
      steps.push({
        stepNum: steps.length + 1,
        activeNodeId: id,
        visitedIds: [...visited],
        completedValues: { ...completed },
        cacheHitIds: [],
        callStack: [...stack],
        deferredExpr: buildDeferred(null, res),
        memoSnapshot: {},
        explanation: `Unwinding frame fact_rec(${k}): resolves deferred ${k} * ${sub} = ${res}.`,
        highlightLine: 3,
      });
      stack.pop();
      return res;
    };

    run(n, null, 0);
  } else if (mode === 'fact_iter') {
    const visited: number[] = [];
    const completed: Record<number, number> = {};
    let parentId: number | null = null;
    let k = n;
    let acc = 1;
    let depth = 0;

    while (true) {
      const id = nextId++;
      nodes.push({
        id,
        label: `(${k}, ${acc})`,
        arg: k,
        parentId,
        childrenIds: [],
        depth,
        x: 0,
        y: 0,
      });
      if (parentId !== null) nodes[parentId].childrenIds.push(id);
      visited.push(id);

      if (k === 0) {
        completed[id] = acc;
        steps.push({
          stepNum: steps.length + 1,
          activeNodeId: id,
          visitedIds: [...visited],
          completedValues: { ...completed },
          cacheHitIds: [],
          callStack: [`state: n=${k}, acc=${acc}`],
          deferredExpr: `fact_iter(0, ${acc})  →  ${acc}`,
          memoSnapshot: {},
          explanation: `Base case n == 0 reached! Return accumulator acc = ${acc} immediately — ZERO unwinding needed.`,
          highlightLine: 2,
        });
        break;
      } else {
        steps.push({
          stepNum: steps.length + 1,
          activeNodeId: id,
          visitedIds: [...visited],
          completedValues: { ...completed },
          cacheHitIds: [],
          callStack: [`state: n=${k}, acc=${acc}`],
          deferredExpr: `fact_iter(${k}, ${acc})  →  fact_iter(${k - 1}, ${k * acc})`,
          memoSnapshot: {},
          explanation: `Update state variables directly: next n = ${k - 1}, next acc = ${k} * ${acc} = ${k * acc}. Nothing deferred!`,
          highlightLine: 3,
        });
        completed[id] = k * acc;
        parentId = id;
        acc = k * acc;
        k = k - 1;
        depth++;
      }
    }
  } else {
    // fib_tree or fib_memo
    const isMemo = mode === 'fib_memo';
    const stack: string[] = [];
    const visited: number[] = [];
    const completed: Record<number, number> = {};
    const cacheHits: number[] = [];
    const memo: Record<number, number> = {};

    const runFib = (k: number, parentId: number | null, depth: number): number => {
      const id = nextId++;
      nodes.push({
        id,
        label: `fib(${k})`,
        arg: k,
        parentId,
        childrenIds: [],
        depth,
        x: 0,
        y: 0,
      });
      if (parentId !== null) nodes[parentId].childrenIds.push(id);

      stack.push(`fib(${k})`);
      visited.push(id);

      if (isMemo && memo[k] !== undefined) {
        cacheHits.push(id);
        completed[id] = memo[k];
        steps.push({
          stepNum: steps.length + 1,
          activeNodeId: id,
          visitedIds: [...visited],
          completedValues: { ...completed },
          cacheHitIds: [...cacheHits],
          callStack: [...stack],
          deferredExpr: `memo[${k}] = ${memo[k]}  (O(1) Cache Hit!)`,
          memoSnapshot: { ...memo },
          explanation: `CACHE HIT! fib(${k}) is already in memo with value ${memo[k]}. Entire subtree pruned!`,
          highlightLine: 1,
        });
        stack.pop();
        return memo[k];
      }

      steps.push({
        stepNum: steps.length + 1,
        activeNodeId: id,
        visitedIds: [...visited],
        completedValues: { ...completed },
        cacheHitIds: [...cacheHits],
        callStack: [...stack],
        deferredExpr: k <= 1 ? `base case → ${k}` : `fib(${k - 1}) + fib(${k - 2})`,
        memoSnapshot: { ...memo },
        explanation:
          k <= 1
            ? `Base case: fib(${k}) returns ${k}.`
            : `Enter fib(${k}): evaluate left branch fib(${k - 1}) first, keeping fib(${k}) on the call stack.`,
        highlightLine: k <= 1 ? (isMemo ? 2 : 1) : isMemo ? 3 : 3,
      });

      if (k <= 1) {
        completed[id] = k;
        if (isMemo) memo[k] = k;
        steps.push({
          stepNum: steps.length + 1,
          activeNodeId: id,
          visitedIds: [...visited],
          completedValues: { ...completed },
          cacheHitIds: [...cacheHits],
          callStack: [...stack],
          deferredExpr: `return ${k}`,
          memoSnapshot: { ...memo },
          explanation: `fib(${k}) returns ${k}${isMemo ? ' (stored in memo)' : ''}.`,
          highlightLine: isMemo ? 2 : 2,
        });
        stack.pop();
        return k;
      }

      const left = runFib(k - 1, id, depth + 1);
      const right = runFib(k - 2, id, depth + 1);
      const res = left + right;
      completed[id] = res;
      if (isMemo) memo[k] = res;

      steps.push({
        stepNum: steps.length + 1,
        activeNodeId: id,
        visitedIds: [...visited],
        completedValues: { ...completed },
        cacheHitIds: [...cacheHits],
        callStack: [...stack],
        deferredExpr: `fib(${k}) = ${left} + ${right} = ${res}`,
        memoSnapshot: { ...memo },
        explanation: `Combine results in fib(${k}): ${left} + ${right} = ${res}${
          isMemo ? `, saved to memo[${k}]` : ''
        }.`,
        highlightLine: isMemo ? 4 : 3,
      });
      stack.pop();
      return res;
    };

    runFib(n, null, 0);
  }

  // Assign nice x, y positions to tree nodes using leaf-counting post-order layout
  const widthMap: Record<number, number> = {};
  const computeWidth = (id: number): number => {
    const node = nodes[id];
    if (node.childrenIds.length === 0) {
      widthMap[id] = 1;
      return 1;
    }
    const sum = node.childrenIds.reduce((acc, cid) => acc + computeWidth(cid), 0);
    widthMap[id] = sum;
    return sum;
  };

  if (nodes.length > 0) {
    computeWidth(0);
    const totalLeaves = Math.max(1, widthMap[0]);
    const svgW = Math.max(520, totalLeaves * 68);

    const assignCoords = (id: number, xStart: number, xEnd: number) => {
      const node = nodes[id];
      node.x = (xStart + xEnd) / 2;
      node.y = 42 + node.depth * 66;
      let cursor = xStart;
      for (const cid of node.childrenIds) {
        const span = ((xEnd - xStart) * widthMap[cid]) / widthMap[id];
        assignCoords(cid, cursor, cursor + span);
        cursor += span;
      }
    };
    assignCoords(0, 20, svgW - 20);
  }

  const maxStack = steps.reduce((m, s) => Math.max(m, s.callStack.length), 0);
  const argCounts: Record<number, number> = {};
  nodes.forEach((nd) => {
    argCounts[nd.arg] = (argCounts[nd.arg] || 0) + 1;
  });
  const redundantCalls = Object.values(argCounts).reduce(
    (sum, c) => sum + (c > 1 ? c - 1 : 0),
    0
  );

  return { nodes, steps, totalCalls: nodes.length, maxStack, redundantCalls };
}

const QUICK_CHECKS = [
  {
    id: 'rec-check-1',
    question:
      'What are the Time and Space complexities of naive `fib(n)` (tree recursion)?',
    options: [
      'Time Θ(2ⁿ), Space Θ(2ⁿ)',
      'Time Θ(φⁿ) / O(2ⁿ), Space Θ(n)',
      'Time Θ(n²), Space Θ(n)',
      'Time Θ(n), Space Θ(1)',
    ],
    correct: 1,
    explanation:
      'A classic CS1010A trick! Although the call tree has exponentially many nodes (Time Θ(φⁿ)), Python executes depth-first, so at most n+1 frames sit on the call stack simultaneously → Space Θ(n)!',
  },
  {
    id: 'rec-check-2',
    question:
      'Which Python function generates a true Iterative Process (no deferred operations)?',
    options: [
      'def f(n): return 1 if n == 0 else n + f(n - 1)',
      'def f(n, acc=0): return acc if n == 0 else f(n - 1, acc + n)',
      'def f(n): return 0 if n == 0 else f(n - 1) + f(n - 1)',
      'def f(lst): return [] if not lst else [lst[0]] + f(lst[1:])',
    ],
    correct: 1,
    explanation:
      '`f(n - 1, acc + n)` passes the updated accumulator directly as an argument with nothing waiting after the recursive call returns. All other options have deferred `+` operations!',
  },
];

export const RecursionLab: React.FC<RecursionLabProps> = ({
  completedDrills,
  onCompleteDrill,
}) => {
  const [mode, setMode] = useState<Mode>('fib_tree');
  const [nVal, setNVal] = useState<number>(MODE_INFO.fib_tree.defaultN);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(650);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const info = MODE_INFO[mode];

  const sim = useMemo(() => generateSimulation(mode, nVal), [mode, nVal]);
  const safeStepIdx = Math.min(stepIdx, Math.max(0, sim.steps.length - 1));
  const currentStep = sim.steps[safeStepIdx];

  useEffect(() => {
    if (!playing) return;
    if (safeStepIdx >= sim.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), speedMs);
    return () => clearTimeout(t);
  }, [playing, safeStepIdx, sim.steps.length, speedMs]);

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setNVal(MODE_INFO[nextMode].defaultN);
    setStepIdx(0);
    setPlaying(false);
  };

  const handleNChange = (val: number) => {
    setNVal(val);
    setStepIdx(0);
    setPlaying(false);
  };

  const svgWidth = useMemo(() => {
    if (sim.nodes.length === 0) return 520;
    const maxX = Math.max(...sim.nodes.map((nd) => nd.x));
    return Math.max(520, maxX + 55);
  }, [sim.nodes]);

  const svgHeight = useMemo(() => {
    if (sim.nodes.length === 0) return 240;
    const maxY = Math.max(...sim.nodes.map((nd) => nd.y));
    return Math.max(240, maxY + 55);
  }, [sim.nodes]);

  // Identify repeated args in fib_tree to highlight wasted recomputation
  const seenArgCountsBeforeStep = useMemo(() => {
    const counts: Record<number, number> = {};
    if (!currentStep) return counts;
    for (const nid of currentStep.visitedIds) {
      const arg = sim.nodes[nid].arg;
      counts[arg] = (counts[arg] || 0) + 1;
    }
    return counts;
  }, [currentStep, sim.nodes]);

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(MODE_INFO) as Mode[]).map((m) => {
          const item = MODE_INFO[m];
          const active = m === mode;
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    active ? 'bg-orange-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
                <span className={`text-[11px] font-mono ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.time}
                </span>
              </div>
              <div className="text-xs font-bold leading-snug">{item.name}</div>
            </button>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStepIdx((i) => Math.max(0, i - 1));
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (safeStepIdx >= sim.steps.length - 1) setStepIdx(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{playing ? 'Pause' : 'Play Trace'}</span>
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStepIdx((i) => Math.min(sim.steps.length - 1, i + 1));
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStepIdx(sim.steps.length - 1);
            }}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            title="Jump to End"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
            <span>Input n =</span>
            <input
              type="range"
              min={info.minN}
              max={info.maxN}
              value={nVal}
              onChange={(e) => handleNChange(Number(e.target.value))}
              className="w-24 accent-orange-500 cursor-pointer"
            />
            <span className="font-mono text-sm font-bold text-orange-600 w-4">{nVal}</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Speed:</span>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-slate-50 font-mono"
            >
              <option value={1000}>Slow</option>
              <option value={650}>Normal</option>
              <option value={280}>Fast</option>
            </select>
          </label>

          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Step {safeStepIdx + 1} / {sim.steps.length}
          </span>
        </div>
      </div>

      {/* Main Split Visualizer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Interactive SVG Call Tree / Process Diagram */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'fact_iter' ? 'State Transition Chain' : 'Live Call Tree Execution'}
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Active
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Returned
              </span>
              {mode === 'fib_memo' && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Memo Hit
                </span>
              )}
              {mode === 'fib_tree' && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Repeated Work
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl bg-slate-50 border border-slate-200/80 min-h-[280px] flex items-center justify-center p-2">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="max-w-full h-auto"
            >
              {/* Edges */}
              {sim.nodes.map((node) => {
                if (node.parentId === null) return null;
                if (!currentStep?.visitedIds.includes(node.id)) return null;
                const parent = sim.nodes[node.parentId];
                const isActiveEdge = currentStep.activeNodeId === node.id;
                return (
                  <line
                    key={`edge-${node.id}`}
                    x1={parent.x}
                    y1={parent.y + 18}
                    x2={node.x}
                    y2={node.y - 18}
                    stroke={isActiveEdge ? '#f97316' : '#94a3b8'}
                    strokeWidth={isActiveEdge ? 2.5 : 1.5}
                    strokeDasharray={currentStep.cacheHitIds.includes(node.id) ? '4 3' : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {sim.nodes.map((node) => {
                const visited = currentStep?.visitedIds.includes(node.id);
                if (!visited) return null;
                const isActive = currentStep.activeNodeId === node.id;
                const isCacheHit = currentStep.cacheHitIds.includes(node.id);
                const retVal = currentStep.completedValues[node.id];
                const isRepeated =
                  mode === 'fib_tree' && (seenArgCountsBeforeStep[node.arg] || 0) > 1 && node.arg >= 1;

                let fill = '#ffffff';
                let stroke = '#cbd5e1';
                let textFill = '#0f172a';

                if (isActive) {
                  fill = '#fff7ed';
                  stroke = '#f97316';
                  textFill = '#9a3412';
                } else if (isCacheHit) {
                  fill = '#ecfdf5';
                  stroke = '#10b981';
                  textFill = '#065f46';
                } else if (retVal !== undefined) {
                  fill = isRepeated ? '#fefce8' : '#eff6ff';
                  stroke = isRepeated ? '#f59e0b' : '#3b82f6';
                  textFill = isRepeated ? '#92400e' : '#1e3a8a';
                }

                return (
                  <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                    <rect
                      x={-31}
                      y={-18}
                      width={62}
                      height={36}
                      rx={10}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <text
                      y={retVal !== undefined ? -2 : 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                      fill={textFill}
                    >
                      {node.label}
                    </text>
                    {retVal !== undefined && (
                      <text
                        y={12}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="JetBrains Mono, monospace"
                        fill={isCacheHit ? '#059669' : '#2563eb'}
                      >
                        {isCacheHit ? `⚡${retVal}` : `→ ${retVal}`}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Deferred Expression / Live Trace Banner */}
          <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <span>{mode === 'fact_rec' ? 'Deferred Operations Chain' : 'Current Evaluation'}</span>
              <span className="text-orange-400 font-mono">{info.processType}</span>
            </div>
            <div className="font-mono text-sm text-amber-300 break-all">
              {currentStep?.deferredExpr}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentStep?.explanation}</p>
          </div>
        </div>

        {/* Right: Code, Stack, Memo & Complexity Stats */}
        <div className="xl:col-span-4 space-y-4">
          {/* Highlighted Python Code */}
          <div className="bg-slate-950 rounded-2xl p-4 text-slate-100 border border-slate-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Python Implementation
            </div>
            <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
              {info.code.map((line, idx) => {
                const active = currentStep?.highlightLine === idx;
                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      active ? 'bg-orange-500/25 text-orange-200 border-l-2 border-orange-400' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 select-none mr-3">{idx + 1}</span>
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] text-slate-500 font-medium">Total Calls (n={nVal})</div>
              <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                {sim.totalCalls}
              </div>
              <div className="text-[11px] font-mono text-orange-600 font-semibold">Time: {info.time}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
              <div className="text-[11px] text-slate-500 font-medium">Max Stack Depth</div>
              <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                {sim.maxStack}
              </div>
              <div className="text-[11px] font-mono text-blue-600 font-semibold">Space: {info.space}</div>
            </div>
          </div>

          {/* Live Call Stack */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Active Call Stack (Top → Bottom)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                depth {currentStep?.callStack.length ?? 0}
              </span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {[...(currentStep?.callStack ?? [])].reverse().map((frame, i) => (
                <div
                  key={`${frame}-${i}`}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs border ${
                    i === 0
                      ? 'bg-orange-50 border-orange-300 text-orange-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {frame}
                </div>
              ))}
            </div>
          </div>

          {/* Memo Table (when in fib_memo) */}
          {mode === 'fib_memo' && (
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4">
              <div className="text-xs font-bold text-emerald-900 mb-2">Live `memo` Dictionary</div>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {Object.keys(currentStep?.memoSnapshot ?? {}).length === 0 ? (
                  <span className="text-emerald-700/70 italic">{'{ } (empty)'}</span>
                ) : (
                  Object.entries(currentStep?.memoSnapshot ?? {}).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-semibold"
                    >
                      {k}: {v}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Exam Insight Note */}
          <div className="bg-blue-50/70 rounded-2xl border border-blue-200/80 p-4 text-xs text-blue-950 leading-relaxed">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              CS1010A Exam Insight
            </div>
            {info.examNote}
          </div>
        </div>
      </div>

      {/* Interactive Concept Check */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <h3 className="font-bold text-slate-900 mb-1">Quick Concept Check (+25 XP each)</h3>
        <p className="text-xs text-slate-500 mb-4">
          Test your Midterm intuition on recursive vs iterative processes and tree recursion space complexity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_CHECKS.map((q) => {
            const chosen = quizAnswers[q.id];
            const answered = chosen !== undefined;
            const isCorrect = chosen === q.correct;
            const alreadyDone = completedDrills.includes(q.id);

            return (
              <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">{q.question}</span>
                    {alreadyDone && (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Solved
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {q.options.map((opt, idx) => {
                      let btnStyle = 'bg-white border-slate-200 hover:border-orange-300 text-slate-700';
                      if (answered) {
                        if (idx === q.correct) btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                        else if (idx === chosen) btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }));
                            if (idx === q.correct) onCompleteDrill(q.id, 25);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {answered && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                      isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
