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
    return async (context: CloudContext, next: Function) => {
      spy(context, next);
      return await next();
    }
  }

  /**
   * Creates a mock CloudContext to use in unit tests
   */
  public static createMockCloudContext(): CloudContext {
    return {
      providerType: "providerType",
      req: MockFactory.createMockCloudRequest(),
      res: MockFactory.createMockCloudResponse(),
      send: jest.fn(),
    };
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
}
