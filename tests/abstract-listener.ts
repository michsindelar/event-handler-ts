import { jest, expect, test } from '@jest/globals';
import PlainHandlerInterfaceMock from './PlainHandlerInterface.mock';
import AbstractListener from '../lib/Listener/AbstractListener';
import { Event, PlainHandlerInterface } from '../lib/Handler/types';

class Listener<Event> extends AbstractListener<Event>
{
    call(...args: any[]): void
    {}
}


test('constructor', () => {
    const events: [ symbol, string, number ] = [ Symbol('first'), 'second', 3 ];
    const mockAssign = jest.fn();
    const handler = new PlainHandlerInterfaceMock<Event>(events, mockAssign);

    events.forEach((event, index) => {
        const listener: Listener<Event> = new Listener<Event>(handler, event);
        expect(listener.event).toBe(event);
        expect(listener.once).toBe(false);
        expect(mockAssign.mock.calls).toHaveLength(index + 1);
    });

    events.forEach((event, index) => {
        const listener: Listener<Event> = new Listener<Event>(handler, event, true);
        expect(listener.event).toBe(event);
        expect(listener.once).toBe(true);
        expect(mockAssign.mock.calls).toHaveLength(events.length + index + 1);
    });
});


test('dispose', () => {
    const events: [ symbol, string, number ] = [ Symbol('first'), 'second', 3 ];
    const mockDispose = jest.fn();
    const handler = new PlainHandlerInterfaceMock<Event>(events, undefined, mockDispose);
    const listener: Listener<Event> = new Listener<Event>(handler, events[0]);
    handler.assign(listener);
    listener.dispose();
    expect(mockDispose.mock.calls).toHaveLength(1);
});
