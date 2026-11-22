// Grade 12 (MEL4E) new skills: mean and median, chance (games, raffles, insurance), income tax, scale drawings and proportional
// reasoning. The course also reuses generators written for MTH1W, MPM2D, MDM4U and MAP4C. Numbers are chosen so every answer is exact.
import { pick, randInt, shuffle } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const dollars = (f: F, x: number): string => `${f.N(r6(x))} ${f.t('dollars', 'dollars')}`;
const list = (f: F, xs: number[]): string => xs.map((x) => f.N(x)).join(', ');

/** MEL4E.A1: mean, median, and the mark needed for a target average */
export const summary11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const mean = randInt(r, 20, 80), ds = [randInt(r, -9, 9), randInt(r, -9, 9), randInt(r, -9, 9), randInt(r, -9, 9)];
    const xs = [...ds, -ds.reduce((a, b) => a + b, 0)].map((d) => mean + d), shown = shuffle(r, xs), sum = xs.reduce((a, b) => a + b, 0), sorted = [...xs].sort((a, b) => a - b);
    return {
      prompt: bi((f) => f.t(`Find the mean of these five values: ${list(f, shown)}.`, `Trouve la moyenne de ces cinq valeurs : ${list(f, shown)}.`)),
      answer: mean, category: 'KU',
      wrong: wr(mean, [[sum, t('That is the sum. Divide it by the number of values.', 'C\'est la somme. Divise-la par le nombre de valeurs.'), 1], [sorted[2]!, t('That is the middle value (the median). The mean is the sum divided by the number of values.', 'C\'est la valeur du milieu (la médiane). La moyenne est la somme divisée par le nombre de valeurs.'), 1], [r6(sum / 4), t('Divide by the number of values, which is five.', 'Divise par le nombre de valeurs, soit cinq.'), 1]]),
      steps: [bi((f) => f.t(`The sum is ${f.m(shown.map((x) => f.n(x)).join(' + '))} = ${f.N(sum)}.`, `La somme est ${f.m(shown.map((x) => f.n(x)).join(' + '))} = ${f.N(sum)}.`)), bi((f) => f.t(`Mean: ${f.m(`${f.n(sum)} \\div 5`)} = ${f.N(mean)}.`, `Moyenne : ${f.m(`${f.n(sum)} \\div 5`)} = ${f.N(mean)}.`))],
      nudge: t('Mean = sum of the values ÷ number of values.', 'Moyenne = somme des valeurs ÷ nombre de valeurs.'),
    };
  }
  if (tier === 2) {
    const n = pick(r, [6, 7, 8]), xs = Array.from({ length: n }, () => randInt(r, 5, 95)), sorted = [...xs].sort((a, b) => a - b);
    const med = n % 2 === 1 ? sorted[(n - 1) / 2]! : (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2;
    const unsortedMid = n % 2 === 1 ? xs[(n - 1) / 2]! : (xs[n / 2 - 1]! + xs[n / 2]!) / 2;
    return {
      prompt: bi((f) => f.t(`Find the median of these ${f.N(n)} values: ${list(f, xs)}.`, `Trouve la médiane de ces ${f.N(n)} valeurs : ${list(f, xs)}.`)),
      answer: med, category: 'KU',
      wrong: wr(med, [[unsortedMid, t('Put the values in order first, then take the middle one.', 'Range d\'abord les valeurs en ordre, puis prends celle du milieu.'), 0], [r6(xs.reduce((a, b) => a + b, 0) / n), t('That is the mean. The median is the middle value of the ordered list.', 'C\'est la moyenne. La médiane est la valeur du milieu de la liste ordonnée.'), 1], [n % 2 === 0 ? sorted[n / 2]! : sorted[(n + 1) / 2]!, t(n % 2 === 0 ? 'With an even number of values, the median is halfway between the two middle values.' : 'Count in from both ends to find the exact middle value.', n % 2 === 0 ? 'Avec un nombre pair de valeurs, la médiane est à mi-chemin entre les deux valeurs du milieu.' : 'Compte à partir des deux extrémités pour trouver la valeur exacte du milieu.'), 1]]),
      steps: [bi((f) => f.t(`In order: ${list(f, sorted)}.`, `En ordre : ${list(f, sorted)}.`)), bi((f) => f.t(`The median is ${f.N(med)}.`, `La médiane est ${f.N(med)}.`))],
      nudge: t('Put the values in order, then find the middle (or the mean of the two middle values).', 'Range les valeurs en ordre, puis trouve celle du milieu (ou la moyenne des deux valeurs du milieu).'),
    };
  }
  let marks: number[] = [], target = 0, need = 0;
  do {
    marks = Array.from({ length: 4 }, () => randInt(r, 55, 95)); target = randInt(r, 70, 85); need = 5 * target - marks.reduce((a, b) => a + b, 0);
  } while (need < 40 || need > 100);
  const sum = marks.reduce((a, b) => a + b, 0);
  return {
    prompt: bi((f) => f.t(`Your first four test marks are ${list(f, marks)}. What mark do you need on the fifth test to have an average of ${f.N(target)}?`, `Tes quatre premières notes sont ${list(f, marks)}. Quelle note te faut-il au cinquième test pour avoir une moyenne de ${f.N(target)} ?`)),
    answer: need, category: 'TH',
    wrong: wr(need, [[target, t('The fifth mark has to make up for the others being above or below the target.', 'La cinquième note doit compenser les autres qui sont au-dessus ou en dessous de la cible.'), 1], [r6(4 * target - sum), t('There are five tests in the average, so the total needed is 5 times the target.', 'Il y a cinq tests dans la moyenne : le total nécessaire est 5 fois la cible.'), 0], [r6(sum / 4), t('That is the average of the first four. Find the total needed for five tests, then subtract.', 'C\'est la moyenne des quatre premiers. Trouve le total nécessaire pour cinq tests, puis soustrais.'), 0]]),
    steps: [bi((f) => f.t(`The total needed for five tests is ${f.m(`5 \\times ${f.n(target)}`)} = ${f.N(5 * target)}. The first four add up to ${f.N(sum)}.`, `Le total nécessaire pour cinq tests est ${f.m(`5 \\times ${f.n(target)}`)} = ${f.N(5 * target)}. Les quatre premiers totalisent ${f.N(sum)}.`)), bi((f) => f.t(`The fifth mark is ${f.m(`${f.n(5 * target)} - ${f.n(sum)}`)} = ${f.N(need)}.`, `La cinquième note est ${f.m(`${f.n(5 * target)} - ${f.n(sum)}`)} = ${f.N(need)}.`))],
    nudge: t('Find the total needed for all five tests, then subtract the first four.', 'Trouve le total nécessaire pour les cinq tests, puis soustrais les quatre premiers.'),
  };
});

/** MEL4E.A2: chance in games, raffles and insurance */
export const chance11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const total = pick(r, [20, 25, 50]), red = randInt(r, 2, total / 2), blue = randInt(r, 1, total - red - 1), green = total - red - blue, ans = (red * 100) / total;
    return {
      prompt: bi((f) => f.t(`A bag has ${f.N(red)} red, ${f.N(blue)} blue and ${f.N(green)} green marbles. One marble is picked at random. What is the probability, as a percent, that it is red?`, `Un sac contient ${f.N(red)} billes rouges, ${f.N(blue)} bleues et ${f.N(green)} vertes. Une bille est choisie au hasard. Quelle est la probabilité, en pourcentage, qu'elle soit rouge ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6((red * 100) / (blue + green)), t('Compare the red marbles with all the marbles, not only the others.', 'Compare les billes rouges à toutes les billes, pas seulement aux autres.'), 1], [red, t('Divide by the total number of marbles and change to a percent.', 'Divise par le nombre total de billes et convertis en pourcentage.'), 0], [r6(red / total), t('That is the probability as a decimal. Multiply by 100 for a percent.', 'C\'est la probabilité en décimale. Multiplie par 100 pour avoir un pourcentage.'), 1]]),
      steps: [bi((f) => f.t(`There are ${f.m(`${f.n(red)} + ${f.n(blue)} + ${f.n(green)}`)} = ${f.N(total)} marbles in all.`, `Il y a ${f.m(`${f.n(red)} + ${f.n(blue)} + ${f.n(green)}`)} = ${f.N(total)} billes en tout.`)), bi((f) => f.t(`${f.m(`${f.n(red)} \\div ${f.n(total)} \\times 100`)} = ${f.N(ans)}%.`, `${f.m(`${f.n(red)} \\div ${f.n(total)} \\times 100`)} = ${f.N(ans)} %.`))],
      nudge: t('Probability = favourable outcomes ÷ all outcomes. Multiply by 100 for a percent.', 'Probabilité = résultats favorables ÷ tous les résultats. Multiplie par 100 pour un pourcentage.'),
    };
  }
  if (tier === 2) {
    const n = pick(r, [100, 200, 250, 500]), k = pick(r, [0.5, 1, 1.5, 2, 2.5]), prize = n * k, cost = pick(r, [2, 3, 5]), ans = r6(k - cost);
    return {
      prompt: bi((f) => f.t(`A raffle sells ${f.N(n)} tickets at ${dollars(f, cost)} each, and there is one prize of ${dollars(f, prize)}. What is the expected value of buying one ticket, in dollars? (A negative number means you expect to lose money.)`, `Une tombola vend ${f.N(n)} billets à ${dollars(f, cost)} chacun, et il y a un seul prix de ${dollars(f, prize)}. Quelle est la valeur espérée de l'achat d'un billet, en dollars ? (Un nombre négatif signifie qu'on s'attend à perdre de l'argent.)`)),
      answer: ans, category: 'TH',
      wrong: wr(ans, [[k, t('That is the expected prize only. Subtract the cost of the ticket.', 'C\'est seulement le prix espéré. Soustrais le coût du billet.'), 1], [r6(prize - cost), t('You only win the prize with probability 1 out of the number of tickets.', 'Tu ne gagnes le prix qu\'avec une probabilité de 1 sur le nombre de billets.'), 0], [r6(cost - k), t('Expected value = expected winnings − cost, so a loss is negative.', 'Valeur espérée = gains espérés − coût : une perte est négative.'), 1]]),
      steps: [bi((f) => f.t(`Expected prize: ${f.m(`\\frac{1}{${f.n(n)}} \\times ${f.n(prize)}`)} = ${dollars(f, k)}.`, `Prix espéré : ${f.m(`\\frac{1}{${f.n(n)}} \\times ${f.n(prize)}`)} = ${dollars(f, k)}.`)), bi((f) => f.t(`Expected value: ${f.m(`${f.n(k)} - ${f.n(cost)}`)} = ${f.N(ans)} dollars.`, `Valeur espérée : ${f.m(`${f.n(k)} - ${f.n(cost)}`)} = ${f.N(ans)} dollars.`))],
      nudge: t('Find the average prize per ticket, then subtract what the ticket costs.', 'Trouve le prix moyen par billet, puis soustrais le coût du billet.'),
    };
  }
  const N = pick(r, [50, 100, 200]), k = randInt(r, 1, 8) * 5, claim = N * k;
  return {
    prompt: bi((f) => f.t(`An insurance company expects 1 in ${f.N(N)} customers to make a claim of ${dollars(f, claim)} in a year. What is the least yearly premium, in dollars, that lets the company break even on each customer?`, `Une compagnie d'assurance s'attend à ce que 1 client sur ${f.N(N)} fasse une réclamation de ${dollars(f, claim)} dans une année. Quelle est la plus petite prime annuelle, en dollars, qui permet à la compagnie de couvrir ses coûts pour chaque client ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[claim, t('Only 1 customer in the group makes a claim. Share the claim among all the customers.', 'Seulement 1 client du groupe fait une réclamation. Répartis la réclamation entre tous les clients.'), 0], [N, t('That is the number of customers. Divide the claim by it.', 'C\'est le nombre de clients. Divise la réclamation par ce nombre.'), 0], [r6(claim * N), t('Divide the claim by the number of customers, do not multiply.', 'Divise la réclamation par le nombre de clients, ne multiplie pas.'), 0]]),
    steps: [bi((f) => f.t(`Expected payout per customer: ${f.m(`\\frac{1}{${f.n(N)}} \\times ${f.n(claim)}`)} = ${dollars(f, k)}.`, `Versement espéré par client : ${f.m(`\\frac{1}{${f.n(N)}} \\times ${f.n(claim)}`)} = ${dollars(f, k)}.`)), bi((f) => f.t(`The premium must be at least ${dollars(f, k)}.`, `La prime doit être d'au moins ${dollars(f, k)}.`))],
    nudge: t('Share the expected claim over all the customers.', 'Répartis la réclamation espérée entre tous les clients.'),
  };
});

/** MEL4E.B3: filing an income tax return */
export const tax11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const income = randInt(r, 30, 80) * 1000, rrsp = randInt(r, 1, 6) * 500, dues = randInt(r, 2, 8) * 100, ans = income - rrsp - dues;
    return {
      prompt: bi((f) => f.t(`A person's total income is ${dollars(f, income)}. They deduct ${dollars(f, rrsp)} for an RRSP contribution and ${dollars(f, dues)} for union dues. What is their taxable income, in dollars?`, `Le revenu total d'une personne est de ${dollars(f, income)}. Elle déduit ${dollars(f, rrsp)} pour une cotisation à un REER et ${dollars(f, dues)} de cotisations syndicales. Quel est son revenu imposable, en dollars ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[income - rrsp, t('Subtract both deductions.', 'Soustrais les deux déductions.'), 1], [income + rrsp + dues, t('Deductions lower the income that is taxed: subtract them.', 'Les déductions réduisent le revenu imposé : soustrais-les.'), 1], [rrsp + dues, t('That is the total of the deductions. Subtract it from the total income.', 'C\'est le total des déductions. Soustrais-le du revenu total.'), 1]]),
      steps: [bi((f) => f.t(`Total deductions: ${f.m(`${f.n(rrsp)} + ${f.n(dues)}`)} = ${dollars(f, rrsp + dues)}.`, `Total des déductions : ${f.m(`${f.n(rrsp)} + ${f.n(dues)}`)} = ${dollars(f, rrsp + dues)}.`)), bi((f) => f.t(`Taxable income: ${f.m(`${f.n(income)} - ${f.n(rrsp + dues)}`)} = ${dollars(f, ans)}.`, `Revenu imposable : ${f.m(`${f.n(income)} - ${f.n(rrsp + dues)}`)} = ${dollars(f, ans)}.`))],
      nudge: t('Taxable income = total income − deductions.', 'Revenu imposable = revenu total − déductions.'),
    };
  }
  if (tier === 2) {
    const owed = randInt(r, 20, 90) * 100, source = owed + (r() < 0.5 ? 1 : -1) * randInt(r, 1, 9) * 50, ans = source - owed;
    return {
      prompt: bi((f) => f.t(`Income tax of ${dollars(f, source)} was deducted from a person's pay during the year. Their tax return shows that they owe ${dollars(f, owed)} in tax. What is their refund, in dollars? (If they still owe tax, give a negative number.)`, `De l'impôt de ${dollars(f, source)} a été retenu sur la paie d'une personne durant l'année. Sa déclaration de revenus montre qu'elle doit ${dollars(f, owed)} d'impôt. Quel est son remboursement, en dollars ? (Si elle doit encore de l'impôt, donne un nombre négatif.)`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[-ans, t('A refund is the tax deducted minus the tax owed. If more was deducted than owed, you get money back (positive).', 'Un remboursement est l\'impôt retenu moins l\'impôt dû. Si plus a été retenu que dû, on récupère de l\'argent (positif).'), 0], [source + owed, t('Compare the two amounts by subtracting.', 'Compare les deux montants en soustrayant.'), 0], [owed, t('That is the tax owed. The refund is the difference from the tax already deducted.', 'C\'est l\'impôt dû. Le remboursement est la différence avec l\'impôt déjà retenu.'), 0]]),
      steps: [bi((f) => f.t(`Refund = tax deducted − tax owed = ${f.m(`${f.n(source)} - ${f.n(owed)}`)}.`, `Remboursement = impôt retenu − impôt dû = ${f.m(`${f.n(source)} - ${f.n(owed)}`)}.`)), bi((f) => f.t(`${ans >= 0 ? 'The refund is' : 'The person still owes'} ${dollars(f, Math.abs(ans))}.`, `${ans >= 0 ? 'Le remboursement est de' : 'La personne doit encore'} ${dollars(f, Math.abs(ans))}.`))],
      nudge: t('Subtract the tax owed from the tax already deducted.', 'Soustrais l\'impôt dû de l\'impôt déjà retenu.'),
    };
  }
  const ti = randInt(r, 55, 90) * 1000, credit = randInt(r, 10, 30) * 100, ans = r6(0.15 * 50000 + 0.2 * (ti - 50000) - credit);
  return {
    prompt: bi((f) => f.t(`Tax is ${f.m('15\\%')} of the first ${dollars(f, 50000)} of taxable income and ${f.m('20\\%')} of any income above that, less a tax credit of ${dollars(f, credit)}. What is the tax on a taxable income of ${dollars(f, ti)}, in dollars?`, `L'impôt est de ${f.m('15\\%')} des premiers ${dollars(f, 50000)} de revenu imposable et de ${f.m('20\\%')} du revenu au-delà, moins un crédit d'impôt de ${dollars(f, credit)}. Quel est l'impôt sur un revenu imposable de ${dollars(f, ti)}, en dollars ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(0.2 * ti - credit), t('Only the income above the first bracket is taxed at the higher rate.', 'Seul le revenu au-delà de la première tranche est imposé au taux plus élevé.'), 1], [r6(0.15 * 50000 + 0.2 * (ti - 50000)), t('Subtract the tax credit from the tax.', 'Soustrais le crédit d\'impôt de l\'impôt.'), 1], [r6(0.15 * ti - credit), t('The income above the first bracket is taxed at the higher rate.', 'Le revenu au-delà de la première tranche est imposé au taux plus élevé.'), 1]]),
    steps: [bi((f) => f.t(`First bracket: ${f.m(`50\\,000 \\times 0.15`)} = ${dollars(f, 7500)}. Above it: ${f.m(`${f.n(ti - 50000)} \\times 0.20`)} = ${dollars(f, 0.2 * (ti - 50000))}.`, `Première tranche : ${f.m(`50\\,000 \\times 0.15`)} = ${dollars(f, 7500)}. Au-delà : ${f.m(`${f.n(ti - 50000)} \\times 0.20`)} = ${dollars(f, 0.2 * (ti - 50000))}.`)), bi((f) => f.t(`Tax: ${f.m(`${f.n(7500)} + ${f.n(0.2 * (ti - 50000))} - ${f.n(credit)}`)} = ${dollars(f, ans)}.`, `Impôt : ${f.m(`${f.n(7500)} + ${f.n(0.2 * (ti - 50000))} - ${f.n(credit)}`)} = ${dollars(f, ans)}.`))],
    nudge: t('Tax each bracket at its own rate, add them, then subtract the credit.', 'Impose chaque tranche à son taux, additionne-les, puis soustrais le crédit.'),
  };
});

/** MEL4E.C2: scale drawings and a household improvement budget */
export const scale11 = (id: string): Generator => numGen(id, (tier, r) => {
  const k = pick(r, [0.5, 1, 2, 5]);
  if (tier === 1) {
    const d = randInt(r, 3, 20), ans = r6(d * k);
    return {
      prompt: bi((f) => f.t(`On a scale drawing, ${f.N(1)} cm represents ${f.N(k)} m. A wall measures ${f.N(d)} cm on the drawing. How long is the real wall, in m?`, `Sur un dessin à l'échelle, ${f.N(1)} cm représente ${f.N(k)} m. Un mur mesure ${f.N(d)} cm sur le dessin. Quelle est la longueur du vrai mur, en m ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(d / k), t('Multiply the drawing length by the number of metres each centimetre stands for.', 'Multiplie la longueur sur le dessin par le nombre de mètres que représente chaque centimètre.'), 0], [r6(d + k), t('Each centimetre stands for k metres: multiply, do not add.', 'Chaque centimètre représente k mètres : multiplie, n\'additionne pas.'), 0], [r6(d * k * 100), t('The scale is already in metres, so no further conversion is needed.', 'L\'échelle est déjà en mètres : aucune autre conversion n\'est nécessaire.'), 0]]),
      steps: [bi((f) => f.t(`Real length = ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(ans)} m.`, `Longueur réelle = ${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(ans)} m.`)), bi((f) => f.t(`The wall is ${f.N(ans)} m long.`, `Le mur mesure ${f.N(ans)} m de long.`))],
      nudge: t('Multiply the length on the drawing by the metres each centimetre stands for.', 'Multiplie la longueur sur le dessin par les mètres que représente chaque centimètre.'),
    };
  }
  if (tier === 2) {
    const real = k * randInt(r, 4, 20), ans = real / k;
    return {
      prompt: bi((f) => f.t(`A room is ${f.N(real)} m long. On a scale drawing, ${f.N(1)} cm represents ${f.N(k)} m. How long is the room on the drawing, in cm?`, `Une pièce mesure ${f.N(real)} m de long. Sur un dessin à l'échelle, ${f.N(1)} cm représente ${f.N(k)} m. Quelle est la longueur de la pièce sur le dessin, en cm ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(real * k), t('To go from real size to the drawing, divide by the metres per centimetre.', 'Pour passer de la taille réelle au dessin, divise par les mètres par centimètre.'), 0], [real - k, t('Divide the real length by the metres each centimetre stands for.', 'Divise la longueur réelle par les mètres que représente chaque centimètre.'), 0], [r6(real / k / 100), t('The scale is already in metres, so no further conversion is needed.', 'L\'échelle est déjà en mètres : aucune autre conversion n\'est nécessaire.'), 0]]),
      steps: [bi((f) => f.t(`Drawing length = ${f.m(`${f.n(real)} \\div ${f.n(k)}`)} = ${f.N(ans)} cm.`, `Longueur sur le dessin = ${f.m(`${f.n(real)} \\div ${f.n(k)}`)} = ${f.N(ans)} cm.`)), bi((f) => f.t(`The room is ${f.N(ans)} cm long on the drawing.`, `La pièce mesure ${f.N(ans)} cm de long sur le dessin.`))],
      nudge: t('Divide the real length by the metres each centimetre stands for.', 'Divise la longueur réelle par les mètres que représente chaque centimètre.'),
    };
  }
  const L = randInt(r, 3, 9), W = randInt(r, 3, 9), c = randInt(r, 4, 12) * 5, ans = r6(L * W * 1.1 * c);
  return {
    prompt: bi((f) => f.t(`A floor is ${f.N(L)} m by ${f.N(W)} m. Tile costs ${dollars(f, c)} per m², and ${f.m('10\\%')} extra must be bought for cuts and waste. What is the total cost of the tile, in dollars?`, `Un plancher mesure ${f.N(L)} m sur ${f.N(W)} m. Les carreaux coûtent ${dollars(f, c)} le m², et ${f.m('10\\%')} de plus doit être acheté pour les coupes et les pertes. Quel est le coût total des carreaux, en dollars ?`)),
    answer: ans, category: 'AP', tolerance: 0.006,
    wrong: wr(ans, [[r6(L * W * c), t('Add the 10% extra: multiply the area by 1.1.', 'Ajoute les 10 % de plus : multiplie l\'aire par 1,1.'), 1], [r6(2 * (L + W) * 1.1 * c), t('Cost depends on the area, not the perimeter.', 'Le coût dépend de l\'aire, pas du périmètre.'), 0], [r6(L * W * c + 10), t('The extra is 10% of the tile, not 10 dollars.', 'Le surplus est de 10 % des carreaux, pas 10 dollars.'), 1]]),
    steps: [bi((f) => f.t(`Area: ${f.m(`${f.n(L)} \\times ${f.n(W)}`)} = ${f.N(L * W)} m². With the extra: ${f.m(`${f.n(L * W)} \\times 1.1`)} = ${f.N(r6(L * W * 1.1))} m².`, `Aire : ${f.m(`${f.n(L)} \\times ${f.n(W)}`)} = ${f.N(L * W)} m². Avec le surplus : ${f.m(`${f.n(L * W)} \\times 1.1`)} = ${f.N(r6(L * W * 1.1))} m².`)), bi((f) => f.t(`Cost: ${f.m(`${f.n(r6(L * W * 1.1))} \\times ${f.n(c)}`)} = ${dollars(f, ans)}.`, `Coût : ${f.m(`${f.n(r6(L * W * 1.1))} \\times ${f.n(c)}`)} = ${dollars(f, ans)}.`))],
    nudge: t('Find the area, add 10%, then multiply by the price per square metre.', 'Trouve l\'aire, ajoute 10 %, puis multiplie par le prix au mètre carré.'),
  };
});

/** MEL4E.C3: proportional reasoning, direct and inverse */
export const prop11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const base = pick(r, [4, 6]), a = randInt(r, 2, 6), n = randInt(r, 8, 30), ans = r6((a * n) / base);
    return {
      prompt: bi((f) => f.t(`A recipe for ${f.N(base)} people uses ${f.N(a)} cups of flour. How many cups of flour are needed for ${f.N(n)} people?`, `Une recette pour ${f.N(base)} personnes utilise ${f.N(a)} tasses de farine. Combien de tasses de farine faut-il pour ${f.N(n)} personnes ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6((a * base) / n), t('More people need more flour: multiply by the number of people and divide by the original number.', 'Plus de personnes demandent plus de farine : multiplie par le nombre de personnes et divise par le nombre de départ.'), 0], [a + n - base, t('Use a ratio: flour per person times the number of people.', 'Utilise un rapport : farine par personne fois le nombre de personnes.'), 0], [r6(a * n), t('The recipe is for several people. Find the flour for one person first.', 'La recette est pour plusieurs personnes. Trouve d\'abord la farine pour une personne.'), 0]]),
      steps: [bi((f) => f.t(`Flour for one person: ${f.m(`${f.n(a)} \\div ${f.n(base)}`)} = ${f.N(r6(a / base))} cups.`, `Farine pour une personne : ${f.m(`${f.n(a)} \\div ${f.n(base)}`)} = ${f.N(r6(a / base))} tasses.`)), bi((f) => f.t(`For ${f.N(n)} people: ${f.m(`${f.n(r6(a / base))} \\times ${f.n(n)}`)} = ${f.N(ans)} cups.`, `Pour ${f.N(n)} personnes : ${f.m(`${f.n(r6(a / base))} \\times ${f.n(n)}`)} = ${f.N(ans)} tasses.`))],
      nudge: t('Find the amount for one person, then multiply by the number of people.', 'Trouve la quantité pour une personne, puis multiplie par le nombre de personnes.'),
    };
  }
  if (tier === 2) {
    const cover = pick(r, [8, 10, 12]), litres = randInt(r, 2, 5), area = litres * cover, big = cover * randInt(r, 6, 20), ans = big / cover;
    return {
      prompt: bi((f) => f.t(`${f.N(litres)} litres of paint cover ${f.N(area)} m². How many litres are needed to cover ${f.N(big)} m²?`, `${f.N(litres)} litres de peinture couvrent ${f.N(area)} m². Combien de litres faut-il pour couvrir ${f.N(big)} m² ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6((litres * area) / big), t('A bigger area needs more paint. Find the area one litre covers, then divide.', 'Une plus grande aire demande plus de peinture. Trouve l\'aire que couvre un litre, puis divise.'), 0], [litres + big - area, t('Use a rate: the area covered by one litre.', 'Utilise un taux : l\'aire couverte par un litre.'), 0], [r6(big * cover), t('Divide the area by the area one litre covers.', 'Divise l\'aire par l\'aire que couvre un litre.'), 1]]),
      steps: [bi((f) => f.t(`One litre covers ${f.m(`${f.n(area)} \\div ${f.n(litres)}`)} = ${f.N(cover)} m².`, `Un litre couvre ${f.m(`${f.n(area)} \\div ${f.n(litres)}`)} = ${f.N(cover)} m².`)), bi((f) => f.t(`Litres needed: ${f.m(`${f.n(big)} \\div ${f.n(cover)}`)} = ${f.N(ans)}.`, `Litres nécessaires : ${f.m(`${f.n(big)} \\div ${f.n(cover)}`)} = ${f.N(ans)}.`))],
      nudge: t('Find how much area one litre covers, then divide the new area by it.', 'Trouve l\'aire que couvre un litre, puis divise la nouvelle aire par celle-ci.'),
    };
  }
  let w = 3, days = 12, w2 = 4;
  for (let k = 0; k < 200; k++) {
    w = randInt(r, 2, 8); days = randInt(r, 6, 24); const job = w * days, opts: number[] = [];
    for (let x = 2; x <= 12; x++) if (x !== w && job % x === 0) opts.push(x);
    if (opts.length) { w2 = pick(r, opts); break; }
  }
  const job = w * days, ans = job / w2;
  return {
    prompt: bi((f) => f.t(`${f.N(w)} workers can finish a job in ${f.N(days)} days, all working at the same pace. How many days would ${f.N(w2)} workers need for the same job?`, `${f.N(w)} travailleurs peuvent terminer un travail en ${f.N(days)} jours, tous au même rythme. Combien de jours ${f.N(w2)} travailleurs auraient-ils besoin pour le même travail ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6((days * w2) / w), t('More workers means fewer days, not more. The number of worker-days stays the same.', 'Plus de travailleurs signifie moins de jours, pas plus. Le nombre de jours-travailleurs reste le même.'), 0], [days + w - w2, t('Use the total work: workers times days stays the same.', 'Utilise le travail total : travailleurs fois jours reste constant.'), 0], [r6(days / w2), t('Find the total work (workers × days) first, then divide by the new number of workers.', 'Trouve d\'abord le travail total (travailleurs × jours), puis divise par le nouveau nombre de travailleurs.'), 0]]),
    steps: [bi((f) => f.t(`Total work: ${f.m(`${f.n(w)} \\times ${f.n(days)}`)} = ${f.N(job)} worker-days.`, `Travail total : ${f.m(`${f.n(w)} \\times ${f.n(days)}`)} = ${f.N(job)} jours-travailleurs.`)), bi((f) => f.t(`Days: ${f.m(`${f.n(job)} \\div ${f.n(w2)}`)} = ${f.N(ans)}.`, `Jours : ${f.m(`${f.n(job)} \\div ${f.n(w2)}`)} = ${f.N(ans)}.`))],
    nudge: t('The total work stays the same: workers × days. Divide it by the new number of workers.', 'Le travail total reste le même : travailleurs × jours. Divise-le par le nouveau nombre de travailleurs.'),
  };
});
