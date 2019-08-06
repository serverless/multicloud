import { CloudContext, Middleware, ConsoleLogger } from "@multicloud/sls-core";
import { AwsContext } from "../awsContext";
import { Readable } from "stream";
import { SimpleStorageMiddleware } from "..";

describe("Simple Storage Middleware", () => {
  let middleware: Middleware;

  beforeEach(() => {
    middleware = SimpleStorageMiddleware();
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

  describe("Reading object from bucket", () => {
    let next = jest.fn();
    let originalEvent: any;
    let context: CloudContext;

    beforeEach(() => {
      originalEvent = {
        Records: [
          {
            eventVersion: "2.0",
            eventSource: "aws:s3",
            awsRegion: "us-east-1",
            eventTime: "1970-01-01T00:00:00.000Z",
            eventName: "ObjectCreated:Put",
            userIdentity: {
              principalId: "EXAMPLE"
            },
            requestParameters: {
              sourceIPAddress: "127.0.0.1"
            },
            responseElements: {
              "x-amz-request-id": "EXAMPLE123456789",
              "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
            },
            s3: {
              s3SchemaVersion: "1.0",
              configurationId: "testConfigRule",
              bucket: {
                name: "example-bucket",
                ownerIdentity: {
                  principalId: "EXAMPLE"
                },
                arn: "arn:aws:s3:::example-bucket"
              },
              object: {
                key: "test/key",
                size: 1024,
                eTag: "0123456789abcdef0123456789abcdef",
                sequencer: "0A1B2C3D4E5F678901"
              }
            }
          }
        ]
      };
      const runtimeArgs = [
        originalEvent,
        {
          awsRequestId: "ID123",
        },
      ];

      next = jest.fn();
      context = new AwsContext(runtimeArgs);
    });

    it("succeessfully reads and transforms AWS events into normalized Cloud Messages", async () => {
      const stream = new Readable();
      stream.push("hi");
      stream.push(null);

      context.storage = {
        read: jest.fn(() => Promise.resolve(stream))
      };

      await middleware(context, next);

      // Storage API is called
      expect(context.storage.read).toBeCalledWith({
        container: originalEvent.Records[0].s3.bucket.name,
        path: originalEvent.Records[0].s3.object.key,
      });

      // Event body is result of stream read operation
      expect(context.event).toEqual({
        records: [{
          id: `${originalEvent.Records[0].s3.bucket.name}/${originalEvent.Records[0].s3.object.key}`,
          body: stream,
          timestamp: expect.any(Date),
          eventName: originalEvent.Records[0].eventName,
          eventSource: "aws:s3",
        }]
      });

      // Chain is still continued
      expect(next).toBeCalled();
    });

    it("logs any issues occured while reading object from container", async () => {
      const error = "Access Denied!";
      context.storage = {
        read: jest.fn(() => Promise.reject(error))
      };

      context.logger = new ConsoleLogger();
      context.logger.warn = jest.fn();
      context.logger.error = jest.fn();

      await middleware(context, next);

      // Storage API is called
      expect(context.storage.read).toBeCalledWith({
        container: originalEvent.Records[0].s3.bucket.name,
        path: originalEvent.Records[0].s3.object.key,
      });

      // Errors are logged
      expect(context.logger.warn).toBeCalledWith(`Error reading object, container: ${originalEvent.Records[0].s3.bucket.name}, path: ${originalEvent.Records[0].s3.object.key}`);
      expect(context.logger.error).toBeCalledWith(error);

      // Event body is null
      expect(context.event).toEqual({
        records: [{
          id: `${originalEvent.Records[0].s3.bucket.name}/${originalEvent.Records[0].s3.object.key}`,
          body: null,
          timestamp: expect.any(Date),
          eventName: originalEvent.Records[0].eventName,
          eventSource: "aws:s3",
        }]
      });

      // Chain is still continued
      expect(next).toBeCalled();
    });
  });
});
