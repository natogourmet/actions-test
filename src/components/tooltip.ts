import { ConfigureUI } from '@/configure/ConfigureUI';
import { ConfigureAttribute, isColorAttribute, isPatternAttribute } from '@/configure/model/ConfigureAttribute';
import internetips from 'internetips';

interface TooltipOpts {
  target: EventTarget | null;
  content: string;
  classes?: string[];
}

function tc(suffix?: string) {
  const cls = 'fc-tooltip';
  return suffix ? `${cls}-${suffix}` : cls;
}

const CONFIGURE_UI_CONFIG = {
  containerClass: tc('container'),
  tooltipClass: tc(),
  activeClass: tc('show'),
  placeClass: {
    top: tc('place-top'),
    right: tc('place-right'),
    bottom: tc('place-bottom'),
    left: tc('place-left')
  },
  typeClass: {
    dark: tc('type-dark'),
    light: tc('type-light')
  },
  defaults: {
    offsetX: 8,
    offsetY: 10
  }
};

internetips.setConfig(CONFIGURE_UI_CONFIG);

export function showTooltip(opts: TooltipOpts): void {
  internetips.show({
    place: 'left',
    effect: 'solid',
    type: 'dark',
    ...opts
  });
}

export function hideTooltip(): void {
  internetips.hide();
}

/**
 * TODO: The second parameter is actually an AV
 * Generate custom content for attribute value tooltip
 * @param {object} ca Configurable attribute
 * @returns {string}
 */
export function buildSwatchTooltip(configure: ConfigureUI, ca: ConfigureAttribute): string {
  let tooltipContent = '<div class="fc-swatch-tooltip-inner">';

  if (isColorAttribute(ca)) {
    tooltipContent += `<div class="fc-swatch-tooltip-image" style="background-color: ${ca.color}"></div>`;
  } else if (isPatternAttribute(ca)) {
    tooltipContent += `<div class="fc-swatch-tooltip-image" style="background-image: url(${ca.tooltipImage})"></div>`;
  }
  tooltipContent += `<div class="fc-swatch-tooltip-name">${ca.name}</div>`;

  if (ca.upcharge)
    tooltipContent += `<div class="fc-swatch-tooltip-upcharge">${configure.formatPrice(ca.upcharge, {
      precision: 2
    })}</div>`;
  if (ca.description) tooltipContent += `<div class="fc-swatch-tooltip-description">${ca.description}</div>`;

  return tooltipContent + '</div>';
}
