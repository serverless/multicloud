import { Guard } from "./guard";

/**
 * Create a case insensitive string parameter map
 * Used in HTTP request / response for headers, query strings & path params
 */
export class StringParams<T = any> extends Map<string, T> {

  public constructor(entries?: Iterable<[string, T]> | any) {
    if (entries && entries.constructor && entries.constructor.name === "Object") {
      entries = Object.keys(entries).map((key) => [key, entries[key]]);
    }

    super(entries)
  }

  /**
   * Sets a value at the specified key
   * @param key The key to set
   * @param value The value of the key
   */
  public set(key: string, value: T): this {
    Guard.empty(key);
    return super.set(this.normalizeKey(key), value);
  }

  /**
   * Gets the value for the specified key
   * @param key The key to get
   */
  public get(key: string): T | undefined {
    Guard.empty(key);
    return super.get(this.normalizeKey(key));
  }

  /**
   * Checks whether a key exists within the map
   * @param key The key to check
   */
  public has(key: string): boolean {
    Guard.empty(key);
    return super.has(this.normalizeKey(key));
  }

  /**
   * Delete the key with the specified value
   * @param key The key to delete
   */
  public delete(key: string): boolean {
    Guard.empty(key);
    return super.delete(this.normalizeKey(key));
  }

  /**
   * Serializes the map to a plain javascript object for use with JSON.stringify
   */
  public toJSON() {
    const output = {};

    this.forEach((value, key) => {
      output[key] = value;
    });

    return output;
  }

  /**
   * Normalizes the specified key to lower case
   * @param key The key to normalize
   */
  private normalizeKey(key: string) {
    return key.toLowerCase();
  }
}
