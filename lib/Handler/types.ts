import Listener from '../Listener/Listener';
import AutoDisposeListener from '../Listener/AutoDisposeListener';
import { Target, AutoDisposeCallback, ListenerInterface } from '../Listener/types';


export type Event = symbol | string | number;

export interface PlainHandlerInterface<T extends Event>
{
    readonly events: T[];
    readonly listeners: ListenerInterface<T>[];

    isHandleable(event: T): boolean;
    assign(listener: ListenerInterface<T>): boolean;
    has(listener: ListenerInterface<T>): boolean;
    dispose(listener: ListenerInterface<T>): void;
}

export interface NonTriggerHandler<T extends Event> extends PlainHandlerInterface<Event>
{
    on(event: T, callback: Function, once?: boolean): Listener<T>;
    on(event: T, target: Target, callback: AutoDisposeCallback, once?: boolean): AutoDisposeListener<T>;
    off(): void;
    off(event: T): void;
    off(target: Target, event?: T): void;
}

export interface HandlerInterface<T extends Event> extends NonTriggerHandler<Event>
{
    trigger(event: T, ...args: any[]): void;
}
