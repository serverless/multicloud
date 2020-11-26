import { GcpContext, GcpRequest } from ".";
import gcpEvent from "./test/events/defaultGcpEvent.json";
import { StringParams } from "@multicloud/sls-core";
import { DOMParser } from "xmldom";

describe("test of request", () => {

  it("should pass-through event values without modifications", () => {
    //let gcpEvent.body = JSON.stringify(gcpEvent.body);
    const request = new GcpRequest(new GcpContext([gcpEvent,{},{}]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams(gcpEvent.headers));
    expect(request.query).toEqual(new StringParams(gcpEvent.query));
    expect(request.body).toEqual(JSON.parse(gcpEvent.body));
  });

  it("should use default value for body if not provided", () => {
    const noBodyEvent = Object.assign({}, gcpEvent);
    delete noBodyEvent.body;
    const request = new GcpRequest(new GcpContext([noBodyEvent, {}, {}]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams(gcpEvent.headers));
    expect(request.query).toEqual(new StringParams(gcpEvent.query));
    expect(request.body).toEqual(null);
  });

  it("should send a format error for xml body", () => {
    let gcpEventXml =  Object.assign({}, gcpEvent);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString("<MyTestElement/>","text/xml");
    gcpEventXml.body = { body: xmlDoc };
    const gcpContext = new GcpContext([gcpEventXml, {}, {}])
    try {
      new GcpRequest(gcpContext);
    } catch (e) {
      expect(e).toMatchObject({
        error: "Format not supported. The supported response types are JSON and text.",
        status: 400,
      });
    }
  });

  it("should use default value for headers if not provided", () => {
    const noHeadersEvent = Object.assign({}, gcpEvent);
    delete noHeadersEvent.headers;
    const request = new GcpRequest(new GcpContext([noHeadersEvent, {}, {}]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams());
    expect(request.query).toEqual(new StringParams(gcpEvent.query));
    expect(request.body).toEqual(JSON.parse(noHeadersEvent.body));
  });

  it("should use default value for query if not provided", () => {
    const noQueryEvent = Object.assign({}, gcpEvent);
    delete noQueryEvent.query;
    noQueryEvent.body = JSON.stringify(noQueryEvent.body);
    const request = new GcpRequest(new GcpContext([noQueryEvent, {}, {}]));
    expect(request.method).toEqual(gcpEvent.method);
    expect(request.headers).toEqual(new StringParams(gcpEvent.headers));
    expect(request.query).toEqual(new StringParams());
    expect(request.body).toEqual(JSON.parse(noQueryEvent.body));
  });

  it("should set context defaults if context content are empty objects", () => {
    const emptyParams = new StringParams();
    const emptygcpEvent = {
      _readableState : { highWaterMark: 1 }
    };

    const request = new GcpRequest(new GcpContext([emptygcpEvent, {}, {}]));

    expect(request.method).toEqual("");
    expect(request.headers).toEqual(emptyParams);
    expect(request.query).toEqual(emptyParams);
    expect(request.body).toEqual(null);
  });
});
