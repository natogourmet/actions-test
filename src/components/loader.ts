export default {
  Small: /*html*/ `<div class="fc-adi-loader-small" />`,
  Regular: /*html*/ `<div class="fc-adi-loader" />`,
  Big: /*html*/ `<div class="fc-adi-loader-big" />`
};

/**
 * Toggle html/body class to indicate that some action is in progress
 * Add or remove backdrop depending on state
 * @param {boolean} state
 */
export function toggleBodyBackdrop(state: boolean): void {
  const LOADING_CLASS = 'fc-content-is-loading';
  const BACKDROP_CLASS = 'fc-body-backdrop';
  let bodyBackdrop = document.querySelector('.' + BACKDROP_CLASS);

  if (!bodyBackdrop) {
    bodyBackdrop = document.createElement('div');
    bodyBackdrop.classList.add(BACKDROP_CLASS);
  }

  if (state) {
    document.documentElement.classList.remove(LOADING_CLASS);
    document.body.classList.remove(LOADING_CLASS);
    bodyBackdrop.remove();
  } else {
    document.documentElement.classList.add(LOADING_CLASS);
    document.body.classList.add(LOADING_CLASS);
    document.body.appendChild(bodyBackdrop);
  }
}
