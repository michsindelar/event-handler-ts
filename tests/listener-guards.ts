import { expect, test } from '@jest/globals';
import { isTarget, isCallback, isAutoDisposeCallback } from '../lib/Listener/guards';


test('isTarget', () => {
    expect(isTarget({})).toBe(true);
    expect(isTarget(new Date())).toBe(true);
    expect(isTarget('target')).toBe(false);
    expect(isTarget(3)).toBe(false);
    expect(isTarget(Symbol('target'))).toBe(false);
});


test('isCallback', () => {
    expect(isCallback(() => {})).toBe(true);
    expect(isCallback(function() {})).toBe(true);
    expect(isCallback(new Function('x', 'y', 'return x + y'))).toBe(true);
    expect(isCallback('target')).toBe(false);
    expect(isCallback(3)).toBe(false);
    expect(isCallback(Symbol('target'))).toBe(false);
    expect(isCallback({})).toBe(false);
    expect(isCallback(new Date())).toBe(false);
});


test('isAutoDisposeCallback', () => {
    expect(isAutoDisposeCallback(() => {})).toBe(true);
    expect(isAutoDisposeCallback(function() {})).toBe(true);
    expect(isAutoDisposeCallback(new Function('x', 'y', 'return x + y'))).toBe(true);
    expect(isAutoDisposeCallback('target')).toBe(true);
    expect(isAutoDisposeCallback(3)).toBe(true);
    expect(isAutoDisposeCallback(Symbol('target'))).toBe(true);
    expect(isAutoDisposeCallback({})).toBe(false);
    expect(isAutoDisposeCallback(new Date())).toBe(false);
});
