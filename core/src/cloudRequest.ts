/**
 * Common HTTP Request for Serverless functions
 */
export interface CloudRequest {
  /** Body of request */
  body?: any;
  /** Headers of request */
  headers?: {
    [key: string]: any;
  };
  /** HTTM Method */
  method: string;
  /** Query parameters */
  query?: {
    [key: string]: any;
  };
  /** Path parameters */
  pathParams?: {
    [key: string]: any;
  };
}
