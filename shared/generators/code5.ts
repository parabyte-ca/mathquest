// Grade 5 Algebra strand (C3), coding: writing, reading and changing short programs with loops and conditionals. The programs are
// described in plain steps (no special code display), so every item is an ordinary number question.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G5.C3.1.a: write and execute code, including conditional statements and other control structures */
const loop5 = numGen('MS.G5.C3.1.a', (_tier, r) => {
  const start = randInt(r, 0, 10), add = randInt(r, 2, 9), k = randInt(r, 3, 8);
  const ans = start + add * k;
  return {
    prompt: bi((f) => f.t(`A program has these steps. Step 1: set total to ${f.N(start)}. Step 2: repeat ${f.N(k)} times: add ${f.N(add)} to total. What is total when the program ends?`, `Un programme a ces étapes. Étape 1 : mettre total à ${f.N(start)}. Étape 2 : répéter ${f.N(k)} fois : ajouter ${f.N(add)} à total. Quelle est la valeur de total à la fin du programme ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[start + add, t('The loop runs more than once. Add the number every time the loop repeats.', 'La boucle s\'exécute plus d\'une fois. Ajoute le nombre chaque fois que la boucle se répète.'), 1], [add * k, t('That leaves out the starting value of total.', 'Cela oublie la valeur de départ de total.'), 1]]),
    steps: [bi((f) => f.t(`The loop adds ${f.N(add)} a total of ${f.N(k)} times: ${f.N(add)} × ${f.N(k)} = ${f.N(add * k)}.`, `La boucle ajoute ${f.N(add)} en tout ${f.N(k)} fois : ${f.N(add)} × ${f.N(k)} = ${f.N(add * k)}.`)), bi((f) => `${f.N(start)} + ${f.N(add * k)} = ${f.N(ans)}.`)],
    nudge: t('Count how many times the loop repeats, then add the number that many times.', 'Compte combien de fois la boucle se répète, puis ajoute le nombre autant de fois.'),
  };
});
const conditional5 = numGen('MS.G5.C3.1.a', (_tier, r) => {
  const limit = randInt(r, 10, 40), a = randInt(r, 2, 9), b = randInt(r, 10, 19);
  const score = r() < 0.5 ? randInt(r, limit + 1, limit + 15) : randInt(r, 1, limit - 1);
  const ans = score > limit ? score + a : score + b;
  return {
    prompt: bi((f) => f.t(`A program uses a score of ${f.N(score)}. It says: if score is greater than ${f.N(limit)}, add ${f.N(a)} to score; otherwise, add ${f.N(b)} to score. What is score at the end?`, `Un programme utilise un score de ${f.N(score)}. Il dit : si le score est plus grand que ${f.N(limit)}, ajouter ${f.N(a)} au score ; sinon, ajouter ${f.N(b)} au score. Quel est le score à la fin ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[score > limit ? score + b : score + a, t('The wrong branch was followed. Check whether the score is greater than the limit, then follow the matching branch.', 'La mauvaise branche a été suivie. Vérifie si le score est plus grand que la limite, puis suis la branche correspondante.'), 0], [score, t('The program changes the score in both cases, so one of the additions must happen.', 'Le programme change le score dans les deux cas : une des additions doit avoir lieu.'), 1]]),
    steps: [bi((f) => (score > limit ? f.t(`${f.N(score)} is greater than ${f.N(limit)}, so the first branch runs: add ${f.N(a)}.`, `${f.N(score)} est plus grand que ${f.N(limit)} : la première branche s'exécute : ajouter ${f.N(a)}.`) : f.t(`${f.N(score)} is not greater than ${f.N(limit)}, so the otherwise branch runs: add ${f.N(b)}.`, `${f.N(score)} n'est pas plus grand que ${f.N(limit)} : la branche « sinon » s'exécute : ajouter ${f.N(b)}.`))), bi((f) => `${f.N(score)} + ${f.N(score > limit ? a : b)} = ${f.N(ans)}.`)],
    nudge: t('Decide whether the condition is true, then do only that branch.', 'Décide si la condition est vraie, puis exécute seulement cette branche.'),
  };
});
const loopIf5 = numGen('MS.G5.C3.1.a', (_tier, r) => {
  const m = randInt(r, 6, 12), by = pick(r, [2, 3]);
  let ans = 0; for (let i = 1; i <= m; i++) if (i % by === 0) ans += i;
  const word = by === 2 ? ['even', 'pair'] : ['a multiple of 3', 'un multiple de 3'];
  return {
    prompt: bi((f) => f.t(`A program sets total to ${f.N(0)}. Then, for each number from ${f.N(1)} to ${f.N(m)}: if the number is ${word[0]}, add it to total. What is total at the end?`, `Un programme met total à ${f.N(0)}. Ensuite, pour chaque nombre de ${f.N(1)} à ${f.N(m)} : si le nombre est ${word[1]}, l'ajouter à total. Quel est total à la fin ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[(m * (m + 1)) / 2, t('That adds every number. Only the numbers that pass the test are added.', 'Cela additionne tous les nombres. Seuls les nombres qui passent le test sont additionnés.'), 1], [Math.floor(m / by), t('That counts the numbers that pass the test. The program adds their values.', 'Cela compte les nombres qui passent le test. Le programme additionne leurs valeurs.'), 1]]),
    steps: [bi((f) => f.t(`List the numbers from ${f.N(1)} to ${f.N(m)} that are ${word[0]} and add them.`, `Note les nombres de ${f.N(1)} à ${f.N(m)} qui sont ${word[1]} et additionne-les.`)), bi((f) => `${Array.from({ length: m }, (_, i) => i + 1).filter((i) => i % by === 0).map((i) => f.N(i)).join(' + ')} = ${f.N(ans)}.`)],
    nudge: t('Go through the numbers one at a time and add only the ones that pass the test.', 'Parcours les nombres un à un et additionne seulement ceux qui passent le test.'),
  };
});
export const code5 = tierGen(loop5, conditional5, loopIf5);

/** MS.G5.C3.2.a: read and alter code; describe how changes affect outcomes */
const changeLoop5 = numGen('MS.G5.C3.2.a', (_tier, r) => {
  const add = randInt(r, 2, 9), k = randInt(r, 3, 7), k2 = k + randInt(r, 2, 5);
  const ans = add * k2;
  return {
    prompt: bi((f) => f.t(`A program sets total to ${f.N(0)} and then repeats ${f.N(k)} times: add ${f.N(add)} to total. It ends with total = ${f.N(add * k)}. You change the program to repeat ${f.N(k2)} times instead. What is total at the end now?`, `Un programme met total à ${f.N(0)} puis répète ${f.N(k)} fois : ajouter ${f.N(add)} à total. Il se termine avec total = ${f.N(add * k)}. Tu modifies le programme pour qu'il répète ${f.N(k2)} fois à la place. Quel est maintenant total à la fin ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[add * k, t('That is the old result. The change makes the loop run more times, so the total is bigger.', 'C\'est l\'ancien résultat. Le changement fait exécuter la boucle plus de fois : le total est plus grand.'), 1], [add * k + (k2 - k), t('Each extra repeat adds the whole number, not just one.', 'Chaque répétition de plus ajoute le nombre entier, pas seulement un.'), 1]]),
    steps: [bi((f) => f.t(`Each repeat adds ${f.N(add)}, and the loop now repeats ${f.N(k2)} times.`, `Chaque répétition ajoute ${f.N(add)}, et la boucle se répète maintenant ${f.N(k2)} fois.`)), bi((f) => `${f.N(add)} × ${f.N(k2)} = ${f.N(ans)}.`)],
    nudge: t('Use the new number of repeats with the same amount added each time.', 'Utilise le nouveau nombre de répétitions avec le même montant ajouté chaque fois.'),
  };
});
const changeLimit5 = numGen('MS.G5.C3.2.a', (_tier, r) => {
  const limit = randInt(r, 10, 30), a = randInt(r, 2, 9), b = randInt(r, 10, 19);
  const score = limit + randInt(r, 1, 5), newLimit = score + randInt(r, 1, 5);
  const before = score + a, after = score + b;
  return {
    prompt: bi((f) => f.t(`A program uses a score of ${f.N(score)}. It says: if score is greater than ${f.N(limit)}, add ${f.N(a)}; otherwise, add ${f.N(b)}. It ends with score = ${f.N(before)}. You change ${f.N(limit)} in the condition to ${f.N(newLimit)}. What is score at the end now?`, `Un programme utilise un score de ${f.N(score)}. Il dit : si le score est plus grand que ${f.N(limit)}, ajouter ${f.N(a)} ; sinon, ajouter ${f.N(b)}. Il se termine avec score = ${f.N(before)}. Tu changes ${f.N(limit)} dans la condition pour ${f.N(newLimit)}. Quel est maintenant score à la fin ?`)),
    answer: after, category: 'AP',
    wrong: wr(after, [[before, t('That is the old result. With the new limit the condition is no longer true, so the other branch runs.', 'C\'est l\'ancien résultat. Avec la nouvelle limite, la condition n\'est plus vraie : l\'autre branche s\'exécute.'), 0]]),
    steps: [bi((f) => f.t(`Is ${f.N(score)} greater than ${f.N(newLimit)}? No, so the otherwise branch runs.`, `Est-ce que ${f.N(score)} est plus grand que ${f.N(newLimit)} ? Non : la branche « sinon » s'exécute.`)), bi((f) => `${f.N(score)} + ${f.N(b)} = ${f.N(after)}.`)],
    nudge: t('Test the condition again with the new number and follow the branch that matches.', 'Teste de nouveau la condition avec le nouveau nombre et suis la branche qui correspond.'),
  };
});
const findRepeats5 = numGen('MS.G5.C3.2.a', (_tier, r) => {
  const add = randInt(r, 2, 9), k = randInt(r, 3, 9), start = randInt(r, 0, 5);
  const goal = start + add * k;
  return {
    prompt: bi((f) => f.t(`A program sets total to ${f.N(start)} and repeats: add ${f.N(add)} to total. You want total to end at ${f.N(goal)}. How many times should the loop repeat?`, `Un programme met total à ${f.N(start)} et répète : ajouter ${f.N(add)} à total. Tu veux que total se termine à ${f.N(goal)}. Combien de fois la boucle doit-elle se répéter ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[goal / add, t('That ignores the starting value. Take it away from the goal first.', 'Cela ignore la valeur de départ. Retire-la d\'abord de l\'objectif.'), 0], [goal - start, t('That is how much must be added, not how many repeats. Divide it by the amount added each time.', 'C\'est ce qu\'il faut ajouter, pas le nombre de répétitions. Divise-le par le montant ajouté chaque fois.'), 1]]),
    steps: [bi((f) => f.t(`The loop must add ${f.N(goal)} − ${f.N(start)} = ${f.N(goal - start)} in all.`, `La boucle doit ajouter ${f.N(goal)} − ${f.N(start)} = ${f.N(goal - start)} en tout.`)), bi((f) => `${f.N(goal - start)} ÷ ${f.N(add)} = ${f.N(k)}.`)],
    nudge: t('Find how much the loop must add in all, then divide by the amount added each time.', 'Trouve combien la boucle doit ajouter en tout, puis divise par le montant ajouté chaque fois.'),
  };
});
export const alterCode5 = tierGen(changeLoop5, changeLimit5, findRepeats5);
