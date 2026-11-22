// Grade 11 (MEL3E) workplace skills: pay, payroll deductions, sale prices and unit prices, savings, buying against leasing, map scales
// and the cost of travel. Numbers are chosen so every answer is exact.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const dollars = (f: F, x: number): string => `${f.N(r6(x))} ${f.t('dollars', 'dollars')}`;
const pct = (f: F, x: number): string => f.m(`${f.n(x)}\\%`);

/** MEL3E.A1: hourly pay with overtime, commission */
export const pay11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const w = randInt(r, 15, 30), h = randInt(r, 20, 40), ans = w * h;
    return {
      prompt: bi((f) => f.t(`A worker earns ${dollars(f, w)} per hour and works ${f.N(h)} hours in a week. What is the weekly pay, in dollars?`, `Une travailleuse gagne ${dollars(f, w)} de l'heure et travaille ${f.N(h)} heures dans une semaine. Quelle est la paie hebdomadaire, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[w + h, t('Pay is the hourly wage times the hours, not the sum.', 'La paie est le salaire horaire fois les heures, pas leur somme.'), 0], [r6(h / w), t('Multiply the wage by the hours worked.', 'Multiplie le salaire par les heures travaillées.'), 0]]),
      steps: [bi((f) => f.t(`Pay = wage × hours = ${f.m(`${f.n(w)} \\times ${f.n(h)}`)} = ${dollars(f, ans)}.`, `Paie = salaire × heures = ${f.m(`${f.n(w)} \\times ${f.n(h)}`)} = ${dollars(f, ans)}.`)), bi((f) => f.t(`The weekly pay is ${dollars(f, ans)}.`, `La paie hebdomadaire est de ${dollars(f, ans)}.`))],
      nudge: t('Multiply the hourly wage by the number of hours.', 'Multiplie le salaire horaire par le nombre d\'heures.'),
    };
  }
  if (tier === 2) {
    const w = randInt(r, 14, 28), o = pick(r, [2, 4, 6, 8]), ans = r6(w * 40 + 1.5 * w * o);
    return {
      prompt: bi((f) => f.t(`A worker earns ${dollars(f, w)} per hour for the first 40 hours of a week and time and a half for any hours after that. What is the pay for a week of ${f.N(40 + o)} hours, in dollars?`, `Une travailleuse gagne ${dollars(f, w)} de l'heure pour les 40 premières heures d'une semaine et une fois et demie ce taux pour les heures suivantes. Quelle est la paie pour une semaine de ${f.N(40 + o)} heures, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[w * (40 + o), t('Overtime hours are paid at time and a half, which is 1.5 times the wage.', 'Les heures supplémentaires sont payées à une fois et demie le salaire, soit 1,5 fois.'), 1], [r6(w * 1.5 * (40 + o)), t('Only the hours after 40 are paid at time and a half.', 'Seules les heures après 40 sont payées à une fois et demie.'), 1], [r6(1.5 * w * o), t('That is the overtime only. Add the pay for the first 40 hours.', 'C\'est seulement les heures supplémentaires. Ajoute la paie des 40 premières heures.'), 1]]),
      steps: [bi((f) => f.t(`Regular pay: ${f.m(`${f.n(w)} \\times 40`)} = ${dollars(f, w * 40)}. Overtime: ${f.m(`${f.n(o)} \\times ${f.n(r6(1.5 * w))}`)} = ${dollars(f, 1.5 * w * o)}.`, `Paie régulière : ${f.m(`${f.n(w)} \\times 40`)} = ${dollars(f, w * 40)}. Heures supplémentaires : ${f.m(`${f.n(o)} \\times ${f.n(r6(1.5 * w))}`)} = ${dollars(f, 1.5 * w * o)}.`)), bi((f) => f.t(`Total: ${dollars(f, ans)}.`, `Total : ${dollars(f, ans)}.`))],
      nudge: t('Pay the first 40 hours at the wage and the extra hours at 1.5 times the wage, then add.', 'Paie les 40 premières heures au salaire et les heures de plus à 1,5 fois le salaire, puis additionne.'),
    };
  }
  const base = randInt(r, 10, 20) * 100, sales = randInt(r, 2, 8) * 5000, rate = pick(r, [2, 3, 4, 5]), ans = r6(base + (sales * rate) / 100);
  return {
    prompt: bi((f) => f.t(`A salesperson earns a base pay of ${dollars(f, base)} a month plus a commission of ${pct(f, rate)} of sales. In a month with sales of ${dollars(f, sales)}, what is the total pay, in dollars?`, `Un vendeur gagne un salaire de base de ${dollars(f, base)} par mois plus une commission de ${pct(f, rate)} des ventes. Dans un mois où les ventes sont de ${dollars(f, sales)}, quelle est la paie totale, en dollars ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6((sales * rate) / 100), t('That is only the commission. Add the base pay.', 'C\'est seulement la commission. Ajoute le salaire de base.'), 1], [r6(base + sales * rate), t('Change the percent to a decimal first: divide the rate by 100.', 'Transforme d\'abord le pourcentage en décimale : divise le taux par 100.'), 0], [r6(base + sales), t('The commission is a percent of sales, not all of the sales.', 'La commission est un pourcentage des ventes, pas toutes les ventes.'), 0]]),
    steps: [bi((f) => f.t(`Commission: ${f.m(`${f.n(sales)} \\times ${f.n(rate / 100)}`)} = ${dollars(f, (sales * rate) / 100)}.`, `Commission : ${f.m(`${f.n(sales)} \\times ${f.n(rate / 100)}`)} = ${dollars(f, (sales * rate) / 100)}.`)), bi((f) => f.t(`Total pay: ${f.m(`${f.n(base)} + ${f.n((sales * rate) / 100)}`)} = ${dollars(f, ans)}.`, `Paie totale : ${f.m(`${f.n(base)} + ${f.n((sales * rate) / 100)}`)} = ${dollars(f, ans)}.`))],
    nudge: t('Find the commission as a percent of sales, then add the base pay.', 'Trouve la commission comme pourcentage des ventes, puis ajoute le salaire de base.'),
  };
});

/** MEL3E.A2: gross pay, deductions, net pay and purchasing power */
export const net11 = (id: string): Generator => numGen(id, (tier, r) => {
  const gross = randInt(r, 10, 30) * 100;
  if (tier === 1) {
    const tax = randInt(r, 2, 6) * 50, cpp = randInt(r, 2, 6) * 10, ei = randInt(r, 1, 4) * 10, ans = gross - tax - cpp - ei;
    return {
      prompt: bi((f) => f.t(`A paycheque has gross pay of ${dollars(f, gross)}. The deductions are ${dollars(f, tax)} for income tax, ${dollars(f, cpp)} for CPP and ${dollars(f, ei)} for EI. What is the net pay, in dollars?`, `Un chèque de paie a une paie brute de ${dollars(f, gross)}. Les retenues sont de ${dollars(f, tax)} d'impôt sur le revenu, ${dollars(f, cpp)} de RPC et ${dollars(f, ei)} d'AE. Quelle est la paie nette, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[gross + tax + cpp + ei, t('Deductions are taken off the gross pay, not added to it.', 'Les retenues se soustraient de la paie brute, elles ne s\'ajoutent pas.'), 1], [tax + cpp + ei, t('That is the total of the deductions. Subtract it from the gross pay.', 'C\'est le total des retenues. Soustrais-le de la paie brute.'), 1], [gross - tax, t('Subtract all three deductions, not only the income tax.', 'Soustrais les trois retenues, pas seulement l\'impôt.'), 1]]),
      steps: [bi((f) => f.t(`Total deductions: ${f.m(`${f.n(tax)} + ${f.n(cpp)} + ${f.n(ei)}`)} = ${dollars(f, tax + cpp + ei)}.`, `Total des retenues : ${f.m(`${f.n(tax)} + ${f.n(cpp)} + ${f.n(ei)}`)} = ${dollars(f, tax + cpp + ei)}.`)), bi((f) => f.t(`Net pay: ${f.m(`${f.n(gross)} - ${f.n(tax + cpp + ei)}`)} = ${dollars(f, ans)}.`, `Paie nette : ${f.m(`${f.n(gross)} - ${f.n(tax + cpp + ei)}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Net pay = gross pay minus all the deductions.', 'Paie nette = paie brute moins toutes les retenues.'),
    };
  }
  const a = randInt(r, 8, 15), b = pick(r, [4, 5]), c = pick(r, [1, 2]), total = a + b + c, net = r6(gross * (1 - total / 100));
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`Gross pay is ${dollars(f, gross)}. Income tax is ${pct(f, a)} of it, CPP is ${pct(f, b)} and EI is ${pct(f, c)}. What is the net pay, in dollars?`, `La paie brute est de ${dollars(f, gross)}. L'impôt sur le revenu en prend ${pct(f, a)}, le RPC ${pct(f, b)} et l'AE ${pct(f, c)}. Quelle est la paie nette, en dollars ?`)),
      answer: net, category: 'AP',
      wrong: wr(net, [[r6((gross * total) / 100), t('That is the total of the deductions. Subtract it from the gross pay.', 'C\'est le total des retenues. Soustrais-le de la paie brute.'), 1], [r6(gross - total), t('The deductions are percents of the gross pay, not dollar amounts.', 'Les retenues sont des pourcentages de la paie brute, pas des montants en dollars.'), 0], [r6(gross * (1 - a / 100)), t('Take off all three deductions, not only the income tax.', 'Retire les trois retenues, pas seulement l\'impôt.'), 0]]),
      steps: [bi((f) => f.t(`The deductions total ${f.m(`${f.n(a)}\\% + ${f.n(b)}\\% + ${f.n(c)}\\%`)} = ${pct(f, total)} of the gross pay.`, `Les retenues totalisent ${f.m(`${f.n(a)}\\% + ${f.n(b)}\\% + ${f.n(c)}\\%`)} = ${pct(f, total)} de la paie brute.`)), bi((f) => f.t(`Net pay: ${f.m(`${f.n(gross)} \\times ${f.n(r6(1 - total / 100))}`)} = ${dollars(f, net)}.`, `Paie nette : ${f.m(`${f.n(gross)} \\times ${f.n(r6(1 - total / 100))}`)} = ${dollars(f, net)}.`))],
      nudge: t('Add the percents, then keep the rest of the gross pay (100% minus the total).', 'Additionne les pourcentages, puis garde le reste de la paie brute (100 % moins le total).'),
    };
  }
  const k = randInt(r, 2, 6), cost = r6(net * k);
  return {
    prompt: bi((f) => f.t(`Gross pay is ${dollars(f, gross)} a week and deductions take ${pct(f, total)}. A used bike costs ${dollars(f, cost)}. How many weeks of net pay does it take to buy the bike?`, `La paie brute est de ${dollars(f, gross)} par semaine et les retenues en prennent ${pct(f, total)}. Un vélo d'occasion coûte ${dollars(f, cost)}. Combien de semaines de paie nette faut-il pour acheter le vélo ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[r6(cost / gross), t('Use the net pay (after deductions), not the gross pay.', 'Utilise la paie nette (après les retenues), pas la paie brute.'), 1], [r6(cost / ((gross * total) / 100)), t('Divide by the net pay, not by the deductions.', 'Divise par la paie nette, pas par les retenues.'), 1], [r6(net / cost), t('Divide the cost by the weekly net pay, not the other way round.', 'Divise le coût par la paie nette hebdomadaire, pas l\'inverse.'), 1]]),
    steps: [bi((f) => f.t(`Weekly net pay: ${f.m(`${f.n(gross)} \\times ${f.n(r6(1 - total / 100))}`)} = ${dollars(f, net)}.`, `Paie nette hebdomadaire : ${f.m(`${f.n(gross)} \\times ${f.n(r6(1 - total / 100))}`)} = ${dollars(f, net)}.`)), bi((f) => f.t(`Weeks: ${f.m(`${f.n(cost)} \\div ${f.n(net)}`)} = ${f.N(k)}.`, `Semaines : ${f.m(`${f.n(cost)} \\div ${f.n(net)}`)} = ${f.N(k)}.`))],
    nudge: t('Find the net pay, then divide the cost by it.', 'Trouve la paie nette, puis divise le coût par celle-ci.'),
  };
});

/** MEL3E.A3: discounts, sale prices and tax */
export const sale11 = (id: string): Generator => numGen(id, (tier, r) => {
  const price = randInt(r, 2, 15) * 20;
  if (tier === 1) {
    const d = pick(r, [10, 20, 25, 50]), ans = r6(price * (1 - d / 100));
    return {
      prompt: bi((f) => f.t(`A jacket costs ${dollars(f, price)}. It is on sale for ${pct(f, d)} off. What is the sale price, in dollars?`, `Un manteau coûte ${dollars(f, price)}. Il est en solde à ${pct(f, d)} de rabais. Quel est le prix de solde, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(price * (d / 100)), t('That is the discount. Subtract it from the original price.', 'C\'est le rabais. Soustrais-le du prix de départ.'), 1], [r6(price * (1 + d / 100)), t('A discount lowers the price: subtract it.', 'Un rabais baisse le prix : soustrais-le.'), 1], [price - d, t('The discount is a percent of the price, not a number of dollars.', 'Le rabais est un pourcentage du prix, pas un nombre de dollars.'), 0]]),
      steps: [bi((f) => f.t(`Discount: ${f.m(`${f.n(price)} \\times ${f.n(d / 100)}`)} = ${dollars(f, price * (d / 100))}.`, `Rabais : ${f.m(`${f.n(price)} \\times ${f.n(d / 100)}`)} = ${dollars(f, price * (d / 100))}.`)), bi((f) => f.t(`Sale price: ${f.m(`${f.n(price)} - ${f.n(r6(price * (d / 100)))}`)} = ${dollars(f, ans)}.`, `Prix de solde : ${f.m(`${f.n(price)} - ${f.n(r6(price * (d / 100)))}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Find the discount, then subtract it from the price.', 'Trouve le rabais, puis soustrais-le du prix.'),
    };
  }
  if (tier === 2) {
    const tax = pick(r, [5, 13]), ans = r6(price * (1 + tax / 100));
    return {
      prompt: bi((f) => f.t(`A pair of boots costs ${dollars(f, price)} before tax. The sales tax is ${pct(f, tax)}. What is the total cost, in dollars?`, `Une paire de bottes coûte ${dollars(f, price)} avant taxes. La taxe de vente est de ${pct(f, tax)}. Quel est le coût total, en dollars ?`)),
      answer: ans, category: 'AP', tolerance: 0.006,
      wrong: wr(ans, [[r6(price * (tax / 100)), t('That is only the tax. Add it to the price.', 'C\'est seulement la taxe. Ajoute-la au prix.'), 1], [r6(price * (1 - tax / 100)), t('Tax is added to the price, not taken off.', 'La taxe s\'ajoute au prix, elle ne se retire pas.'), 1], [price + tax, t('The tax is a percent of the price, not a number of dollars.', 'La taxe est un pourcentage du prix, pas un nombre de dollars.'), 0]]),
      steps: [bi((f) => f.t(`Tax: ${f.m(`${f.n(price)} \\times ${f.n(tax / 100)}`)} = ${dollars(f, price * (tax / 100))}.`, `Taxe : ${f.m(`${f.n(price)} \\times ${f.n(tax / 100)}`)} = ${dollars(f, price * (tax / 100))}.`)), bi((f) => f.t(`Total: ${f.m(`${f.n(price)} + ${f.n(r6(price * (tax / 100)))}`)} = ${dollars(f, ans)}.`, `Total : ${f.m(`${f.n(price)} + ${f.n(r6(price * (tax / 100)))}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Find the tax, then add it to the price.', 'Trouve la taxe, puis ajoute-la au prix.'),
    };
  }
  const d = pick(r, [10, 20, 25, 50]), tax = 13, sale = r6(price * (1 - d / 100)), ans = r6(sale * (1 + tax / 100)), paid = Math.ceil(ans / 20) * 20, change = r6(paid - ans);
  return {
    prompt: bi((f) => f.t(`A backpack costs ${dollars(f, price)}. It is ${pct(f, d)} off, and then ${pct(f, tax)} tax is added to the sale price. You pay with ${dollars(f, paid)}. How much change do you get, in dollars?`, `Un sac à dos coûte ${dollars(f, price)}. Il est à ${pct(f, d)} de rabais, puis une taxe de ${pct(f, tax)} est ajoutée au prix de solde. Tu paies avec ${dollars(f, paid)}. Combien de monnaie reçois-tu, en dollars ?`)),
    answer: change, category: 'TH', tolerance: 0.006,
    wrong: wr(change, [[r6(paid - sale), t('The tax is added to the sale price too. Include it before finding the change.', 'La taxe s\'ajoute aussi au prix de solde. Inclus-la avant de trouver la monnaie.'), 1], [r6(ans), t('That is the total cost. The change is what is left from the money you paid.', 'C\'est le coût total. La monnaie est ce qui reste de l\'argent que tu as donné.'), 1], [r6(paid - price * (1 + tax / 100)), t('Take the discount off first, then add the tax to the sale price.', 'Enlève d\'abord le rabais, puis ajoute la taxe au prix de solde.'), 0]]),
    steps: [bi((f) => f.t(`Sale price: ${f.m(`${f.n(price)} \\times ${f.n(r6(1 - d / 100))}`)} = ${dollars(f, sale)}. With tax: ${f.m(`${f.n(sale)} \\times 1.13`)} = ${dollars(f, ans)}.`, `Prix de solde : ${f.m(`${f.n(price)} \\times ${f.n(r6(1 - d / 100))}`)} = ${dollars(f, sale)}. Avec la taxe : ${f.m(`${f.n(sale)} \\times 1{,}13`)} = ${dollars(f, ans)}.`)), bi((f) => f.t(`Change: ${f.m(`${f.n(paid)} - ${f.n(ans)}`)} = ${dollars(f, change)}.`, `Monnaie : ${f.m(`${f.n(paid)} - ${f.n(ans)}`)} = ${dollars(f, change)}.`))],
    nudge: t('Subtract the discount, add the tax, then subtract the total from the money paid.', 'Soustrais le rabais, ajoute la taxe, puis soustrais le total de l\'argent donné.'),
  };
});

/** MEL3E.A3: unit price and the best buy */
export const unit11 = (id: string): Generator => numGen(id, (tier, r) => {
  const c1 = randInt(r, 20, 60) / 20, c2 = r6(c1 + pick(r, [-0.25, -0.2, -0.15, 0.15, 0.2, 0.25])), q1 = randInt(r, 2, 5) * 100, q2 = randInt(r, 6, 10) * 100;
  const p1 = r6((c1 * q1) / 100), p2 = r6((c2 * q2) / 100);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A ${f.N(q1)} g box of cereal costs ${dollars(f, p1)}. What is the unit price, in dollars per 100 g?`, `Une boîte de céréales de ${f.N(q1)} g coûte ${dollars(f, p1)}. Quel est le prix unitaire, en dollars par 100 g ?`)),
      answer: c1, category: 'AP',
      wrong: wr(c1, [[r6(p1 / q1), t('That is the price per gram. The question asks per 100 g, so multiply by 100.', 'C\'est le prix par gramme. La question demande par 100 g : multiplie par 100.'), 1], [r6(q1 / p1), t('Divide the price by the amount, not the amount by the price.', 'Divise le prix par la quantité, pas la quantité par le prix.'), 0], [p1, t('That is the price of the whole box. Divide it into 100 g amounts.', 'C\'est le prix de toute la boîte. Divise-le en portions de 100 g.'), 0]]),
      steps: [bi((f) => f.t(`The box holds ${f.m(`${f.n(q1)} \\div 100`)} = ${f.N(q1 / 100)} amounts of 100 g.`, `La boîte contient ${f.m(`${f.n(q1)} \\div 100`)} = ${f.N(q1 / 100)} portions de 100 g.`)), bi((f) => f.t(`Unit price: ${f.m(`${f.n(p1)} \\div ${f.n(q1 / 100)}`)} = ${dollars(f, c1)} per 100 g.`, `Prix unitaire : ${f.m(`${f.n(p1)} \\div ${f.n(q1 / 100)}`)} = ${dollars(f, c1)} par 100 g.`))],
      nudge: t('Divide the price by the number of 100 g amounts in the box.', 'Divise le prix par le nombre de portions de 100 g dans la boîte.'),
    };
  }
  const diff = r6(Math.abs(c1 - c2));
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A ${f.N(q1)} g bag of rice costs ${dollars(f, p1)} and a ${f.N(q2)} g bag costs ${dollars(f, p2)}. How much less per 100 g is the better buy, in dollars?`, `Un sac de riz de ${f.N(q1)} g coûte ${dollars(f, p1)} et un sac de ${f.N(q2)} g coûte ${dollars(f, p2)}. De combien le meilleur achat coûte-t-il de moins par 100 g, en dollars ?`)),
      answer: diff, category: 'AP', tolerance: 0.006,
      wrong: wr(diff, [[r6(Math.abs(p1 - p2)), t('Compare the unit prices (price per 100 g), not the prices of the bags.', 'Compare les prix unitaires (prix par 100 g), pas les prix des sacs.'), 0], [r6(Math.min(c1, c2)), t('That is the unit price of the better buy. Subtract the two unit prices.', 'C\'est le prix unitaire du meilleur achat. Soustrais les deux prix unitaires.'), 1], [r6(c1 + c2), t('Subtract the two unit prices to compare them.', 'Soustrais les deux prix unitaires pour les comparer.'), 1]]),
      steps: [bi((f) => f.t(`Unit prices: ${f.m(`${f.n(p1)} \\div ${f.n(q1 / 100)}`)} = ${f.N(c1)} and ${f.m(`${f.n(p2)} \\div ${f.n(q2 / 100)}`)} = ${f.N(c2)} dollars per 100 g.`, `Prix unitaires : ${f.m(`${f.n(p1)} \\div ${f.n(q1 / 100)}`)} = ${f.N(c1)} et ${f.m(`${f.n(p2)} \\div ${f.n(q2 / 100)}`)} = ${f.N(c2)} dollars par 100 g.`)), bi((f) => f.t(`The difference is ${dollars(f, diff)}.`, `La différence est de ${dollars(f, diff)}.`))],
      nudge: t('Find the price per 100 g of each bag, then subtract the smaller from the larger.', 'Trouve le prix par 100 g de chaque sac, puis soustrais le plus petit du plus grand.'),
    };
  }
  const best = Math.min(c1, c2), n = randInt(r, 3, 8), need = n * 100, ans = r6(best * n);
  return {
    prompt: bi((f) => f.t(`A ${f.N(q1)} g bag of rice costs ${dollars(f, p1)} and a ${f.N(q2)} g bag costs ${dollars(f, p2)}. You need ${f.N(need)} g of rice. At the unit price of the better buy, how much does that amount cost, in dollars?`, `Un sac de riz de ${f.N(q1)} g coûte ${dollars(f, p1)} et un sac de ${f.N(q2)} g coûte ${dollars(f, p2)}. Il te faut ${f.N(need)} g de riz. Au prix unitaire du meilleur achat, combien coûte cette quantité, en dollars ?`)),
    answer: ans, category: 'TH', tolerance: 0.006,
    wrong: wr(ans, [[r6(Math.max(c1, c2) * n), t('Use the unit price of the better buy, which is the lower one.', 'Utilise le prix unitaire du meilleur achat, c\'est-à-dire le plus bas.'), 1], [r6(best * need), t('The unit price is per 100 g, so use the number of 100 g amounts you need.', 'Le prix unitaire est par 100 g : utilise le nombre de portions de 100 g dont tu as besoin.'), 1], [r6(best), t('That is the cost of 100 g. Multiply by the number of 100 g amounts you need.', 'C\'est le coût de 100 g. Multiplie par le nombre de portions de 100 g dont tu as besoin.'), 1]]),
    steps: [bi((f) => f.t(`Unit prices: ${f.N(c1)} and ${f.N(c2)} dollars per 100 g. The better buy is ${dollars(f, best)} per 100 g.`, `Prix unitaires : ${f.N(c1)} et ${f.N(c2)} dollars par 100 g. Le meilleur achat est de ${dollars(f, best)} par 100 g.`)), bi((f) => f.t(`Cost: ${f.m(`${f.n(need)} \\div 100 \\times ${f.n(best)}`)} = ${dollars(f, ans)}.`, `Coût : ${f.m(`${f.n(need)} \\div 100 \\times ${f.n(best)}`)} = ${dollars(f, ans)}.`))],
    nudge: t('Find both unit prices, pick the lower, then multiply by the number of 100 g amounts you need.', 'Trouve les deux prix unitaires, choisis le plus bas, puis multiplie par le nombre de portions de 100 g dont tu as besoin.'),
  };
});

/** MEL3E.B1: simple interest on savings */
export const savings11 = (id: string): Generator => numGen(id, (tier, r) => {
  const P = randInt(r, 1, 20) * 250, rate = pick(r, [2, 4, 5, 8]), years = randInt(r, 2, 5), I = r6((P * rate * years) / 100);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`${dollars(f, P)} is deposited in an account that pays ${pct(f, rate)} simple interest per year. How much interest is earned in ${f.N(years)} years, in dollars?`, `${dollars(f, P)} sont déposés dans un compte qui paie ${pct(f, rate)} d'intérêt simple par année. Combien d'intérêt est gagné en ${f.N(years)} ans, en dollars ?`)),
      answer: I, category: 'AP',
      wrong: wr(I, [[r6((P * rate) / 100), t('That is one year of interest. Multiply by the number of years.', 'C\'est une année d\'intérêt. Multiplie par le nombre d\'années.'), 1], [r6(P + I), t('That is the amount in the account at the end. The question asks for the interest only.', 'C\'est le montant dans le compte à la fin. La question demande seulement l\'intérêt.'), 1], [r6(P * rate * years), t('Change the rate to a decimal: divide the percent by 100.', 'Transforme le taux en décimale : divise le pourcentage par 100.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`I = P \\times r \\times t = ${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)}.`, `${f.m(`I = P \\times r \\times t = ${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)}.`)), bi((f) => f.t(`The interest is ${dollars(f, I)}.`, `L'intérêt est de ${dollars(f, I)}.`))],
      nudge: t('Simple interest = principal × rate × time.', 'Intérêt simple = capital × taux × temps.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`${dollars(f, P)} is deposited at ${pct(f, rate)} simple interest per year. What is the balance after ${f.N(years)} years, in dollars?`, `${dollars(f, P)} sont déposés à ${pct(f, rate)} d'intérêt simple par année. Quel est le solde après ${f.N(years)} ans, en dollars ?`)),
      answer: r6(P + I), category: 'AP',
      wrong: wr(r6(P + I), [[I, t('That is only the interest. Add the amount deposited.', 'C\'est seulement l\'intérêt. Ajoute le montant déposé.'), 1], [r6(P + (P * rate) / 100), t('That is the balance after one year. Multiply the yearly interest by the number of years.', 'C\'est le solde après un an. Multiplie l\'intérêt annuel par le nombre d\'années.'), 1], [r6(P * (1 + rate / 100) ** years), t('Simple interest is the same every year, so it does not compound.', 'L\'intérêt simple est le même chaque année : il ne se compose pas.'), 1]]),
      steps: [bi((f) => f.t(`Interest: ${f.m(`${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)} = ${dollars(f, I)}.`, `Intérêt : ${f.m(`${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(years)}`)} = ${dollars(f, I)}.`)), bi((f) => f.t(`Balance: ${f.m(`${f.n(P)} + ${f.n(I)}`)} = ${dollars(f, P + I)}.`, `Solde : ${f.m(`${f.n(P)} + ${f.n(I)}`)} = ${dollars(f, P + I)}.`))],
      nudge: t('Find the interest, then add it to the amount deposited.', 'Trouve l\'intérêt, puis ajoute-le au montant déposé.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`A deposit of ${dollars(f, P)} earns ${dollars(f, I)} in simple interest at ${pct(f, rate)} per year. For how many years was it invested?`, `Un dépôt de ${dollars(f, P)} rapporte ${dollars(f, I)} d'intérêt simple à ${pct(f, rate)} par année. Pendant combien d'années a-t-il été placé ?`)),
    answer: years, category: 'TH',
    wrong: wr(years, [[r6(I / P), t('Divide the interest by the interest earned in one year (principal × rate).', 'Divise l\'intérêt par l\'intérêt gagné en une année (capital × taux).'), 1], [r6(I / ((P * rate) / 100) + 1), t('Check your division: the interest in one year goes into the total this many times.', 'Vérifie ta division : l\'intérêt d\'une année entre dans le total ce nombre de fois.'), 1], [r6(I / rate), t('Find the interest for one year first: principal × rate as a decimal.', 'Trouve d\'abord l\'intérêt d\'une année : capital × taux en décimale.'), 0]]),
    steps: [bi((f) => f.t(`Interest in one year: ${f.m(`${f.n(P)} \\times ${f.n(rate / 100)}`)} = ${dollars(f, (P * rate) / 100)}.`, `Intérêt en une année : ${f.m(`${f.n(P)} \\times ${f.n(rate / 100)}`)} = ${dollars(f, (P * rate) / 100)}.`)), bi((f) => f.t(`Years: ${f.m(`${f.n(I)} \\div ${f.n((P * rate) / 100)}`)} = ${f.N(years)}.`, `Années : ${f.m(`${f.n(I)} \\div ${f.n((P * rate) / 100)}`)} = ${f.N(years)}.`))],
    nudge: t('Divide the total interest by the interest earned in one year.', 'Divise l\'intérêt total par l\'intérêt gagné en une année.'),
  };
});

/** MEL3E.C1: buying against leasing a vehicle */
export const lease11 = (id: string): Generator => numGen(id, (tier, r) => {
  const monthly = randInt(r, 25, 60) * 10, months = pick(r, [24, 36, 48]), down = randInt(r, 0, 5) * 500, leaseTotal = monthly * months + down;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A car lease costs ${dollars(f, monthly)} a month for ${f.N(months)} months, plus ${dollars(f, down)} to start. What is the total cost of the lease, in dollars?`, `La location d'une voiture coûte ${dollars(f, monthly)} par mois pendant ${f.N(months)} mois, plus ${dollars(f, down)} au départ. Quel est le coût total de la location, en dollars ?`)),
      answer: leaseTotal, category: 'AP',
      wrong: wr(leaseTotal, [[monthly * months, t('Add the amount paid at the start.', 'Ajoute le montant payé au départ.'), 1], [monthly + months + down, t('The monthly payment is paid every month: multiply it by the number of months.', 'Le paiement mensuel est versé chaque mois : multiplie-le par le nombre de mois.'), 0], [monthly * (months + down), t('The starting amount is paid once. Add it, do not multiply it.', 'Le montant de départ est payé une seule fois. Ajoute-le, ne le multiplie pas.'), 1]]),
      steps: [bi((f) => f.t(`Payments: ${f.m(`${f.n(monthly)} \\times ${f.n(months)}`)} = ${dollars(f, monthly * months)}.`, `Paiements : ${f.m(`${f.n(monthly)} \\times ${f.n(months)}`)} = ${dollars(f, monthly * months)}.`)), bi((f) => f.t(`Total: ${f.m(`${f.n(monthly * months)} + ${f.n(down)}`)} = ${dollars(f, leaseTotal)}.`, `Total : ${f.m(`${f.n(monthly * months)} + ${f.n(down)}`)} = ${dollars(f, leaseTotal)}.`))],
      nudge: t('Multiply the monthly payment by the months, then add the starting amount.', 'Multiplie le paiement mensuel par les mois, puis ajoute le montant de départ.'),
    };
  }
  const price = randInt(r, 10, 30) * 1000, resale = Math.round((price * pick(r, [0.3, 0.4, 0.5])) / 1000) * 1000, ownMonthly = r6((price - resale) / months);
  if (tier === 2) {
    const ans = r6(price - resale);
    return {
      prompt: bi((f) => f.t(`A car is bought for ${dollars(f, price)}. After ${f.N(months)} months it could be sold for ${dollars(f, resale)}. How much value does the owner lose over those months, in dollars?`, `Une voiture est achetée ${dollars(f, price)}. Après ${f.N(months)} mois, elle pourrait être vendue ${dollars(f, resale)}. Quelle valeur le propriétaire perd-il pendant ces mois, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[resale, t('That is what the car is worth after the months. Subtract it from the price paid.', 'C\'est la valeur de la voiture après les mois. Soustrais-la du prix payé.'), 1], [price + resale, t('Subtract the resale value; the owner gets that money back.', 'Soustrais la valeur de revente : le propriétaire récupère cet argent.'), 1], [r6(ans / months), t('That is the loss per month. The question asks for the total loss.', 'C\'est la perte par mois. La question demande la perte totale.'), 1]]),
      steps: [bi((f) => f.t(`Loss in value: ${f.m(`${f.n(price)} - ${f.n(resale)}`)} = ${dollars(f, ans)}.`, `Perte de valeur : ${f.m(`${f.n(price)} - ${f.n(resale)}`)} = ${dollars(f, ans)}.`)), bi((f) => f.t(`The owner loses ${dollars(f, ans)}.`, `Le propriétaire perd ${dollars(f, ans)}.`))],
      nudge: t('Subtract the resale value from the price paid.', 'Soustrais la valeur de revente du prix payé.'),
    };
  }
  const buyTotal = price - resale, diff = r6(Math.abs(leaseTotal - buyTotal));
  void ownMonthly;
  return {
    prompt: bi((f) => f.t(`Option A: lease a car for ${dollars(f, monthly)} a month for ${f.N(months)} months plus ${dollars(f, down)} to start. Option B: buy the car for ${dollars(f, price)} and sell it after ${f.N(months)} months for ${dollars(f, resale)}. Ignoring all other costs, how many dollars apart are the two costs?`, `Option A : louer une voiture ${dollars(f, monthly)} par mois pendant ${f.N(months)} mois plus ${dollars(f, down)} au départ. Option B : acheter la voiture ${dollars(f, price)} et la vendre après ${f.N(months)} mois pour ${dollars(f, resale)}. Sans tenir compte des autres coûts, quel est l'écart entre les deux coûts, en dollars ?`)),
    answer: diff, category: 'TH',
    wrong: wr(diff, [[r6(Math.abs(leaseTotal - price)), t('Buying costs the price paid minus what you get back when you sell.', 'Acheter coûte le prix payé moins ce qu\'on récupère à la vente.'), 1], [r6(leaseTotal + buyTotal), t('Subtract the two costs to compare them.', 'Soustrais les deux coûts pour les comparer.'), 1], [r6(Math.abs(monthly * months - buyTotal)), t('Include the amount paid at the start of the lease.', 'Inclus le montant payé au départ de la location.'), 1]]),
    steps: [bi((f) => f.t(`Lease: ${f.m(`${f.n(monthly)} \\times ${f.n(months)} + ${f.n(down)}`)} = ${dollars(f, leaseTotal)}. Buy: ${f.m(`${f.n(price)} - ${f.n(resale)}`)} = ${dollars(f, buyTotal)}.`, `Location : ${f.m(`${f.n(monthly)} \\times ${f.n(months)} + ${f.n(down)}`)} = ${dollars(f, leaseTotal)}. Achat : ${f.m(`${f.n(price)} - ${f.n(resale)}`)} = ${dollars(f, buyTotal)}.`)), bi((f) => f.t(`The difference is ${dollars(f, diff)}.`, `La différence est de ${dollars(f, diff)}.`))],
    nudge: t('Find the total cost of each option, then subtract.', 'Trouve le coût total de chaque option, puis soustrais.'),
  };
});

/** MEL3E.C2: map scales and the cost of a trip */
export const trip11 = (id: string): Generator => numGen(id, (tier, r) => {
  const k = pick(r, [5, 10, 20, 25, 50]), d = randInt(r, 2, 20), km = k * d;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`On a map, ${f.N(1)} cm represents ${f.N(k)} km. Two towns are ${f.N(d)} cm apart on the map. How far apart are they, in km?`, `Sur une carte, ${f.N(1)} cm représente ${f.N(k)} km. Deux villes sont à ${f.N(d)} cm l'une de l'autre sur la carte. À quelle distance sont-elles, en km ?`)),
      answer: km, category: 'AP',
      wrong: wr(km, [[k + d, t('Each centimetre stands for several kilometres: multiply, do not add.', 'Chaque centimètre représente plusieurs kilomètres : multiplie, n\'additionne pas.'), 0], [r6(d / k), t('Multiply the map distance by the scale, do not divide.', 'Multiplie la distance sur la carte par l\'échelle, ne divise pas.'), 0], [r6(k / d), t('Multiply the map distance by the kilometres per centimetre.', 'Multiplie la distance sur la carte par les kilomètres par centimètre.'), 0]]),
      steps: [bi((f) => f.t(`Each centimetre is ${f.N(k)} km, so ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(km)} km.`, `Chaque centimètre représente ${f.N(k)} km : ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(km)} km.`)), bi((f) => f.t(`The towns are ${f.N(km)} km apart.`, `Les villes sont à ${f.N(km)} km l'une de l'autre.`))],
      nudge: t('Multiply the map distance in centimetres by the kilometres each centimetre stands for.', 'Multiplie la distance sur la carte en centimètres par les kilomètres que représente chaque centimètre.'),
    };
  }
  const use = pick(r, [6, 8, 10]), price = pick(r, [1.4, 1.5, 1.6, 1.8]), litres = (km * use) / 100;
  if (tier === 2) {
    const ans = r6(litres * price);
    return {
      prompt: bi((f) => f.t(`On a map, ${f.N(1)} cm represents ${f.N(k)} km, and a trip measures ${f.N(d)} cm. The car uses ${f.N(use)} litres per 100 km and fuel costs ${f.N(price)} dollars per litre. What is the fuel cost of the trip, in dollars?`, `Sur une carte, ${f.N(1)} cm représente ${f.N(k)} km et un trajet mesure ${f.N(d)} cm. La voiture consomme ${f.N(use)} litres aux 100 km et le carburant coûte ${f.N(price)} dollars le litre. Quel est le coût du carburant pour le trajet, en dollars ?`)),
      answer: ans, category: 'AP', tolerance: 0.006,
      wrong: wr(ans, [[r6(d * use * price / 100), t('Change the map distance to kilometres first, using the scale.', 'Transforme d\'abord la distance sur la carte en kilomètres, avec l\'échelle.'), 0], [r6(km * use * price), t('The fuel use is per 100 km: divide the distance by 100 first.', 'La consommation est aux 100 km : divise d\'abord la distance par 100.'), 1], [r6(litres), t('That is the litres of fuel. Multiply by the price per litre.', 'C\'est le nombre de litres. Multiplie par le prix du litre.'), 1]]),
      steps: [bi((f) => f.t(`Distance: ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(km)} km. Fuel: ${f.m(`${f.n(km)} \\div 100 \\times ${f.n(use)}`)} = ${f.N(litres)} litres.`, `Distance : ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(km)} km. Carburant : ${f.m(`${f.n(km)} \\div 100 \\times ${f.n(use)}`)} = ${f.N(litres)} litres.`)), bi((f) => f.t(`Cost: ${f.m(`${f.n(litres)} \\times ${f.n(price)}`)} = ${dollars(f, ans)}.`, `Coût : ${f.m(`${f.n(litres)} \\times ${f.n(price)}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Use the scale to find the distance, then the litres used, then the cost.', 'Utilise l\'échelle pour trouver la distance, puis les litres consommés, puis le coût.'),
    };
  }
  const cpk = pick(r, [0.3, 0.4, 0.5, 0.6]), drive = r6(km * cpk), fare = Math.floor(drive * 0.6), ans = r6(drive - fare);
  return {
    prompt: bi((f) => f.t(`A trip measures ${f.N(d)} cm on a map where ${f.N(1)} cm represents ${f.N(k)} km. Driving costs ${f.N(cpk)} dollars per km. A bus ticket for the same trip costs ${dollars(f, fare)}. How much more does driving cost than the bus, in dollars?`, `Un trajet mesure ${f.N(d)} cm sur une carte où ${f.N(1)} cm représente ${f.N(k)} km. Conduire coûte ${f.N(cpk)} dollar par km. Un billet d'autobus pour le même trajet coûte ${dollars(f, fare)}. Combien de plus conduire coûte-t-il que l'autobus, en dollars ?`)),
    answer: ans, category: 'TH', tolerance: 0.006,
    wrong: wr(ans, [[drive, t('That is the cost of driving. Subtract the bus fare to compare.', 'C\'est le coût de la conduite. Soustrais le prix du billet pour comparer.'), 1], [r6(d * cpk - fare), t('Change the map distance to kilometres first, using the scale.', 'Transforme d\'abord la distance sur la carte en kilomètres, avec l\'échelle.'), 0], [r6(drive + fare), t('Subtract the two costs to compare them.', 'Soustrais les deux coûts pour les comparer.'), 1]]),
    steps: [bi((f) => f.t(`Distance: ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(km)} km. Driving: ${f.m(`${f.n(km)} \\times ${f.n(cpk)}`)} = ${dollars(f, drive)}.`, `Distance : ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(km)} km. Conduite : ${f.m(`${f.n(km)} \\times ${f.n(cpk)}`)} = ${dollars(f, drive)}.`)), bi((f) => f.t(`Driving costs ${f.m(`${f.n(drive)} - ${f.n(fare)}`)} = ${dollars(f, ans)} more.`, `Conduire coûte ${f.m(`${f.n(drive)} - ${f.n(fare)}`)} = ${dollars(f, ans)} de plus.`))],
    nudge: t('Find the real distance, the cost of driving, then subtract the bus fare.', 'Trouve la distance réelle, le coût de la conduite, puis soustrais le prix du billet.'),
  };
});
