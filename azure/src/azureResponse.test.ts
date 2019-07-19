import { AzureContext, AzureRequest, AzureResponse } from ".";

describe("test of response", () => {
  const defaultParams: any[] = [
    {
      req: {
        body: null
      },
      res: {}
    }
  ];

  const createAzureContext = (args): AzureContext => {
    const context = new AzureContext(args);
    context.req = new AzureRequest(context);
    context.res = new AzureResponse(context);
    return context;
  };

  it("should passthrough headers value withouth modifications", done => {
    const azureContext = createAzureContext([
      {
        req: {},
        res: {
          headers: {
            firstKey: "body",
            secondKey: 123,
            thirdKey: {}
          }
        }
      }
    ]);

    const sut = new AzureResponse(azureContext);

    expect(sut.headers).toEqual(azureContext.res.headers);
    done();
  });

  it("should have status = 200", done => {
    const defaultStatusValue = 200;

    const azureContext = createAzureContext(defaultParams);

    const sut = new AzureResponse(azureContext);
    sut.send({});

    expect(defaultStatusValue).toEqual(sut.runtime.res.status);
    done();
  });

  it("should have status = 400", done => {
    const expectedStatusStatus = 400;

    const azureContext = createAzureContext(defaultParams);
    const sut = new AzureResponse(azureContext);
    sut.send({}, expectedStatusStatus);

    expect(expectedStatusStatus).toEqual(sut.runtime.res.status);
    done();
  });

  it("should passthrough body value withouth modifications", done => {
    const body = {
      firstKey: "body",
      secondKey: 123,
      thirdKey: {}
    };

    const azureContext = createAzureContext(defaultParams);

    const sut = new AzureResponse(azureContext);
    sut.send(body);

    expect(body).toEqual(sut.runtime.res.body.message);
    done();
  });

  it("should have headers value empty object", () => {
    const azureContext = createAzureContext(defaultParams);
    const sut = new AzureResponse(azureContext);
    expect(sut.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("should create res object", done => {
    const expectedObject = {
      body: {
        message: {}
      },
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    };

    const azureContext = createAzureContext(defaultParams);

    const sut = new AzureResponse(azureContext);
    sut.send({});

    expect(expectedObject).toEqual(sut.runtime.res);
    done();
  });
});
