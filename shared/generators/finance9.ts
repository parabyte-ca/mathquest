// Grade 9 (MTH1W) Financial Literacy (F): past and present situations, appreciation and depreciation, the cost of borrowing, and
// modifying a budget. Rates are chosen so every answer is exact.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const $$ = (f: F, x: number): string => f.D(r6(x));
const pc = (f: F, x: number): string => f.m(`${f.n(x)}\\%`);

/** MTH1W.F1.1: past and present financial situations */
export const situations9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const old = randInt(r, 2, 20) * 10, up = pick(r, [10, 20, 25, 50]), now = r6(old * (1 + up / 100));
    return {
      prompt: bi((f) => f.t(`A bicycle cost ${$$(f, old)} ten years ago and costs ${$$(f, now)} today. By what percent has the price risen?`, `Un vélo coûtait ${$$(f, old)} il y a dix ans et coûte ${$$(f, now)} aujourd'hui. De quel pourcentage le prix a-t-il augmenté ?`)),
      answer: up, category: 'AP',
      wrong: wr(up, [[r6(now - old), t('That is the rise in dollars. A percent compares the rise with the old price.', 'C\'est la hausse en dollars. Un pourcentage compare la hausse à l\'ancien prix.'), 1], [r6(((now - old) / now) * 100), t('Divide by the old price (the starting amount), not the new one.', 'Divise par l\'ancien prix (le montant de départ), pas par le nouveau.'), 1], [r6((now / old) * 100), t('That compares the new price with the old one. Subtract 100% to get the rise.', 'Cela compare le nouveau prix à l\'ancien. Retire 100 % pour obtenir la hausse.'), 1]]),
      steps: [bi((f) => f.t(`The rise is ${f.m(`${f.n(now)} - ${f.n(old)}`)} = ${$$(f, now - old)}.`, `La hausse est ${f.m(`${f.n(now)} - ${f.n(old)}`)} = ${$$(f, now - old)}.`)), bi((f) => f.t(`${f.m(`${f.n(now - old)} \\div ${f.n(old)} \\times 100`)} = ${pc(f, up)}.`, `${f.m(`${f.n(now - old)} \\div ${f.n(old)} \\times 100`)} = ${pc(f, up)}.`))],
      nudge: t('Percent change = change ÷ original amount × 100.', 'Variation en pourcentage = variation ÷ montant de départ × 100.'),
    };
  }
  if (tier === 2) {
    const wageThen = randInt(r, 5, 9), wageNow = wageThen + randInt(r, 3, 8), cost = wageNow * randInt(r, 4, 12), hoursThen = r6(cost / wageThen), hoursNow = cost / wageNow;
    return {
      prompt: bi((f) => f.t(`A part-time job paid ${$$(f, wageThen)} per hour in 2005 and pays ${$$(f, wageNow)} per hour now. A game console costs ${$$(f, cost)}. How many fewer hours of work does it take to earn the console now than in 2005?`, `Un emploi à temps partiel payait ${$$(f, wageThen)} de l'heure en 2005 et paie ${$$(f, wageNow)} de l'heure maintenant. Une console de jeu coûte ${$$(f, cost)}. Combien d'heures de travail de moins faut-il maintenant pour gagner la console qu'en 2005 ?`)),
      answer: r6(hoursThen - hoursNow), tolerance: 0.011, category: 'AP',
      wrong: wr(r6(hoursThen - hoursNow), [[r6(hoursNow), t('That is the hours needed now. Find the difference between then and now.', 'C\'est le nombre d\'heures nécessaires maintenant. Trouve la différence entre alors et maintenant.'), 1], [r6(hoursThen), t('That is the hours needed then. Subtract the hours needed now.', 'C\'est le nombre d\'heures nécessaires alors. Soustrais les heures nécessaires maintenant.'), 1], [wageNow - wageThen, t('That is the difference in wages. Compare the hours, which are cost ÷ wage.', 'C\'est la différence de salaires. Compare les heures, soit coût ÷ salaire.'), 1]]),
      steps: [bi((f) => f.t(`Hours then: ${f.m(`${f.n(cost)} \\div ${f.n(wageThen)}`)} = ${f.N(hoursThen)}. Hours now: ${f.m(`${f.n(cost)} \\div ${f.n(wageNow)}`)} = ${f.N(hoursNow)}.`, `Heures alors : ${f.m(`${f.n(cost)} \\div ${f.n(wageThen)}`)} = ${f.N(hoursThen)}. Heures maintenant : ${f.m(`${f.n(cost)} \\div ${f.n(wageNow)}`)} = ${f.N(hoursNow)}.`)), bi((f) => f.t(`The difference is ${f.N(r6(hoursThen - hoursNow))} hours.`, `La différence est de ${f.N(r6(hoursThen - hoursNow))} heures.`))],
      nudge: t('Hours of work needed = cost ÷ hourly wage. Find it for each year, then subtract.', 'Heures de travail nécessaires = coût ÷ salaire horaire. Trouve-les pour chaque année, puis soustrais.'),
    };
  }
  const base = randInt(r, 1, 9) * 100, years = pick(r, [2, 3]), rate = 10, ans = r6(base * (1 + rate / 100) ** years);
  return {
    prompt: bi((f) => f.t(`A basket of groceries costs ${$$(f, base)} today. Prices rise by ${pc(f, rate)} each year. What will the basket cost in ${f.N(years)} years?`, `Un panier d'épicerie coûte ${$$(f, base)} aujourd'hui. Les prix augmentent de ${pc(f, rate)} chaque année. Combien le panier coûtera-t-il dans ${f.N(years)} ans ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6(base * (1 + (rate / 100) * years)), t('Each year the rise applies to the new price, so it compounds: multiply by 1.1 each year.', 'Chaque année, la hausse s\'applique au nouveau prix : elle se compose : multiplie par 1,1 chaque année.'), 1], [r6(base * (1 + rate / 100)), t('That is only one year of increase. Repeat it for each year.', 'C\'est seulement une année de hausse. Répète-la pour chaque année.'), 1], [r6(base * rate / 100 * years), t('That is the total rise, not the new price. Add it to the starting price.', 'C\'est la hausse totale, pas le nouveau prix. Ajoute-la au prix de départ.'), 1]]),
    steps: [bi((f) => f.t(`Each year the price is multiplied by 1.1: ${f.m(`${f.n(base)} \\times 1.1^{${f.n(years)}}`)}.`, `Chaque année, le prix est multiplié par 1,1 : ${f.m(`${f.n(base)} \\times 1.1^{${f.n(years)}}`)}.`)), bi((f) => f.t(`The basket will cost ${$$(f, ans)}.`, `Le panier coûtera ${$$(f, ans)}.`))],
    nudge: t('A rise of 10% a year means multiplying by 1.1 each year.', 'Une hausse de 10 % par an signifie multiplier par 1,1 chaque année.'),
  };
});

/** MTH1W.F1.2: appreciation and depreciation */
export const depreciation9 = (id: string): Generator => {
  const linear = numGen(id, (_tier, r) => {
    const price = randInt(r, 5, 40) * 100, loss = randInt(r, 1, 5) * 50, years = randInt(r, 2, 6), ans = price - loss * years;
    return {
      prompt: bi((f) => f.t(`A laptop bought for ${$$(f, price)} loses ${$$(f, loss)} of value every year. What is it worth after ${f.N(years)} years?`, `Un portable acheté ${$$(f, price)} perd ${$$(f, loss)} de valeur chaque année. Combien vaut-il après ${f.N(years)} ans ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[price - loss, t('The loss happens every year, so multiply it by the number of years.', 'La perte se produit chaque année : multiplie-la par le nombre d\'années.'), 0], [price + loss * years, t('It loses value (depreciates), so subtract.', 'Il perd de la valeur (se déprécie) : soustrais.'), 1], [loss * years, t('That is the total loss. Subtract it from the starting price.', 'C\'est la perte totale. Soustrais-la du prix de départ.'), 1]]),
      steps: [bi((f) => f.t(`Total loss: ${f.m(`${f.n(loss)} \\times ${f.n(years)}`)} = ${$$(f, loss * years)}.`, `Perte totale : ${f.m(`${f.n(loss)} \\times ${f.n(years)}`)} = ${$$(f, loss * years)}.`)), bi((f) => f.t(`${f.m(`${f.n(price)} - ${f.n(loss * years)}`)} = ${$$(f, ans)}.`, `${f.m(`${f.n(price)} - ${f.n(loss * years)}`)} = ${$$(f, ans)}.`))],
      nudge: t('Multiply the yearly loss by the years, then subtract from the price.', 'Multiplie la perte annuelle par les années, puis soustrais du prix.'),
    };
  });
  const exponential = numGen(id, (_tier, r) => {
    const price = randInt(r, 1, 9) * 1000, down = r() < 0.5, years = randInt(r, 2, 3), rate = down ? 20 : 10, factor = down ? 0.8 : 1.1, ans = r6(price * factor ** years);
    return {
      prompt: bi((f) => f.t(`${down ? 'A car bought for' : 'A rare coin bought for'} ${$$(f, price)} ${down ? 'loses' : 'gains'} ${pc(f, rate)} of its value each year. What is it worth after ${f.N(years)} years?`, `${down ? 'Une voiture achetée' : 'Une pièce rare achetée'} ${$$(f, price)} ${down ? 'perd' : 'gagne'} ${pc(f, rate)} de sa valeur chaque année. Combien vaut-elle après ${f.N(years)} ans ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(price * (1 + (down ? -rate : rate) / 100 * years)), t('Each year the percent applies to the new value, so multiply by the factor repeatedly instead of taking the same amount each year.', 'Chaque année, le pourcentage s\'applique à la nouvelle valeur : multiplie par le facteur à répétition au lieu d\'enlever le même montant chaque année.'), 1], [r6(price * factor), t('That is only one year. Repeat it for each year.', 'C\'est seulement une année. Répète-le pour chaque année.'), 1], [r6(price * (2 - factor) ** years), t(down ? 'For a loss the factor is 1 − rate (0.8), not 1 + rate.' : 'For a gain the factor is 1 + rate (1.1), not 1 − rate.', down ? 'Pour une perte, le facteur est 1 − taux (0,8), pas 1 + taux.' : 'Pour un gain, le facteur est 1 + taux (1,1), pas 1 − taux.'), 0]]),
      steps: [bi((f) => f.t(`Each year the value is multiplied by ${f.N(factor)}.`, `Chaque année, la valeur est multipliée par ${f.N(factor)}.`)), bi((f) => f.t(`${f.m(`${f.n(price)} \\times ${f.n(factor)}^{${f.n(years)}}`)} = ${$$(f, ans)}.`, `${f.m(`${f.n(price)} \\times ${f.n(factor)}^{${f.n(years)}}`)} = ${$$(f, ans)}.`))],
      nudge: t('Multiply by 1 − rate for depreciation, or 1 + rate for appreciation, once for each year.', 'Multiplie par 1 − taux pour une dépréciation, ou 1 + taux pour une appréciation, une fois par année.'),
    };
  });
  const graph = choiceGen(id, (_tier, r) => {
    const DESC: [string, string, string, string][] = [
      ['A car loses 15% of its value every year.', 'Une voiture perd 15 % de sa valeur chaque année.', 'A curve that falls quickly at first and then flattens out', 'Une courbe qui descend vite au début puis s\'aplatit'],
      ['A computer loses the same $\\dollar 200$ of value every year.', 'Un ordinateur perd les mêmes $200\\ \\dollar$ de valeur chaque année.', 'A straight line that goes down at a steady rate', 'Une droite qui descend à un rythme constant'],
      ['A painting gains 8% of its value every year.', 'Un tableau gagne 8 % de sa valeur chaque année.', 'A curve that rises slowly at first and then more and more steeply', 'Une courbe qui monte lentement au début puis de plus en plus vite'],
      ['A house gains the same $\\dollar 10\\,000$ of value every year.', 'Une maison gagne les mêmes $10\\,000\\ \\dollar$ de valeur chaque année.', 'A straight line that goes up at a steady rate', 'Une droite qui monte à un rythme constant'],
    ];
    const i = randInt(r, 0, DESC.length - 1), d = DESC[i]!;
    const m = mc(r, t(d[2], d[3]), DESC.filter((_, j) => j !== i).map((x): [Text, Text] => [t(x[2], x[3]), t('Think about whether the change is the same amount each year (a straight line) or the same percent (a curve), and whether the value rises or falls.', 'Demande-toi si le changement est le même montant chaque année (une droite) ou le même pourcentage (une courbe), et si la valeur monte ou descend.')]));
    return {
      prompt: bi((f) => f.t(`${d[0]} Which describes the graph of its value over time?`, `${d[1]} Lequel décrit le graphique de sa valeur dans le temps ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('The same amount each year gives a straight line; the same percent each year gives a curve.', 'Le même montant chaque année donne une droite ; le même pourcentage chaque année donne une courbe.'), t(`So the graph is: ${d[2].toLowerCase()}.`, `Le graphique est donc : ${d[3].toLowerCase()}.`)],
      nudge: t('Is the change the same amount, or the same percent, each year? Does the value go up or down?', 'Le changement est-il le même montant ou le même pourcentage chaque année ? La valeur monte-t-elle ou descend-elle ?'),
    };
  });
  return tierGen(linear, exponential, graph);
};

/** MTH1W.F1.3: how rate, time, interest method and down payment affect the cost of borrowing */
export const borrowing9 = (id: string): Generator => numGen(id, (tier, r) => {
  const P = randInt(r, 1, 20) * 500, rate = pick(r, [4, 5, 6, 8, 10]), years = randInt(r, 2, 5);
  const interest = (p: number, rt: number, y: number): number => r6((p * rt * y) / 100);
  if (tier === 1) {
    const I = interest(P, rate, years);
    return {
      prompt: bi((f) => f.t(`${$$(f, P)} is borrowed for ${f.N(years)} years at ${pc(f, rate)} simple interest per year. How much interest is paid in total?`, `${$$(f, P)} sont empruntés pour ${f.N(years)} ans à ${pc(f, rate)} d'intérêt simple par an. Combien d'intérêt est payé au total ?`)),
      answer: I, category: 'AP',
      wrong: wr(I, [[r6((P * rate) / 100), t('That is one year of interest. Multiply by the number of years.', 'C\'est une année d\'intérêt. Multiplie par le nombre d\'années.'), 1], [r6(P + I), t('That is the total to repay (principal plus interest). The question asks for the interest only.', 'C\'est le total à rembourser (capital plus intérêt). La question demande seulement l\'intérêt.'), 1], [r6((P * rate * years) / 10), t('Percent means divide by 100: I = P × rate ÷ 100 × years.', 'Pour cent signifie diviser par 100 : I = P × taux ÷ 100 × années.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`I = P \\times r \\times t = ${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)}.`, `${f.m(`I = P \\times r \\times t = ${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)}.`)), bi((f) => f.t(`The interest is ${$$(f, I)}.`, `L'intérêt est de ${$$(f, I)}.`))],
      nudge: t('Simple interest = principal × rate × time.', 'Intérêt simple = capital × taux × temps.'),
    };
  }
  if (tier === 2) {
    const price = randInt(r, 4, 30) * 500, down = Math.round(price * pick(r, [0.1, 0.2, 0.25]) / 100) * 100 || 100, loan = price - down, I = interest(loan, rate, years), total = r6(down + loan + I);
    return {
      prompt: bi((f) => f.t(`A ${$$(f, price)} sofa is bought with a ${$$(f, down)} down payment. The rest is borrowed for ${f.N(years)} years at ${pc(f, rate)} simple interest per year. What is the total cost of the sofa, including interest?`, `Un canapé de ${$$(f, price)} est acheté avec un acompte de ${$$(f, down)}. Le reste est emprunté pour ${f.N(years)} ans à ${pc(f, rate)} d'intérêt simple par an. Quel est le coût total du canapé, intérêt compris ?`)),
      answer: total, category: 'AP',
      wrong: wr(total, [[r6(price + interest(price, rate, years)), t('Interest is charged only on the amount borrowed (the price minus the down payment).', 'L\'intérêt n\'est facturé que sur le montant emprunté (le prix moins l\'acompte).'), 1], [r6(loan + I), t('Add the down payment too: it is part of what you paid.', 'Ajoute aussi l\'acompte : il fait partie de ce que tu as payé.'), 1], [r6(price + I - down), t('The down payment is money you pay, so it adds to the total, not subtracts.', 'L\'acompte est de l\'argent que tu paies : il s\'ajoute au total, il ne se soustrait pas.'), 1]]),
      steps: [bi((f) => f.t(`Borrowed: ${f.m(`${f.n(price)} - ${f.n(down)}`)} = ${$$(f, loan)}. Interest: ${f.m(`${f.n(loan)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)} = ${$$(f, I)}.`, `Emprunté : ${f.m(`${f.n(price)} - ${f.n(down)}`)} = ${$$(f, loan)}. Intérêt : ${f.m(`${f.n(loan)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)} = ${$$(f, I)}.`)), bi((f) => f.t(`Total: ${f.m(`${f.n(down)} + ${f.n(loan)} + ${f.n(I)}`)} = ${$$(f, total)}.`, `Total : ${f.m(`${f.n(down)} + ${f.n(loan)} + ${f.n(I)}`)} = ${$$(f, total)}.`))],
      nudge: t('Find the amount borrowed, the interest on it, then add the down payment, the loan and the interest.', 'Trouve le montant emprunté, l\'intérêt sur ce montant, puis additionne l\'acompte, l\'emprunt et l\'intérêt.'),
    };
  }
  const rate2 = rate + pick(r, [1, 2, 3]), years2 = Math.max(1, years - pick(r, [0, 1])), I1 = interest(P, rate, years), I2 = interest(P, rate2, years2), ans = r6(Math.abs(I1 - I2));
  if (ans === 0) return { prompt: bi((f) => f.t(`${$$(f, P)} is borrowed for ${f.N(years)} years at ${pc(f, rate)} simple interest per year. How much interest is paid in total?`, `${$$(f, P)} sont empruntés pour ${f.N(years)} ans à ${pc(f, rate)} d'intérêt simple par an. Combien d'intérêt est payé au total ?`)), answer: I1, category: 'AP', steps: [t('Use I = P × r × t.', 'Utilise I = P × r × t.'), bi((f) => f.t(`The interest is ${$$(f, I1)}.`, `L'intérêt est de ${$$(f, I1)}.`))], nudge: t('Simple interest = principal × rate × time.', 'Intérêt simple = capital × taux × temps.') };
  return {
    prompt: bi((f) => f.t(`Loan A: ${$$(f, P)} for ${f.N(years)} years at ${pc(f, rate)} simple interest. Loan B: ${$$(f, P)} for ${f.N(years2)} year${years2 === 1 ? '' : 's'} at ${pc(f, rate2)} simple interest. How many dollars more interest does the more expensive loan cost than the cheaper one?`, `Prêt A : ${$$(f, P)} pour ${f.N(years)} ans à ${pc(f, rate)} d'intérêt simple. Prêt B : ${$$(f, P)} pour ${f.N(years2)} an${years2 === 1 ? '' : 's'} à ${pc(f, rate2)} d'intérêt simple. Combien de dollars d'intérêt de plus le prêt le plus cher coûte-t-il que le moins cher ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(I1 + I2), t('Subtract the two interest amounts to compare them.', 'Soustrais les deux montants d\'intérêt pour les comparer.'), 1], [r6(Math.abs(rate - rate2) * P / 100), t('The loans also differ in time. Work out the full interest for each loan first.', 'Les prêts diffèrent aussi par la durée. Calcule d\'abord l\'intérêt complet de chaque prêt.'), 1], [I1, t('That is the interest on loan A alone. Find both and subtract.', 'C\'est l\'intérêt du prêt A seul. Trouve les deux et soustrais.'), 1]]),
    steps: [bi((f) => f.t(`Loan A interest: ${$$(f, I1)}. Loan B interest: ${$$(f, I2)}.`, `Intérêt du prêt A : ${$$(f, I1)}. Intérêt du prêt B : ${$$(f, I2)}.`)), bi((f) => f.t(`The difference is ${$$(f, ans)}.`, `La différence est de ${$$(f, ans)}.`))],
    nudge: t('Work out the interest on each loan with I = P × r × t, then subtract.', 'Calcule l\'intérêt de chaque prêt avec I = P × r × t, puis soustrais.'),
  };
});

/** MTH1W.F1.4: modifying a budget */
export const budget9 = (id: string): Generator => numGen(id, (tier, r) => {
  const income = randInt(r, 20, 60) * 100, rent = Math.round(income * 0.4 / 50) * 50, food = Math.round(income * 0.2 / 50) * 50, other = Math.round(income * 0.2 / 50) * 50, expenses = rent + food + other;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A monthly budget has income ${$$(f, income)}, rent ${$$(f, rent)}, food ${$$(f, food)} and other costs ${$$(f, other)}. How much is left to save each month?`, `Un budget mensuel a un revenu de ${$$(f, income)}, un loyer de ${$$(f, rent)}, de la nourriture à ${$$(f, food)} et d'autres coûts de ${$$(f, other)}. Combien reste-t-il à épargner chaque mois ?`)),
      answer: income - expenses, category: 'KU',
      wrong: wr(income - expenses, [[expenses, t('That is the total spent. Subtract it from the income.', 'C\'est le total dépensé. Soustrais-le du revenu.'), 1], [income + expenses, t('Spending reduces what is left, so subtract.', 'Les dépenses réduisent ce qui reste : soustrais.'), 1], [income - rent, t('Subtract all three costs, not only the rent.', 'Soustrais les trois coûts, pas seulement le loyer.'), 1]]),
      steps: [bi((f) => f.t(`Expenses: ${f.m(`${f.n(rent)} + ${f.n(food)} + ${f.n(other)}`)} = ${$$(f, expenses)}.`, `Dépenses : ${f.m(`${f.n(rent)} + ${f.n(food)} + ${f.n(other)}`)} = ${$$(f, expenses)}.`)), bi((f) => f.t(`Savings: ${f.m(`${f.n(income)} - ${f.n(expenses)}`)} = ${$$(f, income - expenses)}.`, `Épargne : ${f.m(`${f.n(income)} - ${f.n(expenses)}`)} = ${$$(f, income - expenses)}.`))],
      nudge: t('Savings = income − total expenses.', 'Épargne = revenu − dépenses totales.'),
    };
  }
  if (tier === 2) {
    const cutPct = pick(r, [10, 20, 25, 50]), cut = r6((food * cutPct) / 100), ans = income - expenses + cut;
    return {
      prompt: bi((f) => f.t(`A budget has income ${$$(f, income)}, rent ${$$(f, rent)}, food ${$$(f, food)} and other costs ${$$(f, other)}. The food costs are cut by ${pc(f, cutPct)}. How much is now left to save each month?`, `Un budget a un revenu de ${$$(f, income)}, un loyer de ${$$(f, rent)}, de la nourriture à ${$$(f, food)} et d'autres coûts de ${$$(f, other)}. Les coûts de nourriture sont réduits de ${pc(f, cutPct)}. Combien reste-t-il maintenant à épargner chaque mois ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(income - expenses - cut), t('Cutting a cost leaves more money, so add the amount saved.', 'Réduire un coût laisse plus d\'argent : ajoute le montant économisé.'), 1], [cut, t('That is only how much the cut saves. Add it to the old savings.', 'C\'est seulement ce que la réduction économise. Ajoute-le à l\'ancienne épargne.'), 1], [r6(income - (expenses - food)), t('Only the food costs are cut by a percent, not removed completely.', 'Seuls les coûts de nourriture sont réduits d\'un pourcentage, pas supprimés complètement.'), 1]]),
      steps: [bi((f) => f.t(`The cut saves ${f.m(`${f.n(food)} \\times ${f.n(cutPct / 100)}`)} = ${$$(f, cut)}.`, `La réduction économise ${f.m(`${f.n(food)} \\times ${f.n(cutPct / 100)}`)} = ${$$(f, cut)}.`)), bi((f) => f.t(`Old savings ${f.m(`${f.n(income)} - ${f.n(expenses)}`)} = ${$$(f, income - expenses)}, so now ${$$(f, ans)}.`, `Ancienne épargne ${f.m(`${f.n(income)} - ${f.n(expenses)}`)} = ${$$(f, income - expenses)} : maintenant ${$$(f, ans)}.`))],
      nudge: t('Find how much the cut saves, then add it to the old savings.', 'Trouve combien la réduction économise, puis ajoute-le à l\'ancienne épargne.'),
    };
  }
  const target = income - expenses + Math.round((food * pick(r, [0.1, 0.2, 0.25])) / 10) * 10, needed = target - (income - expenses), pctCut = r6((needed / food) * 100);
  return {
    prompt: bi((f) => f.t(`A budget has income ${$$(f, income)}, rent ${$$(f, rent)}, food ${$$(f, food)} and other costs ${$$(f, other)}. The goal is to save ${$$(f, target)} a month by cutting only the food costs. By what percent must the food costs be cut?`, `Un budget a un revenu de ${$$(f, income)}, un loyer de ${$$(f, rent)}, de la nourriture à ${$$(f, food)} et d'autres coûts de ${$$(f, other)}. L'objectif est d'épargner ${$$(f, target)} par mois en ne réduisant que les coûts de nourriture. De quel pourcentage faut-il réduire ces coûts ?`)),
    answer: pctCut, tolerance: 0.011, category: 'TH',
    wrong: wr(pctCut, [[r6(needed), t('That is the amount to cut in dollars. A percent compares it with the food costs.', 'C\'est le montant à réduire en dollars. Un pourcentage le compare aux coûts de nourriture.'), 1], [r6((needed / income) * 100), t('Compare the cut with the food costs, not the income, because only food is being cut.', 'Compare la réduction aux coûts de nourriture, pas au revenu, parce que seule la nourriture est réduite.'), 1], [r6((target / food) * 100), t('First find how much more must be saved: the goal minus today\'s savings.', 'Trouve d\'abord combien de plus il faut épargner : l\'objectif moins l\'épargne actuelle.'), 1]]),
    steps: [bi((f) => f.t(`Today's savings are ${f.m(`${f.n(income)} - ${f.n(expenses)}`)} = ${$$(f, income - expenses)}, so ${$$(f, needed)} more must be saved.`, `L'épargne actuelle est de ${f.m(`${f.n(income)} - ${f.n(expenses)}`)} = ${$$(f, income - expenses)} : il faut épargner ${$$(f, needed)} de plus.`)), bi((f) => f.t(`${f.m(`${f.n(needed)} \\div ${f.n(food)} \\times 100`)} = ${pc(f, pctCut)}.`, `${f.m(`${f.n(needed)} \\div ${f.n(food)} \\times 100`)} = ${pc(f, pctCut)}.`))],
    nudge: t('Find the extra savings needed, then write it as a percent of the food costs.', 'Trouve l\'épargne supplémentaire nécessaire, puis écris-la en pourcentage des coûts de nourriture.'),
  };
});

void tierGen;
