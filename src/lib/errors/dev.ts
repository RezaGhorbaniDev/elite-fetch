import CustomError from "./custom";

export class NotImplementedError extends CustomError {
  constructor() {
    super("Not implemented!");
  }
}
