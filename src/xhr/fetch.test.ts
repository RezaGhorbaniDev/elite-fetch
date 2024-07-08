import { ACCEPT_LANGUAGE } from "../lib/constants";
import { KeyNotFoundError, NoKeyProvidedError } from "../lib/errors";
import { mockGetUsers, resetMocks, users } from "../tests/mock";
import Fetch from "./fetch";

describe("Initializing the fetch", () => {
  //#region Locale

  const globalLocale = "fr-FR";

  /**
   * it should set the locale globally
   */
  it("should set the locale globally", async () => {
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();
    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual(globalLocale);
  });

  /**
   * it should override the default locale
   */
  it("should override the default locale", async () => {
    Fetch.global.locale = globalLocale;

    // Init with default locale
    const fetch = new Fetch();

    // Init with different locale
    const anotherFetch = new Fetch();
    anotherFetch.setLocale("fa-IR");

    expect(anotherFetch.header(ACCEPT_LANGUAGE)).toEqual("fa-IR");

    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual(globalLocale);
  });

  //#endregion

  //#region headers

  /**
   * it should change the locale by header method
   */
  it("should change the locale by header method", async () => {
    const fetch = new Fetch();
    fetch.header(ACCEPT_LANGUAGE, "fa-IR");

    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual("fa-IR");
  });

  /**
   * it should throw error if key is null or empty
   */
  it("should throw error if key is null or empty", async () => {
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();

    expect(() => fetch.removeHeader("")).toThrow(NoKeyProvidedError);
  });

  /**
   * it should throw error if key is not found
   */
  it("should throw error if key is not found", async () => {
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();

    expect(() => fetch.removeHeader("WrongKey")).toThrow(KeyNotFoundError);
  });

  /**
   * it should remove the given attribute
   */
  it("should remove the given attribute", async () => {
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();
    fetch.removeHeader(ACCEPT_LANGUAGE);

    expect(fetch.header(ACCEPT_LANGUAGE)).toBeUndefined();
  });

  //#endregion
});

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
});
