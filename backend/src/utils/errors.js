export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = status < 500;
  }
}

export const badRequest = (message = "Bad request", details) =>
  new AppError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "You do not have access to this resource") =>
  new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "Resource not found") => new AppError(404, "NOT_FOUND", message);

export const conflict = (message = "Resource already exists", details) =>
  new AppError(409, "CONFLICT", message, details);

export const unprocessable = (message = "Validation failed", details) =>
  new AppError(422, "VALIDATION_ERROR", message, details);

export const tooManyRequests = (message = "Too many requests") =>
  new AppError(429, "TOO_MANY_REQUESTS", message);
