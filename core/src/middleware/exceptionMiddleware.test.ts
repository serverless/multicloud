import { MockFactory } from "../testUtilities/mockFactory";
import { App } from "../app";
import { ExceptionMiddleware, ExceptionOptions } from "./exceptionMiddleware";
import { HTTPBindingMiddleware } from "./httpBindingMiddleware";
import { CloudContextBuilder } from "../testUtilities/cloudContextBuilder";
import { CloudContext } from "../cloudContext";

describe("Exception Middleware", () => {
  let options: ExceptionOptions = {
    log: jest.fn()
  };

  const handler = MockFactory.createMockHandler();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs error and outputs 500 response when sync exception occurs within a handler", async () => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);

    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware()];
    const failHandler = app.use(middlewares, () => {
      throw error;
    });

    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(failHandler);

    expect(options.log).toHaveBeenCalledWith(error);

    expect(context.res).toMatchObject({
      body: {
        requestId: expect.any(String),
        message: error.toString(),
        timestamp: expect.any(Date),
      },
      status: 500
    });
  });

  it("calls next when no exception occurs", async () => {
    const builder = new CloudContextBuilder();
    const context = builder.build();

    const next = jest.fn(() => Promise.resolve());
    await ExceptionMiddleware(options)(context, next);

    expect(next).toHaveBeenCalled();
    expect(options.log).not.toHaveBeenCalled();
  });

  it("calls next middleware/handler in app pipeline when no exception occurs", async () => {
    const mockMiddleware = MockFactory.createMockMiddleware();

    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware(), mockMiddleware];
    const mockHandler = app.use(middlewares, handler);

    const builder = new CloudContextBuilder()
    await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(mockHandler);

    expect(mockMiddleware).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it("logs error and outputs 500 response when exception occurs within a middleware", async () => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);

    const failNext = () => {
      throw error;
    };
    const mockMiddleware = MockFactory.createMockMiddleware(failNext);

    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware(), mockMiddleware];
    const failHandler = app.use(middlewares, handler);

    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(failHandler);

    expect(options.log).toHaveBeenCalledWith(error);
    expect(context.res).toMatchObject({
      body: {
        requestId: expect.any(String),
        message: error.toString(),
        timestamp: expect.any(Date),
      },
      status: 500
    });
  });

  it("logs errors and outputs 500 response when promise is rejected within a handler", async () => {
    const errorMessage = "promise rejected";

    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware()];
    const failHandler = app.use(middlewares, () => {
      return Promise.reject(errorMessage);
    });

    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(failHandler);

    expect(options.log).toHaveBeenCalledWith(errorMessage);

    expect(context.res).toMatchObject({
      body: {
        requestId: expect.any(String),
        message: errorMessage,
        timestamp: expect.any(Date),
      },
      status: 500
    });
  });

  it("logs error and outputs 500 response when promise is rejected within a middleware", async () => {
    const errorMessage = "project rejected";

    const failNext = () => {
      return Promise.reject(errorMessage);
    };
    const mockMiddleware = MockFactory.createMockMiddleware(failNext);

    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware(), mockMiddleware];
    const failHandler = app.use(middlewares, handler);

    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(failHandler);

    expect(options.log).toHaveBeenCalledWith(errorMessage);
    expect(context.res).toMatchObject({
      body: {
        requestId: expect.any(String),
        message: errorMessage,
        timestamp: expect.any(Date),
      },
      status: 500
    });
  });

  it("logs errors thrown in callback", async () => {
    const spy = jest.fn();
    const expectedError = new Error("Thrown from inside callback");
    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware()];

    const handlerWithCallback = app.use(middlewares, (context: CloudContext) => {
      const callback = (cb) => {
        throw expectedError;
        cb();
      };

      callback(() => {
        spy();
        context.send("callback", 200);
      });
    });

    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(handlerWithCallback);

    expect(spy).not.toBeCalled();
    expect(context.res).toMatchObject({
      body: { message: expectedError.toString() },
      status: 500
    });
  });

  it("logs errors thrown in nested callback", async () => {
    const spy = jest.fn();
    const expectedError = new Error("Thrown from inside callback");
    const expectedStatusCode = 503;

    const app = new App();
    const middlewares = [ExceptionMiddleware(options), HTTPBindingMiddleware()];

    const handlerWithNestedCallback = app.use(middlewares, (context: CloudContext) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const nestedCallbacks = (callback) => {
        MockFactory.simulateCallback(null, () => {
          MockFactory.simulateCallback(null, () => {
            context.error(expectedError, expectedStatusCode);
          });
        });
      };

      nestedCallbacks(() => {
        spy();
        context.send("callback", 200);
      });
    });

    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(handlerWithNestedCallback);

    expect(spy).not.toBeCalled();
    expect(context.res).toMatchObject({
      body: { message: expectedError.toString() },
      status: expectedStatusCode
    });
  });
});
