import os from "os";
import { MockFactory } from "../test/mockFactory";
import { CloudContext } from "../cloudContext";
import { TestContext } from "../test/testContext";
import { App } from "../app";
import { TelemetryService, TelemetryOptions } from "../services/telemetry";
import { TelemetryServiceMiddleware } from "./telemetryMiddleware";

describe("TelemetryServiceMiddleware should", () => {
  jest.mock("os");

  os.cpus = jest.fn().mockReturnValue([
    {
      length: 1,
      times: {
        user: 10,
        nice: 10,
        sys: 10,
        idle: 10,
        irq: 10
      }
    }
  ]);
  os.totalmem = jest.fn().mockReturnValue(1000);
  os.freemem = jest.fn().mockReturnValue(800);

  class TestTelemetryService implements TelemetryService {
    public collect() {
      return Promise.resolve();
    }

    public flush() {
      return Promise.resolve();
    }
  }

  const options: TelemetryOptions = {
    telemetryService: new TestTelemetryService(),
    shouldFlush: true,
  };

  let context: CloudContext;

  beforeEach(() => {
    options.shouldFlush = true;
    jest.clearAllMocks();
    context = new TestContext();
  });

  const data = { analytics: "foo" };
  const fooKey = "fooData";

  const middlewareFoo = () => async (
    cloudContext: CloudContext,
    next: Function
  ): Promise<void> => {
    cloudContext.telemetry.collect(fooKey, data);
    await next();
  };

  const handler = MockFactory.createMockHandler();

  it("save the telemetryService in context.telemetry", async () => {
    const next = jest.fn();
    await TelemetryServiceMiddleware(options)(context, next);
    expect(context.telemetry).toEqual(options.telemetryService);
  });

  it("call next and flush methods", async () => {
    const flushSpy = jest.spyOn(TestTelemetryService.prototype, "flush");
    const handler = MockFactory.createMockHandler();
    const middlewares = [TelemetryServiceMiddleware(options)];

    const app = new App();
    await app.use(middlewares, handler)();

    expect(handler).toBeCalled();
    expect(flushSpy).toHaveBeenCalled();
  });

  it("call collect method from another middleware and don't call flush when shouldFlush is false", async () => {
    options.shouldFlush = false;

    const collectSpy = jest.spyOn(TestTelemetryService.prototype, "collect");
    const flushSpy = jest.spyOn(TestTelemetryService.prototype, "flush");
    const app = new App();
    const middlewares = [TelemetryServiceMiddleware(options), middlewareFoo()];
    await app.use(middlewares, handler)(context);

    expect(collectSpy).toHaveBeenCalledWith(fooKey, data);
    expect(flushSpy).not.toHaveBeenCalled();
  });

  it("call collect method from another middleware and flush when shouldFlush is true", async () => {
    const collectSpy = jest.spyOn(TestTelemetryService.prototype, "collect");
    const flushSpy = jest.spyOn(TestTelemetryService.prototype, "flush");
    const app = new App();
    const middlewares = [TelemetryServiceMiddleware(options), middlewareFoo()];
    await app.use(middlewares, handler)(context);

    expect(collectSpy).toHaveBeenCalledWith(fooKey, data);
    expect(flushSpy).toHaveBeenCalled();
  });

  it("have values on the data array of the implementation", async () => {
    class TestService implements TelemetryService {
      public analyticsData = {};

      public collect = (key: string, data: object) => {
        this.analyticsData[key] = data;
        return Promise.resolve();
      };
      public flush = () => {
        return Promise.resolve();
      };
    }

    class TestOptions implements TelemetryOptions {
      public telemetryService = new TestService();
      public shouldFlush: boolean = true;
    }

    let options = new TestOptions();

    const next = jest.fn();
    await TelemetryServiceMiddleware(options)(context, next);
    expect(options.telemetryService.analyticsData).toBeTruthy();
  });

  it("call context.telemetry.collect with the stats", async () => {
    class TestService implements TelemetryService {
      public analyticsData: any = {};

      public collect = (key: string, data: object) => {
        this.analyticsData[key] = data;
        return Promise.resolve();
      };
      public flush = () => {
        return Promise.resolve();
      };
    }

    class TestOptions implements TelemetryOptions {
      public telemetryService = new TestService();
      public shouldFlush: boolean = true;
    }

    let options = new TestOptions();

    jest.mock("os");
    os.cpus = jest
      .fn()
      .mockReturnValueOnce([
        {
          length: 1,
          times: {
            user: 10,
            nice: 10,
            sys: 10,
            idle: 10,
            irq: 10
          }
        }
      ])
      .mockReturnValueOnce([
        {
          length: 1,
          times: {
            user: 100,
            nice: 100,
            sys: 100,
            idle: 100,
            irq: 100
          }
        }
      ]);

    os.freemem = jest
      .fn()
      .mockReturnValueOnce(800)
      .mockReturnValueOnce(500);

    const expectedConsumeCpuIdle = 90;
    const expectedConsumeCpuTick = 450;
    const expectedmemoryConsume = 300;

    const next = jest.fn();
    await TelemetryServiceMiddleware(options)(context, next);

    expect(options.telemetryService.analyticsData.stats).toBeTruthy();
    expect(options.telemetryService.analyticsData.stats.consumeCpuIdle).toEqual(
      expectedConsumeCpuIdle
    );
    expect(options.telemetryService.analyticsData.stats.consumeCpuTick).toEqual(
      expectedConsumeCpuTick
    );
    expect(options.telemetryService.analyticsData.stats.memoryConsume).toEqual(
      expectedmemoryConsume
    );
  });
});
