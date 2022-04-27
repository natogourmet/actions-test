/**
 * Full representation of a Recipe.
 * Can be retrieved using ConfigureUI Rest API.
 */
export interface RecipeDocument<C = Record<string, unknown>> {
  id: number;
  customer_id: number;
  locale: string;
  prices: Record<string, number>;
  images: Record<string, string>;
  product: {
    id: number;
    name: string;
    description: string;
    vendor_id: string;
  };
  version: number;
  custom?: C;
}
