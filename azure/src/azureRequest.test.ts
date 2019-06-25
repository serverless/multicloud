import { AzureRequest } from "./azureRequest";

describe("test of request", () => {
  it("should passthrough body value without modifications", () => {
    const azureContext = {
      req: {
        body: {
          firstKey: "body",
          secondKey: 123,
          thirdKey: {}
        }
      }
    };

    const sut = new AzureRequest(azureContext);

    expect(sut.body).toEqual(azureContext.req.body);
  });

  it("should passthrough headers value without modifications", () => {
    const azureContext = {
      req: {
        headers: {
          firstKey: "body",
          secondKey: 123,
          thirdKey: {}
        }
      }
    };

    const sut = new AzureRequest(azureContext);
    expect(sut.headers).toEqual(azureContext.req.headers);
  });

  it("should passthrough method value without modifications", () => {
    const azureContext = {
      req: {
        method: "GET"
      }
    };

    const sut = new AzureRequest(azureContext);
    expect(sut.method).toEqual(azureContext.req.method);
  });

  it("should  passthrough query value without modifications", () => {
    const azureContext = {
      req: {
        query: {
          firstKey: "body",
          secondKey: 123,
          thirdKey: {}
        }
      }
    };

    const sut = new AzureRequest(azureContext);
    expect(sut.query).toEqual(azureContext.req.query);
  });

  it("should check if context content are empty objects", () => {
    const azureContext = {
      req: {}
    };

    const sut = new AzureRequest(azureContext);

    expect(sut.body).toEqual({});
    expect(sut.headers).toEqual({});
    expect(sut.method).toEqual({});
    expect(sut.query).toEqual({});
  });
});
