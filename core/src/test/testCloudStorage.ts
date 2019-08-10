import "reflect-metadata";
import { injectable } from "inversify";
import { Stream } from "stream";
import { CloudStorage } from "..";

@injectable()
export class TestCloudStorage implements CloudStorage {
  public read(): Promise<Stream> {
    return Promise.resolve(null);
  };
}
