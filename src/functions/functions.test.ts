import { isAsync } from ".";

describe("Function utilities", () => {
  it("should determines wether the function is async or not", () => {
    expect(isAsync(async () => {})).toEqual(true);
  });

  it("should determines wether the function is async or not", () => {
    expect(isAsync(() => {})).toEqual(false);
  });
});
