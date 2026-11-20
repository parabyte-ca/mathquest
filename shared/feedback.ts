// Encouraging, never shaming feedback. No red-X language, no "Wrong!". Tone follows the student's grade.
import { check } from './check.js';
import type { Given, Item, Text, WrongAnswer } from './items/types.js';
import { frac, tex, mixedTex } from './generators/kit.js';
import type { Rng } from './rng.js';
import { pick } from './rng.js';

type Band = 'young' | 'mid' | 'senior';
const band = (grade: number): Band => (grade <= 6 ? 'young' : grade <= 9 ? 'mid' : 'senior');

const PRAISE: Record<Band, Text[]> = {
  young: [
    { en: 'Yes! Great thinking!', fr: 'Oui ! Excellente réflexion !' },
    { en: 'Nice work, you got it!', fr: 'Beau travail, tu as réussi !' },
    { en: 'You nailed it! Keep it up!', fr: 'Tu as réussi ! Continue comme ça !' },
    { en: 'Awesome, that strategy works!', fr: 'Génial, ta stratégie fonctionne !' },
  ],
  mid: [
    { en: 'Correct. Nice work.', fr: 'Correct. Beau travail.' },
    { en: 'That is right. Good strategy.', fr: 'C\'est exact. Bonne stratégie.' },
    { en: 'Well done, that is correct.', fr: 'Bien joué, c\'est correct.' },
  ],
  senior: [
    { en: 'Correct.', fr: 'Correct.' },
    { en: 'Right. Good reasoning.', fr: 'Exact. Bon raisonnement.' },
    { en: 'Well reasoned.', fr: 'Bien raisonné.' },
  ],
};

const LEAD_IN: Record<Band, Text[]> = {
  young: [
    { en: 'Not quite yet, and that is okay. Mistakes help us learn!', fr: 'Pas tout à fait encore, et c\'est correct. Les erreurs nous aident à apprendre !' },
    { en: 'Good try! Let\'s look at it together.', fr: 'Bel essai ! Regardons ça ensemble.' },
    { en: 'Almost there! Here is a tip.', fr: 'Presque ! Voici un conseil.' },
  ],
  mid: [
    { en: 'Not quite. Let\'s see where it changed.', fr: 'Pas tout à fait. Voyons où ça a changé.' },
    { en: 'Good effort. Here is what to check.', fr: 'Bon effort. Voici ce qu\'il faut vérifier.' },
  ],
  senior: [
    { en: 'Not quite. Here is where it diverges.', fr: 'Pas tout à fait. Voici où ça diverge.' },
    { en: 'Close. Check this step.', fr: 'Presque. Vérifie cette étape.' },
  ],
};

const GENERIC_WHY: Text = {
  en: 'Let\'s walk through it step by step.',
  fr: 'Passons-y étape par étape.',
};

const SIMILAR: Text = { en: 'Want to try a similar one?', fr: 'Veux-tu en essayer un semblable ?' };
const SIMPLE_NOTE: Text = { en: 'Tip: you can also write it in simplest form.', fr: 'Conseil : tu peux aussi l\'écrire sous la forme la plus simple.' };

/** The matching mapped misconception for what the student gave, if any. */
export function findWrong(item: Item, given: Given): WrongAnswer | null {
  for (const w of item.wrong) if (check(w.answer, given, true)) return w;
  return null;
}

const dec = (n: number, lang: 'en' | 'fr'): string => (lang === 'fr' ? String(n).replace('.', '{,}') : String(n));

/** The correct answer as learner-facing text (math in $...$). */
export function describeAnswer(item: Item): Text {
  const a = item.answer;
  switch (a.kind) {
    case 'number': return { en: tex(dec(a.value, 'en')), fr: tex(dec(a.value, 'fr')) };
    case 'expression': return { en: tex(a.expr), fr: tex(a.expr) };
    case 'fraction': return { en: tex(frac(a.n, a.d)), fr: tex(frac(a.n, a.d)) };
    case 'mixed': return { en: tex(mixedTex(a.whole, a.n, a.d)), fr: tex(mixedTex(a.whole, a.n, a.d)) };
    case 'choice': return item.options![a.index]!;
    case 'multi': return { en: a.indices.map((i) => item.options![i]!.en).join(', '), fr: a.indices.map((i) => item.options![i]!.fr).join(' ; ') };
    case 'order': return { en: a.order.map((i) => item.options![i]!.en).join(', '), fr: a.order.map((i) => item.options![i]!.fr).join(' ; ') };
    case 'match': return { en: a.pairs.map(([l, r]) => `${item.options![l]!.en} → ${item.right![r]!.en}`).join(', '), fr: a.pairs.map(([l, r]) => `${item.options![l]!.fr} → ${item.right![r]!.fr}`).join(' ; ') };
    case 'point': return { en: tex(`(${a.x}, ${a.y})`), fr: tex(`(${a.x}, ${a.y})`) };
  }
}

export interface Feedback {
  correct: boolean;
  /** Short, encouraging opener. */
  message: Text;
  /** For a miss: what most likely went wrong, from the generator's misconception map. */
  why?: Text;
  /** For a miss: the step where it went off track, and the answer. */
  step?: Text;
  stepNumber?: number;
  correctAnswer?: Text;
  /** Names the skill used, or a tip. */
  detail?: Text;
  offerSimilar?: Text;
  /** Hints reduce the reward a little; they never block progress. */
  usedHints: number;
}

export function buildFeedback(item: Item, given: Given, correct: boolean, grade: number, hintsUsed: number, rng: Rng): Feedback {
  const b = band(grade);
  if (correct) {
    const fb: Feedback = { correct: true, message: pick(rng, PRAISE[b]), usedHints: hintsUsed };
    if (item.praise && rng() < 0.6) fb.detail = item.praise;
    if (item.answer.kind === 'fraction' && !item.answer.mustReduce && item.answer.d > 1 && given.kind === 'fraction') {
      const g = (a: number, c: number): number => (c ? g(c, a % c) : Math.abs(a));
      if (g(Number(given.n), Number(given.d)) > 1) fb.detail = SIMPLE_NOTE;
    }
    return fb;
  }
  const w = findWrong(item, given);
  const stepIndex = w && w.stepIndex >= 0 ? Math.min(w.stepIndex, item.steps.length - 1) : item.steps.length - 1;
  return {
    correct: false,
    message: pick(rng, LEAD_IN[b]),
    why: w ? w.why : GENERIC_WHY,
    step: item.steps[stepIndex],
    stepNumber: stepIndex + 1,
    correctAnswer: describeAnswer(item),
    offerSimilar: SIMILAR,
    usedHints: hintsUsed,
  };
}
