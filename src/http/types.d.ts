import { FetchError, RequestError } from "../lib/errors";

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

export type FetchDefaultSettings = FetchEvents & {
  // props
  locale?: string;
  authToken?: string;
  headers?: HeadersInit;
  includeCredentials?: boolean;
  baseUrl?: string;
  timeout: number;
};
