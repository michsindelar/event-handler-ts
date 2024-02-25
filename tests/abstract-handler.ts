import { jest, expect, test } from '@jest/globals';
import { Mock } from 'jest-mock';
import AbstractHandler from '../lib/Handler/AbstractHandler';
import mockFn from './fn.mock';
import ListenerInterfaceMock from './ListenerInterface.mock';
import Listener from '../lib/Listener/Listener';
import AutoDisposeListener from '../lib/Listener/AutoDisposeListener';
import { ListenerInterface, Target } from '../lib/Listener/types';
import { Event } from '../lib/Handler/types';

class Handler<Event> extends AbstractHandler<Event>
{
}

const events: [ symbol, string, number, string, string, symbol ] = [ Symbol('first'), 'second', 3, 'FOURTH', 'FifthEvent', Symbol('SIXTH') ];
Object.freeze(events);


test('constructor', () => {
    expect(() => new Handler<Event>(events)).not.toThrow();
    expect(() => new Handler<Event>([ ...events, 'sixth' ])).not.toThrow();
    expect(() => new Handler<Event>([ ...events, 'second' ])).toThrow();

    const handler: Handler<Event> = new Handler<Event>(events, true);
    [ 'onFirst', 'onSecond', 'on3', 'on', 'onFourth', 'onFifthEvent', 'onSixth' ]
        .forEach((name: string) => expect(typeof handler[name as keyof Handler<Event>]).toBe('function'));
});


test('events', () => {
    const handler: Handler<Event> = new Handler<Event>(events);

    events.forEach((event) => expect(handler.events.includes(event)).toBe(true));
    expect(handler.events.length).toBe(events.length);
    handler.events.push('third');
    expect(handler.events.length).toBe(events.length);
});

test('listeners', () => {
    const handler: Handler<Event> = new Handler<Event>(events);
    const listeners: ListenerInterface<Event>[] = [ 0, 0, 1, 4, 5].map((i: number) => new ListenerInterfaceMock<Event>(events[i]));
    listeners.forEach((listener) => handler.assign(listener));

    listeners.forEach((listener) => expect(handler.listeners.includes(listener)).toBe(true));
    expect(handler.listeners.length).toBe(listeners.length);
    handler.listeners.push(new ListenerInterfaceMock<Event>(events[1]));
    expect(handler.listeners.length).toBe(listeners.length);
});


test('isHandleable', () => {
    const handler: Handler<Event> = new Handler<Event>(events);

    events.forEach(event => expect(handler.isHandleable(event)).toBe(true));
    expect(handler.isHandleable(Symbol('SIXTH'))).toBe(false);
    expect(handler.isHandleable(Symbol('first'))).toBe(false);
    expect(handler.isHandleable('third')).toBe(false);
});


test('assign', () => {
    const handler: Handler<Event> = new Handler<Event>(events);
    const listener: ListenerInterface<symbol> = new ListenerInterfaceMock<symbol>(events[0]);

    expect(handler.assign(listener)).toBe(true);
    expect(handler.assign(listener)).toBe(false);
});


test('has', () => {
    const handler: Handler<Event> = new Handler<Event>(events);
    const listener1: ListenerInterface<symbol> = new ListenerInterfaceMock<typeof events[0]>(events[0]);
    const listener2: ListenerInterface<symbol> = new ListenerInterfaceMock<typeof events[0]>(events[0]);
    handler.assign(listener1);

    expect(handler.has(listener1)).toBe(true);
    expect(handler.has(listener2)).toBe(false);
});


test('on', () => {
    const handler: Handler<Event> = new Handler<Event>(events);

    const listenerArgs: (boolean | undefined)[] = [ true, false, undefined ];
    events.forEach((event) => {
        listenerArgs.forEach((once) => {
            const callback = mockFn();
            const listener = handler.on(event, callback, once);
            expect(listener).toBeInstanceOf(Listener);
            expect(listener.event).toBe(event);
            expect(listener.once).toBe(once || false);
            listener.call();
            expect((callback as Mock).mock.calls).toHaveLength(1);
        });
    });

    const autoDisposeListenerArgs: [ Target, boolean? ][] = [
        [ {}, true ],
        [ { prop: 'prop' }, false ],
        [ [] ]
    ];
    events.forEach((event) => {
        autoDisposeListenerArgs.forEach(([ target, once ]) => {
            const callback = mockFn();
            const listener = handler.on(event, target, callback, once);
            expect(listener).toBeInstanceOf(AutoDisposeListener);
            expect(listener.target).toBe(target);
            expect(listener.event).toBe(event);
            expect(listener.once).toBe(once || false);
            listener.call();
            expect((callback as Mock).mock.calls).toHaveLength(1);
        });
    });
});


test('off', () => {
    const getData = (): [ Handler<Event>, ListenerInterface<Event>[], args: any[] ] => {
        const handler: Handler<Event> = new Handler<Event>(events);
        const listenerArgs: ([ boolean? ] | [ Target, boolean? ])[] = [
            [ {}, true ],
            [ false ],
            [ { prop: 'prop' }, false ],
            [ [] ],
            [ true ],
            []
        ];
        const listeners: ListenerInterface<Event>[] = listenerArgs.reduce((listeners: ListenerInterface<Event>[], args: ([ boolean? ] | [ Target, boolean? ])) => {
            events.forEach((event) => {
                if (typeof args[0] === 'object') {
                    listeners.push(new AutoDisposeListener(handler, event, args[0], () => {}, args[1]));
                    return;
                }
                listeners.push(new Listener(handler, event, () => {}, args[0]));
            });
            return listeners;
        }, []);

        return [ handler, listeners, listenerArgs ];
    }

    const [ handler1, listeners1, args1 ] = getData();
    handler1.off();
    listeners1.forEach((listener) => expect(handler1.has(listener)).toBe(false));
    expect(handler1.listeners).toHaveLength(0);

    const [ handler2, listeners2, args2 ] = getData();
    events.forEach((event) => {
        listeners2.forEach((listener) => listener.event === event && expect(handler2.has(listener)).toBe(true));
        handler2.off(event);
        listeners2.forEach((listener) => listener.event === event && expect(handler2.has(listener)).toBe(false));
    });
    expect(handler2.listeners).toHaveLength(0);

    const [ handler3, listeners3, args3 ] = getData();
    args3.filter(([ target ]) => typeof target === 'object')
        .map(([ target ]) => target)
        .forEach((target) => {
            const listeners: AutoDisposeListener<Event>[] = listeners3.filter((listener): listener is AutoDisposeListener<Event> => listener instanceof AutoDisposeListener && listener.target === target);
            listeners.forEach((listener) => expect(handler3.has(listener)).toBe(true));
            handler3.off(target);
            listeners.forEach((listener) => expect(handler3.has(listener)).toBe(false));
        });
    expect(handler3.listeners).toHaveLength(0);

    const [ handler4, listeners4, args4 ] = getData();
    args3.filter(([ target ]) => typeof target === 'object')
        .map(([ target ]) => target)
        .forEach((target) => {
              events.forEach((event) => {
                  const listeners: AutoDisposeListener<Event>[] = listeners4.filter((listener): listener is AutoDisposeListener<Event> => listener instanceof AutoDisposeListener && listener.target === target && listener.event === event);
                  listeners.forEach((listener) => expect(handler4.has(listener)).toBe(true));
                  handler4.off(target, event);
                  listeners.forEach((listener) => expect(handler4.has(listener)).toBe(false));
              });
        });

    expect(handler4.listeners).toHaveLength(listeners4.filter((listener) => listener instanceof Listener).length);
});


test('dispose', () => {
    const handler: Handler<Event> = new Handler<Event>(events);
    const mockDispose = jest.fn();
    const listener: ListenerInterface<Event> = new ListenerInterfaceMock<Event>(events[0], undefined, undefined, handler, undefined, mockDispose);

    handler.assign(listener);
    expect(handler.has(listener)).toBe(true);
    handler.dispose(listener);
    expect(handler.has(listener)).toBe(false);
    expect(mockDispose.mock.calls).toHaveLength(1);
});
