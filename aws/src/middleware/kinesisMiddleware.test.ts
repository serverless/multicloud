import { CloudContext, Middleware } from "@multicloud/sls-core";
import { AwsContext } from "../awsContext";
import { KinesisMiddleware } from ".";

describe("Kinesis Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = KinesisMiddleware();
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
    const originalEvent: any = {
      Records: [
        {
          kinesis: {
            partitionKey: "partitionKey-03",
            kinesisSchemaVersion: "1.0",
            data: "SGVsbG8sIHRoaXMgaXMgYSB0ZXN0IDEyMy4=",
            sequenceNumber: "49545115243490985018280067714973144582180062593244200961",
            approximateArrivalTimestamp: 1428537600
          },
          eventSource: "aws:kinesis",
          eventID: "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
          invokeIdentityArn: "arn:aws:iam::EXAMPLE",
          eventVersion: "1.0",
          eventName: "aws:kinesis:record",
          eventSourceARN: "arn:aws:kinesis:EXAMPLE",
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
        id: originalEvent.Records[0].eventID,
        body: originalEvent.Records[0].kinesis.data,
        partitionKey: originalEvent.Records[0].kinesis.partitionKey,
        sequenceNumber: originalEvent.Records[0].kinesis.sequenceNumber,
        eventSourceARN: originalEvent.Records[0].kinesis.eventSourceARN,
        timestamp: expect.any(Date),
        eventSource: "aws:kinesis",
      }]
    })
    expect(next).toBeCalled();
  });
});
