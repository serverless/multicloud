import AWS from "aws-sdk";
import { Readable } from "stream";
import {
  CloudContainer,
  CloudContext,
  CloudContextBuilder,
  convertToStream,
  InvokeRequest
} from "@multicloud/sls-core";
import {
  AWSCloudServiceOptions,
  AWSInvokeType,
  ensureString,
  LambdaCloudService,
  normalizePayload
} from "./lambdaCloudService";

jest.mock("aws-sdk");

const getCartAWSCloudService: AWSCloudServiceOptions = {
  name: "aws-getCart",
  region: "west-us-2",
  arn: "arn-west-us-2-getCart",
};

describe("LambdaCloudService", () => {
  const container = new CloudContainer();
  container.bind(getCartAWSCloudService.name).toConstantValue(getCartAWSCloudService);

  const builder = new CloudContextBuilder();
  const context: CloudContext = {
    ...builder.build(),
    container
  };

  const invokeResponseBody = {
    foo: "bar"
  };

  let invokeResponse;
  beforeEach(() => {
    invokeResponse = convertToStream(
      normalizePayload(invokeResponseBody)
    );

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockReturnValue(invokeResponse)
    });
  });

  it("should create a Lambda instance", async () => {
    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: "aws-getCart",
      fireAndForget: null,
      payload: {},
    };
    await sut.invoke<any>(params);
    expect(AWS.Lambda).toHaveBeenCalled();
  });

  it("should be called as fireAndWait by default", async () => {
    const payload = {};
    const options = {
      FunctionName: getCartAWSCloudService.arn,
      Payload: normalizePayload(payload),
      InvocationType: AWSInvokeType.fireAndWait
    };

    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: "aws-getCart",
      fireAndForget: null,
      payload: payload,
    };
    await sut.invoke<any>(params);
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
  });

  it("should return an empty response on fireAndForget", async () => {
    const payload = {};
    const options = {
      FunctionName: getCartAWSCloudService.arn,
      Payload: normalizePayload(payload),
      InvocationType: AWSInvokeType.fireAndForget
    };

    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: "aws-getCart",
      fireAndForget: true,
      payload: payload,
    };
    const response = await sut.invoke<any>(params);
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response).toBeUndefined();
  });

  it("should return data on fireAndWait", async () => {
    const payload = {};
    const options = {
      FunctionName: getCartAWSCloudService.arn,
      Payload: normalizePayload(payload),
      InvocationType: AWSInvokeType.fireAndWait
    };

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockReturnValue(invokeResponse)
    });

    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: "aws-getCart",
      fireAndForget: false,
      payload: payload,
    };
    const response = await sut.invoke<any>(params);
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response).toEqual(invokeResponseBody);
  });

  it("should throw an error if the stream fails", async () => {
    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockImplementation(() => {
        const file = new Readable({
          read() {}
        });
        setImmediate(() => file.emit("error", new Error("fail")));
        return file;
      })
    });

    const payload = {};
    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: "aws-getCart",
      fireAndForget: false,
      payload: payload,
    };

    await expect(sut.invoke<any>(params)).rejects.toThrow("fail");
  });

  it("should return an error if no name is passed", async () => {
    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: null,
      fireAndForget: false,
      payload: {},
    };

    await expect(sut.invoke<any>(params)).rejects.toMatch("Name is needed");
  });

  it("should return an error if no region or arn is passed", async () => {
    const awsUpdateCartApi: AWSCloudServiceOptions = {
      name: getCartAWSCloudService.name,
      arn: undefined,
      region: undefined,
    };

    container.bind(awsUpdateCartApi.name).toConstantValue(awsUpdateCartApi);

    const sut = new LambdaCloudService(context);
    const params: InvokeRequest = {
      name: "aws-getCart",
      fireAndForget: false,
      payload: {},
    };

    await expect(sut.invoke<any>(params)).rejects.toMatch("Region and ARN are needed for Lambda calls");
  });

});

describe("normalizePayload", () => {

  it("receives an input type different than an object and throws an error", () => {
    const input = "foo";
    expect(() => normalizePayload(input)).toThrow();
  })

  it("receives an input null and returns the normalized payload with null body", () => {
    const input = null;
    const output = ensureString({
      body: null
    });

    const sut = normalizePayload(input);

    expect(sut).toEqual(output);
    expect(typeof sut).toEqual("string");
  });

  it("receives an input without body property and returns the normalized payload with the input as body", () => {
    const input = {
      foo: "bar"
    };
    const output = ensureString({
      body: ensureString(input)
    });

    const sut = normalizePayload(input);

    expect(sut).toEqual(output);
    expect(typeof sut).toEqual("string");
  });

  it("receives an input with body property and returns the normalized payload", () => {
    const input = {
      requestContext: {
        authorizer: {
          principalId: 123
        }
      },
      body: {
        foo: "bar"
      }
    };
    const output = ensureString({
      ...input,
      body: ensureString(input.body)
    });

    const sut = normalizePayload(input);

    expect(sut).toEqual(output);
    expect(typeof sut).toEqual("string");
  });

});

describe("ensureString", () => {

  it("receives an input type string and returns the same value", () => {
    const input = "foo";

    const sut = ensureString(input);

    expect(sut).toEqual(input);
    expect(typeof sut).toEqual("string");
  });

  it("receives an input null and returns the same value as string", () => {
    const input = null;

    const sut = ensureString(input);

    expect(sut).toEqual(JSON.stringify(input));
    expect(typeof sut).toEqual("string");
  });

  it("receives an input type oject and returns the same value as JSON string", () => {
    const input = {
      foo: "bar"
    };

    const sut = ensureString(input);

    expect(sut).toEqual(JSON.stringify(input));
    expect(typeof sut).toEqual("string");
  });

});
