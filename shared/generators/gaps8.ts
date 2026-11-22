// Grade 8 completion: patterns with rational numbers (C1.2), one- and two-variable data (D1.1), scatter plots (D1.3), infographics
// (D1.4), analysis (D1.6) and building models from views (E1.2).
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator, Text, Visual } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { build, frac, t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const other = (en: string, fr: string): Text => t(en, fr);

// ── C1.2: patterns with rational numbers ───────────────────────────────────────

/** A rational number as TeX: a decimal or a fraction, the same value either way. */
const rat = (f: F, v: number, asFraction: boolean, d: number): string => (asFraction ? (v < 0 ? '-' : '') + frac(Math.abs(Math.round(v * d)), d) : f.n(v));

export const patterns8c = numGen('MS.G8.C1.2.a', (tier, r) => {
  const d = pick(r, [2, 4]), asFraction = r() < 0.5;
  if (tier === 1) {
    const step = pick(r, [-1, 1]) * randInt(r, 1, 3) / d, first = randInt(r, -4, 4) + randInt(r, 0, d - 1) / d;
    const seq = [0, 1, 2, 3].map((i) => r6(first + step * i)), ans = r6(first + step * 4);
    return {
      prompt: bi((f) => f.t(`A pattern starts ${seq.map((v) => f.m(rat(f, v, asFraction, d))).join(', ')}. What is the next term? Give it as a decimal.`, `Une suite commence par ${seq.map((v) => f.m(rat(f, v, asFraction, d))).join(', ')}. Quel est le terme suivant ? Donne-le en nombre décimal.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(ans + step), other('That skips a term. Add the common difference once to the last term.', 'Cela saute un terme. Ajoute la différence commune une seule fois au dernier terme.'), 1], [r6(seq[3]! - step), other('That goes backwards. Check whether the terms are growing or shrinking.', 'Cela recule. Vérifie si les termes augmentent ou diminuent.'), 0]]),
      steps: [bi((f) => f.t(`The common difference is ${f.N(step)} (subtract two neighbouring terms).`, `La différence commune est ${f.N(step)} (soustrais deux termes voisins).`)), bi((f) => f.t(`${f.m(`${f.n(seq[3]!)} ${step < 0 ? '-' : '+'} ${f.n(Math.abs(step))}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(seq[3]!)} ${step < 0 ? '-' : '+'} ${f.n(Math.abs(step))}`)} = ${f.N(ans)}.`))],
      nudge: other('Subtract two neighbouring terms to find the common difference, then add it to the last term.', 'Soustrais deux termes voisins pour trouver la différence commune, puis ajoute-la au dernier terme.'),
    };
  }
  const m = pick(r, [-1.5, -0.5, -0.25, 0.25, 0.5, 0.75, 1.5, 2.5]), b = pick(r, [-3, -2.5, -1, 0.5, 1.5, 4]);
  if (tier === 2) {
    const n = randInt(r, 2, 12) * 4, ans = r6(m * n + b);
    return {
      prompt: bi((f) => f.t(`A pattern follows the rule ${f.m(`T = ${f.n(m)}n ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}, where n is the term number. What is T when n = ${f.N(n)}?`, `Une suite suit la règle ${f.m(`T = ${f.n(m)}n ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}, où n est le numéro du terme. Que vaut T quand n = ${f.N(n)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(m * (n + b)), other('Multiply n by the coefficient first, then add the constant. The constant is not multiplied.', 'Multiplie d\'abord n par le coefficient, puis ajoute la constante. La constante n\'est pas multipliée.'), 0], [r6(m * n - b), other('Check the sign of the constant: it is added as written.', 'Vérifie le signe de la constante : on l\'ajoute telle qu\'elle est écrite.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`T = ${f.n(m)} \\times ${f.n(n)} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}.`, `${f.m(`T = ${f.n(m)} \\times ${f.n(n)} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(r6(m * n))} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(r6(m * n))} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)} = ${f.N(ans)}.`))],
      nudge: other('Put n in the rule, multiply first, then add or subtract.', 'Remplace n dans la règle, multiplie d\'abord, puis additionne ou soustrais.'),
    };
  }
  // tier 3: a shrinking pattern, the first term that is below zero
  const start = randInt(r, 5, 20), dec = pick(r, [0.5, 1.5, 2.5, 0.75, 1.25]);
  const ans = Math.floor(start / dec) + 1;
  return {
    prompt: bi((f) => f.t(`A pattern follows the rule ${f.m(`T = ${f.n(start)} - ${f.n(dec)}n`)}. What is the first term number n for which T is negative?`, `Une suite suit la règle ${f.m(`T = ${f.n(start)} - ${f.n(dec)}n`)}. Quel est le premier numéro de terme n pour lequel T est négatif ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[ans - 1, other('At that term T is zero or still positive. Check by putting n in the rule.', 'À ce terme, T est nul ou encore positif. Vérifie en remplaçant n dans la règle.'), 1], [Math.round(start / dec * 100) / 100 === Math.floor(start / dec) ? ans + 1 : r6(start / dec), other('Divide to find where T is zero, then go to the next whole term number.', 'Divise pour trouver où T est nul, puis passe au numéro de terme entier suivant.'), 0]]),
    steps: [bi((f) => f.t(`T is zero when ${f.m(`${f.n(dec)}n = ${f.n(start)}`)}, so ${f.m(`n = ${f.n(r6(start / dec))}`)}.`, `T est nul quand ${f.m(`${f.n(dec)}n = ${f.n(start)}`)}, donc ${f.m(`n = ${f.n(r6(start / dec))}`)}.`)), bi((f) => f.t(`The first whole term number past that is ${f.N(ans)}.`, `Le premier numéro de terme entier après cela est ${f.N(ans)}.`))],
    nudge: other('Find n when T is zero, then take the next whole number.', 'Trouve n quand T est nul, puis prends l\'entier suivant.'),
  };
});

// ── D1.1: one-variable and two-variable data ───────────────────────────────────

const SITUATIONS: { en: string; fr: string; vars: 1 | 2 }[] = [
  { en: 'the height of each student in a class', fr: 'la taille de chaque élève d\'une classe', vars: 1 },
  { en: 'the favourite sport of each student in a school', fr: 'le sport préféré de chaque élève d\'une école', vars: 1 },
  { en: 'the number of pets in each student\'s home', fr: 'le nombre d\'animaux dans la maison de chaque élève', vars: 1 },
  { en: 'the daily high temperature for a month', fr: 'la température maximale quotidienne pendant un mois', vars: 1 },
  { en: 'each student\'s hours of sleep and their score on a quiz', fr: 'les heures de sommeil de chaque élève et sa note à un quiz', vars: 2 },
  { en: 'the height and the arm span of each student', fr: 'la taille et l\'envergure des bras de chaque élève', vars: 2 },
  { en: 'the temperature each day and the number of ice cream cones sold that day', fr: 'la température chaque jour et le nombre de cornets de crème glacée vendus ce jour-là', vars: 2 },
  { en: 'the hours of practice and the number of free throws made by each player', fr: 'les heures de pratique et le nombre de lancers francs réussis par chaque joueur', vars: 2 },
];

export const variables8 = (() => {
  const classify = choiceGen('MS.G8.D1.1.a', (_tier, r) => {
    const s = pick(r, SITUATIONS);
    const m = mc(r, other(s.vars === 1 ? 'One-variable data' : 'Two-variable data', s.vars === 1 ? 'Données à une variable' : 'Données à deux variables'), [[other(s.vars === 1 ? 'Two-variable data' : 'One-variable data', s.vars === 1 ? 'Données à deux variables' : 'Données à une variable'), other(s.vars === 1 ? 'Only one thing is measured for each person or day, so it is one-variable data.' : 'Two things are measured for each person or day and compared, so it is two-variable data.', s.vars === 1 ? 'Une seule chose est mesurée pour chaque personne ou jour : ce sont des données à une variable.' : 'Deux choses sont mesurées pour chaque personne ou jour et comparées : ce sont des données à deux variables.')]]);
    return {
      prompt: other(`A class collects ${s.en}. What kind of data is this?`, `Une classe recueille ${s.fr}. De quel genre de données s'agit-il ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [other('Count how many different things are measured for each person or day.', 'Compte combien de choses différentes sont mesurées pour chaque personne ou jour.'), other(s.vars === 1 ? 'Only one thing is measured, so it is one-variable data.' : 'Two things are measured, so it is two-variable data.', s.vars === 1 ? 'Une seule chose est mesurée : ce sont des données à une variable.' : 'Deux choses sont mesurées : ce sont des données à deux variables.')],
      nudge: other('How many things are measured for each person or day: one or two?', 'Combien de choses sont mesurées pour chaque personne ou jour : une ou deux ?'),
    };
  });
  const question = choiceGen('MS.G8.D1.1.a', (_tier, r) => {
    const two = SITUATIONS.filter((s) => s.vars === 2), one = SITUATIONS.filter((s) => s.vars === 1);
    const right = pick(r, two), w = [...one].sort(() => r() - 0.5).slice(0, 3);
    const m = mc(r, other(right.en.charAt(0).toUpperCase() + right.en.slice(1), right.fr.charAt(0).toUpperCase() + right.fr.slice(1)), w.map((x): [Text, Text] => [other(x.en.charAt(0).toUpperCase() + x.en.slice(1), x.fr.charAt(0).toUpperCase() + x.fr.slice(1)), other('This measures only one thing, so it does not compare two variables.', 'Cela ne mesure qu\'une seule chose : on ne compare pas deux variables.')]));
    return {
      prompt: other('Which of these needs two-variable data to answer a question about a relationship?', 'Laquelle de ces situations demande des données à deux variables pour répondre à une question sur une relation ?'),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [other('A relationship compares two things, so each person or day needs two measurements.', 'Une relation compare deux choses : chaque personne ou jour a besoin de deux mesures.'), other('Pick the choice that records two different things for each one.', 'Choisis la situation qui note deux choses différentes pour chacun.')],
      nudge: other('A relationship needs two measurements for each person or day.', 'Une relation demande deux mesures pour chaque personne ou jour.'),
    };
  });
  const graph = choiceGen('MS.G8.D1.1.a', (_tier, r) => {
    const s = pick(r, SITUATIONS);
    const right = s.vars === 1 ? other('A bar graph or histogram', 'Un diagramme à bandes ou un histogramme') : other('A scatter plot', 'Un nuage de points');
    const wrong = s.vars === 1 ? other('A scatter plot', 'Un nuage de points') : other('A bar graph or histogram', 'Un diagramme à bandes ou un histogramme');
    const m = mc(r, right, [[wrong, other(s.vars === 1 ? 'A scatter plot needs two measurements for each point. This data has only one.' : 'A bar graph shows one variable. To see how two variables are related, plot one against the other.', s.vars === 1 ? 'Un nuage de points demande deux mesures pour chaque point. Ces données n\'en ont qu\'une.' : 'Un diagramme à bandes montre une variable. Pour voir le lien entre deux variables, place l\'une en fonction de l\'autre.')], [other('A circle graph of the two totals', 'Un diagramme circulaire des deux totaux'), other('Totals hide the pairs of measurements. Keep each pair.', 'Les totaux cachent les paires de mesures. Garde chaque paire.')]]);
    return {
      prompt: other(`A class collects ${s.en}. Which graph shows this data best?`, `Une classe recueille ${s.fr}. Quel graphique montre le mieux ces données ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'AP',
      steps: [other('First decide whether the data has one variable or two.', 'Décide d\'abord si les données ont une variable ou deux.'), other(s.vars === 1 ? 'One variable is shown with a bar graph or a histogram.' : 'Two variables are shown with a scatter plot.', s.vars === 1 ? 'Une variable se montre avec un diagramme à bandes ou un histogramme.' : 'Deux variables se montrent avec un nuage de points.')],
      nudge: other('One variable or two? Pick the graph that fits.', 'Une variable ou deux ? Choisis le graphique qui convient.'),
    };
  });
  return tierGen(classify, question, graph);
})();

// ── D1.3: scatter plots ────────────────────────────────────────────────────────

const PAIRS: { x: [string, string]; y: [string, string] }[] = [
  { x: ['hours of practice', 'heures de pratique'], y: ['free throws made', 'lancers francs réussis'] },
  { x: ['hours of sleep', 'heures de sommeil'], y: ['quiz score', 'note au quiz'] },
  { x: ['temperature (tens of degrees)', 'température (dizaines de degrés)'], y: ['cones sold (tens)', 'cornets vendus (dizaines)'] },
  { x: ['height (decimetres)', 'taille (décimètres)'], y: ['arm span (decimetres)', 'envergure (décimètres)'] },
];

const scatterPoints = (r: () => number, n: number, size: number): { x: number; y: number }[] => {
  const xs = new Set<number>();
  while (xs.size < n) xs.add(randInt(r, 1, size - 1));
  return [...xs].sort((a, b) => a - b).map((x) => ({ x, y: Math.max(1, Math.min(size - 1, x + randInt(r, -1, 1))) }));
};

export const scatter8 = (() => {
  const plot: Generator = (tier, seed) => {
    const r = makeRng(seed);
    const p = pick(r, PAIRS), size = 11, x = randInt(r, 2, 9);
    let y = randInt(r, 2, 9); if (y === x) y = y === 9 ? 3 : y + 1;
    return build({
      skill: 'MS.G8.D1.3.a', tier, seed, category: 'AP', format: 'point',
      prompt: bi((f) => f.t(`A scatter plot compares ${p.x[0]} (horizontal axis) with ${p.y[0]} (vertical axis). One data point has ${f.N(x)} for the horizontal axis and ${f.N(y)} for the vertical axis. Plot it by tapping the grid.`, `Un nuage de points compare ${p.x[1]} (axe horizontal) avec ${p.y[1]} (axe vertical). Un point a ${f.N(x)} sur l'axe horizontal et ${f.N(y)} sur l'axe vertical. Place-le en touchant la grille.`)),
      visual: { type: 'plane', size, click: true },
      answer: { kind: 'point', x, y, tol: 0.45 },
      steps: [bi((f) => f.t(`Go across ${f.N(x)} on the horizontal axis.`, `Avance de ${f.N(x)} sur l'axe horizontal.`)), bi((f) => f.t(`Then go up ${f.N(y)} and mark the point.`, `Puis monte de ${f.N(y)} et marque le point.`))],
      nudge: t('The first variable goes across and the second goes up.', 'La première variable va vers la droite et la deuxième vers le haut.'),
      stepHint: t('Count across first, then up.', 'Compte d\'abord vers la droite, puis vers le haut.'),
      wrong: [{ answer: { kind: 'point', x: y, y: x, tol: 0.45 }, stepIndex: 0, why: t('It looks like the axes were swapped. The horizontal axis is the first variable.', 'Il semble que les axes ont été inversés. L\'axe horizontal est la première variable.') }],
    });
  };
  const read = numGen('MS.G8.D1.3.a', (_tier, r) => {
    const size = 11, pts = scatterPoints(r, randInt(r, 6, 9), size), p = pick(r, PAIRS);
    const k = randInt(r, 3, 8);
    const ans = pts.filter((q) => q.y > k).length;
    const visual: Visual = { type: 'plane', size, points: pts.map((q) => ({ x: q.x, y: q.y })) };
    return {
      prompt: bi((f) => f.t(`The scatter plot compares ${p.x[0]} (horizontal) with ${p.y[0]} (vertical). How many points have a vertical value greater than ${f.N(k)}?`, `Le nuage de points compare ${p.x[1]} (horizontal) avec ${p.y[1]} (vertical). Combien de points ont une valeur verticale supérieure à ${f.N(k)} ?`)),
      visual, answer: ans, category: 'AP',
      wrong: wr(ans, [[pts.filter((q) => q.y >= k).length, t('A point exactly at that value is not greater than it. Count only the points above it.', 'Un point exactement à cette valeur n\'est pas supérieur. Compte seulement les points au-dessus.'), 1], [pts.filter((q) => q.x > k).length, t('That uses the horizontal values. The question is about the vertical axis.', 'Cela utilise les valeurs horizontales. La question porte sur l\'axe vertical.'), 0]]),
      steps: [bi((f) => f.t(`Find ${f.N(k)} on the vertical axis and look above it.`, `Trouve ${f.N(k)} sur l'axe vertical et regarde au-dessus.`)), bi((f) => f.t(`${f.N(ans)} points are above that line.`, `${f.N(ans)} points sont au-dessus de cette ligne.`))],
      nudge: t('Look only at how high each point is, not how far across.', 'Regarde seulement la hauteur de chaque point, pas sa position horizontale.'),
    };
  });
  const axis = choiceGen('MS.G8.D1.3.a', (_tier, r) => {
    const cases: { en: string; fr: string; ind: [string, string]; dep: [string, string] }[] = [
      { en: 'whether more hours of practice lead to more free throws made', fr: 'si plus d\'heures de pratique mènent à plus de lancers francs réussis', ind: ['Hours of practice', 'Heures de pratique'], dep: ['Free throws made', 'Lancers francs réussis'] },
      { en: 'whether warmer days lead to more ice cream sold', fr: 'si les journées plus chaudes mènent à plus de crème glacée vendue', ind: ['Temperature', 'Température'], dep: ['Ice cream sold', 'Crème glacée vendue'] },
      { en: 'whether more sleep leads to a better quiz score', fr: 'si plus de sommeil mène à une meilleure note au quiz', ind: ['Hours of sleep', 'Heures de sommeil'], dep: ['Quiz score', 'Note au quiz'] },
      { en: 'whether more rainfall leads to taller plants', fr: 'si plus de pluie mène à des plantes plus hautes', ind: ['Rainfall', 'Précipitations'], dep: ['Plant height', 'Hauteur des plantes'] },
    ];
    const c = pick(r, cases);
    const m = mc(r, other(c.ind[0], c.ind[1]), [[other(c.dep[0], c.dep[1]), other('That is the result being measured. The variable that might cause the change goes on the horizontal axis.', 'C\'est le résultat mesuré. La variable qui pourrait causer le changement va sur l\'axe horizontal.')], [other('The date', 'La date'), other('The date is not one of the two variables in this question.', 'La date n\'est pas l\'une des deux variables de cette question.')]]);
    return {
      prompt: other(`You make a scatter plot to see ${c.en}. Which variable goes on the horizontal axis?`, `Tu fais un nuage de points pour voir ${c.fr}. Quelle variable va sur l'axe horizontal ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [other('Ask which variable might cause the change in the other.', 'Demande-toi quelle variable pourrait causer le changement de l\'autre.'), other('That one goes on the horizontal axis. The result goes on the vertical axis.', 'Celle-là va sur l\'axe horizontal. Le résultat va sur l\'axe vertical.')],
      nudge: other('Which variable might cause the change in the other?', 'Quelle variable pourrait causer le changement de l\'autre ?'),
    };
  });
  return tierGen(plot, read, axis);
})();

// ── D1.4: infographics ─────────────────────────────────────────────────────────

const PARTS8: [string, string][] = [['a title', 'un titre'], ['labelled axes with units', 'des axes étiquetés avec des unités'], ['the source of the data', 'la source des données'], ['a statement about the trend in the data', 'un énoncé sur la tendance des données'], ['a key', 'une légende']];

export const infographic8 = (() => {
  const missing = choiceGen('MS.G8.D1.4.a', (_tier, r) => {
    const gone = randInt(r, 0, PARTS8.length - 1), present = PARTS8.filter((_, i) => i !== gone);
    const m = mc(r, other(PARTS8[gone]![0], PARTS8[gone]![1]), present.slice(0, 3).map(([en, fr]): [Text, Text] => [other(en, fr), other('That part is already on the infographic. Look for the one that is missing.', 'Cette partie figure déjà sur l\'infographie. Cherche celle qui manque.')]));
    return {
      prompt: other(`An infographic about a scatter plot has ${present.map(([en]) => en).join(', ')}. Which important part is missing?`, `Une infographie sur un nuage de points a ${present.map(([, fr]) => fr).join(', ')}. Quelle partie importante manque ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [other('A good infographic about two-variable data has a title, labelled axes with units, the source, a statement about the trend and a key.', 'Une bonne infographie sur des données à deux variables a un titre, des axes étiquetés avec des unités, la source, un énoncé sur la tendance et une légende.'), other(`Here, ${PARTS8[gone]![0]} is missing.`, `Ici, ${PARTS8[gone]![1]} manque.`)],
      nudge: other('Compare the list with what a good infographic needs.', 'Compare la liste avec ce dont une bonne infographie a besoin.'),
    };
  });
  const headline = numGen('MS.G8.D1.4.a', (_tier, r) => {
    const total = pick(r, [20, 25, 40, 50, 80, 120, 200]), k = randInt(r, 2, total - 2), p = r6((100 * k) / total);
    return {
      prompt: bi((f) => f.t(`For an infographic, a survey of ${f.N(total)} students found that ${f.N(k)} of them text a friend every day. What percent should the headline say?`, `Pour une infographie, un sondage auprès de ${f.N(total)} élèves a révélé que ${f.N(k)} d'entre eux écrivent à un ami chaque jour. Quel pourcentage le titre devrait-il indiquer ?`)),
      answer: p, category: 'AP',
      wrong: wr(p, [[r6(k / total), t('That is the decimal. A headline percent is out of 100.', 'C\'est le nombre décimal. Un pourcentage de titre est sur 100.'), 1], [r6(100 - p), t('That is the percent who do NOT. The headline is about those who do.', 'C\'est le pourcentage de ceux qui ne le font PAS. Le titre porte sur ceux qui le font.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(k)} \\div ${f.n(total)} \\times 100`)} = ${f.N(p)}.`, `${f.m(`${f.n(k)} \\div ${f.n(total)} \\times 100`)} = ${f.N(p)}.`)), bi((f) => f.t(`The headline should say ${f.N(p)}%.`, `Le titre devrait indiquer ${f.N(p)} %.`))],
      nudge: t('Divide the part by the whole and multiply by 100.', 'Divise la partie par le tout et multiplie par 100.'),
    };
  });
  const choose = choiceGen('MS.G8.D1.4.a', (_tier, r) => {
    const cases: { en: string; fr: string }[] = [
      { en: 'whether students who sleep more score higher on quizzes', fr: 'si les élèves qui dorment plus obtiennent de meilleures notes aux quiz' },
      { en: 'whether taller students also have a longer arm span', fr: 'si les élèves plus grands ont aussi une plus grande envergure' },
      { en: 'whether hotter days mean more cold drinks sold', fr: 'si les journées plus chaudes veulent dire plus de boissons froides vendues' },
    ];
    const c = pick(r, cases);
    const m = mc(r, other('A scatter plot with a trend statement', 'Un nuage de points avec un énoncé sur la tendance'), [[other('A circle graph of the totals', 'Un diagramme circulaire des totaux'), other('A circle graph shows parts of one whole, not how two variables are related.', 'Un diagramme circulaire montre les parties d\'un tout, pas le lien entre deux variables.')], [other('A list of the names of the students', 'Une liste des noms des élèves'), other('Names do not show a relationship between two measurements.', 'Des noms ne montrent pas de lien entre deux mesures.')]]);
    return {
      prompt: other(`An infographic is meant to show ${c.en}. Which main graphic fits best?`, `Une infographie doit montrer ${c.fr}. Quel graphique principal convient le mieux ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'AP',
      steps: [other('The question compares two variables.', 'La question compare deux variables.'), other('A scatter plot shows how two variables are related, and a short statement tells the trend.', 'Un nuage de points montre le lien entre deux variables, et un court énoncé indique la tendance.')],
      nudge: other('Which graph shows how two variables are related?', 'Quel graphique montre le lien entre deux variables ?'),
    };
  });
  return tierGen(missing, headline, choose);
})();

// ── D1.6: analysis ─────────────────────────────────────────────────────────────

const ISSUES: { en: string; fr: string; why: [string, string] }[] = [
  { en: 'a scatter plot whose axes skip from 0 to 50 with no marks between', fr: 'un nuage de points dont les axes sautent de 0 à 50 sans repères entre les deux', why: ['The missing marks make it hard to read the real values, so the trend can look different.', 'L\'absence de repères rend difficile la lecture des vraies valeurs : la tendance peut sembler différente.'] },
  { en: 'a line of best fit drawn through only the three highest points', fr: 'une droite de régression tracée seulement par les trois points les plus élevés', why: ['Leaving out the other points makes the trend look stronger than it is.', 'Laisser de côté les autres points fait paraître la tendance plus forte qu\'elle ne l\'est.'] },
  { en: 'a bar graph whose vertical axis starts at 80 instead of 0', fr: 'un diagramme à bandes dont l\'axe vertical commence à 80 au lieu de 0', why: ['The bars are cut off at the bottom, so small differences look big.', 'Les barres sont coupées en bas : de petites différences paraissent grandes.'] },
  { en: 'a scatter plot of only 4 students used to describe a whole school', fr: 'un nuage de points de seulement 4 élèves utilisé pour décrire toute une école', why: ['A very small sample may not represent everyone, so the conclusion is weak.', 'Un très petit échantillon peut ne pas représenter tout le monde : la conclusion est faible.'] },
];

export const analysis8 = (() => {
  const why = choiceGen('MS.G8.D1.6.a', (_tier, r) => {
    const i = randInt(r, 0, ISSUES.length - 1), c = ISSUES[i]!;
    const m = mc(r, other(c.why[0], c.why[1]), ISSUES.filter((_, j) => j !== i).slice(0, 3).map((x): [Text, Text] => [other(x.why[0], x.why[1]), other('That reason belongs to a different graph problem. Match the reason to the problem described.', 'Cette raison correspond à un autre problème de graphique. Associe la raison au problème décrit.')]));
    return {
      prompt: other(`A report shows ${c.en}. Why can this be misleading?`, `Un rapport montre ${c.fr}. Pourquoi cela peut-il induire en erreur ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [other('Ask what the problem does to how the data looks.', 'Demande-toi ce que le problème fait à l\'apparence des données.'), other(c.why[0], c.why[1])],
      nudge: other('Picture the graph. What does this problem do to the trend or the size of the differences?', 'Imagine le graphique. Que fait ce problème à la tendance ou à la taille des différences ?'),
    };
  });
  const ratio = numGen('MS.G8.D1.6.a', (_tier, r) => {
    const base = randInt(r, 4, 9) * 10, u = randInt(r, 1, 4) * 5, k = randInt(r, 2, 5), v1 = base + u, v2 = base + k * u;
    return {
      prompt: bi((f) => f.t(`A bar graph's vertical axis starts at ${f.N(base)}. One bar shows ${f.N(v1)} and another shows ${f.N(v2)}. About how many times as tall does the second bar look as the first?`, `L'axe vertical d'un diagramme à bandes commence à ${f.N(base)}. Une barre montre ${f.N(v1)} et une autre montre ${f.N(v2)}. Environ combien de fois la deuxième barre semble-t-elle plus haute que la première ?`)),
      answer: k, category: 'AP',
      wrong: wr(k, [[r6(v2 / v1), t('That is the real ratio. The bars only show the part above the starting value of the axis.', 'C\'est le vrai rapport. Les barres ne montrent que la partie au-dessus de la valeur de départ de l\'axe.'), 1], [v2 - v1, t('That is the difference in the values, not how many times as tall.', 'C\'est l\'écart entre les valeurs, pas le nombre de fois plus haute.'), 1]]),
      steps: [bi((f) => f.t(`The visible heights are ${f.m(`${f.n(v1)} - ${f.n(base)}`)} = ${f.N(u)} and ${f.m(`${f.n(v2)} - ${f.n(base)}`)} = ${f.N(k * u)}.`, `Les hauteurs visibles sont ${f.m(`${f.n(v1)} - ${f.n(base)}`)} = ${f.N(u)} et ${f.m(`${f.n(v2)} - ${f.n(base)}`)} = ${f.N(k * u)}.`)), bi((f) => f.t(`${f.m(`${f.n(k * u)} \\div ${f.n(u)}`)} = ${f.N(k)} times as tall.`, `${f.m(`${f.n(k * u)} \\div ${f.n(u)}`)} = ${f.N(k)} fois plus haute.`))],
      nudge: t('Subtract the axis starting value from each bar before comparing the heights.', 'Soustrais la valeur de départ de l\'axe de chaque barre avant de comparer les hauteurs.'),
    };
  });
  const cause = choiceGen('MS.G8.D1.6.a', (_tier, r) => {
    const cases: { en: string; fr: string; a: [string, string]; b: [string, string] }[] = [
      { en: 'Ice cream sales and sunburns both rise in summer, and a scatter plot shows a strong positive trend.', fr: 'Les ventes de crème glacée et les coups de soleil augmentent tous deux l\'été, et un nuage de points montre une forte tendance positive.', a: ['Hot sunny weather could explain both, so one does not cause the other.', 'Le temps chaud et ensoleillé pourrait expliquer les deux : l\'un ne cause pas l\'autre.'], b: ['Eating ice cream causes sunburns.', 'Manger de la crème glacée cause des coups de soleil.'] },
      { en: 'Students with more shoes in their closets also score higher on a reading test, and a scatter plot shows a positive trend.', fr: 'Les élèves qui ont plus de souliers dans leur garde-robe obtiennent aussi de meilleures notes en lecture, et un nuage de points montre une tendance positive.', a: ['Older students could explain both, so the shoes do not cause the scores.', 'Des élèves plus âgés pourraient expliquer les deux : les souliers ne causent pas les notes.'], b: ['Buying shoes makes students read better.', 'Acheter des souliers aide les élèves à mieux lire.'] },
    ];
    const c = pick(r, cases);
    const m = mc(r, other(c.a[0], c.a[1]), [[other(c.b[0], c.b[1]), other('A trend shows that two things move together. It does not prove that one causes the other.', 'Une tendance montre que deux choses évoluent ensemble. Elle ne prouve pas que l\'une cause l\'autre.')], [other('The data must be wrong, because the trend is strong.', 'Les données doivent être fausses, parce que la tendance est forte.'), other('A strong trend can be real. The problem is the claim about cause.', 'Une forte tendance peut être réelle. Le problème est l\'affirmation sur la cause.')]]);
    return {
      prompt: other(`${c.en} Which conclusion is the most reasonable?`, `${c.fr} Quelle conclusion est la plus raisonnable ?`),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [other('A trend means the variables move together. It does not prove a cause.', 'Une tendance veut dire que les variables évoluent ensemble. Elle ne prouve pas une cause.'), other('Look for another factor that could explain both.', 'Cherche un autre facteur qui pourrait expliquer les deux.')],
      nudge: other('Could a third thing explain both variables?', 'Une troisième chose pourrait-elle expliquer les deux variables ?'),
    };
  });
  return tierGen(why, ratio, cause);
})();

// ── E1.2: build models from views ──────────────────────────────────────────────

/** A footprint of rows by columns where every square holds at least one cube; the front view shows the tallest stack in each column. */
export const views8 = (() => {
  const model = (r: () => number): { rows: number; cols: number; front: number[] } => {
    const rows = randInt(r, 2, 3), cols = randInt(r, 3, 4);
    return { rows, cols, front: Array.from({ length: cols }, () => randInt(r, 1, 4)) };
  };
  const text = (f: F, m: { rows: number; cols: number; front: number[] }): string => f.t(`The top view is a ${m.rows} by ${m.cols} rectangle of squares, so every square has at least one cube. The front view shows column heights ${m.front.map((h) => f.N(h)).join(', ')}.`, `La vue de dessus est un rectangle de ${m.rows} sur ${m.cols} carrés : chaque carré a au moins un cube. La vue de face montre des hauteurs de colonnes ${m.front.map((h) => f.N(h)).join(', ')}.`);
  const total = numGen('MS.G8.E1.2.a', (_tier, r) => {
    const rows = randInt(r, 2, 3), cols = randInt(r, 2, 4), g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(r, 1, 4)));
    const ans = g.flat().reduce((s, h) => s + h, 0);
    return {
      prompt: bi((f) => f.t(`A model is built from unit cubes on a ${f.N(rows)} by ${f.N(cols)} grid. The stack heights, row by row, are ${g.map((row) => '(' + row.map((h) => f.N(h)).join(', ') + ')').join(' ')}. How many cubes are in the model?`, `Un modèle est construit avec des cubes unités sur une grille de ${f.N(rows)} sur ${f.N(cols)}. Les hauteurs des piles, rangée par rangée, sont ${g.map((row) => '(' + row.map((h) => f.N(h)).join(', ') + ')').join(' ')}. Combien de cubes y a-t-il dans le modèle ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[Math.max(...g.flat()) * rows * cols, t('That treats every stack as the tallest one. Add the real heights.', 'Cela traite chaque pile comme la plus haute. Additionne les vraies hauteurs.'), 0], [rows * cols, t('That counts the squares of the top view, one per stack. Add the cubes in each stack.', 'Cela compte les carrés de la vue de dessus, un par pile. Additionne les cubes de chaque pile.'), 0]]),
      steps: [t('Each number is the cubes in one stack. Add them all.', 'Chaque nombre est le nombre de cubes d\'une pile. Additionne-les tous.'), bi((f) => f.t(`${f.m(g.flat().map((h) => f.n(h)).join(' + '))} = ${f.N(ans)}.`, `${f.m(g.flat().map((h) => f.n(h)).join(' + '))} = ${f.N(ans)}.`))],
      nudge: t('Add the number of cubes in every stack.', 'Additionne le nombre de cubes de chaque pile.'),
    };
  });
  const least = numGen('MS.G8.E1.2.a', (_tier, r) => {
    const m = model(r), ans = m.front.reduce((s, h) => s + h + (m.rows - 1), 0);
    return {
      prompt: bi((f) => f.t(`${text(f, m)} What is the fewest cubes the model can have?`, `${text(f, m)} Quel est le plus petit nombre de cubes que le modèle peut avoir ?`)),
      answer: ans, category: 'TH',
      wrong: wr(ans, [[m.front.reduce((s, h) => s + h, 0), t('That puts only one stack in each column. Every other square in the column still needs at least one cube.', 'Cela ne met qu\'une pile dans chaque colonne. Chaque autre carré de la colonne a quand même besoin d\'au moins un cube.'), 1], [m.rows * m.cols, t('That is one cube on each square. The front view needs some columns to be taller.', 'C\'est un cube sur chaque carré. La vue de face demande que certaines colonnes soient plus hautes.'), 0]]),
      steps: [bi((f) => f.t(`In each column one stack is as tall as the front view shows, and the other ${f.N(m.rows - 1)} stack${m.rows - 1 > 1 ? 's' : ''} can have just 1 cube.`, `Dans chaque colonne, une pile est aussi haute que la vue de face le montre, et les ${f.N(m.rows - 1)} autre${m.rows - 1 > 1 ? 's' : ''} pile${m.rows - 1 > 1 ? 's' : ''} peu${m.rows - 1 > 1 ? 'vent' : 't'} avoir seulement 1 cube.`)), bi((f) => f.t(`${f.m(m.front.map((h) => `(${f.n(h)} + ${f.n(m.rows - 1)})`).join(' + '))} = ${f.N(ans)}.`, `${f.m(m.front.map((h) => `(${f.n(h)} + ${f.n(m.rows - 1)})`).join(' + '))} = ${f.N(ans)}.`))],
      nudge: t('In each column, one stack is as tall as the front view shows; the others can be as short as 1.', 'Dans chaque colonne, une pile est aussi haute que la vue de face le montre ; les autres peuvent avoir seulement 1 cube.'),
    };
  });
  const most = numGen('MS.G8.E1.2.a', (_tier, r) => {
    const m = model(r), ans = m.front.reduce((s, h) => s + h * m.rows, 0);
    return {
      prompt: bi((f) => f.t(`${text(f, m)} What is the greatest number of cubes the model can have?`, `${text(f, m)} Quel est le plus grand nombre de cubes que le modèle peut avoir ?`)),
      answer: ans, category: 'TH',
      wrong: wr(ans, [[m.front.reduce((s, h) => s + h, 0), t('That counts only one stack in each column. Every stack in a column can be as tall as the front view shows.', 'Cela ne compte qu\'une pile par colonne. Chaque pile d\'une colonne peut être aussi haute que la vue de face le montre.'), 1], [m.front.reduce((s, h) => s + h + (m.rows - 1), 0), t('That is the fewest cubes. For the most, make every stack in the column as tall as allowed.', 'C\'est le plus petit nombre de cubes. Pour le plus grand, fais chaque pile de la colonne aussi haute que permis.'), 1]]),
      steps: [bi((f) => f.t(`Every stack in a column can be as tall as the front view allows. Each column has ${f.N(m.rows)} stacks.`, `Chaque pile d'une colonne peut être aussi haute que la vue de face le permet. Chaque colonne a ${f.N(m.rows)} piles.`)), bi((f) => f.t(`${f.m(`${f.n(m.rows)} \\times (${m.front.map((h) => f.n(h)).join(' + ')})`)} = ${f.N(ans)}.`, `${f.m(`${f.n(m.rows)} \\times (${m.front.map((h) => f.n(h)).join(' + ')})`)} = ${f.N(ans)}.`))],
      nudge: t('Make every stack in each column as tall as the front view allows, then add.', 'Rends chaque pile de chaque colonne aussi haute que la vue de face le permet, puis additionne.'),
    };
  });
  return tierGen(total, least, most);
})();
