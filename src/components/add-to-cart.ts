import { ConfigureUI } from '@/configure/ConfigureUI';
import { BeforeSaveRecipeHookPayload } from '@/configure/extension/hooks/hook-types';
import { NodeCallback } from '@/configure/utils/types';
import { ConfigureEventDispatcher } from '@/ConfigureEventDispatcher';
import { getImageGalleryCartData } from '@/features/image-gallery';
import { t } from '@/i18n';
import { showErrorDialog } from './dialog';
import { toggleBodyBackdrop } from './loader';

const ADD_TO_CART_IN_PROGRESS_CLASS = 'fc-adding-to-cart-in-progress';
const DISABLED = 'fc-disabled';
let isAddToCartAllowed = true;

/**
 * Adds the "Add to Cart" feature: Creates the button and its handler, register the hook to validate the recipe and/or
 * add custom data before sending to the server.
 * @param configure
 */
export async function createAddToCartButton(
  configure: ConfigureUI,
  dispatcher: ConfigureEventDispatcher
): Promise<void> {
  configure.registerHook(
    'method.beforeSaveRecipe',
    function (options: BeforeSaveRecipeHookPayload, callback: NodeCallback<Error, unknown>) {
      if (options.purpose === 'addToCart') {
        if (!isAddToCartAllowed) return;
        setAddToCartButtonStatus(false);
        toggleBodyBackdrop(false);

        const err = validateCart();
        if (err) return callback(err);
      }
      callback(null, getImageGalleryCartData());
    }
  );

  const addToCartButton = await configure.createComponent({
    type: 'addToCartButton',
    container: '.configure-add-to-cart-button',
    // saveOnSelected: false,
    showPriceOnButton: true
  });

  // addToCartButton.on('selected', () => addToCartButton.trigger('save'));
  addToCartButton.on('saved', (err, data) => {
    setAddToCartButtonStatus(true);
    if (err) {
      console.error('Error while saving recipe: %s', err.message);
      showErrorDialog(configure, t('add_to_cart'), t('error_add_to_cart'));
      return;
    }
    dispatcher.dispatchEvent(new CustomEvent('add-to-cart', { detail: { id: data?.id, resource: data?.resource } }));
  });
}

export function setAddToCartButtonStatus(enabled: boolean): void {
  const addToCartElement = document.querySelector('.fc-button.fc-add-to-cart-button');
  isAddToCartAllowed = enabled;
  addToCartElement?.classList.toggle(ADD_TO_CART_IN_PROGRESS_CLASS, !isAddToCartAllowed);
  addToCartElement?.classList.toggle(DISABLED, !isAddToCartAllowed);
}

/**
 * Validate the cart is correct.
 * - If it is, it should return undefined
 * - If it's not, it should show the error (`showErrorDialog`) and return a `new Error(...)`
 * @param configure ConfigureUI instance
 * @returns the `Error` or `undefined`
 */
function validateCart(/*configure: ConfigureUI*/): Error | undefined {
  // Example of Cart validation
  // if (!validateSizeSelector(configure)) {
  //   showErrorDialog(configure, 'Invalid size value', '<p>Please select size and add product to cart.</p>');
  //   return new Error('Invalid size value Please select size and add product to cart.');
  // }

  // Returns undefined as Adidas Configurator doesn't include Size or Quantity
  return undefined;
}
