import { MockFactory } from "../test/mockFactory";
import { App, Handler } from "../app";
import { CloudContext } from "../cloudContext";
import { HTTPBindingMiddleware } from "./httpBindingMiddleware";

describe("HTTPBindingMiddleware should", () => {
  let app: App;
  let handler: Handler;

  beforeEach(() => {
    app = new App();
    handler = MockFactory.createMockHandler();
  })

  it("call next handler", async () => {
    await app.use([HTTPBindingMiddleware()], handler)();

    expect(handler).toBeCalled();
  });

  it("calls the next middleware in the chain", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    await app.use([HTTPBindingMiddleware(), mockMiddleware], handler)();
    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("sets the cloudRequest and cloudResponse during HTTP requests", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.req).not.toBeNull();
      expect(context.res).not.toBeNull();

      await next();
    });

    await app.use([HTTPBindingMiddleware(), testMiddleware], handler)({}, { method: "GET" });
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });

  it("does not set the cloudRequest and cloudResponse and call next if the eventType is not HTTP", async () => {
    const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: Function) => {
      expect(context.req).toBeNull();
      expect(context.res).toBeNull();

      await next();
    });

    await app.use([HTTPBindingMiddleware(), testMiddleware], handler)();
    expect(testMiddleware).toBeCalled();
    expect(handler).toBeCalled();
  });
});
