import { ZodError } from "zod";

export const validate = (schema, type = "body") => (req, res, next) => {
  try {
    const data = req[type];
    const parsed = schema.parse(data);
    req[type] = parsed; // sanitized
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors
      });
    }
    next(err);
  }
};
