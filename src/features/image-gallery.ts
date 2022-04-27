import { ConfigureUI } from '@/configure/ConfigureUI';
import { t } from '@/i18n';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { RecipeDocument } from '@/configure/model/RecipeDocument';
import { readFileFromUrl } from '@/configure/utils/file';
import { ConfigureImplEvents, ConfigureEventDispatcher } from '@/ConfigureEventDispatcher';

// TODO: get imagecomposer url from instance
// TODO: where to save values sent from Adidas?? (id or url??) (recipe or custom hook??(in case of hook, add to cart? save snapshot? share?))

/** CSS Classes */
const CONTAINER_CLASS = 'fc-ugc-custom-html';
const UPLOAD_BTN_CLASS = 'fc-custom-upload-ugc';
const CHANGE_IMAGE_CLASS = 'fc-ugc-change-image';
const REMOVE_IMAGE_CLASS = 'fc-ugc-remove-image';

const HISPayloads: Map<string, ImplImagePayload> = new Map();

export interface ImplImagePayload {
  /** The id of the image in the adidas image library. */
  imageLibraryId: string;

  /** The publicly accessible url of the image in the adidas image library. */
  url: string;

  /**
   * An object that provides the configurator with the information it requires to render the image in the appropriate
   * place on the 3d model and update internal an visual state in the configurator UI. This value is provided as an
   * attribute of the event dispatched when the upload image or image library button are clicked in the configurator.
   */
  embellishmentData: { caAlias: string };

  /** The original filename of the image uploaded to the image library. */
  fileName?: string;
}

/**
 * Adidas Recipe Custom Data
 */
export interface ImplRecipeCustomData {
  /**
   * Image Gallery Recipe Data.
   * One entry per attribute.
   *
   * The key is the alias of the attribute, the value is the image information.
   */
  imageGallery: Record<string, ImplImagePayload>;
}

/**
 * Implements the Image Gallery Feature by adding the custom UI and events handlers
 *
 * @param dispatcher event dispatcher
 * @param configure ConfigureUI Instance
 */
export function implementImageGallery(dispatcher: ConfigureEventDispatcher, configure: ConfigureUI): void {
  // Adds the hook to render the custom UI in the accordion
  configure.registerHook('component.attributeSelector.afterHtml', renderImageGalleryUI);

  // On recipe load, the custom payload is extracted to get additional info (filename, adidas id, etc)
  configure.on('recipe:loaded', (_changes, recipeDoc: RecipeDocument<ImplRecipeCustomData>) => {
    if (recipeDoc.custom?.imageGallery) {
      Object.entries(recipeDoc.custom.imageGallery).forEach(([key, value]) => {
        HISPayloads.set(key, value);
      });
    }
  });

  // Add Handler for the Image gallery buttons click events
  window.addEventListener('click', (async (event: Event) => {
    const target = event.target as HTMLElement;
    const { classList } = target;

    // Go up in the hierarchy to find out if the target is one of the buttons we are using
    // and the related CA .
    const hookContainer: HTMLElement | null = target.closest(`.${CONTAINER_CLASS}`);
    const caAlias = hookContainer?.dataset.ca;
    if (!caAlias) return;

    event.preventDefault();

    if (classList.contains(UPLOAD_BTN_CLASS)) {
      // Upload Button
      dispatcher.dispatchEvent(createCustomEvent('image-upload', caAlias));
    } else if (classList.contains(CHANGE_IMAGE_CLASS)) {
      // Image Library Button
      dispatcher.dispatchEvent(createCustomEvent('image-library', caAlias));
    } else if (classList.contains(REMOVE_IMAGE_CLASS)) {
      // Remove button
      await configure.removeUgcImage({ ca: { alias: caAlias } });
      HISPayloads.delete(caAlias);
    }
  }) as EventListener);
}

/**
 * Loads the provided image URL into ConfigureUI.
 *
 * Called by the container application.
 *
 * @param configure ConfigureUI instance
 * @param url url of the image
 */
export async function loadAndSetUgcImage(configure: ConfigureUI, payload: ImplImagePayload): Promise<void> {
  // Reads the image as DataURL
  const dataURI = await readFileFromUrl(payload.url, 'url');
  if (dataURI === null) throw new Error('Error while loading image from ' + payload.url);

  const caAlias = payload.embellishmentData.caAlias;
  HISPayloads.set(caAlias, payload);

  // Sets the image as the value of the right CA
  await configure.setUgcImage({ ca: { alias: caAlias }, dataURI });
}

function createCustomEvent(eventName: ConfigureImplEvents, caAlias?: string): CustomEvent {
  return new CustomEvent(eventName, { detail: { caAlias } });
}

/**
 * ConfigureUI Hook.
 *
 * Only renders custom HTML if the CA is UGC
 */
function renderImageGalleryUI(ca: ConfigureAttribute): string | undefined {
  return ca.selectorType === 'ugc' ? ImageGallery(ca) : undefined;
}

/**
 * Generates the Image Gallery Custom UI
 * @param ca Configure Attribute
 * @returns the HTML to display
 */
function ImageGallery(ca: ConfigureAttribute): string {
  // When the Image is not loaded
  let imageGallerySection = /* html */ `
    <p>
      ${t('ig_rules')}
    </p>
    <p>
      <a href="#" class="${CHANGE_IMAGE_CLASS}">${t('ig_my_image_gallery')}</a>
    </p>
  `;
  let changeImageSection = '';
  let uploadedImageSection = '';

  const HISPayload: ImplImagePayload | undefined = HISPayloads.get(ca.alias);

  if (HISPayload && ca.value && ca.value.clipArt) {
    // When the Image is loaded
    imageGallerySection = '';
    changeImageSection = `<a class="${CHANGE_IMAGE_CLASS}" href="#">${t('ig_different_image')}</a>`;

    uploadedImageSection = /* html */ `
    <div class="fc-ugc-uploaded-image">
      <p class="fc-ugc-image-title">${t('ig_selected_image')}</p>
      <div class="fc-ugc-uploaded-image-container">
        <img src="${HISPayload.url}" />
      </div>
      <div class="fc-ugc-image-name">
        <p class="fc-ugc-image-name-main-name">MAIN NAME</p>
        <p class="fc-ugc-image-name-filename">${HISPayload.fileName}</p>
        <p class="fc-ugc-image-name-edit-link">
          <a href="#" class="${REMOVE_IMAGE_CLASS}">${t('ig_remove_image')}</a>
        </p>
      </div>
    </div>
    `;
  }

  return /* html */ `
    <div class="${CONTAINER_CLASS}" data-ca="${ca.alias}">
      <p>
        ${t('ig_rules')}
      </p>
      <button class="${UPLOAD_BTN_CLASS}">
        ${t('ig_upload_image')}
      </button>
      ${imageGallerySection}
      ${changeImageSection}
      ${uploadedImageSection}
    </div>
  `;
}

/**
 * Generates the Recipe custom payload for ImageGallery
 */
export function getImageGalleryCartData(): ImplRecipeCustomData {
  return { imageGallery: Object.fromEntries(HISPayloads) };
}
