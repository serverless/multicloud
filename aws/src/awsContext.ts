import "reflect-metadata";
import { AwsRequest, AwsResponse } from ".";
import { CloudContext, ComponentType, CloudResponseLike } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";
import { AwsLambdaRuntime } from "./models/awsLamda";

/**
 * Implementation of Cloud Context for AWS Lambda
 */
@injectable()
export class AwsContext implements CloudContext {
  /**
   * Initializes new AwsContext, injects runtime arguments of AWS Lambda.
   * Sets runtime parameters from original arguments
   * @param args Runtime arguments for AWS Lambda
   */
  public constructor(@inject(ComponentType.RuntimeArgs) args: any[]) {
    this.providerType = "aws";

    this.runtime = {
      event: args[0],
      context: args[1],
      callback: args[2],
    };

    this.id = this.runtime.context.awsRequestId;

    // AWS has a single incoming event source
    this.event = this.runtime.event;
  }

  /** "aws" */
  public providerType: string;
  /** Unique identifier for request */
  public id: string;
  /** The incoming event source */
  public event: any;
  /** HTTP Request */
  public req: AwsRequest;
  /** HTTP Response */
  public res: AwsResponse;
  /** Original runtime arguments for AWS Lambda */
  public runtime: AwsLambdaRuntime;
  /** Signals to the framework that the request is complete */
  public done: () => void;

  /**
   * Send response from AWS Lambda
   * @param body Body of response
   * @param status Status code of response
   * @param contentType ContentType to apply it to response
   */
  public send(bodyOrResponse?: any, status?: number, contentType?: string): void {
    if (this.res) {
      const response: CloudResponseLike = {
        body: bodyOrResponse ? (bodyOrResponse.body || bodyOrResponse) : null,
        status: status || (status ? status : (bodyOrResponse ? bodyOrResponse.status : 200)) || 200,
        headers: bodyOrResponse ? bodyOrResponse.headers || {} : {}
      };

      if (contentType) {
        response.headers["Content-Type"] = contentType;
      }

      this.res.send(response);
    }

    this.done();
  }

  public flush() {
    if (this.res) {
      this.res.flush();
    }
  }
}
