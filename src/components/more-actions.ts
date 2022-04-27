import { ConfigureUI } from '@/configure/ConfigureUI';
import { FCDropdown } from '@/configure/FCDropdown';
import { t } from '@/i18n';
import { createPrintButton } from './print';

const PARENT_CONTAINER = '.configure-container';

export async function createMoreActionsMenu(configure: ConfigureUI): Promise<void> {
  // Show the menu when ConfigureUI finishes loading
  configure.on('analytics:configureLoaded', showMoreActionsButton);

  const fcDropdown = FCDropdown().init('[data-fc-dropdown-container]');
  await Promise.all([
    createShareButton(configure),
    createStartOverButton(configure, fcDropdown),
    createRandomizeButton(configure),
    createPrintButton(configure, 'Print'),
    createSnapshots(configure, fcDropdown)
  ]);
}

function createStartOverButton(configure: ConfigureUI, fcDropdown: FCDropdown) {
  return configure.createComponent({
    type: 'button',
    container: '.configure-reset-recipe-container',
    title: 'Start Over',
    tabIndex: 0,
    async onClick() {
      const confirmDialog = await configure.createDialog({
        type: 'confirmDialog',
        title: t('start_over'),
        text: t('start_over_desc'),
        showClose: true,
        uiSettings: {
          i18n: {
            okButtonLabel: t('start_over_confirm'),
            cancelButtonLabel: t('cancel')
          }
        }
      });
      // close More Actions Panel if Reset dialog is opened
      confirmDialog.on('dialog:opened', () => fcDropdown?.closeActive(0));

      confirmDialog.on('dialog:ok', function () {
        configure.resetRecipe().catch((e) => {
          throw e;
        });
      });
    }
  });
}

function createRandomizeButton(configure: ConfigureUI) {
  return configure.createComponent({
    type: 'randomizeRecipeButton',
    container: '.configure-randomize-recipe-button'
  });
}

async function createShareButton(configure: ConfigureUI) {
  //   /*html*/ `
  //   <ul class="configure-dropdown-submenu" role="menu" aria-hidden="true" data-level="1">
  //       <li role="menuitem" aria-controls="more-actions">
  //         <div class="configure-share-title" id="fc-ly-share-design-title">
  //         </div>
  //         <div class="configure-share-container">
  //         </div>
  //       </li>
  //     </ul>
  //   `;
  await configure.createComponents({
    container: PARENT_CONTAINER,
    components: [
      {
        type: 'button',
        container: '.configure-share-button-container',
        title: 'Share',
        tabIndex: 0,
        uiSettings: {
          buttonTooltip: {
            content: 'Share',
            position: 'top'
          }
        }
      }
      // {
      //   type: 'sharingListDialog',
      //   types: ['email', 'pinterest', 'twitter', 'facebook'],
      //   skippedDialogs: ['facebook', 'twitter', 'pinterest'],
      //   container: '.configure-share-container'
      // }
    ]
  });

  // add recipe image to email share dialog
  // configure.setComponentOptions({
  //   shareDialog: {
  //     showElements: ['recipeImage', 'nameFrom', 'nameTo', 'emailTo', 'message', 'postButton', 'cancelButton'],
  //     externalLabel: true
  //   }
  // });
}

async function createSnapshots(configure: ConfigureUI, fcDropdown: FCDropdown): Promise<void> {
  const snapshots = await configure.createComponent({
    type: 'snapshots',
    container: '.configure-snapshots',
    uiSettings: {
      snapshots: {
        i18n: {
          takeButtonLabel: t('ma_view_snapshots'),
          viewButtonLabel: t('ma_view_snapshots'),
          hideButtonLabel: t('ma_view_snapshots'),
          headerText: t('ma_capture_design'),
          headerInstructionsText: t('ma_capture_design'),
          callToActionContent: `<a href="#" onclick="ConfigureIdUtilities.handleSaveSnapshot(event)">
            ${t('ma_take_a_snapshot')}`
        }
      }
    }
  });

  if (fcDropdown) {
    // close dropdown on the same level if snapshots was opened
    snapshots.on('snapshots:open', function (err) {
      if (err) throw err;

      console.log('SNAPSHOTS OPEN');
      fcDropdown.closeActive(1);
    });

    // close snapshots if parent dropdown was closed
    fcDropdown.element.addEventListener('fcdropdown:activeClosed', function (event: CustomEvent<{ level: number }>) {
      if (event.detail.level === 0) snapshots.trigger('snapshots:close');
    } as EventListener);

    // close snapshots if dropdown on the same lvl was opened
    fcDropdown.element.addEventListener('fcdropdown:opened', function (event: Event & { detail: { level: number } }) {
      if (event.detail.level === 1) snapshots.trigger('snapshots:close');
    } as EventListener);
  }
}

/**
 * Shows the "More Actions" button below the product display (snapshots, sharing, start over, etc)
 */
function showMoreActionsButton() {
  const moreActionsElement: HTMLElement = document.querySelector('.configure-dropdown-menu') as HTMLElement;
  if (moreActionsElement) moreActionsElement.style.display = 'block';
}
