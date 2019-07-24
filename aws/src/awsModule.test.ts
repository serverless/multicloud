import { AwsModule, AwsContext, AwsRequest, AwsResponse } from ".";
import { ComponentType, CloudContext, CloudRequest, CloudResponse, CloudContainer } from "@multicloud/sls-core";

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
  })
});
