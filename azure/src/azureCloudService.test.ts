import {ContainerResolver} from "@multicloud/sls-core"
import {AzureFunctionCloudService} from "./AzureFunctionCloudService";
import { AzureCloudServiceOptions } from "./azureCloudServiceOptions";
import axios, { AxiosRequestConfig } from "axios";

jest.mock("axios");

class GetCartAzureCloudServiceContext implements AzureCloudServiceOptions {
  public name = "azure-getCart";
  public http = "test-url";
  public method = "Get";
}

const resolver: ContainerResolver = {
  resolve: <T>(): T => {
    return (new GetCartAzureCloudServiceContext() as unknown) as T;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Azure Cloud Service should", () => {
  it("call axios.request with the configuration", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "Get"
    };
    axios.request = jest.fn().mockReturnValue(Promise.resolve());
    const sut = new AzureFunctionCloudService(resolver);
    await sut.invoke<Promise<any>>("azure-getCart", {}, false);
    expect(axios.request).toHaveBeenCalledWith(axiosRequestConfig);
  })

  it("return data on fireAndWait", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "Get"
    };
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const sut = new AzureFunctionCloudService(resolver);
    const response = await sut.invoke<Promise<any>>("azure-getCart", {}, false);
    expect(axios.request).toHaveBeenCalledWith(axiosRequestConfig);
    expect(response).toEqual("Response");
  })

  it("return an empty response on fireAndForget", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "Get"
    };
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const sut = new AzureFunctionCloudService(resolver);
    const response = await sut.invoke<Promise<any>>("azure-getCart", {}, true);
    expect(axios.request).toHaveBeenCalledWith(axiosRequestConfig);
    expect(response).toBeUndefined();
  })

  it("return an error if no name is passed", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const sut = new AzureFunctionCloudService(resolver);
    try {
      await sut.invoke<Promise<any>>(null, {}, true);
    } catch (err) {
      expect(err).toEqual(Error("Name is needed"));
    }
  })

  it("return an error if no URL or Method is passed", async () => {
    class EmptyContainer implements AzureCloudServiceOptions {
      public name = undefined;
      public http = undefined;
      public method = undefined;
    }

    const newResolver: ContainerResolver = {
      resolve: <T>(): T => {
        return (EmptyContainer as unknown) as T;
      }
    }
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const sut = new AzureFunctionCloudService(newResolver);
    try {
      await sut.invoke<Promise<any>>("azure-getCart", {}, true);
    } catch (err) {
      expect(err).toEqual(Error("Missing Data"));
    }
  })
})
