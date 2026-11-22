// Grade 12 (MHF4U) Trigonometric Functions: radian measure, exact values in radians, features of sinusoidal functions, and solving
// simple trigonometric equations. Angles are special angles, so every answer is exact.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6 } from './dsl.js';
import { gcd, t } from './kit.js';

/** The multiple of pi for an angle in degrees, as TeX in lowest terms: 150 degrees is \frac{5\pi}{6}. */
export const piTex = (deg: number): string => {
  if (deg === 0) return '0';
  const g = gcd(deg, 180), n = deg / g, d = 180 / g;
  const top = n === 1 ? '\\pi' : `${n}\\pi`;
  return d === 1 ? top : `\\frac{${top}}{${d}}`;
};

/** MHF4U.B1: radian measure */
export const radians12 = (id: string): Generator => (tier, seed) => {
  if (tier === 1) {
    return choiceGen(id, (_t, r) => {
      const deg = pick(r, [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]);
      const right = piTex(deg);
      const distract = [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330].filter((x) => x !== deg).sort(() => r() - 0.5).slice(0, 3).map(piTex);
      const m = mc(r, t(`$${right}$`, `$${right}$`), distract.map((d): [Text, Text] => [t(`$${d}$`, `$${d}$`), t('Multiply the degrees by pi over 180 and reduce the fraction.', 'Multiplie les degrés par pi sur 180 et réduis la fraction.')]));
      return {
        prompt: bi((f) => f.t(`Which is ${f.N(deg)}° in radians?`, `Lequel est ${f.N(deg)}° en radians ?`)),
        options: m.options, correct: m.correct, why: m.why, category: 'KU',
        steps: [bi((f) => f.t(`Multiply by ${f.m('\\frac{\\pi}{180}')}: ${f.m(`${f.n(deg)} \\times \\frac{\\pi}{180}`)}.`, `Multiplie par ${f.m('\\frac{\\pi}{180}')} : ${f.m(`${f.n(deg)} \\times \\frac{\\pi}{180}`)}.`)), bi((f) => f.t(`Reduce: ${f.m(right)}.`, `Réduis : ${f.m(right)}.`))],
        nudge: t('Multiply the degrees by pi over 180, then reduce.', 'Multiplie les degrés par pi sur 180, puis réduis.'),
      };
    })(tier, seed);
  }
  return numGen(id, (_t, r) => {
    if (tier === 2) {
      const deg = pick(r, [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330, 360]);
      return {
        prompt: bi((f) => f.t(`Convert ${f.m(piTex(deg))} radians to degrees.`, `Convertis ${f.m(piTex(deg))} radians en degrés.`)),
        answer: deg, category: 'KU',
        wrong: wr(deg, [[r6(deg / 180), t('Replace pi with 180 degrees. Do not divide the degrees by 180.', 'Remplace pi par 180 degrés. Ne divise pas les degrés par 180.'), 0], [r6((deg * Math.PI) / 180), t('Multiplying by pi again converts the wrong way. Replace pi by 180 degrees.', 'Multiplier encore par pi convertit dans le mauvais sens. Remplace pi par 180 degrés.'), 0]]),
        steps: [t('Replace pi with 180 degrees.', 'Remplace pi par 180 degrés.'), bi((f) => f.t(`${f.m(`${piTex(deg)} \\rightarrow ${f.n(deg)}^{\\circ}`)}.`, `${f.m(`${piTex(deg)} \\rightarrow ${f.n(deg)}^{\\circ}`)}.`))],
        nudge: t('Pi radians is 180 degrees.', 'Pi radians égale 180 degrés.'),
      };
    }
    const rad = pick(r, [10, 8, 6, 5, 4, 12, 15, 20]), theta = pick(r, [0.5, 1.5, 2, 2.5, 3, 4]), ans = r6(rad * theta);
    return {
      prompt: bi((f) => f.t(`A circle has radius ${f.N(rad)} cm. How long is the arc for a central angle of ${f.N(theta)} radians, in cm?`, `Un cercle a un rayon de ${f.N(rad)} cm. Quelle est la longueur de l'arc pour un angle au centre de ${f.N(theta)} radians, en cm ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(rad * theta * 180 / Math.PI), t('With the angle in radians, the arc length is simply the radius times the angle.', 'Avec l\'angle en radians, la longueur d\'arc est simplement le rayon fois l\'angle.'), 0], [r6(rad / theta), t('Multiply the radius by the angle; do not divide.', 'Multiplie le rayon par l\'angle ; ne divise pas.'), 0]]),
      steps: [t('For an angle in radians, arc length = radius × angle.', 'Pour un angle en radians, longueur d\'arc = rayon × angle.'), bi((f) => f.t(`${f.m(`${f.n(rad)} \\times ${f.n(theta)}`)} = ${f.N(ans)} cm.`, `${f.m(`${f.n(rad)} \\times ${f.n(theta)}`)} = ${f.N(ans)} cm.`))],
      nudge: t('Arc length is radius times the angle in radians.', 'La longueur d\'arc est le rayon fois l\'angle en radians.'),
    };
  })(tier, seed);
};

// ── exact values ─────────────────────────────────────────────────────────────

type Exact = { text: string; value: number };
const REF: Record<number, { sin: Exact; cos: Exact; tan: Exact }> = {
  0: { sin: { text: '0', value: 0 }, cos: { text: '1', value: 1 }, tan: { text: '0', value: 0 } },
  30: { sin: { text: '\\frac{1}{2}', value: 0.5 }, cos: { text: '\\frac{\\sqrt{3}}{2}', value: Math.sqrt(3) / 2 }, tan: { text: '\\frac{\\sqrt{3}}{3}', value: Math.sqrt(3) / 3 } },
  45: { sin: { text: '\\frac{\\sqrt{2}}{2}', value: Math.SQRT2 / 2 }, cos: { text: '\\frac{\\sqrt{2}}{2}', value: Math.SQRT2 / 2 }, tan: { text: '1', value: 1 } },
  60: { sin: { text: '\\frac{\\sqrt{3}}{2}', value: Math.sqrt(3) / 2 }, cos: { text: '\\frac{1}{2}', value: 0.5 }, tan: { text: '\\sqrt{3}', value: Math.sqrt(3) } },
  90: { sin: { text: '1', value: 1 }, cos: { text: '0', value: 0 }, tan: { text: '', value: NaN } },
};
const POOL: Exact[] = [
  { text: '0', value: 0 }, { text: '\\frac{1}{2}', value: 0.5 }, { text: '-\\frac{1}{2}', value: -0.5 }, { text: '\\frac{\\sqrt{2}}{2}', value: Math.SQRT2 / 2 }, { text: '-\\frac{\\sqrt{2}}{2}', value: -Math.SQRT2 / 2 },
  { text: '\\frac{\\sqrt{3}}{2}', value: Math.sqrt(3) / 2 }, { text: '-\\frac{\\sqrt{3}}{2}', value: -Math.sqrt(3) / 2 }, { text: '1', value: 1 }, { text: '-1', value: -1 }, { text: '\\sqrt{3}', value: Math.sqrt(3) }, { text: '-\\sqrt{3}', value: -Math.sqrt(3) },
  { text: '\\frac{\\sqrt{3}}{3}', value: Math.sqrt(3) / 3 }, { text: '-\\frac{\\sqrt{3}}{3}', value: -Math.sqrt(3) / 3 },
];

/** The exact value of sin, cos or tan of a special angle in degrees (0 to 360), with the right sign for its quadrant. */
export function exactTrig(fn: 'sin' | 'cos' | 'tan', deg: number): Exact {
  const d = ((deg % 360) + 360) % 360;
  const quad = d < 90 ? 1 : d < 180 ? 2 : d < 270 ? 3 : 4;
  const refDeg = quad === 1 ? d : quad === 2 ? 180 - d : quad === 3 ? d - 180 : 360 - d;
  const base = REF[refDeg]![fn];
  const sign = fn === 'sin' ? (quad <= 2 ? 1 : -1) : fn === 'cos' ? (quad === 1 || quad === 4 ? 1 : -1) : (quad === 1 || quad === 3 ? 1 : -1);
  if (base.value === 0) return base;
  return sign === 1 ? base : { text: `-${base.text}`, value: -base.value };
}

/** MHF4U.B1: exact values of sine, cosine and tangent at special angles in radians */
export const exactRad12 = (id: string): Generator => choiceGen(id, (tier, r) => {
  const fn = pick(r, tier === 1 ? (['sin', 'cos'] as const) : (['sin', 'cos', 'tan'] as const));
  const degs = tier === 1 ? [30, 45, 60, 120, 135, 150] : tier === 2 ? [210, 225, 240, 300, 315, 330, 120, 135, 150] : [0, 90, 180, 270, 210, 225, 240, 300, 315, 330, 360];
  let deg = pick(r, degs);
  while (fn === 'tan' && (deg % 180 === 90)) deg = pick(r, degs);
  if (fn !== 'tan' && deg === 90 && tier === 1) deg = 60;
  const right = exactTrig(fn, deg);
  const distract = POOL.filter((p) => Math.abs(p.value - right.value) > 1e-9).sort(() => r() - 0.5).slice(0, 3);
  const m = mc(r, t(`$${right.text}$`, `$${right.text}$`), distract.map((p): [Text, Text] => [t(`$${p.text}$`, `$${p.text}$`), t('Use the reference angle for the size and the quadrant for the sign (CAST).', 'Utilise l\'angle de référence pour la valeur et le quadrant pour le signe (CAST).')]));
  const name = fn === 'sin' ? '\\sin' : fn === 'cos' ? '\\cos' : '\\tan';
  return {
    prompt: bi((f) => f.t(`What is the exact value of ${f.m(`${name}\\left(${piTex(deg)}\\right)`)}?`, `Quelle est la valeur exacte de ${f.m(`${name}\\left(${piTex(deg)}\\right)`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`${f.m(piTex(deg))} is ${f.N(deg)}°. Find its reference angle and its quadrant.`, `${f.m(piTex(deg))} égale ${f.N(deg)}°. Trouve son angle de référence et son quadrant.`)), bi((f) => f.t(`The value is ${f.m(right.text)}.`, `La valeur est ${f.m(right.text)}.`))],
    nudge: t('Find the reference angle for the size, and use the quadrant for the sign.', 'Trouve l\'angle de référence pour la valeur, et utilise le quadrant pour le signe.'),
  };
});

/** MHF4U.B2: features of sinusoidal functions y = a sin(k(x - d)) + c */
export const sinusoid12 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = pick(r, [2, 3, 4, 5]), c = randInt(r, -3, 4);
  const form = (f: { n: (x: number) => number | string }, k: number): string => `y = ${a}\\sin\\left(${k === 1 ? '' : f.n(k)}x\\right) ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`.replace('+ 0', '').trim();
  if (tier === 1) {
    const k = pick(r, [0.5, 1, 2, 4, 5, 8]), ans = r6(2 / k);
    return {
      prompt: bi((f) => f.t(`The period of ${f.m(form(f, k))} is p times pi. What is p?`, `La période de ${f.m(form(f, k))} est p fois pi. Que vaut p ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[k, t('The period is 2 pi divided by the coefficient of x, not the coefficient itself.', 'La période est 2 pi divisée par le coefficient de x, et non le coefficient lui-même.'), 0], [r6(k * 2), t('Divide 2 by the coefficient; do not multiply.', 'Divise 2 par le coefficient ; ne multiplie pas.'), 1]]),
      steps: [bi((f) => f.t(`Period = ${f.m(`\\frac{2\\pi}{${f.n(k)}}`)}.`, `Période = ${f.m(`\\frac{2\\pi}{${f.n(k)}}`)}.`)), bi((f) => f.t(`So p = ${f.m(`\\frac{2}{${f.n(k)}}`)} = ${f.N(ans)}.`, `Donc p = ${f.m(`\\frac{2}{${f.n(k)}}`)} = ${f.N(ans)}.`))],
      nudge: t('Period = 2 pi divided by the number multiplying x.', 'Période = 2 pi divisée par le nombre qui multiplie x.'),
    };
  }
  if (tier === 2) {
    const which = pick(r, ['max', 'min', 'range'] as const), k = pick(r, [1, 2, 3]);
    const ans = which === 'max' ? a + c : which === 'min' ? c - a : 2 * a;
    return {
      prompt: bi((f) => f.t(`What is the ${which === 'max' ? 'maximum value' : which === 'min' ? 'minimum value' : 'height from the minimum to the maximum'} of ${f.m(form(f, k))}?`, `Quelle est ${which === 'max' ? 'la valeur maximale' : which === 'min' ? 'la valeur minimale' : 'la hauteur du minimum au maximum'} de ${f.m(form(f, k))} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[which === 'range' ? a : a, t('The amplitude is a; the maximum and minimum are the midline plus or minus the amplitude.', 'L\'amplitude est a ; le maximum et le minimum sont la ligne médiane plus ou moins l\'amplitude.'), 0], [which === 'max' ? c - a : which === 'min' ? a + c : a, t('Check whether the question asks for the highest or the lowest value.', 'Vérifie si la question demande la valeur la plus haute ou la plus basse.'), 1], [c, t('That is the midline. Add or subtract the amplitude.', 'C\'est la ligne médiane. Ajoute ou soustrais l\'amplitude.'), 1]]),
      steps: [bi((f) => f.t(`The amplitude is ${f.N(a)} and the midline is y = ${f.N(c)}.`, `L'amplitude est ${f.N(a)} et la ligne médiane est y = ${f.N(c)}.`)), bi((f) => f.t(`${which === 'max' ? `${f.m(`${f.n(c)} + ${f.n(a)}`)}` : which === 'min' ? `${f.m(`${f.n(c)} - ${f.n(a)}`)}` : `${f.m(`2 \\times ${f.n(a)}`)}`} = ${f.N(ans)}.`, `${which === 'max' ? `${f.m(`${f.n(c)} + ${f.n(a)}`)}` : which === 'min' ? `${f.m(`${f.n(c)} - ${f.n(a)}`)}` : `${f.m(`2 \\times ${f.n(a)}`)}`} = ${f.N(ans)}.`))],
      nudge: t('Midline plus the amplitude is the maximum; midline minus it is the minimum.', 'La ligne médiane plus l\'amplitude donne le maximum ; moins l\'amplitude donne le minimum.'),
    };
  }
  const p = pick(r, [0.5, 1, 2, 4]), mx = randInt(r, 3, 9), mn = mx - 2 * a, k = r6(2 / p);
  return {
    prompt: bi((f) => f.t(`A sinusoidal function has a maximum of ${f.N(mx)}, a minimum of ${f.N(mn)} and a period of ${f.m(`${f.n(p)}\\pi`)}. In ${f.m('y = a\\sin(kx) + c')}, what is k?`, `Une fonction sinusoïdale a un maximum de ${f.N(mx)}, un minimum de ${f.N(mn)} et une période de ${f.m(`${f.n(p)}\\pi`)}. Dans ${f.m('y = a\\sin(kx) + c')}, que vaut k ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[p, t('The period is 2 pi divided by k, so k is 2 pi divided by the period.', 'La période est 2 pi divisée par k : k est 2 pi divisé par la période.'), 0], [r6(1 / p), t('The numerator is 2 pi, not pi.', 'Le numérateur est 2 pi, et non pi.'), 1], [a, t('That is the amplitude. The question asks for k, which comes from the period.', 'C\'est l\'amplitude. La question demande k, qui vient de la période.'), 0]]),
    steps: [bi((f) => f.t(`Period = ${f.m(`\\frac{2\\pi}{k}`)}, so ${f.m(`k = \\frac{2\\pi}{${f.n(p)}\\pi}`)}.`, `Période = ${f.m(`\\frac{2\\pi}{k}`)}, donc ${f.m(`k = \\frac{2\\pi}{${f.n(p)}\\pi}`)}.`)), bi((f) => f.t(`k = ${f.N(k)}.`, `k = ${f.N(k)}.`))],
    nudge: t('k = 2 pi divided by the period.', 'k = 2 pi divisé par la période.'),
  };
});

/** MHF4U.B3: solve trigonometric equations on 0 to 360 degrees */
export const trigEq12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier <= 2) {
    const fn = pick(r, tier === 1 ? (['sin', 'cos'] as const) : (['sin', 'cos', 'tan'] as const));
    const ref = pick(r, [30, 45, 60]);
    const v = exactTrig(fn, ref), name = fn === 'sin' ? '\\sin' : fn === 'cos' ? '\\cos' : '\\tan';
    const other = fn === 'sin' ? 180 - ref : fn === 'cos' ? 360 - ref : 180 + ref;
    const target = tier === 1 ? ref : other;
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${name} x = ${v.text}`)} for ${f.m('0^{\\circ} \\le x < 360^{\\circ}')}. Give the ${tier === 1 ? 'smaller solution' : 'larger solution'}, in degrees.`, `Résous ${f.m(`${name} x = ${v.text}`)} pour ${f.m('0^{\\circ} \\le x < 360^{\\circ}')}. Donne la ${tier === 1 ? 'plus petite solution' : 'plus grande solution'}, en degrés.`)),
      answer: target, category: 'AP',
      wrong: wr(target, [[tier === 1 ? other : ref, t(tier === 1 ? 'That is the other solution. The smaller one is in the first quadrant.' : 'That is the first-quadrant solution. The other solution is in the second, third or fourth quadrant.', tier === 1 ? 'C\'est l\'autre solution. La plus petite est dans le premier quadrant.' : 'C\'est la solution du premier quadrant. L\'autre est dans le deuxième, troisième ou quatrième quadrant.'), 1], [360 - target, t('Check which quadrants have this sign for the ratio (CAST).', 'Vérifie dans quels quadrants le rapport a ce signe (CAST).'), 1]]),
      steps: [bi((f) => f.t(`The reference angle is ${f.N(ref)}°, and the ratio is positive, so the solutions are in ${fn === 'sin' ? 'quadrants 1 and 2' : fn === 'cos' ? 'quadrants 1 and 4' : 'quadrants 1 and 3'}.`, `L'angle de référence est ${f.N(ref)}°, et le rapport est positif : les solutions sont dans ${fn === 'sin' ? 'les quadrants 1 et 2' : fn === 'cos' ? 'les quadrants 1 et 4' : 'les quadrants 1 et 3'}.`)), bi((f) => f.t(`The solutions are ${f.N(ref)}° and ${f.N(other)}°.`, `Les solutions sont ${f.N(ref)}° et ${f.N(other)}°.`))],
      nudge: t('Find the reference angle, then use the quadrants where this ratio is positive.', 'Trouve l\'angle de référence, puis utilise les quadrants où ce rapport est positif.'),
    };
  }
  const p = pick(r, [-1, 0, 1, 2, 3]), q = pick(r, [-1, 0, 1]);
  const roots = new Set<number>([p / 2, q]);
  const count = (s: number): number => (Math.abs(s) > 1 ? 0 : Math.abs(s) === 1 ? 1 : 2);
  const ans = [...roots].reduce((sum, s) => sum + count(s), 0);
  return {
    prompt: bi((f) => f.t(`How many solutions does ${f.m(`(2\\sin x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(\\sin x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))}) = 0`.replace(/ [+-] 0\)/g, ')'))} have for ${f.m('0^{\\circ} \\le x < 360^{\\circ}')}?`, `Combien de solutions l'équation ${f.m(`(2\\sin x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(\\sin x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))}) = 0`.replace(/ [+-] 0\)/g, ')'))} a-t-elle pour ${f.m('0^{\\circ} \\le x < 360^{\\circ}')} ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[roots.size * 2, t('A value of 1 or negative 1 gives only one angle, and a value outside negative 1 to 1 gives none.', 'Une valeur de 1 ou de moins 1 ne donne qu\'un angle, et une valeur hors de moins 1 à 1 n\'en donne aucun.'), 1], [roots.size, t('Most values between negative 1 and 1 give two angles in one turn.', 'La plupart des valeurs entre moins 1 et 1 donnent deux angles en un tour.'), 1], [ans + 1, t('Count each factor separately, and count each value of sine once.', 'Compte chaque facteur séparément, et compte chaque valeur du sinus une seule fois.'), 1]]),
    steps: [bi((f) => f.t(`Set each factor to zero: sin x = ${f.N(r6(p / 2))} or sin x = ${f.N(q)}.`, `Pose chaque facteur égal à zéro : sin x = ${f.N(r6(p / 2))} ou sin x = ${f.N(q)}.`)), bi((f) => f.t(`A value in the open interval from negative 1 to 1 (not 0 or ±1) gives 2 angles, 0 gives 2, ±1 gives 1 and a value outside gives 0. In all, ${f.N(ans)}.`, `Une valeur strictement entre moins 1 et 1 donne 2 angles, 0 en donne 2, ±1 en donne 1 et une valeur hors de l'intervalle n'en donne aucun. En tout, ${f.N(ans)}.`))],
    nudge: t('Set each factor to zero and count the angles for each value of sine.', 'Pose chaque facteur égal à zéro et compte les angles pour chaque valeur du sinus.'),
  };
});
