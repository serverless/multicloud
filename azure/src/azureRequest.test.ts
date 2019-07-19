import { AzureContext, AzureRequest, AzureResponse } from ".";

describe("test of request", () => {
  const createAzureContext = (args): AzureContext => {
    const context = new AzureContext(args);
    context.req = new AzureRequest(context);
    context.res = new AzureResponse(context);
    return context;
  };

  it("should passthrough body value without modifications", () => {
    const azureContext = createAzureContext([
      {
        req: {
          body: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
        res: {}
      }
    ]);

    const sut = new AzureRequest(azureContext);

    expect(sut.body).toEqual(azureContext.req.body);
  });

  it("should passthrough headers value without modifications", () => {
    const azureContext = createAzureContext([
      {
        req: {
          headers: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
        res: {}
      }
    ]);

    const sut = new AzureRequest(azureContext);
    expect(sut.headers).toEqual(azureContext.req.headers);
  });

  it("should passthrough method value without modifications", () => {
    const azureContext = createAzureContext([
      {
        req: {
          method: "GET"
        },
        res: {}
      }
    ]);

    const sut = new AzureRequest(azureContext);
    expect(sut.method).toEqual(azureContext.req.method);
  });

  it("should  passthrough query value without modifications", () => {
    const azureContext = createAzureContext([
      {
        req: {
          query: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        },
        res: {}
      }
    ]);

    const sut = new AzureRequest(azureContext);
    expect(sut.query).toEqual(azureContext.req.query);
  });

  it("should check if context content are empty objects", () => {
    const azureContext = createAzureContext([
      {
        req: {},
        res: {}
      }
    ]);

    const sut = new AzureRequest(azureContext);

    expect(sut.body).toEqual({});
    expect(sut.headers).toEqual({});
    expect(sut.method).toEqual("");
    expect(sut.query).toEqual({});
  });
});
