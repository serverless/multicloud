import { App } from "..";
import { ExceptionMiddleware, ExceptionOptions } from "../middleware";
import MockFactory from "../test/mockFactory";
import { TestModule, TestContext } from "../test/mocks";

describe("Tests of ExceptionMiddleware should", () => {
  let options: ExceptionOptions = {
    log: jest.fn()
  };

  const handler = MockFactory.createMockHandler();
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
    const sendSpy = jest.spyOn(TestContext.prototype, "send");
    const app = new App(new TestModule());
    await app.use([ExceptionMiddleware(options)], failHandler)();
    expect(options.log).toHaveBeenCalledWith(error);
    expect(sendSpy).toHaveBeenCalledWith(error, errorStatus);
  });

  it("call next without calling exception or logging", async () => {
    const context = new TestContext();
    const next = jest.fn(() => Promise.resolve());
    await ExceptionMiddleware(options)(context, next);
    expect(next).toHaveBeenCalled();
    expect(options.log).not.toHaveBeenCalled();
    expect(context.send).not.toHaveBeenCalled();
  });

  it("call next middleware after exceptionMiddleware using App", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const app = new App(new TestModule());
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

    const sendSpy = jest.spyOn(TestContext.prototype, "send");
    const app = new App(new TestModule());
    await app.use([ExceptionMiddleware(options), mockMiddleware], handler)();
    expect(sendSpy).toHaveBeenCalledWith(error, errorStatus);
    expect(options.log).toHaveBeenCalledWith(error);
  });

  it("catches and logs errors when promise is rejected in handler", async () => {
    const sendSpy = jest.spyOn(TestContext.prototype, "send");
    const app = new App(new TestModule());
    const errorMessage = "promise rejected";
    const failHandler = MockFactory.createMockHandler(() => {
      return Promise.reject(errorMessage);
    });

    await app.use([ExceptionMiddleware(options)], failHandler)();

    expect(sendSpy).toBeCalledWith(errorMessage, 500);
    expect(options.log).toBeCalledWith(errorMessage);
  });

  it("catches and logs error when promise is rejected in other middleware", async () => {
    const sendSpy = jest.spyOn(TestContext.prototype, "send");
    const app = new App(new TestModule());
    const errorMessage = "promise rejected";
    const handler = MockFactory.createMockHandler();
    const failMiddleware = MockFactory.createMockMiddleware(() => {
      return Promise.reject(errorMessage);
    });

    await app.use([ExceptionMiddleware(options), failMiddleware], handler)();

    expect(sendSpy).toBeCalledWith(errorMessage, 500);
    expect(options.log).toBeCalledWith(errorMessage);
  });
});
