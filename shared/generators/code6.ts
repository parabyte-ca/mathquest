// Grade 6 Algebra strand (C3 and C4), asked in words and numbers: coding with variables, loops and conditionals, and the
// modelling process. Programs are described in plain steps, so every item is an ordinary number question.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G6.C3.a: write and run code with variables, loops and conditionals */
const growingStep = numGen('MS.G6.C3.a', (_tier, r) => {
  const step = randInt(r, 1, 4), k = randInt(r, 3, 6), inc = randInt(r, 1, 3);
  let total = 0, s = step; for (let i = 0; i < k; i++) { total += s; s += inc; }
  return {
    prompt: bi((f) => f.t(`A program does this. Step 1: set total to ${f.N(0)} and step to ${f.N(step)}. Step 2: repeat ${f.N(k)} times: add step to total, then add ${f.N(inc)} to step. What is total at the end?`, `Un programme fait ceci. Étape 1 : mettre total à ${f.N(0)} et pas à ${f.N(step)}. Étape 2 : répéter ${f.N(k)} fois : ajouter pas à total, puis ajouter ${f.N(inc)} à pas. Quel est total à la fin ?`)),
    answer: total, category: 'AP',
    wrong: wr(total, [[step * k, t('The step changes inside the loop. After each repeat it grows, so later repeats add more.', 'Le pas change dans la boucle. Après chaque répétition, il augmente : les répétitions suivantes ajoutent plus.'), 1], [total - step, t('Check the first repeat: it adds the starting step before the step grows.', 'Vérifie la première répétition : elle ajoute le pas de départ avant que le pas augmente.'), 1]]),
    steps: [bi((f) => f.t(`Follow each repeat: the amounts added are ${Array.from({ length: k }, (_, i) => f.N(step + inc * i)).join(', ')}.`, `Suis chaque répétition : les montants ajoutés sont ${Array.from({ length: k }, (_, i) => f.N(step + inc * i)).join(', ')}.`)), bi((f) => `${Array.from({ length: k }, (_, i) => f.N(step + inc * i)).join(' + ')} = ${f.N(total)}.`)],
    nudge: t('Go through the loop one repeat at a time and write down total and step each time.', 'Parcours la boucle une répétition à la fois et note total et pas chaque fois.'),
  };
});
const loopCondition = numGen('MS.G6.C3.a', (_tier, r) => {
  const m = randInt(r, 8, 15), by = pick(r, [3, 4, 5]), a = randInt(r, 2, 4);
  let total = 0; for (let i = 1; i <= m; i++) total += i % by === 0 ? a : 1;
  return {
    prompt: bi((f) => f.t(`A program sets total to ${f.N(0)}. For each number from ${f.N(1)} to ${f.N(m)}: if the number can be divided by ${f.N(by)} with no remainder, add ${f.N(a)} to total; otherwise, add ${f.N(1)}. What is total at the end?`, `Un programme met total à ${f.N(0)}. Pour chaque nombre de ${f.N(1)} à ${f.N(m)} : si le nombre se divise par ${f.N(by)} sans reste, ajouter ${f.N(a)} à total ; sinon, ajouter ${f.N(1)}. Quel est total à la fin ?`)),
    answer: total, category: 'AP',
    wrong: wr(total, [[m, t('That adds 1 every time. Some numbers take the other branch and add more.', 'Cela ajoute 1 chaque fois. Certains nombres suivent l\'autre branche et ajoutent plus.'), 1], [a * Math.floor(m / by), t('That only counts the numbers that pass the test. The other numbers add 1 each.', 'Cela ne compte que les nombres qui passent le test. Les autres nombres ajoutent 1 chacun.'), 1]]),
    steps: [bi((f) => f.t(`${f.N(Math.floor(m / by))} of the numbers can be divided by ${f.N(by)}, and the other ${f.N(m - Math.floor(m / by))} cannot.`, `${f.N(Math.floor(m / by))} des nombres se divisent par ${f.N(by)}, et les ${f.N(m - Math.floor(m / by))} autres non.`)), bi((f) => `${f.N(Math.floor(m / by))} × ${f.N(a)} + ${f.N(m - Math.floor(m / by))} × ${f.N(1)} = ${f.N(total)}.`)],
    nudge: t('Count the numbers that pass the test and the numbers that do not, then add the right amount for each.', 'Compte les nombres qui passent le test et ceux qui ne le passent pas, puis ajoute le bon montant pour chacun.'),
  };
});
const untilLoop = numGen('MS.G6.C3.a', (_tier, r) => {
  const start = randInt(r, 1, 5), factor = pick(r, [2, 3]), limit = randInt(r, 40, 200);
  let x = start, count = 0; while (x <= limit) { x *= factor; count++; }
  return {
    prompt: bi((f) => f.t(`A program sets x to ${f.N(start)}. Then it repeats this while x is ${f.N(limit)} or less: multiply x by ${f.N(factor)}. How many times does the loop run?`, `Un programme met x à ${f.N(start)}. Ensuite, il répète ceci tant que x est de ${f.N(limit)} ou moins : multiplier x par ${f.N(factor)}. Combien de fois la boucle s'exécute-t-elle ?`)),
    answer: count, category: 'TH',
    wrong: wr(count, [[count - 1, t('The loop runs once more after x reaches the last value that is still at most the limit.', 'La boucle s\'exécute une fois de plus après que x atteint la dernière valeur encore inférieure ou égale à la limite.'), 1], [count + 1, t('The test is checked before each repeat. When x is above the limit, the loop stops.', 'Le test est vérifié avant chaque répétition. Quand x dépasse la limite, la boucle s\'arrête.'), 1], [Math.floor(limit / start / factor), t('Multiplying repeatedly grows much faster than that. Follow the values of x one repeat at a time.', 'Multiplier plusieurs fois fait croître beaucoup plus vite. Suis les valeurs de x une répétition à la fois.'), 1]]),
    steps: [bi((f) => { const vs: number[] = []; let y = start; while (y <= limit) { vs.push(y); y *= factor; } vs.push(y); return f.t(`The values of x are ${vs.map((v) => f.N(v)).join(', ')}.`, `Les valeurs de x sont ${vs.map((v) => f.N(v)).join(', ')}.`); }), bi((f) => f.t(`The loop runs while x is ${f.N(limit)} or less, which happens ${f.N(count)} times.`, `La boucle s'exécute tant que x est de ${f.N(limit)} ou moins, ce qui arrive ${f.N(count)} fois.`))],
    nudge: t('Write down x after each repeat and stop when it goes above the limit.', 'Note x après chaque répétition et arrête-toi quand il dépasse la limite.'),
  };
});
export const code6 = tierGen(growingStep, loopCondition, untilLoop);

/** MS.G6.C3.b: read and alter code, and describe how a change affects the result */
const changeAmount = numGen('MS.G6.C3.b', (_tier, r) => {
  const a = randInt(r, 2, 8), k = randInt(r, 3, 9), a2 = a + randInt(r, 1, 5), start = randInt(r, 0, 10);
  const ans = start + a2 * k;
  return {
    prompt: bi((f) => f.t(`A program sets total to ${f.N(start)} and repeats ${f.N(k)} times: add ${f.N(a)} to total. It ends with total = ${f.N(start + a * k)}. You change the amount added in each repeat from ${f.N(a)} to ${f.N(a2)}. What is total at the end now?`, `Un programme met total à ${f.N(start)} et répète ${f.N(k)} fois : ajouter ${f.N(a)} à total. Il se termine avec total = ${f.N(start + a * k)}. Tu changes le montant ajouté à chaque répétition de ${f.N(a)} à ${f.N(a2)}. Quel est maintenant total à la fin ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[start + a * k, t('That is the old result. The new amount is added every repeat, so the total is bigger.', 'C\'est l\'ancien résultat. Le nouveau montant est ajouté à chaque répétition : le total est plus grand.'), 1], [start + a * k + (a2 - a), t('The change applies to every repeat, not only once.', 'Le changement s\'applique à chaque répétition, pas une seule fois.'), 1]]),
    steps: [bi((f) => f.t(`The new loop adds ${f.N(a2)} a total of ${f.N(k)} times: ${f.N(a2)} × ${f.N(k)} = ${f.N(a2 * k)}.`, `La nouvelle boucle ajoute ${f.N(a2)} en tout ${f.N(k)} fois : ${f.N(a2)} × ${f.N(k)} = ${f.N(a2 * k)}.`)), bi((f) => `${f.N(start)} + ${f.N(a2 * k)} = ${f.N(ans)}.`)],
    nudge: t('Use the new amount for every repeat and keep the starting value.', 'Utilise le nouveau montant pour chaque répétition et garde la valeur de départ.'),
  };
});
const changeTest = numGen('MS.G6.C3.b', (_tier, r) => {
  const m = randInt(r, 10, 20), by = pick(r, [3, 4, 5]), by2 = pick(r, [2, 6].filter((x) => x !== by));
  const count = (d: number): number => { let c = 0; for (let i = 1; i <= m; i++) if (i % d === 0) c++; return c; };
  return {
    prompt: bi((f) => f.t(`A program counts how many numbers from ${f.N(1)} to ${f.N(m)} can be divided by ${f.N(by)} with no remainder. You change the ${f.N(by)} in the test to ${f.N(by2)}. How many numbers does the program count now?`, `Un programme compte combien de nombres de ${f.N(1)} à ${f.N(m)} se divisent par ${f.N(by)} sans reste. Tu changes le ${f.N(by)} dans le test pour ${f.N(by2)}. Combien de nombres le programme compte-t-il maintenant ?`)),
    answer: count(by2), category: 'AP',
    wrong: wr(count(by2), [[count(by), t('That is the old count. The new test picks out different numbers.', 'C\'est l\'ancien compte. Le nouveau test choisit d\'autres nombres.'), 0], [m - count(by2), t('That counts the numbers that fail the new test. The program counts the ones that pass.', 'Cela compte les nombres qui échouent au nouveau test. Le programme compte ceux qui le passent.'), 1]]),
    steps: [bi((f) => f.t(`List the numbers from ${f.N(1)} to ${f.N(m)} that can be divided by ${f.N(by2)}: ${Array.from({ length: m }, (_, i) => i + 1).filter((i) => i % by2 === 0).map((i) => f.N(i)).join(', ')}.`, `Note les nombres de ${f.N(1)} à ${f.N(m)} qui se divisent par ${f.N(by2)} : ${Array.from({ length: m }, (_, i) => i + 1).filter((i) => i % by2 === 0).map((i) => f.N(i)).join(', ')}.`)), bi((f) => f.t(`There are ${f.N(count(by2))}.`, `Il y en a ${f.N(count(by2))}.`))],
    nudge: t('Run the program again with the new test and count the numbers that pass.', 'Refais fonctionner le programme avec le nouveau test et compte les nombres qui le passent.'),
  };
});
const targetRepeats = numGen('MS.G6.C3.b', (_tier, r) => {
  const start = randInt(r, 2, 15), add = randInt(r, 3, 12), k = randInt(r, 3, 9);
  const goal = start + add * k;
  return {
    prompt: bi((f) => f.t(`A program sets total to ${f.N(start)}, then repeats: add ${f.N(add)} to total. You want total to end at exactly ${f.N(goal)}. How many times should the loop repeat?`, `Un programme met total à ${f.N(start)}, puis répète : ajouter ${f.N(add)} à total. Tu veux que total se termine exactement à ${f.N(goal)}. Combien de fois la boucle doit-elle se répéter ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[goal / add, t('Take the starting value off the goal first, then divide by the amount added.', 'Retire d\'abord la valeur de départ de l\'objectif, puis divise par le montant ajouté.'), 0], [goal - start, t('That is how much must be added in all. Divide by the amount added each repeat.', 'C\'est ce qu\'il faut ajouter en tout. Divise par le montant ajouté à chaque répétition.'), 1]]),
    steps: [bi((f) => f.t(`The loop must add ${f.N(goal)} − ${f.N(start)} = ${f.N(goal - start)} in all.`, `La boucle doit ajouter ${f.N(goal)} − ${f.N(start)} = ${f.N(goal - start)} en tout.`)), bi((f) => `${f.N(goal - start)} ÷ ${f.N(add)} = ${f.N(k)}.`)],
    nudge: t('Work out how much the loop must add, then divide by the amount added each repeat.', 'Calcule ce que la boucle doit ajouter, puis divise par le montant ajouté à chaque répétition.'),
  };
});
export const alterCode6 = tierGen(changeAmount, changeTest, targetRepeats);

/** MS.G6.C4.a: the modelling process (question, plan and assumptions, calculation, reasonable answer, change the assumptions) */
const pizzaModel = numGen('MS.G6.C4.a', (_tier, r) => {
  const people = randInt(r, 12, 40), slices = randInt(r, 2, 4), per = pick(r, [8, 10, 12]);
  const need = Math.ceil((people * slices) / per);
  return {
    prompt: bi((f) => f.t(`${f.N(people)} students will each eat ${f.N(slices)} slices of pizza, and each pizza has ${f.N(per)} slices. How many pizzas should be ordered so nobody goes without? (Whole pizzas only.)`, `${f.N(people)} élèves mangeront chacun ${f.N(slices)} pointes de pizza, et chaque pizza a ${f.N(per)} pointes. Combien de pizzas faut-il commander pour que personne n'en manque ? (Des pizzas entières seulement.)`)),
    answer: need, category: 'AP',
    wrong: wr(need, [[Math.floor((people * slices) / per), t('Round up, not down: with this many slices there would not be enough for everyone.', 'Arrondis vers le haut, pas vers le bas : avec ce nombre de pointes, il n\'y en aurait pas assez pour tout le monde.'), 1], [people * slices, t('That is the number of slices needed. Divide by the slices in one pizza.', 'C\'est le nombre de pointes nécessaires. Divise par les pointes d\'une pizza.'), 1]]),
    steps: [bi((f) => f.t(`Slices needed: ${f.N(people)} × ${f.N(slices)} = ${f.N(people * slices)}.`, `Pointes nécessaires : ${f.N(people)} × ${f.N(slices)} = ${f.N(people * slices)}.`)), bi((f) => f.t(`${f.N(people * slices)} ÷ ${f.N(per)} = ${f.N(r6((people * slices) / per))}, and you cannot order part of a pizza, so round up to ${f.N(need)}.`, `${f.N(people * slices)} ÷ ${f.N(per)} = ${f.N(r6((people * slices) / per))}, et on ne peut pas commander une partie de pizza : arrondis vers le haut à ${f.N(need)}.`))],
    nudge: t('Find the total slices needed, divide by the slices per pizza, and think about whether to round up or down.', 'Trouve le total de pointes nécessaires, divise par les pointes par pizza et réfléchis s\'il faut arrondir vers le haut ou vers le bas.'),
  };
});
const tankModel = numGen('MS.G6.C4.a', (_tier, r) => {
  const out = randInt(r, 1, 4), inn = out + randInt(r, 2, 8), mins = randInt(r, 5, 25);
  const tank = (inn - out) * mins;
  return {
    prompt: bi((f) => f.t(`A model for a tank says it fills at ${f.N(inn)} litres per minute while a leak lets out ${f.N(out)} litres per minute. How many minutes does it take to fill a ${f.N(tank)} litre tank?`, `Un modèle d'un réservoir dit qu'il se remplit à ${f.N(inn)} litres par minute pendant qu'une fuite laisse sortir ${f.N(out)} litres par minute. Combien de minutes faut-il pour remplir un réservoir de ${f.N(tank)} litres ?`)),
    answer: mins, category: 'AP',
    wrong: wr(mins, [[tank / inn, t('The leak means the tank does not fill that fast. Use the net amount gained each minute.', 'La fuite fait que le réservoir ne se remplit pas aussi vite. Utilise la quantité nette gagnée chaque minute.'), 1], [tank / (inn + out), t('The leak takes water away, so subtract it, do not add it.', 'La fuite enlève de l\'eau : soustrais-la, ne l\'ajoute pas.'), 0]]),
    steps: [bi((f) => f.t(`Net gain each minute: ${f.N(inn)} − ${f.N(out)} = ${f.N(inn - out)} litres.`, `Gain net chaque minute : ${f.N(inn)} − ${f.N(out)} = ${f.N(inn - out)} litres.`)), bi((f) => `${f.N(tank)} ÷ ${f.N(inn - out)} = ${f.N(mins)}.`)],
    nudge: t('Find how many litres the tank really gains each minute, then divide the size of the tank by that.', 'Trouve combien de litres le réservoir gagne vraiment chaque minute, puis divise la capacité du réservoir par ce nombre.'),
  };
});
const changeAssumption = numGen('MS.G6.C4.a', (_tier, r) => {
  const people = randInt(r, 12, 30), slices = randInt(r, 2, 3), per = pick(r, [8, 10, 12]), extra = randInt(r, 4, 14);
  const need = (n: number): number => Math.ceil((n * slices) / per);
  const more = need(people + extra) - need(people);
  return {
    prompt: bi((f) => f.t(`A plan orders pizzas so that ${f.N(people)} students can each have ${f.N(slices)} slices, with ${f.N(per)} slices in a pizza. Then ${f.N(extra)} more students join. How many more pizzas must be ordered than in the first plan? (Whole pizzas only.)`, `Un plan commande des pizzas pour que ${f.N(people)} élèves aient chacun ${f.N(slices)} pointes, avec ${f.N(per)} pointes par pizza. Puis ${f.N(extra)} élèves de plus se joignent. Combien de pizzas de plus faut-il commander que dans le premier plan ? (Des pizzas entières seulement.)`)),
    answer: more, category: 'TH',
    wrong: wr(more, [[need(people + extra), t('That is the total pizzas for the new plan. The question asks how many more than the first plan.', 'C\'est le total de pizzas du nouveau plan. La question demande combien de plus que le premier plan.'), 1], [r6((extra * slices) / per), t('Pizzas are ordered whole, so work out each plan with rounding and then subtract.', 'Les pizzas se commandent entières : calcule chaque plan avec l\'arrondi, puis soustrais.'), 1]]),
    steps: [bi((f) => f.t(`First plan: ${f.N(people)} × ${f.N(slices)} ÷ ${f.N(per)} rounds up to ${f.N(need(people))} pizzas. New plan: ${f.N(people + extra)} × ${f.N(slices)} ÷ ${f.N(per)} rounds up to ${f.N(need(people + extra))} pizzas.`, `Premier plan : ${f.N(people)} × ${f.N(slices)} ÷ ${f.N(per)} arrondi vers le haut donne ${f.N(need(people))} pizzas. Nouveau plan : ${f.N(people + extra)} × ${f.N(slices)} ÷ ${f.N(per)} arrondi vers le haut donne ${f.N(need(people + extra))} pizzas.`)), bi((f) => `${f.N(need(people + extra))} − ${f.N(need(people))} = ${f.N(more)}.`)],
    nudge: t('Work out the pizzas for each plan, rounding up each time, then subtract.', 'Calcule les pizzas pour chaque plan, en arrondissant vers le haut chaque fois, puis soustrais.'),
  };
});
export const modelling6 = tierGen(pizzaModel, tankModel, changeAssumption);
