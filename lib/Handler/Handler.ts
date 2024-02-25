import AbstractHandler from './AbstractHandler';
import { Event, HandlerInterface } from './types';


class Handler<Event> extends AbstractHandler<Event> implements HandlerInterface<Event>
{
    trigger(event: Event, ...args: any[]): void
    {
        this._trigger(event, ...args);
    }
}

export default Handler;
