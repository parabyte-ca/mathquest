import type { Text, Visual } from '../items/types.js';

export interface LessonStep {
  text: Text;
  visual?: Visual;
}
export interface Lesson {
  id: string;
  /** Micro-skills this lesson teaches; "Show me how" opens the lesson that lists the item's skill. */
  skills: string[];
  title: Text;
  intro: Text;
  /** Plain-language definitions, each optionally with a picture. */
  definitions: { term: Text; text: Text; visual?: Visual }[];
  /** Two or three worked examples that build in difficulty. */
  examples: { title: Text; steps: LessonStep[] }[];
  /** "Try one with me": a guided question from a generator, with the hint ladder on. */
  tryIt: { skill: string; tier: number; seed: number };
}
