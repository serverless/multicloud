import { AwsModule, AwsContext, AwsRequest, AwsResponse, S3Storage } from ".";
import { ComponentType, CloudContext, CloudRequest, CloudResponse, CloudContainer, CloudStorage, CloudService, App } from "@multicloud/sls-core";
import { LambdaCloudService } from "./services";

describe("Aws Cloud Module", () => {
  const params: any[] = [
    {},
    { awsRequestId: expect.any(String) },
    jest.fn()
  ];
  const awsModule = new AwsModule();
  let container = new CloudContainer();

  describe("when aws request", () => {
    beforeAll(() => {
      container = new CloudContainer();
      container.registerModule(awsModule);
      container.bind(ComponentType.RuntimeArgs).toConstantValue(params);
    });

    it("resolves context as singleton", () => {
      const context1 = container.resolve<CloudContext>(ComponentType.CloudContext);
      const context2 = container.resolve<CloudContext>(ComponentType.CloudContext);

      expect(context1).toBeInstanceOf(AwsContext);
      expect(context1.providerType).toBe("aws");
      expect(context1).toBe(context2);
    });

    it("Resolves new context per request", async () => {
      const requestCount = 2;
      const contextInstances: AwsContext[] = [];
      const app = new App(new AwsModule());

      const handler = (context: AwsContext) => {
        contextInstances.push(context);
        context.done();
      };

      for (var i = 0; i < 2; i++) {
        await app.use([], handler)(...params);
      }

      expect(contextInstances).toHaveLength(requestCount);
      expect(contextInstances[0]).not.toBe(contextInstances[1]);
    });

    it("resolves request", () => {
      const request = container.resolve<CloudRequest>(ComponentType.CloudRequest);
      expect(request).toBeInstanceOf(AwsRequest);
    });

    it("resolves response", () => {
      const response = container.resolve<CloudResponse>(ComponentType.CloudResponse);
      expect(response).toBeInstanceOf(AwsResponse);
    });

    it("resolves service", () => {
      const service = container.resolve<CloudService>(ComponentType.CloudService);
      expect(service).toBeInstanceOf(LambdaCloudService);
    });

    it("resolves storage", () => {
      const storage = container.resolve<CloudStorage>(ComponentType.CloudStorage);
      expect(storage).toBeInstanceOf(S3Storage);
    });
  });

  describe("when non-aws request", () => {
    beforeAll(() => {
      container = new CloudContainer();
      container.registerModule(awsModule);
      container.bind(ComponentType.RuntimeArgs).toConstantValue([{}]);
    });

    it("does not resolve context", () => {
      expect(container.resolve<CloudContext>(ComponentType.CloudContext)).toBeNull();
    });

    it("does not resolve request", () => {
      expect(container.resolve<CloudContext>(ComponentType.CloudRequest)).toBeNull();
    });

    it("does not resolve response", () => {
      expect(container.resolve<CloudContext>(ComponentType.CloudResponse)).toBeNull();
    });

    it("does not resolve service", () => {
      expect(container.resolve<CloudService>(ComponentType.CloudService)).toBeNull();
    });

    it("does not resolve storage", () => {
      expect(container.resolve<CloudStorage>(ComponentType.CloudStorage)).toBeNull();
    });
  })
});
