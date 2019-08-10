import "reflect-metadata";
import { injectable } from "inversify";
import { CloudService } from "..";

@injectable()
export class TestCloudService implements CloudService {
  public invoke<T>(): Promise<T> {
    return Promise.resolve(null);
  }
}
