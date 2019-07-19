import { CloudContext, App, CloudModule, ComponentType } from "..";
import { ExceptionMiddleware, ExceptionOptions } from "../middleware";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";

describe("Tests of ExceptionMiddleware should", () => {
  let options: ExceptionOptions = {
    log: jest.fn()
  };

  const handler = jest.fn();
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

  it("catch exception and log error", async done => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);
    const failNext = () => {
      throw error;
    };

    await ExceptionMiddleware(options)(context, failNext);
    expect(options.log).toHaveBeenCalledWith(error);
    expect(context.send).toHaveBeenCalledWith(error, errorStatus);
    done();
  });

  it("call next without calling exception or logging", async done => {
    const next = jest.fn();
    await ExceptionMiddleware(options)(context, next);
    expect(next).toHaveBeenCalled();
    expect(options.log).not.toHaveBeenCalled();
    expect(context.send).not.toHaveBeenCalled();
    done();
  });

  it("call next middleware after exceptionMiddleware using App", async () => {
    const spyMiddleware = jest.fn();
    const mockMiddleware = MockFactory.createMockMiddleware(spyMiddleware);

    const app = new App(testModule);
    await app.use([ExceptionMiddleware(options), mockMiddleware], handler)();
    expect(spyMiddleware).toHaveBeenCalled();
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
});
