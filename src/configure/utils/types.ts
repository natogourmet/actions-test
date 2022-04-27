/* eslint-disable @typescript-eslint/no-explicit-any */
export type Position = 'top' | 'right' | 'bottom' | 'left';

export type Callback<R = void> = (param: R) => void;
export type CallbackTwoParams<R, A> = (param1: R, param2: A) => void;
export type NodeCallback<E extends Error | string, R> = (err: E | null, args?: R) => void;

/**
 * Generic callback that accepts any number of parameters and return anything.
 * It doesn't provide much help regarding typing, but it isu seful when using method overloading
 * or generic callbacks from other libraries.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericCallback = (...params: any[]) => any;

/**
 * Type that represents all the properties of a an object that are of a certain type.
 *
 * Example: `KeysOfType<AttributeValue, string>`
 */
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
