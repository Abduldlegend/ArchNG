import { unprocessable } from "../utils/errors.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const input = source === "query" ? req.query : req[source];
  const result = schema.safeParse(input);
  if (!result.success) {
    return next(
      unprocessable(
        "Please check the highlighted fields",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      ),
    );
  }
  if (source === "query") req.validatedQuery = result.data;
  else req[source] = result.data;
  return next();
};
