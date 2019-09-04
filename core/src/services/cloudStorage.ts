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
 * Options for writing blob
 */
export interface WriteBlobOptions {
  /** Container containing blob to read */
  container: string;
  /** Path of blob within container */
  path: string;
  /** Stringified body of the blob to write */
  body: string | Buffer | Stream;
  /** Object containing extra parameters to pass */
  options?: object;
}

/**
 * Output when uploading blob
 */
export interface WriteBlobOutput {
  /** Entity tag of the object */
  eTag: string;
  /** Version of the object */
  version: string;
}

/**
 * Service for Cloud Storage account
 */
export interface CloudStorage {
  /** Read a stream from a blob within the storage account */
  read: (opts: ReadBlobOptions) => Promise<Stream>;
  /** Write a blob to the storage account */
  write: (opts: WriteBlobOptions) => Promise<WriteBlobOutput>;
}
