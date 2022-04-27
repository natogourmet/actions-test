import { ConfigureUI } from '@/configure/ConfigureUI';
import { addProductMessage, addAttributeAndValueMessages } from './messaging';
import { addCustomAccordionAttributeHeaders, addCustomAccordionAttributeSelectors } from './custom-attribute-title';
import { addGroupOnSidePanel } from './custom-side-panel';
import { applyLeagueRules } from './league-rules';
import { implementImageGallery } from './image-gallery';
import { ConfigureImpl } from '@/ConfigureImpl';
import {
  implementAttributeSets,
  implementLocationConflicts,
  implementToggle,
  implementFontPreview
} from './personalization';
import { appendGetLinkToShareMenu } from './share-link';

/**
 * Initializes the custom features.
 * It performs custom logic, registers event listeners, add elements to the DOM, etc
 * @param configure instance of ConfigureUI
 */
export function initCustomFeatures(wrapper: ConfigureImpl, configure: ConfigureUI): void {
  // Custom Messaging
  addProductMessage(configure);
  addAttributeAndValueMessages(configure);

  // Attribute Headers
  addCustomAccordionAttributeHeaders(configure);
  addCustomAccordionAttributeSelectors(configure);

  // Side Panel
  addGroupOnSidePanel(configure);
  // League Rules (compliance)
  applyLeagueRules(configure);

  // Image Gallery (UGC with external images)
  implementImageGallery(wrapper, configure);

  // Product Personalization
  implementAttributeSets(configure);
  implementToggle(configure);
  implementFontPreview(configure);
  implementLocationConflicts(configure);

  // custom "Get link" button to be able to share (more actions menu)
  appendGetLinkToShareMenu(configure);
}
