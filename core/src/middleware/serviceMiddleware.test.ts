import { ServiceMiddleware } from "./serviceMiddleware";
import { ComponentType, CloudModule, CloudContext, App } from "..";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";
import { Handler } from "../app";
import { CloudService } from "../services";

describe("ServiceMiddleware should", () => {
  const cloudContext = MockFactory.createMockCloudContext(false);
  const cloudService = MockFactory.createMockCloudService();

  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(cloudContext)
      bind<CloudService>(ComponentType.CloudService).toConstantValue(cloudService);
    })
  }

  let app: App;
  let handler: Handler;

  beforeEach(() => {
    app = new App(testModule);
    handler = MockFactory.createMockHandler();
  })

  it("calls next handler", async () => {
    await app.use([ServiceMiddleware()], handler)();

    expect(handler).toBeCalled();
  });

  it("calls the next middleware in the chain", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    await app.use([ServiceMiddleware(), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("sets the cloudService", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.service).not.toBeNull();

      await next();
    });

    await app.use([ServiceMiddleware(), testMiddleware], handler)();
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });
});
