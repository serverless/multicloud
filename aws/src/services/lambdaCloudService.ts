import AWS from "aws-sdk";
import { CloudService, ContainerResolver, CloudServiceOptions, CloudContext, ComponentType, InvokeRequest } from "@multicloud/sls-core";
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
 * Ensures the input to be a JSON String
 *
 * @param input value to be parsed to string
 */
export const ensureString = (input: any) => {
  return typeof (input) !== "string"
    ? JSON.stringify(input)
    : input;
}

/**
 * Normalizes the payload to comply the Input Format of a Lambda Function for Proxy Integration
 * More information: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 *
 * @param input value to be normalized as payload with the Input Format
 */
export const normalizePayload = (input: any) => {
  if (typeof input !== "object") {
    throw new Error("input type must be an object");
  }

  let payload = {
    body: null
  };

  if (input && input.hasOwnProperty("body")) {
    // Case when the `input` already has the input format for Lambda Proxy Integration
    payload = {
      ...input,
      body: input.body && ensureString(input.body)
    };
  }
  else {
    // Case when the `input` is the actual body
    payload.body = input && ensureString(input)
  }

  return ensureString(payload);
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
   * @param invokeOptions invoke interface with parameters needed
   */
  public async invoke<T>(invokeOptions: InvokeRequest): Promise<T> {
    const { name, fireAndForget, payload } = invokeOptions;

    if (!name || name.length === 0) {
      return Promise.reject("Name is needed");
	  }

    const context = this.containerResolver.resolve<AWSCloudServiceOptions>(name);

    if (!context.region || !context.arn) {
      return Promise.reject("Region and ARN are needed for Lambda calls");
    }

    const lambda = new AWS.Lambda({ region: context.region });

    const response = lambda
      .invoke({
        FunctionName: context.arn,
        Payload: normalizePayload(payload),
        InvocationType: fireAndForget
          ? AWSInvokeType.fireAndForget
          : AWSInvokeType.fireAndWait
      })
	    .createReadStream();

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      response.on("error", error => {
        response.destroy();
        reject(error);
      });

      response.on("data", data => {
        chunks.push(data);
      });

      response.on("end", () => {
        // In case of "RequestResponse" invocation type
        // the invoke response body is parsed to JSON
        resolve(fireAndForget
          ? undefined
          : JSON.parse(JSON.parse(chunks.toString()).body)
        );
      });
    });
  }
}
