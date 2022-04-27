import { ConfigureUI } from '@/configure/ConfigureUI';
import { addAttributeSet } from '@/configure/extension/attribute_set';

/* List of attribute sets that implement the "attribute set" behavior */
const ATTRIBUTE_SETS = ['team_name'];

/** Configuration of the AttributeSet Parent CAs */
const PARENT_CA_INFO = { name: 'toggle', activeValue: 'On', inactiveValue: 'Off' };

/**
 * Implements the "attribute sets" feature.
 *
 * This feature allows multiple separate CAs to work as a set:
 * The product will contain **N** attributes with the same prefix and structure and they can be completed in
 * order (first [attr]_1, then [attr]_2 and so on).
 *
 * When one is removed, all the following attributes in the set are "moved up" one position, so no "holes" are
 * created in the set.
 *
 * @param configure ConfigureUI instance
 */
export function implementAttributeSets(configure: ConfigureUI): void {
  ATTRIBUTE_SETS.forEach((attributeSetName) =>
    addAttributeSet(configure, {
      attributeSetName,
      parentInfo: PARENT_CA_INFO
    })
  );
}
