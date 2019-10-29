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
      url: "test-url/",
      method: "GET",
      data: {},
      headers: {}
    };
    axios.request = jest.fn().mockResolvedValue({
      data: {}
    });

    await cloudService.invoke<any>("azure-getCart", false, {  });
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
  });

  it("return data on fireAndWait", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url/",
      method: "GET",
      data: {},
      headers: {}
    };
    axios.request = jest.fn().mockResolvedValue({
      data: "Response"
    });

    const response = await cloudService.invoke<any>(
      "azure-getCart",
      false,
      {}
    );

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toEqual("Response");
  });

  it("return an empty response on fireAndForget", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url/",
      method: "GET",
      data: {},
      headers: {}
    };
    axios.request = jest.fn().mockResolvedValue({});

    const response = await cloudService.invoke<any>(
      "azure-getCart",
      true,
      {}
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

    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url/",
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
      url: "test-url/",
      method: "GET",
      data: {},
      headers: headers.toJSON()
    };
    const response = cloudService.invoke("azure-getCart", false, {  }, headers);
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

describe("buildURL", () => {

  it("should replace path params succesfully", async () => {
    const http = "foo/bar/{baz}";
    const payload = {
      baz: 1
    };

    const sut = buildURL(http, payload);

    await expect(sut).toEqual("foo/bar/1");
  });

  it("should return same http without changes", async () => {
    const http = "foo/bar/";
    const payload = {
      bar: 1
    };

    const sut = buildURL(http, payload);

    await expect(sut).toEqual("foo/bar/");
  });

  it("should thorw an error on null pathParams", async () => {
    const http = "foo/bar/{baz}";
    const error = new Error("No parameters found");

    expect(()=>buildURL(http, null)).toThrow(error);
  });
});
