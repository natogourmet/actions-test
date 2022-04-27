import { ConfigureUI } from '@/configure/ConfigureUI';
import { AttributeValue, isTextValue, TextAttributeValue } from '@/configure/model/AttributeValue';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { isDefined } from '@/utils/general';

// - - - - - - - - - - - - - - - - - - - - WHEN NOT EXPANDED - - - - - - - - - - - - - - - - - - - - - - - -

interface ValueLabelBuilderOpts {
  separator: string;
  includeBooleanValues?: boolean;
  avMapper: (av: AttributeValue | TextAttributeValue) => string;
}

/**
 * Creates the custom attribute accordion header.
 * e.g. "Stripes on; White";
 * It will include a subtitle with the selected value (or values when the CA has subattributes)
 * when the panel is not expanded
 * See [/docs/images/accordion_attr_headers.png]
 * @param configure ConfigureUI instance
 */
export function addCustomAccordionAttributeHeaders(configure: ConfigureUI): void {
  // Register hook to add content after the attribute header (below the attribute name in the header)
  configure.registerHook('component.attributeHeader.afterHtml', function (ca) {
    // Builds the label
    return buildValueLabelForAttribute(ca, {
      // Use ";" as separator
      separator: '; ',

      avMapper
    });
  });
}

/**
 * Returns the text to show from an Attribute Value.
 *
 * If it's a text value, display the text, otherwise, display the name (and optionally the upcharge)
 * @param av attribute value
 * @returns text to show
 */
function avMapper(av: AttributeValue | TextAttributeValue) {
  if (isTextValue(av)) return `"${av.text}"`;

  if (av.upcharge === 0) return av.name;
  return `${av.name}, $${av.upcharge}`;
}

/**
 * Builds the label to show as the selected value/s for an attribute hierarchy
 * @param ca root attribute
 * @param valueLabelProperty property of AttributeValue to use
 * @param separator separator between values
 * @returns the label or undefined if no values are selected
 */
function buildValueLabelForAttribute(ca: ConfigureAttribute, opts: ValueLabelBuilderOpts): string | undefined {
  const selectedValues = getSelectedValuesForAttributeHierarchy(ca, opts);

  // If there are no selected values, show nothing
  if (selectedValues.length === 0) return;

  return selectedValues.map(opts.avMapper).filter(isDefined).join(opts.separator);
}

/**
 * Retrieves the list of selected values for an attribute hierarchy (its value, its subattributes' values and so on).
 *
 * It is recursive to allow "flattening" a hierarchy of attributes
 * @param ca root attribute
 * @returns the list of selected values
 */
function getSelectedValuesForAttributeHierarchy(
  ca: ConfigureAttribute,
  opts: ValueLabelBuilderOpts
): Array<TextAttributeValue | AttributeValue> {
  const list: Array<TextAttributeValue | AttributeValue> = [];

  // If not visible, don't show the value (eg. when turning an attribute "off")
  if (!ca.isVisible) return list;

  const value = getSelectedValueForAttribute(ca);

  // If the ca has a selected value, add it as the first value of the list
  if (value) {
    // If the CA is a deactivated checkbox, only add it if false values are included
    if (!isTextValue(value) && ca.selectorType === 'checkbox') {
      if (opts.includeBooleanValues) list.push(value);
    } else {
      // Otherwise, add it
      list.push(value);
    }
  }

  // If no subattributes, we are done
  if (!ca.subAttributes?.length) return list;

  // Iterate the subattributes and append its own hierarchy values
  for (const subAttribute of ca.subAttributes) {
    list.push(...getSelectedValuesForAttributeHierarchy(subAttribute, opts));
  }
  return list;
}

/**
 * Gets the selected value for an attribute
 * @param ca attribute
 * @returns the selected AttributeValue or `undefined` if no value is selected
 */
function getSelectedValueForAttribute(ca: ConfigureAttribute): AttributeValue | TextAttributeValue | undefined {
  if (ca.selectorType === 'text') return ca.value;
  return ca.values.find((av) => av.selected);
}

// - - - - - - - - - - - - - - - - - - - - WHEN EXPANDED - - - - - - - - - - - - - - - - - - - - - - - -

// list of ca.selectorClasses where this feature should be enabled
// these classes should also be "display: none" in the css file, as we're rendering them here manually
const enabledSelectorClasses: Record<string, boolean> = {
  'color-swatches': true,
  'graphic-swatches': true
};

/**
 * Creates the custom string displayed on expanded accordion panel.
 *
 * It will include a string with the ca.name and its selected value;
 * e.g. "Choose an option: White"
 * Similar to the above function "setCustomAccordionAttributeHeaders"
 * but this one is displayed when the panel is expanded
 * See [/docs/images/accordion_attr_selectors.png]
 * @param configure ConfigureUI instance
 */
export function addCustomAccordionAttributeSelectors(configure: ConfigureUI): void {
  configure.registerHook('component.attributeSelector.beforeHtml', function (ca) {
    const value = buildValueLabelForAttribute(ca, {
      // Use ";" as separator
      separator: '; ',
      avMapper
    });

    if (ca.parentId === undefined || !isEnabled(ca)) return null;

    return `
    <div class='fc-adi-attribute-title-wrapper'>
      <span class='fc-adi-attribute-title'>${ca.name}</span>
      <span class='fc-adi-selected-value'>${value}</span>
    </div>`;
  });
}

function isEnabled(ca: ConfigureAttribute): boolean {
  return Boolean(ca.selectorClass && enabledSelectorClasses[ca.selectorClass]);
}
