import "reflect-metadata";
import { injectable } from "inversify";
import { CloudResponse, StringParams } from "..";

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
