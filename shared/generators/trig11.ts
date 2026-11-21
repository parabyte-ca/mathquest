// Grade 11 trigonometry (MCR3U D, MCF3M C): exact values, reciprocal ratios, identities, the ambiguous case, the sine and cosine laws
// with obtuse angles, two-triangle problems, and sinusoidal functions. Rounded answers are accepted within 0.05.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const rad = (d: number): number => (d * Math.PI) / 180;
const toDeg = (x: number): number => (x * 180) / Math.PI;
const r1 = (x: number): number => Math.round(x * 10) / 10;
const deg = (f: F, x: number): string => f.m(`${f.n(x)}^{\\circ}`);
const far = (ans: number, list: [number, Text, number?][]): [number, Text, number?][] => wr(ans, list.filter(([v]) => Math.abs(v - ans) > 0.3).map(([v, w, s]) => [r1(v), w, s] as [number, Text, number?]));
const TOL = 0.05;

// ── exact values ────────────────────────────────────────────────────────────────

const EXACT: { tex: string; v: number }[] = [
  { tex: '0', v: 0 }, { tex: '\\frac{1}{2}', v: 0.5 }, { tex: '\\frac{\\sqrt{2}}{2}', v: Math.SQRT1_2 }, { tex: '\\frac{\\sqrt{3}}{2}', v: Math.sqrt(3) / 2 }, { tex: '1', v: 1 },
  { tex: '\\frac{\\sqrt{3}}{3}', v: Math.sqrt(3) / 3 }, { tex: '\\sqrt{3}', v: Math.sqrt(3) },
];
const signed = (e: { tex: string; v: number }, neg: boolean): string => (neg && e.v !== 0 ? `-${e.tex}` : e.tex);
const find = (v: number): { tex: string; v: number } => EXACT.find((e) => Math.abs(e.v - Math.abs(v)) < 1e-9)!;

export const exactValues11 = (id: string): Generator => choiceGen(id, (tier, r) => {
  const fn = tier === 1 ? pick(r, ['sin', 'cos'] as const) : pick(r, ['sin', 'cos', 'tan'] as const);
  const angles = tier === 1 ? [0, 30, 45, 60, 90] : tier === 2 ? [0, 30, 45, 60, 90] : [120, 135, 150, 210, 225, 240, 300, 315, 330];
  let a = 0, v = 0;
  do { a = pick(r, angles); v = fn === 'sin' ? Math.sin(rad(a)) : fn === 'cos' ? Math.cos(rad(a)) : Math.tan(rad(a)); } while (!Number.isFinite(v) || Math.abs(v) > 1e6);
  const right = find(v), neg = v < -1e-9;
  const pool = EXACT.filter((e) => (fn === 'tan' ? true : e.v <= 1) && !(e.v === right.v && !neg) );
  const cands: string[] = [];
  for (const e of pool) { cands.push(e.tex); if (e.v !== 0) cands.push(`-${e.tex}`); }
  const rightTex = signed(right, neg);
  const wrongs = cands.filter((c) => c !== rightTex).sort(() => r() - 0.5).slice(0, 3);
  const wrongWhy = (c: string): Text => (c.startsWith('-') !== neg && c.replace('-', '') === right.tex ? t('The size is right but the sign is not. Check which quadrant the angle is in: sine is positive in the first and second, cosine in the first and fourth, tangent in the first and third.', 'La valeur est bonne, mais pas le signe. Vérifie le quadrant de l\'angle : le sinus est positif aux premier et deuxième, le cosinus aux premier et quatrième, la tangente aux premier et troisième.') : t('This is the value for a different special angle. Use the reference angle (30°, 45° or 60°) and the exact-value triangles.', 'C\'est la valeur d\'un autre angle spécial. Utilise l\'angle de référence (30°, 45° ou 60°) et les triangles de valeurs exactes.'));
  const m = mc(r, bi((f) => f.m(rightTex)), wrongs.map((c): [Text, Text] => [bi((f) => f.m(c)), wrongWhy(c)]));
  const refAngle = a <= 90 ? a : a <= 180 ? 180 - a : a <= 270 ? a - 180 : 360 - a;
  return {
    prompt: bi((f) => f.t(`What is the exact value of ${f.m(`\\${fn} ${f.n(a)}^{\\circ}`)}?`, `Quelle est la valeur exacte de ${f.m(`\\${fn} ${f.n(a)}^{\\circ}`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`The reference angle is ${deg(f, refAngle)}, where ${f.m(`\\${fn} ${f.n(refAngle)}^{\\circ} = ${find(fn === 'sin' ? Math.sin(rad(refAngle)) : fn === 'cos' ? Math.cos(rad(refAngle)) : Math.tan(rad(refAngle))).tex}`)}.`, `L'angle de référence est ${deg(f, refAngle)}, où ${f.m(`\\${fn} ${f.n(refAngle)}^{\\circ} = ${find(fn === 'sin' ? Math.sin(rad(refAngle)) : fn === 'cos' ? Math.cos(rad(refAngle)) : Math.tan(rad(refAngle))).tex}`)}.`)), bi((f) => f.t(`${a > 90 ? 'Use the sign of the quadrant: ' : ''}the exact value is ${f.m(rightTex)}.`, `${a > 90 ? 'Utilise le signe du quadrant : ' : ''}la valeur exacte est ${f.m(rightTex)}.`))],
    nudge: t('Find the reference angle, recall its exact value, then fix the sign from the quadrant.', 'Trouve l\'angle de référence, rappelle sa valeur exacte, puis fixe le signe selon le quadrant.'),
  };
});

// ── reciprocal ratios ───────────────────────────────────────────────────────────

export const reciprocal11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier < 3) {
    const [p, q] = pick(r, [[1, 2], [1, 4], [1, 5], [2, 5], [4, 5], [1, 8], [5, 8], [3, 8], [1, 10], [3, 10]] as [number, number][]);
    const useSin = tier === 1 || r() < 0.5, name = useSin ? 'sin' : 'cos', rec = useSin ? 'csc' : 'sec', ans = r6(q / p);
    return {
      prompt: bi((f) => f.t(`If ${f.m(`\\${name} \\theta = ${f.n(p)}/${f.n(q)}`)}, what is ${f.m(`\\${rec} \\theta`)} as a decimal?`, `Si ${f.m(`\\${name} \\theta = ${f.n(p)}/${f.n(q)}`)}, que vaut ${f.m(`\\${rec} \\theta`)} sous forme décimale ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(p / q), t(`${rec} is the reciprocal of ${name}: flip the fraction.`, `${rec} est l'inverse de ${name} : renverse la fraction.`), 0], [r6(-q / p), t('The reciprocal keeps the same sign.', 'L\'inverse garde le même signe.'), 0], [r6(1 - p / q), t('The reciprocal ratio is 1 divided by the ratio, not 1 minus it.', 'Le rapport inverse est 1 divisé par le rapport, pas 1 moins le rapport.'), 0]]),
      steps: [t(`${rec} θ is 1 ÷ ${name} θ, so flip the fraction.`, `${rec} θ vaut 1 ÷ ${name} θ : renverse la fraction.`), bi((f) => f.t(`${f.m(`${f.n(q)} \\div ${f.n(p)}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(q)} \\div ${f.n(p)}`)} = ${f.N(ans)}.`))],
      nudge: t('Reciprocal ratios are the flipped fractions: csc = 1 ÷ sin, sec = 1 ÷ cos, cot = 1 ÷ tan.', 'Les rapports inverses sont les fractions renversées : csc = 1 ÷ sin, sec = 1 ÷ cos, cot = 1 ÷ tan.'),
    };
  }
  // three 3-4-5 situations, each in two quadrants, so the sign of the reciprocal matters
  const kind = pick(r, [0, 1, 2]), flip = r() < 0.5;
  const known = kind === 0 ? '\\sin \\theta = 3/5' : kind === 1 ? '\\sin \\theta = 4/5' : '\\cos \\theta = 3/5';
  const asked = kind === 0 ? '\\sec \\theta' : kind === 1 ? '\\cot \\theta' : '\\csc \\theta';
  const place = kind === 2 ? (flip ? 'in quadrant IV' : 'acute') : (flip ? 'obtuse' : 'acute');
  const placeFr = kind === 2 ? (flip ? 'dans le quadrant IV' : 'aigu') : (flip ? 'obtus' : 'aigu');
  const mag = kind === 1 ? 0.75 : 1.25, ans = flip ? -mag : mag;
  return {
    prompt: bi((f) => f.t(`If ${f.m(known)} and θ is ${kind === 2 ? 'an angle' : 'an angle'} ${place}, what is ${f.m(asked)} as a decimal?`, `Si ${f.m(known)} et θ est un angle ${placeFr}, que vaut ${f.m(asked)} sous forme décimale ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[-ans, t('Check the sign: it depends on the quadrant. Sine is positive in quadrants I and II, cosine in I and IV.', 'Vérifie le signe : il dépend du quadrant. Le sinus est positif aux quadrants I et II, le cosinus aux quadrants I et IV.'), 1], [r6(kind === 1 ? 4 / 3 : 5 / 3 * (flip ? -1 : 1)), t('That uses the wrong ratio. Find the missing side of the 3-4-5 triangle, then pick the right sides.', 'Cela utilise le mauvais rapport. Trouve le côté manquant du triangle 3-4-5, puis choisis les bons côtés.'), 1], [r6(kind === 1 ? 0.8 : 0.6), t('That is a sine or cosine, not the reciprocal ratio that was asked.', 'C\'est un sinus ou un cosinus, pas le rapport inverse demandé.'), 1]]),
    steps: [t('A 3-4-5 triangle fits: the sides are 3, 4 and the hypotenuse 5. The quadrant gives the signs.', 'Un triangle 3-4-5 convient : les côtés sont 3, 4 et l\'hypoténuse 5. Le quadrant donne les signes.'), bi((f) => f.t(`Using the reciprocal ratio, ${f.m(asked)} = ${f.N(ans)}.`, `Avec le rapport inverse, ${f.m(asked)} = ${f.N(ans)}.`))],
    nudge: t('Find the missing ratio with a 3-4-5 triangle, fix its sign from the quadrant, then use the reciprocal ratio.', 'Trouve le rapport manquant avec un triangle 3-4-5, fixe son signe selon le quadrant, puis utilise le rapport inverse.'),
  };
});

// ── identities ──────────────────────────────────────────────────────────────────

const IDENT: { expr: string; same: string; why: string; whyFr: string }[] = [
  { expr: '\\tan x \\cos x', same: '\\sin x', why: 'tan x = sin x ÷ cos x, so the cos x cancels.', whyFr: 'tan x = sin x ÷ cos x : le cos x se simplifie.' },
  { expr: '\\frac{\\sin x}{\\tan x}', same: '\\cos x', why: 'Replace tan x by sin x ÷ cos x and simplify.', whyFr: 'Remplace tan x par sin x ÷ cos x et simplifie.' },
  { expr: '1 - \\cos^{2} x', same: '\\sin^{2} x', why: 'sin²x + cos²x = 1, so 1 − cos²x = sin²x.', whyFr: 'sin²x + cos²x = 1 : donc 1 − cos²x = sin²x.' },
  { expr: '1 - \\sin^{2} x', same: '\\cos^{2} x', why: 'sin²x + cos²x = 1, so 1 − sin²x = cos²x.', whyFr: 'sin²x + cos²x = 1 : donc 1 − sin²x = cos²x.' },
  { expr: '\\frac{\\sin^{2} x}{1 - \\cos^{2} x}', same: '1', why: '1 − cos²x = sin²x, so the fraction is 1.', whyFr: '1 − cos²x = sin²x : la fraction vaut donc 1.' },
  { expr: '\\sin x \\cos x \\times \\frac{1}{\\cos x}', same: '\\sin x', why: 'The cos x terms cancel.', whyFr: 'Les termes en cos x se simplifient.' },
  { expr: '\\frac{\\sin x}{\\cos x} \\times \\cos x \\times \\frac{1}{\\sin x}', same: '1', why: 'Everything cancels, leaving 1.', whyFr: 'Tout se simplifie : il reste 1.' },
  { expr: '\\sin^{2} x + \\cos^{2} x + \\tan^{2} x', same: '1 + \\tan^{2} x', why: 'sin²x + cos²x = 1.', whyFr: 'sin²x + cos²x = 1.' },
];
const OPTS = ['\\sin x', '\\cos x', '\\tan x', '1', '\\sin^{2} x', '\\cos^{2} x', '1 + \\tan^{2} x'];
const evalId = (s: string, x: number): number => {
  const sx = Math.sin(x), cx = Math.cos(x), tx = Math.tan(x);
  const map: Record<string, number> = { '\\tan x \\cos x': tx * cx, '\\frac{\\sin x}{\\tan x}': sx / tx, '1 - \\cos^{2} x': 1 - cx * cx, '1 - \\sin^{2} x': 1 - sx * sx, '\\frac{\\sin^{2} x}{1 - \\cos^{2} x}': (sx * sx) / (1 - cx * cx), '\\sin x \\cos x \\times \\frac{1}{\\cos x}': sx, '\\frac{\\sin x}{\\cos x} \\times \\cos x \\times \\frac{1}{\\sin x}': 1, '\\sin^{2} x + \\cos^{2} x + \\tan^{2} x': 1 + tx * tx, '\\sin x': sx, '\\cos x': cx, '\\tan x': tx, '1': 1, '\\sin^{2} x': sx * sx, '\\cos^{2} x': cx * cx, '1 + \\tan^{2} x': 1 + tx * tx };
  return map[s]!;
};
export const identities11 = (id: string): Generator => {
  const pythag = numGen(id, (_tier, r) => {
    const [s, c] = pick(r, [[0.6, 0.8], [0.8, 0.6], [0.28, 0.96], [0.96, 0.28]]), useSin = r() < 0.5;
    const [given, ans, gn, an] = useSin ? [s, c, 'sin', 'cos'] as const : [c, s, 'cos', 'sin'] as const;
    return {
      prompt: bi((f) => f.t(`If ${f.m(`\\${gn} x = ${f.n(given)}`)} and x is an acute angle, use ${f.m('\\sin^{2} x + \\cos^{2} x = 1')} to find ${f.m(`\\${an} x`)}.`, `Si ${f.m(`\\${gn} x = ${f.n(given)}`)} et x est un angle aigu, utilise ${f.m('\\sin^{2} x + \\cos^{2} x = 1')} pour trouver ${f.m(`\\${an} x`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(1 - given), t('The identity uses squares: sin²x + cos²x = 1, so square first, then subtract.', 'L\'identité utilise des carrés : sin²x + cos²x = 1 : élève d\'abord au carré, puis soustrais.'), 1], [r6(1 - given * given), t('That is the square of the answer. Take the square root.', 'C\'est le carré de la réponse. Prends la racine carrée.'), 1], [-ans, t('x is acute, so both ratios are positive.', 'x est aigu : les deux rapports sont positifs.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(given)}^{2} + ${an}^{2} = 1`)}, so ${f.m(`${an}^{2} = ${f.n(r6(1 - given * given))}`)}.`, `${f.m(`${f.n(given)}^{2} + ${an}^{2} = 1`)}, donc ${f.m(`${an}^{2} = ${f.n(r6(1 - given * given))}`)}.`)), bi((f) => f.t(`x is acute, so ${f.m(`\\${an} x = ${f.n(ans)}`)}.`, `x est aigu : ${f.m(`\\${an} x = ${f.n(ans)}`)}.`))],
      nudge: t('Square the ratio you know, subtract from 1, then take the positive square root.', 'Élève au carré le rapport connu, soustrais de 1, puis prends la racine carrée positive.'),
    };
  });
  const simplify = (hard: boolean) => choiceGen(id, (_tier, r) => {
    const pool = hard ? IDENT.slice(2) : IDENT.slice(0, 4), it = pick(r, pool);
    const wrongs = OPTS.filter((o) => o !== it.same && [0.4, 0.9, 1.3, 2.2].some((x) => Math.abs(evalId(o, x) - evalId(it.expr, x)) > 1e-6)).sort(() => r() - 0.5).slice(0, 3);
    const m = mc(r, bi((f) => f.m(it.same)), wrongs.map((o): [Text, Text] => [bi((f) => f.m(o)), t('Substitute a value for x, or use tan x = sin x ÷ cos x and sin²x + cos²x = 1, to see that this is not equal.', 'Remplace x par une valeur, ou utilise tan x = sin x ÷ cos x et sin²x + cos²x = 1, pour voir que ce n\'est pas égal.')]));
    return {
      prompt: bi((f) => f.t(`Which expression is equal to ${f.m(it.expr)}?`, `Quelle expression est égale à ${f.m(it.expr)} ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t(it.why, it.whyFr), bi((f) => f.t(`So it equals ${f.m(it.same)}.`, `Elle est donc égale à ${f.m(it.same)}.`))],
      nudge: t('Use tan x = sin x ÷ cos x and sin²x + cos²x = 1 to simplify.', 'Utilise tan x = sin x ÷ cos x et sin²x + cos²x = 1 pour simplifier.'),
    };
  });
  return tierGen(pythag, simplify(false), simplify(true));
};

// ── the ambiguous case, and the laws with obtuse angles ─────────────────────────

export const ambiguous11 = (id: string): Generator => numGen(id, (tier, r) => {
  let A = 30, a = 5, b = 10, ans = 0;
  if (tier === 3) {
    A = pick(r, [100, 110, 120, 130]); b = randInt(r, 6, 14); a = randInt(r, 4, 16);
    while (a === b) a = randInt(r, 4, 16);
    ans = a > b ? 1 : 0;
  } else {
    A = tier === 1 ? 30 : pick(r, [30, 40, 50, 60]); b = tier === 1 ? randInt(r, 3, 8) * 2 : randInt(r, 6, 16);
    const h = b * Math.sin(rad(A)), kind = pick(r, ['none', 'one', 'two', 'big'] as const);
    if (kind === 'none') a = Math.max(1, Math.floor(h - 1));
    else if (kind === 'one' && A === 30) a = b / 2;
    else if (kind === 'big') a = b + randInt(r, 1, 4);
    else a = Math.min(b - 1, Math.ceil(h + 1));
    if (a >= b) ans = 1; else if (Math.abs(a - h) < 1e-9) ans = 1; else ans = a < h ? 0 : 2;
    if (Math.abs(a - h) < 0.3 && Math.abs(a - h) > 1e-9) a = Math.min(b - 1, Math.ceil(h + 1)), ans = a < h ? 0 : a >= b ? 1 : 2;
  }
  return {
    prompt: bi((f) => f.t(`In triangle ABC, angle A = ${deg(f, A)}, side a = ${f.N(a)} cm (opposite A) and side b = ${f.N(b)} cm. How many different triangles are possible?`, `Dans le triangle ABC, l'angle A = ${deg(f, A)}, le côté a = ${f.N(a)} cm (opposé à A) et le côté b = ${f.N(b)} cm. Combien de triangles différents sont possibles ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[(ans + 1) % 3, t('Compare side a with the height h = b sin A and with side b. Sketch the triangle.', 'Compare le côté a avec la hauteur h = b sin A et avec le côté b. Fais un croquis du triangle.'), 1], [(ans + 2) % 3, t('Compare side a with the height h = b sin A and with side b. Sketch the triangle.', 'Compare le côté a avec la hauteur h = b sin A et avec le côté b. Fais un croquis du triangle.'), 1]]),
    steps: tier === 3
      ? [t('Angle A is obtuse, so the other angles must be acute. A triangle exists only if a is the longest side: a > b.', 'L\'angle A est obtus : les autres angles doivent être aigus. Un triangle n\'existe que si a est le plus long côté : a > b.'), bi((f) => f.t(`Here a ${a > b ? '>' : '<'} b, so there ${ans === 1 ? 'is 1 triangle' : 'is no triangle'}.`, `Ici a ${a > b ? '>' : '<'} b : il y a ${ans === 1 ? '1 triangle' : 'aucun triangle'}.`))]
      : [bi((f) => f.t(`The height is ${f.m(`h = b \\sin A = ${f.n(b)} \\sin ${f.n(A)}^{\\circ}`)} ≈ ${f.N(r1(b * Math.sin(rad(A))))} cm.`, `La hauteur est ${f.m(`h = b \\sin A = ${f.n(b)} \\sin ${f.n(A)}^{\\circ}`)} ≈ ${f.N(r1(b * Math.sin(rad(A))))} cm.`)), t('If a < h: none. If a = h or a ≥ b: one. If h < a < b: two.', 'Si a < h : aucun. Si a = h ou a ≥ b : un. Si h < a < b : deux.')],
    nudge: t('Find the height b sin A, then compare it and side b with side a.', 'Trouve la hauteur b sin A, puis compare-la, ainsi que le côté b, avec le côté a.'),
  };
});

export const obtuseLaws11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 5, 15), b = randInt(r, 5, 15), C = randInt(r, 10, 14) * 10, c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(C))), ans = r1(c);
    return {
      prompt: bi((f) => f.t(`In triangle ABC, a = ${f.N(a)} cm, b = ${f.N(b)} cm and the obtuse angle C = ${deg(f, C)}. Find side c to one decimal.`, `Dans le triangle ABC, a = ${f.N(a)} cm, b = ${f.N(b)} cm et l'angle obtus C = ${deg(f, C)}. Trouve le côté c à une décimale près.`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(rad(C))), t('The cosine of an obtuse angle is negative, so −2ab cos C adds to a² + b². Keep the sign from the calculator.', 'Le cosinus d\'un angle obtus est négatif : −2ab cos C s\'ajoute à a² + b². Garde le signe donné par la calculatrice.'), 1], [a * a + b * b - 2 * a * b * Math.cos(rad(C)), t('That is c². Take the square root.', 'C\'est c². Prends la racine carrée.'), 1], [Math.sqrt(a * a + b * b), t('That is the Pythagorean theorem, which only works for 90°.', 'C\'est le théorème de Pythagore, qui ne vaut que pour 90°.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`c^{2} = ${f.n(a)}^{2} + ${f.n(b)}^{2} - 2(${f.n(a)})(${f.n(b)})\\cos ${f.n(C)}^{\\circ}`)}.`, `${f.m(`c^{2} = ${f.n(a)}^{2} + ${f.n(b)}^{2} - 2(${f.n(a)})(${f.n(b)})\\cos ${f.n(C)}^{\\circ}`)}.`)), bi((f) => f.t(`${f.m(`\\cos ${f.n(C)}^{\\circ}`)} is negative, so c ≈ ${f.N(ans)} cm.`, `${f.m(`\\cos ${f.n(C)}^{\\circ}`)} est négatif : c ≈ ${f.N(ans)} cm.`))],
      nudge: t('Use c² = a² + b² − 2ab cos C. For an obtuse angle, cos C is negative.', 'Utilise c² = a² + b² − 2ab cos C. Pour un angle obtus, cos C est négatif.'),
    };
  }
  if (tier === 2) {
    const A = randInt(r, 10, 14) * 10, B = randInt(r, 2, 4) * 10, a = randInt(r, 6, 20), ans = r1((a * Math.sin(rad(B))) / Math.sin(rad(A)));
    return {
      prompt: bi((f) => f.t(`In triangle ABC, angle A = ${deg(f, A)} (obtuse), angle B = ${deg(f, B)} and side a = ${f.N(a)} cm. Find side b to one decimal.`, `Dans le triangle ABC, l'angle A = ${deg(f, A)} (obtus), l'angle B = ${deg(f, B)} et le côté a = ${f.N(a)} cm. Trouve le côté b à une décimale près.`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[(a * Math.sin(rad(A))) / Math.sin(rad(B)), t('The sine law ratio is flipped. The unknown side b goes with sin B on top.', 'Le rapport de la loi des sinus est inversé. Le côté inconnu b va avec sin B au numérateur.'), 1], [(a * Math.sin(rad(180 - A))) / Math.sin(rad(B)), t('Use sin A with the obtuse angle as given; the calculator handles it, and sin A = sin(180° − A).', 'Utilise sin A avec l\'angle obtus donné ; la calculatrice s\'en charge, et sin A = sin(180° − A).'), 1], [a * Math.sin(rad(B)), t('Divide by sin A as well.', 'Divise aussi par sin A.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`\\frac{b}{\\sin ${f.n(B)}^{\\circ}} = \\frac{${f.n(a)}}{\\sin ${f.n(A)}^{\\circ}}`)}.`, `${f.m(`\\frac{b}{\\sin ${f.n(B)}^{\\circ}} = \\frac{${f.n(a)}}{\\sin ${f.n(A)}^{\\circ}}`)}.`)), bi((f) => f.t(`${f.m(`b = \\frac{${f.n(a)} \\sin ${f.n(B)}^{\\circ}}{\\sin ${f.n(A)}^{\\circ}}`)} ≈ ${f.N(ans)} cm.`, `${f.m(`b = \\frac{${f.n(a)} \\sin ${f.n(B)}^{\\circ}}{\\sin ${f.n(A)}^{\\circ}}`)} ≈ ${f.N(ans)} cm.`))],
      nudge: t('The sine law works for any triangle, including with an obtuse angle.', 'La loi des sinus vaut pour tout triangle, y compris avec un angle obtus.'),
    };
  }
  let a = 5, b = 6, c = 10;
  do { a = randInt(r, 4, 12); b = randInt(r, 4, 12); c = randInt(r, Math.max(a, b) + 1, a + b - 1); } while (a * a + b * b - c * c >= -0.05 * 2 * a * b);
  const ans = r1(toDeg(Math.acos((a * a + b * b - c * c) / (2 * a * b))));
  return {
    prompt: bi((f) => f.t(`A triangle has sides ${f.N(a)} cm, ${f.N(b)} cm and ${f.N(c)} cm. Find the largest angle, opposite the ${f.N(c)} cm side, to one decimal.`, `Un triangle a des côtés de ${f.N(a)} cm, ${f.N(b)} cm et ${f.N(c)} cm. Trouve le plus grand angle, opposé au côté de ${f.N(c)} cm, à une décimale près.`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[180 - ans, t('cos C is negative here, so C is obtuse. Take the inverse cosine directly; do not subtract from 180°.', 'cos C est négatif ici : C est obtus. Prends directement le cosinus inverse ; ne soustrais pas de 180°.'), 1], [toDeg(Math.acos(Math.abs((a * a + b * b - c * c) / (2 * a * b)))), t('The cosine is negative, which gives an angle over 90°.', 'Le cosinus est négatif, ce qui donne un angle de plus de 90°.'), 1], [toDeg(Math.acos((c * c - a * a - b * b) / (2 * a * b))), t('The signs are reversed. cos C = (a² + b² − c²) ÷ 2ab.', 'Les signes sont inversés. cos C = (a² + b² − c²) ÷ 2ab.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`\\cos C = \\frac{${f.n(a)}^{2} + ${f.n(b)}^{2} - ${f.n(c)}^{2}}{2(${f.n(a)})(${f.n(b)})}`)} is negative.`, `${f.m(`\\cos C = \\frac{${f.n(a)}^{2} + ${f.n(b)}^{2} - ${f.n(c)}^{2}}{2(${f.n(a)})(${f.n(b)})}`)} est négatif.`)), bi((f) => f.t(`So C = ${f.m(`\\cos^{-1}(\\ldots)`)} ≈ ${deg(f, ans)}, an obtuse angle.`, `Donc C = ${f.m(`\\cos^{-1}(\\ldots)`)} ≈ ${deg(f, ans)}, un angle obtus.`))],
    nudge: t('Use cos C = (a² + b² − c²) ÷ 2ab. A negative cosine means an obtuse angle.', 'Utilise cos C = (a² + b² − c²) ÷ 2ab. Un cosinus négatif signifie un angle obtus.'),
  };
});

// ── sinusoidal functions ────────────────────────────────────────────────────────

export const sinusoid11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = pick(r, [2, 3, 4, 5, -2, -3, 0.5]), c = randInt(r, -5, 8), k = pick(r, [2, 3, 4, 6, 0.5, 1.5]), d = pick(r, [10, 20, 30, 45, 60, 90, -30, -60]);
  const fname = (f: F): string => `y = ${a === -1 ? '-' : f.n(a)}\\sin(${f.n(k)}(x ${d < 0 ? '+' : '-'} ${f.n(Math.abs(d))}^{\\circ}))${c === 0 ? '' : c < 0 ? ` - ${f.n(-c)}` : ` + ${f.n(c)}`}`;
  if (tier === 1) {
    const maximum = r() < 0.5, ans = maximum ? c + Math.abs(a) : c - Math.abs(a);
    return {
      prompt: bi((f) => f.t(`What is the ${maximum ? 'maximum' : 'minimum'} value of ${f.m(fname(f))}?`, `Quelle est la valeur ${maximum ? 'maximale' : 'minimale'} de ${f.m(fname(f))} ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[maximum ? c - Math.abs(a) : c + Math.abs(a), t('That is the other extreme. Check whether the question asks for the maximum or the minimum.', 'C\'est l\'autre extrême. Vérifie si la question demande le maximum ou le minimum.'), 1], [a + c, t('The amplitude is the absolute value of a, so the extremes are c + |a| and c − |a|.', 'L\'amplitude est la valeur absolue de a : les extrêmes sont c + |a| et c − |a|.'), 1], [Math.abs(a), t('Add or subtract the amplitude from the midline c.', 'Ajoute ou soustrais l\'amplitude de l\'axe médian c.'), 1]].map(([v, w, s]) => [r6(v as number), w as Text, s as number] as [number, Text, number])),
      steps: [bi((f) => f.t(`The amplitude is ${f.m(`|a| = ${f.n(Math.abs(a))}`)} and the midline is ${f.m(`y = ${f.n(c)}`)}.`, `L'amplitude est ${f.m(`|a| = ${f.n(Math.abs(a))}`)} et l'axe médian est ${f.m(`y = ${f.n(c)}`)}.`)), bi((f) => f.t(`The ${maximum ? 'maximum' : 'minimum'} is ${f.m(`${f.n(c)} ${maximum ? '+' : '-'} ${f.n(Math.abs(a))}`)} = ${f.N(ans)}.`, `Le ${maximum ? 'maximum' : 'minimum'} est ${f.m(`${f.n(c)} ${maximum ? '+' : '-'} ${f.n(Math.abs(a))}`)} = ${f.N(ans)}.`))],
      nudge: t('The graph goes |a| above and below the midline y = c.', 'Le graphique monte et descend de |a| de part et d\'autre de l\'axe médian y = c.'),
    };
  }
  if (tier === 2) {
    const period = r6(360 / k);
    return {
      prompt: bi((f) => f.t(`What is the period, in degrees, of ${f.m(fname(f))}?`, `Quelle est la période, en degrés, de ${f.m(fname(f))} ?`)),
      answer: period, category: 'KU',
      wrong: wr(period, [[r6(360 * k), t('The period is 360° divided by k, not multiplied.', 'La période est 360° divisée par k, pas multipliée.'), 1], [k, t('That is k itself. The period is 360° ÷ k.', 'C\'est k lui-même. La période est 360° ÷ k.'), 1], [360, t('That is the period of y = sin x. The factor k changes it.', 'C\'est la période de y = sin x. Le facteur k la modifie.'), 1]].map(([v, w, s]) => [r6(v as number), w as Text, s as number] as [number, Text, number])),
      steps: [t('For y = a sin(k(x − d)) + c, the period is 360° ÷ k.', 'Pour y = a sin(k(x − d)) + c, la période est 360° ÷ k.'), bi((f) => f.t(`${f.m(`360 \\div ${f.n(k)}`)} = ${f.N(period)} degrees.`, `${f.m(`360 \\div ${f.n(k)}`)} = ${f.N(period)} degrés.`))],
      nudge: t('Divide 360° by the number k that multiplies the bracket.', 'Divise 360° par le nombre k qui multiplie la parenthèse.'),
    };
  }
  const aa = pick(r, [2, 3, 4, 5, 10]), cc = randInt(r, 5, 15), kk = pick(r, [1, 2, 3]), step = pick(r, [0, 30, 90, 150, 210, 270, 330]);
  const sinv = step === 0 ? 0 : step === 30 || step === 150 ? 0.5 : step === 90 ? 1 : step === 210 || step === 330 ? -0.5 : -1;
  const x = step / kk, ans = aa * sinv + cc;
  return {
    prompt: bi((f) => f.t(`A Ferris wheel rider's height in metres is ${f.m(`h = ${f.n(aa)}\\sin(${f.n(kk)}x) + ${f.n(cc)}`)}, where x is the angle turned in degrees. What is the height when x = ${f.N(x)}°?`, `La hauteur en mètres d'une personne dans une grande roue est ${f.m(`h = ${f.n(aa)}\\sin(${f.n(kk)}x) + ${f.n(cc)}`)}, où x est l'angle parcouru en degrés. Quelle est la hauteur quand x = ${f.N(x)}° ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[aa * sinv, t('Add the midline height c to the sine part.', 'Ajoute la hauteur de l\'axe médian c à la partie sinus.'), 1], [aa + cc, t('That is the maximum. Work out the angle kx first and use its sine.', 'C\'est le maximum. Calcule d\'abord l\'angle kx et utilise son sinus.'), 1], [aa * Math.abs(sinv) + cc + (sinv < 0 ? 0 : aa * 0.5), t('Check the sign of sin(kx) for this angle.', 'Vérifie le signe de sin(kx) pour cet angle.'), 1]].map(([v, w, s]) => [r6(v as number), w as Text, s as number] as [number, Text, number])),
    steps: [bi((f) => f.t(`The angle inside is ${f.m(`${f.n(kk)} \\times ${f.n(x)}`)} = ${deg(f, step)}, and ${f.m(`\\sin ${f.n(step)}^{\\circ}`)} = ${f.N(sinv)}.`, `L'angle à l'intérieur est ${f.m(`${f.n(kk)} \\times ${f.n(x)}`)} = ${deg(f, step)}, et ${f.m(`\\sin ${f.n(step)}^{\\circ}`)} = ${f.N(sinv)}.`)), bi((f) => f.t(`${f.m(`h = ${f.n(aa)}(${f.n(sinv)}) + ${f.n(cc)}`)} = ${f.N(ans)} metres.`, `${f.m(`h = ${f.n(aa)}(${f.n(sinv)}) + ${f.n(cc)}`)} = ${f.N(ans)} mètres.`))],
    nudge: t('Work out the angle inside the sine, find its sine, multiply by the amplitude and add the midline.', 'Calcule l\'angle dans le sinus, trouve son sinus, multiplie par l\'amplitude et ajoute l\'axe médian.'),
  };
});

/** MCF3M.C2: the sine function with a sin x, sin x + c and sin(x − d) */
export const sineFunction11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = pick(r, [2, 3, 4, 5, 10]), c = randInt(r, -5, 9), d = pick(r, [10, 20, 30, 40, 50, 60]);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`What is the maximum value of ${f.m(`y = ${f.n(a)}\\sin x`)}?`, `Quelle est la valeur maximale de ${f.m(`y = ${f.n(a)}\\sin x`)} ?`)),
      answer: a, category: 'KU',
      wrong: wr(a, [[-a, t('The sine never goes above 1, so the maximum is a × 1.', 'Le sinus ne dépasse jamais 1 : le maximum est a × 1.'), 0], [r6(a / 2), t('The largest sin x is 1, so multiply a by 1.', 'Le plus grand sin x est 1 : multiplie a par 1.'), 0], [a + 1, t('Do not add 1. The maximum of sin x is 1, and a multiplies it.', 'N\'ajoute pas 1. Le maximum de sin x est 1 et a le multiplie.'), 0]]),
      steps: [t('The largest value of sin x is 1, and a multiplies it.', 'La plus grande valeur de sin x est 1 et a la multiplie.'), bi((f) => f.t(`The maximum is ${f.N(a)}.`, `Le maximum est ${f.N(a)}.`))],
      nudge: t('sin x goes between −1 and 1.', 'sin x varie entre −1 et 1.'),
    };
  }
  if (tier === 2) {
    const mn = c - a;
    return {
      prompt: bi((f) => f.t(`What is the minimum value of ${f.m(`y = ${f.n(a)}\\sin x ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}?`, `Quelle est la valeur minimale de ${f.m(`y = ${f.n(a)}\\sin x ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)} ?`)),
      answer: mn, category: 'AP',
      wrong: wr(mn, [[c + a, t('That is the maximum. The minimum uses sin x = −1.', 'C\'est le maximum. Le minimum utilise sin x = −1.'), 1], [a - c, t('The constant c shifts the whole graph. Keep its sign.', 'La constante c déplace tout le graphique. Garde son signe.'), 1], [-a, t('Add the vertical shift c.', 'Ajoute le déplacement vertical c.'), 1]]),
      steps: [t('The smallest value of a sin x is −a.', 'La plus petite valeur de a sin x est −a.'), bi((f) => f.t(`Adding the shift: ${f.m(`${f.n(-a)} ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)} = ${f.N(mn)}.`, `En ajoutant le déplacement : ${f.m(`${f.n(-a)} ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)} = ${f.N(mn)}.`))],
      nudge: t('Minimum = c − a, because sin x ≥ −1.', 'Minimum = c − a, parce que sin x ≥ −1.'),
    };
  }
  const first = (d + 90) % 360;
  return {
    prompt: bi((f) => f.t(`For ${f.m(`y = \\sin(x - ${f.n(d)}^{\\circ})`)}, what is the smallest positive value of x, in degrees, where y is at its maximum?`, `Pour ${f.m(`y = \\sin(x - ${f.n(d)}^{\\circ})`)}, quelle est la plus petite valeur positive de x, en degrés, où y est à son maximum ?`)),
    answer: first, category: 'AP',
    wrong: wr(first, [[(90 - d + 360) % 360, t('The graph shifts d to the right, so add d to 90°.', 'Le graphique se déplace de d vers la droite : ajoute d à 90°.'), 1], [d, t('That is the shift, not where the maximum is. The maximum of sin x is at 90°, shifted by d.', 'C\'est le déplacement, pas l\'endroit du maximum. Le maximum de sin x est à 90°, déplacé de d.'), 1], [90, t('That is where y = sin x peaks, before the shift.', 'C\'est là où y = sin x culmine, avant le déplacement.'), 1]]),
    steps: [t('y = sin x has its maximum at x = 90°. The graph is shifted right by d.', 'y = sin x a son maximum à x = 90°. Le graphique est déplacé de d vers la droite.'), bi((f) => f.t(`${f.m(`90 + ${f.n(d)}`)} = ${f.N(first)} degrees.`, `${f.m(`90 + ${f.n(d)}`)} = ${f.N(first)} degrés.`))],
    nudge: t('Take the position of the maximum of sin x (90°) and shift it to the right by d.', 'Prends la position du maximum de sin x (90°) et déplace-la vers la droite de d.'),
  };
});

/** MCF3M.C1: two right triangles sharing a height */
export const twoTriangles11 = (id: string): Generator => numGen(id, (tier, r) => {
  const [near, farA] = tier === 1 ? [45, 30] : tier === 2 ? [60, 45] : pick(r, [[60, 30], [45, 30], [60, 45]] as [number, number][]);
  const d = pick(r, [10, 20, 30, 40, 50]), cot = (x: number): number => 1 / Math.tan(rad(x)), h = d / (cot(farA) - cot(near)), ans = r1(h);
  return {
    prompt: bi((f) => f.t(`From a point on level ground the angle of elevation to the top of a tower is ${deg(f, near)}. From a point ${f.N(d)} m farther back, in line with the tower, it is ${deg(f, farA)}. How tall is the tower, in metres, to one decimal?`, `D'un point sur un sol plat, l'angle d'élévation du sommet d'une tour est de ${deg(f, near)}. D'un point situé ${f.N(d)} m plus loin, dans l'alignement de la tour, il est de ${deg(f, farA)}. Quelle est la hauteur de la tour, en mètres, à une décimale près ?`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[d * Math.tan(rad(farA)), t('That uses only one triangle with the distance d. The tower is also at an unknown distance from the near point, so use both triangles.', 'Cela n\'utilise qu\'un seul triangle avec la distance d. La tour est aussi à une distance inconnue du point proche : utilise les deux triangles.'), 1], [d / (Math.tan(rad(near)) - Math.tan(rad(farA))), t('Write the ground distances as h ÷ tan θ (cot θ times h), then subtract.', 'Écris les distances au sol sous la forme h ÷ tan θ (cot θ fois h), puis soustrais.'), 1], [d * (cot(farA) + cot(near)), t('The two ground distances differ by d, so subtract them: d = h cot(far) − h cot(near).', 'Les deux distances au sol diffèrent de d : soustrais-les : d = h cot(loin) − h cot(près).'), 1]]),
    steps: [bi((f) => f.t(`Ground distances: ${f.m(`h \\cot ${f.n(near)}^{\\circ}`)} from the near point and ${f.m(`h \\cot ${f.n(farA)}^{\\circ}`)} from the far point. They differ by ${f.N(d)} m.`, `Distances au sol : ${f.m(`h \\cot ${f.n(near)}^{\\circ}`)} du point proche et ${f.m(`h \\cot ${f.n(farA)}^{\\circ}`)} du point éloigné. Elles diffèrent de ${f.N(d)} m.`)), bi((f) => f.t(`${f.m(`h = \\frac{${f.n(d)}}{\\cot ${f.n(farA)}^{\\circ} - \\cot ${f.n(near)}^{\\circ}}`)} ≈ ${f.N(ans)} m.`, `${f.m(`h = \\frac{${f.n(d)}}{\\cot ${f.n(farA)}^{\\circ} - \\cot ${f.n(near)}^{\\circ}}`)} ≈ ${f.N(ans)} m.`))],
    nudge: t('Draw two right triangles that share the tower height. Write each ground distance using the height.', 'Dessine deux triangles rectangles qui partagent la hauteur de la tour. Écris chaque distance au sol à l\'aide de la hauteur.'),
  };
});
