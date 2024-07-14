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
   * it should combine the global base url with given, after initialization
   */
  test("Global base url, after initialization", async () => {
    mockGetUsers();

    Fetch.global.baseUrl = "http://example.com/";
    await fetch.get("data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  /**
   * it should combine the global base url with given, before initialization
   */
  test("Global base url, before initialization", async () => {
    mockGetUsers();

    Fetch.global.baseUrl = "http://example.com/";
    const fetch = new Fetch();
    await fetch.get("data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  /**
   * it should check for double slashes in the url and replace them with 1 slash
   */
  test("handling double slashes", async () => {
    mockGetUsers();

    Fetch.global.baseUrl = "http://example.com/";
    await fetch.get("/data");

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  /**
   * it should check add a slash between base url and given, if there's none
   */
  test("handling no slashes", async () => {
    mockGetUsers();

    Fetch.global.baseUrl = "http://example.com";
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
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();

    expect(() => fetch.removeHeader("")).toThrow(NoKeyProvidedError);
  });

  /**
   * it should throw error if key is not found
   */
  test("Validate header name before delete", async () => {
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();

    expect(() => fetch.removeHeader("WrongKey")).toThrow(KeyNotFoundError);
  });

  /**
   * it should remove the given attribute
   */
  test("Delete header", async () => {
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();
    fetch.removeHeader(ACCEPT_LANGUAGE);

    expect(fetch.header(ACCEPT_LANGUAGE)).toBeUndefined();
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
    Fetch.global.authToken = authToken;

    await fetch.get("http://example.com/data");

    expect(fetch.header(AUTHORIZATION)).toEqual(authToken);
  });

  /**
   * it should contain given auth token
   */
  test("Given auth token", async () => {
    mockGetUsers();
    const authToken = "Bearer testToken1234";

    await fetch.setAuthToken(authToken).get("http://example.com/data");

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
    Fetch.global.includeCredentials = true;

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
    Fetch.global.locale = globalLocale;

    const fetch = new Fetch();
    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual(globalLocale);
  });

  /**
   * it should override the default locale
   */
  test("Overriding global locale", async () => {
    Fetch.global.locale = globalLocale;

    // Init with default locale
    const fetch = new Fetch();

    // Init with different locale
    const anotherFetch = new Fetch();
    anotherFetch.setLocale("fa-IR");

    expect(anotherFetch.header(ACCEPT_LANGUAGE)).toEqual("fa-IR");

    expect(fetch.header(ACCEPT_LANGUAGE)).toEqual(globalLocale);
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

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
  });

  test("POST method", async () => {
    mockCreateUser();

    const innerFetch = jest.spyOn(fetch as any, "fetch");

    const { id } = await fetch.post<typeof user & { id: number }>(
      "http://example.com/data",
      user
    );

    expect(id).toEqual(3);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(innerFetch).toHaveBeenCalledWith("http://example.com/data", {
      method: "POST",
      body: JSON.stringify(user),
    });

    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://example.com/data");
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
