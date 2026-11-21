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
  {
    id: 'L.space8.tessellations-angles',
    skills: ['MS.G8.E1.1.a', 'MS.G8.E2.2.a', 'MS.G8.E2.2.b'],
    title: t('Tessellations and angle properties', 'Pavages et propriétés des angles'),
    intro: t('Angles tell you whether shapes fit together. A few rules about lines and polygons let you find missing angles.', 'Les angles disent si des figures s\'emboîtent. Quelques règles sur les droites et les polygones permettent de trouver des angles manquants.'),
    definitions: [
      d(['Interior angles of a polygon', 'Angles intérieurs d\'un polygone'], ['The interior angles of a polygon with n sides add to (n − 2) × 180°. A regular polygon shares that total equally. The angles around a point add to 360°, so a tessellation needs the angles at each vertex to total 360°.', 'Les angles intérieurs d\'un polygone à n côtés totalisent (n − 2) × 180°. Un polygone régulier partage ce total également. Les angles autour d\'un point totalisent 360° : dans un pavage, les angles à chaque sommet doivent totaliser 360°.']),
      d(['Lines and angles', 'Droites et angles'], ['Vertically opposite angles are equal. Angles next to each other on a straight line add to 180°. Between parallel lines: corresponding angles (F) and alternate interior angles (Z) are equal, and co-interior angles (C) add to 180°. An exterior angle of a triangle equals the two opposite interior angles added together.', 'Les angles opposés par le sommet sont égaux. Des angles adjacents sur une droite totalisent 180°. Entre des droites parallèles : les angles correspondants (F) et alternes-internes (Z) sont égaux, et les angles co-internes (C) totalisent 180°. Un angle extérieur d\'un triangle égale les deux angles intérieurs opposés additionnés.']),
    ],
    examples: [
      ex(['Example 1: a vertex', 'Exemple 1 : un sommet'], ['A regular hexagon has interior angles of (6 − 2) × 180 ÷ 6 = 120°. One hexagon uses 120°, so 360 − 120 = 240° is left.', 'Un hexagone régulier a des angles intérieurs de (6 − 2) × 180 ÷ 6 = 120°. Un hexagone utilise 120°, il reste donc 360 − 120 = 240°.'], ['Each triangle fills 60°, so 240 ÷ 60 = 4 triangles complete the vertex.', 'Chaque triangle comble 60°, donc 240 ÷ 60 = 4 triangles complètent le sommet.']),
      ex(['Example 2: parallel lines', 'Exemple 2 : droites parallèles'], ['Two parallel lines are cut by a transversal and one angle is 110°. The corresponding angle is also 110°.', 'Deux droites parallèles sont coupées par une sécante et un angle mesure 110°. L\'angle correspondant mesure aussi 110°.'], ['The co-interior angle is 180 − 110 = 70°.', 'L\'angle co-interne mesure 180 − 110 = 70°.']),
      ex(['Example 3: how many sides?', 'Exemple 3 : combien de côtés ?'], ['Each interior angle of a regular polygon is 140°, so each exterior angle is 180 − 140 = 40°.', 'Chaque angle intérieur d\'un polygone régulier mesure 140°, donc chaque angle extérieur mesure 180 − 140 = 40°.'], ['The exterior angles add to 360°, so 360 ÷ 40 = 9 sides.', 'Les angles extérieurs totalisent 360°, donc 360 ÷ 40 = 9 côtés.']),
    ],
    tryIt: { skill: 'MS.G8.E2.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.space8.scale-transformations-units',
    skills: ['MS.G8.E1.3.a', 'MS.G8.E1.4.a', 'MS.G8.E2.1.a'],
    title: t('Scale drawings, transformations and metric prefixes', 'Dessins à l\'échelle, transformations et préfixes du système métrique'),
    intro: t('A scale links a drawing to the real thing. Transformations move and resize shapes by rules, and prefixes name very large and very small units with powers of ten.', 'Une échelle relie un dessin à la réalité. Les transformations déplacent et redimensionnent les figures selon des règles, et les préfixes nomment de très grandes et de très petites unités avec des puissances de dix.'),
    definitions: [
      d(['Scale', 'Échelle'], ['A scale of 1 : 200 means 1 unit on the drawing is 200 of the same unit in real life. Real length ÷ scale number = drawing length.', 'Une échelle de 1 : 200 signifie que 1 unité sur le dessin vaut 200 de la même unité dans la réalité. Longueur réelle ÷ nombre de l\'échelle = longueur sur le dessin.']),
      d(['Transformations', 'Transformations'], ['A translation slides. A reflection in the y-axis changes x to −x; in the x-axis it changes y to −y. A 180° rotation about the origin changes both signs. A dilation about the origin multiplies both coordinates by the scale factor.', 'Une translation fait glisser. Une réflexion par rapport à l\'axe des y change x en −x ; par rapport à l\'axe des x, elle change y en −y. Une rotation de 180° autour de l\'origine change les deux signes. Une dilatation par rapport à l\'origine multiplie les deux coordonnées par le facteur d\'échelle.']),
      d(['Prefixes', 'Préfixes'], ['Mega is 10 to the power 6, giga is 10 to the power 9, tera is 10 to the power 12. Micro is 10 to the power −6, nano is −9, pico is −12.', 'Méga vaut 10 à la puissance 6, giga 10 à la puissance 9, téra 10 à la puissance 12. Micro vaut 10 à la puissance −6, nano −9, pico −12.']),
    ],
    examples: [
      ex(['Example 1: a scale', 'Exemple 1 : une échelle'], ['A wall is 12 m long. The scale is 1 : 200. In centimetres, 12 m = 1200 cm.', 'Un mur mesure 12 m de long. L\'échelle est 1 : 200. En centimètres, 12 m = 1200 cm.'], ['1200 ÷ 200 = 6, so the drawing is 6 cm long.', '1200 ÷ 200 = 6, donc le dessin mesure 6 cm de long.']),
      ex(['Example 2: a dilation', 'Exemple 2 : une dilatation'], ['The point (3, −2) is dilated by a scale factor of 2 about the origin. Multiply both coordinates by 2.', 'Le point (3, −2) subit une dilatation de facteur 2 par rapport à l\'origine. Multiplie les deux coordonnées par 2.'], ['The image is (6, −4).', 'L\'image est (6, −4).']),
      ex(['Example 3: prefixes', 'Exemple 3 : préfixes'], ['3.5 gigametres in megametres: giga is 10 to the power 9 and mega is 10 to the power 6, so one gigametre is 10 to the power 3 megametres.', '3,5 gigamètres en mégamètres : giga vaut 10 à la puissance 9 et méga 10 à la puissance 6, donc un gigamètre vaut 10 à la puissance 3 mégamètres.'], ['3.5 × 1000 = 3500 megametres.', '3,5 × 1000 = 3500 mégamètres.']),
    ],
    tryIt: { skill: 'MS.G8.E1.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.space8.composite-shapes',
    skills: ['MS.G8.E2.3.a', 'MS.G8.E2.3.b'],
    title: t('Composite shapes and solids', 'Figures et solides composés'),
    intro: t('Break a shape into pieces you know, find each piece, then add (or take away). The same idea works for area, volume and surface area.', 'Divise une figure en parties que tu connais, trouve chaque partie, puis additionne (ou retire). La même idée fonctionne pour l\'aire, le volume et l\'aire totale.'),
    definitions: [
      d(['Add or subtract', 'Additionner ou soustraire'], ['If pieces are joined, add their areas or volumes. If a piece is cut out, subtract it. Use 3.14 for pi when a circle is involved.', 'Si des parties sont jointes, additionne leurs aires ou leurs volumes. Si une partie est retirée, soustrais-la. Utilise 3,14 pour pi quand il y a un cercle.']),
      d(['Surface area', 'Aire totale'], ['Surface area counts only the outside faces. Cutting a corner off a cube removes three small faces but uncovers three new ones of the same size, so the surface area stays the same.', 'L\'aire totale ne compte que les faces extérieures. Retirer un coin d\'un cube enlève trois petites faces mais en découvre trois nouvelles de la même taille : l\'aire totale reste la même.']),
    ],
    examples: [
      ex(['Example 1: an L shape', 'Exemple 1 : une forme en L'], ['A rectangle 12 m by 8 m has a 5 m by 3 m corner cut out. Whole rectangle: 12 × 8 = 96 m².', 'Un rectangle de 12 m sur 8 m a un coin de 5 m sur 3 m retiré. Rectangle entier : 12 × 8 = 96 m².'], ['Take away the corner: 96 − 15 = 81 m².', 'Retire le coin : 96 − 15 = 81 m².']),
      ex(['Example 2: a window', 'Exemple 2 : une fenêtre'], ['A window is a rectangle 10 cm by 8 cm with a semicircle on top (diameter 10 cm, radius 5 cm). Rectangle: 80 cm².', 'Une fenêtre est un rectangle de 10 cm sur 8 cm surmonté d\'un demi-cercle (diamètre 10 cm, rayon 5 cm). Rectangle : 80 cm².'], ['Semicircle: 3.14 × 5 × 5 ÷ 2 = 39.25 cm². Total: 80 + 39.25 = 119.25 cm².', 'Demi-cercle : 3,14 × 5 × 5 ÷ 2 = 39,25 cm². Total : 80 + 39,25 = 119,25 cm².']),
      ex(['Example 3: a solid', 'Exemple 3 : un solide'], ['A box 10 cm by 10 cm by 4 cm has a cylinder (radius 3 cm, height 5 cm) on top. Box: 10 × 10 × 4 = 400 cm³.', 'Une boîte de 10 cm sur 10 cm sur 4 cm porte un cylindre (rayon 3 cm, hauteur 5 cm). Boîte : 10 × 10 × 4 = 400 cm³.'], ['Cylinder: 3.14 × 3 × 3 × 5 = 141.3 cm³. Total: 541.3 cm³.', 'Cylindre : 3,14 × 3 × 3 × 5 = 141,3 cm³. Total : 541,3 cm³.']),
    ],
    tryIt: { skill: 'MS.G8.E2.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.space8.pythagoras',
    skills: ['MS.G8.E2.4.a', 'MS.G8.E2.4.b'],
    title: t('The Pythagorean theorem', 'Le théorème de Pythagore'),
    intro: t('In a right triangle the two shorter sides (legs) and the longest side (hypotenuse) are linked by a² + b² = c².', 'Dans un triangle rectangle, les deux côtés plus courts (côtés de l\'angle droit) et le plus long côté (hypoténuse) sont liés par a² + b² = c².'),
    definitions: [
      d(['Hypotenuse and legs', 'Hypoténuse et côtés de l\'angle droit'], ['The hypotenuse is opposite the right angle and is the longest side. To find it, add the squares of the legs and take the square root. To find a leg, subtract the square of the known leg from the square of the hypotenuse, then take the square root.', 'L\'hypoténuse est opposée à l\'angle droit et c\'est le plus long côté. Pour la trouver, additionne les carrés des deux autres côtés et prends la racine carrée. Pour trouver un côté de l\'angle droit, soustrais le carré du côté connu du carré de l\'hypoténuse, puis prends la racine carrée.']),
      d(['Where it shows up', 'Où on le trouve'], ['Ladders against walls, diagonals of rectangles, and the distance between two points on a grid all form right triangles.', 'Les échelles contre les murs, les diagonales de rectangles et la distance entre deux points sur une grille forment tous des triangles rectangles.']),
    ],
    examples: [
      ex(['Example 1: the hypotenuse', 'Exemple 1 : l\'hypoténuse'], ['Legs 6 cm and 8 cm. 6² + 8² = 36 + 64 = 100.', 'Côtés de l\'angle droit de 6 cm et de 8 cm. 6² + 8² = 36 + 64 = 100.'], ['The hypotenuse is the square root of 100, which is 10 cm.', 'L\'hypoténuse est la racine carrée de 100, soit 10 cm.']),
      ex(['Example 2: a leg', 'Exemple 2 : un côté de l\'angle droit'], ['A 13 m ladder has its foot 5 m from a wall. 13² − 5² = 169 − 25 = 144.', 'Une échelle de 13 m a son pied à 5 m d\'un mur. 13² − 5² = 169 − 25 = 144.'], ['It reaches the square root of 144, which is 12 m up the wall.', 'Elle atteint la racine carrée de 144, soit 12 m de hauteur sur le mur.']),
      ex(['Example 3: distance on a grid', 'Exemple 3 : distance sur une grille'], ['From (1, 2) to (4, 6) is 3 across and 4 up. 3² + 4² = 9 + 16 = 25.', 'De (1, 2) à (4, 6), il y a 3 à l\'horizontale et 4 à la verticale. 3² + 4² = 9 + 16 = 25.'], ['The distance is the square root of 25, which is 5.', 'La distance est la racine carrée de 25, soit 5.']),
    ],
    tryIt: { skill: 'MS.G8.E2.4.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.finance8.money-plans',
    skills: ['MS.G8.F1.1.a', 'MS.G8.F1.2.a', 'MS.G8.F1.3.a'],
    title: t('Paying in other currencies, taxes and balanced budgets', 'Payer en d\'autres monnaies, taxes et budgets équilibrés'),
    intro: t('Real money plans have exchange rates and fees, taxes taken off pay, and a budget that adds up.', 'Les vrais plans d\'argent comportent des taux de change et des frais, des impôts retenus sur la paie et un budget qui balance.'),
    definitions: [
      d(['Exchange and fees', 'Change et frais'], ['Convert with the exchange rate first, then add any percent fee. A card with a lower foreign currency fee costs less.', 'Convertis d\'abord avec le taux de change, puis ajoute les frais en pourcentage. Une carte avec des frais de change plus bas coûte moins cher.']),
      d(['Taxes and budgets', 'Impôts et budgets'], ['Income tax is a percent of income. What is left after tax is what you can spend and save. In a balanced budget, spending, saving and everything else add up to the income, and percent budgets add up to 100%.', 'L\'impôt sur le revenu est un pourcentage du revenu. Ce qui reste après impôt est ce que tu peux dépenser et épargner. Dans un budget équilibré, les dépenses, l\'épargne et le reste égalent le revenu, et les budgets en pourcentage totalisent 100 %.']),
    ],
    examples: [
      ex(['Example 1: a fee', 'Exemple 1 : des frais'], ['A 120 US dollar jacket at 1 US dollar = 1.35 Canadian dollars: 120 × 1.35 = 162 Canadian dollars.', 'Un manteau de 120 dollars américains à 1 dollar américain = 1,35 dollar canadien : 120 × 1,35 = 162 dollars canadiens.'], ['With a 3% card fee: 162 × 1.03 = 166.86 Canadian dollars.', 'Avec des frais de carte de 3 % : 162 × 1,03 = 166,86 dollars canadiens.']),
      ex(['Example 2: tax and savings', 'Exemple 2 : impôt et épargne'], ['A person earns 60 000 dollars and pays 20% tax: 60 000 × 0.8 = 48 000 dollars left.', 'Une personne gagne 60 000 dollars et paie 20 % d\'impôt : 60 000 × 0,8 = 48 000 dollars restants.'], ['Saving 10% of that is 4800 dollars a year.', 'En épargner 10 %, c\'est 4800 dollars par année.']),
      ex(['Example 3: a balanced budget', 'Exemple 3 : un budget équilibré'], ['A budget gives 50% to needs and 30% to wants, so savings are 100 − 50 − 30 = 20%.', 'Un budget consacre 50 % aux besoins et 30 % aux désirs : l\'épargne est de 100 − 50 − 30 = 20 %.'], ['With an income of 2500 dollars, 20% is 500 dollars saved.', 'Avec un revenu de 2500 dollars, 20 %, c\'est 500 dollars épargnés.']),
    ],
    tryIt: { skill: 'MS.G8.F1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.finance8.growth-credit-offers',
    skills: ['MS.G8.F1.4.a', 'MS.G8.F1.5.a', 'MS.G8.F1.6.a'],
    title: t('Compound growth, sales offers, credit cards and contracts', 'Croissance composée, offres de rabais, cartes de crédit et contrats'),
    intro: t('Compare how money grows, what a deal really costs, and what borrowing on a card or a contract adds up to.', 'Compare la croissance de l\'argent, ce que coûte vraiment une offre, et ce que représentent un emprunt sur carte ou un contrat.'),
    definitions: [
      d(['Simple and compound', 'Simple et composé'], ['Simple interest is the same amount each year. Compound interest is worked out on the amount plus the interest already earned, so it grows faster over time: multiply by the growth factor once for each year.', 'L\'intérêt simple est le même montant chaque année. L\'intérêt composé est calculé sur le montant plus l\'intérêt déjà gagné, donc il croît plus vite avec le temps : multiplie par le facteur de croissance une fois par année.']),
      d(['Offers and loyalty', 'Offres et fidélité'], ['Take the discount off first, then add tax to the sale price. Loyalty points have a value: divide the points by the block size, then multiply by the reward. Compare offers by working out the total cost of each.', 'Retire d\'abord le rabais, puis ajoute la taxe au prix de solde. Les points de fidélité ont une valeur : divise les points par la taille de la tranche, puis multiplie par la récompense. Compare les offres en calculant le coût total de chacune.']),
      d(['Credit and contracts', 'Crédit et contrats'], ['A credit card charges interest each month on what you owe: the monthly rate is the yearly rate divided by 12. A contract costs the monthly amount times the number of months, plus any start-up cost.', 'Une carte de crédit facture chaque mois de l\'intérêt sur ce que tu dois : le taux mensuel est le taux annuel divisé par 12. Un contrat coûte le montant mensuel fois le nombre de mois, plus les frais de départ.']),
    ],
    examples: [
      ex(['Example 1: compound growth', 'Exemple 1 : croissance composée'], ['1000 dollars at 10% for 3 years. Simple interest: 1000 + 3 × 100 = 1300 dollars.', '1000 dollars à 10 % pendant 3 ans. Intérêt simple : 1000 + 3 × 100 = 1300 dollars.'], ['Compound: 1000 × 1.1 × 1.1 × 1.1 = 1331 dollars, which is 31 dollars more.', 'Composé : 1000 × 1,1 × 1,1 × 1,1 = 1331 dollars, soit 31 dollars de plus.']),
      ex(['Example 2: a sale', 'Exemple 2 : un solde'], ['A 200 dollar jacket is 25% off: 200 × 0.75 = 150 dollars.', 'Un manteau de 200 dollars est à 25 % de rabais : 200 × 0,75 = 150 dollars.'], ['Add 13% HST to the sale price: 150 × 1.13 = 169.50 dollars.', 'Ajoute 13 % de TVH au prix de solde : 150 × 1,13 = 169,50 dollars.']),
      ex(['Example 3: a credit card', 'Exemple 3 : une carte de crédit'], ['A 600 dollar balance at 18% a year: the monthly rate is 18 ÷ 12 = 1.5%.', 'Un solde de 600 dollars à 18 % par année : le taux mensuel est de 18 ÷ 12 = 1,5 %.'], ['One month of interest is 600 × 0.015 = 9 dollars.', 'Un mois d\'intérêt, c\'est 600 × 0,015 = 9 dollars.']),
    ],
    tryIt: { skill: 'MS.G8.F1.4.a', tier: 2, seed: 3 },
  },
];
