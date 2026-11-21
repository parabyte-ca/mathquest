// Grade 7 Algebra strand (C): growing patterns, integer patterns, like terms, expressions, equations and inequalities.
import { randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

type Wrong = [number, Text, number?][];

/** MS.G7.C1.1.a: compare linear growing patterns by constant rate and initial value */
export const comparePatterns7 = numGen('MS.G7.C1.1.a', (tier, r) => {
  const half = tier === 3 ? 2 : 1;
  const d2 = randInt(r, 2, 6) / half;
  const k = randInt(r, 1, 4) / half;
  const d1 = r6(d2 + k);
  const n = randInt(r, 2, 10);
  const s1 = randInt(r, 2, 12) / half;
  const s2 = r6(s1 + k * n);
  const val = (s: number, d: number, w: number): number => r6(s + d * w);
  if (tier === 2) {
    const w = randInt(r, 3, 12);
    const diff = r6(Math.abs(val(s1, d1, w) - val(s2, d2, w)));
    return {
      prompt: bi((f) => f.t(`Plan A starts with ${f.N(s1)} stickers and adds ${f.N(d1)} each week. Plan B starts with ${f.N(s2)} stickers and adds ${f.N(d2)} each week. After ${f.N(w)} weeks, how many more stickers does the plan with more stickers have?`, `Le plan A commence avec ${f.N(s1)} autocollants et en ajoute ${f.N(d1)} chaque semaine. Le plan B commence avec ${f.N(s2)} autocollants et en ajoute ${f.N(d2)} chaque semaine. Après ${f.N(w)} semaines, combien d'autocollants de plus le plan qui en a le plus possède-t-il ?`)),
      answer: diff, category: 'AP',
      wrong: [[r6(Math.abs(s2 - s1)), t('That is the difference at the start. The plans grow at different rates, so work out each total after the weeks.', 'C\'est la différence au départ. Les plans croissent à des rythmes différents : calcule chaque total après les semaines.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Plan A after ${f.N(w)} weeks: ${f.N(s1)} + ${f.N(w)} × ${f.N(d1)} = ${f.N(val(s1, d1, w))}. Plan B: ${f.N(s2)} + ${f.N(w)} × ${f.N(d2)} = ${f.N(val(s2, d2, w))}.`, `Plan A après ${f.N(w)} semaines : ${f.N(s1)} + ${f.N(w)} × ${f.N(d1)} = ${f.N(val(s1, d1, w))}. Plan B : ${f.N(s2)} + ${f.N(w)} × ${f.N(d2)} = ${f.N(val(s2, d2, w))}.`)), bi((f) => f.t(`Subtract: ${f.N(Math.max(val(s1, d1, w), val(s2, d2, w)))} − ${f.N(Math.min(val(s1, d1, w), val(s2, d2, w)))} = ${f.N(diff)}.`, `Soustrais : ${f.N(Math.max(val(s1, d1, w), val(s2, d2, w)))} − ${f.N(Math.min(val(s1, d1, w), val(s2, d2, w)))} = ${f.N(diff)}.`))],
      nudge: t('Find the total of each plan after that many weeks, then compare.', 'Trouve le total de chaque plan après ce nombre de semaines, puis compare.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`Plan A starts with ${f.N(s1)} ${tier === 3 ? 'dollars' : 'stickers'} and adds ${f.N(d1)} each week. Plan B starts with ${f.N(s2)} and adds ${f.N(d2)} each week. After how many weeks do the two plans have the same amount?`, `Le plan A commence avec ${f.N(s1)} ${tier === 3 ? 'dollars' : 'autocollants'} et en ajoute ${f.N(d1)} chaque semaine. Le plan B commence avec ${f.N(s2)} et en ajoute ${f.N(d2)} chaque semaine. Après combien de semaines les deux plans ont-ils la même quantité ?`)),
    answer: n, category: 'TH',
    wrong: [[r6(s2 - s1), t('That is the gap at the start. Each week the gap closes by the difference in the weekly amounts.', 'C\'est l\'écart au départ. Chaque semaine, l\'écart diminue de la différence entre les quantités hebdomadaires.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`The gap at the start is ${f.N(s2)} − ${f.N(s1)} = ${f.N(r6(s2 - s1))}. Plan A gains ${f.N(d1)} − ${f.N(d2)} = ${f.N(k)} more each week.`, `L\'écart au départ est ${f.N(s2)} − ${f.N(s1)} = ${f.N(r6(s2 - s1))}. Le plan A gagne ${f.N(d1)} − ${f.N(d2)} = ${f.N(k)} de plus chaque semaine.`)), bi((f) => f.t(`Weeks to close the gap: ${f.N(r6(s2 - s1))} ÷ ${f.N(k)} = ${f.N(n)}.`, `Semaines pour combler l\'écart : ${f.N(r6(s2 - s1))} ÷ ${f.N(k)} = ${f.N(n)}.`))],
    nudge: t('How big is the gap at the start, and how much of it closes each week?', 'Quel est l\'écart au départ, et quelle part s\'en comble chaque semaine ?'),
  };
});

const rule = (f: F, a: number, b: number): string => f.m(`t = ${f.n(a)}n + ${f.n(b)}`);

/** MS.G7.C1.3.a: pattern rules and solving for unknowns */
export const patternRules7 = numGen('MS.G7.C1.3.a', (tier, r) => {
  const a = randInt(r, 2, 9), b = randInt(r, 1, 10);
  if (tier === 1) {
    const n = randInt(r, 8, 15);
    return {
      prompt: bi((f) => f.t(`The rule for a pattern is ${rule(f, a, b)}, where n is the term number. What is term ${f.N(n)}?`, `La règle d\'une suite est ${rule(f, a, b)}, où n est le numéro du terme. Quel est le terme ${f.N(n)} ?`)),
      answer: a * n + b,
      wrong: [[a + n + b, t('It looks like the number beside n was added. It means multiply: 3n is 3 times n.', 'Il semble que le nombre à côté de n a été additionné. Il signifie multiplier : 3n veut dire 3 fois n.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Replace n with ${f.N(n)}: ${f.N(a)} × ${f.N(n)} + ${f.N(b)}.`, `Remplace n par ${f.N(n)} : ${f.N(a)} × ${f.N(n)} + ${f.N(b)}.`)), bi((f) => f.t(`${f.N(a * n)} + ${f.N(b)} = ${f.N(a * n + b)}.`, `${f.N(a * n)} + ${f.N(b)} = ${f.N(a * n + b)}.`))],
      nudge: t('Put the term number in place of n, then multiply before you add.', 'Remplace n par le numéro du terme, puis multiplie avant d\'additionner.'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 5, 20);
    const V = a * n + b;
    return {
      prompt: bi((f) => f.t(`The rule for a pattern is ${rule(f, a, b)}. Which term number has the value ${f.N(V)}?`, `La règle d\'une suite est ${rule(f, a, b)}. Quel numéro de terme a la valeur ${f.N(V)} ?`)),
      answer: n, category: 'TH',
      wrong: [[(V - b) * a, t('It looks like the subtraction was done but then the result was multiplied. Undo multiplying by dividing.', 'Il semble que la soustraction a été faite, puis que le résultat a été multiplié. Défais la multiplication en divisant.'), 1], [r6(V / a), t('It looks like the constant was forgotten. Subtract it first, then divide.', 'Il semble que la constante a été oubliée. Soustrais-la d\'abord, puis divise.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Solve ${f.N(a)}n + ${f.N(b)} = ${f.N(V)}. Subtract ${f.N(b)} from both sides: ${f.N(a)}n = ${f.N(V - b)}.`, `Résous ${f.N(a)}n + ${f.N(b)} = ${f.N(V)}. Soustrais ${f.N(b)} des deux côtés : ${f.N(a)}n = ${f.N(V - b)}.`)), bi((f) => f.t(`Divide by ${f.N(a)}: n = ${f.N(n)}.`, `Divise par ${f.N(a)} : n = ${f.N(n)}.`))],
      nudge: t('Write an equation with n, then undo the steps one at a time.', 'Écris une équation avec n, puis défais les étapes une à la fois.'),
    };
  }
  const x1 = randInt(r, 2, 5), x2 = x1 + 4, T = randInt(r, 15, 25);
  return {
    prompt: bi((f) => f.t(`A pattern grows by the same amount each time. Term ${f.N(x1)} is ${f.N(a * x1 + b)} and term ${f.N(x2)} is ${f.N(a * x2 + b)}. What is term ${f.N(T)}?`, `Une suite croît de la même quantité chaque fois. Le terme ${f.N(x1)} vaut ${f.N(a * x1 + b)} et le terme ${f.N(x2)} vaut ${f.N(a * x2 + b)}. Quel est le terme ${f.N(T)} ?`)),
    answer: a * T + b, category: 'TH',
    wrong: [[a * x2 + b + (T - x2), t('It looks like 1 was added for each term. Use the amount the pattern really grows by each time.', 'Il semble que 1 a été ajouté pour chaque terme. Utilise la quantité dont la suite croît vraiment chaque fois.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`The terms are ${f.N(x2 - x1)} apart and differ by ${f.N(a * 4)}, so the jump is ${f.N(a * 4)} ÷ ${f.N(4)} = ${f.N(a)}.`, `Les termes sont à ${f.N(x2 - x1)} d\'écart et diffèrent de ${f.N(a * 4)} : l\'écart est ${f.N(a * 4)} ÷ ${f.N(4)} = ${f.N(a)}.`)), bi((f) => f.t(`From term ${f.N(x2)} to term ${f.N(T)} is ${f.N(T - x2)} jumps: ${f.N(a * x2 + b)} + ${f.N(T - x2)} × ${f.N(a)} = ${f.N(a * T + b)}.`, `Du terme ${f.N(x2)} au terme ${f.N(T)}, il y a ${f.N(T - x2)} écarts : ${f.N(a * x2 + b)} + ${f.N(T - x2)} × ${f.N(a)} = ${f.N(a * T + b)}.`))],
    nudge: t('Find the jump first: the difference in value divided by the difference in term numbers.', 'Trouve d\'abord l\'écart : la différence de valeur divisée par la différence des numéros de terme.'),
  };
});

/** MS.G7.C1.4.a: patterns among integers */
export const integerPatterns7 = numGen('MS.G7.C1.4.a', (tier, r) => {
  const d = randInt(r, 2, 9);
  if (tier === 1) {
    const s = -randInt(r, 12, 30);
    const shown = [0, 1, 2, 3].map((i) => s + d * i);
    return {
      prompt: bi((f) => f.t(`What is the next term? ${f.m(shown.map((x) => f.n(x)).join(',\\ '))}, ...`, `Quel est le terme suivant ? ${f.m(shown.map((x) => f.n(x)).join(',\\ '))}, ...`)),
      answer: s + d * 4,
      wrong: [[s - d * 4, t('It looks like the pattern was read as going down. The numbers are getting greater (closer to zero), so add.', 'Il semble que la suite a été lue comme décroissante. Les nombres augmentent (ils se rapprochent de zéro) : additionne.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The jump is ${f.N(shown[1]!)} − ${f.N(shown[0]!)} = ${f.N(d)}.`, `L\'écart est ${f.N(shown[1]!)} − ${f.N(shown[0]!)} = ${f.N(d)}.`)), bi((f) => f.t(`${f.N(shown[3]!)} + ${f.N(d)} = ${f.N(s + d * 4)}.`, `${f.N(shown[3]!)} + ${f.N(d)} = ${f.N(s + d * 4)}.`))],
      nudge: t('Are the numbers going up or down? Find the jump.', 'Les nombres montent-ils ou descendent-ils ? Trouve l\'écart.'),
    };
  }
  if (tier === 2) {
    const s = randInt(r, 10, 25);
    const shown = [0, 1, 2, 3].map((i) => s - d * i);
    return {
      prompt: bi((f) => f.t(`This pattern goes down by the same amount each time: ${f.m(shown.map((x) => f.n(x)).join(',\\ '))}, ... What is the 6th term?`, `Cette suite diminue de la même quantité chaque fois : ${f.m(shown.map((x) => f.n(x)).join(',\\ '))}, ... Quel est le 6e terme ?`)),
      answer: s - d * 5,
      wrong: [[s - d * 6, t('It looks like one jump too many was taken. The 6th term is 5 jumps from the first.', 'Il semble qu\'un écart de trop a été pris. Le 6e terme est à 5 écarts du premier.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The pattern goes down by ${f.N(d)} each time. The 6th term is 5 jumps after the first.`, `La suite diminue de ${f.N(d)} chaque fois. Le 6e terme est à 5 écarts du premier.`)), bi((f) => f.t(`${f.N(s)} − 5 × ${f.N(d)} = ${f.N(s - d * 5)}.`, `${f.N(s)} − 5 × ${f.N(d)} = ${f.N(s - d * 5)}.`))],
      nudge: t('How many jumps are there from term 1 to term 6?', 'Combien d\'écarts y a-t-il du terme 1 au terme 6 ?'),
    };
  }
  const s = -randInt(r, 5, 20), n = randInt(r, 8, 12);
  return {
    prompt: bi((f) => f.t(`Term 1 of a pattern is ${f.N(s)}. Each term is ${f.N(d)} less than the one before. What is term ${f.N(n)}?`, `Le terme 1 d\'une suite est ${f.N(s)}. Chaque terme est inférieur de ${f.N(d)} au précédent. Quel est le terme ${f.N(n)} ?`)),
    answer: s - d * (n - 1), category: 'AP',
    wrong: [[s + d * (n - 1), t('It looks like the jumps were added. "Less than" means subtract, so the terms get more negative.', 'Il semble que les écarts ont été additionnés. « Inférieur de » veut dire soustraire : les termes deviennent plus négatifs.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`There are ${f.N(n - 1)} jumps after term 1, each of −${f.N(d)}.`, `Il y a ${f.N(n - 1)} écarts après le terme 1, chacun de −${f.N(d)}.`)), bi((f) => f.t(`${f.N(s)} − ${f.N(n - 1)} × ${f.N(d)} = ${f.N(s - d * (n - 1))}.`, `${f.N(s)} − ${f.N(n - 1)} × ${f.N(d)} = ${f.N(s - d * (n - 1))}.`))],
    nudge: t('Count the jumps, then subtract the total from the first term.', 'Compte les écarts, puis soustrais le total du premier terme.'),
  };
});

/** MS.G7.C2.1.a: add and subtract monomials of degree 1 */
export const likeTerms7 = numGen('MS.G7.C2.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 12), b = randInt(r, 2, 12);
    return {
      prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}x + ${f.n(b)}x`)}. What is the number in front of x?`, `Simplifie ${f.m(`${f.n(a)}x + ${f.n(b)}x`)}. Quel est le nombre devant x ?`)),
      answer: a + b,
      wrong: [[a * b, t('It looks like the numbers were multiplied. Like terms are added: 3x + 4x means 3 x\'s and 4 x\'s, which is 7 x\'s.', 'Il semble que les nombres ont été multipliés. Les termes semblables s\'additionnent : 3x + 4x, c\'est 3 x et 4 x, donc 7 x.'), 0]] as Wrong,
      steps: [t('Both terms have x, so they are like terms. Add the numbers in front.', 'Les deux termes ont x : ce sont des termes semblables. Additionne les nombres devant.'), bi((f) => f.t(`${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}, so the result is ${f.m(`${f.n(a + b)}x`)}.`, `${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}, donc le résultat est ${f.m(`${f.n(a + b)}x`)}.`))],
      nudge: t('Add the numbers in front of x.', 'Additionne les nombres devant x.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 6, 15), b = randInt(r, 2, 5), c = randInt(r, 2, 8);
    return {
      prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}x - ${f.n(b)}x + ${f.n(c)}x`)}. What is the number in front of x?`, `Simplifie ${f.m(`${f.n(a)}x - ${f.n(b)}x + ${f.n(c)}x`)}. Quel est le nombre devant x ?`)),
      answer: a - b + c,
      wrong: [[a - b - c, t('It looks like the last term was subtracted. Only the term with the minus sign in front of it is subtracted.', 'Il semble que le dernier terme a été soustrait. Seul le terme précédé du signe moins est soustrait.'), 1]] as Wrong,
      steps: [t('All the terms have x, so combine the numbers in front, left to right.', 'Tous les termes ont x : combine les nombres devant, de gauche à droite.'), bi((f) => f.t(`${f.N(a)} − ${f.N(b)} + ${f.N(c)} = ${f.N(a - b + c)}.`, `${f.N(a)} − ${f.N(b)} + ${f.N(c)} = ${f.N(a - b + c)}.`))],
      nudge: t('Work from left to right with the numbers in front of x.', 'Va de gauche à droite avec les nombres devant x.'),
    };
  }
  const a = randInt(r, 2, 9), b = randInt(r, 4, 12), c = randInt(r, 2, 9), d = randInt(r, 1, 3), x = randInt(r, 2, 9);
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}x + ${f.n(b)} + ${f.n(c)}x - ${f.n(d)}`)}, then find its value when x = ${f.N(x)}.`, `Simplifie ${f.m(`${f.n(a)}x + ${f.n(b)} + ${f.n(c)}x - ${f.n(d)}`)}, puis trouve sa valeur quand x = ${f.N(x)}.`)),
    answer: (a + c) * x + b - d,
    wrong: [[(a + c + b - d) * x, t('It looks like the plain numbers were combined with the x terms. Only the x terms combine with each other; the plain numbers combine separately.', 'Il semble que les nombres seuls ont été combinés avec les termes en x. Seuls les termes en x se combinent entre eux ; les nombres seuls se combinent à part.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Combine like terms: ${f.m(`${f.n(a + c)}x + ${f.n(b - d)}`)}.`, `Combine les termes semblables : ${f.m(`${f.n(a + c)}x + ${f.n(b - d)}`)}.`)), bi((f) => f.t(`Replace x with ${f.N(x)}: ${f.N(a + c)} × ${f.N(x)} + ${f.N(b - d)} = ${f.N((a + c) * x + b - d)}.`, `Remplace x par ${f.N(x)} : ${f.N(a + c)} × ${f.N(x)} + ${f.N(b - d)} = ${f.N((a + c) * x + b - d)}.`))],
    nudge: t('Combine the x terms and the plain numbers separately, then evaluate.', 'Combine séparément les termes en x et les nombres seuls, puis évalue.'),
  };
});

/** MS.G7.C2.2.a: evaluate expressions with whole numbers and decimals */
export const evalDecimal7 = numGen('MS.G7.C2.2.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9) / 10, n = randInt(r, 3, 12);
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}n`)} when n = ${f.N(n)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}n`)} quand n = ${f.N(n)}.`)),
      answer: r6(a * n),
      wrong: [[r6(a + n), t('It looks like the numbers were added. A number beside a letter means multiply.', 'Il semble que les nombres ont été additionnés. Un nombre collé à une lettre signifie multiplier.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.m(`${f.n(a)}n`)} means ${f.N(a)} × n. Replace n with ${f.N(n)}.`, `${f.m(`${f.n(a)}n`)} veut dire ${f.N(a)} × n. Remplace n par ${f.N(n)}.`)), bi((f) => f.t(`${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`, `${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`))],
      nudge: t('Multiply the decimal by the value of n.', 'Multiplie le nombre décimal par la valeur de n.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 11, 49) / 10, b = randInt(r, 11, 49) / 10, n = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}n + ${f.n(b)}`)} when n = ${f.N(n)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}n + ${f.n(b)}`)} quand n = ${f.N(n)}.`)),
      answer: r6(a * n + b),
      wrong: [[r6((a + b) * n), t('It looks like the plain number was multiplied by n too. Multiply only the term with n, then add.', 'Il semble que le nombre seul a aussi été multiplié par n. Multiplie seulement le terme en n, puis additionne.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Multiply first: ${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`, `Multiplie d\'abord : ${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`)), bi((f) => f.t(`Then add: ${f.N(r6(a * n))} + ${f.N(b)} = ${f.N(r6(a * n + b))}.`, `Puis additionne : ${f.N(r6(a * n))} + ${f.N(b)} = ${f.N(r6(a * n + b))}.`))],
      nudge: t('Multiply before you add.', 'Multiplie avant d\'additionner.'),
    };
  }
  const x = randInt(r, 4, 12), y = randInt(r, 1, x - 1);
  const a = randInt(r, 12, 49) / 10, b = randInt(r, 11, 29) / 10;
  return {
    prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}x - ${f.n(b)}y`)} when x = ${f.N(x)} and y = ${f.N(y)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}x - ${f.n(b)}y`)} quand x = ${f.N(x)} et y = ${f.N(y)}.`)),
    answer: r6(a * x - b * y),
    wrong: [[r6((a - b) * (x - y)), t('It looks like the terms were subtracted before multiplying. Multiply each term first, then subtract.', 'Il semble que les termes ont été soustraits avant de multiplier. Multiplie d\'abord chaque terme, puis soustrais.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`${f.N(a)} × ${f.N(x)} = ${f.N(r6(a * x))} and ${f.N(b)} × ${f.N(y)} = ${f.N(r6(b * y))}.`, `${f.N(a)} × ${f.N(x)} = ${f.N(r6(a * x))} et ${f.N(b)} × ${f.N(y)} = ${f.N(r6(b * y))}.`)), bi((f) => f.t(`${f.N(r6(a * x))} − ${f.N(r6(b * y))} = ${f.N(r6(a * x - b * y))}.`, `${f.N(r6(a * x))} − ${f.N(r6(b * y))} = ${f.N(r6(a * x - b * y))}.`))],
    nudge: t('Replace each letter, multiply each term, then subtract.', 'Remplace chaque lettre, multiplie chaque terme, puis soustrais.'),
  };
});

/** MS.G7.C2.3.a: multi-term equations with whole numbers and decimals */
export const equations7 = numGen('MS.G7.C2.3.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9), x = randInt(r, 2, 15), b = randInt(r, 1, 20);
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(a * x + b)}`)}.`, `Résous ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(a * x + b)}`)}.`)),
      answer: x,
      wrong: [[(a * x + b) / a - b, t('It looks like the plain number was subtracted after dividing. Subtract it first, then divide.', 'Il semble que le nombre seul a été soustrait après la division. Soustrais-le d\'abord, puis divise.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Subtract ${f.N(b)} from both sides: ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`, `Soustrais ${f.N(b)} des deux côtés : ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: x = ${f.N(x)}. Check: ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(a * x + b)}.`, `Divise les deux côtés par ${f.N(a)} : x = ${f.N(x)}. Vérifie : ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(a * x + b)}.`))],
      nudge: t('Undo the adding first, then undo the multiplying.', 'Défais d\'abord l\'addition, puis la multiplication.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 2, 6), x = randInt(r, 5, 60) / 10, b = randInt(r, 2, 19) / 10;
    const c = r6(a * x + b);
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}`)}.`, `Résous ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}`)}.`)),
      answer: x,
      wrong: [[r6(c / a - b), t('It looks like the plain number was subtracted after dividing. Subtract it first, then divide.', 'Il semble que le nombre seul a été soustrait après la division. Soustrais-le d\'abord, puis divise.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Subtract ${f.N(b)} from both sides: ${f.m(`${f.n(a)}x = ${f.n(r6(c - b))}`)}.`, `Soustrais ${f.N(b)} des deux côtés : ${f.m(`${f.n(a)}x = ${f.n(r6(c - b))}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: x = ${f.N(x)}.`, `Divise les deux côtés par ${f.N(a)} : x = ${f.N(x)}.`))],
      nudge: t('Undo the adding first, then the multiplying. Keep the decimal points lined up.', 'Défais d\'abord l\'addition, puis la multiplication. Garde les virgules alignées.'),
    };
  }
  const c = randInt(r, 2, 5), a = c + randInt(r, 1, 5), x = randInt(r, 2, 12), b = randInt(r, 1, 15);
  const dd = (a - c) * x + b;
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}x + ${f.n(dd)}`)}.`, `Résous ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}x + ${f.n(dd)}`)}.`)),
    answer: x,
    wrong: [[dd - b, t('It looks like only the plain numbers were compared. First gather the x terms on one side.', 'Il semble que seuls les nombres seuls ont été comparés. Rassemble d\'abord les termes en x d\'un côté.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Subtract ${f.m(`${f.n(c)}x`)} from both sides: ${f.m(`${f.n(a - c)}x + ${f.n(b)} = ${f.n(dd)}`)}.`, `Soustrais ${f.m(`${f.n(c)}x`)} des deux côtés : ${f.m(`${f.n(a - c)}x + ${f.n(b)} = ${f.n(dd)}`)}.`)), bi((f) => f.t(`Subtract ${f.N(b)}: ${f.m(`${f.n(a - c)}x = ${f.n(dd - b)}`)}. Divide by ${f.N(a - c)}: x = ${f.N(x)}.`, `Soustrais ${f.N(b)} : ${f.m(`${f.n(a - c)}x = ${f.n(dd - b)}`)}. Divise par ${f.N(a - c)} : x = ${f.N(x)}.`))],
    nudge: t('Get the x terms on one side by subtracting the smaller one from both sides.', 'Rassemble les termes en x d\'un côté en soustrayant le plus petit des deux côtés.'),
  };
});

/** MS.G7.C2.4.a: solve, verify and graph inequalities with whole numbers */
export const inequalities7 = numGen('MS.G7.C2.4.a', (tr, rr) => {
    const a = randInt(rr, 2, 7), b = randInt(rr, 1, 12);
    if (tr === 1) {
      const q = randInt(rr, 3, 12);
      const c = a * q + b;
      return {
        prompt: bi((f) => f.t(`What is the greatest whole number x that makes ${f.m(`${f.n(a)}x + ${f.n(b)} < ${f.n(c)}`)} true?`, `Quel est le plus grand nombre entier x qui rend ${f.m(`${f.n(a)}x + ${f.n(b)} < ${f.n(c)}`)} vraie ?`)),
        answer: q - 1,
        wrong: [[q, t(`x = ${q} makes both sides equal, and "less than" does not allow equal. Choose the next smaller whole number.`, `x = ${q} rend les deux côtés égaux, et « plus petit que » n'accepte pas l'égalité. Choisis le nombre entier juste en dessous.`), 1]] as Wrong,
        steps: [bi((f) => f.t(`Subtract ${f.N(b)}: ${f.m(`${f.n(a)}x < ${f.n(a * q)}`)}. Divide by ${f.N(a)}: ${f.m(`x < ${f.n(q)}`)}.`, `Soustrais ${f.N(b)} : ${f.m(`${f.n(a)}x < ${f.n(a * q)}`)}. Divise par ${f.N(a)} : ${f.m(`x < ${f.n(q)}`)}.`)), bi((f) => f.t(`x must be less than ${f.N(q)}, so the greatest whole number is ${f.N(q - 1)}.`, `x doit être inférieur à ${f.N(q)}, donc le plus grand nombre entier est ${f.N(q - 1)}.`))],
        nudge: t('Solve it like an equation, then decide whether the boundary number itself is allowed.', 'Résous-la comme une équation, puis décide si le nombre frontière lui-même est permis.'),
      };
    }
    if (tr === 2) {
      const q = randInt(rr, 3, 12);
      const extra = randInt(rr, 1, a - 1);
      const c = a * q + extra + b;
      return {
        prompt: bi((f) => f.t(`What is the greatest whole number x that makes ${f.m(`${f.n(a)}x + ${f.n(b)} \\leq ${f.n(c)}`)} true?`, `Quel est le plus grand nombre entier x qui rend ${f.m(`${f.n(a)}x + ${f.n(b)} \\leq ${f.n(c)}`)} vraie ?`)),
        answer: q,
        wrong: [[q + 1, t('It looks like the answer was rounded up. The solutions are numbers up to the boundary, so round down.', 'Il semble que la réponse a été arrondie à l\'unité supérieure. Les solutions vont jusqu\'à la frontière : arrondis à l\'unité inférieure.'), 1]] as Wrong,
        steps: [bi((f) => f.t(`Subtract ${f.N(b)}: ${f.m(`${f.n(a)}x \\leq ${f.n(a * q + extra)}`)}. Divide by ${f.N(a)}: x ≤ ${f.n(r6((a * q + extra) / a))}.`, `Soustrais ${f.N(b)} : ${f.m(`${f.n(a)}x \\leq ${f.n(a * q + extra)}`)}. Divise par ${f.N(a)} : x ≤ ${f.n(r6((a * q + extra) / a))}.`)), bi((f) => f.t(`The greatest whole number not above that is ${f.N(q)}.`, `Le plus grand nombre entier qui ne dépasse pas cette valeur est ${f.N(q)}.`))],
        nudge: t('Solve for x, then find the greatest whole number that still fits.', 'Résous pour x, puis trouve le plus grand nombre entier qui convient encore.'),
      };
    }
    const q = randInt(rr, 6, 15);
    const b3 = randInt(rr, 1, 9);
    const extra = randInt(rr, 0, a - 1);
    const c = a * q + extra - b3;
    const least = Math.floor((c + b3) / a) + 1;
    return {
      prompt: bi((f) => f.t(`What is the least whole number x that makes ${f.m(`${f.n(a)}x - ${f.n(b3)} > ${f.n(c)}`)} true?`, `Quel est le plus petit nombre entier x qui rend ${f.m(`${f.n(a)}x - ${f.n(b3)} > ${f.n(c)}`)} vraie ?`)),
      answer: least,
      wrong: [[Math.floor((c + b3) / a), t('That number makes a smaller or equal result, not a greater one. The solutions start just above the boundary.', 'Ce nombre donne un résultat plus petit ou égal, pas plus grand. Les solutions commencent juste au-dessus de la frontière.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Add ${f.N(b3)}: ${f.m(`${f.n(a)}x > ${f.n(c + b3)}`)}. Divide by ${f.N(a)}: x > ${f.n(r6((c + b3) / a))}.`, `Ajoute ${f.N(b3)} : ${f.m(`${f.n(a)}x > ${f.n(c + b3)}`)}. Divise par ${f.N(a)} : x > ${f.n(r6((c + b3) / a))}.`)), bi((f) => f.t(`The least whole number greater than that is ${f.N(least)}.`, `Le plus petit nombre entier supérieur à cette valeur est ${f.N(least)}.`))],
      nudge: t('Solve for x, then pick the first whole number above the boundary.', 'Résous pour x, puis choisis le premier nombre entier au-dessus de la frontière.'),
    };
});
