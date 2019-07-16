import { CloudService, ContainerResolver } from "@multicloud/sls-core";
import { AzureCloudServiceOptions } from "./azureCloudServiceOptions";
import axios, { AxiosRequestConfig } from "axios";

export class AzureFunctionCloudService implements CloudService {
  public constructor(private containerResolver: ContainerResolver) {}

  public invoke<T>(name: string, payload: any, fireAndForget = false) {
    if (!name || name.length === 0)
      throw Error("Name is needed");
    const context = this.containerResolver.resolve<AzureCloudServiceOptions>(name);
    if (!context.method || !context.http) {
      throw Error("Missing Data");
    }
    const axiosRequestConfig: AxiosRequestConfig = {
      url: context.http,
      method: context.method
    };
    if (fireAndForget) {
      axios.request(axiosRequestConfig)
      return (Promise.resolve() as unknown) as T;
    } else {
      return (axios.request(axiosRequestConfig) as unknown) as T;
    }
  }
}
