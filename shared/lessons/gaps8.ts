// Lessons for the Grade 8 completion skills: patterns with rational numbers, two-variable data and scatter plots, and models from views.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GAPS8_LESSONS: Lesson[] = [
  {
    id: 'L.gaps8.patterns',
    skills: ['MS.G8.C1.2.a'],
    title: t('Patterns with rational numbers', 'Suites avec des nombres rationnels'),
    intro: t('Patterns can use fractions and decimals, and they can be negative. The ideas are the same as for whole numbers: find the common difference, or use the rule.', 'Les suites peuvent utiliser des fractions et des nombres décimaux, et elles peuvent être négatives. Les idées sont les mêmes qu\'avec les nombres entiers : trouve la différence commune, ou utilise la règle.'),
    definitions: [
      d(['Common difference', 'Différence commune'], ['Subtract two neighbouring terms. If the answer is negative, the pattern is shrinking. For 1.5, 1.25, 1, the common difference is negative 0.25.', 'Soustrais deux termes voisins. Si le résultat est négatif, la suite diminue. Pour 1,5, 1,25, 1, la différence commune est moins 0,25.']),
      d(['A rule with a rational coefficient', 'Une règle avec un coefficient rationnel'], ['In T = 0.5n + 2, multiply the term number n by 0.5 first, then add 2. Choosing a term number that works well with the fraction keeps the arithmetic easy.', 'Dans T = 0,5n + 2, multiplie d\'abord le numéro de terme n par 0,5, puis ajoute 2. Choisir un numéro de terme qui va bien avec la fraction garde le calcul facile.']),
      d(['When does a shrinking pattern pass zero?', 'Quand une suite décroissante passe-t-elle sous zéro ?'], ['Find n when T is zero, then take the next whole term number, because term numbers are whole numbers.', 'Trouve n quand T est nul, puis prends le numéro de terme entier suivant, car les numéros de termes sont des nombres entiers.']),
    ],
    examples: [
      ex(['Example 1: the next term', 'Exemple 1 : le terme suivant'], ['The pattern is 2, 1.25, 0.5, negative 0.25. The common difference is 1.25 minus 2, which is negative 0.75.', 'La suite est 2, 1,25, 0,5, moins 0,25. La différence commune est 1,25 moins 2, soit moins 0,75.'], ['Add negative 0.75 to negative 0.25 to get negative 1.', 'Ajoute moins 0,75 à moins 0,25 pour obtenir moins 1.']),
      ex(['Example 2: use the rule', 'Exemple 2 : utiliser la règle'], ['Use T = 0.75n minus 2.5 for n = 8. Multiply: 0.75 times 8 is 6.', 'Utilise T = 0,75n moins 2,5 pour n = 8. Multiplie : 0,75 fois 8 égale 6.'], ['Subtract: 6 minus 2.5 is 3.5.', 'Soustrais : 6 moins 2,5 égale 3,5.']),
      ex(['Example 3: when is it negative?', 'Exemple 3 : quand est-elle négative ?'], ['For T = 10 minus 1.5n, T is zero when 1.5n is 10, so n is about 6.67.', 'Pour T = 10 moins 1,5n, T est nul quand 1,5n égale 10, donc n vaut environ 6,67.'], ['The first whole term number past 6.67 is 7. Check: 10 minus 10.5 is negative 0.5.', 'Le premier numéro de terme entier après 6,67 est 7. Vérifie : 10 moins 10,5 égale moins 0,5.']),
    ],
    tryIt: { skill: 'MS.G8.C1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.gaps8.data',
    skills: ['MS.G8.D1.1.a', 'MS.G8.D1.3.a', 'MS.G8.D1.4.a', 'MS.G8.D1.6.a'],
    title: t('Two-variable data and scatter plots', 'Données à deux variables et nuages de points'),
    intro: t('Sometimes we measure one thing, and sometimes two things for each person. Two measurements let us look for a relationship, and a scatter plot is the graph for that.', 'Parfois on mesure une chose, et parfois deux choses pour chaque personne. Deux mesures permettent de chercher une relation, et le nuage de points est le graphique pour cela.'),
    definitions: [
      d(['One variable or two', 'Une variable ou deux'], ['Heights of students is one-variable data. Heights and arm spans of the same students is two-variable data, with a pair of numbers for each student.', 'Les tailles des élèves sont des données à une variable. Les tailles et les envergures des mêmes élèves sont des données à deux variables, avec une paire de nombres pour chaque élève.']),
      d(['Scatter plot', 'Nuage de points'], ['Each pair becomes one point. The variable that might cause the change goes on the horizontal axis, and the result goes on the vertical axis.', 'Chaque paire devient un point. La variable qui pourrait causer le changement va sur l\'axe horizontal, et le résultat va sur l\'axe vertical.']),
      d(['An infographic about a trend', 'Une infographie sur une tendance'], ['It needs a title, labelled axes with units, the source, a short statement about the trend, and a key. A headline percent is the part divided by the whole, times 100.', 'Elle a besoin d\'un titre, d\'axes étiquetés avec des unités, de la source, d\'un court énoncé sur la tendance et d\'une légende. Un pourcentage de titre est la partie divisée par le tout, fois 100.']),
      d(['Be careful reading graphs', 'Lire les graphiques avec soin'], ['Look for axes that skip values or do not start at zero, lines drawn through only some of the points, and very small samples. A trend shows that two things move together; it does not prove that one causes the other.', 'Cherche les axes qui sautent des valeurs ou ne commencent pas à zéro, les droites tracées par seulement certains points et les très petits échantillons. Une tendance montre que deux choses évoluent ensemble ; elle ne prouve pas que l\'une cause l\'autre.']),
    ],
    examples: [
      ex(['Example 1: plot a point', 'Exemple 1 : placer un point'], ['A student practised 4 hours and made 7 free throws. Go across 4 on the horizontal axis.', 'Un élève s\'est exercé 4 heures et a réussi 7 lancers francs. Avance de 4 sur l\'axe horizontal.'], ['Then go up 7 and mark the point.', 'Puis monte de 7 et marque le point.']),
      ex(['Example 2: count points above a line', 'Exemple 2 : compter les points au-dessus d\'une ligne'], ['To find how many points have a vertical value greater than 5, find 5 on the vertical axis.', 'Pour trouver combien de points ont une valeur verticale supérieure à 5, trouve 5 sur l\'axe vertical.'], ['Count only the points above that level. A point exactly at 5 is not above it.', 'Compte seulement les points au-dessus de ce niveau. Un point exactement à 5 n\'est pas au-dessus.']),
      ex(['Example 3: cause or not', 'Exemple 3 : cause ou non'], ['Ice cream sales and sunburns rise together in summer.', 'Les ventes de crème glacée et les coups de soleil augmentent ensemble l\'été.'], ['Hot sunny weather explains both. The trend does not show that ice cream causes sunburns.', 'Le temps chaud et ensoleillé explique les deux. La tendance ne montre pas que la crème glacée cause des coups de soleil.']),
    ],
    tryIt: { skill: 'MS.G8.D1.3.a', tier: 2, seed: 4 },
  },
  {
    id: 'L.gaps8.views',
    skills: ['MS.G8.E1.2.a'],
    title: t('Build a model from its views', 'Construire un modèle à partir de ses vues'),
    intro: t('The top, front and side views of a model of cubes do not always tell you exactly how many cubes there are. You can work out the fewest and the most that fit the views.', 'Les vues de dessus, de face et de côté d\'un modèle en cubes ne disent pas toujours exactement combien de cubes il y a. Tu peux trouver le plus petit et le plus grand nombre qui conviennent aux vues.'),
    definitions: [
      d(['Top view', 'Vue de dessus'], ['Each square of the top view is a stack with at least one cube. Add the cubes in every stack to find the total.', 'Chaque carré de la vue de dessus est une pile d\'au moins un cube. Additionne les cubes de chaque pile pour trouver le total.']),
      d(['Front view', 'Vue de face'], ['The front view shows the tallest stack in each column. Stacks behind it can be that tall or shorter.', 'La vue de face montre la pile la plus haute de chaque colonne. Les piles derrière peuvent être aussi hautes ou plus basses.']),
      d(['Fewest and most', 'Le moins et le plus'], ['Fewest: in each column one stack is as tall as the front view shows, and the others have 1 cube. Most: every stack in the column is as tall as the front view allows.', 'Le moins : dans chaque colonne, une pile est aussi haute que la vue de face le montre, et les autres ont 1 cube. Le plus : chaque pile de la colonne est aussi haute que la vue de face le permet.']),
    ],
    examples: [
      ex(['Example 1: add the stacks', 'Exemple 1 : additionner les piles'], ['The stack heights are 2, 1, 3 in the front row and 1, 1, 2 in the back row.', 'Les hauteurs des piles sont 2, 1, 3 dans la rangée avant et 1, 1, 2 dans la rangée arrière.'], ['Add them: 2 + 1 + 3 + 1 + 1 + 2 = 10 cubes.', 'Additionne : 2 + 1 + 3 + 1 + 1 + 2 = 10 cubes.']),
      ex(['Example 2: the fewest cubes', 'Exemple 2 : le moins de cubes'], ['The top view is 2 rows by 3 columns. The front view heights are 3, 1, 2.', 'La vue de dessus est de 2 rangées sur 3 colonnes. Les hauteurs de la vue de face sont 3, 1, 2.'], ['In each column, one stack is as tall as shown and the other has 1 cube: (3 + 1) + (1 + 1) + (2 + 1) = 9 cubes.', 'Dans chaque colonne, une pile est aussi haute que montré et l\'autre a 1 cube : (3 + 1) + (1 + 1) + (2 + 1) = 9 cubes.']),
      ex(['Example 3: the most cubes', 'Exemple 3 : le plus de cubes'], ['Same views. Every stack can be as tall as its column allows, and there are 2 rows.', 'Mêmes vues. Chaque pile peut être aussi haute que sa colonne le permet, et il y a 2 rangées.'], ['Multiply the rows by the column heights: 2 × (3 + 1 + 2) = 12 cubes.', 'Multiplie les rangées par les hauteurs des colonnes : 2 × (3 + 1 + 2) = 12 cubes.']),
    ],
    tryIt: { skill: 'MS.G8.E1.2.a', tier: 1, seed: 3 },
  },
];
