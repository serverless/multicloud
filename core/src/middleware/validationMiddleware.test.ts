import { CloudContext } from "../cloudContext";
import { Middleware } from "../app";
import { TestContext } from "../test/testContext";
import { createValidationMiddleware, ValidationResult, ValidationOptions } from "./validationMiddleware";

describe("Validation Middleware", () => {
  const successValidation: ValidationResult = {
    hasError: jest.fn().mockReturnValue(false),
    send: jest.fn()
  };

  const failValidation: ValidationResult = {
    hasError: jest.fn().mockReturnValue(true),
    send: jest.fn()
  };

  const next = jest.fn();

  const options: ValidationOptions = {
    validate: jest.fn()
  };

  let context: CloudContext;

  let middleware: Middleware = undefined;
  beforeEach(() => {
    jest.clearAllMocks();
    middleware = createValidationMiddleware(options);
    context = new TestContext();
  });

  it("call validate", async () => {
    options.validate = jest.fn().mockResolvedValue(successValidation);
    await middleware(context, next);
    expect(options.validate).toBeCalledWith(context);
  });

  it("call send on error", async () => {
    options.validate = jest.fn().mockResolvedValue(failValidation);
    await middleware(context, next);
    expect(failValidation.send).toBeCalled();
  });

  it("don't call next on error", async () => {
    options.validate = jest.fn().mockResolvedValue(failValidation);
    await middleware(context, next);
    expect(next).not.toBeCalled();
  });

  it("when success call next", async () => {
    options.validate = jest.fn().mockResolvedValue(successValidation);
    await middleware(context, next);
    expect(successValidation.send).not.toBeCalled();
    expect(next).toBeCalled();
  });
});
