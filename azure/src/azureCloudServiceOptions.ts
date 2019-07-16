import { CloudServiceOptions } from "@multicloud/sls-core";

export interface AzureCloudServiceOptions extends CloudServiceOptions{
  name: string;
  method: string;
  http: string;
}
