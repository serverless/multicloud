import { CloudContext } from "./cloudContext";
import {
  createValidationMiddleware,
  ValidationOptions,
  ValidationResult
} from "./validationMiddleware";
import { Middleware } from "./middleware";

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

  const context: CloudContext = {
    providerType: "provider",
    req: {
      body: {
        username: "foo",
        password: "bar"
      },
      method: "get"
    },
    res: {
      send: jest.fn()
    },
    send: jest.fn()
  };

  let sut: Middleware = undefined;
  beforeEach(() => {
    sut = createValidationMiddleware(options);
  });

  it("call validate", async () => {
    options.validate = jest.fn().mockResolvedValue(successValidation);
    await sut(context, next);
    expect(options.validate).toHaveBeenCalledWith(context);
  });

  it("call send on error", async () => {
    options.validate = jest.fn().mockResolvedValue(failValidation);
    await sut(context, next);
    expect(failValidation.send).toHaveBeenCalled();
  });

  it.skip("dont call next on error", async () => {
    options.validate = jest.fn().mockResolvedValue(failValidation);
    await sut(context, next);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("when success call next", async () => {
    options.validate = jest.fn().mockResolvedValue(successValidation);
    await sut(context, next);
    expect(successValidation.send).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalled();
  });
});
