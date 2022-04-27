/** Possible formats for the file reader */
type ReadFormat = 'binary' | 'text' | 'url' | 'arraybuffer';

/**
 * Receives a URL, downloads and reads the file as the string format specified
 * @returns promise of the string content or `null` if the file could not be read
 */
export function readFileFromUrl(url: string, format: 'binary' | 'text' | 'url'): Promise<string | null>;
/**
 * Receives a URL, downloads and reads the file as an `ArrayBuffer`.
 */
export function readFileFromUrl(url: string, format: 'arraybuffer'): Promise<ArrayBuffer | null>;
export async function readFileFromUrl(url: string, format: ReadFormat): Promise<string | ArrayBuffer | null> {
  const response = await fetch(url, {
    mode: 'cors'
  });
  if (!response.ok) throw new Error(`Request failed with status ${response.status} - ${response.statusText}`);
  const blob = await response.blob();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return readFile(blob, format as any);
}

/**
 * Receives a reference to a file and reads it as the string format specified
 * @returns promise of the string content or `null` if the file could not be read
 */
export function readFile(file: Blob, format: 'binary' | 'text' | 'url'): Promise<string | null>;
/**
 * Receives a reference to a file and reads it as an `ArrayBuffer`.
 */
export function readFile(file: Blob, format: 'arraybuffer'): Promise<ArrayBuffer | null>;
export function readFile(file: Blob, format: ReadFormat): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    switch (format) {
      case 'url':
        reader.readAsDataURL(file);
        break;
      case 'binary':
        reader.readAsBinaryString(file);
        break;
      case 'arraybuffer':
        reader.readAsArrayBuffer(file);
        break;
      default:
        reader.readAsText(file);
    }
  });
}
