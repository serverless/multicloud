import { GcpResponse } from "../gcpResponse";
import { CloudProviderRuntime } from "@multicloud/sls-core";

export interface GcpFunctionRuntime extends CloudProviderRuntime {

  flush(response: GcpResponse): void;
}
