import { ConfigureAttribute } from './ConfigureAttribute';
import { AttributeGroup } from './AttributeGroup';

export interface ConfigureProduct {
  id: number;
  vendorId: string;
  productId: string;
  name: string;
  description: string;
  locale: string;
  defaultLocale: string;
  facets: unknown[];
  attributes: ConfigureAttribute[];
  defaultViewName: string;
  attributeGroups: AttributeGroup[];
  allAttributes: ConfigureAttribute[];
}
