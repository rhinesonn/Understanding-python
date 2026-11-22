import React from 'react';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { OVERVIEW_UNIT, UNIT_META } from '../data/courseGuide';
import { TOPICS } from '../data/topics';
import { AdmonitionBox, DataTable, LearningObjectivesBox, RichText } from './RichText';

interface OverviewPageProps {
  solvedIds: string[];
  onNavigate: (slug: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ solvedIds, onNavigate }) => {
  const totalQuestions = TOPICS.reduce((sum, t) => sum + t.practice.length, 0);

  return (
    <article className="space-y-9">
      {/* Header */}
      <header className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          NUS CS1010A • {OVERVIEW_UNIT.unitLabel}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {OVERVIEW_UNIT.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {OVERVIEW_UNIT.subtitle}
        </p>

        {/* Compact Progress Meter */}
        <div className="pt-2 flex items-center gap-3 max-w-sm">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((solvedIds.length / Math.max(totalQuestions, 1)) * 100)}%`,
              }}
            />
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {solvedIds.length} / {totalQuestions} practice solved
          </span>
        </div>
      </header>

      {/* Learning Objectives */}
      <LearningObjectivesBox objectives={OVERVIEW_UNIT.learningObjectives} />

      {/* Textbook Sections */}
      {OVERVIEW_UNIT.sections.map((sec) => (
        <section key={sec.id} id={sec.id} className="scroll-mt-20 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
            {sec.title}
          </h2>

          {sec.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-7"
            >
              <RichText text={p} />
            </p>
          ))}

          {sec.bullets && (
            <ul className="space-y-2.5 list-disc pl-5 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-7">
              {sec.bullets.map((b, i) => (
                <li key={i}>
                  <RichText text={b} />
                </li>
              ))}
            </ul>
          )}

          {sec.table && <DataTable table={sec.table} />}
          {sec.admonition && <AdmonitionBox block={sec.admonition} />}
        </section>
      ))}

      {/* Quick Unit Index Grid */}
      <section id="unit-index" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-2">
          Course Units Index
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOPICS.map((topic) => {
            const meta = UNIT_META[topic.id];
            const solved = topic.practice.filter((q) => solvedIds.includes(q.id)).length;
            const done = solved === topic.practice.length;

            return (
              <button
                key={topic.id}
                onClick={() => onNavigate(meta.slug)}
                className="group text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {meta.unitLabel} • {meta.group}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      done
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {done && <CheckCircle2 className="w-3 h-3" />}
                    {solved}/{topic.practice.length}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {topic.title}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {topic.tagline}
                </p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate('a4-helpsheet')}
          className="w-full p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Printable A4 Exam Helpsheet
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                8-block Lectures 1–12 summary formatted for Midterm (1× A4), PE, and Finals (2× A4).
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </section>

      {/* Footer Next Button */}
      <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          onClick={() => onNavigate('01-abstraction-scope')}
          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-right transition-all cursor-pointer"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Next Unit →
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-0.5">
            01. Functional Abstraction &amp; Scope
          </div>
        </button>
      </footer>
    </article>
  );
};
