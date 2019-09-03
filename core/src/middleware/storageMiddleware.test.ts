import { MockFactory } from "../test/mockFactory";
import { App, Handler } from "../app";
import { CloudContext } from "../cloudContext";
import { StorageMiddleware } from "./storageMiddleware";

describe("StorageMiddleware should", () => {
  let app: App;
  let handler: Handler;

  beforeEach(() => {
    app = new App();
    handler = MockFactory.createMockHandler();
  });

  it("call next handler", async () => {
    await app.use([StorageMiddleware()], handler)();

    expect(handler).toBeCalled();
  });

  it("calls the next middleware in the chain", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    await app.use([StorageMiddleware(), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("sets the cloudStorage during HTTP requests", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.storage).not.toBeNull();

      await next();
    });

    await app.use([StorageMiddleware(), testMiddleware], handler)({}, { method: "GET" });
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });

  it("does not set the cloudStorage and call next if the eventType is not HTTP", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.storage).not.toBeNull();

      await next();
    });

    await app.use([StorageMiddleware(), testMiddleware], handler)();
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });
});
