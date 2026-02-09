
export type QuizQuestionType = 'choice' | 'code';

export interface QuizQuestion {
  type: QuizQuestionType;
  question: string;
  explanation: string;
  // For 'choice' type
  options?: string[];
  correctAnswerIndex?: number;
  // For 'code' type
  starterCode?: string;
  task?: string;
}

export interface LearningModule {
  explanation: string;
  tutorial: string;
  example: string;
  quiz: QuizQuestion[];
  language: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface CodeEvaluation {
  isCorrect: boolean;
  feedback: string;
  score: number; // 0 to 100
}
