import externalLinkSvg from '@/assets/icons/external-link.svg?raw';
import Loader from '@/components/loader';
import { ConfigureUI } from '@/configure/ConfigureUI';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { t } from '@/i18n';
import { addDOMEventListenerByData } from '@/utils/browser';
import { loadFontFile } from '@/utils/font';

// - - - - - - - - - - - - - - - - - - - - - - CONSTANTS - - - - - - - - - - - - - - - - - - - - - - - - -

/** URL where the font files are located */
const FONTS_LOCATION_URL = './assets/fonts/text_personalization/';

/** Suffix of the font CAs alias  */
const CA_ALIAS_SUFFIX = '_font';

/** Layer number, used to prevent conflicts with "Start Over Dialog", which uses layer 0 */
const DIALOG_LAYER = 1;

/** CSS Classes */
const CONTAINER_CLASS = 'fc-preview-font-custom-html';
const PREVIEW_FONT_BTN_CLASS = 'fc-preview-font-button';
const PREVIEW_FONT_TEXT_BTN_CLASS = 'fc-preview-font-text-button';

const MODAL_CONTAINER_CLASS = 'fc-preview-font-modal-container';

// - - - - - - - - - - - - - - - - - - - - - - - MAIN - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Implements the Font Preview Feature by adding the custom UI
 *
 * @param configure ConfigureUI Instance
 */
export function implementFontPreview(configure: ConfigureUI): void {
  // Adds the hook to render the custom UI in the accordion
  configure.registerHook('component.attributeSelector.afterHtml', renderFontPreviewUI);

  // Add Handler for the Font Preview buttons click events
  addDOMEventListenerByData(`.${PREVIEW_FONT_BTN_CLASS}`, 'click', 'ca', function (e, ca) {
    e.preventDefault();
    createDialog(configure, ca);
  });
}

/**
 * ConfigureUI Hook.
 *
 * Only renders custom HTML if the CA alias is ends with '_font'
 */
function renderFontPreviewUI(ca: ConfigureAttribute): string | undefined {
  return ca.alias.endsWith(CA_ALIAS_SUFFIX) ? FontPreview(ca) : undefined;
}

/**
 * Generates the Font Preview Custom UI
 * @param ca Configure Attribute
 * @returns the HTML to display
 */
function FontPreview(ca: ConfigureAttribute): string {
  return /* html */ `
  <div class="${CONTAINER_CLASS}" data-ca="${ca.alias}">
    <button class="${PREVIEW_FONT_BTN_CLASS}">
      <span class="${PREVIEW_FONT_TEXT_BTN_CLASS}">
        ${t('pp_preview_font')}
      </span>
      ${externalLinkSvg}
    </button>
  </div>
  `;
}

// - - - - - - - - - - - - - - - - - - - - - - - FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - -

async function createDialog(configure: ConfigureUI, configureAttributeAlias: string): Promise<void> {
  const ca = configure.getAttribute({ alias: configureAttributeAlias });
  const av = ca?.values.find((av) => av.selected);

  // If there's no value selected, do nothing
  if (!av) return;

  await Promise.all([
    // Create the dialog with a loader
    configure.createDialog({
      type: 'html',
      innerHTML: ModalContainer(),
      customClassName: 'fc-adi-preview-font',
      closeOnBlur: true,
      showClose: true,
      width: 450,
      layer: DIALOG_LAYER
    }),
    // Load the font
    loadFontFile(av.name, `${FONTS_LOCATION_URL}${av.vendorId}.ttf`)
  ]);

  // Update the modal with the text
  updateModal(av.name);
}

function updateModal(fontName: string) {
  const modalBodyEl = document.querySelector(`.${MODAL_CONTAINER_CLASS}`);

  if (!modalBodyEl) {
    console.warn('Error while creating the font preview modal');
    return;
  }
  modalBodyEl.innerHTML = ModalBody(fontName);
}

// - - - - - - - - - - - - - - - - - - - - - - - COMPONENTS - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Modal container, with the loader
 */
const ModalContainer = () => /*html*/ `
  <div class="${MODAL_CONTAINER_CLASS}">
    ${Loader.Regular}
  </div>
`;

/**
 * Modal displayed to let the user preview font selected
 */
const ModalBody = (fontName: string) => /*html*/ `
 <div>
  <div class="font" style="font-family: '${fontName}'">
  ${t('pp_preview_font_example')}
  </div>
 </div>
`;
