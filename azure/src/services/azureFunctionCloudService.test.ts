import axios, { AxiosRequestConfig } from "axios";
import {
  ContainerResolver,
  CloudContainer,
  CloudService,
  InvokeRequest,
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

    const params: InvokeRequest = {
      name: "azure-getCart",
      fireAndForget: false,
      payload: null,
      headers: new StringParams()
    };
    await cloudService.invoke<any>(params);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
  });

  it("return data on fireAndWait", async () => {
    axios.request = jest.fn().mockResolvedValue({
      data: "Response"
    });

    const params: InvokeRequest = {
      name: "azure-getCart",
      fireAndForget: false,
      payload: null,
      headers: new StringParams()
    };
    const response = await cloudService.invoke(params);

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toEqual("Response");
  });

  it("return an empty response on fireAndForget", async () => {
    axios.request = jest.fn().mockResolvedValue({});

    const params: InvokeRequest = {
      name: "azure-getCart",
      fireAndForget: true,
      payload: null,
      headers: new StringParams()
    };
    const response = await cloudService.invoke(params);

    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toBeUndefined();
  });

  it("return an error if no name is passed", async () => {
    const params: InvokeRequest = {
      name: null,
      fireAndForget: false,
      payload: null,
      headers: new StringParams()
    };
    await expect(cloudService.invoke(params)).rejects.toMatch("Name is needed");
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

    const params: InvokeRequest = {
      name: "azure-getCart",
      fireAndForget: false,
      payload: payload,
      headers: new StringParams()
    };
    const response = await cloudService.invoke(params);
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
    const pathParams = new StringParams({
      id: 1,
      item: "buu",
      store: "fuu"
    });

    const axiosRequestConfigURL: AxiosRequestConfig = {
      ...axiosRequestConfig,
      url: "test-url/fuu/1",
    };

    const params: InvokeRequest = {
      name: "azure-getCart-url",
      fireAndForget: false,
      payload: null,
      headers: new StringParams(),
      pathParams: pathParams
    };
    await cloudService.invoke(params);
    expect(axios.request).toBeCalledWith(axiosRequestConfigURL);
  });

  it("makes request with headers when defined", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const headers = new StringParams({ key: 123 });

    const axiosRequestConfigKey: AxiosRequestConfig = {
      ...axiosRequestConfig,
      headers: headers.toJSON()
    };

    const params: InvokeRequest = {
      name: "azure-getCart",
      fireAndForget: false,
      payload: null,
      headers: headers
    };
    const response = await cloudService.invoke(params);
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
    const params: InvokeRequest = {
      name: "azure-getCart",
      fireAndForget: true,
      payload: null,
      headers: new StringParams()
    };
    await expect(sut.invoke(params)).rejects.toMatch("Missing Data")
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
