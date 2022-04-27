import { AddToCartInfo } from './configure/ui/configureui-types';

/** HIS Implementation Events */
type ConfigureImplImageEvents = 'image-upload' | 'image-library';
export type ConfigureImplEvents = ConfigureImplImageEvents | 'add-to-cart';

type AddToCartPayload = Pick<AddToCartInfo, 'id' | 'resource'>;

/**
 * ConfigureUI Implementation Event Dispatcher
 */
export class ConfigureEventDispatcher {
  #dispatcher: EventTarget = new EventTarget();

  /**
   * Adds a handler that is executed when the customer is done customizing.
   * The recipe has been saved and its ID and URL are provided in the payload.
   */
  addEventListener(
    type: 'add-to-cart',
    callback: (e: CustomEvent<AddToCartPayload>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;
  /**
   * Adds a handler that is executed when the customer want to upload an image or select one from the library.
   */
  addEventListener(
    type: ConfigureImplImageEvents,
    callback: (e: CustomEvent<{ caAlias: string }>) => void,
    options?: AddEventListenerOptions | boolean
  ): void;
  addEventListener(
    type: ConfigureImplEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (e: CustomEvent<any>) => void,
    options?: AddEventListenerOptions | boolean
  ): void {
    this.#dispatcher.addEventListener(type, callback as EventListener, options);
  }

  dispatchEvent(event: Event): boolean {
    return this.#dispatcher.dispatchEvent(event);
  }
  removeEventListener(
    type: ConfigureImplEvents,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void {
    this.#dispatcher.removeEventListener(type, callback as EventListener, options);
  }
}
