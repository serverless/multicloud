/**
 * Normalized format for all messages published from pub/sub systems
 */
export interface CloudMessage {
  id: string;
  body: any;
  timestamp: Date;
  eventSource: string;
  [key: string]: any;
}
