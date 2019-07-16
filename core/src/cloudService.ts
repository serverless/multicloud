export interface CloudService {
  invoke<T>(name: string, fireAndForget: boolean, payload?: any): Promise<any>;
}
