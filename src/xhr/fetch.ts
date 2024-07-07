import { FetchError, KeyNotFoundError, NoKeyProvidedError } from "../errors";
import qs from "../qs";
import { isAsync } from "../functions";

export interface IFetchProps<TResult> {
  onError?: (error: FetchError) => void;
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  onRespond?: (result: TResult) => TResult;
}

export default class Fetch {
  static locale?: string;

  private controller: AbortController;

  private headers: HeadersInit;

  private opt: IFetchProps<unknown>;

  //#region Constructor

  constructor(opt: IFetchProps<unknown> = {}) {
    this.controller = new AbortController();
    this.headers = {
      "Content-Type": "application/json",
    };

    // Set a default locale for the request if there's any
    if (Fetch.locale)
      this.headers = {
        ...this.headers,
        "Accept-Language": Fetch.locale,
      };

    this.opt = opt;
  }

  //#endregion

  //=====================
  //#region Fetch Methods

  //#region Fetch

  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const signal = this.controller.signal;

    const config = this.opt.onRequest
      ? isAsync(this.opt.onRequest)
        ? await this.opt.onRequest(options || {})
        : this.opt.onRequest(options || {})
      : options || {};

    const response = await fetch(url, {
      ...config,
      signal,
      credentials: "include",
      headers: { ...this.headers, ...options?.headers },
    });

    if (response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        /* empty */
      }

      // Apply the response interceptor if unknown
      return this.opt.onRespond ? this.opt.onRespond(data) : data;
    } else {
      // Throw an error with the status text
      const error = new FetchError(response.status, response.statusText);

      this.opt.onError && this.opt.onError(error);

      throw error;
    }
  }

  //#endregion

  //#region Cancel

  cancel(): void {
    this.controller.abort();
  }

  //#endregion

  //#region GET

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

  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  //#endregion

  //#region DELETE

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
   *
   * @param locale Sets the locale prefered by the client
   * @returns the current instance
   */
  setLocale(locale?: string): this {
    if (locale)
      this.headers = {
        ...this.headers,
        "Accept-Language": locale,
      };
    return this;
  }

  //#endregion

  //#region header
  /**
   * return the value of a spicific request header item
   * @param key
   */
  header(key: string): string | undefined;
  /**
   * Adds a request header to the request
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
      this.headers = {
        ...this.headers,
        [key]: value,
      };
      return this;
    }

    // it's a GET method for a request header
    else {
      return new Headers(this.headers).get(key) ?? undefined;
    }
  }

  /**
   * Removes a request header from the request
   * @param key
   */
  removeHeader(key: string): this {
    if (!key) throw new NoKeyProvidedError();

    if (!this.header(key)) throw new KeyNotFoundError();

    const { [key]: _, ...newHeaders } = this.headers as any;
    this.headers = newHeaders as HeadersInit;

    return this;
  }

  //#endregion

  //#endregion
  //===============
}
