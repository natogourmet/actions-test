export interface FCDropdown {
  init(selector: string): FCDropdown;
  closeActive(value: number): void;
  element: EventTarget;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export function FCDropdown(): FCDropdown {
  /**
   * Default plugin options
   * - activeClass - class name used to identify currently opened dropdown
   * - triggerSelector - selector to collect all triggers
   * - focusableSelector - selector to collect all focusable sub items
   * @type {{activeClass: string, triggerSelector: string, focusableSelector: string}}
   */
  const defaults = {
    triggerSelector: '[data-fc-dropdown-trigger]',
    focusableSelector: '[type="button"], [href], [tabindex]:not([tabindex="-1"])',
    activeClass: 'fc-dropdown-active'
  };

  /**
   * Key codes, used in event handlers
   * @type {number}
   */
  const ESCAPE_KEYCODE = 27,
    ARROWRIGHT_KEYCODE = 37,
    ARROWUP_KEYCODE = 38,
    ARROWLEFT_KEYCODE = 39,
    ARROWDOWN_KEYCODE = 40;

  /**
   * Public methods
   * @type {{}}
   */
  const API: any = {};

  /**
   * Options provided during initialization and default option will be merged into settings
   * @type {{}}
   */
  let settings: any = {};

  /**
   * Collection of triggers
   * @type {NodeList}
   */
  let triggers: any;

  /**
   * Collection sub items of currently active dropdown
   * @type {NodeList}
   */
  const subItems: any = {};

  /**
   * currently active trigger
   * @type {Element|HTMLDocument}
   */
  let activeTrigger: any;

  /**
   * Store history of opened drop downs
   * @type {{}}
   */
  const activeTriggers: any = {};

  /**
   * Currently active dropdown
   * @type {Element|HTMLDocument}
   */
  let activeContent: any;

  /**
   * Store history of opened drop downs
   * @type {{}}
   */
  const activeContents: any = {};

  /**
   * Trigger click event handler
   * @param event
   */
  const triggerClickHandler = function (event: any) {
    event.preventDefault();
    const target = getClosest(event.target, settings.triggerSelector);
    const level = target.getAttribute('data-level');
    if (target.classList.contains(settings.activeClass)) API.closeActive(level);
    else API.open(event.target);
  };

  /**
   * Trigger keydown event handler
   * @param event
   */
  const triggerKeydownHandler = function (event: any) {
    //get index of active trigger
    const index = triggers.indexOf(event.target);

    switch (event.which) {
      // focus previous trigger on pressing arrow right key
      case ARROWRIGHT_KEYCODE:
        event.preventDefault();
        focusTrigger(index - 1);
        break;

      // focus next trigger on pressing arrow left key
      case ARROWLEFT_KEYCODE:
        event.preventDefault();
        focusTrigger(index + 1);
        break;

      // close currently open dropdown on escape key
      case ESCAPE_KEYCODE:
        event.preventDefault();
        focusTrigger();
        API.closeActive();
        break;

      // open dropdown on pressing pressing arrow up / arrow down key
      case ARROWDOWN_KEYCODE:
      case ARROWUP_KEYCODE:
        event.preventDefault();
        API.open(event.target);
        break;
    }
  };

  /**
   * Sub item keydown event handler
   * @param event
   * @param {string|number} level
   */
  const subItemKeydownHandler = function (event: any, level: any) {
    if (!subItems || !subItems[level]) return;

    // get index of current sub item
    const index = subItems[level].indexOf(event.target);

    switch (event.which) {
      // focus previous sub item on pressing arrow right / arrow up key
      case ARROWRIGHT_KEYCODE:
        event.preventDefault();
        focusSubItem(level, index - 1);
        break;

      case ARROWUP_KEYCODE:
        if (!event.target.matches(settings.triggerSelector)) {
          event.preventDefault();
          focusSubItem(level, index - 1);
        }
        break;

      // focus next sub item on pressing arrow left / arrow down key
      case ARROWLEFT_KEYCODE:
        event.preventDefault();
        focusSubItem(level, index + 1);
        break;

      case ARROWDOWN_KEYCODE:
        if (!event.target.matches(settings.triggerSelector)) {
          event.preventDefault();
          focusSubItem(level, index + 1);
        }
        break;

      // close currently opened dropdown
      // focus associated trigger
      case ESCAPE_KEYCODE:
        if (!event.target.matches(settings.triggerSelector)) {
          event.preventDefault();
          focusTrigger();
          API.closeActive();
        }
        break;
    }
  };

  /**
   * Focus trigger with provided index
   * @param {Number} index Zero based index of trigger
   */
  const focusTrigger = function (index?: any) {
    // if no index provided, active trigger will be focused
    if (typeof index === 'undefined') index = triggers.indexOf(activeTrigger);

    if (index < 0) index = triggers.length - 1;
    else if (index > triggers.length - 1) index = 0;

    triggers[index].focus();
  };

  /**
   * Focus subitem with provided index
   * @param {string|number} level level ov indent
   * @param {Number} index Zero based index of sub item
   */
  const focusSubItem = function (level: any, index: any) {
    if (index < 0) index = subItems[level].length - 1;
    else if (index > subItems[level].length - 1) index = 0;

    subItems[level][index].focus();
  };

  /**
   * Check if argument is DOM Node
   * @param {*} element
   * @returns {boolean}
   */
  const isElement = function (element: any) {
    return element instanceof Element || element instanceof HTMLDocument;
  };

  /**
   * Get collection of elements, filter out invisible ones
   * Used to get collection of focusable elemnts
   * @param parentNode
   * @param selector
   * @param {string|number} level level ov indent
   * @returns {[]|Array}
   */
  const getFocusableElements = function (parentNode: any, selector: any, level?: any) {
    if (!parentNode) return [];

    const elements: any[] = [];
    const nodeList = parentNode.querySelectorAll(selector);
    let closestParent;

    nodeList.forEach(function (node: any) {
      if (window.getComputedStyle(node).display !== 'none') {
        if (typeof level === 'undefined') {
          elements.push(node);
        } else {
          closestParent = getClosest(node, '[data-level]', true);

          if (closestParent && closestParent.getAttribute('data-level') === level) {
            elements.push(node);
          }
        }
      }
    });

    return elements;
  };

  const getClosest = function (elem: any, selector: any, excludeSelf?: any) {
    if (excludeSelf) {
      elem = elem.parentNode;
    }
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  };

  /**
   * Initialize plugin
   * @param {String|Element|HTMLDocument} element
   * @param {object} options
   */
  API.init = function (element: any, options: any) {
    API.element = isElement(element) ? element : document.querySelector(element);
    settings = Object.assign({}, defaults, options || {});
    triggers = getFocusableElements(API.element, settings.triggerSelector);

    triggers.forEach(function (trigger: any) {
      trigger.addEventListener('click', triggerClickHandler, false);
      trigger.addEventListener('keydown', triggerKeydownHandler, false);
    });

    return this;
  };

  /**
   * Destroy plugin
   */
  API.destroy = function () {
    triggers.forEach(function (trigger: any) {
      trigger.removeEventListener('click', triggerClickHandler, false);
      trigger.removeEventListener('keydown', triggerKeydownHandler, false);
    });

    settings = null;
    triggers = null;

    return this;
  };

  /**
   * Open dropdown associated with provided trigger
   * @param {HTMLElement} target
   */
  API.open = function (target: any) {
    target = getClosest(target, '[data-fc-dropdown-trigger]');
    const level = target.getAttribute('data-level');

    // close active dropdown
    API.closeActive(level);

    // get trigger and dropdown
    activeTrigger = target;
    activeContent = target.nextElementSibling;

    // add required attributes to trigger
    activeTrigger.classList.add(settings.activeClass);
    activeTrigger.setAttribute('aria-expanded', true);

    // add required attributes to dropdown
    activeContent.classList.add(settings.activeClass);
    activeContent.setAttribute('aria-hidden', false);

    activeTriggers[level] = activeTrigger;
    activeContents[level] = activeContent;

    // collect focusable subitems
    subItems[level] = getFocusableElements(activeContent, settings.focusableSelector, level);

    // bind events to sub items
    subItems[level].forEach(function (subItem: any) {
      subItem.addEventListener(
        'keydown',
        function (event: any) {
          subItemKeydownHandler(event, level);
        },
        false
      );
    });

    // focus first subitem
    focusSubItem(level, 0);

    API.element.dispatchEvent(
      new CustomEvent('fcdropdown:opened', {
        detail: {
          level: Number(level)
        }
      })
    );
  };

  /**
   * Close currently opened dropdown
   */
  API.closeActive = function (level: any) {
    if (typeof level === 'undefined') level = activeTrigger.getAttribute('data-level');

    Object.keys(activeTriggers).forEach(function (l: any) {
      if (l >= level) {
        activeTriggers[l].classList.remove(settings.activeClass);
        activeTriggers[l].setAttribute('aria-hidden', true);
        activeTrigger = activeTriggers[l - 1] ? activeTriggers[l - 1] : null;
        delete activeTriggers[l];
      }
    });

    Object.keys(activeContents).forEach(function (l: any) {
      if (l >= level) {
        activeContents[l].classList.remove(settings.activeClass);
        activeContents[l].setAttribute('aria-hidden', true);
        activeContent = activeContents[l - 1] ? activeContents[l - 1] : null;
        delete activeContents[l];
      }
    });

    Object.keys(subItems).forEach(function (l) {
      if (l >= level) {
        subItems[l].forEach(function (subItem: any) {
          subItem.removeEventListener(
            'keydown',
            function (event: any) {
              subItemKeydownHandler(event, level);
            },
            false
          );
        });

        delete subItems[l];
      }
    });

    API.element.dispatchEvent(
      new CustomEvent('fcdropdown:activeClosed', {
        detail: {
          level: Number(level)
        }
      })
    );

    return this;
  };

  return API;
}
