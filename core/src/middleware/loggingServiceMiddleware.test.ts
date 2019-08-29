import { CloudContext } from "../cloudContext";
import { TestContext } from "../test/testContext";
import { LoggingServiceMiddleware } from "./loggingServiceMiddleware";
import { Logger, LogLevel } from "../services/logger";
import { ConsoleLogger } from "../services/consoleLogger";

describe("LoggingServiceMiddleware should", () => {
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

  let context: CloudContext;
  const logger = new TestLogger(LogLevel.VERBOSE);

  beforeEach(() => {
    context = new TestContext();
    jest.clearAllMocks();
  });

  it("save the Logger in context.logger", async () => {
    const next = jest.fn();
    await LoggingServiceMiddleware(logger)(context, next);
    expect(context.logger).toEqual(logger);
  });

  it("save the defaultLogger in context.logger", async () => {
    const next = jest.fn();
    await LoggingServiceMiddleware(null)(context, next);
    expect(context.logger).toBeInstanceOf(ConsoleLogger);
  });

  it("call next middleware", async () => {
    const next = jest.fn();
    await LoggingServiceMiddleware(logger)(context, next);
    expect(next).toBeCalled();
  });

  it("save the logger in context and be used from the next middleware", async () => {
    const next = jest.fn();
    await LoggingServiceMiddleware(logger)(context, next);
    expect(context.logger).toEqual(logger);
    expect(next).toBeCalled();
  });
});
