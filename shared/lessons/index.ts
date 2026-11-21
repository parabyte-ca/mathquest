// Short lessons for the seed micro-skills (Grade 5-6 fractions and decimals). Phase 3 extends this grade by grade.
import type { Text } from '../items/types.js';
import type { Lesson } from './types.js';
import { frac, mixedTex, t, tex } from '../generators/kit.js';
import { NUMBER_LESSONS } from './number.js';
import { NUMBER7_LESSONS } from './number7.js';
import { NUMBER8_LESSONS } from './number8.js';
import { STRAND8_LESSONS } from './strands8.js';
import { STRAND_LESSONS } from './strands56.js';
import { STRAND7_LESSONS } from './strands7.js';

const f = (n: number, d: number): string => tex(frac(n, d));
const T = (en: string, fr: string): Text => t(en, fr);

export const LESSONS: Lesson[] = [
  ...NUMBER_LESSONS,
  ...STRAND_LESSONS,
  ...NUMBER7_LESSONS,
  ...NUMBER8_LESSONS,
  ...STRAND8_LESSONS,
  ...STRAND7_LESSONS,
  {
    id: 'L.fractions.naming',
    skills: ['MS.G5.B1.3.a', 'MS.G5.B1.3.b', 'MS.G5.B1.3.c'],
    title: T('Fractions: naming, equal fractions and mixed numbers', 'Les fractions : les nommer, les fractions égales et les nombres fractionnaires'),
    intro: T('A fraction names part of a whole that is split into equal parts.', 'Une fraction nomme une partie d\'un tout séparé en parties égales.'),
    definitions: [
      { term: T('Denominator', 'Dénominateur'), text: T('The bottom number. It tells how many equal parts the whole is split into.', 'Le nombre du bas. Il indique en combien de parties égales le tout est séparé.'), visual: { type: 'fractionBar', n: 0, d: 4 } },
      { term: T('Numerator', 'Numérateur'), text: T('The top number. It tells how many of those parts we are talking about.', 'Le nombre du haut. Il indique de combien de ces parties on parle.'), visual: { type: 'fractionBar', n: 3, d: 4 } },
      { term: T('Equal fractions', 'Fractions égales'), text: T('Different fractions that name the same amount, like one half and two fourths.', 'Des fractions différentes qui nomment la même quantité, comme un demi et deux quarts.'), visual: { type: 'fractionBars', bars: [{ n: 1, d: 2 }, { n: 2, d: 4 }] } },
      { term: T('Mixed number', 'Nombre fractionnaire'), text: T('A whole number and a fraction together, like 1 and 1 half. An improper fraction has a numerator bigger than its denominator.', 'Un nombre entier et une fraction ensemble, comme 1 et demi. Une fraction impropre a un numérateur plus grand que son dénominateur.') },
    ],
    examples: [
      { title: T('Example 1: name the shaded part', 'Exemple 1 : nommer la partie ombrée'), steps: [
        { text: T('The bar is split into 5 equal parts, so the denominator is 5.', 'La barre est séparée en 5 parties égales, donc le dénominateur est 5.'), visual: { type: 'fractionBar', n: 0, d: 5 } },
        { text: T(`2 parts are shaded, so the numerator is 2. The fraction is ${f(2, 5)}.`, `2 parties sont ombrées, donc le numérateur est 2. La fraction est ${f(2, 5)}.`), visual: { type: 'fractionBar', n: 2, d: 5, label: true } },
      ] },
      { title: T('Example 2: make an equal fraction', 'Exemple 2 : fabriquer une fraction égale'), steps: [
        { text: T(`Multiply the top and the bottom by the same number. Here, multiply ${f(2, 3)} by 2 on top and bottom.`, `Multiplie le haut et le bas par le même nombre. Ici, multiplie ${f(2, 3)} par 2 en haut et en bas.`), visual: { type: 'fractionBars', bars: [{ n: 2, d: 3 }] } },
        { text: T(`${tex(`${frac(2, 3)} = ${frac(4, 6)}`)}. The bars show the same amount.`, `${tex(`${frac(2, 3)} = ${frac(4, 6)}`)}. Les barres montrent la même quantité.`), visual: { type: 'fractionBars', bars: [{ n: 2, d: 3 }, { n: 4, d: 6 }] } },
      ] },
      { title: T('Example 3: an improper fraction as a mixed number', 'Exemple 3 : une fraction impropre en nombre fractionnaire'), steps: [
        { text: T(`${f(7, 3)} means 7 thirds. Three thirds make one whole.`, `${f(7, 3)} signifie 7 tiers. Trois tiers font un entier.`) },
        { text: T(`7 ÷ 3 = 2 with 1 left over, so ${tex(`${frac(7, 3)} = ${mixedTex(2, 1, 3)}`)}.`, `7 ÷ 3 = 2, reste 1, donc ${tex(`${frac(7, 3)} = ${mixedTex(2, 1, 3)}`)}.`) },
      ] },
    ],
    tryIt: { skill: 'MS.G5.B1.3.b', tier: 1, seed: 7 },
  },
  {
    id: 'L.fractions.compare',
    skills: ['MS.G5.B1.4.a', 'MS.G5.B1.4.b'],
    title: T('Comparing fractions', 'Comparer des fractions'),
    intro: T('To compare fractions, make the parts the same size first.', 'Pour comparer des fractions, rends d\'abord les parties de même taille.'),
    definitions: [
      { term: T('Same denominator', 'Même dénominateur'), text: T('The parts are the same size, so the bigger numerator is the bigger fraction.', 'Les parties ont la même taille, donc le plus grand numérateur donne la plus grande fraction.'), visual: { type: 'fractionBars', bars: [{ n: 2, d: 5 }, { n: 4, d: 5 }] } },
      { term: T('Common denominator', 'Dénominateur commun'), text: T('A number that both denominators go into. Rewrite both fractions with it, then compare.', 'Un nombre dans lequel les deux dénominateurs entrent. Réécris les deux fractions avec lui, puis compare.') },
    ],
    examples: [
      { title: T('Example 1: same denominator', 'Exemple 1 : même dénominateur'), steps: [
        { text: T(`${tex(`${frac(3, 8)} \\ ? \\ ${frac(5, 8)}`)}: both are eighths.`, `${tex(`${frac(3, 8)} \\ ? \\ ${frac(5, 8)}`)} : les deux sont des huitièmes.`), visual: { type: 'fractionBars', bars: [{ n: 3, d: 8 }, { n: 5, d: 8 }] } },
        { text: T(`3 is less than 5, so ${tex(`${frac(3, 8)} < ${frac(5, 8)}`)}.`, `3 est plus petit que 5, donc ${tex(`${frac(3, 8)} < ${frac(5, 8)}`)}.`) },
      ] },
      { title: T('Example 2: one denominator is a multiple of the other', 'Exemple 2 : un dénominateur est un multiple de l\'autre'), steps: [
        { text: T(`${tex(`${frac(1, 2)} \\ ? \\ ${frac(3, 4)}`)}: 2 goes into 4, so use fourths.`, `${tex(`${frac(1, 2)} \\ ? \\ ${frac(3, 4)}`)} : 2 entre dans 4, donc utilise des quarts.`) },
        { text: T(`${tex(`${frac(1, 2)} = ${frac(2, 4)}`)}, and 2 is less than 3, so ${tex(`${frac(1, 2)} < ${frac(3, 4)}`)}.`, `${tex(`${frac(1, 2)} = ${frac(2, 4)}`)}, et 2 est plus petit que 3, donc ${tex(`${frac(1, 2)} < ${frac(3, 4)}`)}.`), visual: { type: 'fractionBars', bars: [{ n: 2, d: 4 }, { n: 3, d: 4 }] } },
      ] },
      { title: T('Example 3: different denominators', 'Exemple 3 : dénominateurs différents'), steps: [
        { text: T(`${tex(`${frac(2, 3)} \\ ? \\ ${frac(3, 4)}`)}: both 3 and 4 go into 12.`, `${tex(`${frac(2, 3)} \\ ? \\ ${frac(3, 4)}`)} : 3 et 4 entrent tous les deux dans 12.`) },
        { text: T(`${tex(`${frac(2, 3)} = ${frac(8, 12)}`)} and ${tex(`${frac(3, 4)} = ${frac(9, 12)}`)}. 8 is less than 9, so ${tex(`${frac(2, 3)} < ${frac(3, 4)}`)}.`, `${tex(`${frac(2, 3)} = ${frac(8, 12)}`)} et ${tex(`${frac(3, 4)} = ${frac(9, 12)}`)}. 8 est plus petit que 9, donc ${tex(`${frac(2, 3)} < ${frac(3, 4)}`)}.`) },
      ] },
    ],
    tryIt: { skill: 'MS.G5.B1.4.a', tier: 1, seed: 11 },
  },
  {
    id: 'L.fractions.add-like',
    skills: ['MS.G5.B2.5.a', 'MS.G5.B2.5.b', 'MS.G5.B2.5.c'],
    title: T('Adding and subtracting fractions with the same denominator', 'Additionner et soustraire des fractions de même dénominateur'),
    intro: T('When the parts are the same size, you add or subtract the number of parts.', 'Quand les parties ont la même taille, on additionne ou on soustrait le nombre de parties.'),
    definitions: [
      { term: T('Keep the denominator', 'Garde le dénominateur'), text: T('The size of the parts does not change, so the denominator stays the same.', 'La taille des parties ne change pas, donc le dénominateur reste le même.') },
      { term: T('Add the numerators', 'Additionne les numérateurs'), text: T('Count how many parts there are altogether.', 'Compte combien il y a de parties en tout.'), visual: { type: 'fractionBars', bars: [{ n: 1, d: 5 }, { n: 2, d: 5 }, { n: 3, d: 5 }] } },
    ],
    examples: [
      { title: T('Example 1: add', 'Exemple 1 : additionner'), steps: [
        { text: T(`${tex(`${frac(2, 7)} + ${frac(3, 7)}`)}: both are sevenths.`, `${tex(`${frac(2, 7)} + ${frac(3, 7)}`)} : les deux sont des septièmes.`), visual: { type: 'fractionBars', bars: [{ n: 2, d: 7 }, { n: 3, d: 7 }] } },
        { text: T(`2 + 3 = 5, so the sum is ${f(5, 7)}.`, `2 + 3 = 5, donc la somme est ${f(5, 7)}.`) },
      ] },
      { title: T('Example 2: subtract', 'Exemple 2 : soustraire'), steps: [
        { text: T(`${tex(`${frac(5, 6)} - ${frac(2, 6)}`)}: keep the denominator 6.`, `${tex(`${frac(5, 6)} - ${frac(2, 6)}`)} : garde le dénominateur 6.`) },
        { text: T(`5 - 2 = 3, so the difference is ${f(3, 6)}.`, `5 - 2 = 3, donc la différence est ${f(3, 6)}.`), visual: { type: 'fractionBar', n: 3, d: 6 } },
      ] },
      { title: T('Example 3: mixed numbers', 'Exemple 3 : nombres fractionnaires'), steps: [
        { text: T(`${tex(`${mixedTex(1, 3, 4)} + ${mixedTex(2, 3, 4)}`)}: add the wholes, 1 + 2 = 3, and the fractions, ${f(3, 4)} + ${f(3, 4)} = ${f(6, 4)}.`, `${tex(`${mixedTex(1, 3, 4)} + ${mixedTex(2, 3, 4)}`)} : additionne les entiers, 1 + 2 = 3, et les fractions, ${f(3, 4)} + ${f(3, 4)} = ${f(6, 4)}.`) },
        { text: T(`${f(6, 4)} is ${tex(mixedTex(1, 2, 4))}, so add 1 to the wholes: ${tex(mixedTex(4, 2, 4))}.`, `${f(6, 4)} égale ${tex(mixedTex(1, 2, 4))}, donc ajoute 1 aux entiers : ${tex(mixedTex(4, 2, 4))}.`) },
      ] },
    ],
    tryIt: { skill: 'MS.G5.B2.5.a', tier: 1, seed: 5 },
  },
  {
    id: 'L.fractions.add-unlike',
    skills: ['MS.G6.B2.5.a', 'MS.G6.B2.5.b', 'MS.G6.B2.5.c'],
    title: T('Adding and subtracting fractions with different denominators', 'Additionner et soustraire des fractions de dénominateurs différents'),
    intro: T('First make the denominators the same, then add or subtract.', 'Rends d\'abord les dénominateurs pareils, puis additionne ou soustrais.'),
    definitions: [
      { term: T('Common denominator', 'Dénominateur commun'), text: T('A number that both denominators go into. The least one is the smallest.', 'Un nombre dans lequel les deux dénominateurs entrent. Le plus petit est le plus petit dénominateur commun.') },
      { term: T('Multiples', 'Multiples'), text: T('List the multiples of each denominator and find the first one they share.', 'Écris les multiples de chaque dénominateur et trouve le premier qu\'ils ont en commun.') },
    ],
    examples: [
      { title: T('Example 1: find the least common denominator', 'Exemple 1 : trouver le plus petit dénominateur commun'), steps: [
        { text: T('Multiples of 4: 4, 8, 12. Multiples of 6: 6, 12.', 'Multiples de 4 : 4, 8, 12. Multiples de 6 : 6, 12.') },
        { text: T('The first one they share is 12, so the least common denominator is 12.', 'Le premier qu\'ils ont en commun est 12, donc le plus petit dénominateur commun est 12.') },
      ] },
      { title: T('Example 2: add', 'Exemple 2 : additionner'), steps: [
        { text: T(`${tex(`${frac(1, 2)} + ${frac(1, 3)}`)}: the common denominator is 6.`, `${tex(`${frac(1, 2)} + ${frac(1, 3)}`)} : le dénominateur commun est 6.`) },
        { text: T(`${tex(`${frac(1, 2)} = ${frac(3, 6)}`)} and ${tex(`${frac(1, 3)} = ${frac(2, 6)}`)}, so ${tex(`${frac(3, 6)} + ${frac(2, 6)} = ${frac(5, 6)}`)}.`, `${tex(`${frac(1, 2)} = ${frac(3, 6)}`)} et ${tex(`${frac(1, 3)} = ${frac(2, 6)}`)}, donc ${tex(`${frac(3, 6)} + ${frac(2, 6)} = ${frac(5, 6)}`)}.`) },
      ] },
      { title: T('Example 3: subtract and simplify', 'Exemple 3 : soustraire et simplifier'), steps: [
        { text: T(`${tex(`${frac(3, 4)} - ${frac(1, 6)}`)}: the common denominator is 12.`, `${tex(`${frac(3, 4)} - ${frac(1, 6)}`)} : le dénominateur commun est 12.`) },
        { text: T(`${tex(`${frac(9, 12)} - ${frac(2, 12)} = ${frac(7, 12)}`)}. It cannot be simplified.`, `${tex(`${frac(9, 12)} - ${frac(2, 12)} = ${frac(7, 12)}`)}. Elle ne peut pas être simplifiée.`) },
      ] },
    ],
    tryIt: { skill: 'MS.G6.B2.5.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.decimals.place-value',
    skills: ['MS.G5.B1.5.a', 'MS.G5.B1.5.b'],
    title: T('Decimals: tenths and hundredths', 'Les nombres décimaux : dixièmes et centièmes'),
    intro: T('The places after the decimal point are tenths, then hundredths.', 'Les positions après la virgule sont les dixièmes, puis les centièmes.'),
    definitions: [
      { term: T('Tenths', 'Dixièmes'), text: T('The first place after the decimal point. One whole is ten tenths.', 'La première position après la virgule. Un entier vaut dix dixièmes.'), visual: { type: 'blocks', tenths: 3, hundredths: 0 } },
      { term: T('Hundredths', 'Centièmes'), text: T('The second place after the point. One tenth is ten hundredths.', 'La deuxième position après la virgule. Un dixième vaut dix centièmes.'), visual: { type: 'blocks', tenths: 3, hundredths: 4 } },
    ],
    examples: [
      { title: T('Example 1: read the blocks', 'Exemple 1 : lire les blocs'), steps: [
        { text: T('2 strips are 2 tenths and 5 small squares are 5 hundredths.', '2 bandes valent 2 dixièmes et 5 petits carrés valent 5 centièmes.'), visual: { type: 'blocks', tenths: 2, hundredths: 5 } },
        { text: T('Together that is 0.25.', 'Ensemble, cela fait 0,25.') },
      ] },
      { title: T('Example 2: compare', 'Exemple 2 : comparer'), steps: [
        { text: T('Which is greater, 0.4 or 0.37? Write 0.4 as 0.40.', 'Lequel est plus grand, 0,4 ou 0,37 ? Écris 0,4 sous la forme 0,40.') },
        { text: T('40 hundredths is greater than 37 hundredths, so 0.4 is greater.', '40 centièmes est plus grand que 37 centièmes, donc 0,4 est plus grand.') },
      ] },
      { title: T('Example 3: put in order', 'Exemple 3 : placer en ordre'), steps: [
        { text: T('Order 0.5, 0.45 and 0.6. Write each with hundredths: 0.50, 0.45, 0.60.', 'Place 0,5, 0,45 et 0,6 en ordre. Écris chacun en centièmes : 0,50, 0,45, 0,60.') },
        { text: T('From least to greatest: 0.45, 0.5, 0.6.', 'Du plus petit au plus grand : 0,45, 0,5, 0,6.') },
      ] },
    ],
    tryIt: { skill: 'MS.G5.B1.5.a', tier: 1, seed: 9 },
  },
  {
    id: 'L.decimals.links',
    skills: ['MS.G5.B1.7.a', 'MS.G5.B1.7.b'],
    title: T('Fractions, decimals and percents', 'Fractions, nombres décimaux et pourcentages'),
    intro: T('Fractions, decimals and percents can name the same amount.', 'Les fractions, les nombres décimaux et les pourcentages peuvent nommer la même quantité.'),
    definitions: [
      { term: T('Percent', 'Pourcentage'), text: T('Percent means "out of 100". 37% is 37 out of 100.', 'Pourcentage veut dire « sur 100 ». 37 % égale 37 sur 100.') },
    ],
    examples: [
      { title: T('Example 1: tenths', 'Exemple 1 : dixièmes'), steps: [
        { text: T(`${f(3, 10)} is 3 tenths, so it is 0.3.`, `${f(3, 10)} égale 3 dixièmes, donc 0,3.`), visual: { type: 'fractionBar', n: 3, d: 10 } },
      ] },
      { title: T('Example 2: hundredths', 'Exemple 2 : centièmes'), steps: [
        { text: T(`${f(47, 100)} is 47 hundredths, so it is 0.47.`, `${f(47, 100)} égale 47 centièmes, donc 0,47.`) },
      ] },
      { title: T('Example 3: decimal to percent', 'Exemple 3 : du nombre décimal au pourcentage'), steps: [
        { text: T('0.37 is 37 hundredths, which is 37 out of 100.', '0,37 égale 37 centièmes, soit 37 sur 100.') },
        { text: T('So 0.37 = 37%.', 'Donc 0,37 = 37 %.') },
      ] },
    ],
    tryIt: { skill: 'MS.G5.B1.7.a', tier: 1, seed: 4 },
  },
  {
    id: 'L.coordinates.plot',
    skills: ['MS.G5.E1.4.a'],
    title: T('Plotting points', 'Placer des points'),
    intro: T('An ordered pair tells you where a point is: across first, then up.', 'Une paire ordonnée indique où se trouve un point : d\'abord vers la droite, puis vers le haut.'),
    definitions: [
      { term: T('Origin', 'Origine'), text: T('The point (0, 0), where the two number lines meet.', 'Le point (0, 0), où les deux droites numériques se rencontrent.'), visual: { type: 'plane', size: 6, points: [{ x: 0, y: 0, label: '(0, 0)' }] } },
      { term: T('Ordered pair', 'Paire ordonnée'), text: T('Two numbers in order: the first is how far across, the second is how far up.', 'Deux nombres dans l\'ordre : le premier indique de combien aller vers la droite, le deuxième de combien monter.') },
    ],
    examples: [
      { title: T('Example 1: read a point', 'Exemple 1 : lire un point'), steps: [
        { text: T('Start at the origin. Go across 3, then up 2.', 'Pars de l\'origine. Avance de 3, puis monte de 2.'), visual: { type: 'plane', size: 6, points: [{ x: 3, y: 2, label: '(3, 2)' }] } },
      ] },
      { title: T('Example 2: plot a point', 'Exemple 2 : placer un point'), steps: [
        { text: T('To plot (4, 1): go across 4, then up 1, and mark the point.', 'Pour placer (4, 1) : avance de 4, monte de 1 et marque le point.'), visual: { type: 'plane', size: 6, points: [{ x: 4, y: 1, label: '(4, 1)' }] } },
      ] },
      { title: T('Example 3: order matters', 'Exemple 3 : l\'ordre compte'), steps: [
        { text: T('(2, 5) and (5, 2) are different points.', '(2, 5) et (5, 2) sont des points différents.'), visual: { type: 'plane', size: 6, points: [{ x: 2, y: 5, label: '(2, 5)' }, { x: 5, y: 2, label: '(5, 2)' }] } },
      ] },
    ],
    tryIt: { skill: 'MS.G5.E1.4.a', tier: 1, seed: 2 },
  },
];

export const lessonForSkill = (skill: string): Lesson | undefined => LESSONS.find((l) => l.skills.includes(skill));
export const lessonById = (id: string): Lesson | undefined => LESSONS.find((l) => l.id === id);
export type { Lesson } from './types.js';
