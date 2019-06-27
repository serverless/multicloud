import { AzureResponse } from "./azureResponse";

describe("test of response", () => {
  it("should passthrough headers value withouth modifications", done => {
    const azureContext = {
      res: {
        headers: {
          firstKey: "body",
          secondKey: 123,
          thirdKey: {}
        }
      }
    };

    const sut = new AzureResponse(azureContext);

    expect(sut.headers).toEqual(azureContext.res.headers);
    done();
  });

  it("should have status = 200", done => {
    const defaultStatusValue = 200;

    const azureContext = {
      res: {
      }
    };

    const sut = new AzureResponse(azureContext);
    sut.send({});

    expect(defaultStatusValue).toEqual(sut.context.res.status);
    done();
  });

  it("should have status = 400", done => {
    const expectedStatusStatus = 400;

    const azureContext = {
      res: {
      }
    };

    const sut = new AzureResponse(azureContext);
    sut.send({}, expectedStatusStatus);

    expect(expectedStatusStatus).toEqual(sut.context.res.status);
    done();
  });

  it("should passthrough body value withouth modifications", done => {
    const body = {
      firstKey: "body",
      secondKey: 123,
      thirdKey: {}
    };

    const azureContext = {
      res: {
        body: null
      }
    };

    const sut = new AzureResponse(azureContext);
    sut.send(body);

    expect(body).toEqual(sut.context.res.body.message);
    done();
  });

  it("should have headers value empty object", done => {
    const azureContext = {
      res: {}
    };

    const sut = new AzureResponse(azureContext);

    expect(sut.headers).toEqual({});
    done();
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

    const azureContext = {
      res: {}
    };

    const sut = new AzureResponse(azureContext);
    sut.send({});

    expect(expectedObject).toEqual(sut.context.res);
    done();
  });
});
