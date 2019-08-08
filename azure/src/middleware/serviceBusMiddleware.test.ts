import { ServiceBusMiddleware } from ".";
import { Middleware, CloudContext } from "@multicloud/sls-core";
import { AzureContext } from "..";

describe("Service Bus Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = ServiceBusMiddleware();
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
          invocationId: "db9752bd-8380-4e18-9b71-469b66921e67",
          deliveryCount: 1,
          lockToken: "6a4b609e-5987-445c-b0e2-74fc00c671ca",
          expiresAtUtc: "2019-08-16T22:41:33.403Z",
          enqueuedTimeUtc: "2019-08-02T22:41:33.403Z",
          messageId: "e91fb2da-2da9-4286-8ae6-c2f6fa110353",
          sequenceNumber: 7,
          label: "Service Bus Explorer",
          userProperties:
          {
            machineName: "XYZ123",
            userName: "somebody",
            "x-opt-enqueue-sequence-number": 0
          },
          messageReceiver:
          {
            registeredPlugins: [],
            receiveMode: 0,
            prefetchCount: 0,
            lastPeekedSequenceNumber: 0,
            path: "sample-queue",
            operationTimeout: "00:01:00",
            serviceBusConnection: [Object],
            isClosedOrClosing: false,
            clientId: "MessageReceiver5sample-queue",
            retryPolicy: [Object]
          },
          sys:
          {
            methodName: "serviceBusQueueHandler",
            utcNow: "2019-08-02T22:41:33.6505599Z",
            randGuid: "36e00190-8916-46bf-8d08-767bfceac1bb"
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
        id: runtimeArgs[0].bindingData.messageId,
        body: originalEvent,
        timestamp: expect.any(Date),
        eventSource: "azure:serviceBus",
      }]
    })
    expect(next).toBeCalled();
  });
});
