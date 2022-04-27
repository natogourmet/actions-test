/**
 * Loads a font family, using the provided font name and font files
 *
 * @param fontName name of the font to load
 * @param fontUrls URLs of the different files that compose the font
 * @param fontOptions font options
 * @returns an array of promises, one for each font file, that will resolve when they are loaded.
 * To wait for all, use `Promise.all()`
 */
export function loadFontFamily(
  fontName: string,
  fontUrls: Array<string | BinaryData>,
  fontOptions: FontFaceDescriptors = {}
): Array<Promise<FontFace>> {
  return fontUrls.map((fontUrl) => {
    const fontFace: FontFace = new FontFace(fontName, `url(${fontUrl})`, fontOptions);

    document.fonts.add(fontFace);

    return fontFace.load();
  });
}

/**
 * Loads a single font file
 * @param fontName name of the font
 * @param fontUrl url of the font file
 * @param fontOptions font options
 * @returns a promise that will resolve when the font is loaded
 */
export function loadFontFile(
  fontName: string,
  fontUrl: string | BinaryData,
  fontOptions: FontFaceDescriptors = {}
): Promise<FontFace> {
  return loadFontFamily(fontName, [fontUrl], fontOptions)[0];
}

/** Advanced Font typings */

declare global {
  type CSSOMString = string;
  type FontFaceSetStatus = 'loading' | 'loaded';

  // Add it to the global document
  interface Document {
    fonts: FontFaceSet;
  }

  interface FontFace extends FontFaceDescriptors {
    readonly status: FontFaceLoadStatus;
    readonly loaded: Promise<FontFace>;
    variationSettings: CSSOMString;
    display: CSSOMString;
    load(): Promise<FontFace>;
  }

  interface FontFaceDescriptors {
    family?: CSSOMString;
  }

  interface FontFaceSet extends Iterable<FontFace> {
    readonly status: FontFaceSetStatus;
    readonly ready: Promise<FontFaceSet>;
    add(font: FontFace): void;
    check(font: string, text?: string): boolean; // throws exception
    load(font: string, text?: string): Promise<FontFace[]>;
    delete(font: FontFace): void;
    clear(): void;
  }
}
