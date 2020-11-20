import { CloudContainer } from "./cloudContainer";
import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";
import { CloudStorage } from "./services/cloudStorage";
import { Logger } from "./services/logger";
import { CloudService } from "./services/cloudService";
import { TelemetryService } from "./services/telemetry";

/**
 * Cloud Provider Runtime
 */
export interface CloudProviderRuntime {
  context: any;
  event: any;
}

/**
 * Common context for Serverless functions
 */
export interface CloudContext {
  /** Cloud provider type */
  providerType: string;
  /** Request ID */
  id: string;
  /** Incoming request */
  event: any;
  /** Container for Cloud Services */
  container?: CloudContainer;
  /** Common Request for Serverless Functions */
  req?: CloudRequest;
  /** Common Response for Serverless Functions */
  res?: CloudResponse;
  /** Storage Service */
  storage?: CloudStorage;
  /** Logging Service */
  logger?: Logger;
  /** Invocation Service */
  service?: CloudService;
  /** Original cloud-specific event context */
  runtime?: CloudProviderRuntime;
  /** Telemetry Service */
  telemetry?: TelemetryService;
  /** Send response */
  send: (body: any, status: number) => void;
  /** Signals the runtime that handler has completed */
  done: () => void;
  /** Flushes the final response to the cloud providers */
  flush: () => void;
}

/**
 * Currently supported cloud provider types.
 */
export enum ProviderType {
  Azure = "azure",
  AWS = "aws",
  GCP = "gcp",
}
