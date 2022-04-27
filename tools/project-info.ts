import { readFileSync } from 'fs';
import { resolve } from 'path';

const packageJsonFile = resolve(__dirname, '..', 'package.json');
if (!packageJsonFile) throw new Error('process.env.npm_package_json is not defined');
const packageJson = JSON.parse(readFileSync(packageJsonFile, { encoding: 'utf8' })) as typeof import('../package.json');

/**
 * Object that stores required project information (retrieved from package.json)
 */
const project = {
  name: packageJson.name,
  description: packageJson.description,
  version: packageJson.version,
  displayName: packageJson.displayName,
  getJSName(format: string): string {
    return `${project.name}-v${project.version}.${format}.js`;
  },
  getCSSName(): string {
    return `${project.name}-v${project.version}.css`;
  }
};

export default project;
