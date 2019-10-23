import { CloudContext, Middleware, ConsoleLogger, convertToStream } from "@multicloud/sls-core";
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
            eventTime: "1970-01-01T00:00:00.000Z",
            eventName: "ObjectCreated:Put",
            s3: {
              bucket: {
                name: "example-bucket",
              },
              object: {
                key: "test/key",
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

    it("succeessfully reads a file with name in URL encoded and transforms AWS events into normalized Cloud Messages", async () => {

      const nameWithCharacters = "test/key+with+spaces";
      const nameWithSpaces = nameWithCharacters.replace(/\+/g, " ");

      const eventWithSpaces = {
        Records: [
          {
            eventTime: "1970-01-01T00:00:00.000Z",
            eventName: "ObjectCreated:Put",
            s3: {
              bucket: {
                name: "example-bucket",
              },
              object: {
                key: nameWithCharacters
              }
            }
          }
        ]
      };

      const stream = convertToStream("hi");

      const runtimeArgs = [
        eventWithSpaces,
        {
          awsRequestId: "ID123",
        },
      ];

      context = new AwsContext(runtimeArgs);

      context.storage = {
        read: jest.fn(() => Promise.resolve(stream))
      };

      await middleware(context, next);

      // Storage API is called
      expect(context.storage.read).toBeCalledWith({
        container: eventWithSpaces.Records[0].s3.bucket.name,
        path: nameWithSpaces,
      });

      // Event body is result of stream read operation
      expect(context.event).toEqual({
        records: [{
          id: `${originalEvent.Records[0].s3.bucket.name}/${nameWithSpaces}`,
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
