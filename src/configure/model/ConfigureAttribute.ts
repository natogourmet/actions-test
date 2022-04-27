import { SelectValueOptions } from '../ui/configureui-types';
import { AttributeValue } from './AttributeValue';
import { ValueUsage } from './ValueUsage';

export interface ConfigureAttribute {
  id: number;
  name: string;
  alias: string;
  description?: string;
  value?: AttributeValue;
  values: AttributeValue[];
  selectorType: 'checkbox' | 'text' | 'buttongroup' | 'swatch' | 'ugc';
  canBeRendered: boolean;
  allValues: unknown[];
  facets: unknown[];
  allFacets: unknown[];
  optionalFacets: unknown[];
  hiddenFacets: unknown[];
  upcharge?: number;
  subAttributes?: ConfigureAttribute[];
  isVisible: boolean;
  isDynamic: boolean;
  isPersonal: boolean;
  indexable: boolean;
  valueUsages: ValueUsage[];
  parentId?: number;
  selectorClass?: string;
}

export interface ColorConfigureAttribute extends ConfigureAttribute {
  color?: string;
}
export interface PatternConfigureAttribute extends ConfigureAttribute {
  tooltipImage?: string;
}

/** Indicates whether the attribute is a Color Attribute */
export function isColorAttribute(ca: ConfigureAttribute): ca is ColorConfigureAttribute {
  return (ca as ColorConfigureAttribute).color !== undefined;
}

/** Indicates whether the attribute is a Pattern Attribute */
export function isPatternAttribute(ca: ConfigureAttribute): ca is PatternConfigureAttribute {
  return (ca as PatternConfigureAttribute).tooltipImage !== undefined;
}

/**
 * Retrieves the default AV for the specified CA.
 *
 * - For Text CAs, it returns an `{text: ''}`.
 * - For any other, it returns the **first** AV in its `values` array
 * - If the values array is empty, it returns `null`.
 *
 * @param ca Attribute which default AV is required
 * @returns the CA's default value or `null` if not found
 */
export function getDefaultValueForCA(ca: ConfigureAttribute): AttributeValue | { text: string } | null {
  if (ca.selectorType === 'text') return { text: '' };
  if (!ca.values || ca.values.length === 0) return null;
  return ca.values[0];
}

/**
 * Generates the item that can be passed to `selectValue` or `setRecipe` to reset the value of the provided CA
 * @param ca ca to reset
 */
export function getInitialRecipeItemForCA(ca: ConfigureAttribute): SelectValueOptions | undefined {
  const defaultValue = getDefaultValueForCA(ca);
  if (defaultValue === null) return undefined;
  return [ca.alias, (defaultValue as AttributeValue).name ?? defaultValue];
}
