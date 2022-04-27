import { AttributeValue } from '@/configure/model/AttributeValue';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { CallbackTwoParams, NodeCallback } from '@/configure/utils/types';

//**************************************************************
//* Map of all availableHooks and their handlers' Definitions
//**************************************************************

/**
 * Hooks that can be general or specific to a CA (by alias)
 */
export type HooksWithAttributeMap = {
  // Hooks with handler: ca => string
  'component.attributeSelector.beforeHtml': CAToStringHookHandler;
  'component.attributeSelector.afterHtml': CAToStringHookHandler;
  'component.attributeSelector.beforeText': CAToStringHookHandler;
  'component.attributeSelector.afterText': CAToStringHookHandler;
  'component.attributeHeader.beforeHtml': CAToStringHookHandler;
  'component.attributeHeader.afterHtml': CAToStringHookHandler;
  'component.attributeHeader.beforeText': CAToStringHookHandler;
  'component.attributeHeader.afterText': CAToStringHookHandler;

  // Hooks with handler: (url: string) => string
  'component.attributeSelector.swatch.url': URLHookHandler;

  // Hooks with handler: (value: AttributeValue) => string
  'component.attributeSelector.swatch': AVHookHandler;
};

/**
 * Hooks that are always general
 */
export type HooksNoAttributeMap = {
  // Hooks with handler: () => string
  'component.pagerAttributeList.beforeHtml': VoidToStringHookHandler;
  'component.pagerAttributeList.afterHtml': VoidToStringHookHandler;
  'component.pagerAttributeList.beforeText': VoidToStringHookHandler;
  'component.pagerAttributeList.afterText': VoidToStringHookHandler;

  // Hooks with special handlers
  'method.generateImageUrl': (options: GenerateImageUrlHookPayload) => string;
  'method.beforeSaveRecipe': CallbackTwoParams<BeforeSaveRecipeHookPayload, NodeCallback<Error, unknown>>;
};

/**
 * Map with ALL the available hooks and their handlers definition
 */
export type HooksMap = HooksWithAttributeMap & HooksNoAttributeMap;

/**
 * List of all available Hooks names
 */
export type ConfigureHooks = keyof HooksMap;

//*******************************
//* Hook Handlers Definitions
//*******************************

type CAToStringHookHandler = (ca: ConfigureAttribute) => string | null | undefined;
type VoidToStringHookHandler = () => string | null | undefined;
type URLHookHandler = (url: string, alias?: string) => string;
type AVHookHandler = (value: AttributeValue, alias?: string) => string;

//**************************************************************
//* Hooks' Payloads Definitions
//**************************************************************

/**
 * Payload received in the `method.generateImageUrl` hook
 */
export interface GenerateImageUrlHookPayload {
  /** Image format. Not always included. */
  format?: string;

  /** The name of the view (Front, Back). */
  viewName: string;

  /**
   * Scale relative to the original image size. When no purposes is provided,
   * this will be computed dynamically by looking at window.devicePixelRatio
   * and the space available on the DOM element containing image. A number between 0 and 1.
   */
  scale: number;

  /** Included for persisted recipes. For example on add to cart or when taking snapshots. Not always included. */
  recipeId?: string;

  /** Purpose as defined on the admin the generated image was requested for. Not always included. */
  purpose?: string;
}

/** The possible reasons to save a recipe */
type RecipeSaveReason = 'addToCart';

/**
 * Payload received in the `method.beforeSaveRecipe` hook
 */
export type BeforeSaveRecipeHookPayload = {
  /** The reason why the recipe is being saved */
  purpose: RecipeSaveReason;
};
