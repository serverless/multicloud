# Multi-Cloud

## Getting Started

### Prerequisites

-   [Visual Studio Code](https://code.visualstudio.com/download)
-   [Node.js](https://nodejs.org/es/download/)

### Installation

Inside the folder that you want to install, execute the following commands:

```
npm install
```

```
npm run build
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
└── readme.md
```

[(more details)](docs/structure.md)

## Contributing

TDB

## Authors

TDB

## License

TDB
