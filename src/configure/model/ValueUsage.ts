/**
 * Value Usage.
 *
 * It provides information about the association of an attribute and a value (a value might be used in multiple attributes).
 */
export interface ValueUsage {
  active: boolean;
  associatedView: string;
  pricingDescription: string;
  upcharge: number;
  valueId: number;
  vendorId: string;

  // TODO: Change this to extend WithMetadata when merged from "location-conflict" branch
  metadata?: Array<{ key: string; value: string }>;
}
