import { ConfigureHooks, HooksMap, HooksWithAttributeMap } from './hook-types';

/**
 * Parameters for `HookManager.addHook` method
 */
export type HookOpts<T extends ConfigureHooks = ConfigureHooks> = T extends keyof HooksWithAttributeMap
  ? BaseHookOptsWithAlias<T>
  : BaseHookOpts<T>;

/**
 * Parameters for hooks without attribute alias
 */
interface BaseHookOpts<T extends ConfigureHooks> {
  /** Name of the Hook */
  hook: T;

  /**
   * Order of this handler if multiple handlers are registered for this hook.
   * Higher numbers go later.
   *
   * If not defined, a default order is used and the registration order is applied
   */
  order?: number | 'first' | 'last';

  /**
   * Function to call when the hook is triggered
   */
  handler: HooksMap[T];
}

/**
 * Parameters for hooks with optional attribute alias
 */
interface BaseHookOptsWithAlias<T extends ConfigureHooks> extends BaseHookOpts<T> {
  attributeAlias?: string;
}
