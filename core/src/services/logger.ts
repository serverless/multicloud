/**
 * Level of verbosity for logging
 */
export enum LogLevel {
  /** Disable logging */
  NONE = 0,
  /** Log everyting */
  VERBOSE = 1,
  /** Only log info, errors and warnings */
  INFO = 2,
  /** Only log errors and warnings */
  WARN = 3,
  /** Only log errors */
  ERROR = 4,
}

/**
 * Logging service
 */
export interface Logger {
  /** Log message */
  log: (...message: string[]) => void;
  /** Log message as info */
  info: (...message: string[]) => void;
  /** Log message as error */
  error: (...message: string[]) => void;
  /** Log message as warning */
  warn: (...message: string[]) => void;
  /** Log message as debug */
  debug: (...message: string[]) => void;
  /** Log message with the current stack trace */
  trace: (...message: string[]) => void;
}
