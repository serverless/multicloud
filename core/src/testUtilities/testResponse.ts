import "reflect-metadata";
import { injectable } from "inversify";
import { CloudResponse, CloudResponseLike } from "../cloudResponse";
import { StringParams } from "../common/stringParams";

@injectable()
export class TestResponse implements CloudResponse {
  public body: string;
  public status: number;
  public headers: StringParams = new StringParams();

  public send(response: CloudResponseLike = {}) {
    this.body = response.body || null;
    this.status = response.status || 200;
    response.headers = response.headers || {};

    // Append additional headers
    Object.keys(response.headers).forEach((key) => {
      this.headers.set(key, response.headers[key]);
    })
  }

  public flush() {
  }
}
