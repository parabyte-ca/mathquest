// Lessons for Grade 11 Mathematics for Work and Everyday Life (MEL3E): pay, purchases, saving and borrowing, vehicles and travel.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE11D_LESSONS: Lesson[] = [
  {
    id: 'L.g11.mel-pay',
    skills: ['MS.G11.MEL3E.A1.1.a', 'MS.G11.MEL3E.A2.1.a', 'MS.G11.MEL3E.A3.1.a', 'MS.G11.MEL3E.A3.2.a'],
    title: t('Pay, deductions, sale prices and the best buy', 'Paie, retenues, prix de solde et meilleur achat'),
    intro: t('Knowing how pay is worked out, what is taken off it and what things really cost helps you plan a budget and spot a good deal.', 'Savoir comment la paie est calculée, ce qui en est retiré et ce que les choses coûtent vraiment aide à planifier un budget et à repérer une bonne affaire.'),
    definitions: [
      d(['Ways of being paid', 'Façons d\'être payé'], ['Hourly pay is wage × hours. Overtime is often paid at time and a half, which is 1.5 × the wage. Commission is a percent of sales, often added to a base pay.', 'La paie horaire est salaire × heures. Les heures supplémentaires sont souvent payées à une fois et demie, soit 1,5 × le salaire. La commission est un pourcentage des ventes, souvent ajouté à un salaire de base.']),
      d(['Gross and net pay', 'Paie brute et paie nette'], ['Gross pay is what you earn. Deductions such as income tax, CPP and EI come off it. Net pay = gross pay − deductions, and it is the money you take home.', 'La paie brute est ce que tu gagnes. Les retenues comme l\'impôt, le RPC et l\'AE en sont retirées. Paie nette = paie brute − retenues, et c\'est l\'argent que tu rapportes à la maison.']),
      d(['Discounts and tax', 'Rabais et taxes'], ['A discount is a percent of the price taken off. Sales tax is a percent added on. Take the discount first, then add the tax to the sale price. Change = money paid − total cost.', 'Un rabais est un pourcentage du prix qu\'on retire. La taxe de vente est un pourcentage qu\'on ajoute. Retire d\'abord le rabais, puis ajoute la taxe au prix de solde. Monnaie = argent donné − coût total.']),
      d(['Unit price', 'Prix unitaire'], ['Unit price = price ÷ amount, for example dollars per 100 g. The best buy is the one with the lowest unit price.', 'Prix unitaire = prix ÷ quantité, par exemple des dollars par 100 g. Le meilleur achat est celui dont le prix unitaire est le plus bas.']),
    ],
    examples: [
      ex(['Example 1: overtime', 'Exemple 1 : heures supplémentaires'], ['A worker earns 18 dollars an hour for 40 hours and time and a half after that. In a 46 hour week the regular pay is 40 × 18 = 720 dollars.', 'Une travailleuse gagne 18 dollars l\'heure pour 40 heures et une fois et demie ensuite. Dans une semaine de 46 heures, la paie régulière est de 40 × 18 = 720 dollars.'], ['Overtime is 6 × 27 = 162 dollars, so the total is 720 + 162 = 882 dollars.', 'Les heures supplémentaires donnent 6 × 27 = 162 dollars : le total est de 720 + 162 = 882 dollars.']),
      ex(['Example 2: net pay', 'Exemple 2 : paie nette'], ['Gross pay is 1500 dollars and deductions take 20%. The deductions are 1500 × 0.20 = 300 dollars.', 'La paie brute est de 1500 dollars et les retenues en prennent 20 %. Les retenues sont de 1500 × 0,20 = 300 dollars.'], ['Net pay is 1500 − 300 = 1200 dollars.', 'La paie nette est de 1500 − 300 = 1200 dollars.']),
      ex(['Example 3: the best buy', 'Exemple 3 : le meilleur achat'], ['A 400 g bag costs 2.00 dollars, so it is 2.00 ÷ 4 = 0.50 dollars per 100 g. An 800 g bag costs 3.60 dollars, so it is 3.60 ÷ 8 = 0.45 dollars per 100 g.', 'Un sac de 400 g coûte 2,00 dollars : c\'est 2,00 ÷ 4 = 0,50 dollar par 100 g. Un sac de 800 g coûte 3,60 dollars : c\'est 3,60 ÷ 8 = 0,45 dollar par 100 g.'], ['The 800 g bag is the better buy, by 0.05 dollars per 100 g.', 'Le sac de 800 g est le meilleur achat, avec 0,05 dollar de moins par 100 g.']),
    ],
    tryIt: { skill: 'MS.G11.MEL3E.A1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mel-money',
    skills: ['MS.G11.MEL3E.B1.1.a', 'MS.G11.MEL3E.B1.2.a', 'MS.G11.MEL3E.B2.1.a'],
    title: t('Saving, compounding and borrowing', 'Épargner, composer et emprunter'),
    intro: t('Savings earn interest and loans charge it. Simple interest uses the original amount every time; compound interest uses the growing balance.', 'L\'épargne rapporte de l\'intérêt et les prêts en facturent. L\'intérêt simple utilise toujours le montant de départ ; l\'intérêt composé utilise le solde qui grandit.'),
    definitions: [
      d(['Simple interest', 'Intérêt simple'], ['I = P × r × t, with the rate r as a decimal. The balance is P + I.', 'I = P × r × t, avec le taux r en décimale. Le solde est P + I.']),
      d(['Compound interest by steps', 'Intérêt composé par étapes'], ['For each period, work out the simple interest on the current balance and add it. Repeat for each period (up to six). Compound interest is more than simple interest.', 'Pour chaque période, calcule l\'intérêt simple sur le solde actuel et ajoute-le. Répète pour chaque période (jusqu\'à six). L\'intérêt composé est plus élevé que l\'intérêt simple.']),
      d(['Loans and credit', 'Prêts et crédit'], ['The cost of borrowing is the interest, plus any fees. Total repaid = amount borrowed + interest. A down payment is paid up front and is not borrowed.', 'Le coût d\'un emprunt est l\'intérêt, plus les frais. Total remboursé = montant emprunté + intérêt. Un acompte est payé d\'avance et n\'est pas emprunté.']),
    ],
    examples: [
      ex(['Example 1: simple interest', 'Exemple 1 : intérêt simple'], ['1000 dollars at 4% simple interest for 3 years earns 1000 × 0.04 × 3 = 120 dollars.', '1000 dollars à 4 % d\'intérêt simple pendant 3 ans rapportent 1000 × 0,04 × 3 = 120 dollars.'], ['The balance is 1000 + 120 = 1120 dollars.', 'Le solde est de 1000 + 120 = 1120 dollars.']),
      ex(['Example 2: compounding', 'Exemple 2 : composer'], ['1000 dollars at 10% for 2 years. Year 1 interest is 100, so the balance is 1100. Year 2 interest is 1100 × 0.10 = 110, so the balance is 1210.', '1000 dollars à 10 % pendant 2 ans. L\'intérêt de la première année est de 100 : le solde est de 1100. L\'intérêt de la deuxième année est de 1100 × 0,10 = 110 : le solde est de 1210.'], ['Simple interest would be 200, so compounding earns 210 − 200 = 10 dollars more.', 'L\'intérêt simple serait de 200 : l\'intérêt composé rapporte donc 210 − 200 = 10 dollars de plus.']),
      ex(['Example 3: a loan', 'Exemple 3 : un prêt'], ['Borrow 800 dollars for 3 years at 5% simple interest. The interest is 800 × 0.05 × 3 = 120 dollars.', 'Emprunte 800 dollars pendant 3 ans à 5 % d\'intérêt simple. L\'intérêt est de 800 × 0,05 × 3 = 120 dollars.'], ['You repay 800 + 120 = 920 dollars.', 'Tu rembourses 800 + 120 = 920 dollars.']),
    ],
    tryIt: { skill: 'MS.G11.MEL3E.B1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mel-vehicles',
    skills: ['MS.G11.MEL3E.C1.1.a', 'MS.G11.MEL3E.C1.2.a', 'MS.G11.MEL3E.C2.1.a'],
    title: t('Vehicle costs, leasing and trips', 'Coûts d\'un véhicule, location et trajets'),
    intro: t('A vehicle has fixed costs and costs that grow with every kilometre. Comparing buying with leasing, and driving with other ways to travel, means adding up the real totals.', 'Un véhicule entraîne des coûts fixes et des coûts qui augmentent à chaque kilomètre. Comparer l\'achat à la location, et la conduite aux autres modes de transport, demande d\'additionner les vrais totaux.'),
    definitions: [
      d(['Fixed and variable costs', 'Coûts fixes et variables'], ['Fixed costs (payments, insurance, licence) do not depend on distance. Variable costs (fuel, maintenance) grow with the distance. Fuel cost = distance ÷ 100 × litres per 100 km × price per litre.', 'Les coûts fixes (paiements, assurance, immatriculation) ne dépendent pas de la distance. Les coûts variables (carburant, entretien) augmentent avec la distance. Coût du carburant = distance ÷ 100 × litres aux 100 km × prix du litre.']),
      d(['Buying and leasing', 'Acheter et louer'], ['A lease costs monthly payment × months + the amount paid at the start. Buying costs the price, minus what you get back when you sell. Compare the totals over the same time.', 'Une location coûte paiement mensuel × mois + le montant payé au départ. Acheter coûte le prix, moins ce qu\'on récupère à la vente. Compare les totaux sur la même période.']),
      d(['Map scales', 'Échelles de cartes'], ['A scale such as 1 cm = 20 km means real distance = map distance × 20. Use the real distance to work out the cost of a trip, then compare modes of travel.', 'Une échelle comme 1 cm = 20 km signifie distance réelle = distance sur la carte × 20. Utilise la distance réelle pour calculer le coût d\'un trajet, puis compare les modes de transport.']),
    ],
    examples: [
      ex(['Example 1: fuel', 'Exemple 1 : carburant'], ['A car uses 8 litres per 100 km. A 250 km trip uses 250 ÷ 100 × 8 = 20 litres.', 'Une voiture consomme 8 litres aux 100 km. Un trajet de 250 km consomme 250 ÷ 100 × 8 = 20 litres.'], ['At 1.50 dollars per litre the fuel costs 20 × 1.50 = 30 dollars.', 'À 1,50 dollar le litre, le carburant coûte 20 × 1,50 = 30 dollars.']),
      ex(['Example 2: lease or buy', 'Exemple 2 : louer ou acheter'], ['A lease costs 300 dollars a month for 36 months plus 1000 dollars to start: 300 × 36 + 1000 = 11 800 dollars.', 'Une location coûte 300 dollars par mois pendant 36 mois plus 1000 dollars au départ : 300 × 36 + 1000 = 11 800 dollars.'], ['Buying for 20 000 dollars and selling for 8000 dollars costs 12 000 dollars, so the lease costs 200 dollars less.', 'Acheter 20 000 dollars et revendre 8000 dollars coûte 12 000 dollars : la location coûte donc 200 dollars de moins.']),
      ex(['Example 3: a map trip', 'Exemple 3 : un trajet sur une carte'], ['On a map 1 cm = 20 km, and a trip measures 7 cm, so it is 7 × 20 = 140 km.', 'Sur une carte, 1 cm = 20 km et un trajet mesure 7 cm : il fait 7 × 20 = 140 km.'], ['Driving at 0.40 dollars per km costs 140 × 0.40 = 56 dollars.', 'Conduire à 0,40 dollar le km coûte 140 × 0,40 = 56 dollars.']),
    ],
    tryIt: { skill: 'MS.G11.MEL3E.C2.1.a', tier: 1, seed: 2 },
  },
];
