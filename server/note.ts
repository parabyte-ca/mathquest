import { z } from 'zod';

export const NOTE_MAX = 500;
const LINKISH = /(https?:|www\.|\b[a-z0-9-]+\.(?:com|net|org|ca|io|app|co|me|info|xyz|es)\b)/i;

/**
 * An optional personal note for an invitation email. Plain text only: control characters are removed, blank runs are collapsed,
 * and anything that looks like a link or address is refused, so the note can never add a clickable link to the message.
 */
export const noteSchema = z
  .string()
  .max(NOTE_MAX * 2)
  .transform((s) => s.replace(/\r\n?/g, '\n').replace(/[^\P{C}\n\t]/gu, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim())
  .refine((s) => s.length <= NOTE_MAX, 'too_long')
  .refine((s) => !LINKISH.test(s), 'has_link')
  .optional();

/** The note as quoted lines, so it cannot pass for part of the message around it. */
export const quoteNote = (note: string): string => note.split('\n').map((l) => `> ${l}`).join('\n');
