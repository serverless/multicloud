import { CloudProviderRuntime } from "core/lib";

export interface GcpFunctionRuntime extends CloudProviderRuntime {
  event: any;
  callback: (err, response) => void;
  context: {
    eventId: string;
    eventType: string;
    timestamp: string;
  };
}
