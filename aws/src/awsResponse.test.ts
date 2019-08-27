import { ProviderType, CloudProviderResponseHeader } from "@multicloud/sls-core";
import { AwsContext, AwsResponse } from ".";

describe("test of response", () => {
  const context = {
    requestId: "12345"
  }

  it("should have headers value empty object", async () => {
    const emptyAWSEvent = {};
    const response = new AwsResponse(new AwsContext([emptyAWSEvent, context, null]));
    expect(response.headers.get(CloudProviderResponseHeader)).toEqual(ProviderType.AWS);
  });

  it("send() should set response body & status", async () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    const httpBody = "test";
    const httpStatus = 200;

    response.send(httpBody, httpStatus);

    expect(response.headers.get(CloudProviderResponseHeader)).toEqual(ProviderType.AWS);
    expect(response.body).toEqual(httpBody);
    expect(response.status).toEqual(httpStatus);
  });

  it("should set content-type to application/json for JSON objects", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    response.send({
      a: 1,
      b: 2,
      c: 3
    });

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to text/html for string object", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    response.send("<div>hello</div>");

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual("text/html");
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
