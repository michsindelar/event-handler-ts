import { Target, Callback, AutoDisposeCallback } from './types';


export function isTarget(arg: any): arg is Target
{
    return typeof arg === 'object';
}

export function isCallback(arg: any): arg is Callback
{
    return arg instanceof Function;
}

export function isAutoDisposeCallback(arg: any): arg is AutoDisposeCallback
{
    return isCallback(arg) || [ 'symbol', 'string', 'number' ].includes(typeof arg);
}
