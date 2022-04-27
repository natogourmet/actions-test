import { getElement } from './browser';

const DEFAULT_VERSION_ELEMENT = 'fc-library-version';

/**
 * Information regarding the library.
 *
 * Can be useful to display some label
 */
export interface LibraryInfo {
  name: string;
  description: string;
  version: string;
  displayName: string;
}

/**
 * Library information
 */
export const libraryInfo: LibraryInfo = JSON.parse(import.meta.env.APP_INFO ?? '{}');

console.info(
  `%cRunning ${libraryInfo.displayName} v${libraryInfo.version}`,
  'background:#28b8d1;color:#fff;padding:3px;font-weight:bold'
);

export function handleVersionParameter(el: HTMLElement | string | true): void {
  if (typeof el == 'boolean') {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="${DEFAULT_VERSION_ELEMENT}">v${libraryInfo.version}</div>`
    );
  } else {
    getElement(el).innerHTML = 'v' + libraryInfo.version;
  }
}
