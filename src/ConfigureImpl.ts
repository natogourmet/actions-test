import { ConfigureUI } from '@/configure/ConfigureUI';
import { initComponents } from './components';
import { ConfigureInitError, ConfigureInitParams } from './configure/ui/configureui-types';
import { ConfigureEventDispatcher } from './ConfigureEventDispatcher';
import { handleConfigureInitError } from './error-handlers';
// import { initCustomFeatures } from './features';
import { ImplImagePayload, loadAndSetUgcImage } from './features/image-gallery';
// import { initI18n } from './i18n';
import { createMainLayout } from './layout';
import { handleVersionParameter } from './utils/library-info';

/** Customer ID. Replace for each implementation */
const CUSTOMER_ID = 1623;

/**
 * ConfigureUI Implementation Parameters
 */
interface ConfigureImplementationParams extends Omit<ConfigureInitParams, 'customer' | 'webglEnvironment' | 'id'> {
  /** HTML Element or selector of the container where ConfigureUI should be inserted */
  container: HTMLElement | string;

  /**
   * Determines whether the library version should be added.
   *
   * - If it's an HTML Element or a selector, the library version is inserted in that element.
   * - If it's `true`, an element with '.fc-app-version' is created fixed at the bottom right.
   * - Otherwise, no version is shown
   *
   */
  versionLabel?: HTMLElement | string | boolean;
}

/**
 * ConfigureUI Adidas Implementation class
 */
export class ConfigureImpl extends ConfigureEventDispatcher {
  #opts: ConfigureImplementationParams;
  #configure: ConfigureUI;

  /**
   * Creates a new instance of ConfigureUI
   * @param opts configuration parameters
   */
  constructor(opts: ConfigureImplementationParams) {
    super();
    this.#opts = opts;
    this.#configure = new ConfigureUI({
      ...opts,
      customer: CUSTOMER_ID
      // FIXME: WebGL Environment required for working on dev. Remove on Production.
      // webglEnvironment: 'adidas3Dmodels'
    });
  }

  /**
   * Initializes ConfigureUI
   */
  async start(): Promise<void> {
    createMainLayout(this.#opts.container);
    try {
      if (this.#opts.versionLabel) handleVersionParameter(this.#opts.versionLabel);

      await this.ready();
      this.checkSettings();
      // await initI18n(this.#configure);

      // Wait for components and custom features
      await Promise.all([
        initComponents(this, this.#configure)
        // TODO Check if any custom feature requires the components. For now, they execute in parallel
        // initCustomFeatures(this, this.#configure)
      ]);
    } catch (e) {
      handleConfigureInitError(this, this.#configure, e as ConfigureInitError);
      throw e;
    }
    console.log('Finished initializing ConfigureUI and its components');
  }

  private checkSettings() {
    if (!this.#configure.getPreferences().apiKey) console.warn("Customer doesn't have apiKey");
  }

  /**
   * Promise that resolves when initialization is complete
   */
  ready(): Promise<void> {
    return this.#configure.ready();
  }

  /** Sets and displays the provided external image in the specified attribute  */
  displayImage(payload: ImplImagePayload): Promise<void> {
    // Load the provided image into configure
    return loadAndSetUgcImage(this.#configure, payload);
  }
}
