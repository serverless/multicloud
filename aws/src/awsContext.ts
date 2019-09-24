import "reflect-metadata";
import { AwsRequest, AwsResponse } from ".";
import { CloudContext, ComponentType } from "@multicloud/sls-core";
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
  public send(body: any, status: number = 200, contentType?: string): void {
    if (this.res) {
      this.res.send(body, status, contentType);
    }

    this.done();
  }

  public flush() {
    if (this.res) {
      this.res.flush();
    }
  }
}
