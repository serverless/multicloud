import { CloudService, ContainerResolver, CloudServiceOptions, CloudContext, ComponentType } from "@multicloud/sls-core";
import axios, { AxiosRequestConfig, Method } from "axios";
import { injectable, inject } from "inversify";


/**
 * Options for invocation of GCP function
 */
export interface GcpCloudServiceOptions extends CloudServiceOptions {
  /** Name of function to invoke */
  name: string;
  /** HTTP method of invocation */
  method: Method;
  /** URL for invocation */
  http: string;
}

/**
 * Implementation of Cloud Service for GCP Functions. Invokes Functions
 * with exposed HTTP endpoints
 */
@injectable()
export class GcpFunctionCloudService implements CloudService {
  public constructor(@inject(ComponentType.CloudContext) context: CloudContext) {
    this.containerResolver = context.container;
  }

  public containerResolver: ContainerResolver;

  /**
   *
   * @param name Name of function to invoke
   * @param fireAndForget Wait for response if false (default behavior)
   * @param payload Body of HTTP request
   */
  public async invoke<T>(name: string, fireAndForget: boolean = false, payload: any = null) {
    if (!name || name.length === 0) {
      throw Error("Name is needed");
    }

    const context = this.containerResolver.resolve<GcpCloudServiceOptions>(name);
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
