import { Event } from '../Handler/types';


export type Callback = (...args: any[]) => void;
export type Target = object;
export type AutoDisposeCallback = Callback | keyof Target;

export interface ListenerInterface<T extends Event>
{
    readonly event: T;
    readonly once: boolean;
    call(...args: any[]): void;
    dispose(): void;
}
