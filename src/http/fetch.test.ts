import { ACCEPT_LANGUAGE, AUTHORIZATION } from "../lib/constants";
import { KeyNotFoundError, NoKeyProvidedError } from "../lib/errors";
import {
  mockCreateUser,
  mockFetchLongResponse,
  mockGetUsers,
  resetMocks,
  user,
  users,
} from "../tests/mock";
import Fetch from "./fetch";

describe("Base Url", () => {
  let fetch: Fetch;

  beforeEach(() => {
    fetch = new Fetch();
  });
  afterEach(() => {
    resetMocks();
  });

  /**
   * it should combine the global base url after initialization with given url.
   */
  test("Global base url, after initialization", async () => {
    mockGetUsers();

    fetch.global.baseUrl = "http://example.com/";
    await fetch.get("data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  /**
   * it should combine the global base url before its initialization with given url.
   */
  test("Global base url, before initialization", async () => {
    mockGetUsers();

    fetch.global.baseUrl = "http://example.com/";

    // new fetch
    const newFetch = new Fetch();
    await newFetch.get("data2");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data2");
  });

  /**
   * it should override the base url
   */
  test("Global base url, override", async () => {
    mockGetUsers();

    fetch.global.baseUrl = "http://example.com/";
    await fetch.baseUrl("http://example2.com").get("data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example2.com/data");
  });

  /**
   * it should check for double slashes in the url and replace them with 1 slash
   */
  test("handling double slashes", async () => {
    mockGetUsers();

    fetch.global.baseUrl = "http://example.com/";
    await fetch.get("/data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  /**
   * it should check add a slash between base url and given, if there's none
   */
  test("handling no slashes", async () => {
    mockGetUsers();

    fetch.global.baseUrl = "http://example.com";
    await fetch.get("data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });
});

describe("Headers CRUD", () => {
  let fetch: Fetch;
  const globalLocale = "fr-FR";

  beforeEach(() => {
    fetch = new Fetch();
  });
  afterEach(() => {
    resetMocks();
  });

  /**
   * it should contain inits that has been set in the cunstructor
   */
  test("Cunstructor Initialization", async () => {
    expect(fetch.header("Content-Type")).toEqual("application/json");
  });

  /**
   * it should change the locale by header method
   */
  test("Set header", async () => {
    fetch.header(ACCEPT_LANGUAGE, "fa-IR");

    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual("fa-IR");
  });

  /**
   * it should throw error if key is null or empty
   */
  test("Check for empty header name before delete", async () => {
    const fetch = new Fetch();
    fetch.global.locale = globalLocale;

    expect(() => fetch.removeHeader("")).toThrow(NoKeyProvidedError);
  });

  /**
   * it should throw error if key is not found
   */
  test("Validate header name before delete", async () => {
    const fetch = new Fetch();
    fetch.global.locale = globalLocale;

    expect(() => fetch.removeHeader("WrongKey")).toThrow(KeyNotFoundError);
  });

  /**
   * it should remove the given attribute
   */
  test("Delete header", async () => {
    const fetch = new Fetch();
    fetch.global.locale = globalLocale;
    fetch.removeHeader(ACCEPT_LANGUAGE);

    expect(fetch.header(ACCEPT_LANGUAGE)).toBeUndefined();
  });
});

describe("fetchData", () => {
  let fetch: Fetch;

  beforeEach(() => {
    fetch = new Fetch();
  });
  afterEach(() => {
    resetMocks();
  });

  test("Get method", async () => {
    mockGetUsers();

    const data = await fetch.get("http://example.com/data");

    expect(data).toEqual(users);
    expect(fetch.global.baseUrl).toEqual("");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  test("POST method", async () => {
    mockCreateUser();

    const innerFetch = jest.spyOn(fetch as any, "request");

    const { id } = await fetch.post<typeof user & { id: number }>(
      "http://example.com/data",
      user
    );

    expect(id).toEqual(3);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(innerFetch).toHaveBeenCalledWith("http://example.com/data", {
      method: "POST",
      data: user,
    });

    expect(fetch.global.baseUrl).toBe("");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });
});

describe("Authorization", () => {
  let fetch: Fetch;

  beforeEach(() => {
    fetch = new Fetch();
  });
  afterEach(() => {
    resetMocks();
  });

  /**
   * it should contain global auth token
   */
  test("Global auth token", async () => {
    mockGetUsers();
    const authToken = "Bearer testToken1234";
    fetch.global.authToken = authToken;

    await fetch.get("http://example.com/data");

    expect(fetch.header(AUTHORIZATION)).toEqual(authToken);
  });

  /**
   * it should contain given auth token
   */
  test("Given auth token", async () => {
    mockGetUsers();
    const authToken = "Bearer testToken1234";

    await fetch.authToken(authToken).get("http://example.com/data");

    expect(fetch.header(AUTHORIZATION)).toEqual(authToken);
  });

  /**
   * it should be without credentials by default
   */
  test("Default credentials value", async () => {
    mockGetUsers();

    await fetch.get("http://example.com/data");

    expect(Reflect.get(fetch, "init")["credentials"]).toBeUndefined();
  });

  /**
   * it should contain global credentials
   */
  test("Global credentials", async () => {
    mockGetUsers();
    fetch.global.includeCredentials = true;

    await fetch.get("http://example.com/data");

    expect(Reflect.get(fetch, "init")["credentials"]).toEqual("include");
  });

  /**
   * it should contain given credentials
   */
  test("Given credentials", async () => {
    mockGetUsers();

    await fetch.includeCredentials().get("http://example.com/data");

    expect(Reflect.get(fetch, "init")["credentials"]).toEqual("include");
  });
});

describe("Locale", () => {
  const globalLocale = "fr-FR";

  afterEach(() => {
    resetMocks();
  });

  /**
   * it should set the locale globally
   */
  test("Global locale", async () => {
    const fetch = new Fetch();
    fetch.global.locale = globalLocale;

    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual(globalLocale);
  });

  /**
   * it should override the default locale
   */
  test("Overriding global locale", async () => {
    // Init with default locale
    const fetch = new Fetch();
    fetch.global.locale = globalLocale;

    // Init with different locale
    const anotherFetch = new Fetch();
    anotherFetch.locale("fa-IR");

    expect(anotherFetch.header(ACCEPT_LANGUAGE)).toEqual("fa-IR");

    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual(globalLocale);
  });
});

describe("Timeout & Cancelation", () => {
  let fetch: Fetch;

  beforeEach(() => {
    fetch = new Fetch();
  });
  afterEach(() => {
    resetMocks();
  });

  /**
   * it should abort the request after timeout
   */
  test("Timeout", async () => {
    mockFetchLongResponse(6000);
    const cancelMethod = jest.spyOn(fetch, "cancel");

    try {
      const data = await fetch.get("http://example.com/data");

      expect(data).toEqual(users);
    } catch (error) {}

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(cancelMethod).toHaveBeenCalledTimes(1);
  });
});
