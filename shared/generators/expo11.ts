// Grade 11 (MCR3U) Exponential Functions: rational exponents, telling linear, quadratic and exponential relations apart from tables,
// and growth and decay models. Answers are exact, so every item has a clean number answer.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6 } from './dsl.js';
import { frac, t } from './kit.js';

/** MCR3U.B1: rational exponents. Bases are powers of 2 so results are exact, even for negative exponents. */
export const rationalExp11 = (id: string): Generator => numGen(id, (tier, r) => {
  const n = pick(r, [2, 3, 4]), root = pick(r, n === 2 ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : n === 3 ? [2, 3, 4, 5] : [2, 3]);
  const base = root ** n;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`${f.n(base)}^{\\frac{1}{${f.n(n)}}}`)}.`, `Évalue ${f.m(`${f.n(base)}^{\\frac{1}{${f.n(n)}}}`)}.`)),
      answer: root, category: 'KU',
      wrong: wr(root, [[base / n, t('An exponent 1/n means the nth root, not division by n.', 'Un exposant 1/n signifie la racine n-ième, pas la division par n.'), 0], [base * n, t('An exponent 1/n means the nth root, not multiplication by n.', 'Un exposant 1/n signifie la racine n-ième, pas la multiplication par n.'), 0], [r6(1 / root), t('A positive exponent gives a root, not a reciprocal.', 'Un exposant positif donne une racine, pas un inverse.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(base)}^{\\frac{1}{${f.n(n)}}}`)} is the ${n === 2 ? 'square' : n === 3 ? 'cube' : 'fourth'} root of ${f.N(base)}.`, `${f.m(`${f.n(base)}^{\\frac{1}{${f.n(n)}}}`)} est la racine ${n === 2 ? 'carrée' : n === 3 ? 'cubique' : 'quatrième'} de ${f.N(base)}.`)), bi((f) => f.t(`${f.m(`${f.n(root)}^{${f.n(n)}} = ${f.n(base)}`)}, so the answer is ${f.N(root)}.`, `${f.m(`${f.n(root)}^{${f.n(n)}} = ${f.n(base)}`)} : la réponse est ${f.N(root)}.`))],
      nudge: t('x to the power 1/n is the nth root of x.', 'x à la puissance 1/n est la racine n-ième de x.'),
    };
  }
  const m = pick(r, [2, 3, 4, 5].filter((v) => v !== n)), ans = root ** m;
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`${f.n(base)}^{\\frac{${f.n(m)}}{${f.n(n)}}}`)}.`, `Évalue ${f.m(`${f.n(base)}^{\\frac{${f.n(m)}}{${f.n(n)}}}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[(root * m), t('Take the root first, then raise it to the power m. Do not multiply.', 'Prends d\'abord la racine, puis élève-la à la puissance m. Ne multiplie pas.'), 1], [base ** m, t('The denominator n of the exponent is a root: take it before raising to the power m.', 'Le dénominateur n de l\'exposant est une racine : prends-la avant d\'élever à la puissance m.'), 0], [r6(root ** (n / m)), t('The numerator m is the power, and the denominator n is the root.', 'Le numérateur m est la puissance et le dénominateur n est la racine.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(base)}^{\\frac{${f.n(m)}}{${f.n(n)}}} = (${f.n(base)}^{\\frac{1}{${f.n(n)}}})^{${f.n(m)}} = ${f.n(root)}^{${f.n(m)}}`)}.`, `${f.m(`${f.n(base)}^{\\frac{${f.n(m)}}{${f.n(n)}}} = (${f.n(base)}^{\\frac{1}{${f.n(n)}}})^{${f.n(m)}} = ${f.n(root)}^{${f.n(m)}}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(root)}^{${f.n(m)}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(root)}^{${f.n(m)}}`)} = ${f.N(ans)}.`))],
      nudge: t('Take the root given by the denominator, then raise to the power given by the numerator.', 'Prends la racine donnée par le dénominateur, puis élève à la puissance donnée par le numérateur.'),
    };
  }
  const pb = pick(r, [[4, 2, 1], [8, 3, 1], [16, 4, 1], [32, 5, 1]] as [number, number, number][]);
  const [b3, e3] = [pb[0], pb[1]], rt = Math.round(b3 ** (1 / e3)), mm = pick(r, [1, 2, 3].filter((v) => v !== e3)), ans3 = r6(1 / rt ** mm);
  return {
    prompt: bi((f) => f.t(`Evaluate ${f.m(`${f.n(b3)}^{-\\frac{${f.n(mm)}}{${f.n(e3)}}}`)} as a decimal.`, `Évalue ${f.m(`${f.n(b3)}^{-\\frac{${f.n(mm)}}{${f.n(e3)}}}`)} sous forme décimale.`)),
    answer: ans3, category: 'AP',
    wrong: wr(ans3, [[-(rt ** mm), t('A negative exponent means a reciprocal, not a negative number.', 'Un exposant négatif signifie un inverse, pas un nombre négatif.'), 1], [rt ** mm, t('Do not forget the reciprocal that the negative sign asks for.', 'N\'oublie pas l\'inverse que demande le signe négatif.'), 1], [r6(1 / (b3 ** mm)), t('Take the root before the power: the denominator of the exponent is the root.', 'Prends la racine avant la puissance : le dénominateur de l\'exposant est la racine.'), 0]]),
    steps: [bi((f) => f.t(`A negative exponent means a reciprocal: ${f.m(`${f.n(b3)}^{-\\frac{${f.n(mm)}}{${f.n(e3)}}} = \\frac{1}{${f.n(b3)}^{\\frac{${f.n(mm)}}{${f.n(e3)}}}}`)}.`, `Un exposant négatif signifie un inverse : ${f.m(`${f.n(b3)}^{-\\frac{${f.n(mm)}}{${f.n(e3)}}} = \\frac{1}{${f.n(b3)}^{\\frac{${f.n(mm)}}{${f.n(e3)}}}}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(b3)}^{\\frac{${f.n(mm)}}{${f.n(e3)}}} = ${f.n(rt)}^{${f.n(mm)}} = ${f.n(rt ** mm)}`)}, so the answer is ${f.m(frac(1, rt ** mm))} = ${f.N(ans3)}.`, `${f.m(`${f.n(b3)}^{\\frac{${f.n(mm)}}{${f.n(e3)}}} = ${f.n(rt)}^{${f.n(mm)}} = ${f.n(rt ** mm)}`)} : la réponse est ${f.m(frac(1, rt ** mm))} = ${f.N(ans3)}.`))],
    nudge: t('Handle the negative sign with a reciprocal, then the root, then the power.', 'Traite le signe négatif avec un inverse, puis la racine, puis la puissance.'),
  };
});

/** MCR3U.B3: linear, quadratic or exponential from constant differences or ratios */
export const distinguish11 = (id: string): Generator => choiceGen(id, (tier, r) => {
  const kind = pick(r, ['linear', 'quadratic', 'exponential'] as const);
  const xs = [0, 1, 2, 3, 4];
  let a = 1, b = 0, c0 = 1;
  do { a = randInt(r, 1, 4); b = randInt(r, -3, 5); c0 = randInt(r, 1, 6); } while (xs.some((x) => a * x * x + b * x + c0 === 0 || a * x + c0 === 0)); // no zero values, so every ratio exists
  const ratio = tier === 1 ? 2 : pick(r, [2, 3]);
  const ysFixed = kind === 'linear' ? xs.map((x) => a * x + c0) : kind === 'quadratic' ? xs.map((x) => a * x * x + b * x + c0) : xs.map((x) => c0 * ratio ** x);
  const NAMES: Record<string, Text> = { linear: t('Linear', 'Affine'), quadratic: t('Quadratic', 'Quadratique'), exponential: t('Exponential', 'Exponentielle') };
  const why: Record<string, Text> = {
    linear: t('The first differences are not all equal, so it is not linear.', 'Les premières différences ne sont pas toutes égales : elle n\'est pas affine.'),
    quadratic: t('The second differences are not all equal, so it is not quadratic.', 'Les secondes différences ne sont pas toutes égales : elle n\'est pas quadratique.'),
    exponential: t('The ratios of neighbouring y-values are not all equal, so it is not exponential.', 'Les rapports de valeurs de y voisines ne sont pas tous égaux : elle n\'est pas exponentielle.'),
  };
  const others = (['linear', 'quadratic', 'exponential'] as const).filter((k) => k !== kind);
  const m = mc(r, NAMES[kind]!, others.map((k): [Text, Text] => [NAMES[k]!, why[k]!]));
  const d1 = ysFixed.slice(1).map((y, i) => y - ysFixed[i]!);
  return {
    prompt: bi((f) => f.t(`A table gives y = ${ysFixed.map((y) => f.N(y)).join(', ')} for x = 0, 1, 2, 3, 4. What kind of relation is it?`, `Un tableau donne y = ${ysFixed.map((y) => f.N(y)).join(', ')} pour x = 0, 1, 2, 3, 4. Quel type de relation est-ce ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [bi((f) => f.t(`First differences: ${d1.map((y) => f.N(y)).join(', ')}. Ratios: ${ysFixed.slice(1).map((y, i) => f.N(r6(y / ysFixed[i]!))).join(', ')}.`, `Premières différences : ${d1.map((y) => f.N(y)).join(', ')}. Rapports : ${ysFixed.slice(1).map((y, i) => f.N(r6(y / ysFixed[i]!))).join(', ')}.`)), t(kind === 'linear' ? 'The first differences are constant, so it is linear.' : kind === 'quadratic' ? 'The second differences are constant, so it is quadratic.' : 'The ratios are constant, so it is exponential.', kind === 'linear' ? 'Les premières différences sont constantes : elle est affine.' : kind === 'quadratic' ? 'Les secondes différences sont constantes : elle est quadratique.' : 'Les rapports sont constants : elle est exponentielle.')],
    nudge: t('Check the first differences, then the second differences, then the ratios of neighbouring values.', 'Vérifie les premières différences, puis les secondes, puis les rapports de valeurs voisines.'),
  };
});

/** MCR3U.B5: growth and decay models */
export const growth11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const p0 = randInt(r, 2, 20) * 5, d = pick(r, [2, 3, 4, 6]), k = randInt(r, 2, 4), growth = r() < 0.6, T = d * k;
    const start = growth ? p0 : p0 * 2 ** k, dec = growth ? p0 * 2 ** k : p0;
    return {
      prompt: bi((f) => growth ? f.t(`A culture of ${f.N(p0)} bacteria doubles every ${f.N(d)} hours. How many bacteria are there after ${f.N(T)} hours?`, `Une culture de ${f.N(p0)} bactéries double toutes les ${f.N(d)} heures. Combien y a-t-il de bactéries après ${f.N(T)} heures ?`) : f.t(`A sample of ${f.N(start)} grams of a substance has a half-life of ${f.N(d)} days. How many grams are left after ${f.N(T)} days?`, `Un échantillon de ${f.N(start)} grammes d'une substance a une demi-vie de ${f.N(d)} jours. Combien de grammes restent-ils après ${f.N(T)} jours ?`)),
      answer: dec, category: 'AP',
      wrong: wr(dec, [[growth ? p0 * 2 * k : start / (2 * k), t('Doubling is repeated multiplication by 2, once for each period. Count how many periods fit in the time.', 'Doubler, c\'est multiplier par 2 de façon répétée, une fois par période. Compte combien de périodes tiennent dans le temps.'), 1], [growth ? p0 * 2 ** T : start / 2 ** T, t('Use the number of periods (time ÷ period), not the number of hours or days.', 'Utilise le nombre de périodes (temps ÷ période), pas le nombre d\'heures ou de jours.'), 1], [growth ? p0 * 2 ** (k - 1) : start / 2 ** (k + 1), t('Check the number of periods again, and whether the amount grows or shrinks.', 'Vérifie encore le nombre de périodes et si la quantité augmente ou diminue.'), 1]].map(([v, w, s]) => [r6(v as number), w as Text, s as number] as [number, Text, number])),
      steps: [bi((f) => f.t(`Number of periods: ${f.m(`${f.n(T)} \\div ${f.n(d)}`)} = ${f.N(k)}.`, `Nombre de périodes : ${f.m(`${f.n(T)} \\div ${f.n(d)}`)} = ${f.N(k)}.`)), bi((f) => f.t(`${growth ? `${f.m(`${f.n(p0)} \\times 2^{${f.n(k)}}`)}` : `${f.m(`${f.n(start)} \\times (\\frac{1}{2})^{${f.n(k)}}`)}`} = ${f.N(dec)}.`, `${growth ? `${f.m(`${f.n(p0)} \\times 2^{${f.n(k)}}`)}` : `${f.m(`${f.n(start)} \\times (\\frac{1}{2})^{${f.n(k)}}`)}`} = ${f.N(dec)}.`))],
      nudge: t('Find how many doubling (or halving) periods fit in the time, then multiply by 2 (or ½) that many times.', 'Trouve combien de périodes de doublement (ou de demi-vie) tiennent dans le temps, puis multiplie par 2 (ou ½) autant de fois.'),
    };
  }
  if (tier === 2) {
    const p0 = randInt(r, 1, 9) * 100, pctd = pick(r, [10, 20, 50]), years = randInt(r, 2, 3), up = r() < 0.5;
    const fct = r6(1 + (up ? pctd : -pctd) / 100), ans = r6(p0 * fct ** years);
    return {
      prompt: bi((f) => f.t(`A town of ${f.N(p0)} people ${up ? 'grows' : 'shrinks'} by ${f.m(`${f.n(pctd)}\\%`)} each year. What is its population after ${f.N(years)} years?`, `Une ville de ${f.N(p0)} habitants ${up ? 'augmente' : 'diminue'} de ${f.m(`${f.n(pctd)}\\%`)} chaque année. Quelle est sa population après ${f.N(years)} ans ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(p0 * (1 + (up ? pctd : -pctd) / 100 * years)), t('Each year the percent applies to the new amount, so use repeated multiplication, not adding the same amount each year.', 'Chaque année, le pourcentage s\'applique au nouveau montant : utilise la multiplication répétée, pas l\'ajout du même montant chaque année.'), 1], [r6(p0 * (up ? pctd : -pctd) / 100 * years + p0), t('That treats the change as the same amount every year.', 'Cela traite la variation comme le même montant chaque année.'), 1], [r6(p0 * (2 - fct) ** years), t('The growth factor for an increase is 1 plus the rate; for a decrease it is 1 minus the rate.', 'Le facteur de croissance pour une hausse est 1 plus le taux ; pour une baisse, c\'est 1 moins le taux.'), 0]]),
      steps: [bi((f) => f.t(`The yearly factor is ${f.N(fct)}.`, `Le facteur annuel est ${f.N(fct)}.`)), bi((f) => f.t(`${f.m(`${f.n(p0)} \\times ${f.n(fct)}^{${f.n(years)}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(p0)} \\times ${f.n(fct)}^{${f.n(years)}}`)} = ${f.N(ans)}.`))],
      nudge: t('Use the factor 1 + rate (growth) or 1 − rate (decay), raised to the number of years.', 'Utilise le facteur 1 + taux (croissance) ou 1 − taux (décroissance), élevé au nombre d\'années.'),
    };
  }
  const p0 = randInt(r, 1, 9) * 125, d = pick(r, [2, 3, 5]), k = randInt(r, 2, 4), final = r6(p0 * 2 ** k);
  return {
    prompt: bi((f) => f.t(`A population started at ${f.N(p0)} and doubles every ${f.N(d)} years. It is now ${f.N(final)}. How many years has it been growing?`, `Une population est partie de ${f.N(p0)} et double tous les ${f.N(d)} ans. Elle est maintenant de ${f.N(final)}. Depuis combien d'années croît-elle ?`)),
    answer: d * k, category: 'TH',
    wrong: wr(d * k, [[k, t('That is the number of doublings. Multiply by the years per doubling.', 'C\'est le nombre de doublements. Multiplie par le nombre d\'années par doublement.'), 1], [final / p0, t('That is the growth factor, not the number of years.', 'C\'est le facteur de croissance, pas le nombre d\'années.'), 1], [d * (k + 1), t('Count the doublings again: 2 to the power k should equal the growth factor.', 'Recompte les doublements : 2 à la puissance k doit égaler le facteur de croissance.'), 1]]),
    steps: [bi((f) => f.t(`The population grew by a factor of ${f.m(`${f.n(final)} \\div ${f.n(p0)}`)} = ${f.N(2 ** k)}, which is ${f.m(`2^{${f.n(k)}}`)}.`, `La population a été multipliée par ${f.m(`${f.n(final)} \\div ${f.n(p0)}`)} = ${f.N(2 ** k)}, soit ${f.m(`2^{${f.n(k)}}`)}.`)), bi((f) => f.t(`That is ${f.N(k)} doublings, each ${f.N(d)} years: ${f.N(d * k)} years.`, `Cela fait ${f.N(k)} doublements de ${f.N(d)} ans chacun : ${f.N(d * k)} ans.`))],
    nudge: t('Find how many times it doubled, then multiply by the years per doubling.', 'Trouve combien de fois elle a doublé, puis multiplie par le nombre d\'années par doublement.'),
  };
});
