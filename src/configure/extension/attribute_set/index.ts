import { AttributeValuePair } from '@/configure/ui/configureui-types';
import { sortFnByProperty } from '@/utils/array';
import { ConfigureUI } from '../../ConfigureUI';
import { buildAttributeSet } from './attribute-set-builder';
import { AttributeSet, AttributeSetItem, ParentAttributeInfo } from './AttributeSet';

/**
 * AttributeSet processing parameters
 */
interface AddAttributeSetOpts {
  /** Name of the AttributeSet, used as prefix on the CAs */
  attributeSetName: string;

  /** Info of the items' Parent CAs, that toggle the item and contains the subattributes */
  parentInfo: ParentAttributeInfo;
}

/**
 * Add the AttributeSet Behavior for the given name,
 * processing the current product in the specified ConfigureUI instance.
 *
 * @param configure ConfigureUI Instance
 * @param opts Parameters of the AttributeSet
 */
export function addAttributeSet(configure: ConfigureUI, opts: AddAttributeSetOpts): void {
  const product = configure.getProduct();
  if (!product) return;

  // Retrieves the AttributeSet Info by processing the product
  const attributeSet = buildAttributeSet(product, opts.attributeSetName, opts.parentInfo);
  if (!attributeSet) return;

  // Handle the recipe loading
  configure.on('recipe:loaded', (modifications) => updateSetItemsState(attributeSet, modifications));

  // Handle the recipe changes
  configure.on('recipe:change', (modifications) => handleRecipeChange(configure, attributeSet, modifications));
}

/**
 * Update the active state of each item of the AttributeSet according to the current recipe
 * @param attributeSet AttributeSet to update
 * @param itemActiveValue value used when the AttributeSet item is active
 * @param recipeItems items of the recipe as an AttributeValuePair array
 * @returns the list of items that were changed to "inactive"
 */
function updateSetItemsState(attributeSet: AttributeSet, recipeItems: AttributeValuePair[]): AttributeSetItem[] {
  const inactiveItems: AttributeSetItem[] = [];

  // Iterate the recipe items
  recipeItems.forEach(({ ca, av }) => {
    // Check if the CA is part of the AttributeSet
    const item = attributeSet.items[ca.alias];

    if (item) {
      // Store the item activation state. The item is active if the AV is the "active" state
      item.active = av.name === attributeSet.parentInfo.activeValue;

      // If the item is not active, add the inactive item to the list to process it later
      if (!item.active) inactiveItems.push(item);

      console.log('AttributeSet "%s" / Item %d -> %s', attributeSet.name, item.position, item.active);
    }
  });

  return inactiveItems;
}

/**
 * Handles any changes to the recipe and updates the AttributeSet accordingly, including the
 * logic to move up items if required.
 *
 * This handler is called when a recipe is changed, reset or randomized
 *
 * @param configure ConfigureUI instance
 * @param attributeSet
 * @param modifications Modifications made to the recipe as an AttributeValuePair array
 */
function handleRecipeChange(configure: ConfigureUI, attributeSet: AttributeSet, modifications: AttributeValuePair[]) {
  // Update the Set state and retrieve the items that were deactivated
  const inactiveItems = updateSetItemsState(attributeSet, modifications);

  // If no item from the set was deactivated, there's no need to perform the "moving" logic.
  if (inactiveItems.length === 0) return;

  // Perform the move logic
  moveUpItem(configure, attributeSet, inactiveItems);
}

/**
 * Moves the AttributeSet Items up in the recipe, so that no "holes" in the set are created.
 *
 * Any time an item is deactivated, the following items are moved
 * @param configure ConfigureUI Instance
 * @param attributeSet
 * @param inactiveItems items that were deactivated
 */
function moveUpItem(configure: ConfigureUI, attributeSet: AttributeSet, inactiveItems: AttributeSetItem[]) {
  // Get the current recipe
  const recipe = configure.getRecipe('custom', 'alias', 'name');

  // Sort by position in descending order, so the latter items are processed before
  inactiveItems.sort(sortFnByProperty('position', true));

  // For each inactive item, generate the new values by moving every item in the set to the previous slot
  // Each iteration overwrites items from the previous
  // This allows to deactivate multiple Set Items at the same time
  for (const item of inactiveItems) {
    Object.assign(recipe, generateNewValues(recipe, attributeSet, item));
  }

  // Update the recipe
  configure.setRecipe(Object.entries(recipe));
}

function generateNewValues(recipe: Record<string, string>, attributeSet: AttributeSet, item: AttributeSetItem) {
  const newValues: Record<string, string> = {};

  // While the are more items in the set
  for (let n = item.position; n <= attributeSet.count; n++) {
    // Select a value for each attribute using the next item's value for that attribute
    attributeSet.subattributes.forEach((attr) => {
      // copy all children ("xyz_nextN_font", "xyz_nextN_size", etc) to xyz_n hierarchy

      // Get the alias of the current item's CA (to get its value and "move it up")
      const currentItemAlias = `${attributeSet.name}_${n + 1}_${attr.name}`;

      // Get the alias of the previous item's CA (to Set the value)
      const previuosItemAlias = `${attributeSet.name}_${n}_${attr.name}`;

      // Get the value of the CA
      let value: string = recipe[currentItemAlias];

      // If the value is not defined:
      // - If it's the parent CA (toggle), use the value stored in this module.
      // - Otherwise, use the CA's default value.
      if (value === undefined) {
        const item = attributeSet.items[currentItemAlias];
        value = item
          ? item.active
            ? attributeSet.parentInfo.activeValue
            : attributeSet.parentInfo.inactiveValue
          : attr.defaultValue ?? '';
      }

      // Set the modification in the array
      newValues[previuosItemAlias] = value;
    });
  }

  return newValues;
}
