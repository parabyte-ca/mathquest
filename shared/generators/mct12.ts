// Grade 12 (MCT4C) new skills: evaluating polynomial functions, rearranging technology formulas, forces and navigation with vectors,
// circle properties, and arcs and sectors. The course also reuses generators written for MPM2D, MCR3U, MHF4U and MTH1W.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';
import { evalPoly, polyTex } from './poly12.js';

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25]];
const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
const deg = (f: F, x: number): string => f.m(`${f.n(x)}^{\\circ}`);
const round1 = (x: number): number => Math.round(x * 10) / 10;

/** MCT4C.B1: evaluate polynomial functions */
export const polyEval11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 3) {
    const p = randInt(r, 1, 4), q = randInt(r, 5, 8), k = randInt(r, 2, 5), ans = k * (k + p) * (k + q);
    return {
      prompt: bi((f) => f.t(`A box has dimensions ${f.m('x')}, ${f.m(`x + ${f.n(p)}`)} and ${f.m(`x + ${f.n(q)}`)} cm. Its volume is ${f.m(`V(x) = x(x + ${f.n(p)})(x + ${f.n(q)})`)}. What is the volume when ${f.m(`x = ${f.n(k)}`)}, in cm³?`, `Une boîte a pour dimensions ${f.m('x')}, ${f.m(`x + ${f.n(p)}`)} et ${f.m(`x + ${f.n(q)}`)} cm. Son volume est ${f.m(`V(x) = x(x + ${f.n(p)})(x + ${f.n(q)})`)}. Quel est le volume quand ${f.m(`x = ${f.n(k)}`)}, en cm³ ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[k + (k + p) + (k + q), t('The volume is the product of the three dimensions, not their sum.', 'Le volume est le produit des trois dimensions, pas leur somme.'), 0], [k * (k + p) * q, t('Replace x by the same number in every bracket.', 'Remplace x par le même nombre dans chaque parenthèse.'), 0], [k * k * k + p * q, t('Substitute x into each factor first, then multiply them.', 'Remplace d\'abord x dans chaque facteur, puis multiplie-les.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`V(${f.n(k)}) = ${f.n(k)}(${f.n(k)} + ${f.n(p)})(${f.n(k)} + ${f.n(q)}) = ${f.n(k)} \\times ${f.n(k + p)} \\times ${f.n(k + q)}`)}.`, `${f.m(`V(${f.n(k)}) = ${f.n(k)}(${f.n(k)} + ${f.n(p)})(${f.n(k)} + ${f.n(q)}) = ${f.n(k)} \\times ${f.n(k + p)} \\times ${f.n(k + q)}`)}.`)), bi((f) => f.t(`The volume is ${f.N(ans)} cm³.`, `Le volume est de ${f.N(ans)} cm³.`))],
      nudge: t('Replace x by the number in every factor, then multiply.', 'Remplace x par le nombre dans chaque facteur, puis multiplie.'),
    };
  }
  const cs = tier === 1 ? [nonzero(r, -3, 3), nonzero(r, -6, 6), randInt(r, -9, 9)] : [pick(r, [1, 2, -1, -2]), nonzero(r, -5, 5), nonzero(r, -6, 6), randInt(r, -9, 9)];
  const x = nonzero(r, -3, 3), ans = evalPoly(cs, x);
  return {
    prompt: bi((f) => f.t(`For ${f.m(`f(x) = ${polyTex(f, cs)}`)}, find ${f.m(`f(${f.n(x)})`)}.`, `Pour ${f.m(`f(x) = ${polyTex(f, cs)}`)}, trouve ${f.m(`f(${f.n(x)})`)}.`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[evalPoly(cs, -x), t('Check the sign when you substitute a negative number: put it in brackets before squaring or cubing.', 'Vérifie le signe quand tu remplaces par un nombre négatif : mets-le entre parenthèses avant de l\'élever au carré ou au cube.'), 0], [cs.reduce((acc, k, i) => acc + k * x * (cs.length - 1 - i), 0), t('A power means repeated multiplication: x² is x times x, not 2 times x.', 'Une puissance est une multiplication répétée : x² est x fois x, pas 2 fois x.'), 0], [cs.reduce((a, k) => a + k, 0), t('Replace x by the number in every term, do not just add the coefficients.', 'Remplace x par le nombre dans chaque terme, n\'additionne pas seulement les coefficients.'), 0]]),
    steps: [bi((f) => f.t(`Replace x by ${f.m(`(${f.n(x)})`)} in each term and work out the powers first.`, `Remplace x par ${f.m(`(${f.n(x)})`)} dans chaque terme et calcule d\'abord les puissances.`)), bi((f) => f.t(`${f.m(`f(${f.n(x)})`)} = ${f.N(ans)}.`, `${f.m(`f(${f.n(x)})`)} = ${f.N(ans)}.`))],
    nudge: t('Substitute the number for x, do the powers, then the multiplications, then add.', 'Remplace x par le nombre, calcule les puissances, puis les multiplications, puis additionne.'),
  };
});

/** MCT4C.B3: rearrange and use formulas from technology fields */
export const rearrange11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const I = randInt(r, 2, 6), R = randInt(r, 2, 20), V = I * R;
    return {
      prompt: bi((f) => f.t(`Ohm's law is ${f.m('V = IR')}. A circuit has a voltage of ${f.m(`V = ${f.n(V)}`)} volts and a current of ${f.m(`I = ${f.n(I)}`)} amps. Rearrange the formula and find the resistance R, in ohms.`, `La loi d'Ohm est ${f.m('V = IR')}. Un circuit a une tension de ${f.m(`V = ${f.n(V)}`)} volts et un courant de ${f.m(`I = ${f.n(I)}`)} ampères. Réarrange la formule et trouve la résistance R, en ohms.`)),
      answer: R, category: 'AP',
      wrong: wr(R, [[V * I, t('To isolate R, divide both sides by I. Do not multiply.', 'Pour isoler R, divise les deux membres par I. Ne multiplie pas.'), 0], [V - I, t('V = IR is a product, so undo it by dividing, not subtracting.', 'V = IR est un produit : défais-le en divisant, pas en soustrayant.'), 0], [r6(I / V), t('Divide the voltage by the current, not the other way round.', 'Divise la tension par le courant, pas l\'inverse.'), 0]]),
      steps: [bi((f) => f.t(`Divide both sides by I: ${f.m('R = \\frac{V}{I}')}.`, `Divise les deux membres par I : ${f.m('R = \\frac{V}{I}')}.`)), bi((f) => f.t(`${f.m(`R = ${f.n(V)} \\div ${f.n(I)}`)} = ${f.N(R)} ohms.`, `${f.m(`R = ${f.n(V)} \\div ${f.n(I)}`)} = ${f.N(R)} ohms.`))],
      nudge: t('Divide both sides of V = IR by I to get R alone.', 'Divise les deux membres de V = IR par I pour isoler R.'),
    };
  }
  if (tier === 2) {
    const I = randInt(r, 2, 9), R = randInt(r, 2, 12), P = I * I * R;
    return {
      prompt: bi((f) => f.t(`The power in a circuit is ${f.m('P = I^{2}R')}. A heater uses ${f.m(`P = ${f.n(P)}`)} watts and has a resistance of ${f.m(`R = ${f.n(R)}`)} ohms. Find the current I, in amps.`, `La puissance d'un circuit est ${f.m('P = I^{2}R')}. Un radiateur utilise ${f.m(`P = ${f.n(P)}`)} watts et a une résistance de ${f.m(`R = ${f.n(R)}`)} ohms. Trouve le courant I, en ampères.`)),
      answer: I, category: 'AP',
      wrong: wr(I, [[P / R, t('Dividing by R gives I squared. Take the square root as well.', 'Diviser par R donne I au carré. Prends aussi la racine carrée.'), 1], [P - R, t('P = I²R is a product: undo it by dividing, then take the square root.', 'P = I²R est un produit : défais-le en divisant, puis prends la racine carrée.'), 0], [r6(P / (2 * R)), t('The 2 is an exponent, not a multiplier. Divide by R, then take the square root.', 'Le 2 est un exposant, pas un multiplicateur. Divise par R, puis prends la racine carrée.'), 0]]),
      steps: [bi((f) => f.t(`Divide by R: ${f.m('I^{2} = \\frac{P}{R}')}, so ${f.m('I = \\sqrt{\\frac{P}{R}}')}.`, `Divise par R : ${f.m('I^{2} = \\frac{P}{R}')}, donc ${f.m('I = \\sqrt{\\frac{P}{R}}')}.`)), bi((f) => f.t(`${f.m(`I = \\sqrt{${f.n(P)} \\div ${f.n(R)}} = \\sqrt{${f.n(I * I)}}`)} = ${f.N(I)} amps.`, `${f.m(`I = \\sqrt{${f.n(P)} \\div ${f.n(R)}} = \\sqrt{${f.n(I * I)}}`)} = ${f.N(I)} ampères.`))],
      nudge: t('Divide both sides by R, then take the square root.', 'Divise les deux membres par R, puis prends la racine carrée.'),
    };
  }
  let u = 0, v = 0, a = 0, s = 0;
  for (let k = 0; k < 500; k++) {
    u = randInt(r, 0, 8); v = randInt(r, u + 2, 16); a = pick(r, [2, 4, 5, 8, 10]);
    if ((v * v - u * u) % (2 * a) === 0 && (v * v - u * u) / (2 * a) >= 1) { s = (v * v - u * u) / (2 * a); break; }
  }
  if (s === 0) { u = 2; v = 10; a = 4; s = (v * v - u * u) / (2 * a); }
  const ans = (v * v - u * u) / (2 * s);
  return {
    prompt: bi((f) => f.t(`A vehicle speeds up from ${f.m(`u = ${f.n(u)}`)} m/s to ${f.m(`v = ${f.n(v)}`)} m/s over ${f.m(`s = ${f.n(s)}`)} m. Use ${f.m('v^{2} = u^{2} + 2as')} to find the acceleration a, in m/s².`, `Un véhicule accélère de ${f.m(`u = ${f.n(u)}`)} m/s à ${f.m(`v = ${f.n(v)}`)} m/s sur ${f.m(`s = ${f.n(s)}`)} m. Utilise ${f.m('v^{2} = u^{2} + 2as')} pour trouver l'accélération a, en m/s².`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6((v - u) / (2 * s)), t('The speeds are squared in the formula: use v² and u², not v and u.', 'Les vitesses sont au carré dans la formule : utilise v² et u², pas v et u.'), 0], [r6((v * v - u * u) / s), t('The formula has 2as, so divide by 2s, not just s.', 'La formule contient 2as : divise par 2s, pas seulement par s.'), 0], [r6((v * v + u * u) / (2 * s)), t('Subtract u² from v² before dividing.', 'Soustrais u² de v² avant de diviser.'), 0]]),
    steps: [bi((f) => f.t(`Subtract ${f.m('u^{2}')} and divide by ${f.m('2s')}: ${f.m('a = \\frac{v^{2} - u^{2}}{2s}')}.`, `Soustrais ${f.m('u^{2}')} et divise par ${f.m('2s')} : ${f.m('a = \\frac{v^{2} - u^{2}}{2s}')}.`)), bi((f) => f.t(`${f.m(`a = \\frac{${f.n(v * v)} - ${f.n(u * u)}}{${f.n(2 * s)}}`)} = ${f.N(ans)} m/s².`, `${f.m(`a = \\frac{${f.n(v * v)} - ${f.n(u * u)}}{${f.n(2 * s)}}`)} = ${f.N(ans)} m/s².`))],
    nudge: t('Move u² to the other side, then divide by 2s.', 'Passe u² de l\'autre côté, puis divise par 2s.'),
  };
});

/** MCT4C.D1: forces and navigation with vectors */
export const force11 = (id: string): Generator => numGen(id, (tier, r) => {
  const [p, q, h] = pick(r, TRIPLES), swap = r() < 0.5, a = swap ? q : p, b = swap ? p : q;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Two forces of ${f.N(a)} N and ${f.N(b)} N act on an object at right angles to each other. What is the magnitude of the resultant force, in newtons?`, `Deux forces de ${f.N(a)} N et ${f.N(b)} N agissent sur un objet à angle droit l'une de l'autre. Quelle est la norme de la force résultante, en newtons ?`)),
      answer: h, category: 'AP',
      wrong: wr(h, [[a + b, t('Forces at right angles do not simply add. The resultant is the hypotenuse of a right triangle.', 'Des forces à angle droit ne s\'additionnent pas simplement. La résultante est l\'hypoténuse d\'un triangle rectangle.'), 0], [h * h, t('Take the square root at the end.', 'Prends la racine carrée à la fin.'), 0], [Math.abs(a - b), t('Use the Pythagorean theorem, not a difference.', 'Utilise le théorème de Pythagore, pas une différence.'), 0]]),
      steps: [bi((f) => f.t(`The forces and the resultant form a right triangle: ${f.m(`R = \\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}}`)}.`, `Les forces et la résultante forment un triangle rectangle : ${f.m(`R = \\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}}`)}.`)), bi((f) => f.t(`${f.m(`R = \\sqrt{${f.n(a * a + b * b)}}`)} = ${f.N(h)} N.`, `${f.m(`R = \\sqrt{${f.n(a * a + b * b)}}`)} = ${f.N(h)} N.`))],
      nudge: t('Draw the two forces as the legs of a right triangle and find the hypotenuse.', 'Dessine les deux forces comme les côtés d\'un triangle rectangle et trouve l\'hypoténuse.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A plane flies due north at an air speed of ${f.N(a)} km/h. A wind blows from the west at ${f.N(b)} km/h. What is the speed of the plane over the ground, in km/h?`, `Un avion vole plein nord à une vitesse air de ${f.N(a)} km/h. Un vent souffle de l'ouest à ${f.N(b)} km/h. Quelle est la vitesse de l'avion par rapport au sol, en km/h ?`)),
      answer: h, category: 'AP',
      wrong: wr(h, [[a + b, t('The wind is at right angles to the plane\'s heading, so the speeds do not just add.', 'Le vent est perpendiculaire au cap de l\'avion : les vitesses ne s\'additionnent pas simplement.'), 0], [a, t('The wind changes the ground speed. Add it as a vector.', 'Le vent change la vitesse au sol. Ajoute-le comme un vecteur.'), 0], [h * h, t('Take the square root at the end.', 'Prends la racine carrée à la fin.'), 0]]),
      steps: [bi((f) => f.t(`North and west are at right angles, so the ground speed is ${f.m(`\\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}}`)}.`, `Le nord et l\'ouest sont à angle droit : la vitesse au sol est ${f.m(`\\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}}`)}.`)), bi((f) => f.t(`${f.m(`\\sqrt{${f.n(a * a + b * b)}}`)} = ${f.N(h)} km/h.`, `${f.m(`\\sqrt{${f.n(a * a + b * b)}}`)} = ${f.N(h)} km/h.`))],
      nudge: t('The plane\'s velocity and the wind are at right angles: add them as legs of a right triangle.', 'La vitesse de l\'avion et le vent sont à angle droit : additionne-les comme les côtés d\'un triangle rectangle.'),
    };
  }
  const x1 = randInt(r, 1, a - 1), y1 = randInt(r, 1, b - 1), x2 = a - x1, y2 = b - y1;
  return {
    prompt: bi((f) => f.t(`Two forces are ${f.m(`\\vec{F_1} = (${f.n(x1)}, ${f.n(y1)})`)} N and ${f.m(`\\vec{F_2} = (${f.n(x2)}, ${f.n(y2)})`)} N. What is the magnitude of the resultant ${f.m('\\vec{F_1} + \\vec{F_2}')}, in newtons?`, `Deux forces sont ${f.m(`\\vec{F_1} = (${f.n(x1)}, ${f.n(y1)})`)} N et ${f.m(`\\vec{F_2} = (${f.n(x2)}, ${f.n(y2)})`)} N. Quelle est la norme de la résultante ${f.m('\\vec{F_1} + \\vec{F_2}')}, en newtons ?`)),
    answer: h, category: 'TH',
    wrong: wr(h, [[r6(Math.sqrt(x1 * x1 + y1 * y1) + Math.sqrt(x2 * x2 + y2 * y2)), t('Add the vectors by components first. The magnitudes do not add.', 'Additionne d\'abord les vecteurs par composantes. Les normes ne s\'additionnent pas.'), 0], [a + b, t('Find the magnitude of the resultant vector: square the components, add, and take the square root.', 'Trouve la norme du vecteur résultant : élève les composantes au carré, additionne et prends la racine carrée.'), 1], [h * h, t('Take the square root at the end.', 'Prends la racine carrée à la fin.'), 1]]),
    steps: [bi((f) => f.t(`Add the components: ${f.m(`(${f.n(x1)} + ${f.n(x2)},\\ ${f.n(y1)} + ${f.n(y2)})`)} = ${f.m(`(${f.n(a)},\\ ${f.n(b)})`)}.`, `Additionne les composantes : ${f.m(`(${f.n(x1)} + ${f.n(x2)},\\ ${f.n(y1)} + ${f.n(y2)})`)} = ${f.m(`(${f.n(a)},\\ ${f.n(b)})`)}.`)), bi((f) => f.t(`Magnitude: ${f.m(`\\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}}`)} = ${f.N(h)} N.`, `Norme : ${f.m(`\\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}}`)} = ${f.N(h)} N.`))],
    nudge: t('Add the x-components and the y-components, then find the length of the result.', 'Additionne les composantes en x et en y, puis trouve la longueur du résultat.'),
  };
});

/** MCT4C.D3: circle properties (inscribed angles, chords, tangents) */
export const circle11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const inscribed = randInt(r, 15, 80), central = 2 * inscribed, fromCentral = r() < 0.5;
    const ans = fromCentral ? inscribed : central;
    return {
      prompt: bi((f) => (fromCentral
        ? f.t(`A central angle of ${deg(f, central)} and an inscribed angle stand on the same arc. What is the inscribed angle, in degrees?`, `Un angle au centre de ${deg(f, central)} et un angle inscrit interceptent le même arc. Quel est l'angle inscrit, en degrés ?`)
        : f.t(`An inscribed angle of ${deg(f, inscribed)} and a central angle stand on the same arc. What is the central angle, in degrees?`, `Un angle inscrit de ${deg(f, inscribed)} et un angle au centre interceptent le même arc. Quel est l'angle au centre, en degrés ?`))),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[fromCentral ? central : inscribed, t('The central angle and the inscribed angle on the same arc are not equal. The central angle is twice the inscribed angle.', 'L\'angle au centre et l\'angle inscrit sur le même arc ne sont pas égaux. L\'angle au centre est le double de l\'angle inscrit.'), 0], [fromCentral ? central * 2 : inscribed / 2, t('The central angle is twice the inscribed angle, so go the other way: halve to get the inscribed angle, double to get the central angle.', 'L\'angle au centre est le double de l\'angle inscrit : divise par 2 pour l\'angle inscrit, multiplie par 2 pour l\'angle au centre.'), 0], [180 - ans, t('There is no 180° rule here. Use the central angle = 2 × the inscribed angle.', 'Il n\'y a pas de règle du 180° ici. Utilise : angle au centre = 2 × angle inscrit.'), 0]]),
      steps: [t('The central angle is twice the inscribed angle on the same arc.', 'L\'angle au centre est le double de l\'angle inscrit sur le même arc.'), bi((f) => f.t(`The answer is ${deg(f, ans)}.`, `La réponse est ${deg(f, ans)}.`))],
      nudge: t('Central angle = 2 × inscribed angle on the same arc.', 'Angle au centre = 2 × angle inscrit sur le même arc.'),
    };
  }
  const [a, b, c] = pick(r, TRIPLES.slice(0, 6));
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A circle has a radius of ${f.N(c)} cm. A chord is ${f.N(a)} cm from the centre. What is the length of the chord, in cm?`, `Un cercle a un rayon de ${f.N(c)} cm. Une corde est à ${f.N(a)} cm du centre. Quelle est la longueur de la corde, en cm ?`)),
      answer: 2 * b, category: 'AP',
      wrong: wr(2 * b, [[b, t('That is half the chord. The perpendicular from the centre cuts the chord in two equal parts, so double it.', 'C\'est la moitié de la corde. La perpendiculaire du centre coupe la corde en deux parties égales : double-la.'), 1], [2 * c, t('That is the diameter, the longest chord. This chord is not through the centre.', 'C\'est le diamètre, la plus longue corde. Cette corde ne passe pas par le centre.'), 0], [2 * a, t('Use the right triangle with the radius as the hypotenuse to find half the chord.', 'Utilise le triangle rectangle dont le rayon est l\'hypoténuse pour trouver la moitié de la corde.'), 0]]),
      steps: [bi((f) => f.t(`The perpendicular from the centre bisects the chord. Half the chord is ${f.m(`\\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`, `La perpendiculaire du centre coupe la corde en deux. La moitié de la corde est ${f.m(`\\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`)), bi((f) => f.t(`The chord is ${f.m(`2 \\times ${f.n(b)}`)} = ${f.N(2 * b)} cm.`, `La corde mesure ${f.m(`2 \\times ${f.n(b)}`)} = ${f.N(2 * b)} cm.`))],
      nudge: t('Draw the radius to an end of the chord to make a right triangle, find half the chord, then double.', 'Trace le rayon jusqu\'à une extrémité de la corde pour former un triangle rectangle, trouve la moitié de la corde, puis double.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`A point is ${f.N(c)} cm from the centre of a circle of radius ${f.N(a)} cm. A tangent is drawn from the point to the circle. How long is the tangent, from the point to where it touches the circle, in cm?`, `Un point est à ${f.N(c)} cm du centre d'un cercle de rayon ${f.N(a)} cm. Une tangente est tracée du point au cercle. Quelle est la longueur de la tangente, du point jusqu'au point de tangence, en cm ?`)),
    answer: b, category: 'AP',
    wrong: wr(b, [[c - a, t('A tangent is not along the line to the centre. It meets the radius at a right angle: use the Pythagorean theorem.', 'La tangente n\'est pas sur la droite vers le centre. Elle rencontre le rayon à angle droit : utilise le théorème de Pythagore.'), 0], [r6(Math.sqrt(c * c + a * a)), t('The distance to the centre is the hypotenuse, not a leg.', 'La distance au centre est l\'hypoténuse, pas un côté.'), 0], [c + a, t('Use the right triangle formed by the radius, the tangent and the line to the centre.', 'Utilise le triangle rectangle formé par le rayon, la tangente et la droite vers le centre.'), 0]]),
    steps: [bi((f) => f.t(`A tangent is perpendicular to the radius, so the radius, the tangent and the line to the centre form a right triangle with hypotenuse ${f.N(c)} cm.`, `Une tangente est perpendiculaire au rayon : le rayon, la tangente et la droite vers le centre forment un triangle rectangle d'hypoténuse ${f.N(c)} cm.`)), bi((f) => f.t(`${f.m(`\\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`, `${f.m(`\\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`))],
    nudge: t('The tangent meets the radius at 90°. Use the Pythagorean theorem.', 'La tangente rencontre le rayon à 90°. Utilise le théorème de Pythagore.'),
  };
});

/** MCT4C.D3: arc length, sector area and the perimeter of a sector */
export const arc11 = (id: string): Generator => numGen(id, (tier, r) => {
  const radius = randInt(r, 6, 15), theta = pick(r, [60, 90, 120, 150, 180, 240, 270]), frac = theta / 360;
  const arc = round1(2 * Math.PI * radius * frac), area = round1(Math.PI * radius * radius * frac), perim = round1(2 * radius + 2 * Math.PI * radius * frac);
  const note = (f: F): string => f.t('Use the calculator value of π and round to one decimal place.', 'Utilise la valeur de π de la calculatrice et arrondis à une décimale.');
  const opts = { absTolerance: 0.051 };
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A sector has a radius of ${f.N(radius)} cm and a central angle of ${deg(f, theta)}. What is the length of its arc, in cm? ${note(f)}`, `Un secteur a un rayon de ${f.N(radius)} cm et un angle au centre de ${deg(f, theta)}. Quelle est la longueur de son arc, en cm ? ${note(f)}`)),
      answer: arc, category: 'AP', ...opts,
      wrong: wr(arc, [[area, t('That is the formula for the area. The arc length uses 2πr, not πr².', 'C\'est la formule de l\'aire. La longueur de l\'arc utilise 2πr, pas πr².'), 1], [round1(2 * Math.PI * radius), t('That is the whole circumference. The arc is only a fraction of it.', 'C\'est toute la circonférence. L\'arc n\'en est qu\'une fraction.'), 1], [round1(Math.PI * radius * frac), t('Use the circumference 2πr (with the 2, or the diameter), then take the fraction.', 'Utilise la circonférence 2πr (avec le 2, ou le diamètre), puis prends la fraction.'), 1]]),
      steps: [bi((f) => f.t(`The arc is the fraction ${f.m(`\\frac{${f.n(theta)}}{360}`)} of the circumference: ${f.m(`\\frac{${f.n(theta)}}{360} \\times 2\\pi \\times ${f.n(radius)}`)}.`, `L'arc est la fraction ${f.m(`\\frac{${f.n(theta)}}{360}`)} de la circonférence : ${f.m(`\\frac{${f.n(theta)}}{360} \\times 2\\pi \\times ${f.n(radius)}`)}.`)), bi((f) => f.t(`The arc is about ${f.N(arc)} cm.`, `L'arc mesure environ ${f.N(arc)} cm.`))],
      nudge: t('Find the fraction of the circle, then take that fraction of 2πr.', 'Trouve la fraction du cercle, puis prends cette fraction de 2πr.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A sector has a radius of ${f.N(radius)} cm and a central angle of ${deg(f, theta)}. What is its area, in cm²? ${note(f)}`, `Un secteur a un rayon de ${f.N(radius)} cm et un angle au centre de ${deg(f, theta)}. Quelle est son aire, en cm² ? ${note(f)}`)),
      answer: area, category: 'AP', ...opts,
      wrong: wr(area, [[arc, t('That is the arc length. The area uses πr², not 2πr.', 'C\'est la longueur de l\'arc. L\'aire utilise πr², pas 2πr.'), 1], [round1(Math.PI * radius * radius), t('That is the whole circle. The sector is only a fraction of it.', 'C\'est tout le cercle. Le secteur n\'en est qu\'une fraction.'), 1], [round1(Math.PI * radius * frac), t('Square the radius: the area is πr² times the fraction.', 'Élève le rayon au carré : l\'aire est πr² fois la fraction.'), 1]]),
      steps: [bi((f) => f.t(`The sector is the fraction ${f.m(`\\frac{${f.n(theta)}}{360}`)} of the circle: ${f.m(`\\frac{${f.n(theta)}}{360} \\times \\pi \\times ${f.n(radius)}^{2}`)}.`, `Le secteur est la fraction ${f.m(`\\frac{${f.n(theta)}}{360}`)} du cercle : ${f.m(`\\frac{${f.n(theta)}}{360} \\times \\pi \\times ${f.n(radius)}^{2}`)}.`)), bi((f) => f.t(`The area is about ${f.N(area)} cm².`, `L'aire est d'environ ${f.N(area)} cm².`))],
      nudge: t('Find the fraction of the circle, then take that fraction of πr².', 'Trouve la fraction du cercle, puis prends cette fraction de πr².'),
    };
  }
  return {
    prompt: bi((f) => f.t(`A sector has a radius of ${f.N(radius)} cm and a central angle of ${deg(f, theta)}. What is its perimeter, including the two straight edges, in cm? ${note(f)}`, `Un secteur a un rayon de ${f.N(radius)} cm et un angle au centre de ${deg(f, theta)}. Quel est son périmètre, en incluant les deux côtés droits, en cm ? ${note(f)}`)),
    answer: perim, category: 'TH', ...opts,
    wrong: wr(perim, [[arc, t('That is only the curved part. Add the two radii.', 'C\'est seulement la partie courbe. Ajoute les deux rayons.'), 1], [round1(arc + radius), t('There are two straight edges, each as long as the radius.', 'Il y a deux côtés droits, chacun de la longueur du rayon.'), 1], [round1(2 * Math.PI * radius + 2 * radius), t('Use only the fraction of the circumference that forms the arc.', 'Utilise seulement la fraction de la circonférence qui forme l\'arc.'), 0]]),
    steps: [bi((f) => f.t(`Arc: ${f.m(`\\frac{${f.n(theta)}}{360} \\times 2\\pi \\times ${f.n(radius)}`)} = ${f.N(arc)} cm. The two straight edges are ${f.m(`2 \\times ${f.n(radius)}`)} = ${f.N(2 * radius)} cm.`, `Arc : ${f.m(`\\frac{${f.n(theta)}}{360} \\times 2\\pi \\times ${f.n(radius)}`)} = ${f.N(arc)} cm. Les deux côtés droits mesurent ${f.m(`2 \\times ${f.n(radius)}`)} = ${f.N(2 * radius)} cm.`)), bi((f) => f.t(`The perimeter is about ${f.N(perim)} cm.`, `Le périmètre est d'environ ${f.N(perim)} cm.`))],
    nudge: t('Add the arc length and the two radii.', 'Additionne la longueur de l\'arc et les deux rayons.'),
  };
});
