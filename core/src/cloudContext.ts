import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";
import { CloudStorage } from "./services/cloudStorage";
import { Logger } from "./services/logger";
import { CloudService } from "./services/cloudService";
import { TelemetryService } from "./services/telemetry";
import { CloudContainer } from "./cloudContainer";

export interface CloudContext {
  providerType: string;
  id: string;
  container?: CloudContainer;
  req?: CloudRequest;
  res?: CloudResponse;
  storage?: CloudStorage;
  logger?: Logger;
  service?: CloudService;
  runtime?: any;
  telemetry?: TelemetryService;
  send: (body: any, status: number) => void;
}
