// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (args: any[]) => void;

/**
 * Class that implements ConfigureUI's `EventBus` API using the browser native `EventTarget`
 */
export class EventEmitter {
  /** Native Event Emitter */
  #emitter: EventTarget = new EventTarget();

  /**
   * Map that associates the EventBus handler with the real Listener, so it can be
   * used when removing an event listener
   */
  #handlers: Map<EventHandler, EventListenerOrEventListenerObject> = new Map();

  /**
   * Adds an event listener
   * @param eventName  name of the event
   * @param handler handler to call
   */
  on(eventName: string, handler: EventHandler): void {
    // Creates and register the real listener using the native API
    const listener = ((e: CustomEvent) => handler(e.detail)) as EventListener;
    this.#handlers.set(handler, listener);

    this.#emitter.addEventListener(eventName, listener);
  }

  /**
   * Removes one or all event handlers for the specified event
   * @param eventName name of the event
   * @param handler Optional. If specified removes that particular handler. Otherwise, all handlers for the event are removed.
   */
  off(eventName: string, handler: EventHandler): void {
    let listener: EventListenerOrEventListenerObject | null = null;

    // If a handler is specified, look for the actual registered listener on the map
    // Otherwise, it will be null and it will remove all handlers
    if (handler) {
      listener = this.#handlers.get(handler) ?? null;
      this.#handlers.delete(handler);
    }
    this.#emitter.removeEventListener(eventName, listener);
  }

  /**
   * Triggers the specified event using the given arguments
   * @param eventName name of the event
   * @param args arguments of the event
   */
  trigger(eventName: string, ...args: unknown[]): void {
    this.#emitter.dispatchEvent(new CustomEvent<unknown[]>(eventName, { detail: args }));
  }
}
