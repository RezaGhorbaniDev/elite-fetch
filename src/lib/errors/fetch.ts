/* eslint-disable @typescript-eslint/no-explicit-any */

import CustomError from "./custom";

export class FetchError extends CustomError {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Assign the status code to the property
    this.statusCode = statusCode;
    // Maintains proper stack trace for where our error was thrown (only available on V8)

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, FetchError);
    }

    // Set the name of the error to the class name
    this.name = "FetchError";
  }
}

export class NoKeyProvidedError extends CustomError {
  constructor() {
    super("No key provided!");
  }
}

export class KeyNotFoundError extends CustomError {
  constructor() {
    super("key not found!");
  }
}

export class WrongLocaleError extends CustomError {
  constructor() {
    super("Wrong locale format!");
  }
}
