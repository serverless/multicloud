import { ContainerModule } from "inversify";
import { CloudContext, App, CloudModule, ComponentType } from "..";
import {
  PerformanceMiddleware,
  RequestIdResponseHeader,
  DurationResponseHeader
} from "../middleware";
import { ConsoleLogger } from "../services/consoleLogger";
import MockFactory from "../test/mockFactory";

describe("PerformanceMiddleware should", () => {
  const handler = MockFactory.createMockHandler();
  const context = MockFactory.createMockCloudContext();
  const consoleLogger = new ConsoleLogger();
  consoleLogger.info = jest.fn();
  context.logger = consoleLogger;
  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
    })
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("collect and log performance metrics", async () => {
    await PerformanceMiddleware()(context, () => { });
    expect(context.logger.info).toBeCalledTimes(2);
    expect(context.res.headers[RequestIdResponseHeader]).toBeDefined();
    expect(context.res.headers[DurationResponseHeader]).toBeDefined();
  });

  it("collect and log performance metrics, even if an exception is thrown", async () => {
    const failNext = () => {
      throw new Error("Unexpected Exception");
    };

    await expect(PerformanceMiddleware()(context, failNext)).rejects.toThrow();
    expect(context.logger.info).toBeCalledTimes(2);
    expect(context.res.headers[RequestIdResponseHeader]).toBeDefined();
    expect(context.res.headers[DurationResponseHeader]).toBeDefined();
  });

  it("call the next middleware when using App", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const app = new App(testModule);
    await app.use([PerformanceMiddleware(), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
    expect(context.res.headers[RequestIdResponseHeader]).toBeDefined();
    expect(context.res.headers[DurationResponseHeader]).toBeDefined();
  });
});
