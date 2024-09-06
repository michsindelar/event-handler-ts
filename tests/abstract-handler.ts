import AbstractHandler from 'event-handler-ts/Handler/AbstractHandler';
import AutoDisposeListener from 'event-handler-ts/Listener/AutoDisposeListener';
import { ListenerInterface, Target } from 'event-handler-ts/Listener/types';
import Listener from 'event-handler-ts/Listener/Listener';
import { Event, NonTriggerHandler } from 'event-handler-ts/Handler/types';
import { describe, test, jest, expect } from '@jest/globals';
import { Mock } from 'jest-mock';
import mockFn from './fn.mock';
import ListenerInterfaceMock from './ListenerInterface.mock';

class Handler<T extends Event> extends AbstractHandler<Event>
{
}

const events: [ symbol, string, number, string, string, symbol ] = [ Symbol('first'), 'second', 3, 'FOURTH', 'FifthEvent', Symbol('SIXTH') ];
Object.freeze(events);


test('constructor', () => {
    expect(() => new Handler<Event>(events)).not.toThrow();
    expect(() => new Handler<Event>([ ...events, 'sixth' ])).not.toThrow();
    expect(() => new Handler<Event>([ ...events, 'second' ])).toThrow();

    const handler: NonTriggerHandler<Event> = new Handler<Event>(events, true);
    [ 'onFirst', 'onSecond', 'on3', 'on', 'onFourth', 'onFifthEvent', 'onSixth' ]
        .forEach((name: string) => expect(typeof handler[name as keyof Handler<Event>]).toBe('function'));
});


test('events', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);

    events.forEach((event) => expect(handler.events.includes(event)).toBe(true));
    expect(handler.events.length).toBe(events.length);
    handler.events.push('third');
    expect(handler.events.length).toBe(events.length);
});


test('listeners', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);
    const listeners: ListenerInterface<Event>[] = [ 0, 0, 1, 4, 5].map((i: number) => new ListenerInterfaceMock<Event>(events[i]));
    listeners.forEach((listener) => handler.assign(listener));

    listeners.forEach((listener) => expect(handler.listeners.includes(listener)).toBe(true));
    expect(handler.listeners.length).toBe(listeners.length);
    handler.listeners.push(new ListenerInterfaceMock<Event>(events[1]));
    expect(handler.listeners.length).toBe(listeners.length);
});


test('isHandleable', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);

    events.forEach(event => expect(handler.isHandleable(event)).toBe(true));
    expect(handler.isHandleable(Symbol('SIXTH'))).toBe(false);
    expect(handler.isHandleable(Symbol('first'))).toBe(false);
    expect(handler.isHandleable('third')).toBe(false);
});


test('assign', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);
    const listener: ListenerInterface<symbol> = new ListenerInterfaceMock<symbol>(events[0]);

    expect(handler.assign(listener)).toBe(true);
    expect(handler.assign(listener)).toBe(false);
});


test('has', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);
    const listener1: ListenerInterface<symbol> = new ListenerInterfaceMock<typeof events[0]>(events[0]);
    const listener2: ListenerInterface<symbol> = new ListenerInterfaceMock<typeof events[0]>(events[0]);
    handler.assign(listener1);

    expect(handler.has(listener1)).toBe(true);
    expect(handler.has(listener2)).toBe(false);
});


test('on', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);

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

describe('off', () => {
    const getData = (): [ NonTriggerHandler<Event>, ListenerInterface<Event>[], args: any[] ] => {
        const handler: NonTriggerHandler<Event> = new Handler<Event>(events);
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

    test('removal of all listener', () => {
        const [ handler, listeners, args ] = getData();
        handler.off();
        listeners.forEach((listener) => expect(handler.has(listener)).toBe(false));
        expect(handler.listeners).toHaveLength(0);
    });

    test('removal of listener by event', () => {
        const [ handler, listeners, args ] = getData();
        events.forEach((event) => {
            listeners.forEach((listener) => listener.event === event && expect(handler.has(listener)).toBe(true));
            handler.off(event);
            listeners.forEach((listener) => listener.event === event && expect(handler.has(listener)).toBe(false));
        });
        expect(handler.listeners).toHaveLength(0);
    });

    test('removal of listener by target', () => {
        const [ handler, listeners, args ] = getData();
        let count: number = listeners.length;
        args.filter(([ target ]) => typeof target === 'object')
            .map(([ target ]) => target)
            .forEach((target) => {
                const autoDisposeListeners: AutoDisposeListener<Event>[] = listeners.filter((listener): listener is AutoDisposeListener<Event> => listener instanceof AutoDisposeListener && listener.target === target);
                autoDisposeListeners.forEach((listener) => expect(handler.has(listener)).toBe(true));
                handler.off(target);
                autoDisposeListeners.forEach((listener) => expect(handler.has(listener)).toBe(false));
                count -= autoDisposeListeners.length;
                expect(handler.listeners).toHaveLength(count);
            });
        const basicListeners = listeners.filter((listener) => listener instanceof Listener);
        basicListeners.forEach((listener) => expect(handler.has(listener)).toBe(true));
        expect(handler.listeners).toHaveLength(basicListeners.length);
    });

    test('removal of listener by target and event', () => {
        const [ handler, listeners, args ] = getData();
        let count: number = listeners.length;
        args.filter(([ target ]) => typeof target === 'object')
            .map(([ target ]) => target)
            .forEach((target) => {
                  events.forEach((event) => {
                      const autoDisposeListeners: AutoDisposeListener<Event>[] = listeners.filter((listener): listener is AutoDisposeListener<Event> => listener instanceof AutoDisposeListener && listener.target === target && listener.event === event);
                      autoDisposeListeners.forEach((listener) => expect(handler.has(listener)).toBe(true));
                      handler.off(target, event);
                      autoDisposeListeners.forEach((listener) => expect(handler.has(listener)).toBe(false));
                      count -= autoDisposeListeners.length;
                      expect(handler.listeners).toHaveLength(count);
                  });
            });
        const basicListeners = listeners.filter((listener) => listener instanceof Listener);
        basicListeners.forEach((listener) => expect(handler.has(listener)).toBe(true));
        expect(handler.listeners).toHaveLength(basicListeners.length);
    });
});


test('dispose', () => {
    const handler: NonTriggerHandler<Event> = new Handler<Event>(events);
    const mockDispose = jest.fn();
    const listener: ListenerInterface<Event> = new ListenerInterfaceMock<Event>(events[0], undefined, undefined, handler, undefined, mockDispose);

    handler.assign(listener);
    expect(handler.has(listener)).toBe(true);
    handler.dispose(listener);
    expect(handler.has(listener)).toBe(false);
    expect(mockDispose.mock.calls).toHaveLength(1);
});
