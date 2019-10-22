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

    response.send({ body: httpBody, status: httpStatus });

    expect(response.headers.get(CloudProviderResponseHeader)).toEqual(ProviderType.AWS);
    expect(response.body).toEqual(httpBody);
    expect(response.status).toEqual(httpStatus);
  });

  it("should set content-type to application/json by default", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    response.send();

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to application/json for JSON objects", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    response.send({
      body: {
        a: 1,
        b: 2,
        c: 3
      }
    });

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to application/json for array object", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);
    response.send({ body: ["a", "b", "c"] });

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to text/html for string object", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    response.send({ body: "<div>hello</div>" });

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual("text/html");
  });

  it("should set content-type to content-type received for buffer", () => {
    const response = new AwsResponse(
      new AwsContext([{}, {}])
    );
    const contentType = "image/jpg";

    response.send({
      body: new Buffer("hello"),
      status: 200,
      headers: {
        "Content-Type": contentType
      }
    });

    expect(response.headers.has("Content-Type"));
    expect(response.headers.get("Content-Type")).toEqual(contentType);
  });

  it("should set headers on response", () => {
    const context = new AwsContext([{}, {}]);
    context.res = new AwsResponse(context);

    const expectedHeaders = {
      "x-header-1": "header1",
      "x-header-2": "header2"
    };

    context.res.send({
      headers: expectedHeaders
    });

    expect(context.res.headers.get("x-header-1")).toEqual(expectedHeaders["x-header-1"]);
    expect(context.res.headers.get("x-header-2")).toEqual(expectedHeaders["x-header-2"])
  });

  it("send() should stringify the body if complex object", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);
    const jsonBody = { foo: "bar" };

    response.send({ body: jsonBody, status: 200 });

    expect(response.body).toEqual(JSON.stringify(jsonBody));
    expect(response.status).toEqual(200);
  });

  it("send() should not set the body if null", () => {
    const context = new AwsContext([{}, {}]);
    const response = new AwsResponse(context);

    response.send();

    expect(response.body).toBeUndefined();
    expect(response.status).toEqual(200);
  });

  it("send() should encode to base64 the body if buffer object", () => {
    const response = new AwsResponse(
      new AwsContext([{}, {}])
    );
    const expectedContentType = "image/jpg";
    const body = new Buffer("hello");

    response.send({
      body,
      status: 200,
      headers: {
        "Content-Type": expectedContentType
      }
    });

    expect(response.body).toEqual(new Buffer(body).toString("base64"));
  });

  it("flush() calls AWS runtime callback with correct parameters", () => {
    const callback = jest.fn();
    const context = new AwsContext([{}, {}, callback]);
    const response = new AwsResponse(context);

    const body = "OK";
    const status = 200;

    response.send({ body, status });
    response.flush();

    expect(callback).toBeCalledWith(
      null,
      {
        headers: response.headers.toJSON(),
        body: response.body,
        statusCode: response.status
      }
    );
  });

  it("flush() calls AWS runtime callback with isBase64Encoded parameter set to true", () => {
    const callback = jest.fn();
    const context = new AwsContext([{}, {}, callback]);
    const response = new AwsResponse(context);

    const body = new Buffer("hello");
    const status = 200;

    response.send({ body, status });
    response.flush();

    expect(callback).toBeCalledWith(
      null,
      {
        headers: response.headers.toJSON(),
        body: response.body,
        statusCode: response.status,
        isBase64Encoded: true
      }
    );
  });
});
