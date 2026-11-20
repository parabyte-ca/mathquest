// Grade 5 decimals: reading, comparing, and links to fractions and percents.
import { makeRng, pick, randInt, shuffle } from '../rng.js';
import { numberWords } from '../mathspeech.js';
import type { Generator, Text } from '../items/types.js';
import { build, frac, t, tex } from './kit.js';

const r3 = (x: number): number => Math.round(x * 1000) / 1000;
/** A decimal as math in each language: 0.5 in English, 0{,}5 in French. */
const dec = (x: number): Text => ({ en: tex(String(r3(x))), fr: tex(String(r3(x)).replace('.', '{,}')) });
const plain = (x: number): Text => ({ en: String(r3(x)), fr: String(r3(x)).replace('.', ',') });
const withDec = (fn: (d: (x: number) => string) => string, frFn?: (d: (x: number) => string) => string): Text => ({
  en: fn((x) => dec(x).en),
  fr: (frFn ?? fn)((x) => dec(x).fr),
});
const symbols = ['<', '>', '='];
const symbolIndex = (a: number, b: number): number => (a < b ? 0 : a > b ? 1 : 2);

/** MS.G5.B1.5.a: read and write decimals to hundredths */
export const readDecimals: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 1) {
    const tenths = randInt(r, 1, 9);
    const hundredths = randInt(r, 1, 9);
    const v = r3(tenths / 10 + hundredths / 100);
    return build({
      skill: 'MS.G5.B1.5.a', tier, seed, category: 'KU', format: 'number',
      prompt: t(`The big strips are tenths and the small squares are hundredths. What decimal do the blocks show?`, `Les grandes bandes sont des dixièmes et les petits carrés sont des centièmes. Quel nombre décimal les blocs montrent-ils ?`),
      visual: { type: 'blocks', tenths, hundredths },
      answer: { kind: 'number', value: v },
      steps: [
        t(`Count the strips: ${tenths} tenths is ${tenths / 10}.`, `Compte les bandes : ${tenths} dixièmes égalent ${tenths / 10}.`),
        t(`Count the small squares: ${hundredths} hundredths is ${hundredths / 100}.`, `Compte les petits carrés : ${hundredths} centièmes égalent ${hundredths / 100}.`),
        t(`Put them together: ${v}.`, `Réunis-les : ${String(v).replace('.', ',')}.`),
      ],
      nudge: t('How many strips are there, and how many small squares?', 'Combien y a-t-il de bandes et combien de petits carrés ?'),
      stepHint: t(`${tenths} strips are ${tenths} tenths. Write the tenths digit right after the decimal point.`, `${tenths} bandes valent ${tenths} dixièmes. Écris le chiffre des dixièmes juste après la virgule.`),
      wrong: [
        { answer: { kind: 'number', value: r3(tenths + hundredths / 10) }, stepIndex: 2, why: t('It looks like the digits were written as ones and tenths. Strips are tenths, so they go right after the decimal point, and the squares come next.', 'Il semble que les chiffres ont été écrits comme des unités et des dixièmes. Les bandes sont des dixièmes : elles vont juste après la virgule, puis viennent les carrés.') },
        { answer: { kind: 'number', value: r3(tenths / 10 + hundredths / 1000) }, stepIndex: 1, why: t('It looks like the small squares were counted as thousandths. They are hundredths, the second place after the decimal point.', 'Il semble que les petits carrés ont été comptés comme des millièmes. Ce sont des centièmes, la deuxième position après la virgule.') },
        { answer: { kind: 'number', value: r3((tenths + hundredths) / 10) }, stepIndex: 2, why: t('It looks like the strips and squares were added as if they were the same size. A strip is worth ten squares.', 'Il semble que les bandes et les carrés ont été additionnés comme s\'ils avaient la même taille. Une bande vaut dix carrés.') },
      ],
      praise: t('Nice, you counted the tenths and hundredths separately.', 'Bravo, tu as compté séparément les dixièmes et les centièmes.'),
    });
  }
  if (tier === 2) {
    const whole = randInt(r, 1, 9);
    const tenths = randInt(r, 1, 9);
    const hundredths = randInt(r, 1, 9);
    const v = r3(whole + tenths / 10 + hundredths / 100);
    return build({
      skill: 'MS.G5.B1.5.a', tier, seed, category: 'KU', format: 'number',
      prompt: withDec((d) => `What digit is in the hundredths place of ${d(v)}?`, (d) => `Quel chiffre est à la position des centièmes dans ${d(v)} ?`),
      answer: { kind: 'number', value: hundredths },
      steps: [
        t('After the decimal point, the first place is tenths and the second place is hundredths.', 'Après la virgule, la première position est celle des dixièmes et la deuxième, celle des centièmes.'),
        t(`In ${v}, the digit in the second place is ${hundredths}.`, `Dans ${String(v).replace('.', ',')}, le chiffre de la deuxième position est ${hundredths}.`),
      ],
      nudge: t('Which place is hundredths: the first or the second digit after the decimal point?', 'Quelle position est celle des centièmes : le premier ou le deuxième chiffre après la virgule ?'),
      stepHint: t('Tenths come first after the point, then hundredths.', 'Les dixièmes viennent en premier après la virgule, puis les centièmes.'),
      wrong: [
        { answer: { kind: 'number', value: tenths }, stepIndex: 0, why: t('That is the tenths digit. Hundredths is the second place after the decimal point.', 'C\'est le chiffre des dixièmes. Les centièmes sont à la deuxième position après la virgule.') },
        { answer: { kind: 'number', value: whole }, stepIndex: 0, why: t('That is the ones digit. Look to the right of the decimal point.', 'C\'est le chiffre des unités. Regarde à droite de la virgule.') },
      ],
      praise: t('Nice, you know your place values.', 'Bravo, tu connais bien les valeurs de position.'),
    });
  }
  const whole = randInt(r, 1, 9);
  const h = randInt(r, 1, 9) * 10 + randInt(r, 1, 9);
  const v = r3(whole + h / 100);
  return build({
    skill: 'MS.G5.B1.5.a', tier, seed, category: 'AP', format: 'number',
    prompt: t(`Write ${numberWords(whole, 'en')} and ${numberWords(h, 'en')} hundredths as a decimal.`, `Écris ${numberWords(whole, 'fr')} et ${numberWords(h, 'fr')} centièmes sous forme de nombre décimal.`),
    answer: { kind: 'number', value: v },
    steps: [
      t(`${numberWords(whole, 'en')} is the whole number part: ${whole}.`, `${numberWords(whole, 'fr')} est la partie entière : ${whole}.`),
      t(`${h} hundredths is ${h / 100}, so it takes two places after the point.`, `${h} centièmes égalent ${String(h / 100).replace('.', ',')}, donc il faut deux positions après la virgule.`),
      t(`Write it together: ${v}.`, `Écris le tout : ${String(v).replace('.', ',')}.`),
    ],
    nudge: t('Hundredths take two places after the decimal point.', 'Les centièmes occupent deux positions après la virgule.'),
    stepHint: t(`Write ${whole} before the point and ${h} after it.`, `Écris ${whole} avant la virgule et ${h} après.`),
    wrong: [
      { answer: { kind: 'number', value: r3(whole + h / 1000) }, stepIndex: 1, why: t('It looks like the hundredths were written as thousandths. Two digits after the point show hundredths.', 'Il semble que les centièmes ont été écrits comme des millièmes. Deux chiffres après la virgule montrent des centièmes.') },
      { answer: { kind: 'number', value: r3(whole + h / 10) }, stepIndex: 1, why: t('It looks like the hundredths were written as tenths. Hundredths take the second place after the point.', 'Il semble que les centièmes ont été écrits comme des dixièmes. Les centièmes occupent la deuxième position après la virgule.') },
    ],
    praise: t('Nice, you wrote the hundredths in the right places.', 'Bravo, tu as écrit les centièmes aux bonnes positions.'),
  });
};

/** MS.G5.B1.5.b: compare and order decimals */
export const compareDecimals: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 1) {
    const tenth = randInt(r, 1, 9);
    let hundredths = randInt(r, 10, 99);
    if (hundredths === tenth * 10) hundredths += 1;
    const a = tenth / 10;
    const b = hundredths / 100;
    const [x, y] = r() < 0.5 ? [a, b] : [b, a];
    return build({
      skill: 'MS.G5.B1.5.b', tier, seed, category: 'KU', format: 'choice',
      prompt: withDec((d) => `Which symbol makes this true? ${tex(`${d(x).slice(1, -1)} \\ ? \\ ${d(y).slice(1, -1)}`)}`, (d) => `Quel symbole rend l'énoncé vrai ? ${tex(`${d(x).slice(1, -1)} \\ ? \\ ${d(y).slice(1, -1)}`)}`),
      options: symbols.map((s) => t(tex(s), tex(s))),
      answer: { kind: 'choice', index: symbolIndex(x, y) },
      steps: [
        t(`Write both with two decimal places: ${plain(x).en.padEnd(4, '0')} and ${plain(y).en.padEnd(4, '0')}.`, `Écris les deux avec deux décimales : ${plain(x).fr.padEnd(4, '0')} et ${plain(y).fr.padEnd(4, '0')}.`),
        t(`Compare as hundredths: ${Math.round(x * 100)} and ${Math.round(y * 100)}.`, `Compare en centièmes : ${Math.round(x * 100)} et ${Math.round(y * 100)}.`),
      ],
      nudge: t('Try writing both numbers with the same number of decimal places.', 'Essaie d\'écrire les deux nombres avec le même nombre de décimales.'),
      stepHint: t('Add a zero at the end of the shorter decimal so both have hundredths.', 'Ajoute un zéro à la fin du plus court pour que les deux aient des centièmes.'),
      wrong: [{ answer: { kind: 'choice', index: symbolIndex(Number(String(x).split('.')[1]), Number(String(y).split('.')[1])) }, stepIndex: 0, why: t('It looks like the decimals were compared like whole numbers, so the longer one looked bigger. Give them the same number of decimal places first.', 'Il semble que les nombres décimaux ont été comparés comme des nombres entiers, donc le plus long semblait le plus grand. Donne-leur d\'abord le même nombre de décimales.') }],
      praise: t('Nice, you lined up the decimal places.', 'Bravo, tu as aligné les décimales.'),
    });
  }
  if (tier === 2) {
    const vals: number[] = [];
    while (vals.length < 3) {
      const v = r() < 0.5 ? randInt(r, 1, 9) / 10 : randInt(r, 10, 99) / 100;
      if (!vals.includes(v) && v !== 0) vals.push(v);
    }
    const biggest = Math.max(...vals);
    const longest = vals.reduce((a, b) => (String(b).length > String(a).length ? b : a));
    return build({
      skill: 'MS.G5.B1.5.b', tier, seed, category: 'TH', format: 'choice',
      prompt: t('Which decimal is the greatest?', 'Quel nombre décimal est le plus grand ?'),
      options: vals.map((v) => dec(v)),
      answer: { kind: 'choice', index: vals.indexOf(biggest) },
      steps: [
        t(`Write each with two decimal places: ${vals.map((v) => plain(v).en.padEnd(4, '0')).join(', ')}.`, `Écris chacun avec deux décimales : ${vals.map((v) => plain(v).fr.padEnd(4, '0')).join(' ; ')}.`),
        t(`The greatest is ${biggest}.`, `Le plus grand est ${String(biggest).replace('.', ',')}.`),
      ],
      nudge: t('A longer decimal is not always greater. Compare the tenths first.', 'Un nombre décimal plus long n\'est pas toujours plus grand. Compare d\'abord les dixièmes.'),
      stepHint: t('Write each number with hundredths so they are easy to compare.', 'Écris chaque nombre en centièmes pour les comparer facilement.'),
      wrong: [{ answer: { kind: 'choice', index: vals.indexOf(longest) }, stepIndex: 0, why: t('It looks like the decimal with the most digits was chosen. More digits do not always mean a greater number. Compare place by place.', 'Il semble que le nombre avec le plus de chiffres a été choisi. Plus de chiffres ne veut pas toujours dire plus grand. Compare position par position.') }],
      praise: t('Nice, you compared place by place.', 'Bravo, tu as comparé position par position.'),
    });
  }
  const vals: number[] = [];
  while (vals.length < 4) {
    const v = r() < 0.4 ? randInt(r, 1, 9) / 10 : randInt(r, 10, 99) / 100;
    if (!vals.includes(v) && v % 1 !== 0) vals.push(v);
  }
  const options = vals.map((v) => dec(v));
  const byValue = [...vals.keys()].sort((i, j) => vals[i]! - vals[j]!);
  const asWhole = [...vals.keys()].sort((i, j) => Number(String(vals[i]).split('.')[1]) - Number(String(vals[j]).split('.')[1]));
  return build({
    skill: 'MS.G5.B1.5.b', tier, seed, category: 'TH', format: 'order',
    prompt: t('Put these decimals in order from least to greatest.', 'Place ces nombres décimaux en ordre, du plus petit au plus grand.'),
    options,
    answer: { kind: 'order', order: byValue },
    steps: [
      t(`Write each with two decimal places: ${vals.map((v) => plain(v).en.padEnd(4, '0')).join(', ')}.`, `Écris chacun avec deux décimales : ${vals.map((v) => plain(v).fr.padEnd(4, '0')).join(' ; ')}.`),
      t(`In order: ${byValue.map((i) => vals[i]).join(' < ')}.`, `En ordre : ${byValue.map((i) => String(vals[i]).replace('.', ',')).join(' < ')}.`),
    ],
    nudge: t('Give every number the same number of decimal places, then order them.', 'Donne à chaque nombre le même nombre de décimales, puis place-les en ordre.'),
    stepHint: t('Add zeros so each decimal shows hundredths.', 'Ajoute des zéros pour que chaque nombre décimal soit en centièmes.'),
    wrong: [{ answer: { kind: 'order', order: asWhole }, stepIndex: 0, why: t('It looks like the digits after the point were ordered like whole numbers. Compare the tenths first, then the hundredths.', 'Il semble que les chiffres après la virgule ont été ordonnés comme des nombres entiers. Compare d\'abord les dixièmes, puis les centièmes.') }],
    praise: t('Nice, you ordered them place by place.', 'Bravo, tu les as ordonnés position par position.'),
  });
};

/** MS.G5.B1.7.a: fractions with denominators 10 and 100 as decimals (and common fraction-decimal pairs) */
export const fractionToDecimal: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    const pool: [number, number, number][] = [[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [7, 10, 0.7], [9, 100, 0.09], [3, 5, 0.6]];
    const picked = shuffle(r, pool).slice(0, 4);
    const rightOrder = shuffle(r, picked.map((_, i) => i));
    return build({
      skill: 'MS.G5.B1.7.a', tier, seed, category: 'KU', format: 'match',
      prompt: t('Match each fraction to its decimal.', 'Associe chaque fraction à son nombre décimal.'),
      options: picked.map(([n, d]) => t(tex(frac(n, d)), tex(frac(n, d)))),
      right: rightOrder.map((i) => dec(picked[i]![2])),
      answer: { kind: 'match', pairs: picked.map((_, i) => [i, rightOrder.indexOf(i)] as [number, number]) },
      steps: picked.map(([n, d, v]) => t(`${tex(frac(n, d))} = ${v}`, `${tex(frac(n, d))} = ${String(v).replace('.', ',')}`)),
      nudge: t('Start with the fractions that have a denominator of 10 or 100. Others: make an equal fraction with 10 or 100 on the bottom.', 'Commence par les fractions dont le dénominateur est 10 ou 100. Pour les autres, trouve une fraction égale avec 10 ou 100 en bas.'),
      stepHint: t(`For example, ${tex(`${frac(1, 2)} = ${frac(5, 10)} = 0.5`)}.`, `Par exemple, ${tex(`${frac(1, 2)} = ${frac(5, 10)} = 0{,}5`)}.`),
      praise: t('Nice, you know your fraction and decimal pairs.', 'Bravo, tu connais bien tes paires fraction et nombre décimal.'),
    });
  }
  const hundred = tier === 2;
  const n = hundred ? randInt(r, 1, 99) : randInt(r, 1, 9);
  const d = hundred ? 100 : 10;
  const v = r3(n / d);
  return build({
    skill: 'MS.G5.B1.7.a', tier, seed, category: 'KU', format: 'number',
    prompt: withDec(() => `Write ${tex(frac(n, d))} as a decimal.`, () => `Écris ${tex(frac(n, d))} sous forme de nombre décimal.`),
    answer: { kind: 'number', value: v },
    steps: [
      t(`The denominator is ${d}, so this is ${n} ${hundred ? 'hundredths' : 'tenths'}.`, `Le dénominateur est ${d}, donc c'est ${n} ${hundred ? 'centièmes' : 'dixièmes'}.`),
      t(`${hundred ? 'Hundredths take two places after the point' : 'Tenths take one place after the point'}: ${v}.`, `${hundred ? 'Les centièmes occupent deux positions après la virgule' : 'Les dixièmes occupent une position après la virgule'} : ${String(v).replace('.', ',')}.`),
    ],
    nudge: t(`The denominator ${d} tells you the place: ${hundred ? 'hundredths, two places after the point' : 'tenths, one place after the point'}.`, `Le dénominateur ${d} indique la position : ${hundred ? 'centièmes, deux positions après la virgule' : 'dixièmes, une position après la virgule'}.`),
    stepHint: t(`${n} ${hundred ? 'hundredths' : 'tenths'} ends in the ${hundred ? 'second' : 'first'} place after the decimal point.`, `${n} ${hundred ? 'centièmes' : 'dixièmes'} se termine à la ${hundred ? 'deuxième' : 'première'} position après la virgule.`),
    wrong: hundred
      ? [
          { answer: { kind: 'number', value: r3(n / 10) }, stepIndex: 1, why: t('It looks like the answer was written in tenths. A denominator of 100 means hundredths, two places after the point.', 'Il semble que la réponse a été écrite en dixièmes. Un dénominateur de 100 signifie des centièmes, deux positions après la virgule.') },
          { answer: { kind: 'number', value: r3(n / 1000) }, stepIndex: 1, why: t('It looks like an extra zero was added. 100 has two zeros, so there are two places after the point.', 'Il semble qu\'un zéro de trop a été ajouté. 100 a deux zéros, donc il y a deux positions après la virgule.') },
        ]
      : [
          { answer: { kind: 'number', value: r3(n / 100) }, stepIndex: 1, why: t('It looks like the digit went into the hundredths place. Tenths are the first place after the point.', 'Il semble que le chiffre est allé à la position des centièmes. Les dixièmes sont la première position après la virgule.') },
          { answer: { kind: 'number', value: n }, stepIndex: 1, why: t('It looks like the denominator was ignored. A fraction with denominator 10 is less than 1 here, so the answer is a decimal.', 'Il semble que le dénominateur a été ignoré. Ici la fraction est inférieure à 1, donc la réponse est un nombre décimal.') },
        ],
    praise: t('Nice, you used the denominator to find the place.', 'Bravo, tu as utilisé le dénominateur pour trouver la position.'),
  });
};

/** MS.G5.B1.7.b: decimals as percents */
export const decimalToPercent: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const v = tier === 1 ? randInt(r, 1, 9) / 10 : tier === 2 ? randInt(r, 11, 99) / 100 : pick(r, [0.05, 0.07, 0.09, 0.01, 0.5, 0.4, 0.25, 0.8, 1, 0.03]);
  const pct = Math.round(v * 100);
  const story = tier === 3 && r() < 0.5;
  return build({
    skill: 'MS.G5.B1.7.b', tier, seed, category: story ? 'AP' : 'KU', format: 'number',
    prompt: story
      ? withDec((d) => `A phone battery is at ${d(v)} of its full charge. What percent of the charge is left?`, (d) => `La batterie d'un téléphone est à ${d(v)} de sa pleine charge. Quel pourcentage de la charge reste-t-il ?`)
      : withDec((d) => `Write ${d(v)} as a percent. (Type the number only.)`, (d) => `Écris ${d(v)} sous forme de pourcentage. (Écris seulement le nombre.)`),
    answer: { kind: 'number', value: pct },
    steps: [
      t('Percent means "out of 100", so think in hundredths.', 'Pourcentage veut dire « sur 100 », alors pense en centièmes.'),
      t(`${v} is ${pct} hundredths, so it is ${pct}%.`, `${String(v).replace('.', ',')} égale ${pct} centièmes, donc ${pct} %.`),
    ],
    nudge: t('Percent means out of 100. How many hundredths is this decimal?', 'Pourcentage veut dire sur 100. Combien de centièmes ce nombre décimal vaut-il ?'),
    stepHint: t(`Write ${v} with hundredths: ${pct}/100.`, `Écris ${String(v).replace('.', ',')} en centièmes : ${pct}/100.`),
    wrong: [
      { answer: { kind: 'number', value: r3(v * 10) }, stepIndex: 1, why: t('It looks like the decimal point was moved one place. To change to a percent, move it two places (multiply by 100).', 'Il semble que la virgule a été déplacée d\'une position. Pour obtenir un pourcentage, déplace-la de deux positions (multiplie par 100).') },
      { answer: { kind: 'number', value: v }, stepIndex: 1, why: t('It looks like the decimal was copied without changing it. A percent is out of 100, so multiply by 100.', 'Il semble que le nombre décimal a été copié tel quel. Un pourcentage est sur 100 : multiplie par 100.') },
    ],
    praise: t('Nice, you thought in hundredths.', 'Bravo, tu as pensé en centièmes.'),
  });
};
