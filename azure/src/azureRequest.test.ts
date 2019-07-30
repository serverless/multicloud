import { AzureContext, AzureRequest, AzureResponse } from ".";

describe("test of request", () => {
  const runtimeContext = {
    invocationId: "ABC123",
    bindingDefinitions: [],
    req: {},
    res: {}
  };

  const createAzureContext = (args): AzureContext => {
    const context = new AzureContext(args);
    context.req = new AzureRequest(context);
    context.res = new AzureResponse(context);
    return context;
  };

  it("should passthrough body value without modifications", () => {
    const azureContext = createAzureContext([
      {
        ...runtimeContext,
        req: {
          body: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
      }
    ]);

    const sut = new AzureRequest(azureContext);

    expect(sut.body).toEqual(azureContext.req.body);
  });

  it("should passthrough headers value without modifications", () => {
    const azureContext = createAzureContext([
      {
        ...runtimeContext,
        req: {
          headers: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
      }
    ]);

    const sut = new AzureRequest(azureContext);
    expect(sut.headers).toEqual(azureContext.req.headers);
  });

  it("should passthrough method value without modifications", () => {
    const azureContext = createAzureContext([
      {
        ...runtimeContext,
        req: {
          method: "GET"
        },
      }
    ]);

    const sut = new AzureRequest(azureContext);
    expect(sut.method).toEqual(azureContext.req.method);
  });

  it("should  passthrough query value without modifications", () => {
    const azureContext = createAzureContext([
      {
        ...runtimeContext,
        req: {
          query: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
      }
    ]);

    const sut = new AzureRequest(azureContext);
    expect(sut.query).toEqual(azureContext.req.query);
  });

  it("should check if context content are empty objects", () => {
    const azureContext = createAzureContext([runtimeContext]);
    const request = new AzureRequest(azureContext);

    expect(request.body).toEqual({});
    expect(request.headers).toEqual({});
    expect(request.method).toEqual("");
    expect(request.query).toEqual({});
  });
});
