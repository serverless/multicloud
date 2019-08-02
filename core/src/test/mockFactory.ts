import { Middleware, Handler } from "../app";
import { CloudContext } from "../cloudContext";
import { CloudRequest } from "../cloudRequest";
import { CloudResponse } from "../cloudResponse";
import { CloudService } from "../services";

export default class MockFactory {
  /**
   * Creates a middleware that executes the specified spy
   * @param spy The spy function to call
   */
  public static createMockMiddleware(spy?: Middleware): Middleware {
    const defaultImp = async (context: CloudContext, next: () => Promise<void>) => {
      return await next();
    };

    if (!spy) {
      spy = defaultImp;
    }

    return jest.fn(async (context: CloudContext, next: () => Promise<void>) => {
      return spy(context, next);
    });
  }

  /**
   * Creates a handler that executes the optional spy function
   * @param spy The spy function to call
   */
  public static createMockHandler(spy?: Handler): Handler {
    const defaultImp = (context: CloudContext) => context.send("OK", 200);

    if (!spy) {
      spy = defaultImp;
    }

    return jest.fn((context: CloudContext) => {
      return spy(context);
    });
  }

  /**
   * Creates a mock CloudContext to use in unit tests
   */
  public static createMockCloudContext(createHttpComponents: boolean = true): CloudContext {
    const context: CloudContext = {
      providerType: "providerType",
      id: "12345",
      event: null,
      req: createHttpComponents ? MockFactory.createMockCloudRequest() : null,
      res: createHttpComponents ? MockFactory.createMockCloudResponse() : null,
      send: jest.fn(() => context.done()),
      done: null,
      flush: jest.fn(),
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
      flush: jest.fn(),
    };
  }

  /**
   * Creates a mock CloudService for use in unit tests
   * @param headers The HTTP response headers to set
   */
  public static createMockCloudService(): CloudService {
    return {
      invoke: jest.fn(),
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
