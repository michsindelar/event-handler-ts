import Listener from '../Listener/Listener';
import AutoDisposeListener from '../Listener/AutoDisposeListener';
import { Target, AutoDisposeCallback, ListenerInterface } from '../Listener/types';

export type Event = symbol | string | number;

export interface PlainHandlerInterface<Event>
{
    readonly events: Event[];
    readonly listeners: ListenerInterface<Event>[];

    isHandleable(event: Event): boolean;
    assign(listener: ListenerInterface<Event>): boolean;
    has(listener: ListenerInterface<Event>): boolean;
    dispose(listener: ListenerInterface<Event>): void;
}

export interface NonTriggerHandler<Event> extends PlainHandlerInterface<Event>
{
    on(event: Event, callback: Function, once?: boolean): Listener<Event>;
    on(event: Event, target: Target, callback: AutoDisposeCallback, once?: boolean): AutoDisposeListener<Event>;
    off(): void;
    off(event: Event): void;
    off(target: Target, event: Event): void;
}

export interface HandlerInterface<Event> extends NonTriggerHandler<Event>
{
    trigger(event: Event, ...args: any[]): void;
}
