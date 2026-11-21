// Grade 6 Data strand (D), the expectations that were not built before 2.8.1, using words and numbers only (no drawn graphs):
// discrete and continuous data, intervals, choosing a graph, and misleading graphs.
import { pick, randInt, shuffle } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const list = (f: { n: (x: number) => string }, xs: number[]): string => xs.map((x) => f.n(x)).join(',\\ ');

type Pair = [string, string];
const DISCRETE: Pair[] = [
  ['the number of pets in a family', 'le nombre d\'animaux de compagnie dans une famille'], ['the number of goals scored in a game', 'le nombre de buts marqués dans un match'],
  ['the number of shoes sold in a day', 'le nombre de paires de souliers vendues en une journée'], ['the number of students in a class', 'le nombre d\'élèves dans une classe'],
  ['the number of pages in a book', 'le nombre de pages dans un livre'], ['the number of coins in a jar', 'le nombre de pièces dans un bocal'],
];
const CONTINUOUS: Pair[] = [
  ['the height of a student', 'la taille d\'un élève'], ['the time to run 100 metres', 'le temps pour courir 100 mètres'],
  ['the mass of a backpack', 'la masse d\'un sac à dos'], ['the temperature outside', 'la température à l\'extérieur'],
  ['the length of a river', 'la longueur d\'une rivière'], ['the volume of juice in a glass', 'le volume de jus dans un verre'],
];
const txt = (p: Pair): Text => t(p[0], p[1]);
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const capText = (p: Pair): Text => t(cap(p[0]), cap(p[1]));

/** MS.G6.D1.1.a: discrete versus continuous data */
const pickDiscrete = choiceGen('MS.G6.D1.1.a', (_tier, r) => {
  const d = pick(r, DISCRETE), cs = shuffle(r, CONTINUOUS).slice(0, 2);
  const m = mc(r, capText(d), cs.map((c): [Text, Text] => [capText(c), t('This can take any value in a range, such as a decimal, so it is continuous. Discrete data is counted in separate whole steps.', 'Cela peut prendre n\'importe quelle valeur dans un intervalle, comme une décimale : c\'est continu. Les données discrètes se comptent par pas entiers distincts.')]));
  return {
    prompt: t('Which of these is discrete data?', 'Lesquelles de ces données sont discrètes ?'),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Discrete data is counted, so it has separate values with nothing in between (you cannot have half a goal).', 'Les données discrètes se comptent : elles ont des valeurs distinctes sans rien entre elles (on ne peut pas avoir un demi-but).'), t('Measurements, like length or time, can take any value in between: that is continuous.', 'Les mesures, comme la longueur ou le temps, peuvent prendre n\'importe quelle valeur entre deux autres : c\'est continu.')],
    nudge: t('Is it counted in whole steps, or measured?', 'Est-ce compté par pas entiers, ou mesuré ?'),
  };
});
const pickContinuous = choiceGen('MS.G6.D1.1.a', (_tier, r) => {
  const c = pick(r, CONTINUOUS), ds = shuffle(r, DISCRETE).slice(0, 2);
  const m = mc(r, capText(c), ds.map((d): [Text, Text] => [capText(d), t('This is counted in whole steps with nothing in between, so it is discrete, not continuous.', 'Cela se compte par pas entiers sans rien entre eux : c\'est discret, pas continu.')]));
  return {
    prompt: t('Which of these is continuous data?', 'Lesquelles de ces données sont continues ?'),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Continuous data is measured and can take any value in a range, including decimals.', 'Les données continues se mesurent et peuvent prendre n\'importe quelle valeur dans un intervalle, y compris des décimales.'), t('Counted things, like people or goals, are discrete.', 'Les choses comptées, comme des personnes ou des buts, sont discrètes.')],
    nudge: t('Can it be any value between two numbers, such as 1.5?', 'Peut-elle prendre n\'importe quelle valeur entre deux nombres, comme 1,5 ?'),
  };
});
const SCENARIOS: { en: string; fr: string; continuous: boolean }[] = [
  { en: 'A scientist records the temperature every hour.', fr: 'Un scientifique note la température chaque heure.', continuous: true },
  { en: 'A shop records how many people come in each hour.', fr: 'Un magasin note combien de personnes entrent chaque heure.', continuous: false },
  { en: 'A student measures the height of a plant every week.', fr: 'Un élève mesure la hauteur d\'une plante chaque semaine.', continuous: true },
  { en: 'A coach counts the goals scored in each game.', fr: 'Un entraîneur compte les buts marqués à chaque match.', continuous: false },
  { en: 'A runner records the distance run each day.', fr: 'Une coureuse note la distance parcourue chaque jour.', continuous: true },
  { en: 'A school records how many students are absent each day.', fr: 'Une école note combien d\'élèves sont absents chaque jour.', continuous: false },
];
const withReason = choiceGen('MS.G6.D1.1.a', (_tier, r) => {
  const s = pick(r, SCENARIOS);
  const D: [Text, Text] = [t('Discrete, because it is counted in whole units', 'Discrètes, parce qu\'elles sont comptées en unités entières'), t('It is a measurement that can be any value in a range, not a count of whole things.', 'C\'est une mesure qui peut prendre n\'importe quelle valeur dans un intervalle, pas un compte de choses entières.')];
  const C: [Text, Text] = [t('Continuous, because it is measured and can be any value in a range', 'Continues, parce qu\'elles sont mesurées et peuvent prendre n\'importe quelle valeur dans un intervalle'), t('It is counted in whole units, so it cannot be a decimal like 2.5.', 'Elle est comptée en unités entières : elle ne peut pas être une décimale comme 2,5.')];
  const W1: [Text, Text] = [t('Discrete, because it is recorded at set times', 'Discrètes, parce qu\'elles sont notées à des moments précis'), t('When the readings are taken does not decide it. Look at the thing measured: is it counted, or measured?', 'Le moment des relevés n\'en décide pas. Regarde ce qui est mesuré : est-ce compté, ou mesuré ?')];
  const W2: [Text, Text] = [t('Continuous, because it is shown with a line', 'Continues, parce qu\'elles sont représentées par une ligne'), t('The graph used does not decide it. Look at the thing recorded: is it counted, or measured?', 'Le graphique utilisé n\'en décide pas. Regarde ce qui est noté : est-ce compté, ou mesuré ?')];
  const right = s.continuous ? C : D, other = s.continuous ? D : C;
  const m = mc(r, right[0], [[other[0], right[1]], W1, W2]);
  return {
    prompt: bi((f) => f.t(`${s.en} Is this data discrete or continuous, and why?`, `${s.fr} Ces données sont-elles discrètes ou continues, et pourquoi ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [t('Ask what is recorded each time: a count of whole things, or a measurement?', 'Demande-toi ce qui est noté chaque fois : un compte de choses entières, ou une mesure ?'), t(s.continuous ? 'A measurement can be any value in a range, so the data is continuous.' : 'A count uses whole units, so the data is discrete.', s.continuous ? 'Une mesure peut prendre n\'importe quelle valeur dans un intervalle : les données sont continues.' : 'Un compte utilise des unités entières : les données sont discrètes.')],
    nudge: t('Could the value be 2.5? If yes, it is continuous.', 'La valeur pourrait-elle être 2,5 ? Si oui, elles sont continues.'),
  };
});
export const discreteContinuous6 = tierGen(pickDiscrete, pickContinuous, withReason);

/** MS.G6.D1.2.a: collecting and organizing data, including intervals */
const countInInterval = numGen('MS.G6.D1.2.a', (_tier, r) => {
  const lo = pick(r, [40, 50, 60, 70]);
  const data = Array.from({ length: 12 }, () => randInt(r, 40, 99));
  data[randInt(r, 0, 11)] = randInt(r, lo, lo + 9);
  const ans = data.filter((v) => v >= lo && v <= lo + 9).length;
  return {
    prompt: bi((f) => f.t(`Test scores: ${f.m(list(f, data))}. How many scores are in the interval ${f.N(lo)} to ${f.N(lo + 9)}, counting both ends?`, `Résultats à un test : ${f.m(list(f, data))}. Combien de résultats sont dans l'intervalle de ${f.N(lo)} à ${f.N(lo + 9)}, extrémités comprises ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[data.filter((v) => v >= lo).length, t('That counts every score from the start of the interval upward. Stop at the end of the interval.', 'Cela compte tous les résultats à partir du début de l\'intervalle. Arrête-toi à la fin de l\'intervalle.'), 1], [data.filter((v) => v > lo && v < lo + 9).length, t('The end values belong to the interval too, so count them.', 'Les valeurs des extrémités font partie de l\'intervalle : compte-les.'), 1]]),
    steps: [bi((f) => f.t(`List the scores from ${f.N(lo)} up to ${f.N(lo + 9)}.`, `Note les résultats de ${f.N(lo)} jusqu'à ${f.N(lo + 9)}.`)), bi((f) => f.t(`There are ${f.N(ans)}.`, `Il y en a ${f.N(ans)}.`))],
    nudge: t('Go through the list and tick each score that falls inside the interval.', 'Parcours la liste et coche chaque résultat qui tombe dans l\'intervalle.'),
  };
});
const intervalCount = numGen('MS.G6.D1.2.a', (_tier, r) => {
  const w = pick(r, [5, 10, 20]);
  const lo = randInt(r, 3, 24), hi = lo + randInt(r, 3 * w, 6 * w);
  const ans = Math.floor(hi / w) - Math.floor(lo / w) + 1;
  const start = Math.floor(lo / w) * w;
  return {
    prompt: bi((f) => f.t(`The data go from ${f.N(lo)} to ${f.N(hi)}. You use equal intervals of width ${f.N(w)}, with the first interval starting at ${f.N(start)} (so the intervals are ${f.N(start)} to ${f.N(start + w - 1)}, then ${f.N(start + w)} to ${f.N(start + 2 * w - 1)}, and so on). How many intervals do you need?`, `Les données vont de ${f.N(lo)} à ${f.N(hi)}. Tu utilises des intervalles égaux de largeur ${f.N(w)}, le premier commençant à ${f.N(start)} (les intervalles sont donc ${f.N(start)} à ${f.N(start + w - 1)}, puis ${f.N(start + w)} à ${f.N(start + 2 * w - 1)}, et ainsi de suite). Combien d'intervalles te faut-il ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6((hi - lo) / w), t('That is the spread divided by the width. The first interval and the interval holding the largest value both count, so check how many intervals are needed to cover the data.', 'C\'est l\'étendue divisée par la largeur. Le premier intervalle et celui qui contient la plus grande valeur comptent tous les deux : vérifie combien d\'intervalles couvrent les données.'), 1], [Math.floor(hi / w) - Math.floor(lo / w), t('That is one interval short: the interval that holds the smallest value must be counted too.', 'Il manque un intervalle : celui qui contient la plus petite valeur doit être compté aussi.'), 1]]),
    steps: [bi((f) => f.t(`The smallest value ${f.N(lo)} is in the interval starting at ${f.N(start)}. The largest value ${f.N(hi)} is in the interval starting at ${f.N(Math.floor(hi / w) * w)}.`, `La plus petite valeur ${f.N(lo)} est dans l'intervalle qui commence à ${f.N(start)}. La plus grande valeur ${f.N(hi)} est dans l'intervalle qui commence à ${f.N(Math.floor(hi / w) * w)}.`)), bi((f) => f.t(`Count the starts from ${f.N(start)} to ${f.N(Math.floor(hi / w) * w)} in steps of ${f.N(w)}: ${f.N(ans)} intervals.`, `Compte les débuts de ${f.N(start)} à ${f.N(Math.floor(hi / w) * w)} par pas de ${f.N(w)} : ${f.N(ans)} intervalles.`))],
    nudge: t('Find the interval that holds the smallest value and the one that holds the largest, then count all the intervals from one to the other.', 'Trouve l\'intervalle qui contient la plus petite valeur et celui qui contient la plus grande, puis compte tous les intervalles de l\'un à l\'autre.'),
  };
});
const intervalPercent = numGen('MS.G6.D1.2.a', (_tier, r) => {
  const total = pick(r, [20, 25, 40, 50]);
  const names = ['0 to 9', '10 to 19', '20 to 29', '30 to 39'];
  let counts: number[] = [];
  for (let i = 0; i < 200; i++) {
    const a = randInt(r, 1, total - 3), b = randInt(r, 1, total - 3), c = randInt(r, 1, total - 3);
    const d = total - a - b - c;
    if (d >= 1) { counts = [a, b, c, d]; break; }
  }
  if (counts.length === 0) counts = [total - 3, 1, 1, 1];
  const k = randInt(r, 0, 3);
  const ans = r6((counts[k]! * 100) / total);
  const frFmt = ['0 à 9', '10 à 19', '20 à 29', '30 à 39'];
  return {
    prompt: bi((f) => f.t(`A frequency table of ${f.N(total)} data values has these intervals and counts: ${names.map((n, i) => `${n}: ${f.N(counts[i]!)}`).join('; ')}. What percent of the values are in the interval ${names[k]}?`, `Un tableau de fréquences de ${f.N(total)} données a ces intervalles et ces effectifs : ${frFmt.map((n, i) => `${n} : ${f.N(counts[i]!)}`).join(' ; ')}. Quel pourcentage des données se trouve dans l'intervalle ${frFmt[k]} ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[counts[k]!, t('That is the count, not the percent. Write the count out of the total as a percent.', 'C\'est l\'effectif, pas le pourcentage. Écris l\'effectif sur le total en pourcentage.'), 1], [r6((counts[k]! * 100) / counts.reduce((x, y) => x + y, 0) + 0.5), t('Check the arithmetic: divide the count by the total number of values, then multiply by 100.', 'Vérifie le calcul : divise l\'effectif par le nombre total de données, puis multiplie par 100.'), 1]]),
    steps: [bi((f) => f.t(`${f.N(counts[k]!)} out of ${f.N(total)} values are in the interval.`, `${f.N(counts[k]!)} données sur ${f.N(total)} sont dans l'intervalle.`)), bi((f) => `${f.N(counts[k]!)} ÷ ${f.N(total)} × ${f.N(100)} = ${f.N(ans)}%.`)],
    nudge: t('Divide the count in the interval by the total, then multiply by 100.', 'Divise l\'effectif de l\'intervalle par le total, puis multiplie par 100.'),
  };
});
export const intervals6 = tierGen(countInInterval, intervalCount, intervalPercent);

/** MS.G6.D1.3.a: choosing graphs, including histograms and broken-line graphs */
const GRAPHS: { id: string; en: string; fr: string }[] = [
  { id: 'bar', en: 'Bar graph', fr: 'Diagramme à bandes' }, { id: 'circle', en: 'Circle graph', fr: 'Diagramme circulaire' },
  { id: 'hist', en: 'Histogram', fr: 'Histogramme' }, { id: 'line', en: 'Broken-line graph', fr: 'Graphique à ligne brisée' },
];
const WHY: Record<string, [string, string]> = {
  bar: ['A bar graph compares separate categories. This data is not a set of separate categories.', 'Un diagramme à bandes compare des catégories distinctes. Ces données ne sont pas des catégories distinctes.'],
  circle: ['A circle graph shows how parts make up one whole. This is not a share of a whole.', 'Un diagramme circulaire montre comment des parties composent un tout. Ce n\'est pas une part d\'un tout.'],
  hist: ['A histogram shows how measurements spread across equal intervals. This is not data grouped into intervals.', 'Un histogramme montre comment des mesures se répartissent dans des intervalles égaux. Ce ne sont pas des données regroupées en intervalles.'],
  line: ['A broken-line graph shows change over time. This data is not about change over time.', 'Un graphique à ligne brisée montre un changement dans le temps. Ces données ne concernent pas un changement dans le temps.'],
};
const CHOOSE: { id: string; tier: number; en: string; fr: string }[] = [
  { id: 'line', tier: 1, en: 'You want to show how the temperature changed every hour during a day.', fr: 'Tu veux montrer comment la température a changé chaque heure pendant une journée.' },
  { id: 'line', tier: 1, en: 'You want to show how a plant\'s height grew each week for ten weeks.', fr: 'Tu veux montrer comment la hauteur d\'une plante a grandi chaque semaine pendant dix semaines.' },
  { id: 'bar', tier: 1, en: 'You want to compare how many students chose each of five favourite fruits.', fr: 'Tu veux comparer combien d\'élèves ont choisi chacun de cinq fruits préférés.' },
  { id: 'bar', tier: 1, en: 'You want to compare the number of books read by four different classes.', fr: 'Tu veux comparer le nombre de livres lus par quatre classes différentes.' },
  { id: 'circle', tier: 1, en: 'You want to show how a family\'s monthly budget is split among rent, food, travel and savings.', fr: 'Tu veux montrer comment le budget mensuel d\'une famille est réparti entre le loyer, la nourriture, les déplacements et l\'épargne.' },
  { id: 'circle', tier: 1, en: 'You want to show what part of a class likes each type of music.', fr: 'Tu veux montrer quelle part d\'une classe aime chaque genre de musique.' },
  { id: 'hist', tier: 2, en: 'You measured the heights of 30 students and sorted them into equal intervals (130 to 139 cm, 140 to 149 cm, and so on). You want to show how the heights are spread.', fr: 'Tu as mesuré la taille de 30 élèves et tu les as classées en intervalles égaux (130 à 139 cm, 140 à 149 cm, et ainsi de suite). Tu veux montrer comment les tailles sont réparties.' },
  { id: 'hist', tier: 2, en: 'You timed 40 runners and sorted the times into equal intervals of 10 seconds. You want to show the shape of the data.', fr: 'Tu as chronométré 40 coureurs et classé les temps en intervalles égaux de 10 secondes. Tu veux montrer la forme des données.' },
  { id: 'line', tier: 2, en: 'You want to show how the population of a town changed every ten years since 1960.', fr: 'Tu veux montrer comment la population d\'une ville a changé tous les dix ans depuis 1960.' },
  { id: 'circle', tier: 2, en: 'You want to show what percent of the school\'s lunch sales each food type makes up.', fr: 'Tu veux montrer quel pourcentage des ventes de dîners de l\'école chaque type de nourriture représente.' },
  { id: 'hist', tier: 3, en: 'A track team has 25 jump distances, which are measurements. You group them in equal intervals to see where most jumps fall. Which graph is best?', fr: 'Une équipe d\'athlétisme a 25 distances de saut, qui sont des mesures. Tu les regroupes en intervalles égaux pour voir où tombent la plupart des sauts. Quel graphique est le meilleur ?' },
  { id: 'line', tier: 3, en: 'A savings account balance is recorded at the end of every month for a year. You want to show whether the balance is rising or falling. Which graph is best?', fr: 'Le solde d\'un compte d\'épargne est noté à la fin de chaque mois pendant un an. Tu veux montrer si le solde monte ou descend. Quel graphique est le meilleur ?' },
  { id: 'bar', tier: 3, en: 'You asked 60 students for their favourite sport from a list of six sports and want to compare the totals for the sports. Which graph is best?', fr: 'Tu as demandé à 60 élèves leur sport préféré dans une liste de six sports et tu veux comparer les totaux des sports. Quel graphique est le meilleur ?' },
  { id: 'circle', tier: 3, en: 'You have the percent of a class that walks, bikes, rides the bus or is driven to school. The percents add to 100. Which graph shows them as parts of one whole?', fr: 'Tu as le pourcentage de la classe qui marche, fait du vélo, prend l\'autobus ou se fait conduire à l\'école. Les pourcentages totalisent 100. Quel graphique les montre comme des parties d\'un tout ?' },
];
export const chooseGraph6 = choiceGen('MS.G6.D1.3.a', (tier, r) => {
  const sc = pick(r, CHOOSE.filter((c) => c.tier === tier));
  const pool = tier === 1 ? GRAPHS.filter((g) => g.id !== 'hist') : GRAPHS;
  const right = GRAPHS.find((g) => g.id === sc.id)!;
  const mkOpt = (g: { en: string; fr: string }): Text => t(g.en, g.fr);
  const m = mc(r, mkOpt(right), pool.filter((g) => g.id !== sc.id).map((g): [Text, Text] => [mkOpt(g), t(WHY[g.id]![0], WHY[g.id]![1])]));
  const prompt = tier === 3 ? t(sc.en, sc.fr) : t(`${sc.en} Which graph is best?`, `${sc.fr} Quel graphique est le meilleur ?`);
  return {
    prompt, options: m.options, correct: m.correct, why: m.why, category: tier === 1 ? 'KU' : 'AP',
    steps: [t('Match the purpose to the graph: a bar graph compares categories, a circle graph shows parts of a whole, a histogram shows how measurements spread across equal intervals, and a broken-line graph shows change over time.', 'Associe le but au graphique : un diagramme à bandes compare des catégories, un diagramme circulaire montre des parties d\'un tout, un histogramme montre comment des mesures se répartissent dans des intervalles égaux, et un graphique à ligne brisée montre un changement dans le temps.'), t(`Here the best choice is the ${right.en.toLowerCase()}.`, `Ici, le meilleur choix est ${right.id === 'bar' ? 'le diagramme à bandes' : right.id === 'circle' ? 'le diagramme circulaire' : right.id === 'hist' ? 'l\'histogramme' : 'le graphique à ligne brisée'}.`)],
    nudge: t('What do you want the graph to show: a comparison, parts of a whole, a spread, or change over time?', 'Que veux-tu que le graphique montre : une comparaison, des parties d\'un tout, une répartition ou un changement dans le temps ?'),
  };
});

/** MS.G6.D1.6.a: analysing data, including misleading graphs (axis that does not start at zero) */
const misleadingWhy = choiceGen('MS.G6.D1.6.a', (_tier, r) => {
  const start = pick(r, [50, 80, 90, 200]);
  const a = start + randInt(r, 2, 8), b = a + randInt(r, 2, 6);
  const m = mc(r, t('The bars look very different because the vertical axis does not start at zero.', 'Les bandes semblent très différentes parce que l\'axe vertical ne commence pas à zéro.'), [
    [t('The bars look the same because the numbers are close.', 'Les bandes semblent identiques parce que les nombres sont proches.'), t('A graph that starts at a high number makes a small gap look big, not small.', 'Un graphique qui commence à un nombre élevé fait paraître un petit écart grand, pas petit.')],
    [t('Nothing is misleading: bar heights always show the true size.', 'Rien n\'est trompeur : la hauteur des bandes montre toujours la vraie grandeur.'), t('Bar heights only show true sizes when the axis starts at zero.', 'La hauteur des bandes ne montre les vraies grandeurs que si l\'axe commence à zéro.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A bar graph shows sales of ${f.N(a)} and ${f.N(b)}, but its vertical axis starts at ${f.N(start)} instead of ${f.N(0)}. What does this do to the graph?`, `Un diagramme à bandes montre des ventes de ${f.N(a)} et de ${f.N(b)}, mais son axe vertical commence à ${f.N(start)} au lieu de ${f.N(0)}. Qu'est-ce que cela fait au graphique ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`The bars are drawn from ${f.N(start)}, so their heights are ${f.N(a - start)} and ${f.N(b - start)}, not ${f.N(a)} and ${f.N(b)}.`, `Les bandes sont tracées à partir de ${f.N(start)} : leurs hauteurs sont ${f.N(a - start)} et ${f.N(b - start)}, et non ${f.N(a)} et ${f.N(b)}.`)), t('So the second bar looks many times taller than it really is. Always check where an axis starts.', 'La deuxième bande paraît donc plusieurs fois plus haute qu\'elle ne l\'est vraiment. Vérifie toujours où commence un axe.')],
    nudge: t('Where do the bars start drawing from, and how does that change how tall they look?', 'À partir d\'où les bandes sont-elles tracées, et comment cela change-t-il leur hauteur apparente ?'),
  };
});
const apparentRatio = numGen('MS.G6.D1.6.a', (_tier, r) => {
  const start = pick(r, [40, 50, 60, 80, 90]);
  const u = randInt(r, 2, 5), k = randInt(r, 2, 5);
  const a = start + u, b = start + k * u;
  return {
    prompt: bi((f) => f.t(`A bar graph's vertical axis starts at ${f.N(start)}. Bar A shows ${f.N(a)} and bar B shows ${f.N(b)}. How many times as tall as bar A does bar B look on the graph?`, `L'axe vertical d'un diagramme à bandes commence à ${f.N(start)}. La bande A montre ${f.N(a)} et la bande B montre ${f.N(b)}. Combien de fois la bande B paraît-elle plus haute que la bande A sur le graphique ?`)),
    answer: k, category: 'AP',
    wrong: wr(k, [[r6(b / a), t('That is the real ratio of the values. On the graph, the bars are drawn only from the start of the axis, so compare the heights above it.', 'C\'est le vrai rapport des valeurs. Sur le graphique, les bandes ne sont tracées qu\'à partir du début de l\'axe : compare les hauteurs au-dessus.'), 0], [b - a, t('That is the difference of the values. The question asks how many times as tall, which is a division of the drawn heights.', 'C\'est la différence des valeurs. La question demande combien de fois plus haute : c\'est une division des hauteurs tracées.'), 1]]),
    steps: [bi((f) => f.t(`Drawn heights above the axis start: bar A ${f.N(a)} − ${f.N(start)} = ${f.N(u)}, bar B ${f.N(b)} − ${f.N(start)} = ${f.N(k * u)}.`, `Hauteurs tracées au-dessus du début de l'axe : bande A ${f.N(a)} − ${f.N(start)} = ${f.N(u)}, bande B ${f.N(b)} − ${f.N(start)} = ${f.N(k * u)}.`)), bi((f) => `${f.N(k * u)} ÷ ${f.N(u)} = ${f.N(k)}.`)],
    nudge: t('Take the start of the axis away from each value to get the drawn heights, then divide.', 'Retire le début de l\'axe de chaque valeur pour obtenir les hauteurs tracées, puis divise.'),
  };
});
const realIncrease = numGen('MS.G6.D1.6.a', (_tier, r) => {
  const start = pick(r, [40, 50, 60, 80, 90]);
  const u = randInt(r, 2, 5), k = randInt(r, 2, 5);
  const a = start + u, b = start + k * u;
  const real = r6(((b - a) * 100) / a);
  return {
    prompt: bi((f) => f.t(`A graph's axis starts at ${f.N(start)}, and bar B looks ${f.N(k)} times as tall as bar A. Bar A really shows ${f.N(a)} and bar B really shows ${f.N(b)}. By what percent is bar B's value really greater than bar A's? Round to the nearest tenth of a percent if needed, and type the number only.`, `L'axe d'un graphique commence à ${f.N(start)}, et la bande B paraît ${f.N(k)} fois plus haute que la bande A. La bande A montre en réalité ${f.N(a)} et la bande B montre en réalité ${f.N(b)}. De quel pourcentage la valeur de la bande B est-elle réellement plus grande que celle de la bande A ? Arrondis au dixième de pour cent près au besoin, et écris seulement le nombre.`)),
    answer: real, category: 'TH', tolerance: 0.06,
    wrong: wr(real, [[(k - 1) * 100, t('That is how much taller bar B looks on the graph. The real increase uses the real values.', 'C\'est de combien la bande B paraît plus haute sur le graphique. La vraie augmentation utilise les vraies valeurs.'), 0]]),
    steps: [bi((f) => f.t(`The real increase is ${f.N(b)} − ${f.N(a)} = ${f.N(b - a)}.`, `La vraie augmentation est ${f.N(b)} − ${f.N(a)} = ${f.N(b - a)}.`)), bi((f) => f.t(`As a percent of bar A: ${f.N(b - a)} ÷ ${f.N(a)} × ${f.N(100)} = ${f.N(real)}%.`, `En pourcentage de la bande A : ${f.N(b - a)} ÷ ${f.N(a)} × ${f.N(100)} = ${f.N(real)} %.`))],
    nudge: t('Use the real values, not the drawn heights: the increase divided by bar A\'s value.', 'Utilise les vraies valeurs, pas les hauteurs tracées : l\'augmentation divisée par la valeur de la bande A.'),
  };
});
export const misleading6 = tierGen(misleadingWhy, apparentRatio, realIncrease);
