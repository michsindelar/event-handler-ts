import { jest, describe, expect, test } from '@jest/globals';
import mockFn from './fn.mock';
import PlainHandlerInterfaceMock from './PlainHandlerInterface.mock';
import AutoDisposeListener from '../lib/Listener/AutoDisposeListener';
import { Event } from '../lib/Handler/types';
import { ListenerInterface, Target, AutoDisposeCallback } from '../lib/Listener/types';

const gc: Function = () => global?.gc !== undefined && global.gc();
const events: [ symbol, string, number ] = [ Symbol('first'), 'second', 3 ];


test('gc', () => expect(global?.gc).toBeInstanceOf(Function));


test('constructor', () => {
    const handler = new PlainHandlerInterfaceMock<Event>(events);

    expect(() => new AutoDisposeListener<Event>(handler, events[0], {}, 'myFn' as keyof Target)).toThrow();
    expect(() => new AutoDisposeListener<Event>(handler, events[0], { 'myFn': 'myProp' }, 'myFn' as keyof Target)).toThrow();
    expect(handler.listeners).toHaveLength(0);
});


test('target', async () => {
    const handler = new PlainHandlerInterfaceMock<Event>(events);
    let target: Target | null = {};
    const listener = new AutoDisposeListener<Event>(handler, events[0], target, () => {});

    await new Promise(resolve => setTimeout(resolve, 0));
    gc();
    expect(listener.target).toBe(target);

    target = null;
    await new Promise(resolve => setTimeout(resolve, 0));
    gc();
    expect(listener.target).toBe(undefined);
});


test('call', () => {
    const args: any[][] = [
        [ null, undefined, 555 ],
        [ 'abc', 123, new Date() ],
        [ 'xyz' ],
        [ null ],
        []
    ];
    const targetFactories: (() => { target: Target; callback: AutoDisposeCallback; mock?: Function; })[] = [
        () => ({ target: {}, callback: mockFn() }),
        () => {
            const target = { callback: mockFn() };
            return { target: target, callback: target.callback };
        },
        () => ({ target: { myCallback: mockFn() }, callback: 'myCallback' as keyof Target }),
        () => ({ target: { 12: mockFn() }, callback: 12  as keyof Target }),
        () => ({ target: [ mockFn() ], callback: 0 as keyof Target }),
        () => {
            const mock: Function = mockFn();
            const target = new class {
                myCallback()
                {
                    mock(...arguments);
                }
            };
            return { target: target, callback: 'myCallback' as keyof Target, mock: mock };
        },
        () => {
            const mock: Function = mockFn();
            const target = new class {
                myCallback()
                {
                    mock(...arguments);
                }
            };
            return { target: target, callback: target.myCallback as keyof Target, mock: mock };
        }
    ];

    targetFactories.forEach((factory, index) => {
        const { target, callback, mock } = factory();
        const mockDispose = jest.fn();
        const handler = new PlainHandlerInterfaceMock<Event>(events, undefined, mockDispose);
        const listener: ListenerInterface<Event> = new AutoDisposeListener<Event>(handler, events[0], target, callback);
        const mockCallback: Function = mock ?? (callback instanceof Function? callback: target[callback]);

        args.forEach((args, index) => {
            listener.call(...args);
            expect(mockCallback).toHaveBeenLastCalledWith(...args);
        });
        listener.dispose();
        expect(mockDispose.mock.calls).toHaveLength(1);
        expect(() => listener.call(...args[0])).toThrow();
    });

    args.forEach((args, index) => {
        targetFactories.forEach((factory, index) => {
            const { target, callback, mock } = factory();
            const mockDispose = jest.fn();
            const handler = new PlainHandlerInterfaceMock<Event>(events, undefined, mockDispose);
            const listener: ListenerInterface<Event> = new AutoDisposeListener<Event>(handler, events[0], target, callback, true);
            const mockCallback: Function = mock ?? (callback instanceof Function? callback: target[callback]);

            listener.call(...args);
            expect(mockCallback).toHaveBeenLastCalledWith(...args);
            expect(mockDispose.mock.calls).toHaveLength(1);
            expect(() => listener.call(...args[0])).toThrow();
        });
    });
});
