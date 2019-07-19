import "reflect-metadata";
import { AwsRequest, AwsResponse } from ".";
import { CloudContext, ComponentType } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";

@injectable()
export class AwsContext implements CloudContext {
  public params: {
    event: any;
    context: any;
    callback: Function;
  };
  public req: AwsRequest;
  public res: AwsResponse;
  public providerType: string;
  public constructor(@inject(ComponentType.RuntimeArgs) args: any[]) {
    this.providerType = "aws";

    this.params = {
      event: args[0],
      context: args[1],
      callback: args[2],
    };
  }
  public send(body: any, status: number = 200): void {
    if (this.res) {
      this.res.send(body, status, this.params.callback);
    }
  }
}
