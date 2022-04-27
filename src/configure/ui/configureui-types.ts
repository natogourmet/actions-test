import { EventBus } from '../event/types';
import { Callback } from '../utils/types';
import { AttributeValue } from '../model/AttributeValue';
import { ConfigureAttribute } from '../model/ConfigureAttribute';
import { ConfigureProduct } from '../model/ConfigureProduct';
import { ComponentOptions, Embeddable } from './configureui-components';

export type ConfigureUIEvent =
  | 'ca:focus'
  | 'ca:object-focus'
  | 'recipe:change'
  | 'recipe:reset'
  | 'recipe:randomize'
  | 'recipe:reset'
  | 'recipe:randomize'
  | 'recipe:loaded'
  | 'dialog:opened'
  | 'dialog:closed'
  | 'analytics:configureLoaded'
  | 'add-to-cart'
  | 'mediaQuery:change'
  | 'openMenuOption';
export type RecipeFormat = 'compact' | 'human' | 'custom' | 'json'; //TODO Lacks documentation //|  'save' |'extended' | 'legacyVerbose' | 'legacyConcise';

export interface ConfigurePreferences {
  apiKey?: string;
}

/** ConfigureUI Standard Initialization Parameters */
export interface ConfigureUIBaseInitParams {
  /**  Customer ID. */
  customer: number;

  /**Product ID. */
  product: number;

  /**  The environment to use for configurations and services. The default is "prod". */
  environment?: string;

  /** The workflow from which to load configurations. The default is "prod". */
  workflow?: string;

  /** The locale to use for this instance. The defaults is "en_us". You must have localization defined for this locale. */
  locale?: string;

  /** Load the configurator with this recipe ID. If omitted, a blank recipe will be used with default values for each attribute. */
  recipe?: number;

  currency?: unknown;
  apiVersion?: string;

  /** Facebook appId to use for Facebook integration. */
  facebookAppId?: number;

  /** Pass in a parameterized facet or array of parameterized facet filters to globally limit the available attribute values. */
  facetFilters?: unknown;

  useSemanticButtons?: boolean;
  ignoreDefaultViewFallback?: boolean;
  dir?: 'rtl' | 'ltr';
}

/**
 * ConfigureUI Initialization Parameters
 */
export interface ConfigureInitParams extends ConfigureUIBaseInitParams {
  /**
   * Id of the ConfigureUI instance.
   *
   * Useful when using multiple instances to retrieve the right one (using `ConfigureUI.get([id])`) from the ConfigureUI instances map.
   *
   * It's optional. When not defined, "default" is used, as the most common case will be to have only one instance
   *
   */
  id?: string;

  /**
   * WebGL display environment (branch) to use.
   * Useful in development to test new unreleased features.
   */
  webglEnvironment?: string;
}

export interface MediaQueryOptions {
  components: Array<ComponentOptions & Partial<Embeddable> & { callback?: EventBus; alias?: string }>;
  onChange?: (matches: boolean, componentEvents: Record<string, EventBus<string>>) => void;
}

export interface CreateComponentsOptions extends Embeddable {
  components: Array<ComponentOptions & Partial<Embeddable> & { callback?: EventBus; alias?: string }>;

  /** By default dynamically created containers will contain the configure- prefix. This option allows you to change that default. */
  containerPrefix?: string;

  /**  An object that contains responsive media query objects. The key is the media query itself. */
  mediaQueries?: Record<string, MediaQueryOptions>;
}

export interface ConfigureInitError<T = unknown> extends Error {
  fcErrorType: 'recipe:invalid' | 'recipe:notFound';
  fcErrorDetails: T;
}
export interface ConfigureErrorInvalidRecipe extends ConfigureInitError<ErrorInvalidRecipeDetails> {
  fcErrorType: 'recipe:invalid';
}
export interface ErrorInvalidRecipeDetails {
  fallbackRecipe: SetRecipeOptions;
  unavailable: AttributeValuePair[];
  replacements: AttributeValuePair[];
  recipeDocument: { configuration: Record<string, string> };
}

export interface FormatPriceOptions {
  /** The currency code, e.g. GBP. When this option is provided the symbol and format options will default to what was defined on the admin. */
  currency?: string;

  /** A currency symbol, e.g. $ */
  symbol?: string;

  format?: {
    /** Format for positive prices. */
    pos?: string;

    /** Format for negative prices. */
    neg?: string;

    /** Format for zero prices. */
    zero?: string;
  };

  /** The number format code, e.g. EUR. When this option is provided the decimal, thousand and precision options will default to what is defined on the admin. */
  numberFormat?: string;

  /** Decimal point separator. */
  decimal?: string;

  /** Thousands separator. */
  thousand?: string;

  /**Decimal places. */
  precision?: number;
}

export interface AddToCartInfo {
  /** The ID of the recipe, e.g. 123. */
  id: number;

  /** Unit price in the current locale currency. */
  price: number;

  /** Total units selected by the customer. */
  quantity: number;

  /** URL to the recipe resource, e.g. https://cdn-prod.fluidconfigure.com/api/recipe/123. */
  resource: string;

  /** `view-url` pair with the image URLs defined for the addToCart purpose on the uiSettings; e.g. `{"Front": "http://example.com/Front.png"}`. */
  images: Record<string, string>;
}

export interface AttributeValuePair<A = ConfigureAttribute, V = AttributeValue> {
  /** Configure Attribute */
  ca: A;

  /** Attribute Value */
  av: V;
}

export type SelectValueOptions =
  | AttributeValuePair<number, number>
  | AttributeValuePair<{ alias: string }, { name: string }>
  | AttributeValuePair<{ alias: string }, { id: number }>
  | [string, string]
  | [string, { color: string }]
  | [{ name: string }, { color: string }];

export type SetRecipeOptions = Array<SelectValueOptions>;

export interface GetTemplateOptions {
  /** Used to define a purpose for image URL generation. These are defined on the admin. E.g. `printDialog`, `shareEmail`, `addToCatalog`... */
  purpose: string;
}

export interface GetTemplateOptionsResult {
  /** Price with default formatting options. */
  formattedPrice: string;

  /** Object with `{alias: "Value name"}` pairs. */
  humanRecipe: Array<{ alias: string }>;

  /** URL for the first image defined on the purpose. */
  imageUrl: string;

  /** Object with `{image_name: "url"}` pairs. */
  imageUrls: Array<{ image_name: string }>;

  /** Unformatted price. */
  price: string;

  /** Product JSON. Same as calling `api.getProduct()` */
  product: ConfigureProduct;

  /** Total quantity */
  quantity: number;

  /** Recipe in JSON format. Same as calling `api.getRecipe("json")` */
  recipe: AttributeValuePair[];

  /* Recipe ID. Keep in mind that calling this method will trigger a new recipe save event */
  recipeId: string;

  /**  Recipe URL as defined on the admin */
  recipeUrl: string;

  /** Tiny URL pointing to `result.recipeUrl` */
  tinyUrl: string;
}

export interface GetUpchargesOptions {
  /** The property on the CA that we will use as the key of the response. Defaults to `alias`. */
  caKey?: string;

  /** When set to aggregated the resulting object will contain the upcharge sum for itself and all it's sub attributes. */
  format?: string;

  /** Specifies currency to use, e.g. `USD`. */
  currency?: string;
}

export interface PrintElementOptions {
  /** The print page title */
  pageTitle?: string;

  /**
   * Can be one of the following:
   * - `boolean`: pass true for stripping all css linked
   * - `string[]`: with paths to alternate css files
   */
  overrideElementCSS?: boolean | string[];

  /** An object with style attributes to add to the BODY of the print document */
  printBodyOptions?: {
    /** Style attributes to add to the `<body>` */
    styleToAdd?: string;

    /** css class name to add to the `<body>` */
    classNameToAdd?: string;
  };

  /** Set to false to prevent auto-print */
  autoPrint?: boolean;
}

export interface SetUgcImageOptions {
  /** An object with either the attribute id or alias */
  ca: { id: number } | { alias: string };

  /**
   * Image Data URI in PNG or JPEG format, this is normally taken from a canvas instance via `canvas.toDataURL()`.
   *
   * E.g. `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...`
   *
   * @see https://en.wikipedia.org/wiki/Data_URI_scheme#cite_note-2.
   */
  dataURI?: string;

  /**
   * Set to `false` if you don't want to call selectValue after the image has been uploaded.
   * You can use the `onUgcDetails` to grab the details of the image that was uploaded.
   * Setting this to `false` will prevent the `recipe:change` from firing.
   */
  setValue?: boolean;

  /**
   * A function that will be called with the image upload progress.
   */
  // TODO: Callback parameters?
  onProgress?: Callback;

  /**
   * A function that will be called with the details after the image is uploaded and before they are set on the recipe.
   *
   * E.g. `details {ca: {id: 123}, av: {clipArt: "123.png"}}`
   */
  onUploadComplete?: Callback<AttributeValuePair<{ id: number }, { clipArt: string }>>;
}

export interface UISettings {
  globals?: {
    i18n?: Record<string, string>;
  };
}
