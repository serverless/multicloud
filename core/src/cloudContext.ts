import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";
import { CloudStorage } from "./cloudStorage";
import { Logger } from "./logger";
import { CloudService } from "./cloudService";

export interface CloudContext {
  providerType: string;
  req?: CloudRequest;
  res?: CloudResponse;
  storage?: CloudStorage;
  logger?: Logger;
  service?: CloudService;
  // queue?: CloudQueue;
  send: (body: any, status: number) => void;
}
