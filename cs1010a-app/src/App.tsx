import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Menu,
  Moon,
  RotateCcw,
  Search,
  Sun,
  X,
  ExternalLink,
} from 'lucide-react';
import { TOPICS } from './data/topics';
import { NAV_GROUPS, ORDERED_SLUGS, OVERVIEW_UNIT, UNIT_META } from './data/courseGuide';
import { OverviewPage } from './components/OverviewPage';
import { UnitPage } from './components/UnitPage';
import { ExamSheetView, SHEET_TOC } from './components/ExamSheetView';
import { PlaybookPage, PLAYBOOK_TOC } from './components/PlaybookPage';
import { SearchModal } from './components/SearchModal';

const STORAGE_KEY = 'cs1010a_syllabus_progress_v3';
const THEME_KEY = 'cs1010a_theme_v1';

const VALID_QUESTION_IDS = new Set(
  TOPICS.flatMap((t) => t.practice.map((q) => q.id))
);
const VALID_SLUGS = new Set(ORDERED_SLUGS.map((s) => s.slug));

function loadSolved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string' && VALID_QUESTION_IDS.has(id))
      : [];
  } catch {
    return [];
  }
}

function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'light';
}

function getSlugFromHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return VALID_SLUGS.has(hash) ? hash : '00-overview';
}

interface TocItem {
  id: string;
  label: string;
}

export const App: React.FC = () => {
  const [activeSlug, setActiveSlug] = useState<string>(getSlugFromHash);
  const [solvedIds, setSolvedIds] = useState<string[]>(loadSolved);
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string>('');

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Persist solved questions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedIds));
    } catch {
      // Ignore storage errors
    }
  }, [solvedIds]);

  // Listen for browser hash changes (Back/Forward buttons)
  useEffect(() => {
    const onHashChange = () => {
      setActiveSlug(getSlugFromHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Global search keyboard shortcut (Cmd/Ctrl+K or '/')
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (
        e.key === '/' &&
        !searchOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);

  const navigate = (slug: string, anchor?: string) => {
    const safeSlug = VALID_SLUGS.has(slug) ? slug : '00-overview';
    setActiveSlug(safeSlug);
    setMobileNavOpen(false);
    if (window.location.hash !== `#${safeSlug}`) {
      window.history.pushState(null, '', `#${safeSlug}`);
    }
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSolveQuestion = (questionId: string) => {
    setSolvedIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  // Resolve current topic if on Units 01–08
  const activeTopic = useMemo(
    () => TOPICS.find((t) => UNIT_META[t.id]?.slug === activeSlug) ?? null,
    [activeSlug]
  );

  // Build "On this page" TOC dynamically
  const tocItems = useMemo<TocItem[]>(() => {
    if (activeSlug === '00-overview') {
      return [
        { id: 'learning-objectives', label: 'Learning Objectives' },
        ...OVERVIEW_UNIT.sections.map((s) => ({ id: s.id, label: s.title })),
        { id: 'unit-index', label: 'Course Units Index' },
      ];
    }
    if (activeSlug === 'exam-playbook') {
      return PLAYBOOK_TOC;
    }
    if (activeSlug === 'a4-helpsheet') {
      return SHEET_TOC;
    }
    if (activeTopic) {
      const meta = UNIT_META[activeTopic.id];
      const list: TocItem[] = [
        { id: 'learning-objectives', label: 'Learning Objectives' },
        ...activeTopic.examples.map((ex, idx) => ({
          id: `example-${idx + 1}`,
          label: `${activeTopic.number}.${idx + 1} ${ex.title.replace(/`/g, '')}`,
        })),
      ];
      if (meta.referenceTable || meta.admonitions.length > 0) {
        list.push({ id: 'summary-reference', label: 'Reference Summary & Notes' });
      }
      list.push({ id: 'common-traps', label: 'Common Exam Traps' });
      list.push({ id: 'practice-section', label: 'Self-Check Practice' });
      return list;
    }
    return [];
  }, [activeSlug, activeTopic]);

  // Scroll-spy for right TOC
  useEffect(() => {
    if (tocItems.length === 0) return;
    setActiveAnchor(tocItems[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveAnchor(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems, activeSlug]);

  const totalQuestions = TOPICS.reduce((sum, t) => sum + t.practice.length, 0);

  const renderSidebarNav = () => (
    <nav className="space-y-6 pb-8">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1.5">
          <div className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = activeSlug === item.slug;
              const topic = item.topicId
                ? TOPICS.find((t) => t.id === item.topicId)
                : undefined;
              const solved = topic
                ? topic.practice.filter((q) => solvedIds.includes(q.id)).length
                : 0;
              const total = topic?.practice.length ?? 0;
              const allDone = total > 0 && solved === total;

              return (
                <li key={item.slug}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400 rounded-l-none'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    {total > 0 && (
                      <span
                        className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                          allDone
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {allDone && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {solved}/{total}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Material for MkDocs Inspired Sticky Header */}
      <header className="no-print sticky top-0 z-40 h-14 bg-indigo-950 text-white border-b border-indigo-900 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between gap-3">
          {/* Left: Mobile Drawer Button + Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-1.5 rounded-lg text-indigo-200 hover:bg-indigo-900 hover:text-white cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => navigate('00-overview')}
              className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer group"
            >
              <span className="w-7 h-7 rounded-lg bg-orange-500 text-slate-950 font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                py
              </span>
              <div className="min-w-0">
                <div className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-200 transition-colors truncate">
                  CS1010A Programming Methodology
                </div>
              </div>
            </button>
          </div>

          {/* Right: Search + Progress + Dark Mode + GitHub */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-800 text-xs text-indigo-100 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Search notes...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                ⌘K
              </kbd>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-900/60 border border-indigo-800/80 text-[11px] font-mono text-indigo-100">
              <BookOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {solvedIds.length}/{totalQuestions}
              </span>
              {solvedIds.length > 0 && (
                <button
                  onClick={() => setSolvedIds([])}
                  title="Reset solved practice progress"
                  className="ml-1 text-indigo-300 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              aria-label="Toggle dark mode"
              title="Toggle light / dark theme"
              className="p-2 rounded-lg text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <a
              href="https://github.com/rhinesonn/Understanding-python"
              target="_blank"
              rel="noreferrer"
              title="View on GitHub"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-indigo-200 hover:bg-indigo-900 hover:text-white transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="no-print fixed inset-0 z-30 lg:hidden bg-slate-950/50 backdrop-blur-xs"
          onClick={() => setMobileNavOpen(false)}
        >
          <aside
            className="w-72 max-w-[85vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 pt-18 px-3 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarNav()}
          </aside>
        </div>
      )}

      {/* 3-Column CS2030S Textbook Body */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex">
        {/* Left Sticky Sidebar (Desktop) */}
        <aside className="no-print hidden lg:block w-68 shrink-0 border-r border-slate-200/90 dark:border-slate-800/90">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-6">
            {renderSidebarNav()}
          </div>
        </aside>

        {/* Center Main Reading Column */}
        <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="max-w-3xl mx-auto">
            {activeSlug === '00-overview' && (
              <OverviewPage solvedIds={solvedIds} onNavigate={navigate} />
            )}

            {activeTopic && (
              <UnitPage
                topic={activeTopic}
                meta={UNIT_META[activeTopic.id]}
                solvedIds={solvedIds}
                onSolveQuestion={handleSolveQuestion}
                onNavigate={navigate}
              />
            )}

            {activeSlug === 'exam-playbook' && <PlaybookPage onNavigate={navigate} />}

            {activeSlug === 'a4-helpsheet' && <ExamSheetView onNavigate={navigate} />}
          </div>
        </main>

        {/* Right Sticky "On this page" TOC (Desktop XL) */}
        <aside className="no-print hidden xl:block w-60 shrink-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-8">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              On this page
            </div>
            <ul className="space-y-1.5 border-l border-slate-200 dark:border-slate-800">
              {tocItems.map((item) => {
                const active = activeAnchor === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveAnchor(item.id);
                      }}
                      className={`w-full text-left pl-3 py-0.5 text-xs leading-snug transition-colors -ml-px border-l-2 cursor-pointer ${
                        active
                          ? 'border-indigo-600 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onJump={(slug, anchor) => navigate(slug, anchor)}
      />
    </div>
  );
};

export default App;
