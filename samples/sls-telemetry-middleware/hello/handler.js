const {
  App,
  TelemetryServiceMiddleware,
  HTTPBindingMiddleware
} = require("@multicloud/sls-core");

const { AzureModule } = require("@multicloud/sls-azure");
const { AwsModule } = require("@multicloud/sls-aws");

const analyticsData = {};
const telemetryService = {
  collect: (key, data) => {
    analyticsData[key] = data;
    return Promise.resolve();
  },

  flush: () => {
    Object.keys(analyticsData).forEach(key => {
      console.log(analyticsData[key]);
    });
    return Promise.resolve();
  }
};

const options = {
  telemetryService,
  shouldFlush: true
};

const app = new App(new AzureModule(), new AwsModule());

const handler = context => {
  context.telemetry.collect("custom-event", { value: 32 });
  context.send("sucesess");
};
const middlewareWithTimeout = () => async (context, next) => {
  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  await sleep(3000);
  await next();
};

module.exports.hello = app.use(
  [
    HTTPBindingMiddleware(),
    TelemetryServiceMiddleware(options),
    middlewareWithTimeout()
  ],
  handler
);
