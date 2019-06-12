## Project Structure

```
├── aws
|   ├── utils
|   |   └── storage.js
|   └── package.json
├── azure
|   ├── utils
|   |   └── storage.js
|   └── package.json
├── common
|   ├── utils
|   └── package.json
└── readme.md
```

-   **aws** folder: contains the general library files which adapt AWS lambda provider to a generic provider to make business services agnostic from the cloud provider. The utils folder contains the adapters to read request input and write a response as output.

-   **azure** folder: contains the general library files which adapt Azure Functions provider to a generic provider to make the business services agnostic from the cloud provider. The utils folder contains the adapters to read request input and write a response as output.

-   **common** folder: contains the general library files which adapt any provider to a generic provider to make the business services agnostic from the cloud provider. The utils folder contains the adapters to read request input and write a response as output.
