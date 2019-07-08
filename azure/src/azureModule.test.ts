import { Container } from "inversify";
import { AzureModule } from "./azureModule";
import {
  ComponentType,
  CloudContext,
  CloudRequest,
  CloudResponse
} from "@multicloud/sls-core";
import { AzureContext } from "./azureContext";
import { AzureRequest } from "./azureRequest";
import { AzureResponse } from "./azureResponse";

describe("Azure Cloud Module", () => {
  const params: any[] = [{ req: {}, res: {} }];
  const container = new Container();
  const sut = new AzureModule();

  beforeAll(() => {
    container.bind(ComponentType.RuntimeArgs).toConstantValue(params);
    sut.init(container);
  });

  it("resolves context", () => {
    const context = container.get<CloudContext>(ComponentType.CloudContext);
    expect(context).toBeInstanceOf(AzureContext);
    expect(context.providerType).toBe("azure");
  });

  it("resolves request", () => {
    const request = container.get<CloudRequest>(ComponentType.CloudRequest);
    expect(request).toBeInstanceOf(AzureRequest);
  });

  it("resolves response", () => {
    const response = container.get<CloudResponse>(ComponentType.CloudResponse);
    expect(response).toBeInstanceOf(AzureResponse);
  });
});
