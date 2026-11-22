export type ModuleId =
  | 'overview'
  | 'recursion'
  | 'complexity'
  | 'hof'
  | 'memory'
  | 'algo-oop'
  | 'exam';

export interface MasteryState {
  xp: number;
  completedDrills: string[];
  checkedTopics: string[];
}

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  shortTitle: string;
  subtitle: string;
  weekRange: string;
  examTag: string;
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'overview',
    title: 'Overview & Study Roadmap',
    shortTitle: 'Roadmap',
    subtitle: 'Syllabus mastery, progressive grading simulator & exam blueprint',
    weekRange: 'Weeks 1–13',
    examTag: 'All Assessments',
  },
  {
    id: 'recursion',
    title: 'Recursion, Iteration & DP',
    shortTitle: 'Recursion & DP',
    subtitle: 'Call trees, deferred operations, tail iteration & memoization',
    weekRange: 'Weeks 2–4, 11',
    examTag: 'Midterm • Final',
  },
  {
    id: 'complexity',
    title: 'Order of Growth (Θ / Big-O)',
    shortTitle: 'Order of Growth',
    subtitle: 'Interactive growth curves & hidden Python complexity traps',
    weekRange: 'Weeks 3–4',
    examTag: 'Midterm • Final',
  },
  {
    id: 'hof',
    title: 'Higher-Order Functions & Lambdas',
    shortTitle: 'HOFs & Lambdas',
    subtitle: 'Substitution stepper, closures & CSV multi-key sorting',
    weekRange: 'Weeks 4–5',
    examTag: 'Midterm • PE',
  },
  {
    id: 'memory',
    title: 'Memory, Mutation & Aliasing',
    shortTitle: 'Memory & Aliasing',
    subtitle: 'Box-and-pointer heap visualizer for Q1 Python tracing traps',
    weekRange: 'Weeks 6–7',
    examTag: 'Final Q1 Killer',
  },
  {
    id: 'algo-oop',
    title: 'Searching, Sorting & OOP',
    shortTitle: 'Sorting & OOP',
    subtitle: 'Binary search, sorting visualizers & OOP inheritance/MRO tracer',
    weekRange: 'Weeks 8–10',
    examTag: 'PE • Final',
  },
  {
    id: 'exam',
    title: 'Exam Technique Trainer',
    shortTitle: 'Exam Trainer',
    subtitle: 'Q1 tracing gauntlet, PE bug hunter & printable A4 helpsheet',
    weekRange: 'Midterm • PE • Final',
    examTag: 'Exam Mastery',
  },
];
