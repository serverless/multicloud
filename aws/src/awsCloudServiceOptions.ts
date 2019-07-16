import { CloudServiceOptions } from "@multicloud/sls-core";

export interface AWSCloudServiceOptions extends CloudServiceOptions {
  name: string;
  arn: string;
  region: string;
}
