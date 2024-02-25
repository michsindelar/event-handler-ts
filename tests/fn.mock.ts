import { FunctionLike } from 'jest-mock';
import { jest } from '@jest/globals';

export default function mockFn(fn?: FunctionLike) {
    const mock = jest.fn(fn);
    Object.setPrototypeOf(mock, Function);
    return mock;
}
