// Grade 10 (MFM2P C3): reading and interpreting graphs of a quadratic relation, such as the height of a ball over time.
// Each question shows a graph drawn from whole-number values (the curve is h = a·s² − a·(t − p)², so its top, its landing time
// and the times it passes a given height are all whole numbers), and asks for something that can be read from it.
import { pick, randInt } from '../rng.js';
import type { Generator, Text, Visual } from '../items/types.js';
import { bi, keepWrong as wr, numGen, type F } from './dsl.js';
import { t } from './kit.js';

interface Situation { thing: Text; event: Text }
const SITUATIONS: Situation[] = [
  { thing: t('a ball', 'une balle'), event: t('it was thrown', 'son lancer') },
  { thing: t('a jet of water', 'un jet d\'eau'), event: t('it left the nozzle', 'sa sortie de la buse') },
  { thing: t('a model rocket', 'une fusée miniature'), event: t('it was launched', 'son lancement') },
];
/** (a, p, s) with the curve h = a·s² − a·(t − p)²: peak a·s² at time p, starting above the ground (s > p), landing at p + s. */
const SHAPES: [number, number, number][] = [];
for (let a = 1; a <= 5; a++) for (let p = 1; p <= 4; p++) for (let s = p + 1; s <= p + 4; s++) if (a * s * s >= 12 && a * s * s <= 80) SHAPES.push([a, p, s]);

const heightAt = (a: number, p: number, s: number, x: number): number => a * s * s - a * (x - p) * (x - p);

/** The graph for one shape: time on the horizontal axis (0 to landing, plus one), height on the vertical axis, a point every tenth of a second. */
export function graphVisual(a: number, p: number, s: number): Visual {
  const T = p + s, peak = a * s * s;
  const ystep = [1, 2, 5, 10, 20].find((st) => peak / st <= 8)!;
  const ymax = (Math.floor(peak / ystep) + 1) * ystep;
  const pts: [number, number][] = [];
  for (let k = 0; k <= 10 * T; k++) pts.push([k / 10, Math.round(heightAt(a, p, s, k / 10) * 1e4) / 1e4]); // a point every tenth of a second, so it draws as a smooth curve
  return { type: 'graph', xmin: 0, xmax: T + 1, ymin: 0, ymax, xstep: 1, ystep, xlabel: 't (s)', ylabel: 'h (m)', pts };
}

const intro = (f: F, sit: Situation): string =>
  f.t(`The graph shows the height h, in metres, of ${sit.thing.en} t seconds after ${sit.event.en}.`, `Le graphique montre la hauteur h, en mètres, de ${sit.thing.fr} t secondes après ${sit.event.fr}.`);
const thingEn = (sit: Situation): string => sit.thing.en.replace(/^an? /, 'the ');
const thingFr = (sit: Situation): string => sit.thing.fr.replace(/^une /, 'la ').replace(/^un /, 'le ');

/** MFM2P.C3.1: the key points of the curve: the highest point, when it is reached, and the start */
export const graphFeatures10 = (id: string): Generator => numGen(id, (tier, r) => {
  const [a, p, s] = pick(r, SHAPES), sit = pick(r, SITUATIONS), T = p + s, peak = a * s * s, start = heightAt(a, p, s, 0);
  const visual = graphVisual(a, p, s);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`${intro(f, sit)} What is the greatest height reached, in metres?`, `${intro(f, sit)} Quelle est la plus grande hauteur atteinte, en mètres ?`)),
      visual, answer: peak, category: 'KU',
      wrong: wr(peak, [[p, t('That is the time when the highest point is reached (along the bottom). The height is read up the side.', 'C\'est le moment où le point le plus haut est atteint (le long du bas). La hauteur se lit sur le côté.'), 0], [start, t('That is the height at the start, where the curve meets the vertical axis. Find the highest point of the curve.', 'C\'est la hauteur au départ, là où la courbe rencontre l\'axe vertical. Trouve le point le plus haut de la courbe.'), 0], [T, t('That is the time at the end, when the height is zero. Read the height of the highest point.', 'C\'est le moment de la fin, quand la hauteur est zéro. Lis la hauteur du point le plus haut.'), 0]]),
      steps: [t('Find the highest point of the curve.', 'Trouve le point le plus haut de la courbe.'), bi((f) => f.t(`It is at a height of ${f.N(peak)} m, read on the vertical axis.`, `Il est à une hauteur de ${f.N(peak)} m, lue sur l'axe vertical.`))],
      nudge: t('Look for the top of the curve, then follow across to the vertical axis.', 'Cherche le sommet de la courbe, puis suis la ligne jusqu\'à l\'axe vertical.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`${intro(f, sit)} After how many seconds is the greatest height reached?`, `${intro(f, sit)} Après combien de secondes la plus grande hauteur est-elle atteinte ?`)),
      visual, answer: p, category: 'KU',
      wrong: wr(p, [[peak, t('That is the greatest height. The time is read along the bottom axis, straight below the highest point.', 'C\'est la plus grande hauteur. Le temps se lit sur l\'axe du bas, juste sous le point le plus haut.'), 0], [T / 2, t('That is halfway through the flight. The object started above the ground, so it takes less time to rise than to fall: read the time at the top.', 'C\'est le milieu du vol. L\'objet est parti au-dessus du sol : il met moins de temps à monter qu\'à descendre. Lis le moment du sommet.'), 0], [T, t('That is when it comes back down to height 0. The highest point is earlier.', 'C\'est quand il revient à la hauteur 0. Le point le plus haut est plus tôt.'), 0]]),
      steps: [t('Find the highest point, then look straight down to the time axis.', 'Trouve le point le plus haut, puis regarde droit vers le bas jusqu\'à l\'axe du temps.'), bi((f) => f.t(`The top is at t = ${f.N(p)} seconds.`, `Le sommet est à t = ${f.N(p)} secondes.`))],
      nudge: t('Find the top of the curve, then read straight down to the time axis.', 'Trouve le sommet de la courbe, puis lis droit vers le bas jusqu\'à l\'axe du temps.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`${intro(f, sit)} What was the height at the start (when t = 0), in metres?`, `${intro(f, sit)} Quelle était la hauteur au départ (quand t = 0), en mètres ?`)),
    visual, answer: start, category: 'AP',
    wrong: wr(start, [[0, t('The curve does not start on the ground. Read the height where it meets the vertical axis.', 'La courbe ne part pas du sol. Lis la hauteur là où elle rencontre l\'axe vertical.'), 0], [peak, t('That is the greatest height, not the starting height.', 'C\'est la plus grande hauteur, pas la hauteur de départ.'), 0], [p, t('That is the time of the highest point. The starting height is read on the vertical axis at t = 0.', 'C\'est le moment du point le plus haut. La hauteur de départ se lit sur l\'axe vertical à t = 0.'), 0]]),
    steps: [t('At the start, t = 0, which is the vertical axis.', 'Au départ, t = 0, c\'est-à-dire l\'axe vertical.'), bi((f) => f.t(`The curve meets it at h = ${f.N(start)} m.`, `La courbe le rencontre à h = ${f.N(start)} m.`))],
    nudge: t('The start is where t = 0: the curve meets the vertical axis there.', 'Le départ est là où t = 0 : la courbe rencontre l\'axe vertical à cet endroit.'),
  };
});

/** MFM2P.C3.2: reading values and intervals from the graph: the height at a time, the landing time, how long above a height */
export const graphValues10 = (id: string): Generator => numGen(id, (tier, r) => {
  const [a, p, s] = pick(r, SHAPES), sit = pick(r, SITUATIONS), T = p + s, peak = a * s * s;
  const visual = graphVisual(a, p, s);
  if (tier === 1) {
    let k = randInt(r, 1, T - 1);
    if (k === p) k = k < T - 1 ? k + 1 : k - 1;
    const hk = heightAt(a, p, s, k);
    return {
      prompt: bi((f) => f.t(`${intro(f, sit)} What is the height after ${f.N(k)} second${k === 1 ? '' : 's'}, in metres?`, `${intro(f, sit)} Quelle est la hauteur après ${f.N(k)} seconde${k === 1 ? '' : 's'}, en mètres ?`)),
      visual, answer: hk, category: 'AP',
      wrong: wr(hk, [[k, t('That is the time you were given. Go up from it to the curve, then across to read the height.', 'C\'est le temps donné. Monte jusqu\'à la courbe, puis lis la hauteur sur l\'axe vertical.'), 0], [peak, t('That is the greatest height. Read the height of the curve at the time asked.', 'C\'est la plus grande hauteur. Lis la hauteur de la courbe au moment demandé.'), 0], [heightAt(a, p, s, k + 1 <= T ? k + 1 : k - 1), t('Check the time you read: it is the next grid line along that matters, not the one beside it.', 'Vérifie le temps que tu as lu : c\'est la bonne ligne de la grille qui compte, pas la voisine.'), 0]]),
      steps: [bi((f) => f.t(`Find t = ${f.N(k)} on the bottom axis and go straight up to the curve.`, `Trouve t = ${f.N(k)} sur l'axe du bas et monte droit jusqu'à la courbe.`)), bi((f) => f.t(`Read across to the vertical axis: h = ${f.N(hk)} m.`, `Lis vers l'axe vertical : h = ${f.N(hk)} m.`))],
      nudge: t('Go up from the time to the curve, then across to the height.', 'Monte du temps jusqu\'à la courbe, puis lis la hauteur.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`${intro(f, sit)} After how many seconds does ${thingEn(sit)} reach the ground?`, `${intro(f, sit)} Après combien de secondes ${thingFr(sit)} touche-t-elle le sol ?`).replace('touche-t-elle', sit.thing.fr.startsWith('un ') ? 'touche-t-il' : 'touche-t-elle')),
      visual, answer: T, category: 'KU',
      wrong: wr(T, [[p, t('That is when the highest point is reached. It reaches the ground later, where the curve meets the time axis.', 'C\'est quand le point le plus haut est atteint. Le sol est touché plus tard, là où la courbe rencontre l\'axe du temps.'), 0], [peak, t('That is the greatest height. The time of landing is where the curve meets the time axis (h = 0).', 'C\'est la plus grande hauteur. Le moment de l\'atterrissage est là où la courbe rencontre l\'axe du temps (h = 0).'), 0], [T + 1, t('The axis goes one second past the landing. The curve ends where it touches the time axis.', 'L\'axe va une seconde après l\'atterrissage. La courbe se termine là où elle touche l\'axe du temps.'), 0]]),
      steps: [t('It reaches the ground when the height is 0, where the curve meets the time axis.', 'Il touche le sol quand la hauteur est 0, là où la courbe rencontre l\'axe du temps.'), bi((f) => f.t(`That happens at t = ${f.N(T)} seconds.`, `Cela arrive à t = ${f.N(T)} secondes.`))],
      nudge: t('Find where the curve comes back down to the time axis.', 'Trouve où la courbe revient à l\'axe du temps.'),
    };
  }
  const m = randInt(r, 1, p), H = peak - a * m * m, span = 2 * m;
  return {
    prompt: bi((f) => f.t(`${intro(f, sit)} For how many seconds is the height at least ${f.N(H)} m?`, `${intro(f, sit)} Pendant combien de secondes la hauteur est-elle d'au moins ${f.N(H)} m ?`)),
    visual, answer: span, category: 'TH',
    wrong: wr(span, [[T, t('That is the whole flight. Find the two times when the curve is at the given height; the answer is the time between them.', 'C\'est tout le vol. Trouve les deux moments où la courbe est à la hauteur donnée ; la réponse est le temps entre eux.'), 0], [p + m, t('That is the later of the two times. Subtract the earlier time to get how long it lasts.', 'C\'est le plus tard des deux moments. Soustrais le plus tôt pour obtenir la durée.'), 1], [m, t('That is how far each time is from the top. The two times are on either side of it, so double it.', 'C\'est l\'écart de chaque moment au sommet. Les deux moments sont de part et d\'autre : double-le.'), 1]]),
    steps: [bi((f) => f.t(`Draw across at h = ${f.N(H)}. The curve is at that height at t = ${f.N(p - m)} and t = ${f.N(p + m)}.`, `Trace une ligne à h = ${f.N(H)}. La courbe est à cette hauteur à t = ${f.N(p - m)} et à t = ${f.N(p + m)}.`)), bi((f) => f.t(`It is at least that high between them: ${f.m(`${f.n(p + m)} - ${f.n(p - m)}`)} = ${f.N(span)} seconds.`, `Elle est au moins à cette hauteur entre les deux : ${f.m(`${f.n(p + m)} - ${f.n(p - m)}`)} = ${f.N(span)} secondes.`))],
    nudge: t('Find the two times where the curve crosses that height. The answer is the time between them.', 'Trouve les deux moments où la courbe croise cette hauteur. La réponse est le temps entre eux.'),
  };
});
