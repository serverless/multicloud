import axios, { AxiosRequestConfig } from "axios";
import {
  ContainerResolver,
  CloudContainer,
  CloudService,
  StringParams
} from "@multicloud/sls-core";
import { AzureFunctionCloudService, AzureCloudServiceOptions, buildURL } from ".";

const getCartAzureCloudService: AzureCloudServiceOptions = {
  name: "azure-getCart",
  http: "test-url/",
  method: "GET"
};

describe("Azure Cloud Service should", () => {
  let container: CloudContainer;
  let cloudService: CloudService;
  let context;
  let axiosRequestConfig: AxiosRequestConfig;


  beforeEach(() => {
    jest.clearAllMocks();

    axiosRequestConfig = {
      url: "test-url/",
      method: "GET",
      data: null,
      headers: {}
    };

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
    axios.request = jest.fn().mockResolvedValue({
      data: {}
    });

    await cloudService.invoke<any>("azure-getCart", false);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
  });

  it("return data on fireAndWait", async () => {
    axios.request = jest.fn().mockResolvedValue({
      data: "Response"
    });

    const response = await cloudService.invoke<any>(
      "azure-getCart",
      false
    );

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toEqual("Response");
  });

  it("return an empty response on fireAndForget", async () => {
    axios.request = jest.fn().mockResolvedValue({});

    const response = await cloudService.invoke<any>(
      "azure-getCart",
      true,
    );

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toBeUndefined();
  });

  it("return an error if no name is passed", async () => {
    await expect(cloudService.invoke<any>(null, true)).rejects.toMatch("Name is needed");
  });

  it("makes request with payload when defined", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const payload = {
      a: 1
    };

    const axiosRequestConfigPayload: AxiosRequestConfig = {
      ...axiosRequestConfig,
      data: payload
    };

    const response = cloudService.invoke("azure-getCart", false, payload);
    expect(axios.request).toBeCalledWith(axiosRequestConfigPayload);
    expect(response).not.toBeNull();
  });


  it("makes request with url params when defined", async () => {
    const getCartAzureCloudServiceWithUrl: AzureCloudServiceOptions = {
      name: "azure-getCart-url",
      http: "test-url/{store}/{id}",
      method: "GET"
    };
    container
      .bind(getCartAzureCloudServiceWithUrl.name)
      .toConstantValue(getCartAzureCloudServiceWithUrl);

    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));;
    const params = new StringParams({
      id: 1,
      item: "buu",
      store: "fuu"
    });

    const axiosRequestConfigURL: AxiosRequestConfig = {
      ...axiosRequestConfig,
      url: "test-url/fuu/1",
    };

    await cloudService.invoke("azure-getCart-url", false, null, new StringParams(), params);
    expect(axios.request).toBeCalledWith(axiosRequestConfigURL);
  });

  it("makes request with headers when defined", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const headers = new StringParams({ key: 123 });

    const axiosRequestConfigKey: AxiosRequestConfig = {
      ...axiosRequestConfig,
      headers: headers.toJSON()
    };
    const response = cloudService.invoke("azure-getCart", false, null, headers);
    expect(axios.request).toBeCalledWith(axiosRequestConfigKey);
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

describe("buildURL", () => {

  it("should replace path params succesfully", async () => {
    const http = "foo/bar/{baz}/{id}";
    const params = new StringParams({
      id: 8,
      fuu: 32,
      baz: "faa"
    });

    const sut = buildURL(http, params);

    await expect(sut).toEqual("foo/bar/faa/8");
  });

  it("should return same http without changes", async () => {
    const http = "foo/bar/";

    const sut = buildURL(http, null);

    await expect(sut).toEqual("foo/bar/");
  });

  it("should return same http without a data object in params", async () => {
    const http = "foo/bar/";
    const params = new StringParams({
      data:{}
    });

    const sut = buildURL(http, params);

    await expect(sut).toEqual("foo/bar/");
  });

});
