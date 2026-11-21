// Grade 8 Algebra strand (C): growing and shrinking patterns, rational patterns, binomials, evaluating with rational numbers,
// equations and inequalities with integers and decimals.
import { randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

type Wrong = [number, Text, number?][];
/** "+ 5" or "- 5" for a term after the first. */
const sgn = (x: number): string => (x < 0 ? '-' : '+');

/** MS.G8.C1.1.a: compare linear growing and shrinking patterns by rate and initial value */
export const comparePatterns8 = numGen('MS.G8.C1.1.a', (tier, r) => {
  if (tier === 1) {
    const d = randInt(r, 2, 7), w = randInt(r, 3, 8), S = d * w + randInt(r, 5, 30);
    return {
      prompt: bi((f) => f.t(`A candle is ${f.N(S)} cm tall and burns down ${f.N(d)} cm every hour. How tall is it after ${f.N(w)} hours, in cm?`, `Une chandelle mesure ${f.N(S)} cm et se consume de ${f.N(d)} cm chaque heure. Quelle est sa hauteur après ${f.N(w)} heures, en cm ?`)),
      answer: S - d * w, category: 'AP',
      wrong: [[S + d * w, t('It looks like the burning was added. The candle is shrinking, so subtract the amount burned.', 'Il semble que la partie consumée a été ajoutée. La chandelle rapetisse : soustrais la partie consumée.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Burned in ${f.N(w)} hours: ${f.N(d)} × ${f.N(w)} = ${f.N(d * w)} cm.`, `Consumé en ${f.N(w)} heures : ${f.N(d)} × ${f.N(w)} = ${f.N(d * w)} cm.`)), bi((f) => f.t(`Height left: ${f.N(S)} − ${f.N(d * w)} = ${f.N(S - d * w)} cm.`, `Hauteur restante : ${f.N(S)} − ${f.N(d * w)} = ${f.N(S - d * w)} cm.`))],
      nudge: t('A shrinking pattern goes down by the same amount each time. Subtract the total amount lost.', 'Une suite décroissante diminue de la même quantité chaque fois. Soustrais la quantité totale perdue.'),
    };
  }
  if (tier === 2) {
    const d1 = randInt(r, 2, 6), d2 = randInt(r, 2, 6), n = randInt(r, 2, 10), S2 = randInt(r, 5, 25), S1 = S2 + n * (d1 + d2);
    return {
      prompt: bi((f) => f.t(`Tank A holds ${f.N(S1)} L and loses ${f.N(d1)} L every hour. Tank B holds ${f.N(S2)} L and gains ${f.N(d2)} L every hour. After how many hours do they hold the same amount?`, `Le réservoir A contient ${f.N(S1)} L et perd ${f.N(d1)} L chaque heure. Le réservoir B contient ${f.N(S2)} L et gagne ${f.N(d2)} L chaque heure. Après combien d'heures contiennent-ils la même quantité ?`)),
      answer: n, category: 'TH',
      wrong: [[S1 - S2, t('That is the gap at the start. The gap closes by the loss plus the gain each hour.', 'C\'est l\'écart au départ. L\'écart diminue de la perte plus le gain chaque heure.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The gap at the start is ${f.N(S1)} − ${f.N(S2)} = ${f.N(S1 - S2)} L. Each hour it closes by ${f.N(d1)} + ${f.N(d2)} = ${f.N(d1 + d2)} L.`, `L\'écart au départ est ${f.N(S1)} − ${f.N(S2)} = ${f.N(S1 - S2)} L. Chaque heure, il diminue de ${f.N(d1)} + ${f.N(d2)} = ${f.N(d1 + d2)} L.`)), bi((f) => f.t(`${f.N(S1 - S2)} ÷ ${f.N(d1 + d2)} = ${f.N(n)} hours.`, `${f.N(S1 - S2)} ÷ ${f.N(d1 + d2)} = ${f.N(n)} heures.`))],
      nudge: t('One tank is going down and the other up, so they close the gap together.', 'Un réservoir descend et l\'autre monte : ils comblent l\'écart ensemble.'),
    };
  }
  const k = randInt(r, 1, 4), d2 = randInt(r, 2, 6), d1 = d2 + k, n = randInt(r, 2, 10), S2 = randInt(r, 5, 25), S1 = S2 + n * k;
  return {
    prompt: bi((f) => f.t(`Pool A has ${f.N(S1)} cm of water and drops ${f.N(d1)} cm each day. Pool B has ${f.N(S2)} cm and drops ${f.N(d2)} cm each day. After how many days do they have the same depth?`, `Le bassin A contient ${f.N(S1)} cm d'eau et baisse de ${f.N(d1)} cm chaque jour. Le bassin B contient ${f.N(S2)} cm et baisse de ${f.N(d2)} cm chaque jour. Après combien de jours ont-ils la même profondeur ?`)),
    answer: n, category: 'TH',
    wrong: [[S1 - S2, t('That is the gap at the start. The gap closes by the difference in the daily drops.', 'C\'est l\'écart au départ. L\'écart diminue de la différence entre les baisses quotidiennes.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`The gap at the start is ${f.N(S1 - S2)} cm. Pool A drops ${f.N(d1)} − ${f.N(d2)} = ${f.N(k)} cm more each day.`, `L\'écart au départ est ${f.N(S1 - S2)} cm. Le bassin A baisse de ${f.N(d1)} − ${f.N(d2)} = ${f.N(k)} cm de plus chaque jour.`)), bi((f) => f.t(`${f.N(S1 - S2)} ÷ ${f.N(k)} = ${f.N(n)} days.`, `${f.N(S1 - S2)} ÷ ${f.N(k)} = ${f.N(n)} jours.`))],
    nudge: t('Both are shrinking. The faster one catches up by the difference in the rates.', 'Les deux diminuent. Le plus rapide rattrape l\'autre de la différence entre les taux.'),
  };
});

const rule = (f: F, a: number, b: number): string => f.m(`t = ${f.n(a)}n ${sgn(b)} ${f.n(Math.abs(b))}`);

/** MS.G8.C1.3.a: pattern rules and solving for unknowns, with integers and decimals */
export const patternRules8 = numGen('MS.G8.C1.3.a', (tier, r) => {
  if (tier === 1) {
    const a = (randInt(r, 1, 9) * (r() < 0.5 ? -1 : 1)) / 2, b = randInt(r, -20, 40), n = randInt(r, 5, 20);
    return {
      prompt: bi((f) => f.t(`The rule for a pattern is ${rule(f, a, b)}, where n is the term number. What is term ${f.N(n)}?`, `La règle d'une suite est ${rule(f, a, b)}, où n est le numéro du terme. Quel est le terme ${f.N(n)} ?`)),
      answer: r6(a * n + b),
      wrong: [[r6(a * (n + b)), t('It looks like the constant was multiplied by n too. Multiply the number in front of n, then add the constant.', 'Il semble que la constante a aussi été multipliée par n. Multiplie le nombre devant n, puis ajoute la constante.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Replace n with ${f.N(n)}: ${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`, `Remplace n par ${f.N(n)} : ${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`)), bi((f) => f.t(`Then ${f.N(r6(a * n))} ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(r6(a * n + b))}.`, `Puis ${f.N(r6(a * n))} ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(r6(a * n + b))}.`))],
      nudge: t('Multiply first, then add or subtract the constant. Watch the signs.', 'Multiplie d\'abord, puis ajoute ou soustrais la constante. Fais attention aux signes.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 2, 9) * (r() < 0.5 ? -1 : 1), n = randInt(r, 3, 20), b = randInt(r, -30, 50), V = a * n + b;
    return {
      prompt: bi((f) => f.t(`The rule for a pattern is ${rule(f, a, b)}. Which term number has the value ${f.N(V)}?`, `La règle d'une suite est ${rule(f, a, b)}. Quel numéro de terme a la valeur ${f.N(V)} ?`)),
      answer: n, category: 'TH',
      wrong: [[r6(V / a), t('It looks like the constant was forgotten. Undo the adding first, then divide.', 'Il semble que la constante a été oubliée. Défais d\'abord l\'addition, puis divise.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Solve ${f.N(a)}n ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(V)}. Undo the constant: ${f.N(a)}n = ${f.N(V - b)}.`, `Résous ${f.N(a)}n ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(V)}. Défais la constante : ${f.N(a)}n = ${f.N(V - b)}.`)), bi((f) => f.t(`Divide by ${f.N(a)}: n = ${f.N(n)}.`, `Divise par ${f.N(a)} : n = ${f.N(n)}.`))],
      nudge: t('Write an equation, then undo the constant and the multiplying.', 'Écris une équation, puis défais la constante et la multiplication.'),
    };
  }
  const a = (randInt(r, 1, 8) * (r() < 0.5 ? -1 : 1)) / 2, b = randInt(r, -10, 30), x1 = randInt(r, 2, 6), x2 = x1 + 4, T = randInt(r, 15, 30);
  return {
    prompt: bi((f) => f.t(`A pattern changes by the same amount each time. Term ${f.N(x1)} is ${f.N(r6(a * x1 + b))} and term ${f.N(x2)} is ${f.N(r6(a * x2 + b))}. What is term ${f.N(T)}?`, `Une suite change de la même quantité chaque fois. Le terme ${f.N(x1)} vaut ${f.N(r6(a * x1 + b))} et le terme ${f.N(x2)} vaut ${f.N(r6(a * x2 + b))}. Quel est le terme ${f.N(T)} ?`)),
    answer: r6(a * T + b), category: 'TH',
    wrong: [[r6(a * x2 + b + (T - x2)), t('It looks like 1 was added for each term. Use the amount the pattern really changes by, which can be negative.', 'Il semble que 1 a été ajouté pour chaque terme. Utilise la quantité dont la suite change vraiment, qui peut être négative.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`The terms are ${f.N(x2 - x1)} apart and differ by ${f.N(r6(a * 4))}, so the change is ${f.N(r6(a * 4))} ÷ 4 = ${f.N(a)} each term.`, `Les termes sont à ${f.N(x2 - x1)} d\'écart et diffèrent de ${f.N(r6(a * 4))} : le changement est ${f.N(r6(a * 4))} ÷ 4 = ${f.N(a)} par terme.`)), bi((f) => f.t(`From term ${f.N(x2)} to term ${f.N(T)} is ${f.N(T - x2)} steps: ${f.N(r6(a * x2 + b))} + ${f.N(T - x2)} × (${f.n(a)}) = ${f.N(r6(a * T + b))}.`, `Du terme ${f.N(x2)} au terme ${f.N(T)}, il y a ${f.N(T - x2)} pas : ${f.N(r6(a * x2 + b))} + ${f.N(T - x2)} × (${f.n(a)}) = ${f.N(r6(a * T + b))}.`))],
    nudge: t('Find the change per term first: the difference in value divided by the difference in term numbers.', 'Trouve d\'abord le changement par terme : la différence de valeur divisée par la différence des numéros de terme.'),
  };
});

/** MS.G8.C1.4.a: patterns among rational numbers */
export const rationalPatterns8 = numGen('MS.G8.C1.4.a', (tier, r) => {
  if (tier === 1) {
    const s = randInt(r, 15, 60) / 10, d = -randInt(r, 5, 20) / 10;
    const shown = [0, 1, 2, 3].map((i) => r6(s + d * i));
    return {
      prompt: bi((f) => f.t(`What is the next term? ${f.m(shown.map((x) => f.n(x)).join(',\\ '))}, ...`, `Quel est le terme suivant ? ${f.m(shown.map((x) => f.n(x)).join(',\\ '))}, ...`)),
      answer: r6(s + d * 4),
      wrong: [[r6(s - d * 4), t('It looks like the pattern was read as going up. The numbers are going down, so the jump is negative.', 'Il semble que la suite a été lue comme croissante. Les nombres descendent : l\'écart est négatif.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The jump is ${f.N(shown[1]!)} − ${f.N(shown[0]!)} = ${f.N(d)}.`, `L\'écart est ${f.N(shown[1]!)} − ${f.N(shown[0]!)} = ${f.N(d)}.`)), bi((f) => f.t(`${f.N(shown[3]!)} + (${f.n(d)}) = ${f.N(r6(s + d * 4))}.`, `${f.N(shown[3]!)} + (${f.n(d)}) = ${f.N(r6(s + d * 4))}.`))],
      nudge: t('Find the jump between two neighbours. It may be negative.', 'Trouve l\'écart entre deux voisins. Il peut être négatif.'),
    };
  }
  if (tier === 2) {
    const s = randInt(r, 1, 6), k = randInt(r, 1, 3);
    const shown = [0, 1, 2, 3].map((i) => s + k * i);
    const fr = (f: F, x: number): string => `\\frac{${f.n(x)}}{4}`;
    return {
      prompt: bi((f) => f.t(`What is the next term, as a decimal? ${f.m(shown.map((x) => fr(f, x)).join(',\\ '))}, ...`, `Quel est le terme suivant, en nombre décimal ? ${f.m(shown.map((x) => fr(f, x)).join(',\\ '))}, ...`)),
      answer: (s + k * 4) / 4,
      wrong: [[(s + k * 4) / 8, t('It looks like the denominator changed too. In this pattern only the numerator grows; the fourths stay fourths.', 'Il semble que le dénominateur a aussi changé. Dans cette suite, seul le numérateur augmente ; les quarts restent des quarts.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Each term goes up by ${f.m(`\\frac{${f.n(k)}}{4}`)}. The next numerator is ${f.N(shown[3]! + k)}.`, `Chaque terme augmente de ${f.m(`\\frac{${f.n(k)}}{4}`)}. Le prochain numérateur est ${f.N(shown[3]! + k)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(shown[3]! + k)}}{4}`)} = ${f.N((shown[3]! + k) / 4)}.`, `${f.m(`\\frac{${f.n(shown[3]! + k)}}{4}`)} = ${f.N((shown[3]! + k) / 4)}.`))],
      nudge: t('Find how much the numerator grows each time, then change the fraction to a decimal.', 'Trouve de combien le numérateur augmente chaque fois, puis transforme la fraction en nombre décimal.'),
    };
  }
  const s = randInt(r, 1, 9) * 8;
  return {
    prompt: bi((f) => f.t(`Each term is half of the term before it: ${f.N(s)}, ${f.N(s / 2)}, ${f.N(s / 4)}, ... What is the 6th term?`, `Chaque terme est la moitié du terme précédent : ${f.N(s)}, ${f.N(s / 2)}, ${f.N(s / 4)}, ... Quel est le 6e terme ?`)),
    answer: r6(s / 32), category: 'TH',
    wrong: [[r6(s - (s / 2) * 5), t('It looks like the same amount was subtracted each time. Here each term is multiplied by one half, so the amounts get smaller.', 'Il semble que la même quantité a été soustraite chaque fois. Ici, chaque terme est multiplié par un demi : les quantités diminuent.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Halve each time: ${f.N(s / 4)} → ${f.N(s / 8)} → ${f.N(s / 16)} → ${f.N(r6(s / 32))}.`, `Prends la moitié chaque fois : ${f.N(s / 4)} → ${f.N(s / 8)} → ${f.N(s / 16)} → ${f.N(r6(s / 32))}.`)), bi((f) => f.t(`The 6th term is ${f.N(r6(s / 32))}.`, `Le 6e terme est ${f.N(r6(s / 32))}.`))],
    nudge: t('Keep halving, one term at a time, until you reach the 6th.', 'Continue de prendre la moitié, un terme à la fois, jusqu\'au 6e.'),
  };
});

/** MS.G8.C2.1.a: add and subtract monomials; add degree-1 binomials with integers */
export const binomials8 = numGen('MS.G8.C2.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 15), b = randInt(r, 2, 15), c = randInt(r, 2, 12);
    const s1 = r() < 0.5 ? 1 : -1, s2 = r() < 0.5 ? 1 : -1;
    return {
      prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}x ${sgn(s1)} ${f.n(b)}x ${sgn(s2)} ${f.n(c)}x`)}. What is the number in front of x?`, `Simplifie ${f.m(`${f.n(a)}x ${sgn(s1)} ${f.n(b)}x ${sgn(s2)} ${f.n(c)}x`)}. Quel est le nombre devant x ?`)),
      answer: a + s1 * b + s2 * c,
      wrong: [[a + b + c, t('It looks like every term was added. A minus sign in front of a term means that term is subtracted.', 'Il semble que tous les termes ont été additionnés. Un signe moins devant un terme signifie que ce terme est soustrait.'), 1]] as Wrong,
      steps: [t('All the terms have x, so combine the numbers in front, left to right.', 'Tous les termes ont x : combine les nombres devant, de gauche à droite.'), bi((f) => f.t(`${f.N(a)} ${sgn(s1)} ${f.N(b)} ${sgn(s2)} ${f.N(c)} = ${f.N(a + s1 * b + s2 * c)}.`, `${f.N(a)} ${sgn(s1)} ${f.N(b)} ${sgn(s2)} ${f.N(c)} = ${f.N(a + s1 * b + s2 * c)}.`))],
      nudge: t('Work left to right with the numbers in front of x; the answer can be negative.', 'Va de gauche à droite avec les nombres devant x ; la réponse peut être négative.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 2, 9), b = randInt(r, 1, 12), c = randInt(r, -9, 9) || 4, d = randInt(r, -12, 12) || 3;
    const asksX = r() < 0.5;
    return {
      prompt: bi((f) => f.t(`Add ${f.m(`(${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))}) + (${f.n(c)}x ${sgn(d)} ${f.n(Math.abs(d))})`)}. What is ${asksX ? 'the number in front of x' : 'the constant term (the number without x)'}?`, `Additionne ${f.m(`(${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))}) + (${f.n(c)}x ${sgn(d)} ${f.n(Math.abs(d))})`)}. Quel est ${asksX ? 'le nombre devant x' : 'le terme constant (le nombre sans x)'} ?`)),
      answer: asksX ? a + c : b + d,
      wrong: [[asksX ? b + d : a + c, t('It looks like the wrong kind of term was combined. Combine the x terms together and the plain numbers together.', 'Il semble que le mauvais type de terme a été combiné. Combine les termes en x ensemble et les nombres seuls ensemble.'), 0]] as Wrong,
      steps: [t('Combine like terms: the x terms with the x terms and the plain numbers with the plain numbers.', 'Combine les termes semblables : les termes en x avec les termes en x et les nombres seuls avec les nombres seuls.'), bi((f) => f.t(`${asksX ? `x terms: ${f.N(a)} + (${f.n(c)})` : `Plain numbers: ${f.N(b)} + (${f.n(d)})`} = ${f.N(asksX ? a + c : b + d)}.`, `${asksX ? `Termes en x : ${f.N(a)} + (${f.n(c)})` : `Nombres seuls : ${f.N(b)} + (${f.n(d)})`} = ${f.N(asksX ? a + c : b + d)}.`))],
      nudge: t('Keep the x terms and the plain numbers apart, and add each group.', 'Garde les termes en x et les nombres seuls séparés, et additionne chaque groupe.'),
    };
  }
  const a = randInt(r, 2, 9), b = randInt(r, -9, 12), c = randInt(r, -9, 9) || 5, d = randInt(r, -12, 12), x = randInt(r, -5, 6);
  return {
    prompt: bi((f) => f.t(`Add ${f.m(`(${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))}) + (${f.n(c)}x ${sgn(d)} ${f.n(Math.abs(d))})`)}, then find the value when x = ${f.N(x)}.`, `Additionne ${f.m(`(${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))}) + (${f.n(c)}x ${sgn(d)} ${f.n(Math.abs(d))})`)}, puis trouve la valeur quand x = ${f.N(x)}.`)),
    answer: (a + c) * x + b + d, category: 'AP',
    wrong: [[(a + c + b + d) * x, t('It looks like the plain numbers were combined with the x terms. Combine them separately.', 'Il semble que les nombres seuls ont été combinés avec les termes en x. Combine-les séparément.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Combine: ${f.m(`${f.n(a + c)}x ${sgn(b + d)} ${f.n(Math.abs(b + d))}`)}.`, `Combine : ${f.m(`${f.n(a + c)}x ${sgn(b + d)} ${f.n(Math.abs(b + d))}`)}.`)), bi((f) => f.t(`Replace x with ${f.N(x)}: ${f.N(a + c)} × (${f.n(x)}) ${sgn(b + d)} ${f.N(Math.abs(b + d))} = ${f.N((a + c) * x + b + d)}.`, `Remplace x par ${f.N(x)} : ${f.N(a + c)} × (${f.n(x)}) ${sgn(b + d)} ${f.N(Math.abs(b + d))} = ${f.N((a + c) * x + b + d)}.`))],
    nudge: t('Add the binomials first, then replace x and calculate.', 'Additionne d\'abord les binômes, puis remplace x et calcule.'),
  };
});

/** MS.G8.C2.2.a: evaluate expressions with rational numbers */
export const evalRational8 = numGen('MS.G8.C2.2.a', (tier, r) => {
  if (tier === 1) {
    const a = (randInt(r, 5, 45) * (r() < 0.5 ? -1 : 1)) / 10, b = randInt(r, -9, 12), n = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}n ${sgn(b)} ${f.n(Math.abs(b))}`)} when n = ${f.N(n)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}n ${sgn(b)} ${f.n(Math.abs(b))}`)} quand n = ${f.N(n)}.`)),
      answer: r6(a * n + b),
      wrong: [[r6(a + n + b), t('It looks like the numbers were added. A number beside a letter means multiply.', 'Il semble que les nombres ont été additionnés. Un nombre collé à une lettre signifie multiplier.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Multiply first: ${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`, `Multiplie d\'abord : ${f.N(a)} × ${f.N(n)} = ${f.N(r6(a * n))}.`)), bi((f) => f.t(`Then ${f.N(r6(a * n))} ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(r6(a * n + b))}.`, `Puis ${f.N(r6(a * n))} ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(r6(a * n + b))}.`))],
      nudge: t('Multiply before you add or subtract, and keep the signs.', 'Multiplie avant d\'additionner ou de soustraire, et garde les signes.'),
    };
  }
  if (tier === 2) {
    const p = randInt(r, 1, 3), q = pick2(r), n = randInt(r, -8, 8);
    const fr = (f: F): string => `\\frac{${f.n(p)}}{2}n + \\frac{${f.n(q)}}{4}`;
    return {
      prompt: bi((f) => f.t(`Find the value of ${f.m(fr(f))} when n = ${f.N(n)}. Type a decimal.`, `Trouve la valeur de ${f.m(fr(f))} quand n = ${f.N(n)}. Écris un nombre décimal.`)),
      answer: r6((p / 2) * n + q / 4),
      wrong: [[r6((p / 2 + q / 4) * n), t('It looks like the second fraction was multiplied by n too. Only the first term has n.', 'Il semble que la deuxième fraction a aussi été multipliée par n. Seul le premier terme contient n.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.m(`\\frac{${f.n(p)}}{2}`)} × ${f.N(n)} = ${f.N(r6((p / 2) * n))}.`, `${f.m(`\\frac{${f.n(p)}}{2}`)} × ${f.N(n)} = ${f.N(r6((p / 2) * n))}.`)), bi((f) => f.t(`Add ${f.m(`\\frac{${f.n(q)}}{4}`)} = ${f.N(q / 4)}: ${f.N(r6((p / 2) * n + q / 4))}.`, `Ajoute ${f.m(`\\frac{${f.n(q)}}{4}`)} = ${f.N(q / 4)} : ${f.N(r6((p / 2) * n + q / 4))}.`))],
      nudge: t('Change the fractions to decimals if that helps, then multiply and add.', 'Transforme les fractions en nombres décimaux si cela t\'aide, puis multiplie et additionne.'),
    };
  }
  const a = randInt(r, 11, 49) / 10, b = randInt(r, 11, 39) / 10, x = -randInt(r, 2, 8), y = -randInt(r, 2, 8);
  return {
    prompt: bi((f) => f.t(`Find the value of ${f.m(`${f.n(a)}x - ${f.n(b)}y`)} when x = ${f.N(x)} and y = ${f.N(y)}.`, `Trouve la valeur de ${f.m(`${f.n(a)}x - ${f.n(b)}y`)} quand x = ${f.N(x)} et y = ${f.N(y)}.`)),
    answer: r6(a * x - b * y), category: 'AP',
    wrong: [[r6(a * x + b * y), t('It looks like the subtraction became addition. Subtracting a negative product is the same as adding a positive one.', 'Il semble que la soustraction est devenue une addition. Soustraire un produit négatif revient à additionner un produit positif.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`${f.N(a)} × (${f.n(x)}) = ${f.N(r6(a * x))} and ${f.N(b)} × (${f.n(y)}) = ${f.N(r6(b * y))}.`, `${f.N(a)} × (${f.n(x)}) = ${f.N(r6(a * x))} et ${f.N(b)} × (${f.n(y)}) = ${f.N(r6(b * y))}.`)), bi((f) => f.t(`${f.N(r6(a * x))} − (${f.n(r6(b * y))}) = ${f.N(r6(a * x - b * y))}.`, `${f.N(r6(a * x))} − (${f.n(r6(b * y))}) = ${f.N(r6(a * x - b * y))}.`))],
    nudge: t('Multiply each term first, then subtract; subtracting a negative adds.', 'Multiplie d\'abord chaque terme, puis soustrais ; soustraire un négatif revient à additionner.'),
  };
});
const pick2 = (r: () => number): number => randInt(r, 1, 7);

/** MS.G8.C2.3.a: multi-term equations with integers and decimals */
export const equations8 = numGen('MS.G8.C2.3.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9) * (r() < 0.5 ? -1 : 1), x = randInt(r, -12, 12), b = randInt(r, -15, 20), c = a * x + b;
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(c)}`)}.`, `Résous ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(c)}`)}.`)),
      answer: x,
      wrong: [[(c + b) / a, t('It looks like the constant was moved with the wrong sign. Undo adding by subtracting, and undo subtracting by adding.', 'Il semble que la constante a été déplacée avec le mauvais signe. Défais une addition en soustrayant et une soustraction en additionnant.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${b >= 0 ? 'Subtract' : 'Add'} ${f.N(Math.abs(b))} on both sides: ${f.m(`${f.n(a)}x = ${f.n(c - b)}`)}.`, `${b >= 0 ? 'Soustrais' : 'Ajoute'} ${f.N(Math.abs(b))} des deux côtés : ${f.m(`${f.n(a)}x = ${f.n(c - b)}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: x = ${f.N(x)}. Check: ${f.N(a)} × (${f.n(x)}) ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(c)}.`, `Divise les deux côtés par ${f.N(a)} : x = ${f.N(x)}. Vérifie : ${f.N(a)} × (${f.n(x)}) ${sgn(b)} ${f.N(Math.abs(b))} = ${f.N(c)}.`))],
      nudge: t('Undo the adding or subtracting first, then undo the multiplying.', 'Défais d\'abord l\'addition ou la soustraction, puis la multiplication.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 1, 9) / 10 * (r() < 0.5 ? -1 : 1) || 0.5, x = randInt(r, 2, 20), b = randInt(r, -25, 25) / 10 || 1.5, c = r6(a * x + b);
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(c)}`)}.`, `Résous ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(c)}`)}.`)),
      answer: x,
      wrong: [[r6((c + b) / a), t('It looks like the constant was moved with the wrong sign. Do the opposite of what is done to it.', 'Il semble que la constante a été déplacée avec le mauvais signe. Fais le contraire de ce qui lui est fait.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${b >= 0 ? 'Subtract' : 'Add'} ${f.N(Math.abs(b))} on both sides: ${f.m(`${f.n(a)}x = ${f.n(r6(c - b))}`)}.`, `${b >= 0 ? 'Soustrais' : 'Ajoute'} ${f.N(Math.abs(b))} des deux côtés : ${f.m(`${f.n(a)}x = ${f.n(r6(c - b))}`)}.`)), bi((f) => f.t(`Divide both sides by ${f.N(a)}: x = ${f.N(x)}.`, `Divise les deux côtés par ${f.N(a)} : x = ${f.N(x)}.`))],
      nudge: t('Undo the constant first, then divide by the number in front of x.', 'Défais d\'abord la constante, puis divise par le nombre devant x.'),
    };
  }
  let a: number, cc: number;
  do { a = randInt(r, -9, 9); cc = randInt(r, -9, 9); } while (a === cc);
  const x = randInt(r, -10, 10), b = randInt(r, -15, 15), d = (a - cc) * x + b;
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(cc)}x ${sgn(d)} ${f.n(Math.abs(d))}`)}.`, `Résous ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(cc)}x ${sgn(d)} ${f.n(Math.abs(d))}`)}.`)),
    answer: x, category: 'TH',
    wrong: [[d - b, t('It looks like only the plain numbers were compared. First gather the x terms on one side.', 'Il semble que seuls les nombres seuls ont été comparés. Rassemble d\'abord les termes en x d\'un côté.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Subtract ${f.m(`${f.n(cc)}x`)} from both sides: ${f.m(`${f.n(a - cc)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(d)}`)}.`, `Soustrais ${f.m(`${f.n(cc)}x`)} des deux côtés : ${f.m(`${f.n(a - cc)}x ${sgn(b)} ${f.n(Math.abs(b))} = ${f.n(d)}`)}.`)), bi((f) => f.t(`${b >= 0 ? 'Subtract' : 'Add'} ${f.N(Math.abs(b))}: ${f.m(`${f.n(a - cc)}x = ${f.n(d - b)}`)}. Divide by ${f.N(a - cc)}: x = ${f.N(x)}.`, `${b >= 0 ? 'Soustrais' : 'Ajoute'} ${f.N(Math.abs(b))} : ${f.m(`${f.n(a - cc)}x = ${f.n(d - b)}`)}. Divise par ${f.N(a - cc)} : x = ${f.N(x)}.`))],
    nudge: t('Gather the x terms on one side first, then undo the constant, then divide.', 'Rassemble d\'abord les termes en x d\'un côté, puis défais la constante, puis divise.'),
  };
});

/** MS.G8.C2.4.a: solve, verify and graph inequalities with integers (a negative coefficient reverses the inequality) */
export const inequalities8 = numGen('MS.G8.C2.4.a', (tier, r) => {
  if (tier === 1) {
    const b = randInt(r, -15, 15) || 6, c = randInt(r, -20, 20);
    const bound = c - b;
    return {
      prompt: bi((f) => f.t(`What is the greatest integer x that makes ${f.m(`x ${sgn(b)} ${f.n(Math.abs(b))} < ${f.n(c)}`)} true?`, `Quel est le plus grand entier x qui rend ${f.m(`x ${sgn(b)} ${f.n(Math.abs(b))} < ${f.n(c)}`)} vraie ?`)),
      answer: bound - 1,
      wrong: [[bound, t(`x = ${bound} makes both sides equal, and "less than" does not allow equal. Choose the next smaller integer.`, `x = ${bound} rend les deux côtés égaux, et « plus petit que » n'accepte pas l'égalité. Choisis l'entier juste en dessous.`), 1]] as Wrong,
      steps: [bi((f) => f.t(`${b >= 0 ? 'Subtract' : 'Add'} ${f.N(Math.abs(b))} on both sides: ${f.m(`x < ${f.n(bound)}`)}.`, `${b >= 0 ? 'Soustrais' : 'Ajoute'} ${f.N(Math.abs(b))} des deux côtés : ${f.m(`x < ${f.n(bound)}`)}.`)), bi((f) => f.t(`x must be less than ${f.N(bound)}, so the greatest integer is ${f.N(bound - 1)}.`, `x doit être inférieur à ${f.N(bound)}, donc le plus grand entier est ${f.N(bound - 1)}.`))],
      nudge: t('Solve like an equation, then decide whether the boundary number itself is allowed.', 'Résous comme une équation, puis décide si le nombre frontière lui-même est permis.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 2, 7), b = randInt(r, -15, 15) || 4, q = randInt(r, -8, 10), extra = randInt(r, 0, a - 1), c = a * q + extra + b;
    return {
      prompt: bi((f) => f.t(`What is the greatest integer x that makes ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} \\leq ${f.n(c)}`)} true?`, `Quel est le plus grand entier x qui rend ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))} \\leq ${f.n(c)}`)} vraie ?`)),
      answer: q,
      wrong: [[q + 1, t('It looks like the answer was rounded up. The solutions go up to the boundary, so round down.', 'Il semble que la réponse a été arrondie à l\'unité supérieure. Les solutions vont jusqu\'à la frontière : arrondis à l\'unité inférieure.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`${b >= 0 ? 'Subtract' : 'Add'} ${f.N(Math.abs(b))}: ${f.m(`${f.n(a)}x \\leq ${f.n(a * q + extra)}`)}. Divide by ${f.N(a)}: x ≤ ${f.n(r6((a * q + extra) / a))}.`, `${b >= 0 ? 'Soustrais' : 'Ajoute'} ${f.N(Math.abs(b))} : ${f.m(`${f.n(a)}x \\leq ${f.n(a * q + extra)}`)}. Divise par ${f.N(a)} : x ≤ ${f.n(r6((a * q + extra) / a))}.`)), bi((f) => f.t(`The greatest integer not above that is ${f.N(q)}.`, `Le plus grand entier qui ne dépasse pas cette valeur est ${f.N(q)}.`))],
      nudge: t('Solve for x, then find the greatest integer that still fits (watch negatives).', 'Résous pour x, puis trouve le plus grand entier qui convient encore (fais attention aux négatifs).'),
    };
  }
  const a = randInt(r, 2, 6), b = randInt(r, -10, 15), q = randInt(r, -8, 8), extra = randInt(r, 1, a - 1 || 1), c = b - a * q + extra;
  // -a x + b > c  =>  x < (b - c) / a  =  q - extra / a, so the greatest integer is q - 1 when 0 < extra < a
  return {
    prompt: bi((f) => f.t(`What is the greatest integer x that makes ${f.m(`${f.n(-a)}x ${sgn(b)} ${f.n(Math.abs(b))} > ${f.n(c)}`)} true?`, `Quel est le plus grand entier x qui rend ${f.m(`${f.n(-a)}x ${sgn(b)} ${f.n(Math.abs(b))} > ${f.n(c)}`)} vraie ?`)),
    answer: q - 1, category: 'TH',
    wrong: [[q, t('It looks like the inequality sign was not reversed. Dividing both sides by a negative number reverses the inequality.', 'Il semble que le signe d\'inégalité n\'a pas été inversé. Diviser les deux côtés par un nombre négatif inverse l\'inégalité.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`${b >= 0 ? 'Subtract' : 'Add'} ${f.N(Math.abs(b))}: ${f.m(`${f.n(-a)}x > ${f.n(c - b)}`)}. Divide by ${f.N(-a)} and reverse the sign: x < ${f.n(r6((c - b) / -a))}.`, `${b >= 0 ? 'Soustrais' : 'Ajoute'} ${f.N(Math.abs(b))} : ${f.m(`${f.n(-a)}x > ${f.n(c - b)}`)}. Divise par ${f.N(-a)} et inverse le signe : x < ${f.n(r6((c - b) / -a))}.`)), bi((f) => f.t(`The greatest integer below ${f.n(r6((c - b) / -a))} is ${f.N(q - 1)}.`, `Le plus grand entier sous ${f.n(r6((c - b) / -a))} est ${f.N(q - 1)}.`))],
    nudge: t('When you divide both sides by a negative number, the inequality sign reverses.', 'Quand tu divises les deux côtés par un nombre négatif, le signe d\'inégalité s\'inverse.'),
  };
});
