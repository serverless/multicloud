# MultiCloud Middleware

- [Prerequisites](#Prerequisites)
- [Installation](#Installation)
- [Running Tests](#Running-Tests)

## Prerequisites
[Configure NPM](NPM.md) to be able to fetch common packages from a private NPM server.

[New Developer instructions](https://dev.azure.com/711digital/ServerlessApps/_git/wiki?_a=contents&path=%2FNewDevOnboarding.md&version=GBmaster)

## Installation

- *IMPORTANT:* **Open this project from the root folder**

- **Install dependencies and compile the code** (There is a package.json file in each folder, so is necessary to do it in each one)

Beginning  from the root folder, **execute the following commands**:

```
cd core && npm install && npm run build && cd ..
```

```
cd azure && npm install && npm run build && cd ..
```

```
cd aws && npm install && npm run build && cd ..
```

If for any reason you notice that the dependencies are not linked in VS Code

```
cd core && npm link
```

```
cd aws && npm link@multicloud/sls-core
```

```
cd azure && npm link@multicloud/sls-core
```

## Running tests

In the terminal, execute the following command

```
npm run test
```

In addition, this command can be executed using some of the following [options](https://jestjs.io/docs/en/cli)
