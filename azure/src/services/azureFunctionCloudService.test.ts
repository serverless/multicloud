import axios, { AxiosRequestConfig } from "axios";
import {
  ContainerResolver,
  CloudContainer,
  CloudService,
  StringParams
} from "@multicloud/sls-core";
import { AzureFunctionCloudService, AzureCloudServiceOptions } from ".";

const getCartAzureCloudService: AzureCloudServiceOptions = {
  name: "azure-getCart",
  http: "http://test-url/",
  method: "GET"
};

describe("Azure Cloud Service should", () => {
  let container: CloudContainer;
  let cloudService: CloudService;
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    container = new CloudContainer();
    context = {
      container
    };
    cloudService = new AzureFunctionCloudService(context);
    container
      .bind(getCartAzureCloudService.name)
      .toConstantValue(getCartAzureCloudService);
  });

  it("call axios.request with the configuration", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "http://test-url/id/123",
      method: "GET",
      data: { "id": 123 },
      headers: {}
    };
    axios.request = jest.fn().mockResolvedValue({
      data: {}
    });

    await cloudService.invoke<any>("azure-getCart", false, { "id": 123 });
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
  });

  it("return data on fireAndWait", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "http://test-url/id/123",
      method: "GET",
      data: { "id": 123 },
      headers: {}
    };
    axios.request = jest.fn().mockResolvedValue({
      data: "Response"
    });

    const response = await cloudService.invoke<any>(
      "azure-getCart",
      false,
      { "id": 123 }
    );

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toEqual("Response");
  });

  it("return an empty response on fireAndForget", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "http://test-url/id/123",
      method: "GET",
      data: { "id": 123 },
      headers: {}
    };
    axios.request = jest.fn().mockResolvedValue({});

    const response = await cloudService.invoke<any>(
      "azure-getCart",
      true,
      { "id": 123 }
    );

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toBeUndefined();
  });

  it("return an error if no name is passed", async () => {
    await expect(cloudService.invoke<any>(null, true)).rejects.toMatch("Name is needed");
  });

  it("makes request with payload when defined with store_id", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const payload = {
      a: 1,
      "id": 123
    };

    const axiosRequestConfig: AxiosRequestConfig = {
      url: "http://test-url/id/123",
      method: "GET",
      data: payload,
      headers: {}
    };

    const response = cloudService.invoke("azure-getCart", false, payload);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).not.toBeNull();
  });

  it("makes request with payload when defined without store_id", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const payload = {
      a: 1
    };

    const axiosRequestConfig: AxiosRequestConfig = {
      url: "http://test-url/",
      method: "GET",
      data: payload,
      headers: {}
    };

    const response = cloudService.invoke("azure-getCart", false, payload);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).not.toBeNull();
  });

  it("makes request with headers when defined", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const headers = new StringParams({ key: 123 });

    const axiosRequestConfig: AxiosRequestConfig = {
      url: "http://test-url/id/123",
      method: "GET",
      data: { "id": 123 },
      headers: headers.toJSON()
    };
    const response = cloudService.invoke("azure-getCart", false, { "id": 123 }, headers);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).not.toBeNull();
  });

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
    };
    context.container = newResolver;
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));

    const sut = new AzureFunctionCloudService(context);
    await expect(sut.invoke<any>("azure-getCart", true)).rejects.toMatch("Missing Data")
  });
});
