/**
 * Creates a nested accordion component that displays attribute selectors in expandable/collapsible panels and grouped by attribute group data:
 *
 * > Group 1
 * > Group 2
 * > Group 3
 *  > Attribute 1
 *  > Attribute 2
 *    > details
 *  > Attribute 3
 * > Group 4
 *
 * This component creates the next component into the dom.
 *
 * <div class="fc-nested-accordion-container">
 *   <div class="fc-nested-accordion-header"></div>
 *   <div class="fc-nested-accordion-body"></div>
 *   <div class="fc-nested-accordion-footer"></div>
 * </div>
 *
 * After creating the previous element, creates a configure ui accordion into fc-nested-accordion-body end the groups buttons in fc-nested-accordion-header.
 *
 * <div class="fc-nested-accordion-container">
 *   <div class="fc-nested-accordion-header"></div>
 *     <div class="fc-grouper">Group 1</div>
 *     <div class="fc-grouper">Group 2</div>
 *     <div class="fc-grouper">Group 3</div>
 *     <div class="fc-grouper">Group ...</div>
 *     <div class="fc-grouper">Group N</div>
 *   <div class="fc-nested-accordion-body">
 *     <fc-accordion/> // Configure UI accordion
 *   </div>
 *   <div class="fc-nested-accordion-footer"></div>
 * </div>
 *
 * Every time user clicks on a grouper, all the attributes (fc-accordion-panel) into fc-accordion than belongs to that grouper are displayed.
 * The rest of the attributes are hidden.
 *
 * If the clicked grouper are into fc-nested-accordion-header, all the grouper placed below of that are moved to fc-nested-accordion-footer.
 *
 *  For example, if user clicks on Group 2, Group 3 to Group N are moved to fc-nested-accordion-footer:
 *
 *  <div class="fc-nested-accordion-container">
 *    <div class="fc-nested-accordion-header"></div>
 *      <div class="fc-grouper">Group 1</div>
 *      <div class="fc-grouper">Group 2</div>
 *    <div class="fc-nested-accordion-body">
 *      <fc-accordion/> // Configure UI accordion
 *    </div>
 *    <div class="fc-nested-accordion-footer">
 *      <div class="fc-grouper">Group 3</div>
 *      <div class="fc-grouper">Group 4</div>
 *      <div class="fc-grouper">Group ...</div>
 *      <div class="fc-grouper">Group N</div>
 *    </div>
 *  </div>
 *
 *  After doing that, fc-nested-accordion-body is expanded.
 *
 * If the clicked grouper are into fc-nested-accordion-footer, the clicked grouped and all the groupers above it are moved to fc-nested-accordion-header.
 *
 * From the previous example, if user click on Group 4, which is placed on footer, Group 3 and Group 4 are moved from footer to header:
 *
 *  <div class="fc-nested-accordion-container">
 *    <div class="fc-nested-accordion-header"></div>
 *      <div class="fc-grouper">Group 1</div>
 *      <div class="fc-grouper">Group 2</div>
 *      <div class="fc-grouper">Group 3</div>
 *      <div class="fc-grouper">Group 4</div>
 *    <div class="fc-nested-accordion-body">
 *      <fc-accordion/> // Configure UI accordion
 *    </div>
 *    <div class="fc-nested-accordion-footer">
 *      <div class="fc-grouper">Group ...</div>
 *      <div class="fc-grouper">Group N</div>
 *    </div>
 *  </div>
 *
 */

import { ConfigureUI } from '@/configure/ConfigureUI';
import { EventBusWrapper } from '@/configure/event/EventBusWrapper';
import { AttributeGroup } from '@/configure/model/AttributeGroup';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { AccordionEventBus, AccordionOptions, Embeddable, Responsive } from '@/configure/ui/configureui-components';
import { sum } from '@/configure/utils/array';
import { sleep } from '@/configure/utils/general';
import { hide, show, slideDown, slideUp } from '@/configure/utils/transitions';

const FC_NESTED_PREFIX = 'fc-nested-accordion';
const FC_NESTED_CONTAINER = FC_NESTED_PREFIX + '-container';
const FC_NESTED_HEADER = FC_NESTED_PREFIX + '-header';
const FC_NESTED_FOOTER = FC_NESTED_PREFIX + '-footer';
const FC_NESTED_BODY = FC_NESTED_PREFIX + '-body';
const FC_GROUPER = 'fc-grouper';
const FC_ACCORDION_PANEL = 'fc-accordion-panel';

/**
 * Creates a nested accordion component that displays attribute selectors in expandable/collapsible panels and grouped by attribute group data.
 *
 * @param configure instance of ConfigureUI
 * @param opts Component creation parameters (including container and MediaQuery filter)
 */
export async function createNestedAccordion(
  configure: ConfigureUI,
  opts: AccordionOptions & Embeddable & Responsive
): Promise<AccordionEventBus> {
  const attributeGroups = configure.getProduct()?.attributeGroups;

  if (!attributeGroups || attributeGroups.length === 0) {
    console.warn('This product does not use attribute groups. Attribute group is necessary to build nested accordion.');
    return configure.createComponent({
      ...opts,
      type: 'accordion',
      nested: false
    });
  }

  // TODO:  Maybe, it could be done using 'created' or 'destroyed' of Configure Id.
  if (opts.mediaQuery) {
    const em: EventBusWrapper = new EventBusWrapper();

    const mediaQuery = window.matchMedia(opts.mediaQuery);

    mediaQuery.addEventListener('change', async (e) => {
      if (e.matches) {
        // TODO Improve typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        em.delegate = (await setup(configure, opts)) as any;
      } else {
        remove(opts.container);
        em.delegate = null;
      }
    });

    if (mediaQuery.matches) {
      // TODO Improve typing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      em.delegate = (await setup(configure, opts)) as any;
    }

    // TODO Improve typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve(em) as any;
  } else {
    return setup(configure, opts);
  }
}

/**
 *
 * Remove nested accordion from dom.
 *
 * @param container
 */
function remove(container: string | HTMLElement) {
  const accordionContainer: HTMLElement =
    container instanceof HTMLElement ? container : (document.querySelector(container) as HTMLElement);
  accordionContainer.innerHTML = '';
}

/**
 * Setup nested accordion component.
 *
 * @param configure instance of ConfigureUI
 * @param opts Component creation parameters (including container and MediaQuery filter)
 */
async function setup(
  configure: ConfigureUI,
  opts: AccordionOptions & Embeddable & Responsive
): Promise<AccordionEventBus> {
  createWrapper(opts.container);

  // Creates the regular accordion (nested = false) using the specified parameters but in the wrapper container just created
  const eventBus = await configure.createComponent({
    ...opts,
    type: 'accordion',
    nested: false,
    container: `.${FC_NESTED_BODY}`
  });
  const ignore = opts.uiSettings?.groups?.ignore ?? [];

  const accordion: HTMLElement = await getAccordion();
  const items: HTMLElement[] = Array.from(accordion.children) as HTMLElement[];
  const attributeGroups = configure.getProduct()?.attributeGroups.filter((item) => {
    return !ignore.includes(item.name);
  });

  const allAttributes = configure.getProduct()?.allAttributes;

  if (!attributeGroups || !allAttributes) return eventBus;

  const groupedAttributes = configure.getAttributesByGroup();

  if (!groupedAttributes) return eventBus;

  await setGroupDataOnItems(groupedAttributes, accordion);

  items.forEach(hide);

  await createGroups(attributeGroups);

  configure.on('ca:object-focus', onCAObjectFocus);
  return eventBus;

  /**
   * Expand the attributes clicked on WebGL product
   *
   * @param caId Clicked Attribute id
   */
  async function onCAObjectFocus(data: { caId: number }) {
    const accordion: HTMLElement = await getAccordion();
    // Get the groupId from fc-accordion-panel
    const swatch = accordion.querySelector(`.fc-attribute-selector-swatch[data-id="${data.caId}"]`);
    const panel = swatch?.closest(`.${FC_ACCORDION_PANEL}`);
    if (!panel) return;
    const groupId = panel.getAttribute('data-group');

    //Get the grouper corresponding to that groupId
    const accordionContainer: HTMLElement = document.querySelector(`.${FC_NESTED_CONTAINER}`) as HTMLElement;
    const grouper = accordionContainer.querySelector(`.${FC_GROUPER}[data-group="${groupId}"]`) as HTMLElement;

    // Display the group
    if (!grouper.classList.contains('active')) {
      grouper.dispatchEvent(new Event('click'));
    }
  }

  /**
   * Created the dom wrapper into container
   *
   * @param container Dom component where nested accordion is created
   */
  function createWrapper(container: string | HTMLElement) {
    const accordionContainer: HTMLElement =
      container instanceof HTMLElement ? container : (document.querySelector(container) as HTMLElement);
    accordionContainer.innerHTML = `
   <div class="${FC_NESTED_CONTAINER}">
     <div class="${FC_NESTED_HEADER}"></div>
     <div class="${FC_NESTED_BODY}"></div>
     <div class="${FC_NESTED_FOOTER}"></div>
   </div>`;
  }

  /**
   * Every AC in Configure UI accordion is displayed into a fc-accordion-panel html element.
   *
   * This method iterates every fc-accordion-panel and set the groupId into data-group
   * attribute. data-group is used for identify the group than belong the CA.
   *
   * @param groupedAttributes CA grouped by CA groups
   * @param accordion Configure UI accordion instance
   */
  async function setGroupDataOnItems(
    groupedAttributes: Map<number, Array<ConfigureAttribute | undefined>>,
    accordion: HTMLElement
  ): Promise<void> {
    for (const ca_id of groupedAttributes.keys()) {
      const cas = groupedAttributes.get(ca_id);

      if (cas) {
        for (const ca of cas) {
          if (ca) {
            const item = accordion.querySelector('.fc-accordion-panel-ca-' + ca.alias);
            item?.setAttribute('data-group', ca_id.toString());
            item?.setAttribute('data-ca', ca.id.toString());
          }
        }
      }
    }
  }

  /**
   *
   * Return the accordion html element into the dom.
   *
   * @returns
   */
  async function getAccordion(): Promise<HTMLElement> {
    const accordion: HTMLElement | null = document.querySelector('.fc-accordion');
    if (accordion === null) {
      // If the accordion have't been created yet, wait for a moment and ask for the instance again.
      await sleep(0);
      return getAccordion();
    }
    return accordion;
  }

  /**
   * Creates the groups html buttons into header
   *
   * @param attributeGroups
   * @returns
   */
  function createGroups(attributeGroups: AttributeGroup[]) {
    const i18n = opts.uiSettings?.groups?.i18n;
    const header: HTMLElement | null = document.querySelector(`.${FC_NESTED_HEADER}`);
    if (!header) return;

    attributeGroups.forEach((ag: AttributeGroup, order) => {
      header.insertAdjacentHTML('beforeend', generateGrouperHtml(ag, order, i18n));
    });
    addToggleListeners();
  }

  /**
   * Add event listeners to group buttons
   */
  function addToggleListeners() {
    const nestedAccordion: HTMLElement = document.querySelector(`.${FC_NESTED_CONTAINER}`) as HTMLElement;
    const groupers: HTMLElement[] = Array.from(nestedAccordion.querySelectorAll(`.${FC_GROUPER}`));
    groupers.forEach((g) => {
      g.addEventListener('click', toggleGroup);
      g.addEventListener('keyup', onKeyUp);
    });
  }

  /**
   * Open the group on keyboard enter
   *
   * @param e
   */
  function onKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      toggleGroup(e);
    }
  }

  /**
   * Remove event listeners from group buttons
   */
  function removeToggleListeners() {
    const nestedAccordion: HTMLElement = document.querySelector(`.${FC_NESTED_CONTAINER}`) as HTMLElement;
    const groupers: HTMLElement[] = Array.from(nestedAccordion.querySelectorAll(`.${FC_GROUPER}`));
    groupers.forEach((g) => {
      g.removeEventListener('click', toggleGroup);
      g.removeEventListener('keyup', onKeyUp);
    });
  }

  /**
   * Displays the clicked group.
   *
   * Every time user clicks on a grouper, all the attributes (fc-accordion-panel) into fc-accordion than belongs to that grouper are displayed.
   * The rest of the attributes are hidden.
   *
   * If the clicked grouper are into fc-nested-accordion-header, all the grouper placed below of that are moved to fc-nested-accordion-footer.
   * If the clicked grouper are into fc-nested-accordion-footer, the clicked grouped and all the groupers above it are moved to fc-nested-accordion-header.
   *
   * @param event
   * @returns
   */
  async function toggleGroup(event: Event): Promise<void> {
    event.stopPropagation();
    const accordion = await getAccordion();
    const target: HTMLElement = (event.currentTarget || event.target) as HTMLElement; //Current grouper
    const groupId = target.getAttribute('data-group'); //Get the group id
    const sOrder = target.getAttribute('data-order'); // Get the group order
    const header = document.querySelector(`.${FC_NESTED_HEADER}`);
    const footer = document.querySelector(`.${FC_NESTED_FOOTER}`);
    const container: HTMLElement = document.querySelector(`.${FC_NESTED_BODY}`) as HTMLElement;
    if (!groupId ?? !sOrder ?? !header ?? !footer ?? !container) return;

    removeToggleListeners();

    if (container.classList.contains('active')) {
      // Hide configure ui accordion accordion
      container.classList.remove('active');
      await slideUp(container);
    }

    const order = parseInt(sOrder);
    const hGroupers: HTMLElement[] = Array.from(header.querySelectorAll(`.${FC_GROUPER}`));
    const fGroupers: HTMLElement[] = Array.from(footer.querySelectorAll(`.${FC_GROUPER}`));

    const isTargetActive = target.classList.contains('active');

    if (isTargetActive) {
      // If clicked group was active, hides all items and move all the groupers from footer to header.
      target.classList.remove('active');
      fGroupers.forEach((current) => {
        footer.removeChild(current);
        header.appendChild(current);
      });
      const hiddenItems: HTMLElement[] = Array.from(accordion.querySelectorAll(`.fc-accordion-panel`));
      hiddenItems.forEach(hide);
    } else {
      // If clicked group wasn't active, disable the past active group.
      header.querySelector('.active')?.classList.remove('active');
      target.classList.add('active');
      if (hGroupers.includes(target)) {
        // If target grouper is in the header, move the
        // groupers under target to the footer.
        for (let i = order + 1; i < hGroupers.length; i++) {
          header.removeChild(hGroupers[i]);
          footer.appendChild(hGroupers[i]);
        }
      } else {
        // If target grouper is in the footer, move the
        // groupers above target and the target to the header.
        let i = 0;
        do {
          footer.removeChild(fGroupers[i]);
          header.appendChild(fGroupers[i]);

          if (fGroupers[i] === target) {
            break;
          }
          i++;
        } while (true); /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
      }

      //Show all the CA than belong to the selected group
      const visibleItems: HTMLElement[] = Array.from(
        accordion.querySelectorAll(`.fc-accordion-panel[data-group="${groupId}"]`)
      );
      visibleItems.forEach(show);

      if (visibleItems.length > 0) {
        //Open the first CA of inner accordion
        const activeCa = visibleItems[0].getAttribute('data-ca');
        if (activeCa) configure.openMenuOption(parseInt(activeCa));
      }

      //Show all the CA than don't belong to the selected group
      const hiddenItems: HTMLElement[] = Array.from(
        accordion.querySelectorAll(`.fc-accordion-panel:not([data-group="${groupId}"])`)
      );
      hiddenItems.forEach(hide);

      // Display the accordion
      container.classList.add('active');
      await slideDown(container, sum(visibleItems, 'clientHeight'));
    }
    addToggleListeners();
  }

  /**
   *
   * Creates the Grouper HTML template.
   *
   * @param ag
   * @param order
   * @returns
   */
  function generateGrouperHtml(
    ag: AttributeGroup,
    order: number,
    i18n: Record<string, Record<string, string>> | undefined
  ): string {
    const groupName = ag.name.toLowerCase();
    return /*html*/ `
      <div class='${FC_GROUPER} ${FC_GROUPER}-${groupName} fc-outline-target'
        data-order='${order}' data-group='${ag.id}' data-name='${ag.name}' tabindex="0">
        <div class='${FC_GROUPER}-row'>
          <div class='${FC_GROUPER}-icon'>
            <span class='${FC_GROUPER}-${groupName}-icon'></span>
          </div>
          <div class='${FC_GROUPER}-title'>${i18n?.[groupName]?.title ?? 'Group'}</div>
          <div class='fc-grouper-min-icon'></div>
          <div class='fc-grouper-max-icon'></div>
        </div>
        <div class='${FC_GROUPER}-row'>
          <div class='${FC_GROUPER}-description'>${i18n?.[groupName]?.desc ?? ''}</div>
        </div>
      </div>
    `;
  }
}
