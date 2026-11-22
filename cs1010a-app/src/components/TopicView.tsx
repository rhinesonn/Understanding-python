import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  PenTool,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Topic } from '../data/topics';
import { MicroVisual } from './MiniVisuals';

interface TopicViewProps {
  topic: Topic;
  hasNextTopic: boolean;
  solvedIds: string[];
  onSolveQuestion: (questionId: string) => void;
  onBack: () => void;
  onNextTopic: () => void;
}

type Stage = 'examples' | 'traps' | 'practice';

const InlineText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code
            key={i}
            className="font-mono text-[0.88em] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

export const TopicView: React.FC<TopicViewProps> = ({
  topic,
  hasNextTopic,
  solvedIds,
  onSolveQuestion,
  onBack,
  onNextTopic,
}) => {
  const [stage, setStage] = useState<Stage>('examples');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [trapIdx, setTrapIdx] = useState(0);
  const [revealedTraps, setRevealedTraps] = useState<Record<number, boolean>>({});
  const [qIdx, setQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Reset local indices when switching to another topic
  useEffect(() => {
    setStage('examples');
    setExampleIdx(0);
    setTrapIdx(0);
    setRevealedTraps({});
    setQIdx(0);
    setSelectedAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [topic.id]);

  const example = topic.examples[exampleIdx];
  const trap = topic.traps[trapIdx];
  const question = topic.practice[qIdx];

  const isTrapRevealed = Boolean(revealedTraps[trapIdx]);
  const qChoice = selectedAnswers[question.id];

  const stageTabs: { id: Stage; step: string; label: string; icon: React.ReactNode }[] = [
    { id: 'examples', step: '1', label: 'Examples & Explanation', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'traps', step: '2', label: 'Common Traps', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'practice', step: '3', label: 'Practice', icon: <PenTool className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb & Topic Header */}
      <div className="space-y-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Topics
        </button>

        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono text-slate-400">
              Topic {topic.number} • {topic.week} • {topic.examFocus}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
              {topic.title}
            </h1>
          </div>
        </div>

        {/* Clean 3-Stage Stepper */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {stageTabs.map((t) => {
            const active = stage === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setStage(t.id)}
                className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center shrink-0 ${
                    active ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.step}
                </span>
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: EXAMPLES & EXPLANATION */}
      {stage === 'examples' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Example Switcher Pills */}
          {topic.examples.length > 1 && (
            <div className="flex items-center flex-wrap gap-2">
              {topic.examples.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setExampleIdx(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    idx === exampleIdx
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Example {idx + 1} of {topic.examples.length}
                </button>
              ))}
            </div>
          )}

          {/* Title & Plain-English Summary */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              <InlineText text={example.title} />
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
              <InlineText text={example.summary} />
            </p>
          </div>

          {/* Code Block */}
          <div className="space-y-2">
            <pre className="p-4 sm:p-5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
              <code>{example.code}</code>
            </pre>
            {example.output && (
              <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-700">
                <span className="text-slate-400 select-none mr-2">Output:</span>
                <span className="whitespace-pre-wrap">{example.output}</span>
              </div>
            )}
          </div>

          {/* Optional Minimalist Interactive Visual */}
          {example.visual && <MicroVisual id={example.visual} />}

          {/* Crisp Key Takeaways */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Takeaways
            </div>
            <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
              {example.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span><InlineText text={pt} /></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calm Bottom Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setExampleIdx((i) => Math.max(0, i - 1))}
              disabled={exampleIdx === 0}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              ← Previous Example
            </button>

            {exampleIdx < topic.examples.length - 1 ? (
              <button
                onClick={() => setExampleIdx((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next Example <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setStage('traps');
                  setTrapIdx(0);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next: Common Traps <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* STAGE 2: COMMON EXAM TRAPS */}
      {stage === 'traps' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Trap Switcher */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              {topic.traps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTrapIdx(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    idx === trapIdx
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Trap {idx + 1} of {topic.traps.length}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">Think first, then reveal</span>
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            <InlineText text={trap.title} />
          </h2>

          <pre className="p-4 sm:p-5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
            <code>{trap.code}</code>
          </pre>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                What most students guess
              </div>
              <div className="font-mono text-sm font-semibold text-slate-700 mt-0.5">
                {trap.commonGuess}
              </div>
            </div>
            {!isTrapRevealed && (
              <button
                onClick={() => setRevealedTraps((prev) => ({ ...prev, [trapIdx]: true }))}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Reveal Actual Result
              </button>
            )}
          </div>

          {isTrapRevealed && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  What Python Actually Does
                </div>
                <div className="font-mono text-sm font-bold text-rose-950 whitespace-pre-wrap">
                  {trap.actualResult}
                </div>
                <p className="text-sm text-rose-900/90 leading-relaxed pt-1">
                  <InlineText text={trap.why} />
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm text-amber-950">
                <strong className="font-bold">Exam Rule: </strong>
                <InlineText text={trap.rule} />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (trapIdx > 0) setTrapIdx((i) => i - 1);
                else setStage('examples');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ← {trapIdx > 0 ? 'Previous Trap' : 'Back to Examples'}
            </button>

            {trapIdx < topic.traps.length - 1 ? (
              <button
                onClick={() => setTrapIdx((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next Trap <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setStage('practice');
                  setQIdx(0);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next: Try Practice <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* STAGE 3: FOCUSED PRACTICE (1 QUESTION AT A TIME) */}
      {stage === 'practice' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Question Dots */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {topic.practice.map((pq, idx) => {
                const done = solvedIds.includes(pq.id);
                const active = idx === qIdx;
                return (
                  <button
                    key={pq.id}
                    onClick={() => setQIdx(idx)}
                    className={`w-8 h-8 rounded-full font-mono text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : done
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Question {qIdx + 1} of {topic.practice.length}
            </span>
          </div>

          {/* Prompt */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            <InlineText text={question.prompt} />
          </h2>

          {/* MCQ Question */}
          {question.kind === 'mcq' && (
            <>
              {question.code && (
                <pre className="p-4 sm:p-5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
                  <code>{question.code}</code>
                </pre>
              )}

              <div className="space-y-2.5">
                {question.options.map((opt, idx) => {
                  const answered = qChoice !== undefined;
                  const isCorrectOpt = idx === question.correctIdx;
                  const isChosen = idx === qChoice;
                  let style =
                    'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800';
                  if (answered) {
                    if (isCorrectOpt)
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                    else if (isChosen)
                      style = 'bg-rose-50 border-rose-400 text-rose-900';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedAnswers((prev) => ({ ...prev, [question.id]: idx }));
                        if (idx === question.correctIdx) onSolveQuestion(question.id);
                      }}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border font-mono text-xs sm:text-sm transition-all cursor-pointer ${style}`}
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
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  {qChoice === question.correctIdx ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold mb-0.5">
                      {qChoice === question.correctIdx ? 'Correct!' : 'Not quite — check why:'}
                    </div>
                    <p><InlineText text={question.explanation} /></p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bug-Line Interactive Question */}
          {question.kind === 'bug-line' && (
            <>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs sm:text-[13px]">
                {question.lines.map((line, idx) => {
                  const isClicked = qChoice === idx;
                  const isBug = idx === question.bugLineIdx;
                  let cls = 'text-slate-200 hover:bg-slate-800 border border-transparent';
                  if (isClicked && isBug)
                    cls = 'bg-emerald-500/20 text-emerald-200 border border-emerald-400';
                  else if (isClicked && !isBug)
                    cls = 'bg-rose-500/20 text-rose-200 border border-rose-400';

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedAnswers((prev) => ({ ...prev, [question.id]: idx }));
                        if (idx === question.bugLineIdx) onSolveQuestion(question.id);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${cls}`}
                    >
                      <span className="text-slate-500 select-none w-4">{idx + 1}</span>
                      <span className="whitespace-pre">{line}</span>
                    </button>
                  );
                })}
              </div>

              {qChoice !== undefined && (
                <div
                  className={`p-4 rounded-xl border text-sm leading-relaxed space-y-2 ${
                    qChoice === question.bugLineIdx
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  {qChoice === question.bugLineIdx ? (
                    <>
                      <div className="font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Spot on — bug is on line {question.bugLineIdx + 1}!
                      </div>
                      <p className="text-xs sm:text-sm">
                        <strong>Failing case:</strong>{' '}
                        <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                          {question.failingCase}
                        </code>
                      </p>
                      <p><InlineText text={question.explanation} /></p>
                      <div className="pt-1">
                        <span className="text-xs font-bold uppercase text-emerald-700">Fix:</span>
                        <pre className="mt-1 p-2.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto">
                          {question.fix}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="font-semibold flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      Line {qChoice + 1} looks okay — inspect the edge cases and click another line.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Bottom Nav */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (qIdx > 0) setQIdx((i) => i - 1);
                else setStage('traps');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              ← {qIdx > 0 ? 'Previous Question' : 'Back to Traps'}
            </button>

            {qIdx < topic.practice.length - 1 ? (
              <button
                onClick={() => setQIdx((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            ) : hasNextTopic ? (
              <button
                onClick={onNextTopic}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next Topic <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Finish &amp; Return to Topics
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
