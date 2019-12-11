import { AzureContext, AzureRequest, AzureResponse } from ".";
import { StringParams } from "@multicloud/sls-core";

describe("test of request", () => {
  const runtimeContext = {
    invocationId: "ABC123",
    bindingDefinitions: [],
    req: {
      method: "GET",
    },
    res: {},
    log: {},
  };

  const createAzureContext = (args): AzureContext => {
    const context = new AzureContext(args);
    context.req = new AzureRequest(context);
    context.res = new AzureResponse(context);

    return context;
  };

  it("should passthrough body value without modifications", () => {
    const runtimeArgs = [
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
    ];

    const azureContext = createAzureContext(runtimeArgs);

    expect(azureContext.req.body).toEqual(runtimeArgs[0].req.body);
  });

  it("should passthrough headers value without modifications", () => {
    const runtimeArgs = [
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
    ]

    const expectedHeaders = new StringParams(runtimeArgs[0].req.headers);
    const azureContext = createAzureContext(runtimeArgs);

    expect(azureContext.req.headers).toEqual(expectedHeaders);
  });

  it("should passthrough pathParms value without modification", () => {
    const runtimeArgs = [{
      ...runtimeContext,
      req: {
        params: {
          categoryId: 1,
          productId: 2
        }
      }
    }];

    const expectedParams = new StringParams(runtimeArgs[0].req.params);
    const azureContext = createAzureContext(runtimeArgs);

    expect(azureContext.req.pathParams).toEqual(expectedParams);
  });

  it("should passthrough method value without modifications", () => {
    const runtimeArgs = [
      {
        ...runtimeContext,
        req: {
          method: "GET"
        },
      }
    ];

    const azureContext = createAzureContext(runtimeArgs);
    expect(azureContext.req.method).toEqual(runtimeArgs[0].req.method);
  });

  it("should passthrough query value without modifications", () => {
    const runtimeArgs = [
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
    ];

    const azureContext = createAzureContext(runtimeArgs);
    const expectedQueryParams = new StringParams(runtimeArgs[0].req.query);

    expect(azureContext.req.query).toEqual(expectedQueryParams);
  });

  it("should passthrough expected path value without modifications", () => {
    let expectedPath = "/path1/path2";
    let url = `http://test.com${expectedPath}`;
    const runtimeArgs = [
      {
        ...runtimeContext,
        req: {
          event: {
            url: url
          }
        },
      }
    ];

    let azureContext = createAzureContext(runtimeArgs);
    expect(azureContext.req.path).toEqual(expectedPath);

    runtimeArgs[0].req.event.url = url.replace(expectedPath, "");
    azureContext = createAzureContext(runtimeArgs);
    expect(azureContext.req.path).toEqual("/");
  });

  it("should passthrough an empty path value cause of an invalid/unexisting url", () => {
    const expectedPath = "";
    const runtimeArgs = [
      {
        ...runtimeContext,
        req: {
          event: {
            url: "invalid url"
          }
        },
      }
    ];
    let azureContext = createAzureContext(runtimeArgs);
    expect(azureContext.req.path).toEqual(expectedPath);

    delete runtimeArgs[0].req.event.url;
    azureContext = createAzureContext(runtimeArgs);
    expect(azureContext.req.path).toEqual(expectedPath);

    delete runtimeArgs[0].req.event;
    azureContext = createAzureContext(runtimeArgs);
    expect(azureContext.req.path).toEqual(expectedPath);
  });

  it("should check if context content are empty objects", () => {
    const azureContext = createAzureContext([runtimeContext]);
    const emptyParams = new StringParams();

    expect(azureContext.req.method).toEqual("GET");
    expect(azureContext.req.headers).toEqual(emptyParams);
    expect(azureContext.req.query).toEqual(emptyParams);
    expect(azureContext.req.body).toBeNull();
  });
});
