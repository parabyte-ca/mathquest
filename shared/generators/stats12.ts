// Grade 12 (MDM4U) Statistical Analysis: variance and standard deviation, quartiles and outliers, regression and correlation, residuals,
// and margins of error. Data sets are built so every answer is exact (whole numbers or terminating decimals).
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const same = (en: string, fr: string): Text => t(en, fr);
const mean = (v: number[]): number => v.reduce((a, b) => a + b, 0) / v.length;
const ss = (v: number[]): number => { const m = mean(v); return v.reduce((s, x) => s + (x - m) ** 2, 0); };

/** A data set of n whole numbers with a whole-number mean, for which `ok` accepts the sum of squared deviations. */
function dataSet(r: () => number, n: number, ok: (sumSq: number) => boolean, fallback: number[]): number[] {
  for (let i = 0; i < 4000; i++) {
    const centre = randInt(r, 20, 80), dev = Array.from({ length: n - 1 }, () => randInt(r, -6, 6));
    dev.push(-dev.reduce((a, b) => a + b, 0));
    if (new Set(dev).size < 3) continue;
    if (ok(dev.reduce((s, d) => s + d * d, 0))) return dev.map((d) => centre + d);
  }
  return fallback;
}
const isSquare = (x: number): boolean => Number.isInteger(Math.sqrt(x)) && x > 0;

/** MDM4U.D1: measures of spread: range, variance and standard deviation */
export const spread12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const v = dataSet(r, 5, () => true, [10, 12, 15, 18, 20]), shuffled = [...v].sort(() => r() - 0.5), m = r6(mean(v));
    return {
      prompt: bi((f) => f.t(`Find the mean of the data set ${shuffled.map((x) => f.N(x)).join(', ')}.`, `Trouve la moyenne de l'ensemble de données ${shuffled.map((x) => f.N(x)).join(', ')}.`)),
      answer: m, category: 'KU',
      wrong: wr(m, [[[...v].sort((a, b) => a - b)[2]!, same('That is the median, the middle value. The mean is the sum divided by the number of values.', 'C\'est la médiane, la valeur du milieu. La moyenne est la somme divisée par le nombre de valeurs.'), 0], [Math.max(...v) - Math.min(...v), same('That is the range. The mean is the sum divided by the number of values.', 'C\'est l\'étendue. La moyenne est la somme divisée par le nombre de valeurs.'), 0]]),
      steps: [bi((f) => f.t(`The sum is ${f.N(v.reduce((a, b) => a + b, 0))}.`, `La somme est ${f.N(v.reduce((a, b) => a + b, 0))}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(v.reduce((a, b) => a + b, 0))}}{5}`)} = ${f.N(m)}.`, `${f.m(`\\frac{${f.n(v.reduce((a, b) => a + b, 0))}}{5}`)} = ${f.N(m)}.`))],
      nudge: same('Add all the values and divide by how many there are.', 'Additionne toutes les valeurs et divise par leur nombre.'),
    };
  }
  if (tier === 2) {
    const n = pick(r, [4, 5, 8]), v = dataSet(r, n, (s) => s % n === 0, n === 4 ? [10, 12, 14, 16] : n === 5 ? [11, 13, 15, 17, 19] : [10, 10, 12, 12, 14, 14, 16, 16]);
    const ans = r6(ss(v) / n);
    return {
      prompt: bi((f) => f.t(`Find the population variance of ${v.map((x) => f.N(x)).join(', ')}.`, `Trouve la variance de la population de ${v.map((x) => f.N(x)).join(', ')}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(ss(v) / (n - 1)), same('For a whole population, divide by n, not n − 1.', 'Pour toute une population, divise par n, et non par n − 1.'), 1], [r6(ss(v)), same('Divide the sum of the squared deviations by the number of values.', 'Divise la somme des carrés des écarts par le nombre de valeurs.'), 1], [r6(Math.sqrt(ans)), same('That is the standard deviation. The variance is the mean of the squared deviations.', 'C\'est l\'écart-type. La variance est la moyenne des carrés des écarts.'), 1]]),
      steps: [bi((f) => f.t(`The mean is ${f.N(r6(mean(v)))}. The squared deviations add to ${f.N(r6(ss(v)))}.`, `La moyenne est ${f.N(r6(mean(v)))}. Les carrés des écarts ont pour somme ${f.N(r6(ss(v)))}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(r6(ss(v)))}}{${f.n(n)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(r6(ss(v)))}}{${f.n(n)}}`)} = ${f.N(ans)}.`))],
      nudge: same('Subtract the mean from each value, square, add, and divide by n.', 'Soustrais la moyenne de chaque valeur, élève au carré, additionne, et divise par n.'),
    };
  }
  const v = dataSet(r, 5, (s) => isSquare(s / 4) && s % 4 === 0, [18, 18, 20, 22, 22]), s2 = ss(v) / 4;
  return {
    prompt: bi((f) => f.t(`Find the sample standard deviation of ${v.map((x) => f.N(x)).join(', ')}.`, `Trouve l'écart-type de l'échantillon de ${v.map((x) => f.N(x)).join(', ')}.`)),
    answer: r6(Math.sqrt(s2)), category: 'TH',
    wrong: wr(r6(Math.sqrt(s2)), [[r6(Math.sqrt(ss(v) / 5)), same('For a sample, divide the sum of squared deviations by n − 1.', 'Pour un échantillon, divise la somme des carrés des écarts par n − 1.'), 1], [r6(s2), same('That is the variance. Take its square root.', 'C\'est la variance. Prends sa racine carrée.'), 1]]),
    steps: [bi((f) => f.t(`The mean is ${f.N(r6(mean(v)))} and the squared deviations add to ${f.N(r6(ss(v)))}.`, `La moyenne est ${f.N(r6(mean(v)))} et les carrés des écarts ont pour somme ${f.N(r6(ss(v)))}.`)), bi((f) => f.t(`${f.m(`s = \\sqrt{\\frac{${f.n(r6(ss(v)))}}{4}} = \\sqrt{${f.n(r6(s2))}}`)} = ${f.N(r6(Math.sqrt(s2)))}.`, `${f.m(`s = \\sqrt{\\frac{${f.n(r6(ss(v)))}}{4}} = \\sqrt{${f.n(r6(s2))}}`)} = ${f.N(r6(Math.sqrt(s2)))}.`))],
    nudge: same('Divide the sum of squared deviations by n − 1, then take the square root.', 'Divise la somme des carrés des écarts par n − 1, puis prends la racine carrée.'),
  };
});

/** MDM4U.D1: quartiles, the interquartile range and outliers (eleven values, so every quartile is a data value) */
export const quartiles12 = (id: string): Generator => numGen(id, (tier, r) => {
  const mk = (): number[] => { const base = randInt(r, 10, 30); const v: number[] = []; let x = base; for (let i = 0; i < 10; i++) { x += randInt(r, 1, 6); v.push(x); } v.push(x + randInt(r, 1, 3) * pick(r, [1, 8, 20])); return v; };
  const v = mk(), s = [...v], q1 = s[2]!, med = s[5]!, q3 = s[8]!, iqr = q3 - q1, hi = r6(q3 + 1.5 * iqr), lo = r6(q1 - 1.5 * iqr);
  const shown = (f: { N: (n: number) => string }): string => [...v].map((x) => f.N(x)).join(', ');
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`The ordered data set is ${shown(f)}. What is the interquartile range?`, `L'ensemble de données ordonné est ${shown(f)}. Quel est l'écart interquartile ?`)),
      answer: iqr, category: 'KU',
      wrong: wr(iqr, [[v[10]! - v[0]!, same('That is the range. The interquartile range is Q3 minus Q1.', 'C\'est l\'étendue. L\'écart interquartile est Q3 moins Q1.'), 1], [q3, same('Subtract Q1 from Q3.', 'Soustrais Q1 de Q3.'), 1], [med - q1, same('Use the third quartile minus the first quartile.', 'Utilise le troisième quartile moins le premier quartile.'), 1]]),
      steps: [bi((f) => f.t(`With 11 values, Q1 is the median of the lower 5 values, ${f.N(q1)}, and Q3 is the median of the upper 5, ${f.N(q3)}.`, `Avec 11 valeurs, Q1 est la médiane des 5 valeurs inférieures, ${f.N(q1)}, et Q3 est la médiane des 5 valeurs supérieures, ${f.N(q3)}.`)), bi((f) => f.t(`${f.m(`${f.n(q3)} - ${f.n(q1)}`)} = ${f.N(iqr)}.`, `${f.m(`${f.n(q3)} - ${f.n(q1)}`)} = ${f.N(iqr)}.`))],
      nudge: same('Find the medians of the lower and upper halves, then subtract.', 'Trouve les médianes de la moitié inférieure et de la moitié supérieure, puis soustrais.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`The ordered data set is ${shown(f)}. What is the upper fence, Q3 + 1.5 × IQR, for outliers?`, `L'ensemble de données ordonné est ${shown(f)}. Quelle est la clôture supérieure, Q3 + 1,5 × EIQ, pour les valeurs aberrantes ?`)),
      answer: hi, category: 'AP',
      wrong: wr(hi, [[r6(q3 + iqr), same('Multiply the interquartile range by 1.5 before adding it to Q3.', 'Multiplie l\'écart interquartile par 1,5 avant de l\'ajouter à Q3.'), 1], [r6(q3 + 1.5 * (v[10]! - v[0]!)), same('Use the interquartile range, not the range.', 'Utilise l\'écart interquartile, et non l\'étendue.'), 1], [lo, same('That is the lower fence. The upper fence adds to Q3.', 'C\'est la clôture inférieure. La clôture supérieure s\'ajoute à Q3.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`Q_1 = ${f.n(q1)}`)}, ${f.m(`Q_3 = ${f.n(q3)}`)}, so ${f.m(`IQR = ${f.n(iqr)}`)}.`, `${f.m(`Q_1 = ${f.n(q1)}`)}, ${f.m(`Q_3 = ${f.n(q3)}`)}, donc ${f.m(`EIQ = ${f.n(iqr)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(q3)} + 1.5(${f.n(iqr)})`)} = ${f.N(hi)}.`, `${f.m(`${f.n(q3)} + 1{,}5(${f.n(iqr)})`)} = ${f.N(hi)}.`))],
      nudge: same('Find Q1, Q3 and the IQR, then add 1.5 times the IQR to Q3.', 'Trouve Q1, Q3 et l\'EIQ, puis ajoute 1,5 fois l\'EIQ à Q3.'),
    };
  }
  const count = v.filter((x) => x > hi || x < lo).length;
  return {
    prompt: bi((f) => f.t(`The ordered data set is ${shown(f)}. How many values are outliers, using the 1.5 × IQR rule?`, `L'ensemble de données ordonné est ${shown(f)}. Combien de valeurs sont aberrantes, selon la règle de 1,5 × EIQ ?`)),
    answer: count, category: 'TH',
    wrong: wr(count, [[count + 1, same('Check each value against both fences: a value is an outlier only if it is beyond a fence.', 'Compare chaque valeur aux deux clôtures : une valeur est aberrante seulement si elle dépasse une clôture.'), 1], [v.filter((x) => x > q3).length, same('Only values beyond the fences are outliers, not every value above Q3.', 'Seules les valeurs au-delà des clôtures sont aberrantes, et non toutes celles au-dessus de Q3.'), 1], [Math.max(0, count - 1), same('Check both the lower and the upper fence.', 'Vérifie la clôture inférieure et la clôture supérieure.'), 1]]),
    steps: [bi((f) => f.t(`The fences are ${f.N(lo)} and ${f.N(hi)} (Q1 minus and Q3 plus 1.5 times ${f.N(iqr)}).`, `Les clôtures sont ${f.N(lo)} et ${f.N(hi)} (Q1 moins et Q3 plus 1,5 fois ${f.N(iqr)}).`)), bi((f) => f.t(`${f.N(count)} value${count === 1 ? ' is' : 's are'} beyond a fence.`, `${f.N(count)} valeur${count > 1 ? 's sont' : ' est'} au-delà d'une clôture.`))],
    nudge: same('Find both fences, then count the values outside them.', 'Trouve les deux clôtures, puis compte les valeurs à l\'extérieur.'),
  };
});

/** MDM4U.D2: lines of best fit, correlation and the coefficient of determination */
export const regression12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = pick(r, [2, 3.5, 5, 10, -4]), b = pick(r, [0.5, 1.5, 2, 2.5, -1.5, -2]), x = randInt(r, 2, 12), ans = r6(a + b * x);
    return {
      prompt: bi((f) => f.t(`The line of best fit is ${f.m(`\\hat{y} = ${f.n(a)} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}x`)}. What value of y does it predict when x = ${f.N(x)}?`, `La droite de régression est ${f.m(`\\hat{y} = ${f.n(a)} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}x`)}. Quelle valeur de y prédit-elle quand x = ${f.N(x)} ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(a + b + x), same('Multiply the slope by x before adding the intercept.', 'Multiplie la pente par x avant d\'ajouter l\'ordonnée à l\'origine.'), 1], [r6(b * x), same('Add the intercept.', 'Ajoute l\'ordonnée à l\'origine.'), 1], [r6(a - b * x), same('The slope term is added, with its own sign.', 'Le terme de la pente s\'ajoute, avec son propre signe.'), 1]]),
      steps: [bi((f) => f.t(`Put x = ${f.N(x)} in: ${f.m(`${f.n(a)} + (${f.n(b)})(${f.n(x)})`)}.`, `Remplace x = ${f.N(x)} : ${f.m(`${f.n(a)} + (${f.n(b)})(${f.n(x)})`)}.`)), bi((f) => f.t(`The prediction is ${f.N(ans)}.`, `La prédiction est ${f.N(ans)}.`))],
      nudge: same('Replace x in the equation of the line, multiply, then add.', 'Remplace x dans l\'équation de la droite, multiplie, puis additionne.'),
    };
  }
  if (tier === 2) {
    const rr = pick(r, [0.5, 0.6, 0.8, 0.9, -0.5, -0.6, -0.8, -0.9]), sx = pick(r, [2, 4, 5, 10]), sy = pick(r, [2, 4, 5, 10, 20]), ans = r6((rr * sy) / sx);
    return {
      prompt: bi((f) => f.t(`Two variables have correlation coefficient ${f.m(`r = ${f.n(rr)}`)}, standard deviations ${f.m(`s_x = ${f.n(sx)}`)} and ${f.m(`s_y = ${f.n(sy)}`)}. What is the slope of the least-squares line of y on x?`, `Deux variables ont un coefficient de corrélation ${f.m(`r = ${f.n(rr)}`)} et des écarts-types ${f.m(`s_x = ${f.n(sx)}`)} et ${f.m(`s_y = ${f.n(sy)}`)}. Quelle est la pente de la droite des moindres carrés de y en fonction de x ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6((rr * sx) / sy), same('The slope is r times s_y over s_x, with y on top.', 'La pente est r fois s_y sur s_x, avec y en haut.'), 1], [r6(sy / sx), same('Multiply by r, which sets the sign and the strength.', 'Multiplie par r, qui donne le signe et la force.'), 1], [rr, same('The slope also uses the two standard deviations.', 'La pente utilise aussi les deux écarts-types.'), 0]]),
      steps: [same('Slope = r × s_y ÷ s_x.', 'Pente = r × s_y ÷ s_x.'), bi((f) => f.t(`${f.m(`${f.n(rr)} \\times \\frac{${f.n(sy)}}{${f.n(sx)}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(rr)} \\times \\frac{${f.n(sy)}}{${f.n(sx)}}`)} = ${f.N(ans)}.`))],
      nudge: same('Multiply r by the standard deviation of y over the standard deviation of x.', 'Multiplie r par l\'écart-type de y sur l\'écart-type de x.'),
    };
  }
  const rr = pick(r, [0.5, 0.6, 0.7, 0.8, 0.9, -0.5, -0.6, -0.7, -0.8, -0.9]), ans = r6(rr * rr * 100);
  return {
    prompt: bi((f) => f.t(`The correlation coefficient between two variables is ${f.m(`r = ${f.n(rr)}`)}. What percent of the variation in y is explained by the line of best fit?`, `Le coefficient de corrélation entre deux variables est ${f.m(`r = ${f.n(rr)}`)}. Quel pourcentage de la variation de y est expliqué par la droite de régression ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(Math.abs(rr) * 100), same('Square r first: the explained variation is r squared.', 'Élève d\'abord r au carré : la variation expliquée est r au carré.'), 1], [r6(-ans), same('A percent explained is never negative, because r is squared.', 'Un pourcentage expliqué n\'est jamais négatif, car r est élevé au carré.'), 1], [r6(rr * rr), same('Write it as a percent: multiply by 100.', 'Écris-le en pourcentage : multiplie par 100.'), 1]]),
    steps: [same('The coefficient of determination is r squared.', 'Le coefficient de détermination est r au carré.'), bi((f) => f.t(`${f.m(`(${f.n(rr)})^2 = ${f.n(r6(rr * rr))}`)}, which is ${f.N(ans)} percent.`, `${f.m(`(${f.n(rr)})^2 = ${f.n(r6(rr * rr))}`)}, soit ${f.N(ans)} pour cent.`))],
    nudge: same('Square r and write the result as a percent.', 'Élève r au carré et écris le résultat en pourcentage.'),
  };
});

/** MDM4U.D2: residuals */
export const residuals12 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = pick(r, [1, 2, 5, 10]), b = pick(r, [1, 2, 3, 0.5]);
  const line = (f: { n: (x: number) => string | number }): string => `\\hat{y} = ${f.n(a)} + ${f.n(b)}x`;
  if (tier === 1) {
    const x = randInt(r, 2, 10), pred = r6(a + b * x), y = r6(pred + pick(r, [-3, -2, -1, 1, 2, 3, 4])), ans = r6(y - pred);
    return {
      prompt: bi((f) => f.t(`The line of best fit is ${f.m(line(f))}. A data point is (${f.N(x)}, ${f.N(y)}). What is its residual?`, `La droite de régression est ${f.m(line(f))}. Un point de données est (${f.N(x)}, ${f.N(y)}). Quel est son résidu ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[-ans, same('Residual = actual minus predicted.', 'Résidu = valeur réelle moins valeur prédite.'), 1], [pred, same('That is the predicted value. The residual is the actual value minus it.', 'C\'est la valeur prédite. Le résidu est la valeur réelle moins celle-ci.'), 0]]),
      steps: [bi((f) => f.t(`The line predicts ${f.m(`${f.n(a)} + ${f.n(b)}(${f.n(x)})`)} = ${f.N(pred)}.`, `La droite prédit ${f.m(`${f.n(a)} + ${f.n(b)}(${f.n(x)})`)} = ${f.N(pred)}.`)), bi((f) => f.t(`${f.m(`${f.n(y)} - ${f.n(pred)}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(y)} - ${f.n(pred)}`)} = ${f.N(ans)}.`))],
      nudge: same('Residual = the actual y minus the predicted y.', 'Résidu = le y réel moins le y prédit.'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 4, 6), res = Array.from({ length: n - 1 }, () => pick(r, [-3, -2, -1, 1, 2, 3, 4])), miss = -res.reduce((x, y) => x + y, 0);
    const shown = [...res, miss];
    const idx = randInt(r, 0, n - 1), others = shown.filter((_, i) => i !== idx);
    return {
      prompt: bi((f) => f.t(`A least-squares line has ${f.N(n)} residuals. ${f.N(n - 1)} of them are ${others.map((x) => f.N(x)).join(', ')}. What is the missing residual?`, `Une droite des moindres carrés a ${f.N(n)} résidus. ${f.N(n - 1)} d'entre eux sont ${others.map((x) => f.N(x)).join(', ')}. Quel est le résidu manquant ?`)),
      answer: shown[idx]!, category: 'AP',
      wrong: wr(shown[idx]!, [[-shown[idx]!, same('The residuals of a least-squares line add to zero, so the missing one makes the sum zero.', 'Les résidus d\'une droite des moindres carrés ont pour somme zéro : le résidu manquant rend la somme égale à zéro.'), 1], [others.reduce((a, b) => a + b, 0), same('Make the total zero: the missing residual is the opposite of the sum of the others.', 'Rends le total nul : le résidu manquant est l\'opposé de la somme des autres.'), 1]]),
      steps: [same('The residuals of a least-squares line add to zero.', 'Les résidus d\'une droite des moindres carrés ont pour somme zéro.'), bi((f) => f.t(`The others add to ${f.N(others.reduce((a, b) => a + b, 0))}, so the missing residual is ${f.N(shown[idx]!)}.`, `Les autres ont pour somme ${f.N(others.reduce((a, b) => a + b, 0))} : le résidu manquant est ${f.N(shown[idx]!)}.`))],
      nudge: same('Residuals sum to zero. What makes the total zero?', 'Les résidus ont pour somme zéro. Qu\'est-ce qui rend le total nul ?'),
    };
  }
  const pts = Array.from({ length: 5 }, (_, i) => ({ x: i * 2 + 1, y: a + b * (i * 2 + 1) + pick(r, [-3, -2, -1, 1, 2, 3]) }));
  const above = pts.filter((p) => p.y > a + b * p.x).length;
  return {
    prompt: bi((f) => f.t(`The line of best fit is ${f.m(line(f))}. The data points are ${pts.map((p) => `(${f.N(p.x)}, ${f.N(r6(p.y))})`).join(', ')}. How many points have a positive residual?`, `La droite de régression est ${f.m(line(f))}. Les points de données sont ${pts.map((p) => `(${f.N(p.x)}, ${f.N(r6(p.y))})`).join(', ')}. Combien de points ont un résidu positif ?`)),
    answer: above, category: 'TH',
    wrong: wr(above, [[5 - above, same('A positive residual means the point is above the line: the actual y is greater than the predicted y.', 'Un résidu positif signifie que le point est au-dessus de la droite : le y réel est plus grand que le y prédit.'), 1], [above + 1, same('Check each point: compare its y with the line\'s prediction.', 'Vérifie chaque point : compare son y avec la prédiction de la droite.'), 1]]),
    steps: [same('A residual is positive when the actual y is greater than the line\'s prediction.', 'Un résidu est positif quand le y réel est plus grand que la prédiction de la droite.'), bi((f) => f.t(`Checking the points, ${f.N(above)} are above the line.`, `En vérifiant les points, ${f.N(above)} sont au-dessus de la droite.`))],
    nudge: same('For each point, work out the predicted y and compare it with the actual y.', 'Pour chaque point, calcule le y prédit et compare-le au y réel.'),
  };
});

/** MDM4U.D3: statistical claims, margin of error and confidence statements */
export const marginError12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const n = pick(r, [100, 200, 250, 400, 500, 800]), k = Math.round(n * pick(r, [0.3, 0.4, 0.45, 0.55, 0.6, 0.7])), p = r6((k / n) * 100);
    return {
      prompt: bi((f) => f.t(`In a poll of ${f.N(n)} people, ${f.N(k)} say they support a plan. What percent of the sample supports it?`, `Dans un sondage auprès de ${f.N(n)} personnes, ${f.N(k)} disent appuyer un projet. Quel pourcentage de l'échantillon l'appuie ?`)),
      answer: p, category: 'KU',
      wrong: wr(p, [[r6(k / n), same('Write it as a percent: multiply by 100.', 'Écris-le en pourcentage : multiplie par 100.'), 1], [r6(100 - p), same('That is the percent who do not support it.', 'C\'est le pourcentage de ceux qui ne l\'appuient pas.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`\\frac{${f.n(k)}}{${f.n(n)}} \\times 100`)}`, `${f.m(`\\frac{${f.n(k)}}{${f.n(n)}} \\times 100`)}`)), bi((f) => f.t(`= ${f.N(p)} percent.`, `= ${f.N(p)} pour cent.`))],
      nudge: same('Divide the number who support it by the sample size, then multiply by 100.', 'Divise le nombre de partisans par la taille de l\'échantillon, puis multiplie par 100.'),
    };
  }
  const n = pick(r, [100, 400, 625, 1600, 2500, 10000]), me = r6(100 / Math.sqrt(n));
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A poll of ${f.N(n)} people has a margin of error of about ${f.m('\\pm \\frac{1}{\\sqrt{n}}')}. What is the margin of error, in percentage points?`, `Un sondage auprès de ${f.N(n)} personnes a une marge d'erreur d'environ ${f.m('\\pm \\frac{1}{\\sqrt{n}}')}. Quelle est la marge d'erreur, en points de pourcentage ?`)),
      answer: me, category: 'AP',
      wrong: wr(me, [[r6(100 / n), same('Take the square root of n before dividing.', 'Prends la racine carrée de n avant de diviser.'), 1], [r6(1 / Math.sqrt(n)), same('Write it in percentage points: multiply by 100.', 'Écris-le en points de pourcentage : multiplie par 100.'), 1], [r6(100 * Math.sqrt(n) / n * 2), same('The margin is 1 over the square root of n, not twice that.', 'La marge est 1 sur la racine carrée de n, et non le double.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`\\frac{1}{\\sqrt{${f.n(n)}}}`)} = ${f.m(`\\frac{1}{${f.n(Math.sqrt(n))}}`)} = ${f.N(r6(1 / Math.sqrt(n)))}.`, `${f.m(`\\frac{1}{\\sqrt{${f.n(n)}}}`)} = ${f.m(`\\frac{1}{${f.n(Math.sqrt(n))}}`)} = ${f.N(r6(1 / Math.sqrt(n)))}.`)), bi((f) => f.t(`As percentage points, that is ${f.N(me)}.`, `En points de pourcentage, cela donne ${f.N(me)}.`))],
      nudge: same('Divide 1 by the square root of the sample size, and write it as a percent.', 'Divise 1 par la racine carrée de la taille de l\'échantillon, et écris-le en pourcentage.'),
    };
  }
  const k = Math.round(n * pick(r, [0.4, 0.45, 0.5, 0.55, 0.6])), p = (k / n) * 100, lo = r6(p - me);
  return {
    prompt: bi((f) => f.t(`A poll of ${f.N(n)} people finds ${f.N(r6(p))} percent support, with a margin of error of ${f.N(me)} percentage points. What is the lower end of the confidence interval, in percent?`, `Un sondage auprès de ${f.N(n)} personnes révèle ${f.N(r6(p))} pour cent d'appui, avec une marge d'erreur de ${f.N(me)} points de pourcentage. Quelle est l'extrémité inférieure de l'intervalle de confiance, en pour cent ?`)),
    answer: lo, category: 'TH',
    wrong: wr(lo, [[r6(p + me), same('That is the upper end. The lower end subtracts the margin of error.', 'C\'est l\'extrémité supérieure. L\'extrémité inférieure soustrait la marge d\'erreur.'), 1], [r6(me), same('That is the margin of error itself. Subtract it from the percent found.', 'C\'est la marge d\'erreur elle-même. Soustrais-la du pourcentage obtenu.'), 1], [r6(p), same('Subtract the margin of error.', 'Soustrais la marge d\'erreur.'), 1]]),
    steps: [same('The interval runs from the percent found minus the margin of error to the percent plus it.', 'L\'intervalle va du pourcentage obtenu moins la marge d\'erreur au pourcentage plus celle-ci.'), bi((f) => f.t(`${f.m(`${f.n(r6(p))} - ${f.n(me)}`)} = ${f.N(lo)}.`, `${f.m(`${f.n(r6(p))} - ${f.n(me)}`)} = ${f.N(lo)}.`))],
    nudge: same('Subtract the margin of error from the sample percent.', 'Soustrais la marge d\'erreur du pourcentage de l\'échantillon.'),
  };
});
