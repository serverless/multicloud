import Storage from "aws/lib/S3Storage";

const storage = new Storage();
const options = {
  container: "foo",
  path: "bar"
};

const readFileFromStorage = async () => {
  const result = await storage.read(options)
  console.log(result)

}
readFileFromStorage()
