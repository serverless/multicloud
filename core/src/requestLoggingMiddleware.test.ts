import {
  RequestLoggingMiddleware,
  LoggingOptions
} from "./requestLoggingMiddleware";
import { Logger, LogLevel } from "./logger"
import { CloudContext } from "./cloudContext";
import { App } from "./middleware";
import { ContainerResolver, ContainerRegister } from "./cloudContainer"

describe("requestLoggingServiceMiddleware should", () => {
  class LoggerConsole implements Logger {
    public constructor(logLevel: LogLevel) {
      this.logLevel = logLevel;
    }

    public logLevel: LogLevel;

    public log = jest.fn();

    public info = jest.fn();

    public warn = jest.fn();

    public error = jest.fn();
  }

  class SpecificLoggingOptions implements LoggingOptions {
    public logger = new LoggerConsole(LogLevel.LOG);
    public handlerName = "GET cartAPI";
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("should call log twice with provided messages", async () => {
    const next = jest.fn();
    const loggingOptions = new SpecificLoggingOptions()
    await RequestLoggingMiddleware(loggingOptions)(context, next);
    expect(loggingOptions.logger.log).toHaveBeenCalledTimes(2);
    expect(loggingOptions.logger.log).toHaveBeenNthCalledWith(1, `Starting request for handler: ${loggingOptions.handlerName}`);
    expect(loggingOptions.logger.log).toHaveBeenCalledTimes(2, `Finished request for handler: ${loggingOptions.handlerName}`);
  });

  it("call next middleware", async() => {
    const next = jest.fn();
    await RequestLoggingMiddleware(new SpecificLoggingOptions())(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("call next middleware after requestLoggingMiddleware using App", async () => {
    const spyMiddleware = jest.fn();
    const spyHandler = jest.fn();

    const sut = new App(resolver);
    await sut.use(
      [RequestLoggingMiddleware(new SpecificLoggingOptions()), middlewareFoo(spyMiddleware)],
      handler(spyHandler)
    )(context);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(spyHandler).toHaveBeenCalled();
  });
});
