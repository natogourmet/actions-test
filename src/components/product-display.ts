import { ConfigureUI } from '@/configure/ConfigureUI';
import { getElementCSSValuesAsNumber } from '@/utils/browser';
import { mq } from '@/utils/MediaQuery';
import { createWebGLDisplay } from './webgl';

const DISPLAY_CONTAINER = '.configure-product-display';

const showThumbnails = false; // getQueryParams().getBoolean('showThumbnails') ?? false;

export async function createDisplay(configure: ConfigureUI): Promise<void> {
  let finished: Promise<unknown>;
  if (configure.isWebGl()) {
    finished = createWebGLDisplay(configure, DISPLAY_CONTAINER);
  } else {
    finished = configure.createComponent({
      type: 'productDisplay',
      container: DISPLAY_CONTAINER,
      showDots: false,
      arrows: true,
      clickToConfigure: true,
      format: 'jpg',
      quality: 90,
      enableTooltips: true,
      selectedView: configure.getProduct()?.defaultViewName
    });
  }

  configure.on('analytics:configureLoaded', () => {
    window.addEventListener('resize', () => {
      showHideThumbnails(configure);
      showHideRotateLabel(configure);
    });
    adjustDisplayForDesktop();
  });

  configure.on('ca:focus', adjustDisplayForDesktop);

  window.addEventListener(
    'resize',
    function () {
      adjustDisplayForDesktop();
      resizeThumbnailsSlider();
    },
    true
  );

  await finished;
}

export async function createThumbnails(configure: ConfigureUI): Promise<void> {
  configure.on('analytics:configureLoaded', function () {
    addBodyThumbnailsClasses();
    attachThumbToggleUIEvent();
  });

  await configure.createComponent({
    container: '.configure-thumbnails-display',
    type: 'thumbnailsDisplay',
    format: 'jpg',
    quality: 70,
    slidesToShow: 3
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any); // Temp fix for typing
}

/**
 * Adjust the size of the display canvas according to the viewport
 */
function adjustDisplayForDesktop(): void {
  if (mq.isMobile) return;

  const windowHeight = window.innerHeight;
  const productDisplayWrapper: HTMLElement | null = document.querySelector('.configure-product-display-wrapper');

  if (!productDisplayWrapper) return;

  const [paddingBottom, paddingTop] = getElementCSSValuesAsNumber(productDisplayWrapper, [
    'paddingBottom',
    'paddingTop'
  ]);
  let maxHeight = windowHeight - paddingBottom - paddingTop;

  const thumbs: HTMLElement | null = document.querySelector('.configure-thumbnails-display-container');
  if (thumbs) {
    if (showThumbnails) {
      maxHeight = maxHeight - thumbs.offsetHeight;
    } else {
      thumbs.style.display = 'none';
    }
  }

  const productDisplay: HTMLElement | null = document.querySelector(DISPLAY_CONTAINER);
  if (productDisplay) productDisplay.style.height = `${maxHeight}px`;
}

function showHideThumbnails(configure: ConfigureUI) {
  const thumbnails: HTMLElement | null = document.querySelector('.toggle-thumbs');
  const thumbnailsCount: HTMLElement | null = document.querySelector('.fc-display-images');
  if (!thumbnails) return;

  if ((mq.isMobile && configure.isWebGl()) || (thumbnailsCount && thumbnailsCount.childNodes.length <= 1)) {
    thumbnails.style.display = 'none';
  }
}

function resizeThumbnailsSlider() {
  const activeSlide: HTMLElement | null = document.querySelector('.carousel-active');
  const inactiveSlide: HTMLElement | null = document.querySelector('.carousel-key-alt:not(carousel-active)');

  inactiveSlide?.click();
  activeSlide?.click();
}

function addBodyThumbnailsClasses() {
  const map: Record<string, string> = {
    'has-thumbs': '.configure-thumbnails-display > .fc-display',
    'is-slider': '.configure-product-display .carousel-track'
  };

  for (const entry in map) {
    const element = document.querySelector(map[entry]);
    if (element) document.body.classList.add(entry);
  }
}

function attachThumbToggleUIEvent() {
  const thumbToggle = document.querySelector('.toggle-thumbs');
  thumbToggle?.addEventListener('click', function () {
    document.body.classList.toggle('show-thumbs');
  });
}

/**
 * Determines whether to show or hide the "Rotate and zoom" label below de product display
 * @param configure configure UI instance
 */
function showHideRotateLabel(configure: ConfigureUI): void {
  if (!configure.isWebGl()) return;

  const rotateElement: HTMLElement | null = document.querySelector('.configure-rotate-n-zoom-container');
  if (!rotateElement) return;

  rotateElement.style.display = mq.isMobile ? 'none' : 'flex';
}
