import { StringParams } from "./common/stringParams";

/**
 * Common HTTP Request for Serverless functions
 */
export interface CloudRequest {
  /** Body of request */
  body?: any;
  /** Headers of request */
  headers?: StringParams;
  /** HTTP Method */
  method: string;
  /** Query parameters */
  query?: StringParams;
  /** Path parameters */
  pathParams?: StringParams;
}
