import { ProviderType, CloudProviderResponseHeader } from "@multicloud/sls-core";
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
    azureContext.res.headers["Content-Type"] = "application/json";
    let expectedHeaders = { "Content-Type": "application/json" };
    expectedHeaders[CloudProviderResponseHeader] = ProviderType.Azure;

    expect(azureContext.res.headers).toEqual(expectedHeaders);
  });

  it("should create res object", () => {
    const expectedObject = {
      body: {},
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    };

    const azureContext = createAzureContext(defaultParams);

    azureContext.res.headers["Content-Type"] = "application/json";
    azureContext.res.headers[CloudProviderResponseHeader] = ProviderType.Azure;
    azureContext.res.send({});

    expect(azureContext.res).toMatchObject(expectedObject);
  });

  it("flush() calls runtime callback when non-default output binding has not been defined", () => {
    const azureContext = createAzureContext(defaultParams);
    const doneSpy = jest.spyOn(azureContext.runtime.context, "done");

    azureContext.res.send("OK", 200);
    azureContext.flush();

    expect(azureContext.runtime.context.res).toEqual({});
    expect(doneSpy).toBeCalledWith(null, {
      headers: azureContext.res.headers,
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

    expect(doneSpy).not.toBeCalled();
    expect(azureContext.runtime.context.res).toEqual({
      headers: azureContext.runtime.context.res.headers,
      body: azureContext.runtime.context.res.body,
      status: azureContext.runtime.context.res.status,
    });
  });
});
