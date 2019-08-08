import { StorageQueueMiddleware } from ".";
import { Middleware, CloudContext } from "@multicloud/sls-core";
import { AzureContext } from "../";

describe("Storage Queue Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = StorageQueueMiddleware();
  });

  it("only runs during azure requests", async () => {
    const next = jest.fn();
    const originalEvent = {};
    const context: CloudContext = {
      id: "abc123",
      providerType: "unknown",
      event: originalEvent,
      done: jest.fn(),
      send: jest.fn(),
      flush: jest.fn(),
    };

    await middleware(context, next);

    expect(context.event).toBe(originalEvent);
    expect(next).toBeCalled();
  });

  it("transforms the azure event into a generic cloud message", async () => {
    const originalEvent = "test message";
    const runtimeArgs: any[] = [
      {
        invocationID: "ID123",
        log: {},
        bindingData: {
          id: "ABC123",
          insertionTime: new Date().toUTCString(),
        },
        bindingDefinitions: [],
      },
      originalEvent,
    ];

    const next = jest.fn();
    const context = new AzureContext(runtimeArgs);
    await middleware(context, next);

    expect(context.event).toEqual({
      records: [{
        id: runtimeArgs[0].bindingData.id,
        body: originalEvent,
        timestamp: expect.any(Date),
        eventSource: "azure:storageQueue",
      }]
    })
    expect(next).toBeCalled();
  });
});
