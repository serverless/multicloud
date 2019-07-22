import { CloudContext, App, CloudModule, ComponentType } from "@multicloud/sls-core";
import {
  DatabaseOptions,
  DatabaseMiddleware
} from "./databaseMiddleware";
import mongoose from "mongoose";
import { ContainerModule } from "inversify";

describe("Database Middleware", () => {
  const context: CloudContext = {
    providerType: "providerType",
    req: {
      method: "GET"
    },
    res: {
      headers: {},
      send: jest.fn(),
    },
    send: jest.fn()
  };

  const testModule: CloudModule = {
    create: () => new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext).toConstantValue(context);
    })
  }

  const next = jest.fn();

  const middlewareFoo = (spy: Function) => async (
    _: CloudContext,
    next: Function
  ): Promise<void> => {
    spy();
    await next();
  };

  const handler = (spy: Function) => (): Promise<void> => {
    spy();
    return Promise.resolve();
  };

  jest.mock("mongoose");
  mongoose.connect = jest.fn().mockResolvedValue(mongoose.connection = jest.fn());
  mongoose.disconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  class DbOptions implements DatabaseOptions {
    public constructor(closeConnection: boolean){
      this.closeConnection = closeConnection;
    }
    public url: string = "http://some.url";
    public params: any = {
      poolSize: 1,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      keepAlive: 120
    };
    public closeConnection: boolean = true;
  }

  it("should open a connection and not close if closeConnection = false", async () =>{
    const dbOptions = new DbOptions(false);

    await DatabaseMiddleware(dbOptions)(context, next);
    expect(mongoose.connect).toHaveBeenCalledWith(dbOptions.url, dbOptions.params);
    expect(mongoose.disconnect).not.toHaveBeenCalled();
  });

  it("should open a connection and close it if closeConnection = true", async () =>{
    const dbOptions = new DbOptions(true);

    await DatabaseMiddleware(dbOptions)(context, next);
    expect(mongoose.connect).toHaveBeenCalledWith(dbOptions.url, dbOptions.params);
    expect(mongoose.disconnect).toHaveBeenCalled();
  });

  it("should not open a new connection if global.cachedConnection.readyState == 1", async () => {
    global.cachedConnection.readyState = 1;
    const dbOptions = new DbOptions(false);

    await DatabaseMiddleware(dbOptions)(context, next);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it("call next", async () => {
    const dbOptions = new DbOptions(true);

    await DatabaseMiddleware(dbOptions)(context, next);
    expect(next).toHaveBeenCalled();
  });

  it("call next middleware using App", async () => {
    const spyMiddleware = jest.fn();
    const spyHandler = jest.fn();
    const dbOptions = new DbOptions(true);

    const sut = new App(testModule);
    await sut.use(
      [DatabaseMiddleware(dbOptions), middlewareFoo(spyMiddleware)],
      handler(spyHandler)
    )(context);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(spyHandler).toHaveBeenCalled();
  });
});
