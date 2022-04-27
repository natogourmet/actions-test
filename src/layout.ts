import { t } from './i18n';
import { getElement } from './utils/browser';

/**
 * Receives el container element or selector and renders the required HTML for ConfigureUI
 * @param el HTMLElement or string selector
 */
export function createMainLayout(el: string | HTMLElement): void {
  getElement(el).innerHTML = MainLayout();
}

/**
 * Since i18n is not available when creating the layout, we need to modify localizable texts after configure is loaded
 */
export function localizeLayout(): void {
  const moreActionsLabelWrapper = document.querySelector('#fc-ly-more-actions-label-wrapper');
  if (moreActionsLabelWrapper) moreActionsLabelWrapper.innerHTML = t('ly_more_actions');

  const rotateZoomLabelWrapper = document.querySelector('#fc-ly-rotate-zoom-label-wrapper');
  if (rotateZoomLabelWrapper) rotateZoomLabelWrapper.innerHTML = t('ly_rotate_zoom');

  const shareDesignTitleWrapper = document.querySelector('#fc-ly-share-design-title');
  if (shareDesignTitleWrapper) shareDesignTitleWrapper.innerHTML = t('ly_share_design');
}

function MainLayout() {
  return /* html */ `
    <div class="configure-container" id="configure-container">
      <div class="configure-container-wrap">
        <div class="configure-container-left configure-display-container">
          <!-- LEFT -->
          <div class="configure-product-display-wrapper">
            <div class="configure-product-display"></div>
            <div class="configure-thumbnails-display-container">
              <div class="configure-thumbnails-display"></div>
            </div>
            <div class="configure-full-screen-btn"></div>
            <div class="configure-ar-btn"></div>
            <div class="webgl-loader-wrapper">
              <div class="webgl-loader-content" data-pct="0">
                <svg
                  class="webgl-loader-svg"
                  width="40"
                  height="40"
                  viewPort="0 0 20 20"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg">
                  <circle
                    class="webgl-loader-filler"
                    r="17.5"
                    cx="20"
                    cy="20"
                    fill="transparent"
                    stroke-dashoffset="0"></circle>
                  <circle
                    class="webgl-loader-bar"
                    r="17.5"
                    cx="20"
                    cy="20"
                    fill="transparent"
                    stroke-dasharray="109.955"
                    stroke-dashoffset="0"></circle>
                </svg>
              </div>
            </div>

            <div class="configure-dropdown-wrap">
              <div class="configure-rotate-n-zoom-container">
                <div class="configure-rotate-n-zoom" id='fc-ly-rotate-zoom-label-wrapper'>
                </div>
              </div>
              <ul
                class="configure-dropdown-menu"
                role="menubar"
                aria-controls="more-actions"
                data-fc-dropdown-container>
                <li class="configure-dropdown-menuitem" role="menuitem">
                  <button
                    aria-haspopup="true"
                    aria-expanded="false"
                    tabindex="0"
                    data-fc-dropdown-trigger
                    data-level="0">
                    <span id='fc-ly-more-actions-label-wrapper'>
                    </span>
                  </button>
                  <ul class="configure-dropdown-submenu" role="menu" aria-hidden="true" data-level="0">
                    <li
                      class="configure-dropdown-menuitem configure-snapshots"
                      role="menuitem"
                      aria-controls="more-actions"></li>
                    <li
                      class="configure-dropdown-menuitem configure-reset-recipe-container"
                      role="menuitem"
                      aria-controls="more-actions"></li>
                    <li
                      class="configure-dropdown-menuitem configure-randomize-recipe-button"
                      role="menuitem"
                      aria-controls="more-actions"></li>
                    <li
                      class="configure-dropdown-menuitem"
                      role="menuitem" a
                      ria-controls="more-actions">
                      <button
                        class="configure-share-button-container"
                        aria-expanded="false"
                        data-level="1"
                        tabindex="0"
                        data-fc-dropdown-trigger></button>
                      <ul class="configure-dropdown-submenu" role="menu" aria-hidden="true" data-level="1">
                        <li role="menuitem" aria-controls="more-actions">
                          <div class="configure-share-title" id="fc-ly-share-design-title">
                          </div>
                          <div class="configure-share-container">
                          </div>
                        </li>
                      </ul>
                    </li>
                    <li
                      class="configure-dropdown-menuitem configure-print-button"
                      role="menuitem"
                      aria-controls="more-actions"></li>
                  </ul>
                </li>
              </ul>
              <button class="toggle-thumbs">
                <i class="icon icon-eye"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="configure-container-right">
          <!-- RIGHT -->
          <div class="info-container">
            <div class="configure-product-info"></div>
            <div class="configure-product-message"></div>
          </div>
          <div class="configure-attributes-wrapper">
            <div class="configure-nav-sm"></div>
            <div class="configure-nav-md"></div>
            <div class="configure-nav-lg"></div>
            <!-- <div class="configure-size-quantity-container">
              <div class="configure-size-container"></div>
            </div> -->
          </div>
          <div class="configure-add-to-cart-container">
            <!-- <div class="configure-quantity-container"></div> -->
            <div class="configure-add-to-cart-button"></div>
          </div>
        </div>
      </div>
      <div class="fc-loading"></div>
    </div>
  `;
}
