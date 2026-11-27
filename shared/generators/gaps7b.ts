// Grade 7 completion, part 2: Data (D1.1, D1.4, D1.6), Spatial sense (E1.2, E2.4) and Financial literacy (F1.2, F1.4), asked in words
// and numbers: graphs, views and constructions are described, so every item is an ordinary number or choice question.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const money = (f: F, x: number): string => f.D(r6(x));
const pct = (f: F, x: number): string => f.m(`${f.n(r6(x))}\\%`);
const SIZES: [number, number][] = [[20, 5], [25, 5], [40, 5], [50, 10], [80, 5], [125, 5], [200, 10], [250, 10], [400, 20]];

// ── Data ────────────────────────────────────────────────────────────────────────

/** MS.G7.D1.1.a: why percentages describe distributions in large data sets */
export const percentWhy7 = (() => {
  const percent = numGen('MS.G7.D1.1.a', (_tier, r) => {
    const [N, step] = pick(r, SIZES), k = randInt(r, 1, Math.floor(N / step) - 1) * step, p = r6((100 * k) / N);
    return {
      prompt: bi((f) => f.t(`In a survey of ${f.N(N)} students, ${f.N(k)} chose soccer as their favourite sport. What percent chose soccer?`, `Dans un sondage auprès de ${f.N(N)} élèves, ${f.N(k)} ont choisi le soccer comme sport préféré. Quel pourcentage a choisi le soccer ?`)),
      answer: p, category: 'AP',
      wrong: wr(p, [[r6(k / N), t('That is the decimal. Multiply by 100 to write it as a percent.', 'C\'est le nombre décimal. Multiplie par 100 pour l\'écrire en pourcentage.'), 1], [r6((100 * N) / k), t('The division is upside down: divide the part by the whole.', 'La division est à l\'envers : divise la partie par le tout.'), 0], [k, t('That is the count, not the percent. A percent is out of 100.', 'C\'est le nombre, pas le pourcentage. Un pourcentage est sur 100.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(k)} \\div ${f.n(N)}`)} = ${f.N(r6(k / N))}.`, `${f.m(`${f.n(k)} \\div ${f.n(N)}`)} = ${f.N(r6(k / N))}.`)), bi((f) => f.t(`${f.m(`${f.n(r6(k / N))} \\times 100`)} = ${f.N(p)} percent.`, `${f.m(`${f.n(r6(k / N))} \\times 100`)} = ${f.N(p)} pour cent.`))],
      nudge: t('Divide the part by the whole, then multiply by 100.', 'Divise la partie par le tout, puis multiplie par 100.'),
    };
  });
  const compare: Generator = numGen('MS.G7.D1.1.a', (_tier, r) => {
    let N1 = 0, N2 = 0, k1 = 0, k2 = 0, p1 = 0, p2 = 0, diff = 0;
    do {
      const [n1, s1] = pick(r, SIZES.slice(0, 5)), [n2, s2] = pick(r, SIZES.slice(4));
      N1 = n1; N2 = n2; k1 = randInt(r, 1, Math.floor(n1 / s1) - 1) * s1; k2 = randInt(r, 1, Math.floor(n2 / s2) - 1) * s2;
      p1 = r6((100 * k1) / N1); p2 = r6((100 * k2) / N2); diff = r6(Math.abs(p1 - p2));
    } while (diff === 0);
    return {
      prompt: bi((f) => f.t(`${f.N(k1)} of ${f.N(N1)} students in school A walk to school, and ${f.N(k2)} of ${f.N(N2)} students in school B do. How many percentage points apart are the two schools?`, `${f.N(k1)} élèves sur ${f.N(N1)} à l'école A marchent jusqu'à l'école, et ${f.N(k2)} sur ${f.N(N2)} à l'école B. Quel est l'écart, en points de pourcentage, entre les deux écoles ?`)),
      answer: diff, category: 'AP',
      wrong: wr(diff, [[Math.abs(k1 - k2), t('The schools have different sizes, so counts cannot be compared directly. Turn each into a percent first.', 'Les écoles ont des tailles différentes : on ne peut pas comparer directement les nombres. Transforme d\'abord chacun en pourcentage.'), 0], [r6(p1 + p2), t('Subtract the two percents to find how far apart they are.', 'Soustrais les deux pourcentages pour trouver l\'écart.'), 1], [r6(Math.abs(k1 / N1 - k2 / N2)), t('That is the difference of the decimals. Multiply by 100 for percentage points.', 'C\'est la différence des décimaux. Multiplie par 100 pour obtenir des points de pourcentage.'), 1]]),
      steps: [bi((f) => f.t(`School A: ${pct(f, p1)}. School B: ${pct(f, p2)}.`, `École A : ${pct(f, p1)}. École B : ${pct(f, p2)}.`)), bi((f) => f.t(`The gap is ${f.N(diff)} percentage points.`, `L'écart est de ${f.N(diff)} points de pourcentage.`))],
      nudge: t('Percents put both schools on the same scale (out of 100). Find each percent, then subtract.', 'Les pourcentages placent les deux écoles sur la même échelle (sur 100). Trouve chaque pourcentage, puis soustrais.'),
    };
  });
  const fair = choiceGen('MS.G7.D1.1.a', (_tier, r) => {
    const [N1, s1] = pick(r, SIZES.slice(0, 4)), [N2, s2] = pick(r, SIZES.slice(5));
    const k1 = randInt(r, 2, Math.floor(N1 / s1) - 1) * s1, k2 = randInt(r, 1, Math.floor(N2 / s2) - 1) * s2;
    const m = mc(r, t('Compare the percent from each group, because percents are out of the same 100.', 'Compare le pourcentage de chaque groupe, parce que les pourcentages sont sur le même 100.'), [
      [t('Compare the counts, because the biggest number is the biggest group.', 'Compare les nombres, parce que le plus grand nombre est le plus grand groupe.'), t('The groups have different sizes, so a bigger count does not mean a bigger share.', 'Les groupes ont des tailles différentes : un plus grand nombre ne signifie pas une plus grande part.')],
      [t('Compare the sizes of the groups only.', 'Compare seulement la taille des groupes.'), t('The size of the group does not tell you how many chose the item.', 'La taille du groupe ne dit pas combien ont choisi l\'article.')],
      [t('Add the two counts together and compare to 100.', 'Additionne les deux nombres et compare à 100.'), t('Adding the counts mixes two groups of different sizes together. Compare shares, not totals.', 'Additionner les nombres mélange deux groupes de tailles différentes. Compare des parts, pas des totaux.')],
    ]);
    return {
      prompt: bi((f) => f.t(`${f.N(k1)} of ${f.N(N1)} students in one group chose pizza, and ${f.N(k2)} of ${f.N(N2)} in another group did. What is the fair way to see which group likes pizza more?`, `${f.N(k1)} élèves sur ${f.N(N1)} dans un groupe ont choisi la pizza, et ${f.N(k2)} sur ${f.N(N2)} dans un autre groupe. Quelle est la façon juste de voir quel groupe aime le plus la pizza ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('Groups of different sizes can only be compared fairly by their shares.', 'Des groupes de tailles différentes ne se comparent équitablement que par leurs parts.'), bi((f) => f.t(`${pct(f, (100 * k1) / N1)} and ${pct(f, (100 * k2) / N2)}.`, `${pct(f, (100 * k1) / N1)} et ${pct(f, (100 * k2) / N2)}.`))],
      nudge: t('What does a percent let you compare when the groups are different sizes?', 'Que permet de comparer un pourcentage quand les groupes sont de tailles différentes ?'),
    };
  });
  return tierGen(percent, compare, fair);
})();

/** MS.G7.D1.4.a: infographics */
const PARTS: [string, string][] = [['a title', 'un titre'], ['labelled axes with units', 'des axes étiquetés avec des unités'], ['the source of the data', 'la source des données'], ['the date of the data', 'la date des données'], ['a key for the colours', 'une légende pour les couleurs']];
export const infographic7 = (() => {
  const missing = choiceGen('MS.G7.D1.4.a', (_tier, r) => {
    const gone = randInt(r, 0, 4), present = PARTS.filter((_, i) => i !== gone);
    const right: Text = t(PARTS[gone]![0], PARTS[gone]![1]);
    const m = mc(r, right, present.slice(0, 3).map(([en, fr]): [Text, Text] => [t(en, fr), t('That part is already on the infographic. Look for the one that is missing.', 'Cette partie figure déjà sur l\'infographie. Cherche celle qui manque.')]));
    return {
      prompt: bi((f) => f.t(`An infographic has ${present.map(([en]) => en).join(', ')}. Which important part is missing?`, `Une infographie a ${present.map(([, fr]) => fr).join(', ')}. Quelle partie importante manque ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('A good infographic has a title, labelled axes with units, the source and date of the data, and a key.', 'Une bonne infographie a un titre, des axes étiquetés avec des unités, la source et la date des données, et une légende.'), t(`The missing part is ${PARTS[gone]![0]}.`, `La partie manquante est ${PARTS[gone]![1]}.`)],
      nudge: t('Compare the list with what a good infographic needs: title, labelled axes, source, date, key.', 'Compare la liste avec ce dont une bonne infographie a besoin : titre, axes étiquetés, source, date, légende.'),
    };
  });
  const headline = numGen('MS.G7.D1.4.a', (_tier, r) => {
    const [N, step] = pick(r, SIZES), k = randInt(r, 1, Math.floor(N / step) - 1) * step, p = r6((100 * k) / N);
    return {
      prompt: bi((f) => f.t(`An infographic reports that ${f.N(k)} of ${f.N(N)} students bike to school. What percent should its headline say?`, `Une infographie indique que ${f.N(k)} élèves sur ${f.N(N)} vont à l'école à vélo. Quel pourcentage son titre devrait-il indiquer ?`)),
      answer: p, category: 'AP',
      wrong: wr(p, [[r6(k / N), t('That is the decimal. A headline percent is out of 100.', 'C\'est le nombre décimal. Un pourcentage de titre est sur 100.'), 1], [r6((100 * (N - k)) / N), t('That is the percent who do NOT bike. The headline is about those who do.', 'C\'est le pourcentage de ceux qui ne vont PAS à vélo. Le titre parle de ceux qui y vont.'), 1], [k, t('That is the count. Convert it to a percent of the whole group.', 'C\'est le nombre. Convertis-le en pourcentage du groupe entier.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(k)} \\div ${f.n(N)} \\times 100`)} = ${f.N(p)}.`, `${f.m(`${f.n(k)} \\div ${f.n(N)} \\times 100`)} = ${f.N(p)}.`)), bi((f) => f.t(`The headline should say ${pct(f, p)}.`, `Le titre devrait dire ${pct(f, p)}.`))],
      nudge: t('Divide the part by the whole and multiply by 100.', 'Divise la partie par le tout et multiplie par 100.'),
    };
  });
  const accurate: Generator = choiceGen('MS.G7.D1.4.a', (_tier, r) => {
    let a = 0, up = 0, b = 0.5;
    while (!Number.isInteger(b)) { a = randInt(r, 4, 12) * 10; up = pick(r, [10, 20, 25, 50]); b = (a * (100 + up)) / 100; }
    const m = mc(r, bi((f) => f.t(`Sales rose by ${pct(f, up)}`, `Les ventes ont augmenté de ${pct(f, up)}`)), [
      [bi((f) => f.t(`Sales rose by ${pct(f, b - a)}`, `Les ventes ont augmenté de ${pct(f, b - a)}`)), t('That treats the increase in units as if it were a percent. Compare the increase with the starting amount.', 'C\'est traiter l\'augmentation en unités comme un pourcentage. Compare l\'augmentation à la valeur de départ.')],
      [bi((f) => f.t(`Sales rose by ${pct(f, up * 2)}`, `Les ventes ont augmenté de ${pct(f, up * 2)}`)), t('That doubles the real increase. Divide the increase by the starting amount, not by half of it.', 'C\'est le double de la vraie augmentation. Divise l\'augmentation par la valeur de départ, pas par sa moitié.')],
      [bi((f) => f.t(`Sales rose by ${pct(f, (100 * b) / a)}`, `Les ventes ont augmenté de ${pct(f, (100 * b) / a)}`)), t('That compares the new amount with the old one, not the increase. Subtract 100% for the rise.', 'C\'est comparer la nouvelle valeur avec l\'ancienne, pas l\'augmentation. Retire 100 % pour la hausse.')],
    ]);
    return {
      prompt: bi((f) => f.t(`Weekly sales went from ${f.N(a)} to ${f.N(b)}. Which headline for an infographic is accurate?`, `Les ventes hebdomadaires sont passées de ${f.N(a)} à ${f.N(b)}. Quel titre d'infographie est exact ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'AP',
      steps: [bi((f) => f.t(`The increase is ${f.m(`${f.n(b)} - ${f.n(a)}`)} = ${f.N(b - a)}.`, `L'augmentation est ${f.m(`${f.n(b)} - ${f.n(a)}`)} = ${f.N(b - a)}.`)), bi((f) => f.t(`${f.m(`${f.n(b - a)} \\div ${f.n(a)} \\times 100`)} = ${f.N(up)} percent.`, `${f.m(`${f.n(b - a)} \\div ${f.n(a)} \\times 100`)} = ${f.N(up)} pour cent.`))],
      nudge: t('Percent increase = increase ÷ starting amount × 100.', 'Pourcentage d\'augmentation = augmentation ÷ valeur de départ × 100.'),
    };
  });
  return tierGen(missing, headline, accurate);
})();

/** MS.G7.D1.6.a: analysis, including misleading graphs and misleading statistics */
const FEATURES: { en: string; fr: string; why: [string, string] }[] = [
  { en: 'a vertical axis that starts at 50 instead of 0', fr: 'un axe vertical qui commence à 50 au lieu de 0', why: ['It makes small differences look big, because the bars are cut off at the bottom.', 'Cela fait paraître grandes de petites différences, parce que les barres sont coupées en bas.'] },
  { en: 'a scale that jumps by 10s at the bottom and by 100s at the top', fr: 'une échelle qui avance de 10 en bas et de 100 en haut', why: ['The uneven steps stretch some parts of the graph and squash others.', 'Les pas inégaux étirent certaines parties du graphique et en écrasent d\'autres.'] },
  { en: 'pictures whose heights and widths both double when the value doubles', fr: 'des images dont la hauteur et la largeur doublent quand la valeur double', why: ['The area grows four times as much, so the bigger picture looks much bigger than it should.', 'L\'aire est multipliée par quatre : la plus grande image paraît beaucoup plus grande qu\'elle ne devrait.'] },
  { en: 'only the months when sales were highest', fr: 'seulement les mois où les ventes étaient les plus élevées', why: ['Leaving out other months hides the full picture.', 'Omettre les autres mois cache le tableau complet.'] },
];
export const misleading7 = (() => {
  const why = choiceGen('MS.G7.D1.6.a', (_tier, r) => {
    const i = randInt(r, 0, FEATURES.length - 1), F0 = FEATURES[i]!;
    const m = mc(r, t(F0.why[0], F0.why[1]), FEATURES.filter((_, j) => j !== i).slice(0, 3).map((x): [Text, Text] => [t(x.why[0], x.why[1]), t('That reason belongs to a different graph feature. Match the reason to the feature described.', 'Cette raison correspond à une autre caractéristique. Associe la raison à la caractéristique décrite.')]));
    return {
      prompt: bi((f) => f.t(`A graph has ${F0.en}. Why can this be misleading?`, `Un graphique a ${F0.fr}. Pourquoi cela peut-il induire en erreur ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('Ask what the feature does to how big the differences look.', 'Demande-toi ce que la caractéristique fait à l\'apparence de la taille des différences.'), t(F0.why[0], F0.why[1])],
      nudge: t('Picture the graph. What does this feature do to the size of the bars or the spread of the points?', 'Imagine le graphique. Que fait cette caractéristique à la taille des barres ou à l\'étalement des points ?'),
    };
  });
  const ratio = numGen('MS.G7.D1.6.a', (_tier, r) => {
    const base = randInt(r, 4, 9) * 10, u = randInt(r, 1, 4) * 5, k = randInt(r, 2, 4), v1 = base + u, v2 = base + k * u;
    return {
      prompt: bi((f) => f.t(`A bar graph's vertical axis starts at ${f.N(base)}. One bar shows ${f.N(v1)} and another shows ${f.N(v2)}. About how many times as tall does the second bar look as the first?`, `L'axe vertical d'un diagramme à barres commence à ${f.N(base)}. Une barre montre ${f.N(v1)} et une autre ${f.N(v2)}. Environ combien de fois la deuxième barre paraît-elle plus haute que la première ?`)),
      answer: k, category: 'AP',
      wrong: wr(k, [[r6(v2 / v1), t('That is the real ratio. The bars only show the part above the starting value of the axis.', 'C\'est le vrai rapport. Les barres ne montrent que la partie au-dessus de la valeur de départ de l\'axe.'), 1], [r6(v2 - v1), t('That is the difference in values, not how many times taller.', 'C\'est la différence de valeurs, pas combien de fois plus haute.'), 1], [r6(1 / k), t('The second bar is the taller one: divide the second height by the first.', 'La deuxième barre est la plus haute : divise la deuxième hauteur par la première.'), 1]]),
      steps: [bi((f) => f.t(`The visible heights are ${f.m(`${f.n(v1)} - ${f.n(base)}`)} = ${f.N(u)} and ${f.m(`${f.n(v2)} - ${f.n(base)}`)} = ${f.N(k * u)}.`, `Les hauteurs visibles sont ${f.m(`${f.n(v1)} - ${f.n(base)}`)} = ${f.N(u)} et ${f.m(`${f.n(v2)} - ${f.n(base)}`)} = ${f.N(k * u)}.`)), bi((f) => f.t(`${f.m(`${f.n(k * u)} \\div ${f.n(u)}`)} = ${f.N(k)} times as tall.`, `${f.m(`${f.n(k * u)} \\div ${f.n(u)}`)} = ${f.N(k)} fois plus haute.`))],
      nudge: t('Subtract the axis starting value from each bar before comparing the heights.', 'Soustrais la valeur de départ de l\'axe de chaque barre avant de comparer les hauteurs.'),
    };
  });
  const centre = numGen('MS.G7.D1.6.a', (_tier, r) => {
    const base = randInt(r, 30, 55), data = Array.from({ length: 6 }, () => base + randInt(r, -6, 6));
    const sorted = [...data].sort((a, b) => a - b), outlier = randInt(r, 150, 300);
    const all = [...sorted, outlier].sort((a, b) => a - b), median = all[3]!, mean = r6(all.reduce((s, x) => s + x, 0) / 7);
    return {
      prompt: bi((f) => f.t(`An ad says the average salary at a company is ${f.N(mean)} thousand dollars (the mean). The 7 salaries, in thousands, are ${all.map((x) => f.N(x)).join(', ')}. What is the median salary, in thousands? It shows what a typical worker earns.`, `Une publicité dit que le salaire moyen d'une entreprise est de ${f.N(mean)} milliers de dollars (la moyenne). Les 7 salaires, en milliers, sont ${all.map((x) => f.N(x)).join(', ')}. Quel est le salaire médian, en milliers ? Il montre ce que gagne un employé typique.`)),
      answer: median, category: 'AP',
      wrong: wr(median, [[mean, t('That is the mean, which the very high salary pulls up. The median is the middle value.', 'C\'est la moyenne, que le salaire très élevé tire vers le haut. La médiane est la valeur du milieu.'), 1], [all[2]!, t('The middle of 7 ordered values is the 4th one.', 'Le milieu de 7 valeurs ordonnées est la 4e.'), 0], [outlier, t('That is the highest salary, not the middle one.', 'C\'est le salaire le plus élevé, pas celui du milieu.'), 0]]),
      steps: [t('Put the salaries in order (they already are). The median is the middle one, the 4th of 7.', 'Range les salaires dans l\'ordre (ils le sont déjà). La médiane est celui du milieu, le 4e sur 7.'), bi((f) => f.t(`The median is ${f.N(median)} thousand dollars, much lower than the mean.`, `La médiane est de ${f.N(median)} milliers de dollars, bien plus basse que la moyenne.`))],
      nudge: t('Order the values and take the middle one. A very large value does not move the median much.', 'Range les valeurs et prends celle du milieu. Une très grande valeur ne déplace pas beaucoup la médiane.'),
    };
  });
  return tierGen(why, ratio, centre);
})();

// ── Spatial sense ───────────────────────────────────────────────────────────────

const stackGrid = (r: () => number): number[][] => [0, 1].map(() => [0, 1, 2].map(() => randInt(r, 0, 4)));
const describe = (f: F, g: number[][]): string => g.map((row, i) => `${i === 0 ? f.t('front row', 'rangée avant') : f.t('back row', 'rangée arrière')}: ${row.map((h) => f.N(h)).join(', ')}`).join('; ');
export const views7 = (() => {
  const top = numGen('MS.G7.E1.2.a', (_tier, r) => {
    let g = stackGrid(r); while (g.flat().filter((h) => h > 0).length < 2) g = stackGrid(r);
    const ans = g.flat().filter((h) => h > 0).length;
    return {
      prompt: bi((f) => f.t(`A model is made of stacks of cubes on a 2 by 3 grid. The numbers are the stack heights. ${describe(f, g)}. How many squares does the top view show?`, `Un modèle est fait de piles de cubes sur une grille de 2 sur 3. Les nombres sont les hauteurs des piles. ${describe(f, g)}. Combien de carrés la vue de dessus montre-t-elle ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[g.flat().reduce((s, h) => s + h, 0), t('That counts every cube. The top view shows one square per stack, however tall.', 'Cela compte tous les cubes. La vue de dessus montre un carré par pile, quelle que soit sa hauteur.'), 0], [6, t('Empty places (height 0) show nothing in the top view.', 'Les places vides (hauteur 0) ne montrent rien dans la vue de dessus.'), 0], [Math.max(...g.flat()), t('That is the tallest stack. Count the stacks instead.', 'C\'est la plus haute pile. Compte plutôt les piles.'), 0]]),
      steps: [t('Looking from above, each stack that is at least one cube tall shows as one square.', 'Vu de dessus, chaque pile d\'au moins un cube apparaît comme un carré.'), bi((f) => f.t(`${f.N(ans)} stacks are not empty, so the top view has ${f.N(ans)} squares.`, `${f.N(ans)} piles ne sont pas vides : la vue de dessus a ${f.N(ans)} carrés.`))],
      nudge: t('Count the stacks that have at least one cube.', 'Compte les piles qui ont au moins un cube.'),
    };
  });
  const front = numGen('MS.G7.E1.2.a', (_tier, r) => {
    let g = stackGrid(r); while (g.flat().every((h) => h === 0)) g = stackGrid(r);
    const cols = [0, 1, 2].map((c) => Math.max(g[0]![c]!, g[1]![c]!)), ans = cols.reduce((s, h) => s + h, 0);
    return {
      prompt: bi((f) => f.t(`A model is made of stacks of cubes on a 2 by 3 grid. The numbers are the stack heights. ${describe(f, g)}. How many squares does the front view show?`, `Un modèle est fait de piles de cubes sur une grille de 2 sur 3. Les nombres sont les hauteurs des piles. ${describe(f, g)}. Combien de carrés la vue de face montre-t-elle ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[g.flat().reduce((s, h) => s + h, 0), t('Cubes in the back row can be hidden behind the front row. In each column the front view shows only the taller stack.', 'Les cubes de la rangée arrière peuvent être cachés derrière la rangée avant. Dans chaque colonne, la vue de face ne montre que la pile la plus haute.'), 0], [g[0]!.reduce((s, h) => s + h, 0), t('The back row can be taller than the front row. Use the taller stack in each column.', 'La rangée arrière peut être plus haute que la rangée avant. Utilise la pile la plus haute de chaque colonne.'), 0], [Math.max(...cols) * 3, t('Each column has its own height. Add the three column heights.', 'Chaque colonne a sa propre hauteur. Additionne les trois hauteurs de colonne.'), 0]]),
      steps: [bi((f) => f.t(`For each column, take the taller stack: ${cols.map((h) => f.N(h)).join(', ')}.`, `Pour chaque colonne, prends la pile la plus haute : ${cols.map((h) => f.N(h)).join(', ')}.`)), bi((f) => f.t(`The front view has ${f.N(ans)} squares.`, `La vue de face a ${f.N(ans)} carrés.`))],
      nudge: t('From the front you see the taller of the two stacks in each column.', 'De face, on voit la plus haute des deux piles de chaque colonne.'),
    };
  });
  const scale = numGen('MS.G7.E1.2.a', (_tier, r) => {
    const k = pick(r, [2, 5, 10, 20, 50]), d = pick(r, [2.5, 3, 4, 4.5, 6, 7.5]), ans = r6(d * k);
    return {
      prompt: bi((f) => f.t(`In a scale drawing of a building, ${f.N(1)} cm stands for ${f.N(k)} m. The front view is ${f.N(d)} cm tall. How tall is the real building, in metres?`, `Dans un dessin à l'échelle d'un bâtiment, ${f.N(1)} cm représente ${f.N(k)} m. La vue de face mesure ${f.N(d)} cm de haut. Quelle est la hauteur réelle du bâtiment, en mètres ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(d / k), t('Multiply by the scale: each centimetre stands for more than one metre.', 'Multiplie par l\'échelle : chaque centimètre représente plus d\'un mètre.'), 1], [r6(d + k), t('The scale multiplies; do not add.', 'L\'échelle multiplie ; n\'additionne pas.'), 1], [r6(d * k * 100), t('The answer is already in metres, because the scale gives metres.', 'La réponse est déjà en mètres, parce que l\'échelle est en mètres.'), 1]]),
      steps: [bi((f) => f.t(`Each centimetre is ${f.N(k)} m, so multiply the drawing height by ${f.N(k)}.`, `Chaque centimètre vaut ${f.N(k)} m : multiplie la hauteur du dessin par ${f.N(k)}.`)), bi((f) => f.t(`${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(ans)} m.`, `${f.m(`${f.n(d)} \\times ${f.n(k)}`)} = ${f.N(ans)} m.`))],
      nudge: t('Multiply the length on the drawing by the number of metres each centimetre stands for.', 'Multiplie la longueur sur le dessin par le nombre de mètres que représente chaque centimètre.'),
    };
  });
  return tierGen(top, front, scale);
})();

export const circles7 = (() => {
  const compass = numGen('MS.G7.E2.4.a', (_tier, r) => {
    const d = randInt(r, 3, 20) * 2, ans = d / 2;
    return {
      prompt: bi((f) => f.t(`To construct a circle that is ${f.N(d)} cm across, what should the compass opening (the radius) be, in cm?`, `Pour construire un cercle de ${f.N(d)} cm de diamètre, quelle ouverture de compas (le rayon) faut-il, en cm ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[d, t('That is the diameter, the distance all the way across. The compass opening is the radius, half of it.', 'C\'est le diamètre, la distance d\'un bord à l\'autre. L\'ouverture du compas est le rayon, la moitié.'), 0], [d * 2, t('Half the distance across is the radius. Divide by 2, do not double.', 'La moitié de la largeur est le rayon. Divise par 2, ne double pas.'), 0]]),
      steps: [t('The compass opening is the radius, which is half the diameter.', 'L\'ouverture du compas est le rayon, soit la moitié du diamètre.'), bi((f) => f.t(`${f.m(`${f.n(d)} \\div 2`)} = ${f.N(ans)} cm.`, `${f.m(`${f.n(d)} \\div 2`)} = ${f.N(ans)} cm.`))],
      nudge: t('Radius is half of the diameter.', 'Le rayon est la moitié du diamètre.'),
    };
  });
  const across = numGen('MS.G7.E2.4.a', (_tier, r) => {
    const rr = randInt(r, 2, 15) + (r() < 0.5 ? 0.5 : 0), ans = r6(2 * rr);
    return {
      prompt: bi((f) => f.t(`A compass is set to ${f.N(rr)} cm and used to draw a circle. How wide is the circle at its widest, in cm?`, `Un compas est réglé à ${f.N(rr)} cm et sert à tracer un cercle. Quelle est la largeur maximale du cercle, en cm ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[rr, t('That is the radius. The widest distance is the diameter, twice the radius.', 'C\'est le rayon. La plus grande largeur est le diamètre, le double du rayon.'), 0], [r6(rr / 2), t('The diameter is twice the radius, not half.', 'Le diamètre est le double du rayon, pas la moitié.'), 0], [r6(rr * rr), t('Squaring is for area. The width across is twice the radius.', 'Élever au carré sert pour l\'aire. La largeur est le double du rayon.'), 0]]),
      steps: [t('The compass opening is the radius, and the diameter is twice the radius.', 'L\'ouverture du compas est le rayon, et le diamètre est le double du rayon.'), bi((f) => f.t(`${f.m(`2 \\times ${f.n(rr)}`)} = ${f.N(ans)} cm.`, `${f.m(`2 \\times ${f.n(rr)}`)} = ${f.N(ans)} cm.`))],
      nudge: t('Double the radius to get the distance across.', 'Double le rayon pour obtenir la distance d\'un bord à l\'autre.'),
    };
  });
  const meet: Generator = numGen('MS.G7.E2.4.a', (_tier, r) => {
    let a = 2, b = 2, kind = 'apart';
    do { a = randInt(r, 2, 8); b = randInt(r, 2, 8); kind = pick(r, ['apart', 'touch', 'overlap', 'inside', 'touchIn']); } while (a === b && (kind === 'inside' || kind === 'touchIn'));
    const d = kind === 'apart' ? a + b + randInt(r, 1, 4) : kind === 'touch' ? a + b : kind === 'overlap' ? Math.max(Math.abs(a - b) + 1, 1) + randInt(r, 0, Math.max(0, a + b - Math.abs(a - b) - 2)) : kind === 'inside' ? Math.max(0, Math.abs(a - b) - 1) : Math.abs(a - b);
    const ans = d > a + b || d < Math.abs(a - b) ? 0 : d === a + b || d === Math.abs(a - b) ? 1 : 2;
    return {
      prompt: bi((f) => f.t(`Two circles have radii ${f.N(a)} cm and ${f.N(b)} cm. Their centres are ${f.N(d)} cm apart. How many points do the two circles have in common?`, `Deux cercles ont des rayons de ${f.N(a)} cm et ${f.N(b)} cm. Leurs centres sont à ${f.N(d)} cm l'un de l'autre. Combien de points les deux cercles ont-ils en commun ?`)),
      answer: ans, category: 'TH',
      wrong: wr(ans, [[(ans + 1) % 3, t('Compare the distance between the centres with the sum of the radii and with their difference.', 'Compare la distance entre les centres avec la somme des rayons et avec leur différence.'), 1], [(ans + 2) % 3, t('Compare the distance between the centres with the sum of the radii and with their difference.', 'Compare la distance entre les centres avec la somme des rayons et avec leur différence.'), 1]]),
      steps: [bi((f) => f.t(`The sum of the radii is ${f.N(a + b)} cm and their difference is ${f.N(Math.abs(a - b))} cm.`, `La somme des rayons est ${f.N(a + b)} cm et leur différence est ${f.N(Math.abs(a - b))} cm.`)), bi((f) => f.t(`The centres are ${f.N(d)} cm apart, so the circles share ${f.N(ans)} point${ans === 1 ? '' : 's'}.`, `Les centres sont à ${f.N(d)} cm : les cercles ont ${f.N(ans)} point${ans > 1 ? 's' : ''} en commun.`))],
      nudge: t('Two points if the distance is between the difference and the sum of the radii, one if it equals either, none otherwise.', 'Deux points si la distance est entre la différence et la somme des rayons, un si elle égale l\'une des deux, aucun sinon.'),
    };
  });
  return tierGen(compass, across, meet);
})();

// ── Financial literacy ──────────────────────────────────────────────────────────

const SOURCES: { q: [string, string]; good: [string, string]; bad: [string, string][] }[] = [
  { q: ['the real cost of owning a new phone for two years', 'le vrai coût de possession d\'un nouveau téléphone pendant deux ans'], good: ['an independent consumer organization that tests and compares phones', 'un organisme indépendant de consommateurs qui teste et compare les téléphones'], bad: [['an ad from the company that sells the phone', 'une publicité de l\'entreprise qui vend le téléphone'], ['a post from someone who got a free phone', 'un message de quelqu\'un qui a reçu un téléphone gratuit'], ['a comment on a video with no source', 'un commentaire sous une vidéo sans source']] },
  { q: ['how much interest a bank charges on a loan', 'le taux d\'intérêt qu\'une banque exige sur un prêt'], good: ['the bank\'s official rate sheet, and a government consumer agency', 'la fiche officielle des taux de la banque et une agence gouvernementale de consommation'], bad: [['a friend\'s memory of what they were told', 'ce dont un ami se souvient d\'avoir entendu'], ['a flashy banner promising "the best rates ever"', 'une bannière tape-à-l\'œil promettant « les meilleurs taux de tous les temps »'], ['an anonymous forum post', 'un message anonyme sur un forum']] },
  { q: ['whether a video game is worth its price', 'si un jeu vidéo vaut son prix'], good: ['several independent reviews that explain how they tested it', 'plusieurs critiques indépendantes qui expliquent comment elles l\'ont testé'], bad: [['the trailer made by the game\'s studio', 'la bande-annonce faite par le studio du jeu'], ['one review that was paid for by the studio', 'une critique payée par le studio'], ['a message with no name that says "best game ever"', 'un message sans nom qui dit « meilleur jeu de tous les temps »']] },
  { q: ['how much a family should budget for groceries', 'combien une famille devrait prévoir pour l\'épicerie'], good: ['national statistics from a government agency', 'des statistiques nationales d\'un organisme gouvernemental'], bad: [['a magazine ad for a meal-kit company', 'une publicité de magazine pour une entreprise de prêts-à-cuisiner'], ['a rumour at school', 'une rumeur à l\'école'], ['a social media post that does not say where its numbers come from', 'un message sur les réseaux sociaux qui n\'indique pas d\'où viennent ses chiffres']] },
];
export const sources7 = (() => {
  const pickGood = (tier: number) => choiceGen('MS.G7.F1.2.a', (_t, r) => {
    const s = pick(r, SOURCES);
    const bads = tier === 1 ? s.bad : [s.bad[0]!, s.bad[1]!, s.bad[2]!];
    const m = mc(r, t(s.good[0], s.good[1]), bads.map((b): [Text, Text] => [t(b[0], b[1]), t('This source may want to sell something, has no way to be checked, or does not say where it gets its facts. A reliable source is independent and explains its evidence.', 'Cette source peut vouloir vendre quelque chose, ne peut pas être vérifiée, ou n\'indique pas d\'où viennent ses faits. Une source fiable est indépendante et explique ses preuves.')]));
    return {
      prompt: bi((f) => f.t(`You want to find out ${s.q[0]}. Which source is the most reliable?`, `Tu veux connaître ${s.q[1]}. Quelle source est la plus fiable ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('Ask who made it, whether they gain from your choice, and whether they show their evidence.', 'Demande-toi qui l\'a produite, si elle gagne quelque chose de ton choix, et si elle montre ses preuves.'), t(`The most reliable source is ${s.good[0]}.`, `La source la plus fiable est ${s.good[1]}.`)],
      nudge: t('Which source has no reason to push you towards a choice and shows how it knows?', 'Quelle source n\'a aucune raison de t\'orienter vers un choix et montre comment elle sait ?'),
    };
  });
  const question = choiceGen('MS.G7.F1.2.a', (_t, r) => {
    const m = mc(r, t('Who made it, and could they gain from what I decide?', 'Qui l\'a produite, et pourrait-elle gagner quelque chose de ma décision ?'), [
      [t('How many people have shared it?', 'Combien de personnes l\'ont partagée ?'), t('Popular does not mean accurate. Something can be shared widely and still be wrong.', 'Populaire ne veut pas dire exact. Une chose peut être très partagée et quand même fausse.')],
      [t('Does it use bright colours and big pictures?', 'Utilise-t-elle des couleurs vives et de grandes images ?'), t('Design says nothing about whether the facts are right.', 'Le design ne dit rien sur l\'exactitude des faits.')],
      [t('Is it the first result I found?', 'Est-ce le premier résultat que j\'ai trouvé ?'), t('The order of search results is not a measure of reliability.', 'L\'ordre des résultats de recherche n\'est pas une mesure de fiabilité.')],
    ]);
    return {
      prompt: t('Which question best helps you decide whether a source of financial information is reliable?', 'Quelle question t\'aide le mieux à décider si une source d\'information financière est fiable ?'),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('A reliable source is trustworthy because of who made it and why, not because of how popular or flashy it is.', 'Une source fiable l\'est à cause de qui l\'a produite et pourquoi, pas à cause de sa popularité ou de son aspect tape-à-l\'œil.'), t('So the best question asks who made it and whether they could gain from your decision.', 'La meilleure question demande donc qui l\'a produite et si elle pourrait gagner quelque chose de ta décision.')],
      nudge: t('Think about who is speaking and what they want from you.', 'Pense à qui parle et à ce qu\'il attend de toi.'),
    };
  });
  return (tier: number, seed: number) => (tier === 3 ? question : pickGood(tier))(tier, seed);
})();

export const decisions7 = (() => {
  const unit = numGen('MS.G7.F1.4.a', (_tier, r) => {
    const qa = pick(r, [6, 8, 10, 12]), qb = pick(r, [15, 20, 24, 30]), ua = randInt(r, 3, 9) / 4, ub = r6(ua - pick(r, [0.2, 0.25, 0.3]));
    const better = ub < ua ? ub : ua;
    return {
      prompt: bi((f) => f.t(`A pack of ${f.N(qa)} pencils costs ${money(f, qa * ua)} and a pack of ${f.N(qb)} costs ${money(f, qb * ub)}. What is the lower price per pencil, in dollars?`, `Un paquet de ${f.N(qa)} crayons coûte ${money(f, qa * ua)} et un paquet de ${f.N(qb)} coûte ${money(f, qb * ub)}. Quel est le prix le plus bas par crayon, en dollars ?`)),
      answer: better, category: 'AP',
      wrong: wr(better, [[better === ub ? ua : ub, t('That is the price per pencil of the other pack. The question asks for the lower price per pencil.', 'C\'est le prix par crayon de l\'autre paquet. La question demande le prix par crayon le plus bas.'), 1], [r6(qa * ua), t('That is the price of a whole pack, not of one pencil.', 'C\'est le prix d\'un paquet entier, pas d\'un crayon.'), 0], [r6(qb * ub), t('That is the price of a whole pack, not of one pencil.', 'C\'est le prix d\'un paquet entier, pas d\'un crayon.'), 0]]),
      steps: [bi((f) => f.t(`Divide each price by its number of pencils: ${f.N(ua)} and ${f.D(ub)} each.`, `Divise chaque prix par son nombre de crayons : ${f.N(ua)} et ${f.D(ub)} chacun.`)), bi((f) => f.t(`The lower price per pencil is ${f.D(better)}.`, `Le prix le plus bas par crayon est ${f.D(better)}.`))],
      nudge: t('Divide each pack\'s price by the number of pencils in it, then compare.', 'Divise le prix de chaque paquet par le nombre de crayons qu\'il contient, puis compare.'),
    };
  });
  const total = numGen('MS.G7.F1.4.a', (_tier, r) => {
    const a = randInt(r, 4, 12) * 10, d = pick(r, [10, 20, 25]), ship = pick(r, [5, 8, 10]);
    const priceA = a, priceB = r6(a - randInt(r, 5, 15));
    const totalA = r6(priceA * (1 - d / 100)), totalB = r6(priceB + ship);
    const best = Math.min(totalA, totalB);
    return {
      prompt: bi((f) => f.t(`Store A sells a jacket for ${money(f, priceA)} with ${pct(f, d)} off and free delivery. Store B sells it for ${money(f, priceB)} plus ${money(f, ship)} delivery. What is the lowest total cost, in dollars?`, `Le magasin A vend un manteau ${money(f, priceA)} avec ${pct(f, d)} de rabais et livraison gratuite. Le magasin B le vend ${money(f, priceB)} plus ${money(f, ship)} de livraison. Quel est le coût total le plus bas, en dollars ?`)),
      answer: best, category: 'AP',
      wrong: wr(best, [[best === totalA ? totalB : totalA, t('That is the total for the other store. The question asks for the lowest total.', 'C\'est le total de l\'autre magasin. La question demande le total le plus bas.'), 1], [priceB, t('Delivery is part of the cost: add it for store B.', 'La livraison fait partie du coût : ajoute-la pour le magasin B.'), 1], [r6(priceA - d), t('The discount is a percent of the price, not a number of dollars.', 'Le rabais est un pourcentage du prix, pas un nombre de dollars.'), 0]]),
      steps: [bi((f) => f.t(`Store A: ${f.m(`${f.n(priceA)} \\times ${f.n(r6(1 - d / 100))}`)} = ${money(f, totalA)}. Store B: ${f.m(`${f.n(priceB)} + ${f.n(ship)}`)} = ${money(f, totalB)}.`, `Magasin A : ${f.m(`${f.n(priceA)} \\times ${f.n(r6(1 - d / 100))}`)} = ${money(f, totalA)}. Magasin B : ${f.m(`${f.n(priceB)} + ${f.n(ship)}`)} = ${money(f, totalB)}.`)), bi((f) => f.t(`The lowest total is ${money(f, best)}.`, `Le total le plus bas est ${money(f, best)}.`))],
      nudge: t('Work out the full cost at each store (discount and delivery) before comparing.', 'Calcule le coût total à chaque magasin (rabais et livraison) avant de comparer.'),
    };
  });
  const perYear = numGen('MS.G7.F1.4.a', (_tier, r) => {
    const ya = randInt(r, 2, 6), yb = randInt(r, 2, 6), ca = ya * randInt(r, 20, 60), cb = yb * randInt(r, 20, 60);
    const pa = r6(ca / ya), pb = r6(cb / yb), best = Math.min(pa, pb);
    return {
      prompt: bi((f) => f.t(`Backpack A costs ${money(f, ca)} and lasts ${f.N(ya)} years. Backpack B costs ${money(f, cb)} and lasts ${f.N(yb)} years. What is the lower cost per year, in dollars?`, `Le sac à dos A coûte ${money(f, ca)} et dure ${f.N(ya)} ans. Le sac à dos B coûte ${money(f, cb)} et dure ${f.N(yb)} ans. Quel est le coût annuel le plus bas, en dollars ?`)),
      answer: best, category: 'AP',
      wrong: wr(best, [[best === pa ? pb : pa, t('That is the cost per year of the other backpack. The question asks for the lower one.', 'C\'est le coût annuel de l\'autre sac à dos. La question demande le plus bas.'), 1], [Math.min(ca, cb), t('The cheaper price does not mean the cheaper cost: the backpack must also last. Divide by the years.', 'Le prix le plus bas n\'est pas le coût le plus bas : le sac doit aussi durer. Divise par les années.'), 0], [r6(Math.min(ca, cb) / Math.max(ya, yb)), t('Divide each price by its own number of years.', 'Divise chaque prix par son propre nombre d\'années.'), 0]]),
      steps: [bi((f) => f.t(`A: ${f.m(`${f.n(ca)} \\div ${f.n(ya)}`)} = ${f.N(pa)} per year. B: ${f.m(`${f.n(cb)} \\div ${f.n(yb)}`)} = ${f.N(pb)} per year.`, `A : ${f.m(`${f.n(ca)} \\div ${f.n(ya)}`)} = ${f.N(pa)} par an. B : ${f.m(`${f.n(cb)} \\div ${f.n(yb)}`)} = ${f.N(pb)} par an.`)), bi((f) => f.t(`The lower cost is ${f.D(best)} per year.`, `Le coût le plus bas est ${f.D(best)} par an.`))],
      nudge: t('Divide each price by the years it lasts, then compare the yearly costs.', 'Divise chaque prix par les années de durée de vie, puis compare les coûts annuels.'),
    };
  });
  return tierGen(unit, total, perYear);
})();
