// Grade 11 (MBF3C) new skills: zero and negative exponents on numbers, and the costs of owning and operating a vehicle.
// The course also reuses generators written for MPM2D, MCF3M, MCR3U, MTH1W and MDM4U.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const dollars = (f: F, x: number): string => f.D(r6(x));

/** MBF3C.A2: zero and negative exponents */
export const zeroNeg11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9), b = randInt(r, 2, 6), c = pick(r, [1, 2, 3]), ans = 1 + b ** c;
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`${f.n(a)}^{0} + ${f.n(b)}^{${f.n(c)}}`)}.`, `Évalue ${f.m(`${f.n(a)}^{0} + ${f.n(b)}^{${f.n(c)}}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [
        [b ** c, t('Any non-zero number to the power 0 equals 1, so the first term is 1, not 0.', 'Tout nombre non nul puissance 0 vaut 1 : le premier terme vaut 1, pas 0.'), 0],
        [a + b ** c, t('The power 0 does not leave the base alone. Any non-zero number to the power 0 equals 1.', 'L\'exposant 0 ne laisse pas la base telle quelle. Tout nombre non nul puissance 0 vaut 1.'), 0],
        [1 + b * c, t('A power is repeated multiplication, not the base times the exponent.', 'Une puissance est une multiplication répétée, pas la base fois l\'exposant.'), 1],
      ]),
      steps: [
        bi((f) => f.t(`${f.m(`${f.n(a)}^{0} = 1`)}, because any non-zero number to the power 0 is 1. Also ${f.m(`${f.n(b)}^{${f.n(c)}} = ${f.n(b ** c)}`)}.`, `${f.m(`${f.n(a)}^{0} = 1`)}, car tout nombre non nul puissance 0 vaut 1. De plus, ${f.m(`${f.n(b)}^{${f.n(c)}} = ${f.n(b ** c)}`)}.`)),
        bi((f) => f.t(`The sum is ${f.m(`1 + ${f.n(b ** c)}`)} = ${f.N(ans)}.`, `La somme est ${f.m(`1 + ${f.n(b ** c)}`)} = ${f.N(ans)}.`)),
      ],
      nudge: t('A non-zero number to the power 0 is 1.', 'Un nombre non nul puissance 0 vaut 1.'),
    };
  }
  if (tier === 2) {
    const base = pick(r, [2, 5, 10]), n = base === 5 ? randInt(r, 1, 3) : randInt(r, 1, 4), ans = r6(base ** -n);
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`${f.n(base)}^{-${f.n(n)}}`)} as a decimal.`, `Évalue ${f.m(`${f.n(base)}^{-${f.n(n)}}`)} sous forme décimale.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [
        [-(base ** n), t('A negative exponent gives a reciprocal, not a negative number.', 'Un exposant négatif donne un inverse, pas un nombre négatif.'), 0],
        [base ** n, t('A negative exponent means one divided by the power: flip it to the bottom of a fraction.', 'Un exposant négatif signifie un divisé par la puissance : mets-la au dénominateur.'), 0],
        [r6(1 / (base * n)), t('The exponent tells you how many times to multiply the base, not what to multiply it by.', 'L\'exposant dit combien de fois multiplier la base, pas par quoi la multiplier.'), 1],
      ]),
      steps: [
        bi((f) => f.t(`${f.m(`${f.n(base)}^{-${f.n(n)}} = \\frac{1}{${f.n(base)}^{${f.n(n)}}} = \\frac{1}{${f.n(base ** n)}}`)}.`, `${f.m(`${f.n(base)}^{-${f.n(n)}} = \\frac{1}{${f.n(base)}^{${f.n(n)}}} = \\frac{1}{${f.n(base ** n)}}`)}.`)),
        bi((f) => f.t(`As a decimal, that is ${f.N(ans)}.`, `En décimal, cela donne ${f.N(ans)}.`)),
      ],
      nudge: t('A negative exponent means the reciprocal of the positive power.', 'Un exposant négatif signifie l\'inverse de la puissance positive.'),
    };
  }
  const base = pick(r, [2, 5, 10]), p = randInt(r, 1, 3), q = randInt(r, 2, 4), s = randInt(r, 1, 2), e = p - q + s, ans = r6(base ** e);
  return {
    prompt: bi((f) => f.t(`Evaluate ${f.m(`\\frac{${f.n(base)}^{${f.n(p)}} \\times ${f.n(base)}^{-${f.n(q)}}}{${f.n(base)}^{-${f.n(s)}}}`)} as a decimal or a whole number.`, `Évalue ${f.m(`\\frac{${f.n(base)}^{${f.n(p)}} \\times ${f.n(base)}^{-${f.n(q)}}}{${f.n(base)}^{-${f.n(s)}}}`)} sous forme décimale ou de nombre entier.`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [
      [r6(base ** (p - q - s)), t('Dividing by a negative exponent subtracts it: subtracting −s adds s.', 'Diviser par un exposant négatif le soustrait : soustraire −s revient à ajouter s.'), 0],
      [r6(base ** -e), t('The exponent came out with the wrong sign: add the exponents on top, then subtract the bottom one.', 'L\'exposant a le mauvais signe : additionne les exposants du haut, puis soustrais celui du bas.'), 1],
      [r6(base ** (p + q + s)), t('Keep the negative signs on the exponents when you combine them.', 'Garde les signes négatifs des exposants quand tu les combines.'), 0],
    ]),
    steps: [
      bi((f) => f.t(`Add the exponents on top: ${f.m(`${f.n(p)} + (-${f.n(q)}) = ${f.n(p - q)}`)}. Subtract the bottom exponent: ${f.m(`${f.n(p - q)} - (-${f.n(s)}) = ${f.n(e)}`)}.`, `Additionne les exposants du haut : ${f.m(`${f.n(p)} + (-${f.n(q)}) = ${f.n(p - q)}`)}. Soustrais l'exposant du bas : ${f.m(`${f.n(p - q)} - (-${f.n(s)}) = ${f.n(e)}`)}.`)),
      bi((f) => f.t(`${f.m(`${f.n(base)}^{${f.n(e)}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(base)}^{${f.n(e)}}`)} = ${f.N(ans)}.`)),
    ],
    nudge: t('Same base: add exponents when multiplying, subtract when dividing, and keep the signs.', 'Même base : additionne les exposants en multipliant, soustrais-les en divisant, et garde les signes.'),
  };
});

/** MBF3C.B3: the costs of owning and operating a vehicle */
export const vehicle11 = (id: string): Generator => numGen(id, (tier, r) => {
  const price = pick(r, [1.4, 1.5, 1.6, 1.7, 1.8]);
  if (tier === 1) {
    const km = randInt(r, 2, 16) * 50, use = pick(r, [6, 7, 8, 9, 10, 12]), ans = r6(((km * use) / 100) * price);
    return {
      prompt: bi((f) => f.t(`A car uses ${f.N(use)} litres of fuel per 100 km. Fuel costs ${f.D(price)} per litre. How much does the fuel cost for a ${f.N(km)} km trip, in dollars?`, `Une voiture consomme ${f.N(use)} litres de carburant aux 100 km. Le carburant coûte ${f.D(price)} le litre. Combien coûte le carburant pour un trajet de ${f.N(km)} km, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [
        [r6(km * use * price), t('The rate is per 100 km, so divide the distance by 100 first.', 'La consommation est aux 100 km : divise d\'abord la distance par 100.'), 0],
        [r6((km * use) / 100), t('That is the number of litres. Multiply by the price per litre.', 'C\'est le nombre de litres. Multiplie par le prix du litre.'), 1],
        [r6((km / 100) * price), t('Multiply by the litres used per 100 km too.', 'Multiplie aussi par les litres consommés aux 100 km.'), 0],
      ]),
      steps: [
        bi((f) => f.t(`Litres used: ${f.m(`${f.n(km)} \\div 100 \\times ${f.n(use)}`)} = ${f.N(r6((km * use) / 100))}.`, `Litres consommés : ${f.m(`${f.n(km)} \\div 100 \\times ${f.n(use)}`)} = ${f.N(r6((km * use) / 100))}.`)),
        bi((f) => f.t(`Cost: ${f.m(`${f.n(r6((km * use) / 100))} \\times ${f.n(price)}`)} = ${dollars(f, ans)}.`, `Coût : ${f.m(`${f.n(r6((km * use) / 100))} \\times ${f.n(price)}`)} = ${dollars(f, ans)}.`)),
      ],
      nudge: t('Find the litres used for the trip, then multiply by the price per litre.', 'Trouve les litres consommés pour le trajet, puis multiplie par le prix du litre.'),
    };
  }
  if (tier === 2) {
    const monthly = randInt(r, 6, 20) * 10, maint = randInt(r, 3, 12) * 100, km = randInt(r, 4, 20) * 1000, use = pick(r, [6, 8, 10]);
    const fuel = r6(((km * use) / 100) * price), ans = r6(monthly * 12 + maint + fuel);
    return {
      prompt: bi((f) => f.t(`Insurance for a car costs ${dollars(f, monthly)} per month. Maintenance costs ${dollars(f, maint)} per year. The car is driven ${f.N(km)} km a year and uses ${f.N(use)} litres per 100 km, with fuel at ${f.D(price)} per litre. What is the total yearly cost of insurance, maintenance and fuel, in dollars?`, `L'assurance d'une voiture coûte ${dollars(f, monthly)} par mois. L'entretien coûte ${dollars(f, maint)} par année. La voiture roule ${f.N(km)} km par année et consomme ${f.N(use)} litres aux 100 km, avec du carburant à ${f.D(price)} le litre. Quel est le coût annuel total de l'assurance, de l'entretien et du carburant, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [
        [r6(monthly + maint + fuel), t('Insurance is charged each month, so multiply it by 12 to get the yearly cost.', 'L\'assurance est facturée chaque mois : multiplie-la par 12 pour obtenir le coût annuel.'), 0],
        [r6(monthly * 12 + fuel), t('Remember to add the maintenance as well.', 'N\'oublie pas d\'ajouter aussi l\'entretien.'), 1],
        [r6(monthly * 12 + maint + km * use * price), t('The fuel rate is per 100 km, so divide the distance by 100 first.', 'La consommation est aux 100 km : divise d\'abord la distance par 100.'), 0],
      ]),
      steps: [
        bi((f) => f.t(`Insurance: ${f.m(`${f.n(monthly)} \\times 12`)} = ${dollars(f, monthly * 12)}. Fuel: ${f.m(`${f.n(km)} \\div 100 \\times ${f.n(use)} \\times ${f.n(price)}`)} = ${dollars(f, fuel)}.`, `Assurance : ${f.m(`${f.n(monthly)} \\times 12`)} = ${dollars(f, monthly * 12)}. Carburant : ${f.m(`${f.n(km)} \\div 100 \\times ${f.n(use)} \\times ${f.n(price)}`)} = ${dollars(f, fuel)}.`)),
        bi((f) => f.t(`Total: ${f.m(`${f.n(monthly * 12)} + ${f.n(maint)} + ${f.n(fuel)}`)} = ${dollars(f, ans)}.`, `Total : ${f.m(`${f.n(monthly * 12)} + ${f.n(maint)} + ${f.n(fuel)}`)} = ${dollars(f, ans)}.`)),
      ],
      nudge: t('Change every cost to a cost per year, then add them.', 'Convertis chaque coût en coût annuel, puis additionne-les.'),
    };
  }
  let km = 0, cpk = 0, total = 0, pay = 0, ins = 0, maint = 0, fuel = 0;
  do {
    km = pick(r, [10000, 12000, 15000, 20000]); cpk = r6(randInt(r, 11, 19) * 0.05); total = r6(cpk * km);
    pay = randInt(r, 25, 45) * 10; ins = randInt(r, 8, 24) * 100; maint = randInt(r, 3, 8) * 100; fuel = r6(total - pay * 12 - ins - maint);
  } while (fuel < 800);
  return {
    prompt: bi((f) => f.t(`In one year a car costs ${dollars(f, pay)} per month in loan payments, ${dollars(f, ins)} for insurance, ${dollars(f, maint)} for maintenance and ${dollars(f, fuel)} for fuel. It is driven ${f.N(km)} km. What is the cost per kilometre, in dollars?`, `En un an, une voiture coûte ${dollars(f, pay)} par mois en paiements de prêt, ${dollars(f, ins)} d'assurance, ${dollars(f, maint)} d'entretien et ${dollars(f, fuel)} de carburant. Elle roule ${f.N(km)} km. Quel est le coût par kilomètre, en dollars ?`)),
    answer: r6(cpk), category: 'TH', tolerance: 0.011,
    wrong: wr(r6(cpk), [
      [r6((pay + ins + maint + fuel) / km), t('The loan payment is monthly: multiply it by 12 before adding.', 'Le paiement du prêt est mensuel : multiplie-le par 12 avant d\'additionner.'), 0],
      [r6(km / total), t('Divide the cost by the distance, not the distance by the cost.', 'Divise le coût par la distance, pas la distance par le coût.'), 1],
      [r6(total), t('That is the total yearly cost. Divide by the distance driven.', 'C\'est le coût annuel total. Divise par la distance parcourue.'), 1],
    ]),
    steps: [
      bi((f) => f.t(`Yearly total: ${f.m(`${f.n(pay)} \\times 12 + ${f.n(ins)} + ${f.n(maint)} + ${f.n(fuel)}`)} = ${dollars(f, total)}.`, `Total annuel : ${f.m(`${f.n(pay)} \\times 12 + ${f.n(ins)} + ${f.n(maint)} + ${f.n(fuel)}`)} = ${dollars(f, total)}.`)),
      bi((f) => f.t(`Per kilometre: ${f.m(`${f.n(total)} \\div ${f.n(km)}`)} = ${f.D(r6(cpk))}.`, `Par kilomètre : ${f.m(`${f.n(total)} \\div ${f.n(km)}`)} = ${f.D(r6(cpk))}.`)),
    ],
    nudge: t('Add the yearly costs (the loan is monthly, so multiply by 12), then divide by the kilometres driven.', 'Additionne les coûts annuels (le prêt est mensuel : multiplie par 12), puis divise par les kilomètres parcourus.'),
  };
});
