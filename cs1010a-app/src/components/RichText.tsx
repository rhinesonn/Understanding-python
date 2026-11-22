import React, { useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  GraduationCap,
} from 'lucide-react';
import { AdmonitionBlock, ComparisonTable } from '../data/courseGuide';

/** Renders inline `code` and **bold** safely inside prose. */
export const RichText: React.FC<{ text: string }> = ({ text }) => {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('`') && tok.endsWith('`')) {
          return (
            <code
              key={i}
              className="font-mono text-[0.86em] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200/80 dark:border-slate-700"
            >
              {tok.slice(1, -1)}
            </code>
          );
        }
        if (tok.startsWith('**') && tok.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
              {tok.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={i}>{tok}</React.Fragment>;
      })}
    </>
  );
};

/** Signature NUS CS2030S Learning Objectives admonition box */
export const LearningObjectivesBox: React.FC<{ objectives: string[] }> = ({ objectives }) => (
  <div
    id="learning-objectives"
    className="scroll-mt-20 rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/60 dark:bg-indigo-950/30 overflow-hidden"
  >
    <div className="px-4 py-2.5 bg-indigo-100/80 dark:bg-indigo-900/50 border-b border-indigo-200/80 dark:border-indigo-900/70 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      Learning Objectives
    </div>
    <div className="p-4 sm:p-5 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
      <p className="font-medium text-slate-800 dark:text-slate-200">
        After taking this unit, students should be able to:
      </p>
      <ul className="space-y-1.5 list-disc pl-5 leading-relaxed">
        {objectives.map((obj, idx) => (
          <li key={idx}>
            <RichText text={obj} />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

/** MkDocs Material-style Admonition Callout Box */
export const AdmonitionBox: React.FC<{ block: AdmonitionBlock }> = ({ block }) => {
  const styles = {
    note: {
      wrap: 'border-blue-200 dark:border-blue-900/70 bg-blue-50/50 dark:bg-blue-950/25',
      hdr: 'bg-blue-100/70 dark:bg-blue-900/40 border-blue-200/80 dark:border-blue-900/70 text-blue-900 dark:text-blue-200',
      icon: <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    tip: {
      wrap: 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/25',
      hdr: 'bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-200/80 dark:border-emerald-900/70 text-emerald-900 dark:text-emerald-200',
      icon: <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    warning: {
      wrap: 'border-amber-200 dark:border-amber-900/70 bg-amber-50/50 dark:bg-amber-950/25',
      hdr: 'bg-amber-100/80 dark:bg-amber-900/40 border-amber-200/80 dark:border-amber-900/70 text-amber-950 dark:text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    syllabus: {
      wrap: 'border-rose-200 dark:border-rose-900/70 bg-rose-50/50 dark:bg-rose-950/25',
      hdr: 'bg-rose-100/80 dark:bg-rose-900/40 border-rose-200/80 dark:border-rose-900/70 text-rose-950 dark:text-rose-200',
      icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    },
  }[block.kind];

  return (
    <div className={`rounded-xl border overflow-hidden ${styles.wrap}`}>
      <div
        className={`px-4 py-2 border-b flex items-center gap-2 text-xs font-bold tracking-wide ${styles.hdr}`}
      >
        {styles.icon}
        <span>
          <RichText text={block.title} />
        </span>
      </div>
      <div className="p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <RichText text={block.body} />
      </div>
    </div>
  );
};

/** Clean MkDocs-style Reference Table */
export const DataTable: React.FC<{ table: ComparisonTable }> = ({ table }) => (
  <div id={table.id} className="scroll-mt-20 space-y-2">
    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <RichText text={table.title} />
    </div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
              >
                <RichText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {table.rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-3.5 py-2.5 text-slate-700 dark:text-slate-300 leading-relaxed ${
                    cIdx === 0 ? 'font-medium text-slate-900 dark:text-slate-100' : ''
                  }`}
                >
                  <RichText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {table.footnote && (
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <RichText text={table.footnote} />
      </p>
    )}
  </div>
);

/** Syntax-clean Code Block with Copy button & optional Output */
export const CodeBlock: React.FC<{ code: string; output?: string; label?: string }> = ({
  code,
  output,
  label = 'python',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard errors on file://
    }
  };

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>

      {output && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300">
          <span className="text-slate-400 dark:text-slate-500 select-none mr-2">Output:</span>
          <span className="whitespace-pre-wrap">{output}</span>
        </div>
      )}
    </div>
  );
};
