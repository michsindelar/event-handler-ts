import { PlainHandlerInterface } from '../lib/Handler/types';
import { ListenerInterface } from '../lib/Listener/types';
import { Event } from '../lib/Handler/types';


class PlainHandlerInterfaceMock<Event> implements PlainHandlerInterface<Event>
{
    readonly events: Event[];
    readonly listeners: ListenerInterface<Event>[] = [];

    private readonly mocks: { isHandleable: Function; assign: Function; has: Function; dispose: Function; };

    constructor(events: Event[], assign: Function = () => {}, dispose: Function = () => {}, isHandleable: Function = () => {}, has: Function = () => {})
    {
        this.events = events.reduce((result: Event[], event: Event) => result.includes(event)? result: [ ...result, event ], []);
        this.mocks = { isHandleable, assign, has, dispose };
    }

    isHandleable(event: Event): boolean
    {
        this.mocks.isHandleable(...arguments);
        return this.events.includes(event);
    }

    assign(listener: ListenerInterface<Event>): boolean
    {
        this.mocks.assign(...arguments);
        if (this.listeners.includes(listener)) {
            return false;
        }
        this.listeners.push(listener);
        return true;
    }

    has(listener: ListenerInterface<Event>): boolean
    {
        this.mocks.has(...arguments);
        return this.listeners.includes(listener);
    }

    dispose(listener: ListenerInterface<Event>): void
    {
        this.mocks.dispose(...arguments);
        const index = this.listeners.indexOf(listener);
        if (index === -1) {
            return;
        }
        this.listeners.splice(index);
    }
}

export default PlainHandlerInterfaceMock;
