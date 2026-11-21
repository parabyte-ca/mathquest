// Grade 8 Data strand (D): two-variable tables, correlation in scatter plots, Venn diagrams, and several independent or dependent events.
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, numGen, r6, type F } from './dsl.js';
import { build, frac, gcd, t } from './kit.js';

type Wrong = [number, Text, number?][];

/** MS.G8.D1.2.a: two-variable tables of values */
export const tables8 = numGen('MS.G8.D1.2.a', (tier, r) => {
  const m = tier === 3 ? (randInt(r, 1, 8) * (r() < 0.5 ? -1 : 1)) / 2 : randInt(r, 2, 9) * (tier === 2 ? 1 : r() < 0.5 ? 1 : -1);
  const c = randInt(r, -10, 15);
  const y = (x: number): number => r6(m * x + c);
  const xs = [1, 2, 3, 4];
  const list = (f: F, vals: number[]): string => vals.map((v) => f.N(v)).join(', ');
  if (tier === 2) {
    const x0 = randInt(r, 8, 20), V = y(x0);
    return {
      prompt: bi((f) => f.t(`A table shows x = ${list(f, xs)} and y = ${list(f, xs.map(y))}. For what value of x is y = ${f.N(V)}?`, `Un tableau montre x = ${list(f, xs)} et y = ${list(f, xs.map(y))}. Pour quelle valeur de x a-t-on y = ${f.N(V)} ?`)),
      answer: x0, category: 'TH',
      wrong: [[r6((V - c) / (m * 2)), t('It looks like the rule was not undone correctly. Subtract the constant first, then divide by the amount y changes each step.', 'Il semble que la règle n\'a pas été défaite correctement. Soustrais d\'abord la constante, puis divise par la quantité dont y change à chaque pas.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`y changes by ${f.N(m)} each time x goes up by 1, and y = ${f.N(y(1))} when x = 1, so y = ${f.m(`${f.n(m)}x ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}.`, `y change de ${f.N(m)} chaque fois que x augmente de 1, et y = ${f.N(y(1))} quand x = 1, donc y = ${f.m(`${f.n(m)}x ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}.`)), bi((f) => f.t(`Solve ${f.N(V)} = ${f.N(m)}x ${c < 0 ? '−' : '+'} ${f.N(Math.abs(c))}: x = ${f.N(x0)}.`, `Résous ${f.N(V)} = ${f.N(m)}x ${c < 0 ? '−' : '+'} ${f.N(Math.abs(c))} : x = ${f.N(x0)}.`))],
      nudge: t('Find the rule from the table first, then work backwards from the y value.', 'Trouve d\'abord la règle à partir du tableau, puis remonte à partir de la valeur de y.'),
    };
  }
  const N = randInt(r, 8, 20);
  return {
    prompt: bi((f) => f.t(`A table shows x = ${list(f, xs)} and y = ${list(f, xs.map(y))}. What is y when x = ${f.N(N)}?`, `Un tableau montre x = ${list(f, xs)} et y = ${list(f, xs.map(y))}. Quelle est la valeur de y quand x = ${f.N(N)} ?`)),
    answer: y(N),
    wrong: [[r6(y(4) + (N - 4)), t('It looks like y was taken to go up by 1 each step. Use the amount y really changes by in the table.', 'Il semble que y a été considéré comme augmentant de 1 à chaque pas. Utilise la quantité dont y change vraiment dans le tableau.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`y changes by ${f.N(r6(y(2) - y(1)))} each time x goes up by 1. The rule is y = ${f.m(`${f.n(m)}x ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}.`, `y change de ${f.N(r6(y(2) - y(1)))} chaque fois que x augmente de 1. La règle est y = ${f.m(`${f.n(m)}x ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}.`)), bi((f) => f.t(`When x = ${f.N(N)}: ${f.N(m)} × ${f.N(N)} ${c < 0 ? '−' : '+'} ${f.N(Math.abs(c))} = ${f.N(y(N))}.`, `Quand x = ${f.N(N)} : ${f.N(m)} × ${f.N(N)} ${c < 0 ? '−' : '+'} ${f.N(Math.abs(c))} = ${f.N(y(N))}.`))],
    nudge: t('Find how much y changes each time x goes up by 1, then write the rule.', 'Trouve de combien y change chaque fois que x augmente de 1, puis écris la règle.'),
  };
});

const CLASSES = ['strong positive', 'weak positive', 'none', 'weak negative', 'strong negative'] as const;
type Cls = (typeof CLASSES)[number];
const CLS_TEXT: Record<Cls, Text> = {
  'strong positive': t('Strong positive correlation', 'Corrélation positive forte'),
  'weak positive': t('Weak positive correlation', 'Corrélation positive faible'),
  none: t('No correlation', 'Aucune corrélation'),
  'weak negative': t('Weak negative correlation', 'Corrélation négative faible'),
  'strong negative': t('Strong negative correlation', 'Corrélation négative forte'),
};
/** Pearson correlation of a list of points. */
export const pearson = (pts: [number, number][]): number => {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  return syy === 0 || sxx === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
};
/** Strong is |r| of 0.9 or more, weak is 0.4 to 0.75, none is under 0.2; anything in between is not used in a question. */
export const classify = (r: number): Cls | null => {
  const a = Math.abs(r);
  if (a >= 0.9) return r > 0 ? 'strong positive' : 'strong negative';
  if (a >= 0.4 && a <= 0.75) return r > 0 ? 'weak positive' : 'weak negative';
  if (a < 0.2) return 'none';
  return null;
};

/** MS.G8.D1.5.a: describe correlation as strong, weak, none, positive or negative, including outliers */
export const correlation8 = choiceGen('MS.G8.D1.5.a', (tier, r) => {
  const wanted: Cls[] = tier === 1 ? ['strong positive', 'strong negative', 'none'] : [...CLASSES];
  let pts: [number, number][] = [], cls: Cls = 'none', outlier: [number, number] | null = null, tries = 0;
  for (; tries < 5000; tries++) {
    const target = pick(r, wanted);
    const n = 8;
    const slope = target.includes('positive') ? (target.startsWith('strong') ? 2 : 1) : target.includes('negative') ? (target.startsWith('strong') ? -2 : -1) : 0;
    const spread = target.startsWith('strong') ? 1.2 : target === 'none' ? 6 : 4.5;
    const base = slope < 0 ? 20 : 3;
    const cand: [number, number][] = Array.from({ length: n }, (_, i) => [i + 1, Math.round(base + slope * (i + 1) + (r() * 2 - 1) * spread)]);
    const c = classify(pearson(cand));
    if (c !== target) continue;
    pts = cand; cls = c; outlier = null;
    if (tier === 3) {
      const k = randInt(r, 2, n - 3);
      const out: [number, number] = [k + 1, cand[k]![1] + (slope > 0 ? -25 : 25)];
      const withOut = cand.map((p, i) => (i === k ? out : p)) as [number, number][];
      pts = withOut; outlier = out;
      // The question is about the points that are not the outlier, so classify those.
      if (classify(pearson(cand.filter((_, i) => i !== k))) !== target) continue;
    }
    break;
  }
  const shownPts = (f: F): string => pts.map(([x, y]) => `(${f.n(x)},\\ ${f.n(y)})`).join(',\\ ');
  const idx = CLASSES.indexOf(cls);
  const opposite = cls === 'none' ? -1 : CLASSES.indexOf(cls.replace(cls.includes('positive') ? 'positive' : 'negative', cls.includes('positive') ? 'negative' : 'positive') as Cls);
  const why: Record<number, Text> = {};
  if (opposite >= 0) why[opposite] = t('It looks like the direction was reversed. If y goes up as x goes up the correlation is positive; if y goes down as x goes up it is negative.', 'Il semble que la direction a été inversée. Si y augmente quand x augmente, la corrélation est positive ; si y diminue quand x augmente, elle est négative.');
  return {
    prompt: bi((f) => f.t(`A scatter plot has these points: ${f.m(shownPts(f))}. ${outlier ? `The point ${f.m(`(${f.n(outlier[0])},\\ ${f.n(outlier[1])})`)} is an outlier: ignore it. ` : ''}How would you describe the correlation?`, `Un nuage de points a ces points : ${f.m(shownPts(f))}. ${outlier ? `Le point ${f.m(`(${f.n(outlier[0])},\\ ${f.n(outlier[1])})`)} est une valeur aberrante : ignore-le. ` : ''}Comment décrirais-tu la corrélation ?`)),
    options: (tier === 1 ? (['strong positive', 'none', 'strong negative'] as Cls[]) : [...CLASSES]).map((c) => CLS_TEXT[c]),
    correct: tier === 1 ? ['strong positive', 'none', 'strong negative'].indexOf(cls) : idx,
    why: tier === 1 ? (opposite >= 0 ? { [['strong positive', 'none', 'strong negative'].indexOf(CLASSES[opposite]!)]: why[opposite]! } : {}) : why,
    category: tier === 3 ? 'TH' : 'KU',
    steps: [t('Picture the points on a graph. Do they rise together, fall as x rises, or show no pattern? The tighter they cluster along a line, the stronger the correlation.', 'Imagine les points sur un graphique. Montent-ils ensemble, descendent-ils quand x augmente, ou ne montrent-ils aucun motif ? Plus ils se regroupent près d\'une droite, plus la corrélation est forte.'), bi((f) => f.t(`These points show ${CLS_TEXT[cls].en.toLowerCase()}.`, `Ces points montrent une ${CLS_TEXT[cls].fr.toLowerCase()}.`))],
    nudge: t('Does y go up, go down, or wander as x goes up? And how closely do the points follow a line?', 'Est-ce que y monte, descend ou erre quand x augmente ? Et à quel point les points suivent-ils une droite ?'),
  };
});

/** MS.G8.D2.1.a: probability using Venn diagrams */
export const venn8 = numGen('MS.G8.D2.1.a', (tier, r) => {
  if (tier === 1) {
    const both = randInt(r, 3, 10), a = both + randInt(r, 4, 12), b = both + randInt(r, 3, 10);
    return {
      prompt: bi((f) => f.t(`In a Venn diagram of a class, ${f.N(a)} students play soccer, ${f.N(b)} play hockey, and ${f.N(both)} play both. How many students play at least one of the two sports?`, `Dans un diagramme de Venn d'une classe, ${f.N(a)} élèves jouent au soccer, ${f.N(b)} au hockey, et ${f.N(both)} aux deux. Combien d'élèves pratiquent au moins un des deux sports ?`)),
      answer: a + b - both, category: 'AP',
      wrong: [[a + b, t('It looks like the students who play both were counted twice. They are inside both circles, so subtract them once.', 'Il semble que les élèves qui jouent aux deux ont été comptés deux fois. Ils sont dans les deux cercles : soustrais-les une fois.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Only soccer: ${f.N(a)} − ${f.N(both)} = ${f.N(a - both)}. Only hockey: ${f.N(b)} − ${f.N(both)} = ${f.N(b - both)}.`, `Seulement soccer : ${f.N(a)} − ${f.N(both)} = ${f.N(a - both)}. Seulement hockey : ${f.N(b)} − ${f.N(both)} = ${f.N(b - both)}.`)), bi((f) => f.t(`At least one: ${f.N(a - both)} + ${f.N(both)} + ${f.N(b - both)} = ${f.N(a + b - both)}.`, `Au moins un : ${f.N(a - both)} + ${f.N(both)} + ${f.N(b - both)} = ${f.N(a + b - both)}.`))],
      nudge: t('The students in both circles must be counted only once.', 'Les élèves qui sont dans les deux cercles ne doivent être comptés qu\'une fois.'),
    };
  }
  if (tier === 2) {
    const both = randInt(r, 3, 9), a = both + randInt(r, 4, 12), b = both + randInt(r, 3, 10), neither = randInt(r, 2, 8), N = a + b - both + neither;
    return {
      prompt: bi((f) => f.t(`A class has ${f.N(N)} students. ${f.N(a)} play soccer, ${f.N(b)} play hockey, and ${f.N(neither)} play neither. How many play both?`, `Une classe compte ${f.N(N)} élèves. ${f.N(a)} jouent au soccer, ${f.N(b)} au hockey, et ${f.N(neither)} ne jouent à aucun des deux. Combien jouent aux deux ?`)),
      answer: both, category: 'TH',
      wrong: [[a + b - N, t('It looks like the students who play neither were forgotten. They are in the class but outside both circles.', 'Il semble que les élèves qui ne jouent à aucun sport ont été oubliés. Ils sont dans la classe mais hors des deux cercles.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Students who play at least one sport: ${f.N(N)} − ${f.N(neither)} = ${f.N(N - neither)}.`, `Élèves qui pratiquent au moins un sport : ${f.N(N)} − ${f.N(neither)} = ${f.N(N - neither)}.`)), bi((f) => f.t(`Adding the two circles counts the overlap twice: ${f.N(a)} + ${f.N(b)} − ${f.N(N - neither)} = ${f.N(both)} play both.`, `Additionner les deux cercles compte le chevauchement deux fois : ${f.N(a)} + ${f.N(b)} − ${f.N(N - neither)} = ${f.N(both)} jouent aux deux.`))],
      nudge: t('Take away the students who play neither, then see how much the two circles overlap.', 'Retire les élèves qui ne jouent à aucun sport, puis vois de combien les deux cercles se chevauchent.'),
    };
  }
  const N = pick(r, [20, 25, 40, 50]);
  const both = randInt(r, 1, Math.floor(N / 10) + 2), a = both + randInt(r, 2, Math.floor(N / 4)), b = both + randInt(r, 2, Math.floor(N / 4));
  const pct = r6(((a + b - both) / N) * 100);
  return {
    prompt: bi((f) => f.t(`Of ${f.N(N)} students, ${f.N(a)} play soccer, ${f.N(b)} play hockey, and ${f.N(both)} play both. What is the probability, as a percent, that a student chosen at random plays at least one of the two sports? Type the number only.`, `Sur ${f.N(N)} élèves, ${f.N(a)} jouent au soccer, ${f.N(b)} au hockey, et ${f.N(both)} aux deux. Quelle est la probabilité, en pourcentage, qu'un élève choisi au hasard pratique au moins un des deux sports ? Écris seulement le nombre.`)),
    answer: pct, category: 'AP',
    wrong: [[r6(((a + b) / N) * 100), t('It looks like the students who play both were counted twice. Count them once, then find the percent of the whole class.', 'Il semble que les élèves qui jouent aux deux ont été comptés deux fois. Compte-les une fois, puis trouve le pourcentage de la classe entière.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`At least one sport: ${f.N(a)} + ${f.N(b)} − ${f.N(both)} = ${f.N(a + b - both)} students.`, `Au moins un sport : ${f.N(a)} + ${f.N(b)} − ${f.N(both)} = ${f.N(a + b - both)} élèves.`)), bi((f) => f.t(`${f.N(a + b - both)} ÷ ${f.N(N)} × 100 = ${f.N(pct)}%.`, `${f.N(a + b - both)} ÷ ${f.N(N)} × 100 = ${f.N(pct)} %.`))],
    nudge: t('Count the students who play at least one sport once, then divide by the whole class.', 'Compte une fois les élèves qui pratiquent au moins un sport, puis divise par la classe entière.'),
  };
});

const reduce = (n: number, d: number): { n: number; d: number } => { const g = gcd(n, d); return { n: n / g, d: d / g }; };

/** MS.G8.D2.2.a: multiple independent and dependent events */
export const multiEvents8: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 1) {
    const q = pick(r, [3, 4, 5, 6, 8, 10]);
    const p = randInt(r, 1, q - 1);
    const ans = reduce(p ** 3, q ** 3), wrong = reduce(p ** 2, q ** 2);
    return build({
      skill: 'MS.G8.D2.2.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`A spinner lands on green with probability ${f.m(frac(f.n(p), f.n(q)))}. You spin it three times. What is the probability that it lands on green all three times? Write a fraction in simplest form.`, `Une roulette s'arrête sur le vert avec une probabilité de ${f.m(frac(f.n(p), f.n(q)))}. Tu la fais tourner trois fois. Quelle est la probabilité qu'elle s'arrête sur le vert les trois fois ? Écris une fraction irréductible.`)),
      answer: { kind: 'fraction', n: ans.n, d: ans.d, mustReduce: true },
      steps: [bi((f) => f.t(`The spins are independent, so multiply the three probabilities: ${f.m(`${frac(f.n(p), f.n(q))} \\times ${frac(f.n(p), f.n(q))} \\times ${frac(f.n(p), f.n(q))}`)}.`, `Les tours sont indépendants : multiplie les trois probabilités : ${f.m(`${frac(f.n(p), f.n(q))} \\times ${frac(f.n(p), f.n(q))} \\times ${frac(f.n(p), f.n(q))}`)}.`)), bi((f) => f.t(`${f.m(frac(f.n(p ** 3), f.n(q ** 3)))}, which is ${f.m(frac(f.n(ans.n), f.n(ans.d)))} in simplest form.`, `${f.m(frac(f.n(p ** 3), f.n(q ** 3)))}, soit ${f.m(frac(f.n(ans.n), f.n(ans.d)))} sous forme irréductible.`))],
      nudge: t('Each spin is independent. Multiply the probabilities of the three spins.', 'Chaque tour est indépendant. Multiplie les probabilités des trois tours.'),
      stepHint: t('Multiply the probability by itself three times.', 'Multiplie la probabilité par elle-même trois fois.'),
      wrong: wrong.n === ans.n && wrong.d === ans.d ? [] : [{ answer: { kind: 'fraction', n: wrong.n, d: wrong.d }, stepIndex: 0, why: t('It looks like only two spins were multiplied. There are three spins, so multiply three probabilities.', 'Il semble que seulement deux tours ont été multipliés. Il y a trois tours : multiplie trois probabilités.') }],
    });
  }
  let red: number, blue: number, N: number;
  do { red = randInt(r, 3, 7); blue = randInt(r, 2, 6); N = red + blue; } while (N > 11);
  if (tier === 2) {
    const ans = reduce(red * (red - 1) * (red - 2), N * (N - 1) * (N - 2)), wrong = reduce(red ** 3, N ** 3);
    return build({
      skill: 'MS.G8.D2.2.a', tier, seed, category: 'AP', format: 'fraction',
      prompt: bi((f) => f.t(`A bag has ${f.N(red)} red and ${f.N(blue)} blue marbles. You take three marbles without putting any back. What is the probability that all three are red? Write a fraction in simplest form.`, `Un sac contient ${f.N(red)} billes rouges et ${f.N(blue)} billes bleues. Tu prends trois billes sans en remettre. Quelle est la probabilité que les trois soient rouges ? Écris une fraction irréductible.`)),
      answer: { kind: 'fraction', n: ans.n, d: ans.d, mustReduce: true },
      steps: [bi((f) => f.t(`Nothing is put back, so the events are dependent: ${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(red - 1), f.n(N - 1))} \\times ${frac(f.n(red - 2), f.n(N - 2))}`)}.`, `Rien n\'est remis : les événements sont dépendants : ${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(red - 1), f.n(N - 1))} \\times ${frac(f.n(red - 2), f.n(N - 2))}`)}.`)), bi((f) => f.t(`${f.m(frac(f.n(red * (red - 1) * (red - 2)), f.n(N * (N - 1) * (N - 2))))} simplifies to ${f.m(frac(f.n(ans.n), f.n(ans.d)))}.`, `${f.m(frac(f.n(red * (red - 1) * (red - 2)), f.n(N * (N - 1) * (N - 2))))} se simplifie en ${f.m(frac(f.n(ans.n), f.n(ans.d)))}.`))],
      nudge: t('After each marble is kept, there is one fewer red marble and one fewer marble in the bag.', 'Après chaque bille gardée, il y a une bille rouge de moins et une bille de moins dans le sac.'),
      stepHint: t('Write the chance of each draw with the marbles that are left.', 'Écris la chance de chaque tirage avec les billes qui restent.'),
      wrong: wrong.n === ans.n && wrong.d === ans.d ? [] : [{ answer: { kind: 'fraction', n: wrong.n, d: wrong.d }, stepIndex: 0, why: t('It looks like every draw used the full bag. Marbles are kept, so the bag changes after each draw.', 'Il semble que chaque tirage a utilisé le sac complet. Les billes sont gardées : le sac change après chaque tirage.') }],
    });
  }
  const ans = reduce(2 * red * blue, N * (N - 1)), wrong = reduce(red * blue, N * (N - 1));
  return build({
    skill: 'MS.G8.D2.2.a', tier, seed, category: 'TH', format: 'fraction',
    prompt: bi((f) => f.t(`A bag has ${f.N(red)} red and ${f.N(blue)} blue marbles. You take two marbles without putting any back. What is the probability that exactly one is red? Write a fraction in simplest form.`, `Un sac contient ${f.N(red)} billes rouges et ${f.N(blue)} billes bleues. Tu prends deux billes sans en remettre. Quelle est la probabilité qu'exactement une soit rouge ? Écris une fraction irréductible.`)),
    answer: { kind: 'fraction', n: ans.n, d: ans.d, mustReduce: true },
    steps: [bi((f) => f.t(`Red then blue: ${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(blue), f.n(N - 1))}`)}. Blue then red: ${f.m(`${frac(f.n(blue), f.n(N))} \\times ${frac(f.n(red), f.n(N - 1))}`)}. These are two different ways, so add them.`, `Rouge puis bleue : ${f.m(`${frac(f.n(red), f.n(N))} \\times ${frac(f.n(blue), f.n(N - 1))}`)}. Bleue puis rouge : ${f.m(`${frac(f.n(blue), f.n(N))} \\times ${frac(f.n(red), f.n(N - 1))}`)}. Ce sont deux façons différentes : additionne-les.`)), bi((f) => f.t(`Total: ${f.m(frac(f.n(2 * red * blue), f.n(N * (N - 1))))}, which is ${f.m(frac(f.n(ans.n), f.n(ans.d)))} in simplest form.`, `Total : ${f.m(frac(f.n(2 * red * blue), f.n(N * (N - 1))))}, soit ${f.m(frac(f.n(ans.n), f.n(ans.d)))} sous forme irréductible.`))],
    nudge: t('There are two ways to get exactly one red: red first or blue first. Find both and add.', 'Il y a deux façons d\'obtenir exactement une rouge : rouge d\'abord ou bleue d\'abord. Trouve les deux et additionne.'),
    stepHint: t('Draw a tree diagram and follow the two branches that have one red marble.', 'Dessine un diagramme en arbre et suis les deux branches qui ont une bille rouge.'),
    wrong: [{ answer: { kind: 'fraction', n: wrong.n, d: wrong.d }, stepIndex: 0, why: t('It looks like only one order was counted. Blue then red is also a way to get exactly one red.', 'Il semble qu\'un seul ordre a été compté. Bleue puis rouge est aussi une façon d\'obtenir exactement une rouge.') }],
  });
};
