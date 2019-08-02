import { ProviderType, CloudProviderResponseHeader } from "@multicloud/sls-core";
import { AwsContext, AwsResponse } from ".";

describe("test of response", () => {
  const context = {
    requestId: "12345"
  }

  it("should have headers value empty object", async () => {
    const emptyAWSEvent = {};
    const sut = new AwsResponse(new AwsContext([emptyAWSEvent, context, null]));
    expect(sut.headers[CloudProviderResponseHeader]).toEqual(ProviderType.AWS);
  });

  it("send() should set response body & status", async () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    const httpBody = "test";
    const httpStatus = 200;

    response.headers["Content-Type"] = "application/json";
    response.send(httpBody, httpStatus);

    expect(response.headers[CloudProviderResponseHeader]).toEqual(ProviderType.AWS);
    expect(response.body).toEqual(httpBody);
    expect(response.status).toEqual(httpStatus);
  });

  it("send() should stringify the body if complex object", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);
    const jsonBody = { foo: "bar" };

    response.send(jsonBody, 200);

    expect(response.body).toEqual(JSON.stringify(jsonBody));
    expect(response.status).toEqual(200);
  });

  it("flush() calls AWS runtime callback with correct parameters", () => {
    const callback = jest.fn();
    const context = new AwsContext([{}, {}, callback]);
    const response = new AwsResponse(context);

    const body = "OK";
    const status = 200;

    response.send(body, status);
    response.flush();

    expect(callback).toBeCalledWith(
      null,
      {
        headers: response.headers,
        body: response.body,
        statusCode: response.status,
      }
    );
  });
});
