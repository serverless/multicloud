import { MockFactory } from "../test/mockFactory";
import { TestContext } from "../test/testContext";
import { Logger, LogLevel } from "../services/logger";
import { RequestLoggingMiddleware, LoggingOptions } from "./requestLoggingMiddleware";
import { App } from "../app";

describe("requestLoggingServiceMiddleware should", () => {
  class TestLogger implements Logger {
    public constructor(logLevel: LogLevel) {
      this.logLevel = logLevel;
    }

    public logLevel: LogLevel;
    public log = jest.fn();
    public info = jest.fn();
    public error = jest.fn();
    public warn = jest.fn();
    public debug = jest.fn();
    public trace = jest.fn();
  }

  const loggingOptions: LoggingOptions = {
    logger: new TestLogger(LogLevel.VERBOSE),
    handlerName: "GET myAPI",
  }

  const handler = MockFactory.createMockHandler();
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    context = new TestContext();
  });

  it("should call log twice with provided messages", async () => {
    const next = jest.fn();
    await RequestLoggingMiddleware(loggingOptions)(context, next);
    expect(loggingOptions.logger.log).toBeCalledTimes(2);
    expect(loggingOptions.logger.log).toHaveBeenNthCalledWith(1, `Starting request for handler: ${loggingOptions.handlerName}`);
    expect(loggingOptions.logger.log).toHaveBeenNthCalledWith(2, `Finished request for handler: ${loggingOptions.handlerName}`);
  });

  it("call next middleware", async () => {
    const next = jest.fn();
    await RequestLoggingMiddleware(loggingOptions)(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("call next middleware after requestLoggingMiddleware using App", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const sut = new App();
    await sut.use([RequestLoggingMiddleware(loggingOptions), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});
