import { AzureModule, AzureContext, AzureRequest, AzureResponse } from ".";
import { ComponentType, CloudContext, CloudRequest, CloudResponse, CloudContainer, CloudService } from "@multicloud/sls-core";
import { AzureFunctionCloudService } from "./services";

describe("Azure Cloud Module", () => {
  const params: any[] = [
    {
      invocationId: expect.any(String),
      req: {},
      res: {},
      bindingDefinitions: [],
    }];
  const azureModule = new AzureModule();
  let container = new CloudContainer();

  describe("when azure request", () => {
    beforeAll(() => {
      container = new CloudContainer();
      container.registerModule(azureModule);
      container.bind(ComponentType.RuntimeArgs).toConstantValue(params);
    });

    it("resolves context", () => {
      const context = container.resolve<CloudContext>(ComponentType.CloudContext);
      expect(context).toBeInstanceOf(AzureContext);
      expect(context.providerType).toBe("azure");
    });

    it("resolves request", () => {
      const request = container.resolve<CloudRequest>(ComponentType.CloudRequest);
      expect(request).toBeInstanceOf(AzureRequest);
    });

    it("resolves response", () => {
      const response = container.resolve<CloudResponse>(ComponentType.CloudResponse);
      expect(response).toBeInstanceOf(AzureResponse);
    });

    it("resolves service", () => {
      const service = container.resolve<CloudService>(ComponentType.CloudService);
      expect(service).toBeInstanceOf(AzureFunctionCloudService);
    });
  });

  describe("when non-azure request", () => {
    beforeAll(() => {
      container = new CloudContainer();
      container.registerModule(azureModule);
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
  })
});
