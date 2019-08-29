import { performance, PerformanceObserver } from "perf_hooks";
import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";
import { ConsoleLogger } from "../services/consoleLogger";

/**
 * Request ID response header name.
 */
export const RequestIdResponseHeader = "x-sls-request-id";

/**
 * Performance response header name.
 */
export const DurationResponseHeader = "x-sls-perf-duration";

/**
 * Middleware for logging performance of Serverless function. Returns
 * async function that accepts the CloudContext and the `next` Function
 * in the middleware chain
 */
export const PerformanceMiddleware = (): Middleware =>
  async (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    // NOTE: if the context provides a logger, use it, otherwise use the default console logger
    const logger = context.logger ? context.logger : new ConsoleLogger();
    const start = `Function Start: ${context.id}`;
    const end = `Function End: ${context.id}`;

    try {
      const observer = new PerformanceObserver((list, innerObserver) => {
        const perfEntries = list.getEntriesByName(context.id);
        if (perfEntries && perfEntries.length) {
          const entry = perfEntries[0];
          logger.info(`Function End, Request ID: ${context.id}, took ${entry.duration}ms`);

          if (context.res) {
            context.res.headers.set(RequestIdResponseHeader, context.id);
            context.res.headers.set(DurationResponseHeader, entry.duration.toString());
          }
        }
        innerObserver.disconnect();
      });

      // fire performance observer events for all measure calls
      observer.observe({ entryTypes: ["measure"] });

      performance.mark(start);
      logger.info(`Function Start, Request ID: ${context.id}`);
      await next();
    } finally {
      performance.mark(end);
      performance.measure(context.id, start, end);
    }
  };
