/* eslint-disable @typescript-eslint/no-explicit-any */

import { Callback, NodeCallback } from '../utils/types';
import { LifecycleEvent } from './lifecycle-events';

export interface EventTrigger<T, R extends Array<any> = void[]> {
  trigger(event: T, ...args: R): void;
}

export interface EventOnCommon {
  on(event: 'all', cb: (eventName: string, data?: any) => void): void;
  on(event: LifecycleEvent, cb: Callback): void;
}

export interface EventOnAll {
  on(event: 'all', cb: (eventName: string, data?: any) => void): void;
}

export type EventOnWithError<T, R> = EventOnCommon & {
  on(event: T, cb: NodeCallback<Error, R>): void;
};

export interface EventOn<T, R = void> {
  on(event: T, cb: Callback<R>): void;
}
export interface EventOff<T, R = void> {
  off(event: T, cb: Callback<R>): void;
}

export type EventBus<T = string> = EventOnCommon & EventOn<T> & EventOff<T> & EventTrigger<T>;
