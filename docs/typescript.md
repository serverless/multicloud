# TypeScript

In this project there are installed typescript with tslint.

# How to run typescript

Exucute the following command:

```
npm run tsc
```

## Configurations

We are using the default options of both configuration files `tsconfig.json` and `tslint.json`.

### tsconfig.json [more info](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

```
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist"
  },
  "include": [
    "aws/**/*",
    "azure/**/*",
    "common/**/*"
  ],
  "lib": ["es2015"]
}
```

### tslint.json [more info](https://palantir.github.io/tslint/usage/configuration/)

```
{
    "defaultSeverity": "error",
    "extends": [
        "tslint:recommended"
    ],
    "jsRules": {},
    "rules": {
      "no-console": false
    },
    "rulesDirectory": []
}
```
