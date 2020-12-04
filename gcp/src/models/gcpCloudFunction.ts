import { GcpResponse } from "../gcpResponse";
import { CloudProviderRuntime } from "@multicloud/sls-core";

export interface GcpFunctionRuntime extends CloudProviderRuntime {
  callback: (err, response) => void;
  flush(response: GcpResponse): void;
}
