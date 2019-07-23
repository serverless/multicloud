import { HTTPBindingMiddleware } from "./httpBindingMiddleware";
import { ComponentType, CloudModule, CloudContext, CloudRequest, CloudResponse, App } from "..";
import { ContainerModule, interfaces } from "inversify";
import MockFactory from "../test/mockFactory";
import { Handler } from "../app";

describe("HTTPBindingMiddleware should", () => {
  const cloudContext = MockFactory.createMockCloudContext(false);
  const cloudRequest = MockFactory.createMockCloudRequest();
  const cloudResponse = MockFactory.createMockCloudResponse();

  function isHttpRequest(req: interfaces.Request) {
    const runtimeArgs = req.parentContext.container.get(ComponentType.RuntimeArgs);
    return runtimeArgs && runtimeArgs[0].isHttp;
  }

  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(cloudContext)
      bind<CloudRequest>(ComponentType.CloudRequest).toConstantValue(cloudRequest).when(isHttpRequest);
      bind<CloudResponse>(ComponentType.CloudResponse).toConstantValue(cloudResponse).when(isHttpRequest);
    })
  }

  let app: App;
  let handler: Handler;

  beforeEach(() => {
    app = new App(testModule);
    handler = jest.fn();
  })

  it("call next handler", async () => {
    await app.use([HTTPBindingMiddleware()], handler)();

    expect(handler).toBeCalled();
  });

  it("calls the next middleware in the chain", async () => {
    const spyMiddleware = jest.fn();
    const mockMiddleware = MockFactory.createMockMiddleware(spyMiddleware);

    await app.use([HTTPBindingMiddleware(), mockMiddleware], handler)();
    expect(spyMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("sets the cloudRequest and cloudResponse during HTTP requests", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.req).not.toBeNull();
      expect(context.res).not.toBeNull();

      await next();
    });

    await app.use([HTTPBindingMiddleware(), testMiddleware], handler)({ isHttp: true }, {});
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });

  it("does not set the cloudRequest and cloudResponse and call next if the eventType is not HTTP", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.req).toBeNull();
      expect(context.res).toBeNull();

      await next();
    });

    await app.use([HTTPBindingMiddleware(), testMiddleware], handler)({ isHttp: false }, {});
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });
});
