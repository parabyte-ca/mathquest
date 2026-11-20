import type { Config } from './config.js';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}
export interface Mailer {
  send(msg: MailMessage): Promise<void>;
}

/** Sends through Resend's HTTP API. The API base is configurable so tests can point at a mock. */
export class ResendMailer implements Mailer {
  constructor(private cfg: Pick<Config, 'resendApiKey' | 'resendApiBase' | 'mailFrom'>) {}
  async send(msg: MailMessage): Promise<void> {
    if (!this.cfg.resendApiKey) {
      // Never print message bodies: they can contain sign-in links.
      console.warn(`[mail] RESEND_API_KEY not set; message "${msg.subject}" not sent`);
      return;
    }
    try {
      const res = await fetch(`${this.cfg.resendApiBase}/emails`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.cfg.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.cfg.mailFrom, to: [msg.to], subject: msg.subject, text: msg.text }),
      });
      if (!res.ok) console.error(`[mail] Resend responded ${res.status} for "${msg.subject}"`);
    } catch (e) {
      console.error(`[mail] send failed for "${msg.subject}": ${(e as Error).message}`);
    }
  }
}

/** Captures messages in memory (unit tests). */
export class MemoryMailer implements Mailer {
  outbox: MailMessage[] = [];
  async send(msg: MailMessage): Promise<void> {
    this.outbox.push(msg);
  }
}
