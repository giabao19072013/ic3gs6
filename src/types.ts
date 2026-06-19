export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'teacher' | 'school_admin' | 'super_admin';
  birthDate: string;
  schoolName: string;
  gradeClass: string;
  country: string;
  xp: number;
  level: number;
  streakDays: number;
  hoursStudied: number;
  completionRate: number; // 0 to 100
  badges: Badge[];
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  completedAt?: string;
}

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_RESPONSE'
  | 'TRUE_FALSE'
  | 'MATCHING'
  | 'ORDERING'
  | 'FILL_BLANK'
  | 'DRAG_DROP'
  | 'HOTSPOT'
  | 'SIMULATION';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  category: 'Computing Fundamentals' | 'Key Applications' | 'Living Online';
  subCategory?: string;
  questionText: string;
  imageUrl?: string;
  options?: string[]; // for MC, MR, Ordering elements, Drag Drop sources
  correctAnswer: any; // string, string[], or object for Matching/Hotspots
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendedTimeSeconds: number;
  hotspots?: { id: string; x: number; y: number; label: string }[]; // hotspot areas
  matchingPairs?: { left: string; right: string }[]; // mapping left keys to right keys
}

export interface ExamSession {
  id: string;
  examId: string;
  title: string;
  limitMinutes: number;
  questions: ExamQuestion[];
  status: 'idle' | 'running' | 'completed';
  startedAt?: string;
  completedAt?: string;
  userAnswers: Record<string, any>; // maps questionId to actual user responses
  score?: number; // final overall score (out of 1000)
  correctCount?: number;
  totalQuestions?: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf' | 'quiz' | 'flashcard' | 'practice';
  contentUrl?: string;
  isCompleted: boolean;
  xpReward: number;
  pdfTitle?: string;
  flashcards?: { front: string; back: string }[];
  quizQuestions?: ExamQuestion[];
}

export interface CourseModule {
  id: string;
  title: string;
  code: string;
  description: string;
  progress: number; // 0 to 100
  lessons: Lesson[];
  color: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  studentCount: number;
  averageScore: number;
  students: {
    id: string;
    name: string;
    email: string;
    completedLessons: number;
    avgExamScore: number;
    predictedPassRate: number; // percentage
    streakDays: number;
    activityStatus: 'active' | 'inactive' | 'at_risk';
  }[];
  assignments: {
    id: string;
    title: string;
    dueDate: string;
    assignedCount: number;
    submittedCount: number;
  }[];
}

export interface DocsChapter {
  id: string;
  title: string;
  icon: string;
  sections: {
    id: string;
    title: string;
    content: string; // Markdown or rich HTML-friendly format
  }[];
}
