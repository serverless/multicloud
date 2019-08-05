import { EventHubMiddleware } from ".";
import { Middleware, CloudContext } from "@multicloud/sls-core";
import { AzureContext } from "..";

describe("Event Hub Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = EventHubMiddleware();
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
        bindingData: {
          invocationId: "16334991-5501-4ad1-8bea-73963b5b34d2",
          partitionContext:
          {
            consumerGroupName: "$Default",
            eventHubPath: "sample-hub",
            partitionId: "1",
            owner: "6222b738-45e4-4c7d-b2bc-9e9e93a11906",
          },
          partitionKey: "e084e59c-6dc2-4aa8-8bd8-9641b41aeaea",
          offset: 168,
          sequenceNumber: 1,
          enqueuedTimeUtc: "2019-08-02T23:07:31.247Z",
          properties: { machineName: "XYZ123", userName: "somebody" },
          systemProperties:
          {
            "x-opt-partition-key": "e084e59c-6dc2-4aa8-8bd8-9641b41aeaea",
            "x-opt-sequence-number": 1,
            "x-opt-offset": "168",
            "x-opt-enqueued-time": "2019-08-02T23:07:31.247Z",
            sequenceNumber: 1,
            offset: "168",
            partitionKey: "e084e59c-6dc2-4aa8-8bd8-9641b41aeaea",
            enqueuedTimeUtc: "2019-08-02T23:07:31.247Z"
          },
          sys:
          {
            methodName: "eventhub",
            utcNow: "2019-08-02T23:07:41.4900331Z",
            randGuid: "e27d1565-741b-443a-959d-b708b5f8600d"
          }
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
        id: runtimeArgs[0].bindingData.sequenceNumber,
        partitionKey: runtimeArgs[0].bindingData.partitionKey,
        offset: runtimeArgs[0].bindingData.offset,
        properties: runtimeArgs[0].bindingData.properties,
        body: originalEvent,
        timestamp: expect.any(Date),
        eventSource: "azure:eventHub",
      }]
    })
    expect(next).toBeCalled();
  });
});
