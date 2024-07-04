export default class CustomError extends Error {
  static message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
