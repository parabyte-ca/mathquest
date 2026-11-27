// Grade 12 (MAP4C) new skills: comparing linear models, mortgages, owning against renting, and optimal dimensions.
// The course also reuses generators written for MCR3U, MCF3M, MCT4C, MHF4U, MDM4U and MTH1W.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const dollars = (f: F, x: number): string => f.D(r6(x));

/** MAP4C.A2: compare two linear models by their initial value and rate of change */
export const linearCompare11 = (id: string): Generator => numGen(id, (tier, r) => {
  const d = randInt(r, 1, 5), x0 = randInt(r, 3, 12), b = randInt(r, 10, 40), rate = randInt(r, 2, 6), s = rate + d, a = b + d * x0;
  const plans = (f: F): string => f.t(`Gym A charges ${dollars(f, a)} to join plus ${dollars(f, rate)} per month. Gym B charges ${dollars(f, b)} to join plus ${dollars(f, s)} per month.`, `Le gym A demande ${dollars(f, a)} pour s'inscrire plus ${dollars(f, rate)} par mois. Le gym B demande ${dollars(f, b)} pour s'inscrire plus ${dollars(f, s)} par mois.`);
  if (tier === 1) {
    const m = randInt(r, 2, 10), ans = a + rate * m;
    return {
      prompt: bi((f) => f.t(`${plans(f)} How much does Gym A cost in total after ${f.N(m)} months, in dollars?`, `${plans(f)} Combien le gym A coûte-t-il au total après ${f.N(m)} mois, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[rate * m, t('Add the joining fee to the monthly charges.', 'Ajoute les frais d\'inscription aux frais mensuels.'), 1], [(a + rate) * m, t('The joining fee is paid once, not every month.', 'Les frais d\'inscription sont payés une seule fois, pas chaque mois.'), 0], [s * m + b, t('That is Gym B. Use the numbers for Gym A.', 'C\'est le gym B. Utilise les nombres du gym A.'), 0]]),
      steps: [bi((f) => f.t(`Cost = joining fee + rate × months = ${f.m(`${f.n(a)} + ${f.n(rate)} \\times ${f.n(m)}`)}.`, `Coût = frais d'inscription + tarif × mois = ${f.m(`${f.n(a)} + ${f.n(rate)} \\times ${f.n(m)}`)}.`)), bi((f) => f.t(`The cost is ${dollars(f, ans)}.`, `Le coût est de ${dollars(f, ans)}.`))],
      nudge: t('Cost = joining fee + monthly charge × number of months.', 'Coût = frais d\'inscription + frais mensuel × nombre de mois.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`${plans(f)} After how many months do the two gyms cost the same in total?`, `${plans(f)} Après combien de mois les deux gyms coûtent-ils le même total ?`)),
      answer: x0, category: 'TH',
      wrong: wr(x0, [[a - b, t('That is the difference in joining fees. Divide it by the difference in the monthly charges.', 'C\'est la différence des frais d\'inscription. Divise-la par la différence des frais mensuels.'), 1], [s - rate, t('That is the difference in the monthly charges. The break-even point also uses the joining fees.', 'C\'est la différence des frais mensuels. Le point d\'égalité utilise aussi les frais d\'inscription.'), 1], [r6((a + b) / (s + rate)), t('Set the two costs equal and subtract: the difference in fees divided by the difference in rates.', 'Pose les deux coûts égaux et soustrais : la différence des frais divisée par la différence des tarifs.'), 1]]),
      steps: [bi((f) => f.t(`Set the costs equal: ${f.m(`${f.n(a)} + ${f.n(rate)}m = ${f.n(b)} + ${f.n(s)}m`)}, so ${f.m(`${f.n(a - b)} = ${f.n(d)}m`)}.`, `Pose les coûts égaux : ${f.m(`${f.n(a)} + ${f.n(rate)}m = ${f.n(b)} + ${f.n(s)}m`)}, donc ${f.m(`${f.n(a - b)} = ${f.n(d)}m`)}.`)), bi((f) => f.t(`${f.m(`m = ${f.n(a - b)} \\div ${f.n(d)}`)} = ${f.N(x0)} months.`, `${f.m(`m = ${f.n(a - b)} \\div ${f.n(d)}`)} = ${f.N(x0)} mois.`))],
      nudge: t('Write the cost of each gym with m months, set them equal and solve for m.', 'Écris le coût de chaque gym avec m mois, pose-les égaux et résous pour m.'),
    };
  }
  const m = x0 + randInt(r, 2, 6), ans = d * (m - x0);
  return {
    prompt: bi((f) => f.t(`${plans(f)} How many dollars less does Gym A cost than Gym B in total after ${f.N(m)} months?`, `${plans(f)} Combien de dollars de moins le gym A coûte-t-il que le gym B au total après ${f.N(m)} mois ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[a - b, t('That is the difference in joining fees only. Work out the total cost of each gym after the months.', 'C\'est seulement la différence des frais d\'inscription. Calcule le coût total de chaque gym après les mois.'), 0], [d * m, t('Include the joining fees: the gyms cost the same at the break-even point.', 'Inclus les frais d\'inscription : les gyms coûtent la même chose au point d\'égalité.'), 0], [r6(Math.abs((a + rate * m) + (b + s * m))), t('Subtract the two total costs to compare them.', 'Soustrais les deux coûts totaux pour les comparer.'), 1]]),
    steps: [bi((f) => f.t(`Gym A: ${f.m(`${f.n(a)} + ${f.n(rate)} \\times ${f.n(m)}`)} = ${dollars(f, a + rate * m)}. Gym B: ${f.m(`${f.n(b)} + ${f.n(s)} \\times ${f.n(m)}`)} = ${dollars(f, b + s * m)}.`, `Gym A : ${f.m(`${f.n(a)} + ${f.n(rate)} \\times ${f.n(m)}`)} = ${dollars(f, a + rate * m)}. Gym B : ${f.m(`${f.n(b)} + ${f.n(s)} \\times ${f.n(m)}`)} = ${dollars(f, b + s * m)}.`)), bi((f) => f.t(`The difference is ${dollars(f, ans)}.`, `La différence est de ${dollars(f, ans)}.`))],
    nudge: t('Find the total cost of each gym after the months, then subtract.', 'Trouve le coût total de chaque gym après les mois, puis soustrais.'),
  };
});

/** MAP4C.B1: mortgages: interest paid, the balance after a payment, and the split of a payment */
export const mortgage11 = (id: string): Generator => numGen(id, (tier, r) => {
  const i = pick(r, [0.4, 0.5, 0.6]);
  let P = 0, p = 0, years = 0;
  do {
    P = randInt(r, 5, 20) * 10000; years = pick(r, [15, 20, 25]);
    p = Math.round((P * i) / 100 / 100) * 100 + randInt(r, 1, 5) * 100;
  } while (p * 12 * years <= P);
  const interest = r6(P * i / 100);
  const intro = (f: F): string => f.t(`A mortgage of ${dollars(f, P)} has an interest rate of ${f.m(`${f.n(i)}\\%`)} per month and a monthly payment of ${dollars(f, p)}.`, `Une hypothèque de ${dollars(f, P)} a un taux d'intérêt de ${f.m(`${f.n(i)}\\%`)} par mois et un paiement mensuel de ${dollars(f, p)}.`);
  if (tier === 1) {
    const total = p * 12 * years, ans = total - P;
    return {
      prompt: bi((f) => f.t(`A mortgage of ${dollars(f, P)} is repaid with payments of ${dollars(f, p)} a month for ${f.N(years)} years. How much interest is paid in all, in dollars?`, `Une hypothèque de ${dollars(f, P)} est remboursée par des paiements de ${dollars(f, p)} par mois pendant ${f.N(years)} ans. Combien d'intérêt est payé en tout, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[total, t('That is everything paid. Subtract the amount borrowed to get the interest.', 'C\'est tout ce qui est payé. Soustrais le montant emprunté pour obtenir l\'intérêt.'), 1], [p * years - P, t('There are 12 payments a year: multiply by 12 as well as by the years.', 'Il y a 12 paiements par année : multiplie par 12 en plus des années.'), 0], [total + P, t('Subtract the amount borrowed; it is not part of the interest.', 'Soustrais le montant emprunté : il ne fait pas partie de l\'intérêt.'), 1]]),
      steps: [bi((f) => f.t(`Total paid: ${f.m(`${f.n(p)} \\times 12 \\times ${f.n(years)}`)} = ${dollars(f, total)}.`, `Total payé : ${f.m(`${f.n(p)} \\times 12 \\times ${f.n(years)}`)} = ${dollars(f, total)}.`)), bi((f) => f.t(`Interest: ${f.m(`${f.n(total)} - ${f.n(P)}`)} = ${dollars(f, ans)}.`, `Intérêt : ${f.m(`${f.n(total)} - ${f.n(P)}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Find the total of all the payments, then subtract the amount borrowed.', 'Trouve le total de tous les paiements, puis soustrais le montant emprunté.'),
    };
  }
  if (tier === 2) {
    const ans = r6(P + interest - p);
    return {
      prompt: bi((f) => f.t(`${intro(f)} What is the balance owing right after the first payment, in dollars?`, `${intro(f)} Quel est le solde dû juste après le premier paiement, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(P - p), t('Interest is added to the balance first, then the payment is subtracted.', 'L\'intérêt est d\'abord ajouté au solde, puis le paiement est soustrait.'), 1], [r6(P + interest), t('Subtract the payment as well.', 'Soustrais aussi le paiement.'), 1], [r6(P - interest - p), t('Interest is added to the balance, not subtracted.', 'L\'intérêt s\'ajoute au solde, il ne se soustrait pas.'), 1]]),
      steps: [bi((f) => f.t(`Interest for the month: ${f.m(`${f.n(P)} \\times ${f.n(i / 100)}`)} = ${dollars(f, interest)}.`, `Intérêt du mois : ${f.m(`${f.n(P)} \\times ${f.n(i / 100)}`)} = ${dollars(f, interest)}.`)), bi((f) => f.t(`Balance: ${f.m(`${f.n(P)} + ${f.n(interest)} - ${f.n(p)}`)} = ${dollars(f, ans)}.`, `Solde : ${f.m(`${f.n(P)} + ${f.n(interest)} - ${f.n(p)}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Add the month\'s interest to the balance, then subtract the payment.', 'Ajoute l\'intérêt du mois au solde, puis soustrais le paiement.'),
    };
  }
  const ans = r6(p - interest);
  return {
    prompt: bi((f) => f.t(`${intro(f)} How much of the first payment goes to paying down the principal, in dollars?`, `${intro(f)} Quelle part du premier paiement sert à rembourser le capital, en dollars ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[interest, t('That is the interest part of the payment. The rest pays down the principal.', 'C\'est la part d\'intérêt du paiement. Le reste rembourse le capital.'), 1], [p, t('Part of the payment covers the interest first.', 'Une partie du paiement couvre d\'abord l\'intérêt.'), 1], [r6(p + interest), t('Subtract the interest from the payment.', 'Soustrais l\'intérêt du paiement.'), 1]]),
    steps: [bi((f) => f.t(`Interest for the first month: ${f.m(`${f.n(P)} \\times ${f.n(i / 100)}`)} = ${dollars(f, interest)}.`, `Intérêt du premier mois : ${f.m(`${f.n(P)} \\times ${f.n(i / 100)}`)} = ${dollars(f, interest)}.`)), bi((f) => f.t(`Principal paid: ${f.m(`${f.n(p)} - ${f.n(interest)}`)} = ${dollars(f, ans)}.`, `Capital remboursé : ${f.m(`${f.n(p)} - ${f.n(interest)}`)} = ${dollars(f, ans)}.`))],
    nudge: t('Find the interest for the month, then subtract it from the payment.', 'Trouve l\'intérêt du mois, puis soustrais-le du paiement.'),
  };
});

/** MAP4C.B2: owning against renting accommodation */
export const housing11 = (id: string): Generator => numGen(id, (tier, r) => {
  const rent = randInt(r, 8, 20) * 100, rentIns = randInt(r, 3, 8) * 50, pay = randInt(r, 7, 18) * 100, tax = randInt(r, 4, 10) * 500, ins = randInt(r, 4, 12) * 100, value = randInt(r, 4, 10) * 50000, maint = value / 100;
  const rentYear = rent * 12 + rentIns, ownYear = pay * 12 + tax + ins + maint;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A tenant pays ${dollars(f, rent)} rent each month and ${dollars(f, rentIns)} a year for tenant insurance. What is the total yearly cost of renting, in dollars?`, `Un locataire paie ${dollars(f, rent)} de loyer par mois et ${dollars(f, rentIns)} par année d'assurance locataire. Quel est le coût annuel total de la location, en dollars ?`)),
      answer: rentYear, category: 'AP',
      wrong: wr(rentYear, [[rent + rentIns, t('Rent is paid every month: multiply it by 12.', 'Le loyer est payé chaque mois : multiplie-le par 12.'), 0], [rent * 12, t('Add the yearly insurance as well.', 'Ajoute aussi l\'assurance annuelle.'), 1], [(rent + rentIns) * 12, t('The insurance is a yearly amount, not a monthly one. Do not multiply it by 12.', 'L\'assurance est un montant annuel, pas mensuel. Ne la multiplie pas par 12.'), 0]]),
      steps: [bi((f) => f.t(`Rent for the year: ${f.m(`${f.n(rent)} \\times 12`)} = ${dollars(f, rent * 12)}.`, `Loyer pour l'année : ${f.m(`${f.n(rent)} \\times 12`)} = ${dollars(f, rent * 12)}.`)), bi((f) => f.t(`Total: ${f.m(`${f.n(rent * 12)} + ${f.n(rentIns)}`)} = ${dollars(f, rentYear)}.`, `Total : ${f.m(`${f.n(rent * 12)} + ${f.n(rentIns)}`)} = ${dollars(f, rentYear)}.`))],
      nudge: t('Change the monthly rent to a yearly amount, then add the yearly insurance.', 'Convertis le loyer mensuel en montant annuel, puis ajoute l\'assurance annuelle.'),
    };
  }
  const ownText = (f: F): string => f.t(`An owner pays ${dollars(f, pay)} a month on the mortgage, ${dollars(f, tax)} a year in property tax, ${dollars(f, ins)} a year for home insurance, and maintenance of ${f.m('1\\%')} of the home's value of ${dollars(f, value)} each year.`, `Un propriétaire paie ${dollars(f, pay)} par mois pour l'hypothèque, ${dollars(f, tax)} par année de taxes foncières, ${dollars(f, ins)} par année d'assurance habitation, et un entretien de ${f.m('1\\%')} de la valeur de ${dollars(f, value)} de la maison chaque année.`);
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`${ownText(f)} What is the total yearly cost of owning, in dollars?`, `${ownText(f)} Quel est le coût annuel total de la propriété, en dollars ?`)),
      answer: ownYear, category: 'AP',
      wrong: wr(ownYear, [[pay + tax + ins + maint, t('The mortgage payment is monthly: multiply it by 12.', 'Le paiement hypothécaire est mensuel : multiplie-le par 12.'), 0], [pay * 12 + tax + ins, t('Include the yearly maintenance, 1% of the home\'s value.', 'Inclus l\'entretien annuel, 1 % de la valeur de la maison.'), 1], [pay * 12 + tax + ins + value, t('Maintenance is 1% of the value, not all of it.', 'L\'entretien est 1 % de la valeur, pas toute la valeur.'), 0]]),
      steps: [bi((f) => f.t(`Mortgage for the year: ${f.m(`${f.n(pay)} \\times 12`)} = ${dollars(f, pay * 12)}. Maintenance: ${f.m(`${f.n(value)} \\times 0.01`)} = ${dollars(f, maint)}.`, `Hypothèque pour l'année : ${f.m(`${f.n(pay)} \\times 12`)} = ${dollars(f, pay * 12)}. Entretien : ${f.m(`${f.n(value)} \\times 0.01`)} = ${dollars(f, maint)}.`)), bi((f) => f.t(`Total: ${f.m(`${f.n(pay * 12)} + ${f.n(tax)} + ${f.n(ins)} + ${f.n(maint)}`)} = ${dollars(f, ownYear)}.`, `Total : ${f.m(`${f.n(pay * 12)} + ${f.n(tax)} + ${f.n(ins)} + ${f.n(maint)}`)} = ${dollars(f, ownYear)}.`))],
      nudge: t('Change the mortgage to a yearly amount, find the maintenance, then add everything.', 'Convertis l\'hypothèque en montant annuel, trouve l\'entretien, puis additionne tout.'),
    };
  }
  const ans = ownYear - rentYear;
  return {
    prompt: bi((f) => f.t(`${ownText(f)} A tenant in a similar home pays ${dollars(f, rent)} rent a month and ${dollars(f, rentIns)} a year for insurance. How many dollars more a year does owning cost than renting?`, `${ownText(f)} Un locataire dans une maison semblable paie ${dollars(f, rent)} de loyer par mois et ${dollars(f, rentIns)} par année d'assurance. Combien de dollars de plus par année la propriété coûte-t-elle que la location ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[ownYear, t('That is the cost of owning only. Subtract the cost of renting.', 'C\'est seulement le coût de la propriété. Soustrais le coût de la location.'), 1], [rentYear - ownYear, t('Subtract the cost of renting from the cost of owning, not the other way round.', 'Soustrais le coût de la location du coût de la propriété, pas l\'inverse.'), 1], [ownYear + rentYear, t('Subtract the two yearly costs to compare them.', 'Soustrais les deux coûts annuels pour les comparer.'), 1]]),
    steps: [bi((f) => f.t(`Owning: ${dollars(f, ownYear)} a year. Renting: ${f.m(`${f.n(rent)} \\times 12 + ${f.n(rentIns)}`)} = ${dollars(f, rentYear)} a year.`, `Propriété : ${dollars(f, ownYear)} par année. Location : ${f.m(`${f.n(rent)} \\times 12 + ${f.n(rentIns)}`)} = ${dollars(f, rentYear)} par année.`)), bi((f) => f.t(`The difference is ${dollars(f, ans)}.`, `La différence est de ${dollars(f, ans)}.`))],
    nudge: t('Find the yearly cost of owning and of renting, then subtract.', 'Trouve le coût annuel de la propriété et de la location, puis soustrais.'),
  };
});

/** MAP4C.C2: optimal dimensions of rectangles */
export const optimal11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const P = randInt(r, 3, 25) * 4, ans = (P / 4) ** 2;
    return {
      prompt: bi((f) => f.t(`A rectangular garden is fenced with ${f.N(P)} m of fence on all four sides. What is the greatest area it can have, in m²?`, `Un jardin rectangulaire est clôturé avec ${f.N(P)} m de clôture sur les quatre côtés. Quelle est la plus grande aire possible, en m² ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[(P / 2) ** 2 / 2, t('For a fixed perimeter the area is greatest when the rectangle is a square.', 'Pour un périmètre fixe, l\'aire est la plus grande quand le rectangle est un carré.'), 0], [P / 4, t('That is the side of the square. Square it to get the area.', 'C\'est le côté du carré. Élève-le au carré pour obtenir l\'aire.'), 1], [P * P, t('Each side of the square is the perimeter divided by 4. Square that.', 'Chaque côté du carré est le périmètre divisé par 4. Élève-le au carré.'), 0]]),
      steps: [bi((f) => f.t(`The greatest area is a square. Each side is ${f.m(`${f.n(P)} \\div 4`)} = ${f.N(P / 4)} m.`, `La plus grande aire est celle d'un carré. Chaque côté mesure ${f.m(`${f.n(P)} \\div 4`)} = ${f.N(P / 4)} m.`)), bi((f) => f.t(`Area: ${f.m(`${f.n(P / 4)}^{2}`)} = ${f.N(ans)} m².`, `Aire : ${f.m(`${f.n(P / 4)}^{2}`)} = ${f.N(ans)} m².`))],
      nudge: t('For a fixed perimeter, a square has the greatest area.', 'Pour un périmètre fixe, un carré a la plus grande aire.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 2, 20), P = 4 * k, ans = 2 * k * k;
    return {
      prompt: bi((f) => f.t(`A rectangular pen uses a barn wall for one side, so only three sides need fence. There is ${f.N(P)} m of fence. What is the greatest area of the pen, in m²?`, `Un enclos rectangulaire utilise le mur d'une grange pour un côté : seuls trois côtés ont besoin de clôture. Il y a ${f.N(P)} m de clôture. Quelle est la plus grande aire de l'enclos, en m² ?`)),
      answer: ans, category: 'TH',
      wrong: wr(ans, [[k * k, t('With a wall, the side along the wall can be longer. The best shape is twice as long as it is wide.', 'Avec un mur, le côté le long du mur peut être plus long. La meilleure forme est deux fois plus longue que large.'), 0], [4 * k * k, t('Check the fence: two widths and one length use all of it.', 'Vérifie la clôture : deux largeurs et une longueur l\'utilisent en entier.'), 0], [k * 3 * k, t('The fence covers two widths and one length. The best length is twice the width.', 'La clôture couvre deux largeurs et une longueur. La meilleure longueur est le double de la largeur.'), 0]]),
      steps: [bi((f) => f.t(`With width w, the length is ${f.m(`${f.n(P)} - 2w`)}. The area is greatest when the length is twice the width: ${f.m(`w = ${f.n(P)} \\div 4`)} = ${f.N(k)} m and length ${f.N(2 * k)} m.`, `Avec une largeur w, la longueur est ${f.m(`${f.n(P)} - 2w`)}. L'aire est la plus grande quand la longueur est le double de la largeur : ${f.m(`w = ${f.n(P)} \\div 4`)} = ${f.N(k)} m et longueur ${f.N(2 * k)} m.`)), bi((f) => f.t(`Area: ${f.m(`${f.n(k)} \\times ${f.n(2 * k)}`)} = ${f.N(ans)} m².`, `Aire : ${f.m(`${f.n(k)} \\times ${f.n(2 * k)}`)} = ${f.N(ans)} m².`))],
      nudge: t('With one side on a wall, the best length is twice the width.', 'Avec un côté sur un mur, la meilleure longueur est le double de la largeur.'),
    };
  }
  const s = randInt(r, 4, 20), A = s * s, ans = 4 * s;
  return {
    prompt: bi((f) => f.t(`A rectangular play area must have an area of ${f.N(A)} m². What is the least amount of fence, in m, needed to go around all four sides?`, `Une aire de jeu rectangulaire doit avoir une aire de ${f.N(A)} m². Quelle est la plus petite longueur de clôture, en m, nécessaire pour faire le tour des quatre côtés ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[2 * (A + 1), t('A long thin rectangle uses much more fence. The least fence is for a square.', 'Un long rectangle étroit utilise beaucoup plus de clôture. La plus petite clôture est celle d\'un carré.'), 0], [s, t('That is one side of the square. The fence goes around all four sides.', 'C\'est un côté du carré. La clôture fait le tour des quatre côtés.'), 1], [2 * s, t('The fence goes around all four sides: multiply the side by 4.', 'La clôture fait le tour des quatre côtés : multiplie le côté par 4.'), 1]]),
    steps: [bi((f) => f.t(`For a given area the perimeter is least for a square. Each side is ${f.m(`\\sqrt{${f.n(A)}}`)} = ${f.N(s)} m.`, `Pour une aire donnée, le périmètre est le plus petit pour un carré. Chaque côté mesure ${f.m(`\\sqrt{${f.n(A)}}`)} = ${f.N(s)} m.`)), bi((f) => f.t(`Fence: ${f.m(`4 \\times ${f.n(s)}`)} = ${f.N(ans)} m.`, `Clôture : ${f.m(`4 \\times ${f.n(s)}`)} = ${f.N(ans)} m.`))],
    nudge: t('For a fixed area, a square needs the least fence.', 'Pour une aire fixe, un carré demande le moins de clôture.'),
  };
});
