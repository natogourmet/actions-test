import { AttributeGroup } from '@/configure/model/AttributeGroup';
import { EventBusWrapper } from './event/EventBusWrapper';
import { handleResponsiveEventBus, LifecycleEvent } from './event/lifecycle-events';
import { EventBus, EventOnCommon } from './event/types';
import { createNestedAccordion } from './extension/components/nested-accordion';
import { ConfigureHooks, HooksMap, HooksWithAttributeMap } from './extension/hooks/hook-types';
import { HookManager } from './extension/hooks/HookManager';
import { HookOpts } from './extension/hooks/HookOpts';
import { addRequiredQueryParams } from './extension/initialization';
import { AttributeValue } from './model/AttributeValue';
import { ConfigureAttribute, getInitialRecipeItemForCA } from './model/ConfigureAttribute';
import { ConfigureProduct } from './model/ConfigureProduct';
import { RecipeDocument } from './model/RecipeDocument';
import {
  AccordionEventBus,
  AccordionOptions,
  AddToCartButtonOptions,
  AddToCartEventBus,
  ButtonOptions,
  ComponentOptions,
  ConfirmDialogEventBus,
  ConfirmDialogOptions,
  DialogEventBus,
  DialogOptions,
  DisplayWebGlEventBus,
  DisplayWebGlOptions,
  Embeddable,
  HtmlOptions,
  NavFlyoutEventBus,
  NavFlyoutOptions,
  PagerEventBus,
  PagerOptions,
  ProductDisplayEventBus,
  ProductDisplayOptions,
  ProductInfoOptions,
  QuantitySelectorEventBus,
  QuantitySelectorOptions,
  RandomizeRecipeButtonEventBus,
  RandomizeRecipeButtonOptions,
  Recipe,
  RecipeImageEventBus,
  RecipeImageOptions,
  Responsive,
  SharingListDialogEventBus,
  SharingListDialogOptions,
  SizeSelectorEventBus,
  SizeSelectorOptions,
  SnapshotsEventBus,
  SnapshotsOptions,
  ThumbnailsDisplayEventBus,
  ThumbnailsDisplayOptions
} from './ui/configureui-components';
import {
  AddToCartInfo,
  AttributeValuePair,
  ConfigureInitParams,
  ConfigurePreferences,
  ConfigureUIEvent,
  CreateComponentsOptions,
  FormatPriceOptions,
  GetTemplateOptions,
  GetTemplateOptionsResult,
  GetUpchargesOptions,
  MediaQueryOptions,
  PrintElementOptions,
  RecipeFormat,
  SelectValueOptions,
  SetRecipeOptions,
  SetUgcImageOptions,
  UISettings
} from './ui/configureui-types';
import { promisify } from './utils/promisify';
import { Callback, GenericCallback, NodeCallback } from './utils/types';

const DEFAULT_ID = 'default';

export class ConfigureUI {
  /** Map of ConfigureUI instances */
  static #instances: Record<string, ConfigureUI> = {};

  /** ID of the instance */
  id: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #configureApi: any;
  #hookManager = new HookManager(this);
  #ready: Promise<void>;
  queryParams: Partial<ConfigureInitParams> = {};

  /**
   * Retrieves the default ConfigureUI instance if one was created.
   *
   * @returns the instance or `undefined` if no instance was created
   */
  static get(): ConfigureUI | undefined;
  /**
   * Retrieves an instance from the map by ID.
   *
   * @param id id of the instance
   * @returns the instance or `undefined` if not found
   */
  static get(id: string): ConfigureUI | undefined;
  static get(id: string = DEFAULT_ID): ConfigureUI | undefined {
    return ConfigureUI.#instances[id];
  }

  constructor(params: ConfigureInitParams) {
    // Adds the required QueryParams for configuration properties that cannot
    // be set any other way
    addRequiredQueryParams(params);

    this.id = params.id ?? DEFAULT_ID;

    // Add this instance to the instances map
    this.addToInstancesMap(this.id);

    this.#ready = new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configureAppHandler = (e: any) => {
        this.queryParams = e.detail.configureApp._GET;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e.detail.configureApp(params, (err: Error, api: any) => {
          // ConfigureUI API is always returned, even when there's an error
          // so promisify wont work in this case
          this.#configureApi = api;
          if (err) return reject(err);
          resolve();
        });
        document.removeEventListener('configureApp', configureAppHandler);
      };
      document.addEventListener('configureApp', configureAppHandler);
    });
  }

  setUgcImage(options: SetUgcImageOptions): Promise<AttributeValuePair[]> {
    return promisify((cb) => this.#configureApi.run('setUgcImage', options, cb));
  }

  removeUgcImage(options: SetUgcImageOptions): Promise<AttributeValuePair[]> {
    return promisify((cb) => this.#configureApi.run('selectValue', { ca: options.ca, av: { clipArt: '' } }, cb));
  }

  resetAttribute(ca: ConfigureAttribute): void {
    const defaultValue = getInitialRecipeItemForCA(ca);
    if (defaultValue !== undefined) this.selectValue(defaultValue);
  }

  resetAttributes(cas: ConfigureAttribute[]): void {
    const recipeChanges = cas.map(getInitialRecipeItemForCA).filter((i) => i !== undefined);
    if (recipeChanges.length > 0) this.setRecipe(recipeChanges as SetRecipeOptions);
  }

  private addToInstancesMap(id: string): void {
    if (ConfigureUI.#instances[id]) throw new Error(`A ConfigureUI instance with id '${id}' already exists`);
    ConfigureUI.#instances[id] = this;
  }

  get created(): boolean {
    return this.#configureApi;
  }

  ready(): Promise<void> {
    return this.#ready;
  }

  isWebGl(): boolean {
    return this.#configureApi.run('isWebGl');
  }

  getUISettings(): UISettings {
    return this.#configureApi.run('getUiSettings');
  }

  getProduct(): ConfigureProduct | undefined {
    return this.#configureApi.run('getProduct');
  }

  getTemplateOptions(options: GetTemplateOptions): Promise<GetTemplateOptionsResult> {
    return promisify((cb) => this.#configureApi.run('getTemplateOptions', options, cb));
  }

  getUpcharges(options?: GetUpchargesOptions): Record<string, number> {
    return this.#configureApi.run('getUpcharges', options);
  }

  getRecipe(format: 'compact'): Record<string, string>;
  getRecipe(format: 'human'): Record<string, string>;
  getRecipe(format: 'custom' | 'json'): AttributeValuePair[];
  getRecipe(format: 'custom', attributeKey: string): Record<string, AttributeValue>;
  getRecipe(format: 'custom', attributeKey: string, valueAttribute: string): Record<string, string>;
  getRecipe(
    format?: RecipeFormat,
    data?: unknown,
    data2?: unknown
  ): Record<string, AttributeValue> | Record<string, string> | AttributeValuePair[] {
    return this.#configureApi.run('getRecipe', format, data, data2);
  }

  setRecipe(changes: SetRecipeOptions): Promise<AttributeValue[]> {
    return promisify((cb) => this.#configureApi.run('setRecipe', changes, cb));
  }

  getAttributeOrThrow(options: { [P in keyof ConfigureAttribute]?: ConfigureAttribute[P] }): ConfigureAttribute {
    return this.#configureApi.run('getAttribute', options);
  }

  getAttribute(options: { [P in keyof ConfigureAttribute]?: ConfigureAttribute[P] }): ConfigureAttribute | undefined {
    try {
      return this.#configureApi.run('getAttribute', options);
    } catch (e) {
      // Detect error when CA is not found and return undefined instead
      if ((e as Error).message?.includes('could not find')) return undefined;
      throw e;
    }
  }

  getQuantity(): number {
    return this.#configureApi.run('getQuantity');
  }
  setQuantity(quantity: number): void {
    this.#configureApi.run('setQuantity', quantity);
  }

  formatPrice(value: number, options?: FormatPriceOptions): string {
    return this.#configureApi.run('formatPrice', value, options);
  }

  selectValue(attrValuePair: SelectValueOptions): Promise<AttributeValuePair[]> {
    return promisify((cb) => this.#configureApi.run('selectValue', attrValuePair, cb));
  }

  /* - - - - - - - - - - - - - - - - - - - - HOOKS  - - - - - - - - - - - - - - - - - - - - - - - */

  openMenuOption(caId: number): Promise<EventBus> {
    return promisify((cb) => this.#configureApi.run('openMenuOption', { caId: caId }, cb));
  }

  registerHookForAttribute<T extends keyof HooksWithAttributeMap>(
    attributeAlias: string,
    hook: T,
    handler: HooksWithAttributeMap[T]
  ): void;
  registerHookForAttribute(attributeAlias: string, hook: keyof HooksWithAttributeMap, handler: GenericCallback): void {
    this.#hookManager.addHook({ attributeAlias, hook, handler });
  }

  registerHook<T extends ConfigureHooks>(hook: T, handler: HooksMap[T]): void;
  registerHook(hook: ConfigureHooks, handler: GenericCallback): void {
    this.#hookManager.addHook({ hook, handler });
  }
  registerHookWithOpts<T extends ConfigureHooks>(opts: HookOpts<T>): void {
    this.#hookManager.addHook(opts);
  }

  registerMediaQueries(mqs: string[]): Promise<Record<string, EventBus>> {
    const mediaQueries: Record<string, MediaQueryOptions> = {};
    mqs.forEach((mq) => {
      const api = this.#configureApi;
      mediaQueries[mq] = {
        components: [],
        onChange(matches: boolean) {
          if (matches) api.trigger('mediaQuery:change', mq);
        }
      };
    });
    return this.createComponents({
      container: 'body',
      components: [],
      mediaQueries
    });
  }

  createComponent(options: RecipeImageOptions & Embeddable & Responsive): Promise<RecipeImageEventBus>;
  createComponent(options: PagerOptions & Embeddable & Responsive): Promise<PagerEventBus>;
  createComponent(options: NavFlyoutOptions & Embeddable & Responsive): Promise<NavFlyoutEventBus>;
  createComponent(options: AccordionOptions & Embeddable & Responsive): Promise<AccordionEventBus>;
  createComponent(
    options: RandomizeRecipeButtonOptions & Embeddable & Responsive
  ): Promise<RandomizeRecipeButtonEventBus>;
  createComponent(options: ThumbnailsDisplayOptions & Embeddable & Responsive): Promise<ThumbnailsDisplayEventBus>;
  createComponent(options: ProductInfoOptions & Embeddable & Responsive): Promise<EventBus>;
  createComponent(options: SharingListDialogOptions & Embeddable & Responsive): Promise<SharingListDialogEventBus>;
  createComponent(options: ButtonOptions & Embeddable & Responsive): Promise<EventBus>;
  createComponent(options: ProductDisplayOptions & Embeddable & Responsive): Promise<ProductDisplayEventBus>;
  createComponent(options: DisplayWebGlOptions & Embeddable & Responsive): Promise<DisplayWebGlEventBus>;
  createComponent(options: SizeSelectorOptions & Embeddable & Responsive): Promise<SizeSelectorEventBus>;
  createComponent(options: SnapshotsOptions & Embeddable & Responsive): Promise<SnapshotsEventBus>;
  createComponent(options: QuantitySelectorOptions & Embeddable & Responsive): Promise<QuantitySelectorEventBus>;
  createComponent(options: AddToCartButtonOptions & Embeddable & Responsive): Promise<AddToCartEventBus>;
  createComponent(options: ComponentOptions & Embeddable & Responsive): Promise<EventOnCommon> {
    if (options.type === 'accordion' && options.nested) {
      return createNestedAccordion(this, options);
    } else if (this.hasMediaQuery(options)) {
      return this.createResponsiveComponent(options);
    } else {
      return promisify((cb) => this.#configureApi.run('createComponent', options, cb));
    }
  }

  private hasMediaQuery(
    opts: ComponentOptions & Embeddable & Responsive
  ): opts is ComponentOptions & Embeddable & Required<Responsive> {
    return !!opts.mediaQuery;
  }

  private createResponsiveComponent(
    options: ComponentOptions & Embeddable & Required<Responsive>
  ): Promise<EventOnCommon> {
    return promisify((cb) => {
      const em: EventBusWrapper<LifecycleEvent> = new EventBusWrapper();
      const api = this.#configureApi;
      this.#configureApi.run(
        'createComponents',
        {
          container: 'body',
          components: [],
          mediaQueries: {
            [options.mediaQuery]: {
              components: [options],
              onChange(matches: boolean, eventBuses: Record<string, unknown>) {
                handleResponsiveEventBus(em, eventBuses?.[options.type], matches);
                if (matches) {
                  api.trigger('mediaQuery:change', options.mediaQuery);
                }
              }
            }
          }
        },
        function (err: Error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cb(err, em as any);
        }
      );
    });
  }

  // Warning: Only use on dev
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getApi(): any {
    return this.#configureApi;
  }

  createComponents(options: CreateComponentsOptions): Promise<Record<string, EventBus>> {
    return promisify((cb) => this.#configureApi.run('createComponents', options, cb));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setComponentOptions(options: Record<string, any>): void {
    this.#configureApi.run('setComponentOptions', options);
  }

  async createDialog(
    options: DialogOptions & (ConfirmDialogOptions | HtmlOptions)
  ): Promise<ConfirmDialogEventBus & DialogEventBus> {
    const dialog: ConfirmDialogEventBus & DialogEventBus = await promisify((cb) =>
      this.#configureApi.run('createDialog', options, cb)
    );
    // If an AbortController was specified, use it when closing the dialog
    if (options.abortController) {
      dialog.on('dialog:closeRequest', () => options.abortController?.abort());
    }
    return dialog;
  }

  closeDialogs(): void {
    this.#configureApi.run('closeDialogs');
  }

  /** Reset a recipe to its initially loaded state. */
  resetRecipe(): Promise<void> {
    return promisify((cb) => this.#configureApi.run('resetRecipe', cb));
  }

  saveRecipe(): Promise<Recipe> {
    return promisify((cb) => this.#configureApi.run('saveRecipe', cb));
  }

  getPreferences(): ConfigurePreferences {
    return this.#configureApi.run('getPreferences');
  }

  /**
   * Return the group of a ConfigureAttribute instance.
   *
   * @param ca Configure Attribute instance
   */
  getCAGroup(ca: ConfigureAttribute): AttributeGroup | null {
    const attributeGroups = this.getProduct()?.attributeGroups;
    if (!attributeGroups) return null;
    for (const group of attributeGroups) {
      if (group.attributes.includes(ca.id)) {
        return group;
      }
    }
    return null;
  }

  /**
   * Return a hash which groups the CA by attribute groups
   *
   * @param attributeGroups list of Groups
   * @param configure instance of ConfigureUI
   */
  // TODO: Maybe It could set attributeGroups as class variable
  // and unset on configure UI destroy event
  getAttributesByGroup(): Map<number, Array<ConfigureAttribute>> {
    const attributeGroups = this.getProduct()?.attributeGroups;
    if (!attributeGroups) return new Map();
    const groupedAttributes = new Map<number, Array<ConfigureAttribute>>();
    attributeGroups.forEach((ag: AttributeGroup) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const cas = ag.attributes.map((attr_id) => this.getAttributeOrThrow({ id: attr_id })!);
      groupedAttributes.set(ag.id, cas);
    });
    return groupedAttributes;
  }

  /**
   * Sends a DOM element to the printer
   * @param element The DOM element to print
   * @param options print settings
   */
  printElement(element: string | HTMLElement, options?: PrintElementOptions): Promise<HTMLIFrameElement> {
    return promisify((cb) => this.#configureApi.run('printElement', element, options, cb));
  }

  /** Force hiding all tooltips (global) */
  hideTooltips(): void {
    this.#configureApi.run('hideTooltips');
  }

  /**
   * Builds the Share URL for this recipe id.
   *
   * It's done by using the current URL and setting or replacing the current recipe query param
   */
  getShareURL(recipeId: number | string): string {
    const url = new URL(window.location.href);
    url.searchParams.set('recipe', recipeId.toString());
    return url.toString();
  }

  /**
   * Saves the current recipe to the server and uses the id to build the share URL
   */
  async saveAndGetShareURL(): Promise<string> {
    const recipe = await this.saveRecipe();
    return this.getShareURL(recipe.id);
  }

  on(eventName: 'mediaQuery:change', handler: (mediaQuery: string) => void): void;
  on(eventName: 'add-to-cart', handler: (info: AddToCartInfo) => void): void;
  on(
    eventName: 'recipe:change',
    handler: (modifications: Array<{ ca: ConfigureAttribute; av: AttributeValue }>) => void
  ): void;
  on<T>(
    eventName: 'recipe:loaded',
    handler: (recipe: AttributeValuePair[], recipeDocument: RecipeDocument<T>) => void
  ): void;
  on(
    eventName: 'ca:object-focus' | 'ca:focus',
    handler: (data: { caId: number }, cb: NodeCallback<string, number>) => void
  ): void;
  on(
    eventName: Exclude<
      ConfigureUIEvent,
      'ca:object-focus' | 'ca:focus' | 'recipe:change' | 'add-to-cart' | 'mediaQuery:change'
    >,
    handler: Callback
  ): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(eventName: ConfigureUIEvent, handler: unknown): void {
    this.#configureApi.on(eventName, handler);
  }
}
