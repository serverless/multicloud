import { Connection } from "mongoose";

declare global {
  namespace NodeJS {
    interface Global {
        connectionPromise: Promise<void>;
        cachedConnection: Connection;
        //These next two variables are just to check the number of connections v. number of instantiations. They can be removed.
        numberOfConnections: number;
        numberOfDbMiddlewares: number;
    }
  }
}
export = global
