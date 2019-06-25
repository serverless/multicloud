import { AzureFunction, Context } from "@azure/functions";
import { AzureContext } from "azure/lib/azureContext";

//to run this function run: 'tsc' and 'func host start'
const httpTrigger: AzureFunction = async function(
  context: Context
): Promise<void> {
  const azureContext = new AzureContext(context);
  return azureContext.res.send("Hello Gabriel", 200);
};

export default httpTrigger;
