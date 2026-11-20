// Adding and subtracting fractions: like denominators (Grade 5), unlike denominators (Grade 6).
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { build, frac, gcd, lcm, mixedTex, t, tex } from './kit.js';

const STORIES: { en: (a: string, b: string) => string; fr: (a: string, b: string) => string }[] = [
  { en: (a, b) => `Maya ate ${a} of a pizza and Jon ate ${b} of the same pizza. How much pizza did they eat in all?`, fr: (a, b) => `Maya a mangé ${a} d'une pizza et Jon a mangé ${b} de la même pizza. Quelle quantité de pizza ont-ils mangée en tout ?` },
  { en: (a, b) => `A garden has ${a} of its space for tomatoes and ${b} for beans. What fraction of the garden is used for these two crops?`, fr: (a, b) => `Un jardin utilise ${a} de son espace pour les tomates et ${b} pour les haricots. Quelle fraction du jardin est utilisée pour ces deux cultures ?` },
];

const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(n, d);
  return [n / g, d / g];
};

/** MS.G5.B2.5.a: add fractions with like denominators */
export const addLike: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = tier === 1 ? randInt(r, 3, 6) : randInt(r, 4, 12);
  let a: number;
  let b: number;
  if (tier === 3) {
    a = randInt(r, Math.ceil(d / 2), d - 1);
    b = randInt(r, Math.ceil(d / 2), d - 1); // the total goes past one whole
  } else {
    a = randInt(r, 1, d - 2);
    b = randInt(r, 1, d - a - 1 || 1);
    if (a + b >= d) b = Math.max(1, d - a - 1);
  }
  const sum = a + b;
  const story = tier >= 2 && r() < 0.5 ? pick(r, STORIES) : null;
  const fa = tex(frac(a, d));
  const fb = tex(frac(b, d));
  return build({
    skill: 'MS.G5.B2.5.a', tier, seed, category: story ? 'AP' : 'KU', format: 'fraction',
    prompt: story ? t(story.en(fa, fb), story.fr(fa, fb)) : t(`Add: ${tex(`${frac(a, d)} + ${frac(b, d)}`)}`, `Additionne : ${tex(`${frac(a, d)} + ${frac(b, d)}`)}`),
    visual: tier === 1 ? { type: 'fractionBars', bars: [{ n: a, d }, { n: b, d }] } : undefined,
    answer: { kind: 'fraction', n: sum, d },
    steps: [
      t(`The denominators are the same (${d}), so the parts are the same size and the denominator stays ${d}.`, `Les dénominateurs sont pareils (${d}), donc les parties ont la même taille et le dénominateur reste ${d}.`),
      t(`Add the numerators: ${a} + ${b} = ${sum}.`, `Additionne les numérateurs : ${a} + ${b} = ${sum}.`),
      t(`The sum is ${tex(frac(sum, d))}.`, `La somme est ${tex(frac(sum, d))}.`),
    ],
    nudge: t('When the denominators are the same, what stays the same, and what do you add?', 'Quand les dénominateurs sont pareils, qu\'est-ce qui reste pareil, et qu\'est-ce qu\'on additionne ?'),
    stepHint: t(`Keep the denominator ${d} and add only the numerators ${a} and ${b}.`, `Garde le dénominateur ${d} et additionne seulement les numérateurs ${a} et ${b}.`),
    wrong: [
      { answer: { kind: 'fraction', n: sum, d: d + d }, stepIndex: 0, why: t('It looks like the denominators were added. When the denominators match, keep the denominator and add only the numerators.', 'Il semble que les dénominateurs ont été additionnés. Quand les dénominateurs sont pareils, garde le dénominateur et additionne seulement les numérateurs.') },
      { answer: { kind: 'fraction', n: a * b, d }, stepIndex: 1, why: t('It looks like the numerators were multiplied. To add, put the parts together by adding the numerators.', 'Il semble que les numérateurs ont été multipliés. Pour additionner, réunis les parties en additionnant les numérateurs.') },
    ],
    praise: t('Nice, you kept the denominator and added only the numerators.', 'Bravo, tu as gardé le dénominateur et additionné seulement les numérateurs.'),
  });
};

/** MS.G5.B2.5.b: subtract fractions with like denominators */
export const subLike: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = tier === 1 ? randInt(r, 3, 6) : randInt(r, 4, 12);
  const a = randInt(r, 2, tier === 3 ? d + Math.floor(d / 2) : d - 1);
  const b = randInt(r, 1, a - 1);
  const diff = a - b;
  const story = tier >= 2 && r() < 0.5;
  const fa = tex(frac(a, d));
  const fb = tex(frac(b, d));
  return build({
    skill: 'MS.G5.B2.5.b', tier, seed, category: story ? 'AP' : 'KU', format: 'fraction',
    prompt: story
      ? t(`A jug holds ${fa} of a litre of juice. ${fb} of a litre is poured out. How much juice is left?`, `Un pichet contient ${fa} de litre de jus. On en verse ${fb} de litre. Combien de jus reste-t-il ?`)
      : t(`Subtract: ${tex(`${frac(a, d)} - ${frac(b, d)}`)}`, `Soustrais : ${tex(`${frac(a, d)} - ${frac(b, d)}`)}`),
    visual: tier === 1 ? { type: 'fractionBars', bars: [{ n: a, d }, { n: b, d }] } : undefined,
    answer: { kind: 'fraction', n: diff, d },
    steps: [
      t(`The denominators are the same (${d}), so the denominator stays ${d}.`, `Les dénominateurs sont pareils (${d}), donc le dénominateur reste ${d}.`),
      t(`Subtract the numerators: ${a} - ${b} = ${diff}.`, `Soustrais les numérateurs : ${a} - ${b} = ${diff}.`),
      t(`The difference is ${tex(frac(diff, d))}.`, `La différence est ${tex(frac(diff, d))}.`),
    ],
    nudge: t('Keep the denominator the same and subtract only the numerators.', 'Garde le même dénominateur et soustrais seulement les numérateurs.'),
    stepHint: t(`Subtract ${b} from ${a} and keep the denominator ${d}.`, `Soustrais ${b} de ${a} et garde le dénominateur ${d}.`),
    wrong: [
      { answer: { kind: 'fraction', n: a + b, d }, stepIndex: 1, why: t('It looks like the numerators were added. This question asks you to take away, so subtract the numerators.', 'Il semble que les numérateurs ont été additionnés. Cette question demande de retirer : soustrais les numérateurs.') },
      { answer: { kind: 'fraction', n: diff, d: d + d }, stepIndex: 0, why: t('It looks like the denominator was changed. When the denominators match, the denominator stays the same.', 'Il semble que le dénominateur a changé. Quand les dénominateurs sont pareils, le dénominateur reste le même.') },
    ],
    praise: t('Nice, you subtracted only the numerators.', 'Bravo, tu as soustrait seulement les numérateurs.'),
  });
};

/** MS.G5.B2.5.c: add and subtract mixed numbers with like denominators */
export const mixedAddSub: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const d = randInt(r, 3, 8);
  const subtract = tier === 3;
  const regroup = tier >= 2;
  let w1 = randInt(r, 1, 4), w2 = randInt(r, 1, 3), n1: number, n2: number;
  if (subtract) {
    w1 = randInt(r, 3, 6); w2 = randInt(r, 1, w1 - 1);
    n2 = randInt(r, 2, d - 1); n1 = randInt(r, 1, n2 - 1); // the first fraction part is smaller, so regroup
  } else if (regroup) {
    n1 = randInt(r, 2, d - 1); n2 = randInt(r, d - n1, d - 1); // the fractions add up to a whole or more
  } else {
    n1 = randInt(r, 1, d - 2); n2 = randInt(r, 1, d - 1 - n1);
  }
  const total1 = w1 * d + n1, total2 = w2 * d + n2;
  const res = subtract ? total1 - total2 : total1 + total2;
  const whole = Math.floor(res / d), n = res % d;
  const op = subtract ? '-' : '+';
  const wrongAnswers = subtract
    ? [{ answer: { kind: 'mixed' as const, whole: w1 - w2, n: n2 - n1, d }, stepIndex: 1, why: t('It looks like the smaller numerator was taken from the larger one. When the first fraction is smaller, regroup one whole into parts first.', 'Il semble que le plus petit numérateur a été soustrait du plus grand. Quand la première fraction est plus petite, transforme d\'abord un entier en parties.') }]
    : [{ answer: { kind: 'mixed' as const, whole: w1 + w2, n: n1 + n2, d }, stepIndex: 1, why: t('It looks like the fraction part was not regrouped. When the fractions add up to a whole or more, add 1 to the whole number and keep the leftover parts.', 'Il semble que la partie fractionnaire n\'a pas été regroupée. Quand les fractions font un entier ou plus, ajoute 1 à la partie entière et garde les parties restantes.') }];
  if (n === 0) {
    // keep answers as mixed numbers with a proper, non-zero fraction part
    const again = mixedAddSub(tier, seed + 7919);
    return { ...again, id: `MS.G5.B2.5.c:${tier}:${seed}`, seed }; // same item for the same (skill, tier, seed), whichever draw produced it
  }
  return build({
    skill: 'MS.G5.B2.5.c', tier, seed, category: tier === 1 ? 'KU' : 'AP', format: 'mixed',
    prompt: t(`${subtract ? 'Subtract' : 'Add'}: ${tex(`${mixedTex(w1, n1, d)} ${op} ${mixedTex(w2, n2, d)}`)}. Write the answer as a mixed number.`, `${subtract ? 'Soustrais' : 'Additionne'} : ${tex(`${mixedTex(w1, n1, d)} ${op} ${mixedTex(w2, n2, d)}`)}. Écris la réponse sous forme de nombre fractionnaire.`),
    answer: { kind: 'mixed', whole, n, d },
    steps: subtract
      ? [
          t(`${n1} is smaller than ${n2}, so regroup: ${w1} ${tex(frac(n1, d))} becomes ${w1 - 1} ${tex(frac(n1 + d, d))}.`, `${n1} est plus petit que ${n2}, donc regroupe : ${w1} ${tex(frac(n1, d))} devient ${w1 - 1} ${tex(frac(n1 + d, d))}.`),
          t(`Subtract the fractions: ${n1 + d} - ${n2} = ${n1 + d - n2}, so ${tex(frac(n1 + d - n2, d))}.`, `Soustrais les fractions : ${n1 + d} - ${n2} = ${n1 + d - n2}, donc ${tex(frac(n1 + d - n2, d))}.`),
          t(`Subtract the wholes: ${w1 - 1} - ${w2} = ${w1 - 1 - w2}. The answer is ${tex(mixedTex(whole, n, d))}.`, `Soustrais les entiers : ${w1 - 1} - ${w2} = ${w1 - 1 - w2}. La réponse est ${tex(mixedTex(whole, n, d))}.`),
        ]
      : [
          t(`Add the whole numbers: ${w1} + ${w2} = ${w1 + w2}.`, `Additionne les nombres entiers : ${w1} + ${w2} = ${w1 + w2}.`),
          t(`Add the fractions: ${n1} + ${n2} = ${n1 + n2}, so ${tex(frac(n1 + n2, d))}.`, `Additionne les fractions : ${n1} + ${n2} = ${n1 + n2}, donc ${tex(frac(n1 + n2, d))}.`),
          t(`${n1 + n2 >= d ? `${tex(frac(n1 + n2, d))} is ${mixedTex(Math.floor((n1 + n2) / d), (n1 + n2) % d, d)}, so add 1 to the wholes. ` : ''}The answer is ${tex(mixedTex(whole, n, d))}.`, `${n1 + n2 >= d ? `${tex(frac(n1 + n2, d))} égale ${mixedTex(Math.floor((n1 + n2) / d), (n1 + n2) % d, d)}, donc ajoute 1 aux entiers. ` : ''}La réponse est ${tex(mixedTex(whole, n, d))}.`),
        ],
    nudge: subtract
      ? t('Is the first fraction part big enough to subtract from? If not, regroup one whole.', 'La première partie fractionnaire est-elle assez grande pour soustraire ? Sinon, regroupe un entier.')
      : t('Add the whole numbers and the fractions separately. Does the fraction part make another whole?', 'Additionne séparément les entiers et les fractions. La partie fractionnaire fait-elle un autre entier ?'),
    stepHint: subtract
      ? t(`Rewrite one whole as ${tex(frac(d, d))} and add it to ${tex(frac(n1, d))}.`, `Réécris un entier sous la forme ${tex(frac(d, d))} et ajoute-le à ${tex(frac(n1, d))}.`)
      : t(`Add ${w1} + ${w2} and ${n1} + ${n2} separately.`, `Additionne ${w1} + ${w2} et ${n1} + ${n2} séparément.`),
    wrong: wrongAnswers,
    praise: t('Nice, you handled the wholes and the fractions separately.', 'Bravo, tu as traité séparément les entiers et les fractions.'),
  });
};

/** MS.G6.B2.5.a: find the least common denominator */
export const commonDenominator: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const pairs: [number, number][] =
    tier === 1 ? [[2, 4], [3, 6], [2, 6], [4, 8], [5, 10], [3, 9]]
    : tier === 2 ? [[3, 4], [2, 5], [3, 5], [2, 7], [4, 5], [3, 7]]
    : [[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [6, 10], [9, 12]];
  let [d1, d2] = pick(r, pairs);
  if (r() < 0.5) [d1, d2] = [d2, d1];
  const l = lcm(d1, d2);
  const product = d1 * d2;
  const wrong = [
    { answer: { kind: 'number' as const, value: Math.max(d1, d2) }, stepIndex: 0, why: t('It looks like the larger denominator was used. Check: does the smaller denominator go into it evenly?', 'Il semble que le plus grand dénominateur a été utilisé. Vérifie : le plus petit entre-t-il dedans exactement ?') },
    { answer: { kind: 'number' as const, value: product }, stepIndex: 0, why: t('A common denominator, yes, but it is not the least one. Look for a smaller number that both denominators go into.', 'C\'est bien un dénominateur commun, mais ce n\'est pas le plus petit. Cherche un nombre plus petit dans lequel les deux dénominateurs entrent.') },
    { answer: { kind: 'number' as const, value: d1 + d2 }, stepIndex: 0, why: t('It looks like the denominators were added. Look for a number both denominators divide into evenly.', 'Il semble que les dénominateurs ont été additionnés. Cherche un nombre que les deux dénominateurs divisent exactement.') },
  ];
  return build({
    skill: 'MS.G6.B2.5.a', tier, seed, category: 'KU', format: 'number',
    prompt: t(`What is the least common denominator of ${tex(frac(1, d1))} and ${tex(frac(1, d2))}?`, `Quel est le plus petit dénominateur commun de ${tex(frac(1, d1))} et de ${tex(frac(1, d2))} ?`),
    answer: { kind: 'number', value: l },
    steps: [
      t(`List multiples of ${d1}: ${[1, 2, 3, 4, 5, 6].map((m) => m * d1).join(', ')}.`, `Note des multiples de ${d1} : ${[1, 2, 3, 4, 5, 6].map((m) => m * d1).join(', ')}.`),
      t(`List multiples of ${d2}: ${[1, 2, 3, 4, 5, 6].map((m) => m * d2).join(', ')}.`, `Note des multiples de ${d2} : ${[1, 2, 3, 4, 5, 6].map((m) => m * d2).join(', ')}.`),
      t(`The smallest number in both lists is ${l}.`, `Le plus petit nombre des deux listes est ${l}.`),
    ],
    nudge: t('List the first few multiples of each denominator. Which is the first one they share?', 'Écris les premiers multiples de chaque dénominateur. Quel est le premier qu\'ils ont en commun ?'),
    stepHint: t(`Multiples of ${d1}: ${[1, 2, 3, 4].map((m) => m * d1).join(', ')}, ...`, `Multiples de ${d1} : ${[1, 2, 3, 4].map((m) => m * d1).join(', ')}, ...`),
    wrong,
    praise: t('Nice, you found the first multiple they share.', 'Bravo, tu as trouvé le premier multiple qu\'ils ont en commun.'),
  });
};

function unlike(subtract: boolean): Generator {
  return (tier, seed) => {
    const r = makeRng(seed);
    const pairs: [number, number][] = tier === 1 ? [[2, 4], [3, 6], [2, 6], [4, 8], [5, 10]] : tier === 2 ? [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]] : [[4, 6], [6, 8], [3, 4], [5, 6], [3, 8], [2, 7]];
    let [d1, d2] = pick(r, pairs);
    if (r() < 0.5) [d1, d2] = [d2, d1];
    const l = lcm(d1, d2);
    let a = randInt(r, 1, d1 - 1);
    let b = randInt(r, 1, d2 - 1);
    let va = a * (l / d1), vb = b * (l / d2);
    if (subtract) {
      if (va === vb) { b = b === 1 ? 2 : b - 1; if (b >= d2) b = 1; vb = b * (l / d2); }
      if (va < vb) { [a, b, d1, d2] = [b, a, d2, d1]; [va, vb] = [vb, va]; }
      if (va === vb) {
        const again = unlike(subtract)(tier, seed + 104729);
        return { ...again, id: `${again.skill}:${tier}:${seed}`, seed };
      }
    }
    const resN = subtract ? va - vb : va + vb;
    const [sn, sd] = simplify(resN, l);
    const needReduce = tier === 3;
    const op = subtract ? '-' : '+';
    const wrongAcross = subtract ? { n: a - b, d: d1 - d2 } : { n: a + b, d: d1 + d2 };
    const wrong = [
      ...(wrongAcross.d > 0 && wrongAcross.n > 0
        ? [{ answer: { kind: 'fraction' as const, n: wrongAcross.n, d: wrongAcross.d }, stepIndex: 0, why: t(`It looks like the numerators and the denominators were ${subtract ? 'subtracted' : 'added'} straight across. The denominators are different, so first rewrite both fractions with a common denominator.`, `Il semble que les numérateurs et les dénominateurs ont été ${subtract ? 'soustraits' : 'additionnés'} directement. Les dénominateurs sont différents : réécris d'abord les deux fractions avec un dénominateur commun.`) }]
        : []),
      { answer: { kind: 'fraction' as const, n: resN, d: d1 * d2 }, stepIndex: 1, why: t('It looks like the numerators were combined but the denominator does not match the common denominator used. Rewrite both fractions first, then keep the common denominator.', 'Il semble que les numérateurs ont été combinés, mais le dénominateur ne correspond pas au dénominateur commun utilisé. Réécris d\'abord les deux fractions, puis garde le dénominateur commun.') },
    ];
    const fa = tex(frac(a, d1));
    const fb = tex(frac(b, d2));
    const story = tier >= 2 && r() < 0.4;
    return build({
      skill: subtract ? 'MS.G6.B2.5.c' : 'MS.G6.B2.5.b', tier, seed, category: story ? 'AP' : 'KU', format: 'fraction',
      prompt: story
        ? (subtract
            ? t(`A rope is ${fa} of a metre long. ${fb} of a metre is cut off. How much rope is left?${needReduce ? ' Write your answer in simplest form.' : ''}`, `Une corde mesure ${fa} de mètre. On en coupe ${fb} de mètre. Combien de corde reste-t-il ?${needReduce ? ' Écris ta réponse sous la forme la plus simple.' : ''}`)
            : t(`Sam walked ${fa} of a kilometre and then ${fb} of a kilometre. How far did Sam walk?${needReduce ? ' Write your answer in simplest form.' : ''}`, `Sam a marché ${fa} de kilomètre, puis ${fb} de kilomètre. Quelle distance Sam a-t-il parcourue ?${needReduce ? ' Écris ta réponse sous la forme la plus simple.' : ''}`))
        : t(`${subtract ? 'Subtract' : 'Add'}: ${tex(`${frac(a, d1)} ${op} ${frac(b, d2)}`)}${needReduce ? '. Write your answer in simplest form.' : ''}`, `${subtract ? 'Soustrais' : 'Additionne'} : ${tex(`${frac(a, d1)} ${op} ${frac(b, d2)}`)}${needReduce ? '. Écris ta réponse sous la forme la plus simple.' : ''}`),
      answer: needReduce ? { kind: 'fraction', n: sn, d: sd, mustReduce: true } : { kind: 'fraction', n: resN, d: l },
      steps: [
        t(`Find a common denominator for ${d1} and ${d2}: ${l}.`, `Trouve un dénominateur commun pour ${d1} et ${d2} : ${l}.`),
        t(`Rewrite both fractions: ${tex(`${frac(a, d1)} = ${frac(va, l)}`)} and ${tex(`${frac(b, d2)} = ${frac(vb, l)}`)}.`, `Réécris les deux fractions : ${tex(`${frac(a, d1)} = ${frac(va, l)}`)} et ${tex(`${frac(b, d2)} = ${frac(vb, l)}`)}.`),
        t(`${subtract ? 'Subtract' : 'Add'} the numerators and keep ${l}: ${va} ${op} ${vb} = ${resN}, so ${tex(frac(resN, l))}.`, `${subtract ? 'Soustrais' : 'Additionne'} les numérateurs et garde ${l} : ${va} ${op} ${vb} = ${resN}, donc ${tex(frac(resN, l))}.`),
        ...(sd !== l ? [t(`Simplify: ${tex(`${frac(resN, l)} = ${frac(sn, sd)}`)}.`, `Simplifie : ${tex(`${frac(resN, l)} = ${frac(sn, sd)}`)}.`)] : []),
      ],
      nudge: t('The denominators are different. What can you do to make them the same first?', 'Les dénominateurs sont différents. Que peux-tu faire pour les rendre pareils d\'abord ?'),
      stepHint: t(`Rewrite both fractions in ${l}ths before you ${subtract ? 'subtract' : 'add'}.`, `Réécris les deux fractions en ${l}es avant de ${subtract ? 'soustraire' : 'additionner'}.`),
      wrong,
      praise: t('Nice, you found a common denominator first.', 'Bravo, tu as d\'abord trouvé un dénominateur commun.'),
    });
  };
}
export const addUnlike: Generator = unlike(false);
export const subUnlike: Generator = unlike(true);

