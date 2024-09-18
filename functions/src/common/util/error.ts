export class MPError extends Error {
  constructor(code: string, message: string) {
    super(message);
    this.name = code;
  }
}
