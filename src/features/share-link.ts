import Loader from '@/components/loader';
import { ConfigureUI } from '@/configure/ConfigureUI';
import { t } from '@/i18n';

const SHARE_LIST_MENU_CONTAINER_CLASS = 'configure-share-container';
const MODAL_CONTAINER_CLASS = 'fc-adi-share-link-container';
const COPY_BUTTON_CLASS = 'fc-adi-copy-link-button';
const TEXT_CLASS = 'fc-adi-share-link-text';

// - - - - - - - - - - - - - - - - - - - - - - - MAIN - - - - - - - - - - - - - - - - - - - - - - - - -

export function appendGetLinkToShareMenu(configure: ConfigureUI): void {
  const shareListMenuEl = document.querySelector(`.${SHARE_LIST_MENU_CONTAINER_CLASS}`);
  if (!shareListMenuEl) {
    console.error('Error while creating the get link element');
    return;
  }
  shareListMenuEl.innerHTML += GetLinkMenuItem();

  document.querySelector('.fc-adi-configure-share-item')?.addEventListener('click', onShareClick);

  async function onShareClick() {
    const ac = new AbortController();

    const dialog = await showDialog(configure, ac);
    try {
      const url = await configure.saveAndGetShareURL();
      updateModal(url, ac.signal);
    } catch (err) {
      // If there's an error while saving the recipe, log and remove the modal
      console.error('Error while saving the recipe: ', err);
      dialog.trigger('dialog:closeRequest');
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - -

function showDialog(configure: ConfigureUI, abortController: AbortController) {
  return configure.createDialog({
    type: 'html',
    title: t('share'),
    innerHTML: ModalContainer(),
    customClassName: 'fc-adi-share-link-dialog',
    showClose: true,
    width: 450,
    layer: 1,
    abortController
  });
}

function updateModal(link: string, signal: AbortSignal) {
  const modalBodyEl = document.querySelector(`.${MODAL_CONTAINER_CLASS}`) as HTMLElement;

  if (!modalBodyEl) {
    console.warn('Error while creating the copy modal');
    return;
  }
  modalBodyEl.innerHTML = ModalBody(link);

  const copyBtnEl = modalBodyEl.querySelector('.' + COPY_BUTTON_CLASS) as HTMLElement;
  if (!copyBtnEl) {
    console.warn('Error while creating the copy modal');
    return;
  }
  copyBtnEl.addEventListener(
    'click',
    function () {
      // Copy to clipboard
      navigator.clipboard.writeText(link);

      // Change the label for 2 seconds to show the url was copied
      copyBtnEl.textContent = t('copied');
      setTimeout(() => (copyBtnEl.textContent = t('copy')), 2000);
    },
    { signal }
  );

  // On click on the url, select all the text
  const textEl = modalBodyEl.querySelector('.' + TEXT_CLASS) as HTMLInputElement;
  textEl?.addEventListener('click', () => textEl.select(), { signal });
}

// - - - - - - - - - - - - - - - - - - - - - - - COMPONENTS - - - - - - - - - - - - - - - - - - - - - - - - -

const GetLinkMenuItem = () => /*html*/ `
  <div class="fc-adi-configure-share-item">
    <span class="fc-adi-icon fc-adi-icon-link"></span>
    <span>${t('ly_share_design_link')}</span>
  </div>
`;

const ModalBody = (link: string) => /*html*/ `
  <span>${t('share_copy_link')}</span>
  <div class="fc-adi-share-link">
    <input class="${TEXT_CLASS}" type="text" value="${link}" readonly>
    <button class="${COPY_BUTTON_CLASS}">${t('copy')}</button>
  <div>
`;

const ModalContainer = () => /*html*/ `
  <div class="${MODAL_CONTAINER_CLASS}">
    ${Loader.Regular}
  </div>
`;
