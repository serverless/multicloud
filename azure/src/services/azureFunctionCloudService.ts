import { CloudService, ContainerResolver, CloudServiceOptions } from "@multicloud/sls-core";
import axios, { AxiosRequestConfig } from "axios";

export interface AzureCloudServiceOptions extends CloudServiceOptions {
  name: string;
  method: string;
  http: string;
}

export class AzureFunctionCloudService implements CloudService {
  public constructor(private containerResolver: ContainerResolver) { }

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
