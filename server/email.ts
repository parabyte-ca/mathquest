// A small HTML email template in the look of the app: the app's blue, a wordmark, a card, a clear button and a muted footer.
// Table-based with inline styles so it holds up in mail clients; a `prefers-color-scheme` block gives a dark version where
// the client supports it. Every value from a person (names, notes, goal titles) is escaped. The plain-text part stays the
// reference copy, with the full link, for clients that block links or images.
export type EmailLang = 'en' | 'fr';

export interface EmailSection {
  heading?: string;
  /** Short lines under the heading, in the order given. */
  lines?: string[];
  /** A personal note, shown as a quotation. */
  quote?: { text: string; from?: string };
}
export interface EmailSpec {
  lang: EmailLang;
  title: string;
  /** The short summary some clients show next to the subject. */
  preheader?: string;
  intro?: string[];
  sections?: EmailSection[];
  button?: { label: string; url: string };
  /** Small print under the button or content. */
  outro?: string[];
  /** The address the app is served from, for the logo. */
  baseUrl: string;
}

export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const para = (s: string, extra = ''): string => `<p style="margin:0 0 14px;font-size:16px;line-height:1.5;${extra}" class="mq-text">${esc(s).replace(/\n/g, '<br>')}</p>`;

/** True only for an http(s) address, so a link can never be a script or data URL. */
const safeUrl = (u: string): string => (/^https?:\/\//i.test(u) ? esc(u) : '#');

export function renderEmail(s: EmailSpec): string {
  const logo = `${s.baseUrl.replace(/\/$/, '')}/icons/icon-192.png`;
  const body: string[] = [];
  for (const p of s.intro ?? []) body.push(para(p));
  for (const sec of s.sections ?? []) {
    if (sec.heading) body.push(`<h2 style="margin:18px 0 6px;font-size:18px;line-height:1.3;" class="mq-text">${esc(sec.heading)}</h2>`);
    if (sec.quote) {
      body.push(`<blockquote style="margin:0 0 14px;padding:8px 14px;border-left:4px solid #1565c0;background:#eef3fd;font-size:16px;line-height:1.5;" class="mq-quote">${esc(sec.quote.text).replace(/\n/g, '<br>')}${sec.quote.from ? `<br><span style="font-size:14px;color:#566074;" class="mq-muted">— ${esc(sec.quote.from)}</span>` : ''}</blockquote>`);
    }
    if (sec.lines?.length) {
      body.push(`<ul style="margin:0 0 14px;padding-left:20px;font-size:16px;line-height:1.5;" class="mq-text">${sec.lines.map((l) => `<li style="margin:0 0 4px;">${esc(l)}</li>`).join('')}</ul>`);
    }
  }
  if (s.button) {
    body.push(`<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0;"><tr><td style="border-radius:8px;background:#1565c0;" class="mq-btn"><a href="${safeUrl(s.button.url)}" style="display:inline-block;padding:14px 28px;min-height:20px;font-size:17px;font-weight:600;line-height:20px;color:#ffffff;text-decoration:none;border-radius:8px;" class="mq-btn-a">${esc(s.button.label)}</a></td></tr></table>`);
  }
  for (const p of s.outro ?? []) body.push(para(p, 'font-size:14px;color:#566074;'));
  return `<!doctype html>
<html lang="${s.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${esc(s.title)}</title>
<style>
@media (prefers-color-scheme: dark) {
  .mq-bg { background:#0f1624 !important; } .mq-card { background:#182236 !important; border-color:#2b3a57 !important; }
  .mq-text { color:#eef2fa !important; } .mq-muted { color:#a6b1c8 !important; } .mq-quote { background:#1d2a45 !important; color:#eef2fa !important; } .mq-brand { color:#6ea2ff !important; }
  .mq-btn { background:#6ea2ff !important; } .mq-btn-a { color:#0b1220 !important; }
}
</style></head>
<body style="margin:0;padding:0;background:#f5f7fb;" class="mq-bg">
${s.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(s.preheader)}</div>` : ''}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f7fb;" class="mq-bg"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#14213d;">
<tr><td style="padding:0 4px 14px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="vertical-align:middle;"><img src="${esc(logo)}" width="36" height="36" alt="" style="display:block;border-radius:8px;"></td><td style="vertical-align:middle;padding-left:10px;font-size:22px;font-weight:700;color:#1565c0;" class="mq-brand">MathQuest</td></tr></table></td></tr>
<tr><td style="background:#ffffff;border:1px solid #d5dbe6;border-top:4px solid #1565c0;border-radius:12px;padding:24px 22px;" class="mq-card">
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;" class="mq-text">${esc(s.title)}</h1>
${body.join('\n')}
</td></tr>
</table></td></tr></table></body></html>`;
}
