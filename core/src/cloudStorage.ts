import Stream from "stream";

export interface ReadBlobOptions {
  container: string;
  path: string;
}

export default interface CloudStorage {
  read: (opts: ReadBlobOptions) => Promise<Stream>;
}
