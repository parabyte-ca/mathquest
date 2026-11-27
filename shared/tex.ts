// TeX macros shared by every place that draws maths. `\dollar` is the dollar sign: writing it as a macro keeps a literal "$" out of the
// text, where it would be mistaken for the start or end of maths ($...$).
export const TEX_MACROS: Record<string, string> = { '\\dollar': '\\text{\\$}' };

/** What shows before KaTeX has loaded: the TeX as written, but with the dollar sign as a dollar sign. */
export const rawTex = (tex: string): string => tex.replace(/\\dollar\s?/g, '$').replace(/\\ /g, ' ');
