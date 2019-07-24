import { App } from "./app";
import { CloudContext } from "./cloudContext";
import { CloudModule, ComponentType } from ".";
import { ContainerModule } from "inversify";
import MockFactory from "./test/mockFactory"

const errorMiddleware = (spy: Function) => async (
  context: CloudContext
): Promise<void> => {
  spy();
  context.send({ error: "Boh!!!!!" }, 400);
};

const handler = MockFactory.createMockHandler();
const context: CloudContext = MockFactory.createMockCloudContext(false);

const testModule: CloudModule = {
  create: () => new ContainerModule((bind) => {
    bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
  })
}

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("when use start middleware chain", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const app = new App(testModule);
    await app.use([mockMiddleware], handler)();
    expect(mockMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });

  it("when empty middlewares call handler", async () => {
    const app = new App(testModule);
    await app.use([], handler)();
    expect(handler).toBeCalled();
  });

  it("not call handler when middleware complete execution", async () => {
    const spyError = jest.fn();
    const app = new App(testModule);

    await app.use([errorMiddleware(spyError)], handler)();
    expect(spyError).toBeCalled();
    expect(handler).not.toBeCalled();
  });

  it("can accept multiple requests and rebind arguments", async () => {
    const app = new App(testModule);
    const runtimeArgs1 = [
      "arg1",
      "arg2",
    ];

    const runtimeArgs2 = [
      "arg1",
      "arg2",
      "arg3",
    ];

    await app.use([], handler)(runtimeArgs1[0], runtimeArgs1[1]);
    await app.use([], handler)(runtimeArgs2[0], runtimeArgs2[1], runtimeArgs2[2]);

    expect(handler).toBeCalledTimes(2);
  });

  it("handler can run with callbacks", async () => {
    const sendSpy = jest.spyOn(context, "send");
    const spy = jest.fn();
    const app = new App(testModule);

    const handler = (context: CloudContext) => {
      MockFactory.simulateCallback(null, () => {
        MockFactory.simulateCallback(null, () => {
          spy();
          context.send("callback", 200);
        });
      })
    };

    await app.use([], handler)();
    expect(spy).toBeCalled();
    expect(sendSpy).toBeCalledWith("callback", 200);
  });

  it("handler can run with promises", async () => {
    const sendSpy = jest.spyOn(context, "send");
    const spy = jest.fn();
    const app = new App(testModule);

    const handler = async (context: CloudContext) => {
      await MockFactory.simulatePromise();
      await MockFactory.simulatePromise();
      spy();
      context.send("promise", 200);
    };

    await app.use([], handler)();
    expect(spy).toBeCalled();
    expect(sendSpy).toBeCalledWith("promise", 200);
  });

  it("handler can run and return void", async () => {
    const sendSpy = jest.spyOn(context, "send");
    const spy = jest.fn();
    const app = new App(testModule);

    const handler = async (context: CloudContext) => {
      spy();
      context.send("void", 200);
    };

    await app.use([], handler)();
    expect(spy).toBeCalled();
    expect(sendSpy).toBeCalledWith("void", 200);
  });

  it("unwraps all post-middleware calls successfully", async () => {
    const app = new App(testModule);
    const handler = MockFactory.createMockHandler();
    const postHandlerSpy = jest.fn();

    const postHandlerMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      await next();
      postHandlerSpy();
    });

    await app.use([postHandlerMiddleware], handler)();

    expect(postHandlerSpy).toBeCalled();
  });
});
