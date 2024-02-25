import { PlainHandlerInterface } from '../lib/Handler/types';
import { ListenerInterface } from '../lib/Listener/types';
import { Event } from '../lib/Handler/types';


class ListenerInterfaceMock<Event> implements ListenerInterface<Event>
{
    readonly event: Event;
    readonly once: boolean;

    private readonly callback: Function | undefined;
    private readonly handler: PlainHandlerInterface<Event> | undefined;

    private readonly mocks: { call: Function; dispose: Function; };

    constructor(event: Event, once: boolean = false, callback?: Function, handler?: PlainHandlerInterface<Event>, call: Function = () => {}, dispose: Function = () => {})
    {
        this.event = event;
        this.once = once;
        this.callback = callback;
        this.handler = handler;
        this.mocks = { call, dispose };
    }

    call(...args: any[]): void
    {
        this.mocks.call(...arguments);
        if (this.callback === undefined || this.handler === undefined || !this.handler.has(this)) {
            return;
        }
        this.callback(...args);
        if (this.once === false) {
            return;
        }
        this.handler.dispose(this);
    }

    dispose(): void
    {
        this.mocks.dispose(...arguments);
        if (this.handler === undefined) {
            return;
        }
        this.handler.dispose(this);
    }
}

export default ListenerInterfaceMock;
