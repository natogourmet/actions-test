interface QueryParams {
  get(name: string): string | undefined;
  set(name: string, value: string): void;
  getNumber(name: string): number | undefined;
  getBoolean(name: string): boolean | undefined;
  toString(): string;
}

/**
 * Parses and returns the current URL Query parameters
 */
export function getQueryParams(): QueryParams {
  const qp = new URLSearchParams(window.location.search);
  return {
    get(name: string) {
      return qp.get(name) ?? undefined;
    },
    getNumber(name: string) {
      const value = qp.get(name);
      if (value === null) return undefined;
      return Number(value);
    },
    getBoolean(name: string) {
      const value = qp.get(name);
      if (value === null) return undefined;
      return Boolean(value);
    },
    set(name: string, value: string) {
      qp.set(name, value);
    },
    toString() {
      return qp.toString();
    }
  };
}

/**
 * Receives either an element or a selector and returns the actual element.
 *
 * If the parameter is already an element, nothing is done.
 *
 * Otherwise, the element is retrieved and returned or an error is thrown if not found
 */
export function getElement(elementOrSelector: HTMLElement | string): HTMLElement {
  if (typeof elementOrSelector === 'string') {
    const node: HTMLElement | null = document.querySelector(elementOrSelector);
    if (!node) throw new Error(`Selector ${elementOrSelector} cannot be found on the DOM`);
    return node;
  }
  return elementOrSelector;
}

/**
 * Computes and returns the requested style property from en element
 * @param element DOM element
 * @param property style property to return
 */
export function getElementCSSValue<T extends keyof CSSStyleDeclaration>(
  element: HTMLElement,
  property: T
): CSSStyleDeclaration[T] {
  const computedStyle = window.getComputedStyle(element);
  return computedStyle[property];
}

/**
 * Computes and returns the multiple style properties from en element.
 *
 * It return an array, where each item is the value of the property in the same position.
 *
 * **It's the same as calling `getElementCSSValue` multiple times, but more performant, as it
 * only calls `window.getComputedStyle()` once.**
 *
 * @param element DOM element
 * @param properties style properties to return
 */
export function getElementCSSValues<T extends keyof CSSStyleDeclaration>(
  element: HTMLElement,
  properties: T[]
): Array<CSSStyleDeclaration[T]> {
  const computedStyle = window.getComputedStyle(element);
  return properties.map((p) => computedStyle[p]);
}

/**
 * Computes and returns the requested style property numeric value from en element.
 *
 * Calls `getElementCSSValue` and then performs `parseInt` or returns `0` if undefined
 * @param element DOM element
 * @param property style property to return
 */
export function getElementCSSValueAsNumber(element: HTMLElement, property: keyof CSSStyleDeclaration): number {
  const value = getElementCSSValue(element, property);
  return value ? parseInt(value.toString(), 10) : 0;
}

/**
 * Computes and returns the multiple style properties numeric values from en element.
 *
 * It return an array, where each item is the value of the property in the same position.
 *
 * Calls `getElementCSSValues` and then for each item, performs `parseInt` or returns `0` if undefined
 *
 * **It's the same as calling `getElementCSSValueAsNumber` multiple times, but more performant, as it
 * only calls `window.getComputedStyle()` once.**
 *
 * @param element DOM element
 * @param properties style properties to return
 */
export function getElementCSSValuesAsNumber(
  element: HTMLElement,
  properties: Array<keyof CSSStyleDeclaration>
): number[] {
  const values = getElementCSSValues(element, properties);
  return values.map((value) => (value ? parseInt(value.toString(), 10) : 0));
}

interface AddDOMEventListenerOpts {
  container?: string;
}

/**
 * Adds an event listener for an element in the DOM that can be added or removed at any time.
 * In order for this to work, a parent container that is never removed (or `window`) is used to add the listener.
 *
 * When the handler is called, the `event.target` is checked to see if it matches with the selector, and only then the provided
 * handler is called.
 * @param selector selector of the DOM element that may be added or removed
 * @param eventName event to listen for (eg. `click`)
 * @param handler handler to call when the event is triggered by the appropiate element
 * @param opts options to change the container (instead of window).
 */
export function addDOMEventListener(
  selector: string,
  eventName: string,
  handler: (e: Event) => void,
  opts?: AddDOMEventListenerOpts
): void {
  let container = opts?.container ? document.querySelector(opts.container) : window;
  if (!container) container = window;

  container.addEventListener(eventName, function (e) {
    // Only call the handler if the actual target is the one we need
    if ((e.target as HTMLElement).matches(selector)) handler(e);
  });
}

/**
 * Adds an event listener for an element in the DOM that can be added or removed at any time and **must contain** an ancestor
 * with a particular `data` entry. (eg. `data-ca`).
 * In order for this to work, a parent container that is never removed (or `window`) is used to add the listener.
 *
 * When the handler is called, the `event.target` is checked to see if it matches with the selector,
 * then an ancestor with the provided `data` key is searched for. Only if the target matches and the data entry exists,
 * the handler is called, with both the event and the data entry value.
 *
 * @param selector selector of the DOM element that may be added or removed
 * @param eventName event to listen for (eg. `click`)
 * @param dataKey key to search for
 * @param handler handler to call when the event is triggered by the appropiate element
 * @param opts options to change the container (instead of window).
 */
export function addDOMEventListenerByData(
  selector: string,
  eventName: string,
  dataKey: string,
  handler: (e: Event, data: string) => void,
  opts?: AddDOMEventListenerOpts
): void {
  // Handler to call `addDOMEventListener`
  function handlerNoData(e: Event) {
    // Find the first ancestor with the data entry required
    const data = ((e.target as HTMLElement).closest(`[data-${dataKey}]`) as HTMLElement)?.dataset[dataKey];
    // If the data entry exists, call the handler
    if (data) handler(e, data);
  }

  addDOMEventListener(selector, eventName, handlerNoData, opts);
}
