import { ConfigureUI } from '@/configure/ConfigureUI';
import { AttributeValue } from '@/configure/model/AttributeValue';
import { ConfigureAttribute } from '@/configure/model/ConfigureAttribute';
import { ConfigureProduct } from '@/configure/model/ConfigureProduct';
import { filterByMetadataKey, findMetadataValue } from '@/configure/model/Metadata';
import { AttributeValuePair } from '@/configure/ui/configureui-types';
import { KeysOfType } from '@/configure/utils/types';

interface AssociationOpts {
  /** Key of the Metadata entry that specifies the associations */
  metadataKey: string;
  /** AV property used in the metadata entry as Id */
  avProperty: KeysOfType<AttributeValue, string | number>;
  /** Character used to separate the different AVs in the metadata entry */
  listSeparator: string;
}

/**
 * Class that process a list of association between AVs and allows to retrieve them and
 * find out currently selected AVs associations.
 *
 * To associate an AV with others, an entry must be added in the AVs metadata that contains the list of other AVs separated by
 * a special character.
 * Example: `metadata{ "conflicts_with": "center_front|center_chest_number|center_chest_logo|center_front_logo" }`
 */
export class ValueAssociationManager {
  #opts: AssociationOpts;
  #dispatcher: EventTarget = new EventTarget();

  /** Map that associates an AV with the others specified in its metadata */
  associationMap: Record<string | number, string[]> = {};
  /** List of AVs that are associated with the currently selected ones */
  selectionAssociatedAVs: Set<string | number> = new Set();

  /** Attribute Value Pairs that are currently SELECTED in the recipe and which AV has associations */
  selectedAttributeValuePairs: Set<AttributeValuePair<number, string | number>> = new Set();

  constructor(configure: ConfigureUI, opts: AssociationOpts) {
    this.#opts = opts;

    const product = configure.getProduct();
    if (!product) return;

    // Creates a map that associates an AV with the others specified in its metadata
    this.associationMap = this.buildAssociationMap(product);

    // Handle the recipe loading
    configure.on('recipe:loaded', (changes) => this.updateSelected(changes));

    // Handle the recipe changes
    configure.on('recipe:change', () => this.updateSelected(configure.getRecipe('json')));
  }

  private buildAssociationMap(product: ConfigureProduct): Record<string, string[]> {
    // Get the list of required CAs (the ones which contains AVs with associations)
    const attributesWithAssociations = product.attributes.flatMap((ca) => this.getCAsWithAssociations(ca));

    // Iterates each AV of the CAs and finds the ones with the required metadata
    const associationMap: Record<string, string[]> = {};
    for (const ca of attributesWithAssociations) {
      for (const av of ca.values) {
        const metadataValue = findMetadataValue(av, this.#opts.metadataKey);
        if (metadataValue) {
          // If the AV contains the required entry, split the string to get the list of associated AVs
          // and add it to the map
          associationMap[av[this.#opts.avProperty]] = metadataValue.split(this.#opts.listSeparator);
        }
      }
    }

    return associationMap;
  }

  private updateSelected(recipeItems: AttributeValuePair[]): void {
    // Clears the sets, as we are recreating them
    this.selectionAssociatedAVs.clear();
    this.selectedAttributeValuePairs.clear();

    recipeItems
      // Only process CAs that contain associations
      // .filter(({ ca }) => this.hasAssociationMetadata(configure.getAttribute({ id: ca.id })))
      // For each selected value, if it has associations, add the other AVs to the "active" list
      .forEach(({ ca, av }) => {
        const associatedAVs = this.associationMap[av[this.#opts.avProperty]];

        // If this AV has no associations, we don't care about it
        if (!associatedAVs) return;

        // Adds the AttributeValue pair to the list of selected.
        this.selectedAttributeValuePairs.add({ ca: ca.id, av: av[this.#opts.avProperty] });

        // Update the list of AVs associated with selected ones
        associatedAVs.forEach((av) => this.selectionAssociatedAVs.add(av));
      });

    // Dispatches the event to notify of the update, so the UI may be updated
    this.#dispatcher.dispatchEvent(new Event('update:selected'));
  }

  /**
   * Given a CA, obtains the list of the CAs it contains with AV associations.
   * It includes itself and its subattributes.
   */
  getCAsWithAssociations(ca: ConfigureAttribute): ConfigureAttribute[] {
    const result: ConfigureAttribute[] = [];
    // Add this ca if it contains associations
    if (this.hasAssociationMetadata(ca)) result.push(ca);

    if (!ca.subAttributes) return result;
    // Add the subattributes with associations recursively
    result.push(...ca.subAttributes.flatMap((sca) => this.getCAsWithAssociations(sca)));
    return result;
  }

  /**
   * Determines whether this CA contains AVs with associations
   */
  private hasAssociationMetadata(ca: ConfigureAttribute | undefined): boolean {
    return ca?.values?.some(filterByMetadataKey(this.#opts.metadataKey)) ?? false;
  }

  addEventListener(type: 'update:selected', callback: (e: CustomEvent<Set<string>>) => void): void {
    this.#dispatcher.addEventListener(type, callback as EventListener);
  }
  removeEventListener(type: 'update:selected', callback: (e: CustomEvent<Set<string>>) => void): void {
    this.#dispatcher.removeEventListener(type, callback as EventListener);
  }

  // filterActiveByCA(ca: ConfigureAttribute): Array<string | number> {
  //   // From the specified CA, get the list of CAs with associated AVs (it may contain multiple sub CAs)
  //   const cas = this.getCAsWithAssociations(ca);

  //   // Filter the active AVs to obtain only the ones used by these CAs
  //   return cas
  //     .flatMap((ca) => ca.values.filter((av) => this.selectionAssociatedAVs.has(av[this.#opts.avProperty])))
  //     .map((av) => av[this.#opts.avProperty]);
  // }
}
