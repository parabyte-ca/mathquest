// Grade 8 Number strand (B): scientific notation, real numbers, square roots, percents beyond 0 to 100, order of operations
// with rational numbers, powers of ten, integers, fractions and proportional situations.
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, numGen, r6, type F } from './dsl.js';
import { build, frac, gcd, lcm, t } from './kit.js';

type Wrong = [number, Text, number?][];
const sg = (f: F, x: number): string => (x < 0 ? `(${f.n(x)})` : f.n(x));

/** MS.G8.B1.1.a: very large and very small numbers; scientific notation */
export const scientific8 = numGen('MS.G8.B1.1.a', (tier, r) => {
  const a = randInt(r, 11, 99) / 10;
  if (tier === 1) {
    const n = randInt(r, 4, 9);
    const N = Math.round(a * 10 ** (n - 1)) * 10; // a × 10^n, a whole number
    return {
      prompt: bi((f) => f.t(`Write ${f.N(N)} in scientific notation, ${f.m('a \\times 10^{n}')} with 1 ≤ a < 10. What is n?`, `Écris ${f.N(N)} en notation scientifique, ${f.m('a \\times 10^{n}')} avec 1 ≤ a < 10. Quelle est la valeur de n ?`)),
      answer: n,
      wrong: [[n + 1, t('It looks like all the digits were counted. Count the places the decimal point moves to sit after the first digit.', 'Il semble que tous les chiffres ont été comptés. Compte les positions dont la virgule se déplace pour se placer après le premier chiffre.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Put the decimal point after the first digit: ${f.N(a)}.`, `Place la virgule après le premier chiffre : ${f.N(a)}.`)), bi((f) => f.t(`The point moved ${f.N(n)} places, so ${f.N(N)} = ${f.m(`${f.n(a)} \\times 10^{${f.n(n)}}`)} and n = ${f.N(n)}.`, `La virgule s\'est déplacée de ${f.N(n)} positions, donc ${f.N(N)} = ${f.m(`${f.n(a)} \\times 10^{${f.n(n)}}`)} et n = ${f.N(n)}.`))],
      nudge: t('Count how many places the decimal point moves to sit after the first digit.', 'Compte de combien de positions la virgule se déplace pour se placer après le premier chiffre.'),
    };
  }
  if (tier === 2) {
    const n = randInt(r, 3, 6);
    return {
      prompt: bi((f) => f.t(`Write ${f.m(`${f.n(a)} \\times 10^{${f.n(n)}}`)} as a standard number.`, `Écris ${f.m(`${f.n(a)} \\times 10^{${f.n(n)}}`)} sous forme de nombre ordinaire.`)),
      answer: r6(a * 10 ** n),
      wrong: [[r6(a * 10 ** (n + 1)), t('It looks like the decimal point moved one place too far. Move it exactly as many places as the exponent says.', 'Il semble que la virgule s\'est déplacée d\'une position de trop. Déplace-la d\'exactement autant de positions que l\'indique l\'exposant.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The exponent is ${f.N(n)}, so move the decimal point ${f.N(n)} places to the right.`, `L\'exposant est ${f.N(n)} : déplace la virgule de ${f.N(n)} positions vers la droite.`)), bi((f) => f.t(`${f.m(`${f.n(a)} \\times 10^{${f.n(n)}}`)} = ${f.N(r6(a * 10 ** n))}.`, `${f.m(`${f.n(a)} \\times 10^{${f.n(n)}}`)} = ${f.N(r6(a * 10 ** n))}.`))],
      nudge: t('Move the decimal point to the right as many places as the exponent.', 'Déplace la virgule vers la droite d\'autant de positions que l\'exposant.'),
    };
  }
  const n = randInt(r, 2, 5);
  const N = r6(a * 10 ** -n);
  return {
    prompt: bi((f) => f.t(`Write ${f.N(N)} in scientific notation, ${f.m('a \\times 10^{n}')} with 1 ≤ a < 10. What is n?`, `Écris ${f.N(N)} en notation scientifique, ${f.m('a \\times 10^{n}')} avec 1 ≤ a < 10. Quelle est la valeur de n ?`)),
    answer: -n,
    wrong: [[n, t('It looks like the sign was dropped. A number smaller than 1 has a negative exponent.', 'Il semble que le signe a été oublié. Un nombre plus petit que 1 a un exposant négatif.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Move the decimal point to sit after the first non-zero digit: ${f.N(a)}. It moved ${f.N(n)} places to the right.`, `Place la virgule après le premier chiffre non nul : ${f.N(a)}. Elle s\'est déplacée de ${f.N(n)} positions vers la droite.`)), bi((f) => f.t(`Moving right for a small number means a negative exponent: n = ${f.N(-n)}.`, `Pour un petit nombre, un déplacement vers la droite signifie un exposant négatif : n = ${f.N(-n)}.`))],
    nudge: t('Is the number bigger or smaller than 1? That tells you the sign of the exponent.', 'Le nombre est-il plus grand ou plus petit que 1 ? Cela indique le signe de l\'exposant.'),
  };
});

const RATIONAL = ['\\frac{3}{7}', '-5', '0.25', '\\sqrt{16}', '\\sqrt{81}', '1.5', '\\frac{-2}{9}', '\\sqrt{49}', '-0.8', '\\sqrt{4}', '12'];
const IRRATIONAL = ['\\sqrt{2}', '\\sqrt{20}', '\\pi', '\\sqrt{7}', '\\sqrt{50}', '\\sqrt{3}', '\\sqrt{11}', '\\sqrt{45}'];

/** MS.G8.B1.2.a: real numbers, rational and irrational */
export const realNumbers8 = numGen('MS.G8.B1.2.a', (tier, r) => {
  const size = tier === 1 ? 4 : tier === 2 ? 6 : 7;
  const irr = randInt(r, 1, tier === 1 ? 2 : 3);
  const pickSome = (pool: string[], k: number): string[] => { const p = [...pool]; const out: string[] = []; for (let i = 0; i < k; i++) out.push(p.splice(randInt(r, 0, p.length - 1), 1)[0]!); return out; };
  const items = pickSome(IRRATIONAL, irr).concat(pickSome(RATIONAL, size - irr));
  for (let i = items.length - 1; i > 0; i--) { const j = randInt(r, 0, i); [items[i], items[j]] = [items[j]!, items[i]!]; }
  return {
    prompt: bi((f) => f.t(`How many of these numbers are irrational? ${f.m(items.join(',\\ '))}`, `Combien de ces nombres sont irrationnels ? ${f.m(items.join(',\\ '))}`)),
    answer: irr, category: tier === 3 ? 'TH' : 'KU',
    wrong: [[irr + 1, t('It looks like a root of a perfect square was counted as irrational. A root like the square root of 16 is 4, a whole number, so it is rational.', 'Il semble qu\'une racine d\'un carré parfait a été comptée comme irrationnelle. Une racine comme la racine carrée de 16 vaut 4, un nombre entier : elle est rationnelle.'), 0], [Math.max(0, irr - 1), t('It looks like one irrational number was missed. Roots of numbers that are not perfect squares, and pi, are irrational.', 'Il semble qu\'un nombre irrationnel a été oublié. Les racines de nombres qui ne sont pas des carrés parfaits, et pi, sont irrationnelles.'), 0]] as Wrong,
    steps: [t('A rational number can be written as a fraction of integers: whole numbers, fractions, terminating decimals and roots of perfect squares. Irrational numbers cannot: pi and roots of numbers that are not perfect squares.', 'Un nombre rationnel peut s\'écrire comme une fraction d\'entiers : nombres entiers, fractions, nombres décimaux finis et racines de carrés parfaits. Un nombre irrationnel ne le peut pas : pi et les racines de nombres qui ne sont pas des carrés parfaits.'), bi((f) => f.t(`Going through the list, ${f.N(irr)} of them are irrational.`, `En passant la liste en revue, ${f.N(irr)} d\'entre eux sont irrationnels.`))],
    nudge: t('Check each root: is the number under it a perfect square?', 'Vérifie chaque racine : le nombre sous la racine est-il un carré parfait ?'),
  };
});

/** MS.G8.B1.3.a: estimate and calculate square roots */
export const roots8 = numGen('MS.G8.B1.3.a', (tier, r) => {
  if (tier === 1) {
    const k = randInt(r, 11, 25);
    return {
      prompt: bi((f) => f.t(`What is ${f.m(`\\sqrt{${f.n(k * k)}}`)}?`, `Combien vaut ${f.m(`\\sqrt{${f.n(k * k)}}`)} ?`)),
      answer: k,
      wrong: [[k * k / 2, t('It looks like the number was halved. The square root is the number that multiplies by itself to make it.', 'Il semble que le nombre a été divisé par deux. La racine carrée est le nombre qui, multiplié par lui-même, donne ce nombre.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Look for the number that times itself is ${f.N(k * k)}. Try numbers near ${f.N(Math.round(Math.sqrt(k * k)))}.`, `Cherche le nombre qui, multiplié par lui-même, donne ${f.N(k * k)}.`)), bi((f) => f.t(`${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}, so the root is ${f.N(k)}.`, `${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}, donc la racine est ${f.N(k)}.`))],
      nudge: t('Which number multiplied by itself gives this number?', 'Quel nombre multiplié par lui-même donne ce nombre ?'),
    };
  }
  if (tier === 2) {
    let n: number;
    do { const k = randInt(r, 5, 19); n = k * k + randInt(r, 1, 2 * k); } while (Math.abs((Math.sqrt(n) % 1) - 0.5) < 0.12);
    const near = Math.round(Math.sqrt(n));
    return {
      prompt: bi((f) => f.t(`Which whole number is ${f.m(`\\sqrt{${f.n(n)}}`)} closest to?`, `De quel nombre entier ${f.m(`\\sqrt{${f.n(n)}}`)} est-elle la plus proche ?`)),
      answer: near, category: 'AP',
      wrong: [[near + (Math.sqrt(n) > near ? 1 : -1), t('That is the whole number on the other side. Compare the number with the perfect squares just below and just above it.', 'C\'est le nombre entier de l\'autre côté. Compare le nombre aux carrés parfaits juste en dessous et juste au-dessus.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`${f.N(n)} is between the perfect squares ${f.N(Math.floor(Math.sqrt(n)) ** 2)} and ${f.N((Math.floor(Math.sqrt(n)) + 1) ** 2)}, so the root is between ${f.N(Math.floor(Math.sqrt(n)))} and ${f.N(Math.floor(Math.sqrt(n)) + 1)}.`, `${f.N(n)} est entre les carrés parfaits ${f.N(Math.floor(Math.sqrt(n)) ** 2)} et ${f.N((Math.floor(Math.sqrt(n)) + 1) ** 2)}, donc la racine est entre ${f.N(Math.floor(Math.sqrt(n)))} et ${f.N(Math.floor(Math.sqrt(n)) + 1)}.`)), bi((f) => f.t(`It is closer to ${f.N(near)}.`, `Elle est plus proche de ${f.N(near)}.`))],
      nudge: t('Find the two perfect squares that the number sits between.', 'Trouve les deux carrés parfaits entre lesquels se trouve le nombre.'),
    };
  }
  const d = randInt(r, 21, 99) / 10;
  const n = r6(d * d);
  return {
    prompt: bi((f) => f.t(`Calculate ${f.m(`\\sqrt{${f.n(n)}}`)}.`, `Calcule ${f.m(`\\sqrt{${f.n(n)}}`)}.`)),
    answer: d,
    wrong: [[r6(n / 2), t('It looks like the number was halved. Find the number that multiplies by itself to make it, and check with a calculator or by estimating.', 'Il semble que le nombre a été divisé par deux. Trouve le nombre qui, multiplié par lui-même, donne ce nombre, et vérifie avec une calculatrice ou en estimant.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Estimate: ${f.N(n)} is between ${f.N(Math.floor(d) ** 2)} and ${f.N((Math.floor(d) + 1) ** 2)}, so the root is between ${f.N(Math.floor(d))} and ${f.N(Math.floor(d) + 1)}.`, `Estime : ${f.N(n)} est entre ${f.N(Math.floor(d) ** 2)} et ${f.N((Math.floor(d) + 1) ** 2)}, donc la racine est entre ${f.N(Math.floor(d))} et ${f.N(Math.floor(d) + 1)}.`)), bi((f) => f.t(`Check ${f.N(d)} × ${f.N(d)} = ${f.N(n)}. The root is ${f.N(d)}.`, `Vérifie ${f.N(d)} × ${f.N(d)} = ${f.N(n)}. La racine est ${f.N(d)}.`))],
    nudge: t('Estimate between two whole numbers first, then find the decimal that squares to the number.', 'Estime d\'abord entre deux nombres entiers, puis trouve le nombre décimal dont le carré donne le nombre.'),
  };
});

/** MS.G8.B1.4.a: percents above 100% and below 1% */
export const percents8 = numGen('MS.G8.B1.4.a', (tier, r) => {
  if (tier === 1) {
    const p = pick(r, [120, 150, 175, 200, 250, 300]);
    const N = randInt(r, 2, 40) * 20;
    return {
      prompt: bi((f) => f.t(`What is ${f.N(p)}% of ${f.N(N)}?`, `Combien vaut ${f.N(p)} % de ${f.N(N)} ?`)),
      answer: r6((N * p) / 100),
      wrong: [[r6((N * p) / 1000), t('It looks like the percent was divided by 1000. 100% is the whole amount, so 150% is more than the whole.', 'Il semble que le pourcentage a été divisé par 1000. 100 % est la quantité entière : 150 %, c\'est plus que le tout.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.N(p)}% = ${f.N(p / 100)} as a decimal.`, `${f.N(p)} % = ${f.N(p / 100)} en nombre décimal.`)), bi((f) => f.t(`${f.N(N)} × ${f.N(p / 100)} = ${f.N(r6((N * p) / 100))}.`, `${f.N(N)} × ${f.N(p / 100)} = ${f.N(r6((N * p) / 100))}.`))],
      nudge: t('Change the percent to a decimal, then multiply.', 'Transforme le pourcentage en nombre décimal, puis multiplie.'),
    };
  }
  if (tier === 2) {
    const p = pick(r, [0.5, 0.2, 0.25, 0.1, 0.4, 0.75]);
    const N = randInt(r, 1, 20) * 400;
    return {
      prompt: bi((f) => f.t(`What is ${f.N(p)}% of ${f.N(N)}?`, `Combien vaut ${f.N(p)} % de ${f.N(N)} ?`)),
      answer: r6((N * p) / 100),
      wrong: [[r6((N * p) / 10), t('It looks like 0.5% was treated as 5%. Half of one percent is much smaller: divide the percent by 100 to get the decimal 0.005.', 'Il semble que 0,5 % a été traité comme 5 %. La moitié de un pour cent est bien plus petite : divise le pourcentage par 100 pour obtenir le nombre décimal 0,005.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.N(p)}% = ${f.N(r6(p / 100))} as a decimal (divide by 100).`, `${f.N(p)} % = ${f.N(r6(p / 100))} en nombre décimal (divise par 100).`)), bi((f) => f.t(`${f.N(N)} × ${f.N(r6(p / 100))} = ${f.N(r6((N * p) / 100))}.`, `${f.N(N)} × ${f.N(r6(p / 100))} = ${f.N(r6((N * p) / 100))}.`))],
      nudge: t('Divide the percent by 100 to get a decimal, even when the percent is less than 1.', 'Divise le pourcentage par 100 pour obtenir un nombre décimal, même quand le pourcentage est inférieur à 1.'),
    };
  }
  const a = randInt(r, 2, 20) * 4;
  const m = pick(r, [2.5, 3, 4, 5, 7.5]);
  const b = r6(a * m);
  return {
    prompt: bi((f) => f.t(`A plant grew from ${f.N(a)} cm to ${f.N(b)} cm. The new height is what percent of the original height? Type the number only.`, `Une plante est passée de ${f.N(a)} cm à ${f.N(b)} cm. La nouvelle hauteur représente quel pourcentage de la hauteur de départ ? Écris seulement le nombre.`)),
    answer: r6(m * 100), category: 'AP',
    wrong: [[r6((m - 1) * 100), t('That is the percent increase. The question asks for the new height as a percent of the original, which includes the original 100%.', 'C\'est le pourcentage d\'augmentation. La question demande la nouvelle hauteur en pourcentage de la hauteur de départ, ce qui comprend les 100 % de départ.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Divide the new height by the original: ${f.N(b)} ÷ ${f.N(a)} = ${f.N(m)}.`, `Divise la nouvelle hauteur par celle de départ : ${f.N(b)} ÷ ${f.N(a)} = ${f.N(m)}.`)), bi((f) => f.t(`${f.N(m)} × 100 = ${f.N(r6(m * 100))}%.`, `${f.N(m)} × 100 = ${f.N(r6(m * 100))} %.`))],
    nudge: t('Divide the new amount by the original amount, then multiply by 100.', 'Divise le nouveau montant par le montant de départ, puis multiplie par 100.'),
  };
});

/** MS.G8.B2.1.a: order of operations with rational numbers */
export const orderOps8 = numGen('MS.G8.B2.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 11, 49) / 10, b = randInt(r, 11, 29) / 10, c = randInt(r, 2, 9), d = randInt(r, 1, 9) / 10;
    const ans = r6(a + b * c - d);
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} + ${f.n(b)} \\times ${f.n(c)} - ${f.n(d)}`)}`),
      answer: ans,
      wrong: [[r6((a + b) * c - d), t('It looks like the work went left to right. Multiplication comes before addition and subtraction.', 'Il semble que le calcul a été fait de gauche à droite. La multiplication se fait avant l\'addition et la soustraction.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Multiply first: ${f.N(b)} × ${f.N(c)} = ${f.N(r6(b * c))}.`, `Multiplie d\'abord : ${f.N(b)} × ${f.N(c)} = ${f.N(r6(b * c))}.`)), bi((f) => f.t(`${f.N(a)} + ${f.N(r6(b * c))} − ${f.N(d)} = ${f.N(ans)}.`, `${f.N(a)} + ${f.N(r6(b * c))} − ${f.N(d)} = ${f.N(ans)}.`))],
      nudge: t('Multiply before you add or subtract.', 'Multiplie avant d\'additionner ou de soustraire.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 2, 6), b = randInt(r, 2, 9), c = randInt(r, 2, 9);
    const ans = a * a + b * -c;
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`(${f.n(-a)})^2 + ${f.n(b)} \\times (${f.n(-c)})`)}`),
      answer: ans,
      wrong: [[-(a * a) + b * -c, t('It looks like the exponent only squared the number and the negative sign stayed outside. In brackets, the negative number is squared, so the result is positive.', 'Il semble que l\'exposant n\'a élevé au carré que le nombre, le signe négatif restant à l\'extérieur. Dans les parenthèses, le nombre négatif est élevé au carré : le résultat est positif.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Exponent first: ${f.m(`(${f.n(-a)})^2`)} = ${f.N(a * a)}. Then multiply: ${f.N(b)} × (${f.n(-c)}) = ${f.N(-b * c)}.`, `Exposant d\'abord : ${f.m(`(${f.n(-a)})^2`)} = ${f.N(a * a)}. Puis multiplie : ${f.N(b)} × (${f.n(-c)}) = ${f.N(-b * c)}.`)), bi((f) => f.t(`${f.N(a * a)} + (${f.n(-b * c)}) = ${f.N(ans)}.`, `${f.N(a * a)} + (${f.n(-b * c)}) = ${f.N(ans)}.`))],
      nudge: t('Brackets and exponents first, then multiply, then add.', 'Parenthèses et exposants d\'abord, puis multiplie, puis additionne.'),
    };
  }
  const n1 = pick(r, [1, 3]), n2 = pick(r, [1, 3, 5]), k = randInt(r, 2, 6) * 4, n3 = pick(r, [1, 3, 5, 7]);
  const ans = r6(n1 / 2 + (n2 / 4) * k - n3 / 4);
  return {
    prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${'\\frac{' + f.n(n1) + '}{2}'} + ${'\\frac{' + f.n(n2) + '}{4}'} \\times ${f.n(k)} - ${'\\frac{' + f.n(n3) + '}{4}'}`)}. ${f.t('Type a decimal.', 'Écris un nombre décimal.')}`),
    answer: ans,
    wrong: [[r6((n1 / 2 + n2 / 4) * k - n3 / 4), t('It looks like the addition was done before the multiplication. Multiply first.', 'Il semble que l\'addition a été faite avant la multiplication. Multiplie d\'abord.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Multiply first: ${f.m(`${'\\frac{' + f.n(n2) + '}{4}'} \\times ${f.n(k)}`)} = ${f.N((n2 / 4) * k)}.`, `Multiplie d\'abord : ${f.m(`${'\\frac{' + f.n(n2) + '}{4}'} \\times ${f.n(k)}`)} = ${f.N((n2 / 4) * k)}.`)), bi((f) => f.t(`Then ${f.N(n1 / 2)} + ${f.N((n2 / 4) * k)} − ${f.N(n3 / 4)} = ${f.N(ans)}.`, `Puis ${f.N(n1 / 2)} + ${f.N((n2 / 4) * k)} − ${f.N(n3 / 4)} = ${f.N(ans)}.`))],
    nudge: t('Change the fractions to decimals if that helps, and multiply before you add or subtract.', 'Transforme les fractions en nombres décimaux si cela t\'aide, et multiplie avant d\'additionner ou de soustraire.'),
  };
});

/** MS.G8.B2.2.a: recall common squares and square roots */
export const squaresRecall8 = numGen('MS.G8.B2.2.a', (tier, r) => {
  if (tier === 1) {
    const k = randInt(r, 11, 20);
    return {
      prompt: bi((f) => f.t(`What is ${f.m(`${f.n(k)}^2`)}?`, `Combien vaut ${f.m(`${f.n(k)}^2`)} ?`)),
      answer: k * k,
      wrong: [[2 * k, t('It looks like the number was doubled. Squaring means multiplying the number by itself.', 'Il semble que le nombre a été doublé. Mettre au carré, c\'est multiplier le nombre par lui-même.'), 0]] as Wrong,
      steps: [t('Squaring means multiplying the number by itself.', 'Mettre au carré, c\'est multiplier le nombre par lui-même.'), bi((f) => f.t(`${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}.`, `${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}.`))],
      nudge: t('Multiply the number by itself.', 'Multiplie le nombre par lui-même.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 13, 25);
    return {
      prompt: bi((f) => f.t(`What is ${f.m(`\\sqrt{${f.n(k * k)}}`)}?`, `Combien vaut ${f.m(`\\sqrt{${f.n(k * k)}}`)} ?`)),
      answer: k,
      wrong: [[k * k / 2, t('It looks like the number was halved. The square root is the number that multiplies by itself to make it.', 'Il semble que le nombre a été divisé par deux. La racine carrée est le nombre qui, multiplié par lui-même, donne ce nombre.'), 0]] as Wrong,
      steps: [t('Think of the perfect squares you know and find the one that matches.', 'Pense aux carrés parfaits que tu connais et trouve celui qui correspond.'), bi((f) => f.t(`${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}, so the root is ${f.N(k)}.`, `${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}, donc la racine est ${f.N(k)}.`))],
      nudge: t('Which number multiplied by itself gives this number?', 'Quel nombre multiplié par lui-même donne ce nombre ?'),
    };
  }
  const a = randInt(r, 11, 20), b = randInt(r, 11, 20);
  const plus = r() < 0.5;
  const ans = plus ? a * a + b : a * a - b;
  return {
    prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)}^2 ${plus ? '+' : '-'} \\sqrt{${f.n(b * b)}}`)}`),
    answer: ans,
    wrong: [[plus ? a * a + b * b : a * a - b * b, t('It looks like the number under the root was used instead of the root. Find the square root first.', 'Il semble que le nombre sous la racine a été utilisé au lieu de la racine. Trouve d\'abord la racine carrée.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`${f.m(`${f.n(a)}^2`)} = ${f.N(a * a)} and ${f.m(`\\sqrt{${f.n(b * b)}}`)} = ${f.N(b)}.`, `${f.m(`${f.n(a)}^2`)} = ${f.N(a * a)} et ${f.m(`\\sqrt{${f.n(b * b)}}`)} = ${f.N(b)}.`)), bi((f) => f.t(`${f.N(a * a)} ${plus ? '+' : '−'} ${f.N(b)} = ${f.N(ans)}.`, `${f.N(a * a)} ${plus ? '+' : '−'} ${f.N(b)} = ${f.N(ans)}.`))],
    nudge: t('Work out the square and the square root separately, then combine them.', 'Calcule séparément le carré et la racine carrée, puis combine-les.'),
  };
});

/** MS.G8.B2.3.a: multiply and divide by powers of ten mentally */
export const powersOfTen8 = numGen('MS.G8.B2.3.a', (tier, r) => {
  if (tier === 1) {
    const x = randInt(r, 11, 999) / 100, k = pick(r, [10, 100, 1000]);
    const mul = r() < 0.5;
    return {
      prompt: bi((f) => `${mul ? f.t('Multiply', 'Multiplie') : f.t('Divide', 'Divise')} ${f.m(`${f.n(x)} ${mul ? '\\times' : '\\div'} ${f.n(k)}`)}`),
      answer: r6(mul ? x * k : x / k),
      wrong: [[r6(mul ? x / k : x * k), t('It looks like the decimal point moved the wrong way. Multiplying makes the number bigger; dividing makes it smaller.', 'Il semble que la virgule s\'est déplacée dans le mauvais sens. Multiplier agrandit le nombre ; diviser le rapetisse.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.N(k)} has ${f.N(String(k).length - 1)} zero${String(k).length - 1 === 1 ? '' : 's'}, so move the decimal point ${f.N(String(k).length - 1)} place${String(k).length - 1 === 1 ? '' : 's'} to the ${mul ? 'right' : 'left'}.`, `${f.N(k)} a ${f.N(String(k).length - 1)} zéro${String(k).length - 1 === 1 ? '' : 's'} : déplace la virgule de ${f.N(String(k).length - 1)} position${String(k).length - 1 === 1 ? '' : 's'} vers la ${mul ? 'droite' : 'gauche'}.`)), bi((f) => f.t(`The result is ${f.N(r6(mul ? x * k : x / k))}.`, `Le résultat est ${f.N(r6(mul ? x * k : x / k))}.`))],
      nudge: t('Count the zeros and move the decimal point that many places.', 'Compte les zéros et déplace la virgule d\'autant de positions.'),
    };
  }
  if (tier === 2) {
    const x = randInt(r, 11, 999) / 10, e = randInt(r, 2, 4);
    const mul = r() < 0.5;
    return {
      prompt: bi((f) => `${mul ? f.t('Multiply', 'Multiplie') : f.t('Divide', 'Divise')} ${f.m(`${f.n(x)} ${mul ? '\\times' : '\\div'} 10^{${f.n(e)}}`)}`),
      answer: r6(mul ? x * 10 ** e : x / 10 ** e),
      wrong: [[r6(mul ? x * 10 ** (e - 1) : x / 10 ** (e - 1)), t('It looks like the decimal point moved one place too few. Move it as many places as the exponent.', 'Il semble que la virgule s\'est déplacée d\'une position de moins. Déplace-la d\'autant de positions que l\'exposant.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The exponent is ${f.N(e)}, so move the decimal point ${f.N(e)} places to the ${mul ? 'right' : 'left'}.`, `L\'exposant est ${f.N(e)} : déplace la virgule de ${f.N(e)} positions vers la ${mul ? 'droite' : 'gauche'}.`)), bi((f) => f.t(`The result is ${f.N(r6(mul ? x * 10 ** e : x / 10 ** e))}.`, `Le résultat est ${f.N(r6(mul ? x * 10 ** e : x / 10 ** e))}.`))],
      nudge: t('The exponent tells you how many places to move the decimal point.', 'L\'exposant indique de combien de positions déplacer la virgule.'),
    };
  }
  const x = randInt(r, 11, 99), e = randInt(r, 3, 5);
  return {
    prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${f.n(x)} \\div 10^{${f.n(e)}}`)}`),
    answer: r6(x / 10 ** e), category: 'TH',
    wrong: [[r6(x * 10 ** -(e - 1)), t('It looks like the decimal point moved one place too few. A whole number has its decimal point at the end, so count from there.', 'Il semble que la virgule s\'est déplacée d\'une position de moins. Un nombre entier a sa virgule à la fin : compte à partir de là.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Start with ${f.N(x)} with its decimal point at the end, and move it ${f.N(e)} places to the left, adding zeros as needed.`, `Pars de ${f.N(x)} avec sa virgule à la fin et déplace-la de ${f.N(e)} positions vers la gauche, en ajoutant des zéros au besoin.`)), bi((f) => f.t(`The result is ${f.N(r6(x / 10 ** e))}.`, `Le résultat est ${f.N(r6(x / 10 ** e))}.`))],
    nudge: t('Move the decimal point left, filling with zeros.', 'Déplace la virgule vers la gauche en la remplissant de zéros.'),
  };
});

/** MS.G8.B2.4.a: add and subtract integers */
export const integers8 = numGen('MS.G8.B2.4.a', (tier, r) => {
  const big = (): number => randInt(r, 11, 60) * (r() < 0.5 ? -1 : 1);
  if (tier === 1) {
    const a = big(), b = big();
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} - ${sg(f, b)}`)}`),
      answer: a - b,
      wrong: [[a + b, t('It looks like the subtraction was treated as addition. Subtracting a number is the same as adding its opposite.', 'Il semble que la soustraction a été traitée comme une addition. Soustraire un nombre revient à additionner son opposé.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Subtracting ${f.N(b)} is the same as adding ${f.N(-b)}.`, `Soustraire ${f.N(b)} revient à additionner ${f.N(-b)}.`)), bi((f) => f.t(`${f.N(a)} + ${f.N(-b)} = ${f.N(a - b)}.`, `${f.N(a)} + ${f.N(-b)} = ${f.N(a - b)}.`))],
      nudge: t('Subtracting is the same as adding the opposite.', 'Soustraire revient à additionner l\'opposé.'),
    };
  }
  if (tier === 2) {
    const a = big(), b = big(), c = big(), d = big();
    const ans = a + b - c - d;
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} + ${sg(f, b)} - ${sg(f, c)} - ${sg(f, d)}`)}`),
      answer: ans,
      wrong: [[a + b + c + d, t('It looks like the subtractions were treated as additions. Work left to right and subtract where there is a minus sign.', 'Il semble que les soustractions ont été traitées comme des additions. Va de gauche à droite et soustrais là où il y a un signe moins.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Left to right: ${f.N(a)} + (${f.n(b)}) = ${f.N(a + b)}. Then subtract ${f.N(c)}: ${f.N(a + b - c)}.`, `De gauche à droite : ${f.N(a)} + (${f.n(b)}) = ${f.N(a + b)}. Puis soustrais ${f.N(c)} : ${f.N(a + b - c)}.`)), bi((f) => f.t(`Then subtract ${f.N(d)}: ${f.N(a + b - c)} − (${f.n(d)}) = ${f.N(ans)}.`, `Puis soustrais ${f.N(d)} : ${f.N(a + b - c)} − (${f.n(d)}) = ${f.N(ans)}.`))],
      nudge: t('Work from left to right, one step at a time.', 'Va de gauche à droite, une étape à la fois.'),
    };
  }
  const start = -randInt(r, 60, 200), up = randInt(r, 20, 80), down = randInt(r, 30, 90);
  const ans = start + up - down;
  return {
    prompt: bi((f) => f.t(`A submarine is at ${f.N(start)} m (below sea level). It rises ${f.N(up)} m, then dives ${f.N(down)} m. What is its height now, in metres?`, `Un sous-marin est à ${f.N(start)} m (sous le niveau de la mer). Il remonte de ${f.N(up)} m, puis plonge de ${f.N(down)} m. Quelle est sa hauteur maintenant, en mètres ?`)),
    answer: ans, category: 'AP',
    wrong: [[start - up - down, t('It looks like the rise was subtracted. Rising makes the number greater, so add it.', 'Il semble que la remontée a été soustraite. Remonter augmente le nombre : additionne-la.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`After rising: ${f.N(start)} + ${f.N(up)} = ${f.N(start + up)}.`, `Après la remontée : ${f.N(start)} + ${f.N(up)} = ${f.N(start + up)}.`)), bi((f) => f.t(`After diving: ${f.N(start + up)} − ${f.N(down)} = ${f.N(ans)} m.`, `Après la plongée : ${f.N(start + up)} − ${f.N(down)} = ${f.N(ans)} m.`))],
    nudge: t('Rising adds, diving subtracts. Do each move in order.', 'Remonter additionne, plonger soustrait. Fais chaque déplacement dans l\'ordre.'),
  };
});

const reduceFrac = (n: number, d: number): { n: number; d: number } => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mixedTexF = (f: F, w: number, n: number, d: number): string => (w ? `${f.n(w)}${frac(f.n(n), f.n(d))}` : frac(f.n(n), f.n(d)));

/** MS.G8.B2.5.a: add and subtract fractions (unlike denominators, mixed numbers, three terms) */
export const addSubFrac8: Generator = (tier, seed) => {
  const r = makeRng(seed);
  for (let tries = 0; tries < 400; tries++) {
    const ds = [randInt(r, 2, 12), randInt(r, 2, 12), randInt(r, 2, 12)];
    const ws = tier === 2 ? [randInt(r, 1, 5), randInt(r, 1, 4), 0] : [0, 0, 0];
    const ns = ds.map((d) => randInt(r, 1, d - 1));
    const terms = tier === 3 ? 3 : 2;
    const ops = tier === 3 ? [1, r() < 0.5 ? 1 : -1, -1] : [1, r() < 0.5 ? 1 : -1];
    let L = 1;
    for (let i = 0; i < terms; i++) L = lcm(L, ds[i]!);
    if (L > 120) continue;
    const vals = Array.from({ length: terms }, (_, i) => ops[i]! * (ws[i]! * L + ns[i]! * (L / ds[i]!)));
    const num = vals.reduce((a, b) => a + b, 0);
    if (num <= 0) continue;
    const res = reduceFrac(num, L);
    if (res.d === 1) continue;
    if (tier === 1 && (ds[0] === ds[1] || ds[0]! % ds[1]! === 0 || ds[1]! % ds[0]! === 0)) continue;
    const show = (f: F): string => Array.from({ length: terms }, (_, i) => `${i === 0 ? '' : ops[i]! > 0 ? ' + ' : ' - '}${mixedTexF(f, ws[i]!, ns[i]!, ds[i]!)}`).join('');
    const naive = tier === 1 ? reduceFrac(ops[1]! > 0 ? ns[0]! + ns[1]! : Math.abs(ns[0]! - ns[1]!), ds[0]! + ds[1]!) : null;
    return build({
      skill: 'MS.G8.B2.5.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Calculate ${f.m(show(f))}. Write the answer as a fraction in simplest form (it can be greater than 1).`, `Calcule ${f.m(show(f))}. Écris la réponse sous forme de fraction irréductible (elle peut être plus grande que 1).`)),
      answer: { kind: 'fraction', n: res.n, d: res.d, mustReduce: true },
      steps: [bi((f) => f.t(`Use the common denominator ${f.N(L)}${tier === 2 ? ' (change mixed numbers to improper fractions first)' : ''}: ${f.m(vals.map((v, i) => `${i === 0 ? '' : v >= 0 ? ' + ' : ' - '}${frac(f.n(Math.abs(v)), f.n(L))}`).join(''))}.`, `Utilise le dénominateur commun ${f.N(L)}${tier === 2 ? ' (transforme d\'abord les nombres fractionnaires en fractions impropres)' : ''} : ${f.m(vals.map((v, i) => `${i === 0 ? '' : v >= 0 ? ' + ' : ' - '}${frac(f.n(Math.abs(v)), f.n(L))}`).join(''))}.`)), bi((f) => f.t(`Combine the numerators: ${f.m(frac(f.n(num), f.n(L)))}, which simplifies to ${f.m(frac(f.n(res.n), f.n(res.d)))}.`, `Combine les numérateurs : ${f.m(frac(f.n(num), f.n(L)))}, qui se simplifie en ${f.m(frac(f.n(res.n), f.n(res.d)))}.`))],
      nudge: t('Rewrite every fraction with the same denominator before you add or subtract.', 'Réécris chaque fraction avec le même dénominateur avant d\'additionner ou de soustraire.'),
      stepHint: t('Find a common denominator and rewrite each fraction.', 'Trouve un dénominateur commun et réécris chaque fraction.'),
      wrong: naive && !(naive.n === res.n && naive.d === res.d) && naive.n > 0 ? [{ answer: { kind: 'fraction', n: naive.n, d: naive.d }, stepIndex: 0, why: t('It looks like the numerators and the denominators were each added or subtracted. Rewrite with a common denominator first, then work with the numerators only.', 'Il semble que les numérateurs et les dénominateurs ont chacun été additionnés ou soustraits. Réécris d\'abord avec un dénominateur commun, puis travaille seulement avec les numérateurs.') }] : [],
    });
  }
  throw new Error('addSubFrac8: no item found');
};

/** MS.G8.B2.6.a: multiply and divide fractions by fractions, whole numbers and mixed numbers */
export const mulDivFrac8: Generator = (tier, seed) => {
  const r = makeRng(seed);
  for (let tries = 0; tries < 400; tries++) {
    const d1 = randInt(r, 2, 9), d2 = randInt(r, 2, 9);
    const n1 = randInt(r, 1, d1 - 1), n2 = randInt(r, 1, d2 - 1);
    const w1 = tier === 1 ? 0 : randInt(r, 1, 4), w2 = tier === 3 ? randInt(r, 1, 3) : 0;
    const whole = randInt(r, 2, 12);
    const A = w1 * d1 + n1, B = w2 * d2 + n2;
    let num: number, den: number, text: (f: F) => string, why: Text, divide = false;
    if (tier === 1) {
      const kind = r() < 0.5 ? 'mulWhole' : 'divWhole';
      if (kind === 'mulWhole') { num = n1 * whole; den = d1; text = (f) => `${f.n(whole)} \\times ${frac(f.n(n1), f.n(d1))}`; why = t('It looks like the denominator was multiplied by the whole number too. Only the numerator is multiplied.', 'Il semble que le dénominateur a aussi été multiplié par le nombre entier. Seul le numérateur est multiplié.'); }
      else { divide = true; num = n1; den = d1 * whole; text = (f) => `${frac(f.n(n1), f.n(d1))} \\div ${f.n(whole)}`; why = t('It looks like the fraction was multiplied by the whole number. Dividing by a whole number makes the fraction smaller.', 'Il semble que la fraction a été multipliée par le nombre entier. Diviser par un nombre entier rapetisse la fraction.'); }
    } else if (tier === 2) {
      num = A * n2; den = d1 * d2;
      text = (f) => `${mixedTexF(f, w1, n1, d1)} \\times ${frac(f.n(n2), f.n(d2))}`;
      why = t('It looks like the whole-number part was left out. Change the mixed number to an improper fraction first.', 'Il semble que la partie entière a été oubliée. Transforme d\'abord le nombre fractionnaire en fraction impropre.');
    } else {
      divide = true; num = A * d2; den = d1 * B;
      text = (f) => `${mixedTexF(f, w1, n1, d1)} \\div ${mixedTexF(f, w2, n2, d2)}`;
      why = t('It looks like the second number was not flipped. Change both to improper fractions, then multiply by the reciprocal of the second.', 'Il semble que le deuxième nombre n\'a pas été retourné. Transforme les deux en fractions impropres, puis multiplie par l\'inverse du deuxième.');
    }
    const res = reduceFrac(num, den);
    if (res.d === 1) continue;
    const bad = tier === 1 ? (divide ? reduceFrac(n1 * whole, d1) : reduceFrac(n1 * whole, d1 * whole)) : tier === 2 ? reduceFrac(n1 * n2, d1 * d2) : reduceFrac(A * B, d1 * d2);
    return build({
      skill: 'MS.G8.B2.6.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Calculate ${f.m(text(f))}. Write the answer as a fraction in simplest form (it can be greater than 1).`, `Calcule ${f.m(text(f))}. Écris la réponse sous forme de fraction irréductible (elle peut être plus grande que 1).`)),
      answer: { kind: 'fraction', n: res.n, d: res.d, mustReduce: true },
      steps: [bi((f) => f.t(`${tier === 1 ? 'Write the whole number over 1 if you like' : 'Change mixed numbers to improper fractions'}, ${divide ? 'flip the second fraction' : 'then multiply across'}${divide ? ' and multiply' : ''}: ${f.m(frac(f.n(num), f.n(den)))}.`, `${tier === 1 ? 'Écris le nombre entier sur 1 si tu veux' : 'Transforme les nombres fractionnaires en fractions impropres'}, ${divide ? 'retourne la deuxième fraction' : 'puis multiplie en ligne'}${divide ? ' et multiplie' : ''} : ${f.m(frac(f.n(num), f.n(den)))}.`)), bi((f) => f.t(`Simplify: ${f.m(frac(f.n(res.n), f.n(res.d)))}.`, `Simplifie : ${f.m(frac(f.n(res.n), f.n(res.d)))}.`))],
      nudge: divide ? t('Dividing by a number means multiplying by its reciprocal.', 'Diviser par un nombre revient à multiplier par son inverse.') : t('Multiply the numerators and multiply the denominators.', 'Multiplie les numérateurs et multiplie les dénominateurs.'),
      stepHint: t('Write every number as a fraction first.', 'Écris d\'abord chaque nombre sous forme de fraction.'),
      wrong: bad.n === res.n && bad.d === res.d ? [] : [{ answer: { kind: 'fraction', n: bad.n, d: bad.d }, stepIndex: 0, why }],
    });
  }
  throw new Error('mulDivFrac8: no item found');
};

/** MS.G8.B2.7.a: multiply and divide integers */
export const mulDivInt8 = numGen('MS.G8.B2.7.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 12), b = randInt(r, 2, 12);
    const signs = pick(r, [[-1, 1], [1, -1], [-1, -1]] as const);
    const x = a * signs[0], y = b * signs[1];
    return {
      prompt: bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${sg(f, x)} \\times ${sg(f, y)}`)}`),
      answer: x * y,
      wrong: [[-(x * y), t('It looks like the sign is wrong. Same signs give a positive product; different signs give a negative product.', 'Il semble que le signe est erroné. Des signes identiques donnent un produit positif ; des signes différents donnent un produit négatif.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Multiply the sizes: ${f.N(a)} × ${f.N(b)} = ${f.N(a * b)}.`, `Multiplie les grandeurs : ${f.N(a)} × ${f.N(b)} = ${f.N(a * b)}.`)), bi((f) => f.t(`The signs are ${x < 0 === y < 0 ? 'the same, so the answer is positive' : 'different, so the answer is negative'}: ${f.N(x * y)}.`, `Les signes sont ${x < 0 === y < 0 ? 'identiques, donc la réponse est positive' : 'différents, donc la réponse est négative'} : ${f.N(x * y)}.`))],
      nudge: t('Multiply the sizes, then decide the sign: same signs positive, different signs negative.', 'Multiplie les grandeurs, puis décide du signe : signes identiques positif, signes différents négatif.'),
    };
  }
  if (tier === 2) {
    const q = randInt(r, 2, 12), b = randInt(r, 2, 12);
    const signs = pick(r, [[-1, 1], [1, -1], [-1, -1]] as const);
    const x = q * b * signs[0], y = b * signs[1];
    return {
      prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${sg(f, x)} \\div ${sg(f, y)}`)}`),
      answer: x / y,
      wrong: [[-(x / y), t('It looks like the sign is wrong. Dividing follows the same sign rules as multiplying.', 'Il semble que le signe est erroné. La division suit les mêmes règles de signes que la multiplication.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Divide the sizes: ${f.N(Math.abs(x))} ÷ ${f.N(Math.abs(y))} = ${f.N(q)}.`, `Divise les grandeurs : ${f.N(Math.abs(x))} ÷ ${f.N(Math.abs(y))} = ${f.N(q)}.`)), bi((f) => f.t(`The signs are ${x < 0 === y < 0 ? 'the same, so the answer is positive' : 'different, so the answer is negative'}: ${f.N(x / y)}.`, `Les signes sont ${x < 0 === y < 0 ? 'identiques, donc la réponse est positive' : 'différents, donc la réponse est négative'} : ${f.N(x / y)}.`))],
      nudge: t('Divide the sizes, then decide the sign by the same rule as multiplying.', 'Divise les grandeurs, puis décide du signe avec la même règle que pour la multiplication.'),
    };
  }
  const a = randInt(r, 2, 9), b = randInt(r, 2, 9), c = randInt(r, 2, 9);
  const x = -a * b * c;
  const ans = (x / -a) * -c;
  return {
    prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(x)} \\div (${f.n(-a)}) \\times (${f.n(-c)})`)}`),
    answer: ans, category: 'TH',
    wrong: [[-ans, t('It looks like one sign was missed. Work left to right and decide the sign at each step.', 'Il semble qu\'un signe a été oublié. Va de gauche à droite et décide du signe à chaque étape.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`First: ${f.N(x)} ÷ (${f.n(-a)}) = ${f.N(x / -a)} (different signs would be negative; here both are negative, so positive).`, `D\'abord : ${f.N(x)} ÷ (${f.n(-a)}) = ${f.N(x / -a)} (les deux signes sont négatifs : le résultat est positif).`)), bi((f) => f.t(`Then ${f.N(x / -a)} × (${f.n(-c)}) = ${f.N(ans)}.`, `Puis ${f.N(x / -a)} × (${f.n(-c)}) = ${f.N(ans)}.`))],
    nudge: t('Divide first (left to right), then multiply, checking the sign each time.', 'Divise d\'abord (de gauche à droite), puis multiplie, en vérifiant le signe chaque fois.'),
  };
});

/** MS.G8.B2.8.a: compare proportional situations and find unknown values */
export const proportions8 = numGen('MS.G8.B2.8.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9), b = randInt(r, 3, 12), k = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`${f.m(`\\frac{${f.n(a)}}{${f.n(b)}} = \\frac{x}{${f.n(b * k)}}`)}. What is x?`, `${f.m(`\\frac{${f.n(a)}}{${f.n(b)}} = \\frac{x}{${f.n(b * k)}}`)}. Quelle est la valeur de x ?`)),
      answer: a * k,
      wrong: [[a + (b * k - b), t('It looks like the difference between the bottom numbers was added. In equal ratios both numbers are multiplied by the same factor.', 'Il semble que la différence entre les nombres du bas a été ajoutée. Dans des rapports égaux, les deux nombres sont multipliés par le même facteur.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The bottom number was multiplied by ${f.N(b * k)} ÷ ${f.N(b)} = ${f.N(k)}.`, `Le nombre du bas a été multiplié par ${f.N(b * k)} ÷ ${f.N(b)} = ${f.N(k)}.`)), bi((f) => f.t(`Multiply the top by the same factor: ${f.N(a)} × ${f.N(k)} = ${f.N(a * k)}.`, `Multiplie le nombre du haut par le même facteur : ${f.N(a)} × ${f.N(k)} = ${f.N(a * k)}.`))],
      nudge: t('Find the number you multiply the bottom by, then multiply the top by it too.', 'Trouve le nombre par lequel on multiplie le bas, puis multiplie aussi le haut par ce nombre.'),
    };
  }
  if (tier === 2) {
    const u1 = randInt(r, 40, 120) / 100;
    const u2 = r6(u1 + randInt(r, 5, 30) / 100);
    const q1 = randInt(r, 4, 12), q2 = randInt(r, 4, 12);
    return {
      prompt: bi((f) => f.t(`Pack A has ${f.N(q1)} pencils for ${f.N(r6(u1 * q1))} dollars. Pack B has ${f.N(q2)} pencils for ${f.N(r6(u2 * q2))} dollars. How many dollars less per pencil does the better buy cost?`, `Le paquet A contient ${f.N(q1)} crayons pour ${f.N(r6(u1 * q1))} dollars. Le paquet B contient ${f.N(q2)} crayons pour ${f.N(r6(u2 * q2))} dollars. Combien de dollars de moins par crayon la meilleure affaire coûte-t-elle ?`)),
      answer: r6(u2 - u1), category: 'AP',
      wrong: [[r6(u1), t('That is the unit price of the better buy, not the difference. Subtract the two unit prices.', 'C\'est le prix unitaire de la meilleure affaire, pas la différence. Soustrais les deux prix unitaires.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Unit prices: A is ${f.N(r6(u1 * q1))} ÷ ${f.N(q1)} = ${f.N(u1)} and B is ${f.N(r6(u2 * q2))} ÷ ${f.N(q2)} = ${f.N(u2)} dollars each.`, `Prix unitaires : A est ${f.N(r6(u1 * q1))} ÷ ${f.N(q1)} = ${f.N(u1)} et B est ${f.N(r6(u2 * q2))} ÷ ${f.N(q2)} = ${f.N(u2)} dollar chacun.`)), bi((f) => f.t(`Difference: ${f.N(u2)} − ${f.N(u1)} = ${f.N(r6(u2 - u1))} dollars.`, `Différence : ${f.N(u2)} − ${f.N(u1)} = ${f.N(r6(u2 - u1))} dollar.`))],
      nudge: t('Find the price of one pencil in each pack, then compare.', 'Trouve le prix d\'un crayon dans chaque paquet, puis compare.'),
    };
  }
  const u = randInt(r, 1, 6) * 0.25;
  const s1 = randInt(r, 2, 8) * 2, s2 = randInt(r, 3, 15);
  return {
    prompt: bi((f) => f.t(`A recipe for ${f.N(s1)} servings needs ${f.N(r6(u * s1))} cups of rice. How many cups are needed for ${f.N(s2)} servings?`, `Une recette pour ${f.N(s1)} portions demande ${f.N(r6(u * s1))} tasses de riz. Combien de tasses faut-il pour ${f.N(s2)} portions ?`)),
    answer: r6(u * s2), category: 'AP',
    wrong: [[r6(u * s1 + (s2 - s1)), t('It looks like the extra servings were added as cups. Find the amount for one serving first.', 'Il semble que les portions en plus ont été ajoutées comme des tasses. Trouve d\'abord la quantité pour une portion.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`One serving needs ${f.N(r6(u * s1))} ÷ ${f.N(s1)} = ${f.N(u)} cups.`, `Une portion demande ${f.N(r6(u * s1))} ÷ ${f.N(s1)} = ${f.N(u)} tasse.`)), bi((f) => f.t(`${f.N(s2)} servings: ${f.N(s2)} × ${f.N(u)} = ${f.N(r6(u * s2))} cups.`, `${f.N(s2)} portions : ${f.N(s2)} × ${f.N(u)} = ${f.N(r6(u * s2))} tasses.`))],
    nudge: t('Find the amount for one serving, then scale up.', 'Trouve la quantité pour une portion, puis passe à plus grand.'),
  };
});
