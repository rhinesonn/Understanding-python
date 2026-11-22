import React, { useEffect, useState } from 'react';
import { FileText, RotateCcw } from 'lucide-react';
import { TOPICS } from './data/topics';
import { TopicHome } from './components/TopicHome';
import { TopicView } from './components/TopicView';
import { ExamSheetView } from './components/ExamSheetView';

const STORAGE_KEY = 'cs1010a_syllabus_progress_v3';

const VALID_QUESTION_IDS = new Set(
  TOPICS.flatMap((t) => t.practice.map((q) => q.id))
);

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

export const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'topic' | 'sheet'>('home');
  const [activeTopicId, setActiveTopicId] = useState<string>(TOPICS[0].id);
  const [solvedIds, setSolvedIds] = useState<string[]>(loadSolved);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedIds));
    } catch {
      // Ignore storage errors
    }
  }, [solvedIds]);

  const activeTopicIndex = TOPICS.findIndex((t) => t.id === activeTopicId);
  const activeTopic = TOPICS[activeTopicIndex] ?? TOPICS[0];

  const handleSolveQuestion = (questionId: string) => {
    setSolvedIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  const handleSelectTopic = (id: string) => {
    setActiveTopicId(id);
    setView('topic');
  };

  const handleNextTopic = () => {
    if (activeTopicIndex < TOPICS.length - 1) {
      setActiveTopicId(TOPICS[activeTopicIndex + 1].id);
    } else {
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Minimal, calm top header */}
      <header className="no-print sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2.5 font-bold text-sm text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-orange-400 font-mono text-xs flex items-center justify-center">
              py
            </span>
            <span>CS1010A Guide</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView(view === 'sheet' ? 'home' : 'sheet')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                view === 'sheet'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Cheat Sheet</span>
            </button>

            {solvedIds.length > 0 && (
              <button
                onClick={() => setSolvedIds([])}
                title="Reset solved progress"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main focused content */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-10">
        {view === 'home' && (
          <TopicHome
            solvedIds={solvedIds}
            onSelectTopic={handleSelectTopic}
            onOpenSheet={() => setView('sheet')}
          />
        )}

        {view === 'topic' && (
          <TopicView
            topic={activeTopic}
            hasNextTopic={activeTopicIndex < TOPICS.length - 1}
            solvedIds={solvedIds}
            onSolveQuestion={handleSolveQuestion}
            onBack={() => setView('home')}
            onNextTopic={handleNextTopic}
          />
        )}

        {view === 'sheet' && <ExamSheetView onBack={() => setView('home')} />}
      </main>
    </div>
  );
};

export default App;
