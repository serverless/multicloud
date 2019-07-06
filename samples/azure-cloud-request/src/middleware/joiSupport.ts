import { ValidationOptions, ValidationResult } from "../validationMiddleware";
import { CloudContext } from "../cloudContext";
import * as Joi from "joi";

export class InternalValidationResult implements ValidationResult {
  private error: boolean = false;
  public constructor(
    public result: Joi.ValidationResult<any>,
    private context: CloudContext
  ) {
    this.error = result.error !== null;
  }

  public hasError(): boolean {
    return this.error;
  }
  public send(): Promise<void> {
    return Promise.resolve(this.context.send(this.result.error,400));
  }
}

type CloudContextSelector = (context: CloudContext) => any;

const createJoiValidationOptions = (selector: CloudContextSelector) => (
  schema: Joi.AnySchema
): ValidationOptions => {
  return {
    validate: (context: CloudContext) => {
      const value = selector(context);
      const result = schema.validate<any>(value);
      return Promise.resolve(new InternalValidationResult(result, context));
    }
  };
};

export const createJoiBodyValidationOptions = createJoiValidationOptions(x => {
  return x.req.body;
});

export const createJoiQueryValidationOptions = createJoiValidationOptions(x => {
  return x.req.query;
});
