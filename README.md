# Multi-Cloud

## Getting Started

### Prerequisites

-   [Visual Studio Code](https://code.visualstudio.com/download)
-   [Node.js](https://nodejs.org/es/download/)

### Installation

#### Windows Set Up

Download and install the [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfigTeam.EditorConfig) Extension. For more details click [here](docs/editor-config.md).

##### Step 1

```
git config core.eol lf
git config core.autocrlf input
```

##### Step 2

Delete the delete all the files and directories inside the repository folder, except the git configurations.

##### Step 3

```
git reset --hard BranchName
```

### Configuration

-   [EditorConfig](docs/editor-config.md)
-   [ESLint](docs/eslint.md)

## Running the tests

In the terminal, execute the following command

```
npm run test
```

In addition, this command can be executed using some of the following [options](https://jestjs.io/docs/en/cli)

## Project Structure

```
├── aws
|   ├── utils
|   |   ├── __tests__
|   |   |   └── storage.js
|   |   └── storage.js
|   └── package.json
├── azure
|   ├── utils
|   |   ├── __tests__
|   |   |   └── storage.js
|   |   └── storage.js
|   └── package.json
├── common
|   ├── utils
|   |   ├── __tests__
|   └── package.json
└── readme.md
```

[(more details)](docs/structure.md)

## Contributing

TDB

## Authors

TDB

## License

TDB
