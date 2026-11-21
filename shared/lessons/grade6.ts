// Lessons for the Grade 6 expectations added in 2.9.1: coding and modelling, and views, the protractor up to 360 degrees and nets.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE6_LESSONS: Lesson[] = [
  {
    id: 'L.coding6.programs-models',
    skills: ['MS.G6.C3.a', 'MS.G6.C3.b', 'MS.G6.C4.a'],
    title: t('Programs with loops and tests, and the modelling process', 'Programmes avec boucles et tests, et démarche de modélisation'),
    intro: t('A program follows its steps in order. Variables hold values that can change, loops repeat steps and conditionals choose a branch. Modelling uses the same careful thinking on a real question.', 'Un programme suit ses étapes dans l\'ordre. Les variables contiennent des valeurs qui peuvent changer, les boucles répètent des étapes et les conditionnelles choisissent une branche. La modélisation utilise la même réflexion soignée sur une vraie question.'),
    definitions: [
      d(['Variables and loops', 'Variables et boucles'], ['A variable can change inside a loop. Follow each repeat and write down every variable, so you do not skip a change.', 'Une variable peut changer dans une boucle. Suis chaque répétition et note chaque variable, pour ne manquer aucun changement.']),
      d(['Conditionals', 'Conditionnelles'], ['A test is checked before a step runs. If it is true the first branch runs, otherwise the other branch runs. A "while" loop keeps repeating as long as its test is true.', 'Un test est vérifié avant qu\'une étape s\'exécute. S\'il est vrai, la première branche s\'exécute, sinon c\'est l\'autre. Une boucle « tant que » se répète tant que son test est vrai.']),
      d(['Changing a program', 'Modifier un programme'], ['When you change a number, run the program again with the new number. A bigger amount or more repeats gives a bigger total, and a new test can pick out different numbers.', 'Quand tu changes un nombre, refais fonctionner le programme avec le nouveau nombre. Un plus grand montant ou plus de répétitions donne un plus grand total, et un nouveau test peut choisir d\'autres nombres.']),
      d(['The modelling process', 'La démarche de modélisation'], ['Ask the question, list what you assume, calculate, check that the answer makes sense (for example, round up when you cannot order part of a pizza), and see what happens when an assumption changes.', 'Pose la question, note ce que tu supposes, calcule, vérifie que la réponse a du sens (par exemple, arrondis vers le haut quand on ne peut pas commander une partie de pizza) et regarde ce qui arrive quand une hypothèse change.']),
    ],
    examples: [
      ex(['Example 1: a growing step', 'Exemple 1 : un pas qui grandit'], ['Total starts at 0 and step at 2. Repeat 3 times: add step to total, then add 1 to step. The amounts added are 2, 3 and 4.', 'Total commence à 0 et pas à 2. Répète 3 fois : ajouter pas à total, puis ajouter 1 à pas. Les montants ajoutés sont 2, 3 et 4.'], ['The total is 2 + 3 + 4 = 9.', 'Le total est 2 + 3 + 4 = 9.']),
      ex(['Example 2: a while loop', 'Exemple 2 : une boucle tant que'], ['x starts at 3 and doubles while x is 40 or less: 3, 6, 12, 24, 48.', 'x commence à 3 et double tant que x est de 40 ou moins : 3, 6, 12, 24, 48.'], ['The loop ran 4 times, because 48 is above 40 and stops it.', 'La boucle s\'est exécutée 4 fois, parce que 48 dépasse 40 et l\'arrête.']),
      ex(['Example 3: a model with rounding', 'Exemple 3 : un modèle avec arrondi'], ['30 students eat 3 slices each: 90 slices. A pizza has 8 slices: 90 ÷ 8 = 11.25.', '30 élèves mangent 3 pointes chacun : 90 pointes. Une pizza a 8 pointes : 90 ÷ 8 = 11,25.'], ['You cannot order part of a pizza, so round up to 12 pizzas.', 'On ne peut pas commander une partie de pizza : arrondis vers le haut à 12 pizzas.']),
    ],
    tryIt: { skill: 'MS.G6.C3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.geometry6.views-protractor-nets',
    skills: ['MS.G6.E1.2.a', 'MS.G6.E2.2.a', 'MS.G6.E2.5.a'],
    title: t('Views of block structures, the protractor up to 360° and nets', 'Vues de structures de blocs, rapporteur jusqu\'à 360° et patrons'),
    intro: t('A structure looks different from the top, the front and the side. A protractor can measure turns bigger than a straight angle, and a net shows a solid unfolded flat.', 'Une structure paraît différente de dessus, de face et de côté. Un rapporteur peut mesurer des rotations plus grandes qu\'un angle plat, et un patron montre un solide déplié à plat.'),
    definitions: [
      d(['Views', 'Vues'], ['The top view has one square for each stack. The front view shows the tallest stack in each column and the side view shows the tallest stack in each row, because a taller stack hides a shorter one behind it.', 'La vue de dessus a un carré par pile. La vue de face montre la pile la plus haute de chaque colonne et la vue de côté montre la pile la plus haute de chaque rangée, parce qu\'une pile plus haute cache une pile plus basse derrière elle.']),
      d(['Angles up to 360°', 'Angles jusqu\'à 360°'], ['Angles around a point add to 360°. A reflex angle is bigger than 180°: it is 360° minus the smaller angle on the other side of the arms.', 'Les angles autour d\'un point totalisent 360°. Un angle rentrant dépasse 180° : c\'est 360° moins le plus petit angle de l\'autre côté des côtés.']),
      d(['Nets', 'Patrons'], ['A net has one shape for each face of the solid. A prism with an n-sided base has n + 2 faces and a pyramid has n + 1. The area of the net is the sum of its shapes.', 'Un patron a une figure pour chaque face du solide. Un prisme à base de n côtés a n + 2 faces et une pyramide en a n + 1. L\'aire du patron est la somme de ses figures.']),
    ],
    examples: [
      ex(['Example 1: a side view', 'Exemple 1 : une vue de côté'], ['Two rows of stacks: front 2, 3, 1 and back 1, 4, 2. From the side you see the tallest stack in each row: 3 and 4.', 'Deux rangées de piles : avant 2, 3, 1 et arrière 1, 4, 2. De côté, tu vois la pile la plus haute de chaque rangée : 3 et 4.'], ['The side view has 3 + 4 = 7 squares.', 'La vue de côté a 3 + 4 = 7 carrés.']),
      ex(['Example 2: a reflex angle', 'Exemple 2 : un angle rentrant'], ['The smaller angle between two arms is 130°.', 'Le plus petit angle entre deux côtés est de 130°.'], ['The reflex angle is 360° − 130° = 230°.', 'L\'angle rentrant est de 360° − 130° = 230°.']),
      ex(['Example 3: the area of a net', 'Exemple 3 : l\'aire d\'un patron'], ['A cube with side 3 cm has a net of 6 squares. One square is 3 × 3 = 9 square cm.', 'Un cube de côté 3 cm a un patron de 6 carrés. Un carré fait 3 × 3 = 9 cm carrés.'], ['The net has area 6 × 9 = 54 square cm.', 'Le patron a une aire de 6 × 9 = 54 cm carrés.']),
    ],
    tryIt: { skill: 'MS.G6.E2.2.a', tier: 1, seed: 3 },
  },
];
