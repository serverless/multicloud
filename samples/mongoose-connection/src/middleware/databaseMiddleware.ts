import { Middleware } from "@multicloud/sls-core";
import { CloudContext } from "@multicloud/sls-core";
import mongoose from "mongoose";

export interface DatabaseOptions {
  url: string;
  params?: any;
  closeConnection: boolean;
}

export const DatabaseMiddleware = (
  options: DatabaseOptions
): Middleware => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  const { url, params, closeConnection } = options;
  //Added global.numberOfDbMiddlewares variable to check the ammount of times this is instantiated. It can be removed.
  isNaN(global.numberOfDbMiddlewares) ? global.numberOfDbMiddlewares = 1 : global.numberOfDbMiddlewares++;
  if (
    !global ||
    !global.cachedConnection ||
    !global.cachedConnection.readyState ||
    !(global.cachedConnection.readyState === 1)
    ) {
      let connectionPromise = mongoose.connect(url,params);
      global.connectionPromise = connectionPromise;
      await connectionPromise.then(
        () => {
          if (mongoose.connection) {
            let connection = mongoose.connection;
            global.cachedConnection = connection;
            //Added global.numberOfConnections variable to check the ammount of connections actually created. It can be removed.
            isNaN(global.numberOfConnections) ? global.numberOfConnections = 1 : global.numberOfConnections++;

            connection.on("error", () => {
              global.cachedConnection = null;
            });

            connection.on("disconnected", () => {
              global.cachedConnection = null;
            });

            connection.on("close", () => {
              global.cachedConnection = null;
            });

            process.on("SIGINT", () => {
              connection.close(() => {
                process.exit(0);
              });
            });
          } else {
            global.cachedConnection = null;
          }
        },
        reason => {
          console.log("reason ====>  ", reason);
          const error = "DB Connection FAILURE ".concat(reason);
          global.cachedConnection = null;
          throw Error(error);
        }
    );
  }

  await next();
  if (closeConnection) {
    await mongoose.disconnect();
  }
};
