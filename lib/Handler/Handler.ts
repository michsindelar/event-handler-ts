import AbstractHandler from './AbstractHandler';
import { Event, HandlerInterface } from './types';


class Handler<T extends Event> extends AbstractHandler<Event> implements HandlerInterface<Event>
{
    trigger(event: T, ...args: any[]): void
    {
        this._trigger(event, ...args);
    }
}

export default Handler;
