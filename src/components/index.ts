import { ConfigureUI } from '@/configure/ConfigureUI';
import { ConfigureImpl } from '@/ConfigureImpl';
import { createAddToCartButton } from './add-to-cart';
import { setupDialogs } from './dialog';
import { addPostLoadingActions, modifyGeneralComponents } from './general';
import { createMenu } from './menu';
import { createMoreActionsMenu } from './more-actions';
import { createDisplay, createThumbnails } from './product-display';

export async function initComponents(wrapper: ConfigureImpl, configure: ConfigureUI): Promise<void> {
  // Create the different components, add event listeners, adjust DOM, etc
  const promise = Promise.all([
    createDisplay(configure),
    createThumbnails(configure),
    createMenu(configure),
    createAddToCartButton(configure, wrapper),
    createMoreActionsMenu(configure),
    createProductTitle(configure)
  ]);

  // configure.registerMediaQueries([CUSTOM_MEDIA['--lower-than-md'], CUSTOM_MEDIA['--greater-than-md']]);
  // configure.on('mediaQuery:change', (mediaQuery) => console.log('Active media query Change', mediaQuery));

  addPostLoadingActions(configure);

  // Modify existing components
  setupDialogs(configure);
  modifyGeneralComponents(configure);

  // Waits for all components to be created
  await promise;
}

export async function createProductTitle(configure: ConfigureUI): Promise<void> {
  await configure.createComponent({
    container: '.configure-product-info',
    type: 'productInfo',
    showElements: ['name']
  });
}
