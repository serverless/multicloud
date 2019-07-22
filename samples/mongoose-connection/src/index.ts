import { AzureModule } from "@multicloud/sls-azure";
import { App, HTTPBindingMiddleware } from "@multicloud/sls-core";
import { DatabaseOptions, DatabaseMiddleware } from  "./middleware/databaseMiddleware";

class DbOptions implements DatabaseOptions {
  public constructor(closeConnection: boolean){
    this.closeConnection = closeConnection;
  }
  public url: string = "mongodb://localhost:27017";
  public params: any = {
    poolSize: 1,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    keepAlive: 120
  };
  public closeConnection: boolean = true;
}

const dbMiddleware1 = DatabaseMiddleware(new DbOptions(false));
const dbMiddleware2 = DatabaseMiddleware(new DbOptions(false));
const httpMiddleware = HTTPBindingMiddleware();

const app = new App(new AzureModule());
const middlewares = [httpMiddleware, dbMiddleware1, dbMiddleware2];

const handler = (context) => {
  context.res.send(`Number of active connections: ${global.numberOfConnections}. Number of connections tried to open: ${global.numberOfDbMiddlewares}`, 200);
}

module.exports = app.use(middlewares, handler);
