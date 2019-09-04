import "reflect-metadata";
import { injectable } from "inversify";
import { Stream } from "stream";
import { CloudStorage, WriteBlobOutput } from "../services/cloudStorage";

@injectable()
export class TestCloudStorage implements CloudStorage {
  public read(): Promise<Stream> {
    return Promise.resolve(null);
  };
  public write(): Promise<WriteBlobOutput> {
    return Promise.resolve(null);
  };
}
