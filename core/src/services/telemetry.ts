export interface TelemetryOptions {
  telemetryService: TelemetryService;
  shouldFlush: boolean;
}

export interface TelemetryService {
  collect: (key: string, data: string) => Promise<void>;
  flush: () => Promise<void>;
}
