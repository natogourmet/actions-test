import { ConfigureAttribute } from '../../model/ConfigureAttribute';

/**
 * Attribute Set.
 *
 * It associates multiple separate CAs with the same prefix, structure (subattributes) and behavior.
 * It allows to add the same attribute multiple times. Each item must have a corresponding CA with subattibutes.
 *
 * The particular behavior this set allows is that if there's for example 3 items and the first is removed, all the rest are
 * moved 1 slot up, resulting in item 1 and 2.
 *
 * For example, Adidas contains an attribute "Team Name" that may be added up to 3 times (Team name 1, Team name 2 and Team name 3).
 *
 * If `Team Name 1` is removed, `Team Name 2` becomes `Team Name 1` and `Team Name 3` becomes `Team Name 2`.
 */
export interface AttributeSet {
  /** Name of the AttributeSet, used as the suffix of the CAs aliases */
  name: string;

  /** Map of AttributeSetItems. The key is the alias of the ParentCA */
  items: Record<string, AttributeSetItem>;

  /** Number of items in the Set */
  count: number;

  /** Information of the Parent CA (the one with the active/inactive state) */
  parentInfo: ParentAttributeInfo;

  /** Subattributes of the set (eg. Color, Size, Font, etc) */
  subattributes: SubAttributeInfo[];
}

/** Info about the Parent Attribute */
export interface ParentAttributeInfo {
  /** Name (alias suffix: eg. "toggle") */
  name: string;

  /** Name of the value used when the AttributeSetItem is **active** (eg. `On`) */
  activeValue: string;

  /** Name of the value used when the AttributeSetItem is **inactive** (eg. `Off`) */
  inactiveValue: string;
}

/** Item of an AttributeSet */
export interface AttributeSetItem {
  /**
   * Parent attribute of the item.
   *
   * Its value determines whether the item is active and visible.
   *
   * It's usually a `checkbox` and it contains the subattributes (eg. color, size, etc).
   */
  parentCA: ConfigureAttribute;

  /** Position of this item in the AttributeSet */
  position: number;

  /**
   * Indicates whether this item is active.
   *
   * Required because due to sympathetic rules, ConfigureUI may replace this value and it's needed for this logic.
   */
  active: boolean;
}

/** Type that store a subattribute name (alias suffix) and the default AV for that subattribute */
export interface SubAttributeInfo {
  /** Name (alias suffix: eg. "color" or "size") */
  name: string;

  /**
   * Default AV for that CA
   * It's an empty text for Text CAs and the name of the first AV for all the others
   */
  defaultValue: string | null;
}
