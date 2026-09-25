import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors.ts";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};
