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
   * @param name Name of function to forget
   * @param fireAndForget Don't listen for response if true
   * @param payload Payload to send in invocation
   */
  invoke<T>(name: string, fireAndForget?: boolean, payload?: any): Promise<T>;
}
