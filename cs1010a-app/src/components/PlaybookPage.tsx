import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  CheckSquare,
  Square,
  Compass,
  FileCode2,
  ListChecks,
  Terminal,
  Lightbulb,
} from 'lucide-react';
import {
  EXAM_CHECKLIST,
  GUIDED_TRACE_DRILLS,
  PAPER_METHODS,
  WRITING_BLUEPRINTS,
} from '../data/playbook';
import { CodeBlock, LearningObjectivesBox, RichText } from './RichText';

interface PlaybookPageProps {
  onNavigate: (slug: string) => void;
}

export const PLAYBOOK_TOC = [
  { id: 'learning-objectives', label: 'Learning Objectives' },
  { id: 'writing-blueprint', label: '1. Code-Writing Blueprints' },
  { id: 'paper-methods', label: '2. 4 Paper-Tracing Methods' },
  { id: 'guided-drills', label: '3. Interactive Trace Drills' },
  { id: 'pre-submit', label: '4. Pre-Submission Checklist' },
];

export const PlaybookPage: React.FC<PlaybookPageProps> = ({ onNavigate }) => {
  // Section 1: Code-Writing Blueprint state
  const [bpIdx, setBpIdx] = useState(0);
  const [showWorked, setShowWorked] = useState(true);

  // Section 3: Interactive Guided Trace Drills state
  const [drillIdx, setDrillIdx] = useState(0);
  const [traceStepIdx, setTraceStepIdx] = useState(0);
  const [revealedCheckpoints, setRevealedCheckpoints] = useState<Record<string, boolean>>({});

  // Section 4: Interactive Checklist state
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const bp = WRITING_BLUEPRINTS[bpIdx];
  const drill = GUIDED_TRACE_DRILLS[drillIdx];
  const currStep = drill.steps[Math.min(traceStepIdx, drill.steps.length - 1)];
  const cpKey = `${drill.id}-${traceStepIdx}`;
  const cpRevealed = Boolean(revealedCheckpoints[cpKey]);

  const selectDrill = (idx: number) => {
    setDrillIdx(idx);
    setTraceStepIdx(0);
  };

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <article className="space-y-12">
      {/* Page Header */}
      <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Exam Guides • Finals &amp; PE Thinking Framework
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Problem-Solving &amp; Code-Tracing Playbook
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          A concrete, step-by-step system for organizing your thoughts on rough exam paper — both
          when <strong>writing code from scratch</strong> and when{' '}
          <strong>tracing tricky Python snippets</strong> across the CS1010A syllabus.
        </p>
      </header>

      {/* Learning Objectives */}
      <LearningObjectivesBox
        objectives={[
          'Classify any CS1010A exam coding question into one of 6 syllabus blueprints before writing a single line of Python.',
          'Format your rough-paper design using concrete examples, base cases, abstraction barriers, data-shape pipelines, or class trees.',
          'Choose the right paper-tracing format (State Table, Box-and-Pointer, Call Stack, or 1-Line MRO) so you never lose track mid-trace.',
          'Apply a 6-point pre-submission audit to catch the highest-frequency CS1010A exam bugs.',
        ]}
      />

      {/* ================================================================
       * SECTION 1: CODE-WRITING BLUEPRINTS
       * ================================================================ */}
      <section id="writing-blueprint" className="scroll-mt-20 space-y-5">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            1. Step-by-Step Code-Writing Blueprints
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pick the topic of the exam question you are facing to see the exact rough-paper steps,
            mental skeleton, and a worked thought-process walkthrough.
          </p>
        </div>

        {/* Topic Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {WRITING_BLUEPRINTS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setBpIdx(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                bpIdx === idx
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Selected Blueprint Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
                {bp.lectureRef}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                How to Approach: {bp.label}
              </h3>
            </div>
          </div>

          {/* When to recognize it */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/70 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <strong className="text-indigo-900 dark:text-indigo-200">When to use this blueprint: </strong>
            <RichText text={bp.whenToUse} />
          </div>

          {/* Ordered Rough-Paper Steps */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Your Rough-Paper Protocol (Follow in Order)
            </div>
            <ol className="space-y-3">
              {bp.steps.map((s) => (
                <li
                  key={s.step}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-start gap-3.5"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      <RichText text={s.title} />
                    </div>
                    <div className="text-xs italic text-indigo-700 dark:text-indigo-300">
                      Ask yourself: &ldquo;<RichText text={s.askYourself} />&rdquo;
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <RichText text={s.action} />
                    </p>
                    {s.watchOut && (
                      <div className="pt-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                        Watch out: <RichText text={s.watchOut} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Copyable Mental Skeleton */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              10-Second Mental Skeleton (Write This Frame First)
            </div>
            <CodeBlock code={bp.skeleton} label="template" />
          </div>

          {/* Worked Thought Process Walkthrough */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
            <button
              onClick={() => setShowWorked((v) => !v)}
              className="w-full px-4 py-3 bg-emerald-100/70 dark:bg-emerald-900/40 border-b border-emerald-200/80 dark:border-emerald-900/70 flex items-center justify-between text-left cursor-pointer"
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Worked Walkthrough (Prompt → Rough Paper → Final Code)
              </span>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                {showWorked ? 'Hide' : 'Show'}
              </span>
            </button>

            {showWorked && (
              <div className="p-4 sm:p-5 space-y-4">
                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong>Exam Prompt: </strong>
                  <RichText text={bp.workedProblem} />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Step-by-Step Thought Process
                  </div>
                  <ul className="space-y-1.5 list-disc pl-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {bp.workedThoughtProcess.map((line, i) => (
                      <li key={i}>
                        <RichText text={line} />
                      </li>
                    ))}
                  </ul>
                </div>

                <CodeBlock code={bp.workedSolution} label="clean solution" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
       * SECTION 2: THE 4 PAPER-TRACING METHODS
       * ================================================================ */}
      <section id="paper-methods" className="scroll-mt-20 space-y-5">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            2. The 4 Paper-Tracing Methods (Stop Tracing in Your Head!)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Most tracing errors happen because students keep state in working memory instead of
            drawing the right scratchpad format on rough paper.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAPER_METHODS.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 sm:p-5 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {m.title}
                </h3>
                <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  Best for: <RichText text={m.bestFor} />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <RichText text={m.howToDraw} />
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Golden Rule: </strong>
                <RichText text={m.goldenRule} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
       * SECTION 3: INTERACTIVE GUIDED TRACE DRILLS
       * ================================================================ */}
      <section id="guided-drills" className="scroll-mt-20 space-y-5">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            3. Interactive Guided Code-Tracing Drills
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Step line-by-line through 5 Final-Exam-style snippets and watch exactly how to lay out
            your paper scratchpad at each step.
          </p>
        </div>

        {/* Drill Selector */}
        <div className="flex flex-wrap gap-2">
          {GUIDED_TRACE_DRILLS.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => selectDrill(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                drillIdx === idx
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              Drill {idx + 1}: {d.topicTag.split('•')[1]?.trim() ?? d.title}
            </button>
          ))}
        </div>

        {/* Active Drill Workspace */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                {drill.topicTag} • Method: {drill.methodUsed}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                <RichText text={drill.title} />
              </h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Step {traceStepIdx + 1} / {drill.steps.length}
            </span>
          </div>

          {/* Code Panel with Active Line Highlight */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs sm:text-[13px] overflow-x-auto space-y-0.5">
            {drill.codeLines.map((line, i) => {
              const active = i === currStep.lineIdx;
              return (
                <div
                  key={i}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-3 transition-colors ${
                    active
                      ? 'bg-amber-500/20 text-amber-200 border-l-2 border-amber-400 font-semibold'
                      : 'text-slate-300 border-l-2 border-transparent'
                  }`}
                >
                  <span className="w-4 text-slate-500 select-none shrink-0">{i + 1}</span>
                  <span className="w-3 text-amber-400 select-none shrink-0">
                    {active ? '▶' : ''}
                  </span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              );
            })}
          </div>

          {/* Live Rough-Paper Scratchpad */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/70 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                What Happens on Line {currStep.lineIdx + 1}
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <RichText text={currStep.action} />
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden">
              <div className="px-3.5 py-1.5 bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Your Rough Paper Scratchpad ({drill.methodUsed})
              </div>
              <pre className="p-4 font-mono text-xs sm:text-[13px] text-slate-800 dark:text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {currStep.scratchpad}
              </pre>
            </div>

            {currStep.checkpointQuestion && (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/25 space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200">
                    Checkpoint: <RichText text={currStep.checkpointQuestion} />
                  </div>
                  {!cpRevealed && (
                    <button
                      onClick={() =>
                        setRevealedCheckpoints((prev) => ({ ...prev, [cpKey]: true }))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Check Answer
                    </button>
                  )}
                </div>
                {cpRevealed && currStep.checkpointAnswer && (
                  <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 pt-1 border-t border-amber-200/80 dark:border-amber-800 leading-relaxed">
                    <RichText text={currStep.checkpointAnswer} />
                  </p>
                )}
              </div>
            )}

            {currStep.outputSoFar && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 font-mono text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                <span className="font-bold mr-2">Printed Output:</span>
                {currStep.outputSoFar}
              </div>
            )}
          </div>

          {/* Stepper Controls */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => setTraceStepIdx(0)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Drill
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTraceStepIdx((s) => Math.max(0, s - 1))}
                disabled={traceStepIdx === 0}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setTraceStepIdx((s) => Math.min(drill.steps.length - 1, s + 1))
                }
                disabled={traceStepIdx >= drill.steps.length - 1}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {traceStepIdx === drill.steps.length - 1 && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <strong>Key Paper-Tracing Habit: </strong>
              <RichText text={drill.finalTakeaway} />
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
       * SECTION 4: PRE-SUBMISSION SANITY CHECKLIST
       * ================================================================ */}
      <section id="pre-submit" className="scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            4. 30-Second Pre-Submission Exam Audit
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {checkedIds.length} / {EXAM_CHECKLIST.length} checked
          </span>
        </div>

        <div className="space-y-2">
          {EXAM_CHECKLIST.map((item) => {
            const checked = checkedIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  checked
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900'
                    : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mr-2">
                    [{item.category}]
                  </span>
                  <span className={checked ? 'line-through opacity-75' : ''}>
                    <RichText text={item.check} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('08-exceptions')}
          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-left transition-all cursor-pointer"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            ← Previous
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
            08. Exceptions &amp; Syllabus Scope
          </div>
        </button>

        <button
          onClick={() => onNavigate('a4-helpsheet')}
          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-right transition-all cursor-pointer"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Next →
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
            A4. Printable Exam Helpsheet
          </div>
        </button>
      </footer>
    </article>
  );
};
