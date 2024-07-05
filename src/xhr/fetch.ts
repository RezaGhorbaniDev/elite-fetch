import { FetchError } from "../errors";
import qs from "../qs";
import { isAsync } from "../functions";

export interface IFetchProps<TResult> {
  onError?: (error: FetchError) => void;
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  onRespond?: (result: TResult) => TResult;
}

// Define a generic class for the fetch handler
export default class Fetch {
  // Declare a private property for the abort controller
  public controller: AbortController;

  // Declare a private property for the default headers
  public defaultHeaders: HeadersInit;

  private opt: IFetchProps<unknown>;

  // Define a constructor that takes the base URL and an optional default headers object as arguments
  constructor(opt: IFetchProps<unknown> = {}) {
    // Create a new abort controller and assign it to the property
    this.controller = new AbortController();
    // Assign the default headers to the property or an empty object if not provided
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    this.opt = opt;
  }

  // Define a method that takes a relative URL and an optional options object as arguments
  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    // Get the signal from the abort controller
    const signal = this.controller.signal;

    // Apply the request interceptor if unknown
    const config = this.opt.onRequest
      ? isAsync(this.opt.onRequest)
        ? await this.opt.onRequest(options || {})
        : this.opt.onRequest(options || {})
      : options || {};

    // Use the fetch API to make the request and get the response, passing the signal, the credentials option and the merged headers to the options

    const response = await fetch(url, {
      ...config,
      signal,
      credentials: "include",
      headers: { ...this.defaultHeaders, ...options?.headers },
    });

    // Check if the response is ok
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

  // Define a method that cancels the request by calling abort on the controller
  cancel(): void {
    this.controller.abort();
  }

  // Define a method that makes a GET request with optional query parameters and an optional options object
  async get<T>(
    url: string,
    params?: Record<string, string>,
    options?: RequestInit
  ): Promise<T> {
    // If params are provided, convert them to a query string and append it to the url
    if (params) {
      const queryString = qs.serialize(params);
      if (url.includes("?")) url += `&${queryString}`;
      else url += `?${queryString}`;
    }
    // Call the fetch method with the url, a GET method option and an optional options object
    return this.fetch(url, { ...options, method: "GET" });
  }

  // Define a method that makes a POST request with optional body data and an optional options object
  async post<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    // Call the fetch method with the url, a POST method option, a JSON stringified body option and an optional options object
    return this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Define a method that makes a PUT request with optional body data and an optional options object
  async put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    // Call the fetch method with the url, a PUT method option, a JSON stringified body option and an optional options object
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Define a method that makes a DELETE request with optional body data and an optional options object
  async delete<T>(
    url: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    // Call the fetch method with the url, a DELETE method option, a JSON stringified body option and an optional options object
    return this.fetch(url, {
      ...options,
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }

  setCulture(culture?: string) {
    if (culture)
      this.defaultHeaders = {
        ...this.defaultHeaders,
        "Accept-Language": culture,
      };
    return this;
  }
}
