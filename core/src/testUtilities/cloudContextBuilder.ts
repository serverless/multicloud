import { Guard } from "../common/guard";
import { CloudContext } from "../cloudContext";
import { TestContext } from "./testContext";
import { TestRequest } from "./testRequest";
import { TestResponse } from "./testResponse";
import { Middleware } from "../app";
import { MockFactory } from "./mockFactory";

interface SimpleMap<T = any> {
  [key: string]: T;
}

/**
 * Helper class to easily build out a CloudContext used for testing multicloud handlers
 */
export class CloudContextBuilder {
  private isHttpRequest: boolean = false;
  private event: any = {};
  private context: any = {};
  private assertions = [];

  /**
   * Sets the current context to contain an Http request
   */
  public asHttpRequest(): CloudContextBuilder {
    this.isHttpRequest = true;
    return this;
  }

  /**
   * Sets the cloud context to the specified value
   * @param context The context to set for the cloud request
   */
  public withContext(context: any): CloudContextBuilder {
    Guard.null(context);

    this.context = context;
    return this;
  }

  /**
   * Sets the cloud event for the incoming request
   * @param event The event / http request to set
   */
  public withEvent(event: any): CloudContextBuilder {
    Guard.null(event);

    this.event = event;
    return this;
  }

  /**
   * Sets the Http request body on the cloud request
   * @param body The Http Request body
   */
  public withRequestBody(body: any): CloudContextBuilder {
    Guard.null(body);

    this.event.body = body;
    return this;
  }

  /**
   * Sets the Http request headers on the cloud request
   * @param headers The Http request headers
   */
  public withRequestHeaders(headers: SimpleMap): CloudContextBuilder {
    Guard.null(headers);

    this.event.headers = headers;
    return this;
  }

  /**
   * Sets the Http request method
   * @param method The Http request method, ex) GET, PUT, POST, PATCH, DELETE
   */
  public withRequestMethod(method: string): CloudContextBuilder {
    Guard.empty(method);

    this.event.method = method;
    return this;
  }

  /**
   * Sets the Http request path params
   * @param pathParams The Http path params
   */
  public withRequestPathParams(pathParams: SimpleMap): CloudContextBuilder {
    Guard.null(pathParams);

    this.event.pathParams = pathParams;
    return this;
  }

  /**
   * Sets the Http request querystring
   * @param query The Http request query string
   */
  public withRequestQuery(query: SimpleMap): CloudContextBuilder {
    Guard.null(query);

    this.event.query = query;
    return this;
  }

  /**
   * Configures that the middleware should be called on the app lifecycle
   * @param moduleName The middleware module name
   * @param middlewareName The middleware name
   */
  public withMiddlewareSpy(middlewareSpy: () => Middleware, assertFn?: () => void) {
    assertFn = assertFn || (() => expect(MockFactory.ensureMiddleware(middlewareSpy)).toBeCalled());
    this.assertions.push(assertFn);

    return this;
  }

  /**
   * Builds a Cloud Context based on the configured values
   */
  public build(): CloudContext {
    const context = new TestContext(this.createRuntimeArgs());
    if (this.isHttpRequest) {
      context.req = new TestRequest(context);
      context.res = new TestResponse();
    }

    return context;
  }

  /**
   * Executes the specified handler with the configured context values
   * @param handler The cloud agnostic handler to execute with the configured cloud context
   */
  public async invokeHandler(handler: Function): Promise<CloudContext> {
    const context = await handler(...this.createRuntimeArgs());
    this.assertions.forEach((fn) => fn());

    return context;
  }

  /**
   * Executes the specified middleware with the configured context values
   * @param middleware The middleware to invoke
   * @param next The middleware next function
   */
  public async invokeMiddleware(middleware: Middleware, next?: () => Promise<void>): Promise<CloudContext> {
    next = next || jest.fn(Promise.resolve);
    const context = new TestContext(this.createRuntimeArgs());
    await middleware(context, next);

    return context;
  }

  private createRuntimeArgs(): any[] {
    return [this.context, this.event];
  }
}
