import { ConfigureUI } from '@/configure/ConfigureUI';
import { localizeLayout } from '@/layout';
import { toggleBodyBackdrop } from './loader';

/**
 * Adds an event listener to perform certain global actions after ConfigureUI loads
 */
export function addPostLoadingActions(configure: ConfigureUI): void {
  configure.on('analytics:configureLoaded', function () {
    // Hide tootltips on resize
    window.addEventListener('resize', () => configure.hideTooltips(), true);

    localizeLayout();
    toggleBodyBackdrop(true);

    // Adjust the elements size and position
    window.dispatchEvent(new Event('resize'));
  });
}

export function modifyGeneralComponents(configure: ConfigureUI): void {
  configure.setComponentOptions({
    // set placehodler for text inputs inside attributeSelectors
    attributeSelector: {
      uiSettings: {
        placeholder: 'Enter Your Text'
      }
    }
  });
}
