# Configure NPM

The middleware and common serverless components are currently published to a private NPM repository, hosted on [Azure DevOps](https://dev.azure.com/711digital/ServerlessApps/_packaging?_a=feed&feed=common-packages).

## Common Packages
The following scoped common packages are available:

```json
  "dependencies": {
    "@multicloud/sls-core": "latest",
    "@multicloud/sls-aws": "latest",
    "@multicloud/sls-azure": "latest,
  }
```

In order to fetch any common packages via `npm i`, you must first provision and configure a token.

## NPM Authentication Token
In order to access (read or write) to/from this NPM reposistory, you will need to:

1. Provision a [Personal Access Token (PAT)](https://docs.microsoft.com/en-us/azure/devops/artifacts/npm/npmrc?view=azure-devops&tabs=windows) on the [Azure DevOps portal](https://dev.azure.com/711digital/_usersSettings/tokens), under Profile --> Security --> Personal access tokens
    * Tokens only require `Packaging (read & write)` scope
    * Tokens have a max expiry of one year (there is no support for non-expiring tokens)
2. Prior to running any NPM commands, be sure to set `NPM_TOKEN` as an environment variable, using the base64 encoded PAT token that was previously created.

## FAQ
**Q:** I'm getting this error: `Error: Failed to replace env in config: ${NPM_TOKEN}`

**A**: You will see this error if you run _any_ NPM command without first setting the `NPM_TOKEN` environment variable

-----------

**Q:** I'm getting a `401 (Unauthorized)` when running NPM commands, with the `NPM_TOKEN` environment variable set.

**A:** Make sure you successfully provisioned your Personal Access Token (PAT) on the Azure DevOps portal and make sure environment variable was set and base64 encoded.
