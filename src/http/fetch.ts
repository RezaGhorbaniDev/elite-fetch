import {
  FetchError,
  KeyNotFoundError,
  NoKeyProvidedError,
  WrongLocaleError,
} from "../lib/errors";
import qs from "../qs";
import { isAsync } from "../functions";
import type { FetchDefaultSettings } from "./types";
import { ACCEPT_LANGUAGE, AUTHORIZATION } from "../lib/constants";

export default class Fetch {
  static global: FetchDefaultSettings = {};

  private controller: AbortController;

  private init: RequestInit;

  private baseUrl: string;

  //#region Constructor

  constructor() {
    this.baseUrl = "";
    this.controller = new AbortController();
    this.init = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Set a default locale for the request if there's any
    if (Fetch.global.locale)
      this.init.headers = {
        ...this.init.headers,
        [ACCEPT_LANGUAGE]: Fetch.global.locale,
      };
  }

  //#endregion

  //=====================
  //#region Fetch Methods

  //#region Fetch
  /**
   * base fetch function to use in other methods
   * @param url
   * @param options fetch request init
   * @returns a promise of the fetched data
   */
  private async fetch<T>(url: string, options: RequestInit): Promise<T> {
    const init = this.config(options);
    init.signal = this.controller.signal;

    if (Fetch.global.onRequest)
      if (isAsync(Fetch.global.onRequest))
        await Fetch.global.onRequest(options);
      else Fetch.global.onRequest(options);

    const fullUrl = this.getFullUrl(url);
    const response = await fetch(fullUrl, init);

    if (response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        /* empty */
      }

      // Apply the response interceptor if unknown
      return Fetch.global.onRespond ? Fetch.global.onRespond(data) : data;
    } else {
      // Throw an error with the status text
      const error = new FetchError(response.status, response.statusText);

      Fetch.global.onError && Fetch.global.onError(error);

      throw error;
    }
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

  //#region GET
  /**
   * makes a GET method request
   * @param url
   * @param params parameters to be added to url as querystring
   * @param options fetch request init
   * @returns a promise of the fetched data
   */
  async get<T>(
    url: string,
    params?: Record<string, string>,
    options?: RequestInit
  ): Promise<T> {
    if (params) {
      const queryString = qs.serialize(params);
      if (url.includes("?")) url += `&${queryString}`;
      else url += `?${queryString}`;
    }
    return this.fetch(url, { ...options, method: "GET" });
  }

  //#endregion

  //#region POST

  /**
   * makes a POST method request
   * @param url
   * @param data the data to be posted
   * @param options fetch request init
   * @returns a promise of the result of fetch
   * @returns
   */
  async post<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  //#endregion

  //#region PUT

  /**
   * makes a PUT method request
   * @param url
   * @param data the data to be parsed into request body
   * @param options fetch request init
   * @returns a promise of the result of fetch
   * @returns
   */
  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  //#endregion

  //#region DELETE

  /**
   * makes a DELETE method request
   * @param url
   * @param data the data to be parsed into request body
   * @param options fetch request init
   * @returns a promise of the result of fetch
   * @returns
   */
  async delete<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: "DELETE",
      body: JSON.stringify(data),
    });
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
  setLocale(locale?: string): this {
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
  setAuthToken(token: string): this {
    if (!token) throw new NoKeyProvidedError();

    this.header(AUTHORIZATION, token);
    return this;
  }

  /**
   * Includes credentials and http-cookied in the request
   * @returns the current instance
   */
  includeCredentials() {
    this.init = {
      ...this.init,
      credentials: "include",
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
      this.init.headers = {
        ...this.init.headers,
        [key]: value,
      };
      return this;
    }

    // it's a GET method for a request header
    else {
      return new Headers(this.init.headers).get(key) ?? undefined;
    }
  }

  /**
   * Removes a request header from the request
   * @param key
   */
  removeHeader(key: string): this {
    if (!key) throw new NoKeyProvidedError();

    if (!this.header(key)) throw new KeyNotFoundError();

    const { [key]: _, ...newHeaders } = this.init.headers as any;
    this.init.headers = newHeaders as HeadersInit;

    return this;
  }

  //#endregion

  //#endregion
  //===============

  //==============
  //#region Init

  private config(options: RequestInit): RequestInit {
    // Include global locale to fetch init if there's any
    if (!this.header(ACCEPT_LANGUAGE) && Fetch.global.locale)
      this.setLocale(Fetch.global.locale);

    // Include global auth token to fetch init if there's any
    if (!this.header(AUTHORIZATION) && Fetch.global.authToken)
      this.setAuthToken(Fetch.global.authToken);

    // Merge global headers with provided headers
    if (Fetch.global.headers)
      this.init.headers = { ...Fetch.global.headers, ...this.init.headers };

    // Incldue credentials if its globally set
    if (Fetch.global.includeCredentials) this.includeCredentials();

    // Merge request config with request method and body
    return { ...this.init, ...options };
  }

  //#endregion
  //==============

  //================
  //#region Url

  /**
   * Sets the base url for the http instance
   * @param baseUrl
   */
  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * combines the given url with base url if there's any
   * @param url
   * @returns Full URL
   */
  private getFullUrl(url: string) {
    const baseUrl = this.baseUrl || Fetch.global.baseUrl;

    if (!baseUrl) return url;

    // Avoid double slash
    if (baseUrl.endsWith("/") && url.startsWith("/")) url = url.substring(1);
    // Avoid no slash between them
    else if (!baseUrl.endsWith("/") && !url.startsWith("/")) url = "/" + url;

    return baseUrl + url;
  }

  //#endregion
  //================
}
