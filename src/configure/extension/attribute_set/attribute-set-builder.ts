import { AttributeValue } from '../../model/AttributeValue';
import { ConfigureAttribute, getDefaultValueForCA } from '../../model/ConfigureAttribute';
import { ConfigureProduct } from '../../model/ConfigureProduct';
import { AttributeSet, AttributeSetItem, ParentAttributeInfo, SubAttributeInfo } from './AttributeSet';

/**
 * Builds the internal representation of the AttributeSet using the specified configuration and the Product CAs
 * @param product Configure Product
 * @param attributeSetName AttributeSet name
 * @param parentInfo info of the parent CA
 * @returns the AttributeSet if any items are found, `null` otherwise
 */
export function buildAttributeSet(
  product: ConfigureProduct,
  attributeSetName: string,
  parentInfo: ParentAttributeInfo
): AttributeSet | null {
  // Regex used to find the associated CAs of the AttributeSet
  const REGEX = new RegExp(`${attributeSetName}_(\\d+)_${parentInfo.name}$`);

  // Initialize the AttributeSet
  const attributeSet: AttributeSet = {
    name: attributeSetName,
    parentInfo,
    count: 0,
    items: {},
    subattributes: []
  };

  // Process the product attributes
  for (const ca of product.attributes) {
    const item = parseSetItem(ca, REGEX);
    // If the CA is part of the CA, add it to the set
    if (item) {
      attributeSet.items[item.parentCA.alias] = item;
      attributeSet.count++;
    }
  }

  // No set attributes found, nothing to process
  if (attributeSet.count === 0) {
    console.warn('No %s attribute found for %s', parentInfo.name, attributeSet.name);
    return null;
  }

  // Create an array with the parent attribute and all the subattributes without the set prefix (eg. toggle, color, text, etc)
  attributeSet.subattributes = [
    { name: parentInfo.name, defaultValue: parentInfo.inactiveValue },
    ...getSetSubattributes(Object.values(attributeSet.items)[0].parentCA)
  ];

  console.log('Attribute Set info: %o', attributeSet);

  return attributeSet;
}

/**
 * Parses the CA alias to retrieve the set name and position
 */
function parseSetItem(ca: ConfigureAttribute, REGEX: RegExp): AttributeSetItem | null {
  const matches = REGEX.exec(ca.alias);
  if (matches?.length !== 2) return null;
  return {
    parentCA: ca,
    position: Number(matches[1]),
    active: false
  };
}

/**
 * Process the AttributeSet Item Parent CA to get its subattributes, including name and default value.
 */
function getSetSubattributes(parentCA: ConfigureAttribute): SubAttributeInfo[] {
  if (!parentCA.subAttributes) return [];
  return parentCA.subAttributes.map((sca) => {
    // Get the attribute name using the last portion of the alias
    const name = sca.alias.substring(sca.alias.lastIndexOf('_') + 1);

    // Get the default value name for that attribute or empty text for text CAs
    const value = getDefaultValueForCA(sca);
    const defaultValue = (value as AttributeValue).name ?? value;

    return { name, defaultValue };
  });
}
