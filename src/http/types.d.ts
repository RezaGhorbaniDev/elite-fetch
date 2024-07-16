import { FetchError, RequestError } from "../lib/errors";

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
