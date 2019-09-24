import { StringParams } from "./common/stringParams";

/**
 * Common HTTP Response for Serverless functions
 */
export interface CloudResponse {
  /** Headers of response */
  headers?: StringParams;
  body: string;
  status: number;

  /**
   * Send response
   * @param body Body of response
   * @param status Status code for response
   * @param contentType ContentType to apply it to response
   */
  send: (body: any, status: number, contentType?: string) => void;

  /**
   * Flushes final response and signals cloud provider runtime that request is complete
   */
  flush: () => void;
}

/**
 * Cloud provider response header name.
 */
export const CloudProviderResponseHeader = "x-sls-cloud-provider";
