/**
 * Convert a string from underscore case to camel case
 * @returns new string
 */
export function camelize(s: string): string {
  const camelized = s.replace(/(?:^|[-_])(\w)/g, (_, c) => c?.toUpperCase() ?? '');
  return camelized[0].toLowerCase() + camelized.slice(1);
}

/**
 * Convert the object keys from underscore case to camel case keys
 * @returns new object
 */
export function camelizeObject(obj: Record<string, string>): Record<string, string> {
  const camelizedO: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = camelize(key);
    camelizedO[newKey] = value;
  }
  return camelizedO;
}

/**
 * Creates a new string using the template and the replacements map.
 * Values must be inside "{}" in the `template` string, and declared in the `variables` object
 * check __tests__ for reference
 *
 * @param template string containing the template with variables as {}.
 * @param variables map with the values of the variables
 *
 * @returns new string
 */
export function interpolate(template: string, variables: Record<string, string | number | boolean>): string {
  return template.replace(/{(\w+)}/g, (fullMatch, group1) => variables?.[group1].toString() ?? fullMatch);
}
