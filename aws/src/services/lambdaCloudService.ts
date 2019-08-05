import AWS from "aws-sdk";
import { CloudService, ContainerResolver, CloudServiceOptions, CloudContext } from "@multicloud/sls-core";
import { ComponentType } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";

/**
 * Type of invocation for AWS Lambda
 */
export enum AWSInvokeType {
  /** Wait for response */
  fireAndWait = "RequestResponse",
  /** Don't wait for response */
  fireAndForget = "Event"
}

/**
 * Options for invocation of AWS Lambda
 */
export interface AWSCloudServiceOptions extends CloudServiceOptions {
  /** Name of Lambda function to invoke */
  name: string;
  /** Unique resource identifier for Lambda function */
  arn: string;
  /** AWS Region containing lambda function */
  region: string;
}

/**
 * Implementation of Cloud Service for AWS Lambda. Invokes Lambda Functions
 * with exposed HTTP endpoints via API Gateway
 */
@injectable()
export class LambdaCloudService implements CloudService {
  public constructor(@inject(ComponentType.CloudContext) context: CloudContext) {
    this.containerResolver = context.container;
  }

  public containerResolver: ContainerResolver;

  /**
   *
   * @param name Name of Lambda function to invoke
   * @param fireAndForget Wait for response if false (default behavior)
   * @param payload Body of HTTP request
   */
  public invoke<T>(name: string, fireAndForget = false, payload: any) {
    if (!name || name.length === 0) {
      throw Error("Name is needed");
    }
    const context = this.containerResolver.resolve<AWSCloudServiceOptions>(name);

    if (!context.region || !context.arn) {
      throw Error("Region and ARN are needed for Lambda calls");
    }
    const lambda = new AWS.Lambda({ region: context.region });

    return (lambda
      .invoke({
        FunctionName: context.arn,
        Payload: payload,
        InvocationType: fireAndForget
          ? AWSInvokeType.fireAndForget
          : AWSInvokeType.fireAndWait
      })
      .promise() as unknown) as T;
  }
}
