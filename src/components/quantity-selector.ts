import { ConfigureUI } from '@/configure/ConfigureUI';

const QUANTITY_SELECTOR_CONTAINER = '.configure-quantity-container';
const INVALID_INPUT_CLASS = 'fc-input-invalid';

const INVALID_QUANTITIES = [0];

export async function createQuantitySelector(configure: ConfigureUI): Promise<void> {
  const quantitySelector = await configure.createComponent({
    type: 'quantitySelector',
    container: QUANTITY_SELECTOR_CONTAINER,
    selectorType: 'select',
    min: 0,
    max: 15
  });

  // validate quantity on value change
  quantitySelector.on('quantity', () => validateQuantity(configure.getQuantity()));
}

/**
 * Validate quantity
 * @returns {boolean}
 */
/*export*/ function validateQuantity(quantity: number): boolean {
  const isInvalid = INVALID_QUANTITIES.includes(quantity);

  const quantitySelectorContainer = document.querySelector('.fc-quantity-selector');
  quantitySelectorContainer?.classList.toggle(INVALID_INPUT_CLASS, isInvalid);

  return !isInvalid;
}
