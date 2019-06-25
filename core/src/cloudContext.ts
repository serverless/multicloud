import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";
import CloudStorage from "./cloudStorage";

export interface CloudContext {
  providerType: string;
  req?: CloudRequest;
  res?: CloudResponse;
  storage?: CloudStorage;
  // queue?: CloudQueue;
}
