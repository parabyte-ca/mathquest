// A lesson for the protractor skills that are answered by moving an arm on an on-screen protractor.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

export const INTERACTIVE5_LESSONS: Lesson[] = [
  {
    id: 'L.g5.protractor-use',
    skills: ['MS.G5.E2.4.b', 'MS.G5.E2.4.c'],
    title: t('Using a protractor: read and draw angles', 'Utiliser un rapporteur : lire et tracer des angles'),
    intro: t('A protractor measures an angle in degrees. It has two scales that run in opposite directions, so the first job is to choose the right one.', 'Un rapporteur mesure un angle en degrés. Il a deux échelles qui vont en sens contraire : la première tâche est de choisir la bonne.'),
    definitions: [
      { term: t('The base arm', 'Le côté de base'), text: t('Line up one arm of the angle with the bottom line of the protractor and put the corner on the centre mark. That arm is the base arm, and it points to a 0.', 'Aligne un côté de l\'angle avec la ligne du bas du rapporteur et place le sommet sur la marque du centre. Ce côté est le côté de base : il pointe vers un 0.'), visual: { type: 'protractor' } },
      { term: t('Choose the scale that starts at 0', 'Choisis l\'échelle qui commence à 0'), text: t('Read the scale that starts at the 0 the base arm points to. The other scale gives the measure of the angle that is left over to 180 degrees.', 'Lis l\'échelle qui commence au 0 vers lequel pointe le côté de base. L\'autre échelle donne la mesure de ce qui reste jusqu\'à 180 degrés.'), visual: { type: 'protractor', angle: 40 } },
      { term: t('Check with a benchmark', 'Vérifie avec un repère'), text: t('A right angle is 90 degrees. If your angle looks smaller than a right angle, the reading must be less than 90.', 'Un angle droit mesure 90 degrés. Si ton angle semble plus petit qu\'un angle droit, la lecture doit être inférieure à 90.') },
    ],
    examples: [
      { title: t('Example 1: read an angle', 'Exemple 1 : lire un angle'), steps: [
        { text: t('The base arm is on the right, so use the scale that starts at 0 on the right.', 'Le côté de base est à droite : utilise l\'échelle qui commence à 0 à droite.'), visual: { type: 'protractor', angle: 65 } },
        { text: t('The other arm crosses 65 on that scale, so the angle is 65 degrees. It is less than 90, as it looks.', 'L\'autre côté coupe 65 sur cette échelle : l\'angle mesure 65 degrés. C\'est moins de 90, comme on le voit.') },
      ] },
      { title: t('Example 2: the base arm is on the left', 'Exemple 2 : le côté de base est à gauche'), steps: [
        { text: t('Now the base arm points to the 0 on the left, so use the scale that starts at 0 on the left.', 'Maintenant le côté de base pointe vers le 0 à gauche : utilise l\'échelle qui commence à 0 à gauche.'), visual: { type: 'protractor', angle: 65, flip: true } },
        { text: t('The other arm crosses 65 on that scale. The angle is 65 degrees, not 115.', 'L\'autre côté coupe 65 sur cette échelle. L\'angle mesure 65 degrés, et non 115.') },
      ] },
      { title: t('Example 3: draw an angle', 'Exemple 3 : tracer un angle'), steps: [
        { text: t('To draw 110 degrees, find the 0 the base arm points to and count up that scale: 90, then 100, then 110.', 'Pour tracer 110 degrés, trouve le 0 vers lequel pointe le côté de base et monte sur cette échelle : 90, puis 100, puis 110.') },
        { text: t('Put the second arm at 110 on that scale. It is more than a right angle, so it leans past the 90 mark.', 'Place le deuxième côté à 110 sur cette échelle. C\'est plus qu\'un angle droit : il dépasse la marque de 90.'), visual: { type: 'protractor', angle: 110 } },
      ] },
    ],
    tryIt: { skill: 'MS.G5.E2.4.c', tier: 1, seed: 3 },
  },
];
