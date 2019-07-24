import { ContainerModule } from "inversify";
import { CloudContext, App, CloudModule, ComponentType } from "..";
import { PerformanceMiddleware } from "../middleware";
import { ConsoleLogger } from "../services/consoleLogger";
import MockFactory from "../test/mockFactory";

describe("PerformanceMiddleware should", () => {
  const handler = MockFactory.createMockHandler();
  const context = MockFactory.createMockCloudContext();
  const consoleLogger = new ConsoleLogger();
  consoleLogger.log = jest.fn();
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
    expect(context.logger.log).toBeCalledTimes(2);
  });

  it("collect and log performance metrics, even if an exception is thrown", async () => {
    const failNext = () => {
      throw new Error("Unexpected Exception");
    };

    await expect(PerformanceMiddleware()(context, failNext)).rejects.toThrow();
    expect(context.logger.log).toBeCalledTimes(2);
  });

  it("call the next middleware when using App", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const app = new App(testModule);
    await app.use([PerformanceMiddleware(), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });
});
