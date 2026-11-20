// Grade 5 fractions: naming, equivalence, mixed numbers, comparing.
import { makeRng, pick, randInt, shuffle } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { build, frac, gcd, mixedTex, t, tex } from './kit.js';

const SYMBOLS = ['<', '>', '='] as const;
const symbolOptions: Text[] = SYMBOLS.map((s) => t(tex(s), tex(s)));
const symbolIndex = (a: number, b: number): number => (a < b ? 0 : a > b ? 1 : 2);

/** MS.G5.B1.3.a: name the fraction shown by a picture */
export const nameFraction: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = tier === 1 ? pick(r, [2, 3, 4]) : tier === 2 ? randInt(r, 5, 8) : randInt(r, 9, 12);
  const n = randInt(r, 1, d - 1);
  const story = tier === 3 && r() < 0.5;
  return build({
    skill: 'MS.G5.B1.3.a', tier, seed, category: story ? 'AP' : 'KU', format: 'fraction',
    prompt: story
      ? t(`A ribbon is cut into ${d} equal pieces. ${n} of the pieces are shaded. What fraction of the ribbon is shaded?`,
          `Un ruban est coupé en ${d} morceaux égaux. ${n} morceaux sont ombrés. Quelle fraction du ruban est ombrée ?`)
      : t('What fraction of the bar is shaded?', 'Quelle fraction de la barre est ombrée ?'),
    visual: { type: 'fractionBar', n, d },
    answer: { kind: 'fraction', n, d },
    steps: [
      t(`Count the equal parts in the whole bar: there are ${d}.`, `Compte les parties égales de la barre entière : il y en a ${d}.`),
      t(`Count the shaded parts: there are ${n}.`, `Compte les parties ombrées : il y en a ${n}.`),
      t(`Write shaded over total: ${tex(frac(n, d))}.`, `Écris les parties ombrées sur le total : ${tex(frac(n, d))}.`),
    ],
    nudge: t('How many equal parts is the whole bar split into? That number goes on the bottom.', 'En combien de parties égales la barre entière est-elle séparée ? Ce nombre va en bas.'),
    stepHint: t(`The whole bar has ${d} equal parts, so the denominator is ${d}.`, `La barre entière a ${d} parties égales, donc le dénominateur est ${d}.`),
    wrong: [
      { answer: { kind: 'fraction', n: d - n, d }, stepIndex: 1, why: t('It looks like the parts that are not shaded were counted. The numerator counts the shaded parts.', 'Il semble que les parties non ombrées ont été comptées. Le numérateur compte les parties ombrées.') },
      { answer: { kind: 'fraction', n, d: d - n }, stepIndex: 0, why: t('It looks like shaded parts were compared with the unshaded parts. The denominator is the total number of equal parts.', 'Il semble que les parties ombrées ont été comparées aux parties non ombrées. Le dénominateur est le nombre total de parties égales.') },
      { answer: { kind: 'fraction', n: d, d: n }, stepIndex: 2, why: t('It looks like the numerator and denominator were switched. Shaded parts go on top.', 'Il semble que le numérateur et le dénominateur ont été inversés. Les parties ombrées vont en haut.') },
    ],
    praise: t('Nice, you counted the equal parts first.', 'Bravo, tu as d\'abord compté les parties égales.'),
  });
};

/** MS.G5.B1.3.b: find an equivalent fraction */
export const equivalentFraction: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const b = tier === 1 ? pick(r, [2, 3, 4, 5]) : randInt(r, 2, 12);
  const a = randInt(r, 1, b - 1);
  const k = tier === 1 ? pick(r, [2, 3]) : randInt(r, 2, 5);
  const kind = tier === 3 ? pick(r, ['denominator', 'multi'] as const) : 'numerator';

  if (kind === 'multi') {
    const good = [1, 2, 3].filter(() => true).map((m) => ({ n: a * (m + 1), d: b * (m + 1) }));
    const picks = shuffle(r, good).slice(0, 2);
    const bad: { n: number; d: number }[] = [];
    while (bad.length < 2) {
      const d2 = b * randInt(r, 2, 4);
      const cand = { n: a * (d2 / b) + pick(r, [1, 2, -1]), d: d2 };
      if (cand.n > 0 && cand.n * b !== a * cand.d && !bad.some((x) => x.n === cand.n && x.d === cand.d)) bad.push(cand);
    }
    const all = shuffle(r, [...picks.map((p) => ({ ...p, ok: true })), ...bad.map((p) => ({ ...p, ok: false }))]);
    return build({
      skill: 'MS.G5.B1.3.b', tier, seed, category: 'TH', format: 'multi',
      prompt: t(`Select every fraction that is equal to ${tex(frac(a, b))}.`, `Choisis toutes les fractions égales à ${tex(frac(a, b))}.`),
      options: all.map((f) => t(tex(frac(f.n, f.d)), tex(frac(f.n, f.d)))),
      answer: { kind: 'multi', indices: all.map((f, i) => (f.ok ? i : -1)).filter((i) => i >= 0) },
      steps: [
        t(`Multiply the top and bottom of ${tex(frac(a, b))} by the same number to get equal fractions.`, `Multiplie le numérateur et le dénominateur de ${tex(frac(a, b))} par le même nombre pour obtenir des fractions égales.`),
        t(`Check each choice: does its top and bottom come from multiplying ${a} and ${b} by the same number?`, `Vérifie chaque choix : son numérateur et son dénominateur viennent-ils de la multiplication de ${a} et de ${b} par le même nombre ?`),
      ],
      nudge: t('Equal fractions come from multiplying top and bottom by the same number.', 'Les fractions égales viennent de la multiplication du haut et du bas par le même nombre.'),
      stepHint: t(`Try ${a} × 2 and ${b} × 2. Does a choice match?`, `Essaie ${a} × 2 et ${b} × 2. Un choix correspond-il ?`),
    });
  }

  if (kind === 'denominator') {
    return build({
      skill: 'MS.G5.B1.3.b', tier, seed, category: 'KU', format: 'number',
      prompt: t(`Find the missing number: ${tex(`${frac(a, b)} = ${frac(a * k, '?')}`)}`, `Trouve le nombre manquant : ${tex(`${frac(a, b)} = ${frac(a * k, '?')}`)}`),
      answer: { kind: 'number', value: b * k },
      steps: [
        t(`The numerator went from ${a} to ${a * k}, so it was multiplied by ${k}.`, `Le numérateur est passé de ${a} à ${a * k}, donc il a été multiplié par ${k}.`),
        t(`Multiply the denominator by ${k} too: ${b} × ${k} = ${b * k}.`, `Multiplie aussi le dénominateur par ${k} : ${b} × ${k} = ${b * k}.`),
      ],
      nudge: t('What number was the top multiplied by? The bottom is multiplied by the same number.', 'Par quel nombre le haut a-t-il été multiplié ? Le bas est multiplié par le même nombre.'),
      stepHint: t(`The top was multiplied by ${k}.`, `Le haut a été multiplié par ${k}.`),
      wrong: [
        { answer: { kind: 'number', value: b + (a * k - a) }, stepIndex: 1, why: t('It looks like the same number was added to the top and the bottom. For equal fractions, multiply both by the same number instead.', 'Il semble que le même nombre a été ajouté en haut et en bas. Pour obtenir des fractions égales, il faut multiplier les deux par le même nombre.') },
        { answer: { kind: 'number', value: b }, stepIndex: 1, why: t('It looks like the denominator was left unchanged. It has to be multiplied by the same number as the numerator.', 'Il semble que le dénominateur n\'a pas changé. Il doit être multiplié par le même nombre que le numérateur.') },
      ],
      praise: t('Nice, you found what the top was multiplied by.', 'Bravo, tu as trouvé par quoi le haut a été multiplié.'),
    });
  }

  return build({
    skill: 'MS.G5.B1.3.b', tier, seed, category: 'KU', format: 'number',
    prompt: t(`Find the missing number: ${tex(`${frac(a, b)} = ${frac('?', b * k)}`)}`, `Trouve le nombre manquant : ${tex(`${frac(a, b)} = ${frac('?', b * k)}`)}`),
    visual: tier === 1 ? { type: 'fractionBars', bars: [{ n: a, d: b }, { n: a * k, d: b * k }] } : undefined,
    answer: { kind: 'number', value: a * k },
    steps: [
      t(`The denominator went from ${b} to ${b * k}, so it was multiplied by ${k}.`, `Le dénominateur est passé de ${b} à ${b * k}, donc il a été multiplié par ${k}.`),
      t(`Multiply the numerator by ${k} too: ${a} × ${k} = ${a * k}.`, `Multiplie aussi le numérateur par ${k} : ${a} × ${k} = ${a * k}.`),
    ],
    nudge: t('What number was the bottom multiplied by? The top is multiplied by the same number.', 'Par quel nombre le bas a-t-il été multiplié ? Le haut est multiplié par le même nombre.'),
    stepHint: t(`The bottom was multiplied by ${k}.`, `Le bas a été multiplié par ${k}.`),
    wrong: [
      { answer: { kind: 'number', value: a + (b * k - b) }, stepIndex: 1, why: t('It looks like the same number was added to the top and the bottom. For equal fractions, multiply both by the same number instead.', 'Il semble que le même nombre a été ajouté en haut et en bas. Pour obtenir des fractions égales, il faut multiplier les deux par le même nombre.') },
      { answer: { kind: 'number', value: a }, stepIndex: 1, why: t('It looks like the numerator was left unchanged. It has to be multiplied by the same number as the denominator.', 'Il semble que le numérateur n\'a pas changé. Il doit être multiplié par le même nombre que le dénominateur.') },
      { answer: { kind: 'number', value: b * k }, stepIndex: 1, why: t('It looks like the new denominator was copied into the numerator. Multiply the numerator to find it.', 'Il semble que le nouveau dénominateur a été copié au numérateur. Multiplie le numérateur pour le trouver.') },
    ],
    praise: t('Nice, you multiplied the top and bottom by the same number.', 'Bravo, tu as multiplié le haut et le bas par le même nombre.'),
  });
};

/** MS.G5.B1.3.c: improper fractions and mixed numbers */
export const mixedNumbers: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = tier === 1 ? randInt(r, 2, 5) : randInt(r, 3, 12);
  const whole = randInt(r, 1, 4);
  const n = randInt(r, 1, d - 1);
  const top = whole * d + n;

  if (tier === 3) {
    return build({
      skill: 'MS.G5.B1.3.c', tier, seed, category: 'KU', format: 'fraction',
      prompt: t(`Write ${tex(mixedTex(whole, n, d))} as an improper fraction.`, `Écris ${tex(mixedTex(whole, n, d))} sous forme de fraction impropre.`),
      answer: { kind: 'fraction', n: top, d },
      steps: [
        t(`Change the whole number to ${d}ths: ${whole} × ${d} = ${whole * d}.`, `Transforme le nombre entier en ${d}es : ${whole} × ${d} = ${whole * d}.`),
        t(`Add the extra ${n} parts: ${whole * d} + ${n} = ${top}.`, `Ajoute les ${n} parties de plus : ${whole * d} + ${n} = ${top}.`),
        t(`The improper fraction is ${tex(frac(top, d))}.`, `La fraction impropre est ${tex(frac(top, d))}.`),
      ],
      nudge: t('How many parts are in each whole? Multiply that by the whole number, then add the extra parts.', 'Combien de parties y a-t-il dans chaque entier ? Multiplie par le nombre entier, puis ajoute les parties de plus.'),
      stepHint: t(`Each whole has ${d} parts, so ${whole} wholes have ${whole * d} parts.`, `Chaque entier a ${d} parties, donc ${whole} entiers ont ${whole * d} parties.`),
      wrong: [
        { answer: { kind: 'fraction', n: whole + n, d }, stepIndex: 0, why: t('It looks like the whole number was added to the numerator. Each whole is worth several parts, so multiply it by the denominator first.', 'Il semble que le nombre entier a été ajouté au numérateur. Chaque entier vaut plusieurs parties : multiplie-le d\'abord par le dénominateur.') },
        { answer: { kind: 'fraction', n: whole * n, d }, stepIndex: 0, why: t('It looks like the whole number was multiplied by the numerator. Multiply it by the denominator, then add the numerator.', 'Il semble que le nombre entier a été multiplié par le numérateur. Multiplie-le par le dénominateur, puis ajoute le numérateur.') },
      ],
      praise: t('Nice, you turned the wholes into parts first.', 'Bravo, tu as d\'abord transformé les entiers en parties.'),
    });
  }

  return build({
    skill: 'MS.G5.B1.3.c', tier, seed, category: 'KU', format: 'mixed',
    prompt: t(`Write ${tex(frac(top, d))} as a mixed number.`, `Écris ${tex(frac(top, d))} sous forme de nombre fractionnaire.`),
    answer: { kind: 'mixed', whole, n, d },
    steps: [
      t(`Divide ${top} by ${d}: ${top} ÷ ${d} = ${whole} remainder ${n}.`, `Divise ${top} par ${d} : ${top} ÷ ${d} = ${whole}, reste ${n}.`),
      t(`The quotient ${whole} is the whole number and the remainder ${n} is the new numerator.`, `Le quotient ${whole} est le nombre entier et le reste ${n} est le nouveau numérateur.`),
      t(`The mixed number is ${tex(mixedTex(whole, n, d))}.`, `Le nombre fractionnaire est ${tex(mixedTex(whole, n, d))}.`),
    ],
    nudge: t(`How many whole groups of ${d} fit in ${top}? What is left over?`, `Combien de groupes entiers de ${d} y a-t-il dans ${top} ? Que reste-t-il ?`),
    stepHint: t(`${top} ÷ ${d} is ${whole} with ${n} left over.`, `${top} ÷ ${d} donne ${whole}, avec un reste de ${n}.`),
    wrong: [
      { answer: { kind: 'mixed', whole: n, n: whole, d }, stepIndex: 1, why: t('It looks like the whole number and the remainder were switched. The quotient is the whole number.', 'Il semble que le nombre entier et le reste ont été inversés. Le quotient est le nombre entier.') },
      { answer: { kind: 'mixed', whole: whole + 1, n, d }, stepIndex: 0, why: t('It looks like the whole number is one too big. Count only the complete groups.', 'Il semble que le nombre entier est trop grand de 1. Compte seulement les groupes complets.') },
    ],
    praise: t('Nice, you divided to find the wholes.', 'Bravo, tu as divisé pour trouver les entiers.'),
  });
};

/** MS.G5.B1.4.a: compare fractions with the same denominator */
export const compareLike: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = tier === 1 ? randInt(r, 3, 6) : randInt(r, 4, 12);
  let a = randInt(r, 1, tier === 3 ? d + d : d - 1);
  let b = randInt(r, 1, tier === 3 ? d + d : d - 1);
  if (tier === 1) while (a === b) b = randInt(r, 1, d - 1);
  if (tier === 3 && r() < 0.2) b = a;
  const idx = symbolIndex(a, b);
  const opposite = idx === 0 ? 1 : idx === 1 ? 0 : -1;
  return build({
    skill: 'MS.G5.B1.4.a', tier, seed, category: 'KU', format: 'choice',
    prompt: t(`Which symbol makes this true? ${tex(`${frac(a, d)} \\ ? \\ ${frac(b, d)}`)}`, `Quel symbole rend l'énoncé vrai ? ${tex(`${frac(a, d)} \\ ? \\ ${frac(b, d)}`)}`),
    visual: tier === 1 ? { type: 'fractionBars', bars: [{ n: a, d }, { n: b, d }] } : undefined,
    options: symbolOptions,
    answer: { kind: 'choice', index: idx },
    steps: [
      t(`Both fractions have the same denominator, ${d}, so the parts are the same size.`, `Les deux fractions ont le même dénominateur, ${d}, donc les parties ont la même taille.`),
      t(`Compare the numerators: ${a} and ${b}.`, `Compare les numérateurs : ${a} et ${b}.`),
      t(`${a} ${a < b ? 'is less than' : a > b ? 'is greater than' : 'equals'} ${b}, so use ${tex(SYMBOLS[idx]!)}.`, `${a} ${a < b ? 'est plus petit que' : a > b ? 'est plus grand que' : 'est égal à'} ${b}, donc utilise ${tex(SYMBOLS[idx]!)}.`),
    ],
    nudge: t('When the denominators match, the parts are the same size. What can you compare?', 'Quand les dénominateurs sont pareils, les parties ont la même taille. Que peux-tu comparer ?'),
    stepHint: t(`Compare the numerators ${a} and ${b}.`, `Compare les numérateurs ${a} et ${b}.`),
    wrong: opposite >= 0 ? [{ answer: { kind: 'choice', index: opposite }, stepIndex: 1, why: t('It looks like the symbol points the wrong way. The bigger numerator makes the bigger fraction when the denominators are the same.', 'Il semble que le symbole est dans le mauvais sens. Quand les dénominateurs sont pareils, le plus grand numérateur donne la plus grande fraction.') }] : [],
    praise: t('Nice, you compared the numerators.', 'Bravo, tu as comparé les numérateurs.'),
  });
};

/** MS.G5.B1.4.b: compare fractions using equivalent fractions */
export const compareUnlike: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const pairs: [number, number][] = tier === 1 ? [[2, 4], [3, 6], [2, 6], [4, 12], [3, 12], [2, 12]] : tier === 2 ? [[2, 3], [3, 4], [2, 6], [4, 6], [3, 12], [4, 12], [6, 12]] : [[2, 3], [3, 4], [4, 6], [5, 10], [3, 6], [6, 12], [4, 12]];
  let [d1, d2] = pick(r, pairs);
  if (r() < 0.5) [d1, d2] = [d2, d1];
  const a = randInt(r, 1, d1 - 1);
  let b = randInt(r, 1, d2 - 1);
  const common = (d1 * d2) / gcd(d1, d2);
  if (tier === 3 && r() < 0.3) b = Math.max(1, Math.min(d2 - 1, Math.round((a * d2) / d1))); // sometimes equal
  const va = a * (common / d1);
  const vb = b * (common / d2);
  const idx = symbolIndex(va, vb);
  return build({
    skill: 'MS.G5.B1.4.b', tier, seed, category: 'TH', format: 'choice',
    prompt: t(`Which symbol makes this true? ${tex(`${frac(a, d1)} \\ ? \\ ${frac(b, d2)}`)}`, `Quel symbole rend l'énoncé vrai ? ${tex(`${frac(a, d1)} \\ ? \\ ${frac(b, d2)}`)}`),
    options: symbolOptions,
    answer: { kind: 'choice', index: idx },
    steps: [
      t(`Find a denominator both ${d1} and ${d2} go into: ${common}.`, `Trouve un dénominateur dans lequel ${d1} et ${d2} entrent : ${common}.`),
      t(`Rewrite: ${tex(`${frac(a, d1)} = ${frac(va, common)}`)} and ${tex(`${frac(b, d2)} = ${frac(vb, common)}`)}.`, `Réécris : ${tex(`${frac(a, d1)} = ${frac(va, common)}`)} et ${tex(`${frac(b, d2)} = ${frac(vb, common)}`)}.`),
      t(`Compare ${va} and ${vb}: use ${tex(SYMBOLS[idx]!)}.`, `Compare ${va} et ${vb} : utilise ${tex(SYMBOLS[idx]!)}.`),
    ],
    nudge: t('Can you rewrite both fractions so they have the same denominator?', 'Peux-tu réécrire les deux fractions avec le même dénominateur ?'),
    stepHint: t(`Both ${d1} and ${d2} go into ${common}. Rewrite each fraction in ${common}ths.`, `${d1} et ${d2} entrent dans ${common}. Réécris chaque fraction en ${common}es.`),
    wrong: [
      { answer: { kind: 'choice', index: symbolIndex(a, b) }, stepIndex: 1, why: t('It looks like only the numerators were compared. The parts are different sizes, so first rewrite with a common denominator.', 'Il semble que seuls les numérateurs ont été comparés. Les parties ont des tailles différentes : réécris d\'abord avec un dénominateur commun.') },
      { answer: { kind: 'choice', index: symbolIndex(d2, d1) }, stepIndex: 1, why: t('It looks like the denominators were compared, and the bigger denominator was treated as the bigger fraction. A bigger denominator means smaller parts.', 'Il semble que les dénominateurs ont été comparés. Un plus grand dénominateur signifie des parties plus petites.') },
    ],
    praise: t('Nice, you used a common denominator.', 'Bravo, tu as utilisé un dénominateur commun.'),
  });
};
