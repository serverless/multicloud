import { CloudContext, App, CloudModule, ComponentType } from "..";
import { ExceptionMiddleware, ExceptionOptions } from "../middleware";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";

describe("Tests of ExceptionMiddleware should", () => {
  let options: ExceptionOptions = {
    log: jest.fn()
  };

  const handler = MockFactory.createMockHandler();
  const context = MockFactory.createMockCloudContext();
  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
    })
  }

  const errorStatus = 500;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("catch exception and log error", async () => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);

    const failHandler = MockFactory.createMockHandler(() => {
      throw error;
    });

    const app = new App(testModule);
    await app.use([ExceptionMiddleware(options)], failHandler)();
    expect(options.log).toHaveBeenCalledWith(error);
    expect(context.send).toHaveBeenCalledWith(error, errorStatus);
  });

  it("call next without calling exception or logging", async () => {
    const next = jest.fn(() => Promise.resolve());
    await ExceptionMiddleware(options)(context, next);
    expect(next).toHaveBeenCalled();
    expect(options.log).not.toHaveBeenCalled();
    expect(context.send).not.toHaveBeenCalled();
  });

  it("call next middleware after exceptionMiddleware using App", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const app = new App(testModule);
    await app.use([ExceptionMiddleware(options), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("call next middleware and receive error, call exception and log error", async () => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);

    const failNext = () => {
      throw error;
    };
    const mockMiddleware = MockFactory.createMockMiddleware(failNext);

    const app = new App(testModule);
    await app.use([ExceptionMiddleware(options), mockMiddleware], handler)();
    expect(context.send).toHaveBeenCalledWith(error, errorStatus);
    expect(options.log).toHaveBeenCalledWith(error);
  });

  it("catches and logs errors when promise is rejected in handler", async () => {
    const app = new App(testModule);
    const errorMessage = "promise rejected";
    const failHandler = MockFactory.createMockHandler(() => {
      return Promise.reject(errorMessage);
    });

    await app.use([ExceptionMiddleware(options)], failHandler)();

    expect(context.send).toBeCalledWith(errorMessage, 500);
    expect(options.log).toBeCalledWith(errorMessage);
  });

  it("catches and logs error when promise is rejected in other middleware", async () => {
    const app = new App(testModule);
    const errorMessage = "promise rejected";
    const handler = MockFactory.createMockHandler();
    const failMiddleware = MockFactory.createMockMiddleware(() => {
      return Promise.reject(errorMessage);
    });

    await app.use([ExceptionMiddleware(options), failMiddleware], handler)();

    expect(context.send).toBeCalledWith(errorMessage, 500);
    expect(options.log).toBeCalledWith(errorMessage);
  });
});
