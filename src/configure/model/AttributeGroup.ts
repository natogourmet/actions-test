export interface AttributeGroup {
  id: number;
  ns: string;
  name: string;
  description: string;
  vertexKey: string;
  viewName: string;

  attributes: number[];
}
