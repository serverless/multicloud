import {
  ResolveContext,
  CloudContext,
  ExceptionMiddleware,
  ExceptionOptions,
  App
} from ".";
import { ContainerResolver, ContainerRegister } from "./cloudContainer";

describe("Tests of ExceptionMiddleware should", () => {
  let options: ExceptionOptions = {
    log: jest.fn()
  };

  const context: CloudContext = {
    providerType: "providerType",
    req: {
      method: "method"
    },
    send: jest.fn(),
    res: {}
  };

  const resolver: ContainerResolver & ContainerRegister = {
    resolve: <T>(): T => {
      return (context as unknown) as T;
    },
    registerModule: () => {
      return jest.fn();
    }
  };
  const errorStatus = 500;

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("catch exception and log error", async done => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);
    const failNext = () => {
      throw error;
    };

    await ExceptionMiddleware(options)(context, failNext);
    expect(options.log).toHaveBeenCalledWith(error);
    expect(context.send).toHaveBeenCalledWith(error, errorStatus);
    done();
  });

  it("call next without calling exception or logging", async done => {
    const next = jest.fn();
    await ExceptionMiddleware(options)(context, next);
    expect(next).toHaveBeenCalled();
    expect(options.log).not.toHaveBeenCalled();
    expect(context.send).not.toHaveBeenCalled();
    done();
  });

  it("call next middleware after exceptionMiddleware using App", async () => {
    const spyMiddleware = jest.fn();
    const spyHandler = jest.fn();

    const sut = new App(resolver);
    await sut.use(
      [ExceptionMiddleware(options), middlewareFoo(spyMiddleware)],
      handler(spyHandler)
    )(context);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(spyHandler).toHaveBeenCalled();
  });

  it("call next middleware and receive error, call exception and log error", async () => {
    const errorMessage = "Fail";
    const error = new Error(errorMessage);

    const failNext = () => {
      throw error;
    };
    const spyHandler = jest.fn();

    const sut = new App(resolver);
    await sut.use(
      [ExceptionMiddleware(options), middlewareFoo(failNext)],
      handler(spyHandler)
    )(context);
    expect(context.send).toHaveBeenCalledWith(error, errorStatus);
    expect(options.log).toHaveBeenCalledWith(error);
  });
});
