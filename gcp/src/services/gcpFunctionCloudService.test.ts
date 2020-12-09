import axios, { AxiosRequestConfig } from "axios";
import { ContainerResolver, CloudContainer, CloudService } from "@multicloud/sls-core";
import { GcpFunctionCloudService, GcpCloudServiceOptions } from ".";

const getCartGcpCloudService: GcpCloudServiceOptions = {
  name: "gcp-getCart",
  http: "test-url",
  method: "GET",
};

describe("Google Cloud Service should", () => {
  let container: CloudContainer;
  let cloudService: CloudService;
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    container = new CloudContainer();
    context = {
      container
    }
    cloudService = new GcpFunctionCloudService(context);
    container.bind(getCartGcpCloudService.name).toConstantValue(getCartGcpCloudService);
  });

  it("call axios.request with the configuration", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "GET",
      data: null,
    };
    axios.request = jest.fn().mockReturnValue(Promise.resolve());
    await cloudService.invoke<Promise<any>>("gcp-getCart");
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
  });

  it("return data on fireAndWait", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "GET",
      data: null,
    };
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const response = await cloudService.invoke<Promise<any>>("gcp-getCart");
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toEqual("Response");
  });

  it("return an empty response on fireAndForget", async () => {
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "GET",
      data: null,
    };
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const response = await cloudService.invoke<Promise<any>>("gcp-getCart", true);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).toBeUndefined();
  });

  it("return an error if no name is passed", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    try {
      await cloudService.invoke<Promise<any>>(null, true);
    } catch (err) {
      expect(err).toEqual(Error("Name is needed"));
    }
  });

  it("makes request with payload when defined", async () => {
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const payload = {
      a: 1
    };
    const axiosRequestConfig: AxiosRequestConfig = {
      url: "test-url",
      method: "GET",
      data: payload,
    };
    const response = cloudService.invoke("gcp-getCart", false, payload);
    expect(axios.request).toBeCalledWith(axiosRequestConfig);
    expect(response).not.toBeNull();
  });

  it("return an error if no URL or Method is passed", async () => {
    class EmptyContainer implements GcpCloudServiceOptions {
      public name = undefined;
      public http = undefined;
      public method = undefined;
    }

    const newResolver: ContainerResolver = {
      resolve: <T>(): T => {
        return (EmptyContainer as unknown) as T;
      }
    }
    context.container = newResolver;
    axios.request = jest.fn().mockReturnValue(Promise.resolve("Response"));
    const sut = new GcpFunctionCloudService(context);
    try {
      await sut.invoke<Promise<any>>("gcp-getCart", true);
    } catch (err) {
      expect(err).toEqual(Error("Missing Data"));
    }
  });
});
