import { HTTPBindingMiddleware } from "./httpBindingMiddleware";
import { ComponentType, CloudContainer } from "./cloudContainer";
import { CloudContext } from "./cloudContext";
import { CloudRequest } from "./cloudRequest";
import { CloudResponse } from "./cloudResponse";
import { App } from "./middleware";

describe("HTTPBindingMiddleware should", () => {
  const context: CloudContext = {
    providerType: "providerType",
    req: {
      method: "method"
    },
    send: jest.fn(),
    res: {
      headers: {
        header1: "test"
      },
      send: jest.fn()
    },
    runtime : {
      req: "test request",
      res: "test response"
    }
  };

  class CloudContextModule implements CloudModule {
    public init(container: Container) {
      container.bind(ComponentType.CloudContext).toConstantValue(context);
    }
  }

  const cloudRequest: CloudRequest = {
    method: "POST"
  };

  class CloudRequestModule implements CloudModule {
    public init(container: Container) {
      container.bind(ComponentType.CloudRequest).toConstantValue(cloudRequest);
    }
  }

  const cloudResponse: CloudResponse = {
    send: jest.fn()
  };

  class CloudResponseModule implements CloudModule {
    public init(container: Container) {
      container.bind(ComponentType.CloudResponse).toConstantValue(cloudResponse);
    }
  }

  const container = new CloudContainer();
  container.registerModule(new CloudRequestModule());
  container.registerModule(new CloudResponseModule());
  container.registerModule(new CloudContextModule());

  const middlewareFoo = (spy: Function) => async (
    _: CloudContext,
    next: Function
  ): Promise<void> => {
    spy();
    await next();
  };

  const handler = (spy: Function) => (): Promise<void> => {
    spy();
    return Promise.resolve();
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("save request and response in context object", async () => {
    await HTTPBindingMiddleware(container)(context, next);
    expect(context.req).toEqual(cloudRequest);
    expect(context.res).toEqual(cloudResponse);
  });

  it("call next handler", async () => {
    await HTTPBindingMiddleware(container)(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("work with the middleware correctly", async () => {
    const spyMiddleware = jest.fn();
    const spyHandler = jest.fn();
    const sut = new App(container);

    await sut.use(
      [HTTPBindingMiddleware(container), middlewareFoo(spyMiddleware)],
      handler(spyHandler)
    )(context);
    expect(context.req).toEqual(cloudRequest);
    expect(context.res).toEqual(cloudResponse);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(spyHandler).toHaveBeenCalled();
  });

  it("not save the cloudRequest and cloudResponse and call next if the eventType is not HTTP", async () => {
    const notHttpcontext: CloudContext = {
      providerType: "providerType",
      runtime: {
        schedule: "schedule"
      },
      send: jest.fn()
    };
    await HTTPBindingMiddleware(container)(notHttpcontext, next);
    expect(notHttpcontext.req).not.toEqual(cloudRequest);
    expect(notHttpcontext.res).not.toEqual(cloudResponse);
    expect(next).toHaveBeenCalled();
  });
});
