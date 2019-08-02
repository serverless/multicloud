import { CloudProviderRuntime } from "@multicloud/sls-core";

export interface AwsLambdaRuntime extends CloudProviderRuntime {
  event: any;
  callback: (err, response) => void;
  context: {
    awsRequestId: string;
  };
}
