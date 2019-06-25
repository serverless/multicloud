# TypeScript

TypeScript is an object-oriented programming language developed and maintained by the Microsoft Corporation. It is a superset of JavaScript and contains all of its elements. [More Info](https://www.typescriptlang.org/)

For working with it we need a configuration file which will build the javascript files coded in typescript.

# How to run typescript

Exucute the following command:

```
npm run tsc
```

## Configurations

### tsconfig.json [more info](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

We are using the following configuration in `tsconfig.json` file in **aws**, **azure** and **core** folders.

```
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src"
  },
  "include": [
    "./src"
  ]
}
```

We are using the following configuration in `tsconfig.json` file at **root** level.

```
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "declaration": true,
    "outDir": "lib",
    "downlevelIteration": true,
    "strict": false,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```
