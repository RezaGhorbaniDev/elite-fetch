import qs from ".";

describe("Querystring builder", () => {
  // simple query string
  it("should return the correct simple querystring", () => {
    expect(qs.serialize({ prop1: "test" })).toEqual(encodeURI("prop1=test"));
  });

  // array query string
  it("should return the correct array querystring", () => {
    expect(qs.serialize({ prop1: ["test"] })).toEqual(
      encodeURI("prop1[0]=test")
    );
  });

  // complex object query string
  it("should return the correct complex object querystring", () => {
    expect(
      qs.serialize({
        foo: "hi there",
        bar: {
          blah: 123,
          quux: [1, 2, 3],
        },
      })
    ).toEqual(
      encodeURI(
        "foo=hi there&bar[blah]=123&bar[quux][0]=1&bar[quux][1]=2&bar[quux][2]=3"
      )
    );
  });
});
