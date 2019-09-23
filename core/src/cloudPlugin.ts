import { CloudContext } from "./cloudContext";

export enum CloudPipelineEvent {
  BeforePipeline = "beforePipeline",
  AfterPipeline = "afterPipeline",
  BeforeHandler = "beforeHandler",
  AfterHandler = "afterHandler",
  BeforeMiddleware = "beforeMiddleware",
  AfterMiddleware = "afterMiddleware"
}

export type CloudPluginEventHandler = (context: CloudContext) => void;

export interface CloudPlugin {
  on: (eventName: CloudPipelineEvent) => CloudPluginEventHandler | undefined;
}
