/**
 * Options for telemetry
 */
export interface TelemetryOptions {
  /** Service for sending telemetry */
  telemetryService: TelemetryService;
  /** Service should flush if true */
  shouldFlush: boolean;
}

/**
 * Service for sending telemetry
 */
export interface TelemetryService {
  /**
   * Collect telemetry
   * @param key Authentication for telemetry service
   * @param data Message to log in telemetry
   */
  collect: (key: string, data: object) => Promise<void>;
  /** Flush all messages in service */
  flush: () => Promise<void>;
}
