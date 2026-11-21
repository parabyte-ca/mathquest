// Grade 8 Financial Literacy strand (F): payments across currencies, taxes in a long-term plan, balanced budgets,
// simple versus compound growth, sales and loyalty programs, and credit cards and contracts.
import { pick, randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

type Wrong = [number, Text, number?][];

/** MS.G8.F1.1.a: payment methods across currencies */
export const payments8 = numGen('MS.G8.F1.1.a', (tier, r) => {
  const rate = pick(r, [1.25, 1.3, 1.35, 1.4]);
  const usd = randInt(r, 1, 12) * 20;
  const fee = pick(r, [2, 3, 4, 5]);
  const base = r6(usd * rate);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`An online game costs ${f.N(usd)} US dollars. The exchange rate is 1 US dollar = ${f.N(rate)} Canadian dollars. What is the price in Canadian dollars, before any fee?`, `Un jeu en ligne coûte ${f.N(usd)} dollars américains. Le taux de change est de 1 dollar américain = ${f.N(rate)} dollar canadien. Quel est le prix en dollars canadiens, avant tout frais ?`)),
      answer: base, category: 'AP',
      wrong: [[r6(usd / rate), t('It looks like the price was divided by the rate. Each US dollar costs the rate in Canadian dollars, so multiply.', 'Il semble que le prix a été divisé par le taux. Chaque dollar américain coûte le taux en dollars canadiens : multiplie.'), 0]] as Wrong,
      steps: [t('Each US dollar costs the exchange rate in Canadian dollars, so multiply.', 'Chaque dollar américain coûte le taux de change en dollars canadiens : multiplie.'), bi((f) => f.t(`${f.N(usd)} × ${f.N(rate)} = ${f.N(base)} Canadian dollars.`, `${f.N(usd)} × ${f.N(rate)} = ${f.N(base)} dollars canadiens.`))],
      nudge: t('Multiply the price by the number of Canadian dollars in one US dollar.', 'Multiplie le prix par le nombre de dollars canadiens dans un dollar américain.'),
    };
  }
  if (tier === 2) {
    const total = r6(base * (1 + fee / 100));
    return {
      prompt: bi((f) => f.t(`A jacket costs ${f.N(usd)} US dollars. The exchange rate is 1 US dollar = ${f.N(rate)} Canadian dollars, and your credit card adds a ${f.N(fee)}% foreign currency fee. What is the total charged, in Canadian dollars?`, `Un manteau coûte ${f.N(usd)} dollars américains. Le taux de change est de 1 dollar américain = ${f.N(rate)} dollar canadien et ta carte de crédit ajoute des frais de change de ${f.N(fee)} %. Quel est le total facturé, en dollars canadiens ?`)),
      answer: total, category: 'AP',
      wrong: [[base, t('That is the price before the fee. The card adds the fee on top, so the total is higher.', 'C\'est le prix avant les frais. La carte ajoute les frais en plus : le total est plus élevé.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Convert: ${f.N(usd)} × ${f.N(rate)} = ${f.N(base)} Canadian dollars.`, `Convertis : ${f.N(usd)} × ${f.N(rate)} = ${f.N(base)} dollars canadiens.`)), bi((f) => f.t(`Add the ${f.N(fee)}% fee: ${f.N(base)} × ${f.N(1 + fee / 100)} = ${f.N(total)} Canadian dollars.`, `Ajoute les frais de ${f.N(fee)} % : ${f.N(base)} × ${f.N(1 + fee / 100)} = ${f.N(total)} dollars canadiens.`))],
      nudge: t('Convert the price first, then add the percent fee.', 'Convertis d\'abord le prix, puis ajoute les frais en pourcentage.'),
    };
  }
  const f1 = fee, f2 = pick(r, [0, 1]);
  const a = r6(base * (1 + f1 / 100)), b = r6(base * (1 + f2 / 100));
  return {
    prompt: bi((f) => f.t(`An item costs ${f.N(usd)} US dollars at an exchange rate of 1 US dollar = ${f.N(rate)} Canadian dollars. Card A charges a ${f.N(f1)}% foreign currency fee. Card B charges ${f.N(f2)}%. How many Canadian dollars does Card B save you?`, `Un article coûte ${f.N(usd)} dollars américains à un taux de change de 1 dollar américain = ${f.N(rate)} dollar canadien. La carte A facture des frais de change de ${f.N(f1)} %. La carte B facture ${f.N(f2)} %. Combien de dollars canadiens la carte B te fait-elle économiser ?`)),
    answer: r6(a - b), category: 'TH',
    wrong: [[r6(a), t('That is the total on Card A. The question asks how much less Card B costs.', 'C\'est le total sur la carte A. La question demande combien la carte B coûte de moins.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Converted price: ${f.N(base)}. Card A: ${f.N(base)} × ${f.N(1 + f1 / 100)} = ${f.N(a)}. Card B: ${f.N(base)} × ${f.N(1 + f2 / 100)} = ${f.N(b)}.`, `Prix converti : ${f.N(base)}. Carte A : ${f.N(base)} × ${f.N(1 + f1 / 100)} = ${f.N(a)}. Carte B : ${f.N(base)} × ${f.N(1 + f2 / 100)} = ${f.N(b)}.`)), bi((f) => f.t(`Savings: ${f.N(a)} − ${f.N(b)} = ${f.N(r6(a - b))} Canadian dollars.`, `Économie : ${f.N(a)} − ${f.N(b)} = ${f.N(r6(a - b))} dollars canadiens.`))],
    nudge: t('Find the total on each card, then subtract.', 'Trouve le total sur chaque carte, puis soustrais.'),
  };
});

/** MS.G8.F1.2.a: long-term financial plan including taxes */
export const plan8 = numGen('MS.G8.F1.2.a', (tier, r) => {
  const gross = randInt(r, 30, 90) * 1000;
  const tax = pick(r, [10, 15, 20, 25]);
  const net = (gross * (100 - tax)) / 100;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A person earns ${f.N(gross)} dollars a year and pays ${f.N(tax)}% of it in income tax. How much is left after tax, in dollars?`, `Une personne gagne ${f.N(gross)} dollars par année et en paie ${f.N(tax)} % en impôt sur le revenu. Combien reste-t-il après impôt, en dollars ?`)),
      answer: net, category: 'AP',
      wrong: [[(gross * tax) / 100, t('That is the tax. The amount left is the income minus the tax.', 'C\'est l\'impôt. Ce qui reste, c\'est le revenu moins l\'impôt.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Tax: ${f.N(tax)}% of ${f.N(gross)} = ${f.N((gross * tax) / 100)} dollars.`, `Impôt : ${f.N(tax)} % de ${f.N(gross)} = ${f.N((gross * tax) / 100)} dollars.`)), bi((f) => f.t(`After tax: ${f.N(gross)} − ${f.N((gross * tax) / 100)} = ${f.N(net)} dollars.`, `Après impôt : ${f.N(gross)} − ${f.N((gross * tax) / 100)} = ${f.N(net)} dollars.`))],
      nudge: t('Find the tax first, then take it away from the income.', 'Trouve d\'abord l\'impôt, puis retire-le du revenu.'),
    };
  }
  const save = pick(r, [10, 15, 20]);
  const saved = (net * save) / 100;
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A person earns ${f.N(gross)} dollars a year, pays ${f.N(tax)}% income tax, and saves ${f.N(save)}% of what is left. How much do they save in a year, in dollars?`, `Une personne gagne ${f.N(gross)} dollars par année, paie ${f.N(tax)} % d'impôt sur le revenu et épargne ${f.N(save)} % de ce qui reste. Combien épargne-t-elle en un an, en dollars ?`)),
      answer: saved, category: 'AP',
      wrong: [[(gross * save) / 100, t('It looks like the savings percent was taken from the income before tax. Take the percent of what is left after tax.', 'Il semble que le pourcentage d\'épargne a été pris sur le revenu avant impôt. Prends le pourcentage de ce qui reste après impôt.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`After tax: ${f.N(gross)} × ${f.N((100 - tax) / 100)} = ${f.N(net)} dollars.`, `Après impôt : ${f.N(gross)} × ${f.N((100 - tax) / 100)} = ${f.N(net)} dollars.`)), bi((f) => f.t(`Savings: ${f.N(save)}% of ${f.N(net)} = ${f.N(saved)} dollars.`, `Épargne : ${f.N(save)} % de ${f.N(net)} = ${f.N(saved)} dollars.`))],
      nudge: t('Take off the tax first, then find the savings percent of what is left.', 'Retire d\'abord l\'impôt, puis trouve le pourcentage d\'épargne de ce qui reste.'),
    };
  }
  const years = randInt(r, 3, 12);
  const goal = saved * years;
  return {
    prompt: bi((f) => f.t(`A person earns ${f.N(gross)} dollars a year, pays ${f.N(tax)}% income tax, and saves ${f.N(save)}% of what is left. In how many years will they have saved ${f.N(goal)} dollars?`, `Une personne gagne ${f.N(gross)} dollars par année, paie ${f.N(tax)} % d'impôt sur le revenu et épargne ${f.N(save)} % de ce qui reste. En combien d'années aura-t-elle épargné ${f.N(goal)} dollars ?`)),
    answer: years, category: 'TH',
    wrong: [[r6(goal / ((gross * save) / 100)), t('It looks like the tax was left out. Savings come from the income left after tax.', 'Il semble que l\'impôt a été oublié. L\'épargne vient du revenu qui reste après impôt.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`After tax: ${f.N(net)} dollars. Saved each year: ${f.N(save)}% of that = ${f.N(saved)} dollars.`, `Après impôt : ${f.N(net)} dollars. Épargné chaque année : ${f.N(save)} % de ce montant = ${f.N(saved)} dollars.`)), bi((f) => f.t(`${f.N(goal)} ÷ ${f.N(saved)} = ${f.N(years)} years.`, `${f.N(goal)} ÷ ${f.N(saved)} = ${f.N(years)} ans.`))],
    nudge: t('Work out the yearly savings after tax, then see how many years reach the goal.', 'Calcule l\'épargne annuelle après impôt, puis vois combien d\'années atteignent l\'objectif.'),
  };
});

/** MS.G8.F1.3.a: balanced budgets */
export const budget8 = numGen('MS.G8.F1.3.a', (tier, r) => {
  if (tier === 1) {
    const rent = randInt(r, 8, 14) * 100, food = randInt(r, 3, 6) * 100, fun = randInt(r, 1, 4) * 100, save = randInt(r, 2, 5) * 100, other = randInt(r, 1, 6) * 100;
    const income = rent + food + fun + save + other;
    return {
      prompt: bi((f) => f.t(`A balanced monthly budget has an income of ${f.N(income)} dollars. Rent is ${f.N(rent)}, food is ${f.N(food)}, fun is ${f.N(fun)} and savings are ${f.N(save)}. How much is left for other costs, in dollars?`, `Un budget mensuel équilibré a un revenu de ${f.N(income)} dollars. Le loyer est de ${f.N(rent)}, la nourriture de ${f.N(food)}, les loisirs de ${f.N(fun)} et l'épargne de ${f.N(save)}. Combien reste-t-il pour les autres frais, en dollars ?`)),
      answer: other, category: 'AP',
      wrong: [[rent + food + fun + save, t('That is the total already planned. In a balanced budget, the other costs are what is left of the income.', 'C\'est le total déjà prévu. Dans un budget équilibré, les autres frais sont ce qui reste du revenu.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Planned so far: ${f.N(rent)} + ${f.N(food)} + ${f.N(fun)} + ${f.N(save)} = ${f.N(rent + food + fun + save)}.`, `Prévu jusqu\'ici : ${f.N(rent)} + ${f.N(food)} + ${f.N(fun)} + ${f.N(save)} = ${f.N(rent + food + fun + save)}.`)), bi((f) => f.t(`${f.N(income)} − ${f.N(rent + food + fun + save)} = ${f.N(other)} dollars.`, `${f.N(income)} − ${f.N(rent + food + fun + save)} = ${f.N(other)} dollars.`))],
      nudge: t('A balanced budget uses all the income. Add what is planned and subtract from the income.', 'Un budget équilibré utilise tout le revenu. Additionne ce qui est prévu et soustrais-le du revenu.'),
    };
  }
  if (tier === 2) {
    const needs = pick(r, [45, 50, 55, 60]), wants = pick(r, [15, 20, 25, 30]), income = randInt(r, 20, 45) * 100;
    const save = 100 - needs - wants;
    return {
      prompt: bi((f) => f.t(`A balanced budget gives ${f.N(needs)}% to needs and ${f.N(wants)}% to wants. The rest is savings. With an income of ${f.N(income)} dollars, how many dollars are saved?`, `Un budget équilibré consacre ${f.N(needs)} % aux besoins et ${f.N(wants)} % aux désirs. Le reste est de l'épargne. Avec un revenu de ${f.N(income)} dollars, combien de dollars sont épargnés ?`)),
      answer: (income * save) / 100, category: 'AP',
      wrong: [[save, t('That is the percent saved, not the dollars. Find that percent of the income.', 'C\'est le pourcentage épargné, pas les dollars. Trouve ce pourcentage du revenu.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`A balanced budget adds to 100%: ${f.N(100)} − ${f.N(needs)} − ${f.N(wants)} = ${f.N(save)}% for savings.`, `Un budget équilibré totalise 100 % : ${f.N(100)} − ${f.N(needs)} − ${f.N(wants)} = ${f.N(save)} % pour l\'épargne.`)), bi((f) => f.t(`${f.N(save)}% of ${f.N(income)} = ${f.N((income * save) / 100)} dollars.`, `${f.N(save)} % de ${f.N(income)} = ${f.N((income * save) / 100)} dollars.`))],
      nudge: t('The percents of a balanced budget add to 100. Find the missing percent, then of the income.', 'Les pourcentages d\'un budget équilibré totalisent 100. Trouve le pourcentage manquant, puis calcule-le sur le revenu.'),
    };
  }
  const income = randInt(r, 20, 40) * 100, wants = randInt(r, 5, 12) * 100, over = pick(r, [50, 100, 150, 200]);
  const pct = r6((over / wants) * 100);
  return {
    prompt: bi((f) => f.t(`A monthly budget has an income of ${f.N(income)} dollars, but the planned spending is ${f.N(over)} dollars more than the income. The wants part of the budget is ${f.N(wants)} dollars. By what percent must the wants be cut to balance the budget? Type the number only.`, `Un budget mensuel a un revenu de ${f.N(income)} dollars, mais les dépenses prévues dépassent le revenu de ${f.N(over)} dollars. La part des désirs du budget est de ${f.N(wants)} dollars. De quel pourcentage faut-il réduire les désirs pour équilibrer le budget ? Écris seulement le nombre.`)),
    answer: pct, category: 'TH',
    wrong: [[over, t('That is the amount to cut in dollars. The question asks for it as a percent of the wants.', 'C\'est le montant à retrancher en dollars. La question le demande en pourcentage des désirs.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`To balance the budget, cut ${f.N(over)} dollars from the wants.`, `Pour équilibrer le budget, retranche ${f.N(over)} dollars des désirs.`)), bi((f) => f.t(`${f.N(over)} ÷ ${f.N(wants)} × 100 = ${f.N(pct)}%.`, `${f.N(over)} ÷ ${f.N(wants)} × 100 = ${f.N(pct)} %.`))],
    nudge: t('Find how many dollars must be cut, then write it as a percent of the wants.', 'Trouve combien de dollars doivent être retranchés, puis écris-le en pourcentage des désirs.'),
  };
});

/** MS.G8.F1.4.a: growth of simple versus compound interest */
export const growth8 = numGen('MS.G8.F1.4.a', (tier, r) => {
  const P = randInt(r, 2, 30) * 100;
  const rate = pick(r, [10, 20]);
  const years = tier === 3 ? 4 : 3;
  const simple = P * (1 + (rate * years) / 100);
  const compound = r6(P * (1 + rate / 100) ** years);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`You invest ${f.N(P)} dollars at ${f.N(rate)}% simple interest per year for ${f.N(years)} years. How much do you have at the end, in dollars?`, `Tu places ${f.N(P)} dollars à un taux d'intérêt simple de ${f.N(rate)} % par année pendant ${f.N(years)} ans. Combien as-tu à la fin, en dollars ?`)),
      answer: simple, category: 'AP',
      wrong: [[(P * rate * years) / 100, t('That is only the interest. The total includes the amount you started with.', 'C\'est seulement l\'intérêt. Le total comprend le montant de départ.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Interest each year: ${f.N(rate)}% of ${f.N(P)} = ${f.N((P * rate) / 100)}. For ${f.N(years)} years: ${f.N((P * rate * years) / 100)}.`, `Intérêt chaque année : ${f.N(rate)} % de ${f.N(P)} = ${f.N((P * rate) / 100)}. Pour ${f.N(years)} ans : ${f.N((P * rate * years) / 100)}.`)), bi((f) => f.t(`Total: ${f.N(P)} + ${f.N((P * rate * years) / 100)} = ${f.N(simple)} dollars.`, `Total : ${f.N(P)} + ${f.N((P * rate * years) / 100)} = ${f.N(simple)} dollars.`))],
      nudge: t('Find one year of interest, multiply by the years, and add the starting amount.', 'Trouve l\'intérêt d\'une année, multiplie par le nombre d\'années et ajoute le montant de départ.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`You invest ${f.N(P)} dollars at ${f.N(rate)}% interest compounded yearly for ${f.N(years)} years. How much do you have at the end, in dollars?`, `Tu places ${f.N(P)} dollars à un taux d'intérêt de ${f.N(rate)} % composé annuellement pendant ${f.N(years)} ans. Combien as-tu à la fin, en dollars ?`)),
      answer: compound, category: 'AP',
      wrong: [[simple, t('That is what simple interest gives. With compound interest, each year\'s interest is worked out on the new, larger amount.', 'C\'est ce que donne l\'intérêt simple. Avec l\'intérêt composé, l\'intérêt de chaque année est calculé sur le nouveau montant, plus grand.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Each year the amount is multiplied by ${f.N(1 + rate / 100)}.`, `Chaque année, le montant est multiplié par ${f.N(1 + rate / 100)}.`)), bi((f) => f.t(`${f.N(P)} × ${f.N(1 + rate / 100)} ${years === 3 ? '× ' + f.N(1 + rate / 100) + ' × ' + f.N(1 + rate / 100) : ''} = ${f.N(compound)} dollars.`, `${f.N(P)} × ${f.N(1 + rate / 100)} ${years === 3 ? '× ' + f.N(1 + rate / 100) + ' × ' + f.N(1 + rate / 100) : ''} = ${f.N(compound)} dollars.`))],
      nudge: t('Multiply by the yearly growth factor once for each year.', 'Multiplie par le facteur de croissance annuel une fois par année.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`You invest ${f.N(P)} dollars for ${f.N(years)} years at ${f.N(rate)}% a year. How many more dollars do you earn with compound interest than with simple interest?`, `Tu places ${f.N(P)} dollars pendant ${f.N(years)} ans à ${f.N(rate)} % par année. Combien de dollars de plus gagnes-tu avec l'intérêt composé qu'avec l'intérêt simple ?`)),
    answer: r6(compound - simple), category: 'TH',
    wrong: [[compound, t('That is the total with compound interest. The question asks for the difference between the two.', 'C\'est le total avec l\'intérêt composé. La question demande la différence entre les deux.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Simple: ${f.N(simple)} dollars. Compound: ${f.N(P)} × ${f.N(1 + rate / 100)} each year for ${f.N(years)} years = ${f.N(compound)} dollars.`, `Simple : ${f.N(simple)} dollars. Composé : ${f.N(P)} × ${f.N(1 + rate / 100)} chaque année pendant ${f.N(years)} ans = ${f.N(compound)} dollars.`)), bi((f) => f.t(`Difference: ${f.N(compound)} − ${f.N(simple)} = ${f.N(r6(compound - simple))} dollars.`, `Différence : ${f.N(compound)} − ${f.N(simple)} = ${f.N(r6(compound - simple))} dollars.`))],
    nudge: t('Find the total each way, then subtract.', 'Trouve le total de chaque façon, puis soustrais.'),
  };
});

/** MS.G8.F1.5.a: sales, loyalty and incentive programs */
export const offers8 = numGen('MS.G8.F1.5.a', (tier, r) => {
  const price = randInt(r, 2, 15) * 20;
  if (tier === 1) {
    const d = pick(r, [10, 15, 20, 25, 30, 40]);
    const sale = (price * (100 - d)) / 100;
    const total = r6(sale * 1.13);
    return {
      prompt: bi((f) => f.t(`A jacket costs ${f.N(price)} dollars and is ${f.N(d)}% off. Then 13% HST is added to the sale price. What is the final price, in dollars?`, `Un manteau coûte ${f.N(price)} dollars et est en solde à ${f.N(d)} % de rabais. Ensuite, 13 % de TVH est ajoutée au prix de solde. Quel est le prix final, en dollars ?`)),
      answer: total, category: 'AP',
      wrong: [[r6(price * (1 - d / 100 + 0.13)), t('It looks like the discount and the tax were combined as percents of the full price. The tax applies to the sale price, not the original price.', 'Il semble que le rabais et la taxe ont été combinés comme des pourcentages du prix complet. La taxe s\'applique au prix de solde, pas au prix de départ.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Sale price: ${f.N(price)} × ${f.N((100 - d) / 100)} = ${f.N(sale)} dollars.`, `Prix de solde : ${f.N(price)} × ${f.N((100 - d) / 100)} = ${f.N(sale)} dollars.`)), bi((f) => f.t(`With 13% HST: ${f.N(sale)} × ${f.N(1.13)} = ${f.N(total)} dollars.`, `Avec 13 % de TVH : ${f.N(sale)} × ${f.N(1.13)} = ${f.N(total)} dollars.`))],
      nudge: t('Take off the discount first, then add the tax to the sale price.', 'Retire d\'abord le rabais, puis ajoute la taxe au prix de solde.'),
    };
  }
  if (tier === 2) {
    const spend = randInt(r, 2, 25) * 20, ptsPer = pick(r, [5, 10]);
    const points = spend * ptsPer;
    const value = (points / 1000) * 10;
    return {
      prompt: bi((f) => f.t(`A store gives ${f.N(ptsPer)} loyalty points for every dollar spent. Every 1000 points can be traded for 10 dollars off. You spend ${f.N(spend)} dollars. What is the value of the points you earn, in dollars?`, `Un magasin donne ${f.N(ptsPer)} points de fidélité pour chaque dollar dépensé. Chaque tranche de 1000 points peut être échangée contre 10 dollars de rabais. Tu dépenses ${f.N(spend)} dollars. Quelle est la valeur des points gagnés, en dollars ?`)),
      answer: value, category: 'AP',
      wrong: [[points, t('That is the number of points, not their value in dollars. Every 1000 points is worth 10 dollars.', 'C\'est le nombre de points, pas leur valeur en dollars. Chaque tranche de 1000 points vaut 10 dollars.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Points: ${f.N(spend)} × ${f.N(ptsPer)} = ${f.N(points)}.`, `Points : ${f.N(spend)} × ${f.N(ptsPer)} = ${f.N(points)}.`)), bi((f) => f.t(`${f.N(points)} ÷ ${f.N(1000)} × 10 = ${f.N(value)} dollars.`, `${f.N(points)} ÷ ${f.N(1000)} × 10 = ${f.N(value)} dollars.`))],
      nudge: t('Find the points first, then how many 1000-point blocks they make.', 'Trouve d\'abord les points, puis combien de tranches de 1000 points ils représentent.'),
    };
  }
  const d = pick(r, [30, 35, 40]);
  const A = 2 * price * ((100 - d) / 100), B = price * 1.5;
  return {
    prompt: bi((f) => f.t(`You want two shirts that cost ${f.N(price)} dollars each. Store A takes ${f.N(d)}% off each shirt. Store B has "buy one, get the second half price". How many dollars less does the better offer cost?`, `Tu veux deux chandails qui coûtent ${f.N(price)} dollars chacun. Le magasin A offre ${f.N(d)} % de rabais sur chaque chandail. Le magasin B offre « achetez-en un, obtenez le deuxième à moitié prix ». Combien de dollars de moins la meilleure offre coûte-t-elle ?`)),
    answer: r6(B - A), category: 'TH',
    wrong: [[r6(A), t('That is the cost at Store A. The question asks for the difference between the two offers.', 'C\'est le coût au magasin A. La question demande la différence entre les deux offres.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Store A: 2 × ${f.N(price)} × ${f.N((100 - d) / 100)} = ${f.N(r6(A))}. Store B: ${f.N(price)} + ${f.N(price / 2)} = ${f.N(B)}.`, `Magasin A : 2 × ${f.N(price)} × ${f.N((100 - d) / 100)} = ${f.N(r6(A))}. Magasin B : ${f.N(price)} + ${f.N(price / 2)} = ${f.N(B)}.`)), bi((f) => f.t(`The better offer is Store A, by ${f.N(B)} − ${f.N(r6(A))} = ${f.N(r6(B - A))} dollars.`, `La meilleure offre est celle du magasin A, de ${f.N(B)} − ${f.N(r6(A))} = ${f.N(r6(B - A))} dollars.`))],
    nudge: t('Work out the cost of two shirts at each store, then compare.', 'Calcule le coût de deux chandails dans chaque magasin, puis compare.'),
  };
});

/** MS.G8.F1.6.a: compare credit cards and consumer contracts */
export const credit8 = numGen('MS.G8.F1.6.a', (tier, r) => {
  if (tier === 1) {
    const balance = randInt(r, 2, 30) * 100, apr = pick(r, [12, 18, 24]);
    const monthly = (balance * apr) / 1200;
    return {
      prompt: bi((f) => f.t(`A credit card has a balance of ${f.N(balance)} dollars and an annual interest rate of ${f.N(apr)}%. About how much interest is charged for one month, in dollars? (Use the annual rate divided by 12.)`, `Une carte de crédit a un solde de ${f.N(balance)} dollars et un taux d'intérêt annuel de ${f.N(apr)} %. Environ combien d'intérêt est facturé pour un mois, en dollars ? (Utilise le taux annuel divisé par 12.)`)),
      answer: monthly, category: 'AP',
      wrong: [[(balance * apr) / 100, t('That is a whole year of interest. The question asks for one month, which is one twelfth of the year.', 'C\'est une année complète d\'intérêt. La question demande un mois, soit un douzième de l\'année.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Monthly rate: ${f.N(apr)}% ÷ 12 = ${f.N(apr / 12)}%.`, `Taux mensuel : ${f.N(apr)} % ÷ 12 = ${f.N(apr / 12)} %.`)), bi((f) => f.t(`${f.N(apr / 12)}% of ${f.N(balance)} = ${f.N(monthly)} dollars.`, `${f.N(apr / 12)} % de ${f.N(balance)} = ${f.N(monthly)} dollars.`))],
      nudge: t('Divide the yearly rate by 12 to get the monthly rate, then take that percent of the balance.', 'Divise le taux annuel par 12 pour obtenir le taux mensuel, puis prends ce pourcentage du solde.'),
    };
  }
  if (tier === 2) {
    const balance = randInt(r, 3, 20) * 100, mrate = pick(r, [1, 1.5, 2]), pay = randInt(r, 2, 6) * 20;
    const next = r6(balance * (1 + mrate / 100) - pay);
    return {
      prompt: bi((f) => f.t(`A credit card balance of ${f.N(balance)} dollars is charged ${f.N(mrate)}% interest each month. You pay ${f.N(pay)} dollars this month after the interest is added. What is the balance next month, in dollars?`, `Un solde de carte de crédit de ${f.N(balance)} dollars porte un intérêt de ${f.N(mrate)} % par mois. Tu paies ${f.N(pay)} dollars ce mois-ci après l'ajout de l'intérêt. Quel est le solde le mois prochain, en dollars ?`)),
      answer: next, category: 'AP',
      wrong: [[r6(balance - pay), t('It looks like the interest was left out. Interest is added to the balance before you subtract the payment.', 'Il semble que l\'intérêt a été oublié. L\'intérêt est ajouté au solde avant de soustraire le paiement.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`After interest: ${f.N(balance)} × ${f.N(1 + mrate / 100)} = ${f.N(r6(balance * (1 + mrate / 100)))} dollars.`, `Après l\'intérêt : ${f.N(balance)} × ${f.N(1 + mrate / 100)} = ${f.N(r6(balance * (1 + mrate / 100)))} dollars.`)), bi((f) => f.t(`After your payment: ${f.N(r6(balance * (1 + mrate / 100)))} − ${f.N(pay)} = ${f.N(next)} dollars.`, `Après ton paiement : ${f.N(r6(balance * (1 + mrate / 100)))} − ${f.N(pay)} = ${f.N(next)} dollars.`))],
      nudge: t('Add the month\'s interest to the balance, then subtract the payment.', 'Ajoute l\'intérêt du mois au solde, puis soustrais le paiement.'),
    };
  }
  const monthly = randInt(r, 25, 60), months = pick(r, [12, 24, 36]), upfront = randInt(r, 0, 5) * 20;
  const contract = monthly * months + upfront;
  const outright = contract - randInt(r, 1, 8) * 50;
  return {
    prompt: bi((f) => f.t(`A phone plan costs ${f.N(monthly)} dollars a month for ${f.N(months)} months plus ${f.N(upfront)} dollars to start. Buying the same phone outright and using a pay-as-you-go plan would cost ${f.N(outright)} dollars in total over the same time. How many dollars more does the contract cost?`, `Un forfait de téléphone coûte ${f.N(monthly)} dollars par mois pendant ${f.N(months)} mois plus ${f.N(upfront)} dollars pour commencer. Acheter le même téléphone comptant et utiliser un forfait prépayé coûterait ${f.N(outright)} dollars au total sur la même période. Combien de dollars de plus le contrat coûte-t-il ?`)),
    answer: contract - outright, category: 'TH',
    wrong: [[contract, t('That is the whole cost of the contract. The question asks how much more it costs than the other choice.', 'C\'est le coût total du contrat. La question demande combien il coûte de plus que l\'autre choix.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Contract total: ${f.N(monthly)} × ${f.N(months)} + ${f.N(upfront)} = ${f.N(contract)} dollars.`, `Total du contrat : ${f.N(monthly)} × ${f.N(months)} + ${f.N(upfront)} = ${f.N(contract)} dollars.`)), bi((f) => f.t(`Difference: ${f.N(contract)} − ${f.N(outright)} = ${f.N(contract - outright)} dollars.`, `Différence : ${f.N(contract)} − ${f.N(outright)} = ${f.N(contract - outright)} dollars.`))],
    nudge: t('Find the total cost of the contract, then compare it with the other choice.', 'Trouve le coût total du contrat, puis compare-le à l\'autre choix.'),
  };
});
