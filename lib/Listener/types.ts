import { Event } from '../Handler/types';

export type Callback = Function;
export type Target = object;
export type AutoDisposeCallback = Callback | keyof Target;

export interface ListenerInterface<Event>
{
    readonly event: Event;
    readonly once: boolean;
    call(...args: any[]): void;
    dispose(): void;
}
