# Serverless Multicloud Library
[![Build Status](https://dev.azure.com/serverless-inc/multicloud/_apis/build/status/CI/%5Bsls-core%5D%20ci?branchName=dev)](https://dev.azure.com/serverless-inc/multicloud/_build/latest?definitionId=3&branchName=dev)
[![npm (scoped)](https://img.shields.io/npm/v/@multicloud/sls-core)](https://www.npmjs.com/package/@multicloud/sls-core)


The Serverless @multicloud library provides an easy way to build Serverless handlers in NodeJS using a cloud agnostic library that can then be deployed to supported cloud providers.

In addition to a normalized API the @multicloud library supports reusable middleware pipeline similar to the Express framework

## Supported Cloud Providers
The following is a list of the currently support cloud providers:

#### Microsoft Azure (@multicloud/sls-azure)
[![Build Status](https://dev.azure.com/serverless-inc/multicloud/_apis/build/status/CI/%5Bsls-azure%5D%20ci?branchName=dev)](https://dev.azure.com/serverless-inc/multicloud/_build/latest?definitionId=2&branchName=dev)

The Azure package contains Azure specific implementations of core components.
See [Azure readme](../azure/README.md) for additional information


#### Amazon Web Services (@multicloud/sls-aws)
[![Build Status](https://dev.azure.com/serverless-inc/multicloud/_apis/build/status/CI/%5Bsls-aws%5D%20ci?branchName=dev)](https://dev.azure.com/serverless-inc/multicloud/_build/latest?definitionId=1&branchName=dev)

The AWS package contains AWS specific implementations of core components.
See [AWS readme](../aws/README.md) for additional information

## Installation
Serverless @multicloud library for Node can be installed via NPM

```bash
# Installs core components as as well as run-time dependencies for Azure & AWS
npm install @multicloud/sls-core @multicloud/sls-azure @multicloud/sls-aws --save
```

## Example
```javascript
const { App } = require("@multicloud/sls-core");
const { AzureModule } = require("@multicloud/sls-azure");
const { AwsModule } = require("@multicloud/sls-aws");
const app = new App(new AzureModule(), new AwsModule());

module.exports.handler = app.use([], async (context) => {
  const { req } = context;
  const name = req.query.get("name");

  if (name) {
    context.send(`Hello ${name}`, 200);
  }
  else {
    context.send("Please pass a name on the query string or in the request body", 400);
  }
});
```

## Contributing
### [Code of Conduct](../CODE_OF_CONDUCT.md)
In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### [Contriubtion Guidelines](../CONTRIBUTING.md)
Welcome, and thanks in advance for your help! Please follow these simple guidelines :+1:

## Licensing

Serverless is licensed under the [MIT License](./LICENSE.txt).

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the MIT License.
