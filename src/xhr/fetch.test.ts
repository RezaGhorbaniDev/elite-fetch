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

  //#region GET

  // GET
  it("fetches data from the given URL", async () => {
    mockGetUsers();

    const data = await fetch.get("http://example.com/data");

    expect(data).toEqual(users);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  //#endregion

  //#region Locale

  const globalLocale = "fr-FR";

  it("should set the locale globally", async () => {
    Fetch.locale = globalLocale;

    const fetch = new Fetch();
    expect(Reflect.get(fetch, "headers")["Accept-Language"]).toEqual(
      globalLocale
    );
  });

  it("should override the default locale", async () => {
    Fetch.locale = globalLocale;

    // Init with default locale
    const fetch = new Fetch();

    // Init with different locale
    const anotherFetch = new Fetch();
    anotherFetch.setLocale("fa-IR");

    expect(Reflect.get(anotherFetch, "headers")["Accept-Language"]).toEqual(
      "fa-IR"
    );

    expect(Reflect.get(fetch, "headers")["Accept-Language"]).toEqual(
      globalLocale
    );
  });

  //#endregion
});
