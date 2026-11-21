// Grades 5-6 Algebra strand (C): patterns, evaluating expressions, equations and inequalities.
import { randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, choiceGen, mc, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const list = (f: { n: (x: number) => string }, xs: number[]): string => xs.map((x) => f.n(x)).join(',\\ ');

/** MS.G5.C1.3.a: pattern rules, next and missing terms */
export const growingPatternRule = numGen('MS.G5.C1.3.a', (tier, r) => {
  const a = randInt(r, 2, 9);
  const d = randInt(r, 2, 7);
  const term = (n: number): number => a + d * (n - 1);
  if (tier === 1) {
    const shown = [1, 2, 3, 4].map(term);
    return {
      prompt: bi((f) => f.t(`A pattern starts ${f.m(list(f, shown))}, ... What is the next term?`, `Une suite commence par ${f.m(list(f, shown))}, ... Quel est le terme suivant ?`)),
      answer: term(5),
      wrong: [[term(5) + 1, t('It looks like the jump grew by one. The jump stays the same each time.', 'Il semble que l\'écart a augmenté de un. L\'écart reste le même chaque fois.'), 0]],
      steps: [bi((f) => f.t(`Find the jump: ${f.N(shown[1]!)} − ${f.N(shown[0]!)} = ${f.N(d)}.`, `Trouve l\'écart : ${f.N(shown[1]!)} − ${f.N(shown[0]!)} = ${f.N(d)}.`)), bi((f) => f.t(`Add ${f.N(d)} to the last term: ${f.N(shown[3]!)} + ${f.N(d)} = ${f.N(term(5))}.`, `Ajoute ${f.N(d)} au dernier terme : ${f.N(shown[3]!)} + ${f.N(d)} = ${f.N(term(5))}.`))],
      nudge: t('How much does the pattern go up each time?', 'De combien la suite augmente-t-elle chaque fois ?'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 7, 10);
    return {
      prompt: bi((f) => f.t(`A pattern starts at ${f.N(a)} and goes up by ${f.N(d)} each time. What is term number ${f.N(n)}?`, `Une suite commence à ${f.N(a)} et augmente de ${f.N(d)} chaque fois. Quel est le terme numéro ${f.N(n)} ?`)),
      answer: term(n),
      wrong: [[a + d * n, t('It looks like one jump too many was added. Term 1 is the starting number, so there are one fewer jumps than the term number.', 'Il semble qu\'un écart de trop a été ajouté. Le terme 1 est le nombre de départ : il y a un écart de moins que le numéro du terme.'), 1], [d * n, t('It looks like the starting number was left out.', 'Il semble que le nombre de départ a été oublié.'), 1]],
      steps: [bi((f) => f.t(`Term ${f.N(n)} needs ${f.N(n - 1)} jumps from the start.`, `Le terme ${f.N(n)} demande ${f.N(n - 1)} écarts à partir du départ.`)), bi((f) => f.t(`${f.N(a)} + ${f.N(n - 1)} × ${f.N(d)} = ${f.N(term(n))}.`, `${f.N(a)} + ${f.N(n - 1)} × ${f.N(d)} = ${f.N(term(n))}.`))],
      nudge: t('How many jumps are there between term 1 and the term you want?', 'Combien d\'écarts y a-t-il entre le terme 1 et le terme demandé ?'),
    };
  }
  const k = randInt(r, 2, 4);
  const shown = [1, 2, 3, 4, 5].map(term);
  const hidden = shown[k]!;
  return {
    prompt: bi((f) => f.t(`Find the missing term: ${f.m(shown.map((x, i) => (i === k ? '\\square' : f.n(x))).join(',\\ '))}.`, `Trouve le terme manquant : ${f.m(shown.map((x, i) => (i === k ? '\\square' : f.n(x))).join(',\\ '))}.`)),
    answer: hidden,
    wrong: [[hidden + d, t('It looks like the jump was added twice.', 'Il semble que l\'écart a été ajouté deux fois.'), 1]],
    steps: [bi((f) => f.t(`The jump is ${f.N(d)} (look at two terms side by side).`, `L\'écart est ${f.N(d)} (regarde deux termes côte à côte).`)), bi((f) => f.t(`Add ${f.N(d)} to the term before the gap: ${f.N(shown[k - 1]!)} + ${f.N(d)} = ${f.N(hidden)}.`, `Ajoute ${f.N(d)} au terme avant la case vide : ${f.N(shown[k - 1]!)} + ${f.N(d)} = ${f.N(hidden)}.`))],
    nudge: t('Find the jump between two terms that are next to each other.', 'Trouve l\'écart entre deux termes côte à côte.'),
    category: 'AP',
  };
});

/** MS.G5.C1.4.a: patterns with decimal tenths and hundredths */
export const decimalPattern = numGen('MS.G5.C1.4.a', (tier, r) => {
  const unit = tier === 1 ? 10 : 100;
  const start = randInt(r, 2, 20);
  const step = randInt(r, 2, 9);
  const shrinking = tier === 3;
  const first = tier === 3 ? start * 10 : start;
  const val = (n: number): number => r6((first + (shrinking ? -step : step) * n) / (tier === 3 ? 100 : unit));
  const shown = [0, 1, 2, 3].map(val);
  const jump = r6(step / (tier === 3 ? 100 : unit));
  const verb = shrinking ? 'subtracting' : 'adding';
  return {
    prompt: bi((f) => f.t(`This pattern is made by ${verb} the same amount each time: ${f.m(list(f, shown))}, ... What is the next term?`, `Cette suite est construite en ${shrinking ? 'soustrayant' : 'ajoutant'} chaque fois la même quantité : ${f.m(list(f, shown))}, ... Quel est le terme suivant ?`)),
    answer: val(4),
    wrong: [[r6(val(3) + (shrinking ? -1 : 1) * (tier === 3 ? 0.1 : 1)), t('It looks like the jump was read as a whole number or a different place value. Check the place value of the jump.', 'Il semble que l\'écart a été lu comme un nombre entier ou une autre valeur de position. Vérifie la valeur de position de l\'écart.'), 0]],
    steps: [bi((f) => f.t(`The jump is ${f.N(jump)} (${f.N(shown[1]!)} and ${f.N(shown[0]!)} differ by ${f.N(jump)}).`, `L\'écart est ${f.N(jump)} (${f.N(shown[1]!)} et ${f.N(shown[0]!)} diffèrent de ${f.N(jump)}).`)), bi((f) => f.t(`${f.N(shown[3]!)} ${shrinking ? '−' : '+'} ${f.N(jump)} = ${f.N(val(4))}.`, `${f.N(shown[3]!)} ${shrinking ? '−' : '+'} ${f.N(jump)} = ${f.N(val(4))}.`))],
    nudge: t('Line up the decimal points and find how much changes each time.', 'Aligne les virgules et trouve de combien la suite change chaque fois.'),
  };
});

/** MS.G5.C2.2.a: evaluate expressions with whole numbers */
export const evalWhole = numGen('MS.G5.C2.2.a', (tier, r) => {
  const n = randInt(r, 2, 9);
  const a = randInt(r, 2, 9);
  const b = randInt(r, 1, 12);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`n + ${f.n(a)}`)} when ${f.m(`n = ${f.n(n)}`)}.`, `Trouve la valeur de ${f.m(`n + ${f.n(a)}`)} quand ${f.m(`n = ${f.n(n)}`)}.`)),
      answer: n + a,
      steps: [t('Replace the letter with its value.', 'Remplace la lettre par sa valeur.'), bi((f) => `${f.N(n)} + ${f.N(a)} = ${f.N(n + a)}.`)],
      nudge: t('Put the number in place of the letter, then calculate.', 'Mets le nombre à la place de la lettre, puis calcule.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}n + ${f.n(b)}`)} when ${f.m(`n = ${f.n(n)}`)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}n + ${f.n(b)}`)} quand ${f.m(`n = ${f.n(n)}`)}.`)),
      answer: a * n + b,
      wrong: [[a + n + b, t('It looks like ' + 'the letter was added instead of multiplied. A number next to a letter means multiply.', 'Il semble que la lettre a été additionnée au lieu d\'être multipliée. Un nombre collé à une lettre signifie multiplier.'), 1], [Number(`${a}${n}`) + b, t('It looks like the digits were put side by side. Multiply the number by the value instead.', 'Il semble que les chiffres ont été mis côte à côte. Multiplie plutôt le nombre par la valeur.'), 1]],
      steps: [bi((f) => f.t(`${f.m(`${f.n(a)}n`)} means ${f.N(a)} × ${f.N(n)} = ${f.N(a * n)}.`, `${f.m(`${f.n(a)}n`)} signifie ${f.N(a)} × ${f.N(n)} = ${f.N(a * n)}.`)), bi((f) => `${f.N(a * n)} + ${f.N(b)} = ${f.N(a * n + b)}.`)],
      nudge: t('A number next to a letter means multiply. Do that first.', 'Un nombre collé à une lettre signifie multiplier. Fais-le d\'abord.'),
    };
  }
  const c = randInt(r, 1, 6);
  const val = a * (n + b) - c;
  return {
    prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}(n + ${f.n(b)}) - ${f.n(c)}`)} when ${f.m(`n = ${f.n(n)}`)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}(n + ${f.n(b)}) - ${f.n(c)}`)} quand ${f.m(`n = ${f.n(n)}`)}.`)),
    answer: val,
    wrong: [[a * n + b - c, t('It looks like the brackets were skipped. Work inside the brackets first.', 'Il semble que les parenthèses ont été ignorées. Calcule d\'abord à l\'intérieur des parenthèses.'), 0]],
    steps: [bi((f) => f.t(`Brackets first: ${f.N(n)} + ${f.N(b)} = ${f.N(n + b)}.`, `D\'abord les parenthèses : ${f.N(n)} + ${f.N(b)} = ${f.N(n + b)}.`)), bi((f) => f.t(`Multiply: ${f.N(a)} × ${f.N(n + b)} = ${f.N(a * (n + b))}.`, `Multiplie : ${f.N(a)} × ${f.N(n + b)} = ${f.N(a * (n + b))}.`)), bi((f) => f.t(`Subtract: ${f.N(a * (n + b))} − ${f.N(c)} = ${f.N(val)}.`, `Soustrais : ${f.N(a * (n + b))} − ${f.N(c)} = ${f.N(val)}.`))],
    nudge: t('Work inside the brackets first, then multiply, then subtract.', 'Calcule d\'abord entre parenthèses, puis multiplie, puis soustrais.'),
    category: 'AP',
  };
});

/** MS.G5.C2.3.a: solve equations with whole numbers */
export const solveEq5 = numGen('MS.G5.C2.3.a', (tier, r) => {
  const x = randInt(r, 3, 20);
  const a = randInt(r, 2, 9);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`x + ${f.n(a)} = ${f.n(x + a)}`)}.`, `Résous ${f.m(`x + ${f.n(a)} = ${f.n(x + a)}`)}.`)),
      answer: x,
      wrong: [[x + 2 * a, t('It looks like ' + 'the number was added instead of subtracted. To undo an addition, subtract.', 'Il semble que le nombre a été additionné au lieu d\'être soustrait. Pour défaire une addition, soustrais.'), 0]],
      steps: [t('Undo adding by subtracting the same number from both sides.', 'Défais l\'addition en soustrayant le même nombre des deux côtés.'), bi((f) => `${f.N(x + a)} − ${f.N(a)} = ${f.N(x)}, ${f.t('so', 'donc')} ${f.m(`x = ${f.n(x)}`)}.`), bi((f) => f.t(`Check: ${f.N(x)} + ${f.N(a)} = ${f.N(x + a)}.`, `Vérifie : ${f.N(x)} + ${f.N(a)} = ${f.N(x + a)}.`))],
      nudge: t('What undoes adding?', 'Qu\'est-ce qui défait une addition ?'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`, `Résous ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`)),
      answer: x,
      wrong: [[a * x - a, t('It looks like ' + 'the number was subtracted. To undo multiplying, divide.', 'Il semble que le nombre a été soustrait. Pour défaire une multiplication, divise.'), 0]],
      steps: [t('Undo multiplying by dividing both sides by the same number.', 'Défais la multiplication en divisant les deux côtés par le même nombre.'), bi((f) => `${f.N(a * x)} ÷ ${f.N(a)} = ${f.N(x)}, ${f.t('so', 'donc')} ${f.m(`x = ${f.n(x)}`)}.`), bi((f) => f.t(`Check: ${f.N(a)} × ${f.N(x)} = ${f.N(a * x)}.`, `Vérifie : ${f.N(a)} × ${f.N(x)} = ${f.N(a * x)}.`))],
      nudge: t('What undoes multiplying?', 'Qu\'est-ce qui défait une multiplication ?'),
    };
  }
  const b = randInt(r, 2, 15);
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(a * x + b)}`)}.`, `Résous ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(a * x + b)}`)}.`)),
    answer: x,
    wrong: [[(a * x + b) / a, t('It looks like the division was done before removing the added number. Subtract first, then divide.', 'Il semble que la division a été faite avant de retirer le nombre ajouté. Soustrais d\'abord, puis divise.'), 0]],
    steps: [bi((f) => f.t(`Subtract ${f.N(b)} from both sides: ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`, `Soustrais ${f.N(b)} des deux côtés : ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: ${f.m(`x = ${f.n(x)}`)}.`, `Divise les deux côtés par ${f.N(a)} : ${f.m(`x = ${f.n(x)}`)}.`)), bi((f) => f.t(`Check: ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(a * x + b)}.`, `Vérifie : ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(a * x + b)}.`))],
    nudge: t('Undo the adding first, then the multiplying.', 'Défais d\'abord l\'addition, puis la multiplication.'),
    category: 'AP',
  };
});

/** MS.G5.C2.4.a: one-operation inequalities, the greatest or least whole number that works */
export const inequality5 = numGen('MS.G5.C2.4.a', (tier, r) => {
  const a = randInt(r, 3, 12);
  if (tier === 1) {
    const b = randInt(r, a + 4, 45);
    return {
      prompt: bi((f) => f.t(`What is the greatest whole number x that makes ${f.m(`x + ${f.n(a)} < ${f.n(b)}`)} true?`, `Quel est le plus grand nombre entier x qui rend ${f.m(`x + ${f.n(a)} < ${f.n(b)}`)} vrai ?`)),
      answer: b - a - 1,
      wrong: [[b - a, t('It looks like x was allowed to equal the boundary. With "less than", x must be smaller, so it cannot equal it.', 'Il semble que x a pu égaler la limite. Avec « plus petit que », x doit être plus petit : il ne peut pas l\'égaler.'), 1]],
      steps: [bi((f) => f.t(`Subtract ${f.N(a)}: x < ${f.N(b - a)}.`, `Soustrais ${f.N(a)} : x < ${f.N(b - a)}.`)), bi((f) => f.t(`x must be less than ${f.N(b - a)}, so the greatest whole number is ${f.N(b - a - 1)}.`, `x doit être plus petit que ${f.N(b - a)} : le plus grand nombre entier est ${f.N(b - a - 1)}.`))],
      nudge: t('Solve it like an equation first, then decide whether the boundary itself counts.', 'Résous-la d\'abord comme une équation, puis décide si la limite elle-même compte.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 3, 9);
    const total = a * k + randInt(r, 1, a - 1);
    return {
      prompt: bi((f) => f.t(`What is the greatest whole number x that makes ${f.m(`${f.n(a)}x \\le ${f.n(total)}`)} true?`, `Quel est le plus grand nombre entier x qui rend ${f.m(`${f.n(a)}x \\le ${f.n(total)}`)} vrai ?`)),
      answer: k,
      wrong: [[k + 1, t('It looks like the answer was rounded up. The number must keep the product at or below the limit, so round down.', 'Il semble que la réponse a été arrondie vers le haut. Le produit doit rester sous la limite ou égal à celle-ci : arrondis vers le bas.'), 1]],
      steps: [bi((f) => f.t(`Divide by ${f.N(a)}: x ≤ ${f.N(total)} ÷ ${f.N(a)}, about ${f.N(r6(total / a))}.`, `Divise par ${f.N(a)} : x ≤ ${f.N(total)} ÷ ${f.N(a)}, environ ${f.N(r6(total / a))}.`)), bi((f) => f.t(`The greatest whole number not above that is ${f.N(k)}.`, `Le plus grand nombre entier qui ne dépasse pas cette valeur est ${f.N(k)}.`))],
      nudge: t('Divide, then pick the greatest whole number that does not go over.', 'Divise, puis choisis le plus grand nombre entier qui ne dépasse pas.'),
    };
  }
  const b = randInt(r, 5, 25);
  return {
    prompt: bi((f) => f.t(`What is the least whole number x that makes ${f.m(`x - ${f.n(a)} > ${f.n(b)}`)} true?`, `Quel est le plus petit nombre entier x qui rend ${f.m(`x - ${f.n(a)} > ${f.n(b)}`)} vrai ?`)),
    answer: a + b + 1,
    wrong: [[a + b, t('It looks like x was allowed to equal the boundary. With "greater than", x must be bigger, so it cannot equal it.', 'Il semble que x a pu égaler la limite. Avec « plus grand que », x doit être plus grand : il ne peut pas l\'égaler.'), 1]],
    steps: [bi((f) => f.t(`Add ${f.N(a)}: x > ${f.N(a + b)}.`, `Ajoute ${f.N(a)} : x > ${f.N(a + b)}.`)), bi((f) => f.t(`x must be greater than ${f.N(a + b)}, so the least whole number is ${f.N(a + b + 1)}.`, `x doit être plus grand que ${f.N(a + b)} : le plus petit nombre entier est ${f.N(a + b + 1)}.`))],
    nudge: t('Undo the subtraction, then decide whether the boundary itself counts.', 'Défais la soustraction, puis décide si la limite elle-même compte.'),
    category: 'AP',
  };
});

/** MS.G6.C1.3.a: linear patterns, unknowns and predictions */
export const linearPattern6 = numGen('MS.G6.C1.3.a', (tier, r) => {
  const m = randInt(r, 2, 8);
  const c = randInt(r, 1, 9);
  const val = (n: number): number => m * n + c;
  if (tier === 1) {
    const n = randInt(r, 8, 15);
    return {
      prompt: bi((f) => f.t(`A pattern follows the rule value ${f.m(`= ${f.n(m)}n + ${f.n(c)}`)}, where n is the term number. What is the value of term ${f.N(n)}?`, `Une suite suit la règle valeur ${f.m(`= ${f.n(m)}n + ${f.n(c)}`)}, où n est le numéro du terme. Quelle est la valeur du terme ${f.N(n)} ?`)),
      answer: val(n),
      wrong: [[m + n + c, t('It looks like the term number was added to the rest. The number beside n multiplies it.', 'Il semble que le numéro du terme a été additionné au reste. Le nombre à côté de n le multiplie.'), 0]],
      steps: [bi((f) => f.t(`Put n = ${f.N(n)} in the rule: ${f.N(m)} × ${f.N(n)} + ${f.N(c)}.`, `Mets n = ${f.N(n)} dans la règle : ${f.N(m)} × ${f.N(n)} + ${f.N(c)}.`)), bi((f) => `${f.N(m * n)} + ${f.N(c)} = ${f.N(val(n))}.`)],
      nudge: t('Replace n with the term number, multiply, then add.', 'Remplace n par le numéro du terme, multiplie, puis additionne.'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 5, 14);
    return {
      prompt: bi((f) => f.t(`A pattern follows the rule value ${f.m(`= ${f.n(m)}n + ${f.n(c)}`)}. Which term number has the value ${f.N(val(n))}?`, `Une suite suit la règle valeur ${f.m(`= ${f.n(m)}n + ${f.n(c)}`)}. Quel numéro de terme a la valeur ${f.N(val(n))} ?`)),
      answer: n,
      wrong: [[val(n) - c, t('It looks like the starting amount was removed but the result was not divided by the number next to n.', 'Il semble que le montant de départ a été retiré, mais que le résultat n\'a pas été divisé par le nombre à côté de n.'), 1]],
      steps: [bi((f) => f.t(`Subtract ${f.N(c)}: ${f.N(val(n))} − ${f.N(c)} = ${f.N(m * n)}.`, `Soustrais ${f.N(c)} : ${f.N(val(n))} − ${f.N(c)} = ${f.N(m * n)}.`)), bi((f) => f.t(`Divide by ${f.N(m)}: ${f.N(m * n)} ÷ ${f.N(m)} = ${f.N(n)}.`, `Divise par ${f.N(m)} : ${f.N(m * n)} ÷ ${f.N(m)} = ${f.N(n)}.`))],
      nudge: t('Undo the rule: take away the added number, then divide.', 'Défais la règle : retire le nombre ajouté, puis divise.'),
      category: 'AP',
    };
  }
  const n1 = randInt(r, 2, 4);
  const n2 = n1 + randInt(r, 2, 4);
  const target = randInt(r, 10, 14);
  return {
    prompt: bi((f) => f.t(`A growing pattern is linear. Term ${f.N(n1)} is ${f.N(val(n1))} and term ${f.N(n2)} is ${f.N(val(n2))}. What is term ${f.N(target)}?`, `Une suite croissante est linéaire. Le terme ${f.N(n1)} vaut ${f.N(val(n1))} et le terme ${f.N(n2)} vaut ${f.N(val(n2))}. Quelle est la valeur du terme ${f.N(target)} ?`)),
    answer: val(target),
    wrong: [[val(n2) + (target - n2), t('It looks like one was added for each step instead of the pattern\'s jump. Find how much the pattern grows for each term first.', 'Il semble que un a été ajouté à chaque étape au lieu de l\'écart de la suite. Trouve d\'abord de combien la suite croît à chaque terme.'), 0]],
    steps: [bi((f) => f.t(`The jump per term is (${f.N(val(n2))} − ${f.N(val(n1))}) ÷ (${f.N(n2)} − ${f.N(n1)}) = ${f.N(m)}.`, `L\'écart par terme est (${f.N(val(n2))} − ${f.N(val(n1))}) ÷ (${f.N(n2)} − ${f.N(n1)}) = ${f.N(m)}.`)), bi((f) => f.t(`From term ${f.N(n2)} to term ${f.N(target)} is ${f.N(target - n2)} steps: ${f.N(val(n2))} + ${f.N(target - n2)} × ${f.N(m)} = ${f.N(val(target))}.`, `Du terme ${f.N(n2)} au terme ${f.N(target)}, il y a ${f.N(target - n2)} étapes : ${f.N(val(n2))} + ${f.N(target - n2)} × ${f.N(m)} = ${f.N(val(target))}.`))],
    nudge: t('Use the two known terms to find the jump for one term.', 'Sers-toi des deux termes connus pour trouver l\'écart pour un terme.'),
    category: 'TH',
  };
});

/** MS.G6.C2.2.a: evaluate expressions with whole numbers and decimal tenths */
export const evalDecimal6 = numGen('MS.G6.C2.2.a', (tier, r) => {
  const tenth = (): number => randInt(r, 1, 49) / 10;
  if (tier === 1) {
    const x = tenth();
    const a = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`x + ${f.n(a)}`)} when ${f.m(`x = ${f.n(x)}`)}.`, `Trouve la valeur de ${f.m(`x + ${f.n(a)}`)} quand ${f.m(`x = ${f.n(x)}`)}.`)),
      answer: r6(x + a),
      steps: [t('Replace x with its value.', 'Remplace x par sa valeur.'), bi((f) => `${f.N(x)} + ${f.N(a)} = ${f.N(r6(x + a))}.`)],
      nudge: t('Put the decimal in place of x and line up the decimal points.', 'Mets le nombre décimal à la place de x et aligne les virgules.'),
    };
  }
  if (tier === 2) {
    const x = tenth();
    const a = randInt(r, 2, 6);
    const b = randInt(r, 1, 9) / 10;
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}x + ${f.n(b)}`)} when ${f.m(`x = ${f.n(x)}`)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}x + ${f.n(b)}`)} quand ${f.m(`x = ${f.n(x)}`)}.`)),
      answer: r6(a * x + b),
      wrong: [[r6(a + x + b), t('It looks like the letter was added instead of multiplied. The number beside x multiplies it.', 'Il semble que la lettre a été additionnée au lieu d\'être multipliée. Le nombre à côté de x le multiplie.'), 1]],
      steps: [bi((f) => f.t(`${f.m(`${f.n(a)}x`)} is ${f.N(a)} × ${f.N(x)} = ${f.N(r6(a * x))}.`, `${f.m(`${f.n(a)}x`)} égale ${f.N(a)} × ${f.N(x)} = ${f.N(r6(a * x))}.`)), bi((f) => `${f.N(r6(a * x))} + ${f.N(b)} = ${f.N(r6(a * x + b))}.`)],
      nudge: t('Multiply first (a number beside a letter means multiply), then add.', 'Multiplie d\'abord (un nombre collé à une lettre signifie multiplier), puis additionne.'),
    };
  }
  const x = tenth();
  const y = randInt(r, 1, 9) / 10;
  const a = randInt(r, 2, 5);
  const b = randInt(r, 2, 5);
  return {
    prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}x + ${f.n(b)}y`)} when ${f.m(`x = ${f.n(x)}`)} and ${f.m(`y = ${f.n(y)}`)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}x + ${f.n(b)}y`)} quand ${f.m(`x = ${f.n(x)}`)} et ${f.m(`y = ${f.n(y)}`)}.`)),
    answer: r6(a * x + b * y),
    wrong: [[r6((a + b) * (x + y)), t('It looks like the two parts were combined before multiplying. Multiply each letter by its own number first.', 'Il semble que les deux parties ont été combinées avant de multiplier. Multiplie d\'abord chaque lettre par son propre nombre.'), 0]],
    steps: [bi((f) => f.t(`${f.N(a)} × ${f.N(x)} = ${f.N(r6(a * x))} and ${f.N(b)} × ${f.N(y)} = ${f.N(r6(b * y))}.`, `${f.N(a)} × ${f.N(x)} = ${f.N(r6(a * x))} et ${f.N(b)} × ${f.N(y)} = ${f.N(r6(b * y))}.`)), bi((f) => `${f.N(r6(a * x))} + ${f.N(r6(b * y))} = ${f.N(r6(a * x + b * y))}.`)],
    nudge: t('Find each part on its own, then add the two results.', 'Trouve chaque partie séparément, puis additionne les deux résultats.'),
    category: 'AP',
  };
});

/** MS.G6.C2.3.a: solve multi-term equations */
export const solveEq6 = numGen('MS.G6.C2.3.a', (tier, r) => {
  const x = randInt(r, 2, 15);
  const a = randInt(r, 2, 9);
  const b = randInt(r, 2, 20);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(a * x + b)}`)}.`, `Résous ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(a * x + b)}`)}.`)),
      answer: x,
      wrong: [[a * x + b - a, t('It looks like the added number was divided instead of subtracted. Subtract it first.', 'Il semble que le nombre ajouté a été divisé au lieu d\'être soustrait. Soustrais-le d\'abord.'), 0]],
      steps: [bi((f) => f.t(`Subtract ${f.N(b)} from both sides: ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`, `Soustrais ${f.N(b)} des deux côtés : ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: ${f.m(`x = ${f.n(x)}`)}.`, `Divise les deux côtés par ${f.N(a)} : ${f.m(`x = ${f.n(x)}`)}.`)), bi((f) => f.t(`Check: ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(a * x + b)}.`, `Vérifie : ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(a * x + b)}.`))],
      nudge: t('Undo the adding first, then the multiplying.', 'Défais d\'abord l\'addition, puis la multiplication.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x - ${f.n(b)} = ${f.n(a * x - b)}`)}.`, `Résous ${f.m(`${f.n(a)}x - ${f.n(b)} = ${f.n(a * x - b)}`)}.`)),
      answer: x,
      wrong: [[(a * x - 2 * b) / a, t('It looks like the number was subtracted again instead of added back. To undo a subtraction, add.', 'Il semble que le nombre a été soustrait de nouveau au lieu d\'être rajouté. Pour défaire une soustraction, additionne.'), 0]],
      steps: [bi((f) => f.t(`Add ${f.N(b)} to both sides: ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`, `Ajoute ${f.N(b)} aux deux côtés : ${f.m(`${f.n(a)}x = ${f.n(a * x)}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: ${f.m(`x = ${f.n(x)}`)}.`, `Divise les deux côtés par ${f.N(a)} : ${f.m(`x = ${f.n(x)}`)}.`)), bi((f) => f.t(`Check: ${f.N(a)} × ${f.N(x)} − ${f.N(b)} = ${f.N(a * x - b)}.`, `Vérifie : ${f.N(a)} × ${f.N(x)} − ${f.N(b)} = ${f.N(a * x - b)}.`))],
      nudge: t('To undo subtracting, add the same number to both sides.', 'Pour défaire une soustraction, ajoute le même nombre aux deux côtés.'),
    };
  }
  const a2 = randInt(r, 2, 6);
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(a2)}x = ${f.n((a + a2) * x)}`)}.`, `Résous ${f.m(`${f.n(a)}x + ${f.n(a2)}x = ${f.n((a + a2) * x)}`)}.`)),
    answer: x,
    wrong: [[(a + a2) * x - a - a2, t('It looks like the numbers beside x were subtracted from the total. Combine them, then divide.', 'Il semble que les nombres à côté de x ont été soustraits du total. Combine-les, puis divise.'), 0]],
    steps: [bi((f) => f.t(`Combine like terms: ${f.m(`${f.n(a)}x + ${f.n(a2)}x = ${f.n(a + a2)}x`)}.`, `Combine les termes semblables : ${f.m(`${f.n(a)}x + ${f.n(a2)}x = ${f.n(a + a2)}x`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a + a2)}: ${f.m(`x = ${f.n(x)}`)}.`, `Divise les deux côtés par ${f.N(a + a2)} : ${f.m(`x = ${f.n(x)}`)}.`)), bi((f) => f.t(`Check: ${f.N(a)} × ${f.N(x)} + ${f.N(a2)} × ${f.N(x)} = ${f.N((a + a2) * x)}.`, `Vérifie : ${f.N(a)} × ${f.N(x)} + ${f.N(a2)} × ${f.N(x)} = ${f.N((a + a2) * x)}.`))],
    nudge: t('Both terms have x. Combine them into one term first.', 'Les deux termes contiennent x. Combine-les d\'abord en un seul terme.'),
    category: 'AP',
  };
});

/** MS.G6.C2.4.a: which value satisfies an inequality */
export const inequality6 = choiceGen('MS.G6.C2.4.a', (tier, r) => {
  const greater = tier !== 2;
  const a = randInt(r, 2, 6);
  const T = randInt(r, 3, 12);
  const b = randInt(r, 1, 9);
  const c = a * T + b;
  const sign = greater ? '>' : '<';
  const k = randInt(r, 1, 3);
  const goodVal = greater ? T + k : T - Math.min(k, T - 1);
  const wrongs: number[] = [];
  const candidates = greater ? [T, T - 1, T - 2, T - 3] : [T, T + 1, T + 2, T + 3];
  for (const w of candidates) if (w !== goodVal && wrongs.length < 3 && w >= 0) wrongs.push(w);
  const fmtVal = (v: number): Text => bi((f) => f.N(v));
  const m = mc(r, fmtVal(goodVal), wrongs.map((w): [Text, Text] => [fmtVal(w), w === T
    ? t('It looks like the boundary value was chosen. At the boundary both sides are equal, so a strict inequality is not true.', 'Il semble que la valeur limite a été choisie. À la limite, les deux côtés sont égaux : une inégalité stricte n\'est pas vraie.')
    : t('It looks like this value is on the wrong side of the boundary. Test it in the inequality.', 'Il semble que cette valeur est du mauvais côté de la limite. Mets-la à l\'essai dans l\'inégalité.')]));
  return {
    prompt: bi((f) => f.t(`Which value of x makes ${f.m(`${f.n(a)}x + ${f.n(b)} ${sign} ${f.n(c)}`)} true?`, `Quelle valeur de x rend ${f.m(`${f.n(a)}x + ${f.n(b)} ${sign} ${f.n(c)}`)} vrai ?`)),
    options: m.options, correct: m.correct, why: m.why,
    steps: [bi((f) => f.t(`Solve it like an equation: ${f.m(`${f.n(a)}x ${sign} ${f.n(c - b)}`)}, so ${f.m(`x ${sign} ${f.n(T)}`)}.`, `Résous-la comme une équation : ${f.m(`${f.n(a)}x ${sign} ${f.n(c - b)}`)}, donc ${f.m(`x ${sign} ${f.n(T)}`)}.`)), bi((f) => f.t(`${f.N(goodVal)} is ${greater ? 'greater' : 'less'} than ${f.N(T)}, so it works. The boundary ${f.N(T)} does not.`, `${f.N(goodVal)} est ${greater ? 'plus grand' : 'plus petit'} que ${f.N(T)} : il convient. La limite ${f.N(T)} ne convient pas.`))],
    nudge: t('Solve for x, then pick the value on the correct side that is not the boundary.', 'Résous pour x, puis choisis la valeur du bon côté qui n\'est pas la limite.'),
    category: 'AP',
  };
});
