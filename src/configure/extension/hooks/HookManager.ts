import { sortFnByProperty } from '@/utils/array';
import { ConfigureUI } from '../../ConfigureUI';
import { GenericCallback } from '../../utils/types';
import { ConfigureHooks } from './hook-types';
import { HookOpts } from './HookOpts';

const DEFAULT_ORDER = 100;
const HOOK_LAST = 101;
const HOOK_FIRST = -100;

/**
 * Class responsible for registering handlers with hooks and calling them in order.
 *
 * ConfigureUI only supports one handler per hook. This class removes that limitation for some of them.
 * When multiple handlers are defined:
 * - For HTML or Text hooks: their results are concatenated
 * - For URL hooks: they are called with the URL. Each handler receives the result of the last until all are called
 * - For AV hooks: they are called with the AV. Each handler receives the result of the last until all are called
 */
export class HookManager {
  #configure: ConfigureUI;
  #hooks: Record<string, HookOpts[]> = {};

  constructor(configure: ConfigureUI) {
    this.#configure = configure;
  }

  /**
   * Adds a new handler for a hook
   */
  addHook(opts: HookOpts): void {
    // Get the right function to call each handlers and process the results
    const fn = getOrchestratorFn(opts.hook);

    // Get the hook name (including attribute alias if defined and supported)
    const name = getName(opts);

    // Get the numeric order, considering 'first', 'last' and undefined values
    opts.order = getOrder(opts.order);

    // If no orchestrator is found, this hook supports only one handler, use the regular ConfigureUI method
    if (!fn) {
      this.#configure.getApi().run('registerHook', name, opts.handler);
      return;
    }

    // Get the list of handlers for this hook
    let items = this.#hooks[name];
    if (!items) {
      // If no handler was registered for this hook, create an empty list and register the right
      // orchestrator with a reference to that list (that will change as new handlers are added)
      items = [];
      this.#hooks[name] = items;
      this.#configure.getApi().run('registerHook', name, fn(items));
    }

    // Add the handler to the list and sort it according to the order value
    items.push(opts);
    items.sort(sortFnByProperty('order'));
  }
}

/**
 * Get the hook name, considering attribute aliases
 */
function getName(opts: HookOpts & { attributeAlias?: string }): string {
  return opts.attributeAlias ? opts.hook + '.' + opts.attributeAlias : opts.hook;
}

function getOrchestratorFn(hookName: ConfigureHooks): ((handlers: HookOpts[]) => GenericCallback) | undefined {
  // For the moment "method." hooks are handled as before, only one handler can be registered
  if (hookName.startsWith('method')) return undefined;

  // HTML hooks support multiple handlers and will concat the results
  if (hookName.endsWith('Html')) return runHandlersForHTML;

  // TODO: Uncomment and test when they are required
  // if (hookName.endsWith('Text')) return runHandlersForText;
  // if (hookName.endsWith('url')) return runHandlersForURL;
  // if (hookName.endsWith('swatch')) return runHandlersForAV;
  return undefined;
}

/**
 * Calculates the numeric order value
 * @param order numeric value, first, last or undefined
 */
function getOrder(order?: number | 'first' | 'last'): number {
  if (order === undefined) return DEFAULT_ORDER;
  if (order === 'first') return HOOK_FIRST;
  if (order === 'last') return HOOK_LAST;
  return order;
}

/**
 * Orchestrator fn for HTML hooks.
 *
 * It calls each handler in order and concatenates the HTML values returned.
 *
 * @param items handlers
 * @returns the Hook handler that will be passed to ConfigureUI
 */
function runHandlersForHTML(items: HookOpts[]): GenericCallback {
  return function (...params: unknown[]) {
    return (
      transformToStringAndFilter(items, params)
        // Wrap the results in a div
        .map((html) => `<div class="hook-item">${html}</div>`)
        .join('')
    );
  };
}

/**
 * Calls each handler with the right parameters,
 * retrieve the resulting strings and filter the `null`, `undefined` or `''` values.
 *
 * @returns the array of HTML strings
 */
function transformToStringAndFilter(
  items: Array<HookOpts & { handler: GenericCallback }>,
  params: unknown[]
): string[] {
  return items.map((i) => i.handler(...params)).filter((html) => !!html);
}

// TODO: Uncomment and test when they are required
// function runHandlersForText(items: HookOpts[]): GenericCallback {
//   return function (...params: unknown[]) {
//     return transformToStringAndFilter(items, params).join('');
//   };
// }

// function runHandlersForURL(items: HookOpts[]): GenericCallback {
//   return function (...params: unknown[]) {
//     // eslint-disable-next-line prefer-const
//     let [result, ...rest] = params;
//     for (const i of items) {
//       result = i.handler(result, ...rest);
//     }
//     return result;
//   };
// }

// function runHandlersForAV(items: HookOpts[]): GenericCallback {
//   return function (...params: unknown[]) {
//     // eslint-disable-next-line prefer-const
//     let [result, ...rest] = params;
//     for (const i of items) {
//       result = i.handler(result, ...rest);
//     }
//     return result;
//   };
// }
