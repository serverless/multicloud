import { App } from "./middleware";
import { CloudContext } from "./cloudContext";
import {
  ContainerRegister,
  ContainerResolver,
  CloudModule
} from "./cloudContainer";

const middlewareFoo = (spy: Function) => async (
  _: CloudContext,
  next: Function
): Promise<void> => {
  spy();
  await next();
};

const errorMiddleware = (spy: Function) => async (
  context: CloudContext
): Promise<void> => {
  spy();
  context.send({ error: "Boh!!!!!" }, 400);
};

const handler = (spy: Function) => (): Promise<void> => {
  spy();
  return Promise.resolve();
};

const resolver: ContainerResolver & ContainerRegister = {
  resolve: <T>(): T => {
    return ({
      send: jest.fn()
    } as unknown) as T;
  },
  registerModule: () => {
    return jest.fn();
  }
};

describe("App", () => {
  it("when use start middleware chain", async () => {
    const context = {
      req: {},
      res: {}
    };
    const spyMiddleware = jest.fn();
    const spyHandler = jest.fn();

    const sut = new App(resolver);
    await sut.use([middlewareFoo(spyMiddleware)], handler(spyHandler))(context);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(spyHandler).toHaveBeenCalled();
  });

  it("when empty middlewares call handler", async () => {
    const context = {
      req: {},
      res: {}
    };
    const spyHandler = jest.fn();

    const sut = new App(resolver);
    await sut.use([], handler(spyHandler))(context);
    expect(spyHandler).toHaveBeenCalled();
  });

  it("not call handler when middleware complete execution", async () => {
    const context = {};
    const spyHandler = jest.fn();
    const spyError = jest.fn();

    const sut = new App(resolver);
    await sut.use([errorMiddleware(spyError)], handler(spyHandler))(context);
    expect(spyError).toHaveBeenCalled();
    expect(spyHandler).toBeCalledTimes(0);
  });
});
