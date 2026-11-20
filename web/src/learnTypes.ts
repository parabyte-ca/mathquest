import type { PublicItem, Text } from '../../shared/items/types';

export type Step =
  | { type: 'item'; item: PublicItem; kind: 'practice' | 'review' | 'placement'; target: string; phase: string; resumed?: boolean }
  | { type: 'lesson'; lessonId: string; skill: string; target: string; reason: 'stuck' }
  | { type: 'done'; summary: { answered: number; correct: number; masteredExpectations: string[] } };

export interface FeedbackData {
  correct: boolean;
  message: Text;
  why?: Text;
  step?: Text;
  stepNumber?: number;
  correctAnswer?: Text;
  detail?: Text;
  offerSimilar?: Text;
  usedHints: number;
}

export type LadderEvent = 'none' | 'advance' | 'stepdown' | 'micro' | 'lesson' | 'buildup' | 'recovered' | 'help';

export interface AnswerData {
  correct: boolean;
  feedback: FeedbackData;
  event: LadderEvent;
  skill: string;
  pKnown: number;
  state: string;
  masteredSkill: boolean;
  masteredExpectation: boolean;
  placement?: { done: boolean; next?: PublicItem; result?: { startingSkill: string | null; ladder: string[]; startingIndex: number } };
}

export interface StudentSettings {
  voice?: boolean;
  voiceRate?: number;
  autoRead?: boolean;
  theme?: string;
  highContrast?: boolean;
  dyslexiaFont?: boolean;
  reducedMotion?: boolean;
}

export interface LearnOptions {
  defaultGrade: number;
  grades: { grade: number; groups: { course: string | null; strands: { strand: string; name: string; available: boolean }[] }[] }[];
}

export interface MapNode { code: string; grade: number; strand: string; text: string; state: string; p: number; micro: number; unmet: string[] }
export interface SkillMapData { grade: number; nodes: MapNode[]; edges: { from: string; to: string }[] }
