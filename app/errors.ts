export class HttpError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, errors: string[]) {
    super(errors.join(", "));
    this.status = status;
    this.errors = errors;
  }
}

export class ValidationError extends HttpError {
  constructor(errors: string[]) {
    super(400, errors);
  }
}

export class NotFoundError extends HttpError {
  constructor(errors: string[]) {
    super(404, errors);
  }
}
