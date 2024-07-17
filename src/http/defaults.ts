import { TIMEOUT_DURATION } from "../lib/constants";
import {
  ErrorCallback,
  FetchProps,
  RequestCallback,
  RespondCallback,
} from "./types";

export const defaultSettings: FetchProps = {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: TIMEOUT_DURATION,
  baseUrl: "",
};

export default class FetchDefaults implements FetchProps {
  private static instance: FetchDefaults;

  authToken?: string | undefined;
  baseUrl?: string | undefined;
  headers?: HeadersInit | undefined;
  includeCredentials?: boolean | undefined;
  locale?: string | undefined;
  timeout?: number | undefined;
  onError?: ErrorCallback | undefined;
  onRequest?: RequestCallback | undefined;
  onRespond?: RespondCallback | undefined;

  private constructor(props: FetchProps) {
    this.authToken = props.authToken;
    this.baseUrl = props.baseUrl;
    this.headers = props.headers;
    this.includeCredentials = props.includeCredentials;
    this.locale = props.locale;
    this.timeout = props.timeout;
    this.onError = props.onError;
    this.onRequest = props.onRequest;
    this.onRespond = props.onRespond;
  }

  public static getInstance(): FetchDefaults {
    if (!this.instance) {
      this.instance = new this(structuredClone(defaultSettings));
    }
    return this.instance;
  }
}
