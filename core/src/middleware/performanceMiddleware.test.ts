import { TestContext } from "../test/testContext";
import { TestResponse } from "../test/testResponse";
import { ConsoleLogger } from "../services/consoleLogger";
import { PerformanceMiddleware, DurationResponseHeader, RequestIdResponseHeader } from "./performanceMiddleware"

describe("PerformanceMiddleware should", () => {
  let context;

  beforeEach(() => {
    context = new TestContext();
    context.res = new TestResponse();
    context.logger = new ConsoleLogger();
    context.logger.info = jest.fn();
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("collect and log performance metrics", async () => {
    const next = jest.fn();
    await PerformanceMiddleware()(context, next);

    expect(context.logger.info).toBeCalledTimes(2);
    expect(context.res.headers.has(RequestIdResponseHeader)).toBe(true);
    expect(context.res.headers.has(DurationResponseHeader)).toBe(true);
  });

  it("collect and log performance metrics, even if an exception is thrown", async () => {
    const failNext = () => {
      throw new Error("Unexpected Exception");
    };

    await expect(PerformanceMiddleware()(context, failNext)).rejects.toThrow();
    expect(context.logger.info).toBeCalledTimes(2);
    expect(context.res.headers.has(RequestIdResponseHeader)).toBe(true);
    expect(context.res.headers.has(DurationResponseHeader)).toBe(true);
  });

  it("call the next middleware when using App", async () => {
    const next = jest.fn();
    await PerformanceMiddleware()(context, next);

    expect(next).toBeCalled();
    expect(context.res.headers.has(RequestIdResponseHeader)).toBe(true);
    expect(context.res.headers.has(DurationResponseHeader)).toBe(true);
  });
});
