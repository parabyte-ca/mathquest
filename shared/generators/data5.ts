// Grade 5 Data strand (D), the expectations that were not built before 2.8.2, using words and numbers only (no drawn graphs):
// sampling, relative-frequency tables, choosing graphs (including stacked-bar graphs) and analysing graphs.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G5.D1.1.a: why the sampling technique matters for a representative sample */
const SAMPLES: { q: [string, string]; good: [string, string]; bad: [string, string][] }[] = [
  { q: ['You want to know the favourite lunch of all the students in a school.', 'Tu veux connaître le dîner préféré de tous les élèves d\'une école.'], good: ['Ask 5 randomly chosen students from every grade', 'Demander à 5 élèves choisis au hasard dans chaque année'], bad: [['Ask only the students on the soccer team', 'Demander seulement aux élèves de l\'équipe de soccer'], ['Ask only your closest friends', 'Demander seulement à tes meilleurs amis'], ['Ask only the students in Grade 6', 'Demander seulement aux élèves de 6e année']] },
  { q: ['A town wants to know if people want a new park.', 'Une ville veut savoir si les gens veulent un nouveau parc.'], good: ['Call a random selection of homes from the whole town', 'Appeler au hasard des foyers de toute la ville'], bad: [['Ask only people who are already at the park', 'Demander seulement aux gens qui sont déjà au parc'], ['Ask only the neighbours on one street', 'Demander seulement aux voisins d\'une seule rue'], ['Ask only people who work for the town', 'Demander seulement aux gens qui travaillent pour la ville']] },
  { q: ['You want to know how many hours Grade 5 students sleep.', 'Tu veux savoir combien d\'heures dorment les élèves de 5e année.'], good: ['Ask students picked at random from every Grade 5 class', 'Demander à des élèves choisis au hasard dans chaque classe de 5e année'], bad: [['Ask only the students who arrive early', 'Demander seulement aux élèves qui arrivent tôt'], ['Ask only the students in one Grade 5 class', 'Demander seulement aux élèves d\'une seule classe de 5e année'], ['Ask only the students who volunteer', 'Demander seulement aux élèves qui se portent volontaires']] },
  { q: ['A library wants to know which kinds of books its members like.', 'Une bibliothèque veut savoir quels genres de livres ses membres aiment.'], good: ['Ask members chosen at random from the whole member list', 'Demander à des membres choisis au hasard dans toute la liste des membres'], bad: [['Ask only people borrowing comic books today', 'Demander seulement aux gens qui empruntent des bandes dessinées aujourd\'hui'], ['Ask only the librarians\' friends', 'Demander seulement aux amis des bibliothécaires'], ['Ask only members who live next door', 'Demander seulement aux membres qui habitent à côté']] },
];
const sample1 = choiceGen('MS.G5.D1.1.a', (_tier, r) => {
  const s = pick(r, SAMPLES);
  const m = mc(r, t(...s.good), s.bad.slice(0, 2).map((b): [Text, Text] => [t(...b), t('This leaves out many kinds of people, so the sample is not fair to the whole group. A random choice from everyone gives each person the same chance.', 'Cela laisse de côté beaucoup de gens : l\'échantillon n\'est pas juste pour tout le groupe. Un choix au hasard parmi tous donne à chacun la même chance.')]));
  return {
    prompt: t(`${s.q[0]} Which way of choosing people gives the best sample?`, `${s.q[1]} Quelle façon de choisir les gens donne le meilleur échantillon ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('A good sample is representative: it looks like the whole group. Choosing at random from everyone gives each person the same chance.', 'Un bon échantillon est représentatif : il ressemble à tout le groupe. Choisir au hasard parmi tous donne à chacun la même chance.'), t('Choosing only one small or special part of the group makes the results biased.', 'Choisir seulement une petite partie ou une partie particulière du groupe rend les résultats biaisés.')],
    nudge: t('Which choice gives everyone in the whole group a chance to be asked?', 'Quel choix donne à tout le groupe une chance d\'être interrogé ?'),
  };
});
const biased = choiceGen('MS.G5.D1.1.a', (_tier, r) => {
  const s = pick(r, SAMPLES), b = pick(r, s.bad);
  const other = pick(r, SAMPLES.filter((x) => x !== s));
  const m2 = mc(r, t(...b), [[t(...s.good), t('This picks people at random from the whole group, so it is a fair sample, not a biased one.', 'Cela choisit des gens au hasard dans tout le groupe : c\'est un échantillon juste, pas biaisé.')], [t(...other.good), t('This is also a random choice from a whole group, so it is a fair sample.', 'C\'est aussi un choix au hasard dans tout un groupe : c\'est un échantillon juste.')]]);
  return {
    prompt: t(`${s.q[0]} Which way of choosing people would give a biased sample?`, `${s.q[1]} Quelle façon de choisir les gens donnerait un échantillon biaisé ?`),
    options: m2.options, correct: m2.correct, why: m2.why, category: 'AP',
    steps: [t('A biased sample leaves out part of the group, so its results do not match the whole group.', 'Un échantillon biaisé laisse de côté une partie du groupe : ses résultats ne correspondent pas à tout le groupe.'), t('Look for the choice that only asks one special part of the group.', 'Cherche le choix qui ne s\'adresse qu\'à une partie particulière du groupe.')],
    nudge: t('Which choice leaves some people with no chance of being asked?', 'Quel choix laisse certaines personnes sans aucune chance d\'être interrogées ?'),
  };
});
const sizeMatters = choiceGen('MS.G5.D1.1.a', (_tier, r) => {
  const a = randInt(r, 2, 4) * 5, b = a * randInt(r, 4, 8);
  const m = mc(r, t(`The sample of ${b} students, because a larger random sample is more likely to match the whole group`, `L'échantillon de ${b} élèves, parce qu'un plus grand échantillon au hasard a plus de chances de ressembler à tout le groupe`), [
    [t(`The sample of ${a} students, because it is quicker to collect`, `L'échantillon de ${a} élèves, parce qu'il est plus rapide à recueillir`), t('Being quick does not make a sample better. A small sample can be far from the whole group.', 'La rapidité ne rend pas un échantillon meilleur. Un petit échantillon peut être très loin du groupe entier.')],
    [t('Both are equally good, because both are random', 'Les deux sont également bons, parce que les deux sont au hasard'), t('Both are random, but a larger random sample usually gives results closer to the whole group.', 'Les deux sont au hasard, mais un plus grand échantillon au hasard donne généralement des résultats plus proches de tout le groupe.')],
  ]);
  return {
    prompt: t(`Two surveys each choose students at random from the whole school. One asks ${a} students and the other asks ${b} students. Which sample is more likely to be representative, and why?`, `Deux sondages choisissent chacun des élèves au hasard dans toute l'école. L'un interroge ${a} élèves et l'autre en interroge ${b}. Quel échantillon est le plus susceptible d'être représentatif, et pourquoi ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [t('Both samples are chosen fairly, so the difference is the size.', 'Les deux échantillons sont choisis équitablement : la différence est la taille.'), t('A larger random sample is more likely to look like the whole group.', 'Un plus grand échantillon au hasard a plus de chances de ressembler à tout le groupe.')],
    nudge: t('Both are chosen fairly. What is different about them?', 'Les deux sont choisis équitablement. Qu\'est-ce qui les distingue ?'),
  };
});
export const sampling5 = tierGen(sample1, biased, sizeMatters);

/** MS.G5.D1.2.a: organizing data in relative-frequency tables */
const relDecimal = numGen('MS.G5.D1.2.a', (_tier, r) => {
  const total = pick(r, [10, 20, 25, 50]);
  const count = randInt(r, 1, total - 1);
  const ans = r6(count / total);
  return {
    prompt: bi((f) => f.t(`${f.N(total)} students were asked their favourite pet. ${f.N(count)} chose dogs. What is the relative frequency of dogs, as a decimal? (Relative frequency is the count divided by the total.)`, `${f.N(total)} élèves ont été interrogés sur leur animal préféré. ${f.N(count)} ont choisi les chiens. Quelle est la fréquence relative des chiens, en nombre décimal ? (La fréquence relative est l'effectif divisé par le total.)`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6(total / count), t('The division is upside down. Divide the count by the total.', 'La division est à l\'envers. Divise l\'effectif par le total.'), 0], [count, t('That is the count, not the relative frequency. Divide it by the total.', 'C\'est l\'effectif, pas la fréquence relative. Divise-le par le total.'), 0]]),
    steps: [t('Relative frequency is the count divided by the total number of data values.', 'La fréquence relative est l\'effectif divisé par le nombre total de données.'), bi((f) => `${f.N(count)} ÷ ${f.N(total)} = ${f.N(ans)}.`)],
    nudge: t('Divide the count for dogs by the total number of students asked.', 'Divise l\'effectif des chiens par le nombre total d\'élèves interrogés.'),
  };
});
const relPercent = numGen('MS.G5.D1.2.a', (_tier, r) => {
  const total = pick(r, [20, 25, 40, 50]);
  const count = randInt(r, 1, total - 1);
  const ans = r6((count * 100) / total);
  return {
    prompt: bi((f) => f.t(`In a survey of ${f.N(total)} students, ${f.N(count)} said they walk to school. What percent of the students walk to school?`, `Dans un sondage auprès de ${f.N(total)} élèves, ${f.N(count)} ont dit qu'ils marchent pour aller à l'école. Quel pourcentage des élèves marche pour aller à l'école ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[count, t('That is the count, not the percent. Divide by the total and multiply by 100.', 'C\'est l\'effectif, pas le pourcentage. Divise par le total et multiplie par 100.'), 0], [r6(count / total), t('That is the decimal. Multiply it by 100 to write it as a percent.', 'C\'est le nombre décimal. Multiplie-le par 100 pour l\'écrire en pourcentage.'), 1]]),
    steps: [bi((f) => `${f.N(count)} ÷ ${f.N(total)} = ${f.N(r6(count / total))}.`), bi((f) => `${f.N(r6(count / total))} × ${f.N(100)} = ${f.N(ans)}%.`)],
    nudge: t('Divide the count by the total, then multiply by 100.', 'Divise l\'effectif par le total, puis multiplie par 100.'),
  };
});
const relMissing = numGen('MS.G5.D1.2.a', (_tier, r) => {
  const total = pick(r, [20, 40, 100]);
  const a = randInt(r, 2, 6) * 5, b = randInt(r, 2, 6) * 5, c = randInt(r, 1, 4) * 5;
  const missing = 100 - a - b - c;
  const count = (total * missing) / 100;
  return {
    prompt: bi((f) => f.t(`A relative-frequency table for ${f.N(total)} students shows ${f.N(a)}% for soccer, ${f.N(b)}% for hockey and ${f.N(c)}% for swimming. Everyone else chose basketball. How many students chose basketball?`, `Un tableau de fréquences relatives pour ${f.N(total)} élèves montre ${f.N(a)} % pour le soccer, ${f.N(b)} % pour le hockey et ${f.N(c)} % pour la natation. Tous les autres ont choisi le basketball. Combien d'élèves ont choisi le basketball ?`)),
    answer: count, category: 'TH',
    wrong: wr(count, [[missing, t('That is the percent for basketball, not the number of students. Find that percent of the total.', 'C\'est le pourcentage du basketball, pas le nombre d\'élèves. Trouve ce pourcentage du total.'), 1], [(total * (a + b + c)) / 100, t('That is the number of students who chose the other sports. Basketball is the rest.', 'C\'est le nombre d\'élèves qui ont choisi les autres sports. Le basketball, c\'est le reste.'), 1]]),
    steps: [bi((f) => f.t(`The percents add to ${f.N(100)}, so basketball is ${f.N(100)} − ${f.N(a)} − ${f.N(b)} − ${f.N(c)} = ${f.N(missing)}%.`, `Les pourcentages totalisent ${f.N(100)} : le basketball est ${f.N(100)} − ${f.N(a)} − ${f.N(b)} − ${f.N(c)} = ${f.N(missing)} %.`)), bi((f) => f.t(`${f.N(missing)}% of ${f.N(total)} = ${f.N(count)} students.`, `${f.N(missing)} % de ${f.N(total)} = ${f.N(count)} élèves.`))],
    nudge: t('Find the missing percent first, then that percent of the total.', 'Trouve d\'abord le pourcentage manquant, puis ce pourcentage du total.'),
  };
});
export const relFrequency5 = tierGen(relDecimal, relPercent, relMissing);

/** MS.G5.D1.3.a: choosing graphs, including stacked-bar graphs */
const G5GRAPHS: { id: string; en: string; fr: string; why: [string, string] }[] = [
  { id: 'bar', en: 'Bar graph', fr: 'Diagramme à bandes', why: ['A bar graph compares one total for each category. This needs parts inside each category.', 'Un diagramme à bandes compare un total pour chaque catégorie. Ici, il faut des parties dans chaque catégorie.'] },
  { id: 'stacked', en: 'Stacked-bar graph', fr: 'Diagramme à bandes superposées', why: ['A stacked-bar graph shows the parts that make up each total. This data does not have parts inside each category.', 'Un diagramme à bandes superposées montre les parties qui composent chaque total. Ces données n\'ont pas de parties dans chaque catégorie.'] },
  { id: 'line', en: 'Broken-line graph', fr: 'Graphique à ligne brisée', why: ['A broken-line graph shows change over time. This data is not about change over time.', 'Un graphique à ligne brisée montre un changement dans le temps. Ces données ne concernent pas un changement dans le temps.'] },
  { id: 'circle', en: 'Circle graph', fr: 'Diagramme circulaire', why: ['A circle graph shows parts of one whole. This is not parts of a single whole.', 'Un diagramme circulaire montre des parties d\'un seul tout. Ce ne sont pas des parties d\'un seul tout.'] },
];
const CHOOSE5: { id: string; tier: number; en: string; fr: string }[] = [
  { id: 'bar', tier: 1, en: 'You want to compare how many students chose each of five favourite colours.', fr: 'Tu veux comparer combien d\'élèves ont choisi chacune de cinq couleurs préférées.' },
  { id: 'bar', tier: 1, en: 'You want to compare the number of books four classes read.', fr: 'Tu veux comparer le nombre de livres lus par quatre classes.' },
  { id: 'line', tier: 1, en: 'You want to show how the temperature changed every hour during a day.', fr: 'Tu veux montrer comment la température a changé chaque heure pendant une journée.' },
  { id: 'line', tier: 1, en: 'You want to show how your savings grew each month for a year.', fr: 'Tu veux montrer comment tes économies ont augmenté chaque mois pendant un an.' },
  { id: 'circle', tier: 1, en: 'You want to show what part of the class likes each kind of music, as parts of one whole.', fr: 'Tu veux montrer quelle part de la classe aime chaque genre de musique, comme des parties d\'un tout.' },
  { id: 'stacked', tier: 2, en: 'You have the number of boys and girls in each of Grades 4, 5 and 6, and you want to show the boys and girls parts of each grade\'s total.', fr: 'Tu as le nombre de garçons et de filles dans chacune des 4e, 5e et 6e années, et tu veux montrer les parties des garçons et des filles dans le total de chaque année.' },
  { id: 'stacked', tier: 2, en: 'You asked students in three classes whether they walk, bike or take the bus, and you want to show each class total split by how they travel.', fr: 'Tu as demandé à des élèves de trois classes s\'ils marchent, font du vélo ou prennent l\'autobus, et tu veux montrer le total de chaque classe réparti selon le moyen de transport.' },
  { id: 'bar', tier: 2, en: 'You want to compare the total points four teams scored.', fr: 'Tu veux comparer le total de points marqués par quatre équipes.' },
  { id: 'line', tier: 2, en: 'You want to show how the number of visitors to a museum changed each year for ten years.', fr: 'Tu veux montrer comment le nombre de visiteurs d\'un musée a changé chaque année pendant dix ans.' },
  { id: 'stacked', tier: 3, en: 'A school collected the number of students who like each of three sports, separated into primary and junior students. You want to keep the totals for each sport and also show the two groups inside each total. Which graph is best?', fr: 'Une école a recueilli le nombre d\'élèves qui aiment chacun de trois sports, séparés en élèves du primaire et du cycle moyen. Tu veux garder les totaux de chaque sport et montrer aussi les deux groupes dans chaque total. Quel graphique est le meilleur ?' },
  { id: 'bar', tier: 3, en: 'You want to compare only the total number of students who like each of three sports, without splitting them into groups. Which graph is best?', fr: 'Tu veux comparer seulement le nombre total d\'élèves qui aiment chacun de trois sports, sans les séparer en groupes. Quel graphique est le meilleur ?' },
  { id: 'line', tier: 3, en: 'The height of a sunflower is measured every week for eight weeks. You want to show how fast it grew. Which graph is best?', fr: 'La hauteur d\'un tournesol est mesurée chaque semaine pendant huit semaines. Tu veux montrer à quelle vitesse il a poussé. Quel graphique est le meilleur ?' },
  { id: 'circle', tier: 3, en: 'A family\'s monthly spending is split into rent, food, travel and fun, and the parts add to the whole month. Which graph shows the parts of that one whole? ', fr: 'Les dépenses mensuelles d\'une famille sont réparties en loyer, nourriture, déplacements et loisirs, et les parties totalisent le mois entier. Quel graphique montre les parties de ce tout ? ' },
];
export const chooseGraph5 = choiceGen('MS.G5.D1.3.a', (tier, r) => {
  const sc = pick(r, CHOOSE5.filter((c) => c.tier === tier));
  const pool = tier === 1 ? G5GRAPHS.filter((g) => g.id !== 'stacked') : G5GRAPHS;
  const right = G5GRAPHS.find((g) => g.id === sc.id)!;
  const m = mc(r, t(right.en, right.fr), pool.filter((g) => g.id !== sc.id).map((g): [Text, Text] => [t(g.en, g.fr), t(...g.why)]));
  const prompt = tier === 3 ? t(sc.en.trim(), sc.fr.trim()) : t(`${sc.en} Which graph is best?`, `${sc.fr} Quel graphique est le meilleur ?`);
  return {
    prompt, options: m.options, correct: m.correct, why: m.why, category: tier === 1 ? 'KU' : 'AP',
    steps: [t('Match the purpose to the graph: bar graphs compare categories, stacked-bar graphs show the parts inside each total, circle graphs show parts of one whole, and broken-line graphs show change over time.', 'Associe le but au graphique : les diagrammes à bandes comparent des catégories, les diagrammes à bandes superposées montrent les parties dans chaque total, les diagrammes circulaires montrent des parties d\'un tout et les graphiques à ligne brisée montrent un changement dans le temps.'), t(`Here the best choice is the ${right.en.toLowerCase()}.`, `Ici, le meilleur choix est le ${right.fr.charAt(0).toLowerCase() + right.fr.slice(1)}.`)],
    nudge: t('What should the graph show: a comparison, parts inside totals, parts of a whole, or change over time?', 'Que doit montrer le graphique : une comparaison, des parties dans des totaux, des parties d\'un tout ou un changement dans le temps ?'),
  };
});

/** MS.G5.D1.6.a: analysing data, including stacked-bar and misleading graphs */
const misleading5 = choiceGen('MS.G5.D1.6.a', (_tier, r) => {
  const start = pick(r, [20, 50, 80, 100]);
  const a = start + randInt(r, 2, 6), b = a + randInt(r, 2, 5);
  const m = mc(r, t('The vertical axis does not start at zero, so the bars look more different than the numbers really are.', 'L\'axe vertical ne commence pas à zéro : les bandes paraissent plus différentes que ne le sont vraiment les nombres.'), [
    [t('The bars are too colourful.', 'Les bandes sont trop colorées.'), t('Colour does not change the numbers. The problem is where the axis starts.', 'La couleur ne change pas les nombres. Le problème, c\'est où commence l\'axe.')],
    [t('Nothing is wrong: a taller bar always means a much bigger number.', 'Rien n\'est faux : une bande plus haute veut toujours dire un nombre beaucoup plus grand.'), t('A taller bar only means a much bigger number when the axis starts at zero.', 'Une bande plus haute ne veut dire un nombre beaucoup plus grand que si l\'axe commence à zéro.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A bar graph shows ${f.N(a)} and ${f.N(b)}, but the vertical axis starts at ${f.N(start)}, not ${f.N(0)}. What is misleading about the graph?`, `Un diagramme à bandes montre ${f.N(a)} et ${f.N(b)}, mais l'axe vertical commence à ${f.N(start)}, et non à ${f.N(0)}. Qu'est-ce qui est trompeur dans le graphique ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`The bars are drawn from ${f.N(start)}, so their drawn heights are only ${f.N(a - start)} and ${f.N(b - start)}.`, `Les bandes sont tracées à partir de ${f.N(start)} : leurs hauteurs tracées ne sont que ${f.N(a - start)} et ${f.N(b - start)}.`)), t('So a small difference looks big. Always check where an axis starts.', 'Une petite différence paraît donc grande. Vérifie toujours où commence un axe.')],
    nudge: t('Look at where the vertical axis starts.', 'Regarde où commence l\'axe vertical.'),
  };
});
const stackedRead = numGen('MS.G5.D1.6.a', (_tier, r) => {
  const boys = randInt(r, 5, 15), girls = randInt(r, 5, 15), total2 = randInt(r, 20, 35), girls2 = randInt(r, 6, total2 - 6);
  const boys2 = total2 - girls2;
  return {
    prompt: bi((f) => f.t(`A stacked-bar graph shows each grade's total split into boys and girls. The Grade 4 bar has ${f.N(boys)} boys and ${f.N(girls)} girls. The Grade 5 bar reaches a total of ${f.N(total2)}, and its girls part is ${f.N(girls2)}. How many boys are in Grade 5?`, `Un diagramme à bandes superposées montre le total de chaque année réparti entre garçons et filles. La bande de 4e année a ${f.N(boys)} garçons et ${f.N(girls)} filles. La bande de 5e année atteint un total de ${f.N(total2)}, et sa partie des filles est de ${f.N(girls2)}. Combien de garçons y a-t-il en 5e année ?`)),
    answer: boys2, category: 'AP',
    wrong: wr(boys2, [[total2, t('That is the whole bar, boys and girls together. Take away the girls part.', 'C\'est toute la bande, garçons et filles ensemble. Retire la partie des filles.'), 0], [boys, t('That is the number of boys in Grade 4. The question is about Grade 5.', 'C\'est le nombre de garçons en 4e année. La question porte sur la 5e année.'), 0]]),
    steps: [t('The whole bar is the total. The boys part is the total minus the girls part.', 'La bande entière est le total. La partie des garçons est le total moins la partie des filles.'), bi((f) => `${f.N(total2)} − ${f.N(girls2)} = ${f.N(boys2)}.`)],
    nudge: t('Take the girls part away from the total of the Grade 5 bar.', 'Retire la partie des filles du total de la bande de 5e année.'),
  };
});
const apparent5 = numGen('MS.G5.D1.6.a', (_tier, r) => {
  const start = pick(r, [20, 40, 50, 80, 90]), u = randInt(r, 2, 5), k = randInt(r, 2, 5);
  const a = start + u, b = start + k * u;
  return {
    prompt: bi((f) => f.t(`A bar graph's vertical axis starts at ${f.N(start)}. Bar A shows ${f.N(a)} and bar B shows ${f.N(b)}. How many times as tall as bar A does bar B look?`, `L'axe vertical d'un diagramme à bandes commence à ${f.N(start)}. La bande A montre ${f.N(a)} et la bande B montre ${f.N(b)}. Combien de fois la bande B paraît-elle plus haute que la bande A ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[r6(b / a), t('That is the real ratio of the two numbers. The drawn bars start at the axis start, so compare the drawn heights.', 'C\'est le vrai rapport des deux nombres. Les bandes tracées partent du début de l\'axe : compare les hauteurs tracées.'), 0], [b - a, t('That is the difference of the numbers, not how many times as tall.', 'C\'est la différence des nombres, pas combien de fois plus haute.'), 1]]),
    steps: [bi((f) => f.t(`Drawn heights: bar A ${f.N(a)} − ${f.N(start)} = ${f.N(u)}, bar B ${f.N(b)} − ${f.N(start)} = ${f.N(k * u)}.`, `Hauteurs tracées : bande A ${f.N(a)} − ${f.N(start)} = ${f.N(u)}, bande B ${f.N(b)} − ${f.N(start)} = ${f.N(k * u)}.`)), bi((f) => `${f.N(k * u)} ÷ ${f.N(u)} = ${f.N(k)}.`)],
    nudge: t('Take the start of the axis away from each number, then divide.', 'Retire le début de l\'axe de chaque nombre, puis divise.'),
  };
});
export const analyse5 = tierGen(misleading5, stackedRead, apparent5);
