// Grade 5 Algebra strand (C), the expectations that were not built before 2.8.2: kinds of patterns, tables of values, and
// translating between words and algebraic expressions.
import { pick, randInt, shuffle } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const list = (f: { n: (x: number) => string }, xs: number[]): string => xs.map((x) => f.n(x)).join(',\\ ');

/** MS.G5.C1.1.a: repeating, growing and shrinking patterns, including real-life patterns */
const repeating5 = numGen('MS.G5.C1.1.a', (_tier, r) => {
  const cycle = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
  const n = randInt(r, 10, 25);
  const ans = cycle[(n - 1) % 3]!;
  return {
    prompt: bi((f) => f.t(`A repeating pattern goes ${f.m(list(f, [...cycle, ...cycle]) + ',\\ \\ldots')} What is term ${f.N(n)}?`, `Une suite répétitive va ${f.m(list(f, [...cycle, ...cycle]) + ',\\ \\ldots')} Quel est le terme ${f.N(n)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[cycle[n % 3]!, t('The count is off by one. Term 1 is the first number of the core.', 'Le compte est décalé de un. Le terme 1 est le premier nombre du motif de base.'), 1], [cycle[0]!, t('That is the first number of the core. Find where the term number falls in the repeat.', 'C\'est le premier nombre du motif de base. Trouve où tombe le numéro du terme dans la répétition.'), 1]]),
    steps: [bi((f) => f.t(`The core has ${f.N(3)} numbers. Divide ${f.N(n)} by ${f.N(3)}: the remainder is ${f.N(n % 3)}.`, `Le motif de base a ${f.N(3)} nombres. Divise ${f.N(n)} par ${f.N(3)} : le reste est ${f.N(n % 3)}.`)), bi((f) => (n % 3 === 0 ? f.t(`A remainder of ${f.N(0)} means the last number of the core: ${f.N(ans)}.`, `Un reste de ${f.N(0)} signifie le dernier nombre du motif de base : ${f.N(ans)}.`) : f.t(`A remainder of ${f.N(n % 3)} means number ${f.N(n % 3)} of the core: ${f.N(ans)}.`, `Un reste de ${f.N(n % 3)} signifie le nombre ${f.N(n % 3)} du motif de base : ${f.N(ans)}.`)))],
    nudge: t('Divide the term number by the length of the core and look at the remainder.', 'Divise le numéro du terme par la longueur du motif de base et regarde le reste.'),
  };
});
const growing5 = numGen('MS.G5.C1.1.a', (_tier, r) => {
  const grow = r() < 0.5, d = randInt(r, 2, 9), n = randInt(r, 5, 10);
  const start = grow ? randInt(r, 1, 20) : d * (n + randInt(r, 1, 4));
  const ans = grow ? start + d * (n - 1) : start - d * (n - 1);
  return {
    prompt: bi((f) => grow
      ? f.t(`A growing pattern starts at ${f.N(start)} and goes up by ${f.N(d)} each term. What is term ${f.N(n)}?`, `Une suite croissante commence à ${f.N(start)} et augmente de ${f.N(d)} à chaque terme. Quel est le terme ${f.N(n)} ?`)
      : f.t(`A shrinking pattern starts at ${f.N(start)} and goes down by ${f.N(d)} each term. What is term ${f.N(n)}?`, `Une suite décroissante commence à ${f.N(start)} et diminue de ${f.N(d)} à chaque terme. Quel est le terme ${f.N(n)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[grow ? start + d * n : start - d * n, t('One jump too many. The first term is the starting number, so there are only n − 1 jumps.', 'Un écart de trop. Le premier terme est le nombre de départ : il n\'y a que n − 1 écarts.'), 1], [grow ? start - d * (n - 1) : start + d * (n - 1), t('The jumps go the wrong way. A growing pattern adds the jump and a shrinking pattern takes it away.', 'Les écarts vont dans le mauvais sens. Une suite croissante ajoute l\'écart et une suite décroissante le retire.'), 1]]),
    steps: [bi((f) => f.t(`To reach term ${f.N(n)} you take ${f.N(n - 1)} jumps of ${f.N(d)}: ${f.N((n - 1) * d)}.`, `Pour atteindre le terme ${f.N(n)}, tu fais ${f.N(n - 1)} écarts de ${f.N(d)} : ${f.N((n - 1) * d)}.`)), bi((f) => `${f.N(start)} ${grow ? '+' : '−'} ${f.N((n - 1) * d)} = ${f.N(ans)}.`)],
    nudge: t('Count the jumps: one fewer than the term number.', 'Compte les écarts : un de moins que le numéro du terme.'),
  };
});
const KIND: Record<string, [string, string]> = { growing: ['growing', 'croissante'], shrinking: ['shrinking', 'décroissante'], repeating: ['repeating', 'répétitive'] };
const whichKind = choiceGen('MS.G5.C1.1.a', (_tier, r) => {
  const a = randInt(r, 1, 6), d = randInt(r, 2, 5);
  const core = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
  const seqs: Record<string, number[]> = {
    growing: [0, 1, 2, 3, 4].map((k) => a + d * k),
    shrinking: [0, 1, 2, 3, 4].map((k) => a + 5 * d - d * k),
    repeating: [...core, core[0]!, core[1]!],
  };
  const ask = pick(r, ['growing', 'shrinking', 'repeating']);
  const tx = (k: string): Text => bi((f) => f.m(list(f, seqs[k]!)));
  const m = mc(r, tx(ask), Object.keys(seqs).filter((k) => k !== ask).map((k): [Text, Text] => [tx(k), t(`This pattern is ${KIND[k]![0]}, not ${KIND[ask]![0]}. Look at how the numbers change from one term to the next.`, `Cette suite est ${KIND[k]![1]}, pas ${KIND[ask]![1]}. Regarde comment les nombres changent d'un terme au suivant.`)]));
  return {
    prompt: t(`Which of these is a ${KIND[ask]![0]} pattern?`, `Laquelle de ces suites est une suite ${KIND[ask]![1]} ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('A growing pattern goes up each term, a shrinking pattern goes down each term, and a repeating pattern has a core that comes back again and again.', 'Une suite croissante monte à chaque terme, une suite décroissante descend à chaque terme, et une suite répétitive a un motif de base qui revient encore et encore.'), t(`Check how each list changes to find the ${KIND[ask]![0]} one.`, `Vérifie comment chaque liste change pour trouver la suite ${KIND[ask]![1]}.`)],
    nudge: t('Look at the first few terms: do they go up, go down, or come back?', 'Regarde les premiers termes : montent-ils, descendent-ils ou reviennent-ils ?'),
  };
});
export const patternKinds5 = tierGen(repeating5, growing5, whichKind);

/** MS.G5.C1.2.a: creating and translating growing and shrinking patterns using tables of values */
const missingTable = numGen('MS.G5.C1.2.a', (_tier, r) => {
  const d = randInt(r, 2, 9), s = randInt(r, 1, 12), miss = randInt(r, 2, 4);
  const vals = [1, 2, 3, 4, 5].map((k) => s + d * (k - 1));
  const shown = vals.slice(0, 5).map((v, i) => (i === miss ? '?' : String(v)));
  return {
    prompt: bi((f) => f.t(`A table shows term numbers 1, 2, 3, 4, 5 with the values ${f.m(shown.map((x) => (x === '?' ? '?' : f.n(Number(x)))).join(',\\ '))}. The pattern is growing by the same amount each term. What number replaces the ?`, `Un tableau montre les numéros de termes 1, 2, 3, 4, 5 avec les valeurs ${f.m(shown.map((x) => (x === '?' ? '?' : f.n(Number(x)))).join(',\\ '))}. La suite augmente du même montant à chaque terme. Quel nombre remplace le ? ?`)),
    answer: vals[miss]!, category: 'AP',
    wrong: wr(vals[miss]!, [[vals[miss - 1]!, t('That is the value before the gap. Add the jump once to it.', 'C\'est la valeur avant le trou. Ajoute-lui l\'écart une fois.'), 1], [vals[miss]! + d, t('That adds the jump one time too many.', 'Cela ajoute l\'écart une fois de trop.'), 1]]),
    steps: [bi((f) => f.t(`The values go up by ${f.N(d)} each term.`, `Les valeurs augmentent de ${f.N(d)} à chaque terme.`)), bi((f) => f.t(`${f.N(vals[miss - 1]!)} + ${f.N(d)} = ${f.N(vals[miss]!)}.`, `${f.N(vals[miss - 1]!)} + ${f.N(d)} = ${f.N(vals[miss]!)}.`))],
    nudge: t('Find the jump between two neighbouring values, then add it to the value before the gap.', 'Trouve l\'écart entre deux valeurs voisines, puis ajoute-le à la valeur avant le trou.'),
  };
});
const ruleTable = numGen('MS.G5.C1.2.a', (_tier, r) => {
  const s = randInt(r, 2, 15), d = randInt(r, 2, 8), n = randInt(r, 6, 10);
  const ans = s + d * (n - 1);
  return {
    prompt: bi((f) => f.t(`A rule says: start at ${f.N(s)} and add ${f.N(d)} each time. The first row of a table is term ${f.N(1)} with value ${f.N(s)}. What is the value in the row for term ${f.N(n)}?`, `Une règle dit : commence à ${f.N(s)} et ajoute ${f.N(d)} chaque fois. La première ligne d'un tableau est le terme ${f.N(1)} avec la valeur ${f.N(s)}. Quelle est la valeur dans la ligne du terme ${f.N(n)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[s + d * n, t('One jump too many: term 1 is the start, so term n has n − 1 jumps.', 'Un écart de trop : le terme 1 est le départ, donc le terme n a n − 1 écarts.'), 1], [d * n, t('That leaves out the starting value. Start at the first value, then add the jumps.', 'Cela oublie la valeur de départ. Pars de la première valeur, puis ajoute les écarts.'), 1]]),
    steps: [bi((f) => f.t(`Term ${f.N(n)} is ${f.N(n - 1)} jumps after term ${f.N(1)}: ${f.N(n - 1)} × ${f.N(d)} = ${f.N((n - 1) * d)}.`, `Le terme ${f.N(n)} est ${f.N(n - 1)} écarts après le terme ${f.N(1)} : ${f.N(n - 1)} × ${f.N(d)} = ${f.N((n - 1) * d)}.`)), bi((f) => `${f.N(s)} + ${f.N((n - 1) * d)} = ${f.N(ans)}.`)],
    nudge: t('Count the jumps from term 1 to the term you want, then add them to the start.', 'Compte les écarts du terme 1 au terme voulu, puis ajoute-les au départ.'),
  };
});
const shrinkTable = numGen('MS.G5.C1.2.a', (_tier, r) => {
  const d = randInt(r, 2, 8), n = randInt(r, 6, 9), s = d * (n + randInt(r, 1, 4));
  const vals = [1, 2, 3, 4].map((k) => s - d * (k - 1));
  const ans = s - d * (n - 1);
  return {
    prompt: bi((f) => f.t(`A table shows term numbers 1, 2, 3, 4 with the values ${f.m(list(f, vals))}. If the pattern keeps shrinking in the same way, what is the value for term ${f.N(n)}?`, `Un tableau montre les numéros de termes 1, 2, 3, 4 avec les valeurs ${f.m(list(f, vals))}. Si la suite continue de décroître de la même façon, quelle est la valeur du terme ${f.N(n)} ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[vals[3]! - d * (n - 4) + d, t('That uses one jump too few. From term 4 to the term you want, count the steps carefully.', 'Cela utilise un écart de moins. Du terme 4 au terme voulu, compte bien les pas.'), 1], [s - d * n, t('That takes one jump too many off the starting value.', 'Cela retire un écart de trop de la valeur de départ.'), 1]]),
    steps: [bi((f) => f.t(`The values go down by ${f.N(d)} each term, starting at ${f.N(s)}.`, `Les valeurs diminuent de ${f.N(d)} à chaque terme, en partant de ${f.N(s)}.`)), bi((f) => `${f.N(s)} − ${f.N(n - 1)} × ${f.N(d)} = ${f.N(ans)}.`)],
    nudge: t('Find the jump, then take away one jump for each step after term 1.', 'Trouve l\'écart, puis retire un écart pour chaque pas après le terme 1.'),
  };
});
export const tablesOfValues5 = tierGen(missingTable, ruleTable, shrinkTable);

/** MS.G5.C2.1.a: translating among words, algebraic expressions and equivalent relationships */
const words5 = choiceGen('MS.G5.C2.1.a', (_tier, r) => {
  const k = randInt(r, 2, 9);
  const kind = pick(r, ['more', 'less', 'times']);
  const ex = (s: string): Text => bi((f) => f.m(s));
  const right = kind === 'more' ? `n + ${k}` : kind === 'less' ? `n - ${k}` : `${k} \\times n`;
  const wrongs: [string, string, string][] = kind === 'more'
    ? [[`${k} \\times n`, 'That means n multiplied by the number, not added to it.', 'Cela signifie n multiplié par le nombre, pas additionné.'], [`n - ${k}`, 'That takes the number away. "More than" means adding.', 'Cela retire le nombre. « De plus que » signifie ajouter.']]
    : kind === 'less'
      ? [[`${k} - n`, 'That starts from the number and takes n away. "Less than n" starts from n.', 'Cela part du nombre et retire n. « De moins que n » part de n.'], [`n + ${k}`, 'That adds the number. "Less than" means taking away.', 'Cela ajoute le nombre. « De moins que » signifie retirer.']]
      : [[`n + ${k}`, 'That adds the number. "Times" means multiplying.', 'Cela ajoute le nombre. « Fois » signifie multiplier.'], [`n - ${k}`, 'That takes the number away. "Times" means multiplying.', 'Cela retire le nombre. « Fois » signifie multiplier.']];
  const m = mc(r, ex(right), wrongs.map(([e, en, fr]): [Text, Text] => [ex(e), t(en, fr)]));
  return {
    prompt: bi((f) => kind === 'more' ? f.t(`Which expression means "${f.N(k)} more than a number n"?`, `Quelle expression signifie « ${f.N(k)} de plus qu'un nombre n » ?`) : kind === 'less' ? f.t(`Which expression means "${f.N(k)} less than a number n"?`, `Quelle expression signifie « ${f.N(k)} de moins qu'un nombre n » ?`) : f.t(`Which expression means "${f.N(k)} times a number n"?`, `Quelle expression signifie « ${f.N(k)} fois un nombre n » ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Turn each key word into an operation: "more than" is add, "less than" is subtract, "times" is multiply.', 'Transforme chaque mot clé en opération : « de plus que » veut dire additionner, « de moins que » soustraire, « fois » multiplier.'), t('Then write the number and the letter in the right order.', 'Écris ensuite le nombre et la lettre dans le bon ordre.')],
    nudge: t('Which operation does the key word stand for?', 'Quelle opération le mot clé représente-t-il ?'),
  };
});
const story5 = choiceGen('MS.G5.C2.1.a', (_tier, r) => {
  const boxes = randInt(r, 2, 6), loose = randInt(r, 2, 9);
  const ex = (s: string): Text => bi((f) => f.m(s));
  const m = mc(r, ex(`${boxes} \\times n + ${loose}`), [
    [ex(`${boxes} + n + ${loose}`), t('That adds the number of boxes instead of multiplying: each box holds n pencils.', 'Cela additionne le nombre de boîtes au lieu de multiplier : chaque boîte contient n crayons.')],
    [ex(`${boxes} \\times (n + ${loose})`), t('That multiplies the loose pencils by the number of boxes too. The loose pencils are only counted once.', 'Cela multiplie aussi les crayons seuls par le nombre de boîtes. Les crayons seuls ne sont comptés qu\'une fois.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Each box holds n pencils. You have ${f.N(boxes)} full boxes and ${f.N(loose)} loose pencils. Which expression gives the total number of pencils?`, `Chaque boîte contient n crayons. Tu as ${f.N(boxes)} boîtes pleines et ${f.N(loose)} crayons seuls. Quelle expression donne le nombre total de crayons ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [bi((f) => f.t(`${f.N(boxes)} boxes of n pencils is ${f.N(boxes)} × n.`, `${f.N(boxes)} boîtes de n crayons font ${f.N(boxes)} × n.`)), bi((f) => f.t(`Add the ${f.N(loose)} loose pencils once.`, `Ajoute une seule fois les ${f.N(loose)} crayons seuls.`))],
    nudge: t('How many pencils are in the full boxes? Then what is added?', 'Combien de crayons y a-t-il dans les boîtes pleines ? Puis qu\'est-ce qui s\'ajoute ?'),
  };
});
const equivalent5 = choiceGen('MS.G5.C2.1.a', (_tier, r) => {
  const c = randInt(r, 1, 9);
  const reps = randInt(r, 2, 4);
  const sum = Array(reps).fill('n').join(' + ');
  const ex = (s: string): Text => bi((f) => f.m(s));
  const m = mc(r, ex(`${reps} \\times n + ${c}`), [
    [ex(`n + ${reps} + ${c}`), t('That has only one n. Adding n several times is the same as multiplying n by that many.', 'Cela n\'a qu\'un seul n. Additionner n plusieurs fois revient à multiplier n par ce nombre.')],
    [ex(`${reps} \\times (n + ${c})`), t('That multiplies the plain number too. Only the n terms are repeated.', 'Cela multiplie aussi le nombre seul. Seuls les termes en n sont répétés.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Which expression shows the same amount as ${f.m(`${sum} + ${c}`)}?`, `Quelle expression représente la même quantité que ${f.m(`${sum} + ${c}`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [bi((f) => f.t(`n added ${f.N(reps)} times is ${f.N(reps)} × n.`, `n additionné ${f.N(reps)} fois donne ${f.N(reps)} × n.`)), bi((f) => f.t(`The plain number ${f.N(c)} is added once, so the expression is ${f.m(`${reps} \\times n + ${c}`)}.`, `Le nombre seul ${f.N(c)} est ajouté une fois : l'expression est ${f.m(`${reps} \\times n + ${c}`)}.`))],
    nudge: t('Count how many times n is added, then keep the plain number as it is.', 'Compte combien de fois n est additionné, puis garde le nombre seul tel quel.'),
  };
});
export const expressions5 = tierGen(words5, story5, equivalent5);
