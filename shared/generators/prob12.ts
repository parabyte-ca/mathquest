// Grade 12 (MDM4U) Counting and Probability and Probability Distributions: probability rules, conditional probability, permutations and
// combinations, Pascal's triangle, expected value, binomial and hypergeometric distributions, and the normal distribution. Numbers are
// chosen so every answer is exact (a whole number or a terminating decimal).
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const same = (en: string, fr: string): Text => t(en, fr);
export const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
export const nPr = (n: number, k: number): number => fact(n) / fact(n - k);
export const nCr = (n: number, k: number): number => fact(n) / (fact(k) * fact(n - k));

/** MDM4U.A1: the rules of probability: complement, union, independent events */
export const probRules12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const p = randInt(r, 1, 19) * 0.05, ans = r6(1 - p);
    return {
      prompt: bi((f) => f.t(`The probability that it rains tomorrow is ${f.N(r6(p))}. What is the probability that it does not rain?`, `La probabilité qu'il pleuve demain est de ${f.N(r6(p))}. Quelle est la probabilité qu'il ne pleuve pas ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(p), same('That is the probability it does rain. The question asks for the complement.', 'C\'est la probabilité qu\'il pleuve. La question demande le complément.'), 0], [r6(-p), same('A probability is never negative. The complement is 1 minus the probability.', 'Une probabilité n\'est jamais négative. Le complément égale 1 moins la probabilité.'), 1]]),
      steps: [same('The probabilities of an event and its complement add to 1.', 'Les probabilités d\'un événement et de son complément ont pour somme 1.'), bi((f) => f.t(`${f.m(`1 - ${f.n(r6(p))}`)} = ${f.N(ans)}.`, `${f.m(`1 - ${f.n(r6(p))}`)} = ${f.N(ans)}.`))],
      nudge: same('Subtract the probability from 1.', 'Soustrais la probabilité de 1.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 3, 12) * 0.05, b = randInt(r, 3, 12) * 0.05, both = randInt(r, 1, Math.floor(Math.min(a, b) / 0.05) - 1) * 0.05, ans = r6(a + b - both);
    return {
      prompt: bi((f) => f.t(`For two events, ${f.m(`P(A) = ${f.n(r6(a))}`)}, ${f.m(`P(B) = ${f.n(r6(b))}`)} and ${f.m(`P(A \\text{ and } B) = ${f.n(r6(both))}`)}. Find ${f.m('P(A \\text{ or } B)')}.`, `Pour deux événements, ${f.m(`P(A) = ${f.n(r6(a))}`)}, ${f.m(`P(B) = ${f.n(r6(b))}`)} et ${f.m(`P(A \\text{ et } B) = ${f.n(r6(both))}`)}. Trouve ${f.m('P(A \\text{ ou } B)')}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(a + b), same('Subtract the overlap, which would otherwise be counted twice.', 'Soustrais le chevauchement, qui serait sinon compté deux fois.'), 1], [r6(a + b + both), same('The overlap is subtracted, not added.', 'Le chevauchement se soustrait, il ne s\'ajoute pas.'), 1], [r6(a * b), same('That is for independent events and "and". For "or", add and subtract the overlap.', 'C\'est pour des événements indépendants et « et ». Pour « ou », additionne et soustrais le chevauchement.'), 0]]),
      steps: [same('P(A or B) = P(A) + P(B) − P(A and B).', 'P(A ou B) = P(A) + P(B) − P(A et B).'), bi((f) => f.t(`${f.m(`${f.n(r6(a))} + ${f.n(r6(b))} - ${f.n(r6(both))}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(r6(a))} + ${f.n(r6(b))} - ${f.n(r6(both))}`)} = ${f.N(ans)}.`))],
      nudge: same('Add the two probabilities, then subtract the part counted twice.', 'Additionne les deux probabilités, puis soustrais la partie comptée deux fois.'),
    };
  }
  const a = randInt(r, 2, 9) * 0.1, b = randInt(r, 2, 9) * 0.1, ans = r6(a + b - a * b);
  return {
    prompt: bi((f) => f.t(`Two independent events have ${f.m(`P(A) = ${f.n(r6(a))}`)} and ${f.m(`P(B) = ${f.n(r6(b))}`)}. What is the probability that at least one of them happens?`, `Deux événements indépendants ont ${f.m(`P(A) = ${f.n(r6(a))}`)} et ${f.m(`P(B) = ${f.n(r6(b))}`)}. Quelle est la probabilité qu'au moins l'un des deux se produise ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(a * b), same('That is the probability that both happen.', 'C\'est la probabilité que les deux se produisent.'), 0], [r6(a + b), same('Subtract P(A and B), which for independent events is P(A) times P(B).', 'Soustrais P(A et B), qui pour des événements indépendants égale P(A) fois P(B).'), 1], [r6(1 - a * b), same('That is the probability that they do not both happen.', 'C\'est la probabilité qu\'ils ne se produisent pas tous les deux.'), 1]]),
    steps: [bi((f) => f.t(`For independent events ${f.m('P(A \\text{ and } B) = P(A)P(B)')} = ${f.N(r6(a * b))}.`, `Pour des événements indépendants ${f.m('P(A \\text{ et } B) = P(A)P(B)')} = ${f.N(r6(a * b))}.`)), bi((f) => f.t(`${f.m(`P(A \\text{ or } B) = ${f.n(r6(a))} + ${f.n(r6(b))} - ${f.n(r6(a * b))}`)} = ${f.N(ans)}.`, `${f.m(`P(A \\text{ ou } B) = ${f.n(r6(a))} + ${f.n(r6(b))} - ${f.n(r6(a * b))}`)} = ${f.N(ans)}.`))],
    nudge: same('Find P(A and B) by multiplying, then use P(A) + P(B) − P(A and B).', 'Trouve P(A et B) en multipliant, puis utilise P(A) + P(B) − P(A et B).'),
  };
});

/** MDM4U.A1: conditional probability and dependent events */
export const conditional12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier <= 2) {
    const pb = randInt(r, 4, 10) * 0.1, k = randInt(r, 1, Math.round(pb * 10) - 1) * 0.1, ans = r6(k / pb);
    if (tier === 1) {
      return {
        prompt: bi((f) => f.t(`${f.m(`P(B) = ${f.n(r6(pb))}`)} and ${f.m(`P(A \\text{ and } B) = ${f.n(r6(k))}`)}. Find ${f.m('P(A \\mid B)')}.`, `${f.m(`P(B) = ${f.n(r6(pb))}`)} et ${f.m(`P(A \\text{ et } B) = ${f.n(r6(k))}`)}. Trouve ${f.m('P(A \\mid B)')}.`)),
        answer: ans, tolerance: 0.0001, category: 'KU',
        wrong: wr(ans, [[r6(k * pb), same('Conditional probability divides: P(A and B) over P(B).', 'La probabilité conditionnelle se calcule par division : P(A et B) sur P(B).'), 1], [r6(pb / k), same('Put P(A and B) on top.', 'Mets P(A et B) en haut.'), 1]]),
        steps: [same('P(A | B) = P(A and B) ÷ P(B).', 'P(A | B) = P(A et B) ÷ P(B).'), bi((f) => f.t(`${f.m(`\\frac{${f.n(r6(k))}}{${f.n(r6(pb))}}`)} ≈ ${f.N(r6(ans))}.`, `${f.m(`\\frac{${f.n(r6(k))}}{${f.n(r6(pb))}}`)} ≈ ${f.N(r6(ans))}.`))],
        nudge: same('Divide the probability of both by the probability of the given event.', 'Divise la probabilité des deux par la probabilité de l\'événement donné.'),
      };
    }
    const cond = randInt(r, 1, 9) * 0.1, pbb = randInt(r, 2, 10) * 0.1, out = r6(cond * pbb);
    return {
      prompt: bi((f) => f.t(`${f.m(`P(B) = ${f.n(r6(pbb))}`)} and ${f.m(`P(A \\mid B) = ${f.n(r6(cond))}`)}. Find ${f.m('P(A \\text{ and } B)')}.`, `${f.m(`P(B) = ${f.n(r6(pbb))}`)} et ${f.m(`P(A \\mid B) = ${f.n(r6(cond))}`)}. Trouve ${f.m('P(A \\text{ et } B)')}.`)),
      answer: out, category: 'AP',
      wrong: wr(out, [[r6(cond / pbb), same('Multiply: P(A and B) = P(B) × P(A | B).', 'Multiplie : P(A et B) = P(B) × P(A | B).'), 1], [r6(cond + pbb), same('Multiply the probabilities; do not add them.', 'Multiplie les probabilités ; ne les additionne pas.'), 1]]),
      steps: [same('P(A and B) = P(B) × P(A | B).', 'P(A et B) = P(B) × P(A | B).'), bi((f) => f.t(`${f.m(`${f.n(r6(pbb))} \\times ${f.n(r6(cond))}`)} = ${f.N(out)}.`, `${f.m(`${f.n(r6(pbb))} \\times ${f.n(r6(cond))}`)} = ${f.N(out)}.`))],
      nudge: same('Multiply the probability of B by the conditional probability.', 'Multiplie la probabilité de B par la probabilité conditionnelle.'),
    };
  }
  const [n, red] = pick(r, [[5, 2], [5, 3], [5, 4], [6, 3], [6, 4]] as [number, number][]), ans = r6((red / n) * ((red - 1) / (n - 1)));
  return {
    prompt: bi((f) => f.t(`A bag has ${f.N(red)} red and ${f.N(n - red)} blue marbles. Two are drawn without replacement. What is the probability that both are red?`, `Un sac contient ${f.N(red)} billes rouges et ${f.N(n - red)} billes bleues. On en tire deux sans remise. Quelle est la probabilité que les deux soient rouges ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6((red / n) ** 2), same('Without replacement, the second draw has one fewer red marble and one fewer marble in all.', 'Sans remise, le deuxième tirage compte une bille rouge de moins et une bille de moins en tout.'), 1], [r6(red / n), same('That is the probability of one red marble. Multiply by the probability for the second.', 'C\'est la probabilité d\'une bille rouge. Multiplie par la probabilité du deuxième tirage.'), 0]]),
    steps: [bi((f) => f.t(`First red: ${f.m(`\\frac{${f.n(red)}}{${f.n(n)}}`)}. Second red, given the first was red: ${f.m(`\\frac{${f.n(red - 1)}}{${f.n(n - 1)}}`)}.`, `Première rouge : ${f.m(`\\frac{${f.n(red)}}{${f.n(n)}}`)}. Deuxième rouge, sachant que la première l'était : ${f.m(`\\frac{${f.n(red - 1)}}{${f.n(n - 1)}}`)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(red)}}{${f.n(n)}} \\times \\frac{${f.n(red - 1)}}{${f.n(n - 1)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(red)}}{${f.n(n)}} \\times \\frac{${f.n(red - 1)}}{${f.n(n - 1)}}`)} = ${f.N(ans)}.`))],
    nudge: same('Multiply the first probability by the probability for the second draw, with one fewer of each.', 'Multiplie la première probabilité par celle du deuxième tirage, avec une bille de moins de chaque sorte.'),
  };
});

/** MDM4U.A2: permutations and combinations */
export const counting12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const n = randInt(r, 5, 9), k = randInt(r, 2, 4), perm = r() < 0.5, ans = perm ? nPr(n, k) : nCr(n, k);
    const sym = perm ? `\\text{P}(${n}, ${k})` : `\\text{C}(${n}, ${k})`;
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(sym)}.`, `Évalue ${f.m(sym)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[perm ? nCr(n, k) : nPr(n, k), same(perm ? 'Order matters for a permutation, so do not divide by k factorial.' : 'Order does not matter for a combination: divide the permutations by k factorial.', perm ? 'L\'ordre compte pour un arrangement : ne divise pas par k factorielle.' : 'L\'ordre ne compte pas pour une combinaison : divise le nombre d\'arrangements par k factorielle.'), 1], [fact(n), same('Only k places are filled: nPk = n!/(n − k)!.', 'Seulement k places sont remplies : nPk = n!/(n − k)!.'), 0]]),
      steps: [bi((f) => f.t(perm ? `${f.m(sym)} = ${f.m(`\\frac{${f.n(n)}!}{${f.n(n - k)}!}`)}.` : `${f.m(sym)} = ${f.m(`\\frac{${f.n(n)}!}{${f.n(k)}!\\,${f.n(n - k)}!}`)}.`, perm ? `${f.m(sym)} = ${f.m(`\\frac{${f.n(n)}!}{${f.n(n - k)}!}`)}.` : `${f.m(sym)} = ${f.m(`\\frac{${f.n(n)}!}{${f.n(k)}!\\,${f.n(n - k)}!}`)}.`)), bi((f) => f.t(`The value is ${f.N(ans)}.`, `La valeur est ${f.N(ans)}.`))],
      nudge: same('A permutation counts ordered selections; a combination does not care about order.', 'Un arrangement compte les choix ordonnés ; une combinaison ne tient pas compte de l\'ordre.'),
    };
  }
  if (tier === 2) {
    const kind = pick(r, ['committee', 'letters'] as const);
    if (kind === 'committee') {
      const n = randInt(r, 6, 12), k = randInt(r, 2, 4), ans = nCr(n, k);
      return {
        prompt: bi((f) => f.t(`How many different committees of ${f.N(k)} people can be chosen from ${f.N(n)} people?`, `Combien de comités différents de ${f.N(k)} personnes peut-on former parmi ${f.N(n)} personnes ?`)),
        answer: ans, category: 'AP',
        wrong: wr(ans, [[nPr(n, k), same('The order in a committee does not matter, so use a combination.', 'L\'ordre dans un comité ne compte pas : utilise une combinaison.'), 0], [n ** k, same('Each person can be chosen only once, and order does not matter.', 'Chaque personne ne peut être choisie qu\'une fois, et l\'ordre ne compte pas.'), 0]]),
        steps: [same('The order does not matter, so this is a combination.', 'L\'ordre ne compte pas : c\'est une combinaison.'), bi((f) => f.t(`${f.m(`\\text{C}(${f.n(n)}, ${f.n(k)})`)} = ${f.N(ans)}.`, `${f.m(`\\text{C}(${f.n(n)}, ${f.n(k)})`)} = ${f.N(ans)}.`))],
        nudge: same('Does the order of the people matter? If not, use a combination.', 'L\'ordre des personnes compte-t-il ? Sinon, utilise une combinaison.'),
      };
    }
    const [word, counts] = pick(r, [['LEVEL', [2, 2, 1]], ['BANANA', [1, 3, 2]], ['SEEDS', [2, 2, 1]], ['ALOOF', [1, 1, 2, 1]], ['TOOTH', [2, 2, 1]], ['PEPPER', [3, 2, 1]]] as [string, number[]][]);
    const total = counts.reduce((a, b) => a + b, 0), ans = fact(total) / counts.reduce((p, c) => p * fact(c), 1);
    return {
      prompt: bi((f) => f.t(`How many different arrangements of the letters of the word ${word} are there?`, `Combien d'arrangements différents des lettres du mot ${word} y a-t-il ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[fact(total), same('Some letters are the same, so divide by the factorial of each repeated count.', 'Certaines lettres sont identiques : divise par la factorielle de chaque nombre de répétitions.'), 0], [ans * 2, same('Check which letters repeat and how many times.', 'Vérifie quelles lettres se répètent et combien de fois.'), 0]]),
      steps: [bi((f) => f.t(`There are ${f.N(total)} letters, with repeats ${counts.filter((c) => c > 1).map((c) => `${f.N(c)}`).join(' and ')}.`, `Il y a ${f.N(total)} lettres, avec des répétitions de ${counts.filter((c) => c > 1).map((c) => `${f.N(c)}`).join(' et ')}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(total)}!}{${counts.filter((c) => c > 1).map((c) => `${f.n(c)}!`).join('\\,')}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(total)}!}{${counts.filter((c) => c > 1).map((c) => `${f.n(c)}!`).join('\\,')}}`)} = ${f.N(ans)}.`))],
      nudge: same('Divide the factorial of all the letters by the factorial of each repeated count.', 'Divise la factorielle de toutes les lettres par la factorielle de chaque nombre de répétitions.'),
    };
  }
  const w = randInt(r, 3, 6), m = randInt(r, 3, 6), a = randInt(r, 2, Math.min(3, w)), b = randInt(r, 2, Math.min(3, m)), ans = nCr(w, a) * nCr(m, b);
  return {
    prompt: bi((f) => f.t(`A club has ${f.N(w)} women and ${f.N(m)} men. How many committees have ${f.N(a)} women and ${f.N(b)} men?`, `Un club compte ${f.N(w)} femmes et ${f.N(m)} hommes. Combien de comités ont ${f.N(a)} femmes et ${f.N(b)} hommes ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[nCr(w, a) + nCr(m, b), same('The choices are made together: multiply the two counts.', 'Les choix se font ensemble : multiplie les deux nombres.'), 1], [nCr(w + m, a + b), same('The committee must have exactly that many women and men, so choose each group separately.', 'Le comité doit avoir exactement ce nombre de femmes et d\'hommes : choisis chaque groupe séparément.'), 0]]),
    steps: [bi((f) => f.t(`Women: ${f.m(`\\text{C}(${f.n(w)}, ${f.n(a)})`)} = ${f.N(nCr(w, a))}. Men: ${f.m(`\\text{C}(${f.n(m)}, ${f.n(b)})`)} = ${f.N(nCr(m, b))}.`, `Femmes : ${f.m(`\\text{C}(${f.n(w)}, ${f.n(a)})`)} = ${f.N(nCr(w, a))}. Hommes : ${f.m(`\\text{C}(${f.n(m)}, ${f.n(b)})`)} = ${f.N(nCr(m, b))}.`)), bi((f) => f.t(`Multiply: ${f.m(`${f.n(nCr(w, a))} \\times ${f.n(nCr(m, b))}`)} = ${f.N(ans)}.`, `Multiplie : ${f.m(`${f.n(nCr(w, a))} \\times ${f.n(nCr(m, b))}`)} = ${f.N(ans)}.`))],
    nudge: same('Choose the women, choose the men, then multiply.', 'Choisis les femmes, choisis les hommes, puis multiplie.'),
  };
});

/** MDM4U.A2: Pascal's triangle and binomial coefficients */
export const pascal12 = (id: string): Generator => numGen(id, (tier, r) => {
  const n = randInt(r, 4, 9), k = randInt(r, 1, n - 1);
  if (tier === 1) {
    const ans = nCr(n, k);
    return {
      prompt: bi((f) => f.t(`In Pascal's triangle, row ${f.N(n)} starts at row 0. What is entry number ${f.N(k)}, counting from entry 0?`, `Dans le triangle de Pascal, la rangée ${f.N(n)} commence à la rangée 0. Quel est le terme numéro ${f.N(k)}, en comptant à partir du terme 0 ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[nCr(n + 1, k), same('Row n starts counting at row 0, so the entry is n choose k.', 'La rangée n commence à la rangée 0 : le terme est n parmi k.'), 0], [nCr(n, k - 1), same('Entry k counts from entry 0, so it is n choose k.', 'Le terme k se compte à partir du terme 0 : c\'est n parmi k.'), 0]]),
      steps: [bi((f) => f.t(`The entry is ${f.m(`\\text{C}(${f.n(n)}, ${f.n(k)})`)}.`, `Le terme est ${f.m(`\\text{C}(${f.n(n)}, ${f.n(k)})`)}.`)), bi((f) => f.t(`That equals ${f.N(ans)}.`, `Cela égale ${f.N(ans)}.`))],
      nudge: same('Row n, entry k is n choose k, counting from 0.', 'Rangée n, terme k est n parmi k, en comptant à partir de 0.'),
    };
  }
  if (tier === 2) {
    const ans = nCr(n + 1, k + 1);
    return {
      prompt: bi((f) => f.t(`Given ${f.m(`\\text{C}(${f.n(n)}, ${f.n(k)}) = ${f.n(nCr(n, k))}`)} and ${f.m(`\\text{C}(${f.n(n)}, ${f.n(k + 1)}) = ${f.n(nCr(n, k + 1))}`)}, find ${f.m(`\\text{C}(${f.n(n + 1)}, ${f.n(k + 1)})`)} using Pascal's identity.`, `Sachant que ${f.m(`\\text{C}(${f.n(n)}, ${f.n(k)}) = ${f.n(nCr(n, k))}`)} et ${f.m(`\\text{C}(${f.n(n)}, ${f.n(k + 1)}) = ${f.n(nCr(n, k + 1))}`)}, trouve ${f.m(`\\text{C}(${f.n(n + 1)}, ${f.n(k + 1)})`)} avec l'identité de Pascal.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[nCr(n, k) * nCr(n, k + 1), same('Add the two entries above; do not multiply.', 'Additionne les deux termes au-dessus ; ne les multiplie pas.'), 1], [nCr(n, k + 1) - nCr(n, k), same('Each entry is the sum of the two above it.', 'Chaque terme est la somme des deux termes au-dessus.'), 1]]),
      steps: [same('Each entry is the sum of the two entries above it.', 'Chaque terme est la somme des deux termes au-dessus.'), bi((f) => f.t(`${f.m(`${f.n(nCr(n, k))} + ${f.n(nCr(n, k + 1))}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(nCr(n, k))} + ${f.n(nCr(n, k + 1))}`)} = ${f.N(ans)}.`))],
      nudge: same('Add the two entries above.', 'Additionne les deux termes au-dessus.'),
    };
  }
  const total = 2 ** n;
  return {
    prompt: bi((f) => f.t(`What is the sum of all the entries in row ${f.N(n)} of Pascal's triangle (row 0 is the top)?`, `Quelle est la somme de tous les termes de la rangée ${f.N(n)} du triangle de Pascal (la rangée 0 est le sommet) ?`)),
    answer: total, category: 'TH',
    wrong: wr(total, [[n * n, same('The row sums double each time: row n adds to 2 to the power n.', 'Les sommes des rangées doublent chaque fois : la rangée n a pour somme 2 à la puissance n.'), 0], [2 * n, same('The sums double with each row, which is a power of 2, not a multiple of n.', 'Les sommes doublent à chaque rangée : c\'est une puissance de 2, et non un multiple de n.'), 0], [2 ** (n + 1), same('Row 0 is the top and adds to 1, so row n adds to 2 to the power n.', 'La rangée 0 est le sommet et a pour somme 1 : la rangée n a pour somme 2 à la puissance n.'), 0]]),
    steps: [same('Each row adds to twice the row above: 1, 2, 4, 8, ...', 'Chaque rangée a pour somme le double de la rangée précédente : 1, 2, 4, 8, ...'), bi((f) => f.t(`Row ${f.N(n)} adds to ${f.m(`2^{${f.n(n)}}`)} = ${f.N(total)}.`, `La rangée ${f.N(n)} a pour somme ${f.m(`2^{${f.n(n)}}`)} = ${f.N(total)}.`))],
    nudge: same('The sums are 1, 2, 4, 8 ... Which power of 2 is row n?', 'Les sommes sont 1, 2, 4, 8 ... Quelle puissance de 2 est la rangée n ?'),
  };
});

/** MDM4U.B1: expected value */
export const expected12 = (id: string): Generator => numGen(id, (tier, r) => {
  const mk = (k: number): { xs: number[]; ps: number[] } => {
    const parts = Array.from({ length: k }, () => randInt(r, 1, 6)), s = parts.reduce((a, b) => a + b, 0);
    const base = Math.floor(20 / s);
    const ps = parts.map((x) => x * base); ps[0]! += 20 - ps.reduce((a, b) => a + b, 0);
    return { xs: Array.from({ length: k }, (_, i) => (i + 1) * pick(r, [1, 2, 3, 5])).sort((a, b) => a - b).map((x, i) => x + i), ps: ps.map((p) => p / 20) };
  };
  if (tier === 1) {
    const { xs, ps } = mk(3), ans = r6(xs.reduce((s, x, i) => s + x * ps[i]!, 0));
    return {
      prompt: bi((f) => f.t(`A random variable X takes the values ${xs.map((x) => f.N(x)).join(', ')} with probabilities ${ps.map((p) => f.N(r6(p))).join(', ')}. What is the expected value E(X)?`, `Une variable aléatoire X prend les valeurs ${xs.map((x) => f.N(x)).join(', ')} avec les probabilités ${ps.map((p) => f.N(r6(p))).join(', ')}. Quelle est l'espérance E(X) ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(xs.reduce((a, b) => a + b, 0) / xs.length), same('Weight each value by its probability. The plain average ignores the probabilities.', 'Pondère chaque valeur par sa probabilité. La moyenne simple ignore les probabilités.'), 0], [r6(xs.reduce((s, x, i) => s + x * ps[i]!, 0) + 1), same('Multiply each value by its probability and add the products.', 'Multiplie chaque valeur par sa probabilité et additionne les produits.'), 1]]),
      steps: [same('E(X) is the sum of each value times its probability.', 'E(X) est la somme de chaque valeur fois sa probabilité.'), bi((f) => f.t(`${f.m(xs.map((x, i) => `${f.n(x)}(${f.n(r6(ps[i]!))})`).join(' + '))} = ${f.N(ans)}.`, `${f.m(xs.map((x, i) => `${f.n(x)}(${f.n(r6(ps[i]!))})`).join(' + '))} = ${f.N(ans)}.`))],
      nudge: same('Multiply each value by its probability, then add.', 'Multiplie chaque valeur par sa probabilité, puis additionne.'),
    };
  }
  if (tier === 2) {
    const prize = randInt(r, 2, 10) * 10, pWin = pick(r, [0.1, 0.2, 0.25, 0.4, 0.5]), cost = randInt(r, 2, 6), ans = r6(prize * pWin - cost);
    return {
      prompt: bi((f) => f.t(`A game costs ${f.N(cost)} dollars to play. You win ${f.N(prize)} dollars (before the cost) with probability ${f.N(pWin)} and nothing otherwise. What is your expected gain per game, in dollars?`, `Un jeu coûte ${f.N(cost)} dollars pour jouer. Tu gagnes ${f.N(prize)} dollars (avant le coût) avec une probabilité de ${f.N(pWin)}, et rien sinon. Quel est ton gain espéré par partie, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(prize * pWin), same('Subtract the cost of playing.', 'Soustrais le coût de la partie.'), 1], [r6(prize * pWin + cost), same('The cost is subtracted from the expected winnings.', 'Le coût se soustrait des gains espérés.'), 1], [r6(prize - cost), same('You only win with a probability; weight the prize by it.', 'Tu ne gagnes qu\'avec une certaine probabilité : pondère le gain par celle-ci.'), 0]]),
      steps: [bi((f) => f.t(`Expected winnings: ${f.m(`${f.n(prize)} \\times ${f.n(pWin)} = ${f.n(r6(prize * pWin))}`)}.`, `Gains espérés : ${f.m(`${f.n(prize)} \\times ${f.n(pWin)} = ${f.n(r6(prize * pWin))}`)}.`)), bi((f) => f.t(`Subtract the cost: ${f.m(`${f.n(r6(prize * pWin))} - ${f.n(cost)}`)} = ${f.N(ans)}.`, `Soustrais le coût : ${f.m(`${f.n(r6(prize * pWin))} - ${f.n(cost)}`)} = ${f.N(ans)}.`))],
      nudge: same('Expected winnings are prize times probability; then take away the cost.', 'Les gains espérés sont le gain fois la probabilité ; puis retire le coût.'),
    };
  }
  const prize = randInt(r, 2, 8) * 10, pWin = pick(r, [0.1, 0.2, 0.25, 0.4, 0.5]), ans = r6(prize * pWin);
  return {
    prompt: bi((f) => f.t(`A game pays ${f.N(prize)} dollars with probability ${f.N(pWin)} and nothing otherwise. What entry fee, in dollars, makes the game fair (an expected gain of zero)?`, `Un jeu verse ${f.N(prize)} dollars avec une probabilité de ${f.N(pWin)}, et rien sinon. Quel droit d'entrée, en dollars, rend le jeu équitable (un gain espéré de zéro) ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[prize, same('You would lose on average if you paid the whole prize. The fair fee is the expected winnings.', 'Tu perdrais en moyenne en payant tout le gain. Le droit équitable égale les gains espérés.'), 0], [r6(prize * (1 - pWin)), same('Use the probability of winning, not of losing.', 'Utilise la probabilité de gagner, et non de perdre.'), 1]]),
    steps: [same('A game is fair when the entry fee equals the expected winnings.', 'Un jeu est équitable quand le droit d\'entrée égale les gains espérés.'), bi((f) => f.t(`${f.m(`${f.n(prize)} \\times ${f.n(pWin)}`)} = ${f.N(ans)} dollars.`, `${f.m(`${f.n(prize)} \\times ${f.n(pWin)}`)} = ${f.N(ans)} dollars.`))],
    nudge: same('The fair fee is the expected value of the winnings.', 'Le droit équitable est la valeur espérée des gains.'),
  };
});

/** MDM4U.B1: binomial distributions (probability one half so every answer is a terminating decimal) */
export const binomial12 = (id: string): Generator => numGen(id, (tier, r) => {
  const n = randInt(r, 3, 6), k = randInt(r, 1, n - 1);
  if (tier === 1) {
    const ans = r6(nCr(n, k) / 2 ** n);
    return {
      prompt: bi((f) => f.t(`A fair coin is tossed ${f.N(n)} times. What is the probability of exactly ${f.N(k)} heads?`, `On lance ${f.N(n)} fois une pièce équilibrée. Quelle est la probabilité d'obtenir exactement ${f.N(k)} faces ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(1 / 2 ** n), same('That is one particular order. Multiply by the number of orders, n choose k.', 'C\'est un seul ordre particulier. Multiplie par le nombre d\'ordres, n parmi k.'), 1], [r6(k / n), same('Use the binomial formula: n choose k times (1/2) to the power n.', 'Utilise la formule binomiale : n parmi k fois (1/2) à la puissance n.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`P(X = ${f.n(k)}) = \\text{C}(${f.n(n)}, ${f.n(k)}) (0.5)^{${f.n(k)}} (0.5)^{${f.n(n - k)}}`)}.`, `${f.m(`P(X = ${f.n(k)}) = \\text{C}(${f.n(n)}, ${f.n(k)}) (0.5)^{${f.n(k)}} (0.5)^{${f.n(n - k)}}`)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(nCr(n, k))}}{${f.n(2 ** n)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(nCr(n, k))}}{${f.n(2 ** n)}}`)} = ${f.N(ans)}.`))],
      nudge: same('Count the ways with n choose k, and multiply by the probability of each way.', 'Compte les façons avec n parmi k, et multiplie par la probabilité de chaque façon.'),
    };
  }
  if (tier === 2) {
    const nn = randInt(r, 10, 60), p = pick(r, [0.1, 0.2, 0.25, 0.4, 0.5]), ans = r6(nn * p);
    return {
      prompt: bi((f) => f.t(`X follows a binomial distribution with ${f.m(`n = ${f.n(nn)}`)} and ${f.m(`p = ${f.n(p)}`)}. What is the expected value E(X)?`, `X suit une loi binomiale avec ${f.m(`n = ${f.n(nn)}`)} et ${f.m(`p = ${f.n(p)}`)}. Quelle est l'espérance E(X) ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(nn * (1 - p)), same('The mean uses the probability of success, p.', 'La moyenne utilise la probabilité de succès, p.'), 0], [r6(nn + p), same('The mean of a binomial is n times p.', 'La moyenne d\'une loi binomiale est n fois p.'), 0], [r6(nn * p * (1 - p)), same('That is the variance. The mean is just np.', 'C\'est la variance. La moyenne est simplement np.'), 0]]),
      steps: [same('For a binomial distribution the expected value is np.', 'Pour une loi binomiale, l\'espérance est np.'), bi((f) => f.t(`${f.m(`${f.n(nn)} \\times ${f.n(p)}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(nn)} \\times ${f.n(p)}`)} = ${f.N(ans)}.`))],
      nudge: same('Expected value = n times p.', 'Espérance = n fois p.'),
    };
  }
  const m = randInt(r, 1, n - 1), ans = r6(Array.from({ length: n - m + 1 }, (_, i) => nCr(n, m + i)).reduce((a, b) => a + b, 0) / 2 ** n);
  return {
    prompt: bi((f) => f.t(`A fair coin is tossed ${f.N(n)} times. What is the probability of at least ${f.N(m)} heads?`, `On lance ${f.N(n)} fois une pièce équilibrée. Quelle est la probabilité d'obtenir au moins ${f.N(m)} faces ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(nCr(n, m) / 2 ** n), same('"At least" includes m heads and every larger number of heads. Add those probabilities.', '« Au moins » inclut m faces et tout nombre supérieur. Additionne ces probabilités.'), 1], [r6(1 - ans), same('That is the probability of fewer than m heads.', 'C\'est la probabilité d\'obtenir moins de m faces.'), 1]]),
    steps: [bi((f) => f.t(`Add the probabilities for ${f.N(m)} up to ${f.N(n)} heads: ${f.m(`\\frac{${Array.from({ length: n - m + 1 }, (_, i) => f.n(nCr(n, m + i))).join(' + ')}}{${f.n(2 ** n)}}`)}.`, `Additionne les probabilités pour ${f.N(m)} jusqu'à ${f.N(n)} faces : ${f.m(`\\frac{${Array.from({ length: n - m + 1 }, (_, i) => f.n(nCr(n, m + i))).join(' + ')}}{${f.n(2 ** n)}}`)}.`)), bi((f) => f.t(`That is ${f.N(ans)}.`, `Cela donne ${f.N(ans)}.`))],
    nudge: same('Add the probabilities of m heads, m + 1 heads, and so on up to n heads.', 'Additionne les probabilités de m faces, m + 1 faces, et ainsi de suite jusqu\'à n faces.'),
  };
});

/** MDM4U.B1: hypergeometric distributions (counting outcomes, so every answer is a whole number or a simple decimal) */
export const hyper12 = (id: string): Generator => numGen(id, (tier, r) => {
  const N = randInt(r, 8, 14), K = randInt(r, 3, N - 3), n = randInt(r, 2, 4);
  if (tier === 1) {
    const ans = nCr(N, n);
    return {
      prompt: bi((f) => f.t(`A box holds ${f.N(N)} items, ${f.N(K)} of them defective. ${f.N(n)} items are drawn without replacement. How many different samples of ${f.N(n)} items are possible?`, `Une boîte contient ${f.N(N)} articles, dont ${f.N(K)} défectueux. On en tire ${f.N(n)} sans remise. Combien d'échantillons différents de ${f.N(n)} articles sont possibles ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[nPr(N, n), same('The order of the items drawn does not matter, so use a combination.', 'L\'ordre des articles tirés ne compte pas : utilise une combinaison.'), 0], [N ** n, same('Items are drawn without replacement, and order does not matter.', 'Les articles sont tirés sans remise, et l\'ordre ne compte pas.'), 0]]),
      steps: [same('The order does not matter, so count combinations of the whole box.', 'L\'ordre ne compte pas : compte les combinaisons de toute la boîte.'), bi((f) => f.t(`${f.m(`\\text{C}(${f.n(N)}, ${f.n(n)})`)} = ${f.N(ans)}.`, `${f.m(`\\text{C}(${f.n(N)}, ${f.n(n)})`)} = ${f.N(ans)}.`))],
      nudge: same('Choose n items from all N, with no regard to order.', 'Choisis n articles parmi les N, sans tenir compte de l\'ordre.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 1, Math.min(K, n)), ans = nCr(K, k) * nCr(N - K, n - k);
    return {
      prompt: bi((f) => f.t(`A box holds ${f.N(N)} items, ${f.N(K)} of them defective. ${f.N(n)} items are drawn without replacement. How many samples contain exactly ${f.N(k)} defective items?`, `Une boîte contient ${f.N(N)} articles, dont ${f.N(K)} défectueux. On en tire ${f.N(n)} sans remise. Combien d'échantillons contiennent exactement ${f.N(k)} articles défectueux ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[nCr(K, k) + nCr(N - K, n - k), same('The two choices are made together, so multiply.', 'Les deux choix se font ensemble : multiplie.'), 1], [nCr(K, k), same('Also choose the good items to fill the rest of the sample.', 'Choisis aussi les bons articles pour compléter l\'échantillon.'), 0]]),
      steps: [bi((f) => f.t(`Defective: ${f.m(`\\text{C}(${f.n(K)}, ${f.n(k)})`)} = ${f.N(nCr(K, k))}. Good: ${f.m(`\\text{C}(${f.n(N - K)}, ${f.n(n - k)})`)} = ${f.N(nCr(N - K, n - k))}.`, `Défectueux : ${f.m(`\\text{C}(${f.n(K)}, ${f.n(k)})`)} = ${f.N(nCr(K, k))}. Bons : ${f.m(`\\text{C}(${f.n(N - K)}, ${f.n(n - k)})`)} = ${f.N(nCr(N - K, n - k))}.`)), bi((f) => f.t(`Multiply to get ${f.N(ans)}.`, `Multiplie pour obtenir ${f.N(ans)}.`))],
      nudge: same('Choose the defective items, choose the good ones, then multiply.', 'Choisis les articles défectueux, choisis les bons, puis multiplie.'),
    };
  }
  const NN = pick(r, [10, 20, 40]), KK = NN / 10 * randInt(r, 2, 6), nn = pick(r, [5, 10]), ans = r6((nn * KK) / NN);
  return {
    prompt: bi((f) => f.t(`A lot of ${f.N(NN)} items has ${f.N(KK)} defective ones. ${f.N(nn)} items are sampled without replacement. What is the expected number of defective items in the sample?`, `Un lot de ${f.N(NN)} articles en compte ${f.N(KK)} de défectueux. On prélève ${f.N(nn)} articles sans remise. Quel est le nombre espéré d'articles défectueux dans l'échantillon ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(KK / NN), same('Multiply the proportion of defective items by the sample size.', 'Multiplie la proportion d\'articles défectueux par la taille de l\'échantillon.'), 1], [r6((nn * (NN - KK)) / NN), same('Use the number of defective items, not the good ones.', 'Utilise le nombre d\'articles défectueux, et non les bons.'), 0]]),
    steps: [same('For a hypergeometric distribution, E(X) = n × K ÷ N.', 'Pour une loi hypergéométrique, E(X) = n × K ÷ N.'), bi((f) => f.t(`${f.m(`\\frac{${f.n(nn)} \\times ${f.n(KK)}}{${f.n(NN)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(nn)} \\times ${f.n(KK)}}{${f.n(NN)}}`)} = ${f.N(ans)}.`))],
    nudge: same('Sample size times the proportion that is defective.', 'Taille de l\'échantillon fois la proportion d\'articles défectueux.'),
  };
});

/** MDM4U.B2: the normal distribution, z-scores and the 68-95-99.7 rule */
export const normal12 = (id: string): Generator => numGen(id, (tier, r) => {
  const mu = randInt(r, 40, 100), sigma = pick(r, [2, 4, 5, 8, 10]);
  if (tier === 1) {
    const z = pick(r, [-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5]), x = r6(mu + z * sigma);
    return {
      prompt: bi((f) => f.t(`Scores are normally distributed with a mean of ${f.N(mu)} and a standard deviation of ${f.N(sigma)}. What is the z-score of a score of ${f.N(x)}?`, `Les notes suivent une loi normale de moyenne ${f.N(mu)} et d'écart-type ${f.N(sigma)}. Quel est le z d'une note de ${f.N(x)} ?`)),
      answer: z, category: 'KU',
      wrong: wr(z, [[-z, same('Subtract the mean from the score, not the score from the mean.', 'Soustrais la moyenne de la note, et non la note de la moyenne.'), 1], [r6(x - mu), same('Divide by the standard deviation.', 'Divise par l\'écart-type.'), 1], [r6((x - mu) * sigma), same('Divide by the standard deviation; do not multiply.', 'Divise par l\'écart-type ; ne multiplie pas.'), 1]]),
      steps: [same('z = (x − mean) ÷ standard deviation.', 'z = (x − moyenne) ÷ écart-type.'), bi((f) => f.t(`${f.m(`z = \\frac{${f.n(x)} - ${f.n(mu)}}{${f.n(sigma)}}`)} = ${f.N(z)}.`, `${f.m(`z = \\frac{${f.n(x)} - ${f.n(mu)}}{${f.n(sigma)}}`)} = ${f.N(z)}.`))],
      nudge: same('Subtract the mean, then divide by the standard deviation.', 'Soustrais la moyenne, puis divise par l\'écart-type.'),
    };
  }
  if (tier === 2) {
    const z = pick(r, [-2, -1.5, -1, 1, 1.5, 2, 2.5]), ans = r6(mu + z * sigma);
    return {
      prompt: bi((f) => f.t(`Heights are normally distributed with a mean of ${f.N(mu)} cm and a standard deviation of ${f.N(sigma)} cm. What height has a z-score of ${f.N(z)}?`, `Les tailles suivent une loi normale de moyenne ${f.N(mu)} cm et d'écart-type ${f.N(sigma)} cm. Quelle taille a un z de ${f.N(z)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(mu - z * sigma), same('A positive z-score is above the mean and a negative one is below.', 'Un z positif est au-dessus de la moyenne et un z négatif en dessous.'), 1], [r6(mu + z), same('Multiply z by the standard deviation before adding to the mean.', 'Multiplie z par l\'écart-type avant d\'additionner à la moyenne.'), 1], [r6(z * sigma), same('Add the mean.', 'Ajoute la moyenne.'), 1]]),
      steps: [same('x = mean + z × standard deviation.', 'x = moyenne + z × écart-type.'), bi((f) => f.t(`${f.m(`${f.n(mu)} + (${f.n(z)})(${f.n(sigma)})`)} = ${f.N(ans)}.`, `${f.m(`${f.n(mu)} + (${f.n(z)})(${f.n(sigma)})`)} = ${f.N(ans)}.`))],
      nudge: same('Start at the mean and move z standard deviations.', 'Pars de la moyenne et déplace-toi de z écarts-types.'),
    };
  }
  const a = randInt(r, 1, 3), b = randInt(r, 1, 3), half: Record<number, number> = { 1: 34, 2: 47.5, 3: 49.85 }, ans = r6(half[a]! + half[b]!);
  return {
    prompt: bi((f) => f.t(`Using the 68-95-99.7 rule, about what percent of a normal distribution lies between ${f.N(mu - a * sigma)} and ${f.N(mu + b * sigma)}, if the mean is ${f.N(mu)} and the standard deviation is ${f.N(sigma)}?`, `Avec la règle 68-95-99,7, environ quel pourcentage d'une loi normale se situe entre ${f.N(mu - a * sigma)} et ${f.N(mu + b * sigma)}, si la moyenne est ${f.N(mu)} et l'écart-type ${f.N(sigma)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6(2 * half[Math.max(a, b)]!), same('The interval is not symmetric: add the half for each side separately.', 'L\'intervalle n\'est pas symétrique : additionne séparément la moitié de chaque côté.'), 1], [r6(half[a]! + half[b]! + 50), same('Do not add the half beyond the mean twice.', 'N\'ajoute pas deux fois la moitié au-delà de la moyenne.'), 1]]),
    steps: [bi((f) => f.t(`The interval runs from ${f.N(-a)} to ${f.N(b)} standard deviations. Half of 68, 95, 99.7 is 34, 47.5, 49.85 for 1, 2, 3 standard deviations.`, `L'intervalle va de ${f.N(-a)} à ${f.N(b)} écarts-types. La moitié de 68, 95, 99,7 donne 34, 47,5, 49,85 pour 1, 2, 3 écarts-types.`)), bi((f) => f.t(`${f.m(`${f.n(half[a]!)} + ${f.n(half[b]!)}`)} = ${f.N(ans)} percent.`, `${f.m(`${f.n(half[a]!)} + ${f.n(half[b]!)}`)} = ${f.N(ans)} pour cent.`))],
    nudge: same('Find how many standard deviations each end is from the mean, and add the half-percents.', 'Trouve à combien d\'écarts-types de la moyenne se trouve chaque extrémité, et additionne les demi-pourcentages.'),
  };
});

/** MDM4U.B2: the normal approximation to the binomial distribution */
export const normalApprox12 = (id: string): Generator => numGen(id, (tier, r) => {
  const [n, p, sd] = pick(r, [[100, 0.5, 5], [100, 0.2, 4], [400, 0.2, 8], [36, 0.5, 3], [64, 0.5, 4], [144, 0.5, 6], [225, 0.2, 6]] as [number, number, number][]);
  const mu = r6(n * p);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A binomial distribution has ${f.m(`n = ${f.n(n)}`)} and ${f.m(`p = ${f.n(p)}`)}. What is the mean of the normal distribution that approximates it?`, `Une loi binomiale a ${f.m(`n = ${f.n(n)}`)} et ${f.m(`p = ${f.n(p)}`)}. Quelle est la moyenne de la loi normale qui l'approxime ?`)),
      answer: mu, category: 'KU',
      wrong: wr(mu, [[sd, same('That is the standard deviation. The mean is np.', 'C\'est l\'écart-type. La moyenne est np.'), 0], [r6(n * (1 - p)), same('Use p, the probability of success.', 'Utilise p, la probabilité de succès.'), 0]]),
      steps: [same('The mean of the approximating normal distribution is np.', 'La moyenne de la loi normale qui approxime est np.'), bi((f) => f.t(`${f.m(`${f.n(n)} \\times ${f.n(p)}`)} = ${f.N(mu)}.`, `${f.m(`${f.n(n)} \\times ${f.n(p)}`)} = ${f.N(mu)}.`))],
      nudge: same('Mean = n times p.', 'Moyenne = n fois p.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A binomial distribution has ${f.m(`n = ${f.n(n)}`)} and ${f.m(`p = ${f.n(p)}`)}. What is the standard deviation of the normal distribution that approximates it?`, `Une loi binomiale a ${f.m(`n = ${f.n(n)}`)} et ${f.m(`p = ${f.n(p)}`)}. Quel est l'écart-type de la loi normale qui l'approxime ?`)),
      answer: sd, category: 'AP',
      wrong: wr(sd, [[sd * sd, same('Take the square root: the standard deviation is the square root of npq.', 'Prends la racine carrée : l\'écart-type est la racine carrée de npq.'), 1], [mu, same('That is the mean. The standard deviation is the square root of npq.', 'C\'est la moyenne. L\'écart-type est la racine carrée de npq.'), 0]]),
      steps: [same('The standard deviation is the square root of n p q, with q = 1 − p.', 'L\'écart-type est la racine carrée de n p q, avec q = 1 − p.'), bi((f) => f.t(`${f.m(`\\sqrt{${f.n(n)} \\times ${f.n(p)} \\times ${f.n(r6(1 - p))}}`)} = ${f.m(`\\sqrt{${f.n(sd * sd)}}`)} = ${f.N(sd)}.`, `${f.m(`\\sqrt{${f.n(n)} \\times ${f.n(p)} \\times ${f.n(r6(1 - p))}}`)} = ${f.m(`\\sqrt{${f.n(sd * sd)}}`)} = ${f.N(sd)}.`))],
      nudge: same('Multiply n, p and q, then take the square root.', 'Multiplie n, p et q, puis prends la racine carrée.'),
    };
  }
  const x = Math.round(mu + pick(r, [-2, -1, 1, 2]) * sd), z = r6((x - 0.5 - mu) / sd);
  return {
    prompt: bi((f) => f.t(`For a binomial distribution with ${f.m(`n = ${f.n(n)}`)} and ${f.m(`p = ${f.n(p)}`)}, you approximate ${f.m(`P(X \\ge ${f.n(x)})`)} with a normal distribution. With the continuity correction, what z-score do you use?`, `Pour une loi binomiale avec ${f.m(`n = ${f.n(n)}`)} et ${f.m(`p = ${f.n(p)}`)}, tu approximes ${f.m(`P(X \\ge ${f.n(x)})`)} avec une loi normale. Avec la correction de continuité, quel z utilises-tu ?`)),
    answer: z, category: 'TH',
    wrong: wr(z, [[r6((x - mu) / sd), same('Apply the continuity correction: for "at least x", use x minus 0.5.', 'Applique la correction de continuité : pour « au moins x », utilise x moins 0,5.'), 0], [r6((x + 0.5 - mu) / sd), same('For "at least x", the continuity correction subtracts 0.5.', 'Pour « au moins x », la correction de continuité soustrait 0,5.'), 0]]),
    steps: [bi((f) => f.t(`Mean ${f.N(mu)}, standard deviation ${f.N(sd)}. For "at least ${f.N(x)}", use ${f.N(x - 0.5)}.`, `Moyenne ${f.N(mu)}, écart-type ${f.N(sd)}. Pour « au moins ${f.N(x)} », utilise ${f.N(x - 0.5)}.`)), bi((f) => f.t(`${f.m(`z = \\frac{${f.n(x - 0.5)} - ${f.n(mu)}}{${f.n(sd)}}`)} = ${f.N(z)}.`, `${f.m(`z = \\frac{${f.n(x - 0.5)} - ${f.n(mu)}}{${f.n(sd)}}`)} = ${f.N(z)}.`))],
    nudge: same('Use x minus 0.5 for "at least x", then find the z-score.', 'Utilise x moins 0,5 pour « au moins x », puis trouve le z.'),
  };
});

// ── studies and sampling ───────────────────────────────────────────────────────

/** MDM4U.C: sampling techniques and bias */
export const sampling12 = (id: string, focus: 'technique' | 'bias'): Generator => choiceGen(id, (tier, r) => {
  const techniques: { name: [string, string]; how: [string, string] }[] = [
    { name: ['Simple random sample', 'Échantillon aléatoire simple'], how: ['Every student is given a number and a random number generator picks 40 of them.', 'Chaque élève reçoit un numéro et un générateur de nombres aléatoires en choisit 40.'] },
    { name: ['Systematic sample', 'Échantillon systématique'], how: ['The students are listed alphabetically and every 10th student is chosen.', 'Les élèves sont listés par ordre alphabétique et on choisit un élève sur dix.'] },
    { name: ['Stratified sample', 'Échantillon stratifié'], how: ['The students are split by grade and a random sample is taken from each grade in proportion to its size.', 'Les élèves sont séparés par niveau et on prélève un échantillon aléatoire de chaque niveau, proportionnel à sa taille.'] },
    { name: ['Cluster sample', 'Échantillon par grappes'], how: ['Five homeroom classes are chosen at random and every student in those classes is surveyed.', 'On choisit au hasard cinq classes et on interroge tous les élèves de ces classes.'] },
    { name: ['Convenience sample', 'Échantillon de commodité'], how: ['The first 40 students who walk past the cafeteria door are asked.', 'On interroge les 40 premiers élèves qui passent devant la porte de la cafétéria.'] },
    { name: ['Multi-stage sample', 'Échantillon à plusieurs degrés'], how: ['Four schools are chosen at random, then three classes are chosen at random in each school, then 10 students are chosen at random in each class.', 'On choisit au hasard quatre écoles, puis trois classes au hasard dans chaque école, puis 10 élèves au hasard dans chaque classe.'] },
  ];
  const biases: { name: [string, string]; how: [string, string] }[] = [
    { name: ['Sampling bias', 'Biais d\'échantillonnage'], how: ['A survey about school lunches is given only to students who eat in the cafeteria.', 'Un sondage sur les repas scolaires est donné seulement aux élèves qui mangent à la cafétéria.'] },
    { name: ['Non-response bias', 'Biais de non-réponse'], how: ['A mailed survey is sent to 1000 homes, but only the 80 people with strong opinions send it back.', 'Un sondage envoyé par la poste à 1000 foyers n\'est retourné que par les 80 personnes qui ont des opinions tranchées.'] },
    { name: ['Response bias', 'Biais de réponse'], how: ['A question is worded: "Don\'t you agree that the school should have a longer lunch?"', 'Une question est formulée : « N\'es-tu pas d\'accord que l\'école devrait avoir un dîner plus long ? »'] },
    { name: ['Measurement bias', 'Biais de mesure'], how: ['A scale that reads 2 kg too high is used to weigh every student in a study.', 'Une balance qui indique 2 kg de trop sert à peser tous les élèves d\'une étude.'] },
    { name: ['Voluntary response bias', 'Biais d\'autosélection'], how: ['An online poll is posted on a website and anyone who wants to can vote.', 'Un sondage en ligne est affiché sur un site Web et tous ceux qui le veulent peuvent voter.'] },
    { name: ['Undercoverage bias', 'Biais de sous-représentation'], how: ['A telephone survey calls only landline numbers, so people with only cell phones are never reached.', 'Un sondage téléphonique n\'appelle que des numéros de ligne fixe : les personnes qui n\'ont qu\'un cellulaire ne sont jamais jointes.'] },
  ];
  const pool = focus === 'bias' ? biases : techniques;
  const c = pick(r, pool), others = pool.filter((x) => x !== c).sort(() => r() - 0.5).slice(0, 3);
  const m = mc(r, t(c.name[0], c.name[1]), others.map((o): [Text, Text] => [t(o.name[0], o.name[1]), same('That does not match the description. Look at how the people were chosen or asked.', 'Cela ne correspond pas à la description. Regarde comment les personnes ont été choisies ou interrogées.')]));
  return {
    prompt: same(`${c.how[0]} Which is this?`, `${c.how[1]} De quoi s'agit-il ?`),
    options: m.options, correct: m.correct, why: m.why, category: tier === 1 ? 'KU' : 'AP',
    steps: [same('Look at how the people in the study were chosen or how the data were collected.', 'Regarde comment les personnes de l\'étude ont été choisies ou comment les données ont été recueillies.'), same(`That matches ${c.name[0].toLowerCase()}.`, `Cela correspond à ${c.name[1].toLowerCase()}.`)],
    nudge: same('How were the people chosen, and could that favour some answers?', 'Comment les personnes ont-elles été choisies, et cela pourrait-il favoriser certaines réponses ?'),
  };
});
