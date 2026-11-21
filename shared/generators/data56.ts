// Grades 5-6 Data strand (D): mean, median, mode and range; probability as fractions, decimals and percents.
import { randInt, shuffle } from '../rng.js';
import type { Rng } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { makeRng } from '../rng.js';
import { bi, numGen, r6 } from './dsl.js';
import { build, frac, gcd, t, tex } from './kit.js';

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : r6((s[m - 1]! + s[m]!) / 2);
};
const listTex = (f: { n: (x: number) => string }, xs: number[]): string => xs.map((x) => f.n(x)).join(',\\ ');

/** A data set of `n` whole numbers whose sum is a multiple of n, so the mean is a whole number. */
function setWithWholeMean(r: Rng, n: number, lo: number, hi: number): number[] {
  for (;;) {
    const xs = Array.from({ length: n }, () => randInt(r, lo, hi));
    if (xs.reduce((a, b) => a + b, 0) % n === 0 && new Set(xs).size > 2) return xs;
  }
}

/** MS.G5.D1.5.a: mean, median and mode for whole numbers and decimals */
export const centralTendency5 = numGen('MS.G5.D1.5.a', (tier, r) => {
  if (tier === 1) {
    const n = randInt(r, 4, 6);
    const xs = setWithWholeMean(r, n, 2, 15);
    const mean = xs.reduce((a, b) => a + b, 0) / n;
    return {
      prompt: bi((f) => f.t(`Find the mean of this data: ${f.m(listTex(f, xs))}.`, `Trouve la moyenne de ces données : ${f.m(listTex(f, xs))}.`)),
      answer: mean,
      wrong: [[median(xs), t('It looks like the middle value was found. The mean shares the total equally: add everything, then divide by how many.', 'Il semble que la valeur du milieu a été trouvée. La moyenne partage le total également : additionne tout, puis divise par le nombre de données.'), 1], [xs.reduce((a, b) => a + b, 0), t('It looks like the numbers were added but not divided by how many there are.', 'Il semble que les nombres ont été additionnés, mais pas divisés par leur nombre.'), 1]],
      steps: [bi((f) => f.t(`Add all ${f.N(n)} values: ${f.N(xs.reduce((a, b) => a + b, 0))}.`, `Additionne les ${f.N(n)} valeurs : ${f.N(xs.reduce((a, b) => a + b, 0))}.`)), bi((f) => f.t(`Divide by ${f.N(n)}: ${f.N(xs.reduce((a, b) => a + b, 0))} ÷ ${f.N(n)} = ${f.N(mean)}.`, `Divise par ${f.N(n)} : ${f.N(xs.reduce((a, b) => a + b, 0))} ÷ ${f.N(n)} = ${f.N(mean)}.`))],
      nudge: t('The mean is the total shared equally. How many values are there?', 'La moyenne est le total partagé également. Combien y a-t-il de valeurs ?'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 5, 8);
    const xs = shuffle(r, Array.from({ length: n }, () => randInt(r, 3, 30)));
    const sorted = [...xs].sort((a, b) => a - b);
    const wrongMid = n % 2 ? xs[n >> 1]! : xs[(n >> 1) - 1]!;
    return {
      prompt: bi((f) => f.t(`Find the median of this data: ${f.m(listTex(f, xs))}.`, `Trouve la médiane de ces données : ${f.m(listTex(f, xs))}.`)),
      answer: median(xs),
      wrong: [[wrongMid, t('It looks like the middle was taken without putting the numbers in order first. Order the data, then find the middle.', 'Il semble que le milieu a été pris sans d\'abord mettre les nombres en ordre. Ordonne les données, puis trouve le milieu.'), 0]],
      steps: [bi((f) => f.t(`Put the data in order: ${f.m(listTex(f, sorted))}.`, `Mets les données en ordre : ${f.m(listTex(f, sorted))}.`)), n % 2 ? bi((f) => f.t(`There is an odd number of values, so the median is the middle one: ${f.N(median(xs))}.`, `Il y a un nombre impair de valeurs : la médiane est celle du milieu, ${f.N(median(xs))}.`)) : bi((f) => f.t(`There is an even number of values, so the median is halfway between the two middle ones: ${f.N(median(xs))}.`, `Il y a un nombre pair de valeurs : la médiane est à mi-chemin entre les deux du milieu, ${f.N(median(xs))}.`))],
      nudge: t('Put the numbers in order first.', 'Mets d\'abord les nombres en ordre.'),
    };
  }
  const n = 4;
  const xs = setWithWholeMean(r, n + 1, 4, 20);
  const mean = xs.reduce((a, b) => a + b, 0) / (n + 1);
  const known = xs.slice(0, n);
  const missing = xs[n]!;
  return {
    prompt: bi((f) => f.t(`Four test scores are ${f.m(listTex(f, known))}. What fifth score makes the mean ${f.N(mean)}?`, `Quatre résultats sont ${f.m(listTex(f, known))}. Quel cinquième résultat donne une moyenne de ${f.N(mean)} ?`)),
    answer: missing,
    wrong: [[mean, t('It looks like the mean itself was given. Find the total that five scores need, then subtract what is already there.', 'Il semble que la moyenne elle-même a été donnée. Trouve le total que cinq résultats exigent, puis soustrais ce qu\'on a déjà.'), 0]],
    steps: [bi((f) => f.t(`Five scores with mean ${f.N(mean)} must total ${f.N(5)} × ${f.N(mean)} = ${f.N(5 * mean)}.`, `Cinq résultats de moyenne ${f.N(mean)} doivent totaliser ${f.N(5)} × ${f.N(mean)} = ${f.N(5 * mean)}.`)), bi((f) => f.t(`The four scores total ${f.N(known.reduce((a, b) => a + b, 0))}, so the fifth is ${f.N(5 * mean)} − ${f.N(known.reduce((a, b) => a + b, 0))} = ${f.N(missing)}.`, `Les quatre résultats totalisent ${f.N(known.reduce((a, b) => a + b, 0))} : le cinquième est ${f.N(5 * mean)} − ${f.N(known.reduce((a, b) => a + b, 0))} = ${f.N(missing)}.`))],
    nudge: t('Work backward from the total: mean × how many values.', 'Pars à reculons du total : moyenne × nombre de valeurs.'),
    category: 'AP',
  };
});

/** MS.G6.D1.5.a: range and measures of central tendency with decimals */
export const range6 = numGen('MS.G6.D1.5.a', (tier, r) => {
  if (tier === 1) {
    const xs = shuffle(r, Array.from({ length: randInt(r, 5, 7) }, () => randInt(r, 5, 95)));
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    return {
      prompt: bi((f) => f.t(`Find the range of this data: ${f.m(listTex(f, xs))}.`, `Trouve l\'étendue de ces données : ${f.m(listTex(f, xs))}.`)),
      answer: hi - lo,
      wrong: [[hi, t('It looks like the greatest value was given. The range is the greatest minus the least.', 'Il semble que la plus grande valeur a été donnée. L\'étendue est la plus grande moins la plus petite.'), 0]],
      steps: [bi((f) => f.t(`The greatest value is ${f.N(hi)} and the least is ${f.N(lo)}.`, `La plus grande valeur est ${f.N(hi)} et la plus petite est ${f.N(lo)}.`)), bi((f) => `${f.N(hi)} − ${f.N(lo)} = ${f.N(hi - lo)}.`)],
      nudge: t('Find the greatest and the least value, then subtract.', 'Trouve la plus grande et la plus petite valeur, puis soustrais.'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 4, 5);
    let tenths: number[];
    do { tenths = Array.from({ length: n }, () => randInt(r, 5, 49)); } while (tenths.reduce((a, b) => a + b, 0) % n !== 0 || new Set(tenths).size < 3);
    const xs = tenths.map((x) => x / 10);
    const total = r6(xs.reduce((a, b) => a + b, 0));
    const mean = r6(total / n);
    return {
      prompt: bi((f) => f.t(`Find the mean of this data: ${f.m(listTex(f, xs))}.`, `Trouve la moyenne de ces données : ${f.m(listTex(f, xs))}.`)),
      answer: mean,
      wrong: [[total, t('It looks like the numbers were added but not divided by how many there are.', 'Il semble que les nombres ont été additionnés, mais pas divisés par leur nombre.'), 1]],
      steps: [bi((f) => f.t(`Add the values: ${f.N(total)}.`, `Additionne les valeurs : ${f.N(total)}.`)), bi((f) => f.t(`Divide by ${f.N(n)}: ${f.N(total)} ÷ ${f.N(n)} = ${f.N(mean)}.`, `Divise par ${f.N(n)} : ${f.N(total)} ÷ ${f.N(n)} = ${f.N(mean)}.`))],
      nudge: t('Add all the decimals, lining up the decimal points, then divide by how many.', 'Additionne tous les nombres décimaux en alignant les virgules, puis divise par leur nombre.'),
    };
  }
  const n = 6;
  const xs = shuffle(r, Array.from({ length: n }, () => randInt(r, 10, 99) / 10));
  const sorted = [...xs].sort((a, b) => a - b);
  return {
    prompt: bi((f) => f.t(`Find the median of this data: ${f.m(listTex(f, xs))}.`, `Trouve la médiane de ces données : ${f.m(listTex(f, xs))}.`)),
    answer: median(xs),
    wrong: [[sorted[2]!, t('It looks like only one of the two middle values was used. With an even number of values, find the number halfway between the two middle ones.', 'Il semble qu\'une seule des deux valeurs du milieu a été utilisée. Avec un nombre pair de valeurs, trouve le nombre à mi-chemin entre les deux du milieu.'), 1]],
    steps: [bi((f) => f.t(`Put the data in order: ${f.m(listTex(f, sorted))}.`, `Mets les données en ordre : ${f.m(listTex(f, sorted))}.`)), bi((f) => f.t(`The two middle values are ${f.N(sorted[2]!)} and ${f.N(sorted[3]!)}. Halfway between them is ${f.N(median(xs))}.`, `Les deux valeurs du milieu sont ${f.N(sorted[2]!)} et ${f.N(sorted[3]!)}. À mi-chemin entre elles, c\'est ${f.N(median(xs))}.`))],
    nudge: t('Put the numbers in order, then find the two in the middle.', 'Mets les nombres en ordre, puis trouve les deux du milieu.'),
  };
});

const COLOURS: [string, string, string][] = [['red', 'rouges', 'rouge'], ['blue', 'bleues', 'bleue'], ['green', 'vertes', 'verte'], ['yellow', 'jaunes', 'jaune']];

/** MS.G5.D2.1.a: probability as a fraction */
export const probFraction5: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const cols = shuffle(r, COLOURS).slice(0, tier === 1 ? 2 : 3);
  const counts = cols.map(() => randInt(r, 1, tier === 3 ? 7 : 5));
  const total = counts.reduce((a, b) => a + b, 0);
  const ask = tier === 3 ? [0, 1] : [0];
  const fav = ask.reduce((s, i) => s + counts[i]!, 0);
  const bagEn = cols.map((c, i) => `${counts[i]} ${c[0]}`).join(', ');
  const bagFr = cols.map((c, i) => `${counts[i]} ${c[1]}`).join(', ');
  const what = tier === 3
    ? t(`${cols[0]![0]} or ${cols[1]![0]}`, `${cols[0]![2]} ou ${cols[1]![2]}`)
    : t(`${cols[0]![0]}`, `${cols[0]![2]}`);
  return build({
    skill: 'MS.G5.D2.1.a', tier, seed, category: tier === 3 ? 'AP' : 'KU', format: 'fraction',
    prompt: t(`A bag has marbles: ${bagEn}. One marble is picked without looking. What is the probability it is ${what.en}? Write it as a fraction.`, `Un sac contient des billes : ${bagFr}. On pige une bille sans regarder. Quelle est la probabilité que ce soit une bille ${what.fr} ? Écris-la sous forme de fraction.`),
    answer: { kind: 'fraction', n: fav / gcd(fav, total), d: total / gcd(fav, total) },
    wrong: [{ answer: { kind: 'fraction' as const, n: fav, d: total - fav || 1 }, why: t('It looks like the favourable marbles were compared with the others. A probability compares them with ALL the marbles.', 'Il semble que les billes favorables ont été comparées aux autres. Une probabilité les compare à TOUTES les billes.'), stepIndex: 1 }].filter((w) => !(w.answer.n === fav / gcd(fav, total) && w.answer.d === total / gcd(fav, total))),
    steps: [t(`Count all the marbles: ${total}.`, `Compte toutes les billes : ${total}.`), t(`Count the favourable marbles: ${fav}.`, `Compte les billes favorables : ${fav}.`), t(`Probability = favourable ÷ total = ${tex(frac(fav, total))}${gcd(fav, total) > 1 ? ` = ${tex(frac(fav / gcd(fav, total), total / gcd(fav, total)))}` : ''}.`, `Probabilité = favorables ÷ total = ${tex(frac(fav, total))}${gcd(fav, total) > 1 ? ` = ${tex(frac(fav / gcd(fav, total), total / gcd(fav, total)))}` : ''}.`)],
    nudge: t('A probability is favourable outcomes over all possible outcomes.', 'Une probabilité, c\'est les résultats favorables sur tous les résultats possibles.'),
    stepHint: t(`There are ${total} marbles in all.`, `Il y a ${total} billes en tout.`),
  });
};

/** MS.G6.D2.1.a: probability as fractions, decimals and percents */
export const probPercent6 = numGen('MS.G6.D2.1.a', (tier, r) => {
  const total = [4, 5, 10, 20, 25][randInt(r, 0, 4)]!;
  const fav = randInt(r, 1, total - 1);
  const pct = (fav * 100) / total;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A spinner has ${f.N(total)} equal sections and ${f.N(fav)} of them are shaded. What is the probability of landing on shaded, as a percent? (Type the number only.)`, `Une roulette a ${f.N(total)} sections égales et ${f.N(fav)} sont ombrées. Quelle est la probabilité de tomber sur une section ombrée, en pourcentage ? (Écris seulement le nombre.)`)),
      answer: pct,
      wrong: [[r6(fav / total), t('It looks like the answer was left as a decimal. Multiply it by 100 to get a percent.', 'Il semble que la réponse est restée sous forme décimale. Multiplie-la par 100 pour obtenir un pourcentage.'), 1]],
      steps: [bi((f) => f.t(`As a fraction the probability is ${f.m(`\\frac{${f.n(fav)}}{${f.n(total)}}`)}.`, `Sous forme de fraction, la probabilité est ${f.m(`\\frac{${f.n(fav)}}{${f.n(total)}}`)}.`)), bi((f) => f.t(`${f.N(fav)} ÷ ${f.N(total)} = ${f.N(r6(fav / total))}, and ${f.N(r6(fav / total))} × 100 = ${f.N(pct)}%.`, `${f.N(fav)} ÷ ${f.N(total)} = ${f.N(r6(fav / total))}, et ${f.N(r6(fav / total))} × 100 = ${f.N(pct)} %.`))],
      nudge: t('Write the probability as a fraction, then make the denominator 100 or divide.', 'Écris la probabilité sous forme de fraction, puis mets le dénominateur à 100 ou divise.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`The probability of rain is ${f.m(`${f.n(pct)}\\%`)}. Write that probability as a decimal.`, `La probabilité de pluie est ${f.m(`${f.n(pct)}\\%`)}. Écris cette probabilité sous forme de nombre décimal.`)),
      answer: r6(pct / 100),
      wrong: [[pct, t('It looks like the percent was not divided by 100. A percent is out of 100.', 'Il semble que le pourcentage n\'a pas été divisé par 100. Un pourcentage est sur 100.'), 0]],
      steps: [t('A percent means "out of 100", so divide by 100.', '« Pour cent » veut dire « sur 100 » : divise par 100.'), bi((f) => `${f.N(pct)} ÷ 100 = ${f.N(r6(pct / 100))}.`)],
      nudge: t('Percent means out of 100.', 'Pour cent veut dire sur 100.'),
    };
  }
  const k = randInt(r, 2, 4);
  return {
    prompt: bi((f) => f.t(`A jar has ${f.N(total * k)} candies and ${f.N(fav * k)} are red. What is the probability of picking red, as a percent? (Type the number only.)`, `Un pot contient ${f.N(total * k)} bonbons et ${f.N(fav * k)} sont rouges. Quelle est la probabilité de piger un bonbon rouge, en pourcentage ? (Écris seulement le nombre.)`)),
    answer: pct,
    wrong: [[r6((fav * k * 100) / total / k / k), t('It looks like the probability was not compared with the full amount. Divide the favourable number by the total, then multiply by 100.', 'Il semble que la probabilité n\'a pas été comparée à la quantité totale. Divise le nombre favorable par le total, puis multiplie par 100.'), 1]].filter(([v]) => v !== pct) as [number, Text, number][],
    steps: [bi((f) => f.t(`Favourable ÷ total = ${f.N(fav * k)} ÷ ${f.N(total * k)} = ${f.N(r6(fav / total))}.`, `Favorables ÷ total = ${f.N(fav * k)} ÷ ${f.N(total * k)} = ${f.N(r6(fav / total))}.`)), bi((f) => f.t(`${f.N(r6(fav / total))} × 100 = ${f.N(pct)}%.`, `${f.N(r6(fav / total))} × 100 = ${f.N(pct)} %.`))],
    nudge: t('Divide the red candies by all the candies, then turn the decimal into a percent.', 'Divise les bonbons rouges par tous les bonbons, puis transforme le nombre décimal en pourcentage.'),
    category: 'AP',
  };
});

/** MS.G6.D2.2.a: two independent events */
export const twoEvents6: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const spin = [2, 3, 4, 5][randInt(r, 0, 3)]!;
  const die = [2, 3, 4][randInt(r, 0, 2)]!;
  const favA = 1; // the first spinner always asks for a 1
  const favB = tier === 1 ? 1 : randInt(r, 1, 2);
  const n = favA * favB;
  const d = spin * die;
  const g = gcd(n, d);
  return build({
    skill: 'MS.G6.D2.2.a', tier, seed, category: 'AP', format: 'fraction',
    prompt: t(`A spinner has ${spin} equal sections numbered 1 to ${spin}. A second spinner has ${die} equal sections numbered 1 to ${die}. Both are spun once. What is the probability of getting ${favA === 1 && tier === 1 ? '1 on both' : `1 on the first and ${favB === 1 ? '1' : 'a number from 1 to ' + favB} on the second`}? Write a fraction.`, `Une roulette a ${spin} sections égales numérotées de 1 à ${spin}. Une autre roulette a ${die} sections égales numérotées de 1 à ${die}. On fait tourner chacune une fois. Quelle est la probabilité d\'obtenir ${favA === 1 && tier === 1 ? '1 sur les deux' : `1 sur la première et ${favB === 1 ? '1' : 'un nombre de 1 à ' + favB} sur la seconde`} ? Écris une fraction.`),
    answer: { kind: 'fraction', n: n / g, d: d / g },
    wrong: [{ answer: { kind: 'fraction' as const, n: favA * die + favB * spin, d: spin * die }, why: t('It looks like the two probabilities were added. For both events to happen, multiply their probabilities.', 'Il semble que les deux probabilités ont été additionnées. Pour que les deux événements se produisent, multiplie leurs probabilités.'), stepIndex: 2 }].filter((w) => w.answer.n / w.answer.d !== n / d),
    steps: [t(`The first spinner gives 1 with probability ${tex(frac(favA, spin))}.`, `La première roulette donne 1 avec une probabilité de ${tex(frac(favA, spin))}.`), t(`The second gives the wanted result with probability ${tex(frac(favB, die))}.`, `La seconde donne le résultat voulu avec une probabilité de ${tex(frac(favB, die))}.`), t(`The spins do not affect each other, so multiply: ${tex(`${frac(favA, spin)} \\times ${frac(favB, die)} = ${frac(n, d)}`)}${g > 1 ? ` = ${tex(frac(n / g, d / g))}` : ''}.`, `Les tours ne s\'influencent pas : multiplie. ${tex(`${frac(favA, spin)} \\times ${frac(favB, die)} = ${frac(n, d)}`)}${g > 1 ? ` = ${tex(frac(n / g, d / g))}` : ''}.`)],
    nudge: t('Independent events: the probability of both is the product of the two probabilities.', 'Événements indépendants : la probabilité des deux est le produit des deux probabilités.'),
    stepHint: t(`Find each probability on its own: ${tex(frac(favA, spin))} and ${tex(frac(favB, die))}.`, `Trouve chaque probabilité séparément : ${tex(frac(favA, spin))} et ${tex(frac(favB, die))}.`),
  });
};

/** MS.G5.D2.2.a: theoretical and experimental probability */
export const experimental5 = numGen('MS.G5.D2.2.a', (tier, r) => {
  if (tier === 1) {
    const trials = [10, 20, 40, 50][randInt(r, 0, 3)]!;
    const k = randInt(r, 2, trials - 2);
    return {
      prompt: bi((f) => f.t(`A coin was flipped ${f.N(trials)} times and landed on heads ${f.N(k)} times. How many tails were there?`, `Une pièce a été lancée ${f.N(trials)} fois et est tombée sur pile ${f.N(k)} fois. Combien de fois est-elle tombée sur face ?`)),
      answer: trials - k,
      wrong: [[k, t('It looks like the heads were counted again. Tails are the trials that were not heads.', 'Il semble que les piles ont été comptés de nouveau. Les faces sont les essais qui ne sont pas des piles.'), 0]],
      steps: [t('Every flip is heads or tails, so tails = trials − heads.', 'Chaque lancer donne pile ou face : faces = essais − piles.'), bi((f) => `${f.N(trials)} − ${f.N(k)} = ${f.N(trials - k)}.`)],
      nudge: t('Heads and tails together make all the flips.', 'Les piles et les faces ensemble font tous les lancers.'),
    };
  }
  if (tier === 2) {
    const trials = [20, 40, 50, 100][randInt(r, 0, 3)]!;
    const expected = trials / 2;
    let k = expected;
    while (k === expected) k = expected + randInt(r, -Math.floor(trials / 10), Math.floor(trials / 10));
    return {
      prompt: bi((f) => f.t(`A fair coin is flipped ${f.N(trials)} times. Theory says about half should be heads. It landed on heads ${f.N(k)} times. How many fewer or more heads than the theory predicts is that? (Type how many, as a positive number.)`, `Une pièce équitable est lancée ${f.N(trials)} fois. La théorie prévoit environ la moitié de piles. Elle est tombée sur pile ${f.N(k)} fois. Quelle est la différence avec ce que prévoit la théorie ? (Écris la différence en nombre positif.)`)),
      answer: Math.abs(k - expected),
      wrong: [[expected, t('It looks like the predicted number was given. Find the difference between the predicted and the actual number.', 'Il semble que le nombre prévu a été donné. Trouve la différence entre le nombre prévu et le nombre réel.'), 1]].filter(([v]) => v !== Math.abs(k - expected)) as [number, Text, number][],
      steps: [bi((f) => f.t(`Theory predicts half of ${f.N(trials)}, which is ${f.N(expected)}.`, `La théorie prévoit la moitié de ${f.N(trials)}, soit ${f.N(expected)}.`)), bi((f) => f.t(`The difference between ${f.N(k)} and ${f.N(expected)} is ${f.N(Math.abs(k - expected))}.`, `La différence entre ${f.N(k)} et ${f.N(expected)} est ${f.N(Math.abs(k - expected))}.`))],
      nudge: t('First work out how many heads the theory predicts.', 'Trouve d\'abord combien de piles la théorie prévoit.'),
    };
  }
  const d = [4, 5, 10][randInt(r, 0, 2)]!;
  const trials = d * randInt(r, 10, 40);
  return {
    prompt: bi((f) => f.t(`The theoretical probability of landing on blue is ${f.m(`\\frac{1}{${f.n(d)}}`)}. About how many times should you expect blue in ${f.N(trials)} spins?`, `La probabilité théorique de tomber sur bleu est ${f.m(`\\frac{1}{${f.n(d)}}`)}. Environ combien de fois devrais-tu obtenir bleu en ${f.N(trials)} tours ?`)),
    answer: trials / d,
    wrong: [[trials * d, t('It looks like the trials were multiplied by the denominator. One out of every few spins is blue, so divide.', 'Il semble que les essais ont été multipliés par le dénominateur. Un tour sur quelques-uns est bleu : divise.'), 1]],
    steps: [bi((f) => f.t(`${f.m(`\\frac{1}{${f.n(d)}}`)} of the spins should be blue.`, `${f.m(`\\frac{1}{${f.n(d)}}`)} des tours devraient être bleus.`)), bi((f) => `${f.N(trials)} ÷ ${f.N(d)} = ${f.N(trials / d)}.`)],
    nudge: t('Take that fraction of all the spins.', 'Prends cette fraction de tous les tours.'),
    category: 'AP',
  };
});
