import { MockFactory } from "../test/mockFactory";
import { CloudContextBuilder } from "./cloudContextBuilder"
import { CloudContext } from "../cloudContext";
import { TestContext } from "./testContext";
import { TestRequest } from "./testRequest";
import { App } from "../app";
MockFactory.spyOnMiddleware("../middleware/httpBindingMiddleware", "HTTPBindingMiddleware");
import { HTTPBindingMiddleware } from "../middleware/httpBindingMiddleware";
MockFactory.spyOnMiddleware("../middleware/performanceMiddleware", "PerformanceMiddleware");
import { PerformanceMiddleware } from "../middleware/performanceMiddleware";

describe("CloudContextBuilder", () => {
  describe("building context", () => {
    it("creates a cloud context from the configured values", () => {
      const builder = new CloudContextBuilder()

      const requestValues = {
        method: "GET",
        headers: {
          "x-some-header": "some-value"
        },
        pathParams: {
          productId: "ABC123",
        },
        query: {
          name: "name"
        },
        body: { foo: "bar" },
      };

      const context = builder
        .asHttpRequest()
        .withRequestMethod(requestValues.method)
        .withRequestQuery(requestValues.query)
        .withRequestHeaders(requestValues.headers)
        .withRequestBody(requestValues.body)
        .withRequestPathParams(requestValues.pathParams)
        .build();

      expect(context).toBeInstanceOf(TestContext);
      expect(context.req).toBeInstanceOf(TestRequest);
      expect(context.req.method).toEqual(requestValues.method);
      expect(context.req.query.has("name")).toBe(true);
      expect(context.req.headers.has("x-some-header")).toBe(true);
      expect(context.req.pathParams.has("productId")).toBe(true);
      expect(context.req.body).toEqual(requestValues.body);
    });
  });

  describe("invoking handlers", () => {
    let testHandler = null;

    beforeEach(() => {
      const app = new App();
      const middlewares = [PerformanceMiddleware(), HTTPBindingMiddleware()];
      testHandler = app.use(middlewares, (context: CloudContext) => {
        if (!context.req.query.has("name")) {
          return context.send({ message: "name is required" }, 400)
        }

        return context.send("OK", 200);
      });
    });

    it("executes the referenced handler with the configured cloud context values", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .withRequestQuery({ name: "Hello" })
        .withRequestHeaders({ "x-some-header": "some-value" })
        .withMiddlewareSpy(HTTPBindingMiddleware)
        .withMiddlewareSpy(PerformanceMiddleware)
        .invokeHandler(testHandler);

      expect(context.res.status).toEqual(200);
    });

    it("executes the referenced handler with the configured cloud context values", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .withRequestHeaders({ "x-some-header": "some-value" })
        .withMiddlewareSpy(HTTPBindingMiddleware)
        .withMiddlewareSpy(PerformanceMiddleware)
        .invokeHandler(testHandler);

      expect(MockFactory.ensureMiddleware(HTTPBindingMiddleware)).toBeCalled();
      expect(context.res.status).toEqual(400);
    });
  });

  describe("invoking middleware", () => {
    it("execute the referenced middleware with the configured cloud context values", async () => {
      const next = jest.fn();
      const testMiddleware = MockFactory.createMockMiddleware(async (context: CloudContext, next: () => Promise<void>) => {
        context["customExtension"] = "test";
        await next();
      });

      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .invokeMiddleware(testMiddleware, next);

      expect(context["customExtension"]).toEqual("test");
      expect(next).toBeCalled();
    });
  });
});
