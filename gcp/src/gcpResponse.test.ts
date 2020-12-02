import { CloudProviderResponseHeader } from "@multicloud/sls-core";
import { GcpContext, GcpRequest, GcpResponse } from ".";
import { DOMParser } from "xmldom";

describe("Gcp Response", () => {
  const defaultParams: any[] = [
    { _readableState: { highWaterMark: expect.any(String) },
      headers: { "x-appengine-request-log-id": "123" } },
    {},
    jest.fn(() => null),
  ];

  const createGcpContext = (args): GcpContext => {
    const context = new GcpContext(args);
    context.req = new GcpRequest(context);
    context.res = new GcpResponse(context);
    return context;
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should passthrough headers value without modifications", () => {
    const gcpContext = createGcpContext(defaultParams);

    const res = new GcpResponse(gcpContext);

    expect(res.headers).toEqual(gcpContext.res.headers);
  });

  it("should passthrough body value withouth modifications", () => {
    const body = {
      firstKey: "body",
      secondKey: 123,
      thirdKey: {}
    };

    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.send(body);

    expect(JSON.parse(gcpContext.res.body)).toEqual(body);
    expect(gcpContext.res.status).toEqual(200);
  });

  it("should have status = 200", () => {
    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.send({});

    expect(gcpContext.res.status).toEqual(200);
    expect(gcpContext.res.headers.has("Content-Type"));
    expect(gcpContext.res.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to application/json for JSON objects", () => {
    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.send({});

    expect(gcpContext.res.headers.has("Content-Type"));
    expect(gcpContext.res.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to text/html for string object", () => {
    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.send("<div>hello</div>");

    expect(gcpContext.res.headers.has("Content-Type"));
    expect(gcpContext.res.headers.get("Content-Type")).toEqual("text/html");
  });

  it("should set content-type to application/json for array object", () => {
    const gcpContext = createGcpContext(defaultParams);
    gcpContext.res.send([]);

    expect(gcpContext.res.headers.has("Content-Type"));
    expect(gcpContext.res.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should have status = 400", () => {
    const expectedStatusStatus = 400;
    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.send({}, expectedStatusStatus);

    expect(gcpContext.res.status).toEqual(expectedStatusStatus);
  });

  it("should have headers value empty object", () => {
    const gcpContext = createGcpContext(defaultParams);
    gcpContext.res.headers.set("Content-Type", "application/json");

    expect(gcpContext.res.headers.get(CloudProviderResponseHeader)).toEqual("gcp");
    expect(gcpContext.res.headers.get("content-type")).toEqual("application/json");
  });

  it("should set properties on res object", () => {
    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.headers.set("Content-Type", "application/json");
    gcpContext.res.send({});
    expect(gcpContext.res.headers.get("x-sls-cloud-provider")).toEqual("gcp");
    expect(gcpContext.res.headers.get("Content-Type")).toEqual(
      "application/json"
    );
    expect(gcpContext.res.body).toEqual("{}");
    expect(gcpContext.res.status).toEqual(200);
  });

  it("send with xml object should send an Format error", () => {
    const gcpContext = createGcpContext(defaultParams);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString("<MyTestElement/>", "text/xml");
    try {
      gcpContext.res.send(xmlDoc);
    } catch (e) {
      expect(e).toMatchObject({
        error:
          "Format not supported. The supported response types are JSON and text.",
        status: 400,
      });
    }
  });

  it("send with empty body should default to null value", () => {
    const gcpContext = createGcpContext(defaultParams);

    gcpContext.res.send();
    expect(gcpContext.res.headers.get("x-sls-cloud-provider")).toEqual("gcp");
    expect(gcpContext.res.body).toEqual(null);
    expect(gcpContext.res.status).toEqual(200);
  });

  it("flush() calls Gcp runtime callback", () => {
    const callback = {
      status: jest.fn().mockReturnValue({
        send: jest.fn()
      }),
      set: jest.fn()
    }
    const context = new GcpContext([
      { _readableState: { highWaterMark: "1" },
        headers: { "x-appengine-request-log-id": "123" }},
      callback,
      {},
    ]);
    context.res = new GcpResponse(context);
    const spyFlush = jest.spyOn(context.res, "flush");
    context.done = jest.fn();

    const body = "OK";
    const status = 200;

    context.send(body, status);
    context.flush();
    expect(spyFlush).toBeCalled();
  });
});
