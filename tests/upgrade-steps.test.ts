import { describe, it, expect } from 'vitest';
import { stepStates } from '../web/src/upgradeSteps.js';

const states = (state: string, step: Parameters<typeof stepStates>[0]['step']) => stepStates({ state, step }).map((x) => `${x.key}:${x.state}`);

describe('upgrade steps on the admin page', () => {
  it('marks earlier steps done, the running one current, and later ones waiting', () => {
    expect(states('running', 'verify')).toEqual(['backup:done', 'download:done', 'verify:current', 'deploy:pending', 'health:pending']);
    expect(states('running', 'backup')[0]).toBe('backup:current');
    expect(states('running', null)).toEqual(['backup:pending', 'download:pending', 'verify:pending', 'deploy:pending', 'health:pending']);
  });
  it('marks everything done once it has succeeded', () => {
    expect(states('succeeded', 'done').every((x) => x.endsWith(':done'))).toBe(true);
  });
  it('marks the stage that failed, with nothing after it done', () => {
    expect(states('failed', 'verify')).toEqual(['backup:done', 'download:done', 'verify:failed', 'deploy:pending', 'health:pending']);
  });
  it('shows a rollback as a final step after an unhealthy start', () => {
    expect(states('rolled_back', 'rollback')).toEqual(['backup:done', 'download:done', 'verify:done', 'deploy:done', 'health:failed', 'rollback:done']);
    expect(states('failed', 'rollback').at(-1)).toBe('rollback:failed');
  });
  it('shows nothing for stages it does not know', () => {
    expect(stepStates({ state: 'idle', step: null }).every((x) => x.state === 'pending')).toBe(true);
  });
});
