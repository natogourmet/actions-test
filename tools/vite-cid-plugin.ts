import { readFile, unlink, writeFile } from 'fs/promises';
import { basename, resolve } from 'path';
import { build } from 'tsup';
import { Plugin, ResolvedConfig } from 'vite';
import { getGitInfo } from './git';
import { waitForFile } from './helpers';
import project from './project-info';

const HTML_FILE_NAME = 'index.html';
const JS_FILE_NAME = 'impl.js';

/** Default JS Module formats when they are not specified */
const DEFAULT_JS_MODULE_FORMATS = ['es', 'umd'];

/** JS Format that will be used for "index.html" (without suffix) */
const PREFERRED_JS_MODULE_FORMAT = 'es';

/**
 * Vite Plugin for ConfigureID implementations.
 *
 * It creates the custom index.html and impl.js for both ES Modules and UMD.
 * This files are not required to use the library, but are deployed as examples of how to use it.
 */
export default function configureIdPlugin(): Plugin {
  let config: ResolvedConfig;
  let outDir: string;
  let formats: string[];

  return {
    name: 'cid-plugin',

    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig;
      outDir = resolve(config.root, config.build.outDir);

      formats = DEFAULT_JS_MODULE_FORMATS;
      if (config.build.lib && config.build.lib.formats) {
        formats = config.build.lib.formats;
      }
    },

    async closeBundle() {
      // If it's not building or it's not a library, there's nothing to do
      if (config.command === 'serve' || !config.build.lib) return;

      await Promise.all([
        createBuildInfoJSON(outDir),
        createTSDeclarationFile('src/main.ts', outDir, formats),
        createHtmls(config.root, outDir, formats),
        createImplJs(config.root, outDir, formats)
      ]);
    }
  };
}

/**
 * Creates the type declaration file (d.ts) for each format
 * @param entryFile main entry file
 * @param outDir output dir
 * @param formats formats requested
 */
async function createTSDeclarationFile(entryFile: string, outDir: string, formats: string[]) {
  // Call TSUP just to generate the declaration file
  await build({
    platform: 'node',
    entry: [entryFile],
    dts: { entry: entryFile, only: true }
  });

  const dtsFile = resolve(outDir, basename(entryFile, '.ts') + '.d.ts');

  // TSUP "build" fn returns before creating the file, so we need to poll until the file is created
  await waitForFile(dtsFile);

  // Read the generated dts file
  const dts = await readFile(dtsFile, 'utf8');

  // Remove the original dts and create a copy for each format
  await Promise.all([unlink(dtsFile), ...formats.map((format) => generateDTSForFormat(dts, outDir, format))]);
}

/**
 * Generates the d.ts file for each format
 * @param dts original content
 * @param outDir output directory
 * @param format `es` or `umd`
 */
function generateDTSForFormat(dts: string, outDir: string, format: string) {
  // If 'es', d.ts file is left untouched
  // Otherwise, the global variable created in the window object is added to the file
  if (format !== 'es') {
    dts += `declare global {
  interface Window {
    ${project.description}: typeof ${project.description};
  }
}`;
  }

  // Save the d.ts for that format
  const path = resolve(outDir, project.getJSName(format).replace('.js', '.d.ts'));
  return writeFile(path, dts, 'utf8');
}

/**
 * Generates the build information JSON
 * @param outDir output dir of the project
 */
async function createBuildInfoJSON(outDir: string) {
  // Reads the HTML used in Dev
  const path = resolve(outDir, `build.json`);
  const content = {
    name: project.name,
    version: project.version,
    description: project.description,
    displayName: project.displayName,
    git: getGitInfo()
  };

  return writeFile(path, JSON.stringify(content, null, 2), 'utf8');
}

/**
 * Generates and copy the example HTML for both ES and UMD formats
 * @param rootDir root dir of the project
 * @param outDir output dir of the project
 * @param formats formats requested
 */
async function createHtmls(rootDir: string, outDir: string, formats: string[]) {
  // Reads the HTML used in Dev
  const html = await readFile(resolve(rootDir, HTML_FILE_NAME), 'utf8');
  return Promise.all(formats.map((format) => generateHtmlForFormat(html, outDir, format)));
}

/**
 * Generates and copy the example implementation JS script for both ES and UMD formats
 * @param rootDir root dir of the project
 * @param outDir output dir of the project
 * @param formats formats requested
 */
async function createImplJs(rootDir: string, outDir: string, formats: string[]) {
  // Reads the JS used in Dev
  const js = await readFile(resolve(rootDir, JS_FILE_NAME), 'utf8');
  return Promise.all(formats.map((format) => generateImplJsForFormat(js, outDir, format)));
}

/**
 * Generates the example implementation JS for a certain format
 * @param js content of the dev JS file
 * @param outDir
 * @param format `es` or `umd`
 * @returns promise that resolves when the resulting file is saved in the output dir
 */
function generateImplJsForFormat(js: string, outDir: string, format: string) {
  // If 'es' the class is imported as a Module
  // If 'umd', it's retrieved from the global window object
  const replacement =
    format.toLocaleLowerCase() === 'es'
      ? `import ${project.description} from './${project.getJSName('es')}';`
      : `/// <reference path="./${project.getJSName(format).replace('.js', '.d.ts')}" />
const ${project.description} = window.${project.description};`;

  const content = js
    // Replaces the dev import statement
    .replace(`import ConfigureImplementation from './src/main';`, replacement)
    // Replaces ConfigureImplementation with the name for this particular implementation
    .replace(/ConfigureImplementation/g, project.description ?? 'ConfigureImplementation');

  // Saves the resulting file using the format as suffix
  const path = resolve(outDir, `impl-${format}.js`);
  return writeFile(path, content, 'utf8');
}

/**
 * Generates the example HTML for a certain format
 * @param html content of the dev HTML file
 * @param outDir output dir
 * @param format `es` or `umd`
 * @returns promise that resolves when the resulting file is saved in the output dir
 */
function generateHtmlForFormat(html: string, outDir: string, format: string) {
  // Replaces the values in the HTML
  const content = processHtml(html, format);

  // html file format suffix (if the format is the default, no suffix is added)
  const formatSuffix = PREFERRED_JS_MODULE_FORMAT === format ? '' : '-' + format;

  // Saves the resulting file using the format as suffix
  const path = resolve(outDir, `index${formatSuffix}.html`);
  return writeFile(path, content, 'utf8');
}

/**
 * Adds and replaces the Scripts and CSS in the HTML
 * @param html content of the dev HTML file
 * @param jsFormat `es` or `umd`
 * @returns the new content
 */
function processHtml(html: string, jsFormat: string) {
  // If 'es', only the example implementation js is imported (it imports the library inside)
  // If 'umd', both the library and the example implementation are loaded (in that order)
  const script =
    jsFormat === 'es'
      ? /*html */
        `<!-- Example Customer-side Logic (imports ConfigureID Implementation Library inside) -->
    <script type="module" src="impl-${jsFormat}.js"></script>`
      : /*html */
        `<!-- ConfigureID Customer Implementation Library -->
    <script src="${project.getJSName(jsFormat)}"></script>

    <!-- Example Customer-side Logic -->
    <script src="impl-${jsFormat}.js"></script>`;

  return (
    html
      // Replaces the page title
      .replace(/<title>(.*?)<\/title>/, `<title>${project.displayName} - ${jsFormat.toUpperCase()} Example</title>`)
      // Replaces the Implementation library and example scripts
      .replace(`<script type="module" src="./${JS_FILE_NAME}"></script>`, script)
      // Adds the Implementation library CSS
      .replace(
        '</head>',
        /*html */ `
    <!--ConfigureID Customer Implementation Library CSS -->
    <link rel="stylesheet" type="text/css" href="${project.getCSSName()}" />
  </head>`
      )
  );
}
