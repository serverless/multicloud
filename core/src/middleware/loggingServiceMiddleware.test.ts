import { LoggingServiceMiddleware } from "./loggingServiceMiddleware";
import { Logger, LogLevel, ConsoleLogger } from "../services";
import { App, CloudContext, CloudModule, ComponentType } from "..";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";

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
  }

  const handler = MockFactory.createMockHandler();
  const context = MockFactory.createMockCloudContext();

  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
    })
  }

  const logger = new TestLogger(LogLevel.LOG);

  beforeEach(() => {
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
    const app = new App(testModule);
    const middlewareSpy = jest.fn((context: CloudContext) => context.logger.log("test message"));
    const mockMiddleware = MockFactory.createMockMiddleware(middlewareSpy);
    await app.use([LoggingServiceMiddleware(logger), mockMiddleware], handler)();

    expect(context.logger).toEqual(logger);
    expect(context.logger.log).toBeCalledWith("test message");
    expect(handler).toBeCalled();
  });

  it("save the logger in the middleware after the execution of the first middleware", async () => {
    const app = new App(testModule);
    const mockMiddleware = MockFactory.createMockMiddleware();
    expect(app.use([mockMiddleware, LoggingServiceMiddleware(logger)], handler)())
      .rejects
      .toThrow(TypeError);
  });
});
