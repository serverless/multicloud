# Serverless Multicloud Library for Microsoft Azure
[![Build Status](https://dev.azure.com/serverless-inc/multicloud/_apis/build/status/CI/%5Bsls-azure%5D%20ci?branchName=dev)](https://dev.azure.com/serverless-inc/multicloud/_build/latest?definitionId=2&branchName=dev)
[![npm (scoped)](https://img.shields.io/npm/v/@multicloud/sls-azure)](https://www.npmjs.com/package/@multicloud/sls-azure)

The Serverless @multicloud library provides an easy way to build Serverless handlers in NodeJS using a cloud agnostic library that can then be deployed to support cloud providers.

In addition to a normalized API the @multicloud library supports reusable middleware pipeline similar to the Express framework

## Installation
```bash
npm install @multicloud/sls-azure --save
```

## Example
```javascript
const { App } = require("@multicloud/sls-core");
const { AzureModule } = require("@multicloud/sls-azure");
const app = new App(new AzureModule());

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

### Testing
Run Jest unit tests
```bash
npm run test
```

### Building
Runs the TypeScript compiler and ouputs to the `lib` folder
```bash
npm run build
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
