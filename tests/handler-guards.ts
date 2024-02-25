import { expect, test } from '@jest/globals';
import { isEvent } from '../lib/Handler/guards';


test('isEvent', () => {
    expect(isEvent('event')).toBe(true);
    expect(isEvent(3)).toBe(true);
    expect(isEvent(Symbol('event'))).toBe(true);
    expect(isEvent({})).toBe(false);
    expect(isEvent(new Date())).toBe(false);
    expect(isEvent(() => {})).toBe(false);
});
