import { ListenerInterface } from './types';
import { isEvent } from '../Handler/guards';
import { Event, PlainHandlerInterface } from '../Handler/types';


abstract class AbstractListener<Event> implements ListenerInterface<Event>
{
    protected readonly _handler: PlainHandlerInterface<Event>;

    readonly once: boolean;
    readonly event: Event;

    constructor(handler: PlainHandlerInterface<Event>, event: Event, once: boolean = false)
    {
        if (!isEvent(event)) {
            throw new Error('The given event callback argument must be of type Event.');
        }
        this.event = event;
        this.once = once === true;
        this._handler = handler;
        this._handler.assign(this);
    }

    abstract call(...args: any[]): void;

    dispose(): void
    {
        if (!this._handler.has(this)) {
            return;
        }
        this._handler.dispose(this);
    }
}

export default AbstractListener;
