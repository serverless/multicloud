import { StringParams } from "../common/stringParams";

/**
 * Invoke Request options
 * Implemented in order to have all the parameters needed for the invoke function in one object
 */
export interface InvokeRequest {
  /**
   * @param name Function name to invoke
   * @param fireAndForget Wait for response if false (default behavior)
   * @param payload HTTP request body
   * @param headers Context headers
   * @param pathParams StringParams with values for URL
   * @param extraParams Extra parameters to invoke function
   */
  name: string;
  fireAndForget: boolean;
  payload: any;
  headers?: StringParams;
  pathParams?: StringParams;
  extraParams?: any;
}

/**
 * Options for Cloud Service invocation
 */
export interface CloudServiceOptions {
  name: string;
}

/**
 * Service to invoke a Serverless function
 */
export interface CloudService {
  /**
   * Invoke a deployed Serverless function
   * @param invokeOptions parameters needed to call the invoke
   */
  invoke<T>(invokeOptions: InvokeRequest): Promise<T>;

  /**
   * @deprecated since 0.1.1-29 version
   * Invoke a deployed Serverless function
   * @param name Name of function to forget
   * @param fireAndForget Don't listen for response if true
   * @param payload Payload to send in invocation
   * @param headers Headers of the context
   */
  invoke<T>(name: string, fireAndForget: boolean, payload?: any, headers?: StringParams): Promise<T>;
}
