import { filterByProperty } from '@/utils/array';

/** Entry for entities' metadata */
export interface MetadataEntry {
  key: string;
  value: string;
}

/**
 * Interface to be implemented by entities with metadata
 */
export interface WithMetadata {
  metadata?: MetadataEntry[];
}

/**
 * Finds a metadata entry's value given its key
 * @param entity entity that contains the metadata
 * @param key key to look for
 * @returns the value or `undefined` if the entry doesn't exist
 */
export function findMetadataValue(entity: WithMetadata, key: string): string | undefined {
  return entity.metadata?.find(filterByProperty('key', key))?.value;
}

/**
 * Predicate that searches for entities that contain a metadata entry with the provided key.
 *
 * Useful to use with array methods like `find`, `filter`, etc
 * @param key key to look for
 */
export function filterByMetadataKey(key: string): (entity: WithMetadata) => boolean {
  return (entity: WithMetadata) => entity.metadata?.some((entry) => entry.key === key) ?? false;
}

/**
 * Predicate that searches for entities that contain a metadata entry with the provided key and value.
 *
 * Useful to use with array methods like `find`, `filter`, etc
 * @param key key to look for
 * @param value value for that entry
 */
export function filterByMetadataEntry(key: string, value: string): (entity: WithMetadata) => boolean {
  return (entity: WithMetadata) =>
    entity.metadata?.some((entry) => entry.key === key && entry.value === value) ?? false;
}
