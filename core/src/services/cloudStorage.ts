import Stream from "stream";

export interface ReadBlobOptions {
  container: string;
  path: string;
}

export interface CloudStorage {
  read: (opts: ReadBlobOptions) => Promise<Stream>;
}
