import { useState } from 'preact/hooks';
import { api } from '../api';
import { speak, speechSupported } from '../speech';
import { getLang, t } from '../i18n';
import type { StudentSettings } from '../learnTypes';

/** Voice and display options. Voice is off by default; nothing is sent anywhere. */
export function Settings({ settings, onChange, go }: { settings: StudentSettings; onChange: (s: StudentSettings) => void; go: (to: string) => void }) {
  const [saving, setSaving] = useState(false);
  // Optimistic: the switch moves at once, then the saved value from the server is applied.
  const patch = async (p: Partial<StudentSettings>) => {
    const previous = settings;
    onChange({ ...settings, ...p });
    setSaving(true);
    const r = await api<{ settings: StudentSettings }>('PATCH', '/learn/settings', p);
    setSaving(false);
    if (r.ok) onChange(r.data.settings); else onChange(previous);
  };
  const toggle = (key: keyof StudentSettings, label: string, help?: string) => (
    <label class="check switch">
      <input type="checkbox" checked={!!settings[key]} onChange={(e) => void patch({ [key]: (e.target as HTMLInputElement).checked })} />
      <span><strong>{label}</strong>{help && <span class="muted small block">{help}</span>}</span>
    </label>
  );
  return (
    <section class="card" aria-labelledby="set-title">
      <h1 id="set-title">{t('learn.settings')}</h1>
      <h2>{t('settings.voice')}</h2>
      {speechSupported() ? (
        <>
          {toggle('voice', t('settings.voiceOn'), t('settings.voiceHelp'))}
          {settings.voice && (
            <>
              {toggle('autoRead', t('settings.autoRead'))}
              <label for="rate">{t('settings.speed')}: {(settings.voiceRate ?? 1).toFixed(1)}×</label>
              <input id="rate" type="range" min={0.5} max={2} step={0.1} value={settings.voiceRate ?? 1} onChange={(e) => void patch({ voiceRate: Number((e.target as HTMLInputElement).value) })} />
              <button type="button" class="secondary" onClick={() => speak(t('settings.sample'), getLang(), settings.voiceRate ?? 1)}>🔊 {t('settings.try')}</button>
            </>
          )}
        </>
      ) : <p class="note">{t('settings.noVoice')}</p>}
      <h2>{t('settings.display')}</h2>
      {toggle('highContrast', t('settings.contrast'))}
      {toggle('dyslexiaFont', t('settings.dyslexia'), t('settings.dyslexiaHelp'))}
      {toggle('reducedMotion', t('settings.motion'), t('settings.motionHelp'))}
      {toggle('plainBackground', t('settings.plain'), t('settings.plainHelp'))}
      <button type="button" onClick={() => go('/app/learn')}>{t('common.back')}</button>
    </section>
  );
}
