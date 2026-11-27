// Grade 9 (MTH1W) Algebra, coding and linear against non-linear relations: code with variables, parameters, equations and inequalities (C2.1),
// breaking a situation into computational steps (C2.2), reading and altering code (C2.3), and the characteristics of linear and
// non-linear relations (C4.1). Programs are described in plain steps, so every item is an ordinary number or choice question.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };

/** MTH1W.C2.1: variables, parameters, equations and inequalities in code */
export const codeEquations9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = nonzero(r, -5, 6), b = nonzero(r, -9, 9), x = randInt(r, -4, 9), ans = a * x + b;
    return {
      prompt: bi((f) => f.t(`A function f takes a number x and returns ${f.m(`${f.n(a)}x ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}. The program calls f with x = ${f.N(x)}. What does it return?`, `Une fonction f prend un nombre x et retourne ${f.m(`${f.n(a)}x ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}. Le programme appelle f avec x = ${f.N(x)}. Que retourne-t-elle ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[a * (x + b), t('Multiply x by the coefficient first, then add the constant.', 'Multiplie d\'abord x par le coefficient, puis ajoute la constante.'), 0], [a + x + b, t('The coefficient multiplies x. It is not added.', 'Le coefficient multiplie x. Il ne s\'ajoute pas.'), 0], [a * x, t('Do not forget the constant term.', 'N\'oublie pas le terme constant.'), 1]]),
      steps: [bi((f) => f.t(`Put x = ${f.N(x)} in: ${f.m(`${f.n(a)}(${f.n(x)}) ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}.`, `Remplace x = ${f.N(x)} : ${f.m(`${f.n(a)}(${f.n(x)}) ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}.`)), bi((f) => f.t(`It returns ${f.N(ans)}.`, `Elle retourne ${f.N(ans)}.`))],
      nudge: t('Replace x with the number the program passes in, and follow the order of operations.', 'Remplace x par le nombre transmis au programme et suis l\'ordre des opérations.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 2, 5), b = randInt(r, 1, 9), limit = randInt(r, 10, 40), x = randInt(r, 1, 15), v = a * x + b, ans = v > limit ? v - limit : v + limit;
    return {
      prompt: bi((f) => f.t(`A program sets y to ${f.m(`${f.n(a)}x + ${f.n(b)}`)}. Then: if y is more than ${f.N(limit)}, it returns y − ${f.N(limit)}; otherwise it returns y + ${f.N(limit)}. What does it return when x = ${f.N(x)}?`, `Un programme met y à ${f.m(`${f.n(a)}x + ${f.n(b)}`)}. Ensuite : si y est plus grand que ${f.N(limit)}, il retourne y − ${f.N(limit)} ; sinon, il retourne y + ${f.N(limit)}. Que retourne-t-il quand x = ${f.N(x)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[v > limit ? v + limit : v - limit, t('Check the test first: is y more than the limit? That decides which rule is used.', 'Vérifie d\'abord le test : y est-il plus grand que la limite ? Cela décide de la règle utilisée.'), 1], [v, t('That is y itself. The program then adds or subtracts the limit.', 'C\'est y lui-même. Le programme ajoute ou soustrait ensuite la limite.'), 0], [r6(a * x), t('Remember to add b when working out y.', 'N\'oublie pas d\'ajouter b en calculant y.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`y = ${f.n(a)}(${f.n(x)}) + ${f.n(b)}`)} = ${f.N(v)}, and ${f.N(v)} is ${v > limit ? 'more than' : 'not more than'} ${f.N(limit)}.`, `${f.m(`y = ${f.n(a)}(${f.n(x)}) + ${f.n(b)}`)} = ${f.N(v)}, et ${f.N(v)} ${v > limit ? 'est plus grand que' : 'n\'est pas plus grand que'} ${f.N(limit)}.`)), bi((f) => f.t(`So it returns ${f.N(ans)}.`, `Il retourne donc ${f.N(ans)}.`))],
      nudge: t('Work out y, then check the condition to see which branch runs.', 'Calcule y, puis vérifie la condition pour voir quelle branche s\'exécute.'),
    };
  }
  const lo = randInt(r, -6, 2), a = randInt(r, 2, 5), c = randInt(r, 10, 40);
  const solutions = Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => a * x - 1 < c && x > lo);
  return {
    prompt: bi((f) => f.t(`A program counts the whole numbers x from ${f.N(lo + 1)} to ${f.N(20)} that make ${f.m(`${f.n(a)}x - 1 < ${f.n(c)}`)} true. What is the count?`, `Un programme compte les nombres entiers x de ${f.N(lo + 1)} à ${f.N(20)} qui rendent ${f.m(`${f.n(a)}x - 1 < ${f.n(c)}`)} vrai. Quel est le total ?`)),
    answer: solutions.filter((x) => x <= 20).length, category: 'TH',
    wrong: wr(solutions.filter((x) => x <= 20).length, [[solutions.length + 1, t('Solve the inequality first, then count only the whole numbers in the allowed range.', 'Résous d\'abord l\'inégalité, puis compte seulement les entiers de l\'intervalle permis.'), 1], [Math.max(0, solutions.length - 1), t('Check whether the boundary value counts: the inequality is strict (<), so it does not.', 'Vérifie si la valeur frontière compte : l\'inégalité est stricte (<), donc non.'), 1], [Math.floor((c + 1) / a), t('That is the largest solution, not the count. Count the whole numbers from the start of the range up to it.', 'C\'est la plus grande solution, pas le total. Compte les entiers du début de l\'intervalle jusqu\'à elle.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`${f.n(a)}x < ${f.n(c + 1)}`)}, so ${f.m(`x < ${f.n(r6((c + 1) / a))}`)}.`, `${f.m(`${f.n(a)}x < ${f.n(c + 1)}`)}, donc ${f.m(`x < ${f.n(r6((c + 1) / a))}`)}.`)), bi((f) => f.t(`The whole numbers from ${f.N(lo + 1)} up to just below ${f.N(r6((c + 1) / a))} number ${f.N(solutions.length)}.`, `Les entiers de ${f.N(lo + 1)} jusqu'à juste en dessous de ${f.N(r6((c + 1) / a))} sont au nombre de ${f.N(solutions.length)}.`))],
    nudge: t('Solve the inequality, then count the whole numbers that fit in the range.', 'Résous l\'inégalité, puis compte les entiers qui entrent dans l\'intervalle.'),
  };
});

/** MTH1W.C2.2: decomposing a situation into computational steps */
export const decompose9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const base = randInt(r, 6, 14), per = randInt(r, 1, 3), n = randInt(r, 2, 6), tax = pick(r, [10, 20]), subtotal = base + per * n, ans = r6(subtotal * (1 + tax / 100));
    return {
      prompt: bi((f) => f.t(`A pizza costs ${f.D(base)} plus ${f.D(per)} for each topping. A program (1) adds the toppings' cost, (2) adds the base price, (3) adds ${f.m(`${f.n(tax)}\\%`)} tax. What does it output for ${f.N(n)} toppings, in dollars?`, `Une pizza coûte ${f.D(base)} plus ${f.D(per)} par garniture. Un programme (1) additionne le coût des garnitures, (2) ajoute le prix de base, (3) ajoute ${f.m(`${f.n(tax)}\\%`)} de taxe. Que donne-t-il pour ${f.N(n)} garnitures, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(base * (1 + tax / 100) + per * n), t('The tax is added to the whole price (base plus toppings), at the end.', 'La taxe s\'ajoute au prix total (base plus garnitures), à la fin.'), 1], [subtotal, t('That is the price before tax. Step 3 adds the tax.', 'C\'est le prix avant taxe. L\'étape 3 ajoute la taxe.'), 1], [r6(subtotal + tax), t('The tax is a percent of the price, not a number of dollars.', 'La taxe est un pourcentage du prix, pas un nombre de dollars.'), 1]]),
      steps: [bi((f) => f.t(`Toppings: ${f.m(`${f.n(per)} \\times ${f.n(n)}`)} = ${f.N(per * n)}. With the base: ${f.N(subtotal)}.`, `Garnitures : ${f.m(`${f.n(per)} \\times ${f.n(n)}`)} = ${f.N(per * n)}. Avec la base : ${f.N(subtotal)}.`)), bi((f) => f.t(`With tax: ${f.m(`${f.n(subtotal)} \\times ${f.n(1 + tax / 100)}`)} = ${f.D(ans)}.`, `Avec la taxe : ${f.m(`${f.n(subtotal)} \\times ${f.n(1 + tax / 100)}`)} = ${f.D(ans)}.`))],
      nudge: t('Do the steps in the order listed, using each result in the next step.', 'Fais les étapes dans l\'ordre indiqué, en utilisant chaque résultat dans l\'étape suivante.'),
    };
  }
  if (tier === 2) {
    const start = randInt(r, 50, 200), save = randInt(r, 5, 20), spend = randInt(r, 1, save - 1), weeks = randInt(r, 3, 8), ans = start + (save - spend) * weeks;
    return {
      prompt: bi((f) => f.t(`A savings program starts with ${f.D(start)}. Each week it (1) adds ${f.D(save)} from allowance and (2) subtracts ${f.D(spend)} for a snack. How much is saved after ${f.N(weeks)} weeks, in dollars?`, `Un programme d'épargne commence avec ${f.D(start)}. Chaque semaine, il (1) ajoute ${f.D(save)} d'allocation et (2) soustrait ${f.D(spend)} pour une collation. Combien est épargné après ${f.N(weeks)} semaines, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[start + save * weeks, t('Each week also takes away the snack money.', 'Chaque semaine retire aussi l\'argent de la collation.'), 1], [start + (save - spend), t('Repeat the two steps for every week, not just once.', 'Répète les deux étapes chaque semaine, pas une seule fois.'), 1], [(save - spend) * weeks, t('Start from the amount already saved.', 'Pars du montant déjà épargné.'), 1]]),
      steps: [bi((f) => f.t(`Each week the amount changes by ${f.m(`${f.n(save)} - ${f.n(spend)}`)} = ${f.N(save - spend)}.`, `Chaque semaine, le montant change de ${f.m(`${f.n(save)} - ${f.n(spend)}`)} = ${f.N(save - spend)}.`)), bi((f) => f.t(`${f.m(`${f.n(start)} + ${f.n(save - spend)} \\times ${f.n(weeks)}`)} = ${f.D(ans)}.`, `${f.m(`${f.n(start)} + ${f.n(save - spend)} \\times ${f.n(weeks)}`)} = ${f.D(ans)}.`))],
      nudge: t('Work out the net change in one week, then repeat it for every week.', 'Calcule la variation nette en une semaine, puis répète-la pour chaque semaine.'),
    };
  }
  const goal = randInt(r, 60, 200), start = randInt(r, 5, 30), perWeek = randInt(r, 4, 12), weeks = Math.ceil((goal - start) / perWeek);
  return {
    prompt: bi((f) => f.t(`A program starts with ${f.D(start)} and adds ${f.D(perWeek)} each week. It repeats until the total reaches at least ${f.D(goal)}. How many times does the loop run?`, `Un programme commence avec ${f.D(start)} et ajoute ${f.D(perWeek)} chaque semaine. Il répète jusqu'à ce que le total atteigne au moins ${f.D(goal)}. Combien de fois la boucle s'exécute-t-elle ?`)),
    answer: weeks, category: 'TH',
    wrong: wr(weeks, [[weeks - 1, t('After that many weeks the total is still below the goal. Check the last value.', 'Après ce nombre de semaines, le total est encore sous l\'objectif. Vérifie la dernière valeur.'), 1], [weeks + 1, t('One fewer week already reaches the goal.', 'Une semaine de moins atteint déjà l\'objectif.'), 1], [Math.floor((goal - start) / perWeek), t('Rounding down stops short of the goal. Round up to a whole number of weeks.', 'Arrondir vers le bas s\'arrête avant l\'objectif. Arrondis vers le haut à un nombre entier de semaines.'), 1]]),
    steps: [bi((f) => f.t(`The total must grow by ${f.m(`${f.n(goal)} - ${f.n(start)}`)} = ${f.N(goal - start)}.`, `Le total doit augmenter de ${f.m(`${f.n(goal)} - ${f.n(start)}`)} = ${f.N(goal - start)}.`)), bi((f) => f.t(`${f.m(`${f.n(goal - start)} \\div ${f.n(perWeek)}`)}, rounded up, is ${f.N(weeks)}.`, `${f.m(`${f.n(goal - start)} \\div ${f.n(perWeek)}`)}, arrondi vers le haut, vaut ${f.N(weeks)}.`))],
    nudge: t('Divide the amount still needed by what is added each time, and round up.', 'Divise le montant encore nécessaire par ce qui est ajouté chaque fois, et arrondis vers le haut.'),
  };
});

/** MTH1W.C2.3: reading and altering code */
export const alterCode9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 6), b = randInt(r, 1, 9), a2 = a + randInt(r, 1, 4), x = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`A function returns ${f.m(`${f.n(a)}x + ${f.n(b)}`)}. It is changed to return ${f.m(`${f.n(a2)}x + ${f.n(b)}`)}. For x = ${f.N(x)}, how much bigger is the new output than the old one?`, `Une fonction retourne ${f.m(`${f.n(a)}x + ${f.n(b)}`)}. Elle est modifiée pour retourner ${f.m(`${f.n(a2)}x + ${f.n(b)}`)}. Pour x = ${f.N(x)}, de combien la nouvelle sortie dépasse-t-elle l'ancienne ?`)),
      answer: (a2 - a) * x, category: 'AP',
      wrong: wr((a2 - a) * x, [[a2 - a, t('The change in the coefficient is multiplied by x, so the output changes by more than that.', 'Le changement du coefficient est multiplié par x : la sortie change de plus que cela.'), 1], [a2 * x + b, t('That is the new output. The question asks how much bigger it is than the old one.', 'C\'est la nouvelle sortie. La question demande de combien elle dépasse l\'ancienne.'), 0], [(a2 - a) * x + b, t('The constant b is the same in both, so it makes no difference to the change.', 'La constante b est la même dans les deux : elle ne change rien à l\'écart.'), 1]]),
      steps: [bi((f) => f.t(`Old: ${f.m(`${f.n(a)}(${f.n(x)}) + ${f.n(b)}`)} = ${f.N(a * x + b)}. New: ${f.m(`${f.n(a2)}(${f.n(x)}) + ${f.n(b)}`)} = ${f.N(a2 * x + b)}.`, `Ancienne : ${f.m(`${f.n(a)}(${f.n(x)}) + ${f.n(b)}`)} = ${f.N(a * x + b)}. Nouvelle : ${f.m(`${f.n(a2)}(${f.n(x)}) + ${f.n(b)}`)} = ${f.N(a2 * x + b)}.`)), bi((f) => f.t(`The difference is ${f.N((a2 - a) * x)}.`, `La différence est de ${f.N((a2 - a) * x)}.`))],
      nudge: t('Work out the old and the new output, then subtract.', 'Calcule l\'ancienne et la nouvelle sortie, puis soustrais.'),
    };
  }
  if (tier === 2) {
    const t1 = randInt(r, 3, 6), t2 = t1 + randInt(r, 2, 5), a = randInt(r, 2, 5), n = randInt(r, 6, 12), count = (th: number): number => { let c = 0; for (let i = 1; i <= n; i++) if (i % th === 0) c += a; else c += 1; return c; };
    return {
      prompt: bi((f) => f.t(`A program sets total to ${f.N(0)}. For each number i from ${f.N(1)} to ${f.N(n)}: if i can be divided by ${f.N(t1)} with no remainder it adds ${f.N(a)} to total; otherwise it adds ${f.N(1)}. The ${f.N(t1)} is changed to ${f.N(t2)}. What is total at the end of the changed program?`, `Un programme met total à ${f.N(0)}. Pour chaque nombre i de ${f.N(1)} à ${f.N(n)} : si i se divise par ${f.N(t1)} sans reste, il ajoute ${f.N(a)} à total ; sinon, il ajoute ${f.N(1)}. Le ${f.N(t1)} devient ${f.N(t2)}. Que vaut total à la fin du programme modifié ?`)),
      answer: count(t2), category: 'AP',
      wrong: wr(count(t2), [[count(t1), t('That is the result of the original program. Use the changed number.', 'C\'est le résultat du programme de départ. Utilise le nombre modifié.'), 1], [n, t('That adds 1 every time. Some numbers take the other branch.', 'Cela ajoute 1 chaque fois. Certains nombres suivent l\'autre branche.'), 1], [a * Math.floor(n / t2), t('Count the numbers that do not pass the test too: each adds 1.', 'Compte aussi les nombres qui ne passent pas le test : chacun ajoute 1.'), 1]]),
      steps: [bi((f) => f.t(`${f.N(Math.floor(n / t2))} of the numbers from 1 to ${f.N(n)} can be divided by ${f.N(t2)}; the other ${f.N(n - Math.floor(n / t2))} cannot.`, `${f.N(Math.floor(n / t2))} des nombres de 1 à ${f.N(n)} se divisent par ${f.N(t2)} ; les ${f.N(n - Math.floor(n / t2))} autres non.`)), bi((f) => f.t(`${f.m(`${f.n(Math.floor(n / t2))} \\times ${f.n(a)} + ${f.n(n - Math.floor(n / t2))} \\times 1`)} = ${f.N(count(t2))}.`, `${f.m(`${f.n(Math.floor(n / t2))} \\times ${f.n(a)} + ${f.n(n - Math.floor(n / t2))} \\times 1`)} = ${f.N(count(t2))}.`))],
      nudge: t('Count the numbers that pass the test and the ones that do not, with the changed value.', 'Compte les nombres qui passent le test et ceux qui ne le passent pas, avec la valeur modifiée.'),
    };
  }
  const start = randInt(r, 2, 9), mult = pick(r, [2, 3]), steps = randInt(r, 3, 5), goal = start * mult ** steps + randInt(r, 1, 3) * (mult - 1) * 0;
  let x = start, n = 0;
  while (x < goal) { x *= mult; n++; }
  return {
    prompt: bi((f) => f.t(`A program sets x to ${f.N(start)} and repeats "multiply x by ${f.N(mult)}" until x is at least ${f.N(goal)}. It is changed to start with x = ${f.N(start * mult)} instead. How many fewer times does the loop run?`, `Un programme met x à ${f.N(start)} et répète « multiplier x par ${f.N(mult)} » jusqu'à ce que x soit au moins ${f.N(goal)}. Il est modifié pour commencer avec x = ${f.N(start * mult)} à la place. De combien de fois la boucle s'exécute-t-elle de moins ?`)),
    answer: 1, category: 'TH',
    wrong: wr(1, [[0, t('Starting one multiplication ahead saves exactly one repeat. Count both loops.', 'Commencer une multiplication plus loin économise exactement une répétition. Compte les deux boucles.'), 1], [2, t('Starting at x times the multiplier skips just one multiplication.', 'Commencer à x fois le multiplicateur saute seulement une multiplication.'), 1], [steps, t('That is how many times the original loop runs. Compare it with the changed loop.', 'C\'est combien de fois la boucle de départ s\'exécute. Compare-la avec la boucle modifiée.'), 1]]),
    steps: [bi((f) => f.t(`The original loop runs ${f.N(n)} times. Starting at ${f.N(start * mult)} is the same as having already done one repeat.`, `La boucle de départ s'exécute ${f.N(n)} fois. Commencer à ${f.N(start * mult)} revient à avoir déjà fait une répétition.`)), bi((f) => f.t(`So it runs ${f.N(n - 1)} times: one fewer.`, `Elle s'exécute donc ${f.N(n - 1)} fois : une de moins.`))],
    nudge: t('Count the repeats for each start. Starting at x times the multiplier skips one repeat.', 'Compte les répétitions pour chaque départ. Commencer à x fois le multiplicateur saute une répétition.'),
  };
});

/** MTH1W.C4.1: characteristics of linear and non-linear relations */
export const linearNon9 = (id: string): Generator => {
  const EQS: { tex: string; linear: boolean }[] = [
    { tex: 'y = 3x + 2', linear: true }, { tex: 'y = -x + 7', linear: true }, { tex: 'y = \\frac{x}{2} - 1', linear: true }, { tex: '2x + 3y = 12', linear: true }, { tex: 'y = 5x', linear: true }, { tex: 'y = 4', linear: true },
    { tex: 'y = x^{2}', linear: false }, { tex: 'y = 2^{x}', linear: false }, { tex: 'y = \\frac{12}{x}', linear: false }, { tex: 'xy = 12', linear: false }, { tex: 'y = x^{2} + 3', linear: false }, { tex: 'y = \\sqrt{x}', linear: false },
  ];
  const pickEq = (wantLinear: boolean) => choiceGen(id, (_tier, r) => {
    const right = pick(r, EQS.filter((e) => e.linear === wantLinear)), others = EQS.filter((e) => e.linear !== wantLinear).sort(() => r() - 0.5).slice(0, 3);
    const m = mc(r, bi((f) => f.m(right.tex)), others.map((e): [Text, Text] => [bi((f) => f.m(e.tex)), wantLinear ? t('The variables are not only multiplied by numbers and added: this graph is a curve, so it is non-linear.', 'Les variables ne sont pas seulement multipliées par des nombres et additionnées : ce graphique est une courbe, donc non linéaire.') : t('Each step in x changes y by the same amount, so this relation is linear.', 'Chaque pas en x change y du même montant : cette relation est linéaire.')]));
    return {
      prompt: wantLinear ? t('Which equation describes a linear relation?', 'Quelle équation décrit une relation linéaire ?') : t('Which equation describes a non-linear relation?', 'Quelle équation décrit une relation non linéaire ?'),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [wantLinear ? t('A linear relation has a constant rate of change: x and y appear only to the first power and are not multiplied together.', 'Une relation linéaire a un taux de variation constant : x et y n\'apparaissent qu\'à la puissance 1 et ne sont pas multipliés entre eux.') : t('A non-linear relation has a changing rate: look for a power of x, x in a denominator, a root, or x in an exponent.', 'Une relation non linéaire a un taux de variation changeant : cherche une puissance de x, x au dénominateur, une racine ou x en exposant.'), bi((f) => f.t(`The answer is ${f.m(right.tex)}.`, `La réponse est ${f.m(right.tex)}.`))],
      nudge: t('Test it: does y change by the same amount every time x goes up by 1?', 'Teste : y change-t-il du même montant chaque fois que x augmente de 1 ?'),
    };
  });
  const tables = choiceGen(id, (_tier, r) => {
    const xs = [0, 1, 2, 3, 4], a = randInt(r, 2, 5), b = randInt(r, 1, 9);
    const lin = xs.map((x) => a * x + b), quad = xs.map((x) => x * x + b), exp = xs.map((x) => b * 2 ** x);
    const tabs = [lin, quad, exp].sort(() => r() - 0.5);
    const rightIdx = tabs.indexOf(lin);
    const opt = (ys: number[]): Text => bi((f) => f.m(ys.map((y) => f.n(y)).join(',\\ ')));
    const m = mc(r, opt(lin), tabs.filter((_, i) => i !== rightIdx).map((ys): [Text, Text] => [opt(ys), t('The first differences are not all equal, so the rate of change is not constant: this table is non-linear.', 'Les premières différences ne sont pas toutes égales : le taux de variation n\'est pas constant : ce tableau est non linéaire.')]));
    return {
      prompt: t('The x-values are 0, 1, 2, 3, 4. Which list of y-values is linear?', 'Les valeurs de x sont 0, 1, 2, 3, 4. Quelle liste de valeurs de y est linéaire ?'),
      options: m.options, correct: m.correct, why: m.why, category: 'AP',
      steps: [t('For a linear relation, the first differences (the changes in y) are all equal.', 'Pour une relation linéaire, les premières différences (les variations de y) sont toutes égales.'), bi((f) => f.t(`The linear list changes by ${f.N(a)} each time.`, `La liste linéaire change de ${f.N(a)} chaque fois.`))],
      nudge: t('Subtract each y-value from the next one and see whether the differences match.', 'Soustrais chaque valeur de y de la suivante et vois si les différences sont égales.'),
    };
  });
  return tierGen(pickEq(true), pickEq(false), tables);
};

void nonzero;
