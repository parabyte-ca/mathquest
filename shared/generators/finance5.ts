// Grade 5 Financial Literacy strand (F), the expectations that were not built before 2.8.2: transferring money, basic budgets,
// credit and debt, and the taxes governments collect.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, money, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G5.F1.1.a: ways money is transferred among individuals, organizations and businesses */
export const transfers5 = numGen('MS.G5.F1.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 12) * 5, fee = pick(r, [1, 1.5, 2, 2.5]);
    const total = r6(a + fee);
    return {
      prompt: bi((f) => f.t(`You send ${f.N(a)} dollars to a friend by e-transfer. The bank charges a fee of ${money(f, fee)} dollars. How much does the money in your account go down in all, in dollars?`, `Tu envoies ${f.N(a)} dollars à un ami par virement électronique. La banque charge des frais de ${money(f, fee)} dollars. De combien ton compte diminue-t-il en tout, en dollars ?`)),
      answer: total, category: 'AP',
      wrong: wr(total, [[a, t('That is only the amount sent. The fee comes out of your account too.', 'C\'est seulement le montant envoyé. Les frais sortent aussi de ton compte.'), 1], [r6(a - fee), t('The fee is an extra cost, so it is added, not taken away.', 'Les frais sont un coût de plus : on les ajoute, on ne les retire pas.'), 1]]),
      steps: [t('Your account pays the amount sent and the fee.', 'Ton compte paie le montant envoyé et les frais.'), bi((f) => `${f.N(a)} + ${money(f, fee)} = ${money(f, total)}.`)],
      nudge: t('Add the fee to the amount you send.', 'Ajoute les frais au montant que tu envoies.'),
    };
  }
  if (tier === 2) {
    const cash = randInt(r, 5, 20) * 10, debit = randInt(r, 3, 15) * 10, credit = randInt(r, 3, 15) * 10;
    const card = debit + credit;
    return {
      prompt: bi((f) => f.t(`A store takes in ${f.N(cash)} dollars in cash, ${f.N(debit)} dollars paid by debit card and ${f.N(credit)} dollars paid by credit card. How many dollars reach the store's bank account electronically, from the card payments?`, `Un magasin reçoit ${f.N(cash)} dollars comptant, ${f.N(debit)} dollars payés par carte de débit et ${f.N(credit)} dollars payés par carte de crédit. Combien de dollars arrivent électroniquement dans le compte bancaire du magasin, grâce aux paiements par carte ?`)),
      answer: card, category: 'AP',
      wrong: wr(card, [[cash + debit + credit, t('That includes the cash. Cash is handed over in person and is not an electronic transfer.', 'Cela comprend le comptant. Le comptant se remet en personne : ce n\'est pas un transfert électronique.'), 1], [cash, t('That is only the cash. The question asks about the card payments.', 'C\'est seulement le comptant. La question porte sur les paiements par carte.'), 0]]),
      steps: [t('Debit and credit card payments are moved electronically. Cash is not.', 'Les paiements par carte de débit et de crédit sont transférés électroniquement. Pas le comptant.'), bi((f) => `${f.N(debit)} + ${f.N(credit)} = ${f.N(card)}.`)],
      nudge: t('Leave out the cash and add the two card amounts.', 'Laisse de côté le comptant et additionne les deux montants par carte.'),
    };
  }
  const a = randInt(r, 4, 18) * 5, k = randInt(r, 2, 5), fee = pick(r, [1.5, 2, 2.5]);
  const total = r6(k * (a + fee));
  return {
    prompt: bi((f) => f.t(`You make ${f.N(k)} separate e-transfers of ${f.N(a)} dollars each. Each transfer has a fee of ${money(f, fee)} dollars. How many dollars come out of your account in all?`, `Tu fais ${f.N(k)} virements électroniques distincts de ${f.N(a)} dollars chacun. Chaque virement a des frais de ${money(f, fee)} dollars. Combien de dollars sortent de ton compte en tout ?`)),
    answer: total, category: 'TH',
    wrong: wr(total, [[r6(k * a + fee), t('The fee is charged on every transfer, not just once.', 'Les frais sont facturés à chaque virement, pas une seule fois.'), 1], [r6(k * fee), t('That is only the fees. The amounts sent come out of the account too.', 'C\'est seulement les frais. Les montants envoyés sortent aussi du compte.'), 1]]),
    steps: [bi((f) => f.t(`One transfer costs ${f.N(a)} + ${money(f, fee)} = ${money(f, a + fee)} dollars.`, `Un virement coûte ${f.N(a)} + ${money(f, fee)} = ${money(f, a + fee)} dollars.`)), bi((f) => `${f.N(k)} × ${money(f, a + fee)} = ${money(f, total)}.`)],
    nudge: t('Find the cost of one transfer with its fee, then multiply by how many.', 'Trouve le coût d\'un virement avec ses frais, puis multiplie par leur nombre.'),
  };
});

/** MS.G5.F1.3.a: basic budgets for earning and spending */
export const budgets5 = numGen('MS.G5.F1.3.a', (tier, r) => {
  if (tier === 1) {
    const inc = randInt(r, 16, 40) * 10, needs = randInt(r, 10, 20) * 5, wants = randInt(r, 4, 10) * 5;
    const left = inc - needs - wants;
    return {
      prompt: bi((f) => f.t(`Your monthly budget has an income of ${f.N(inc)} dollars. You plan to spend ${f.N(needs)} dollars on needs and ${f.N(wants)} dollars on wants. How many dollars are left to save?`, `Ton budget mensuel a un revenu de ${f.N(inc)} dollars. Tu prévois dépenser ${f.N(needs)} dollars pour les besoins et ${f.N(wants)} dollars pour les désirs. Combien de dollars restent pour l'épargne ?`)),
      answer: left, category: 'AP',
      wrong: wr(left, [[needs + wants, t('That is the total planned spending. What is left to save is the income minus the spending.', 'C\'est le total des dépenses prévues. Ce qui reste pour l\'épargne, c\'est le revenu moins les dépenses.'), 1], [inc - needs, t('That only takes off the needs. The wants are spending too.', 'Cela ne retire que les besoins. Les désirs sont aussi des dépenses.'), 0]]),
      steps: [bi((f) => f.t(`Spending: ${f.N(needs)} + ${f.N(wants)} = ${f.N(needs + wants)} dollars.`, `Dépenses : ${f.N(needs)} + ${f.N(wants)} = ${f.N(needs + wants)} dollars.`)), bi((f) => `${f.N(inc)} − ${f.N(needs + wants)} = ${f.N(left)}.`)],
      nudge: t('Add the spending, then take it away from the income.', 'Additionne les dépenses, puis retire-les du revenu.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 5, 20), inc = 8 * k * 5;
    const save = inc / 4, each = (inc - save) / 2;
    return {
      prompt: bi((f) => f.t(`You plan to save one quarter of your ${f.N(inc)} dollar income and split the rest equally between 2 kinds of spending. How many dollars go to each kind of spending?`, `Tu prévois d'épargner le quart de ton revenu de ${f.N(inc)} dollars et de partager le reste également entre 2 sortes de dépenses. Combien de dollars vont à chaque sorte de dépense ?`)),
      answer: each, category: 'AP',
      wrong: wr(each, [[inc / 2, t('That splits the whole income. Take out the savings first.', 'Cela partage tout le revenu. Retire d\'abord l\'épargne.'), 0], [inc - save, t('That is all the spending together. Split it into 2 equal parts.', 'C\'est toutes les dépenses ensemble. Partage-les en 2 parts égales.'), 1]]),
      steps: [bi((f) => f.t(`Savings: ${f.N(inc)} ÷ ${f.N(4)} = ${f.N(save)} dollars. Left to spend: ${f.N(inc)} − ${f.N(save)} = ${f.N(inc - save)} dollars.`, `Épargne : ${f.N(inc)} ÷ ${f.N(4)} = ${f.N(save)} dollars. Reste à dépenser : ${f.N(inc)} − ${f.N(save)} = ${f.N(inc - save)} dollars.`)), bi((f) => `${f.N(inc - save)} ÷ ${f.N(2)} = ${f.N(each)}.`)],
      nudge: t('Find the savings first, take it away, then split what is left.', 'Trouve d\'abord l\'épargne, retire-la, puis partage ce qui reste.'),
    };
  }
  const rate = randInt(r, 8, 15), hours = randInt(r, 3, 8), spend = randInt(r, 1, 4) * 5, w = randInt(r, 3, 10);
  const net = rate * hours - spend, goal = net * w;
  return {
    prompt: bi((f) => f.t(`You earn ${f.N(rate)} dollars an hour and work ${f.N(hours)} hours a week. Each week you spend ${f.N(spend)} dollars. In how many weeks can you save ${f.N(goal)} dollars?`, `Tu gagnes ${f.N(rate)} dollars l'heure et tu travailles ${f.N(hours)} heures par semaine. Chaque semaine, tu dépenses ${f.N(spend)} dollars. En combien de semaines peux-tu économiser ${f.N(goal)} dollars ?`)),
    answer: w, category: 'TH',
    wrong: wr(w, [[goal / (rate * hours), t('That ignores what you spend. Only the money left after spending can be saved.', 'Cela ignore ce que tu dépenses. Seul l\'argent qui reste après les dépenses peut être épargné.'), 1], [goal - net, t('That is not the number of weeks. Divide the goal by what you save each week.', 'Ce n\'est pas le nombre de semaines. Divise l\'objectif par ce que tu épargnes chaque semaine.'), 1]]),
    steps: [bi((f) => f.t(`Earned each week: ${f.N(rate)} × ${f.N(hours)} = ${f.N(rate * hours)} dollars. Saved each week: ${f.N(rate * hours)} − ${f.N(spend)} = ${f.N(net)} dollars.`, `Gagné chaque semaine : ${f.N(rate)} × ${f.N(hours)} = ${f.N(rate * hours)} dollars. Épargné chaque semaine : ${f.N(rate * hours)} − ${f.N(spend)} = ${f.N(net)} dollars.`)), bi((f) => `${f.N(goal)} ÷ ${f.N(net)} = ${f.N(w)}.`)],
    nudge: t('Find what you earn in a week, take away what you spend, then divide the goal by the savings.', 'Trouve ce que tu gagnes en une semaine, retire ce que tu dépenses, puis divise l\'objectif par l\'épargne.'),
  };
});

/** MS.G5.F1.4.a: credit and debt, and their effect on financial decisions */
export const credit5 = numGen('MS.G5.F1.4.a', (tier, r) => {
  if (tier === 1) {
    const owe = randInt(r, 10, 40) * 10, paid = randInt(r, 2, 8) * 10, bought = randInt(r, 1, 6) * 10;
    const now = owe - paid + bought;
    return {
      prompt: bi((f) => f.t(`You owe ${f.N(owe)} dollars on a credit card. You make a payment of ${f.N(paid)} dollars and then buy ${f.N(bought)} dollars more with the card. How many dollars do you owe now?`, `Tu dois ${f.N(owe)} dollars sur une carte de crédit. Tu fais un paiement de ${f.N(paid)} dollars, puis tu achètes pour ${f.N(bought)} dollars de plus avec la carte. Combien de dollars dois-tu maintenant ?`)),
      answer: now, category: 'AP',
      wrong: wr(now, [[owe - paid - bought, t('A purchase on credit adds to what you owe. Only the payment takes it down.', 'Un achat à crédit augmente ce que tu dois. Seul le paiement le diminue.'), 1], [owe + bought, t('The payment was left out. A payment lowers the debt.', 'Le paiement a été oublié. Un paiement diminue la dette.'), 1]]),
      steps: [t('A payment lowers what you owe. A new purchase on the card raises it.', 'Un paiement diminue ce que tu dois. Un nouvel achat avec la carte l\'augmente.'), bi((f) => `${f.N(owe)} − ${f.N(paid)} + ${f.N(bought)} = ${f.N(now)}.`)],
      nudge: t('Take off the payment, then add the new purchase.', 'Retire le paiement, puis ajoute le nouvel achat.'),
    };
  }
  if (tier === 2) {
    const owe = randInt(r, 5, 30) * 20, pct = pick(r, [5, 10]);
    const interest = (owe * pct) / 100, now = owe + interest;
    return {
      prompt: bi((f) => f.t(`A credit card charges ${f.N(pct)}% interest each month on what you owe. You owe ${f.N(owe)} dollars and pay nothing this month. How many dollars do you owe after the interest is added?`, `Une carte de crédit charge ${f.N(pct)} % d'intérêt chaque mois sur ce que tu dois. Tu dois ${f.N(owe)} dollars et tu ne paies rien ce mois-ci. Combien de dollars dois-tu après l'ajout de l'intérêt ?`)),
      answer: now, category: 'AP',
      wrong: wr(now, [[interest, t('That is only the interest. You still owe the amount you started with, plus the interest.', 'C\'est seulement l\'intérêt. Tu dois toujours le montant de départ, plus l\'intérêt.'), 1], [owe - interest, t('Interest makes the debt bigger, so it is added, not taken away.', 'L\'intérêt augmente la dette : on l\'ajoute, on ne le retire pas.'), 1]]),
      steps: [bi((f) => f.t(`Interest: ${f.N(pct)}% of ${f.N(owe)} = ${f.N(interest)} dollars.`, `Intérêt : ${f.N(pct)} % de ${f.N(owe)} = ${f.N(interest)} dollars.`)), bi((f) => `${f.N(owe)} + ${f.N(interest)} = ${f.N(now)}.`)],
      nudge: t('Find the percent of what you owe, then add it on.', 'Trouve le pourcentage de ce que tu dois, puis ajoute-le.'),
    };
  }
  const pay = randInt(r, 4, 9) * 10, interest = randInt(r, 1, 3) * 5, m = randInt(r, 3, 10);
  const owe = (pay - interest) * m;
  return {
    prompt: bi((f) => f.t(`You owe ${f.N(owe)} dollars. Each month you pay ${f.N(pay)} dollars, but ${f.N(interest)} dollars of new interest is added. So the debt goes down by less each month. In how many months will the debt be paid off?`, `Tu dois ${f.N(owe)} dollars. Chaque mois, tu paies ${f.N(pay)} dollars, mais ${f.N(interest)} dollars d'intérêt s'ajoutent. La dette diminue donc de moins chaque mois. En combien de mois la dette sera-t-elle payée ?`)),
    answer: m, category: 'TH',
    wrong: wr(m, [[owe / pay, t('That ignores the interest. The debt really goes down by the payment minus the interest each month.', 'Cela ignore l\'intérêt. La dette diminue en réalité du paiement moins l\'intérêt chaque mois.'), 1], [owe / interest, t('That only uses the interest. Use how much the debt goes down each month.', 'Cela n\'utilise que l\'intérêt. Utilise de combien la dette diminue chaque mois.'), 1]]),
    steps: [bi((f) => f.t(`The debt goes down by ${f.N(pay)} − ${f.N(interest)} = ${f.N(pay - interest)} dollars each month.`, `La dette diminue de ${f.N(pay)} − ${f.N(interest)} = ${f.N(pay - interest)} dollars chaque mois.`)), bi((f) => `${f.N(owe)} ÷ ${f.N(pay - interest)} = ${f.N(m)}.`)],
    nudge: t('Find how much the debt really drops each month, then divide.', 'Trouve de combien la dette baisse vraiment chaque mois, puis divise.'),
  };
});

/** MS.G5.F1.6.a: taxes collected by each level of government and how the revenue funds services */
type Level = 'federal' | 'provincial' | 'municipal';
const LEVEL: Record<Level, [string, string]> = { federal: ['The federal government', 'Le gouvernement fédéral'], provincial: ['The provincial government', 'Le gouvernement provincial'], municipal: ['The municipal government (the city or town)', 'L\'administration municipale (la ville ou le village)'] };
const TAXES: { en: string; fr: string; level: Level }[] = [
  { en: 'property tax', fr: 'l\'impôt foncier', level: 'municipal' },
  { en: 'the Goods and Services Tax (GST)', fr: 'la taxe sur les produits et services (TPS)', level: 'federal' },
  { en: 'federal income tax', fr: 'l\'impôt fédéral sur le revenu', level: 'federal' },
  { en: 'Ontario provincial income tax', fr: 'l\'impôt provincial de l\'Ontario sur le revenu', level: 'provincial' },
];
const SERVICES: { en: string; fr: string; level: Level }[] = [
  { en: 'garbage collection and local libraries', fr: 'la collecte des ordures et les bibliothèques locales', level: 'municipal' },
  { en: 'snow clearing on city streets', fr: 'le déneigement des rues de la ville', level: 'municipal' },
  { en: 'national defence and passports', fr: 'la défense nationale et les passeports', level: 'federal' },
  { en: 'public schools and hospitals', fr: 'les écoles publiques et les hôpitaux', level: 'provincial' },
];
const levelOptions = (r: () => number, right: Level, why: (l: Level) => Text): { options: Text[]; correct: number; why: Record<number, Text> } => {
  const all: Level[] = ['federal', 'provincial', 'municipal'];
  return mc(r, t(...LEVEL[right]), all.filter((l) => l !== right).map((l): [Text, Text] => [t(...LEVEL[l]), why(l)]));
};
const taxLevel = choiceGen('MS.G5.F1.6.a', (_tier, r) => {
  const x = pick(r, TAXES);
  const m = levelOptions(r, x.level, (l) => t(`That level does not collect ${x.en}. Think about who the tax pays for.`, `Ce palier ne perçoit pas ${x.fr}. Pense à qui profite la taxe.`));
  return {
    prompt: t(`Which level of government collects ${x.en}?`, `Quel palier de gouvernement perçoit ${x.fr} ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Canada has three levels of government: federal (the whole country), provincial (the province) and municipal (the city or town). Each collects its own taxes.', 'Le Canada a trois paliers de gouvernement : fédéral (tout le pays), provincial (la province) et municipal (la ville ou le village). Chacun perçoit ses propres taxes.'), t(`${x.en.charAt(0).toUpperCase() + x.en.slice(1)} is collected by the ${x.level} government.`, `${x.fr.charAt(0).toUpperCase() + x.fr.slice(1)} est perçu${x.fr.startsWith('la ') ? 'e' : ''} par le gouvernement ${x.level === 'federal' ? 'fédéral' : x.level === 'provincial' ? 'provincial' : 'municipal'}.`)],
    nudge: t('Which level of government looks after the area this tax is about?', 'Quel palier de gouvernement s\'occupe du domaine visé par cette taxe ?'),
  };
});
const serviceLevel = choiceGen('MS.G5.F1.6.a', (_tier, r) => {
  const x = pick(r, SERVICES);
  const m = levelOptions(r, x.level, () => t(`That level does not mainly pay for ${x.en}.`, `Ce palier ne paie pas principalement ${x.fr}.`));
  return {
    prompt: t(`Tax money pays for services. Which level of government mainly pays for ${x.en}?`, `L'argent des taxes paie des services. Quel palier de gouvernement paie principalement ${x.fr} ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Tax revenue funds the services each level is responsible for: local services for the municipality, health and schools for the province, and national services for the federal government.', 'Les revenus des taxes financent les services dont chaque palier est responsable : services locaux pour la municipalité, santé et écoles pour la province, services nationaux pour le gouvernement fédéral.'), t(`So ${x.en} are mainly paid for by the ${x.level} government.`, `Donc ${x.fr} sont principalement payés par le gouvernement ${x.level === 'federal' ? 'fédéral' : x.level === 'provincial' ? 'provincial' : 'municipal'}.`)],
    nudge: t('Is the service local, provincial or national?', 'Le service est-il local, provincial ou national ?'),
  };
});
const hstShare = numGen('MS.G5.F1.6.a', (_tier, r) => {
  const price = randInt(r, 4, 40) * 50;
  const prov = (price * 8) / 100;
  return {
    prompt: bi((f) => f.t(`In Ontario the HST is ${f.N(13)}%: ${f.N(5)}% goes to the federal government and ${f.N(8)}% goes to the provincial government. On a purchase of ${f.N(price)} dollars, how many dollars of HST go to the provincial government?`, `En Ontario, la TVH est de ${f.N(13)} % : ${f.N(5)} % va au gouvernement fédéral et ${f.N(8)} % va au gouvernement provincial. Sur un achat de ${f.N(price)} dollars, combien de dollars de TVH vont au gouvernement provincial ?`)),
    answer: prov, category: 'AP',
    wrong: wr(prov, [[(price * 13) / 100, t('That is all of the HST. Only the provincial part goes to the province.', 'C\'est toute la TVH. Seule la part provinciale va à la province.'), 1], [(price * 5) / 100, t('That is the federal part. The provincial part is the other percent.', 'C\'est la part fédérale. La part provinciale est l\'autre pourcentage.'), 0]]),
    steps: [bi((f) => f.t(`The provincial part is ${f.N(8)}% of ${f.N(price)}.`, `La part provinciale est ${f.N(8)} % de ${f.N(price)}.`)), bi((f) => `${f.N(price)} × ${f.N(0.08)} = ${f.N(prov)}.`)],
    nudge: t('Find 8% of the price.', 'Trouve 8 % du prix.'),
  };
});
export const taxes5 = tierGen(taxLevel, serviceLevel, hstShare);
