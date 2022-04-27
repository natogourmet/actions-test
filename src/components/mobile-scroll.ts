import { mq } from '@/utils/MediaQuery';

export function initScroll(): void {
  window.addEventListener('resize', handleFixedTopRegion, true);
  window.addEventListener('load', handleFixedTopRegion, true);
}

let scrollListenerIsAdded = false;
function handleFixedTopRegion(event: Event) {
  event.stopPropagation();

  if (mq.isMobile && !scrollListenerIsAdded) {
    window.addEventListener('scroll', scrollEventListener, true);
    scrollListenerIsAdded = true;
  }

  if (!mq.isMobile && scrollListenerIsAdded) {
    window.removeEventListener('scroll', scrollEventListener, true);
    scrollListenerIsAdded = false;
  }
}

function scrollEventListener() {
  const fixedTopElement: HTMLElement | null = document.querySelector('.configure-product-display-wrapper');
  if (!fixedTopElement) return;

  const mainParent = document.querySelector('.configure-display-container');
  if (!mainParent) return;

  const resetScrollPointTop = mainParent.getBoundingClientRect().top;
  const resetScrollPointBottom = document.querySelector('.configure-container')?.getBoundingClientRect().bottom ?? 0;
  const windowHeight = window.screen.availHeight;

  const mainContainer: HTMLElement | null = document.querySelector('.configure-container');
  const mainParentHeight = mainContainer?.offsetHeight ?? 0;

  const FIXED_ELEMENT_TRESHOLD = 560;
  if (resetScrollPointTop < 0 && windowHeight > FIXED_ELEMENT_TRESHOLD) {
    fixedTopElement.style.position = 'fixed';

    if (resetScrollPointBottom < windowHeight) {
      fixedTopElement.style.position = 'absolute';
      fixedTopElement.style.top = `${mainParentHeight - windowHeight}px`;
    } else {
      fixedTopElement.style.top = '0';
    }
  } else {
    fixedTopElement.style.top = '0';
    fixedTopElement.style.position = 'absolute';
  }
}
