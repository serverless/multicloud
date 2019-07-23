import { AwsContext, AwsResponse } from ".";

describe("test of response", () => {
  it("should have headers value empty object", done => {
    const emptyAWSEvent = {};

    const sut = new AwsResponse(new AwsContext([emptyAWSEvent, null, null]));

    expect(sut.headers).toEqual({});
    done();
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
});
