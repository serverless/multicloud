import { StringParams } from "./common/stringParams";

export interface CloudResponseLike {
  headers?: any;
  body?: any;
  status?: number;
}

/**
 * Common HTTP Response for Serverless functions
 */
export interface CloudResponse {
  /** Headers of response */
  headers?: StringParams;
  body: any;
  status: number;

  /**
   * Send response
   * @param body Body of response
   * @param status Status code for response
   * @param contentType ContentType to apply it to response
   */
  send: (response: CloudResponseLike) => void;

  /**
   * Flushes final response and signals cloud provider runtime that request is complete
   */
  flush: () => void;
}

/**
 * Cloud provider response header name.
 */
export const CloudProviderResponseHeader = "x-sls-cloud-provider";
