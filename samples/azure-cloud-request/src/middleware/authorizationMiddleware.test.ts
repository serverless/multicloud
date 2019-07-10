import {
  AuthorizationValidationOptions,
  createAuthorizationMiddleware
} from "./authorizationMiddleware";
import { CloudContext, App, ContainerResolver, ContainerRegister } from "@multicloud/sls-core";

describe("Authorization middleware should", () => {
  const baseContext: CloudContext = {
    providerType: "test",
    send: jest.fn()
  };

  const customerId = 531;

  const authorizationValidationOptions = new AuthorizationValidationOptions(
    "authorization",
    "Unauthorized"
  );

  const customerAuthorizationValidationOptions = new AuthorizationValidationOptions(
    "customerId",
    "The customer id doesn't match",
    customerId
  );
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("validate authorization header successfully", async () => {
    const context = {
      ...baseContext,
      req: {
        headers: {
          authorization: {}
        },
        method: "POST"
      }
    };

    await createAuthorizationMiddleware(authorizationValidationOptions)(
      context,
      next
    );

    expect(baseContext.send).not.toHaveBeenCalled();
  });

  it("fail when validating authorization header", async () => {
    const context = {
      ...baseContext,
      req: {
        headers: {},
        method: "POST"
      }
    };

    await createAuthorizationMiddleware(authorizationValidationOptions)(
      context,
      next
    );

    expect(context.send).toHaveBeenCalledWith("Unauthorized", 401);
  });

  it("validate customer id header successfully", async () => {
    const context = {
      ...baseContext,
      req: {
        headers: {
          customerId
        },
        method: "POST"
      }
    };

    await createAuthorizationMiddleware(customerAuthorizationValidationOptions)(
      context,
      next
    );

    expect(baseContext.send).not.toHaveBeenCalled();
  });

  it("fail when validating customer id header", async () => {
    const customerId2 = 1421;
    const context = {
      ...baseContext,
      req: {
        headers: {
          customerId2
        },
        method: "POST"
      }
    };

    await createAuthorizationMiddleware(customerAuthorizationValidationOptions)(
      context,
      next
    );

    expect(baseContext.send).toHaveBeenCalled();
    expect(context.send).toHaveBeenCalledWith(
      customerAuthorizationValidationOptions.message,
      401
    );
  });

  it("call next middleware after requestLoggingMiddleware using App", async () => {
    const spyMiddleware = jest.fn();
    const spyHandler = jest.fn();

    const context = {
      ...baseContext,
      req: {
        headers: {
          authorization: {}
        },
        method: "POST"
      }
    };

    const resolver: ContainerResolver & ContainerRegister = {
      resolve: <T>(): T => {
        return (context as unknown) as T;
      },
      registerModule: () => {
        return jest.fn();
      }
    };
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

    const sut = new App(resolver);
    await sut.use(
      [
        createAuthorizationMiddleware(authorizationValidationOptions),
        middlewareFoo(spyMiddleware)
      ],
      handler(spyHandler)
    )(context);
    expect(spyMiddleware).toHaveBeenCalled();
    expect(spyHandler).toHaveBeenCalled();
  });
});
