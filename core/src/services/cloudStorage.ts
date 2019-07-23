import Stream from "stream";

/**
 * Options for reading blob
 */
export interface ReadBlobOptions {
  /** Container containing blob to read */
  container: string;
  /** Path of blob within container */
  path: string;
}

/**
 * Service for Cloud Storage account
 */
export interface CloudStorage {
  /** Read a stream from a blob within the storage account */
  read: (opts: ReadBlobOptions) => Promise<Stream>;
}
