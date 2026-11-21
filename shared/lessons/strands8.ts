// Lessons for the Grade 8 Algebra and Data strands (C and D).
import type { Lesson } from './types.js';
import { frac, t, tex } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });
const f = (n: number, dd: number): string => tex(frac(n, dd));

export const STRAND8_LESSONS: Lesson[] = [
  {
    id: 'L.algebra8.patterns-expressions',
    skills: ['MS.G8.C1.1.a', 'MS.G8.C1.3.a', 'MS.G8.C1.4.a', 'MS.G8.C2.1.a', 'MS.G8.C2.2.a'],
    title: t('Patterns, binomials and expressions with rational numbers', 'Suites, binômes et expressions avec des nombres rationnels'),
    intro: t('Patterns can shrink as well as grow, and rules can use negatives and decimals. Like terms combine, and an expression takes a value when you replace its letters.', 'Les suites peuvent décroître aussi bien que croître, et les règles peuvent utiliser des négatifs et des décimales. Les termes semblables se combinent, et une expression prend une valeur quand on remplace ses lettres.'),
    definitions: [
      d(['Rate and initial value', 'Taux et valeur initiale'], ['A linear pattern has a starting value and a constant change per step. A growing pattern has a positive change; a shrinking pattern has a negative change. The rule is change × n + a constant.', 'Une suite linéaire a une valeur de départ et un changement constant par pas. Une suite croissante a un changement positif ; une suite décroissante a un changement négatif. La règle est changement × n + une constante.']),
      d(['Binomials', 'Binômes'], ['A binomial has two terms, like 3x + 5. To add binomials, combine the x terms together and the plain numbers together.', 'Un binôme a deux termes, comme 3x + 5. Pour additionner des binômes, combine ensemble les termes en x et ensemble les nombres seuls.']),
      d(['Evaluate', 'Évaluer'], ['Replace each letter with its value (put negatives in brackets), multiply first, then add or subtract.', 'Remplace chaque lettre par sa valeur (mets les négatifs entre parenthèses), multiplie d\'abord, puis additionne ou soustrais.']),
    ],
    examples: [
      ex(['Example 1: shrinking vs growing', 'Exemple 1 : décroissant et croissant'], ['Tank A has 50 L and loses 4 L an hour. Tank B has 10 L and gains 6 L an hour. The gap is 40 L and it closes by 4 + 6 = 10 L an hour.', 'Le réservoir A contient 50 L et perd 4 L par heure. Le réservoir B contient 10 L et gagne 6 L par heure. L\'écart est de 40 L et il diminue de 4 + 6 = 10 L par heure.'], ['40 ÷ 10 = 4, so they are equal after 4 hours.', '40 ÷ 10 = 4, donc ils sont égaux après 4 heures.']),
      ex(['Example 2: add binomials', 'Exemple 2 : additionner des binômes'], ['(3x + 5) + (−7x + 2). The x terms: 3 + (−7) = −4. The plain numbers: 5 + 2 = 7.', '(3x + 5) + (−7x + 2). Les termes en x : 3 + (−7) = −4. Les nombres seuls : 5 + 2 = 7.'], ['The sum is −4x + 7. When x = 2 it is −8 + 7 = −1.', 'La somme est −4x + 7. Quand x = 2, elle vaut −8 + 7 = −1.']),
      ex(['Example 3: rational patterns', 'Exemple 3 : suites rationnelles'], ['The pattern 12, 6, 3, ... halves each time, so the 4th term is 1.5 and the 5th is 0.75.', 'La suite 12, 6, 3, ... prend la moitié chaque fois : le 4e terme est 1,5 et le 5e est 0,75.'], ['The 6th term is 0.75 ÷ 2 = 0.375.', 'Le 6e terme est 0,75 ÷ 2 = 0,375.']),
    ],
    tryIt: { skill: 'MS.G8.C1.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.algebra8.equations-inequalities',
    skills: ['MS.G8.C2.3.a', 'MS.G8.C2.4.a'],
    title: t('Equations and inequalities with integers and decimals', 'Équations et inéquations avec des entiers et des nombres décimaux'),
    intro: t('Solve by undoing steps, now with negatives and decimals. An inequality has many solutions, and dividing by a negative number reverses it.', 'Résous en défaisant les étapes, maintenant avec des négatifs et des décimales. Une inéquation a beaucoup de solutions, et diviser par un nombre négatif l\'inverse.'),
    definitions: [
      d(['Undoing', 'Défaire'], ['Do the opposite of what was done: undo adding by subtracting, undo subtracting by adding, undo multiplying by dividing. Do the same to both sides.', 'Fais le contraire de ce qui a été fait : défais l\'addition en soustrayant, la soustraction en additionnant, la multiplication en divisant. Fais la même chose des deux côtés.']),
      d(['Reversing an inequality', 'Inverser une inéquation'], ['When you multiply or divide both sides by a negative number, reverse the inequality sign: −3x > 12 becomes x < −4.', 'Quand tu multiplies ou divises les deux côtés par un nombre négatif, inverse le signe d\'inégalité : −3x > 12 devient x < −4.']),
    ],
    examples: [
      ex(['Example 1: a negative coefficient', 'Exemple 1 : un coefficient négatif'], ['Solve −3x + 5 = 20. Subtract 5: −3x = 15.', 'Résous −3x + 5 = 20. Soustrais 5 : −3x = 15.'], ['Divide by −3: x = −5. Check: −3 × (−5) + 5 = 20.', 'Divise par −3 : x = −5. Vérifie : −3 × (−5) + 5 = 20.']),
      ex(['Example 2: decimals', 'Exemple 2 : nombres décimaux'], ['Solve 0.5x − 1.2 = 2.3. Add 1.2: 0.5x = 3.5.', 'Résous 0,5x − 1,2 = 2,3. Ajoute 1,2 : 0,5x = 3,5.'], ['Divide by 0.5: x = 7.', 'Divise par 0,5 : x = 7.']),
      ex(['Example 3: reverse the sign', 'Exemple 3 : inverser le signe'], ['Find the greatest integer with −3x + 5 > −10. Subtract 5: −3x > −15.', 'Trouve le plus grand entier avec −3x + 5 > −10. Soustrais 5 : −3x > −15.'], ['Divide by −3 and reverse: x < 5. The greatest integer is 4.', 'Divise par −3 et inverse : x < 5. Le plus grand entier est 4.']),
    ],
    tryIt: { skill: 'MS.G8.C2.3.a', tier: 1, seed: 4 },
  },
  {
    id: 'L.data8.relations-probability',
    skills: ['MS.G8.D1.2.a', 'MS.G8.D1.5.a', 'MS.G8.D2.1.a', 'MS.G8.D2.2.a'],
    title: t('Tables, scatter plots, Venn diagrams and several events', 'Tableaux, nuages de points, diagrammes de Venn et événements multiples'),
    intro: t('A table of values gives a rule. A scatter plot shows how two variables go together. Venn and tree diagrams organize probability.', 'Un tableau de valeurs donne une règle. Un nuage de points montre comment deux variables évoluent ensemble. Les diagrammes de Venn et en arbre organisent les probabilités.'),
    definitions: [
      d(['Correlation', 'Corrélation'], ['Positive: y goes up as x goes up. Negative: y goes down as x goes up. Strong: the points hug a line. Weak: they are scattered around it. None: no pattern. An outlier is a point far from the rest.', 'Positive : y augmente quand x augmente. Négative : y diminue quand x augmente. Forte : les points suivent de près une droite. Faible : ils sont dispersés autour. Aucune : pas de motif. Une valeur aberrante est un point loin des autres.']),
      d(['Venn diagram', 'Diagramme de Venn'], ['Two overlapping circles. The overlap holds what is in both. At least one = A + B − both, because the overlap is counted in both circles.', 'Deux cercles qui se chevauchent. Le chevauchement contient ce qui est dans les deux. Au moins un = A + B − les deux, parce que le chevauchement est compté dans les deux cercles.']),
      d(['Several events', 'Événements multiples'], ['Independent events: multiply their probabilities. Dependent events (nothing put back): the bag changes after each draw. A tree diagram lists every path; add the paths that fit.', 'Événements indépendants : multiplie leurs probabilités. Événements dépendants (rien n\'est remis) : le sac change après chaque tirage. Un diagramme en arbre énumère tous les chemins ; additionne ceux qui conviennent.']),
    ],
    examples: [
      ex(['Example 1: a table gives a rule', 'Exemple 1 : un tableau donne une règle'], ['x = 1, 2, 3, 4 and y = 7, 10, 13, 16. y goes up by 3 each time, so y = 3x + 4.', 'x = 1, 2, 3, 4 et y = 7, 10, 13, 16. y augmente de 3 chaque fois, donc y = 3x + 4.'], ['When x = 10: 3 × 10 + 4 = 34.', 'Quand x = 10 : 3 × 10 + 4 = 34.']),
      ex(['Example 2: Venn diagram', 'Exemple 2 : diagramme de Venn'], ['20 play soccer, 15 play hockey, 8 play both. At least one: 20 + 15 − 8.', '20 jouent au soccer, 15 au hockey, 8 aux deux. Au moins un : 20 + 15 − 8.'], ['That is 27 students.', 'Cela fait 27 élèves.']),
      ex(['Example 3: tree diagram', 'Exemple 3 : diagramme en arbre'], [`A bag has 3 red and 2 blue marbles. Exactly one red in two draws, nothing put back. Red then blue: ${f(3, 5)} × ${f(2, 4)} = ${f(6, 20)}. Blue then red: ${f(2, 5)} × ${f(3, 4)} = ${f(6, 20)}.`, `Un sac contient 3 billes rouges et 2 bleues. Exactement une rouge en deux tirages, sans remettre. Rouge puis bleue : ${f(3, 5)} × ${f(2, 4)} = ${f(6, 20)}. Bleue puis rouge : ${f(2, 5)} × ${f(3, 4)} = ${f(6, 20)}.`], [`Add the two paths: ${f(12, 20)}, which is ${f(3, 5)} in simplest form.`, `Additionne les deux chemins : ${f(12, 20)}, soit ${f(3, 5)} sous forme irréductible.`]),
    ],
    tryIt: { skill: 'MS.G8.D2.1.a', tier: 1, seed: 3 },
  },
];
