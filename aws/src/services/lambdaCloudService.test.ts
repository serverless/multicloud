import AWS from "aws-sdk";
import { LambdaCloudService, AWSCloudServiceOptions, AWSInvokeType } from ".";
import { CloudContainer } from "@multicloud/sls-core";

jest.mock("aws-sdk");

const getCartAWSCloudService: AWSCloudServiceOptions = {
  name: "aws-getCart",
  region: "west-us-2",
  arn: "arn-west-us-2-getCart",
}

describe("LambdaCloudService", () => {
  let container: CloudContainer;
  let context;

  beforeAll(() => {
    container = new CloudContainer();
    context = {
      container
    }
    container.bind(getCartAWSCloudService.name).toConstantValue(getCartAWSCloudService);

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve)
    })
  });

  it("should create a Lambda instance", async () => {
    const sut = new LambdaCloudService(context);
    await sut.invoke<Promise<any>>("aws-getCart", null, {});
    expect(AWS.Lambda).toHaveBeenCalled();
  })

  it("should be called as fireAndWait by default", async () => {
    const options = {
      FunctionName: "arn-west-us-2-getCart",
      Payload: {},
      InvocationType: AWSInvokeType.fireAndWait
    }

    const sut = new LambdaCloudService(context);
    await sut.invoke<Promise<any>>("aws-getCart", null, {});
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
  })

  it("should return an empty response on fireAndForget", async () => {
    const options = {
      FunctionName: "arn-west-us-2-getCart",
      Payload: {},
      InvocationType: AWSInvokeType.fireAndForget
    }

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve({}))
    })

    const sut = new LambdaCloudService(context);
    const response = await sut.invoke<Promise<any>>("aws-getCart", true, {});
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response).toEqual({});
  })

  it("should return data on fireAndWait", async () => {
    const options = {
      FunctionName: "arn-west-us-2-getCart",
      Payload: {},
      InvocationType: AWSInvokeType.fireAndWait
    }

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve({ data: "some data" }))
    })

    const sut = new LambdaCloudService(context);
    const response = await sut.invoke<Promise<any>>("aws-getCart", false, {});
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response.data).toEqual("some data");
  })

  it("should return an error if no name is passed", async () => {
    const sut = new LambdaCloudService(context);
    try {
      await sut.invoke<Promise<any>>(null, false, {})
    } catch (err) {
      expect(err).toEqual(Error("Name is needed"));
    }
  })

  it("should return an error if no region or arn is passed", async () => {
    const awsUpdateCartApi: AWSCloudServiceOptions = {
      name: "aws-updateCart",
      arn: undefined,
      region: undefined,
    };

    container.bind(awsUpdateCartApi.name).toConstantValue(awsUpdateCartApi);

    const sut = new LambdaCloudService(context);
    const invoke = async () => await sut.invoke<Promise<any>>("aws-updateCart", false, {});
    await expect(invoke()).rejects.not.toBeNull();
  })
})
