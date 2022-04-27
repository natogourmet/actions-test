import { initComponents } from './components';
import { showErrorDialog } from './components/dialog';
import { ConfigureUI } from './configure/ConfigureUI';
import {
  ConfigureErrorInvalidRecipe,
  ConfigureInitError,
  ErrorInvalidRecipeDetails
} from './configure/ui/configureui-types';
import { ConfigureImpl } from './ConfigureImpl';

// TODO fix this temporary solution;
// this cannot be localized with regular t function as configure doesn't get fully loaded
const tempI18n = {
  error_loading_product: 'Error loading product with sent parameters',
  unknown_error: 'Unknown Error',
  recipe_not_found: 'Recipe Not found',
  fallback_recipe: 'Fallback recipe will be loaded',
  invalid_recipe: 'Invalid recipe configuration'
};

const UNKNOWN_ERROR = {
  title: tempI18n['unknown_error'],
  message: `<p>${tempI18n['unknown_error']}</p>`
};
const NOT_FOUND_ERROR = {
  title: tempI18n['recipe_not_found'],
  message: `<p>${tempI18n['fallback_recipe']}</p>`
};

export function handleConfigureInitError(
  wrapper: ConfigureImpl,
  configure: ConfigureUI,
  err: ConfigureInitError
): void {
  if (err.fcErrorType === 'recipe:invalid') {
    handleInvalidRecipe(wrapper, (err as ConfigureErrorInvalidRecipe).fcErrorDetails, configure);
  } else if (err.fcErrorType === 'recipe:notFound') {
    handleNotFoundRecipe(wrapper, configure);
  } else {
    handleUnknownError(wrapper, configure);
  }
}

// We'll show an error and will set a recipe with the fall-back values
function handleInvalidRecipe(wrapper: ConfigureImpl, errorDetails: ErrorInvalidRecipeDetails, configure: ConfigureUI) {
  async function loadConfigurator() {
    await configure.setRecipe(errorDetails.fallbackRecipe);
    initComponents(wrapper, configure);
  }

  const error = getInvalidRecipeError(errorDetails);

  showErrorDialog(configure, error.title, error.message, function () {
    loadConfigurator();
  });

  // Only use a recipeImage component with a recipeId. As this
  // will used a cached version of the image that was rendered
  // before the configuration changed.
  configure.createComponent({
    type: 'recipeImage',
    // recipeId: _GET.recipe,
    format: 'jpg',
    quality: 65,
    container: '.configure-product-display'
  });
}

function getInvalidRecipeError(errorDetails: ErrorInvalidRecipeDetails) {
  const title = tempI18n['invalid_recipe'];
  let message = '<ul class="recipe-unavailable">';
  let removed, added;
  const oldConfiguration = errorDetails.recipeDocument.configuration;
  for (let i = 0; errorDetails.unavailable.length > i; i += 1) {
    removed = errorDetails.unavailable[i];
    added = errorDetails.replacements[i];
    message += `<li>${removed.ca.name} value changed from <span style='text-decoration: line-through'>${
      oldConfiguration[removed.ca.alias]
    }</span> to <strong>${added.av.name}</strong></li>`;
  }
  message += '</ul>';
  return { title, message };
}

// We'll show an error and will set a recipe with the fall-back values
function handleNotFoundRecipe(wrapper: ConfigureImpl, configure: ConfigureUI) {
  showErrorDialog(configure, NOT_FOUND_ERROR.title, NOT_FOUND_ERROR.message, function () {
    initComponents(wrapper, configure);
  });
}

async function handleUnknownError(wrapper: ConfigureImpl, configure: ConfigureUI) {
  if (configure.created) {
    const error = UNKNOWN_ERROR;
    showErrorDialog(configure, error.title, error.message, function () {
      initComponents(wrapper, configure);
    });
  } else {
    const container: HTMLElement | null = document.querySelector('.configure-container');
    if (container) container.style['alignItems'] = 'center';
    // var client = new ConfigureIdUtilities.HttpClient();

    // var searchParams = ConfigureIdUtilities.parseSearchString();
    // var refImplVersion = ConfigureIdUtilities.getRefImplVersion(searchParams);
    // var filePath = ConfigureIdUtilities.getFileUrl(refImplVersion, "unknow-error.html");

    // insert response to main page
    const wireFrameContainer = document.getElementById('configure-container');
    if (wireFrameContainer)
      wireFrameContainer.innerHTML = /* html */ `
        '<div class="error-message"><h1 class="error-message_h1">${tempI18n['error_loading_product']}</h1></div>';
      `;
  }
}
