import { App } from "./app";
import { CloudContext } from "./cloudContext";
import { CloudModule, ComponentType } from ".";
import { ContainerModule } from "inversify";
import MockFactory from "./test/mockFactory"

const errorMiddleware = (spy: Function) => async (
  context: CloudContext
): Promise<void> => {
  spy();
  context.send({ error: "Boh!!!!!" }, 400);
};

const handler = jest.fn();
const context: CloudContext = {
  providerType: "provider",
  send: jest.fn()
}

const testModule: CloudModule = {
  create: () => new ContainerModule((bind) => {
    bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
  })
}

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("when use start middleware chain", async () => {
    const spyMiddleware = jest.fn();
    const app = new App(testModule);

    const mockMiddleware = MockFactory.createMockMiddleware(spyMiddleware);

    await app.use([mockMiddleware], handler)();
    expect(spyMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });

  it("when empty middlewares call handler", async () => {
    const app = new App(testModule);
    await app.use([], handler)();
    expect(handler).toBeCalled();
  });

  it("not call handler when middleware complete execution", async () => {
    const spyError = jest.fn();
    const app = new App(testModule);

    await app.use([errorMiddleware(spyError)], handler)();
    expect(spyError).toBeCalled();
    expect(handler).not.toBeCalled();
  });
});
