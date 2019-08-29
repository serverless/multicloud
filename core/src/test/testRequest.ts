import "reflect-metadata";
import { injectable, inject } from "inversify";
import { CloudRequest } from "../cloudRequest";
import { ComponentType } from "../cloudContainer";
import { CloudContext } from "../cloudContext";
import { StringParams } from "../common/stringParams";

@injectable()
export class TestRequest implements CloudRequest {
  public constructor(@inject(ComponentType.CloudContext) private context: CloudContext) {
    this.method = this.context.runtime.event.method;
    this.headers = new StringParams(this.context.runtime.event.headers);
    this.query = new StringParams(this.context.runtime.event.query);
    this.pathParams = new StringParams(this.context.runtime.event.pathParams);
    this.body = this.context.runtime.event.body;
  }

  public body: any;
  public method: string;
  public headers: StringParams;
  public query: StringParams;
  public pathParams: StringParams;
}
