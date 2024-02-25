import Listener from '../Listener/Listener';
import AutoDisposeListener from '../Listener/AutoDisposeListener';
import { isCallback, isAutoDisposeCallback } from '../Listener/guards';
import { Target, Callback, AutoDisposeCallback, ListenerInterface } from '../Listener/types';
import { isEvent } from './guards';
import { Event, NonTriggerHandler } from './types';


abstract class AbstractHandler<Event> implements NonTriggerHandler<Event>
{
    protected readonly _events = new Set<Event>();
    protected readonly _listeners = new Set<ListenerInterface<Event>>();


    get events(): Event[]
    {
        return [ ...this._events ];
    }

    get listeners(): ListenerInterface<Event>[]
    {
        return [ ...this._listeners ];
    }

    constructor(events: Event[], generateOnEventMethods: boolean = false)
    {
        if (!Array.isArray(events) || events.length === 0) {
             throw new Error('First argument must be an non-empty array.');
        }
        for (const event of events) {
            if (!isEvent(event)) {
                throw new Error('First argument must be an array of items of the Event.');
            }
            if (this._events.has(event)) {
                throw new Error('Event must not be repeated.');
            }
            this._events.add(event);
        }
        if (generateOnEventMethods !== true) {
            return;
        }
        const methods: { [key: string]: Function } = {};
        this._events.forEach((event: Event) => {
            const name: string = this._getOnEventMethodName(event);
            if (name in this) {
                throw new Error(`The property name "${name}" already exists.`);
            }
            methods[name] = this.on.bind(this, event);
        });
        Object.assign(this, methods);
    }

    protected _getOnEventMethodName(event: Event): string
    {
        if (!isEvent(event)) {
            throw new Error('Argument must be of type Event.');
        }
        let name: string = String(event);
        if (typeof event === 'symbol') {
            name = name.replace(/Symbol\((.*)\)/, '$1');
        }
        return 'on' + (name.match(/([A-Z0-9]{2,}|[A-Z][a-z0-9]+|[a-z0-9]+)/g) || [])
            .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
            .join('');
    }

    protected _trigger(event: Event, ...args: any[])
    {
        if (!this.isHandleable(event)) {
            throw new Error('The event is unhandleable.');
        }
        this._listeners.forEach((listener) => {
            if (listener.event !== event) {
                return;
            }
            try {
                listener.call(...args);
            } catch (e) {
                console.error(e);
            }
        });
    }

    isHandleable(event: Event): boolean
    {
        return this._events.has(event);
    }

    assign(listener: ListenerInterface<Event>): boolean
    {
        if (this.has(listener)) {
            return false;
        }
        if (!this.isHandleable(listener.event)) {
            throw new Error('The event of the listener is unhandleable.');
        }
        this._listeners.add(listener);
        return true;
    }

    on(event: Event, callback: Callback, once?: boolean): Listener<Event>;
    on(event: Event, target: Target, callback: AutoDisposeCallback, once?: boolean): AutoDisposeListener<Event>;
    on(arg1: Event, arg2: Callback | Target, arg3?: boolean | AutoDisposeCallback, arg4?: boolean): Listener<Event> | AutoDisposeListener<Event>
    {
        if (!this.isHandleable(arg1)) {
            throw new Error('The event is unhandleable.');
        }
        let listener: Listener<Event> | AutoDisposeListener<Event>;
        if (isCallback(arg2)) {
            if (arg3 !== undefined && typeof arg3 !== 'boolean') {
                throw new Error('The once argument is not of the type boolean.');
            }
            listener = new Listener<Event>(this, arg1, arg2, arg3);
        } else {
            if (!isAutoDisposeCallback(arg3)) {
                throw new Error('The callback argument is not of the type AutoDisposeCallback.');
            }
            listener = new AutoDisposeListener<Event>(this, arg1, arg2, arg3, arg4);
        }
        return listener;
    }

    off(): void;
    off(event: Event): void;
    off(target: Target, event: Event): void;
    off(arg1?: Target | Event, arg2?: Event): void
    {
        const event: Event | null = arg2 !== undefined? arg2: (arg1 !== undefined && typeof arg1 !== 'object'? arg1: null);
        if (event !== null && !this.isHandleable(event)) {
            throw new Error('The event is unhandleable.');
        }
        const target: Target | null = typeof arg1 === 'object'? arg1: null;
        this._listeners.forEach((listener) => {
            if (event !== null && listener.event !== event) {
                return;
            }
            if (target !== null && listener instanceof AutoDisposeListener && listener.target !== target) {
                return;
            }
            listener.dispose();
        });
    }

    has(listener: ListenerInterface<Event>): boolean
    {
        return this._listeners.has(listener);
    }

    dispose(listener: ListenerInterface<Event>): void
    {
        if (!this.has(listener)) {
            return;
        }
        this._listeners.delete(listener);
        listener.dispose();
    }
}

export default AbstractHandler;
