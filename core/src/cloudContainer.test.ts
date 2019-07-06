import {
  CloudContainer,
  CloudModule,
  CoreModule,
  ComponentType
} from "./cloudContainer";

import { Container, injectable, inject } from "inversify";
import { CloudContext } from "./cloudContext";
import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";

@injectable()
export class TestCloudContext implements CloudContext {
  public constructor(@inject("RuntimeArgs") public args: any[]) {}

  public providerType: string = "AzureCustom";

  public send(body: any, statusCode: number) {
    console.log(statusCode, body);
  }
}

@injectable()
export class TestRequest implements CloudRequest {
  public constructor(
    @inject(ComponentType.CloudContext) private context: CloudContext
  ) {}

  public body?: any;
  public headers?: { [key: string]: any };
  public method: string = "POST";
  public query?: { [key: string]: any };
}

@injectable()
export class TestResponse implements CloudResponse {
  public constructor(
    @inject(ComponentType.CloudContext) private context: CloudContext
  ) {}
  public headers?: { [key: string]: any };
  public send: (
    body: any,
    status: number,
    callback?: Function
  ) => void = jest.fn();
}

const createTestModule = (): CloudModule => {
  return {
    init: (container: Container) => {
      container
        .bind<CloudContext>(ComponentType.CloudContext)
        .to(TestCloudContext)
        .inSingletonScope();

      container
        .bind<CloudRequest>(ComponentType.CloudRequest)
        .to(TestRequest)
        .inSingletonScope();

      container
        .bind<CloudResponse>(ComponentType.CloudResponse)
        .to(TestResponse)
        .inSingletonScope();
    }
  };
};

describe("Core Module", () => {
  let sut: CloudContainer = undefined;
  let context: TestCloudContext = undefined;
  const params: any[] = [
    {
      id: "123"
    }
  ];
  beforeEach(() => {
    sut = new CloudContainer();
    sut.registerModule(createTestModule());
    sut.registerModule(new CoreModule(params));
    context = sut.resolve<CloudContext>(
      ComponentType.CloudContext
    ) as TestCloudContext;
  });

  it("resolves CloudContextProvider", () => {
    expect(context).not.toBeNull();
  });

  it("resolves CloudContext using args in ctor and CloudContextProvider", () => {
    expect(context.args).toBe(params);
  });

  it("resolves request", () => {
    const request = sut.resolve<CloudRequest>(ComponentType.CloudRequest);

    expect(request).toBeInstanceOf(TestRequest);
  });

  it("resolves response", () => {
    const response = sut.resolve<CloudResponse>(ComponentType.CloudResponse);

    expect(response).toBeInstanceOf(TestResponse);
  });
});

describe("Cloud container", () => {
  let sut: CloudContainer = undefined;

  beforeEach(() => {
    sut = new CloudContainer();
  });

  it("call module init with container", () => {
    const mock: CloudModule = {
      init: jest.fn()
    };

    sut.registerModule(mock);
    expect(mock.init).toHaveBeenCalled();
  });

  it("retrieves instance", () => {
    const object = { hello: "world" };

    const mockModule: CloudModule = {
      init: (container: Container) => {
        container.bind("test").toConstantValue(object);
      }
    };

    sut.registerModule(mockModule);
    const result = sut.resolve("test");
    expect(result).toBe(object);
  });

  it("fail when empty identifier", () => {
    const err = "service identifier cannot be empty or undefined";
    expect(() => sut.resolve("")).toThrow(err);
    expect(() => sut.resolve(undefined)).toThrow(err);
  });
});
