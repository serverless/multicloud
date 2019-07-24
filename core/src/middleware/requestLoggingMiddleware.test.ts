import { RequestLoggingMiddleware, LoggingOptions } from "../middleware";
import { Logger, LogLevel } from "../services"
import { App, CloudContext, CloudModule, ComponentType } from "..";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";

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

  const handler = MockFactory.createMockHandler();
  const context = MockFactory.createMockCloudContext();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
    })
  }

  it("should call log twice with provided messages", async () => {
    const next = jest.fn();
    const loggingOptions = new SpecificLoggingOptions()
    await RequestLoggingMiddleware(loggingOptions)(context, next);
    expect(loggingOptions.logger.log).toBeCalledTimes(2);
    expect(loggingOptions.logger.log).toHaveBeenNthCalledWith(1, `Starting request for handler: ${loggingOptions.handlerName}`);
    expect(loggingOptions.logger.log).toHaveBeenNthCalledWith(2, `Finished request for handler: ${loggingOptions.handlerName}`);
  });

  it("call next middleware", async () => {
    const next = jest.fn();
    await RequestLoggingMiddleware(new SpecificLoggingOptions())(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("call next middleware after requestLoggingMiddleware using App", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const sut = new App(testModule);
    await sut.use([RequestLoggingMiddleware(new SpecificLoggingOptions()), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});
