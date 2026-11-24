import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ArrowRight, FileText, AlertTriangle, BookOpen, PenTool } from 'lucide-react';
import { TOPICS } from '../data/topics';
import { OVERVIEW_UNIT, UNIT_META } from '../data/courseGuide';
import { GUIDED_TRACE_DRILLS, WRITING_BLUEPRINTS } from '../data/playbook';

interface SearchResult {
  slug: string;
  anchor?: string;
  unitLabel: string;
  title: string;
  snippet: string;
  kind: 'section' | 'trap' | 'practice' | 'overview';
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onJump: (slug: string, anchor?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose, onJump }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const index = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];

    OVERVIEW_UNIT.sections.forEach((sec) => {
      items.push({
        slug: OVERVIEW_UNIT.slug,
        anchor: sec.id,
        unitLabel: 'Unit 00 • Overview',
        title: sec.title,
        snippet: sec.paragraphs[0] ?? '',
        kind: 'overview',
      });
    });

    TOPICS.forEach((topic) => {
      const meta = UNIT_META[topic.id];
      topic.examples.forEach((ex, idx) => {
        items.push({
          slug: meta.slug,
          anchor: `example-${idx + 1}`,
          unitLabel: `${meta.unitLabel} • ${topic.title}`,
          title: ex.title.replace(/`/g, ''),
          snippet: `${ex.summary} ${ex.keyPoints.join(' ')}`,
          kind: 'section',
        });
      });
      topic.traps.forEach((trap, idx) => {
        items.push({
          slug: meta.slug,
          anchor: `trap-${idx + 1}`,
          unitLabel: `${meta.unitLabel} • Common Trap`,
          title: trap.title.replace(/`/g, ''),
          snippet: `${trap.why} ${trap.rule}`,
          kind: 'trap',
        });
      });
      topic.practice.forEach((pq, idx) => {
        items.push({
          slug: meta.slug,
          anchor: 'practice-section',
          unitLabel: `${meta.unitLabel} • Practice Q${idx + 1}`,
          title: pq.prompt.replace(/`/g, ''),
          snippet: pq.explanation,
          kind: 'practice',
        });
      });
    });

    WRITING_BLUEPRINTS.forEach((bp) => {
      items.push({
        slug: 'exam-playbook',
        anchor: 'writing-blueprint',
        unitLabel: `Playbook • Writing Code (${bp.lectureRef})`,
        title: `Blueprint: ${bp.label}`,
        snippet: `${bp.whenToUse} ${bp.steps.map((s) => s.title).join(' ')}`,
        kind: 'overview',
      });
    });

    GUIDED_TRACE_DRILLS.forEach((d) => {
      items.push({
        slug: 'exam-playbook',
        anchor: 'guided-drills',
        unitLabel: `Playbook • Guided Trace (${d.topicTag})`,
        title: d.title.replace(/`/g, ''),
        snippet: `${d.methodUsed} ${d.finalTakeaway}`,
        kind: 'practice',
      });
    });

    items.push({
      slug: 'a4-helpsheet',
      unitLabel: 'Exam Guides',
      title: 'Printable A4 Exam Helpsheet (Lectures 1–12)',
      snippet: 'Midterm 1x A4, Practical Exam pure Python templates, Final 2x A4, Multiset table, Sorting table, Diamond MRO, try/except/else/finally.',
      kind: 'overview',
    });

    return items;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    const terms = q.split(/\s+/).filter(Boolean);
    return index
      .filter((item) => {
        const hay = `${item.unitLabel} ${item.title} ${item.snippet}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 14);
  }, [index, query]);

  if (!open) return null;

  const kindIcon = (kind: SearchResult['kind']) => {
    switch (kind) {
      case 'trap':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'practice':
        return <PenTool className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      case 'overview':
        return <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CS1010A notes, e.g. MRO, fast_expt, multiset, finally, +=..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching CS1010A notes found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.slug}-${r.anchor ?? ''}-${i}`}
                onClick={() => {
                  onJump(r.slug, r.anchor);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-start gap-3 cursor-pointer"
              >
                {kindIcon(r.kind)}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 truncate">
                    {r.unitLabel}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {r.title}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {r.snippet.replace(/`/g, '')}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-2" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Press ESC to close</span>
          <span>{results.length} result(s)</span>
        </div>
      </div>
    </div>
  );
};
