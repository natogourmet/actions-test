import { ConfigureUI } from '@/configure/ConfigureUI';
import { sleep } from '@/configure/utils/general';

export async function createPager(configure: ConfigureUI, container: string, mediaQuery?: string): Promise<void> {
  configure.on('analytics:configureLoaded', attachPagerUIEvent);

  const pager = await configure.createComponent({
    type: 'pager',
    mediaQuery,
    showGroupName: false,
    skipHeaders: true,
    skipHeadersPageParenthesis: true,
    container,
    uiSettings: {
      attributeValueTooltip: false
    }
  });

  let overflow = document.body.style.overflow;

  // Fix background scroll bug when open side panel.
  pager.on('pager:openList', () => {
    overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const groupers = document.querySelectorAll('.fc-pager-grouper');
    if (!groupers) return;

    groupers.forEach((group) =>
      group.addEventListener('click', (e: Event) => {
        // Stop event propagation when user click on Group
        e.stopPropagation();
      })
    );
  });

  // Reset scroll strategy after dialog is closed.
  pager.on('dialog:closed', () => {
    document.body.style.overflow = overflow;
  });

  pager.on('attributeList:setIndex', async function () {
    // Update the value on html element.
    const pageNumber = document.querySelector(`${container} .fc-pager-adi-page`);
    if (pageNumber) {
      // Waits for the step label to update before parsing it
      await sleep(0);
      const [attributeListIndex, totalAttributes] = getStepAndTotalFromDOM();
      pageNumber.innerHTML = getPageNumberTemplate(attributeListIndex, totalAttributes);
    }
  });

  pager.on('component:created', async () => {
    // Waits for pager DOM to render and for step label to update
    await sleep(0);
    const [attributeListIndex, totalAttributes] = getStepAndTotalFromDOM();
    createIndex(container, attributeListIndex, totalAttributes);
  });
}

/**
 * Finds the pager native "step/total" label, parse it and returns its data
 */
function getStepAndTotalFromDOM() {
  // Parse the pager native label
  const text = document.querySelector('.fc-pager .fc-pager-header .fc-pager-page-number')?.textContent;
  if (!text) return [0, 0];
  return text.split('/').map(Number);
}

/**
 *
 * Legacy index from ConfigureID is placed under the hamburger icon.
 * This method put the pager string (page/total) between the pager arrows.
 *
 * <-- 2/5 -->
 *
 * We hides the original page number applying color:transparent to .fc-pager-page-number by CSS
 *
 * @param container Pager container
 * @param initialIndex The selected index on pager.
 * @param total Number of pages
 * @returns
 */
function createIndex(container: string, initialIndex: number, total: number) {
  const pagerButtons = document.querySelector(`${container} .fc-pager-buttons`);
  if (!pagerButtons) return;

  const nextButton = document.querySelector(`${container} .fc-pager-next-wrapper`);
  if (!nextButton) return;

  const pageNumber = document.createElement('div');
  pageNumber.setAttribute('class', 'fc-pager-adi-page');
  pageNumber.innerHTML = getPageNumberTemplate(initialIndex, total);
  pagerButtons.insertBefore(pageNumber, nextButton);
}

/**
 * Build and return the page html element: index/total
 *
 * @param index Current index
 * @param total Number of pages
 * @returns
 */
function getPageNumberTemplate(index: number, total: number) {
  return `<div class=fc-pager-page>${index}</div><div class=fc-pager-adi-page-divisor>/</div><div class=fc-pager-adi-page-pages>${total}</div>`;
}

// TODO: Analyze this event handler
function attachPagerUIEvent() {
  // If an user clicks on Attribute Name a popup with all the attributes will open
  const pagerName = document.querySelector('.fc-pager-page-name');
  pagerName?.addEventListener('click', function () {
    const button: HTMLElement | null = document.querySelector('.fc-pager-pulldown > .fc-button-pair');
    button?.click();
  });
}
