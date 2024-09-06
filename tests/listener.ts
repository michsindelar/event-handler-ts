import Listener from 'event-handler-ts/Listener/Listener';
import { Event } from 'event-handler-ts/Handler/types';
import { ListenerInterface } from 'event-handler-ts/Listener/types';
import { jest, describe, expect, test } from '@jest/globals';
import mockFn from './fn.mock';
import PlainHandlerInterfaceMock from './PlainHandlerInterface.mock';

const events: [ symbol, string, number ] = [ Symbol('first'), 'second', 3 ];


test('call', () => {
    const mockDispose = jest.fn();
    const handler = new PlainHandlerInterfaceMock<Event>(events, undefined, mockDispose);
    const args: any[][] = [
        [ null, undefined, 555 ],
        [ 'abc', 123, new Date() ],
        [ 'xyz' ],
        [ null ],
        []
    ];

    const mockCallback1 = mockFn();
    const listener1: ListenerInterface<Event> = new Listener<Event>(handler, events[0], mockCallback1);

    args.forEach((args, index) => {
        listener1.call(...args);
        expect(mockCallback1).toHaveBeenLastCalledWith(...args);
    });
    listener1.dispose();
    expect(mockDispose.mock.calls).toHaveLength(1);
    expect(() => listener1.call(...args[0])).toThrow();


    const mockCallback2 = mockFn();
    const listener2: ListenerInterface<Event> = new Listener<Event>(handler, events[0], mockCallback2, true);

    listener2.call(...args[0]);
    expect(mockCallback2).toHaveBeenLastCalledWith(...args[0]);
    expect(mockDispose.mock.calls).toHaveLength(2);
    expect(() => listener2.call(...args[0])).toThrow();
});
