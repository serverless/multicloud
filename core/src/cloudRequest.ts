import { StringParams } from ".";

/**
 * Common HTTP Request for Serverless functions
 */
export interface CloudRequest {
  /** Body of request */
  body?: any;
  /** Headers of request */
  headers?: StringParams;
  /** HTTM Method */
  method: string;
  /** Query parameters */
  query?: StringParams;
  /** Path parameters */
  pathParams?: StringParams;
}
