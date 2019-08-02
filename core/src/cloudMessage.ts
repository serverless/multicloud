export interface CloudMessage {
  id: string;
  body: any;
  timestamp: Date;
  eventSource: string;
}
