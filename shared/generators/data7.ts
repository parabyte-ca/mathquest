// Grade 7 Data strand (D): percentages in data, circle graphs, how added or removed data changes the mean, and probability of two events.
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator, Text, WrongAnswer } from '../items/types.js';
import { bi, numGen, r6 } from './dsl.js';
import { build, frac, gcd, t } from './kit.js';

type Wrong = [number, Text, number?][];

/** MS.G7.D1.2.a: organize data using percentages */
export const percentData7 = numGen('MS.G7.D1.2.a', (tier, r) => {
  if (tier === 1) {
    const N = pick(r, [20, 25, 40, 50, 80, 200]);
    const k = randInt(r, 1, N - 1);
    const ans = r6((k * 100) / N);
    return {
      prompt: bi((f) => f.t(`In a survey of ${f.N(N)} students, ${f.N(k)} chose soccer as their favourite sport. What percent chose soccer? Type the number only.`, `Dans un sondage auprès de ${f.N(N)} élèves, ${f.N(k)} ont choisi le soccer comme sport préféré. Quel pourcentage a choisi le soccer ? Écris seulement le nombre.`)),
      answer: ans, category: 'AP',
      wrong: [[r6(k / N), t('That is the decimal. Multiply it by 100 to get the percent.', 'C\'est le nombre décimal. Multiplie-le par 100 pour obtenir le pourcentage.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Write the part over the whole: ${f.m(frac(f.n(k), f.n(N)))}.`, `Écris la partie sur le tout : ${f.m(frac(f.n(k), f.n(N)))}.`)), bi((f) => f.t(`${f.N(k)} ÷ ${f.N(N)} × 100 = ${f.N(ans)}, so ${f.N(ans)}%.`, `${f.N(k)} ÷ ${f.N(N)} × 100 = ${f.N(ans)}, donc ${f.N(ans)} %.`))],
      nudge: t('Divide the number who chose it by the total, then multiply by 100.', 'Divise le nombre de ceux qui l\'ont choisi par le total, puis multiplie par 100.'),
    };
  }
  if (tier === 2) {
    const N = pick(r, [200, 250, 400, 500, 800, 1000]);
    const p = pick(r, [10, 15, 20, 25, 30, 35, 40, 45, 60]);
    const ans = (N * p) / 100;
    return {
      prompt: bi((f) => f.t(`A school has ${f.N(N)} students. ${f.N(p)}% of them walk to school. How many students walk?`, `Une école compte ${f.N(N)} élèves. ${f.N(p)} % d'entre eux vont à l'école à pied. Combien d'élèves y vont à pied ?`)),
      answer: ans, category: 'AP',
      wrong: [[p, t('It looks like the percent was used as the count. The percent is a share of the whole group.', 'Il semble que le pourcentage a été utilisé comme nombre. Le pourcentage est une part du groupe entier.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Change the percent to a decimal: ${f.N(p)}% = ${f.N(p / 100)}.`, `Transforme le pourcentage en nombre décimal : ${f.N(p)} % = ${f.N(p / 100)}.`)), bi((f) => f.t(`${f.N(N)} × ${f.N(p / 100)} = ${f.N(ans)}.`, `${f.N(N)} × ${f.N(p / 100)} = ${f.N(ans)}.`))],
      nudge: t('Find that percent of the total number of students.', 'Trouve ce pourcentage du nombre total d\'élèves.'),
    };
  }
  const N = pick(r, [200, 250, 400, 500]);
  const a = pick(r, [20, 25, 30, 35, 40]);
  const b = pick(r, [10, 15, 20, 25]);
  const rest = 100 - a - b;
  const ans = (N * rest) / 100;
  return {
    prompt: bi((f) => f.t(`Of ${f.N(N)} students, ${f.N(a)}% take the bus and ${f.N(b)}% walk. Everyone else is driven. How many students are driven?`, `Sur ${f.N(N)} élèves, ${f.N(a)} % prennent l'autobus et ${f.N(b)} % marchent. Tous les autres sont conduits en voiture. Combien d'élèves sont conduits ?`)),
    answer: ans, category: 'AP',
    wrong: [[rest, t('That is the percent, not the number of students. Find that percent of the total.', 'C\'est le pourcentage, pas le nombre d\'élèves. Trouve ce pourcentage du total.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`The percents must add to 100%: 100 − ${f.N(a)} − ${f.N(b)} = ${f.N(rest)}%.`, `Les pourcentages doivent totaliser 100 % : 100 − ${f.N(a)} − ${f.N(b)} = ${f.N(rest)} %.`)), bi((f) => f.t(`${f.N(rest)}% of ${f.N(N)} = ${f.N(ans)}.`, `${f.N(rest)} % de ${f.N(N)} = ${f.N(ans)}.`))],
    nudge: t('Find the percent left over first.', 'Trouve d\'abord le pourcentage qui reste.'),
  };
});

/** MS.G7.D1.3.a: circle graphs */
export const circleGraph7 = numGen('MS.G7.D1.3.a', (tier, r) => {
  if (tier === 1) {
    const p = randInt(r, 1, 19) * 5;
    return {
      prompt: bi((f) => f.t(`In a circle graph, one sector shows ${f.N(p)}% of the data. What is the angle of that sector, in degrees?`, `Dans un diagramme circulaire, un secteur représente ${f.N(p)} % des données. Quel est l'angle de ce secteur, en degrés ?`)),
      answer: p * 3.6,
      wrong: [[p, t('It looks like the percent was used as the angle. A full circle is 360°, so 1% is 3.6°.', 'Il semble que le pourcentage a été utilisé comme angle. Un cercle complet fait 360° : 1 % égale 3,6°.'), 0]] as Wrong,
      steps: [t('A full circle is 360°, which is 100% of the data.', 'Un cercle complet fait 360°, ce qui représente 100 % des données.'), bi((f) => f.t(`${f.N(p)}% of 360 = ${f.N(p / 100)} × 360 = ${f.N(p * 3.6)}°.`, `${f.N(p)} % de 360 = ${f.N(p / 100)} × 360 = ${f.N(p * 3.6)}°.`))],
      nudge: t('Find that percent of 360 degrees.', 'Trouve ce pourcentage de 360 degrés.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 1, 19) * 18;
    return {
      prompt: bi((f) => f.t(`A sector of a circle graph has an angle of ${f.N(a)}°. What percent of the data does it show? Type the number only.`, `Un secteur d'un diagramme circulaire a un angle de ${f.N(a)}°. Quel pourcentage des données représente-t-il ? Écris seulement le nombre.`)),
      answer: a / 3.6,
      wrong: [[a / 360, t('That is the fraction of the circle. Multiply it by 100 to get the percent.', 'C\'est la fraction du cercle. Multiplie-la par 100 pour obtenir le pourcentage.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The sector is ${f.N(a)} out of 360 degrees: ${f.m(frac(f.n(a), 360))}.`, `Le secteur est ${f.N(a)} sur 360 degrés : ${f.m(frac(f.n(a), 360))}.`)), bi((f) => f.t(`${f.N(a)} ÷ 360 × 100 = ${f.N(a / 3.6)}%.`, `${f.N(a)} ÷ 360 × 100 = ${f.N(a / 3.6)} %.`))],
      nudge: t('Divide the angle by 360, then multiply by 100.', 'Divise l\'angle par 360, puis multiplie par 100.'),
    };
  }
  const N = pick(r, [12, 18, 20, 24, 30, 36, 40, 45]);
  const k = randInt(r, 1, N - 1);
  const ans = (k * 360) / N;
  return {
    prompt: bi((f) => f.t(`${f.N(k)} of ${f.N(N)} students chose pizza. In a circle graph of these results, what angle does the pizza sector have, in degrees?`, `${f.N(k)} élèves sur ${f.N(N)} ont choisi la pizza. Dans un diagramme circulaire de ces résultats, quel est l'angle du secteur de la pizza, en degrés ?`)),
    answer: ans, category: 'AP',
    wrong: [[r6((k * 100) / N), t('That is the percent. The angle is that share of 360°.', 'C\'est le pourcentage. L\'angle est cette part de 360°.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`The share is ${f.m(frac(f.n(k), f.n(N)))} of the students.`, `La part est ${f.m(frac(f.n(k), f.n(N)))} des élèves.`)), bi((f) => f.t(`Angle: ${f.N(k)} ÷ ${f.N(N)} × 360 = ${f.N(ans)}°.`, `Angle : ${f.N(k)} ÷ ${f.N(N)} × 360 = ${f.N(ans)}°.`))],
    nudge: t('Find the share of the students, then that share of 360°.', 'Trouve la part des élèves, puis cette part de 360°.'),
  };
});

/** MS.G7.D1.5.a: how adding or removing data changes the mean */
export const meanChange7 = numGen('MS.G7.D1.5.a', (tier, r) => {
  if (tier === 1) {
    let n: number, m: number, m2: number, v: number;
    do { n = randInt(r, 4, 6); m = randInt(r, 10, 40); m2 = m + randInt(r, 1, 5) * (r() < 0.5 ? -1 : 1); v = m2 * (n + 1) - n * m; } while (v <= 0);
    {
      return {
        prompt: bi((f) => f.t(`The mean of ${f.N(n)} numbers is ${f.N(m)}. A new number, ${f.N(v)}, is added. What is the new mean?`, `La moyenne de ${f.N(n)} nombres est ${f.N(m)}. Un nouveau nombre, ${f.N(v)}, est ajouté. Quelle est la nouvelle moyenne ?`)),
        answer: m2,
        wrong: [[r6((m + v) / 2), t('It looks like the old mean and the new number were averaged. The old mean stands for all the old numbers, so find their total first.', 'Il semble que l\'ancienne moyenne et le nouveau nombre ont été moyennés. L\'ancienne moyenne représente tous les anciens nombres : trouve d\'abord leur total.'), 0]] as Wrong,
        steps: [bi((f) => f.t(`The old total is ${f.N(n)} × ${f.N(m)} = ${f.N(n * m)}. The new total is ${f.N(n * m)} + ${f.N(v)} = ${f.N(n * m + v)}.`, `L\'ancien total est ${f.N(n)} × ${f.N(m)} = ${f.N(n * m)}. Le nouveau total est ${f.N(n * m)} + ${f.N(v)} = ${f.N(n * m + v)}.`)), bi((f) => f.t(`There are ${f.N(n + 1)} numbers now: ${f.N(n * m + v)} ÷ ${f.N(n + 1)} = ${f.N(m2)}.`, `Il y a maintenant ${f.N(n + 1)} nombres : ${f.N(n * m + v)} ÷ ${f.N(n + 1)} = ${f.N(m2)}.`))],
        nudge: t('Find the total of the old numbers from the mean, then add the new number.', 'Trouve le total des anciens nombres à partir de la moyenne, puis ajoute le nouveau nombre.'),
      };
    }
  }
  if (tier === 2) {
    let n: number, m: number, m2: number, v: number;
    do { n = randInt(r, 4, 7); m = randInt(r, 15, 40); m2 = m + randInt(r, 1, 4); v = n * m - (n - 1) * m2; } while (v <= 0);
    {
      return {
        prompt: bi((f) => f.t(`The mean of ${f.N(n)} numbers is ${f.N(m)}. One of the numbers, ${f.N(v)}, is removed. What is the new mean?`, `La moyenne de ${f.N(n)} nombres est ${f.N(m)}. L'un des nombres, ${f.N(v)}, est retiré. Quelle est la nouvelle moyenne ?`)),
        answer: m2,
        wrong: [[m, t('It looks like the mean was left the same. Removing a number changes the total and the count, so the mean can change.', 'Il semble que la moyenne est restée la même. Retirer un nombre change le total et le nombre de valeurs : la moyenne peut changer.'), 0]] as Wrong,
        steps: [bi((f) => f.t(`The old total is ${f.N(n)} × ${f.N(m)} = ${f.N(n * m)}. After removing ${f.N(v)}, the total is ${f.N(n * m - v)}.`, `L\'ancien total est ${f.N(n)} × ${f.N(m)} = ${f.N(n * m)}. Après avoir retiré ${f.N(v)}, le total est ${f.N(n * m - v)}.`)), bi((f) => f.t(`There are ${f.N(n - 1)} numbers left: ${f.N(n * m - v)} ÷ ${f.N(n - 1)} = ${f.N(m2)}.`, `Il reste ${f.N(n - 1)} nombres : ${f.N(n * m - v)} ÷ ${f.N(n - 1)} = ${f.N(m2)}.`))],
        nudge: t('Find the old total, subtract the removed number, and divide by the new count.', 'Trouve l\'ancien total, soustrais le nombre retiré et divise par le nouveau nombre de valeurs.'),
      };
    }
  }
  const n = randInt(r, 3, 5), m = randInt(r, 60, 85), goal = m + randInt(r, 2, 6);
  const need = goal * (n + 1) - n * m;
  return {
    prompt: bi((f) => f.t(`Mia's mean mark on ${f.N(n)} tests is ${f.N(m)}%. What mark does she need on the next test to bring her mean up to ${f.N(goal)}%?`, `La note moyenne de Mia à ${f.N(n)} tests est de ${f.N(m)} %. Quelle note lui faut-il au prochain test pour que sa moyenne passe à ${f.N(goal)} % ?`)),
    answer: need, category: 'AP',
    wrong: [[goal, t('It looks like the goal mean was used as the mark. One mark has to make up for the old tests too, so work with totals.', 'Il semble que la moyenne visée a été utilisée comme note. Une seule note doit aussi compenser les anciens tests : travaille avec des totaux.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`For ${f.N(n + 1)} tests with a mean of ${f.N(goal)}, the total must be ${f.N(n + 1)} × ${f.N(goal)} = ${f.N(goal * (n + 1))}.`, `Pour ${f.N(n + 1)} tests avec une moyenne de ${f.N(goal)}, le total doit être ${f.N(n + 1)} × ${f.N(goal)} = ${f.N(goal * (n + 1))}.`)), bi((f) => f.t(`She has ${f.N(n)} × ${f.N(m)} = ${f.N(n * m)} so far, so she needs ${f.N(goal * (n + 1))} − ${f.N(n * m)} = ${f.N(need)}.`, `Elle a déjà ${f.N(n)} × ${f.N(m)} = ${f.N(n * m)}, donc il lui faut ${f.N(goal * (n + 1))} − ${f.N(n * m)} = ${f.N(need)}.`))],
    nudge: t('Work out the total marks she needs, then subtract the marks she has.', 'Calcule le total des notes qu\'il lui faut, puis soustrais celles qu\'elle a déjà.'),
  };
});

/** MS.G7.D2.1.a: independent and dependent events */
export const twoEvents7: Generator = (tier, seed) => {
  const r = makeRng(seed);
  let red: number, blue: number, N: number;
  do { red = randInt(r, 2, 6); blue = randInt(r, 2, 6); N = red + blue; } while (N > 11);
  const reduce = (n: number, d: number): { n: number; d: number } => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
  const indep = reduce(red * red, N * N);
  const dep = reduce(red * (red - 1), N * (N - 1));
  const redThenBlue = reduce(red * blue, N * (N - 1));
  if (tier === 1) {
    return build({
      skill: 'MS.G7.D2.1.a', tier, seed, category: 'AP', format: 'fraction',
      prompt: bi((f) => f.t(`A bag has ${f.N(red)} red and ${f.N(blue)} blue marbles. You take one marble, put it back, and take another. What is the probability that both are red? Write a fraction in simplest form.`, `Un sac contient ${f.N(red)} billes rouges et ${f.N(blue)} billes bleues. Tu prends une bille, tu la remets, puis tu en prends une autre. Quelle est la probabilité que les deux soient rouges ? Écris une fraction irréductible.`)),
      answer: { kind: 'fraction', n: indep.n, d: indep.d, mustReduce: true },
      steps: [bi((f) => f.t(`The marble goes back, so the events are independent: the second draw is ${f.m(frac(f.n(red), f.n(N)))} again.`, `La bille est remise : les événements sont indépendants, donc le deuxième tirage est encore ${f.m(frac(f.n(red), f.n(N)))}.`)), bi((f) => f.t(`${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(red), f.n(N))} = ${frac(f.n(red * red), f.n(N * N))}`)}, which is ${f.m(frac(f.n(indep.n), f.n(indep.d)))} in simplest form.`, `${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(red), f.n(N))} = ${frac(f.n(red * red), f.n(N * N))}`)}, soit ${f.m(frac(f.n(indep.n), f.n(indep.d)))} sous forme irréductible.`))],
      nudge: t('Because the marble is put back, the second draw has the same chances as the first.', 'Comme la bille est remise, le deuxième tirage a les mêmes chances que le premier.'),
      stepHint: t('Multiply the probability of the first draw by the probability of the second.', 'Multiplie la probabilité du premier tirage par celle du deuxième.'),
      wrong: [{ answer: { kind: 'fraction', n: red, d: N }, stepIndex: 0, why: t('That is the chance of one red marble. Both draws must be red, so multiply the two chances.', 'C\'est la chance d\'une seule bille rouge. Les deux tirages doivent être rouges : multiplie les deux chances.') }],
    });
  }
  if (tier === 2) {
    return build({
      skill: 'MS.G7.D2.1.a', tier, seed, category: 'AP', format: 'fraction',
      prompt: bi((f) => f.t(`A bag has ${f.N(red)} red and ${f.N(blue)} blue marbles. You take one marble and keep it, then take a second. What is the probability that both are red? Write a fraction in simplest form.`, `Un sac contient ${f.N(red)} billes rouges et ${f.N(blue)} billes bleues. Tu prends une bille et tu la gardes, puis tu en prends une deuxième. Quelle est la probabilité que les deux soient rouges ? Écris une fraction irréductible.`)),
      answer: { kind: 'fraction', n: dep.n, d: dep.d, mustReduce: true },
      steps: [bi((f) => f.t(`The first marble is not replaced, so the events are dependent. First draw: ${f.m(frac(f.n(red), f.n(N)))}. Second draw: ${f.m(frac(f.n(red - 1), f.n(N - 1)))} (one red and one marble fewer).`, `La première bille n\'est pas remise : les événements sont dépendants. Premier tirage : ${f.m(frac(f.n(red), f.n(N)))}. Deuxième tirage : ${f.m(frac(f.n(red - 1), f.n(N - 1)))} (une rouge et une bille de moins).`)), bi((f) => f.t(`${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(red - 1), f.n(N - 1))} = ${frac(f.n(red * (red - 1)), f.n(N * (N - 1)))}`)}, which is ${f.m(frac(f.n(dep.n), f.n(dep.d)))} in simplest form.`, `${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(red - 1), f.n(N - 1))} = ${frac(f.n(red * (red - 1)), f.n(N * (N - 1)))}`)}, soit ${f.m(frac(f.n(dep.n), f.n(dep.d)))} sous forme irréductible.`))],
      nudge: t('The first marble is kept, so the bag has fewer marbles for the second draw.', 'La première bille est gardée : il y a moins de billes dans le sac pour le deuxième tirage.'),
      stepHint: t('Count the red marbles and all the marbles left after the first draw.', 'Compte les billes rouges et toutes les billes qui restent après le premier tirage.'),
      wrong: indep.n === dep.n && indep.d === dep.d ? [] : [{ answer: { kind: 'fraction', n: indep.n, d: indep.d }, stepIndex: 0, why: t('It looks like the second draw used the full bag again. The first marble was kept, so one marble is gone.', 'Il semble que le deuxième tirage a utilisé le sac complet. La première bille a été gardée : il y a une bille de moins.') }],
    });
  }
  return build({
    skill: 'MS.G7.D2.1.a', tier, seed, category: 'TH', format: 'fraction',
    prompt: bi((f) => f.t(`A bag has ${f.N(red)} red and ${f.N(blue)} blue marbles. You take one marble and keep it, then take a second. What is the probability that the first is red and the second is blue? Write a fraction in simplest form.`, `Un sac contient ${f.N(red)} billes rouges et ${f.N(blue)} billes bleues. Tu prends une bille et tu la gardes, puis tu en prends une deuxième. Quelle est la probabilité que la première soit rouge et la deuxième bleue ? Écris une fraction irréductible.`)),
    answer: { kind: 'fraction', n: redThenBlue.n, d: redThenBlue.d, mustReduce: true },
    steps: [bi((f) => f.t(`First draw red: ${f.m(frac(f.n(red), f.n(N)))}. A red marble is gone, so there are ${f.N(N - 1)} marbles and still ${f.N(blue)} blue: second draw blue is ${f.m(frac(f.n(blue), f.n(N - 1)))}.`, `Premier tirage rouge : ${f.m(frac(f.n(red), f.n(N)))}. Une bille rouge est partie : il reste ${f.N(N - 1)} billes dont ${f.N(blue)} bleues, donc deuxième tirage bleu : ${f.m(frac(f.n(blue), f.n(N - 1)))}.`)), bi((f) => f.t(`${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(blue), f.n(N - 1))} = ${frac(f.n(red * blue), f.n(N * (N - 1)))}`)}, which is ${f.m(frac(f.n(redThenBlue.n), f.n(redThenBlue.d)))} in simplest form.`, `${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(blue), f.n(N - 1))} = ${frac(f.n(red * blue), f.n(N * (N - 1)))}`)}, soit ${f.m(frac(f.n(redThenBlue.n), f.n(redThenBlue.d)))} sous forme irréductible.`))],
    nudge: t('After a red marble is kept, how many marbles are left, and how many of them are blue?', 'Après qu\'une bille rouge a été gardée, combien reste-t-il de billes, et combien sont bleues ?'),
    stepHint: t('Write the chance of the first draw, then the chance of the second with one marble fewer.', 'Écris la chance du premier tirage, puis celle du deuxième avec une bille de moins.'),
    wrong: ((): WrongAnswer[] => {
      const g = gcd(red * blue, N * N);
      if (red * blue / g === redThenBlue.n && (N * N) / g === redThenBlue.d) return [];
      return [{ answer: { kind: 'fraction', n: red * blue, d: N * N }, stepIndex: 0, why: t('It looks like the second draw used the full bag again. The first marble was kept, so the bag has one marble fewer.', 'Il semble que le deuxième tirage a utilisé le sac complet. La première bille a été gardée : le sac a une bille de moins.') }];
    })(),
  });
};

/** MS.G7.D2.2.a: theoretical and experimental probability */
export const experimental7 = numGen('MS.G7.D2.2.a', (tier, r) => {
  if (tier === 1) {
    const sections = pick(r, [4, 5, 8, 10]);
    const shaded = randInt(r, 1, sections - 1);
    const spins = sections * randInt(r, 5, 20);
    const ans = (spins * shaded) / sections;
    return {
      prompt: bi((f) => f.t(`A spinner has ${f.N(sections)} equal sections and ${f.N(shaded)} of them are green. If you spin it ${f.N(spins)} times, about how many times should you expect green?`, `Une roulette a ${f.N(sections)} sections égales et ${f.N(shaded)} d'entre elles sont vertes. Si tu la fais tourner ${f.N(spins)} fois, environ combien de fois devrais-tu obtenir du vert ?`)),
      answer: ans, category: 'AP',
      wrong: [[shaded, t('That is the number of green sections, not the number of spins. Use the theoretical probability times the number of spins.', 'C\'est le nombre de sections vertes, pas le nombre de tours. Utilise la probabilité théorique multipliée par le nombre de tours.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The theoretical probability of green is ${f.m(frac(f.n(shaded), f.n(sections)))}.`, `La probabilité théorique du vert est ${f.m(frac(f.n(shaded), f.n(sections)))}.`)), bi((f) => f.t(`Expected: ${f.N(spins)} × ${f.m(frac(f.n(shaded), f.n(sections)))} = ${f.N(ans)}.`, `Résultat attendu : ${f.N(spins)} × ${f.m(frac(f.n(shaded), f.n(sections)))} = ${f.N(ans)}.`))],
      nudge: t('Multiply the number of spins by the probability of green.', 'Multiplie le nombre de tours par la probabilité du vert.'),
    };
  }
  if (tier === 2) {
    const N = pick(r, [20, 25, 40, 50, 100]);
    const k = randInt(r, 1, N - 1);
    const ans = r6((k * 100) / N);
    return {
      prompt: bi((f) => f.t(`You roll a die ${f.N(N)} times and get a six ${f.N(k)} times. What is the experimental probability of rolling a six, as a percent? Type the number only.`, `Tu lances un dé ${f.N(N)} fois et tu obtiens un six ${f.N(k)} fois. Quelle est la probabilité expérimentale d'obtenir un six, en pourcentage ? Écris seulement le nombre.`)),
      answer: ans, category: 'AP',
      wrong: [[r6(100 / 6), t('That is the theoretical probability of a six (1 out of 6). The experimental probability uses what actually happened.', 'C\'est la probabilité théorique d\'un six (1 sur 6). La probabilité expérimentale utilise ce qui s\'est vraiment passé.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Experimental probability = successes ÷ trials = ${f.m(frac(f.n(k), f.n(N)))}.`, `Probabilité expérimentale = succès ÷ essais = ${f.m(frac(f.n(k), f.n(N)))}.`)), bi((f) => f.t(`${f.N(k)} ÷ ${f.N(N)} × 100 = ${f.N(ans)}%.`, `${f.N(k)} ÷ ${f.N(N)} × 100 = ${f.N(ans)} %.`))],
      nudge: t('Divide the number of sixes by the number of rolls, then write it as a percent.', 'Divise le nombre de six par le nombre de lancers, puis écris-le en pourcentage.'),
    };
  }
  const N = pick(r, [40, 60, 80, 100, 120]);
  const expected = N / 4;
  const k = expected + randInt(r, 2, 9);
  return {
    prompt: bi((f) => f.t(`The theoretical probability of landing on blue is ${f.m(frac('1', '4'))}. In ${f.N(N)} spins, the spinner landed on blue ${f.N(k)} times. How many more blues is that than expected?`, `La probabilité théorique d'obtenir le bleu est ${f.m(frac('1', '4'))}. En ${f.N(N)} tours, la roulette s'est arrêtée sur le bleu ${f.N(k)} fois. C'est combien de bleus de plus que prévu ?`)),
    answer: k - expected, category: 'TH',
    wrong: [[k, t('That is the number of blues that happened. Compare it with the number expected.', 'C\'est le nombre de bleus obtenus. Compare-le au nombre attendu.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Expected blues: ${f.N(N)} × ${f.m(frac('1', '4'))} = ${f.N(expected)}.`, `Bleus attendus : ${f.N(N)} × ${f.m(frac('1', '4'))} = ${f.N(expected)}.`)), bi((f) => f.t(`Difference: ${f.N(k)} − ${f.N(expected)} = ${f.N(k - expected)}.`, `Différence : ${f.N(k)} − ${f.N(expected)} = ${f.N(k - expected)}.`))],
    nudge: t('Find how many blues you would expect, then compare with what happened.', 'Trouve combien de bleus tu t\'attendrais à obtenir, puis compare avec ce qui s\'est passé.'),
  };
});
