import { mockGetUsers, resetMocks, users } from "../tests/mock";
import Fetch from "./fetch";

describe("fetchData", () => {
  let fetch: Fetch;

  beforeEach(() => {
    fetch = new Fetch();
  });
  afterEach(() => {
    resetMocks();
  });


  // GET
  it("fetches data from the given URL", async () => {
    mockGetUsers();

    const data = await fetch.get("http://example.com/data");

    expect(data).toEqual(users);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });
});
