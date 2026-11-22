import type { Config } from './config.js';

export interface MailMessage {
  to: string;
  subject: string;
  /** The plain-text copy: the reference version, with full links. */
  text: string;
  /** An optional rich version, sent alongside the text. */
  html?: string;
}
export interface Mailer {
  /** Resolves true when the provider accepted the message. Never throws. */
  send(msg: MailMessage): Promise<boolean>;
}

/** Sends through Resend's HTTP API. The API base is configurable so tests can point at a mock. */
export class ResendMailer implements Mailer {
  constructor(private cfg: Pick<Config, 'resendApiKey' | 'resendApiBase' | 'mailFrom'>) {}
  async send(msg: MailMessage): Promise<boolean> {
    if (!this.cfg.resendApiKey) {
      // Never print message bodies: they can contain sign-in links.
      console.warn(`[mail] RESEND_API_KEY not set; message "${msg.subject}" not sent`);
      return false;
    }
    try {
      const res = await fetch(`${this.cfg.resendApiBase}/emails`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.cfg.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.cfg.mailFrom, to: [msg.to], subject: msg.subject, text: msg.text, ...(msg.html ? { html: msg.html } : {}) }),
      });
      if (res.ok) return true;
      // Resend's error body names the problem (unverified domain, key restricted to another domain, ...).
      const detail = await res.text().then((t) => t.slice(0, 300)).catch(() => '');
      console.error(`[mail] Resend responded ${res.status} for "${msg.subject}" (from ${this.cfg.mailFrom}): ${detail}`);
      if (res.status === 403 || res.status === 422) {
        console.error('[mail] Hint: MAIL_FROM must use a domain verified in Resend, and the API key must be allowed to send from it.');
      }
      return false;
    } catch (e) {
      console.error(`[mail] send failed for "${msg.subject}": ${(e as Error).message}`);
      return false;
    }
  }
}

/** Captures messages in memory (unit tests). */
export class MemoryMailer implements Mailer {
  outbox: MailMessage[] = [];
  async send(msg: MailMessage): Promise<boolean> {
    this.outbox.push(msg);
    return true;
  }
}
