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

import {
  ABORT_ERROR,
  ACCEPT_LANGUAGE,
  AUTHORIZATION,
  TIMEOUT_ERROR,
} from "../lib/constants";
import FetchDefaults, { defaultSettings } from "./defaults";
import { combineUrls } from "../lib/utils/url";

/**
 * Advanced http request class
 */
export default class Fetch {
  // outer level
  /**
   * Settings for all http instances
   */
  public readonly global: FetchProps = FetchDefaults.getInstance();

  // inner level
  /**
   * Settings for all requests by the current instance
   */
  private current: FetchProps;

  /**
   * Request initilization
   */
  private init: RequestInit;

  /**
   * Request abort controller
   */
  private controller: AbortController;

  /**
   * Request events
   */
  public onError?: ErrorCallback;
  public onRequest?: RequestCallback;
  public onRespond?: RespondCallback;

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

    const requestCallback = this.onRequest ?? this.global.onRequest;
    if (requestCallback)
      if (isAsync(requestCallback)) await requestCallback(options);
      else requestCallback(options);

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
      const respondCallback = this.onRespond ?? this.global.onRespond;
      return respondCallback
        ? isAsync(respondCallback)
          ? // is async
            await respondCallback(data)
          : // is not
            respondCallback(data)
        : data;
    } else {
      // Throw an error with the status text
      const error = new FetchError(response.status, response.statusText);

      const errorCallback = this.onError ?? this.global.onError;
      errorCallback && errorCallback(error);

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
    params?: UrlParameters,
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
    if (!this.header(ACCEPT_LANGUAGE) && this.global.locale)
      this.locale(this.global.locale);

    // Include global auth token to fetch init if there's any
    if (!this.header(AUTHORIZATION) && this.global.authToken)
      this.authToken(this.global.authToken);

    // Merge global headers with provided headers
    if (this.global.headers)
      this.current.headers = {
        ...this.global.headers,
        ...this.current.headers,
      };

    // Incldue credentials if its globally set
    if (this.global.includeCredentials) this.includeCredentials();
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

  //============
  //#region Defaults

  setDefaults(defaults: FetchProps): void {
    this.global.authToken = defaults.authToken;
    this.global.baseUrl = defaults.baseUrl;
    this.global.headers = defaults.headers;
    this.global.includeCredentials = defaults.includeCredentials;
    this.global.locale = defaults.locale;
    this.global.timeout = defaults.timeout;
    this.global.onError = defaults.onError;
    this.global.onRequest = defaults.onRequest;
    this.global.onRespond = defaults.onRespond;
  }

  // private resetSettings() {}

  //#endregion
  //============

  //===========
  //#region Url

  /**
   * Sets the base url for the http instance
   * @param baseUrl
   * @returns current instance
   */
  baseUrl(baseUrl: string) {
    this.current.baseUrl = baseUrl;

    return this;
  }

  /**
   * combines the given url with base url if there's any
   * @param url
   * @returns Full URL
   */
  private getFullUrl(url: string) {
    const baseUrl = this.current.baseUrl || this.global.baseUrl;

    return combineUrls(url, baseUrl);
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

//=============
//#region Types

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ErrorCallback = (error: FetchError) => void;
export type RequestCallback = (config: RequestInit) => void | Promise<void>;
export type RespondCallback = <TResult>(
  result: TResult
) => TResult | Promise<TResult>;

export type FetchEvents = {
  onError?: ErrorCallback;
  onRequest?: RequestCallback;
  onRespond?: RespondCallback;
};

export type UrlParameters = Record<string, string | number>;

export type RequestProps = {
  // props
  locale?: string;
  authToken?: string;
  headers?: HeadersInit;
  includeCredentials?: boolean;
  baseUrl?: string;
  timeout?: number;
};

export type InnerRequestProps = RequestProps & {
  method: RequestMethod;
  data?: object | unknown;
};

export type FetchProps = FetchEvents & RequestProps;

//#endregion
//=============
