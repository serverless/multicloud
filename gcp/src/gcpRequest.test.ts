import { GcpContext, GcpRequest } from ".";
import gcpEvent from "./test/events/defaultGcpEvent.json";
import { StringParams } from "@multicloud/sls-core";

describe("test of request", () => {
  const context = {
    requestId: "12345",
    req: {},
    res: {}
  }

  it("should pass-through event values without modifications", () => {
    gcpEvent.body = JSON.stringify(gcpEvent.body);
    const request = new GcpRequest(new GcpContext([gcpEvent, context, null]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams(gcpEvent.headers));
    expect(request.query).toEqual(new StringParams(gcpEvent.query));
    expect(request.body).toEqual(JSON.parse(gcpEvent.body));
  });

  it("should use default value for body if not provided", () => {
    const noBodyEvent = Object.assign({}, gcpEvent);
    delete noBodyEvent.body;
    const request = new GcpRequest(new GcpContext([noBodyEvent, context, null]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams(gcpEvent.headers));
    expect(request.query).toEqual(new StringParams(gcpEvent.query));
    expect(request.body).toEqual(null);
  });

  it("should use default value for headers if not provided", () => {
    const noHeadersEvent = Object.assign({}, gcpEvent);
    delete noHeadersEvent.headers;
    noHeadersEvent.body = JSON.stringify(noHeadersEvent.body);
    const request = new GcpRequest(new GcpContext([noHeadersEvent, context, null]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams());
    expect(request.query).toEqual(new StringParams(gcpEvent.query));
    expect(request.body).toEqual(JSON.parse(noHeadersEvent.body));
  });

  it("should use default value for query if not provided", () => {
    const noQueryEvent = Object.assign({}, gcpEvent);
    delete noQueryEvent.query;
    noQueryEvent.body = JSON.stringify(noQueryEvent.body);
    const request = new GcpRequest(new GcpContext([noQueryEvent, context, null]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams(gcpEvent.headers));
    expect(request.query).toEqual(new StringParams());
    expect(request.body).toEqual(JSON.parse(noQueryEvent.body));
  });

  it("should set context defaults if context content are empty objects", () => {
    const emptyParams = new StringParams();
    const emptygcpEvent = {
      method: "GET"
    };

    const request = new GcpRequest(new GcpContext([emptygcpEvent, context, null]));

    expect(request.method).toEqual("GET");
    expect(request.headers).toEqual(emptyParams);
    expect(request.query).toEqual(emptyParams);
    expect(request.body).toEqual(null);
  });
});
