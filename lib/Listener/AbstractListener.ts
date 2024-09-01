import { ListenerInterface } from './types';
import { isEvent } from '../Handler/guards';
import { Event, PlainHandlerInterface } from '../Handler/types';


abstract class AbstractListener<T extends Event> implements ListenerInterface<Event>
{
    protected readonly _handler: PlainHandlerInterface<T>;

    readonly once: boolean;
    readonly event: T;

    constructor(handler: PlainHandlerInterface<T>, event: T, once: boolean = false)
    {
        if (!isEvent(event)) {
            throw new Error('The given event callback argument must be of type Event.');
        }
        this.event = event;
        this.once = once === true;
        this._handler = handler;
        this._handler.assign(this);
        Object.defineProperty(this, '_handler', { configurable: false, writable: false });
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
