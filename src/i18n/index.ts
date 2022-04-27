import { ConfigureUI } from '@/configure/ConfigureUI';
import { I18n } from '@/configure/i18n';
import defaultI18n from './defaults';

/** Allowed keys to use in the i18n's translate method */
type I18nKeys = keyof typeof defaultI18n; //import('./defaults').default;

// Creates the i18n singleton using the implementation keys
const i18n: I18n<I18nKeys> = new I18n();

/** Initializes the i18n feature */
export function initI18n(configure: ConfigureUI): Promise<void> {
  return i18n.init(configure, defaultI18n);
}

/** Translates a text to the current locale */
export const t = i18n.t.bind(i18n);
