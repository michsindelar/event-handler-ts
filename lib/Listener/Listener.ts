import AbstractListener from './AbstractListener';
import { isCallback } from './guards';
import { Callback } from './types';
import { Event, PlainHandlerInterface } from '../Handler/types';


class Listener<Event> extends AbstractListener<Event>
{
    protected readonly _callback: Callback;

    constructor(handler: PlainHandlerInterface<Event>, event: Event, callback: Callback, once: boolean = false)
    {
        if (!isCallback(callback)) {
            throw new Error('The callback argument is not of the type Callback.');
        }
        super(handler, event, once);
        this._callback = callback;
    }

    call(...args: any[]): void
    {
        if (!this._handler.has(this)) {
            throw new Error('The listener was disposed.');
        }

        this._callback(...args);
        if (!this.once) {
            return;
        }
        this.dispose();
    }
}

export default Listener;
