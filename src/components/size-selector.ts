import { ConfigureUI } from '@/configure/ConfigureUI';
import { AttributeValue } from '@/configure/model/AttributeValue';

const SIZE_SELECTOR_CONTAINER = '.configure-size-container';
const SIZE_SELECTOR_CONTAINER_SELECTOR = '.fc-size-selector';
const INVALID_INPUT_CLASS = 'fc-input-invalid';
const INVALID_VALUES = ['select size', 'please select', '--'];

export async function createSizeSelector(configure: ConfigureUI): Promise<void> {
  // Size attribute might not be preset in product configuration
  // Wrap sizeSelector component in try/catch to avoid braking the script
  try {
    const sizeSelector = await configure.createComponent({
      type: 'sizeSelector',
      container: SIZE_SELECTOR_CONTAINER,
      selectorType: 'dropdown',
      sizeLabel: 'Size*'
    });
    sizeSelector.on('av:change', function (change) {
      console.log('AV Change CA %d - AV %d', change.caId, change.avId);
      // validate on value change
      validateSizeSelector(configure);
    });

    // Size Validation - Not used by Adidas
    // const sizeCA = configure.getAttribute({ alias: 'size' });
    // if(sizeCA) {
    //   configure.on('recipe:change', function (changes) {
    //     if (sizeCA.id === changes[0].ca.id) validateSizeSelector(configure);
    //   });
    // }
  } catch (ex) {
    console.warn(ex);
  }
}

/**
 * Validate size
 * @param {string} [sizeAttributeAlias="size"] Size attribute alias
 * @returns {boolean}
 */
/*export*/ function validateSizeSelector(configure: ConfigureUI, sizeAttributeAlias: string = 'size'): boolean {
  const sizeAttribute: AttributeValue | null = configure.getRecipe('custom', 'alias')[sizeAttributeAlias];
  const sizeSelectorContainer = document.querySelector(SIZE_SELECTOR_CONTAINER_SELECTOR);

  /* some impl like YCC doesn't have size but could have a size ca */
  if (!sizeSelectorContainer) {
    const sizeCA = configure.getAttribute({ alias: 'size' });
    if (!sizeCA) return true;

    /* some impl like Puma or Hydroflash has size C.A. inside a menu option */
    const selected = sizeCA.values.filter((ca) => (ca.selected === true ? ca : null));

    const isInvalid = INVALID_VALUES.includes(selected[0].name.toLowerCase());
    const dropdownSizeSelector = document.getElementsByClassName('fc-attribute-selector-dropdown')[0];
    dropdownSizeSelector?.classList.toggle(INVALID_INPUT_CLASS, isInvalid);
    return !isInvalid;
  }

  const isInvalid = sizeAttribute && INVALID_VALUES.includes(sizeAttribute.name.toLowerCase());
  sizeSelectorContainer.classList.toggle(INVALID_INPUT_CLASS, isInvalid);
  return !isInvalid;
}
