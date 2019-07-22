import { performance, PerformanceObserver } from "perf_hooks";
import { CloudContext } from "../cloudContext";
import { ConsoleLogger } from "../services/consoleLogger";

export const PerformanceMiddleware = () =>
  async (context: CloudContext, next: Function): Promise<void> => {
    // NOTE: if the context provides a logger, use it, otherwise use the default console logger
    const logger = (context.logger) ? context.logger : new ConsoleLogger();
    const start = `Function Start: ${context.id}`;
    const end = `Function End: ${context.id}`;

    try {
      const observer = new PerformanceObserver((list, observer) => {
        const perfEntries = list.getEntriesByName(context.id);
        if (perfEntries && perfEntries.length) {
          const entry = perfEntries[0];
          logger.log(`Function End, Request ID: ${context.id}, took ${entry.duration}ms`);
        }
        observer.disconnect();
      });

      // fire performance observer events for all measure calls
      observer.observe({ entryTypes: ["measure"] });

      performance.mark(start);
      logger.log(`Function Start, Request ID: ${context.id}`);
      await next();
    } finally {
      performance.mark(end);
      performance.measure(context.id, start, end);
    }
  };
