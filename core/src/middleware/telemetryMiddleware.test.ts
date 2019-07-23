import { TelemetryOptions, TelemetryService } from "../services";
import { CloudContext, App, CloudModule, ComponentType } from "..";
import { TelemetryServiceMiddleware } from "./telemetryMiddleware";
import os from "os";
import { ContainerModule } from "inversify";
import MockFactory from "../test/mockFactory";

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

  class Service implements TelemetryService {
    public collect = jest.fn();
    public flush = jest.fn();
  }

  class Options implements TelemetryOptions {
    public telemetryService = new Service();
    public shouldFlush: boolean = true;
  }

  let options = new Options();

  const testModule: CloudModule = {
    create: () =>
      new ContainerModule(bind => {
        bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
      })
  };

  const context: CloudContext = MockFactory.createMockCloudContext(false);

  beforeEach(() => {
    options.shouldFlush = true;
    jest.clearAllMocks();
  });

  const data = { analytics: "foo" };
  const fooKey = "fooData";

  const middlewareFoo = () => async (
    cloudContext: CloudContext,
    next: Function
  ): Promise<void> => {
    cloudContext.telemetry.collect(fooKey, JSON.stringify(data));
    await next();
  };

  const handler = MockFactory.createMockHandler();

  it("save the telemetryService in context.telemetry", async () => {
    const next = jest.fn();
    await TelemetryServiceMiddleware(options)(context, next);
    expect(context.telemetry).toEqual(options.telemetryService);
  });

  it("call next and flush methods", async () => {
    const next = jest.fn();
    await TelemetryServiceMiddleware(options)(context, next);
    expect(next).toHaveBeenCalled();
    expect(context.telemetry.flush).toHaveBeenCalled();
  });

  it("call collect method from another middleware and don't call flush when shouldFlush is false", async () => {
    options.shouldFlush = false;

    const app = new App(testModule);
    await app.use([TelemetryServiceMiddleware(options), middlewareFoo()], handler)(context);

    expect(context.telemetry.collect).toHaveBeenCalledWith(
      fooKey,
      JSON.stringify(data)
    );
    expect(context.telemetry.flush).not.toHaveBeenCalled();
  });

  it("call collect method from another middleware and flush when shouldFlush is true", async () => {
    const app = new App(testModule);
    await app.use([TelemetryServiceMiddleware(options), middlewareFoo()], handler)(context);
    expect(context.telemetry.collect).toHaveBeenCalledWith(
      fooKey,
      JSON.stringify(data)
    );
    expect(context.telemetry.flush).toHaveBeenCalled();
  });

  it("have values on the data array of the implementation", async () => {
    class TestService implements TelemetryService {
      public analyticsData = {};

      public collect = (key: string, data: string) => {
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
      public analyticsData = {};

      public collect = (key: string, data: string) => {
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
    expect(
      JSON.parse(options.telemetryService.analyticsData.stats).consumeCpuIdle
    ).toEqual(expectedConsumeCpuIdle);
    expect(
      JSON.parse(options.telemetryService.analyticsData.stats).consumeCpuTick
    ).toEqual(expectedConsumeCpuTick);
    expect(
      JSON.parse(options.telemetryService.analyticsData.stats).memoryConsume
    ).toEqual(expectedmemoryConsume);
  });
});
