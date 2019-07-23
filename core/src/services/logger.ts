/**
 * Level of verbosity for logging
 */
export enum LogLevel {
  /** No logs */
  NONE = 0,
  /** Only errors */
  ERROR = 2,
  /** Only errors and warnings */
  WARN = 3,
  /** Only info, errors and warnings */
  INFO = 4,
  /** Any log statement */
  LOG = 5
}

/**
 * Logging service
 */
export interface Logger {
  /** Level of verbosity for logging */
  logLevel: LogLevel;
  /** Log message */
  log: (message: string) => void;
  /** Log message as info */
  info: (message: string) => void;
  /** Log message as error */
  error: (message: string) => void;
  /** Log message as warning */
  warn: (message: string) => void;
}
