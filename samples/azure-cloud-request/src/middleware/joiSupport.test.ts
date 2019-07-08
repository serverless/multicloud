import {
  createJoiBodyValidationOptions,
  createJoiQueryValidationOptions,
  InternalValidationResult
} from "./joiSupport";
import { CloudContext,CloudRequest } from "@multicloud/sls-core";
import * as Joi from "@hapi/joi";

describe("Joi validation option", () => {
  const schema: Joi.AnySchema = Joi.object({
    foo: Joi.string().required(),
    bar: Joi.string().required()
  });

  const baseContext: CloudContext = {
    providerType: "test",
    send: jest.fn()
  };

  it("invalid body should has error", async () => {
    const context = {
      ...baseContext,
      req: {
        body: {},
        method: "POST"
      }
    };

    const result = await createJoiBodyValidationOptions(schema).validate(
      context
    );
    expect(result.hasError()).toBe(true);
  });

  it("valid body shouldnt has error", async () => {
    const context = {
      ...baseContext,
      req: {
        body: {
          foo: "foo",
          bar: "bar"
        },
        method: "POST"
      }
    };

    const result = await createJoiBodyValidationOptions(schema).validate(
      context
    );
    expect(result.hasError()).toBe(false);
  });

  it("invalid query should has error", async () => {
    const context = {
      ...baseContext,
      req: {
        query: {},
        method: "GET"
      }
    };

    const result = await createJoiQueryValidationOptions(schema).validate(
      context
    );
    expect(result.hasError()).toBe(true);
  });

  it("valid query shouldnt has error", async () => {
    const context = {
      ...baseContext,
      req: {
        query: {
          foo: "foo",
          bar: "bar"
        },
        method: "GET"
      }
    };
    const result = await createJoiQueryValidationOptions(schema).validate(
      context
    );
    expect(result.hasError()).toBe(false);
  });

  it("when fail send should has internal error", async () => {
    const context = {
      ...baseContext,
      req: {
        query: {
        },
        method: "GET"
      }
    };
    const result = await createJoiQueryValidationOptions(schema).validate(
      context
    ) as InternalValidationResult;
    result.send()
    expect(context.send).toHaveBeenCalledWith(result.result.error, 400);
  });
});
