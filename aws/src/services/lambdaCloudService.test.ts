import AWS from "aws-sdk";
import { Readable } from "stream";
import { LambdaCloudService, AWSCloudServiceOptions, AWSInvokeType } from ".";
import { CloudContainer, CloudContext, CloudContextBuilder, convertToStream } from "@multicloud/sls-core";

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
      JSON.stringify({
        body: JSON.stringify(invokeResponseBody)
      })
    );

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockReturnValue(invokeResponse)
    });
  });

  it("should create a Lambda instance", async () => {
    const sut = new LambdaCloudService(context);
    await sut.invoke<any>("aws-getCart", null, {});
    expect(AWS.Lambda).toHaveBeenCalled();
  });

  it("should be called as fireAndWait by default", async () => {
    const payload = {};
    const options = {
      FunctionName: getCartAWSCloudService.arn,
      Payload: JSON.stringify({ body: payload }),
      InvocationType: AWSInvokeType.fireAndWait
    };

    const sut = new LambdaCloudService(context);
    await sut.invoke<any>("aws-getCart", null, payload);
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
  });

  it("should return an empty response on fireAndForget", async () => {
    const payload = {};
    const options = {
      FunctionName: getCartAWSCloudService.arn,
      Payload: JSON.stringify({ body: payload }),
      InvocationType: AWSInvokeType.fireAndForget
    };

    const sut = new LambdaCloudService(context);
    const response = await sut.invoke<any>("aws-getCart", true, payload);
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response).toBeUndefined();
  });

  it("should return data on fireAndWait", async () => {
    const payload = {};
    const options = {
      FunctionName: getCartAWSCloudService.arn,
      Payload: JSON.stringify({ body: payload }),
      InvocationType: AWSInvokeType.fireAndWait
    };

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      createReadStream: jest.fn().mockReturnValue(invokeResponse)
    });

    const sut = new LambdaCloudService(context);
    const response = await sut.invoke<any>("aws-getCart", false, payload);
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

    await expect(sut.invoke<any>("aws-getCart", false, payload)).rejects.toThrow("fail");
  });

  it("should return an error if no name is passed", async () => {
    const sut = new LambdaCloudService(context);
    await expect(sut.invoke<any>(null, false, {})).rejects.toMatch("Name is needed");
  });

  it("should return an error if no region or arn is passed", async () => {
    const awsUpdateCartApi: AWSCloudServiceOptions = {
      name: getCartAWSCloudService.name,
      arn: undefined,
      region: undefined,
    };

    container.bind(awsUpdateCartApi.name).toConstantValue(awsUpdateCartApi);

    const sut = new LambdaCloudService(context);
    await expect(sut.invoke<any>("aws-getCart", false, {})).rejects.toMatch("Region and ARN are needed for Lambda calls");
  });

});
