import { AwsModule, AwsContext, AwsRequest, AwsResponse, S3Storage } from ".";
import { ComponentType, CloudContext, CloudRequest, CloudResponse, CloudContainer, CloudStorage, CloudService } from "@multicloud/sls-core";
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

    it("resolves context", () => {
      const context = container.resolve<CloudContext>(ComponentType.CloudContext);
      expect(context).toBeInstanceOf(AwsContext);
      expect(context.providerType).toBe("aws");
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
