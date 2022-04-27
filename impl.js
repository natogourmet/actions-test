// Retrieve ConfigureID Implementation class
import ConfigureImplementation from './src/main';

// Use native URLSearchParams to retrieve Query Params (as an example, it's not required)
const qp = new URLSearchParams(window.location.search);

// Create ConfigureID's implementation instance
// Most of the configuration is retrieved from Query Params as an example,
// but this could be hardcoded, retrieved from a configuration file, etc
const configure = new ConfigureImplementation({
  container: '#configure-impl',
  facebookAppId: 805996949423760,
  environment: getQueryParam(qp, 'environment'),
  workflow: getQueryParam(qp, 'workflow') ?? 'dev',
  product: getQueryParam(qp, 'product', Number) ?? 24690, // 24284,
  recipe: getQueryParam(qp, 'recipeId', Number) ?? getQueryParam(qp, 'recipe', Number),
  locale: getQueryParam(qp, 'locale'), // 'en_US', 'es_ES',
  currency: getQueryParam(qp, 'currency'),
  apiVersion: getQueryParam(qp, 'apiVersion'),
  useSemanticButtons: getQueryParam(qp, 'useSemanticButtons', Boolean),
  ignoreDefaultViewFallback: getQueryParam(qp, 'ignoreDefaultViewFallback', Boolean),
  dir: getQueryParam(qp, 'dir'),
  versionLabel: true
  // facetFilters: mapFacetFilters(searchParams)
});

// Add Event Listeners
// configure.addEventListener('image-upload', (e) => {
//   configure.displayImage({
//     imageLibraryId: 'YMbgQ5w7ySE9Idg88bLssguHX-rwn3eMG6sb',
//     url: 'https://gtsprod-res.cloudinary.com/image/upload/v1631223958/embellishment-upload/ycp4uh6imxnyhdhqvfjg.png',
//     embellishmentData: e.detail,
//     fileName: 'team-logo.png'
//   });
// });

// configure.addEventListener('image-library', (e) => {
//   configure.displayImage({
//     imageLibraryId: 'YMbgQ5w7ySE9Idg88bLssguHX-rwn3eMG6sb',
//     url: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
//     embellishmentData: e.detail,
//     fileName: 'team-logo2.png'
//   });
// });

// Add To Cart event listener. The payload includes de Recipe ID and JSON URL
configure.addEventListener('add-to-cart', (e) => {
  if (window.confirm(`Recipe ${e.detail.id} saved. Do you want to open the recipe JSON?`)) {
    window.open(e.detail.resource, '_blank');
  }
});

// Initializes ConfigureID instance
// Returns a promises that resolves when ready
configure.start();
/**
 * Aux function to retrieve Query Params with the appropriate type
 * @param {*} qp URLSearchParams instance
 * @param {*} name name of the query param
 * @param {*} typeFn if not defined, the param is considered to be a string. Other options are: Number, Boolean.
 * @returns
 */
function getQueryParam(qp, name, typeFn = undefined) {
  const value = qp.get(name);
  if (value === null) return undefined;
  return typeFn ? typeFn(value) : value;
}
