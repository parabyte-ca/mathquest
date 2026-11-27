// Grade 5 Number strand (B): whole numbers, rounding, operations, unit fractions, ratios and rates.
import { makeRng, pick, randInt, shuffle } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, numGen, r6 } from './dsl.js';
import { build, t, tex } from './kit.js';

const SYMS = ['<', '>', '='] as const;
const symOptions: Text[] = SYMS.map((s) => t(tex(s), tex(s)));
const symIdx = (a: number, b: number): number => (a < b ? 0 : a > b ? 1 : 2);

/** MS.G5.B1.1.a: compose and decompose whole numbers to 100 000 */
export const composeWhole = numGen('MS.G5.B1.1.a', (tier, r) => {
  if (tier === 3) {
    const h = randInt(r, 120, 990);
    const N = h * 100;
    return {
      prompt: bi((f) => `${f.t('How many hundreds are in', 'Combien y a-t-il de centaines dans')} ${f.N(N)} ?`),
      answer: h,
      wrong: [
        [Math.floor(N / 1000), t('It looks like thousands were counted. A hundred is a smaller group than a thousand, so there are more of them.', 'Il semble que des milliers ont été comptés. Une centaine est un groupe plus petit qu\'un millier, donc il y en a plus.'), 0],
        [N / 10, t('It looks like tens were counted. Each hundred is ten tens, so divide by 100, not 10.', 'Il semble que des dizaines ont été comptées. Chaque centaine vaut dix dizaines : divise par 100, pas par 10.'), 0],
      ],
      steps: [
        bi((f) => f.t(`One hundred is 100, so divide ${f.N(N)} by 100.`, `Une centaine vaut 100, donc divise ${f.N(N)} par 100.`)),
        bi((f) => f.t(`${f.N(N)} ÷ 100 = ${h}.`, `${f.N(N)} ÷ 100 = ${h}.`)),
      ],
      nudge: t('How many hundreds make up one thousand? Use that to count.', 'Combien de centaines font un millier ? Sers-toi-en pour compter.'),
      praise: t('Nice, you divided by 100.', 'Bravo, tu as divisé par 100.'),
    };
  }
  const places = tier === 1 ? [1000, 100, 10, 1] : [10000, 1000, 100, 10, 1];
  const names = tier === 1 ? [['thousands', 'milliers'], ['hundreds', 'centaines'], ['tens', 'dizaines'], ['ones', 'unités']] : [['ten-thousands', 'dizaines de mille'], ['thousands', 'milliers'], ['hundreds', 'centaines'], ['tens', 'dizaines'], ['ones', 'unités']];
  const digits = places.map((_, i) => (i === 0 ? randInt(r, 1, 9) : randInt(r, 0, 9)));
  const zero = randInt(r, 1, places.length - 2); // a middle zero, so the placeholder matters
  digits[zero] = 0;
  const value = digits.reduce((s, d, i) => s + d * places[i]!, 0);
  const parts = digits.map((d, i) => (d ? [d, names[i]![0], names[i]![1]] as [number, string, string] : null)).filter((x): x is [number, string, string] => x !== null);
  const noZero = Number(digits.filter((d, i) => d || i === 0).join(''));
  return {
    prompt: t(`What number is ${parts.map((p) => `${p[0]} ${p[1]}`).join(' + ')}?`, `Quel nombre est ${parts.map((p) => `${p[0]} ${p[2]}`).join(' + ')} ?`),
    answer: value,
    wrong: [[noZero, t('It looks like the zero was left out. A place with nothing in it still needs a 0 to hold it.', 'Il semble que le zéro a été oublié. Une position vide a quand même besoin d\'un 0 pour la tenir.'), 1]],
    steps: [
      t(`Write each part in its place: ${parts.map((p) => `${p[0]} ${p[1]}`).join(', ')}.`, `Écris chaque partie à sa position : ${parts.map((p) => `${p[0]} ${p[2]}`).join(', ')}.`),
      t(`Put a 0 in any place that is missing.`, 'Mets un 0 à chaque position qui manque.'),
      bi((f) => f.t(`The number is ${f.N(value)}.`, `Le nombre est ${f.N(value)}.`)),
    ],
    nudge: t('Which place has nothing in it? That place needs a 0.', 'Quelle position est vide ? Elle a besoin d\'un 0.'),
    stepHint: t('Write the parts from the greatest place to the ones place, with a 0 where a place is missing.', 'Écris les parties de la plus grande position aux unités, avec un 0 là où une position manque.'),
    praise: t('Nice, you held the empty place with a 0.', 'Bravo, tu as tenu la position vide avec un 0.'),
  };
});

/** MS.G5.B1.2.a: compare and order whole numbers to 100 000 */
export const compareWhole: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    const base = randInt(r, 10, 90) * 1000;
    const vals = new Set<number>();
    while (vals.size < 4) vals.add(base + randInt(r, 0, 9) * 100 + randInt(r, 0, 9) * 10 + randInt(r, 0, 9));
    const list = [...vals];
    const idx = list.map((_, i) => i).sort((i, j) => list[i]! - list[j]!);
    return build({
      skill: 'MS.G5.B1.2.a', tier, seed, category: 'TH', format: 'order',
      prompt: t('Put these numbers in order from least to greatest.', 'Place ces nombres en ordre, du plus petit au plus grand.'),
      options: list.map((v) => bi((f) => f.N(v))),
      answer: { kind: 'order', order: idx },
      steps: [t('The first digits match, so compare the next place: hundreds, then tens, then ones.', 'Les premiers chiffres sont pareils, alors compare la position suivante : centaines, puis dizaines, puis unités.'), bi((f) => f.t('In order: ', 'En ordre : ') + idx.map((i) => f.N(list[i]!)).join(f.t(', ', ' ; ')))],
      nudge: t('Compare from the left. When digits match, move to the next place.', 'Compare à partir de la gauche. Quand les chiffres sont pareils, passe à la position suivante.'),
      stepHint: t('Start with the greatest place where the numbers are different.', 'Commence par la plus grande position où les nombres sont différents.'),
      praise: t('Nice, you compared place by place.', 'Bravo, tu as comparé position par position.'),
    });
  }
  let a: number, b: number;
  if (tier === 1) { a = randInt(r, 1000, 9999); do { b = randInt(r, 1000, 9999); } while (Math.floor(a / 1000) === Math.floor(b / 1000)); }
  else { a = randInt(r, 10, 99) * 1000 + randInt(r, 0, 999); b = a + pick(r, [-1, 1]) * randInt(r, 1, 90); if (r() < 0.15) b = a; }
  const idx = symIdx(a, b);
  return build({
    skill: 'MS.G5.B1.2.a', tier, seed, category: 'KU', format: 'choice',
    prompt: bi((f) => `${f.t('Which symbol makes this true?', 'Quel symbole rend l\'énoncé vrai ?')} ${f.m(`${f.n(a)} \\ ? \\ ${f.n(b)}`)}`),
    options: symOptions,
    answer: { kind: 'choice', index: idx },
    steps: [
      t('Line up the digits by place and start at the greatest place.', 'Aligne les chiffres par position et commence par la plus grande.'),
      t('The first place where the digits differ decides which number is greater.', 'La première position où les chiffres diffèrent indique quel nombre est le plus grand.'),
    ],
    nudge: t('Compare the digits from the left. Where do they first differ?', 'Compare les chiffres à partir de la gauche. Où diffèrent-ils d\'abord ?'),
    stepHint: t('Start with the greatest place.', 'Commence par la plus grande position.'),
    wrong: idx === 2 ? [] : [{ answer: { kind: 'choice', index: idx === 0 ? 1 : 0 }, stepIndex: 1, why: t('It looks like the symbol points the other way. The greater number is at the open side of the symbol.', 'Il semble que le symbole est tourné dans l\'autre sens. Le plus grand nombre est du côté ouvert du symbole.') }],
    praise: t('Nice, you found the first place that differs.', 'Bravo, tu as trouvé la première position qui diffère.'),
  });
};

/** MS.G5.B1.6.a: round decimals to the nearest tenth */
export const roundTenth = numGen('MS.G5.B1.6.a', (tier, r) => {
  const w = randInt(r, 1, 49);
  const h = tier === 1 ? randInt(r, 1, 4) : randInt(r, 5, 9);
  const te = tier === 3 ? 9 : randInt(r, 0, 8);
  const x = r6(w + te / 10 + h / 100);
  const up = h >= 5;
  const ans = r6(up ? w + (te + 1) / 10 : w + te / 10);
  return {
    prompt: bi((f) => `${f.t('Round', 'Arrondis')} ${f.N(x)} ${f.t('to the nearest tenth.', 'au dixième près.')}`),
    answer: ans,
    wrong: [
      up ? [r6(w + te / 10), t('It looks like the hundredths were just dropped. A 5 or more in the hundredths place means round the tenths up.', 'Il semble que les centièmes ont simplement été enlevés. Un 5 ou plus aux centièmes veut dire qu\'on arrondit les dixièmes vers le haut.'), 1] : [r6(w + (te + 1) / 10), t('It looks like the tenths were rounded up. Under 5 in the hundredths place means the tenths stay the same.', 'Il semble que les dixièmes ont été arrondis vers le haut. Moins de 5 aux centièmes veut dire que les dixièmes restent pareils.'), 1],
      ...(tier === 3 ? ([[r6(w + 0.1), t('It looks like the tenths were written as 10. 9 tenths and 1 more tenth make 1 whole, so carry 1 to the ones place.', 'Il semble que les dixièmes ont été écrits « 10 ». 9 dixièmes et 1 dixième de plus font 1 entier : reporte 1 aux unités.'), 1]] as [number, Text, number][]) : []),
    ],
    steps: [
      bi((f) => f.t(`Look at the hundredths digit, ${h}.`, `Regarde le chiffre des centièmes, ${h}.`)),
      up ? t('5 or more: round the tenths up.', '5 ou plus : arrondis les dixièmes vers le haut.') : t('Less than 5: keep the tenths the same.', 'Moins de 5 : garde les dixièmes pareils.'),
      bi((f) => f.t(`${f.N(x)} rounds to ${f.N(ans)}.`, `${f.N(x)} s'arrondit à ${f.N(ans)}.`)),
    ],
    nudge: t('Which digit decides? Look one place to the right of the tenths.', 'Quel chiffre décide ? Regarde une position à droite des dixièmes.'),
    praise: t('Nice, you checked the hundredths digit.', 'Bravo, tu as vérifié le chiffre des centièmes.'),
  };
});

/** MS.G5.B2.1.a: multi-step problems with whole numbers and decimals */
export const multiStep5 = numGen('MS.G5.B2.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 3, 9), b = randInt(r, 4, 12), c = randInt(r, 3, a * b - 5);
    return {
      prompt: t(`A box holds ${b} pencils. Mia buys ${a} boxes and gives away ${c} pencils. How many pencils does she have left?`, `Une boîte contient ${b} crayons. Mia achète ${a} boîtes et donne ${c} crayons. Combien de crayons lui reste-t-il ?`),
      answer: a * b - c, category: 'AP',
      wrong: [[a * b, t('It looks like the pencils given away were not subtracted. That is the second step.', 'Il semble que les crayons donnés n\'ont pas été soustraits. C\'est la deuxième étape.'), 1], [a * b + c, t('It looks like the pencils were added. She gives them away, so subtract.', 'Il semble que les crayons ont été additionnés. Elle les donne, donc il faut soustraire.'), 1]],
      steps: [t(`Find the total pencils: ${a} × ${b} = ${a * b}.`, `Trouve le total de crayons : ${a} × ${b} = ${a * b}.`), t(`Subtract the ones given away: ${a * b} − ${c} = ${a * b - c}.`, `Soustrais ceux qui sont donnés : ${a * b} − ${c} = ${a * b - c}.`)],
      nudge: t('There are two steps. What do you find first?', 'Il y a deux étapes. Que trouves-tu d\'abord ?'),
      praise: t('Nice, you did the steps in order.', 'Bravo, tu as fait les étapes dans l\'ordre.'),
    };
  }
  if (tier === 2) {
    const g = randInt(r, 4, 9), q = randInt(r, 6, 25), e = randInt(r, 3, 15);
    const total = g * q;
    return {
      prompt: bi((f) => f.t(`Sam has ${f.N(total)} stickers. He shares them equally among ${g} friends, then gives each friend ${e} more. How many stickers does each friend get?`, `Sam a ${f.N(total)} autocollants. Il les partage également entre ${g} amis, puis donne ${e} de plus à chacun. Combien d'autocollants chaque ami reçoit-il ?`)),
      answer: q + e, category: 'AP',
      wrong: [[q, t('It looks like the extra stickers were left out. Each friend also gets the extra ones.', 'Il semble que les autocollants de plus ont été oubliés. Chaque ami reçoit aussi les autocollants de plus.'), 1], [total + e, t('It looks like the extra stickers were added to the whole pile before sharing. Share first, then add.', 'Il semble que les autocollants de plus ont été ajoutés à toute la pile avant le partage. Partage d\'abord, puis ajoute.'), 0]],
      steps: [bi((f) => f.t(`Share equally: ${f.N(total)} ÷ ${g} = ${q}.`, `Partage également : ${f.N(total)} ÷ ${g} = ${q}.`)), t(`Add the extra: ${q} + ${e} = ${q + e}.`, `Ajoute les autocollants de plus : ${q} + ${e} = ${q + e}.`)],
      nudge: t('What happens first: sharing or giving more?', 'Qu\'arrive-t-il d\'abord : le partage ou le don de plus ?'),
      praise: t('Nice, you shared first and then added.', 'Bravo, tu as partagé d\'abord, puis ajouté.'),
    };
  }
  const n = randInt(r, 2, 6), price = randInt(r, 120, 480) / 100, pen = randInt(r, 80, 250) / 100;
  const total = r6(n * price + pen);
  return {
    prompt: bi((f) => f.t(`${n} notebooks cost ${f.D(price)} each and a pen costs ${f.D(pen)}. How many dollars is that in all?`, `${n} cahiers coûtent ${f.D(price)} chacun et un stylo coûte ${f.D(pen)}. Combien de dollars cela fait-il en tout ?`)),
    answer: total, category: 'AP',
    wrong: [[r6(price + pen), t('It looks like only one notebook was counted. Multiply the price by the number of notebooks first.', 'Il semble qu\'un seul cahier a été compté. Multiplie d\'abord le prix par le nombre de cahiers.'), 0], [r6(n * (price + pen)), t('It looks like the pen was multiplied too. There is only one pen.', 'Il semble que le stylo a aussi été multiplié. Il n\'y a qu\'un seul stylo.'), 1]],
    steps: [bi((f) => f.t(`Notebooks: ${n} × ${f.N(price)} = ${f.N(r6(n * price))}.`, `Cahiers : ${n} × ${f.N(price)} = ${f.N(r6(n * price))}.`)), bi((f) => f.t(`Add the pen: ${f.N(r6(n * price))} + ${f.N(pen)} = ${f.N(total)}.`, `Ajoute le stylo : ${f.N(r6(n * price))} + ${f.N(pen)} = ${f.N(total)}.`))],
    nudge: t('Find the cost of all the notebooks first, then add the pen.', 'Trouve d\'abord le coût de tous les cahiers, puis ajoute le stylo.'),
    praise: t('Nice, you found each cost before adding.', 'Bravo, tu as trouvé chaque coût avant d\'additionner.'),
  };
});

/** MS.G5.B2.1.b: properties of operations */
export const properties5: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const a = randInt(r, 3, 9), b = randInt(r, 2, 9), c = randInt(r, 2, 9);
  const sets: { prompt: Text; right: string; wrongs: string[]; why: Text; steps: Text[] }[] = [
    { prompt: t(`Which equation shows the commutative property of multiplication?`, `Quelle équation montre la commutativité de la multiplication ?`), right: `${a} \\times ${b} = ${b} \\times ${a}`, wrongs: [`${a} \\times ${b} = ${a} + ${b}`, `${a} \\times (${b} \\times ${c}) = (${a} \\times ${b}) + ${c}`, `${a} \\times 1 = ${a} + 1`], why: t('Order does not change a product: swap the numbers and the answer stays the same.', 'L\'ordre ne change pas un produit : inverse les nombres et la réponse reste la même.'), steps: [t('Commutative means you can swap the order.', 'Commutative veut dire qu\'on peut changer l\'ordre.'), t('Look for the equation with the same numbers swapped.', 'Cherche l\'équation où les mêmes nombres sont inversés.')] },
    { prompt: t(`Which expression is equal to ${tex(`${a} \\times (${b} + ${c})`)}?`, `Quelle expression est égale à ${tex(`${a} \\times (${b} + ${c})`)} ?`), right: `(${a} \\times ${b}) + (${a} \\times ${c})`, wrongs: [`(${a} \\times ${b}) + ${c}`, `${a} \\times ${b} \\times ${c}`, `${a} + ${b} + ${c}`], why: t('Multiply the number outside by each number inside the brackets, then add.', 'Multiplie le nombre à l\'extérieur par chaque nombre dans les parenthèses, puis additionne.'), steps: [t('The distributive property splits the multiplication across the addition.', 'La distributivité sépare la multiplication sur l\'addition.'), t('Multiply the outside number by each number inside.', 'Multiplie le nombre extérieur par chaque nombre à l\'intérieur.')] },
    { prompt: t(`Which equation shows the associative property of addition?`, `Quelle équation montre l'associativité de l'addition ?`), right: `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`, wrongs: [`${a} + ${b} = ${b} + ${a} + ${c}`, `(${a} + ${b}) + ${c} = ${a} \\times (${b} + ${c})`, `${a} + 0 = ${a} + 1`], why: t('Grouping does not change a sum: move the brackets and the answer stays the same.', 'Le regroupement ne change pas une somme : déplace les parenthèses et la réponse reste la même.'), steps: [t('Associative means you can regroup the numbers.', 'Associative veut dire qu\'on peut regrouper les nombres.'), t('Look for the same numbers in the same order with the brackets moved.', 'Cherche les mêmes nombres dans le même ordre avec les parenthèses déplacées.')] },
  ];
  const s = sets[tier === 1 ? 0 : tier === 2 ? 1 : 2]!;
  const opts = shuffle(r, [s.right, ...s.wrongs]);
  const idx = opts.indexOf(s.right);
  return build({
    skill: 'MS.G5.B2.1.b', tier, seed, category: 'KU', format: 'choice',
    prompt: s.prompt, options: opts.map((o) => t(tex(o), tex(o))), answer: { kind: 'choice', index: idx },
    steps: s.steps, nudge: s.steps[0]!, stepHint: s.steps[1]!,
    wrong: opts.map((o, i) => ({ answer: { kind: 'choice' as const, index: i }, stepIndex: 1, why: s.why })).filter((w) => w.answer.index !== idx),
    praise: t('Nice, you know your properties.', 'Bravo, tu connais bien les propriétés.'),
  });
};

/** MS.G5.B2.2.a: multiplication facts and related division facts */
export const facts5 = numGen('MS.G5.B2.2.a', (tier, r) => {
  const max = tier === 1 ? 5 : tier === 2 ? 9 : 12;
  const a = randInt(r, tier === 3 ? 3 : 0, max), b = randInt(r, tier === 3 ? 3 : 1, max);
  const kind = tier === 3 ? pick(r, ['divide', 'missing', 'times'] as const) : 'times';
  const near = t('It looks like a neighbouring fact was used. Check by counting up in equal groups.', 'Il semble qu\'un fait voisin a été utilisé. Vérifie en comptant par groupes égaux.');
  if (kind === 'divide') {
    return {
      prompt: bi((f) => `${f.t('What is', 'Combien font')} ${f.m(`${f.n(a * b)} \\div ${b}`)} ?`), answer: a,
      wrong: [[a + 1, near], [a * b - b, t('It looks like the numbers were subtracted. Division asks how many groups of the divisor fit.', 'Il semble que les nombres ont été soustraits. La division demande combien de groupes du diviseur tiennent.')]],
      steps: [t(`Think: what times ${b} makes ${a * b}?`, `Pense : quel nombre fois ${b} donne ${a * b} ?`), t(`${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ${a}.`, `${a} × ${b} = ${a * b}, donc ${a * b} ÷ ${b} = ${a}.`)],
      nudge: t('Use a multiplication fact you know to help with division.', 'Utilise un fait de multiplication que tu connais pour t\'aider à diviser.'),
    };
  }
  if (kind === 'missing') {
    return {
      prompt: bi((f) => `${f.t('Find the missing number:', 'Trouve le nombre manquant :')} ${f.m(`? \\times ${b} = ${f.n(a * b)}`)}`), answer: a,
      wrong: [[a * b + b, t('It looks like the numbers were added. Think of the multiplication fact instead.', 'Il semble que les nombres ont été additionnés. Pense plutôt au fait de multiplication.')], [a + 1, near]],
      steps: [t(`What number multiplied by ${b} gives ${a * b}?`, `Quel nombre multiplié par ${b} donne ${a * b} ?`), t(`${a * b} ÷ ${b} = ${a}.`, `${a * b} ÷ ${b} = ${a}.`)],
      nudge: t('A missing factor can be found by dividing the product by the other factor.', 'On trouve un facteur manquant en divisant le produit par l\'autre facteur.'),
    };
  }
  return {
    prompt: bi((f) => `${f.t('What is', 'Combien font')} ${f.m(`${a} \\times ${b}`)} ?`), answer: a * b,
    wrong: [[a * (b + 1), near], [a * (b > 1 ? b - 1 : b + 2), near], [a + b, t('It looks like the numbers were added. Multiplying means equal groups.', 'Il semble que les nombres ont été additionnés. Multiplier veut dire des groupes égaux.')]],
    steps: [t(`${a} groups of ${b} is ${a} × ${b}.`, `${a} groupes de ${b}, c'est ${a} × ${b}.`), t(`${a} × ${b} = ${a * b}.`, `${a} × ${b} = ${a * b}.`)],
    nudge: t('Picture equal groups, or use a fact you know that is close.', 'Imagine des groupes égaux, ou utilise un fait que tu connais et qui est proche.'),
    praise: t('Nice, you know that fact.', 'Bravo, tu connais ce fait.'),
  };
});

/** MS.G5.B2.3.a: mental math with 0.1 and 0.01, and estimating decimal sums */
export const mentalMath5: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    const x = r6(randInt(r, 21, 89) / 10 + randInt(r, 1, 9) / 100), y = r6(randInt(r, 11, 79) / 10 + randInt(r, 1, 9) / 100);
    const best = Math.round(x) + Math.round(y);
    const opts = [...new Set([best, best - 1, best + 1, best + 3])].sort((p, q) => p - q);
    return build({
      skill: 'MS.G5.B2.3.a', tier, seed, category: 'AP', format: 'choice',
      prompt: bi((f) => f.t(`Which is the best estimate of ${f.m(`${f.n(x)} + ${f.n(y)}`)}?`, `Quelle est la meilleure estimation de ${f.m(`${f.n(x)} + ${f.n(y)}`)} ?`)),
      options: opts.map((o) => bi((f) => f.N(o))), answer: { kind: 'choice', index: opts.indexOf(best) },
      steps: [bi((f) => f.t(`Round each number to the nearest whole: ${f.N(Math.round(x))} and ${f.N(Math.round(y))}.`, `Arrondis chaque nombre à l'unité près : ${f.N(Math.round(x))} et ${f.N(Math.round(y))}.`)), bi((f) => f.t(`Add: ${f.N(Math.round(x))} + ${f.N(Math.round(y))} = ${f.N(best)}.`, `Additionne : ${f.N(Math.round(x))} + ${f.N(Math.round(y))} = ${f.N(best)}.`))],
      nudge: t('To estimate, round each number first, then add.', 'Pour estimer, arrondis d\'abord chaque nombre, puis additionne.'),
      stepHint: t('Round each number to the nearest whole number.', 'Arrondis chaque nombre à l\'unité près.'),
      wrong: opts.map((_, i) => i).filter((i) => opts[i] !== best).map((i) => ({ answer: { kind: 'choice' as const, index: i }, stepIndex: 0, why: t('That is not close enough. Round each number to a whole number and add those.', 'Ce n\'est pas assez proche. Arrondis chaque nombre à l\'unité près et additionne.') })),
      praise: t('Nice, you rounded before adding.', 'Bravo, tu as arrondi avant d\'additionner.'),
    });
  }
  return numGen('MS.G5.B2.3.a', (tr, rr) => {
    if (tr === 1) {
      const n = randInt(rr, 2, 99) * 10;
      return {
        prompt: bi((f) => `${f.t('What is', 'Combien font')} ${f.m(`${f.n(n)} \\times ${f.lang === 'fr' ? '0{,}1' : '0.1'}`)} ?`), answer: n / 10,
        wrong: [[n * 10, t('It looks like the decimal point moved the wrong way. Multiplying by 0.1 makes the number smaller.', 'Il semble que la virgule a bougé dans le mauvais sens. Multiplier par 0,1 rend le nombre plus petit.')]],
        steps: [t('0.1 is one tenth, so the number becomes 10 times smaller.', '0,1 est un dixième, donc le nombre devient 10 fois plus petit.'), t(`Move the decimal point one place left: ${n / 10}.`, `Déplace la virgule d'une position vers la gauche : ${n / 10}.`)],
        nudge: t('Multiplying by 0.1 is the same as dividing by 10.', 'Multiplier par 0,1 revient à diviser par 10.'),
      };
    }
    const n = randInt(rr, 12, 990) * 10;
    return {
      prompt: bi((f) => `${f.t('What is', 'Combien font')} ${f.m(`${f.n(n)} \\times ${f.lang === 'fr' ? '0{,}01' : '0.01'}`)} ?`), answer: r6(n / 100),
      wrong: [[r6(n / 10), t('It looks like the decimal point moved one place. Multiplying by 0.01 moves it two places left.', 'Il semble que la virgule a bougé d\'une position. Multiplier par 0,01 la déplace de deux positions vers la gauche.')], [n * 100, t('It looks like the decimal point moved the wrong way. The answer is smaller than the number you started with.', 'Il semble que la virgule a bougé dans le mauvais sens. La réponse est plus petite que le nombre de départ.')]],
      steps: [t('0.01 is one hundredth, so the number becomes 100 times smaller.', '0,01 est un centième, donc le nombre devient 100 fois plus petit.'), t(`Move the decimal point two places left: ${r6(n / 100)}.`, `Déplace la virgule de deux positions vers la gauche : ${String(r6(n / 100)).replace('.', ',')}.`)],
      nudge: t('Multiplying by 0.01 is the same as dividing by 100.', 'Multiplier par 0,01 revient à diviser par 100.'),
    };
  })(tier, seed);
};

/** MS.G5.B2.4.a: add and subtract whole numbers and decimals */
export const addSub5 = numGen('MS.G5.B2.4.a', (tier, r) => {
  const sub = r() < 0.5;
  const word = (f: import('./dsl.js').F) => f.t(sub ? 'Subtract' : 'Add', sub ? 'Soustrais' : 'Additionne');
  if (tier === 3) {
    const L = randInt(r, 25, 990), Y = randInt(r, 101, 999); // left = L tenths, right = Y hundredths
    const left = L / 10, b = Y / 100;
    const isSub = sub && left > b;
    const ans = r6(isSub ? left - b : left + b);
    const misaligned = isSub ? (L > Y ? r6((L - Y) / 100) : null) : r6((L + Y) / 100);
    return {
      prompt: bi((f) => `${f.t(isSub ? 'Subtract' : 'Add', isSub ? 'Soustrais' : 'Additionne')} ${f.m(`${f.n(left)} ${isSub ? '-' : '+'} ${f.n(b)}`)}`),
      answer: ans,
      wrong: misaligned === null ? [] : [[misaligned, t('It looks like the digits were lined up on the right instead of by the decimal point. Line up the decimal points first.', 'Il semble que les chiffres ont été alignés à droite plutôt que sur la virgule. Aligne d\'abord les virgules.'), 0]],
      steps: [t('Line up the decimal points and add zeros so both numbers have hundredths.', 'Aligne les virgules et ajoute des zéros pour que les deux nombres aient des centièmes.'), bi((f) => f.t(`${isSub ? 'Subtract' : 'Add'}: ${f.N(ans)}.`, `${isSub ? 'Soustrais' : 'Additionne'} : ${f.N(ans)}.`))],
      nudge: t('Line up the decimal points before you add or subtract.', 'Aligne les virgules avant d\'additionner ou de soustraire.'),
      praise: t('Nice, you lined up the decimal points.', 'Bravo, tu as aligné les virgules.'),
    };
  }
  const hi = tier === 1 ? 9999 : 99999;
  let a: number, b: number;
  if (sub) { b = randInt(r, 1100, hi - 1100); a = randInt(r, b + 100, hi); } else { b = randInt(r, 1100, Math.floor(hi / 2)); a = randInt(r, 1100, hi - b); }
  const ans = sub ? a - b : a + b;
  const digitsOf = (n: number) => String(n).padStart(6, '0').split('').map(Number);
  const noCarry = (x: number, y: number) => Number(digitsOf(x).map((d, i) => (sub ? Math.abs(d - digitsOf(y)[i]!) : (d + digitsOf(y)[i]!) % 10)).join(''));
  return {
    prompt: bi((f) => `${word(f)} ${f.m(`${f.n(a)} ${sub ? '-' : '+'} ${f.n(b)}`)}`),
    answer: ans,
    wrong: [[noCarry(a, b), sub ? t('It looks like the smaller digit was always taken from the larger one. When the top digit is smaller, regroup from the next place.', 'Il semble que le plus petit chiffre a toujours été soustrait du plus grand. Quand le chiffre du haut est plus petit, regroupe à partir de la position suivante.') : t('It looks like a regrouping was missed. When a column adds to 10 or more, carry to the next place.', 'Il semble qu\'une retenue a été oubliée. Quand une colonne fait 10 ou plus, reporte à la position suivante.'), 0]],
    steps: [t('Line up the digits by place value.', 'Aligne les chiffres selon la valeur de position.'), bi((f) => f.t(`${sub ? 'Subtract' : 'Add'} column by column, regrouping when needed: ${f.N(ans)}.`, `${sub ? 'Soustrais' : 'Additionne'} colonne par colonne en regroupant au besoin : ${f.N(ans)}.`))],
    nudge: t('Start with the ones column and work left, regrouping when you need to.', 'Commence par les unités et va vers la gauche en regroupant au besoin.'),
    praise: t('Nice, you regrouped carefully.', 'Bravo, tu as regroupé avec soin.'),
  };
});

/** MS.G5.B2.6.a: two-digit by two-digit multiplication */
export const multiply2x2 = numGen('MS.G5.B2.6.a', (tier, r) => {
  const a = tier === 1 ? randInt(r, 2, 9) * 10 : randInt(r, 12, tier === 2 ? 49 : 99);
  const b = tier === 1 ? randInt(r, 2, 9) * 10 : randInt(r, 12, tier === 2 ? 49 : 99);
  const [a1, a0, b1, b0] = [Math.floor(a / 10) * 10, a % 10, Math.floor(b / 10) * 10, b % 10];
  const ans = a * b;
  const story = tier === 3 && r() < 0.5;
  return {
    prompt: story ? bi((f) => f.t(`A theatre has ${a} rows with ${b} seats in each row. How many seats are there?`, `Un théâtre a ${a} rangées de ${b} sièges chacune. Combien de sièges y a-t-il ?`)) : bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${a} \\times ${b}`)}`),
    answer: ans, category: story ? 'AP' : 'KU',
    wrong: [
      [a1 * b1 + a0 * b0, t('It looks like only the tens were multiplied by tens and the ones by ones. Every part of one number must multiply every part of the other.', 'Il semble que seules les dizaines ont été multipliées par les dizaines et les unités par les unités. Chaque partie d\'un nombre doit multiplier chaque partie de l\'autre.'), 1],
      ...(a0 && b0 ? [[a * b1 + a0 * b0, t('It looks like one partial product was missed. There are four parts in the area model.', 'Il semble qu\'un produit partiel a été oublié. Il y a quatre parties dans le modèle d\'aire.'), 1] as [number, Text, number]] : []),
    ],
    steps: [
      t(`Break into tens and ones: ${a1} + ${a0} and ${b1} + ${b0}.`, `Décompose en dizaines et unités : ${a1} + ${a0} et ${b1} + ${b0}.`),
      t(`Multiply each part: ${a1}×${b1} = ${a1 * b1}, ${a1}×${b0} = ${a1 * b0}, ${a0}×${b1} = ${a0 * b1}, ${a0}×${b0} = ${a0 * b0}.`, `Multiplie chaque partie : ${a1}×${b1} = ${a1 * b1}, ${a1}×${b0} = ${a1 * b0}, ${a0}×${b1} = ${a0 * b1}, ${a0}×${b0} = ${a0 * b0}.`),
      bi((f) => f.t(`Add the parts: ${f.N(ans)}.`, `Additionne les parties : ${f.N(ans)}.`)),
    ],
    nudge: t('Draw an area model: split each number into tens and ones and multiply each part.', 'Dessine un modèle d\'aire : sépare chaque nombre en dizaines et unités et multiplie chaque partie.'),
    praise: t('Nice, you multiplied every part.', 'Bravo, tu as multiplié chaque partie.'),
  };
});

/** MS.G5.B2.7.a: three-digit by two-digit division, and what to do with remainders */
export const divide3by2 = numGen('MS.G5.B2.7.a', (tier, r) => {
  const d = randInt(r, 11, 30);
  if (tier === 1) {
    const q = randInt(r, Math.ceil(100 / d), Math.floor(999 / d));
    return {
      prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${d * q} \\div ${d}`)}`), answer: q,
      wrong: [[q + 1, t('It looks like one too many groups. Multiply your answer by the divisor to check.', 'Il semble qu\'il y a un groupe de trop. Multiplie ta réponse par le diviseur pour vérifier.'), 1]],
      steps: [t(`Estimate: how many times does ${d} go into ${d * q}?`, `Estime : combien de fois ${d} entre-t-il dans ${d * q} ?`), t(`${q} × ${d} = ${d * q}, so the quotient is ${q}.`, `${q} × ${d} = ${d * q}, donc le quotient est ${q}.`)],
      nudge: t('Check by multiplying: quotient × divisor should equal the dividend.', 'Vérifie en multipliant : quotient × diviseur doit donner le dividende.'),
    };
  }
  const q = randInt(r, Math.ceil(100 / d), Math.floor(900 / d)), rem = randInt(r, 1, d - 1), n = d * q + rem;
  if (tier === 2) {
    const askRem = r() < 0.5;
    return {
      prompt: bi((f) => f.t(`${f.m(`${n} \\div ${d}`)}: what is the ${askRem ? 'remainder' : 'quotient (the whole-number part)'}?`, `${f.m(`${n} \\div ${d}`)} : quel est ${askRem ? 'le reste' : 'le quotient (la partie entière)'} ?`)),
      answer: askRem ? rem : q,
      wrong: [[askRem ? q : rem, t('It looks like the quotient and the remainder were switched. The quotient is how many full groups; the remainder is what is left.', 'Il semble que le quotient et le reste ont été inversés. Le quotient est le nombre de groupes complets ; le reste est ce qui reste.'), 1]],
      steps: [t(`${q} × ${d} = ${q * d}, which is the closest you can get without going over ${n}.`, `${q} × ${d} = ${q * d}, ce qui est le plus proche sans dépasser ${n}.`), t(`${n} − ${q * d} = ${rem} is left over.`, `${n} − ${q * d} = ${rem} reste.`)],
      nudge: t('Find the biggest multiple of the divisor that does not go over the dividend.', 'Trouve le plus grand multiple du diviseur qui ne dépasse pas le dividende.'),
    };
  }
  const ctx = pick(r, ['boxes', 'buses', 'left'] as const);
  const people = n;
  if (ctx === 'buses') {
    return {
      prompt: bi((f) => f.t(`${f.N(people)} students go on a trip. Each bus holds ${d} students. How many buses are needed?`, `${f.N(people)} élèves partent en excursion. Chaque autobus transporte ${d} élèves. Combien d'autobus faut-il ?`)),
      answer: q + 1, category: 'AP',
      wrong: [[q, t('It looks like the remainder was ignored. The students left over still need a bus, so round up.', 'Il semble que le reste a été ignoré. Les élèves qui restent ont quand même besoin d\'un autobus : arrondis vers le haut.'), 1]],
      steps: [t(`${n} ÷ ${d} = ${q} remainder ${rem}.`, `${n} ÷ ${d} = ${q}, reste ${rem}.`), t(`The ${rem} left over need one more bus: ${q + 1} buses.`, `Les ${rem} élèves qui restent ont besoin d'un autobus de plus : ${q + 1} autobus.`)],
      nudge: t('What happens to the students who are left over? Do they need a bus?', 'Que se passe-t-il pour les élèves qui restent ? Ont-ils besoin d\'un autobus ?'),
    };
  }
  if (ctx === 'boxes') {
    return {
      prompt: bi((f) => f.t(`A shop packs ${f.N(people)} apples into boxes of ${d}. How many full boxes can it make?`, `Un magasin emballe ${f.N(people)} pommes dans des boîtes de ${d}. Combien de boîtes pleines peut-il faire ?`)),
      answer: q, category: 'AP',
      wrong: [[q + 1, t('It looks like the leftover apples were counted as a full box. Only full boxes count here, so the remainder is not rounded up.', 'Il semble que les pommes qui restent ont été comptées comme une boîte pleine. Seules les boîtes pleines comptent ici : le reste n\'est pas arrondi vers le haut.'), 1]],
      steps: [t(`${n} ÷ ${d} = ${q} remainder ${rem}.`, `${n} ÷ ${d} = ${q}, reste ${rem}.`), t(`Only full boxes count, so ${q}.`, `Seules les boîtes pleines comptent, donc ${q}.`)],
      nudge: t('Does the question want full boxes only?', 'La question demande-t-elle seulement des boîtes pleines ?'),
    };
  }
  return {
    prompt: bi((f) => f.t(`${f.N(people)} cards are dealt equally into ${d} piles. How many cards are left over?`, `${f.N(people)} cartes sont distribuées également en ${d} piles. Combien de cartes restent ?`)),
    answer: rem, category: 'AP',
    wrong: [[q, t('It looks like the number in each pile was given. The question asks how many are left over.', 'Il semble que le nombre dans chaque pile a été donné. La question demande combien de cartes restent.'), 1]],
    steps: [t(`${n} ÷ ${d} = ${q} remainder ${rem}.`, `${n} ÷ ${d} = ${q}, reste ${rem}.`), t(`The remainder, ${rem}, is how many are left over.`, `Le reste, ${rem}, est le nombre de cartes qui restent.`)],
    nudge: t('Left over means the remainder.', 'Ce qui reste, c\'est le reste de la division.'),
  };
});

/** MS.G5.B2.8.a: multiply and divide whole numbers by unit fractions */
export const unitFractions5 = numGen('MS.G5.B2.8.a', (tier, r) => {
  const d = tier === 1 ? randInt(r, 2, 5) : randInt(r, 2, 8);
  const k = randInt(r, 2, tier === 1 ? 8 : 9);
  if (tier === 1) {
    const n = d * k;
    return {
      prompt: bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${n} \\times \\frac{1}{${d}}`)}`), answer: k,
      wrong: [[n * d, t('It looks like the whole number was multiplied by the denominator. One part out of equal parts is a share, so divide instead.', 'Il semble que le nombre entier a été multiplié par le dénominateur. Une partie parmi des parties égales est un partage : divise plutôt.'), 0]],
      steps: [t(`${n} × 1/${d} means one share when ${n} is split into ${d} equal parts.`, `${n} × 1/${d} signifie une part quand ${n} est séparé en ${d} parties égales.`), t(`${n} ÷ ${d} = ${k}.`, `${n} ÷ ${d} = ${k}.`)],
      nudge: t('Finding one part out of equal parts is the same as dividing.', 'Trouver une partie parmi des parties égales revient à diviser.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${k} \\div \\frac{1}{${d}}`)}`), answer: k * d,
      wrong: [[r6(k / d), t('It looks like the whole number was divided by the denominator. Dividing by a unit fraction asks how many of those parts fit, and that is more than the whole number.', 'Il semble que le nombre entier a été divisé par le dénominateur. Diviser par une fraction unitaire demande combien de ces parties tiennent, et c\'est plus que le nombre entier.'), 0]],
      steps: [t(`How many ${d}ths fit in 1 whole? ${d}.`, `Combien de 1/${d} tiennent dans 1 entier ? ${d}.`), t(`So ${k} wholes hold ${k} × ${d} = ${k * d}.`, `Donc ${k} entiers contiennent ${k} × ${d} = ${k * d}.`)],
      nudge: t('How many pieces of that size fit into one whole?', 'Combien de morceaux de cette taille tiennent dans un entier ?'),
    };
  }
  const kind = pick(r, ['pieces', 'of'] as const);
  if (kind === 'pieces') {
    return {
      prompt: bi((f) => f.t(`A ribbon is ${k} metres long. It is cut into pieces that are ${f.m(`\\frac{1}{${d}}`)} of a metre long. How many pieces are there?`, `Un ruban mesure ${k} mètres. Il est coupé en morceaux de ${f.m(`\\frac{1}{${d}}`)} de mètre. Combien y a-t-il de morceaux ?`)),
      answer: k * d, category: 'AP',
      wrong: [[r6(k / d), t('It looks like the length was divided by the denominator. Each metre gives several pieces, so multiply.', 'Il semble que la longueur a été divisée par le dénominateur. Chaque mètre donne plusieurs morceaux : multiplie.'), 0]],
      steps: [t(`Each metre makes ${d} pieces.`, `Chaque mètre donne ${d} morceaux.`), t(`${k} × ${d} = ${k * d} pieces.`, `${k} × ${d} = ${k * d} morceaux.`)],
      nudge: t('How many pieces come from one metre?', 'Combien de morceaux vient d\'un mètre ?'),
    };
  }
  const n = d * k;
  return {
    prompt: bi((f) => f.t(`A class has ${n} students. ${f.m(`\\frac{1}{${d}}`)} of them walk to school. How many students walk?`, `Une classe a ${n} élèves. ${f.m(`\\frac{1}{${d}}`)} d'entre eux marchent pour aller à l'école. Combien d'élèves marchent ?`)),
    answer: k, category: 'AP',
    wrong: [[n * d, t(`It looks like the number of students was multiplied. One out of ${d} equal groups is a share, so divide.`, `Il semble que le nombre d'élèves a été multiplié. Une part sur ${d} groupes égaux est un partage : divise.`), 0]],
    steps: [t(`One ${d}th of ${n} means ${n} ÷ ${d}.`, `1/${d} de ${n} signifie ${n} ÷ ${d}.`), t(`${n} ÷ ${d} = ${k}.`, `${n} ÷ ${d} = ${k}.`)],
    nudge: t('Finding a unit fraction of a number is the same as dividing by the denominator.', 'Trouver une fraction unitaire d\'un nombre revient à diviser par le dénominateur.'),
  };
});

/** MS.G5.B2.9.a: equivalent ratios and rates */
export const ratios5 = numGen('MS.G5.B2.9.a', (tier, r) => {
  const k = randInt(r, 2, 6);
  if (tier === 1) {
    const a = randInt(r, 1, 5), b = randInt(r, a + 1, 8);
    return {
      prompt: bi((f) => `${f.t('Find the missing number:', 'Trouve le nombre manquant :')} ${f.m(`${a}:${b} = ?:${b * k}`)}`), answer: a * k,
      wrong: [[a + (b * k - b), t('It looks like the same number was added to both terms. Equal ratios come from multiplying both terms by the same number.', 'Il semble que le même nombre a été ajouté aux deux termes. Les rapports égaux viennent de la multiplication des deux termes par le même nombre.'), 1]],
      steps: [t(`The second term went from ${b} to ${b * k}: it was multiplied by ${k}.`, `Le deuxième terme est passé de ${b} à ${b * k} : il a été multiplié par ${k}.`), t(`Multiply the first term by ${k}: ${a} × ${k} = ${a * k}.`, `Multiplie le premier terme par ${k} : ${a} × ${k} = ${a * k}.`)],
      nudge: t('What was the second term multiplied by? Do the same to the first.', 'Par quoi le deuxième terme a-t-il été multiplié ? Fais pareil au premier.'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 2, 6);
    const total = randInt(r, 2, 9);
    return {
      prompt: t(`${n} pens cost $\\dollar ${total}$. How many dollars do ${n * k} pens cost at the same rate?`, `${n} stylos coûtent $${total}\\ \\dollar$. Combien de dollars coûtent ${n * k} stylos au même taux ?`),
      answer: total * k, category: 'AP',
      wrong: [[total + (n * k - n), t('It looks like the difference in pens was added to the cost. Rates grow by multiplying, not adding.', 'Il semble que la différence de stylos a été ajoutée au coût. Les taux augmentent par multiplication, pas par addition.'), 1]],
      steps: [t(`${n * k} pens is ${k} times as many as ${n} pens.`, `${n * k} stylos, c'est ${k} fois plus que ${n} stylos.`), t(`So the cost is ${k} times as much: ${total} × ${k} = ${total * k}.`, `Donc le coût est ${k} fois plus grand : ${total} × ${k} = ${total * k}.`)],
      nudge: t('How many times as many pens is it? The cost grows the same number of times.', 'Combien de fois plus de stylos y a-t-il ? Le coût augmente du même nombre de fois.'),
      stepHint: t(`Find how many times ${n} fits into ${n * k}.`, `Trouve combien de fois ${n} entre dans ${n * k}.`),
    };
  }
  const km = randInt(r, 4, 9) * 10, h = randInt(r, 2, 5), h2 = h * k;
  return {
    prompt: t(`A cyclist rides ${km * h} km in ${h} hours. At the same rate, how far does the cyclist ride in ${h2} hours?`, `Un cycliste roule ${km * h} km en ${h} heures. Au même taux, quelle distance le cycliste parcourt-il en ${h2} heures ?`),
    answer: km * h2, category: 'AP',
    wrong: [[km * h + (h2 - h), t('It looks like the extra hours were added to the distance. Find how far in one hour, then multiply.', 'Il semble que les heures de plus ont été ajoutées à la distance. Trouve la distance en une heure, puis multiplie.'), 1]],
    steps: [t(`Unit rate: ${km * h} ÷ ${h} = ${km} km in 1 hour.`, `Taux unitaire : ${km * h} ÷ ${h} = ${km} km en 1 heure.`), t(`${h2} hours: ${km} × ${h2} = ${km * h2} km.`, `${h2} heures : ${km} × ${h2} = ${km * h2} km.`)],
    nudge: t('First find the distance for one hour (the unit rate).', 'Trouve d\'abord la distance pour une heure (le taux unitaire).'),
  };
});

