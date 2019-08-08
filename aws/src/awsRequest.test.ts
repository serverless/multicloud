import { AwsContext, AwsRequest } from ".";
import awsEvent from "./test/events/defaultAwsEvent.json";
import { StringParams } from "@multicloud/sls-core";

describe("test of request", () => {
  const context = {
    requestId: "12345",
    req: {},
    res: {}
  }

  it("should pass-through event values without modifications", () => {
    awsEvent.body = JSON.stringify(awsEvent.body);
    const request = new AwsRequest(new AwsContext([awsEvent, context, null]));
    expect(request.method).toEqual(awsEvent.httpMethod);
    expect(request.headers).toEqual(new StringParams(awsEvent.headers));
    expect(request.query).toEqual(new StringParams(awsEvent.queryStringParameters));
    expect(request.body).toEqual(JSON.parse(awsEvent.body));
  });

  it("should use default value for body if not provided", () => {
    const noBodyEvent = Object.assign({}, awsEvent);
    delete noBodyEvent.body;
    const request = new AwsRequest(new AwsContext([noBodyEvent, context, null]));
    expect(request.method).toEqual(awsEvent.httpMethod);
    expect(request.headers).toEqual(new StringParams(awsEvent.headers));
    expect(request.query).toEqual(new StringParams(awsEvent.queryStringParameters));
    expect(request.body).toEqual(null);
  });

  it("should use default value for headers if not provided", () => {
    const noHeadersEvent = Object.assign({}, awsEvent);
    delete noHeadersEvent.headers;
    noHeadersEvent.body = JSON.stringify(noHeadersEvent.body);
    const request = new AwsRequest(new AwsContext([noHeadersEvent, context, null]));
    expect(request.method).toEqual(awsEvent.httpMethod);
    expect(request.headers).toEqual(new StringParams());
    expect(request.query).toEqual(new StringParams(awsEvent.queryStringParameters));
    expect(request.body).toEqual(JSON.parse(noHeadersEvent.body));
  });

  it("should use default value for query if not provided", () => {
    const noQueryEvent = Object.assign({}, awsEvent);
    delete noQueryEvent.queryStringParameters;
    noQueryEvent.body = JSON.stringify(noQueryEvent.body);
    const request = new AwsRequest(new AwsContext([noQueryEvent, context, null]));
    expect(request.method).toEqual(awsEvent.httpMethod);
    expect(request.headers).toEqual(new StringParams(awsEvent.headers));
    expect(request.query).toEqual(new StringParams());
    expect(request.body).toEqual(JSON.parse(noQueryEvent.body));
  });

  it("should set context defaults if context content are empty objects", () => {
    const emptyParams = new StringParams();
    const emptyAWSEvent = {
      httpMethod: "GET"
    };

    const request = new AwsRequest(new AwsContext([emptyAWSEvent, context, null]));

    expect(request.method).toEqual("GET");
    expect(request.headers).toEqual(emptyParams);
    expect(request.query).toEqual(emptyParams);
    expect(request.body).toEqual(null);
  });
});
