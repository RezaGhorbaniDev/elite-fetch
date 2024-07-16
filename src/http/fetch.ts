import {
  FetchError,
  KeyNotFoundError,
  NoKeyProvidedError,
  WrongLocaleError,
  RequestError,
  RequestAbortError,
  RequestTimeoutError,
} from "../lib/errors";
import qs from "../qs";
import { isAsync } from "../functions";
import type { FetchProps, RequestProps, InnerRequestProps } from "./types";
import {
  ABORT_ERROR,
  ACCEPT_LANGUAGE,
  AUTHORIZATION,
  TIMEOUT_DURATION,
  TIMEOUT_ERROR,
} from "../lib/constants";

const defaultSettings: FetchProps = {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TIMEOUT_DURATION,
  baseUrl: "",
};

/**
 * Advanced http request class
 */
export default class Fetch {
  // outer level
  /**
   * Settings for all http instances
   */
  static global: FetchProps = structuredClone(defaultSettings);

  // inner level
  /**
   * Settings for all requests by the current instance
   */
  private current: FetchProps;

  /**
   * Request initilization
   */
  private init: RequestInit;

  private controller: AbortController;

  //#region Constructor

  constructor() {
    this.controller = new AbortController();
    this.current = structuredClone(defaultSettings);
    this.init = {};
    this.applyGlobalToCurrent();
  }

  //#endregion

  //=====================
  //#region Fetch Methods

  //#region Resquest
  /**
   * base request function to use in other methods
   * @param url
   * @param props fetch request init
   * @returns a promise of the fetched data
   */
  private async request<T>(
    url: string,
    options: InnerRequestProps
  ): Promise<T> {
    const init = this.config(options);
    init.signal = this.controller.signal;

    if (Fetch.global.onRequest)
      if (isAsync(Fetch.global.onRequest))
        await Fetch.global.onRequest(options);
      else Fetch.global.onRequest(options);

    const fullUrl = this.getFullUrl(url);
    const response = await this.requestWithTimeout(fullUrl, init);

    if (response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        /* empty */
      }

      // Apply the response interceptor if unknown
      return Fetch.global.onRespond
        ? isAsync(Fetch.global.onRespond)
          ? // is async
            await Fetch.global.onRespond(data)
          : // is not
            Fetch.global.onRespond(data)
        : data;
    } else {
      // Throw an error with the status text
      const error = new FetchError(response.status, response.statusText);

      Fetch.global.onError && Fetch.global.onError(error);

      throw error;
    }
  }

  //#endregion

  //#region Fetch with timeout

  private async requestWithTimeout(url: string, init: RequestInit) {
    const id = setTimeout(() => this.cancel(), this.current.timeout);

    try {
      const response = await fetch(url, init);
      clearTimeout(id);
      return response;
    } catch (e) {
      const error = e as Error;

      if (error.name === ABORT_ERROR) {
        throw new RequestAbortError();
      } else if (error.name === TIMEOUT_ERROR) {
        throw new RequestTimeoutError(this.current.timeout!);
      }

      throw new RequestError();
    }
  }

  //#endregion

  //#region GET
  /**
   * makes a GET method request
   * @param url
   * @param params parameters to be added to url as querystring
   * @param props request configurations
   * @returns a promise of the fetched data
   */
  async get<T>(
    url: string,
    params?: Record<string, string>,
    props?: RequestProps
  ): Promise<T> {
    if (params) {
      const queryString = qs.serialize(params);
      if (url.includes("?")) url += `&${queryString}`;
      else url += `?${queryString}`;
    }
    return this.request(url, { ...props, method: "GET" });
  }

  //#endregion

  //#region POST

  /**
   * makes a POST method request
   * @param url
   * @param data the data to be posted
   * @param props request configurations
   * @returns a promise of the result of fetch
   * @returns
   */
  async post<T>(url: string, data?: unknown, props?: RequestProps): Promise<T> {
    return this.request(url, {
      ...props,
      data,
      method: "POST",
    });
  }

  //#endregion

  //#region PUT

  /**
   * makes a PUT method request
   * @param url
   * @param data the data to be parsed into request body
   * @param props request configurations
   * @returns a promise of the result of fetch
   * @returns
   */
  async put<T>(url: string, data?: unknown, props?: RequestProps): Promise<T> {
    return this.request(url, {
      ...props,
      data,
      method: "PUT",
    });
  }

  //#endregion

  //#region DELETE

  /**
   * makes a DELETE method request
   * @param url
   * @param data the data to be parsed into request body
   * @param props request configurations
   * @returns a promise of the result of fetch
   * @returns
   */
  async delete<T>(
    url: string,
    data?: unknown,
    props?: RequestProps
  ): Promise<T> {
    return this.request(url, {
      ...props,
      data,
      method: "DELETE",
    });
  }

  //#endregion

  //#region Cancel
  /**
   * aborts the request
   */
  cancel(): void {
    this.controller.abort();
  }

  //#endregion

  //#endregion
  //=====================

  //===============
  //#region Headers

  //#region Set Locale
  /**
   * Sets the "Accept-Language" header of the request
   * @param locale
   * @returns the current instance
   */
  locale(locale?: string): this {
    if (!locale) throw new WrongLocaleError();

    this.header(ACCEPT_LANGUAGE, locale);
    return this;
  }

  //#endregion

  //#region Set Token

  /**
   * Sets the "Authorization" header of the request
   * @param token
   * @returns the current instance
   */
  authToken(token: string): this {
    if (!token) throw new NoKeyProvidedError();

    this.header(AUTHORIZATION, token);
    return this;
  }

  /**
   * Includes credentials and http-cookies in the request
   * @returns the current instance
   */
  includeCredentials() {
    this.current = {
      ...this.current,
      includeCredentials: true,
    };

    return this;
  }

  /**
   * Excludes credentials and http-cookies from the request
   * @returns the current instance
   */
  excludeCredentials() {
    this.current = {
      ...this.current,
      includeCredentials: false,
    };

    return this;
  }

  //#endregion

  //#region Header CRUD
  /**
   * returns the value of a spicific request header item
   * @param key
   */
  header(key: string): string | undefined;
  /**
   * Adds/Modifies a request header
   * @param key
   * @param value
   */
  header(key: string, value: string): this;

  /**
   * Implementation of the methods
   * @param key
   * @param value
   * @returns
   */
  header(key: string, value?: string): (string | undefined) | this {
    // it's a SET method for a request header
    if (value) {
      this.current.headers = {
        ...this.current.headers,
        [key]: value,
      };
      return this;
    }

    // it's a GET method for a request header
    else {
      return new Headers(this.current.headers).get(key) ?? undefined;
    }
  }

  /**
   * Removes a request header from the request
   * @param key
   */
  removeHeader(key: string): this {
    if (!key) throw new NoKeyProvidedError();

    if (!this.header(key)) throw new KeyNotFoundError();

    const { [key]: _, ...newHeaders } = this.current.headers as any;
    this.current.headers = newHeaders as HeadersInit;

    return this;
  }

  //#endregion

  //#endregion
  //===============

  //============
  //#region Config

  private config(settings: InnerRequestProps): RequestInit {
    this.applyGlobalToCurrent();
    this.settingsToRequestInit({ ...this.current, ...settings });

    return this.init;
  }

  private applyGlobalToCurrent() {
    // Include global locale to fetch init if there's any
    if (!this.header(ACCEPT_LANGUAGE) && Fetch.global.locale)
      this.locale(Fetch.global.locale);

    // Include global auth token to fetch init if there's any
    if (!this.header(AUTHORIZATION) && Fetch.global.authToken)
      this.authToken(Fetch.global.authToken);

    // Merge global headers with provided headers
    if (Fetch.global.headers)
      this.current.headers = {
        ...Fetch.global.headers,
        ...this.current.headers,
      };

    // Incldue credentials if its globally set
    if (Fetch.global.includeCredentials) this.includeCredentials();
  }

  private settingsToRequestInit(settings: InnerRequestProps) {
    const init: RequestInit = {};

    init.headers = settings.headers;
    init.method = settings.method;

    if (settings.data) init.body = JSON.stringify(settings.data);

    if (settings.includeCredentials) init.credentials = "include";

    this.init = init;
  }

  // private resetSettings() {}

  //#endregion
  //============

  //===========
  //#region Url

  /**
   * Sets the base url for the http instance
   * @param baseUrl
   */
  baseUrl(baseUrl: string) {
    this.current.baseUrl = baseUrl;
  }

  /**
   * combines the given url with base url if there's any
   * @param url
   * @returns Full URL
   */
  private getFullUrl(url: string) {
    const baseUrl = this.current.baseUrl || Fetch.global.baseUrl;

    if (!baseUrl) return url;

    // Avoid double slash
    if (baseUrl.endsWith("/") && url.startsWith("/")) url = url.substring(1);
    // Avoid no slash between them
    else if (!baseUrl.endsWith("/") && !url.startsWith("/")) url = "/" + url;

    return baseUrl + url;
  }

  //#endregion
  //===========

  //===============
  //#region Timeout

  /**
   * sets the timeout for the current http instance
   * @param timeout
   * @returns current instance
   */
  timeout(timeout: number) {
    this.current.timeout = timeout;

    return this;
  }

  //#endregion
  //===============
}
