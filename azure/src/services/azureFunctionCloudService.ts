import {
  CloudService,
  ContainerResolver,
  CloudServiceOptions,
  CloudContext,
  StringParams
} from "@multicloud/sls-core";
import axios, { AxiosRequestConfig } from "axios";
import { ComponentType } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";

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
@injectable()
export class AzureFunctionCloudService implements CloudService {
  /**
   * Initialize a new Azure Function Cloud Service with the IoC container
   * @param containerResolver IoC container for service resolution
   */
  public constructor(
    @inject(ComponentType.CloudContext) context: CloudContext
  ) {
    this.containerResolver = context.container;
  }

  public containerResolver: ContainerResolver;

  /**
   *
   * @param context Request context
   * @param pathParams Object with values to add to the URL
  */
  public requestURL(context: any, pathParams?: any) {
    if(pathParams && pathParams.id) return context.http+"id/"+ pathParams.id;
    else return context.http;
  }
  /**
   *
   * @param name Name of function to invoke
   * @param fireAndForget Wait for response if false (default behavior)
   * @param payload Body of HTTP request
   */
  public async invoke<T>(
    name: string,
    fireAndForget,
    payload: any = null,
    headers: StringParams = new StringParams()
  ) {
    if (!name || name.length === 0) {
      return Promise.reject("Name is needed");
    }

    const context = this.containerResolver.resolve<AzureCloudServiceOptions>(
      name
    );
    if (!context.method || !context.http) {
      return Promise.reject("Missing Data");
    }
    const axiosRequestConfig: AxiosRequestConfig = {
      url: this.requestURL(context, payload),
      method: context.method,
      data: payload,
      headers: headers.toJSON()
    };

    if (fireAndForget) {
      axios.request(axiosRequestConfig);
      return Promise.resolve(undefined);
    }

    const response = await axios.request<T>(axiosRequestConfig);

    return Promise.resolve(response.data);
  }
}
