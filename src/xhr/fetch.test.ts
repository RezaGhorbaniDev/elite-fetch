import Fetch from "./fetch";

describe("fetchData", () => {
  let fetch: Fetch;

  beforeEach(() => {
    fetch = new Fetch();
  });

  it("fetches data from the given URL", async () => {
    const mockData = { data: "test" };

    // Mock the response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)
    );

    const data = await fetch.get<typeof mockData>("http://example.com/data");

    expect(data).toEqual({ data: "test" });

    // Assert fetch was called once
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });
});
