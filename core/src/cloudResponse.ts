export interface CloudResponse {
  headers?: {
    [key: string]: any;
  };
  send: (body: any, status: number, callback?: Function) => void;
}
