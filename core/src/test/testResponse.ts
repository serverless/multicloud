import "reflect-metadata";
import { injectable } from "inversify";
import { CloudResponse } from "../cloudResponse";
import { StringParams } from "../common/stringParams";

@injectable()
export class TestResponse implements CloudResponse {
  public body: string;
  public status: number;
  public headers: StringParams = new StringParams();

  public send(body: any, status: number) {
    this.body = body;
    this.status = status;
  }

  public flush() {
  }
}
