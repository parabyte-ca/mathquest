// Grade 6 Algebra strand (C), the expectations that were not built before 2.8.2: kinds of patterns, translating among tables and
// rules, patterns with decimals, and adding monomials.
import { pick, randInt, shuffle } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const list = (f: { n: (x: number) => string }, xs: number[]): string => xs.map((x) => f.n(x)).join(',\\ ');
const linear = (m: number, c: number, n: number): number => m * n + c;

/** MS.G6.C1.1.a: repeating, growing and shrinking patterns, and which growing patterns are linear */
const repeating = numGen('MS.G6.C1.1.a', (_tier, r) => {
  const len = pick(r, [3, 4]);
  const cycle = shuffle(r, [2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len);
  const n = randInt(r, 13, 40);
  const ans = cycle[(n - 1) % len]!;
  const wrongIdx = cycle[n % len]!;
  return {
    prompt: bi((f) => f.t(`A repeating pattern goes ${f.m(list(f, [...cycle, ...cycle]) + ',\\ \\ldots')} What is term ${f.N(n)}?`, `Une suite répétitive va ${f.m(list(f, [...cycle, ...cycle]) + ',\\ \\ldots')} Quel est le terme ${f.N(n)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[wrongIdx, t('It looks like the count was off by one. Term 1 is the first number of the core, so term n sits at position n in the cycle.', 'Il semble que le compte est décalé de un. Le terme 1 est le premier nombre du motif de base : le terme n est à la position n du cycle.'), 1], [cycle[0]!, t('That is the first number of the core. Find where term number falls in the repeat.', 'C\'est le premier nombre du motif de base. Trouve où tombe ce numéro de terme dans la répétition.'), 1]]),
    steps: [bi((f) => f.t(`The core has ${f.N(len)} numbers. Divide ${f.N(n)} by ${f.N(len)}: the remainder is ${f.N(n % len)}.`, `Le motif de base a ${f.N(len)} nombres. Divise ${f.N(n)} par ${f.N(len)} : le reste est ${f.N(n % len)}.`)), bi((f) => (n % len === 0 ? f.t(`A remainder of ${f.N(0)} means the last number of the core: ${f.N(ans)}.`, `Un reste de ${f.N(0)} signifie le dernier nombre du motif de base : ${f.N(ans)}.`) : f.t(`A remainder of ${f.N(n % len)} means number ${f.N(n % len)} of the core: ${f.N(ans)}.`, `Un reste de ${f.N(n % len)} signifie le nombre ${f.N(n % len)} du motif de base : ${f.N(ans)}.`)))],
    nudge: t('How many numbers are in one repeat? Use the remainder after dividing the term number.', 'Combien de nombres y a-t-il dans une répétition ? Utilise le reste de la division du numéro du terme.'),
  };
});
const shrinking = numGen('MS.G6.C1.1.a', (_tier, r) => {
  const d = randInt(r, 2, 9), n = randInt(r, 5, 12), start = d * (n + randInt(r, 1, 4));
  const ans = start - d * (n - 1);
  return {
    prompt: bi((f) => f.t(`A shrinking pattern starts at ${f.N(start)} and goes down by ${f.N(d)} each term. What is term ${f.N(n)}?`, `Une suite décroissante commence à ${f.N(start)} et diminue de ${f.N(d)} à chaque terme. Quel est le terme ${f.N(n)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[start - d * n, t('It looks like the jump was taken off one time too many. The first term is the starting number, so there are only n − 1 jumps.', 'Il semble que l\'écart a été retiré une fois de trop. Le premier terme est le nombre de départ : il n\'y a que n − 1 écarts.'), 1], [start + d * (n - 1), t('The pattern shrinks, so each jump is taken away, not added.', 'La suite décroît : chaque écart est retiré, pas ajouté.'), 1]]),
    steps: [bi((f) => f.t(`To reach term ${f.N(n)} you take ${f.N(n - 1)} jumps of ${f.N(d)}: ${f.N((n - 1) * d)}.`, `Pour atteindre le terme ${f.N(n)}, tu fais ${f.N(n - 1)} écarts de ${f.N(d)} : ${f.N((n - 1) * d)}.`)), bi((f) => `${f.N(start)} − ${f.N((n - 1) * d)} = ${f.N(ans)}.`)],
    nudge: t('Count the jumps: one fewer than the term number. Take them away from the start.', 'Compte les écarts : un de moins que le numéro du terme. Retire-les du départ.'),
  };
});
const isLinear = choiceGen('MS.G6.C1.1.a', (_tier, r) => {
  const a = randInt(r, 1, 6), d = randInt(r, 2, 6), s = randInt(r, 1, 4);
  const lin = [0, 1, 2, 3, 4].map((k) => a + d * k);
  const dbl = [0, 1, 2, 3, 4].map((k) => s * 2 ** k);
  const tri = [0, 1, 2, 3, 4].map((k) => a + (k * (k + 1)) / 2);
  const tx = (xs: number[]): Text => bi((f) => f.m(list(f, xs)));
  const m = mc(r, tx(lin), [
    [tx(dbl), t('This one grows by a bigger jump each time (it doubles). A linear pattern grows by the same amount each term.', 'Celle-ci augmente d\'un écart plus grand chaque fois (elle double). Une suite linéaire augmente du même montant à chaque terme.')],
    [tx(tri), t('The jumps here keep getting bigger (1, 2, 3, ...). A linear pattern has the same jump every time.', 'Les écarts ici ne cessent de grandir (1, 2, 3, ...). Une suite linéaire a le même écart chaque fois.')],
  ]);
  return {
    prompt: t('Which growing pattern is linear?', 'Quelle suite croissante est linéaire ?'),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [t('A linear pattern grows by the same amount each term. Find the jump between neighbouring terms.', 'Une suite linéaire augmente du même montant à chaque terme. Trouve l\'écart entre les termes voisins.'), bi((f) => f.t(`Only ${f.m(list(f, lin))} always jumps by ${f.N(d)}.`, `Seule ${f.m(list(f, lin))} fait toujours un écart de ${f.N(d)}.`))],
    nudge: t('Subtract each term from the next one. Are the answers all the same?', 'Soustrais chaque terme du suivant. Les réponses sont-elles toutes pareilles ?'),
  };
});
export const patternKinds6 = tierGen(repeating, shrinking, isLinear);

/** MS.G6.C1.2.a: translating patterns among tables and rules */
const tableValue = numGen('MS.G6.C1.2.a', (_tier, r) => {
  const m = randInt(r, 2, 8), c = randInt(r, 1, 9), n = randInt(r, 8, 15);
  const vals = [1, 2, 3, 4].map((k) => linear(m, c, k));
  const ans = linear(m, c, n);
  return {
    prompt: bi((f) => f.t(`A table shows term number 1, 2, 3, 4 with values ${f.m(list(f, vals))}. If the pattern continues, what is the value for term ${f.N(n)}?`, `Un tableau montre les numéros de termes 1, 2, 3, 4 avec les valeurs ${f.m(list(f, vals))}. Si la suite continue, quelle est la valeur du terme ${f.N(n)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[vals[3]! + (n - 4), t('It looks like one was added for each step. Find how much the values jump each time instead.', 'Il semble que un a été ajouté à chaque étape. Trouve plutôt de combien les valeurs augmentent chaque fois.'), 0], [m * n, t('That leaves out the starting amount. The rule is the jump times the term number, plus a number.', 'Cela oublie le montant de départ. La règle, c\'est l\'écart fois le numéro du terme, plus un nombre.'), 1]]),
    steps: [bi((f) => f.t(`The values jump by ${f.N(m)} each term, so the rule is ${f.m(`${f.n(m)}n + ${f.n(c)}`)} (check term 1: ${f.N(m)} + ${f.N(c)} = ${f.N(m + c)}).`, `Les valeurs augmentent de ${f.N(m)} à chaque terme : la règle est ${f.m(`${f.n(m)}n + ${f.n(c)}`)} (vérifie le terme 1 : ${f.N(m)} + ${f.N(c)} = ${f.N(m + c)}).`)), bi((f) => `${f.N(m)} × ${f.N(n)} + ${f.N(c)} = ${f.N(ans)}.`)],
    nudge: t('Find the jump between values, then write the rule.', 'Trouve l\'écart entre les valeurs, puis écris la règle.'),
  };
});
const tableConstant = numGen('MS.G6.C1.2.a', (_tier, r) => {
  const m = randInt(r, 2, 8), c = randInt(r, 1, 9);
  const vals = [1, 2, 3, 4].map((k) => linear(m, c, k));
  return {
    prompt: bi((f) => f.t(`A table shows term number 1, 2, 3, 4 with values ${f.m(list(f, vals))}. The rule has the form value ${f.m(`= ${f.n(m)}n + c`)}. What is the number c?`, `Un tableau montre les numéros de termes 1, 2, 3, 4 avec les valeurs ${f.m(list(f, vals))}. La règle a la forme valeur ${f.m(`= ${f.n(m)}n + c`)}. Quel est le nombre c ?`)),
    answer: c, category: 'AP',
    wrong: wr(c, [[vals[0]!, t('That is the first value. It already includes one jump, so take that jump away to find the starting amount.', 'C\'est la première valeur. Elle contient déjà un écart : retire-le pour trouver le montant de départ.'), 1], [m, t('That is the jump per term, which is already in the rule. The question asks for the number added.', 'C\'est l\'écart par terme, déjà dans la règle. La question demande le nombre ajouté.'), 0]]),
    steps: [bi((f) => f.t(`Term 1 is ${f.N(vals[0]!)}, and the rule gives ${f.N(m)} × ${f.N(1)} + c.`, `Le terme 1 est ${f.N(vals[0]!)}, et la règle donne ${f.N(m)} × ${f.N(1)} + c.`)), bi((f) => `c = ${f.N(vals[0]!)} − ${f.N(m)} = ${f.N(c)}.`)],
    nudge: t('Put term 1 in the rule and see what is left over.', 'Mets le terme 1 dans la règle et regarde ce qui reste.'),
  };
});
const tableTerm = numGen('MS.G6.C1.2.a', (_tier, r) => {
  const m = randInt(r, 2, 8), c = randInt(r, 1, 9), n1 = randInt(r, 2, 4), n2 = n1 + 4, target = randInt(r, 8, 14);
  return {
    prompt: bi((f) => f.t(`A linear pattern has value ${f.N(linear(m, c, n1))} for term ${f.N(n1)} and value ${f.N(linear(m, c, n2))} for term ${f.N(n2)}. Which term number has the value ${f.N(linear(m, c, target))}?`, `Une suite linéaire a la valeur ${f.N(linear(m, c, n1))} pour le terme ${f.N(n1)} et la valeur ${f.N(linear(m, c, n2))} pour le terme ${f.N(n2)}. Quel numéro de terme a la valeur ${f.N(linear(m, c, target))} ?`)),
    answer: target, category: 'TH',
    wrong: wr(target, [[linear(m, c, target) - c, t('That removes the starting amount but does not divide by the jump per term.', 'Cela retire le montant de départ, mais ne divise pas par l\'écart par terme.'), 1], [linear(m, c, target) / m, t('That divides first. Take away the starting amount before dividing by the jump.', 'Cela divise d\'abord. Retire le montant de départ avant de diviser par l\'écart.'), 1]]),
    steps: [bi((f) => f.t(`The jump per term is (${f.N(linear(m, c, n2))} − ${f.N(linear(m, c, n1))}) ÷ ${f.N(4)} = ${f.N(m)}, so the rule is ${f.m(`${f.n(m)}n + ${f.n(c)}`)}.`, `L'écart par terme est (${f.N(linear(m, c, n2))} − ${f.N(linear(m, c, n1))}) ÷ ${f.N(4)} = ${f.N(m)} : la règle est ${f.m(`${f.n(m)}n + ${f.n(c)}`)}.`)), bi((f) => f.t(`(${f.N(linear(m, c, target))} − ${f.N(c)}) ÷ ${f.N(m)} = ${f.N(target)}.`, `(${f.N(linear(m, c, target))} − ${f.N(c)}) ÷ ${f.N(m)} = ${f.N(target)}.`))],
    nudge: t('Find the jump per term and the rule first, then undo the rule.', 'Trouve d\'abord l\'écart par terme et la règle, puis défais la règle.'),
  };
});
export const translatePatterns6 = tierGen(tableValue, tableConstant, tableTerm);

/** MS.G6.C1.4.a: patterns among whole numbers and decimals */
export const decimalPatterns6 = numGen('MS.G6.C1.4.a', (tier, r) => {
  if (tier === 1) {
    const s = randInt(r, 2, 9) / 10, d = randInt(r, 2, 9) / 10, n = randInt(r, 5, 9);
    const ans = r6(s + d * (n - 1));
    return {
      prompt: bi((f) => f.t(`A pattern starts at ${f.N(s)} and adds ${f.N(d)} each term. What is term ${f.N(n)}?`, `Une suite commence à ${f.N(s)} et ajoute ${f.N(d)} à chaque terme. Quel est le terme ${f.N(n)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(s + d * n), t('It looks like one jump too many was added. The start is term 1, so there are n − 1 jumps.', 'Il semble qu\'un écart de trop a été ajouté. Le départ est le terme 1 : il y a n − 1 écarts.'), 1]]),
      steps: [bi((f) => f.t(`There are ${f.N(n - 1)} jumps of ${f.N(d)}: ${f.N(n - 1)} × ${f.N(d)} = ${f.N(r6((n - 1) * d))}.`, `Il y a ${f.N(n - 1)} écarts de ${f.N(d)} : ${f.N(n - 1)} × ${f.N(d)} = ${f.N(r6((n - 1) * d))}.`)), bi((f) => `${f.N(s)} + ${f.N(r6((n - 1) * d))} = ${f.N(ans)}.`)],
      nudge: t('Count the jumps: one fewer than the term number.', 'Compte les écarts : un de moins que le numéro du terme.'),
    };
  }
  if (tier === 2) {
    const d = randInt(r, 2, 5) / 10, n = randInt(r, 5, 8), s = randInt(r, 35, 60) / 10;
    const ans = r6(s - d * (n - 1));
    return {
      prompt: bi((f) => f.t(`A shrinking pattern starts at ${f.N(s)} and goes down by ${f.N(d)} each term. What is term ${f.N(n)}?`, `Une suite décroissante commence à ${f.N(s)} et diminue de ${f.N(d)} à chaque terme. Quel est le terme ${f.N(n)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(s - d * n), t('It looks like one jump too many was taken off. There are only n − 1 jumps.', 'Il semble qu\'un écart de trop a été retiré. Il n\'y a que n − 1 écarts.'), 1], [r6(s + d * (n - 1)), t('The pattern shrinks, so the jumps are taken away.', 'La suite décroît : on retire les écarts.'), 1]]),
      steps: [bi((f) => f.t(`There are ${f.N(n - 1)} jumps of ${f.N(d)}: ${f.N(r6((n - 1) * d))} in all.`, `Il y a ${f.N(n - 1)} écarts de ${f.N(d)} : ${f.N(r6((n - 1) * d))} en tout.`)), bi((f) => `${f.N(s)} − ${f.N(r6((n - 1) * d))} = ${f.N(ans)}.`)],
      nudge: t('Take away one jump for each step after the first term.', 'Retire un écart pour chaque pas après le premier terme.'),
    };
  }
  const m = pick(r, [0.5, 1.5, 2.5]), c = pick(r, [0.5, 1, 1.5, 2]), n = randInt(r, 4, 12);
  const v = r6(m * n + c);
  return {
    prompt: bi((f) => f.t(`A pattern follows the rule value ${f.m(`= ${f.n(m)}n + ${f.n(c)}`)}. Which term number has the value ${f.N(v)}?`, `Une suite suit la règle valeur ${f.m(`= ${f.n(m)}n + ${f.n(c)}`)}. Quel numéro de terme a la valeur ${f.N(v)} ?`)),
    answer: n, category: 'TH',
    wrong: wr(n, [[r6(v - c), t('That takes away the starting amount but does not divide by the number beside n.', 'Cela retire le montant de départ, mais ne divise pas par le nombre à côté de n.'), 1], [r6(v / m), t('That divides first. Take away the starting amount before dividing.', 'Cela divise d\'abord. Retire le montant de départ avant de diviser.'), 1]]),
    steps: [bi((f) => f.t(`Subtract ${f.N(c)}: ${f.N(v)} − ${f.N(c)} = ${f.N(r6(v - c))}.`, `Soustrais ${f.N(c)} : ${f.N(v)} − ${f.N(c)} = ${f.N(r6(v - c))}.`)), bi((f) => f.t(`Divide by ${f.N(m)}: ${f.N(r6(v - c))} ÷ ${f.N(m)} = ${f.N(n)}.`, `Divise par ${f.N(m)} : ${f.N(r6(v - c))} ÷ ${f.N(m)} = ${f.N(n)}.`))],
    nudge: t('Undo the rule: take away the added number, then divide.', 'Défais la règle : retire le nombre ajouté, puis divise.'),
  };
});

/** MS.G6.C2.1.a: adding monomials of degree 1 with whole numbers */
export const monomials6 = numGen('MS.G6.C2.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9), b = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`Add: ${f.m(`${f.n(a)}x + ${f.n(b)}x = ?x`)} What number replaces the ?`, `Additionne : ${f.m(`${f.n(a)}x + ${f.n(b)}x = ?x`)} Quel nombre remplace le ? ?`)),
      answer: a + b, category: 'KU',
      wrong: wr(a + b, [[a * b, t('Like terms are added, not multiplied: count how many x there are in all.', 'Les termes semblables s\'additionnent, ils ne se multiplient pas : compte combien de x il y a en tout.'), 0], [a, t('Only the first term was used. Both terms are x, so add the numbers in front.', 'Seul le premier terme a été utilisé. Les deux termes sont des x : additionne les nombres devant.'), 0]]),
      steps: [t('Both terms are x. Think of them as groups of x and add the groups.', 'Les deux termes sont des x. Pense à des groupes de x et additionne les groupes.'), bi((f) => `${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}.`)],
      nudge: t('Add the numbers in front of the x.', 'Additionne les nombres devant le x.'),
    };
  }
  const a = randInt(r, 2, 8), b = randInt(r, 2, 8), x = randInt(r, 2, 9);
  if (tier === 2) {
    const c = randInt(r, 2, 8);
    return {
      prompt: bi((f) => f.t(`Add ${f.m(`${f.n(a)}x + ${f.n(b)}x + ${f.n(c)}x`)}. What is the value when ${f.m(`x = ${f.n(x)}`)}?`, `Additionne ${f.m(`${f.n(a)}x + ${f.n(b)}x + ${f.n(c)}x`)}. Quelle est la valeur quand ${f.m(`x = ${f.n(x)}`)} ?`)),
      answer: (a + b + c) * x, category: 'AP',
      wrong: wr((a + b + c) * x, [[a + b + c, t('That is the number of x, not the value. Multiply by the value of x.', 'C\'est le nombre de x, pas la valeur. Multiplie par la valeur de x.'), 1], [a + b + c + x, t('The x is a multiplier, not something to add. Multiply the total by x.', 'Le x est un multiplicateur, pas quelque chose à additionner. Multiplie le total par x.'), 1]]),
      steps: [bi((f) => f.t(`Add the like terms: ${f.N(a)} + ${f.N(b)} + ${f.N(c)} = ${f.N(a + b + c)}, so the sum is ${f.m(`${f.n(a + b + c)}x`)}.`, `Additionne les termes semblables : ${f.N(a)} + ${f.N(b)} + ${f.N(c)} = ${f.N(a + b + c)} : la somme est ${f.m(`${f.n(a + b + c)}x`)}.`)), bi((f) => `${f.N(a + b + c)} × ${f.N(x)} = ${f.N((a + b + c) * x)}.`)],
      nudge: t('Add the number of x first, then replace x with its value.', 'Additionne d\'abord le nombre de x, puis remplace x par sa valeur.'),
    };
  }
  const c = randInt(r, 2, 9), d = randInt(r, 2, 9);
  const ans = (a + b) * x + (c + d);
  return {
    prompt: bi((f) => f.t(`Add ${f.m(`(${f.n(a)}x + ${f.n(c)}) + (${f.n(b)}x + ${f.n(d)})`)}. What is the value of the sum when ${f.m(`x = ${f.n(x)}`)}?`, `Additionne ${f.m(`(${f.n(a)}x + ${f.n(c)}) + (${f.n(b)}x + ${f.n(d)})`)}. Quelle est la valeur de la somme quand ${f.m(`x = ${f.n(x)}`)} ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[(a + b) * x, t('The plain numbers were left out. Add them too: they are like terms with each other.', 'Les nombres seuls ont été oubliés. Additionne-les aussi : ils sont des termes semblables entre eux.'), 1], [(a + b + c + d) * x, t('Only the terms with x can be grouped with x. The plain numbers stay plain.', 'Seuls les termes avec x se regroupent avec x. Les nombres seuls restent seuls.'), 1]]),
    steps: [bi((f) => f.t(`x terms: ${f.N(a)}x + ${f.N(b)}x = ${f.m(`${f.n(a + b)}x`)}. Plain numbers: ${f.N(c)} + ${f.N(d)} = ${f.N(c + d)}.`, `Termes en x : ${f.N(a)}x + ${f.N(b)}x = ${f.m(`${f.n(a + b)}x`)}. Nombres seuls : ${f.N(c)} + ${f.N(d)} = ${f.N(c + d)}.`)), bi((f) => f.t(`The sum is ${f.m(`${f.n(a + b)}x + ${f.n(c + d)}`)}. With x = ${f.N(x)}: ${f.N((a + b) * x)} + ${f.N(c + d)} = ${f.N(ans)}.`, `La somme est ${f.m(`${f.n(a + b)}x + ${f.n(c + d)}`)}. Avec x = ${f.N(x)} : ${f.N((a + b) * x)} + ${f.N(c + d)} = ${f.N(ans)}.`))],
    nudge: t('Group the x terms together and the plain numbers together, then put in the value of x.', 'Regroupe ensemble les termes en x et ensemble les nombres seuls, puis remplace x par sa valeur.'),
  };
});
