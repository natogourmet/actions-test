import { ConfigureUI } from '@/configure/ConfigureUI';
import { t } from '@/i18n';
import { AttributeValue } from '@/configure/model/AttributeValue';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { AttributeValuePair } from '@/configure/ui/configureui-types';
import { sleep } from '@/configure/utils/general';
import { filterByTruthy } from '@/utils/array';

const TOGGLE_LABEL_SELECTOR_PREFIX = '#fc-label-text-';
const TOGGLE_CA_SUFFIX = '_toggle';
const TOGGLE_ACTIVE_VALUE = 'On';

let addWord: string, removeWord: string;

/**
 * Implements the custom label for the Configurator toggle.
 *
 * It adds "Add"/"Remove" to the label, according to its state.
 *
 * Also it resets all the subattributes when a toggle is turned off.
 *
 * It is implemented by modifying the existing label (as its ID is known).
 * Since the label does not always exist, listening to 3 from ConfigureUI is required:
 * - When a CA is focused either on the accordion or on the pager, to update it
 * - When a recipe is initially loaded or changed,  since it can be done by code without user interaction
 *
 * @param configure ConfigureUI instance
 */
export function implementToggle(configure: ConfigureUI): void {
  // CA focus on accordion or pager
  configure.on('ca:focus', (data) => onCAFocus(configure, data.caId));

  // Recipe load or change
  configure.on('recipe:loaded', (changes) => handleRecipeChange(configure, changes));
  configure.on('recipe:change', (changes) => handleRecipeChange(configure, changes));

  // initialize default words to use in defaults, when value is not found
  addWord = t('pp_add');
  removeWord = t('pp_remove');
}

async function onCAFocus(configure: ConfigureUI, caId: number): Promise<void> {
  // We need to wait for the label to be created by React
  await sleep(0);

  // Get the CA and check if it's a toggle
  const ca = configure.getAttribute({ id: caId });
  if (!ca || !isToggleCA(ca)) return;

  // Update the toggle according to the CA selected value
  updateToggleLabel(ca, ca.values.find(filterByTruthy('selected')));
}

/**
 * Handles the recipe load or change.
 * Checks if any of the changes include a toggle CA, updates the label if it exists and resets the subattributes when turned off
 */
function handleRecipeChange(configure: ConfigureUI, modifications: AttributeValuePair[]) {
  modifications
    .filter(({ ca }) => isToggleCA(ca))
    .forEach(({ ca, av }) => {
      // Updates the toggle label
      updateToggleLabel(ca, av);

      // If the toggle is turned off, reset all the subattributes
      if (av.name !== TOGGLE_ACTIVE_VALUE) {
        const scas = configure.getAttribute({ id: ca.id })?.subAttributes;
        if (scas) configure.resetAttributes(scas);
      }
    });
}

/**
 * Determines whether the CA is a toggle
 */
function isToggleCA(ca: ConfigureAttribute) {
  return ca.selectorType === 'checkbox' && ca.alias.endsWith(TOGGLE_CA_SUFFIX);
}

/**
 * Updates the label if it exists (it may not)
 */
function updateToggleLabel(ca: ConfigureAttribute, av?: AttributeValue) {
  const label = document.querySelector(TOGGLE_LABEL_SELECTOR_PREFIX + ca.id);
  if (label) label.textContent = getToggleLocalizedText(ca, av);
}

/**
 * Gets the localized label for the CA and the selected value
 */
function getToggleLocalizedText(ca: ConfigureAttribute, av?: AttributeValue): string {
  const caKey = ca.alias.replace(TOGGLE_CA_SUFFIX, '');
  const isOn = av?.name === TOGGLE_ACTIVE_VALUE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const key: any = 'pp_' + caKey + (isOn ? '_remove' : '_add');
  return t(key, undefined, (isOn ? removeWord : addWord) + ' ' + ca.name);
}
