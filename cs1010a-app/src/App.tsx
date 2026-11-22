import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './components/Overview';
import { RecursionLab } from './components/RecursionLab';
import { OrderOfGrowthLab } from './components/OrderOfGrowthLab';
import { HofLab } from './components/HofLab';
import { MemoryLab } from './components/MemoryLab';
import { AlgoOopLab } from './components/AlgoOopLab';
import { ExamTrainer } from './components/ExamTrainer';
import { MasteryState, ModuleId } from './types';

const STORAGE_KEY = 'cs1010a_studio_progress_v1';

const DEFAULT_MASTERY: MasteryState = {
  xp: 0,
  completedDrills: [],
  checkedTopics: [],
};

function loadMastery(): MasteryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MASTERY;
    const parsed = JSON.parse(raw) as Partial<MasteryState>;
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      completedDrills: Array.isArray(parsed.completedDrills) ? parsed.completedDrills : [],
      checkedTopics: Array.isArray(parsed.checkedTopics) ? parsed.checkedTopics : [],
    };
  } catch {
    return DEFAULT_MASTERY;
  }
}

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [mastery, setMastery] = useState<MasteryState>(loadMastery);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mastery));
    } catch {
      // Ignore storage quota issues
    }
  }, [mastery]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  const handleCompleteDrill = (drillId: string, xpReward: number) => {
    setMastery((prev) => {
      if (prev.completedDrills.includes(drillId)) return prev;
      showToast(`+${xpReward} XP earned!`);
      return {
        ...prev,
        xp: prev.xp + xpReward,
        completedDrills: [...prev.completedDrills, drillId],
      };
    });
  };

  const handleToggleTopic = (topicId: string) => {
    setMastery((prev) => {
      const exists = prev.checkedTopics.includes(topicId);
      if (exists) {
        return {
          ...prev,
          xp: Math.max(0, prev.xp - 15),
          checkedTopics: prev.checkedTopics.filter((id) => id !== topicId),
        };
      }
      showToast('+15 XP — Syllabus topic mastered!');
      return {
        ...prev,
        xp: prev.xp + 15,
        checkedTopics: [...prev.checkedTopics, topicId],
      };
    });
  };

  const handleResetProgress = () => {
    setMastery(DEFAULT_MASTERY);
    showToast('Progress reset to Level 1.');
  };

  return (
    <Layout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      mastery={mastery}
      onResetProgress={handleResetProgress}
    >
      {activeModule === 'overview' && (
        <Overview
          mastery={mastery}
          onToggleTopic={handleToggleTopic}
          onNavigate={setActiveModule}
        />
      )}
      {activeModule === 'recursion' && (
        <RecursionLab
          completedDrills={mastery.completedDrills}
          onCompleteDrill={handleCompleteDrill}
        />
      )}
      {activeModule === 'complexity' && (
        <OrderOfGrowthLab
          completedDrills={mastery.completedDrills}
          onCompleteDrill={handleCompleteDrill}
        />
      )}
      {activeModule === 'hof' && (
        <HofLab
          completedDrills={mastery.completedDrills}
          onCompleteDrill={handleCompleteDrill}
        />
      )}
      {activeModule === 'memory' && (
        <MemoryLab
          completedDrills={mastery.completedDrills}
          onCompleteDrill={handleCompleteDrill}
        />
      )}
      {activeModule === 'algo-oop' && (
        <AlgoOopLab
          completedDrills={mastery.completedDrills}
          onCompleteDrill={handleCompleteDrill}
        />
      )}
      {activeModule === 'exam' && (
        <ExamTrainer
          completedDrills={mastery.completedDrills}
          onCompleteDrill={handleCompleteDrill}
        />
      )}

      {/* Subtle Floating XP Toast */}
      {toast && (
        <div className="no-print fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-amber-300 border border-orange-500/40 shadow-xl text-xs font-bold font-mono animate-bounce">
          ⚡ {toast}
        </div>
      )}
    </Layout>
  );
};

export default App;
