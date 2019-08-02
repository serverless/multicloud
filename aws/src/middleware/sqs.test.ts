import { CloudContext, Middleware } from "@multicloud/sls-core";
import { SimpleQueueMiddleware } from ".";
import { AwsContext } from "../awsContext";

describe("Simple Storage Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = SimpleQueueMiddleware();
  });

  it("only runs for AWS requests", async () => {
    const next = jest.fn();
    const originalEvent = {};
    const context: CloudContext = {
      id: "abc123",
      providerType: "azure",
      event: originalEvent,
      done: jest.fn(),
      send: jest.fn(),
      flush: jest.fn(),
    };

    await middleware(context, next);

    expect(context.event).toBe(originalEvent);
    expect(next).toBeCalled();
  });

  it("transforms AWS events into normalized Cloud Messages", async () => {
    const originalEvent = {
      Records: [
        {
          messageId: "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
          receiptHandle: "MessageReceiptHandle",
          body: "Hello from SQS!",
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: "1523232000000",
            SenderId: "123456789012",
            ApproximateFirstReceiveTimestamp: "1523232000001"
          },
          messageAttributes: {},
          md5OfBody: "7b270e59b47ff90a553787216d55d91d",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
          awsRegion: "us-east-1"
        }
      ]
    };
    const runtimeArgs = [
      originalEvent,
      {
        awsRequestId: "ID123",
      },
    ];

    const next = jest.fn();
    const context = new AwsContext(runtimeArgs);
    await middleware(context, next);

    expect(context.event).toEqual({
      records: [{
        id: originalEvent.Records[0].messageId,
        body: originalEvent.Records[0].body,
        timestamp: expect.any(Date),
        eventSource: "aws:sqs",
      }]
    })
    expect(next).toBeCalled();
  });
});
