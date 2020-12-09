import { GcpModule, GcpContext, GcpRequest, GcpResponse } from ".";
import { GcpFunctionCloudService } from "./services";
import {
  ComponentType,
  CloudContext,
  CloudRequest,
  CloudResponse,
  CloudContainer,
  CloudService,
  CloudStorage,
  App,
} from "@multicloud/sls-core";

describe("Gcp Cloud Module", () => {
  const params: any[] = [
    { _readableState: { highWaterMark: expect.any(String) },
      headers: { "x-appengine-request-log-id": "123" } },
    {},
    jest.fn(),
  ];
  const gcpModule = new GcpModule();
  let container = new CloudContainer();

  describe("when gcp request", () => {
    beforeAll(() => {
      process.env.NODE_ENV = "test-gcp";
      container = new CloudContainer();
      container.registerModule(gcpModule);
      container.bind(ComponentType.RuntimeArgs).toConstantValue(params);
    });

    it("resolves context as singleton", () => {
      const context1 = container.resolve<CloudContext>(
        ComponentType.CloudContext
      );
      const context2 = container.resolve<CloudContext>(
        ComponentType.CloudContext
      );

      expect(context1).toBeInstanceOf(GcpContext);
      expect(context1.providerType).toBe("gcp");
      expect(context1).toBe(context2);
    });

    it("Resolves new context per request", async () => {
      const requestCount = 2;
      const contextInstances: GcpContext[] = [];
      const app = new App(new GcpModule());

      const handler = (context: GcpContext) => {
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
      const request = container.resolve<CloudRequest>(
        ComponentType.CloudRequest
      );
      expect(request).toBeInstanceOf(GcpRequest);
    });

    it("resolves response", () => {
      const response = container.resolve<CloudResponse>(
        ComponentType.CloudResponse
      );
      expect(response).toBeInstanceOf(GcpResponse);
    });

    it("resolves service", () => {
      const service = container.resolve<CloudService>(
        ComponentType.CloudService
      );
      expect(service).toBeInstanceOf(GcpFunctionCloudService);
    });

    describe("when non-gcp request", () => {
      beforeAll(() => {
        container = new CloudContainer();
        container.registerModule(gcpModule);
        container.bind(ComponentType.RuntimeArgs).toConstantValue([{}]);
      });

      it("does not resolve context", () => {
        expect(
          container.resolve<CloudContext>(ComponentType.CloudContext)
        ).toBeNull();
      });

      it("does not resolve request", () => {
        expect(
          container.resolve<CloudContext>(ComponentType.CloudRequest)
        ).toBeNull();
      });

      it("does not resolve response", () => {
        expect(
          container.resolve<CloudContext>(ComponentType.CloudResponse)
        ).toBeNull();
      });

      it("does not resolve service", () => {
        expect(
          container.resolve<CloudService>(ComponentType.CloudService)
        ).toBeNull();
      });

      it("does not resolve storage", () => {
        expect(
          container.resolve<CloudStorage>(ComponentType.CloudStorage)
        ).toBeNull();
      });
    });
  });
});
