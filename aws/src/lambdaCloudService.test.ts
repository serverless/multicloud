import AWS from "aws-sdk";
import { LambdaCloudService, ContainerResolver } from "./lambdaCloudService";
import { AWSCloudServiceOptions } from "./awsCloudServiceOptions";
import { AWSInvokeType } from "./awsInvokeType";

jest.mock("aws-sdk");

class GetCartAWSCloudServiceContext implements AWSCloudServiceOptions {
  public name = "aws-getCart";
  public region = "west-us-2";
  public arn = "arn-west-us-2-getCart";
}

const resolver: ContainerResolver = {
  resolve: <T>(): T => {
    return (new GetCartAWSCloudServiceContext() as unknown) as T;
  }
}

describe("LambdaCloudService", () => {
  beforeAll(
    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve)
    })
  );

  it("should create a Lambda instance", async() => {
    const sut = new LambdaCloudService(resolver);
    await sut.invoke<Promise<any>>("aws-getCart",null, {});
    expect(AWS.Lambda).toHaveBeenCalled();
  })

  it("should be called as fireAndWait by default", async() => {
    const options = {
      FunctionName: "arn-west-us-2-getCart",
      Payload: {},
      InvocationType: AWSInvokeType.fireAndWait
    }

    const sut = new LambdaCloudService(resolver);
    await sut.invoke<Promise<any>>("aws-getCart", null, {});
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
  })

  it("should return an empty response on fireAndForget", async() => {
    const options = {
      FunctionName: "arn-west-us-2-getCart",
      Payload: {},
      InvocationType: AWSInvokeType.fireAndForget
    }

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve({}))
    })

    const sut = new LambdaCloudService(resolver);
    const response = await sut.invoke<Promise<any>>("aws-getCart", true, {});
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response).toEqual({});
  })

  it("should return data on fireAndWait", async() => {
    const options = {
      FunctionName: "arn-west-us-2-getCart",
      Payload: {},
      InvocationType: AWSInvokeType.fireAndWait
    }

    AWS.Lambda.prototype.invoke = jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue(Promise.resolve({data: "some data"}))
    })

    const sut = new LambdaCloudService(resolver);
    const response = await sut.invoke<Promise<any>>("aws-getCart", false, {});
    expect(AWS.Lambda.prototype.invoke).toHaveBeenCalledWith(options);
    expect(response.data).toEqual("some data");
  })

  it("should return an error if no name is passed", async() => {
    const sut = new LambdaCloudService(resolver);
    try {
      await sut.invoke<Promise<any>>(null, false, {})
    }catch (err) {
      expect(err).toEqual(Error("Name is needed"));
    }
  })

  it("should return an error if no region or arn is passed", async() => {
    class EmptyContainer implements AWSCloudServiceOptions {
      public name = undefined;
      public arn = undefined;
      public region = undefined;
    }

    const newResolver: ContainerResolver = {
      resolve: <T>(): T => {
        return (EmptyContainer as unknown) as T;
      }
    }
    const sut = new LambdaCloudService(newResolver);
    try {
      await sut.invoke<Promise<any>>("aws-updateCart", false, {})
    }catch (err) {
      expect(err).toEqual(Error("Region and ARN are needed for Lambda calls"));
    }
  })
})
