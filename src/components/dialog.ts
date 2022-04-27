import { ConfigureUI } from '@/configure/ConfigureUI';
import { t } from '@/i18n';
import { Callback } from '@/configure/utils/types';

/**
 * Setups ConfigureUI's dialogs settings
 *
 *
 */
export function setupDialogs(configure: ConfigureUI): void {
  configure.on('dialog:opened', () => hideBodyChildren(true));
  configure.on('dialog:closed', () => hideBodyChildren(false));

  configure.setComponentOptions({
    // set dialog backdrop background globally
    dialog: {
      backgroundColor: 'rgba(16, 16, 16, 0.7)'
    }
  });
}

/**
 * Show Dialog with error message
 *
 * @param {string} title Dialog title
 * @param {string} innerHtml Dialog contents
 * @param {Function} [onDialogCloseCallback] Execute when dialog is closed
 */
export async function showErrorDialog(
  configure: ConfigureUI,
  title: string,
  innerHTML: string,
  onDialogCloseCallback?: () => void | Callback<number>
): Promise<void> {
  // Create UUID to attach event listener
  const uuid = `fc-dialog-error-button-${Date.now()}`;

  // add close button to dialog content
  innerHTML += /*html */ `
    <div class="fc-dialog-error-footer"><button id="${uuid}" class="fc-button-black">${t('got_it')}</button></div>
  `;

  // create dialog
  const dialog = await configure.createDialog({
    type: 'html',
    title,
    innerHTML,
    width: 526,
    customClassName: 'fc-error-dialog'
  });

  // Find the recently create dialog button in the document
  const button = document.querySelector(`#${uuid}`);
  if (!button) {
    throw new Error('Error creating Error Dialog: Close button not found');
  }

  // Create event listener
  const closeBtnClickListener = function () {
    button.removeEventListener('click', closeBtnClickListener);
    dialog.trigger('dialog:closeRequest', 0);
  };

  // Add the event listener
  button.addEventListener('click', closeBtnClickListener);

  // execute callback (if provided) on dialog close
  if (onDialogCloseCallback) {
    // dialog.off('dialog:closed', onDialogCloseCallback);
    dialog.on('dialog:closed', onDialogCloseCallback);
  }
}

function hideBodyChildren(hide: boolean): void {
  const children: HTMLElement[] = [].slice.call(
    document.querySelectorAll('body > :not(.fc-dialog-wrapper-container):not(script):not(style)')
  );

  children.forEach(function (el) {
    el.setAttribute('aria-hidden', '' + hide);
  });
}
