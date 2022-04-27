import { ConfigureUI } from '../ConfigureUI';
import { camelize, camelizeObject, interpolate } from '../utils/text';

/**
 * Class that handles localization of texts in the application
 *
 * @type KEYS allowed keys as a `string union`. Useful to type the translate method
 */
export class I18n<KEYS extends string> {
  /**
   * Map of localized texts
   *
   * The keys are in CamelCase format (changed case to workaround a configure admin tool bug)
   */
  #translations: Record<string, string> = {};

  /** Default translations (in English) in case a key is not found */
  #defaultTranslation: Record<KEYS, string> | undefined = undefined;

  /**
   * Initializes the i18n feature, using the provided ConfigureUI instance
   * @param configure ConfigureUI instance that provides the localization entries
   */
  async init(configure: ConfigureUI): Promise<void>;

  /**
   * Initializes the i18n feature, using the provided ConfigureUI instance and the
   * default translations in case a key is not found.
   * @param configure ConfigureUI instance that provides the localization entries
   * @param defaultTranslations map of default translation entries
   */
  async init(configure: ConfigureUI, defaultTranslations?: Record<KEYS, string>): Promise<void>;

  /**
   * Initializes the i18n feature, using the provided ConfigureUI instance and the
   * default translation URL to load translations from an external JS module.
   *
   * @param configure ConfigureUI instance that provides the localization entries
   * @param defaultUrl URL of a JS module that exports the default translations as `default export`
   */
  async init(configure: ConfigureUI, defaultUrl?: string): Promise<void>;
  async init(configure: ConfigureUI, defaultTranslationsOrUrl?: Record<KEYS, string> | string): Promise<void> {
    if (defaultTranslationsOrUrl) {
      // Load the default translations
      const defaultKeys = await setDefaultTranslations(defaultTranslationsOrUrl);
      if (defaultKeys) this.#defaultTranslation = defaultKeys;
    }

    const corruptedCaseI18n = configure.getUISettings()?.globals?.i18n ?? {};
    this.#translations = camelizeObject(corruptedCaseI18n);
  }

  /**
   * Obtains the translation using the provided key and optionally interpolates using the `replacements`.
   * @param key key to use to find the text
   * @param replacements optional replacement variables if the entry is a template
   * @param defaultT default value if the key is not found. If not provided, the default translation is used.
   * @returns the localizes and replaced text
   */
  t(key: KEYS, replacements?: Record<string, string>, defaultT?: string): string {
    let translation: string | undefined = this.#translations[camelize(key)];
    if (!translation) {
      console.warn(`[i18n] No translation found for key %c${key}`, 'font-weight:bold');
      translation = defaultT ?? this.#defaultTranslation?.[key];
      if (!translation) {
        console.error(`[i18n] No DEFAULT translation found or provided for key %c${key}`, 'font-weight:bold');
        return '';
      }
    }

    return replacements ? interpolate(translation, replacements) : translation;
  }
}

/**
 * Loads the default translation
 * @param defaultTranslationsOrUrl
 * @returns
 */
async function setDefaultTranslations<K extends string>(
  defaultTranslationsOrUrl?: Record<K, string> | string
): Promise<Record<K, string> | undefined> {
  if (typeof defaultTranslationsOrUrl === 'string') {
    const defaultI18n = await import(/* @vite-ignore */ defaultTranslationsOrUrl);
    if (!defaultI18n?.default) {
      console.error('The Default I18n Translations module does not contain a default export');
      return;
    }
    return defaultI18n.default;
  } else {
    return defaultTranslationsOrUrl;
  }
}
