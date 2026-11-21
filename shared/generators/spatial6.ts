// Grade 6 Spatial Sense strand (E): combinations of translations, reflections and rotations (up to 360 degrees).
import { pick, randInt } from '../rng.js';
import { bi, keepWrong as wr, numGen } from './dsl.js';
import { t } from './kit.js';

type Pt = [number, number];
type Move = { kind: 'translate'; a: number; b: number } | { kind: 'reflect'; axis: 'x' | 'y' } | { kind: 'rotate'; deg: 90 | 180 | 270 | 360 };

const apply = (p: Pt, m: Move): Pt => {
  if (m.kind === 'translate') return [p[0] + m.a, p[1] + m.b];
  if (m.kind === 'reflect') return m.axis === 'x' ? [p[0], -p[1]] : [-p[0], p[1]];
  if (m.deg === 90) return [-p[1], p[0]];
  if (m.deg === 180) return [-p[0], -p[1]];
  if (m.deg === 270) return [p[1], -p[0]];
  return [p[0], p[1]];
};

const describe = (m: Move, lang: 'en' | 'fr'): string => {
  if (m.kind === 'translate') {
    const dx = m.a >= 0 ? (lang === 'en' ? 'right' : 'à droite') : (lang === 'en' ? 'left' : 'à gauche');
    const dy = m.b >= 0 ? (lang === 'en' ? 'up' : 'vers le haut') : (lang === 'en' ? 'down' : 'vers le bas');
    return lang === 'en' ? `translated $${Math.abs(m.a)}$ units ${dx} and $${Math.abs(m.b)}$ units ${dy}` : `translaté de $${Math.abs(m.a)}$ unités ${dx} et de $${Math.abs(m.b)}$ unités ${dy}`;
  }
  if (m.kind === 'reflect') return lang === 'en' ? `reflected in the ${m.axis}-axis` : `réfléchi par rapport à l'axe des ${m.axis}`;
  return lang === 'en' ? `rotated ${m.deg}° counterclockwise about the origin` : `tourné de ${m.deg}° dans le sens antihoraire autour de l'origine`;
};

const randomMove = (r: () => number, kind: Move['kind']): Move => {
  if (kind === 'translate') return { kind, a: randInt(r, 1, 6) * (r() < 0.5 ? -1 : 1), b: randInt(r, 1, 6) * (r() < 0.5 ? -1 : 1) };
  if (kind === 'reflect') return { kind, axis: r() < 0.5 ? 'x' : 'y' };
  return { kind, deg: pick(r, [90, 180, 270, 360] as const) };
};

/** MS.G6.E1.4.a: combinations of translations, reflections and rotations */
export const combined6 = numGen('MS.G6.E1.4.a', (tier, r) => {
  const p: Pt = [randInt(r, -8, 8), randInt(r, -8, 8)];
  let chain: Move['kind'][] = tier === 1 ? ['translate', 'reflect'] : tier === 2 ? ['reflect', 'rotate'] : ['translate', 'reflect', 'rotate'];
  if (tier === 2 && r() < 0.5) chain = ['rotate', 'reflect'];
  if (tier === 1 && r() < 0.5) chain = ['reflect', 'translate'];
  const moves = chain.map((k) => randomMove(r, k));
  const stages: Pt[] = [p];
  for (const m of moves) stages.push(apply(stages[stages.length - 1]!, m));
  const final = stages[stages.length - 1]!, before = stages[stages.length - 2]!;
  const askX = r() < 0.5;
  const idx = askX ? 0 : 1, other = askX ? 1 : 0;
  const axis = askX ? 'x' : 'y';
  const seq = (lang: 'en' | 'fr'): string => moves.map((m, i) => `${i === 0 ? '' : (lang === 'en' ? 'then ' : 'puis ')}${describe(m, lang)}`).join(', ');
  return {
    prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(p[0])},\\ ${f.n(p[1])})`)} is ${seq('en')}. What is the ${axis}-coordinate of the final image?`, `Le point ${f.m(`(${f.n(p[0])},\\ ${f.n(p[1])})`)} est ${seq('fr')}. Quelle est la coordonnée ${axis} de l'image finale ?`)),
    answer: final[idx]!, category: tier === 3 ? 'TH' : 'AP',
    wrong: wr(final[idx]!, [[final[other]!, t('It looks like the other coordinate was given. Check which coordinate the question asks for.', 'Il semble que l\'autre coordonnée a été donnée. Vérifie quelle coordonnée la question demande.'), 1], [before[idx]!, t('It looks like the last move was skipped. Do every move, in the order given.', 'Il semble que le dernier déplacement a été oublié. Fais chaque déplacement, dans l\'ordre donné.'), 1]]),
    steps: [bi((f) => f.t(`Do the moves one at a time, in order. After each move, the point is ${stages.slice(1).map((s) => f.m(`(${f.n(s[0])},\\ ${f.n(s[1])})`)).join(', then ')}.`, `Fais les déplacements un à la fois, dans l'ordre. Après chaque déplacement, le point est ${stages.slice(1).map((s) => f.m(`(${f.n(s[0])},\\ ${f.n(s[1])})`)).join(', puis ')}.`)), bi((f) => f.t(`The final image is ${f.m(`(${f.n(final[0])},\\ ${f.n(final[1])})`)}, so its ${axis}-coordinate is ${f.N(final[idx]!)}.`, `L'image finale est ${f.m(`(${f.n(final[0])},\\ ${f.n(final[1])})`)} : sa coordonnée ${axis} est ${f.N(final[idx]!)}.`))],
    nudge: t('Do the first move on its own, write the new point, then do the next move on that point.', 'Fais le premier déplacement seul, écris le nouveau point, puis fais le déplacement suivant sur ce point.'),
  };
});
