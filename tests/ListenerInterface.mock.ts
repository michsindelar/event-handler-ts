import { PlainHandlerInterface } from 'event-handler-ts/Handler/types';
import { ListenerInterface } from 'event-handler-ts/Listener/types';
import { Event } from 'event-handler-ts/Handler/types';


class ListenerInterfaceMock<T extends Event> implements ListenerInterface<Event>
{
    readonly event: T;
    readonly once: boolean;

    private readonly callback: Function | undefined;
    private readonly handler: PlainHandlerInterface<T> | undefined;

    private readonly mocks: { call: Function; dispose: Function; };

    constructor(event: T, once: boolean = false, callback?: Function, handler?: PlainHandlerInterface<T>, call: Function = () => {}, dispose: Function = () => {})
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
