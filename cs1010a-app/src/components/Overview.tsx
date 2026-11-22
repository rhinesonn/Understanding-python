import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Calculator,
  AlertTriangle,
  Sparkles,
  FileCode2,
  GraduationCap,
} from 'lucide-react';
import { MODULES, ModuleId, MasteryState } from '../types';

interface OverviewProps {
  mastery: MasteryState;
  onToggleTopic: (topicId: string) => void;
  onNavigate: (id: ModuleId) => void;
}

const SYLLABUS_TOPICS = [
  {
    id: 't1',
    week: 'W1–2',
    title: 'Python Primitives, Expressions & Functional Abstraction',
    tip: 'Master short-circuiting (`and`/`or` return operands, not just bool!) and wishful thinking.',
    module: 'exam' as ModuleId,
  },
  {
    id: 't2',
    week: 'W3',
    title: 'Recursion vs Iteration (Recursive vs Iterative Processes)',
    tip: 'A recursive function can generate an iterative process if there are no deferred operations.',
    module: 'recursion' as ModuleId,
  },
  {
    id: 't3',
    week: 'W3–4',
    title: 'Order of Growth (Time & Space Complexity)',
    tip: 'Watch out for hidden Θ(n) operations inside loops/recursion: slicing `lst[1:]`, `in list`, `pop(0)`.',
    module: 'complexity' as ModuleId,
  },
  {
    id: 't4',
    week: 'W4–5',
    title: 'Higher-Order Functions, Lambdas & Closures',
    tip: 'Trace `compose(f, g)(x)` and `repeated(f, n)(x)` carefully by tracking function objects vs calls.',
    module: 'hof' as ModuleId,
  },
  {
    id: 't5',
    week: 'W5',
    title: 'Data Abstraction & Tuples (Immutable Sequences)',
    tip: 'Single-element tuple needs a trailing comma `(1,)`, and tuples inside tuples cannot be mutated.',
    module: 'memory' as ModuleId,
  },
  {
    id: 't6',
    week: 'W6–7',
    title: 'Lists, Dictionaries, Mutation & Aliasing',
    tip: 'Know which methods mutate in-place and return `None` (`.append`, `.sort`, `.reverse`) vs return new objects.',
    module: 'memory' as ModuleId,
  },
  {
    id: 't7',
    week: 'W8',
    title: 'Searching & Sorting (Custom `key` & Tie-Breaking)',
    tip: 'Use tuple keys `key=lambda x: (-x[1], x[0])` for PE CSV Top-K problems with ties!',
    module: 'algo-oop' as ModuleId,
  },
  {
    id: 't8',
    week: 'W9–10',
    title: 'Object-Oriented Programming (Classes, Inheritance & `super()`)',
    tip: 'Distinguish class attributes vs instance attributes (`self.x`), and trace MRO lookup upwards.',
    module: 'algo-oop' as ModuleId,
  },
  {
    id: 't9',
    week: 'W11',
    title: 'Memoization, Dynamic Programming & Exceptions',
    tip: 'Convert exponential tree recursion to Θ(n) or Θ(n·k) DP using a memo dict or bottom-up table.',
    module: 'recursion' as ModuleId,
  },
  {
    id: 't10',
    week: 'W12–13',
    title: 'File Processing (CSV) & Practical Exam (PE) Execution',
    tip: 'Triage PE questions: secure reliable marks on CSV & OOP templates before grinding a tricky Q1.',
    module: 'exam' as ModuleId,
  },
];

export const Overview: React.FC<OverviewProps> = ({
  mastery,
  onToggleTopic,
  onNavigate,
}) => {
  const [cmScore, setCmScore] = useState(95);
  const [midtermScore, setMidtermScore] = useState(68);
  const [peScore, setPeScore] = useState(82);
  const [finalScore, setFinalScore] = useState(84);

  // Typical CS1010A breakdown: Coursemology 15%, Midterm 20%, PE 20%, Final 45%
  // Progressive scheme: If Final > Midterm, Final can absorb Midterm (e.g. Final becomes 65% or 60%)
  const standardTotal =
    cmScore * 0.15 + midtermScore * 0.2 + peScore * 0.2 + finalScore * 0.45;
  const progressiveTotal =
    cmScore * 0.15 + peScore * 0.2 + finalScore * 0.65;
  const progressiveTriggered = progressiveTotal > standardTotal;
  const effectiveTotal = Math.max(standardTotal, progressiveTotal);

  const estimateBand = (score: number) => {
    if (score >= 85) return { grade: 'A / A+', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 78) return { grade: 'A-', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (score >= 72) return { grade: 'B+', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 65) return { grade: 'B', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (score >= 55) return { grade: 'B- / C+', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { grade: 'C / Review Focus', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const band = estimateBand(effectiveTotal);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>NUS CS1010A Interactive Concept & Exam Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Don&apos;t just memorize Python syntax — <span className="text-orange-400">visualize</span> how CS1010A executes & grades it.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Built around the exact hurdles of NUS CS1010A: call trees &amp; deferred operations, hidden Big-Θ Python traps, HOF substitution, box-and-pointer aliasing diagrams, PE CSV/OOP templates, and Question 1 tracing traps.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('memory')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Launch Memory &amp; Aliasing Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('exam')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Q1 Tracing Gauntlet</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Lab Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Interactive Concept Labs</h3>
          <span className="text-xs text-slate-500">Pick any lab to start experimenting</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MODULES.filter((m) => m.id !== 'overview').map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="group text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-400/80 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {mod.weekRange}
                  </span>
                  <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    {mod.examTag}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {mod.title}
                </h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{mod.subtitle}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-orange-600">
                <span>Open Interactive Lab</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Two-column: Syllabus Checklist & Progressive Grading Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Syllabus Mastery Checklist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-orange-500" />
                CS1010A Syllabus Mastery Checklist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tick off topics as you master them (+15 XP each). Click the lab badge to jump straight in.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {mastery.checkedTopics.length} / {SYLLABUS_TOPICS.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {SYLLABUS_TOPICS.map((item) => {
              const checked = mastery.checkedTopics.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="py-3 flex items-start gap-3 group"
                >
                  <button
                    onClick={() => onToggleTopic(item.id)}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                    aria-label={`Mark ${item.title} as mastered`}
                  >
                    {checked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400">{item.week}</span>
                      <span
                        className={`text-sm font-semibold ${
                          checked ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.tip}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(item.module)}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 transition-colors cursor-pointer"
                  >
                    Practice →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment & Progressive Grading Simulator */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900">Progressive Grading Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              CS1010A has <strong>no bell curve</strong> and typically applies progressive grading: if your Final Exam outperforms your Midterm, your Final can absorb the Midterm weightage!
            </p>

            <div className="space-y-4">
              {[
                { label: 'Coursemology (15%)', val: cmScore, set: setCmScore },
                { label: 'Midterm Test (20%)', val: midtermScore, set: setMidtermScore },
                { label: 'Practical Exam (20%)', val: peScore, set: setPeScore },
                { label: 'Final Exam (45%)', val: finalScore, set: setFinalScore },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700">{row.label}</span>
                    <span className="font-mono font-bold text-slate-900">{row.val}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={row.val}
                    onChange={(e) => row.set(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Standard Weightage</span>
                <span className="font-mono font-semibold">{standardTotal.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Progressive (Final absorbs Midterm)</span>
                <span className="font-mono font-semibold">{progressiveTotal.toFixed(1)}%</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Effective Score</div>
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    {effectiveTotal.toFixed(1)}%
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${band.color}`}>
                  Est. {band.grade}
                </div>
              </div>
              {progressiveTriggered && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 font-medium">
                  Progressive boost active (+{(progressiveTotal - standardTotal).toFixed(1)}%) — bombing Midterm is recoverable with a strong Final!
                </div>
              )}
            </div>
          </div>

          {/* Golden Exam Rules Card */}
          <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-5">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Top 4 CS1010A Exam Survival Rules
            </h4>
            <ul className="space-y-2 text-xs text-amber-900/90 leading-relaxed">
              <li>
                <strong>1. Concise Code Rule:</strong> Written exams penalize code more than ~2× longer than the model answer. Plan on rough paper first.
              </li>
              <li>
                <strong>2. Never Leave Blanks:</strong> Method marks exist on written papers — write base cases, recurrence logic, or helper signatures.
              </li>
              <li>
                <strong>3. PE Triage Strategy:</strong> Don&apos;t get stuck on Q1 for 45 mins. Bank reliable marks on CSV (Q2) and OOP (Q3) templates first.
              </li>
              <li>
                <strong>4. Test Hidden Edge Cases:</strong> Always test empty list `[]`, single element `[x]`, and tie-breaking cases before submitting in PE.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
