import { EventBus, EventOn, EventOnCommon, EventOnWithError, EventTrigger } from '../event/types';
import { AttributeValue } from '../model/AttributeValue';
import { ConfigureAttribute } from '../model/ConfigureAttribute';
import { ConfigureProduct } from '../model/ConfigureProduct';
import { Callback, NodeCallback, Position } from '../utils/types';
import { AddToCartInfo } from './configureui-types';

interface Typable {
  type: string;
}

export interface Embeddable {
  /** DOM element, ID or selector. */
  container: HTMLElement | string;
}

export interface Responsive {
  /** If defined, the component is only shown when the media query matches the actual screen (dimentions, orientations, etc) */
  mediaQuery?: string;
}

/** Parameters to create a Configure UI Component */
export type ComponentOptions =
  | AddToCartButtonOptions
  | QuantitySelectorOptions
  | SnapshotsOptions
  | SizeSelectorOptions
  | DisplayWebGlOptions
  | ProductDisplayOptions
  | ConfirmDialogOptions
  | ButtonOptions
  | SharingListDialogOptions
  | ProductInfoOptions
  | ThumbnailsDisplayOptions
  | RandomizeRecipeButtonOptions
  | AccordionOptions
  | NavFlyoutOptions
  | PagerOptions
  | RecipeImageOptions;

export interface DialogOptions {
  /** A string specifying the title to show in the title bar. */
  title?: string;

  /** Shows the close control. The default is true. */
  showClose?: boolean;

  /** The width of the dialog. The default is 300. If wider than the viewport, it will equal 90% of the viewport width. */
  width?: number;

  /**
   * The total height of the dialog, including the optional header. If taller than the viewport, the dialog will scroll.
   * The default is "auto", meaning the height will match the size of the content.
   */
  height?: number;

  /** A custom css class. This class will be appended to the existent `fc-dialog` class. */
  customClassName?: string;

  /** Closes the dialog when area outside dialog is clicked/touched. The default is true */
  closeOnBlur?: boolean;

  /**
   * An integer specifying at which level to show the dialog. Useful for displaying dialogs within dialogs.
   * Higher layers appear on top of other layers.
   * The default is 0.
   */
  layer?: number;

  /**
   * ConfigureUI Extension.
   *
   * Allows to specify an abort controller so event listeners can be added to the Dialog DOM elements
   * and they can be cleanup on `dialog:closeRequested`
   *
   */
  abortController?: AbortController;
}

export type DialogEventBus = EventOn<'dialog:closeRequest'> & {
  // on(event: 'dialog:closeRequest', cb: () => void): void;
  on(event: 'dialog:closed', cb: (layer: number) => void): void;
  on(event: 'dialog:opened', cb: (layer: number) => void): void;

  off(event: 'dialog:closed', cb: (layer: number) => void): void;

  trigger(event: 'dialog:show', layer: number): void;
  trigger(event: 'dialog:closeRequest', layer: number): void;

  trigger(event: 'dialog:close'): void;
  trigger(event: 'dialog:destroy'): void;
};

export interface AddToCartButtonOptions extends Typable {
  type: 'addToCartButton';

  /** Custom label for the button. */
  buttonLabel?: string;

  /** If set to false the component will not save the recipe immediately, allowing you to implement custom add to cart workflows. See the selected event below. Defaults to true. */
  saveOnSelected?: boolean;

  /** Whether or not to show the price on the button component defaults to false. */
  showPriceOnButton?: boolean;

  /** Hook to modify a recipe before it's saved. */
  beforeSave?: (callback: NodeCallback<Error, AttributeValue[]>) => void;
}
export type AddToCartEventBus = EventOnCommon &
  EventOn<'selected' | 'saving'> &
  EventTrigger<'save'> & {
    /**
     * Fired once the recipe has been saved. The first parameter will contain a JavaScript Error instance
     * if there where problems while saving the recipe and the second parameter includes the same info as the add-to-cart event.
     */
    on(event: 'saved', cb: NodeCallback<Error, AddToCartInfo>): void;

    /** Fired on errors. The first parameter will contain a JavaScript Error instance. */
    on(event: 'error', cb: NodeCallback<Error, void>): void;
  };

export interface QuantitySelectorOptions extends Typable {
  type: 'quantitySelector';

  /**
   * The style of component.
   * One of:
   * - `select` - a select drop down
   * - `input` ­- a numeric input field
   * - `inputWithButtons` - a numeric input field with increase/decrease buttons.
   */
  selectorType: 'select' | 'input' | 'inputWithButtons';

  /** The minimum quantity allowed. Default 1. */
  min?: 0;

  /** The maximum quantity allowed. Default 10. */
  max?: 15;
}

export type QuantitySelectorEventBus = EventBus<'quantity'>;

export interface SnapshotsOptions extends Typable {
  type: 'snapshots';

  /**
   * Callback function to return a formatted date string.
   * Receives a `Date object` parameter and should return a string.
   * Default browser localized hour for snapshots saved on the same day or the localized day for older snapshots.
   */
  formatDate?: (date: Date) => string;

  /** Should the snapshot list automatically open when new snapshot is created? Default true. */
  openOnSave?: boolean;

  /** When a new snapshot is taken place the new entry on the top of the list. Default true. */
  newestOnTop?: boolean;

  /** When newestOnTop is set to false scroll down the list to the bottom automatically. Default true. */
  autoScroll?: boolean;

  /** Closes the snapshots list when the user clicks on the snapshot to load it on the configurator. Default false. */
  closeOnLoaded?: boolean;

  uiSettings: {
    snapshots: {
      /** Snapshot language (customize strings). */
      i18n: {
        takeButtonLabel?: string;
        viewButtonLabel?: string;
        hideButtonLabel?: string;
        headerText?: string;
        headerInstructionsText?: string;
        callToActionContent?: string;
      };
    };
  };
}

export type SnapshotsEventBus = EventBus<'snapshot:save' | 'snapshot:load' | 'snapshot:remove' | 'snapshots:close'> &
  EventOnWithError<'snapshots:open', void>;

export interface SizeSelectorOptions extends Typable {
  type: 'sizeSelector';

  /**
   * The style of component.
   * One of:
   * - `dropdown` (default)
   * - `buttongroup`
   * - `radiobutton`
   */
  selectorType?: 'dropdown' | 'buttongroup' | 'radiobutton';

  /** The label to show. Default "Size". */
  sizeLabel?: string;
}

export type SizeSelectorEventBus = EventOnCommon &
  EventOn<'av:change', { caId: number; avId: number }> &
  EventTrigger<'av:change'>;
// & {
//     on(event: 'av:change', cb: (change: {caId: number, avId: number}) => void): void;
// }

export interface DisplayWebGlOptions extends Typable {
  type: 'displayWebgl';

  /** The width in pixels or any other valid css value, by default it will be set to "100%". */
  width?: string;

  /** The height in pixels or any other valid css value, by default it will be set to "100%". */
  height?: string;

  /**
   * Webgl setting overrides.
   * i.e. `{scene: {background: '#000'}}`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webglOverrides?: Record<string, any>;
}

type DisplayWebGlEvents =
  | 'display:webgl:load-progress'
  | 'display:webgl:textures:loaded'
  | 'display:webgl:model:loaded'
  | 'display:webgl:viewChange'
  | 'display:webgl:mesh:hover'
  | 'display:webgl:usdzModelExportReady'
  | 'display:webgl:exportToUsdz'
  | 'display:webgl:resizeCanvas';

export type DisplayWebGlEventBus = EventTrigger<DisplayWebGlEvents> &
  EventOnCommon &
  EventOn<Exclude<DisplayWebGlEvents, 'display:webgl:load-progress' | 'display:webgl:usdzModelExportReady'>> & {
    on(event: 'all', cb: (eventName: DisplayWebGlEvents, data?: unknown) => void): void;
    on(event: 'display:webgl:load-progress', cb: (progress: number) => void): void;
    on(event: 'display:webgl:usdzModelExportReady', cb: (fileURL: string) => void): void;
  };

export interface DisplayCarouselOptions extends Typable {
  type: 'displayCarousel';

  /**
   * The width of the display, in pixels. If not specified, this will be taken from the clientWidth of the container.
   * If the container is not passed, this becomes a required option.
   */
  width?: number;

  /**
   * The height of the display. If not specified, this will be inferred from the image.
   */
  height?: number;

  /** Boolean flag to determine whether to display indicator dots in the carousel. The default is true. */
  showDots?: boolean;

  /** Boolean flag to determine whether to display previous and next arrows in the carousel. The default is true. */
  arrows?: boolean;

  /** The format of the images to load. Either "jpg" or "png". The default is "png". */
  format?: string;

  /**  JPG quality. A number from 1 to 99. */
  quality?: number;

  /** Set the view to display initially. This option will be ignored after the first render. The default is to the first of the list of viewNames. */
  selectedView?: string;

  /** Boolean flag to enable showing tooltips on click to configure highlighted areas (requires clickToConfigure:true). */
  enableTooltips?: boolean;

  /** Boolean flag that enables click to configure highlighting and and attribute selection. The default is false. */
  clickToConfigure?: boolean;
}

export type DisplayCarouselEventBus = EventOnCommon &
  EventOn<'display:loaded'> & {
    on(event: 'display:viewChange', cb: (viewName: string) => void): void;
    on(event: 'display:selectedView', cb: (viewName: string) => void): void;
    on(event: 'displayHighlight:hover', cb: (caId: number, event: MouseEvent) => void): void;
    on(event: 'displayHighlight:click', cb: (caId: number) => void): void;
    on(event: 'image:loading', cb: (details: { src: string }) => void): void;
    on(event: 'image:loaded', cb: (details: { img: MediaImage }) => void): void;

    trigger(event: 'display:selectedView', viewName: string): void;
  };

export interface ProductDisplayOptions extends Omit<DisplayCarouselOptions, 'type'> {
  type: 'productDisplay';
}

export type ProductDisplayEventBus = DisplayCarouselEventBus;

export interface HtmlOptions extends Typable {
  type: 'html';
  innerHTML: string;
}

export interface ConfirmDialogOptions extends Typable {
  type: 'confirmDialog';

  /**  The title of the dialog. */
  title: string;

  /** The text to display in the dialog body. */
  text: string;

  uiSettings?: {
    i18n: {
      /** The default is "OK". */
      okButtonLabel?: string;

      /** The default is "Cancel". */
      cancelButtonLabel?: string;
    };
  };
}

export type ConfirmDialogEventBus = EventBus<'dialog:ok' | 'dialog:cancel' | 'dialog:closeRequest'>;

export interface ButtonOptions extends Typable {
  type: 'button';

  /** Label will show up on the button. */
  title: string;

  /** Specifies the tab order of an element (when the "tab" button is used for navigating). */
  tabIndex: number;

  /** Specifies an initial value for the button, the same will be returned on onClick handler. */
  value?: string;

  /** Button Click event handler */
  onClick?: (event: MouseEvent) => void;

  /** Global option for implementations to change the behavior of our button component to render real nodes */
  useSemanticButtons?: boolean;

  uiSettings?: {
    /** Specify a tooltip to show when you hover over the button. */
    buttonTooltip: {
      /**
       * content to display in tooltip. If string, can be a plain string or HTML.
       * If passing a function, it will be invoked every time the tooltip is shown.
       * No default available: tooltip will be empty if this field is not defined.
       */
      content?: string | (() => string);

      /** the position of the tooltip. It could be one of: top, right, bottom or left. Default to top. */
      position?: Position;
    };
  };
}

export interface SharingListDialogOptions extends Typable {
  type: 'sharingListDialog';

  /**
   * An array of the share options. Can be:
   * - `email`
   * - `facebook`
   * - `twitter`
   * - `pinterest`
   */
  types?: Array<'email' | 'pinterest' | 'twitter' | 'facebook'>;

  /**
   * An array of share types that will open directly a new popup window without an intermediate dialog.
   * Keep in mind that popup blockers might prevent the window form opening. Valid options are:
   * - `facebook`
   * - `twitter`
   * - `pinterest`
   */
  skippedDialogs?: Array<'pinterest' | 'twitter' | 'facebook'>;
}

export type SharingListDialogEventBus = EventOnCommon & EventOn<'close'> & EventOn<'share', string>;

export interface ProductInfoOptions extends Typable {
  type: 'productInfo';

  /** What elements from the product configuration will be shown. By default `["name", "description"]`. */
  showElements?: Array<keyof ConfigureProduct>;
}

export interface ThumbnailsDisplayOptions extends Omit<DisplayCarouselOptions, 'type'> {
  type: 'thumbnailsDisplay';

  /** The number of slides to show in the display. Default 5. */
  slidesToShow?: number;

  /**
   * Padding (in pixels) to have to the left and right of the thumbnails. Default 50. This value will be subtracted from the display's width.
   * Use CSS to center the component in its container.
   */
  containerPadding?: number;
}

export type ThumbnailsDisplayEventBus = DisplayCarouselEventBus & {
  on(event: 'display:viewClicked', cb: (viewName: string) => void): void;
};

export interface RandomizeRecipeButtonOptions extends Typable {
  type: 'randomizeRecipeButton';
}

export type RandomizeRecipeButtonEventBus = EventBus<'randomizeRecipe'>;

export interface AccordionOptions extends Typable {
  type: 'accordion';
  /** If true, a nested accordion using the attribute groups is created */
  nested?: boolean;
  showGroupName: boolean;
  uiSettings?: {
    selectorLayout?: {
      /** Show the name of the attribute in the selector. The default is false. */
      showName: boolean;
    };
    attributeValueTooltip?: {
      /** Flag that allows to show extended tooltips on swatches. */
      extended: boolean;

      /**
       * If `extended` flag is true, a `function` callback may be provided here to override/customize the tooltip content entirely.
       * A string must be returned, and may include composed HTML.
       * The callback will receive the Attribute Value object for pulling data from.
       * TODO: Fix -> the parameter should be an AV, no CA
       */
      content?: string | ((av: ConfigureAttribute) => string);

      /** The position of the tooltip. It could be one of: top, right, bottom or left. Default to right. */
      position?: Position;
    };

    /** UI Settings for the groups (aka nested) feature */
    groups?: {
      /**
       * Groups that need to be ignored.
       * It consists of an array of strings with the **name** of each group must not be displayed on nested accordion.
       */

      ignore?: Array<string>;

      /**
       * i18n for groups headers.
       * It consists of a map with the **name** of each group as key,
       * Each group object value is another object with two keys: title and desc,
       * the values of the latter keys should be localized
       * e.g. { style: { title: t('style'), desc: t('style_desc') }, ...  }
       */
      i18n?: Record<string, Record<string, string>>;
    };
  };
}

type AttributeSelectorEventBus = EventOn<'av:stop-preview'> & {
  /** Triggered every time an attribute value changes it's value. */
  on(event: 'av:change', cb: (change: { caId: number; avId: number }) => void): void;

  /** Triggered every time a facet value is selected. */
  on(event: 'fv:change', cb: (change: { caId: number; facetId: number; avId: number }) => void): void;

  /** Triggered every time an attribute value is previewed. See the `previewValue` method for details. */
  on(event: 'av:preview', cb: (change: { caId: number; facetId: number; avId: number }) => void): void;
};

export type AccordionEventBus = EventOnCommon &
  AttributeSelectorEventBus &
  EventOn<'ca:add-element' | 'ca:remove-element'> &
  EventOn<'attributeList:setIndex', 'prev' | 'next' | number> & {
    /** Triggered when a new accordion panel is opened */
    on(event: 'ca:focus', cb: (change: { caId: number }) => void): void;

    on(event: 'display:viewChange', cb: (viewName: string) => void): void;
  };

export interface NavFlyoutOptions extends Typable {
  type: 'navFlyout';

  /** Flag that allows to preview values on the main display. Default to true. */
  previewSwatches?: boolean;

  uiSettings?: {
    attributeValueTooltip?: {
      /** Flag that allows to show extended tooltips on swatches. */
      extended: true;

      /**
       * If extended flag is true, a function callback may be provided here to override/customize the tooltip content entirely.
       * A string must be returned, and may include composed HTML. The callback will receive the Configure Attribute object for pulling data from.
       */
      content?: (ca: ConfigureAttribute) => string;

      /** The position of the tooltip. It could be one of: top, right, bottom or left. Default to left. */
      position?: Position;
    };
  };
}

export type NavFlyoutEventBus = EventOnCommon &
  EventOn<'navFlyout:open' | 'navFlyout:close'> &
  AttributeSelectorEventBus &
  EventOn<'attributeList:setIndex', 'prev' | 'next' | number> & {
    /** Triggered when a new accordion panel is opened */
    on(event: 'ca:focus', cb: (change: { caId: number }) => void): void;
  };

export interface PagerOptions extends Typable {
  type: 'pager';

  /** Width of the dialog. */
  dialogWidth?: number;

  /** Flag that allows to show the configurable attribute group name on the pager header and on the pager attribute list component. Default to false. */
  showGroupName?: boolean;

  /** Flag that replaces H3 tags on configurable attribute headers with DIV tags. Setting it to true is required for ADA compliance. Defaults to false. */
  skipHeaders?: boolean;

  /** Flag that removes the parenthesis around the page number on headers. Defaults to false. */
  skipHeadersPageParenthesis?: boolean;

  uiSettings?: {
    attributeValueTooltip?:
      | boolean
      | {
          /** Flag that allows to show extended tooltips on swatches. */
          extended: boolean;

          /**
           * If extended flag is true, a function callback may be provided here to override/customize the tooltip content entirely.
           * A string must be returned, and may include composed HTML. The callback will receive the Configure Attribute object for pulling data from.
           */
          content?: (ca: ConfigureAttribute) => string;

          /** The position of the tooltip. It could be one of: top, right, bottom or left. Default to left. */
          position?: Position;
        };
  };
}

export type PagerEventBus = EventOnCommon &
  AttributeSelectorEventBus &
  EventOn<'attributeList:setIndex', 'prev' | 'next' | number> & {
    /** Triggered when side panel is opened */
    on(event: 'pager:openList', cb: Callback): void;

    /** Triggered when side panel is closed */
    on(event: 'dialog:closed', cb: Callback): void;
  };

export interface Recipe {
  /** e.g. "2012" */
  apiVersion: string;

  /** identifier */
  id: number;

  /** url where recipe json is allocated */
  resource: string;
}

export interface RecipeImageOptions extends Typable {
  type: 'recipeImage';

  /** The name of the view to show. Defaults to `configure.run("getProduct").defaultViewName` */
  view?: string;

  /** Use the zoom version of the image as defined on the admin. This will prevent the image from being updated on recipe preview. */
  zoom?: boolean;

  /**
   * When an explicit recipeId is provided the cached version of the recipe will be rendered.
   * This recipe is not related to the current recipe selection and the display won't be updated when the user changes the recipe.
   */
  recipeId?: number;

  /** The format of the image to load. Either "jpg" or "png". The default is "png". */
  format?: string;

  /**  JPG quality. A number from 1 to 99. */
  quality?: number;
}

export type RecipeImageEventBus = EventOnCommon & {
  on(event: 'image:loaded', cb: (details: { img: HTMLImageElement }) => void): void;
};
