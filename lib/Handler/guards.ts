import { Event } from './types';


export function isEvent(arg: any): arg is Event
{
    return [ 'symbol', 'string', 'number' ].includes(typeof arg);
}
