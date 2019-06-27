import AzureBlobStorage from "azure/lib/AzureBlobStorage";

const settings = {
  account: "foo",
  accountKey: "bar"
};

const options = {
  container: "foo",
  path: "bar"
};

const storage = new AzureBlobStorage(settings);
storage.read(options).then(console.log);
