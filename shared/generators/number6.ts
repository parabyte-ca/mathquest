// Grade 6 Number strand (B): whole numbers to 1 000 000, integers, decimals to thousandths, percents, factors and primes.
import { makeRng, pick, randInt, shuffle } from '../rng.js';
import type { Generator, Text, Visual } from '../items/types.js';
import { bi, numGen, r6, type F } from './dsl.js';
import { build, frac, gcd, t, tex } from './kit.js';

const SYMS = ['<', '>', '='] as const;
const symOptions: Text[] = SYMS.map((s) => t(tex(s), tex(s)));
const symIdx = (a: number, b: number): number => (Math.abs(a - b) < 1e-9 ? 2 : a < b ? 0 : 1);
const eps = 1e-9;

/** Rounds a value held as integer thousandths to `places` decimal places, half up, without float error. */
const roundThousandths = (X: number, places: number): number => {
  const scale = 10 ** (3 - places);
  return Math.floor((X + scale / 2) / scale) / 10 ** places;
};

const PLACE6: [string, string, number][] = [['hundred-thousands', 'centaines de mille', 100000], ['ten-thousands', 'dizaines de mille', 10000], ['thousands', 'milliers', 1000], ['hundreds', 'centaines', 100], ['tens', 'dizaines', 10], ['ones', 'unités', 1]];

/** MS.G6.B1.1.a: whole numbers to 1 000 000 */
export const wholeToMillion = numGen('MS.G6.B1.1.a', (tier, r) => {
  if (tier === 3) {
    const k = randInt(r, 12, 99);
    const N = k * 10000;
    return {
      prompt: bi((f) => f.t(`How many ten-thousands are in ${f.N(N)}?`, `Combien y a-t-il de dizaines de mille dans ${f.N(N)} ?`)),
      answer: k,
      wrong: [[N / 1000, t('It looks like thousands were counted. Ten-thousands are 10 times bigger, so there are fewer of them.', 'Il semble que des milliers ont été comptés. Les dizaines de mille sont 10 fois plus grandes : il y en a moins.'), 0]],
      steps: [t('One ten-thousand is 10 000, so divide by 10 000.', 'Une dizaine de mille vaut 10 000, donc divise par 10 000.'), bi((f) => `${f.N(N)} ÷ ${f.N(10000)} = ${k}.`)],
      nudge: t('How many thousands make a ten-thousand? Use that to count.', 'Combien de milliers font une dizaine de mille ? Sers-toi-en pour compter.'),
    };
  }
  if (tier === 2) {
    let digits: number[];
    let p: number;
    do { digits = PLACE6.map((_, i) => (i === 0 ? randInt(r, 1, 9) : randInt(r, 0, 9))); p = randInt(r, 0, 5); } while (digits[p] === 0 || digits.filter((d) => d === digits[p]).length > 1);
    const N = digits.reduce((s, d, i) => s + d * PLACE6[i]![2], 0);
    const d = digits[p]!;
    const val = d * PLACE6[p]![2];
    return {
      prompt: bi((f) => f.t(`What is the value of the digit ${d} in ${f.N(N)}?`, `Quelle est la valeur du chiffre ${d} dans ${f.N(N)} ?`)),
      answer: val,
      wrong: [[d, t('It looks like the digit itself was given. The value depends on its place.', 'Il semble que le chiffre lui-même a été donné. La valeur dépend de sa position.'), 1]],
      steps: [t(`The ${d} is in the ${PLACE6[p]![0]} place.`, `Le ${d} est à la position des ${PLACE6[p]![1]}.`), bi((f) => f.t(`Its value is ${d} × ${f.N(PLACE6[p]![2])} = ${f.N(val)}.`, `Sa valeur est ${d} × ${f.N(PLACE6[p]![2])} = ${f.N(val)}.`))],
      nudge: t('Which place is the digit in? Multiply the digit by that place\'s value.', 'À quelle position est le chiffre ? Multiplie-le par la valeur de cette position.'),
    };
  }
  const digits = PLACE6.slice(0, 5).map((_, i) => (i === 0 ? randInt(r, 1, 9) : randInt(r, 0, 9)));
  digits[randInt(r, 1, 3)] = 0;
  const N = digits.reduce((s, d, i) => s + d * PLACE6[i]![2], 0);
  const parts = digits.map((d, i) => (d ? `${d} ${PLACE6[i]![0]}` : null)).filter(Boolean) as string[];
  const partsFr = digits.map((d, i) => (d ? `${d} ${PLACE6[i]![1]}` : null)).filter(Boolean) as string[];
  return {
    prompt: t(`What number is ${parts.join(' + ')}?`, `Quel nombre est ${partsFr.join(' + ')} ?`),
    answer: N,
    wrong: [[Number(digits.filter((d, i) => d || i === 0).join('')), t('It looks like a zero was left out. A place with nothing in it still needs a 0.', 'Il semble qu\'un zéro a été oublié. Une position vide a quand même besoin d\'un 0.'), 1]],
    steps: [t('Write each part in its place and put a 0 in any place that is missing.', 'Écris chaque partie à sa position et mets un 0 à chaque position qui manque.'), bi((f) => f.t(`The number is ${f.N(N)}.`, `Le nombre est ${f.N(N)}.`))],
    nudge: t('Which place has nothing in it? That place needs a 0.', 'Quelle position est vide ? Elle a besoin d\'un 0.'),
  };
});

/** MS.G6.B1.2.a: read and represent integers on number lines */
export const integersLine = numGen('MS.G6.B1.2.a', (tier, r) => {
  if (tier <= 2) {
    const max = tier === 1 ? 6 : 8;
    const step = tier === 1 ? 1 : 2;
    const k = (randInt(r, 1, max / step) * step) * (r() < 0.5 ? -1 : 1);
    const vis: Visual = { type: 'numberLine', min: -max, max, ticks: (2 * max) / step, marks: [{ at: k }] };
    return {
      prompt: t('What integer is marked on the number line?', 'Quel entier est marqué sur la droite numérique ?'),
      visual: vis, answer: k,
      wrong: [[-k, t('It looks like the sign is mixed up. Numbers to the left of zero are negative and numbers to the right are positive.', 'Il semble que le signe est inversé. Les nombres à gauche de zéro sont négatifs et ceux à droite sont positifs.'), 1]],
      steps: [t('Find 0 on the number line.', 'Trouve 0 sur la droite numérique.'), t(`The mark is ${Math.abs(k)} units ${k < 0 ? 'left' : 'right'} of 0, so it is ${k}.`, `Le point est à ${Math.abs(k)} unités à ${k < 0 ? 'gauche' : 'droite'} de 0, donc c'est ${k}.`)],
      nudge: t('Is the mark left or right of zero? That tells you the sign.', 'Le point est-il à gauche ou à droite de zéro ? Cela indique le signe.'),
    };
  }
  const kind = pick(r, ['opposite', 'move'] as const);
  if (kind === 'opposite') {
    const n = randInt(r, 2, 40) * (r() < 0.5 ? -1 : 1);
    return {
      prompt: bi((f) => f.t(`What is the opposite of ${f.N(n)}?`, `Quel est l'opposé de ${f.N(n)} ?`)), answer: -n,
      wrong: [[n, t('The opposite is on the other side of zero, the same distance away.', 'L\'opposé est de l\'autre côté de zéro, à la même distance.'), 0]],
      steps: [t('Opposites are the same distance from 0 on opposite sides.', 'Les opposés sont à la même distance de 0, de chaque côté.'), bi((f) => f.t(`The opposite of ${f.N(n)} is ${f.N(-n)}.`, `L'opposé de ${f.N(n)} est ${f.N(-n)}.`))],
      nudge: t('Change the sign.', 'Change le signe.'),
    };
  }
  const start = randInt(r, -8, -1), d = randInt(r, 2, 7);
  return {
    prompt: bi((f) => f.t(`Start at ${f.N(start)} on a number line and move ${d} units to the left. Where do you land?`, `Pars de ${f.N(start)} sur une droite numérique et déplace-toi de ${d} unités vers la gauche. Où arrives-tu ?`)), answer: start - d,
    wrong: [[start + d, t('It looks like you moved right. Moving left makes the number smaller.', 'Il semble que tu t\'es déplacé vers la droite. Aller à gauche rend le nombre plus petit.'), 1]],
    steps: [t('Moving left means the number gets smaller.', 'Aller à gauche rend le nombre plus petit.'), bi((f) => f.t(`${f.N(start)} − ${d} = ${f.N(start - d)}.`, `${f.N(start)} − ${d} = ${f.N(start - d)}.`))],
    nudge: t('Left is down, right is up. Which way do you go?', 'Gauche, c\'est descendre ; droite, c\'est monter. Dans quel sens vas-tu ?'),
  };
});

/** MS.G6.B1.3.a: compare and order integers, decimals and fractions */
export const compareMixed: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 1) {
    const a = randInt(r, -9, 9), b = randInt(r, -9, 9);
    return build({
      skill: 'MS.G6.B1.3.a', tier, seed, category: 'KU', format: 'choice',
      prompt: bi((f) => `${f.t('Which symbol makes this true?', 'Quel symbole rend l\'énoncé vrai ?')} ${f.m(`${f.n(a)} \\ ? \\ ${f.n(b)}`)}`),
      options: symOptions, answer: { kind: 'choice', index: symIdx(a, b) },
      steps: [t('On a number line, numbers to the right are greater.', 'Sur une droite numérique, les nombres à droite sont plus grands.'), t('Every negative number is less than every positive number, and a negative number with a bigger digit is further left.', 'Tout nombre négatif est plus petit que tout nombre positif, et un nombre négatif avec un plus grand chiffre est plus à gauche.')],
      nudge: t('Picture a number line. Which number is further to the right?', 'Imagine une droite numérique. Quel nombre est plus à droite ?'),
      stepHint: t('Numbers to the right are greater.', 'Les nombres à droite sont plus grands.'),
      wrong: Math.abs(Math.abs(a) - Math.abs(b)) < eps || symIdx(Math.abs(a), Math.abs(b)) === symIdx(a, b) ? [] : [{ answer: { kind: 'choice', index: symIdx(Math.abs(a), Math.abs(b)) }, stepIndex: 1, why: t('It looks like the signs were ignored. A negative number with a bigger digit is actually smaller.', 'Il semble que les signes ont été ignorés. Un nombre négatif avec un plus grand chiffre est en fait plus petit.') }],
      praise: t('Nice, you pictured the number line.', 'Bravo, tu as imaginé la droite numérique.'),
    });
  }
  type Num = { v: number; tex: (f: F) => string };
  const dec = (v: number): Num => ({ v, tex: (f) => f.n(v) });
  const fr = (n: number, d: number): Num => ({ v: n / d, tex: () => frac(n, d) });
  const int = (v: number): Num => ({ v, tex: (f) => f.n(v) });
  if (tier === 2) {
    const pairs: [Num, Num][] = [[dec(0.6), fr(3, 5)], [dec(0.7), fr(3, 4)], [dec(0.25), fr(1, 4)], [dec(0.4), fr(1, 3)], [dec(0.5), fr(5, 8)], [dec(0.8), fr(7, 10)], [dec(0.75), fr(2, 3)], [dec(0.2), fr(1, 5)], [dec(0.35), fr(2, 5)], [dec(0.9), fr(8, 9)]];
    let [x, y] = pick(r, pairs);
    if (r() < 0.5) [x, y] = [y, x];
    return build({
      skill: 'MS.G6.B1.3.a', tier, seed, category: 'TH', format: 'choice',
      prompt: bi((f) => `${f.t('Which symbol makes this true?', 'Quel symbole rend l\'énoncé vrai ?')} ${f.m(`${x.tex(f)} \\ ? \\ ${y.tex(f)}`)}`),
      options: symOptions, answer: { kind: 'choice', index: symIdx(x.v, y.v) },
      steps: [t('Write both numbers as decimals (or both as fractions).', 'Écris les deux nombres sous forme décimale (ou les deux sous forme de fractions).'), t('Then compare them place by place.', 'Puis compare-les position par position.')],
      nudge: t('Change one number so both are decimals, then compare.', 'Transforme un nombre pour que les deux soient décimaux, puis compare.'),
      stepHint: t('Divide the numerator by the denominator to get the decimal.', 'Divise le numérateur par le dénominateur pour obtenir le nombre décimal.'),
      wrong: [{ answer: { kind: 'choice', index: symIdx(x.v, y.v) === 0 ? 1 : 0 }, stepIndex: 1, why: t('It looks like the symbol points the other way. Compare them in the same form to be sure.', 'Il semble que le symbole est tourné dans l\'autre sens. Compare-les sous la même forme pour en être certain.') }],
      praise: t('Nice, you compared them in the same form.', 'Bravo, tu les as comparés sous la même forme.'),
    });
  }
  const pool: Num[] = [int(-2), int(-1), dec(-0.5), dec(-1.5), fr(1, 4), dec(0.3), fr(3, 4), dec(0.6), int(1), dec(0.05), fr(1, 8)];
  const picked: Num[] = [];
  for (const c of shuffle(r, pool)) if (!picked.some((p) => Math.abs(p.v - c.v) < eps)) picked.push(c);
  const four = picked.slice(0, 4);
  const order = four.map((_, i) => i).sort((i, j) => four[i]!.v - four[j]!.v);
  const byAbs = four.map((_, i) => i).sort((i, j) => Math.abs(four[i]!.v) - Math.abs(four[j]!.v));
  return build({
    skill: 'MS.G6.B1.3.a', tier, seed, category: 'TH', format: 'order',
    prompt: t('Put these numbers in order from least to greatest.', 'Place ces nombres en ordre, du plus petit au plus grand.'),
    options: four.map((n) => bi((f) => f.m(n.tex(f)))),
    answer: { kind: 'order', order: order },
    steps: [t('Sort the negative numbers first: the one furthest from zero is the least.', 'Trie d\'abord les nombres négatifs : celui qui est le plus loin de zéro est le plus petit.'), t('Then write the positive numbers as decimals and order them.', 'Puis écris les nombres positifs sous forme décimale et place-les en ordre.')],
    nudge: t('Negatives are less than positives. Change fractions to decimals to compare.', 'Les négatifs sont plus petits que les positifs. Transforme les fractions en nombres décimaux pour comparer.'),
    stepHint: t('Picture all of them on one number line.', 'Imagine-les tous sur une même droite numérique.'),
    wrong: JSON.stringify(byAbs) === JSON.stringify(order) ? [] : [{ answer: { kind: 'order' as const, order: byAbs }, stepIndex: 0, why: t('It looks like the numbers were ordered by size and the signs were ignored. A negative number is less than zero.', 'Il semble que les nombres ont été placés selon leur taille sans tenir compte des signes. Un nombre négatif est plus petit que zéro.') }],
    praise: t('Nice, you ordered them on a number line.', 'Bravo, tu les as placés sur une droite numérique.'),
  });
};

/** MS.G6.B1.4.a: decimals to thousandths */
export const thousandths: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    const vals = new Set<number>();
    const base = randInt(r, 1, 9);
    while (vals.size < 3) vals.add(r6(base + randInt(r, 0, 9) / 10 + randInt(r, 0, 9) / 100 + randInt(r, 0, 9) / 1000));
    const list = [...vals];
    const least = Math.min(...list);
    const longest = list.reduce((a, b) => (String(b).length > String(a).length ? b : a));
    return build({
      skill: 'MS.G6.B1.4.a', tier, seed, category: 'TH', format: 'choice',
      prompt: t('Which decimal is the least?', 'Quel nombre décimal est le plus petit ?'),
      options: list.map((v) => bi((f) => f.N(v))), answer: { kind: 'choice', index: list.indexOf(least) },
      steps: [t('Write each number with three decimal places.', 'Écris chaque nombre avec trois décimales.'), t('Compare place by place from the left.', 'Compare position par position à partir de la gauche.')],
      nudge: t('A longer decimal is not always greater or smaller. Compare place by place.', 'Un nombre décimal plus long n\'est pas toujours plus grand ou plus petit. Compare position par position.'),
      stepHint: t('Add zeros so every number shows thousandths.', 'Ajoute des zéros pour que chaque nombre soit en millièmes.'),
      wrong: longest === least ? [] : [{ answer: { kind: 'choice', index: list.indexOf(longest) }, stepIndex: 1, why: t('It looks like the number with the most digits was chosen. The number of digits does not tell the size. Compare place by place.', 'Il semble que le nombre avec le plus de chiffres a été choisi. Le nombre de chiffres n\'indique pas la taille. Compare position par position.') }],
      praise: t('Nice, you compared place by place.', 'Bravo, tu as comparé position par position.'),
    });
  }
  return numGen('MS.G6.B1.4.a', (tr, rr) => {
    if (tr === 1) {
      let ds: number[], p: number;
      do { ds = [randInt(rr, 1, 9), randInt(rr, 1, 9), randInt(rr, 1, 9), randInt(rr, 1, 9)]; p = randInt(rr, 1, 3); } while (ds.filter((d) => d === ds[p]).length > 1);
      const v = r6(ds[0]! + ds[1]! / 10 + ds[2]! / 100 + ds[3]! / 1000);
      const d = ds[p]!;
      const place = [['ones', 'unités'], ['tenths', 'dixièmes'], ['hundredths', 'centièmes'], ['thousandths', 'millièmes']][p]!;
      return {
        prompt: bi((f) => f.t(`What is the value of the digit ${d} in ${f.N(v)}?`, `Quelle est la valeur du chiffre ${d} dans ${f.N(v)} ?`)),
        answer: r6(d / 10 ** p),
        wrong: [[d, t('It looks like the digit itself was given. Its value depends on its place.', 'Il semble que le chiffre lui-même a été donné. Sa valeur dépend de sa position.'), 1], [r6(d / 10 ** (p === 3 ? 2 : p + 1)), t('It looks like the place was counted one position off. Tenths come first after the decimal point.', 'Il semble que la position a été comptée avec un décalage d\'une position. Les dixièmes viennent en premier après la virgule.'), 0]],
        steps: [t(`The ${d} is in the ${place[0]} place.`, `Le ${d} est à la position des ${place[1]}.`), bi((f) => f.t(`Its value is ${f.N(r6(d / 10 ** p))}.`, `Sa valeur est ${f.N(r6(d / 10 ** p))}.`))],
        nudge: t('After the decimal point the places are tenths, hundredths, thousandths.', 'Après la virgule, les positions sont les dixièmes, les centièmes, les millièmes.'),
      };
    }
    const w = randInt(rr, 1, 9);
    const ds = [randInt(rr, 0, 9), randInt(rr, 0, 9), randInt(rr, 1, 9)];
    ds[randInt(rr, 0, 1)] = 0;
    const v = r6(w + ds[0]! / 10 + ds[1]! / 100 + ds[2]! / 1000);
    const names = [['tenths', 'dixièmes'], ['hundredths', 'centièmes'], ['thousandths', 'millièmes']];
    const parts = ds.map((d, i) => (d ? `${d} ${names[i]![0]}` : null)).filter(Boolean).join(', ');
    const partsFr = ds.map((d, i) => (d ? `${d} ${names[i]![1]}` : null)).filter(Boolean).join(', ');
    return {
      prompt: t(`Write ${w} ones${parts ? ', ' + parts : ''} as a decimal.`, `Écris ${w} unités${partsFr ? ', ' + partsFr : ''} sous forme de nombre décimal.`),
      answer: v,
      wrong: [[r6(w + Number(ds.filter((d, i) => d || i === 2).join('')) / 10 ** ds.filter((d, i) => d || i === 2).length), t('It looks like a zero was left out. A place with nothing in it still needs a 0.', 'Il semble qu\'un zéro a été oublié. Une position vide a quand même besoin d\'un 0.'), 1]],
      steps: [t('Write the digits in order after the decimal point: tenths, hundredths, thousandths.', 'Écris les chiffres dans l\'ordre après la virgule : dixièmes, centièmes, millièmes.'), t('Use a 0 for any place that is not mentioned.', 'Utilise un 0 pour toute position qui n\'est pas mentionnée.')],
      nudge: t('Which place is not mentioned? It needs a 0.', 'Quelle position n\'est pas mentionnée ? Elle a besoin d\'un 0.'),
    };
  })(tier, seed);
};

/** MS.G6.B1.5.a: round terminating and repeating decimals */
export const roundDecimals = numGen('MS.G6.B1.5.a', (tier, r) => {
  if (tier === 3) {
    const picks: [number, number, string][] = [[1, 3, '0.333…'], [2, 3, '0.666…'], [5, 6, '0.8333…'], [7, 9, '0.7777…'], [1, 6, '0.1666…'], [4, 9, '0.4444…'], [5, 9, '0.5555…'], [1, 7, '0.142857…']];
    const [n, d, sh] = pick(r, picks);
    const places = pick(r, [1, 2]);
    const T = Math.floor((n * 10000) / d); // ten-thousandths, truncated: enough digits to round correctly
    const rounded = Math.floor((T + 10 ** (4 - places) / 2) / 10 ** (4 - places)) / 10 ** places;
    const trunc = Math.floor(T / 10 ** (4 - places)) / 10 ** places;
    return {
      prompt: bi((f) => f.t(`${f.m(frac(n, d))} is ${sh}. Round it to the nearest ${places === 1 ? 'tenth' : 'hundredth'}.`, `${f.m(frac(n, d))} égale ${sh.replace('.', ',')}. Arrondis-le au ${places === 1 ? 'dixième' : 'centième'} près.`)),
      answer: rounded,
      wrong: trunc === rounded ? [] : [[trunc, t('It looks like the digits were just cut off. Look at the next digit: 5 or more means round up.', 'Il semble que les chiffres ont simplement été coupés. Regarde le chiffre suivant : 5 ou plus veut dire arrondir vers le haut.'), 1]],
      steps: [t(`Look at the digit after the ${places === 1 ? 'tenths' : 'hundredths'} place.`, `Regarde le chiffre qui suit la position des ${places === 1 ? 'dixièmes' : 'centièmes'}.`), bi((f) => f.t(`Round: ${f.N(rounded)}.`, `Arrondis : ${f.N(rounded)}.`))],
      nudge: t('Repeating digits go on forever; just look at the digit right after the place you are rounding to.', 'Les chiffres qui se répètent continuent à l\'infini ; regarde seulement le chiffre juste après la position à laquelle tu arrondis.'),
    };
  }
  const X = randInt(r, 1000, 99999); // thousandths
  const places = tier === 1 ? 0 : pick(r, [1, 2]);
  const v = X / 1000;
  const ans = roundThousandths(X, places);
  const trunc = Math.floor(X / 10 ** (3 - places)) / 10 ** places;
  const name = [['whole number', 'à l\'unité près'], ['tenth', 'au dixième près'], ['hundredth', 'au centième près']][places]!;
  return {
    prompt: bi((f) => `${f.t(`Round ${f.N(v)} to the nearest ${name[0]}.`, `Arrondis ${f.N(v)} ${name[1]}.`)}`),
    answer: ans,
    wrong: trunc === ans ? [] : [[trunc, t('It looks like the digits were just cut off. Look at the digit to the right: 5 or more means round up.', 'Il semble que les chiffres ont simplement été coupés. Regarde le chiffre à droite : 5 ou plus veut dire arrondir vers le haut.'), 1]],
    steps: [t(`Find the ${places === 0 ? 'ones' : places === 1 ? 'tenths' : 'hundredths'} place and look at the digit to its right.`, `Repère la position des ${places === 0 ? 'unités' : places === 1 ? 'dixièmes' : 'centièmes'} et regarde le chiffre à sa droite.`), bi((f) => f.t(`5 or more rounds up, less than 5 stays: ${f.N(ans)}.`, `5 ou plus arrondit vers le haut, moins de 5 reste pareil : ${f.N(ans)}.`))],
    nudge: t('Which digit decides? The one right after the place you round to.', 'Quel chiffre décide ? Celui qui suit directement la position à laquelle tu arrondis.'),
  };
});

/** MS.G6.B1.6.a: equivalences between fractions and decimals to thousandths */
export const fracDec6: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    const list: [number, number][] = [[3, 8], [9, 20], [3, 5], [1, 8], [1, 25], [7, 20], [7, 25], [2, 125], [5, 8], [11, 20], [13, 25], [3, 40]];
    const [n, d] = pick(r, list);
    const v = n / d;
    return build({
      skill: 'MS.G6.B1.6.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Write ${f.N(r6(v))} as a fraction in simplest form.`, `Écris ${f.N(r6(v))} sous forme de fraction irréductible.`)),
      answer: { kind: 'fraction', n, d, mustReduce: true },
      steps: [t('Write the decimal over a power of 10 (tenths, hundredths or thousandths).', 'Écris le nombre décimal sur une puissance de 10 (dixièmes, centièmes ou millièmes).'), bi((f) => f.t(`${f.N(r6(v))} = ${f.m(frac(Math.round(v * 1000), 1000))}. Simplify to ${f.m(frac(n, d))}.`, `${f.N(r6(v))} = ${f.m(frac(Math.round(v * 1000), 1000))}. Simplifie en ${f.m(frac(n, d))}.`))],
      nudge: t('Say the decimal as a fraction of 10, 100 or 1000, then divide top and bottom by their greatest common factor.', 'Dis le nombre décimal comme une fraction de 10, 100 ou 1000, puis divise le haut et le bas par leur plus grand facteur commun.'),
      stepHint: t('For example, 0.6 is 6 tenths, which is 6/10.', 'Par exemple, 0,6 égale 6 dixièmes, soit 6/10.'),
      wrong: [{ answer: { kind: 'fraction', n: Math.round(v * 1000), d: 1000 }, stepIndex: 1, why: t('That is equal to the decimal, but it is not in simplest form. Divide the top and bottom by the same number.', 'C\'est égal au nombre décimal, mais ce n\'est pas sous la forme irréductible. Divise le haut et le bas par le même nombre.') }],
      praise: t('Nice, you wrote it as a fraction and simplified.', 'Bravo, tu l\'as écrit sous forme de fraction et simplifié.'),
    });
  }
  return numGen('MS.G6.B1.6.a', (tr, rr) => {
    const list: [number, number][] = tr === 1
      ? [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [7, 10], [3, 10], [9, 10]]
      : [[1, 8], [3, 8], [5, 8], [7, 8], [7, 1000], [43, 1000], [9, 100], [67, 100], [123, 1000], [45, 1000]];
    const [n, d] = pick(rr, list);
    const v = r6(n / d);
    return {
      prompt: bi((f) => f.t(`Write ${f.m(frac(n, d))} as a decimal.`, `Écris ${f.m(frac(n, d))} sous forme de nombre décimal.`)),
      answer: v,
      wrong: [[r6(d / n), t('It looks like the denominator was divided by the numerator. A fraction means the numerator divided by the denominator.', 'Il semble que le dénominateur a été divisé par le numérateur. Une fraction veut dire le numérateur divisé par le dénominateur.'), 1], [r6((n / d) * 10), t('It looks like the decimal point is one place off. Check by multiplying your answer by the denominator.', 'Il semble que la virgule est décalée d\'une position. Vérifie en multipliant ta réponse par le dénominateur.'), 1]],
      steps: [t(`A fraction is a division: ${n} ÷ ${d}.`, `Une fraction est une division : ${n} ÷ ${d}.`), bi((f) => f.t(`${n} ÷ ${d} = ${f.N(v)}.`, `${n} ÷ ${d} = ${f.N(v)}.`))],
      nudge: t('Divide the numerator by the denominator, or make an equal fraction with 10, 100 or 1000 on the bottom.', 'Divise le numérateur par le dénominateur, ou fabrique une fraction égale avec 10, 100 ou 1000 en bas.'),
    };
  })(tier, seed);
};

/** MS.G6.B2.1.a: multi-step problems with decimals, fractions, ratios, rates and percents */
export const multiStep6 = numGen('MS.G6.B2.1.a', (tier, r) => {
  if (tier === 1) {
    const n = randInt(r, 3, 6), p = randInt(r, 125, 275) / 100, pay = 20;
    const cost = r6(n * p);
    return {
      prompt: bi((f) => f.t(`Ava buys ${n} juices at ${f.N(p)} dollars each and pays with a 20 dollar bill. How many dollars of change does she get?`, `Ava achète ${n} jus à ${f.N(p)} dollars chacun et paie avec un billet de 20 dollars. Combien de dollars lui rend-on ?`)),
      answer: r6(pay - cost), category: 'AP',
      wrong: [[cost, t('It looks like the total cost was given. The question asks for the change, so subtract the cost from 20.', 'Il semble que le coût total a été donné. La question demande la monnaie rendue : soustrais le coût de 20.'), 1], [r6(pay - p), t('It looks like only one juice was subtracted. Find the cost of all the juices first.', 'Il semble qu\'un seul jus a été soustrait. Trouve d\'abord le coût de tous les jus.'), 0]],
      steps: [bi((f) => f.t(`Cost: ${n} × ${f.N(p)} = ${f.N(cost)}.`, `Coût : ${n} × ${f.N(p)} = ${f.N(cost)}.`)), bi((f) => f.t(`Change: 20 − ${f.N(cost)} = ${f.N(r6(pay - cost))}.`, `Monnaie : 20 − ${f.N(cost)} = ${f.N(r6(pay - cost))}.`))],
      nudge: t('Find the total cost first, then take it away from 20.', 'Trouve d\'abord le coût total, puis soustrais-le de 20.'),
    };
  }
  if (tier === 2) {
    const d = pick(r, [2, 3, 4, 5]), a = randInt(r, 1, d - 1), batches = d * randInt(r, 2, 4), extra = randInt(r, 2, 6);
    const per = (batches / d) * a;
    return {
      prompt: bi((f) => f.t(`A recipe uses ${f.m(frac(a, d))} cup of oats for each batch. A baker makes ${batches} batches and also uses ${extra} cups of oats for a topping. How many cups of oats are used in all?`, `Une recette utilise ${f.m(frac(a, d))} tasse d'avoine par lot. Une boulangère fait ${batches} lots et utilise aussi ${extra} tasses d'avoine pour une garniture. Combien de tasses d'avoine sont utilisées en tout ?`)),
      answer: per + extra, category: 'AP',
      wrong: [[per, t('It looks like the topping was left out. It is part of the total.', 'Il semble que la garniture a été oubliée. Elle fait partie du total.'), 1], [batches + extra, t('It looks like each batch was counted as a whole cup. Each batch uses only a fraction of a cup.', 'Il semble que chaque lot a été compté comme une tasse entière. Chaque lot n\'utilise qu\'une fraction de tasse.'), 0]],
      steps: [t(`Oats for the batches: ${batches} × ${a}/${d} = ${per}.`, `Avoine pour les lots : ${batches} × ${a}/${d} = ${per}.`), t(`Add the topping: ${per} + ${extra} = ${per + extra}.`, `Ajoute la garniture : ${per} + ${extra} = ${per + extra}.`)],
      nudge: t('Find the oats for all the batches first, then add the topping.', 'Trouve d\'abord l\'avoine pour tous les lots, puis ajoute la garniture.'),
    };
  }
  const pct = pick(r, [10, 20, 25, 50]), price = randInt(r, 2, 12) * 20;
  const off = (price * pct) / 100;
  return {
    prompt: bi((f) => f.t(`A jacket costs ${f.N(price)} dollars. It is on sale for ${pct}% off. What is the sale price in dollars?`, `Un manteau coûte ${f.N(price)} dollars. Il est en solde à ${pct} % de rabais. Quel est le prix en solde, en dollars ?`)),
    answer: price - off, category: 'AP',
    wrong: [[off, t('It looks like the amount of the discount was given. The sale price is what you pay after taking it off.', 'Il semble que le montant du rabais a été donné. Le prix en solde est ce qu\'on paie après l\'avoir retiré.'), 1]],
    steps: [t(`${pct}% of ${price} is ${off}.`, `${pct} % de ${price}, c'est ${off}.`), t(`Sale price: ${price} − ${off} = ${price - off}.`, `Prix en solde : ${price} − ${off} = ${price - off}.`)],
    nudge: t('Find the discount first, then take it off the price.', 'Trouve d\'abord le rabais, puis retire-le du prix.'),
  };
});

/** MS.G6.B2.2.a: divisibility rules */
export const divisibility: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const rule = (d: number): Text => ({
    2: t('A number is divisible by 2 if its last digit is even.', 'Un nombre est divisible par 2 si son dernier chiffre est pair.'),
    3: t('A number is divisible by 3 if the sum of its digits is divisible by 3.', 'Un nombre est divisible par 3 si la somme de ses chiffres est divisible par 3.'),
    4: t('A number is divisible by 4 if its last two digits make a number divisible by 4.', 'Un nombre est divisible par 4 si ses deux derniers chiffres forment un nombre divisible par 4.'),
    5: t('A number is divisible by 5 if its last digit is 0 or 5.', 'Un nombre est divisible par 5 si son dernier chiffre est 0 ou 5.'),
    6: t('A number is divisible by 6 if it is divisible by both 2 and 3.', 'Un nombre est divisible par 6 s\'il est divisible par 2 et par 3.'),
    8: t('A number is divisible by 8 if its last three digits make a number divisible by 8.', 'Un nombre est divisible par 8 si ses trois derniers chiffres forment un nombre divisible par 8.'),
    9: t('A number is divisible by 9 if the sum of its digits is divisible by 9.', 'Un nombre est divisible par 9 si la somme de ses chiffres est divisible par 9.'),
    10: t('A number is divisible by 10 if its last digit is 0.', 'Un nombre est divisible par 10 si son dernier chiffre est 0.'),
  } as Record<number, Text>)[d]!;
  const N = (n: number) => bi((f) => f.N(n));
  if (tier === 1) {
    const d = pick(r, [2, 3, 5, 10]);
    const good = d * randInt(r, 12, 90);
    const bad = new Set<number>();
    while (bad.size < 3) { const c = randInt(r, 100, 999); if (c % d !== 0) bad.add(c); }
    const opts = shuffle(r, [good, ...bad]);
    return build({
      skill: 'MS.G6.B2.2.a', tier, seed, category: 'KU', format: 'choice',
      prompt: t(`Which number is divisible by ${d}?`, `Quel nombre est divisible par ${d} ?`),
      options: opts.map(N), answer: { kind: 'choice', index: opts.indexOf(good) },
      steps: [rule(d), t('Check each choice with the rule.', 'Vérifie chaque choix avec la règle.')], nudge: rule(d), stepHint: t('Check each choice with the rule.', 'Vérifie chaque choix avec la règle.'),
      wrong: opts.map((o, i) => ({ answer: { kind: 'choice' as const, index: i }, stepIndex: 0, why: rule(d) })).filter((w) => opts[w.answer.index] !== good),
      praise: t('Nice, you used the divisibility rule.', 'Bravo, tu as utilisé la règle de divisibilité.'),
    });
  }
  if (tier === 2) {
    const d = pick(r, [3, 4, 6, 9]);
    const goods = new Set<number>(), bads = new Set<number>();
    const want = randInt(r, 2, 3);
    while (goods.size < want) goods.add(d * randInt(r, 12, 160));
    while (bads.size < 5 - want) { const c = randInt(r, 100, 999); if (c % d !== 0) bads.add(c); }
    const opts = shuffle(r, [...goods, ...bads]);
    return build({
      skill: 'MS.G6.B2.2.a', tier, seed, category: 'KU', format: 'multi',
      prompt: t(`Select every number that is divisible by ${d}.`, `Choisis tous les nombres divisibles par ${d}.`),
      options: opts.map(N), answer: { kind: 'multi', indices: opts.map((o, i) => (o % d === 0 ? i : -1)).filter((i) => i >= 0) },
      steps: [rule(d), t('Check every choice. More than one may be divisible.', 'Vérifie chaque choix. Plus d\'un peut être divisible.')], nudge: rule(d), stepHint: t('Check every choice with the rule.', 'Vérifie chaque choix avec la règle.'),
      praise: t('Nice, you checked every number.', 'Bravo, tu as vérifié chaque nombre.'),
    });
  }
  const pairs: [number, number][] = [[2, 3], [3, 4], [2, 9], [4, 9], [5, 6], [3, 5], [2, 5], [4, 5], [3, 8], [6, 10]];
  const [p, q] = pick(r, pairs);
  const lc = (p * q) / gcd(p, q);
  const n = lc * randInt(r, Math.ceil(100 / lc), Math.floor(9990 / lc));
  const falsePairs = shuffle(r, pairs.filter(([a, b]) => !(n % a === 0 && n % b === 0))).slice(0, 3);
  const stmts = shuffle(r, [[p, q] as [number, number], ...falsePairs]);
  const idx = stmts.findIndex(([a, b]) => a === p && b === q);
  return build({
    skill: 'MS.G6.B2.2.a', tier, seed, category: 'TH', format: 'choice',
    prompt: bi((f) => f.t(`Which statement is true about ${f.N(n)}?`, `Quel énoncé est vrai à propos de ${f.N(n)} ?`)),
    options: stmts.map(([a, b]) => t(`It is divisible by ${a} and by ${b}.`, `Il est divisible par ${a} et par ${b}.`)), answer: { kind: 'choice', index: idx },
    steps: [t('Test each divisor with its rule.', 'Teste chaque diviseur avec sa règle.'), t('Only one statement has both divisors that work.', 'Un seul énoncé a deux diviseurs qui fonctionnent.')],
    nudge: t('Test the divisors one at a time using their rules.', 'Teste les diviseurs un à la fois avec leurs règles.'), stepHint: t('Cross out any statement with a divisor that does not work.', 'Raye tout énoncé qui contient un diviseur qui ne fonctionne pas.'),
    wrong: stmts.map((_, i) => ({ answer: { kind: 'choice' as const, index: i }, stepIndex: 0, why: t('At least one of those divisors does not divide the number. Check each rule.', 'Au moins un de ces diviseurs ne divise pas le nombre. Vérifie chaque règle.') })).filter((w) => w.answer.index !== idx),
    praise: t('Nice, you tested each divisor.', 'Bravo, tu as testé chaque diviseur.'),
  });
};

/** MS.G6.B2.3.a: mental math for 1%, 5%, 10%, 15%, 25% and 50% */
export const percentMental = numGen('MS.G6.B2.3.a', (tier, r) => {
  const pct = tier === 1 ? pick(r, [10, 50]) : tier === 2 ? pick(r, [25, 1, 10, 50]) : pick(r, [15, 5, 25, 10]);
  const unit = pct === 1 ? 100 : pct === 25 ? 4 : pct === 15 ? 20 : pct === 5 ? 20 : 10;
  const N = unit * randInt(r, 2, tier === 3 ? 18 : 30);
  const ans = r6((N * pct) / 100);
  const how: Record<number, Text> = {
    10: t('10% is one tenth: divide by 10.', '10 %, c\'est un dixième : divise par 10.'),
    50: t('50% is one half: divide by 2.', '50 %, c\'est une moitié : divise par 2.'),
    25: t('25% is one quarter: divide by 4.', '25 %, c\'est un quart : divise par 4.'),
    1: t('1% is one hundredth: divide by 100.', '1 %, c\'est un centième : divise par 100.'),
    5: t('5% is half of 10%: find 10% then halve it.', '5 %, c\'est la moitié de 10 % : trouve 10 % puis prends la moitié.'),
    15: t('15% is 10% plus 5%: find each and add.', '15 %, c\'est 10 % plus 5 % : trouve chacun et additionne.'),
  };
  return {
    prompt: bi((f) => f.t(`What is ${pct}% of ${f.N(N)}?`, `Combien font ${pct} % de ${f.N(N)} ?`)),
    answer: ans,
    wrong: [[pct, t('It looks like the percent number was given. A percent is a part of the whole, so find that part of the number.', 'Il semble que le nombre du pourcentage a été donné. Un pourcentage est une partie du tout : trouve cette partie du nombre.'), 0], [r6((N * pct) / 10), t('It looks like the answer is 10 times too big. Remember percent means out of 100.', 'Il semble que la réponse est 10 fois trop grande. Rappelle-toi que pourcentage veut dire sur 100.'), 0]],
    steps: [how[pct]!, bi((f) => f.t(`${pct}% of ${f.N(N)} = ${f.N(ans)}.`, `${pct} % de ${f.N(N)} = ${f.N(ans)}.`))],
    nudge: how[pct]!,
    praise: t('Nice, you used a friendly percent.', 'Bravo, tu as utilisé un pourcentage facile.'),
  };
});

/** MS.G6.B2.4.a: add and subtract whole numbers and decimals */
export const addSub6 = numGen('MS.G6.B2.4.a', (tier, r) => {
  const sub = r() < 0.5;
  const verb = (f: F) => f.t(sub ? 'Subtract' : 'Add', sub ? 'Soustrais' : 'Additionne');
  if (tier === 1) {
    const b = randInt(r, 10000, 450000);
    const a = sub ? randInt(r, b + 1000, 999999) : randInt(r, 10000, 999999 - b);
    const ans = sub ? a - b : a + b;
    return {
      prompt: bi((f) => `${verb(f)} ${f.m(`${f.n(a)} ${sub ? '-' : '+'} ${f.n(b)}`)}`), answer: ans,
      wrong: [[sub ? a + b : Math.abs(a - b), t('It looks like the wrong operation was used. Read the sign carefully.', 'Il semble que la mauvaise opération a été utilisée. Lis bien le signe.'), 0]],
      steps: [t('Line up the digits by place value.', 'Aligne les chiffres selon la valeur de position.'), bi((f) => f.t(`${sub ? 'Subtract' : 'Add'} column by column, regrouping when needed: ${f.N(ans)}.`, `${sub ? 'Soustrais' : 'Additionne'} colonne par colonne en regroupant au besoin : ${f.N(ans)}.`))],
      nudge: t('Work from the ones column to the left, regrouping when you need to.', 'Va des unités vers la gauche en regroupant au besoin.'),
    };
  }
  const A = randInt(r, 1000, 99999), B = randInt(r, 100, 9999); // a has up to 3 decimals, b up to 2 decimals
  const left = A / 1000, right = B / 100;
  const isSub = sub && left > right;
  const ans = r6(isSub ? left - right : left + right);
  const misaligned = r6((isSub ? A - B : A + B) / 1000);
  const story = tier === 3 && r() < 0.5;
  return {
    prompt: story
      ? bi((f) => f.t(`A runner ran ${f.N(left)} km on Monday and ${f.N(right)} km on Tuesday. How many kilometres is that in all?`, `Une coureuse a couru ${f.N(left)} km lundi et ${f.N(right)} km mardi. Combien de kilomètres cela fait-il en tout ?`))
      : bi((f) => `${f.t(isSub ? 'Subtract' : 'Add', isSub ? 'Soustrais' : 'Additionne')} ${f.m(`${f.n(left)} ${isSub ? '-' : '+'} ${f.n(right)}`)}`),
    answer: story ? r6(left + right) : ans, category: story ? 'AP' : 'KU',
    wrong: [[story ? r6((A + B) / 1000) : misaligned, t('It looks like the digits were lined up on the right instead of by the decimal point. Line up the decimal points first.', 'Il semble que les chiffres ont été alignés à droite plutôt que sur la virgule. Aligne d\'abord les virgules.'), 0]],
    steps: [t('Line up the decimal points and add zeros so both numbers have the same number of decimal places.', 'Aligne les virgules et ajoute des zéros pour que les deux nombres aient le même nombre de décimales.'), bi((f) => f.t(`Work out the answer: ${f.N(story ? r6(left + right) : ans)}.`, `Calcule la réponse : ${f.N(story ? r6(left + right) : ans)}.`))],
    nudge: t('Line up the decimal points before you add or subtract.', 'Aligne les virgules avant d\'additionner ou de soustraire.'),
    praise: t('Nice, you lined up the decimal points.', 'Bravo, tu as aligné les virgules.'),
  };
});

const factorize = (n: number): number[] => { const f: number[] = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; };
const isPrime = (n: number): boolean => n > 1 && factorize(n).length === 1;
const factorTex = (fs: number[]): string => {
  const m = new Map<number, number>();
  fs.forEach((p) => m.set(p, (m.get(p) ?? 0) + 1));
  return [...m.entries()].map(([p, e]) => (e > 1 ? `${p}^{${e}}` : `${p}`)).join(' \\times ');
};

/** MS.G6.B2.6.a: prime factorization */
export const primeFactors: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 1) {
    const primes = new Set<number>(), comps = new Set<number>();
    while (primes.size < 2) primes.add(pick(r, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]));
    while (comps.size < 3) { const c = randInt(r, 4, 49); if (!isPrime(c)) comps.add(c); }
    const opts = shuffle(r, [...primes, ...comps]);
    return build({
      skill: 'MS.G6.B2.6.a', tier, seed, category: 'KU', format: 'multi',
      prompt: t('Select every prime number.', 'Choisis tous les nombres premiers.'),
      options: opts.map((o) => bi((f) => f.N(o))), answer: { kind: 'multi', indices: opts.map((o, i) => (isPrime(o) ? i : -1)).filter((i) => i >= 0) },
      steps: [t('A prime number has exactly two factors: 1 and itself.', 'Un nombre premier a exactement deux facteurs : 1 et lui-même.'), t('Test each number: if it divides evenly by anything else, it is not prime.', 'Teste chaque nombre : s\'il se divise exactement par autre chose, il n\'est pas premier.')],
      nudge: t('Try dividing each number by 2, 3, 5 and 7.', 'Essaie de diviser chaque nombre par 2, 3, 5 et 7.'), stepHint: t('If a number has a factor other than 1 and itself, it is composite.', 'Si un nombre a un facteur autre que 1 et lui-même, il est composé.'),
      praise: t('Nice, you tested every number.', 'Bravo, tu as testé chaque nombre.'),
    });
  }
  if (tier === 2) {
    const n = pick(r, [12, 18, 20, 24, 28, 30, 36, 40, 45, 48, 50, 54, 60, 63, 72, 75, 80, 90, 96, 100]);
    const fs = factorize(n);
    const right = factorTex(fs);
    const wrongs = new Set<string>();
    const divs = [...Array(n - 1).keys()].map((i) => i + 2).filter((d) => n % d === 0 && d * d <= n && !isPrime(d));
    for (const d of divs) wrongs.add(`${d} \\times ${n / d}`);
    if (fs.length >= 3) wrongs.add(`${fs[0]} \\times ${fs.slice(1).reduce((a, b) => a * b, 1)}`);
    const nextPrime = (p: number) => { let c = p + 1; while (!isPrime(c)) c++; return c; };
    wrongs.add(`${factorTex(fs.slice(0, -1))} \\times ${nextPrime(fs[fs.length - 1]!)}`); // primes, but the product is not n
    wrongs.add(`1 \\times ${n}`);
    const wrongList = shuffle(r, [...wrongs].filter((w) => w !== right)).slice(0, 3);
    const opts = shuffle(r, [right, ...wrongList]);
    return build({
      skill: 'MS.G6.B2.6.a', tier, seed, category: 'KU', format: 'choice',
      prompt: bi((f) => f.t(`Which is the prime factorization of ${f.N(n)}?`, `Laquelle est la factorisation première de ${f.N(n)} ?`)),
      options: opts.map((o) => t(tex(o), tex(o))), answer: { kind: 'choice', index: opts.indexOf(right) },
      steps: [t('Build a factor tree: split the number into two factors, then keep splitting until every branch is prime.', 'Fais un arbre de facteurs : sépare le nombre en deux facteurs, puis continue jusqu\'à ce que chaque branche soit un nombre premier.'), t('A prime factorization uses only prime numbers, and the product must equal the number.', 'Une factorisation première n\'utilise que des nombres premiers, et le produit doit égaler le nombre.')],
      nudge: t('Every factor in a prime factorization must be a prime number.', 'Chaque facteur d\'une factorisation première doit être un nombre premier.'), stepHint: t('Cross out any choice that has a factor that is not prime.', 'Raye tout choix qui contient un facteur qui n\'est pas premier.'),
      wrong: opts.map((_, i) => ({ answer: { kind: 'choice' as const, index: i }, stepIndex: 1, why: t('That is not a prime factorization: either a factor is not prime or the product is not the number.', 'Ce n\'est pas une factorisation première : soit un facteur n\'est pas premier, soit le produit n\'est pas le nombre.') })).filter((w) => w.answer.index !== opts.indexOf(right)),
      praise: t('Nice, you split it all the way down to primes.', 'Bravo, tu l\'as décomposé jusqu\'aux nombres premiers.'),
    });
  }
  return numGen('MS.G6.B2.6.a', (_tr, rr) => {
    let n: number;
    do { n = randInt(rr, 60, 210); } while (isPrime(n) || new Set(factorize(n)).size < 2);
    const fs = factorize(n);
    const greatest = Math.max(...fs);
    return {
      prompt: bi((f) => f.t(`What is the greatest prime factor of ${f.N(n)}?`, `Quel est le plus grand facteur premier de ${f.N(n)} ?`)),
      answer: greatest,
      wrong: [[Math.min(...fs), t('It looks like the least prime factor was given. The question asks for the greatest.', 'Il semble que le plus petit facteur premier a été donné. La question demande le plus grand.'), 1], [n / Math.min(...fs), t('It looks like the greatest factor was given, but it is not always prime. Break it into primes.', 'Il semble que le plus grand facteur a été donné, mais il n\'est pas toujours premier. Décompose-le en nombres premiers.'), 0]],
      steps: [t(`Prime factorization: ${fs.join(' × ')}.`, `Factorisation première : ${fs.join(' × ')}.`), t(`The greatest prime factor is ${greatest}.`, `Le plus grand facteur premier est ${greatest}.`)],
      nudge: t('Make a factor tree first, then pick the greatest prime on it.', 'Fais d\'abord un arbre de facteurs, puis choisis le plus grand nombre premier.'),
    };
  })(tier, seed);
};

/** MS.G6.B2.7.a: three-digit whole number by a decimal in tenths */
export const timesTenths = numGen('MS.G6.B2.7.a', (tier, r) => {
  const a = randInt(r, tier === 1 ? 100 : 100, tier === 1 ? 300 : 999), tn = randInt(r, 2, 9);
  const ans = r6((a * tn) / 10);
  return {
    prompt: bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${a} \\times ${f.lang === 'fr' ? `0{,}${tn}` : `0.${tn}`}`)}`),
    answer: ans,
    wrong: [[a * tn, t('It looks like the decimal point was left out. Tenths make the answer 10 times smaller than the whole-number product.', 'Il semble que la virgule a été oubliée. Les dixièmes rendent la réponse 10 fois plus petite que le produit des nombres entiers.'), 1], [r6((a * tn) / 100), t('It looks like the decimal point moved two places. Tenths move it one place.', 'Il semble que la virgule a bougé de deux positions. Les dixièmes la déplacent d\'une position.'), 1]],
    steps: [t(`Multiply as whole numbers: ${a} × ${tn} = ${a * tn}.`, `Multiplie comme des nombres entiers : ${a} × ${tn} = ${a * tn}.`), bi((f) => f.t(`There is one decimal place, so ${a * tn} becomes ${f.N(ans)}.`, `Il y a une décimale, donc ${a * tn} devient ${f.N(ans)}.`))],
    nudge: t('Ignore the decimal point, multiply, then put it back with the same number of decimal places.', 'Ignore la virgule, multiplie, puis remets-la avec le même nombre de décimales.'),
    praise: t('Nice, you placed the decimal point.', 'Bravo, tu as bien placé la virgule.'),
  };
});

/** MS.G6.B2.8.a: three-digit whole number divided by a decimal in tenths */
export const divideByTenths = numGen('MS.G6.B2.8.a', (tier, r) => {
  const tn = pick(r, tier === 1 ? [5, 2] : [2, 4, 5, 8]);
  let a: number;
  do { a = randInt(r, 100, 999); } while ((a * 10) % tn !== 0);
  const ans = (a * 10) / tn;
  return {
    prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${a} \\div ${f.lang === 'fr' ? `0{,}${tn}` : `0.${tn}`}`)}`),
    answer: ans,
    wrong: [[r6(ans / 10), t('It looks like the answer is 10 times too small. Dividing by tenths gives a bigger answer than the whole number.', 'Il semble que la réponse est 10 fois trop petite. Diviser par des dixièmes donne une réponse plus grande que le nombre entier.'), 1], [r6(a / tn), t('It looks like the decimal was treated as a whole number. Multiply both numbers by 10 first.', 'Il semble que le nombre décimal a été traité comme un nombre entier. Multiplie d\'abord les deux nombres par 10.'), 0]],
    steps: [t(`Multiply both numbers by 10: ${a * 10} ÷ ${tn}.`, `Multiplie les deux nombres par 10 : ${a * 10} ÷ ${tn}.`), t(`${a * 10} ÷ ${tn} = ${ans}.`, `${a * 10} ÷ ${tn} = ${ans}.`)],
    nudge: t('Make the divisor a whole number by multiplying both numbers by 10.', 'Rends le diviseur entier en multipliant les deux nombres par 10.'),
    praise: t('Nice, you made the divisor a whole number first.', 'Bravo, tu as d\'abord rendu le diviseur entier.'),
  };
});

/** MS.G6.B2.9.a: whole number times a proper fraction */
export const wholeTimesFraction: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = pick(r, [2, 3, 4, 5, 6, 8]);
  const a = randInt(r, 1, d - 1);
  if (tier === 3) {
    let n: number;
    do { n = randInt(r, 3, 15); } while (n % d === 0);
    const num = n * a;
    const g = gcd(num, d);
    const ansN = num / g, ansD = d / g;
    return build({
      skill: 'MS.G6.B2.9.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Multiply ${f.m(`${n} \\times ${frac(a, d)}`)}. Write the answer as a fraction in simplest form.`, `Multiplie ${f.m(`${n} \\times ${frac(a, d)}`)}. Écris la réponse sous forme de fraction irréductible.`)),
      answer: { kind: 'fraction', n: ansN, d: ansD, mustReduce: true },
      steps: [t(`Write ${n} as ${n}/1 and multiply the numerators and the denominators: ${n}×${a} over ${d}.`, `Écris ${n} sous la forme ${n}/1 et multiplie les numérateurs et les dénominateurs : ${n}×${a} sur ${d}.`), t(`${num}/${d}, simplified, is ${ansN}/${ansD}.`, `${num}/${d}, simplifié, égale ${ansN}/${ansD}.`)],
      nudge: t('Multiply the whole number by the numerator and keep the denominator.', 'Multiplie le nombre entier par le numérateur et garde le dénominateur.'),
      stepHint: t('Multiply the whole number by the numerator only.', 'Multiplie le nombre entier par le numérateur seulement.'),
      wrong: [{ answer: { kind: 'fraction', n: n * a, d: n * d }, stepIndex: 0, why: t('It looks like the denominator was multiplied by the whole number too. Only the numerator is multiplied.', 'Il semble que le dénominateur a aussi été multiplié par le nombre entier. Seul le numérateur est multiplié.') }],
      praise: t('Nice, you multiplied the numerator and kept the denominator.', 'Bravo, tu as multiplié le numérateur et gardé le dénominateur.'),
    });
  }
  return numGen('MS.G6.B2.9.a', (tr, rr) => {
    const n = d * randInt(rr, 2, tr === 1 ? 6 : 9);
    const ans = (n / d) * a;
    const story = tr === 2;
    return {
      prompt: story ? bi((f) => f.t(`A trail is ${n} km long. Jordan hikes ${f.m(frac(a, d))} of it. How many kilometres does Jordan hike?`, `Un sentier mesure ${n} km. Jordan en parcourt ${f.m(frac(a, d))}. Combien de kilomètres Jordan parcourt-il ?`)) : bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${n} \\times ${frac(a, d)}`)}`),
      answer: ans, category: story ? 'AP' : 'KU',
      wrong: [[n * a * d, t('It looks like the whole number was multiplied by both the numerator and the denominator. Multiply by the numerator and divide by the denominator.', 'Il semble que le nombre entier a été multiplié par le numérateur et par le dénominateur. Multiplie par le numérateur et divise par le dénominateur.'), 0], [n / d, t('It looks like only the division by the denominator was done. Then multiply by the numerator.', 'Il semble que seule la division par le dénominateur a été faite. Multiplie ensuite par le numérateur.'), 1]],
      steps: [t(`Find one ${d}th of ${n}: ${n} ÷ ${d} = ${n / d}.`, `Trouve 1/${d} de ${n} : ${n} ÷ ${d} = ${n / d}.`), t(`Take ${a} of them: ${n / d} × ${a} = ${ans}.`, `Prends-en ${a} : ${n / d} × ${a} = ${ans}.`)],
      nudge: t('Divide by the denominator first, then multiply by the numerator.', 'Divise d\'abord par le dénominateur, puis multiplie par le numérateur.'),
    };
  })(tier, seed);
};

/** MS.G6.B2.10.a: whole number divided by a proper fraction */
export const wholeDivFraction = numGen('MS.G6.B2.10.a', (tier, r) => {
  const a = pick(r, [2, 3, 4, 5]);
  let d: number;
  do { d = randInt(r, a + 1, 9); } while (gcd(a, d) !== 1);
  const n = a * randInt(r, 2, tier === 1 ? 5 : 9);
  const ans = (n / a) * d;
  const story = tier === 3;
  return {
    prompt: story ? bi((f) => f.t(`A baker has ${n} cups of flour. Each loaf uses ${f.m(frac(a, d))} cup. How many loaves can the baker make?`, `Un boulanger a ${n} tasses de farine. Chaque pain utilise ${f.m(frac(a, d))} de tasse. Combien de pains le boulanger peut-il faire ?`)) : bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${n} \\div ${frac(a, d)}`)}`),
    answer: ans, category: story ? 'AP' : 'KU',
    wrong: [[r6((n * a) / d), t('It looks like the whole number was multiplied by the fraction. Dividing by a fraction asks how many of those parts fit.', 'Il semble que le nombre entier a été multiplié par la fraction. Diviser par une fraction demande combien de ces parties tiennent.'), 0]],
    steps: [t(`How many ${a}/${d} fit in 1 whole? ${d}/${a}.`, `Combien de ${a}/${d} tiennent dans 1 entier ? ${d}/${a}.`), t(`${n} × ${d}/${a} = ${ans}.`, `${n} × ${d}/${a} = ${ans}.`)],
    nudge: t('To divide by a fraction, multiply by its reciprocal (flip it).', 'Pour diviser par une fraction, multiplie par son inverse (retourne-la).'),
    praise: t('Nice, you flipped the fraction and multiplied.', 'Bravo, tu as retourné la fraction et multiplié.'),
  };
});

/** MS.G6.B2.11.a: decimals to thousandths divided by whole numbers up to 10 */
export const divideDecimals = numGen('MS.G6.B2.11.a', (tier, r) => {
  const m = randInt(r, 2, tier === 3 ? 10 : 5);
  const places = tier;
  const q = randInt(r, 12, 999) / 10 ** places;
  const dividend = r6(q * m);
  return {
    prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${f.n(dividend)} \\div ${m}`)}`),
    answer: r6(q),
    wrong: [[r6(q * 10), t('It looks like the decimal point is one place too far right. Check by multiplying your answer by the divisor.', 'Il semble que la virgule est une position trop à droite. Vérifie en multipliant ta réponse par le diviseur.'), 1], [r6(q / 10), t('It looks like the decimal point is one place too far left. Estimate first to check the size.', 'Il semble que la virgule est une position trop à gauche. Estime d\'abord pour vérifier la grandeur.'), 1]],
    steps: [t('Divide as if there were no decimal point, then put the decimal point in the quotient straight above its place in the dividend.', 'Divise comme s\'il n\'y avait pas de virgule, puis place la virgule dans le quotient directement au-dessus de sa position dans le dividende.'), bi((f) => f.t(`${f.N(dividend)} ÷ ${m} = ${f.N(r6(q))}.`, `${f.N(dividend)} ÷ ${m} = ${f.N(r6(q))}.`))],
    nudge: t('Estimate first. Then check: quotient × divisor should equal the dividend.', 'Estime d\'abord. Puis vérifie : quotient × diviseur doit donner le dividende.'),
    praise: t('Nice, you placed the decimal point carefully.', 'Bravo, tu as placé la virgule avec soin.'),
  };
});

/** MS.G6.B2.12.a: ratios, percents and rates */
export const ratiosPercents: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    for (let guard = 0; guard < 200; guard++) {
      const s1 = randInt(r, 3, 8), s2 = s1 + randInt(r, 2, 6);
      const u1 = randInt(r, 70, 130) / 100, u2 = u1 - randInt(r, 5, 15) / 100;
      const p1 = r6(s1 * u1), p2 = r6(s2 * u2);
      if (p2 <= p1 || Math.abs(p1 * 100 - Math.round(p1 * 100)) > 1e-6 || Math.abs(p2 * 100 - Math.round(p2 * 100)) > 1e-6) continue;
      const opts: [number, number][] = shuffle(r, [[s1, p1], [s2, p2]] as [number, number][]);
      const best = opts.findIndex(([s, p]) => s === s2 && p === p2);
      return build({
        skill: 'MS.G6.B2.12.a', tier, seed, category: 'AP', format: 'choice',
        prompt: t('Which is the better buy (the lower price for each one)?', 'Quel est le meilleur achat (le prix le plus bas pour chacun) ?'),
        options: opts.map(([s, p]) => bi((f) => f.t(`${s} for ${f.N(p)} dollars`, `${s} pour ${f.N(p)} dollars`))), answer: { kind: 'choice', index: best },
        steps: [t('Find the price for one item in each: divide the price by the number of items.', 'Trouve le prix d\'un article dans chaque cas : divise le prix par le nombre d\'articles.'), t('The lower price for one item is the better buy.', 'Le prix le plus bas pour un article est le meilleur achat.')],
        nudge: t('Compare the price for one item, not the total price.', 'Compare le prix d\'un article, pas le prix total.'), stepHint: t('Divide each price by the number of items.', 'Divise chaque prix par le nombre d\'articles.'),
        wrong: [{ answer: { kind: 'choice', index: 1 - best }, stepIndex: 0, why: t('It looks like the total prices were compared. The packs are different sizes, so compare the price for one item (the unit rate).', 'Il semble que les prix totaux ont été comparés. Les emballages n\'ont pas la même taille : compare le prix d\'un article (le taux unitaire).') }],
        praise: t('Nice, you compared unit rates.', 'Bravo, tu as comparé des taux unitaires.'),
      });
    }
  }
  return numGen('MS.G6.B2.12.a', (tr, rr) => {
    if (tr === 1) {
      const a = randInt(rr, 1, 5), b = randInt(rr, a + 1, 8), k = randInt(rr, 2, 9);
      return {
        prompt: t(`The ratio of red marbles to blue marbles is ${a}:${b}. There are ${b * k} blue marbles. How many red marbles are there?`, `Le rapport des billes rouges aux billes bleues est ${a}:${b}. Il y a ${b * k} billes bleues. Combien y a-t-il de billes rouges ?`),
        answer: a * k, category: 'AP',
        wrong: [[a + (b * k - b), t('It looks like the difference was added to the red marbles. Ratios grow by multiplying both terms by the same number.', 'Il semble que la différence a été ajoutée aux billes rouges. Les rapports augmentent par multiplication des deux termes par le même nombre.'), 1]],
        steps: [t(`Blue went from ${b} to ${b * k}: multiplied by ${k}.`, `Les bleues sont passées de ${b} à ${b * k} : multipliées par ${k}.`), t(`Red: ${a} × ${k} = ${a * k}.`, `Rouges : ${a} × ${k} = ${a * k}.`)],
        nudge: t('Find what the blue part was multiplied by, then do the same to the red part.', 'Trouve par quoi la partie bleue a été multipliée, puis fais pareil à la partie rouge.'),
      };
    }
    const pct = randInt(rr, 1, 19) * 5, base = randInt(rr, 2, 20) * 20;
    return {
      prompt: bi((f) => f.t(`What is ${pct}% of ${f.N(base)}?`, `Combien font ${pct} % de ${f.N(base)} ?`)),
      answer: r6((base * pct) / 100),
      wrong: [[r6((base * pct) / 10), t('It looks like the answer is 10 times too big. Percent means out of 100.', 'Il semble que la réponse est 10 fois trop grande. Pourcentage veut dire sur 100.'), 1], [pct, t('It looks like the percent number was given. Find that part of the number.', 'Il semble que le nombre du pourcentage a été donné. Trouve cette partie du nombre.'), 0]],
      steps: [t(`Write ${pct}% as ${pct}/100.`, `Écris ${pct} % sous la forme ${pct}/100.`), bi((f) => f.t(`${pct}/100 × ${f.N(base)} = ${f.N(r6((base * pct) / 100))}.`, `${pct}/100 × ${f.N(base)} = ${f.N(r6((base * pct) / 100))}.`))],
      nudge: t('Find 1% first (divide by 100), then multiply by the percent.', 'Trouve d\'abord 1 % (divise par 100), puis multiplie par le pourcentage.'),
    };
  })(tier === 3 ? 2 : tier, seed);
};

