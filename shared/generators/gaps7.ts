// Grade 7 completion, part 1: Number (B1.1, B1.5, B1.6, B2.2) and Algebra (C1.2, C3.1, C3.2), asked in words and numbers.
// Programs are described in plain steps, so every item is an ordinary number or choice question.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { frac, t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

// ── Number ──────────────────────────────────────────────────────────────────────

/** MS.G7.B1.1.a: numbers up to one billion, with expanded form */
const expanded = numGen('MS.G7.B1.1.a', (_tier, r) => {
  const pows = [3, 4, 5, 6, 7, 8].sort(() => r() - 0.5).slice(0, 3).sort((a, b) => b - a);
  const ds = pows.map(() => randInt(r, 1, 9));
  const ans = pows.reduce((s, p, i) => s + ds[i]! * 10 ** p, 0);
  const expr = (f: F): string => pows.map((p, i) => `${f.n(ds[i]!)} \\times 10^{${p}}`).join(' + ');
  return {
    prompt: bi((f) => f.t(`Write ${f.m(expr(f))} as a standard number.`, `Écris ${f.m(expr(f))} sous forme de nombre ordinaire.`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[ans - ds[0]! * 10 ** pows[0]! + ds[0]! * 10 ** (pows[0]! - 1), t('A power of ten has the wrong number of zeros. 10 to the power n has n zeros.', 'Une puissance de dix n\'a pas le bon nombre de zéros. 10 à la puissance n a n zéros.'), 0], [ans + ds[1]! * 10 ** pows[1]! * 9, t('Check the exponent of the middle term: the power of ten sets how many zeros follow the digit.', 'Vérifie l\'exposant du terme du milieu : la puissance de dix détermine le nombre de zéros après le chiffre.'), 0], [ds.reduce((s, d, i) => s + d * pows[i]!, 0), t('The exponent is not the multiplier. Work out 10 to the power, then multiply by the digit.', 'L\'exposant n\'est pas le multiplicateur. Calcule 10 à la puissance, puis multiplie par le chiffre.'), 0]]),
    steps: [bi((f) => f.t(`Write each term out: ${pows.map((p, i) => f.N(ds[i]! * 10 ** p)).join(' + ')}.`, `Écris chaque terme : ${pows.map((p, i) => f.N(ds[i]! * 10 ** p)).join(' + ')}.`)), bi((f) => f.t(`Add them: ${f.N(ans)}.`, `Additionne : ${f.N(ans)}.`))],
    nudge: t('Each term is a digit followed by as many zeros as the exponent says.', 'Chaque terme est un chiffre suivi d\'autant de zéros que l\'exposant l\'indique.'),
  };
});
const digitValue = numGen('MS.G7.B1.1.a', (_tier, r) => {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => r() - 0.5).slice(0, 9);
  const n = Number(digits.join('')), pos = randInt(r, 0, 8), d = digits[8 - pos]!;
  return {
    prompt: bi((f) => f.t(`What is the value of the digit ${f.N(d)} in ${f.N(n)}?`, `Quelle est la valeur du chiffre ${f.N(d)} dans ${f.N(n)} ?`)),
    answer: d * 10 ** pos, category: 'KU',
    wrong: wr(d * 10 ** pos, [[d, t('That is the digit itself. Its value depends on the place it sits in.', 'C\'est le chiffre lui-même. Sa valeur dépend de la position qu\'il occupe.'), 0], [d * 10 ** (pos + 1), t('Count the places again from the right: the ones place has no zeros.', 'Recompte les positions à partir de la droite : la position des unités n\'a pas de zéro.'), 0], [d * 10 ** Math.max(0, pos - 1), t('Count the places again from the right: one fewer zero than this.', 'Recompte les positions à partir de la droite : un zéro de moins que cela.'), 0]]),
    steps: [bi((f) => f.t(`The digit ${f.N(d)} has ${f.N(pos)} digits to its right, so it is worth the digit times ${f.m(`10^{${pos}}`)}.`, `Le chiffre ${f.N(d)} a ${f.N(pos)} chiffres à sa droite : il vaut le chiffre fois ${f.m(`10^{${pos}}`)}.`)), bi((f) => f.t(`Its value is ${f.N(d * 10 ** pos)}.`, `Sa valeur est ${f.N(d * 10 ** pos)}.`))],
    nudge: t('Count how many digits are to the right of it. That is how many zeros follow it.', 'Compte combien de chiffres sont à sa droite. C\'est le nombre de zéros qui le suivent.'),
  };
});
const fromWords = numGen('MS.G7.B1.1.a', (_tier, r) => {
  const a = randInt(r, 1, 999), b = randInt(r, 1, 999), c = randInt(r, 1, 999), ans = a * 1e6 + b * 1e3 + c;
  const use = r() < 0.5;
  const mid = use ? b : 0, ans2 = a * 1e6 + mid * 1e3 + c;
  return {
    prompt: bi((f) => f.t(`Write ${f.N(a)} million, ${use ? `${f.N(b)} thousand, ` : ''}${f.N(c)} as a standard number.`, `Écris ${f.N(a)} million${a > 1 ? 's' : ''}, ${use ? `${f.N(b)} mille, ` : ''}${f.N(c)} sous forme de nombre ordinaire.`)),
    answer: ans2, category: 'KU',
    wrong: wr(ans2, [[a * 1e6 + mid + c, t('The thousands part must be multiplied by 1 000.', 'La partie des milliers doit être multipliée par 1 000.'), 0], [a * 1e5 + mid * 1e3 + c, t('A million has six zeros.', 'Un million a six zéros.'), 0], [a * 1e6 + c * 1e3 + mid, t('The groups are in order: millions, thousands, then ones.', 'Les groupes sont dans l\'ordre : millions, milliers, puis unités.'), 0]]),
    steps: [bi((f) => f.t(`${f.N(a)} million is ${f.N(a * 1e6)}${use ? `, ${f.N(b)} thousand is ${f.N(b * 1e3)}` : ''}, and then ${f.N(c)}.`, `${f.N(a)} million${a > 1 ? 's' : ''} font ${f.N(a * 1e6)}${use ? `, ${f.N(b)} mille font ${f.N(b * 1e3)}` : ''}, puis ${f.N(c)}.`)), bi((f) => f.t(`Add the parts: ${f.N(ans2)}.`, `Additionne les parties : ${f.N(ans2)}.`))],
    nudge: t('Write each group of three digits in its place, and use zeros for any group that is missing.', 'Écris chaque groupe de trois chiffres à sa place et utilise des zéros pour tout groupe manquant.'),
  };
});
export const largeNumbers7 = tierGen(expanded, digitValue, fromWords);

/** MS.G7.B1.5.a: numbers between two quantities */
export const between7 = choiceGen('MS.G7.B1.5.a', (tier, r) => {
  let lo: string, hi: string, right: string, wrongs: string[];
  const d = (v: number): string => String(r6(v));
  if (tier === 1) {
    const a = randInt(r, 1, 8);
    lo = d(a / 10); hi = d((a + 1) / 10); right = d((2 * a + 1) / 20); wrongs = [lo, hi, d(a / 10 - 0.05)];
  } else if (tier === 2) {
    const a = randInt(r, 10, 80);
    lo = d(a / 100); hi = d((a + 3) / 100); right = d((a + 1 + randInt(r, 0, 1)) / 100); wrongs = [d((a - 1) / 100), d((a + 4) / 100), hi];
  } else {
    const b = randInt(r, 3, 9), a = randInt(r, 1, b - 2);
    lo = frac(a, b); hi = frac(a + 1, b); right = frac(2 * a + 1, 2 * b); wrongs = [frac(a, b + 1), frac(a + 2, b), hi];
  }
  const show = (f: F, v: string): string => (tier === 3 ? v : f.n(Number(v)));
  const opt = (v: string): Text => bi((f) => f.m(show(f, v)));
  const m = mc(r, opt(right), wrongs.map((v): [Text, Text] => [opt(v), t('This number is not strictly between the two. A number between them is bigger than the smaller one and smaller than the larger one.', 'Ce nombre n\'est pas strictement entre les deux. Un nombre entre eux est plus grand que le plus petit et plus petit que le plus grand.')]));
  return {
    prompt: bi((f) => f.t(`Which number is between ${f.m(show(f, lo))} and ${f.m(show(f, hi))}?`, `Quel nombre est entre ${f.m(show(f, lo))} et ${f.m(show(f, hi))} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [tier === 3 ? t('Compare using a common denominator, or find the number halfway by doubling the denominator.', 'Compare avec un dénominateur commun, ou trouve le nombre à mi-chemin en doublant le dénominateur.') : t('Compare digit by digit, place by place. The number must be larger than the first and smaller than the second.', 'Compare chiffre par chiffre, position par position. Le nombre doit être plus grand que le premier et plus petit que le second.'), bi((f) => f.t(`Only ${f.m(show(f, right))} fits.`, `Seul ${f.m(show(f, right))} convient.`))],
    nudge: t('Check each choice against both numbers: it must be more than the smaller and less than the larger.', 'Vérifie chaque choix avec les deux nombres : il doit être plus grand que le plus petit et plus petit que le plus grand.'),
  };
});

/** MS.G7.B1.6.a: rounding */
export const rounding7 = numGen('MS.G7.B1.6.a', (tier, r) => {
  if (tier === 1) {
    const place = pick(r, [0, 1]);
    const hundredths = randInt(r, 100, 999) + 100 * randInt(r, 0, 4), x = r6(hundredths / 100);
    const ans = place === 0 ? Math.floor((hundredths + 50) / 100) : Math.floor((hundredths + 5) / 10) / 10; // integer arithmetic, so ties round up exactly
    return {
      prompt: bi((f) => f.t(`Round ${f.N(x)} to the nearest ${place === 0 ? 'whole number' : 'tenth'}.`, `Arrondis ${f.N(x)} ${place === 0 ? 'à l\'unité près' : 'au dixième près'}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(Math.floor(x * 10 ** place) / 10 ** place), t('Look at the digit after the place you are rounding to: 5 or more rounds up.', 'Regarde le chiffre après la position d\'arrondi : 5 ou plus arrondit vers le haut.'), 0], [r6(Math.ceil(x * 10 ** place) / 10 ** place), t('Only round up if the next digit is 5 or more.', 'N\'arrondis vers le haut que si le chiffre suivant est 5 ou plus.'), 0], [r6(Math.round(x * 10 ** (place + 1)) / 10 ** (place + 1)), t('That rounds to one more decimal place than asked.', 'Cela arrondit à une décimale de plus que demandé.'), 0]]),
      steps: [t('Find the digit just after the place you are rounding to.', 'Trouve le chiffre juste après la position d\'arrondi.'), bi((f) => f.t(`If it is 5 or more, round up; otherwise keep the digit. The answer is ${f.N(ans)}.`, `S'il est 5 ou plus, arrondis vers le haut ; sinon garde le chiffre. La réponse est ${f.N(ans)}.`))],
      nudge: t('Look at the digit to the right of the place you are rounding to.', 'Regarde le chiffre à droite de la position d\'arrondi.'),
    };
  }
  if (tier === 2) {
    const thousandths = randInt(r, 1000, 9999), x = thousandths / 1000, ans = Math.floor((thousandths + 5) / 10) / 100;
    return {
      prompt: bi((f) => f.t(`Round ${f.N(x)} to the nearest hundredth.`, `Arrondis ${f.N(x)} au centième près.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(Math.floor(x * 100) / 100), t('Look at the thousandths digit: 5 or more rounds the hundredths digit up.', 'Regarde le chiffre des millièmes : 5 ou plus arrondit le chiffre des centièmes vers le haut.'), 0], [r6(Math.round(x * 10) / 10), t('That rounds to the nearest tenth. The hundredths place is the second decimal.', 'Cela arrondit au dixième. Les centièmes sont la deuxième décimale.'), 0], [r6(Math.ceil(x * 100) / 100), t('Only round up when the next digit is 5 or more.', 'N\'arrondis vers le haut que si le chiffre suivant est 5 ou plus.'), 0]]),
      steps: [t('The hundredths digit is the second digit after the decimal point. Look at the digit after it.', 'Le chiffre des centièmes est le deuxième chiffre après la virgule. Regarde le chiffre suivant.'), bi((f) => f.t(`The rounded number is ${f.N(ans)}.`, `Le nombre arrondi est ${f.N(ans)}.`))],
      nudge: t('Look at the thousandths digit to decide whether to round up.', 'Regarde le chiffre des millièmes pour décider d\'arrondir vers le haut ou non.'),
    };
  }
  const place = pick(r, [3, 4, 5]), x = randInt(r, 100000, 99999999) + 0.0, ans = Math.round(x / 10 ** place) * 10 ** place;
  const label = place === 3 ? ['thousand'] : place === 4 ? ['ten thousand'] : ['hundred thousand'];
  return {
    prompt: bi((f) => f.t(`Round ${f.N(x)} to the nearest ${label[0]}.`, `Arrondis ${f.N(x)} ${place === 3 ? 'au millier' : place === 4 ? 'à la dizaine de milliers' : 'à la centaine de milliers'} près.`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[Math.floor(x / 10 ** place) * 10 ** place, t('Look at the digit just after the place you are rounding to: 5 or more rounds up.', 'Regarde le chiffre juste après la position d\'arrondi : 5 ou plus arrondit vers le haut.'), 0], [Math.round(x / 10 ** (place - 1)) * 10 ** (place - 1), t('That rounds to a smaller place than asked.', 'Cela arrondit à une position plus petite que demandé.'), 0], [Math.round(x / 10 ** (place + 1)) * 10 ** (place + 1), t('That rounds to a larger place than asked.', 'Cela arrondit à une position plus grande que demandé.'), 0]]),
    steps: [t('Find the place to round to and look at the digit just to its right.', 'Trouve la position d\'arrondi et regarde le chiffre juste à sa droite.'), bi((f) => f.t(`The rounded number is ${f.N(ans)}.`, `Le nombre arrondi est ${f.N(ans)}.`))],
    nudge: t('Keep the digits up to the rounding place, change everything after it to zeros, and round up if the next digit is 5 or more.', 'Garde les chiffres jusqu\'à la position d\'arrondi, remplace le reste par des zéros et arrondis vers le haut si le chiffre suivant est 5 ou plus.'),
  };
});

/** MS.G7.B2.2.a: common fraction, decimal and percent equivalents */
export const equivalents7 = numGen('MS.G7.B2.2.a', (tier, r) => {
  if (tier === 1) {
    const [n, d] = pick(r, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]] as [number, number][]);
    const ans = r6((100 * n) / d);
    return {
      prompt: bi((f) => f.t(`Write ${f.m(frac(n, d))} as a percent. (Give the number of percent.)`, `Écris ${f.m(frac(n, d))} en pourcentage. (Donne le nombre de pour cent.)`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(n / d), t('That is the decimal. Multiply by 100 to get the percent.', 'C\'est le nombre décimal. Multiplie par 100 pour obtenir le pourcentage.'), 1], [n * 10, t('Divide the numerator by the denominator first, then multiply by 100.', 'Divise d\'abord le numérateur par le dénominateur, puis multiplie par 100.'), 0], [r6(100 / d), t('Do not forget the numerator: it multiplies the percent for one part.', 'N\'oublie pas le numérateur : il multiplie le pourcentage d\'une part.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${frac(n, d)} = ${n} \\div ${d}`)} = ${f.N(r6(n / d))}.`, `${f.m(`${frac(n, d)} = ${n} \\div ${d}`)} = ${f.N(r6(n / d))}.`)), bi((f) => f.t(`${f.m(`${f.n(r6(n / d))} \\times 100`)} = ${f.N(ans)} percent.`, `${f.m(`${f.n(r6(n / d))} \\times 100`)} = ${f.N(ans)} pour cent.`))],
      nudge: t('Divide the top by the bottom to get a decimal, then multiply by 100.', 'Divise le numérateur par le dénominateur pour obtenir un décimal, puis multiplie par 100.'),
    };
  }
  if (tier === 2) {
    const [n, d] = pick(r, [[1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [3, 20], [7, 20], [1, 25], [3, 25], [7, 25], [1, 50], [9, 50]] as [number, number][]);
    const ans = r6((100 * n) / d);
    return {
      prompt: bi((f) => f.t(`Write ${f.m(frac(n, d))} as a percent. (Give the number of percent.)`, `Écris ${f.m(frac(n, d))} en pourcentage. (Donne le nombre de pour cent.)`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(n / d), t('That is the decimal. Multiply by 100 to get the percent.', 'C\'est le nombre décimal. Multiplie par 100 pour obtenir le pourcentage.'), 1], [r6((100 * d) / n), t('The fraction was turned upside down. Divide the numerator by the denominator.', 'La fraction a été renversée. Divise le numérateur par le dénominateur.'), 0], [r6(100 / d), t('Do not forget the numerator.', 'N\'oublie pas le numérateur.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${frac(n, d)} = ${n} \\div ${d}`)} = ${f.N(r6(n / d))}.`, `${f.m(`${frac(n, d)} = ${n} \\div ${d}`)} = ${f.N(r6(n / d))}.`)), bi((f) => f.t(`${f.m(`${f.n(r6(n / d))} \\times 100`)} = ${f.N(ans)} percent.`, `${f.m(`${f.n(r6(n / d))} \\times 100`)} = ${f.N(ans)} pour cent.`))],
      nudge: t('Divide the top by the bottom, then multiply by 100.', 'Divise le numérateur par le dénominateur, puis multiplie par 100.'),
    };
  }
  const p = pick(r, [12.5, 37.5, 0.5, 2.5, 7.5, 62.5, 0.25, 87.5, 150, 120]), ans = r6(p / 100);
  return {
    prompt: bi((f) => f.t(`Write ${f.m(`${f.n(p)}\\%`)} as a decimal.`, `Écris ${f.m(`${f.n(p)}\\%`)} sous forme de nombre décimal.`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[r6(p / 10), t('Percent means per hundred. Divide by 100, not 10.', 'Pour cent signifie par cent. Divise par 100, pas par 10.'), 0], [r6(p / 1000), t('Divide by 100, not 1 000.', 'Divise par 100, pas par 1 000.'), 0], [p, t('A percent must be divided by 100 to become a decimal.', 'Un pourcentage doit être divisé par 100 pour devenir un décimal.'), 0]]),
    steps: [t('Percent means "out of 100", so divide by 100.', 'Pour cent signifie « sur 100 » : divise par 100.'), bi((f) => f.t(`${f.m(`${f.n(p)} \\div 100`)} = ${f.N(ans)}.`, `${f.m(`${f.n(p)} \\div 100`)} = ${f.N(ans)}.`))],
    nudge: t('Divide by 100: move the decimal point two places to the left.', 'Divise par 100 : déplace la virgule de deux positions vers la gauche.'),
  };
});

// ── Algebra ─────────────────────────────────────────────────────────────────────

/** MS.G7.C1.2.a: patterns with whole numbers and decimals, expressions and equations */
export const patterns7 = numGen('MS.G7.C1.2.a', (tier, r) => {
  if (tier === 1) {
    const a = pick(r, [0.5, 1.5, 2.5, 0.25, 0.75]), s = randInt(r, 1, 4) * a, first = randInt(r, 1, 5);
    const seq = [0, 1, 2, 3].map((i) => r6(first + s * i)), ans = r6(first + s * 4);
    return {
      prompt: bi((f) => f.t(`A pattern starts ${seq.map((v) => f.N(v)).join(', ')}. What is the next term?`, `Une suite commence par ${seq.map((v) => f.N(v)).join(', ')}. Quel est le terme suivant ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(ans + s), t('That skips a term. Add the common difference once to the last term.', 'Cela saute un terme. Ajoute la différence commune une seule fois au dernier terme.'), 1], [r6(seq[3]! + 1), t('The terms grow by the same amount each time. Find that amount first.', 'Les termes augmentent du même montant chaque fois. Trouve d\'abord ce montant.'), 0], [r6(ans - s), t('That is the last term. The next term is one step more.', 'C\'est le dernier terme. Le terme suivant est un pas de plus.'), 1]]),
      steps: [bi((f) => f.t(`The terms grow by ${f.N(s)} each time.`, `Les termes augmentent de ${f.N(s)} chaque fois.`)), bi((f) => f.t(`${f.m(`${f.n(seq[3]!)} + ${f.n(s)}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(seq[3]!)} + ${f.n(s)}`)} = ${f.N(ans)}.`))],
      nudge: t('Subtract two neighbouring terms to find the common difference.', 'Soustrais deux termes voisins pour trouver la différence commune.'),
    };
  }
  const m = pick(r, [0.5, 1.5, 2.5, 3, 4, 6]), b = randInt(r, 2, 9);
  const coef = (f: F): string => f.n(m);
  if (tier === 2) {
    const n = randInt(r, 4, 20), ans = r6(m * n + b);
    return {
      prompt: bi((f) => f.t(`A pattern follows the rule ${f.m(`C = ${coef(f)}n + ${f.n(b)}`)}, where n is the term number. What is C when n = ${f.N(n)}?`, `Une suite suit la règle ${f.m(`C = ${coef(f)}n + ${f.n(b)}`)}, où n est le numéro du terme. Que vaut C quand n = ${f.N(n)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(m * (n + b)), t('Multiply n by the coefficient first, then add the constant. The constant is not multiplied.', 'Multiplie d\'abord n par le coefficient, puis ajoute la constante. La constante n\'est pas multipliée.'), 0], [r6(m + n + b), t('The coefficient multiplies n; it is not added.', 'Le coefficient multiplie n ; il ne s\'additionne pas.'), 0], [r6(m * n), t('Do not forget to add the constant.', 'N\'oublie pas d\'ajouter la constante.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`C = ${coef(f)} \\times ${f.n(n)} + ${f.n(b)}`)}.`, `${f.m(`C = ${coef(f)} \\times ${f.n(n)} + ${f.n(b)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(r6(m * n))} + ${f.n(b)}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(r6(m * n))} + ${f.n(b)}`)} = ${f.N(ans)}.`))],
      nudge: t('Put n in the rule, multiply, then add.', 'Remplace n dans la règle, multiplie, puis additionne.'),
    };
  }
  const n = randInt(r, 5, 30), val = r6(m * n + b);
  return {
    prompt: bi((f) => f.t(`A pattern follows the rule ${f.m(`C = ${coef(f)}n + ${f.n(b)}`)}. Which term number n has C = ${f.N(val)}?`, `Une suite suit la règle ${f.m(`C = ${coef(f)}n + ${f.n(b)}`)}. Quel numéro de terme n donne C = ${f.N(val)} ?`)),
    answer: n, category: 'AP',
    wrong: wr(n, [[r6(val / m - b), t('Subtract the constant first, then divide by the coefficient.', 'Soustrais d\'abord la constante, puis divise par le coefficient.'), 0], [r6((val + b) / m), t('The constant must be subtracted, not added.', 'La constante doit être soustraite, pas additionnée.'), 0], [r6(val - b), t('That is only the first step. Divide by the coefficient too.', 'C\'est seulement la première étape. Divise aussi par le coefficient.'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`${coef(f)}n + ${f.n(b)} = ${f.n(val)}`)}, so ${f.m(`${coef(f)}n = ${f.n(r6(val - b))}`)}.`, `${f.m(`${coef(f)}n + ${f.n(b)} = ${f.n(val)}`)}, donc ${f.m(`${coef(f)}n = ${f.n(r6(val - b))}`)}.`)), bi((f) => f.t(`${f.m(`n = ${f.n(r6(val - b))} \\div ${coef(f)}`)} = ${f.N(n)}.`, `${f.m(`n = ${f.n(r6(val - b))} \\div ${coef(f)}`)} = ${f.N(n)}.`))],
    nudge: t('Undo the steps in reverse order: subtract the constant, then divide.', 'Annule les étapes dans l\'ordre inverse : soustrais la constante, puis divise.'),
  };
});

/** MS.G7.C3.1.a: code with defined counts and sub-programs */
export const subprograms7 = numGen('MS.G7.C3.1.a', (tier, r) => {
  if (tier === 1) {
    const x0 = randInt(r, 1, 6), k = randInt(r, 2, 5), c = randInt(r, 2, 4);
    let x = x0; for (let i = 0; i < k; i++) x *= c;
    return {
      prompt: bi((f) => f.t(`A sub-program called grow takes a number x and gives back x × ${f.N(c)}. The main program sets x to ${f.N(x0)}, then calls grow on x ${f.N(k)} times, saving the result in x each time. What is x at the end?`, `Un sous-programme nommé grow prend un nombre x et retourne x × ${f.N(c)}. Le programme principal met x à ${f.N(x0)}, puis appelle grow sur x ${f.N(k)} fois, en gardant le résultat dans x chaque fois. Que vaut x à la fin ?`)),
      answer: x, category: 'AP',
      wrong: wr(x, [[x0 * c * k, t('Each call multiplies the new value, so the amounts compound. It is repeated multiplication, not one multiplication by the count.', 'Chaque appel multiplie la nouvelle valeur : les montants se composent. C\'est une multiplication répétée, pas une seule multiplication par le nombre d\'appels.'), 1], [x0 + c * k, t('grow multiplies; it does not add.', 'grow multiplie ; il n\'additionne pas.'), 1], [x / c, t('The sub-program is called one time too few here. Count every call.', 'Le sous-programme est appelé une fois de trop ou de moins ici. Compte chaque appel.'), 1]]),
      steps: [bi((f) => { const vs = [x0]; for (let i = 0; i < k; i++) vs.push(vs[i]! * c); return f.t(`After each call x is ${vs.map((v) => f.N(v)).join(', then ')}.`, `Après chaque appel, x vaut ${vs.map((v) => f.N(v)).join(', puis ')}.`); }), bi((f) => f.t(`At the end x = ${f.N(x)}.`, `À la fin, x = ${f.N(x)}.`))],
      nudge: t('Run the sub-program once at a time, writing x after each call.', 'Exécute le sous-programme une fois à la fois, en notant x après chaque appel.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 3, 6), a = randInt(r, 2, 5), b = randInt(r, 1, 6);
    let total = 0; for (let n = 1; n <= k; n++) total += a * n + b;
    return {
      prompt: bi((f) => f.t(`A sub-program called cost takes n and gives back ${f.N(a)} × n + ${f.N(b)}. The main program sets total to ${f.N(0)}, then for each n from ${f.N(1)} to ${f.N(k)} adds cost(n) to total. What is total at the end?`, `Un sous-programme nommé cost prend n et retourne ${f.N(a)} × n + ${f.N(b)}. Le programme principal met total à ${f.N(0)}, puis pour chaque n de ${f.N(1)} à ${f.N(k)} ajoute cost(n) à total. Que vaut total à la fin ?`)),
      answer: total, category: 'AP',
      wrong: wr(total, [[a * k + b, t('That is cost(n) for the last n only. The loop adds a value for every n.', 'C\'est cost(n) pour le dernier n seulement. La boucle ajoute une valeur pour chaque n.'), 1], [total - b, t('The constant is added once for every n, not just once in total.', 'La constante s\'ajoute pour chaque n, pas une seule fois au total.'), 1], [a * ((k * (k + 1)) / 2), t('Each call also adds the constant, so the total is bigger.', 'Chaque appel ajoute aussi la constante : le total est plus grand.'), 1]]),
      steps: [bi((f) => f.t(`The values are ${Array.from({ length: k }, (_, i) => f.N(a * (i + 1) + b)).join(', ')}.`, `Les valeurs sont ${Array.from({ length: k }, (_, i) => f.N(a * (i + 1) + b)).join(', ')}.`)), bi((f) => f.t(`Their sum is ${f.N(total)}.`, `Leur somme est ${f.N(total)}.`))],
      nudge: t('Work out cost(n) for each n, then add the results.', 'Calcule cost(n) pour chaque n, puis additionne les résultats.'),
    };
  }
  const k = randInt(r, 3, 7), sq = (n: number): number => n * n;
  let total = 0; for (let n = 1; n <= k; n++) total += sq(n);
  return {
    prompt: bi((f) => f.t(`A sub-program called square takes n and gives back n × n. The main program sets total to ${f.N(0)}, then for each n from ${f.N(1)} to ${f.N(k)}: if n is odd, add square(n) to total; otherwise subtract ${f.N(1)} from total. What is total at the end?`, `Un sous-programme nommé square prend n et retourne n × n. Le programme principal met total à ${f.N(0)}, puis pour chaque n de ${f.N(1)} à ${f.N(k)} : si n est impair, ajoute square(n) à total ; sinon, soustrais ${f.N(1)} de total. Que vaut total à la fin ?`)),
    answer: (() => { let tt = 0; for (let n = 1; n <= k; n++) tt += n % 2 === 1 ? sq(n) : -1; return tt; })(), category: 'TH',
    wrong: wr((() => { let tt = 0; for (let n = 1; n <= k; n++) tt += n % 2 === 1 ? sq(n) : -1; return tt; })(), [[total, t('Even numbers take the other branch: they subtract 1 instead of adding a square.', 'Les nombres pairs suivent l\'autre branche : ils soustraient 1 au lieu d\'ajouter un carré.'), 1], [(() => { let tt = 0; for (let n = 1; n <= k; n++) tt += n % 2 === 1 ? sq(n) : 0; return tt; })(), t('Do not forget to subtract 1 for each even n.', 'N\'oublie pas de soustraire 1 pour chaque n pair.'), 1], [(() => { let tt = 0; for (let n = 1; n <= k; n++) tt += n % 2 === 0 ? sq(n) : -1; return tt; })(), t('Odd numbers add the square; even numbers subtract 1.', 'Les nombres impairs ajoutent le carré ; les nombres pairs soustraient 1.'), 1]]),
    steps: [bi((f) => f.t(`Go through n = ${Array.from({ length: k }, (_, i) => f.N(i + 1)).join(', ')}: odd n add n × n, even n subtract ${f.N(1)}.`, `Parcours n = ${Array.from({ length: k }, (_, i) => f.N(i + 1)).join(', ')} : les n impairs ajoutent n × n, les n pairs soustraient ${f.N(1)}.`)), bi((f) => { let tt = 0; for (let n = 1; n <= k; n++) tt += n % 2 === 1 ? sq(n) : -1; return f.t(`The total is ${f.N(tt)}.`, `Le total est ${f.N(tt)}.`); })],
    nudge: t('Decide for each n whether it is odd or even, then follow that branch.', 'Décide pour chaque n s\'il est impair ou pair, puis suis cette branche.'),
  };
});

/** MS.G7.C3.2.a: read and alter code */
export const alterCode7 = numGen('MS.G7.C3.2.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 6), n1 = randInt(r, 3, 6), n2 = n1 + randInt(r, 2, 5);
    const sum = (n: number): number => a * ((n * (n + 1)) / 2);
    return {
      prompt: bi((f) => f.t(`A program adds ${f.N(a)}, ${f.N(2 * a)}, ${f.N(3 * a)}, and so on, for ${f.N(n1)} terms and prints the total. The count is changed to ${f.N(n2)}. What does the program print now?`, `Un programme additionne ${f.N(a)}, ${f.N(2 * a)}, ${f.N(3 * a)}, et ainsi de suite, pour ${f.N(n1)} termes et affiche le total. Le nombre de termes devient ${f.N(n2)}. Qu'affiche maintenant le programme ?`)),
      answer: sum(n2), category: 'AP',
      wrong: wr(sum(n2), [[sum(n1), t('That is the old output. The new count means more terms are added.', 'C\'est l\'ancienne sortie. Le nouveau nombre signifie qu\'on ajoute plus de termes.'), 0], [a * n2, t('That is only the last term. The program adds all the terms.', 'C\'est seulement le dernier terme. Le programme additionne tous les termes.'), 0], [sum(n1) + a * (n2 - n1), t('The new terms keep growing, so each one is bigger than the last old term.', 'Les nouveaux termes continuent de grandir : chacun est plus grand que le dernier ancien terme.'), 0]]),
      steps: [bi((f) => f.t(`The terms are ${Array.from({ length: n2 }, (_, i) => f.N(a * (i + 1))).join(', ')}.`, `Les termes sont ${Array.from({ length: n2 }, (_, i) => f.N(a * (i + 1))).join(', ')}.`)), bi((f) => f.t(`Their sum is ${f.N(sum(n2))}.`, `Leur somme est ${f.N(sum(n2))}.`))],
      nudge: t('Write out all the terms for the new count and add them.', 'Écris tous les termes pour le nouveau nombre et additionne-les.'),
    };
  }
  if (tier === 2) {
    const m1 = randInt(r, 2, 4), m2 = m1 + randInt(r, 1, 3), c = randInt(r, 1, 5), x = randInt(r, 2, 9);
    return {
      prompt: bi((f) => f.t(`A sub-program gives back n × ${f.N(m1)} + ${f.N(c)}. It is changed to n × ${f.N(m2)} + ${f.N(c)}. What does the changed sub-program give back for n = ${f.N(x)}?`, `Un sous-programme retourne n × ${f.N(m1)} + ${f.N(c)}. Il devient n × ${f.N(m2)} + ${f.N(c)}. Que retourne le sous-programme modifié pour n = ${f.N(x)} ?`)),
      answer: x * m2 + c, category: 'AP',
      wrong: wr(x * m2 + c, [[x * m1 + c, t('That is the old sub-program. Use the new multiplier.', 'C\'est l\'ancien sous-programme. Utilise le nouveau multiplicateur.'), 0], [x * (m2 + c), t('The constant is added after multiplying; it is not multiplied.', 'La constante s\'ajoute après la multiplication ; elle n\'est pas multipliée.'), 0], [x * m2, t('Do not forget to add the constant.', 'N\'oublie pas d\'ajouter la constante.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(x)} \\times ${f.n(m2)} + ${f.n(c)}`)}.`, `${f.m(`${f.n(x)} \\times ${f.n(m2)} + ${f.n(c)}`)}.`)), bi((f) => f.t(`The result is ${f.N(x * m2 + c)}.`, `Le résultat est ${f.N(x * m2 + c)}.`))],
      nudge: t('Use the changed rule, not the old one: multiply, then add.', 'Utilise la règle modifiée, pas l\'ancienne : multiplie, puis additionne.'),
    };
  }
  const start = randInt(r, 1, 8), add = randInt(r, 3, 7), goal = randInt(r, 30, 80);
  const times = Math.ceil((goal - start) / add);
  return {
    prompt: bi((f) => f.t(`A program sets x to ${f.N(start)} and repeats "add ${f.N(add)} to x". How many times must the repeat run for x to be at least ${f.N(goal)}?`, `Un programme met x à ${f.N(start)} et répète « ajouter ${f.N(add)} à x ». Combien de fois la répétition doit-elle s'exécuter pour que x soit au moins ${f.N(goal)} ?`)),
    answer: times, category: 'TH',
    wrong: wr(times, [[times - 1, t('After that many repeats x is still below the goal. Check the last value.', 'Après ce nombre de répétitions, x est encore sous l\'objectif. Vérifie la dernière valeur.'), 1], [times + 1, t('One fewer repeat already reaches the goal.', 'Une répétition de moins atteint déjà l\'objectif.'), 1], [Math.floor((goal - start) / add), t('Rounding down leaves x below the goal. Round up to the next whole repeat.', 'Arrondir vers le bas laisse x sous l\'objectif. Arrondis vers le haut jusqu\'à la répétition entière suivante.'), 1]]),
    steps: [bi((f) => f.t(`x needs to grow by ${f.m(`${f.n(goal)} - ${f.n(start)}`)} = ${f.N(goal - start)}.`, `x doit augmenter de ${f.m(`${f.n(goal)} - ${f.n(start)}`)} = ${f.N(goal - start)}.`)), bi((f) => f.t(`${f.m(`${f.n(goal - start)} \\div ${f.n(add)}`)} is not whole unless it divides exactly, so round up: ${f.N(times)} repeats.`, `${f.m(`${f.n(goal - start)} \\div ${f.n(add)}`)} n'est entier que s'il divise exactement : arrondis vers le haut : ${f.N(times)} répétitions.`))],
    nudge: t('Divide the growth needed by the amount added each time, and round up to a whole number of repeats.', 'Divise la croissance nécessaire par le montant ajouté chaque fois et arrondis vers le haut à un nombre entier de répétitions.'),
  };
});
