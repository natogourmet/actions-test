/**
 * Receives a loaded HTMLImageElement and returns its contents in the specified format as a Base64 DataURL
 * @param img Html Image Element
 * @param mimeType the format of the output image (eg. `image/png`)
 * @returns a promise with the DataURL that will resolve when the image is read
 */
export function getImageAsBase64(img: HTMLImageElement, mimeType: string = 'image/png'): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Error while reading image. Error creating Canvas 2D Context');
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL(mimeType);
}

/**
 * Reads an image from a URL and returns its contents in the specified format as a Base64 DataURL
 * @param url of the image
 * @param mimeType the format of the output image (eg. `image/png`)
 * @returns a promise with the DataURL that will resolve when the image is loaded and read
 */
export async function readImageFromUrlAsBase64(url: string, mimeType: string = 'image/png'): Promise<string> {
  return getImageAsBase64(await readImageElementFromUrl(url), mimeType);
}

/**
 * Creates an `HTMLImageElement` with the provided url loaded
 * @param url of the image
 * @returns a promise that will resolve when the image is loaded
 */
function readImageElementFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-debugger
    debugger;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
