import { ProviderType, CloudProviderResponseHeader, StringParams } from "@multicloud/sls-core";
import { AzureContext, AzureRequest, AzureResponse } from ".";

describe("Azure Response", () => {
  const defaultParams: any[] = [
    {
      req: {
        body: null
      },
      res: {},
      bindingDefinitions: [{
        name: "$return",
        type: "http",
        direction: "out",
      }],
      done: jest.fn(),
      log: {},
    }
  ];

  const createAzureContext = (args): AzureContext => {
    const context = new AzureContext(args);
    context.req = new AzureRequest(context);
    context.res = new AzureResponse(context);

    return context;
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should passthrough headers value withouth modifications", () => {
    const azureContext = createAzureContext([
      {
        req: {},
        res: {
          headers: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
        log: {},
        bindingDefinitions: [],
      }
    ]);

    const sut = new AzureResponse(azureContext);

    expect(sut.headers).toEqual(azureContext.res.headers);
  });

  it("should have status = 200", () => {
    const defaultStatusValue = 200;
    const azureContext = createAzureContext(defaultParams);

    azureContext.res.send({});

    expect(azureContext.res.status).toEqual(defaultStatusValue);
    expect(azureContext.res.headers.has("Content-Type"));
    expect(azureContext.res.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to application/json for JSON objects", () => {
    const azureContext = createAzureContext(defaultParams);

    azureContext.res.send({
      a: 1,
      b: 2,
      c: 3
    });

    expect(azureContext.res.headers.has("Content-Type"));
    expect(azureContext.res.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to text/html for string object", () => {
    const azureContext = createAzureContext(defaultParams);

    azureContext.res.send("<div>hello</div>");

    expect(azureContext.res.headers.has("Content-Type"));
    expect(azureContext.res.headers.get("Content-Type")).toEqual("text/html");
  });

  it("should set content-type to application/json for array object", () => {
    const azureContext = createAzureContext(defaultParams);
    azureContext.res.send(["a", "b", "c"]);

    expect(azureContext.res.headers.has("Content-Type"));
    expect(azureContext.res.headers.get("Content-Type")).toEqual("application/json");
  });

  it("should set content-type to content-type received for buffer", () => {
    const azureContext = createAzureContext(defaultParams);
    const expectedContentType = "image/jpg";

    azureContext.res.send(new Buffer("hello"), 200, expectedContentType);

    expect(azureContext.res.headers.has("Content-Type"));
    expect(azureContext.res.headers.get("Content-Type")).toEqual(expectedContentType);
  });

  it("should have status = 400", () => {
    const expectedStatusStatus = 400;
    const azureContext = createAzureContext(defaultParams);

    azureContext.res.send({}, expectedStatusStatus);

    expect(azureContext.res.status).toEqual(expectedStatusStatus);
  });

  it("should passthrough body value withouth modifications", () => {
    const body = {
      firstKey: "body",
      secondKey: 123,
      thirdKey: {}
    };

    const azureContext = createAzureContext(defaultParams);

    azureContext.res.send(body);

    expect(azureContext.res.body).toEqual(body);
    expect(azureContext.res.status).toEqual(200);
  });

  it("should have headers value empty object", () => {
    const azureContext = createAzureContext(defaultParams);
    azureContext.res.headers.set("Content-Type", "application/json");

    expect(azureContext.res.headers.get(CloudProviderResponseHeader)).toEqual(ProviderType.Azure);
    expect(azureContext.res.headers.get("content-type")).toEqual("application/json");
  });

  it("should set properties on res object", () => {
    const azureContext = createAzureContext(defaultParams);

    azureContext.res.headers.set("Content-Type", "application/json");
    azureContext.res.send({});

    expect(azureContext.res).toMatchObject({
      body: {},
      headers: new StringParams({
        "Content-Type": "application/json",
        "x-sls-cloud-provider": "azure",
      }),
      status: 200
    });
  });

  it("send with empty body should default to null value", () => {
    const azureContext = createAzureContext(defaultParams);

    azureContext.res.send();
    expect(azureContext.res).toMatchObject({
      body: null,
      headers: expect.any(StringParams),
      status: 200,
    });
  });

  it("flush() calls runtime callback when non-default output binding has not been defined", () => {
    const azureContext = createAzureContext(defaultParams);
    const doneSpy = jest.spyOn(azureContext.runtime.context, "done");

    azureContext.res.send("OK", 200);
    azureContext.flush();

    expect(azureContext.runtime.context.res).toEqual({});
    expect(doneSpy).toBeCalledWith(null, {
      headers: azureContext.res.headers.toJSON(),
      body: azureContext.res.body,
      status: azureContext.res.status,
    });
  });

  it("flush() sets runtime.res when custom output binding has been defined", () => {
    const contextParams = [...defaultParams];
    // Example of custom output binding
    contextParams[0].bindingDefinitions = [{
      name: "res",
      type: "http",
      direction: "out",
    }];

    const azureContext = createAzureContext(contextParams);
    const doneSpy = jest.spyOn(azureContext.runtime.context, "done");

    azureContext.res.send("OK", 200);
    azureContext.flush();

    expect(doneSpy).toBeCalled();
    expect(azureContext.runtime.context.res).toEqual({
      headers: azureContext.runtime.context.res.headers,
      body: azureContext.runtime.context.res.body,
      status: azureContext.runtime.context.res.status,
    });
  });
});
