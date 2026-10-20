export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export class InvalidOptionError extends Error {
  readonly option: string;
  constructor(option: string, message: string) {
    super(`option ${option}: ${message}`);
    this.name = 'InvalidOptionError';
    this.option = option;
  }
}
