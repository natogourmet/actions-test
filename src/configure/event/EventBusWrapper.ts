/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from './EventEmitter';
import { EventOff, EventOn, EventTrigger } from './types';
import { isLifecycleEvent } from './lifecycle-events';

/**
 * Wraps Configure's EventBus instances, to record calls when the real EventBus is not available.
 *
 * When it is, it sends all pending calls and starts forwading the new ones.
 *
 * When the event is a Lifecycle Event, it uses an internal EventBus that is always present.
 *
 * Useful eg. for responsive components which get created and destroyed as the user resizes the screen.
 * Event handlers can be attached to this object regardless of the state of the real component.
 *
 * @author Martin Moscovich
 */
export class EventBusWrapper<T extends string = 'all'>
  implements EventOn<T, any[]>, EventOff<T, any[]>, EventTrigger<T>
{
  calls: Array<{ method: 'on' | 'off' | 'trigger'; event: T; args: any | any[] }> = [];
  lifeCycleEmitter: EventEmitter = new EventEmitter();
  #delegate: any | null; //(EventOn<T, any[]> & EventTrigger<T> & EventOff<T, any[]>) | null = null;

  on(event: T, cb: (args: any[]) => void): void {
    if (isLifecycleEvent(event)) {
      // If the event is a lifecycle event, use the internal EventBus
      this.lifeCycleEmitter.on(event, cb);
    } else if (this.#delegate) {
      // If the delegate (component's eventBus) is present, forward the request
      this.#delegate.on(event, cb);
    } else {
      // If the delegate is not present, save the call so it can be sent later
      this.calls.push({ method: 'on', event, args: cb });
    }
  }
  off(event: T, cb: (args: any[]) => void): void {
    if (isLifecycleEvent(event)) {
      // If the event is a lifecycle event, use the internal EventBus
      this.lifeCycleEmitter.off(event, cb);
    } else if (this.#delegate) {
      // If the delegate (component's eventBus) is present, forward the request
      this.#delegate.off(event, cb);
    } else {
      // If the delegate is not present, save the call so it can be sent later
      this.calls.push({ method: 'off', event, args: cb });
    }
  }

  trigger(event: T, ...args: any[]): void {
    if (isLifecycleEvent(event)) {
      // If the event is a lifecycle event, use the internal EventBus
      this.lifeCycleEmitter.trigger(event, ...args);
    } else if (this.#delegate) {
      // If the delegate (component's eventBus) is present, forward the request
      this.#delegate.trigger(event, ...args);
    } else {
      // If the delegate is not present, save the call so it can be sent later
      this.calls.push({ method: 'trigger', event, args });
    }
  }

  /** Setter for the delegate (the real component's eventBus) */
  set delegate(delegate: (EventOn<T, any[]> & EventTrigger<T> & EventOff<T, any[]>) | null) {
    this.#delegate = delegate;
    if (!this.#delegate) return;

    // If the delegate is defined, send the pending calls
    this.calls.forEach((c) => {
      const args = Array.isArray(c.args) ? c.args : [c.args];
      this.#delegate[c.method].apply(this.#delegate, [c.event, ...args]);
    });
  }
}
