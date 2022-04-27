/**
 * Simple template engine
 * Allowed js-constructions^
 * - if() {}
 * - else if() {}
 * - ele {}
 * - for() {}
 * - switch () {}
 *
 * @param {string} string Template string
 * @param {object} options Data to interpolate
 * @returns {string}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function templateEngine(content: string, options: Record<string, any>): string {
  const templateLiteralRegex = /<%([^%>]+)?%>/g;
  const allowedConstructionsRegex = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
  let code = 'const codeBuffer=[];\n';
  let cursor = 0;
  let match;

  function add(line: string, js?: boolean) {
    js
      ? (code += line.match(allowedConstructionsRegex) ? line + '\n' : 'codeBuffer.push(' + line + ');\n')
      : (code += line != '' ? 'codeBuffer.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }

  while ((match = templateLiteralRegex.exec(content))) {
    add(content.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }

  add(content.substr(cursor, content.length - cursor));
  code += 'return codeBuffer.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}
