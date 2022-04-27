import { ConfigureUI } from '@/configure/ConfigureUI';
import { EventBus } from '@/configure/event/types';
import { AttributeValuePair, GetTemplateOptionsResult, PrintElementOptions } from '@/configure/ui/configureui-types';
import { templateEngine } from '@/utils/template';
import { showErrorDialog } from './dialog';
import { toggleBodyBackdrop } from './loader';

const PRINT_PAGE_TEMPLATE_URL = 'print-page-template.html';
const BUTTON_DEFAULT_SELECTOR = '.configure-print-button';

interface PrintTemplateVariables extends GetTemplateOptionsResult {
  productName: string;
  recipe: Array<AttributeValuePair & { upcharge?: string }>;
}

export function createPrintButton(
  configure: ConfigureUI,
  title: string,
  container: string = BUTTON_DEFAULT_SELECTOR
): Promise<EventBus> {
  return configure.createComponent({
    type: 'button',
    container,
    tabIndex: 0,
    title,
    onClick: () => handlePrint(configure),
    useSemanticButtons: configure.queryParams.useSemanticButtons
  });
}

// Handle print request
async function handlePrint(configure: ConfigureUI): Promise<void> {
  // add class and backdrop to indicate that content is loading
  toggleBodyBackdrop(false);

  // We'll get common information about this URL
  let result: GetTemplateOptionsResult;
  try {
    result = await configure.getTemplateOptions({ purpose: 'printDialog' });
  } catch (err) {
    // remove backdrop to indicating that content is loading
    toggleBodyBackdrop(true);
    showErrorDialog(configure, 'Error', (err as Error).message);
    console.log(err);
    return;
  }

  // Add the information that you need on the print template
  // This could be avoided by using a templating language but
  // we'll just use Vanilla JS for this demo.
  const variables: PrintTemplateVariables = { ...result, productName: result.product.name };
  const upcharges = configure.getUpcharges();

  // Add upcharges for each attribute-value pair
  for (let i = 0; i < variables.recipe.length; i++) {
    if (!upcharges[variables.recipe[i].ca.alias]) continue;

    variables.recipe[i].upcharge = configure.formatPrice(upcharges[variables.recipe[i].ca.alias], { precision: 2 });
  }

  const printOptions: PrintElementOptions = {
    // pageTitle: "", // By default the product name
    overrideElementCSS: ['print.css']
  };

  // Create printable element
  const printableElement = document.createElement('div');

  // We want to make sure the image on the print dialog is loaded
  // before print is called
  const img = new Image();
  img.onload = async function () {
    // Call the print element method to bring up the browser print dialog
    await configure.printElement(printableElement, printOptions);

    // Done printing. Remove backdrop to indicating that content is loading
    toggleBodyBackdrop(true);
  };

  img.onerror = async function () {
    // Call the print element method to bring up the browser print dialog
    await configure.printElement(printableElement, printOptions);

    // Done printing. Remove backdrop to indicating that content is loading
    toggleBodyBackdrop(true);
  };

  // var searchParams = ConfigureIdUtilities.parseSearchString();
  // var refImplVersion = ConfigureIdUtilities.getRefImplVersion(searchParams);
  // var filePath = ConfigureIdUtilities.getFileUrl(refImplVersion, "print-page-template.html");

  try {
    // load Add to Cart Dialog template
    const response = await fetch(PRINT_PAGE_TEMPLATE_URL);
    if (!response.ok) throw new Error(`${PRINT_PAGE_TEMPLATE_URL}: ${response.status} - ${response.statusText}`);

    // Generate markup for print dialog
    printableElement.innerHTML = templateEngine(await response.text(), variables);

    // Load image
    img.src = variables.imageUrl;
  } catch (error) {
    // remove backdrop to indicating that content is loading
    toggleBodyBackdrop(true);
    throw new Error((error as Error).message);
  }
}
