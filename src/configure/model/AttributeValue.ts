import { isDefined } from '@/utils/general';
import { ValueUsage } from './ValueUsage';
import { WithMetadata } from './Metadata';

export interface AttributeValue extends WithMetadata {
  id: number;
  ns: string;
  name: string;
  vendorId: string;
  description: string;
  priority: number;
  active: boolean;
  color: string;
  vertexKey: string;
  upcharge: number;
  clipArt?: string;

  selected: boolean;

  // features/league-rules
  url?: string;
  selectable: boolean;
  valueUsage?: ValueUsage;
}

export interface TextAttributeValue {
  text: string;
}

export function isTextValue(av: AttributeValue | TextAttributeValue): av is TextAttributeValue {
  return isDefined((av as TextAttributeValue).text);
}
