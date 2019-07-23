import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";
import { CloudRequest } from "../cloudRequest";
import { CloudResponse } from "../cloudResponse";

export default class MockFactory {
  /**
   * Creates a middleware that executes the specified spy
   * @param spy The spy function to call
   */
  public static createMockMiddleware(spy: Function = jest.fn()): Middleware {
    return jest.fn(async (context: CloudContext, next: Function) => {
      spy(context, next);
      return await next();
    });
  }

  /**
   * Creates a handler that executes the optional spy function
   * @param spy The spy function to call
   */
  public static createMockHandler(spy: Function = jest.fn()): (context: CloudContext) => Promise<any> | void {
    return jest.fn((context: CloudContext) => {
      spy(context);
      context.send("OK", 200);
    });
  }

  /**
   * Creates a mock CloudContext to use in unit tests
   */
  public static createMockCloudContext(createHttpComponents: boolean = true): CloudContext {
    const context = {
      providerType: "providerType",
      id: "12345",
      req: createHttpComponents ? MockFactory.createMockCloudRequest() : null,
      res: createHttpComponents ? MockFactory.createMockCloudResponse() : null,
      done: null,
      send: jest.fn(() => context.done())
    };

    return context;
  }

  /**
   * Creates a mock CloudRequest for use in unit tests
   * @param method The HTTP method
   */
  public static createMockCloudRequest(method: string = "GET"): CloudRequest {
    return {
      method,
    };
  }

  /**
   * Creates a mock CloudResponse for use in unit tests
   * @param headers The HTTP response headers to set
   */
  public static createMockCloudResponse(headers = {}): CloudResponse {
    return {
      headers,
      send: jest.fn(),
    };
  }

  /**
 * Simulates a call to a promise.
 */
  public static simulatePromise(): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(resolve);
    });
  }

  /**
   * Simulates a call as a callback
  */
  public static simulateCallback(err, callback): void {
    if (err) {
      throw err;
    }
    setImmediate(callback);
  }
}
