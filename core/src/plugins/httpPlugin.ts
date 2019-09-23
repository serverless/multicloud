import { CloudPlugin, CloudPipelineEvent } from "../cloudPlugin";
import { CloudContext } from "../cloudContext";
import { ComponentType } from "../cloudContainer";

export class HttpPlugin implements CloudPlugin {
  public on(eventName: CloudPipelineEvent) {
    switch (eventName) {
      case CloudPipelineEvent.BeforePipeline:
        return this.onBeforePipeline;
    }
  }

  private onBeforePipeline(context: CloudContext): void {
    context.req = context.container.resolve(ComponentType.CloudRequest);
    context.res = context.container.resolve(ComponentType.CloudResponse);
  }
}
