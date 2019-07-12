import { LoggingServiceMiddleware } from "./loggingServiceMiddleware";
import { CloudContext } from "./cloudContext";
import { App } from "./middleware";
import { ContainerResolver, ContainerRegister } from "./cloudContainer";
import { Logger, LogLevel, ConsoleLogger } from "./logger";

describe("LoggingServiceMiddleware should", () => {

  class LoggerConsole implements Logger {
    public constructor(logLevel: LogLevel) {
      this.logLevel = logLevel;
    }

    public logLevel: LogLevel;

    public log = jest.fn();

    public info = jest.fn();

    public error = jest.fn();

    public warn = jest.fn();
  }

  const context: CloudContext = {
    providerType: "providerType",
    send: jest.fn()
  };

  let resolver: ContainerResolver & ContainerRegister = {
    resolve: <T>(): T => {
      return ({
        send: context.send
      } as unknown) as T;
    },
    registerModule: <T>(): T => {
      return ({
        send: context.send
      } as unknown) as T;
    }
  };

  const logger = new LoggerConsole(LogLevel.LOG);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const middlewareFoo = () => async (
    context: CloudContext,
    next: Function
  ): Promise<void> => {
    context.logger.log("test message");
    await next();
  };

  const handler = (spy: Function) => (): Promise<void> => {
    spy();
    return Promise.resolve();
  };

  it("save the Logger in context.logger", async() => {
    const next = jest.fn();
    await LoggingServiceMiddleware(logger)(context, next);
    expect(context.logger).toEqual(logger);
  });

  it("save the defaultLogger in context.logger", async() => {
    const next = jest.fn();
    await LoggingServiceMiddleware(null)(context, next);
    expect(context.logger).toBeInstanceOf(ConsoleLogger);
  });

  it("call next middleware", async() => {
    const next = jest.fn();
    await LoggingServiceMiddleware(logger)(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("save the logger in context and be used from the next middleware", async() => {
    const spyHandler = jest.fn();

    const sut = new App(resolver);
    await sut.use([LoggingServiceMiddleware(logger), middlewareFoo()],handler(spyHandler))(context);

    expect(context.logger).toEqual(logger);
    expect(context.logger.log).toHaveBeenCalledWith("test message");
    expect(spyHandler).toHaveBeenCalled();
  });

  it("save the logger in the middleware after the execution of the first middleware", async() => {
    const spyHandler = jest.fn();
    const sut = new App(resolver);

    await expect(sut.use([middlewareFoo(), LoggingServiceMiddleware(logger)], handler(spyHandler))(context)).rejects.toThrow(TypeError)
  });

});
