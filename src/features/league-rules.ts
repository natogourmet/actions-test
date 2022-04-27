import { ConfigureUI } from '@/configure/ConfigureUI';
import { t } from '@/i18n';
import { AttributeValue } from '@/configure/model/AttributeValue';
import exclamationSvg from '@/assets/icons/exclamation.svg?raw';
import startOverSvg from '@/assets/icons/start-over.svg?raw';
import { DialogEventBus } from '@/configure/ui/configureui-components';
import { sortFnByProperty } from '@/utils/array';
import { AttributeValuePair } from '@/configure/ui/configureui-types';

// - - - - - - - - - - - - - - - - - - - - - - CONSTANTS - - - - - - - - - - - - - - - - - - - - - - - - -

/** Configurable attribute alias, its content determine if this logic applies */
const CA_ALIAS = 'compliance_rules';

/** Name of the form input */
const FORM_INPUT_NAME = 'compliances';

/** Layer number, used to prevent conflicts with "Start Over Dialog", which uses layer 0 */
const DIALOG_LAYER = 1;

/** compliance_rule id (number), this value is set in configure  */
let selectedCompliance: number = -1;

// - - - - - - - - - - - - - - - - - - - - - - - MAIN - - - - - - - - - - - - - - - - - - - - - - - - -

export async function applyLeagueRules(configure: ConfigureUI): Promise<void> {
  const ca = configure.getAttribute({ alias: CA_ALIAS });

  // The product contains no "Compliance" attribute
  if (!ca) return;

  const compliances = ca.values?.filter((c) => c.selectable).sort(sortFnByProperty('priority'));

  if (!compliances || compliances.length === 0) {
    console.warn('Compliance CA found but it contains no selectable values');
    return;
  }

  // Launch dialog when app starts up
  const dialog = await createDialog(compliances, configure);

  // Add listener to relaunch dialog on the "start over" button click
  configure.on('recipe:reset', () => createDialog(compliances, configure));

  // Add listener to re:set the selected compliance after randomized
  configure.on('recipe:randomize', () => setSelectedCompliance(configure));

  // Add listener to re:set the selected compliance, if recipe loaded with selected compliance
  configure.on('recipe:loaded', (recipe) => checkRecipeCompliance(configure, recipe, dialog));
}

// - - - - - - - - - - - - - - - - - - - - - - - FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - -

async function createDialog(compliances: AttributeValue[], configure: ConfigureUI): Promise<DialogEventBus> {
  // Reset the stored selected compliance before showing the dialog
  selectedCompliance = -1;

  // Create UUID to avoid conflicts
  const id = 'fc-adi-lr-modal-' + Date.now();

  const dialog = await configure.createDialog({
    type: 'html',
    innerHTML: Modal(id, compliances),
    customClassName: 'fc-adi-league-rules',
    closeOnBlur: false,
    showClose: false,
    width: 450,
    layer: DIALOG_LAYER
  });

  // Find the form inside the dialog
  const form = document.querySelector(`#${id} form`) as HTMLFormElement;
  if (!form) {
    console.warn('Error while creating the League Rules Dialog: Form not found');
  } else {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleContinue(configure, form, dialog);
    });
  }

  return dialog;
}

function handleContinue(configure: ConfigureUI, form: HTMLFormElement, dialog: DialogEventBus) {
  const selectedValue = new FormData(form).get(FORM_INPUT_NAME);
  if (selectedValue == null) return;

  selectedCompliance = Number(selectedValue);
  setSelectedCompliance(configure);
  dialog.trigger('dialog:closeRequest', DIALOG_LAYER);
}

function setSelectedCompliance(configure: ConfigureUI) {
  if (selectedCompliance == -1) return;

  configure.selectValue({
    ca: { alias: CA_ALIAS },
    av: { id: selectedCompliance }
  });
}

function checkRecipeCompliance(configure: ConfigureUI, recipe: AttributeValuePair[], dialog: DialogEventBus) {
  const complianceId = recipe.find(({ ca }) => ca.alias === CA_ALIAS)?.av.id;

  if (complianceId) {
    selectedCompliance = complianceId;
    setSelectedCompliance(configure);
    dialog?.trigger('dialog:closeRequest', DIALOG_LAYER);
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - COMPONENTS - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Modal displayed to let the user select desired league rule to apply
 */
const Modal = (id: string, compliances: AttributeValue[]) => /*html*/ `
  <div id="${id}">
    <div class="fc-adi-lr-title-wrapper">
      <h1 class="fc-adi-lr-title">
        ${t('lr_compliance')}
      </h1>
      ${Tooltip(compliances)}
    </div>
    <p class="fc-adi-lr-light-text">
      ${t('lr_instructions_1')}
    </p>
    <form>
      <div class="fc-adi-lr-compliance-form-inputs">
        ${compliances.map((c, i) => Compliance(c, i === 0)).join('')}
      </div>
      <p class="fc-adi-lr-footer">
        <span class="fc-adi-lr-ic-exclamation">
          ${exclamationSvg}
        </span>
        <span class="fc-adi-lr-bold">
          ${t('please_note')}:
        </span>
        <span class="fc-adi-lr-light-text">
          ${t('lr_instructions_2')}
        </span>
        <span>
          <span class="fc-adi-lr-ic-start-over">${startOverSvg}</span>
          <span class="fc-adi-lr-underlined">
            ${t('start_over')}
          </span>
        </span>
      </p>
      <button type="submit" class="fc-adi-lr-btn-continue">
        ${t('continue')}
      </div>
    </form>
  </div>
`;

/**
 * compliance_rule Radio Button item rendered in Modal component
 */
const Compliance = (compliance: AttributeValue, checked: boolean) => /*html*/ `
  <div class="fc-adi-lr-compliance">
    <input type="radio" name="${FORM_INPUT_NAME}" id="${compliance.id}" value="${compliance.id}" ${
  checked && 'checked'
}>
    <label for="${compliance.id}">
      <img class="fc-adi-lr-compliance-img" src="${compliance.url}"/>
    </label>
    <label for="${compliance.id}">
      ${compliance.name}
    </label>
  </div>
`;

/**
 * Tooltip displayed on hover on information icon
 * It has all compliance_rules descriptions
 */
const Tooltip = (compliances: AttributeValue[]) => /*html*/ `
  <div class="fc-adi-lr-tooltip">
    <span class="fc-adi-lr-ic-information">
      ${exclamationSvg}
    </span>
    <span class="fc-adi-lr-tooltip-hidden">
      ${compliances.map((c) => ComplianceTooltip(c)).join('')}
    </span>
  </div>
`;

/**
 * compliance_rule item rendered in the Tooltip component
 */
const ComplianceTooltip = (compliance: AttributeValue) => /*html*/ `
  <span class="fc-adi-lr-bold">
    ${compliance.name}:
    <span class="fc-adi-lr-regular">
      ${compliance.description}
    </span>
  </span>
  <br/><br/>
`;
