import React from 'react';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { TOPICS } from '../data/topics';

interface TopicHomeProps {
  solvedIds: string[];
  onSelectTopic: (topicId: string) => void;
  onOpenSheet: () => void;
}

export const TopicHome: React.FC<TopicHomeProps> = ({
  solvedIds,
  onSelectTopic,
  onOpenSheet,
}) => {
  const totalQuestions = TOPICS.reduce((sum, t) => sum + t.practice.length, 0);
  const solvedCount = solvedIds.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Calm, focused intro */}
      <header className="space-y-2 pt-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          NUS CS1010A • Lectures 1–12 Syllabus Companion
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Pick a topic to study.
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-xl">
          Strictly aligned with CS1010A lecture notes. Each topic has{' '}
          <strong>Examples &amp; Explanation</strong>, <strong>Common Exam Traps</strong>, and{' '}
          <strong>Practice Questions</strong>.
        </p>

        {/* Subtle overall progress bar */}
        <div className="pt-2 flex items-center gap-3 max-w-sm">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((solvedCount / Math.max(totalQuestions, 1)) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-500">
            {solvedCount} / {totalQuestions} solved
          </span>
        </div>
      </header>

      {/* Clean single-column / spacious topic list */}
      <div className="space-y-3">
        {TOPICS.map((topic) => {
          const topicSolved = topic.practice.filter((q) => solvedIds.includes(q.id)).length;
          const allDone = topicSolved === topic.practice.length;

          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className="group w-full text-left bg-white rounded-2xl border border-slate-200/90 hover:border-orange-400 hover:shadow-sm px-5 py-4 sm:px-6 sm:py-5 transition-all flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    allDone
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-orange-50 group-hover:text-orange-700'
                  }`}
                >
                  {allDone ? <CheckCircle2 className="w-4 h-4" /> : topic.number}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-base">
                      {topic.title}
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400">{topic.week}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{topic.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`hidden sm:inline-block text-xs font-mono px-2.5 py-1 rounded-full ${
                    allDone
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {topicSolved}/{topic.practice.length}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle footer shortcut to Printable A4 Sheet */}
      <div className="pt-2">
        <button
          onClick={onOpenSheet}
          className="w-full p-4 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 bg-white/60 hover:bg-white transition-all flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Exam Strategy &amp; Printable A4 Helpsheet
              </div>
              <div className="text-xs text-slate-500">
                Lectures 1–12 quick reference for Midterm (1× A4), PE (Pure Python), and Finals (2× A4).
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
