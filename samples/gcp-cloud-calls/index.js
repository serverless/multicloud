
const { App , HTTPBindingMiddleware } = require("core");
const { GcpModule, GcpFunctionCloudService } = require("gcp");

const app = new App(new GcpModule());

module.exports.handler = app.use([HTTPBindingMiddleware()], async (context) => {
 context.container.bind("google").toConstantValue({
    name: "google",
    method: "get",
    http: "http://www.google.com"
  });
  
  const caller = new GcpFunctionCloudService(context)
  const result = await caller.invoke("google");
  context.send({"status": result.status,"message":result.statusText});
});
