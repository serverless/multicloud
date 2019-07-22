export interface CloudRequest {
  body?: any;
  headers?: {
    [key: string]: any;
  };
  method: string;
  query?: {
    [key: string]: any;
  };
  pathParams?: {
    [key: string]: any;
  };
}
