import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  PenTool,
  XCircle,
} from 'lucide-react';
import { Topic } from '../data/topics';
import { ORDERED_SLUGS, UnitMeta } from '../data/courseGuide';
import { MicroVisual } from './MiniVisuals';
import {
  AdmonitionBox,
  CodeBlock,
  DataTable,
  LearningObjectivesBox,
  RichText,
} from './RichText';

interface UnitPageProps {
  topic: Topic;
  meta: UnitMeta;
  solvedIds: string[];
  onSolveQuestion: (questionId: string) => void;
  onNavigate: (slug: string) => void;
}

export const UnitPage: React.FC<UnitPageProps> = ({
  topic,
  meta,
  solvedIds,
  onSolveQuestion,
  onNavigate,
}) => {
  const [revealedTraps, setRevealedTraps] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    setRevealedTraps({});
    setSelectedAnswers({});
  }, [topic.id]);

  const navIdx = ORDERED_SLUGS.findIndex((item) => item.slug === meta.slug);
  const prevItem = navIdx > 0 ? ORDERED_SLUGS[navIdx - 1] : null;
  const nextItem =
    navIdx >= 0 && navIdx < ORDERED_SLUGS.length - 1 ? ORDERED_SLUGS[navIdx + 1] : null;

  const solvedInUnit = topic.practice.filter((q) => solvedIds.includes(q.id)).length;

  return (
    <article className="space-y-10">
      {/* Unit Header */}
      <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {meta.group} › {meta.unitLabel}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400">{topic.week}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
            {topic.examFocus}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {topic.title}
        </h1>

        <div className="space-y-3 pt-1">
          {meta.introParagraphs.map((para, i) => (
            <p
              key={i}
              className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-7"
            >
              <RichText text={para} />
            </p>
          ))}
        </div>
      </header>

      {/* Signature CS2030S Learning Objectives */}
      <LearningObjectivesBox objectives={meta.learningObjectives} />

      {/* Main Lecture Concept Sections (All visible in textbook flow!) */}
      {topic.examples.map((ex, idx) => (
        <section
          key={idx}
          id={`example-${idx + 1}`}
          className="scroll-mt-20 space-y-4"
        >
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
            <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-2 text-base">
              {topic.number}.{idx + 1}
            </span>
            <RichText text={ex.title} />
          </h2>

          <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-7">
            <RichText text={ex.summary} />
          </p>

          <CodeBlock code={ex.code} output={ex.output} />

          {ex.visual && <MicroVisual id={ex.visual} />}

          <div className="pt-1 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Key Takeaways
            </div>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {ex.keyPoints.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>
                    <RichText text={pt} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Reference Comparison Table & Syllabus Admonitions */}
      {(meta.referenceTable || meta.admonitions.length > 0) && (
        <section id="summary-reference" className="scroll-mt-20 space-y-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
            Reference Summary &amp; Syllabus Notes
          </h2>
          {meta.referenceTable && <DataTable table={meta.referenceTable} />}
          {meta.admonitions.map((adm, i) => (
            <AdmonitionBox key={i} block={adm} />
          ))}
        </section>
      )}

      {/* Common Exam Traps Section */}
      <section id="common-traps" className="scroll-mt-20 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Common Exam Traps
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Predict first, then reveal
          </span>
        </div>

        <div className="space-y-5">
          {topic.traps.map((trap, idx) => {
            const revealed = Boolean(revealedTraps[idx]);
            return (
              <div
                key={idx}
                id={`trap-${idx + 1}`}
                className="scroll-mt-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    <span className="text-amber-600 dark:text-amber-400 font-mono text-xs mr-2">
                      TRAP {idx + 1}
                    </span>
                    <RichText text={trap.title} />
                  </h3>
                </div>

                <CodeBlock code={trap.code} />

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      What most students guess
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                      {trap.commonGuess}
                    </div>
                  </div>
                  {!revealed && (
                    <button
                      onClick={() =>
                        setRevealedTraps((prev) => ({ ...prev, [idx]: true }))
                      }
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Reveal Actual Result
                    </button>
                  )}
                </div>

                {revealed && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/70 space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        What Python Actually Does
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-200 whitespace-pre-wrap">
                        {trap.actualResult}
                      </div>
                      <p className="text-sm text-rose-900/90 dark:text-rose-200/90 leading-relaxed pt-1">
                        <RichText text={trap.why} />
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/70 text-sm text-amber-950 dark:text-amber-200">
                      <strong className="font-bold">Exam Rule: </strong>
                      <RichText text={trap.rule} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Self-Check Practice Section */}
      <section id="practice-section" className="scroll-mt-20 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Self-Check Practice
          </h2>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {solvedInUnit} / {topic.practice.length} solved
          </span>
        </div>

        <div className="space-y-5">
          {topic.practice.map((question, qIdx) => {
            const qChoice = selectedAnswers[question.id];
            const alreadySolved = solvedIds.includes(question.id);

            return (
              <div
                key={question.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-2">
                      Q{qIdx + 1}.
                    </span>
                    <RichText text={question.prompt} />
                  </h3>
                  {alreadySolved && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Solved
                    </span>
                  )}
                </div>

                {question.kind === 'mcq' && (
                  <>
                    {question.code && <CodeBlock code={question.code} />}

                    <div className="space-y-2">
                      {question.options.map((opt, idx) => {
                        const answered = qChoice !== undefined;
                        const isCorrectOpt = idx === question.correctIdx;
                        const isChosen = idx === qChoice;
                        let style =
                          'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-800 dark:text-slate-200';
                        if (answered) {
                          if (isCorrectOpt) {
                            style =
                              'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold';
                          } else if (isChosen) {
                            style =
                              'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-900 dark:text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [question.id]: idx,
                              }));
                              if (idx === question.correctIdx) {
                                onSolveQuestion(question.id);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl border font-mono text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                          >
                            <span className="text-slate-400 mr-3">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {qChoice !== undefined && (
                      <div
                        className={`p-4 rounded-xl border text-sm leading-relaxed flex items-start gap-3 ${
                          qChoice === question.correctIdx
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                        }`}
                      >
                        {qChoice === question.correctIdx ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold mb-0.5">
                            {qChoice === question.correctIdx
                              ? 'Correct!'
                              : 'Not quite — check why:'}
                          </div>
                          <p>
                            <RichText text={question.explanation} />
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {question.kind === 'bug-line' && (
                  <>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs sm:text-[13px] overflow-x-auto">
                      {question.lines.map((line, idx) => {
                        const isClicked = qChoice === idx;
                        const isBug = idx === question.bugLineIdx;
                        let cls =
                          'text-slate-200 hover:bg-slate-800 border border-transparent';
                        if (isClicked && isBug) {
                          cls =
                            'bg-emerald-500/20 text-emerald-200 border border-emerald-400';
                        } else if (isClicked && !isBug) {
                          cls =
                            'bg-rose-500/20 text-rose-200 border border-rose-400';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [question.id]: idx,
                              }));
                              if (idx === question.bugLineIdx) {
                                onSolveQuestion(question.id);
                              }
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${cls}`}
                          >
                            <span className="text-slate-500 select-none w-4 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="whitespace-pre">{line}</span>
                          </button>
                        );
                      })}
                    </div>

                    {qChoice !== undefined && (
                      <div
                        className={`p-4 rounded-xl border text-sm leading-relaxed space-y-2 ${
                          qChoice === question.bugLineIdx
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                        }`}
                      >
                        {qChoice === question.bugLineIdx ? (
                          <>
                            <div className="font-bold flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              Spot on — bug is on line {question.bugLineIdx + 1}!
                            </div>
                            <p className="text-xs sm:text-sm">
                              <strong>Failing case:</strong>{' '}
                              <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                {question.failingCase}
                              </code>
                            </p>
                            <p>
                              <RichText text={question.explanation} />
                            </p>
                            <div className="pt-1">
                              <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                                Fix:
                              </span>
                              <pre className="mt-1 p-2.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto">
                                {question.fix}
                              </pre>
                            </div>
                          </>
                        ) : (
                          <div className="font-semibold flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                            Line {qChoice + 1} looks fine — inspect the edge cases and try another line.
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Textbook Previous / Next Unit Footer */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prevItem ? (
          <button
            onClick={() => onNavigate(prevItem.slug)}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-left transition-all cursor-pointer"
          >
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              ← Previous
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
              {prevItem.title}
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextItem && (
          <button
            onClick={() => onNavigate(nextItem.slug)}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-right transition-all cursor-pointer"
          >
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Next →
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
              {nextItem.title}
            </div>
          </button>
        )}
      </footer>
    </article>
  );
};
