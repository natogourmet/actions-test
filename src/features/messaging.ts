import { ConfigureUI } from '@/configure/ConfigureUI';

// Imports the SVG content
import svg from '@/assets/icons/exclamation.svg?raw';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';

const PRODUCT_MESSAGE_SELECTOR = '.configure-product-message';
const SHOW_CLASS = 'fc-product-message-show';
const BUTTON_CLASS = 'fc-button';

/** Key of the Metadata entry containing the localized message */
const METADATA_KEY = 'message';

/**
 * Adds the product-level message if required
 * @param configure instance of ConfigureUI
 */
export function addProductMessage(configure: ConfigureUI): void {
  // Gets DOM element. If not available throw error
  const elem: HTMLElement | null = document.querySelector(PRODUCT_MESSAGE_SELECTOR);
  if (!elem) {
    throw Error(`Product message DOM element (${PRODUCT_MESSAGE_SELECTOR}) not found. Did you forget to add it?`);
  }

  // Get the product message loaded from Admin Tools
  const message = configure.getProduct()?.description;

  // If there is no message, do nothing
  if (!message) return;

  // Add the message DOM including the text
  elem.innerHTML = generateHTML(message);

  /** Close button handler */
  function btnClickHandler(e: Event) {
    if (!elem) return;
    e.target?.removeEventListener('click', btnClickHandler);
    elem.innerHTML = '';
    elem.classList.remove(SHOW_CLASS);
  }

  // Adds the click handler
  elem.querySelector(`.${BUTTON_CLASS}`)?.addEventListener('click', btnClickHandler);

  // Add the "show" class to display the message.
  elem.classList.add(SHOW_CLASS);
}

/**
 * Adds the attibute and value-level messages if they exist.
 *
 * - If only one exists, it adds that one.
 * - If both exist, they are both shown (the attribute message first)
 * - If none exist, it adds nothing.
 * @param configure instance of ConfigureUI
 */
export function addAttributeAndValueMessages(configure: ConfigureUI): void {
  // Get Product
  const product = configure.getProduct();

  // If it's not available, do nothing
  if (!product) return;

  // Register hook to add content after the attribute name but before the values (eg. swatches)
  configure.registerHookWithOpts({
    hook: 'component.attributeSelector.beforeHtml',
    // Messages must come after the "custom attribute title"
    order: 'last',
    handler(ca) {
      // Get the attribute-level message or an empty string
      const attributeMessage = ca.description ? `<div class="ca-message-text">${ca.description}</div>` : '';

      // Get the value-level message or an empty string
      const avMessage = getValueMessage(ca);
      const valueMessage = avMessage ? `<div class="ca-message-text">${avMessage}</div>` : '';

      // Add the HTML for the message
      return attributeMessage + valueMessage;
    }
  });
}

/**
 * Gets the value-level message for the specified attribute.
 *
 * @param ca attribute instance
 * @returns the value-level message or `null` if it doesn't exist
 */
function getValueMessage(ca: ConfigureAttribute) {
  // Get the selected value for that attribute
  const selectedValue = ca.values.find((av) => av.selected);
  // If there's no selected value, return null
  if (!selectedValue) return null;

  // Find the ValueUsage associated with that value and attribute
  const vu = ca.valueUsages.find((v) => v.valueId === selectedValue.id);
  // If there's no value usage, return null
  if (!vu) return null;

  // TODO: Change this to use Metadata.ts methods when merged from "location-conflict" branch
  // If the value usage has a metadata entry with the right key, use its value, otherwise return null
  const metadataEntry = vu.metadata?.find(({ key }) => key === METADATA_KEY);

  // If the message entry is defined, use it, otherwise return null
  return metadataEntry?.value ?? null;
}

/**
 * Generates the HTML for the product-level message
 * @param text message to show
 */
function generateHTML(text: string): string {
  return `
    <div class="fc-product-message-avatar">
      ${svg}
    </div>
    <span class="fc-product-message-text">${text}</span>
    <div aria-label="Close" class="fc-button-pair fc-outline-target" role="button" tabindex="0">
      <div class="${BUTTON_CLASS}">
        <span class="fc-adi-icon-close"></span>
      </div>
    </div>
  `;
}
