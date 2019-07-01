import { AWSResponse } from "./awsResponse";
import { AWSContext } from "./awsContext";

describe("test of response", () => {
  it("should have headers value empty object", done => {
    const emptyAWSEvent = {};

    const sut = new AWSResponse(new AWSContext(emptyAWSEvent, null, null));

    expect(sut.headers).toEqual({});
    done();
  });
});
