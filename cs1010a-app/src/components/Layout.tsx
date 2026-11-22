import React, { useState } from 'react';
import {
  BookOpen,
  GitBranch,
  TrendingUp,
  Sparkles,
  Box,
  Layers,
  Target,
  Menu,
  X,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { MODULES, ModuleId, MasteryState } from '../types';

interface LayoutProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  mastery: MasteryState;
  onResetProgress: () => void;
  children: React.ReactNode;
}

const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  overview: <BookOpen className="w-4 h-4" />,
  recursion: <GitBranch className="w-4 h-4" />,
  complexity: <TrendingUp className="w-4 h-4" />,
  hof: <Sparkles className="w-4 h-4" />,
  memory: <Box className="w-4 h-4" />,
  'algo-oop': <Layers className="w-4 h-4" />,
  exam: <Target className="w-4 h-4" />,
};

export const Layout: React.FC<LayoutProps> = ({
  activeModule,
  onSelectModule,
  mastery,
  onResetProgress,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const level = Math.min(30, Math.floor(mastery.xp / 100) + 1);
  const xpInLevel = mastery.xp % 100;
  const currentMeta = MODULES.find((m) => m.id === activeModule) ?? MODULES[0];

  const handleNav = (id: ModuleId) => {
    onSelectModule(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-mono font-bold text-slate-950 text-sm shadow-lg shadow-orange-500/20">
              py
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">CS1010A Studio</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">NUS Programming Methodology</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Coursemology-inspired XP widget */}
        <div className="mx-4 mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Level {level} <span className="text-slate-500 font-normal">/ 30</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {mastery.xp} XP
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${level === 30 ? 100 : xpInLevel}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{mastery.completedDrills.length} drills solved</span>
            <span>{mastery.checkedTopics.length}/10 topics</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Interactive Labs & Trainers
          </div>
          {MODULES.map((mod) => {
            const active = mod.id === activeModule;
            return (
              <button
                key={mod.id}
                onClick={() => handleNav(mod.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-all ${
                  active
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-lg ${
                    active ? 'bg-orange-500 text-slate-950' : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {MODULE_ICONS[mod.id]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{mod.shortTitle}</div>
                  <div className="text-[11px] text-slate-400 truncate">{mod.weekRange}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Python 3 • No Bell Curve</span>
          <button
            onClick={onResetProgress}
            title="Reset XP & saved progress"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="no-print sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                  {currentMeta.title}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/70">
                  {currentMeta.examTag}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 truncate">{currentMeta.subtitle}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {currentMeta.weekRange}
            </span>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
