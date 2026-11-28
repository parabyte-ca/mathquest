import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from './i18n';
import { Icon } from './icons';

/**
 * The header's one round menu button. It opens a soft sheet holding Help, Language, Sign out and the like. A disclosure, not an ARIA menu:
 * a button that says whether it is open, and a list of ordinary buttons and links. Escape closes it and returns focus to the button,
 * so does a tap outside it, and choosing an item closes it (an item marked data-keep stays open, such as the install help).
 */
export function NavMenu({ children }: { children: ComponentChildren }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const restore = useRef(false); // Escape sends focus back to the button, once the sheet has gone

  useEffect(() => {
    if (!open) return;
    sheet.current?.querySelector<HTMLElement>('button, a')?.focus();
    const key = (e: KeyboardEvent): void => { if (e.key === 'Escape') { restore.current = true; setOpen(false); } };
    const outside = (e: Event): void => { if (!sheet.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [open]);

  useEffect(() => { if (!open && restore.current) { restore.current = false; button.current?.focus(); } }, [open]);

  return (
    <div class="menuwrap">
      <button type="button" class="menubtn" ref={button} aria-label={t('nav.menu')} aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen(!open)}>
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>
      {open && (
        <div id="nav-sheet" class="navsheet" ref={sheet} onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-keep]') && (e.target as HTMLElement).closest('button, a')) setOpen(false); }}>
          {children}
        </div>
      )}
    </div>
  );
}
