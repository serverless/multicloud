import {
  CloudService,
  ContainerResolver,
  CloudServiceOptions,
  CloudContext,
  InvokeRequest,
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

export const buildURL = (http: string, pathParams: StringParams): string => {
  let url = http;

  if (!pathParams) {
    return url;
  }

  pathParams.forEach((value, key) => {
    url = url.replace(`{${key}}`, value);
  });

  return url;
};

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
   * @param name Name of function to invoke
   * @param fireAndForget Wait for response if false (default behavior)
   * @param payload Body of HTTP request
   * @param headers Headers of the context
   * @param params StringParams with values for URL
   */
  public async invoke<T>(
    name: string,
    fireAndForget,
    payload?: any,
    headers?: StringParams,
    params?: StringParams
  ): Promise<T>;

  /**
   * @param invokeOptions invoke interface with parameters needed
   */
  public async invoke<T>(invokeOptions: InvokeRequest): Promise<T>;

  public async invoke<T>(
    dynamicParam: string | InvokeRequest,
    fireAndForgetParam?,
    payloadParam: any = null,
    headersParam: StringParams = new StringParams(),
    params: StringParams = new StringParams()
  ) {
    const {
      name,
      fireAndForget,
      payload,
      headers,
      pathParams
    } = this.GetInvokeOptions(
      dynamicParam,
      fireAndForgetParam,
      payloadParam,
      headersParam,
      params
    );

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
      url: buildURL(context.http, pathParams),
      method: context.method,
      headers: headers.toJSON()
    };

    if (context.method.toLowerCase() != "get")
      axiosRequestConfig.data = payload;

    if (fireAndForget) {
      axios.request(axiosRequestConfig);
      return Promise.resolve(undefined);
    }

    const response = await axios.request<T>(axiosRequestConfig);

    return Promise.resolve(response.data);
  }

  private GetInvokeOptions(
    dynamicParam: string | InvokeRequest,
    fireAndForgetParam?,
    payloadParam: any = null,
    headersParam: StringParams = new StringParams(),
    params: StringParams = new StringParams()
  ): InvokeRequest {
    let invokeOptions: InvokeRequest;
    if (typeof dynamicParam === "string")
      invokeOptions = {
        name: dynamicParam,
        fireAndForget: fireAndForgetParam,
        payload: payloadParam,
        headers: headersParam,
        pathParams: params
      };
    else invokeOptions = dynamicParam as InvokeRequest;

    return invokeOptions;
  }
}
