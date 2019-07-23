import { CloudService, ContainerResolver, CloudServiceOptions } from "@multicloud/sls-core";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Options for Azure Function invocation
 */
export interface AzureCloudServiceOptions extends CloudServiceOptions {
  /** Name of function to invoke */
  name: string;
  /** HTTP method of invocation */
  method: string;
  /** URL for invocation */
  http: string;
}

/**
 * Implementation of Cloud Service for Azure Functions. Invokes HTTP Azure Functions
 */
export class AzureFunctionCloudService implements CloudService {

  /**
   * Initialize a new Azure Function Cloud Service with the IoC container
   * @param containerResolver IoC container for service resolution
   */
  public constructor(private containerResolver: ContainerResolver) { }

  /**
   *
   * @param name Name of function to invoke
   * @param fireAndForget Wait for response if false (default behavior)
   * @param payload Body of HTTP request
   */
  public async invoke<T>(name: string, fireAndForget = false, payload: any = null) {
    if (!name || name.length === 0) {
      throw Error("Name is needed");
    }

    const context = this.containerResolver.resolve<AzureCloudServiceOptions>(name);
    if (!context.method || !context.http) {
      throw Error("Missing Data");
    }

    const axiosRequestConfig: AxiosRequestConfig = {
      url: context.http,
      method: context.method,
      data: payload,
    };

    if (fireAndForget) {
      axios.request(axiosRequestConfig)
      return Promise.resolve(undefined);
    } else {
      return await axios.request<T>(axiosRequestConfig);
    }
  }
}
