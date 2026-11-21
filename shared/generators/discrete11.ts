// Grade 11 (MCR3U) Discrete Functions: Pascal's triangle and recursive sequences, arithmetic and geometric sequences and series,
// compound interest and annuities. Money answers use rates chosen so results are exact to the cent.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
const choose = (n: number, k: number): number => { let v = 1; for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i; return Math.round(v); };
const money = (f: F, x: number): string => `${f.N(r6(x))} ${f.t('dollars', 'dollars')}`;

/** MCR3U.C1: Pascal's triangle, binomial expansion */
export const pascal11 = (id: string): Generator => numGen(id, (tier, r) => {
  const n = tier === 1 ? randInt(r, 4, 7) : randInt(r, 4, 6), k = randInt(r, 1, n - 1);
  if (tier === 1) {
    const ans = choose(n, k);
    return {
      prompt: bi((f) => f.t(`In Pascal's triangle, row ${f.N(n)} starts at row ${f.N(0)} (the row with a single 1). What is entry number ${f.N(k)} in that row, counting the first entry as number ${f.N(0)}?`, `Dans le triangle de Pascal, la rangée ${f.N(n)} commence à la rangée ${f.N(0)} (celle d'un seul 1). Quelle est l'entrée numéro ${f.N(k)} de cette rangée, en comptant la première entrée comme numéro ${f.N(0)} ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[choose(n, k - 1), t('That is the neighbouring entry. Check which entry is number k, counting from 0.', 'C\'est l\'entrée voisine. Vérifie laquelle est le numéro k, en comptant à partir de 0.'), 1], [choose(n + 1, k), t('That is in the next row. Rows are numbered from 0, starting with the single 1.', 'C\'est dans la rangée suivante. Les rangées sont numérotées à partir de 0, en commençant par le seul 1.'), 1], [n * k, t('Each entry is the sum of the two entries above it, not a product.', 'Chaque entrée est la somme des deux entrées au-dessus, pas un produit.'), 1]]),
      steps: [bi((f) => f.t(`Row ${f.N(n)} is ${Array.from({ length: n + 1 }, (_, i) => f.N(choose(n, i))).join(', ')}.`, `La rangée ${f.N(n)} est ${Array.from({ length: n + 1 }, (_, i) => f.N(choose(n, i))).join(', ')}.`)), bi((f) => f.t(`Entry number ${f.N(k)} is ${f.N(ans)}.`, `L'entrée numéro ${f.N(k)} est ${f.N(ans)}.`))],
      nudge: t('Build the rows one at a time: each entry is the sum of the two above it.', 'Construis les rangées une à une : chaque entrée est la somme des deux au-dessus.'),
    };
  }
  const a = randInt(r, 1, 4), ans = choose(n, k) * a ** (n - k);
  return {
    prompt: bi((f) => f.t(`What is the coefficient of ${f.m(`x^{${f.n(k)}}`)} in the expansion of ${f.m(`(x + ${f.n(a)})^{${f.n(n)}}`)}?`, `Quel est le coefficient de ${f.m(`x^{${f.n(k)}}`)} dans le développement de ${f.m(`(x + ${f.n(a)})^{${f.n(n)}}`)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[choose(n, k), t('Multiply by the constant raised to the matching power: a to the n − k.', 'Multiplie par la constante élevée à la bonne puissance : a à la puissance n − k.'), 1], [choose(n, k) * a ** k, t('The power of the constant is n − k, the number of factors that give the constant.', 'La puissance de la constante est n − k, le nombre de facteurs qui donnent la constante.'), 1], [choose(n, k) * a * (n - k), t('The constant is raised to a power, not multiplied by it.', 'La constante est élevée à une puissance, pas multipliée par elle.'), 1]]),
    steps: [bi((f) => f.t(`The binomial coefficient is the entry from row ${f.N(n)} of Pascal's triangle: ${f.N(choose(n, k))}.`, `Le coefficient binomial est l'entrée de la rangée ${f.N(n)} du triangle de Pascal : ${f.N(choose(n, k))}.`)), bi((f) => f.t(`Multiply by ${f.m(`${f.n(a)}^{${f.n(n - k)}}`)} = ${f.N(a ** (n - k))}: ${f.N(ans)}.`, `Multiplie par ${f.m(`${f.n(a)}^{${f.n(n - k)}}`)} = ${f.N(a ** (n - k))} : ${f.N(ans)}.`))],
    nudge: t('The term is (binomial coefficient) × x^k × a^(n−k).', 'Le terme est (coefficient binomial) × x^k × a^(n−k).'),
  };
});

export const recursive11 = (id: string): Generator => numGen(id, (tier, r) => {
  const t1 = randInt(r, 1, 6), n = tier === 1 ? randInt(r, 4, 6) : randInt(r, 5, 7);
  if (tier === 3) {
    const a = randInt(r, 1, 4), b = randInt(r, 1, 5), c = randInt(r, 1, 3);
    const seq = [a, b]; for (let i = 2; i < n; i++) seq.push(seq[i - 1]! + c * seq[i - 2]!);
    const ans = seq[n - 1]!;
    return {
      prompt: bi((f) => f.t(`A sequence has ${f.m(`t_1 = ${f.n(a)}`)}, ${f.m(`t_2 = ${f.n(b)}`)} and ${f.m(`t_n = t_{n-1} + ${c === 1 ? '' : f.n(c)}t_{n-2}`)}. What is ${f.m(`t_{${f.n(n)}}`)}?`, `Une suite a ${f.m(`t_1 = ${f.n(a)}`)}, ${f.m(`t_2 = ${f.n(b)}`)} et ${f.m(`t_n = t_{n-1} + ${c === 1 ? '' : f.n(c)}t_{n-2}`)}. Que vaut ${f.m(`t_{${f.n(n)}}`)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[seq[n - 2]!, t('That is the previous term. Keep going one more step.', 'C\'est le terme précédent. Continue d\'une étape de plus.'), 1], [seq[n - 1]! + seq[n - 2]!, t('Each term uses the term before it plus the multiplier times the one before that.', 'Chaque terme utilise le terme précédent plus le multiplicateur fois celui d\'avant.'), 1], [seq[n - 1]! - c, t('Check each step: the multiplier c applies to the term two places back.', 'Vérifie chaque étape : le multiplicateur c s\'applique au terme deux places en arrière.'), 1]]),
      steps: [bi((f) => f.t(`The terms are ${seq.map((v) => f.N(v)).join(', ')}.`, `Les termes sont ${seq.map((v) => f.N(v)).join(', ')}.`)), bi((f) => f.t(`So t_${n} = ${f.N(ans)}.`, `Donc t_${n} = ${f.N(ans)}.`))],
      nudge: t('Work out the terms one at a time using the rule.', 'Calcule les termes un à un avec la règle.'),
    };
  }
  const d = tier === 1 ? randInt(r, 2, 5) : nonzero(r, -4, 6), m = tier === 1 ? 1 : pick(r, [1, 2, 3]);
  const seq = [t1]; for (let i = 1; i < n; i++) seq.push(m * seq[i - 1]! + d);
  const ans = seq[n - 1]!;
  return {
    prompt: bi((f) => f.t(`A sequence has ${f.m(`t_1 = ${f.n(t1)}`)} and ${f.m(`t_n = ${m === 1 ? '' : f.n(m)}t_{n-1} ${d < 0 ? '-' : '+'} ${f.n(Math.abs(d))}`)}. What is ${f.m(`t_{${f.n(n)}}`)}?`, `Une suite a ${f.m(`t_1 = ${f.n(t1)}`)} et ${f.m(`t_n = ${m === 1 ? '' : f.n(m)}t_{n-1} ${d < 0 ? '-' : '+'} ${f.n(Math.abs(d))}`)}. Que vaut ${f.m(`t_{${f.n(n)}}`)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[seq[n - 2]!, t('That is the previous term. Keep going one more step.', 'C\'est le terme précédent. Continue d\'une étape de plus.'), 1], [t1 + d * (n - 1), t('When the rule multiplies, the changes are not all equal. Work term by term.', 'Quand la règle multiplie, les variations ne sont pas toutes égales. Avance terme par terme.'), 1], [m * seq[n - 1]! + d, t('That is the next term after the one asked for.', 'C\'est le terme après celui demandé.'), 1]]),
    steps: [bi((f) => f.t(`The terms are ${seq.map((v) => f.N(v)).join(', ')}.`, `Les termes sont ${seq.map((v) => f.N(v)).join(', ')}.`)), bi((f) => f.t(`So t_${n} = ${f.N(ans)}.`, `Donc t_${n} = ${f.N(ans)}.`))],
    nudge: t('Start from t₁ and apply the rule to get each next term.', 'Pars de t₁ et applique la règle pour obtenir chaque terme suivant.'),
  };
});

/** MCR3U.C2: arithmetic sequences and series */
export const arithmetic11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = randInt(r, -8, 20), d = nonzero(r, -6, 9), n = randInt(r, 6, 25);
  const tn = a + (n - 1) * d;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`An arithmetic sequence has first term ${f.N(a)} and common difference ${f.N(d)}. What is term ${f.m(`t_{${f.n(n)}}`)}?`, `Une suite arithmétique a pour premier terme ${f.N(a)} et pour raison ${f.N(d)}. Que vaut le terme ${f.m(`t_{${f.n(n)}}`)} ?`)),
      answer: tn, category: 'KU',
      wrong: wr(tn, [[a + n * d, t('The common difference is added n − 1 times, not n times: t_n = a + (n − 1)d.', 'La raison s\'ajoute n − 1 fois, pas n fois : t_n = a + (n − 1)d.'), 0], [a * n + d, t('The formula is a + (n − 1)d. The first term is not multiplied by n.', 'La formule est a + (n − 1)d. Le premier terme n\'est pas multiplié par n.'), 0], [a + (n - 1) + d, t('The difference d multiplies n − 1: it is not added once.', 'La raison d multiplie n − 1 : elle ne s\'ajoute pas une seule fois.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`t_n = a + (n - 1)d = ${f.n(a)} + (${f.n(n)} - 1)(${f.n(d)})`)}.`, `${f.m(`t_n = a + (n - 1)d = ${f.n(a)} + (${f.n(n)} - 1)(${f.n(d)})`)}.`)), bi((f) => f.t(`${f.m(`t_{${f.n(n)}}`)} = ${f.N(tn)}.`, `${f.m(`t_{${f.n(n)}}`)} = ${f.N(tn)}.`))],
      nudge: t('Use t_n = a + (n − 1)d.', 'Utilise t_n = a + (n − 1)d.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`An arithmetic sequence has first term ${f.N(a)} and common difference ${f.N(d)}. Which term number n equals ${f.N(tn)}?`, `Une suite arithmétique a pour premier terme ${f.N(a)} et pour raison ${f.N(d)}. Quel numéro de terme n vaut ${f.N(tn)} ?`)),
      answer: n, category: 'AP',
      wrong: wr(n, [[r6((tn - a) / d), t('That is n − 1. Add 1 to get the term number.', 'C\'est n − 1. Ajoute 1 pour obtenir le numéro du terme.'), 1], [r6((tn + a) / d + 1), t('Subtract the first term: tn − a = (n − 1)d.', 'Soustrais le premier terme : tn − a = (n − 1)d.'), 1], [r6((tn - a) / d + 2), t('Check by putting your n back into the formula.', 'Vérifie en remplaçant ton n dans la formule.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(tn)} = ${f.n(a)} + (n - 1)(${f.n(d)})`)}, so ${f.m(`(n - 1)(${f.n(d)}) = ${f.n(tn - a)}`)}.`, `${f.m(`${f.n(tn)} = ${f.n(a)} + (n - 1)(${f.n(d)})`)}, donc ${f.m(`(n - 1)(${f.n(d)}) = ${f.n(tn - a)}`)}.`)), bi((f) => f.t(`${f.m(`n - 1 = ${f.n((tn - a) / d)}`)}, so n = ${f.N(n)}.`, `${f.m(`n - 1 = ${f.n((tn - a) / d)}`)}, donc n = ${f.N(n)}.`))],
      nudge: t('Put the value into t_n = a + (n − 1)d and solve for n.', 'Remplace la valeur dans t_n = a + (n − 1)d et résous pour n.'),
    };
  }
  const S = (n * (2 * a + (n - 1) * d)) / 2;
  return {
    prompt: bi((f) => f.t(`An arithmetic series has first term ${f.N(a)} and common difference ${f.N(d)}. What is the sum of the first ${f.N(n)} terms?`, `Une série arithmétique a pour premier terme ${f.N(a)} et pour raison ${f.N(d)}. Quelle est la somme des ${f.N(n)} premiers termes ?`)),
    answer: S, category: 'AP',
    wrong: wr(S, [[n * tn, t('Average the first and last term, then multiply by n: S = n(a + t_n) ÷ 2.', 'Fais la moyenne du premier et du dernier terme, puis multiplie par n : S = n(a + t_n) ÷ 2.'), 1], [(n * (2 * a + n * d)) / 2, t('The last term uses n − 1 differences: S = n(2a + (n − 1)d) ÷ 2.', 'Le dernier terme utilise n − 1 raisons : S = n(2a + (n − 1)d) ÷ 2.'), 1], [n * (a + tn), t('Divide by 2: S = n(a + t_n) ÷ 2.', 'Divise par 2 : S = n(a + t_n) ÷ 2.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`t_{${f.n(n)}} = ${f.n(a)} + (${f.n(n)} - 1)(${f.n(d)})`)} = ${f.N(tn)}.`, `${f.m(`t_{${f.n(n)}} = ${f.n(a)} + (${f.n(n)} - 1)(${f.n(d)})`)} = ${f.N(tn)}.`)), bi((f) => f.t(`${f.m(`S_{${f.n(n)}} = \\frac{${f.n(n)}(${f.n(a)} + ${tn < 0 ? `(${f.n(tn)})` : f.n(tn)})}{2}`)} = ${f.N(S)}.`, `${f.m(`S_{${f.n(n)}} = \\frac{${f.n(n)}(${f.n(a)} + ${tn < 0 ? `(${f.n(tn)})` : f.n(tn)})}{2}`)} = ${f.N(S)}.`))],
    nudge: t('Use S = n(a + t_n) ÷ 2, or S = n(2a + (n − 1)d) ÷ 2.', 'Utilise S = n(a + t_n) ÷ 2, ou S = n(2a + (n − 1)d) ÷ 2.'),
  };
});

/** MCR3U.C2: geometric sequences and series */
export const geometric11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = randInt(r, 1, 6), ratio = pick(r, [2, 3, -2, 0.5]), n = randInt(r, 4, 7);
  const aa = ratio === 0.5 ? a * 2 ** (n - 1) : a;
  const tn = r6(aa * ratio ** (n - 1));
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A geometric sequence has first term ${f.N(aa)} and common ratio ${f.N(ratio)}. What is term ${f.m(`t_{${f.n(n)}}`)}?`, `Une suite géométrique a pour premier terme ${f.N(aa)} et pour raison ${f.N(ratio)}. Que vaut le terme ${f.m(`t_{${f.n(n)}}`)} ?`)),
      answer: tn, category: 'KU',
      wrong: wr(tn, [[r6(aa * ratio ** n), t('The ratio is applied n − 1 times: t_n = a r^(n−1).', 'La raison s\'applique n − 1 fois : t_n = a r^(n−1).'), 0], [r6(aa * ratio * (n - 1)), t('The ratio is a power, not a multiplier by n − 1: it multiplies again and again.', 'La raison est une puissance, pas un multiplicateur par n − 1 : elle multiplie encore et encore.'), 0], [r6((aa * ratio) ** (n - 1)), t('Only r is raised to the power n − 1, not a × r.', 'Seule r est élevée à la puissance n − 1, pas a × r.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`t_n = a r^{n-1} = ${f.n(aa)}(${f.n(ratio)})^{${f.n(n - 1)}}`)}.`, `${f.m(`t_n = a r^{n-1} = ${f.n(aa)}(${f.n(ratio)})^{${f.n(n - 1)}}`)}.`)), bi((f) => f.t(`${f.m(`t_{${f.n(n)}}`)} = ${f.N(tn)}.`, `${f.m(`t_{${f.n(n)}}`)} = ${f.N(tn)}.`))],
      nudge: t('Use t_n = a r^(n−1).', 'Utilise t_n = a r^(n−1).'),
    };
  }
  const q = pick(r, [2, 3]), a2 = randInt(r, 1, 5), m = randInt(r, 4, 7);
  if (tier === 2) {
    const S = (a2 * (q ** m - 1)) / (q - 1);
    return {
      prompt: bi((f) => f.t(`A geometric series has first term ${f.N(a2)} and common ratio ${f.N(q)}. What is the sum of the first ${f.N(m)} terms?`, `Une série géométrique a pour premier terme ${f.N(a2)} et pour raison ${f.N(q)}. Quelle est la somme des ${f.N(m)} premiers termes ?`)),
      answer: S, category: 'AP',
      wrong: wr(S, [[a2 * q ** m, t('That is one term too far. Use S = a(rⁿ − 1) ÷ (r − 1).', 'C\'est un terme de trop. Utilise S = a(rⁿ − 1) ÷ (r − 1).'), 1], [(a2 * (q ** m - 1)), t('Divide by r − 1 as well.', 'Divise aussi par r − 1.'), 1], [(a2 * (q ** (m - 1) - 1)) / (q - 1), t('The exponent in the formula is n, the number of terms.', 'L\'exposant dans la formule est n, le nombre de termes.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`S_{${f.n(m)}} = \\frac{${f.n(a2)}(${f.n(q)}^{${f.n(m)}} - 1)}{${f.n(q)} - 1}`)}.`, `${f.m(`S_{${f.n(m)}} = \\frac{${f.n(a2)}(${f.n(q)}^{${f.n(m)}} - 1)}{${f.n(q)} - 1}`)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(a2)} \\times ${f.n(q ** m - 1)}}{${f.n(q - 1)}}`)} = ${f.N(S)}.`, `${f.m(`\\frac{${f.n(a2)} \\times ${f.n(q ** m - 1)}}{${f.n(q - 1)}}`)} = ${f.N(S)}.`))],
      nudge: t('Use S = a(rⁿ − 1) ÷ (r − 1).', 'Utilise S = a(rⁿ − 1) ÷ (r − 1).'),
    };
  }
  const terms = [a2 * 3, a2 * 3 * q, a2 * 3 * q * q], nn = randInt(r, 5, 8), ans = a2 * 3 * q ** (nn - 1);
  return {
    prompt: bi((f) => f.t(`The terms ${terms.map((v) => f.N(v)).join(', ')}, … form a geometric sequence. What is term ${f.m(`t_{${f.n(nn)}}`)}?`, `Les termes ${terms.map((v) => f.N(v)).join(', ')}, … forment une suite géométrique. Que vaut le terme ${f.m(`t_{${f.n(nn)}}`)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[a2 * 3 * q ** nn, t('Count the terms again: the first term is t₁, with no multiplication by r.', 'Recompte les termes : le premier terme est t₁, sans multiplication par r.'), 1], [a2 * 3 + q * (nn - 1), t('A geometric sequence multiplies by the ratio; it does not add.', 'Une suite géométrique multiplie par la raison ; elle n\'additionne pas.'), 1], [terms[2]! * (nn - 2), t('The ratio is applied again and again, so the terms grow by a power, not a constant multiple.', 'La raison s\'applique encore et encore : les termes croissent selon une puissance, pas selon un multiple constant.'), 1]]),
    steps: [bi((f) => f.t(`The ratio is ${f.m(`${f.n(terms[1]!)} \\div ${f.n(terms[0]!)}`)} = ${f.N(q)}.`, `La raison est ${f.m(`${f.n(terms[1]!)} \\div ${f.n(terms[0]!)}`)} = ${f.N(q)}.`)), bi((f) => f.t(`${f.m(`t_{${f.n(nn)}} = ${f.n(terms[0]!)} \\times ${f.n(q)}^{${f.n(nn - 1)}}`)} = ${f.N(ans)}.`, `${f.m(`t_{${f.n(nn)}} = ${f.n(terms[0]!)} \\times ${f.n(q)}^{${f.n(nn - 1)}}`)} = ${f.N(ans)}.`))],
    nudge: t('Divide a term by the one before it to find the ratio, then use t_n = a r^(n−1).', 'Divise un terme par le précédent pour trouver la raison, puis utilise t_n = a r^(n−1).'),
  };
});

// ── finance ─────────────────────────────────────────────────────────────────────

/** MCR3U.C3: compound interest */
export const compound11 = (id: string): Generator => numGen(id, (tier, r) => {
  const P = randInt(r, 1, 9) * 1000, rate = pick(r, [10, 20]), years = randInt(r, 2, 3);
  if (tier === 1) {
    const A = r6(P * (1 + rate / 100) ** years);
    return {
      prompt: bi((f) => f.t(`${money(f, P)} is invested at ${f.m(`${f.n(rate)}\\%`)} per year, compounded annually. What is the value after ${f.N(years)} years, in dollars?`, `${money(f, P)} sont investis à ${f.m(`${f.n(rate)}\\%`)} par an, composé annuellement. Quelle est la valeur après ${f.N(years)} ans, en dollars ?`)),
      answer: A, category: 'AP',
      wrong: wr(A, [[r6(P * (1 + (rate / 100) * years)), t('That is simple interest. With compound interest each year\'s interest also earns interest: A = P(1 + i)ⁿ.', 'C\'est l\'intérêt simple. Avec l\'intérêt composé, l\'intérêt de chaque année rapporte aussi des intérêts : A = P(1 + i)ⁿ.'), 1], [r6(P * (rate / 100) ** years), t('The growth factor is 1 + i, not i.', 'Le facteur de croissance est 1 + i, pas i.'), 1], [r6(P * (1 + rate / 100) ** (years + 1)), t('The exponent is the number of compounding periods, here the number of years.', 'L\'exposant est le nombre de périodes de composition, ici le nombre d\'années.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`A = P(1 + i)^{n} = ${f.n(P)}(1 + ${f.n(rate / 100)})^{${f.n(years)}}`)}.`, `${f.m(`A = P(1 + i)^{n} = ${f.n(P)}(1 + ${f.n(rate / 100)})^{${f.n(years)}}`)}.`)), bi((f) => f.t(`The value is ${money(f, A)}.`, `La valeur est ${money(f, A)}.`))],
      nudge: t('Use A = P(1 + i)ⁿ with the yearly rate and the number of years.', 'Utilise A = P(1 + i)ⁿ avec le taux annuel et le nombre d\'années.'),
    };
  }
  if (tier === 2) {
    const per = pick(r, [2, 4]), rt = pick(r, [10, 20, 40]), yrs = 1, n = per * yrs, i = rt / per / 100;
    const A = Math.round(P * (1 + i) ** n * 100) / 100;
    const iStr = String(r6(i));
    return {
      prompt: bi((f) => f.t(`${money(f, P)} is invested at ${f.m(`${f.n(rt)}\\%`)} per year, compounded ${per === 2 ? 'semi-annually' : 'quarterly'}. What is the value after ${f.N(yrs)} year, in dollars, to the nearest cent?`, `${money(f, P)} sont investis à ${f.m(`${f.n(rt)}\\%`)} par an, composé ${per === 2 ? 'semestriellement' : 'trimestriellement'}. Quelle est la valeur après ${f.N(yrs)} an, en dollars, au cent près ?`)),
      answer: A, tolerance: 0.011, category: 'AP',
      wrong: wr(A, [[r6(P * (1 + rt / 100)), t('The rate per period is the yearly rate divided by the number of periods per year, and the exponent is the number of periods.', 'Le taux par période est le taux annuel divisé par le nombre de périodes par an, et l\'exposant est le nombre de périodes.'), 1], [r6(P * (1 + i) ** yrs), t('The exponent is the number of compounding periods (periods per year × years), not only the years.', 'L\'exposant est le nombre de périodes de composition (périodes par an × années), pas seulement les années.'), 1], [r6(P * (1 + rt / 100 * per) ** yrs), t('Divide the yearly rate by the number of periods, do not multiply.', 'Divise le taux annuel par le nombre de périodes, ne le multiplie pas.'), 1]]),
      steps: [bi((f) => f.t(`Rate per period: ${f.m(`${f.n(rt)}\\% \\div ${f.n(per)}`)} = ${f.N(r6(rt / per))}%. Number of periods: ${f.N(n)}.`, `Taux par période : ${f.m(`${f.n(rt)}\\% \\div ${f.n(per)}`)} = ${f.N(r6(rt / per))} %. Nombre de périodes : ${f.N(n)}.`)), bi((f) => f.t(`${f.m(`A = ${f.n(P)}(1 + ${iStr})^{${f.n(n)}}`)} = ${money(f, A)}.`, `${f.m(`A = ${f.n(P)}(1 + ${iStr})^{${f.n(n)}}`)} = ${money(f, A)}.`))],
      nudge: t('Divide the rate by the periods per year, and multiply the years by the periods per year.', 'Divise le taux par le nombre de périodes par an et multiplie les années par le nombre de périodes par an.'),
    };
  }
  const n = randInt(r, 2, 4), A = r6(P * 1.1 ** n);
  return {
    prompt: bi((f) => f.t(`${money(f, P)} grows to ${money(f, A)} at ${f.m('10\\%')} per year, compounded annually. For how many years was it invested?`, `${money(f, P)} deviennent ${money(f, A)} à ${f.m('10\\%')} par an, composé annuellement. Pendant combien d'années a-t-il été investi ?`)),
    answer: n, category: 'TH',
    wrong: wr(n, [[r6((A - P) / (P * 0.1)), t('That assumes simple interest. With compounding, the growth factor 1.1 is raised to a power.', 'Cela suppose un intérêt simple. Avec la composition, le facteur de croissance 1,1 est élevé à une puissance.'), 1], [n + 1, t('Check by computing P(1.1)ⁿ for your n.', 'Vérifie en calculant P(1,1)ⁿ pour ton n.'), 1], [n - 1, t('Check by computing P(1.1)ⁿ for your n.', 'Vérifie en calculant P(1,1)ⁿ pour ton n.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`\\frac{${f.n(A)}}{${f.n(P)}} = 1.1^{n}`)}, so ${f.m(`1.1^{n} = ${f.n(r6(A / P))}`)}.`, `${f.m(`\\frac{${f.n(A)}}{${f.n(P)}} = 1.1^{n}`)}, donc ${f.m(`1.1^{n} = ${f.n(r6(A / P))}`)}.`)), bi((f) => f.t(`Try powers of 1.1 (1.1, 1.21, 1.331, ...). It matches n = ${f.N(n)}.`, `Essaie les puissances de 1,1 (1,1, 1,21, 1,331, ...). Cela correspond à n = ${f.N(n)}.`))],
    nudge: t('Divide the final amount by the principal to get the growth factor, then find which power of 1.1 gives it.', 'Divise le montant final par le capital pour obtenir le facteur de croissance, puis trouve quelle puissance de 1,1 le donne.'),
  };
});

/** MCR3U.C4: ordinary simple annuities */
export const annuity11 = (id: string): Generator => numGen(id, (tier, r) => {
  const R = randInt(r, 1, 9) * 100, n = randInt(r, 2, 4), i = 0.1, factor = r6(((1 + i) ** n - 1) / i);
  const FV = r6(R * factor);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`${money(f, R)} is deposited at the end of each year for ${f.N(n)} years, earning ${f.m('10\\%')} per year compounded annually. What is the future value of the annuity, in dollars?`, `${money(f, R)} sont déposés à la fin de chaque année pendant ${f.N(n)} ans, au taux de ${f.m('10\\%')} par an composé annuellement. Quelle est la valeur future de la rente, en dollars ?`)),
      answer: FV, category: 'AP',
      wrong: wr(FV, [[R * n, t('That ignores the interest earned. Use FV = R((1 + i)ⁿ − 1) ÷ i.', 'Cela ignore les intérêts gagnés. Utilise FV = R((1 + i)ⁿ − 1) ÷ i.'), 1], [r6(R * 1.1 ** n), t('That is one deposit growing for n years. Each deposit grows for a different time, so add them with the annuity formula.', 'C\'est un seul dépôt qui croît pendant n ans. Chaque dépôt croît pendant une durée différente : additionne-les avec la formule de la rente.'), 1], [r6(R * (1.1 ** n - 1)), t('Divide by i as well: FV = R((1 + i)ⁿ − 1) ÷ i.', 'Divise aussi par i : FV = R((1 + i)ⁿ − 1) ÷ i.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`FV = R\\frac{(1 + i)^{n} - 1}{i} = ${f.n(R)}\\frac{1.1^{${f.n(n)}} - 1}{0.1}`)}.`, `${f.m(`FV = R\\frac{(1 + i)^{n} - 1}{i} = ${f.n(R)}\\frac{1.1^{${f.n(n)}} - 1}{0.1}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(R)} \\times ${f.n(factor)}`)} = ${money(f, FV)}.`, `${f.m(`${f.n(R)} \\times ${f.n(factor)}`)} = ${money(f, FV)}.`))],
      nudge: t('Use FV = R((1 + i)ⁿ − 1) ÷ i.', 'Utilise FV = R((1 + i)ⁿ − 1) ÷ i.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A savings plan has a future value of ${money(f, FV)} after ${f.N(n)} years at ${f.m('10\\%')} per year compounded annually, with equal payments at the end of each year. What is each payment, in dollars?`, `Un plan d'épargne a une valeur future de ${money(f, FV)} après ${f.N(n)} ans à ${f.m('10\\%')} par an composé annuellement, avec des versements égaux à la fin de chaque année. Quel est chaque versement, en dollars ?`)),
      answer: R, category: 'AP',
      wrong: wr(R, [[r6(FV / n), t('That ignores the interest. Solve FV = R((1 + i)ⁿ − 1) ÷ i for R.', 'Cela ignore les intérêts. Résous FV = R((1 + i)ⁿ − 1) ÷ i pour R.'), 1], [r6(FV * factor), t('Divide by the annuity factor; do not multiply.', 'Divise par le facteur de la rente ; ne multiplie pas.'), 1], [r6(FV / 1.1 ** n), t('That is the present value of one lump sum, not the payment.', 'C\'est la valeur actuelle d\'une somme unique, pas le versement.'), 1]]),
      steps: [bi((f) => f.t(`The annuity factor is ${f.m(`\\frac{1.1^{${f.n(n)}} - 1}{0.1}`)} = ${f.N(factor)}.`, `Le facteur de la rente est ${f.m(`\\frac{1.1^{${f.n(n)}} - 1}{0.1}`)} = ${f.N(factor)}.`)), bi((f) => f.t(`${f.m(`R = ${f.n(FV)} \\div ${f.n(factor)}`)} = ${money(f, R)}.`, `${f.m(`R = ${f.n(FV)} \\div ${f.n(factor)}`)} = ${money(f, R)}.`))],
      nudge: t('Rearrange the future value formula to R = FV × i ÷ ((1 + i)ⁿ − 1).', 'Réarrange la formule de la valeur future en R = FV × i ÷ ((1 + i)ⁿ − 1).'),
    };
  }
  const pvFactor = r6((1 - 1.1 ** -n) / i), PV = r6(R * pvFactor);
  return {
    prompt: bi((f) => f.t(`A loan is repaid with ${money(f, R)} at the end of each year for ${f.N(n)} years, at ${f.m('10\\%')} per year compounded annually. What is the present value of the payments, in dollars, to the nearest cent?`, `Un prêt est remboursé par ${money(f, R)} à la fin de chaque année pendant ${f.N(n)} ans, à ${f.m('10\\%')} par an composé annuellement. Quelle est la valeur actuelle des versements, en dollars, au cent près ?`)),
    answer: Math.round(PV * 100) / 100, tolerance: 0.011, category: 'AP',
    wrong: wr(Math.round(PV * 100) / 100, [[FV, t('That is the future value. The present value discounts the payments back to today: PV = R(1 − (1 + i)⁻ⁿ) ÷ i.', 'C\'est la valeur future. La valeur actuelle ramène les versements à aujourd\'hui : PV = R(1 − (1 + i)⁻ⁿ) ÷ i.'), 1], [R * n, t('That adds the payments without discounting them for time.', 'Cela additionne les versements sans les actualiser dans le temps.'), 1], [r6(R / 1.1 ** n), t('That discounts only one payment. Each payment is discounted by a different amount.', 'Cela n\'actualise qu\'un seul versement. Chaque versement est actualisé d\'un montant différent.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`PV = R\\frac{1 - (1 + i)^{-n}}{i} = ${f.n(R)}\\frac{1 - 1.1^{-${f.n(n)}}}{0.1}`)}.`, `${f.m(`PV = R\\frac{1 - (1 + i)^{-n}}{i} = ${f.n(R)}\\frac{1 - 1.1^{-${f.n(n)}}}{0.1}`)}.`)), bi((f) => f.t(`The present value is about ${money(f, Math.round(PV * 100) / 100)}.`, `La valeur actuelle est d'environ ${money(f, Math.round(PV * 100) / 100)}.`))],
    nudge: t('Use PV = R(1 − (1 + i)⁻ⁿ) ÷ i, and round to the nearest cent.', 'Utilise PV = R(1 − (1 + i)⁻ⁿ) ÷ i et arrondis au cent près.'),
  };
});
