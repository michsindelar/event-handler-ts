import AbstractListener from './AbstractListener';
import { Event, PlainHandlerInterface } from '../Handler/types';
import { isTarget, isAutoDisposeCallback } from './guards';
import { Target, AutoDisposeCallback } from './types';


class AutoDisposeListener<T extends Event> extends AbstractListener<Event>
{
    protected readonly _target: WeakRef<object>;
    protected readonly _callback: WeakMap<Target,Function>;
    protected readonly _registry: FinalizationRegistry<undefined>;

    get target(): object | undefined
    {
        return this._target.deref();
    }

    constructor(handler: PlainHandlerInterface<T>, event: T, target: Target, callback: AutoDisposeCallback, once: boolean = false)
    {
        if (!isTarget(target)) {
            throw new Error('The target argument is not of the type Target.');
        }
        if (!isAutoDisposeCallback(callback)) {
            throw new Error('The callback argument is not of the type AutoDisposeCallback.');
        }
        if (!(callback instanceof Function)) {
            if (!(callback in target) || !(target[callback] as any instanceof Function)) {
                throw new Error('The given callback argument is not a function of target.');
            }
            callback = (target[callback] as Function).bind(target);
        }

        super(handler, event, once);

        this._callback = new WeakMap();
        this._callback.set(target, callback);
        Object.defineProperty(this, '_callback', { configurable: false, writable: false });

        this._registry = new FinalizationRegistry(this.dispose.bind(this));
        this._registry.register(target, undefined, this);
        Object.defineProperty(this, '_registry', { configurable: false, writable: false });

        this._target = new WeakRef(target);
        Object.defineProperty(this, '_target', { configurable: false, writable: false });
    }

    call(...args: any[]): void
    {
        if (!this._handler.has(this)) {
            throw new Error('The listener was disposed.');
        }
        const target = this.target;
        if (target === undefined) {
            return;
        }
        const callback = this._callback.get(target);
        if (callback === undefined) {
            return;
        }

        callback(...args);
        if (!this.once) {
            return;
        }
        this.dispose();
    }

    dispose(): void
    {
        this._registry.unregister(this);
        super.dispose();
    }
}

export default AutoDisposeListener;
