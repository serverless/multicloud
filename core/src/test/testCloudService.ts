import "reflect-metadata";
import { injectable } from "inversify";
import { CloudService } from "../services/cloudService";

@injectable()
export class TestCloudService implements CloudService {
  public invoke<T>(): Promise<T> {
    return Promise.resolve(null);
  }
}
