import { StorageBlobMiddleware } from ".";
import { Middleware, CloudContext } from "@multicloud/sls-core";
import { AzureContext } from "..";
import { Stream } from "stream";

describe("Storage Queue Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = StorageBlobMiddleware();
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
    const testMessage = "this is a test";
    const originalEvent = Buffer.from(testMessage);
    const runtimeArgs: any[] = [
      {
        invocationID: "ID123",
        log: {},
        bindingData: {
          id: "ABC123",
          blobTrigger: "container/item.txt",
          insertionTime: new Date().toUTCString(),
          properties: {
            contentType: "text/plain",
            length: 123,
            lastModified: "2019-08-05T23:58:10+00:00"
          }
        },
        bindingDefinitions: [],
      },
      originalEvent,
    ];

    const next = jest.fn();
    const context = new AzureContext(runtimeArgs);
    await middleware(context, next);

    const actualBody = await streamToString(context.event.records[0].body);

    expect(actualBody).toEqual(testMessage);
    expect(context.event).toEqual({
      records: [{
        id: runtimeArgs[0].bindingData.blobTrigger,
        contentType: runtimeArgs[0].bindingData.properties.contentType,
        length: runtimeArgs[0].bindingData.properties.length,
        properties: runtimeArgs[0].bindingData.properties,
        body: expect.anything(),
        timestamp: expect.any(Date),
        eventSource: "azure:storageBlob",
      }]
    })
    expect(next).toBeCalled();
  });
});

function streamToString(stream: Stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}
