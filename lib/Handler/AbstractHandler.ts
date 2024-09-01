import Listener from '../Listener/Listener';
import AutoDisposeListener from '../Listener/AutoDisposeListener';
import { isCallback, isAutoDisposeCallback } from '../Listener/guards';
import { Target, Callback, AutoDisposeCallback, ListenerInterface } from '../Listener/types';
import { isEvent } from './guards';
import { Event, NonTriggerHandler } from './types';


abstract class AbstractHandler<T extends Event> implements NonTriggerHandler<Event>
{
    protected readonly _events = new Set<T>();
    protected readonly _listeners = new Set<ListenerInterface<T>>();


    get events(): T[]
    {
        return [ ...this._events ];
    }

    get listeners(): ListenerInterface<T>[]
    {
        return [ ...this._listeners ];
    }

    constructor(events: T[], generateOnEventMethods: boolean = false)
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

        Object.defineProperty(this, '_events', { configurable: false, writable: false });
        Object.defineProperty(this, '_listeners', { configurable: false, writable: false });

        if (generateOnEventMethods !== true) {
            return;
        }
        const methods: Record<string, ((callback: Callback, once?: boolean) => Listener<T>) | ((target: Target, callback: AutoDisposeCallback, once?: boolean) => AutoDisposeListener<T>)> = {};
        this._events.forEach((event: T) => {
            const name: string = this._getOnEventMethodName(event);
            if (name in this) {
                throw new Error(`The property name "${name}" already exists.`);
            }
            methods[name] = this.on.bind(this, event);
        });
        Object.assign(this, methods);
    }

    protected _getOnEventMethodName(event: T): string
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

    protected _trigger(event: T, ...args: any[])
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

    isHandleable(event: T): boolean
    {
        return this._events.has(event);
    }

    assign(listener: ListenerInterface<T>): boolean
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

    on(event: T, callback: Callback, once?: boolean): Listener<T>;
    on(event: T, target: Target, callback: AutoDisposeCallback, once?: boolean): AutoDisposeListener<T>;
    on(arg1: T, arg2: Callback | Target, arg3?: boolean | AutoDisposeCallback, arg4?: boolean): Listener<T> | AutoDisposeListener<T>
    {
        if (!this.isHandleable(arg1)) {
            throw new Error('The event is unhandleable.');
        }
        let listener: Listener<T> | AutoDisposeListener<T>;
        if (isCallback(arg2)) {
            if (arg3 !== undefined && typeof arg3 !== 'boolean') {
                throw new Error('The once argument is not of the type boolean.');
            }
            listener = new Listener<T>(this, arg1, arg2, arg3);
        } else {
            if (!isAutoDisposeCallback(arg3)) {
                throw new Error('The callback argument is not of the type AutoDisposeCallback.');
            }
            listener = new AutoDisposeListener<T>(this, arg1, arg2, arg3, arg4);
        }
        return listener;
    }

    off(): void;
    off(event: T): void;
    off(target: Target, event?: T): void;
    off(arg1?: Target | T, arg2?: T): void
    {
        const event: T | null = arg2 !== undefined? arg2: (arg1 !== undefined && typeof arg1 !== 'object'? arg1: null);
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

    has(listener: ListenerInterface<T>): boolean
    {
        return this._listeners.has(listener);
    }

    dispose(listener: ListenerInterface<T>): void
    {
        if (!this.has(listener)) {
            return;
        }
        this._listeners.delete(listener);
        listener.dispose();
    }
}

export default AbstractHandler;
