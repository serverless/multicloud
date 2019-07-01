import { AWSRequest } from "./awsRequest";
import { AWSResponse } from "./awsResponse";
import { CloudContext } from "@multicloud/sls-core";

export class AWSContext implements CloudContext {
  public params: {
    event: any;
    context: any;
    callback: Function;
  };
  public req: AWSRequest;
  public res: AWSResponse;
  public providerType: string;
  public constructor(
    event: any,
    context: any,
    callback: Function,
  ) {
    this.providerType = "aws";
    this.params = {event, context, callback};
  }
  public send(body: any, status: number = 200): void {
    if (this.res) {
      this.res.send(body, status, this.params.callback);
    }
  }
}
