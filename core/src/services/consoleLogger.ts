import { Logger, LogLevel } from "./logger";

/**
 * Console implementation of Logger interface
 */
export class ConsoleLogger implements Logger {
  /** Creates a new Logger, with the specified LogLevel. */
  public constructor(private logLevel?: LogLevel) {
    if (logLevel === LogLevel.NONE) {
      this.logLevel = logLevel;
    } else {
      this.logLevel = logLevel || parseInt(process.env.LOG_LEVEL) || LogLevel.INFO;
    }
  }

  /** Log message with the current stack trace */
  public trace(...message: string[]) {
    if (this.logLevel && this.logLevel === LogLevel.VERBOSE) {
      console.trace("[TRACE] ", ...message);
    }
  }

  /** Log message as debug */
  public debug(...message: string[]) {
    if (this.logLevel && this.logLevel === LogLevel.VERBOSE) {
      console.debug("[DEBUG] ", ...message);
    }
  }

  /** Log message */
  public log(...message: string[]) {
    if (this.logLevel && this.logLevel === LogLevel.VERBOSE) {
      console.log("[VERBOSE] ", ...message);
    }
  }

  /** Log message as info */
  public info(...message: string[]) {
    if (this.logLevel && this.logLevel <= LogLevel.INFO) {
      console.info("[INFO] ", ...message);
    }
  }

  /** Log message as warning */
  public warn(...message: string[]) {
    if (this.logLevel && this.logLevel <= LogLevel.WARN) {
      console.warn("[WARN] ", ...message);
    }
  }

  /** Log message as error */
  public error(...message: string[]) {
    if (this.logLevel && this.logLevel <= LogLevel.ERROR) {
      console.error("[ERROR] ", ...message);
    }
  }
}
