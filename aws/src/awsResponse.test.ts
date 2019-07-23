import { AwsContext, AwsResponse } from ".";

describe("test of response", () => {
  const context = {
    requestId: "12345"
  }

  it("should have headers value empty object", async () => {
    const emptyAWSEvent = {};
    const sut = new AwsResponse(new AwsContext([emptyAWSEvent, context, null]));
    expect(sut.headers).toEqual({});
  });

  it("should call AWS callback when send is called", async () => {
    const httpRequest = {};
    const awsContext = {};
    const callback = jest.fn();
    const context = new AwsContext([httpRequest, awsContext, callback]);
    const response = new AwsResponse(context);

    const httpBody = "test";
    const httpStatus = 200;

    response.headers["Content-Type"] = "application/json";
    response.send(httpBody, httpStatus);

    expect(callback).toBeCalledWith(null, {
      headers: response.headers,
      body: httpBody,
      status: httpStatus
    });
  });

  it("should stringify the body if complex object", () => {
    const httpRequest = {};
    const awsContext = {};
    const callback = jest.fn();
    const context = new AwsContext([httpRequest, awsContext, callback]);
    const response = new AwsResponse(context);
    const jsonBody = { foo: "bar" };

    response.send(jsonBody, 200);

    expect(callback).toBeCalledWith(null, {
      headers: response.headers,
      body: JSON.stringify(jsonBody),
      status: 200,
    });
  });
});
