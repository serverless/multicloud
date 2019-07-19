import { AwsContext, AwsResponse } from ".";

describe("test of response", () => {
  it("should have headers value empty object", done => {
    const emptyAWSEvent = {};

    const sut = new AwsResponse(new AwsContext([emptyAWSEvent, null, null]));

    expect(sut.headers).toEqual({});
    done();
  });
});
