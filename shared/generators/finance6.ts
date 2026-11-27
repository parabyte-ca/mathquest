// Grade 6 Financial Literacy strand (F), the expectations that were not built before 2.8.1: payment methods, financial goals,
// factors that help or interfere with reaching a goal, and trading, lending, borrowing and donating.
import { pick, randInt } from '../rng.js';
import { bi, keepWrong as wr, money, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

/** MS.G6.F1.1.a: payment methods (cash and change, debit balance, credit card fee against a transfer fee) */
export const payments6 = numGen('MS.G6.F1.1.a', (tier, r) => {
  if (tier === 1) {
    let price = randInt(r, 61, 379) * 0.05;
    if (r6(price * 2) === 20) price = r6(price + 0.05);
    price = r6(price);
    const change = r6(20 - price);
    return {
      prompt: bi((f) => f.t(`You pay cash for a snack that costs ${f.D(price, true)}. You hand over a ${f.D(20)} bill. How much change do you get back, in dollars?`, `Tu paies comptant une collation qui coûte ${f.D(price, true)}. Tu donnes un billet de ${f.D(20)}. Combien d'argent te rend-on, en dollars ?`)),
      answer: change, category: 'AP',
      wrong: wr(change, [[price, t('That is the price of the snack. The change is what is left of the bill after paying.', 'C\'est le prix de la collation. La monnaie rendue, c\'est ce qui reste du billet après le paiement.'), 1], [r6(20 + price), t('It looks like the price was added to the bill. Change is the bill minus the price.', 'Il semble que le prix a été ajouté au billet. La monnaie, c\'est le billet moins le prix.'), 1]]),
      steps: [t('Change is what you hand over minus what you owe.', 'La monnaie, c\'est ce que tu donnes moins ce que tu dois.'), bi((f) => f.t(`${f.N(20)} − ${money(f, price)} = ${f.D(change, true)}.`, `${f.N(20)} − ${money(f, price)} = ${f.D(change, true)}.`))],
      nudge: t('Subtract the price from the bill.', 'Soustrais le prix du billet.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 10, 35), b = randInt(r, 3, 9);
    let balance = randInt(r, 50, 120);
    if (balance === 2 * (a + b)) balance += 1;
    const left = balance - a - b;
    return {
      prompt: bi((f) => f.t(`Your bank account has ${f.D(balance)}. You use your debit card to buy a game for ${f.D(a)} and a snack for ${f.D(b)}. How many dollars are left in your account?`, `Ton compte bancaire contient ${f.D(balance)}. Tu utilises ta carte de débit pour acheter un jeu à ${f.D(a)} et une collation à ${f.D(b)}. Combien de dollars reste-t-il dans ton compte ?`)),
      answer: left, category: 'AP',
      wrong: wr(left, [[balance - a, t('It looks like only the game was taken off. A debit card takes every purchase out of the account.', 'Il semble que seul le jeu a été retiré. Une carte de débit retire chaque achat du compte.'), 1], [a + b, t('That is the total spent. The question asks how much is left in the account.', 'C\'est le total dépensé. La question demande ce qui reste dans le compte.'), 1]]),
      steps: [bi((f) => f.t(`A debit card takes money straight out of the account. Spent: ${f.N(a)} + ${f.N(b)} = ${f.D(a + b)}.`, `Une carte de débit retire l'argent directement du compte. Dépensé : ${f.N(a)} + ${f.N(b)} = ${f.D(a + b)}.`)), bi((f) => f.t(`Left: ${f.N(balance)} − ${f.N(a + b)} = ${f.D(left)}.`, `Reste : ${f.N(balance)} − ${f.N(a + b)} = ${f.D(left)}.`))],
      nudge: t('Add up what you spent, then take it from the balance.', 'Additionne ce que tu as dépensé, puis retire-le du solde.'),
    };
  }
  const price = randInt(r, 10, 20) * 10, rate = pick(r, [3, 4]), flat = pick(r, [1, 2]);
  const fee = (price * rate) / 100;
  const diff = r6(fee - flat);
  return {
    prompt: bi((f) => f.t(`An online store sells a bike helmet for ${f.D(price)}. Paying by credit card adds a ${f.N(rate)}% fee. Paying by bank transfer adds a flat fee of ${f.D(flat)}. How many dollars more does paying by credit card cost?`, `Un magasin en ligne vend un casque de vélo ${f.D(price)}. Payer par carte de crédit ajoute des frais de ${f.N(rate)} %. Payer par virement bancaire ajoute des frais fixes de ${f.D(flat)}. Combien de dollars de plus coûte le paiement par carte de crédit ?`)),
    answer: diff, category: 'TH',
    wrong: wr(diff, [[fee, t('That is only the credit card fee. Compare it with the transfer fee by subtracting.', 'C\'est seulement les frais de la carte de crédit. Compare-les avec les frais du virement en soustrayant.'), 1], [r6(fee + flat), t('It looks like the two fees were added. To compare them, subtract the smaller from the larger.', 'Il semble que les deux frais ont été additionnés. Pour les comparer, soustrais le plus petit du plus grand.'), 1]]),
    steps: [bi((f) => f.t(`Credit card fee: ${f.N(rate)}% of ${f.N(price)} = ${f.D(fee)}.`, `Frais de la carte de crédit : ${f.N(rate)} % de ${f.N(price)} = ${f.D(fee)}.`)), bi((f) => f.t(`Compare: ${f.N(fee)} − ${f.N(flat)} = ${f.D(diff)} more.`, `Compare : ${f.N(fee)} − ${f.N(flat)} = ${f.D(diff)} de plus.`))],
    nudge: t('Find the percent fee in dollars first, then subtract the flat fee.', 'Trouve d\'abord les frais en pourcentage en dollars, puis soustrais les frais fixes.'),
  };
});

/** MS.G6.F1.2.a: financial goals (weeks to save for a goal, with starting savings and two sources of money) */
export const goals6 = numGen('MS.G6.F1.2.a', (tier, r) => {
  if (tier === 1) {
    const s = pick(r, [5, 8, 10, 12, 15, 20]), w = randInt(r, 4, 12), goal = s * w;
    return {
      prompt: bi((f) => f.t(`You want to buy a scooter that costs ${f.D(goal)}. You save ${f.D(s)} every week. In how many weeks will you reach your goal?`, `Tu veux acheter une trottinette qui coûte ${f.D(goal)}. Tu économises ${f.D(s)} chaque semaine. En combien de semaines atteindras-tu ton objectif ?`)),
      answer: w, category: 'AP',
      wrong: wr(w, [[goal - s, t('It looks like the weekly amount was subtracted. Ask how many weekly amounts fit in the goal: divide.', 'Il semble que le montant hebdomadaire a été soustrait. Demande-toi combien de montants hebdomadaires tiennent dans l\'objectif : divise.'), 1], [goal + s, t('It looks like the weekly amount was added. Divide the goal by the weekly amount.', 'Il semble que le montant hebdomadaire a été ajouté. Divise l\'objectif par le montant hebdomadaire.'), 1]]),
      steps: [t('The number of weeks is how many times the weekly saving fits in the goal.', 'Le nombre de semaines, c\'est le nombre de fois que l\'économie hebdomadaire tient dans l\'objectif.'), bi((f) => f.t(`${f.N(goal)} ÷ ${f.N(s)} = ${f.N(w)} weeks.`, `${f.N(goal)} ÷ ${f.N(s)} = ${f.N(w)} semaines.`))],
      nudge: t('Divide the cost of the goal by the amount saved each week.', 'Divise le coût de l\'objectif par le montant économisé chaque semaine.'),
    };
  }
  if (tier === 2) {
    const s = pick(r, [5, 8, 10, 12, 15]), w = randInt(r, 3, 10), a = randInt(r, 2, 8) * 5, goal = a + s * w;
    return {
      prompt: bi((f) => f.t(`A pair of headphones costs ${f.D(goal)}. You have already saved ${f.D(a)} and you save ${f.D(s)} more every week. In how many weeks will you have enough?`, `Une paire d'écouteurs coûte ${f.D(goal)}. Tu as déjà économisé ${f.D(a)} et tu économises ${f.D(s)} de plus chaque semaine. En combien de semaines auras-tu assez ?`)),
      answer: w, category: 'AP',
      wrong: wr(w, [[goal / s, t('That ignores the money you already have. Subtract it from the cost first.', 'Cela ignore l\'argent que tu as déjà. Soustrais-le d\'abord du coût.'), 0], [goal - a, t('That is the dollars still needed, not the weeks. Divide it by the weekly saving.', 'C\'est le nombre de dollars qu\'il manque, pas les semaines. Divise-le par l\'économie hebdomadaire.'), 1]]),
      steps: [bi((f) => f.t(`Still needed: ${f.N(goal)} − ${f.N(a)} = ${f.D(goal - a)}.`, `Il manque : ${f.N(goal)} − ${f.N(a)} = ${f.D(goal - a)}.`)), bi((f) => f.t(`${f.N(goal - a)} ÷ ${f.N(s)} = ${f.N(w)} weeks.`, `${f.N(goal - a)} ÷ ${f.N(s)} = ${f.N(w)} semaines.`))],
      nudge: t('Take away what you already have, then divide by the weekly saving.', 'Retire ce que tu as déjà, puis divise par l\'économie hebdomadaire.'),
    };
  }
  const s = pick(r, [5, 8, 10]), e = pick(r, [4, 5, 6]), w = randInt(r, 3, 9), a = randInt(r, 2, 8) * 5, goal = a + (s + e) * w;
  return {
    prompt: bi((f) => f.t(`You are saving for a ${f.D(goal)} tablet. You have ${f.D(a)} saved. Each week you save ${f.D(s)} from your allowance and ${f.D(e)} from walking dogs. In how many weeks will you reach your goal?`, `Tu économises pour une tablette de ${f.D(goal)}. Tu as ${f.D(a)} d'économies. Chaque semaine, tu économises ${f.D(s)} de ton allocation et ${f.D(e)} en promenant des chiens. En combien de semaines atteindras-tu ton objectif ?`)),
    answer: w, category: 'TH',
    wrong: wr(w, [[(goal - a) / s, t('That only counts the allowance. Add the dog-walking money to the weekly saving.', 'Cela ne compte que l\'allocation. Ajoute l\'argent des promenades de chiens à l\'économie hebdomadaire.'), 1], [goal / (s + e), t('That ignores the money you already have. Subtract it first.', 'Cela ignore l\'argent que tu as déjà. Soustrais-le d\'abord.'), 0]]),
    steps: [bi((f) => f.t(`Saved each week: ${f.N(s)} + ${f.N(e)} = ${f.D(s + e)}. Still needed: ${f.N(goal)} − ${f.N(a)} = ${f.D(goal - a)}.`, `Économisé chaque semaine : ${f.N(s)} + ${f.N(e)} = ${f.D(s + e)}. Il manque : ${f.N(goal)} − ${f.N(a)} = ${f.D(goal - a)}.`)), bi((f) => f.t(`${f.N(goal - a)} ÷ ${f.N(s + e)} = ${f.N(w)} weeks.`, `${f.N(goal - a)} ÷ ${f.N(s + e)} = ${f.N(w)} semaines.`))],
    nudge: t('Add the two weekly amounts, take away what you already have, then divide.', 'Additionne les deux montants hebdomadaires, retire ce que tu as déjà, puis divise.'),
  };
});

/** Pairs of (weekly saving, extra) whose lowest common multiple keeps the week counts whole. */
const HELP: [number, number][] = [[10, 10], [10, 5], [5, 5], [5, 10], [20, 10]];
const COST: [number, number][] = [[20, 10], [10, 5], [20, 5], [15, 5], [12, 4]];
const lcm = (a: number, b: number): number => { let m = a; while (m % b !== 0) m += a; return m; };

/** MS.G6.F1.3.a: factors that help or interfere with reaching a goal (extra income, new expenses) */
export const factors6 = numGen('MS.G6.F1.3.a', (tier, r) => {
  if (tier === 1) {
    const income = pick(r, [10, 15, 20, 25, 30]), spend = pick(r, [3, 4, 6, 8]);
    const save = income - spend;
    return {
      prompt: bi((f) => f.t(`You get ${f.D(income)} a week. You spend ${f.D(spend)} a week on snacks and games. How many dollars can you save each week toward your goal?`, `Tu reçois ${f.D(income)} par semaine. Tu dépenses ${f.D(spend)} par semaine en collations et en jeux. Combien de dollars peux-tu économiser chaque semaine pour ton objectif ?`)),
      answer: save, category: 'AP',
      wrong: wr(save, [[income + spend, t('Spending works against the goal, so it is taken away from the income, not added.', 'Les dépenses nuisent à l\'objectif : on les retire du revenu, on ne les ajoute pas.'), 1], [spend, t('That is what is spent. What you can save is what is left of the income.', 'C\'est ce qui est dépensé. Ce que tu peux économiser, c\'est ce qui reste du revenu.'), 1]]),
      steps: [t('Spending interferes with saving, so take it away from the income.', 'Les dépenses nuisent à l\'épargne : retire-les du revenu.'), bi((f) => f.t(`${f.N(income)} − ${f.N(spend)} = ${f.D(save)} a week.`, `${f.N(income)} − ${f.N(spend)} = ${f.D(save)} par semaine.`))],
      nudge: t('Subtract the weekly spending from the weekly income.', 'Soustrais les dépenses hebdomadaires du revenu hebdomadaire.'),
    };
  }
  if (tier === 2) {
    const [s, e] = pick(r, HELP), k = randInt(r, 2, 8);
    const goal = lcm(s, s + e) * k;
    const without = goal / s, withJob = goal / (s + e), diff = without - withJob;
    return {
      prompt: bi((f) => f.t(`You are saving for a ${f.D(goal)} goal and you save ${f.D(s)} a week. A new job adds ${f.D(e)} a week to your saving. How many weeks sooner will you reach the goal?`, `Tu économises pour un objectif de ${f.D(goal)} et tu économises ${f.D(s)} par semaine. Un nouvel emploi ajoute ${f.D(e)} par semaine à tes économies. Combien de semaines plus tôt atteindras-tu l'objectif ?`)),
      answer: diff, category: 'AP',
      wrong: wr(diff, [[without, t('That is the number of weeks without the job. The question asks how many weeks sooner.', 'C\'est le nombre de semaines sans l\'emploi. La question demande combien de semaines plus tôt.'), 1], [withJob, t('That is the number of weeks with the job. Subtract it from the weeks without the job.', 'C\'est le nombre de semaines avec l\'emploi. Soustrais-le du nombre de semaines sans l\'emploi.'), 1]]),
      steps: [bi((f) => f.t(`Without the job: ${f.N(goal)} ÷ ${f.N(s)} = ${f.N(without)} weeks. With the job: ${f.N(goal)} ÷ ${f.N(s + e)} = ${f.N(withJob)} weeks.`, `Sans l'emploi : ${f.N(goal)} ÷ ${f.N(s)} = ${f.N(without)} semaines. Avec l'emploi : ${f.N(goal)} ÷ ${f.N(s + e)} = ${f.N(withJob)} semaines.`)), bi((f) => f.t(`Sooner by ${f.N(without)} − ${f.N(withJob)} = ${f.N(diff)} weeks.`, `Plus tôt de ${f.N(without)} − ${f.N(withJob)} = ${f.N(diff)} semaines.`))],
      nudge: t('Find the weeks without the job and with the job, then subtract.', 'Trouve les semaines sans l\'emploi et avec l\'emploi, puis soustrais.'),
    };
  }
  const [s, x] = pick(r, COST), k = randInt(r, 2, 6);
  const goal = lcm(s, s - x) * k;
  const before = goal / s, after = goal / (s - x), more = after - before;
  return {
    prompt: bi((f) => f.t(`You are saving for a ${f.D(goal)} goal and you save ${f.D(s)} a week. Then a phone plan starts that costs you ${f.D(x)} a week, so you save less. How many more weeks will it take to reach the goal?`, `Tu économises pour un objectif de ${f.D(goal)} et tu économises ${f.D(s)} par semaine. Ensuite, un forfait de téléphone qui te coûte ${f.D(x)} par semaine commence, alors tu économises moins. Combien de semaines de plus faudra-t-il pour atteindre l'objectif ?`)),
    answer: more, category: 'TH',
    wrong: wr(more, [[after, t('That is the total weeks with the phone plan. The question asks how many MORE weeks than before.', 'C\'est le total de semaines avec le forfait. La question demande combien de semaines de PLUS qu\'avant.'), 1], [before, t('That is the weeks before the phone plan. Find the weeks after it too, then subtract.', 'C\'est le nombre de semaines avant le forfait. Trouve aussi les semaines après, puis soustrais.'), 1]]),
    steps: [bi((f) => f.t(`Before: ${f.N(goal)} ÷ ${f.N(s)} = ${f.N(before)} weeks. After, you save ${f.N(s)} − ${f.N(x)} = ${f.D(s - x)} a week: ${f.N(goal)} ÷ ${f.N(s - x)} = ${f.N(after)} weeks.`, `Avant : ${f.N(goal)} ÷ ${f.N(s)} = ${f.N(before)} semaines. Après, tu économises ${f.N(s)} − ${f.N(x)} = ${f.D(s - x)} par semaine : ${f.N(goal)} ÷ ${f.N(s - x)} = ${f.N(after)} semaines.`)), bi((f) => f.t(`${f.N(after)} − ${f.N(before)} = ${f.N(more)} more weeks.`, `${f.N(after)} − ${f.N(before)} = ${f.N(more)} semaines de plus.`))],
    nudge: t('Find the weeks before and after the new cost, then subtract.', 'Trouve les semaines avant et après la nouvelle dépense, puis soustrais.'),
  };
});

/** MS.G6.F1.5.a: trading, lending, borrowing and donating */
export const trade6 = numGen('MS.G6.F1.5.a', (tier, r) => {
  if (tier === 1) {
    const earn = pick(r, [20, 40, 50, 60, 80, 100, 120, 200]), pct = pick(r, [5, 10, 25, 50]);
    const give = (earn * pct) / 100;
    return {
      prompt: bi((f) => f.t(`You earn ${f.D(earn)} at a bake sale and decide to donate ${f.N(pct)}% of it to the food bank. How many dollars do you donate?`, `Tu gagnes ${f.D(earn)} à une vente de gâteaux et tu décides d'en donner ${f.N(pct)} % à la banque alimentaire. Combien de dollars donnes-tu ?`)),
      answer: give, category: 'AP',
      wrong: wr(give, [[earn - give, t('That is the money you keep. The donation is the percent of the earnings.', 'C\'est l\'argent que tu gardes. Le don, c\'est le pourcentage des gains.'), 0], [pct, t('That is the percent, not the dollars. Find that percent of the earnings.', 'C\'est le pourcentage, pas les dollars. Trouve ce pourcentage des gains.'), 0]]),
      steps: [bi((f) => f.t(`Find ${f.N(pct)}% of ${f.N(earn)}.`, `Trouve ${f.N(pct)} % de ${f.N(earn)}.`)), bi((f) => f.t(`${f.N(pct)}% of ${f.N(earn)} = ${f.D(give)}.`, `${f.N(pct)} % de ${f.N(earn)} = ${f.D(give)}.`))],
      nudge: t('Find the percent of the earnings.', 'Trouve le pourcentage des gains.'),
    };
  }
  if (tier === 2) {
    const rep = pick(r, [5, 10, 15, 20]), m = randInt(r, 5, 10), n = randInt(r, 2, m - 1), B = rep * m;
    const left = B - rep * n, lend = r() < 0.5;
    return {
      prompt: bi((f) => lend
        ? f.t(`You lend a friend ${f.D(B)}. Your friend pays you back ${f.D(rep)} a week. After ${f.N(n)} weeks, how many dollars does your friend still owe you?`, `Tu prêtes ${f.D(B)} à un ami. Ton ami te rembourse ${f.D(rep)} par semaine. Après ${f.N(n)} semaines, combien de dollars ton ami te doit-il encore ?`)
        : f.t(`You borrow ${f.D(B)} from a relative and repay ${f.D(rep)} a week. After ${f.N(n)} weeks, how many dollars do you still owe?`, `Tu empruntes ${f.D(B)} à un proche et tu rembourses ${f.D(rep)} par semaine. Après ${f.N(n)} semaines, combien de dollars dois-tu encore ?`)),
      answer: left, category: 'AP',
      wrong: wr(left, [[rep * n, t('That is the amount paid back so far. The question asks how much is still owed.', 'C\'est le montant déjà remboursé. La question demande combien il reste à rembourser.'), 1], [B - rep, t('It looks like only one payment was taken off. Take off a payment for every week.', 'Il semble que seul un paiement a été retiré. Retire un paiement pour chaque semaine.'), 1]]),
      steps: [bi((f) => f.t(`Paid back: ${f.N(rep)} × ${f.N(n)} = ${f.D(rep * n)}.`, `Remboursé : ${f.N(rep)} × ${f.N(n)} = ${f.D(rep * n)}.`)), bi((f) => f.t(`Still owed: ${f.N(B)} − ${f.N(rep * n)} = ${f.D(left)}.`, `Reste dû : ${f.N(B)} − ${f.N(rep * n)} = ${f.D(left)}.`))],
      nudge: t('Find the total paid back, then take it away from the amount lent.', 'Trouve le total remboursé, puis retire-le du montant prêté.'),
    };
  }
  let x = 4, n = 3, y = 2;
  for (let tries = 0; tries < 60; tries++) {
    x = pick(r, [4, 6, 8, 10, 12]); n = pick(r, [3, 4, 5, 6]); y = pick(r, [2, 3, 4, 5]);
    if ((x * n) % y === 0 && (x * n) / y !== n && (x * n) / y !== x) break;
  }
  const total = x * n, k = total / y;
  return {
    prompt: bi((f) => f.t(`A fair trade swaps things of equal value. Each of your ${f.N(n)} trading cards is worth ${f.D(x)}. A friend's cards are each worth ${f.D(y)}. How many of your friend's cards make a fair trade for all ${f.N(n)} of yours?`, `Un échange équitable permet d'échanger des choses de même valeur. Chacune de tes ${f.N(n)} cartes à échanger vaut ${f.D(x)}. Les cartes de ton ami valent chacune ${f.D(y)}. Combien de cartes de ton ami font un échange équitable contre les ${f.N(n)} des tiennes ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[total, t('That is the total value in dollars, not the number of cards. Divide it by the value of one friend card.', 'C\'est la valeur totale en dollars, pas le nombre de cartes. Divise-la par la valeur d\'une carte de ton ami.'), 1], [n, t('It looks like the cards were traded one for one. Their values differ, so compare the total values.', 'Il semble que les cartes ont été échangées une pour une. Leurs valeurs diffèrent : compare les valeurs totales.'), 0]]),
    steps: [bi((f) => f.t(`Your cards are worth ${f.N(n)} × ${f.N(x)} = ${f.D(total)} in all.`, `Tes cartes valent ${f.N(n)} × ${f.N(x)} = ${f.D(total)} en tout.`)), bi((f) => f.t(`${f.N(total)} ÷ ${f.N(y)} = ${f.N(k)} of your friend's cards.`, `${f.N(total)} ÷ ${f.N(y)} = ${f.N(k)} cartes de ton ami.`))],
    nudge: t('Find the total value of your cards, then see how many of the friend\'s cards that buys.', 'Trouve la valeur totale de tes cartes, puis vois combien de cartes de ton ami cela permet d\'obtenir.'),
  };
});
