// Which stage of an upgrade is done, current, failed or waiting, for the admin Updates page.
export type StepKey = 'backup' | 'download' | 'verify' | 'deploy' | 'health' | 'rollback' | 'done';
export interface StepStatus { state: string; step: StepKey | null }
export type StepState = 'done' | 'current' | 'failed' | 'pending';

export const STEP_ORDER: StepKey[] = ['backup', 'download', 'verify', 'deploy', 'health'];

/** Each step as done, current, failed or waiting, from where the upgrade is (or stopped). A rollback adds a final step. */
export function stepStates(st: StepStatus): { key: StepKey; state: StepState }[] {
  const at = st.step ? STEP_ORDER.indexOf(st.step) : -1;
  const rows = STEP_ORDER.map((key, i) => {
    let state: StepState = 'pending';
    if (st.state === 'succeeded') state = 'done';
    else if (['validating', 'running', 'queued'].includes(st.state)) state = at < 0 ? 'pending' : i < at ? 'done' : i === at ? 'current' : 'pending';
    else if (st.state === 'failed' || st.state === 'rolled_back') {
      const failedAt = st.step === 'rollback' || st.step === 'health' ? 4 : at;
      state = failedAt < 0 ? 'pending' : i < failedAt ? 'done' : i === failedAt ? 'failed' : 'pending';
    }
    return { key, state };
  });
  if (st.state === 'rolled_back' || (st.state === 'failed' && st.step === 'rollback')) rows.push({ key: 'rollback', state: st.state === 'rolled_back' ? 'done' : 'failed' });
  return rows;
}
