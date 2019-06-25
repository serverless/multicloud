# MultiCloud Middleware

## Getting Started

### Prerequisites

-   [Visual Studio Code](https://code.visualstudio.com/download)
-   [Node.js](https://nodejs.org/es/download/)

### Installation

- *IMPORTANT:* **Open this project from the root folder** (There are dependencies between the aws, azure and core folder)

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


### Configuration

-   [EditorConfig](docs/editor-config.md)
-   [ESLint](docs/eslint.md)
-   [TypeScript](docs/typescript.md)

## Running the tests

In the terminal, execute the following command

```
npm run test
```

In addition, this command can be executed using some of the following [options](https://jestjs.io/docs/en/cli)

## Project Structure

```
├── aws
|   ├── src
|   |   ├── storage.test.js
|   |   └── storage.js
|   ├── package.json
|   └── tsconfig.json
├── azure
|   ├── src
|   |   ├── storage.test.js
|   |   └── storage.js
|   ├── package.json
|   └── tsconfig.json
├── core
|   ├── src
|   ├── package.json
|   └── tsconfig.json
├── readme.md
└── tsconfig.json
```

[(more details)](docs/structure.md)

## Contributing

TDB

## Authors

TDB

## License

TDB
