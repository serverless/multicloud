import { HTTPBindingMiddleware } from "./httpBindingMiddleware";
import { ComponentType, CloudModule, CloudContext, CloudRequest, CloudResponse, App } from "..";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";

describe("HTTPBindingMiddleware should", () => {
  const cloudRequest = MockFactory.createMockCloudRequest("POST");
  const cloudResponse = MockFactory.createMockCloudResponse();
  const context = MockFactory.createMockCloudContext();

  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
      bind<CloudRequest>(ComponentType.CloudRequest).toConstantValue(cloudRequest);
      bind<CloudResponse>(ComponentType.CloudResponse).toConstantValue(cloudResponse);
    })
  }

  const handler = jest.fn();
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    context.req = null;
    context.res = null;
    context.runtime = {
      req: {},
      res: {},
    };
  });

  it("save request and response in context object", async () => {
    const app = new App(testModule);
    await app.use([HTTPBindingMiddleware()], handler)();

    expect(context.req).toEqual(cloudRequest);
    expect(context.res).toEqual(cloudResponse);
  });

  it("call next handler", async () => {
    const app = new App(testModule);
    await app.use([HTTPBindingMiddleware()], handler)();

    expect(handler).toBeCalled();
  });

  it("work with the middleware correctly", async () => {
    const spyMiddleware = jest.fn();
    const mockMiddleware = MockFactory.createMockMiddleware(spyMiddleware);
    const app = new App(testModule);

    await app.use([HTTPBindingMiddleware(), mockMiddleware], handler)();
    expect(context.req).toEqual(cloudRequest);
    expect(context.res).toEqual(cloudResponse);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("not save the cloudRequest and cloudResponse and call next if the eventType is not HTTP", async () => {
    const notHttpcontext: CloudContext = {
      providerType: "providerType",
      runtime: {
        schedule: "schedule"
      },
      send: jest.fn()
    };
    await HTTPBindingMiddleware()(notHttpcontext, next);
    expect(notHttpcontext.req).not.toEqual(cloudRequest);
    expect(notHttpcontext.res).not.toEqual(cloudResponse);
    expect(next).toHaveBeenCalled();
  });
});
